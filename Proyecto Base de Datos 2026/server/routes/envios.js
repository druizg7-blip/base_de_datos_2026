"use strict";
const {scope,clause,assertBranch}=require('../branch-scope');
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                        

const fgEnvioId = v => {
  const n = Number(v);
  if (!Number.isSafeInteger(n) || n < 1)
    throw S.error('Identificador invalido', 400);
  return n;
};

const fgEnvioTexto = (v, max, obligatorio = false) => {
  const s = String(v ?? '').trim();
  if (s.length > max || (obligatorio && !s))
    throw S.error('Texto obligatorio o demasiado largo', 400);
  return s || null;
};

const fgPendienteFactura = alias => `
  GREATEST(0, ${alias}.CANTIDAD
    - NVL((SELECT SUM(de.CANTIDAD)
      FROM DETALLE_ENVIO de
      JOIN ENVIO e ON e.ID_ENVIO = de.ID_ENVIO
      WHERE de.ID_DETALLE_FACTURA = ${alias}.ID_DETALLE_FACTURA
        AND de.ESTADO_REGISTRO = 'A'
        AND e.ESTADO_REGISTRO = 'A'), 0)
    - NVL((SELECT SUM(nc.CANTIDAD)
      FROM DETALLE_NOTA_CREDITO nc
      WHERE nc.ID_DETALLE_FACTURA = ${alias}.ID_DETALLE_FACTURA
        AND nc.ESTADO_REGISTRO = 'A'), 0))`;

const fgEnvioDetalleSQL = `
  SELECT
    df.ID_DETALLE_FACTURA AS ID,
    p.CODIGO,
    p.NOMBRE AS PRODUCTO,
    df.CANTIDAD AS VENDIDA,
    ${fgPendienteFactura("df")} AS DISPONIBLE
  FROM DETALLE_FACTURA df
  JOIN PRODUCTO_SUCURSAL ps
    ON ps.ID_PRODUCTO_SUCURSAL = df.ID_PRODUCTO_SUCURSAL
  JOIN PRODUCTO p
    ON p.ID_PRODUCTO = ps.ID_PRODUCTO
  WHERE df.ID_FACTURA = :id
    AND df.ESTADO_REGISTRO = 'A'
  ORDER BY df.ID_DETALLE_FACTURA
`;

