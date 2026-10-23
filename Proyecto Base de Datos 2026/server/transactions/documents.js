"use strict";
const {connection,oracledb}=require("../db");
const {error}=require("../security");
const {normalizarTelefono}=require("../phone");
const {call}=require("./commands");
const {definitions}=require("./definitions");
const {checkDocument}=require("./branch-guard");
const {sellerContext,sameSeller,assertCountryPhone}=require("./seller-context");
                                                              
async function clienteEnMostrador(cn, datos, actor) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw error("Datos del cliente invalidos", 400);
  }

  const leer = (campo, maximo, requerido = false) => {
    const valor = datos[campo];

    if (valor != null && typeof valor !== "string") {
      throw error("Dato invalido: " + campo, 400);
    }

    const texto = String(valor ?? "")
      .trim()
      .replace(/\s+/g, " ");

    if (requerido && !texto) {
      throw error("Falta " + campo, 400);
    }

    if (texto.length > maximo) {
      throw error(campo + " excede " + maximo + " caracteres", 400);
    }

    return texto || null;
  };

  const nombres = leer("nombres", 100, true);
  const apellidos = leer("apellidos", 100, true);
  const nit = leer("nit", 20);
  const telefono = normalizarTelefono(leer("telefono", 20));
  const usuario = String(actor).slice(0, 50);

  let idPersona = null;

  if (nit) {
    if (["CF", "C/F", "CONSUMIDOR FINAL"].includes(nit.toUpperCase())) {
      throw error(
        "Consumidor Final requiere una configuracion fiscal separada",
        400,
      );
    }

    const consulta = await cn.execute(
      `
      SELECT
        p.ID_PERSONA,
        p.NOMBRES,
        p.APELLIDOS,
        p.ESTADO_REGISTRO AS ESTADO_PERSONA,
        c.ID_CLIENTE
      FROM PERSONA p
      LEFT JOIN CLIENTE c
        ON c.ID_PERSONA = p.ID_PERSONA
       AND c.ESTADO_REGISTRO = 'A'
      WHERE UPPER(TRIM(p.NIT)) = UPPER(:nit)
      FETCH FIRST 2 ROWS ONLY
    `,
      { nit },
    );

    if (consulta.rows.length > 1) {
      throw error(
        "Hay mas de un registro con este NIT. Revisalo en Clientes",
        409,
      );
    }

    if (consulta.rows.length) {
      const persona = consulta.rows[0];

      if (persona.ESTADO_PERSONA !== "A") {
        throw error("La persona con este NIT esta inactiva", 409);
      }

      const comparar = (s) =>
        String(s).trim().replace(/\s+/g, " ").toUpperCase();

      if (
        comparar(persona.NOMBRES) !== comparar(nombres) ||
        comparar(persona.APELLIDOS) !== comparar(apellidos)
      ) {
        throw error(
          "El NIT ya existe con otro nombre. Verifica los datos",
          409,
        );
      }

      if (persona.ID_CLIENTE) {
        return persona.ID_CLIENTE;
      }

      idPersona = persona.ID_PERSONA;
    }
  }

  if (!idPersona) {
    const persona = await cn.execute(
      `
      INSERT INTO PERSONA (
        ID_PERSONA,
        NOMBRES,
        APELLIDOS,
        NIT,
        TELEFONO,
        USUARIO_CREACION
      )
      VALUES (
        SEQ_PERSONA.NEXTVAL,
        :nombres,
        :apellidos,
        :nit,
        :telefono,
        :usuario
      )
      RETURNING ID_PERSONA INTO :id
    `,
      {
        nombres,
        apellidos,
        nit,
        telefono,
        usuario,
        id: {
          dir: oracledb.BIND_OUT,
          type: oracledb.NUMBER,
        },
      },
    );

    idPersona = persona.outBinds.id[0];
  }

  const cliente = await cn.execute(
    `
    INSERT INTO CLIENTE (
      ID_CLIENTE,
      ID_PERSONA,
      TIPO_CLIENTE,
      FECHA_REGISTRO,
      USUARIO_CREACION
    )
    VALUES (
      SEQ_CLIENTE.NEXTVAL,
      :idPersona,
      'I',
      SYSDATE,
      :usuario
    )
    RETURNING ID_CLIENTE INTO :id
  `,
    {
      idPersona,
      usuario,
      id: {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      },
    },
  );

  return cliente.outBinds.id[0];
}
                                                                       
