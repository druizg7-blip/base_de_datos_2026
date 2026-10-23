"use strict";
const {scope,clause}=require('../branch-scope');
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
async function limited(user,table,rows) {
 return connection(user.nombre_usuario,async cn=>{
   const s=await scope(cn,user);
   if(s.admin)return rows;
   const map={
    PRODUCTO_SUCURSAL:'SELECT ID_PRODUCTO_SUCURSAL AS ID FROM PRODUCTO_SUCURSAL WHERE 1=1',
    EMPLEADO_SUCURSAL:`SELECT ID_EMPLEADO_SUCURSAL AS ID FROM EMPLEADO_SUCURSAL WHERE FECHA_FIN IS NULL AND ESTADO_REGISTRO='A'`,
    SUCURSAL:'SELECT ID_SUCURSAL AS ID FROM SUCURSAL WHERE 1=1',
    VEHICULO:'SELECT ID_VEHICULO AS ID FROM VEHICULO WHERE 1=1',
    FACTURA:'SELECT f.ID_FACTURA AS ID FROM FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE 1=1',
    COMPRA:'SELECT co.ID_COMPRA AS ID FROM COMPRA co JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL WHERE 1=1',
    DETALLE_FACTURA:'SELECT df.ID_DETALLE_FACTURA AS ID FROM DETALLE_FACTURA df JOIN FACTURA f ON f.ID_FACTURA=df.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE 1=1',
    CLIENTE:'SELECT DISTINCT f.ID_CLIENTE AS ID FROM FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE 1=1',
    EMPLEADO:`SELECT DISTINCT e.ID_EMPLEADO AS ID FROM EMPLEADO e JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO=e.ID_EMPLEADO WHERE es.ESTADO_REGISTRO='A' AND es.FECHA_FIN IS NULL`,
    NOTA_CREDITO:'SELECT n.ID_NOTA_CREDITO AS ID FROM NOTA_CREDITO n JOIN FACTURA f ON f.ID_FACTURA=n.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE 1=1'
   };
   if(!map[table])return rows;
   const binds={}; const col=['FACTURA','COMPRA','DETALLE_FACTURA','CLIENTE','EMPLEADO','NOTA_CREDITO'].includes(table)?'es.ID_SUCURSAL':'ID_SUCURSAL';
   const result=await cn.execute(map[table]+clause(s,col,binds),binds);
   const ids=new Set(result.rows.map(x=>Number(x.ID)));
   return rows.filter(x=>ids.has(Number(x.ID)));
 });
}
                                
                                               

                                            
                                                   

const contextual = {
  "/ventas/facturar": [
    "CLIENTE",
    "EMPLEADO_SUCURSAL",
    "PRODUCTO_SUCURSAL",
  ],
  "/ventas/pagos": [
    "FACTURA",
    "EMPLEADO_SUCURSAL",
    "METODO_PAGO",
  ],
  "/ventas/notas-credito": [
    "FACTURA",
    "EMPLEADO",
    "DETALLE_FACTURA",
  ],
  "/compras/registro": [
    "PROVEEDOR",
    "EMPLEADO_SUCURSAL",
    "PRODUCTO_SUCURSAL",
  ],
  "/compras/pagos": [
    "COMPRA",
    "EMPLEADO_SUCURSAL",
    "METODO_PAGO",
  ],
  "/inventario/bajas": [
    "PRODUCTO_SUCURSAL",
    "MOTIVO_BAJA",
  ],
  "/admin/usuarios": [
    "ROL",
    "EMPLEADO",
  ],
};

                                     
                                           

const privateLabel = {
  NOTA_CREDITO: "'NC '||NUMERO",
  FACTURA: "'Factura '||SERIE||'-'||NUMERO",
  COMPRA: "'Compra '||NUMERO_DOCUMENTO",
  DETALLE_FACTURA:
    "'Línea # '||ID_DETALLE_FACTURA||' · Cantidad '||CANTIDAD",
};

