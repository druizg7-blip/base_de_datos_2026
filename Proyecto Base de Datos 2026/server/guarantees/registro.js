"use strict";
module.exports=(router,{S,connection,oracledb,wrap,numeroId})=>{
                                                     
router.get(
  "/garantias/datos",
  S.permit("/ventas/garantias", "C"),
  wrap(async (req, res) => {
    const factura = req.query.factura
      ? numeroId(req.query.factura)
      : null;

    const datos = await connection(
      req.user.nombre_usuario,
      async c => {

        if (factura) {
          const existe = await c.execute(
            `SELECT ID_FACTURA
               FROM FACTURA
              WHERE ID_FACTURA = :id
                AND ESTADO_REGISTRO = 'A'`,
            { id: factura }
          );

          if (!existe.rows.length) {
            throw S.error("Factura no encontrada", 404);
          }

          const lineas = await c.execute(`
            SELECT
              df.ID_DETALLE_FACTURA AS ID,
              df.CANTIDAD,
              p.CODIGO || ' - ' || p.NOMBRE AS PRODUCTO
            FROM DETALLE_FACTURA df
            JOIN PRODUCTO_SUCURSAL ps
              ON ps.ID_PRODUCTO_SUCURSAL =
                 df.ID_PRODUCTO_SUCURSAL
            JOIN PRODUCTO p
              ON p.ID_PRODUCTO = ps.ID_PRODUCTO
            WHERE df.ID_FACTURA = :id
              AND df.ESTADO_REGISTRO = 'A'
            ORDER BY df.ID_DETALLE_FACTURA
          `, { id: factura });

          const notas = await c.execute(`
            SELECT
              nc.ID_NOTA_CREDITO AS ID,
              nc.NUMERO AS ETIQUETA,
              dn.ID_DETALLE_FACTURA AS LINEA
            FROM NOTA_CREDITO nc
            JOIN DETALLE_NOTA_CREDITO dn
              ON dn.ID_NOTA_CREDITO = nc.ID_NOTA_CREDITO
            WHERE nc.ID_FACTURA = :id
              AND nc.ESTADO_REGISTRO = 'A'
            ORDER BY nc.ID_NOTA_CREDITO DESC
          `, { id: factura });

          return {
            lineas: lineas.rows,
            notas: notas.rows
          };
        }

        const facturas = await c.execute(`
          SELECT
            f.ID_FACTURA AS ID,
            f.SERIE || '-' || f.NUMERO AS DOCUMENTO,
            p.NOMBRES || ' ' || p.APELLIDOS AS CLIENTE
          FROM FACTURA f
          JOIN CLIENTE cl
            ON cl.ID_CLIENTE = f.ID_CLIENTE
          JOIN PERSONA p
            ON p.ID_PERSONA = cl.ID_PERSONA
          WHERE f.ESTADO_REGISTRO = 'A'
          ORDER BY f.ID_FACTURA DESC
          FETCH FIRST 300 ROWS ONLY
        `);

        const empleados = await c.execute(`
          SELECT
            e.ID_EMPLEADO AS ID,
            p.NOMBRES || ' ' || p.APELLIDOS ||
            ' - ' || e.CODIGO_EMPLEADO AS NOMBRE
          FROM EMPLEADO e
          JOIN PERSONA p
            ON p.ID_PERSONA = e.ID_PERSONA
          WHERE e.ESTADO_REGISTRO = 'A'
            AND p.ESTADO_REGISTRO = 'A'
          ORDER BY p.NOMBRES, p.APELLIDOS
        `);

        const historial = await c.execute(`
          SELECT
            g.ID_GARANTIA AS ID,
            f.SERIE || '-' || f.NUMERO AS FACTURA,
            g.ESTADO,
            TO_CHAR(
              g.FECHA_RECLAMO, 'YYYY-MM-DD'
            ) AS FECHA,
            (
              SELECT LISTAGG(
                pr.NOMBRE, ', '
              ) WITHIN GROUP (ORDER BY pr.NOMBRE)
              FROM DETALLE_GARANTIA dg
              JOIN DETALLE_FACTURA df
                ON df.ID_DETALLE_FACTURA =
                   dg.ID_DETALLE_FACTURA
              JOIN PRODUCTO_SUCURSAL ps
                ON ps.ID_PRODUCTO_SUCURSAL =
                   df.ID_PRODUCTO_SUCURSAL
              JOIN PRODUCTO pr
                ON pr.ID_PRODUCTO = ps.ID_PRODUCTO
              WHERE dg.ID_GARANTIA = g.ID_GARANTIA
                AND dg.ESTADO_REGISTRO = 'A'
            ) AS PRODUCTOS
          FROM GARANTIA g
          JOIN FACTURA f
            ON f.ID_FACTURA = g.ID_FACTURA
          WHERE g.ESTADO_REGISTRO = 'A'
          ORDER BY g.ID_GARANTIA DESC
          FETCH FIRST 100 ROWS ONLY
        `);

        return {
          facturas: facturas.rows,
          empleados: empleados.rows,
          historial: historial.rows
        };
      }
    );

    res.json(datos);
  })
);

                                                            
router.post(
  "/garantias/registrar",
  S.permit("/ventas/garantias", "I"),
  wrap(async (req, res) => {
    const body = req.body || {};

    const idFactura = numeroId(body.id_factura);
    const idEmpleado = numeroId(body.id_empleado);
    const idDetalle = numeroId(body.id_detalle_factura);

    const cantidad = Number(body.cantidad);

    const idNota = body.id_nota_credito == null ||
                   body.id_nota_credito === ""
      ? null
      : numeroId(body.id_nota_credito);

    const falla =
      typeof body.descripcion_falla === "string"
        ? body.descripcion_falla.trim()
        : "";

    const observaciones =
      typeof body.observaciones === "string"
        ? body.observaciones.trim()
        : "";

    if (
      !Number.isFinite(cantidad) ||
      cantidad <= 0 ||
      Math.abs(
        Math.round(cantidad * 100) - cantidad * 100
      ) > 0.0000001
    ) {
      throw S.error("Cantidad invalida", 400);
    }

    if (!falla || falla.length > 300) {
      throw S.error(
        "Describe la falla (maximo 300 caracteres)",
        400
      );
    }

    if (observaciones.length > 300) {
      throw S.error(
        "Observaciones demasiado largas",
        400
      );
    }

    const resultado = await connection(
      req.user.nombre_usuario,
      async c => {

                                                        
        const factura = await c.execute(`
          SELECT ID_FACTURA
          FROM FACTURA
          WHERE ID_FACTURA = :id
            AND ESTADO_REGISTRO = 'A'
          FOR UPDATE
        `, { id: idFactura });

        if (!factura.rows.length) {
          throw S.error("Factura no disponible", 400);
        }

        const empleado = await c.execute(`
          SELECT ID_EMPLEADO
          FROM EMPLEADO
          WHERE ID_EMPLEADO = :id
            AND ESTADO_REGISTRO = 'A'
        `, { id: idEmpleado });

        if (!empleado.rows.length) {
          throw S.error("Empleado no disponible", 400);
        }

                                                     
        const linea = await c.execute(`
          SELECT CANTIDAD
          FROM DETALLE_FACTURA
          WHERE ID_DETALLE_FACTURA = :detalle
            AND ID_FACTURA = :factura
            AND ESTADO_REGISTRO = 'A'
        `, {
          detalle: idDetalle,
          factura: idFactura
        });

        if (
          !linea.rows.length ||
          cantidad > Number(linea.rows[0].CANTIDAD)
        ) {
          throw S.error(
            "Producto incorrecto o cantidad mayor que la vendida",
            400
          );
        }

                                                                
        if (idNota !== null) {
          const nota = await c.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM NOTA_CREDITO nc
            JOIN DETALLE_NOTA_CREDITO dn
              ON dn.ID_NOTA_CREDITO = nc.ID_NOTA_CREDITO
            WHERE nc.ID_NOTA_CREDITO = :nota
              AND nc.ID_FACTURA = :factura
              AND dn.ID_DETALLE_FACTURA = :detalle
              AND nc.ESTADO_REGISTRO = 'A'
          `, {
            nota: idNota,
            factura: idFactura,
            detalle: idDetalle
          });

          if (!Number(nota.rows[0].TOTAL)) {
            throw S.error(
              "La nota de credito no pertenece a esa factura y producto",
              400
            );
          }
        }

                                 
        const encabezado = await c.execute(`
          INSERT INTO GARANTIA (
            ID_GARANTIA,
            ID_EMPLEADO,
            ID_FACTURA,
            ID_NOTA_CREDITO,
            FECHA_RECLAMO,
            ESTADO,
            OBSERVACIONES
          )
          VALUES (
            SEQ_GARANTIA.NEXTVAL,
            :empleado,
            :factura,
            :nota,
            SYSDATE,
            'PENDIENTE',
            :observaciones
          )
          RETURNING ID_GARANTIA INTO :nuevo
        `, {
          empleado: idEmpleado,
          factura: idFactura,
          nota: idNota,
          observaciones: observaciones || null,
          nuevo: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          }
        });

        const idGarantia = encabezado.outBinds.nuevo[0];

                                                              
        await c.execute(`
          INSERT INTO DETALLE_GARANTIA (
            ID_DETALLE_GARANTIA,
            ID_DETALLE_FACTURA,
            ID_GARANTIA,
            CANTIDAD,
            DESCRIPCION_FALLA
          )
          VALUES (
            SEQ_DETALLE_GARANTIA.NEXTVAL,
            :detalle,
            :garantia,
            :cantidad,
            :falla
          )
        `, {
          detalle: idDetalle,
          garantia: idGarantia,
          cantidad,
          falla
        });

        return {
          ok: true,
          id_garantia: idGarantia,
          estado: "PENDIENTE"
        };

      },
      { write: true }
    );

    res.status(201).json(resultado);
  })
);


};
