"use strict";
module.exports=(router,{S,connection,oracledb,wrap,numeroId})=>{
                           

router.get(
  "/garantias/:id/seguimiento",
  S.permit("/ventas/garantias", "C"),
  wrap(async (req, res) => {
    const id = numeroId(req.params.id);

    const datos = await connection(
      req.user.nombre_usuario,
      async c => {

        const garantia = await c.execute(`
          SELECT
            g.ID_GARANTIA AS ID,
            g.ESTADO,
            g.OBSERVACIONES,
            f.SERIE || '-' || f.NUMERO AS FACTURA
          FROM GARANTIA g
          JOIN FACTURA f
            ON f.ID_FACTURA = g.ID_FACTURA
          WHERE g.ID_GARANTIA = :id
            AND g.ESTADO_REGISTRO = 'A'
        `, { id });

        if (!garantia.rows.length) {
          throw S.error("Garantia activa no encontrada", 404);
        }

        const detalles = await c.execute(`
          SELECT
            p.NOMBRE AS PRODUCTO,
            dg.CANTIDAD,
            dg.DESCRIPCION_FALLA,
            dg.RESOLUCION,
            TO_CHAR(
              dg.FECHA_RESOLUCION,
              'YYYY-MM-DD'
            ) AS FECHA_RESOLUCION
          FROM DETALLE_GARANTIA dg
          JOIN DETALLE_FACTURA df
            ON df.ID_DETALLE_FACTURA =
               dg.ID_DETALLE_FACTURA
          JOIN PRODUCTO_SUCURSAL ps
            ON ps.ID_PRODUCTO_SUCURSAL =
               df.ID_PRODUCTO_SUCURSAL
          JOIN PRODUCTO p
            ON p.ID_PRODUCTO = ps.ID_PRODUCTO
          WHERE dg.ID_GARANTIA = :id
            AND dg.ESTADO_REGISTRO = 'A'
        `, { id });

        const auditoria = await c.execute(`
          SELECT
            TO_CHAR(
              FECHA_HORA,
              'YYYY-MM-DD HH24:MI'
            ) AS FECHA,
            TIPO_EVENTO,
            DBMS_LOB.SUBSTR(VALOR_ANTERIOR, 1000, 1) AS VALOR_ANTERIOR,
            DBMS_LOB.SUBSTR(VALOR_NUEVO, 1000, 1) AS VALOR_NUEVO
          FROM BITACORA
          WHERE TABLA_AFECTADA = 'GARANTIA'
            AND ID_REGISTRO = :clave
          ORDER BY FECHA_HORA DESC
          FETCH FIRST 20 ROWS ONLY
        `, { clave: String(id) });

        return {
          garantia: garantia.rows[0],
          detalles: detalles.rows,
          historial: auditoria.rows
        };
      }
    );

    res.json(datos);
  })
);

router.patch(
  "/garantias/:id/seguimiento",
  S.permit("/ventas/garantias", "U"),
  wrap(async (req, res) => {

    const id = numeroId(req.params.id);

    const nuevo = String(
      req.body?.estado || ""
    ).toUpperCase();

    const resolucion = String(
      req.body?.resolucion || ""
    ).toUpperCase();

                                  
    const pasos = {
      PENDIENTE: "EN_PROCESO",
      EN_PROCESO: "ENTREGADO",
      EN_RUTA: "ENTREGADO",
      ENTREGADO: "CERRADO"
    };

    const resolucionesValidas = [
      "REPARACION",
      "REEMPLAZO",
      "SIN_COBERTURA",
      "OTRA"
    ];

    if (!Object.values(pasos).includes(nuevo)) {
      throw S.error("Estado de garantia invalido", 400);
    }

    const resultado = await connection(
      req.user.nombre_usuario,
      async c => {

                                                       
        const consulta = await c.execute(`
          SELECT ID_FACTURA, ESTADO
          FROM GARANTIA
          WHERE ID_GARANTIA = :id
            AND ESTADO_REGISTRO = 'A'
          FOR UPDATE
        `, { id });

        if (!consulta.rows.length) {
          throw S.error("Garantia activa no encontrada", 404);
        }

        const anterior = consulta.rows[0].ESTADO;
        const idFactura = consulta.rows[0].ID_FACTURA;

                if (nuevo === "CERRADO") {
          const pendientes = await c.execute(`
            SELECT COUNT(*) AS TOTAL
            FROM DETALLE_GARANTIA dg
            WHERE dg.ID_GARANTIA = :id
              AND dg.ESTADO_REGISTRO = 'A'
              AND dg.RESOLUCION = 'REEMPLAZO'
          `, { id });

          if (Number(pendientes.rows[0].TOTAL) > 0) {
            const movimiento = await c.execute(`
              SELECT COUNT(*) AS TOTAL
              FROM MOVIMIENTO_INVENTARIO mi
              JOIN TIPO_MOVIMIENTO tm
                ON tm.ID_TIPO_MOVIMIENTO = mi.ID_TIPO_MOVIMIENTO
              WHERE mi.ID_GARANTIA = :id
                AND mi.ESTADO_REGISTRO = 'A'
                AND tm.NOMBRE = 'Salida por Garantia'
            `, { id });

            if (Number(movimiento.rows[0].TOTAL) !== 1) {
              throw S.error(
                "Registra primero la salida del reemplazo",
                400
              );
            }
          }
        }
if (pasos[anterior] !== nuevo) {
          throw S.error(
            "No puedes pasar de " +
            anterior + " a " + nuevo,
            400
          );
        }

                                                     
        const relacion = await c.execute(`
          SELECT
            COUNT(*) AS TOTAL,
            SUM(
              CASE
                WHEN df.ID_FACTURA <> :factura
                THEN 1 ELSE 0
              END
            ) AS AJENOS
          FROM DETALLE_GARANTIA dg
          JOIN DETALLE_FACTURA df
            ON df.ID_DETALLE_FACTURA =
               dg.ID_DETALLE_FACTURA
          WHERE dg.ID_GARANTIA = :id
            AND dg.ESTADO_REGISTRO = 'A'
        `, {
          id,
          factura: idFactura
        });

        const valido =
          Number(relacion.rows[0].TOTAL) > 0 &&
          Number(relacion.rows[0].AJENOS) === 0;

        if (!valido) {
          throw S.error(
            "La garantia no tiene un producto correctamente vinculado",
            400
          );
        }

                                                
        if (nuevo === "ENTREGADO") {
          if (!resolucionesValidas.includes(resolucion)) {
            throw S.error(
              "Selecciona una resolucion para el reclamo",
              400
            );
          }

          await c.execute(`
            UPDATE DETALLE_GARANTIA
            SET
              RESOLUCION = :resolucion,
              FECHA_RESOLUCION = SYSDATE
            WHERE ID_GARANTIA = :id
              AND ESTADO_REGISTRO = 'A'
          `, { id, resolucion });
        }

        const actualizar = await c.execute(`
          UPDATE GARANTIA
          SET ESTADO = :nuevo
          WHERE ID_GARANTIA = :id
            AND ESTADO = :anterior
            AND ESTADO_REGISTRO = 'A'
        `, {
          id,
          anterior,
          nuevo
        });

        if (actualizar.rowsAffected !== 1) {
          throw S.error(
            "La garantia cambio durante la operacion",
            409
          );
        }

                                                   
                                 
        return {
          ok: true,
          id_garantia: id,
          estado: nuevo
        };
      },
      { write: true }
    );

    res.json(resultado);
  })
);

};