router.get(
  "/opciones/:table",
  wrap(async (req, res) => {
    const target = req.params.table.toUpperCase();
    const context = String(req.query.context || "");

    let route;

    if (context.startsWith("CAT:")) {
      const parent = C.definition(context.slice(4));

      if (
        !parent.columns.some(
          (c) => c.reference === target,
        )
      ) {
        throw S.error(
          "Esta tabla no es una referencia del formulario",
          403,
        );
      }

      route = parent.path;
    } else {
      if (!contextual[context]?.includes(target)) {
        throw S.error(
          "Referencia fuera del contexto autorizado",
          403,
        );
      }

      route = context;
    }

    if (!(await S.allowed(req.user, route, "C"))) {
      throw S.error("No autorizado", 403);
    }

    if (
      [
        "PRODUCTO_SUCURSAL",
        "EMPLEADO_SUCURSAL",
        "CLIENTE",
      ].includes(target)
    ) {
      const queries = {
        PRODUCTO_SUCURSAL: `
          SELECT
            ps.ID_PRODUCTO_SUCURSAL AS ID,
            p.CODIGO || ' · ' ||
            p.NOMBRE || ' · ' ||
            s.NOMBRE || ' · Stock ' ||
            ps.EXISTENCIA AS ETIQUETA,
            ps.ID_SUCURSAL AS SUCURSAL_ID,
            p.PRECIO_VENTA AS PRECIO_VENTA,
            p.PRECIO_COSTO AS PRECIO_COSTO
          FROM PRODUCTO_SUCURSAL ps
          JOIN PRODUCTO p
            ON p.ID_PRODUCTO = ps.ID_PRODUCTO
          JOIN SUCURSAL s
            ON s.ID_SUCURSAL = ps.ID_SUCURSAL
          WHERE ps.ESTADO_REGISTRO = 'A'
          ORDER BY p.NOMBRE
          FETCH FIRST 300 ROWS ONLY
        `,
        EMPLEADO_SUCURSAL: `
          SELECT
            es.ID_EMPLEADO_SUCURSAL AS ID,
            p.NOMBRES || ' ' ||
            p.APELLIDOS || ' · ' ||
            s.NOMBRE AS ETIQUETA,
            es.ID_SUCURSAL AS SUCURSAL_ID
          FROM EMPLEADO_SUCURSAL es
          JOIN EMPLEADO e
            ON e.ID_EMPLEADO = es.ID_EMPLEADO
          JOIN PERSONA p
            ON p.ID_PERSONA = e.ID_PERSONA
          JOIN SUCURSAL s
            ON s.ID_SUCURSAL = es.ID_SUCURSAL
          WHERE es.ESTADO_REGISTRO = 'A'
          ORDER BY p.NOMBRES
          FETCH FIRST 300 ROWS ONLY
        `,
        CLIENTE: `
          SELECT
            c.ID_CLIENTE AS ID,
            p.NOMBRES || ' ' ||
            p.APELLIDOS AS ETIQUETA
          FROM CLIENTE c
          JOIN PERSONA p
            ON p.ID_PERSONA = c.ID_PERSONA
          WHERE c.ESTADO_REGISTRO = 'A'
          ORDER BY p.NOMBRES
          FETCH FIRST 300 ROWS ONLY
        `,
      };

      return res.json(
        await limited(req.user,target,await connection(
          req.user.nombre_usuario,
          async (cn) =>
            (await cn.execute(queries[target])).rows,
        )),
      );
    }

                                                      
    if (target === "FACTURA" && context === "/ventas/pagos") {
      const rows = await connection(req.user.nombre_usuario, async (cn) => {
        const result = await cn.execute(`
          SELECT
            f.ID_FACTURA AS ID,
            'Factura ' || f.SERIE || '-' || f.NUMERO ||
            ' · Cliente: ' || p.NOMBRES || ' ' || p.APELLIDOS ||
            ' · Saldo: ' || TO_CHAR(f.SALDO) AS ETIQUETA,
            p.NOMBRES || ' ' || p.APELLIDOS AS CLIENTE,
            f.SALDO AS SALDO
          FROM FACTURA f
          JOIN CLIENTE c ON c.ID_CLIENTE = f.ID_CLIENTE
          JOIN PERSONA p ON p.ID_PERSONA = c.ID_PERSONA
          WHERE f.ESTADO_REGISTRO = 'A'
            AND f.SALDO > 0
          ORDER BY f.ID_FACTURA DESC
          FETCH FIRST 300 ROWS ONLY
        `);
        return result.rows;
      });
      return res.json(await limited(req.user,target,rows));
    }
                                               
                                                              
    if (
      target === "EMPLEADO" &&
      context === "/ventas/notas-credito"
    ) {
      const rows = await connection(
        req.user.nombre_usuario,
        async (cn) => {
          const resultado = await cn.execute(`
            SELECT
              e.ID_EMPLEADO AS ID,
              p.NOMBRES || ' ' || p.APELLIDOS ||
              ' - ' || e.CODIGO_EMPLEADO AS ETIQUETA
            FROM EMPLEADO e
            JOIN PERSONA p
              ON p.ID_PERSONA = e.ID_PERSONA
            WHERE e.ESTADO_REGISTRO = 'A'
              AND p.ESTADO_REGISTRO = 'A'
            ORDER BY p.NOMBRES, p.APELLIDOS
            FETCH FIRST 300 ROWS ONLY
          `);

          return resultado.rows;
        }
      );

      return res.json(await limited(req.user,target,rows));
    }
if (privateLabel[target]) {
      const pk =
        target === "DETALLE_FACTURA"
          ? "ID_DETALLE_FACTURA"
          : "ID_" + target;

      const rows = await connection(
        req.user.nombre_usuario,
        async (cn) =>
          (
            await cn.execute(
              `SELECT ${pk} AS ID,
                      ${privateLabel[target]} AS ETIQUETA
               FROM ${target}
               WHERE ESTADO_REGISTRO = 'A'
               ORDER BY ${pk} DESC
               FETCH FIRST 300 ROWS ONLY`,
            )
          ).rows,
      );

      return res.json(await limited(req.user,target,rows));
    }

    return res.json(await limited(req.user,target,await C.options(req.user,target)));
  }),
);


};
