"use strict";
module.exports=(router,{S,connection,oracledb,wrap,numeroId})=>{
                           

router.get(
  "/garantias/:id/reemplazo",
  S.permit("/ventas/garantias", "C"),
  wrap(async (req, res) => {
    const id = numeroId(req.params.id);

    const info = await connection(
      req.user.nombre_usuario,
      async c => {
        const r = await c.execute(`
          SELECT
            g.ESTADO,
            dg.RESOLUCION,
            dg.CANTIDAD,
            ps.ID_PRODUCTO_SUCURSAL,
            ps.EXISTENCIA AS STOCK,
            p.NOMBRE AS PRODUCTO,
            s.NOMBRE AS SUCURSAL,
            mi.ID_MOVIMIENTO_INVENTARIO AS MOVIMIENTO
          FROM GARANTIA g
          JOIN DETALLE_GARANTIA dg
            ON dg.ID_GARANTIA = g.ID_GARANTIA
          JOIN DETALLE_FACTURA df
            ON df.ID_DETALLE_FACTURA = dg.ID_DETALLE_FACTURA
           AND df.ID_FACTURA = g.ID_FACTURA
          JOIN PRODUCTO_SUCURSAL ps
            ON ps.ID_PRODUCTO_SUCURSAL = df.ID_PRODUCTO_SUCURSAL
          JOIN PRODUCTO p
            ON p.ID_PRODUCTO = ps.ID_PRODUCTO
          JOIN SUCURSAL s
            ON s.ID_SUCURSAL = ps.ID_SUCURSAL
          LEFT JOIN MOVIMIENTO_INVENTARIO mi
            ON mi.ID_GARANTIA = g.ID_GARANTIA
          WHERE g.ID_GARANTIA = :id
            AND g.ESTADO_REGISTRO = 'A'
            AND dg.ESTADO_REGISTRO = 'A'
        `, { id });

        if (r.rows.length !== 1) {
          throw S.error(
            "La garantia debe tener exactamente un producto activo",
            400
          );
        }

        return r.rows[0];
      }
    );

    res.json(info);
  })
);

router.post(
  "/garantias/:id/reemplazo",
  S.permit("/ventas/garantias", "U"),
  S.permit("/inventario/bajas", "I"),
  wrap(async (req, res) => {
    const id = numeroId(req.params.id);

    if (req.body?.confirmado !== true) {
      throw S.error(
        "Confirma la entrega fisica del reemplazo",
        400
      );
    }

    const resultado = await connection(
      req.user.nombre_usuario,
      async c => {

                                                    
        const g = await c.execute(`
          SELECT ESTADO
          FROM GARANTIA
          WHERE ID_GARANTIA = :id
            AND ESTADO_REGISTRO = 'A'
          FOR UPDATE
        `, { id });

        if (
          g.rows.length !== 1 ||
          g.rows[0].ESTADO !== "ENTREGADO"
        ) {
          throw S.error(
            "La garantia debe estar en ENTREGADO",
            400
          );
        }

        const detalles = await c.execute(`
          SELECT
            dg.CANTIDAD,
            dg.RESOLUCION,
            ps.ID_PRODUCTO_SUCURSAL,
            ps.EXISTENCIA,
            p.NOMBRE AS PRODUCTO
          FROM GARANTIA ga
          JOIN DETALLE_GARANTIA dg
            ON dg.ID_GARANTIA = ga.ID_GARANTIA
          JOIN DETALLE_FACTURA df
            ON df.ID_DETALLE_FACTURA = dg.ID_DETALLE_FACTURA
           AND df.ID_FACTURA = ga.ID_FACTURA
          JOIN PRODUCTO_SUCURSAL ps
            ON ps.ID_PRODUCTO_SUCURSAL = df.ID_PRODUCTO_SUCURSAL
          JOIN PRODUCTO p
            ON p.ID_PRODUCTO = ps.ID_PRODUCTO
          WHERE ga.ID_GARANTIA = :id
            AND dg.ESTADO_REGISTRO = 'A'
            AND ps.ESTADO_REGISTRO = 'A'
        `, { id });

        if (
          detalles.rows.length !== 1 ||
          detalles.rows[0].RESOLUCION !== "REEMPLAZO"
        ) {
          throw S.error(
            "La garantia no tiene un reemplazo valido",
            400
          );
        }

        const d = detalles.rows[0];
        const cantidad = Number(d.CANTIDAD);

        if (
          !Number.isFinite(cantidad) ||
          cantidad <= 0 ||
          cantidad > Number(d.EXISTENCIA)
        ) {
          throw S.error(
            "Existencia insuficiente para el reemplazo",
            400
          );
        }

                                                  
        const previo = await c.execute(`
          SELECT ID_MOVIMIENTO_INVENTARIO
          FROM MOVIMIENTO_INVENTARIO
          WHERE ID_GARANTIA = :id
        `, { id });

        if (previo.rows.length) {
          throw S.error(
            "Este reemplazo ya fue registrado",
            409
          );
        }

        const referencia = `GARANTIA #${id} REEMPLAZO`;

        const coincidencias = await c.execute(`
          SELECT COUNT(*) AS TOTAL
          FROM MOVIMIENTO_INVENTARIO
          WHERE REFERENCIA = :ref
        `, { ref: referencia });

        if (Number(coincidencias.rows[0].TOTAL) > 0) {
          throw S.error(
            "Ya existe un movimiento con esta referencia. Revisa Kardex.",
            409
          );
        }

                                                       
        await c.execute(`
          BEGIN
            PRC_MOVER_INVENTARIO(
              :producto,
              :tipo,
              :cantidad,
              :referencia
            );
          END;
        `, {
          producto: d.ID_PRODUCTO_SUCURSAL,
          tipo: "Salida por Garantia",
          cantidad,
          referencia
        });

        const movimiento = await c.execute(`
          SELECT ID_MOVIMIENTO_INVENTARIO AS ID
          FROM MOVIMIENTO_INVENTARIO
          WHERE REFERENCIA = :ref
            AND ID_PRODUCTO_SUCURSAL = :producto
            AND ID_GARANTIA IS NULL
        `, {
          ref: referencia,
          producto: d.ID_PRODUCTO_SUCURSAL
        });

        if (movimiento.rows.length !== 1) {
          throw S.error(
            "No fue posible localizar el movimiento",
            500
          );
        }

        const idMovimiento = movimiento.rows[0].ID;

                                                   
        const vinculo = await c.execute(`
          UPDATE MOVIMIENTO_INVENTARIO
          SET ID_GARANTIA = :garantia
          WHERE ID_MOVIMIENTO_INVENTARIO = :movimiento
            AND ID_GARANTIA IS NULL
        `, {
          garantia: id,
          movimiento: idMovimiento
        });

        if (vinculo.rowsAffected !== 1) {
          throw S.error(
            "No fue posible vincular el reemplazo",
            500
          );
        }

                                                                     
        return {
          ok: true,
          id_garantia: id,
          id_movimiento: idMovimiento,
          producto: d.PRODUCTO,
          cantidad
        };
      },
      { write: true }
    );

    res.status(201).json(resultado);
  })
);

};