async function registrarCobroCaja(c, idFactura, idEmpleadoSucursal, solicitud) {
  if (!solicitud || typeof solicitud !== "object" || Array.isArray(solicitud)) {
    throw error("Datos del cobro invalidos", 400);
  }

  const idMetodo = Number(solicitud.id_metodo_pago);
  if (!Number.isSafeInteger(idMetodo) || idMetodo < 1) {
    throw error("Selecciona una forma de pago", 400);
  }

  if (solicitud.referencia != null && typeof solicitud.referencia !== "string") {
    throw error("Referencia de pago invalida", 400);
  }
  const referencia = String(solicitud.referencia || "").trim() || null;
  if (referencia && referencia.length > 50) {
    throw error("La referencia no puede superar 50 caracteres", 400);
  }

  const metodoResultado = await c.execute(
    `SELECT NOMBRE, REQUIERE_REFERENCIA
       FROM METODO_PAGO
      WHERE ID_METODO_PAGO = :id AND ESTADO_REGISTRO = 'A'`,
    { id: idMetodo },
  );
  if (metodoResultado.rows.length !== 1) {
    throw error("Metodo de pago no disponible", 400);
  }
  const metodo = metodoResultado.rows[0];
  const efectivo = String(metodo.NOMBRE).trim().toUpperCase() === "EFECTIVO";
  if (metodo.REQUIERE_REFERENCIA === "S" && !referencia) {
    throw error("La forma de pago requiere referencia", 400);
  }

  const resultado = await c.execute(
    `SELECT TOTAL, SALDO FROM FACTURA
      WHERE ID_FACTURA = :id FOR UPDATE`,
    { id: idFactura },
  );
  const factura = resultado.rows[0];
  if (!factura) throw error("Factura no encontrada", 404);

  const total = Number(factura.TOTAL);
  const saldo = Number(factura.SALDO);
  if (!Number.isFinite(total) || total <= 0 ||
      !Number.isFinite(saldo) || Math.abs(total - saldo) > 0.005) {
    throw error("El total o saldo de la factura no es valido para cobro inmediato", 400);
  }

  let recibido = total;
  if (efectivo) {
    if (solicitud.efectivo_recibido == null ||
        String(solicitud.efectivo_recibido).trim() === "") {
      throw error("Ingresa el dinero recibido del cliente", 400);
    }
    recibido = Number(solicitud.efectivo_recibido);
    if (!Number.isFinite(recibido) || recibido < 0 ||
        Math.round(recibido * 100) / 100 < total - 0.005) {
      throw error("Efectivo insuficiente. Total real: " + total.toFixed(2), 400);
    }
  }

                                                                          
                                      
  await call(c, "venta-pago", {
    id_factura: idFactura,
    id_empleado_sucursal: idEmpleadoSucursal,
    id_metodo_pago: idMetodo,
    monto: total,
    referencia,
  });

  return {
    pagado: true,
    total,
    metodo: metodo.NOMBRE,
    cambio: efectivo ? Math.max(0, Number((recibido - total).toFixed(2))) : 0,
  };
}

async function permisoDePago(c, usuario, ruta) {
  const resultado = await c.execute(
    `SELECT COUNT(*) AS AUTORIZADO FROM V_MENU_USUARIO
      WHERE NOMBRE_USUARIO = :usuario
        AND RUTA = :ruta
        AND PUEDE_INSERTAR = 'S'`,
    { usuario, ruta },
  );
  if (Number(resultado.rows[0]?.AUTORIZADO) < 1) {
    throw error("No tienes permiso para registrar pagos en " + ruta, 403);
  }
}