router.get(
  '/envios/gestion/datos',
  S.permit('/envios/gestion', 'C'),
  wrap(async (req, res) => {
    const datos = await connection(
      req.user.nombre_usuario,
      async c => {
        const alcance=await scope(c,req.user);
        const cf={};const fc=clause(alcance,'es.ID_SUCURSAL',cf);
        const cv={};const fv=clause(alcance,'ID_SUCURSAL',cv);
        const ce={};const fe=clause(alcance,'e.ID_SUCURSAL',ce);
        const facturas = await c.execute(`
          SELECT
            f.ID_FACTURA AS ID,
            f.SERIE || '-' || f.NUMERO AS DOCUMENTO,
            p.NOMBRES || ' ' || p.APELLIDOS AS CLIENTE,
            es.ID_SUCURSAL,
            s.NOMBRE AS SUCURSAL
          FROM FACTURA f
          JOIN CLIENTE cl
            ON cl.ID_CLIENTE = f.ID_CLIENTE
          JOIN PERSONA p
            ON p.ID_PERSONA = cl.ID_PERSONA
          JOIN EMPLEADO_SUCURSAL es
            ON es.ID_EMPLEADO_SUCURSAL =
               f.ID_EMPLEADO_SUCURSAL
          JOIN SUCURSAL s
            ON s.ID_SUCURSAL = es.ID_SUCURSAL
          WHERE f.ESTADO_REGISTRO = 'A'
            AND (f.MODALIDAD_ENTREGA = 'ENVIO' OR f.MODALIDAD_ENTREGA IS NULL)
            AND EXISTS (
              SELECT 1
              FROM DETALLE_FACTURA df
              WHERE df.ID_FACTURA = f.ID_FACTURA
                AND df.ESTADO_REGISTRO = 'A'
                AND ${fgPendienteFactura("df")} > 0
            )
          ${fc}
          ORDER BY f.ID_FACTURA DESC
          FETCH FIRST 300 ROWS ONLY
        `,cf);

        const empleados = await c.execute(`
          SELECT DISTINCT
            e.ID_EMPLEADO AS ID,
            es.ID_SUCURSAL,
            p.NOMBRES || ' ' || p.APELLIDOS AS NOMBRE
          FROM EMPLEADO_SUCURSAL es
          JOIN EMPLEADO e
            ON e.ID_EMPLEADO = es.ID_EMPLEADO
          JOIN PERSONA p
            ON p.ID_PERSONA = e.ID_PERSONA
          WHERE es.ESTADO_REGISTRO = 'A'
            AND e.ESTADO_REGISTRO = 'A'
            AND es.FECHA_FIN IS NULL
            ${fc}
          ORDER BY NOMBRE
        `,cf);

                                                                                     
        const pilotos = await c.execute(`
          SELECT DISTINCT e.ID_EMPLEADO AS ID, es.ID_SUCURSAL,
            p.NOMBRES || ' ' || p.APELLIDOS AS NOMBRE
          FROM EMPLEADO_SUCURSAL es
          JOIN EMPLEADO e ON e.ID_EMPLEADO=es.ID_EMPLEADO
          JOIN PERSONA p ON p.ID_PERSONA=e.ID_PERSONA
          JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO=e.ID_EMPLEADO
          JOIN PUESTO pu ON pu.ID_PUESTO=ep.ID_PUESTO
          JOIN USUARIO u ON u.ID_EMPLEADO=e.ID_EMPLEADO
          JOIN ROL r ON r.ID_ROL=u.ID_ROL
          WHERE es.ESTADO_REGISTRO='A' AND es.FECHA_FIN IS NULL
            AND e.ESTADO_REGISTRO='A' AND p.ESTADO_REGISTRO='A'
            AND ep.ESTADO_REGISTRO='A' AND ep.FECHA_FIN IS NULL
            AND UPPER(pu.NOMBRE)='PILOTO' AND UPPER(r.NOMBRE)='PILOTO'
            AND u.ESTADO_REGISTRO='A' AND u.BLOQUEADO='N'
            ${fc}
          ORDER BY NOMBRE
        `, cf);

        const vehiculos = await c.execute(`
          SELECT
            ID_VEHICULO AS ID,
            ID_SUCURSAL,
            PLACA || ' - ' || MARCA || ' ' || MODELO AS NOMBRE
          FROM VEHICULO
          WHERE ESTADO_REGISTRO = 'A' ${fv}
          ORDER BY PLACA
        `,cv);

        const departamentos = await c.execute(`
          SELECT ID_DEPARTAMENTO AS ID, NOMBRE
          FROM DEPARTAMENTO
          WHERE ESTADO_REGISTRO = 'A'
          ORDER BY NOMBRE
        `);

        const envios = await c.execute(`
          SELECT
            e.ID_ENVIO AS ID,
            e.ESTADO,
            e.TRANSPORTA_CLIENTE,
            e.DIRECCION_ENTREGA,
            TO_CHAR(e.FECHA_ENVIO, 'YYYY-MM-DD') AS FECHA_ENVIO,
            TO_CHAR(e.FECHA_ENTREGA, 'YYYY-MM-DD') AS FECHA_ENTREGA,
            f.SERIE || '-' || f.NUMERO AS DOCUMENTO,
            p.NOMBRES || ' ' || p.APELLIDOS AS CLIENTE,
            s.NOMBRE AS SUCURSAL,
            (
              SELECT COUNT(*)
              FROM DETALLE_ENVIO de
              WHERE de.ID_ENVIO = e.ID_ENVIO
                AND de.ESTADO_REGISTRO = 'A'
            ) AS LINEAS
          FROM ENVIO e
          JOIN FACTURA f
            ON f.ID_FACTURA = e.ID_FACTURA
          JOIN CLIENTE cl
            ON cl.ID_CLIENTE = f.ID_CLIENTE
          JOIN PERSONA p
            ON p.ID_PERSONA = cl.ID_PERSONA
          JOIN SUCURSAL s
            ON s.ID_SUCURSAL = e.ID_SUCURSAL
          WHERE e.ESTADO_REGISTRO = 'A' ${fe}
          ORDER BY e.ID_ENVIO DESC
          FETCH FIRST 300 ROWS ONLY
        `,ce);

        return {
          facturas: facturas.rows,
          empleados: empleados.rows,
          pilotos: pilotos.rows,
          vehiculos: vehiculos.rows,
          departamentos: departamentos.rows,
          envios: envios.rows
        };
      }
    );

    res.json(datos);
  })
);

