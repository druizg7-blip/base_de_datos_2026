"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
const {scope,clause}=require('../branch-scope');
                      
                                               

router.get(
  "/dashboard/resumen",
  wrap(async (req, res) => {
    const kpis = [
      {
        key: "facturas",
        path: "/ventas/facturar",
        object: "FACTURA",
      },
      {
        key: "compras",
        path: "/compras/registro",
        object: "COMPRA",
      },
      {
        key: "existencias",
        path: "/inventario/existencias",
        object: "V_EXISTENCIA_SUCURSAL",
      },
      {
        key: "envios",
        path: "/envios/gestion",
        object: "ENVIO",
      },
    ];

    const authorized = [];

    for (const k of kpis) {
      if (await S.allowed(req.user, k.path, "C")) {
        authorized.push(k);
      }
    }

    const rows = await connection(
      req.user.nombre_usuario,
      async (cn) => {
        const alcance=await scope(cn,req.user);
        const out = [];

        for (const k of authorized) {
          try {
            const binds={};
            const joins={
              facturas:' JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=v.ID_EMPLEADO_SUCURSAL',
              compras:' JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=v.ID_EMPLEADO_SUCURSAL',
              existencias:'', envios:''
            };
            const col=(k.key==='facturas'||k.key==='compras')?'es.ID_SUCURSAL':'v.ID_SUCURSAL';
            const filtro=clause(alcance,col,binds).replace(/^ AND /,' WHERE ');
            const result = await cn.execute(
              `SELECT COUNT(*) AS TOTAL FROM ${k.object} v ${joins[k.key]} ${filtro}`,
              binds
            );

            out.push({
              key: k.key,
              count: result.rows[0].TOTAL,
            });
          } catch (err) {
            console.error(
              `Dashboard ${k.key}:`,
              err.message,
            );

            out.push({
              key: k.key,
              count: null,
            });
          }
        }

        return out;
      },
    );

    res.json(rows);
  }),
);


};
