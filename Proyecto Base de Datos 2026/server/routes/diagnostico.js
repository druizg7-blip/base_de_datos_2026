"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                     
                                               

router.get(
  "/sistema/diagnostico",
  S.permit("/admin/roles", "C"),
  wrap(async (req, res) => {
    const result = await connection(
      req.user.nombre_usuario,
      async (cn) => {
        const resumen = await cn.execute(
          `SELECT
             OBJECT_TYPE,
             STATUS,
             COUNT(*) AS CANTIDAD
           FROM USER_OBJECTS
           WHERE OBJECT_TYPE IN (
             'TABLE',
             'VIEW',
             'PACKAGE',
             'PACKAGE BODY',
             'PROCEDURE',
             'FUNCTION',
             'TRIGGER',
             'SEQUENCE'
           )
           GROUP BY OBJECT_TYPE, STATUS
           ORDER BY OBJECT_TYPE, STATUS`,
        );

        const invalidos = await cn.execute(
          `SELECT
             OBJECT_NAME,
             OBJECT_TYPE,
             STATUS
           FROM USER_OBJECTS
           WHERE STATUS <> 'VALID'
           ORDER BY OBJECT_TYPE, OBJECT_NAME`,
        );

        const paquetes = await cn.execute(
          `SELECT
             OBJECT_NAME,
             STATUS
           FROM USER_OBJECTS
           WHERE OBJECT_TYPE = 'PACKAGE'
             AND OBJECT_NAME IN (
               'PKG_SEGURIDAD',
               'PKG_VENTAS',
               'PKG_COMPRAS',
               'PKG_INVENTARIO',
               'PKG_REPORTES'
             )
           ORDER BY OBJECT_NAME`,
        );

        return {
          resumen: resumen.rows,
          invalidos: invalidos.rows,
          paquetes: paquetes.rows,
        };
      },
    );

    res.json(result);
  }),
);


};
