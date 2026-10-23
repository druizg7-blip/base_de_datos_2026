"use strict";
const {connection,oracledb}=require("../db");
const {error}=require("../security");
const {reports}=require("./config");
const {scope,clause}=require("../branch-scope");
function date(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)))
    throw error("Fecha inválida (AAAA-MM-DD)");
  return new Date(value + "T12:00:00Z");
}
async function data(user, key, params = {}) {
  const def = reports[key];
  if (!def) throw error("Reporte no disponible", 404);
  const desde = date(params.desde),
    hasta = date(params.hasta);
  if (desde && hasta && desde > hasta)
    throw error("La fecha inicial no puede ser posterior a la final");
  return connection(user.nombre_usuario, async (c) => {
    const alcance=await scope(c,user);
    if (!alcance.admin) {
      const binds={ desde, hasta };
      if(key==='productos')binds.top=Math.max(1,Math.min(100,Number(params.top)||15));
      const filtro=clause(alcance,'v.ID_SUCURSAL',binds);
      const fechas=" AND v.FECHA>=NVL(:desde,DATE '1900-01-01') AND v.FECHA<NVL(:hasta,DATE '2999-12-31')+1";
      let sql;
      if(key==='ventas-sucursal') sql=`SELECT v.SUCURSAL,v.DEPARTAMENTO,v.PAIS,
         COUNT(DISTINCT v.ID_FACTURA) FACTURAS,SUM(v.CANTIDAD) UNIDADES,
         SUM(v.SUBTOTAL) TOTAL_VENDIDO FROM V_VENTAS_BASE v WHERE 1=1 ${filtro} ${fechas}
         GROUP BY v.SUCURSAL,v.DEPARTAMENTO,v.PAIS ORDER BY TOTAL_VENDIDO DESC`;
      else if(key==='productos') sql=`SELECT v.CODIGO,v.PRODUCTO,v.CATEGORIA,v.MARCA,
         SUM(v.CANTIDAD) UNIDADES_VENDIDAS,SUM(v.SUBTOTAL) TOTAL_VENDIDO
         FROM V_VENTAS_BASE v WHERE 1=1 ${filtro} ${fechas}
         GROUP BY v.CODIGO,v.PRODUCTO,v.CATEGORIA,v.MARCA
         ORDER BY UNIDADES_VENDIDAS DESC FETCH FIRST :top ROWS ONLY`;
      else if(key==='clientes-region') sql=`SELECT v.REGION,v.PAIS,v.CLIENTE,
         COUNT(DISTINCT v.ID_FACTURA) FACTURAS,SUM(v.SUBTOTAL) TOTAL_COMPRADO
         FROM V_VENTAS_BASE v WHERE 1=1 ${filtro} ${fechas}
         GROUP BY v.REGION,v.PAIS,v.CLIENTE ORDER BY TOTAL_COMPRADO DESC`;
      else if(key==='vendedores-area') sql=`SELECT v.REGION,v.PAIS,v.VENDEDOR,
         COUNT(DISTINCT v.ID_FACTURA) FACTURAS,SUM(v.SUBTOTAL) TOTAL_VENDIDO
         FROM V_VENTAS_BASE v WHERE 1=1 ${filtro} ${fechas}
         GROUP BY v.REGION,v.PAIS,v.VENDEDOR ORDER BY TOTAL_VENDIDO DESC`;
      else if(key==='envios') {
        const ebinds={desde,hasta}; const ef=clause(alcance,'e.ID_SUCURSAL',ebinds);
        const r=await c.execute(`SELECT s.NOMBRE SUCURSAL,p.NOMBRES||' '||p.APELLIDOS RESPONSABLE,
          COUNT(*) ENVIOS,SUM(CASE WHEN e.ESTADO='ENTREGADO' THEN 1 ELSE 0 END) ENTREGADOS
          FROM ENVIO e JOIN SUCURSAL s ON s.ID_SUCURSAL=e.ID_SUCURSAL
          JOIN EMPLEADO em ON em.ID_EMPLEADO=e.ID_EMPLEADO JOIN PERSONA p ON p.ID_PERSONA=em.ID_PERSONA
          WHERE 1=1 ${ef} AND e.FECHA_ENVIO>=NVL(:desde,DATE '1900-01-01')
          AND e.FECHA_ENVIO<NVL(:hasta,DATE '2999-12-31')+1
          GROUP BY s.NOMBRE,p.NOMBRES,p.APELLIDOS ORDER BY ENVIOS DESC`,ebinds);
        return r.rows;
      }
      else if(key==='productos-menos') {
        const psbinds={}; const psf=clause(alcance,'ps.ID_SUCURSAL',psbinds);
        const r=await c.execute(`SELECT pr.CODIGO,pr.NOMBRE PRODUCTO,ca.NOMBRE CATEGORIA,ma.NOMBRE MARCA,
          NVL(SUM(df.CANTIDAD),0) UNIDADES_VENDIDAS,
          RANK() OVER(ORDER BY NVL(SUM(df.CANTIDAD),0) ASC) RANKING
          FROM PRODUCTO pr JOIN CATEGORIA ca ON ca.ID_CATEGORIA=pr.ID_CATEGORIA
          JOIN MARCA ma ON ma.ID_MARCA=pr.ID_MARCA
          JOIN PRODUCTO_SUCURSAL ps ON ps.ID_PRODUCTO=pr.ID_PRODUCTO ${psf.replace(/^ AND /,' AND ')}
          LEFT JOIN DETALLE_FACTURA df ON df.ID_PRODUCTO_SUCURSAL=ps.ID_PRODUCTO_SUCURSAL
          GROUP BY pr.CODIGO,pr.NOMBRE,ca.NOMBRE,ma.NOMBRE`,psbinds);
        return r.rows;
      }
      else if(key==='ventas-mensuales') sql=`SELECT TO_CHAR(v.FECHA,'YYYY-MM') MES,v.SUCURSAL,
          COUNT(DISTINCT v.ID_FACTURA) FACTURAS,SUM(v.SUBTOTAL) TOTAL_VENDIDO
          FROM V_VENTAS_BASE v WHERE 1=1 ${filtro} ${fechas}
          GROUP BY TO_CHAR(v.FECHA,'YYYY-MM'),v.SUCURSAL ORDER BY MES`;
      else if (key==='cxc'||key==='cxp') {
        const compra=key==='cxp', name=compra?'COMPRA':'FACTURA'; const campo=compra?'ID_COMPRA':'ID_FACTURA';
        const scopeBinds={};
        const r=await c.execute(`SELECT v.* FROM ${def.view} v
          JOIN ${name} doc ON doc.${campo}=v.${campo}
          JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=doc.ID_EMPLEADO_SUCURSAL
          WHERE 1=1 ${clause(alcance,'es.ID_SUCURSAL',scopeBinds)}
          FETCH FIRST 300 ROWS ONLY`,scopeBinds);
        return r.rows;
      }
      else throw error('Reporte sin filtro de sucursal: acceso restringido',403);
      const r=await c.execute(sql,binds);
      return r.rows;
    }
    if (def.view) {
      const r = await c.execute(
        `SELECT * FROM ${def.view} FETCH FIRST 300 ROWS ONLY`,
      );
      return r.rows;
    }
    const bind = {
      desde,
      hasta,
      cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
    };
    const args = [":desde", ":hasta"];
    if (def.top) {
      bind.top = Math.max(1, Math.min(100, Number(params.top) || 15));
      args.push(":top");
    }
    args.push(":cursor");
    const r = await c.execute(
      `BEGIN PKG_REPORTES.${def.proc}(${args.join(",")}); END;`,
      bind,
    );
    const cursor = r.outBinds.cursor;
    try {
      return await cursor.getRows(500);
    } finally {
      await cursor.close();
    }
  });
}

module.exports={date,data};