router.get(
  '/envios/gestion/factura/:id',
  S.permit('/envios/gestion', 'C'),
  wrap(async (req, res) => {
    const id = fgEnvioId(req.params.id);

    const resultado = await connection(
      req.user.nombre_usuario,
      async c => {
        const alcance=await scope(c,req.user);
        const binds={id};const filtro=clause(alcance,'es.ID_SUCURSAL',binds);
        const factura = await c.execute(`
          SELECT f.ID_FACTURA AS ID FROM FACTURA f
          JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL
          WHERE f.ID_FACTURA = :id AND f.ESTADO_REGISTRO = 'A'
            AND (f.MODALIDAD_ENTREGA = 'ENVIO' OR f.MODALIDAD_ENTREGA IS NULL) ${filtro}
        `, binds);

        if (factura.rows.length !== 1)
          throw S.error('Factura no disponible', 404);

        const detalles = await c.execute(
          fgEnvioDetalleSQL,
          { id }
        );

        return detalles.rows;
      }
    );

    res.json(resultado);
  })
);

router.post(
  '/envios/gestion/registrar',
  S.permit('/envios/gestion', 'I'),
  wrap(async (req, res) => {

    const b = req.body || {};

    const idFactura = fgEnvioId(b.id_factura);
    const idEmpleado = fgEnvioId(b.id_empleado);
    const idDepartamento = fgEnvioId(b.id_departamento);

    const transporta =
      ['S','N'].includes(b.transporta_cliente)
        ? b.transporta_cliente
        : 'N';
    // Retiro por cliente: ni vehículo ni piloto de la empresa son obligatorios.
    const idVehiculo = transporta === 'S' ? null : fgEnvioId(b.id_vehiculo);
    const idPiloto = transporta === 'S' ? null : fgEnvioId(b.id_piloto);

    const direccion = fgEnvioTexto(
      b.direccion_entrega,
      250,
      true
    );

                                                                                
    let piloto = null;

    const lineas = b.detalles;

    if (
      !Array.isArray(lineas) ||
      !lineas.length ||
      lineas.length > 100
    ) {
      throw S.error(
        'Selecciona al menos un producto para enviar',
        400
      );
    }

    const cantidades = new Map();

    for (const linea of lineas) {
      const id = fgEnvioId(linea.id_detalle_factura);
      const cantidad = Number(linea.cantidad);

      if (
        cantidades.has(id) ||
        !Number.isFinite(cantidad) ||
        cantidad <= 0 ||
        Math.round(cantidad * 100) / 100 !== cantidad
      ) {
        throw S.error(
          'Detalle duplicado o cantidad invalida',
          400
        );
      }

      cantidades.set(id, cantidad);
    }

    const salida = await connection(
      req.user.nombre_usuario,
      async c => {
        const alcance=await scope(c,req.user);

                                                                 
        const factura = await c.execute(`
          SELECT es.ID_SUCURSAL, f.MODALIDAD_ENTREGA
          FROM FACTURA f
          JOIN EMPLEADO_SUCURSAL es
            ON es.ID_EMPLEADO_SUCURSAL =
               f.ID_EMPLEADO_SUCURSAL
          WHERE f.ID_FACTURA = :id
            AND f.ESTADO_REGISTRO = 'A'
          FOR UPDATE OF f.ID_FACTURA
        `, { id: idFactura });

        if (factura.rows.length !== 1)
          throw S.error('Factura no encontrada', 404);

        if (factura.rows[0].MODALIDAD_ENTREGA === 'CAJA')
          throw S.error('Los productos se entregaron en caja; esta factura no admite envíos', 409);
        const sucursal = factura.rows[0].ID_SUCURSAL;
        assertBranch(alcance,sucursal);

        const empleado = await c.execute(`
          SELECT COUNT(*) AS TOTAL
          FROM EMPLEADO_SUCURSAL es
          JOIN EMPLEADO e
            ON e.ID_EMPLEADO = es.ID_EMPLEADO
          WHERE es.ID_EMPLEADO = :empleado
            AND es.ID_SUCURSAL = :sucursal
            AND es.ESTADO_REGISTRO = 'A'
            AND es.FECHA_FIN IS NULL
            AND e.ESTADO_REGISTRO = 'A'
        `, {
          empleado: idEmpleado,
          sucursal
        });

        if (Number(empleado.rows[0].TOTAL) < 1)
          throw S.error(
            'Responsable no pertenece a la sucursal',
            400
          );

        if (transporta === 'N') {
          const vehiculo = await c.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM VEHICULO
            WHERE ID_VEHICULO = :vehiculo
              AND ID_SUCURSAL = :sucursal
              AND ESTADO_REGISTRO = 'A'
          `, {
            vehiculo: idVehiculo,
            sucursal
          });

          if (Number(vehiculo.rows[0].TOTAL) !== 1)
            throw S.error(
              'Vehiculo no pertenece a la sucursal',
              400
            );

        const conductor = await c.execute(`
          SELECT DISTINCT p.NOMBRES||' '||p.APELLIDOS AS NOMBRE
          FROM EMPLEADO e
          JOIN PERSONA p ON p.ID_PERSONA=e.ID_PERSONA
          JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO=e.ID_EMPLEADO
          JOIN EMPLEADO_PUESTO ep ON ep.ID_EMPLEADO=e.ID_EMPLEADO
          JOIN PUESTO pu ON pu.ID_PUESTO=ep.ID_PUESTO
          JOIN USUARIO u ON u.ID_EMPLEADO=e.ID_EMPLEADO
          JOIN ROL r ON r.ID_ROL=u.ID_ROL
          WHERE e.ID_EMPLEADO=:piloto AND es.ID_SUCURSAL=:sucursal
            AND e.ESTADO_REGISTRO='A' AND p.ESTADO_REGISTRO='A'
            AND es.ESTADO_REGISTRO='A' AND es.FECHA_FIN IS NULL
            AND ep.ESTADO_REGISTRO='A' AND ep.FECHA_FIN IS NULL
            AND UPPER(pu.NOMBRE)='PILOTO' AND UPPER(r.NOMBRE)='PILOTO'
            AND u.ESTADO_REGISTRO='A' AND u.BLOQUEADO='N'
          FETCH FIRST 1 ROWS ONLY`,{piloto:idPiloto,sucursal});
        if(conductor.rows.length!==1)
          throw S.error('Solo podés asignar un piloto activo, con cargo y cuenta de Piloto en esta sucursal',400);
        piloto=conductor.rows[0].NOMBRE;
        } // En un retiro por el cliente no se validan piloto ni vehículo corporativo.
        const departamento = await c.execute(`
          SELECT COUNT(*) AS TOTAL
          FROM DEPARTAMENTO
          WHERE ID_DEPARTAMENTO = :id
            AND ESTADO_REGISTRO = 'A'
        `, { id: idDepartamento });

        if (Number(departamento.rows[0].TOTAL) !== 1)
          throw S.error(
            'Departamento de destino invalido',
            400
          );

        const detalles = await c.execute(
          fgEnvioDetalleSQL,
          { id: idFactura }
        );

        const disponibles = new Map(
          detalles.rows.map(d => [
            Number(d.ID),
            Number(d.DISPONIBLE)
          ])
        );

        for (const [id, cantidad] of cantidades) {
          if (
            !disponibles.has(id) ||
            cantidad > disponibles.get(id) + 0.00001
          ) {
            throw S.error(
              'Cantidad mayor que las unidades pendientes de envio',
              400
            );
          }
        }

        const cabecera = await c.execute(`
          INSERT INTO ENVIO (
            ID_ENVIO,
            ID_EMPLEADO,
            ID_DEPARTAMENTO,
            ID_SUCURSAL,
            ID_FACTURA,
            ID_VEHICULO,
            ID_PILOTO,
            FECHA_ENVIO,
            FECHA_ENTREGA,
            DIRECCION_ENTREGA,
            NOMBRE_PILOTO,
            TRANSPORTA_CLIENTE,
            ESTADO
          )
          VALUES (
            SEQ_ENVIO.NEXTVAL,
            :empleado,
            :departamento,
            :sucursal,
            :factura,
            :vehiculo,
            :id_piloto,
            SYSDATE,
            CASE WHEN :retiro = 'S' THEN SYSDATE ELSE NULL END,
            :direccion,
            :piloto,
            :transporta,
            :estado
          )
          RETURNING ID_ENVIO INTO :id
        `, {
          empleado: idEmpleado,
          departamento: idDepartamento,
          sucursal,
          factura: idFactura,
          vehiculo: idVehiculo,
          id_piloto: idPiloto,
          direccion,
          piloto,
          transporta,
          retiro: transporta,
          estado: transporta === 'S' ? 'ENTREGADO' : 'PENDIENTE',
          id: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
          }
        });

        const idEnvio = cabecera.outBinds.id[0];

        for (const [id, cantidad] of cantidades) {
          await c.execute(`
            INSERT INTO DETALLE_ENVIO (
              ID_DETALLE_FACTURA,
              ID_ENVIO,
              CANTIDAD
            )
            VALUES (
              :detalle,
              :envio,
              :cantidad
            )
          `, {
            detalle: id,
            envio: idEnvio,
            cantidad
          });
        }

        return {
          ok: true,
          id_envio: idEnvio,
          lineas: cantidades.size
        };

      },
      { write: true }
    );

    res.status(201).json(salida);
  })
);

router.patch(
  '/envios/gestion/:id/estado',
  S.permit('/envios/gestion', 'U'),
  wrap(async (req, res) => {

    const id = fgEnvioId(req.params.id);
    const nuevo = String(
      req.body?.estado || ''
    ).toUpperCase();

                                                                  
    const pasos = { PENDIENTE: 'EN_RUTA' };

    const resultado = await connection(
      req.user.nombre_usuario,
      async c => {

        const previo = await c.execute(`
          SELECT ESTADO, ID_SUCURSAL
          FROM ENVIO
          WHERE ID_ENVIO = :id
            AND ESTADO_REGISTRO = 'A'
          FOR UPDATE
        `, { id });

        if (previo.rows.length !== 1)
          throw S.error('Envio no encontrado', 404);
        const alcance=await scope(c,req.user);
        assertBranch(alcance,previo.rows[0].ID_SUCURSAL);

        if (pasos[previo.rows[0].ESTADO] !== nuevo)
          throw S.error(
            'Transicion de estado no permitida',
            400
          );

        const actualizado = await c.execute(`
          UPDATE ENVIO
          SET
            ESTADO = :estado,
            FECHA_ENTREGA = CASE
              WHEN :estado2 = 'ENTREGADO'
              THEN SYSDATE
              ELSE FECHA_ENTREGA
            END
          WHERE ID_ENVIO = :id
            AND ESTADO_REGISTRO = 'A'
        `, {
          estado: nuevo,
          estado2: nuevo,
          id
        });

        if (actualizado.rowsAffected !== 1)
          throw S.error(
            'No se actualizo el envio',
            409
          );

        return { ok: true, estado: nuevo };

      },
      { write: true }
    );

    res.json(resultado);
  })
);



                                                                                   
router.get('/envios/mis-entregas',S.permit('/envios/mis-entregas','C'),wrap(async(req,res)=>{
  const filas=await connection(req.user.nombre_usuario,async cn=>{
    const data=await cn.execute(`
      SELECT e.ID_ENVIO AS ID, e.ESTADO,
        TO_CHAR(e.FECHA_ENVIO,'YYYY-MM-DD') AS FECHA_ENVIO,
        TO_CHAR(e.FECHA_ENTREGA,'YYYY-MM-DD') AS FECHA_ENTREGA,
        e.DIRECCION_ENTREGA, f.SERIE||'-'||f.NUMERO AS FACTURA,
        p.NOMBRES||' '||p.APELLIDOS AS CLIENTE,
        s.NOMBRE AS SUCURSAL, v.PLACA AS VEHICULO,
        (SELECT COUNT(*) FROM DETALLE_ENVIO de
         WHERE de.ID_ENVIO=e.ID_ENVIO AND de.ESTADO_REGISTRO='A') AS LINEAS
      FROM ENVIO e
      JOIN USUARIO u ON u.ID_EMPLEADO=e.ID_PILOTO
      JOIN ROL r ON r.ID_ROL=u.ID_ROL
      JOIN FACTURA f ON f.ID_FACTURA=e.ID_FACTURA
      JOIN CLIENTE c ON c.ID_CLIENTE=f.ID_CLIENTE
      JOIN PERSONA p ON p.ID_PERSONA=c.ID_PERSONA
      JOIN SUCURSAL s ON s.ID_SUCURSAL=e.ID_SUCURSAL
      LEFT JOIN VEHICULO v ON v.ID_VEHICULO=e.ID_VEHICULO
      WHERE u.ID_USUARIO=:usuario
        AND UPPER(r.NOMBRE)='PILOTO'
        AND u.BLOQUEADO='N' AND u.ESTADO_REGISTRO='A'
        AND e.ESTADO_REGISTRO='A'
        AND EXISTS (SELECT 1 FROM EMPLEADO_SUCURSAL es
          WHERE es.ID_EMPLEADO=u.ID_EMPLEADO
            AND es.ID_SUCURSAL=e.ID_SUCURSAL
            AND es.FECHA_FIN IS NULL AND es.ESTADO_REGISTRO='A')
      ORDER BY e.ID_ENVIO DESC FETCH FIRST 100 ROWS ONLY`,
      {usuario:req.user.id_usuario});
    return data.rows;
  });
  res.json(filas);
}));

                                                              
router.patch('/envios/mis-entregas/:id/confirmar',S.permit('/envios/mis-entregas','U'),wrap(async(req,res)=>{
  const id=fgEnvioId(req.params.id);
  const salida=await connection(req.user.nombre_usuario,async cn=>{
    const anterior=await cn.execute(`
      SELECT e.ESTADO
      FROM ENVIO e
      JOIN USUARIO u ON u.ID_EMPLEADO=e.ID_PILOTO
      JOIN ROL r ON r.ID_ROL=u.ID_ROL
      WHERE e.ID_ENVIO=:id AND u.ID_USUARIO=:usuario
        AND UPPER(r.NOMBRE)='PILOTO'
        AND u.BLOQUEADO='N' AND u.ESTADO_REGISTRO='A'
        AND e.ESTADO_REGISTRO='A'
        AND EXISTS (SELECT 1 FROM EMPLEADO_SUCURSAL es
          WHERE es.ID_EMPLEADO=u.ID_EMPLEADO
            AND es.ID_SUCURSAL=e.ID_SUCURSAL
            AND es.FECHA_FIN IS NULL AND es.ESTADO_REGISTRO='A')
      FOR UPDATE OF e.ESTADO`,{id,usuario:req.user.id_usuario});
    if(!anterior.rows.length)throw S.error('Envío no asignado a tu cuenta',403);
    if(anterior.rows[0].ESTADO!=='EN_RUTA')
      throw S.error('Solo podés confirmar entregas que estén EN_RUTA',409);
    const upd=await cn.execute(`UPDATE ENVIO SET ESTADO='ENTREGADO',FECHA_ENTREGA=SYSDATE,
      FECHA_MODIFICACION=SYSTIMESTAMP,USUARIO_MODIFICACION=:usuario
      WHERE ID_ENVIO=:id AND ESTADO='EN_RUTA' AND ESTADO_REGISTRO='A'`,
      {id,usuario:req.user.nombre_usuario});
    if(upd.rowsAffected!==1)throw S.error('El envío cambió de estado',409);
    return {ok:true,id_envio:id,estado:'ENTREGADO'};
  },{write:true});
  res.json(salida);
}));

};