async function createDocument(user, kind, body) {
  const d = definitions[kind];
  if (!d) throw error("Documento desconocido", 404);

  if (kind === "notas-credito" &&
      body?.apto_reingreso_stock !== true) {
    throw error(
      "Confirma que los productos pueden regresar al inventario",
      400
    );
  }
  if (!body || !Array.isArray(body.detalles) ||
      body.detalles.length === 0 || body.detalles.length > 100) {
    throw error("Agregue entre 1 y 100 lineas al documento", 400);
  }
  // Pago y entrega son estados independientes.
  if (kind === "facturas" && !["CAJA", "ENVIO"].includes(body.modalidad_entrega)) {
    throw error("Selecciona si el cliente recibe en caja o requiere envio", 400);
  }
  if (body.cobro_inmediato && kind !== "facturas") {
    throw error("El cobro de caja solo se admite en facturas", 400);
  }
  if (body.cobro_inmediato && body.pago) {
    throw error("No combines dos pagos en el mismo documento", 400);
  }
  if (body.cobro_inmediato &&
      String(body.condicion_pago || "").toUpperCase() !== "CONTADO") {
    throw error("El cobro inmediato solo aplica a ventas de contado", 400);
  }

  if (body.pago_compra_inmediato && kind !== "compras")
    throw error("Pago inmediato solo para compras", 400);

  if (body.pago_compra_inmediato &&
      (body.pago || body.cobro_inmediato))
    throw error("No combines dos pagos en una compra", 400);

  if (body.pago_compra_inmediato &&
      String(body.condicion_pago || "").toUpperCase() !== "CONTADO")
    throw error("El pago inmediato requiere compra de contado", 400);
  return connection(user.nombre_usuario, async (c) => {
    // Derivar el vendedor de la sesión, nunca de un selector manipulable.
    const caja = kind === "facturas" ? await sellerContext(c,user) : null;
    const datos = caja ? sameSeller(body,caja) : body;
    if (caja && datos.pago)
      datos.pago = sameSeller(datos.pago,caja);
    if (caja && datos.cliente_nuevo?.telefono)
      assertCountryPhone(normalizarTelefono(datos.cliente_nuevo.telefono),caja);
    await checkDocument(c,user,kind,datos);
                                                                               
    if (body.cobro_inmediato || body.pago || body.pago_compra_inmediato) {
      const rutaPago = kind === "facturas" ? "/ventas/pagos" :
        kind === "compras" ? "/compras/pagos" : null;
      if (!rutaPago) throw error("Este documento no admite cobros", 400);
      await permisoDePago(c, user.nombre_usuario, rutaPago);
    }

    if (kind === "notas-credito") {
      await permisoDePago(
        c, user.nombre_usuario, "/ventas/devoluciones"
      );
    }

    const encabezado = { ...datos };
    if (kind === "facturas" && datos.cliente_nuevo) {
      encabezado.id_cliente = await clienteEnMostrador(
        c, datos.cliente_nuevo, user.nombre_usuario,
      );
    }

    const id = await call(c, d.header, encabezado);
    // Mismo COMMIT/ROLLBACK que factura, detalle, stock y cobro: jamás queda
    // una factura nueva sin modalidad o una modalidad de factura fallida.
    if (kind === "facturas") {
      const entrega = await c.execute(`
        UPDATE FACTURA SET MODALIDAD_ENTREGA = :modalidad
        WHERE ID_FACTURA = :id AND MODALIDAD_ENTREGA IS NULL
      `, { modalidad: body.modalidad_entrega, id });
      if (entrega.rowsAffected !== 1)
        throw error("No se pudo registrar la modalidad de entrega de la factura", 409);
    }
                              
    for (const linea of body.detalles) {
      await call(c, d.detail, { ...linea, [d.id]: id });

      if (kind === "notas-credito") {
                                                                  
                                                                
        const detalleId = Number(linea.id_detalle_factura);

        const origen = await c.execute(
          `SELECT df.ID_FACTURA, ps.ID_SUCURSAL
             FROM DETALLE_FACTURA df
             JOIN PRODUCTO_SUCURSAL ps
               ON ps.ID_PRODUCTO_SUCURSAL =
                  df.ID_PRODUCTO_SUCURSAL
            WHERE df.ID_DETALLE_FACTURA = :detalle`,
          { detalle: detalleId }
        );

        if (
          origen.rows.length !== 1 ||
          Number(origen.rows[0].ID_FACTURA) !==
            Number(encabezado.id_factura)
        ) {
          throw error(
            "El producto no pertenece a esta factura", 400
          );
        }

        await c.execute(
          `INSERT INTO DEVOLUCION (
             ID_EMPLEADO,
             ID_SUCURSAL,
             ID_FACTURA,
             ID_DETALLE_FACTURA,
             ID_NOTA_CREDITO,
             FECHA,
             CANTIDAD,
             MOTIVO,
             REINGRESA_INVENTARIO
           ) VALUES (
             :empleado,
             :sucursal,
             :factura,
             :detalle,
             :nota,
             SYSDATE,
             :cantidad,
             :motivo,
             'S'
           )`,
          {
            empleado: Number(encabezado.id_empleado),
            sucursal: Number(origen.rows[0].ID_SUCURSAL),
            factura: Number(encabezado.id_factura),
            detalle: detalleId,
            nota: Number(id),
            cantidad: Number(linea.cantidad),
            motivo: String(encabezado.motivo).trim()
          }
        );
      }
    }

    let cobro = null;
    let pagoCompra = null;

    if (body.pago_compra_inmediato) {
      const solicitud = body.pago_compra_inmediato;

      if (!solicitud || typeof solicitud !== "object" ||
          Array.isArray(solicitud))
        throw error("Datos de pago invalidos", 400);

      const idMetodo = Number(solicitud.id_metodo_pago);

      if (!Number.isSafeInteger(idMetodo) || idMetodo < 1)
        throw error("Selecciona una forma de pago", 400);

      if (solicitud.referencia != null &&
          typeof solicitud.referencia !== "string")
        throw error("Referencia invalida", 400);

      const referencia =
        String(solicitud.referencia || "").trim() || null;

      if (referencia && referencia.length > 50)
        throw error("Referencia demasiado larga", 400);

      const met = await c.execute(
        `SELECT NOMBRE, REQUIERE_REFERENCIA
           FROM METODO_PAGO
          WHERE ID_METODO_PAGO=:id
            AND ESTADO_REGISTRO='A'`,
        { id: idMetodo }
      );

      if (met.rows.length !== 1)
        throw error("Forma de pago no disponible", 400);

      const metodo = met.rows[0];

      if (metodo.REQUIERE_REFERENCIA === "S" && !referencia)
        throw error("Esta forma de pago requiere referencia", 400);

      const resultado = await c.execute(
        "SELECT TOTAL, SALDO FROM COMPRA WHERE ID_COMPRA=:id FOR UPDATE",
        { id }
      );

      const total = Number(resultado.rows[0]?.TOTAL);
      const saldo = Number(resultado.rows[0]?.SALDO);

      if (!Number.isFinite(total) || total <= 0 ||
          !Number.isFinite(saldo) ||
          Math.abs(total - saldo) > 0.005)
        throw error("El saldo de la compra no es valido", 400);

      await call(c, "compra-pago", {
        id_compra: id,
        id_empleado_sucursal: encabezado.id_empleado_sucursal,
        id_metodo_pago: idMetodo,
        monto: total,
        referencia
      });

      pagoCompra = {
        pagado: true,
        total,
        metodo: metodo.NOMBRE
      };
    }
    if (body.cobro_inmediato) {
      cobro = await registrarCobroCaja(
        c, id, encabezado.id_empleado_sucursal, body.cobro_inmediato,
      );
    } else if (body.pago) {
      const pago = kind === "facturas" ? "venta-pago" : "compra-pago";
      await call(c, pago, { ...body.pago, [d.id]: id });
    }

                                                                             
                                                                            
    return { id, detalles: body.detalles.length, ok: true, cobro, pagoCompra,
      modalidad_entrega: kind === "facturas" ? body.modalidad_entrega : null };
  }, { write: true });
}


module.exports={createDocument,clienteEnMostrador};
