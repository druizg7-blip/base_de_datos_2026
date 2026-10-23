"use strict";
const {connection}=require("../db");
const {error}=require("../security");
const {scope,clause}=require("../branch-scope");
const queries = {
  facturas: {
    path: "/ventas/facturar",
    sql: "SELECT f.*,c.ID_PERSONA, p.NOMBRES||' '||p.APELLIDOS AS CLIENTE FROM FACTURA f JOIN CLIENTE c ON f.ID_CLIENTE=c.ID_CLIENTE JOIN PERSONA p ON p.ID_PERSONA=c.ID_PERSONA",
  },
  "detalle-factura": {
    path: "/ventas/facturar",
    sql: "SELECT * FROM DETALLE_FACTURA",
  },
  compras: { path: "/compras/registro", sql: "SELECT * FROM COMPRA" },
  "detalle-compra": {
    path: "/compras/registro",
    sql: "SELECT * FROM DETALLE_COMPRA",
  },
  "notas-credito": {
    path: "/ventas/notas-credito",
    sql: "SELECT * FROM NOTA_CREDITO",
  },
  "pagos-clientes": {
    path: "/ventas/pagos",
    sql: "SELECT * FROM PAGO_CLIENTE",
  },
  "cobros-pendientes": {
    path: "/ventas/pagos",
    sql: `SELECT f.ID_FACTURA AS ID, f.SERIE, f.NUMERO,
                 p.NOMBRES || ' ' || p.APELLIDOS AS TITULAR,
                 f.TOTAL, f.SALDO, f.ESTADO, f.CONDICION_PAGO, f.FECHA
          FROM FACTURA f
          JOIN CLIENTE cl ON cl.ID_CLIENTE = f.ID_CLIENTE
          JOIN PERSONA p ON p.ID_PERSONA = cl.ID_PERSONA
          WHERE f.ESTADO_REGISTRO = 'A' AND f.SALDO > 0
          ORDER BY f.ID_FACTURA DESC`,
  },
  "historial-cobros": {
    path: "/ventas/pagos",
    sql: `SELECT pc.ID_PAGO_CLIENTE AS ID, pc.MONTO, pc.FECHA,
                 mp.NOMBRE AS METODO, pc.REFERENCIA
          FROM PAGO_CLIENTE pc
          JOIN METODO_PAGO mp ON mp.ID_METODO_PAGO = pc.ID_METODO_PAGO`,
  },
  "pagos-proveedores": {
    path: "/compras/pagos",
    sql: "SELECT * FROM PAGO_PROVEEDOR",
  },
  "compras-pendientes": {
    path: "/compras/pagos",
    sql: `SELECT co.ID_COMPRA AS ID, co.NUMERO_DOCUMENTO AS NUMERO,
                 pr.NOMBRE AS TITULAR, co.TOTAL, co.SALDO, co.ESTADO,
                 co.CONDICION_PAGO, co.FECHA
          FROM COMPRA co
          JOIN PROVEEDOR pr ON pr.ID_PROVEEDOR = co.ID_PROVEEDOR
          WHERE co.ESTADO_REGISTRO = 'A' AND co.SALDO > 0
          ORDER BY co.ID_COMPRA DESC`,
  },
  "historial-pagos-proveedores": {
    path: "/compras/pagos",
    sql: `SELECT pp.ID_PAGO_PROVEEDOR AS ID, pp.MONTO, pp.FECHA,
                 mp.NOMBRE AS METODO, pp.REFERENCIA
          FROM PAGO_PROVEEDOR pp
          JOIN METODO_PAGO mp ON mp.ID_METODO_PAGO = pp.ID_METODO_PAGO`,
  },
  existencias: {
    path: "/inventario/existencias",
    sql: "SELECT * FROM V_EXISTENCIA_SUCURSAL",
  },
  kardex: { path: "/inventario/kardex", sql: "SELECT * FROM V_KARDEX" },
  "cuentas-cobrar": {
    path: "/reportes/cxc",
    sql: "SELECT * FROM V_CUENTAS_POR_COBRAR",
  },
  "cuentas-pagar": {
    path: "/reportes/cxp",
    sql: "SELECT * FROM V_CUENTAS_POR_PAGAR",
  },
  envios: { path: "/envios/gestion", sql: "SELECT * FROM ENVIO" },
  garantias: { path: "/ventas/garantias", sql: "SELECT * FROM GARANTIA" },
  devoluciones: {
    path: "/ventas/devoluciones",
    sql: "SELECT * FROM DEVOLUCION",
  },
  bitacora: {
    path: "/admin/bitacora",
    sql: "SELECT ID_BITACORA,FECHA_HORA,ID_USUARIO,TIPO_EVENTO,TABLA_AFECTADA,ID_REGISTRO,MODULO,DESCRIPCION FROM BITACORA",
  },
};
async function query(user, kind, q = {}) {
  const def = queries[kind];
  if (!def) throw error("Consulta desconocida", 404);

  const limit = Math.max(10, Math.min(300, Number(q.limite) || 100));
  const id = Number(q.id);
  const historial = {
    "historial-cobros": "pc.ID_FACTURA",
    "historial-pagos-proveedores": "pp.ID_COMPRA",
  }[kind];

  let filtro = "";
  if (historial) {
    if (!Number.isSafeInteger(id) || id < 1) {
      throw error("El documento del historial no es valido", 400);
    }
    filtro = ` WHERE ${historial} = :id ORDER BY FECHA DESC`;
  } else if (id > 0 && ["detalle-factura", "detalle-compra"].includes(kind)) {
    filtro = ` WHERE ID_${kind === "detalle-factura" ? "FACTURA" : "COMPRA"} = :id`;
  }

  return connection(user.nombre_usuario, async (c) => {
    const alcance=await scope(c,user);
    const binds=filtro.includes(':id')?{id}:{};
    const pk={facturas:'ID_FACTURA','detalle-factura':'ID_DETALLE_FACTURA',
      compras:'ID_COMPRA','detalle-compra':'ID_DETALLE_COMPRA','notas-credito':'ID_NOTA_CREDITO',
      'pagos-clientes':'ID_PAGO_CLIENTE','cobros-pendientes':'ID','historial-cobros':'ID',
      'pagos-proveedores':'ID_PAGO_PROVEEDOR','compras-pendientes':'ID',
      'historial-pagos-proveedores':'ID',existencias:'ID_SUCURSAL',
      kardex:'ID_MOVIMIENTO_INVENTARIO','cuentas-cobrar':'ID_FACTURA',
      'cuentas-pagar':'ID_COMPRA',envios:'ID_ENVIO',garantias:'ID_GARANTIA',
      devoluciones:'ID_DEVOLUCION'}[kind];
    let scoped='';
    if(!alcance.admin){
      if(!pk) throw error('Consulta sin filtro de sucursal: acceso restringido',403);
      if(kind==='existencias') scoped=clause(alcance,'q.ID_SUCURSAL',binds);
      else {
        const source={
          facturas:'FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          'detalle-factura':'DETALLE_FACTURA d JOIN FACTURA f ON f.ID_FACTURA=d.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          compras:'COMPRA co JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL',
          'detalle-compra':'DETALLE_COMPRA d JOIN COMPRA co ON co.ID_COMPRA=d.ID_COMPRA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL',
          'notas-credito':'NOTA_CREDITO n JOIN FACTURA f ON f.ID_FACTURA=n.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          'pagos-clientes':'PAGO_CLIENTE x JOIN FACTURA f ON f.ID_FACTURA=x.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          'cobros-pendientes':'FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          'historial-cobros':'PAGO_CLIENTE x JOIN FACTURA f ON f.ID_FACTURA=x.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          'pagos-proveedores':'PAGO_PROVEEDOR x JOIN COMPRA co ON co.ID_COMPRA=x.ID_COMPRA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL',
          'compras-pendientes':'COMPRA co JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL',
          'historial-pagos-proveedores':'PAGO_PROVEEDOR x JOIN COMPRA co ON co.ID_COMPRA=x.ID_COMPRA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL',
          kardex:'MOVIMIENTO_INVENTARIO x JOIN PRODUCTO_SUCURSAL ps ON ps.ID_PRODUCTO_SUCURSAL=x.ID_PRODUCTO_SUCURSAL',
          'cuentas-cobrar':'FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          'cuentas-pagar':'COMPRA co JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL',
          envios:'ENVIO x',
          garantias:'GARANTIA x JOIN FACTURA f ON f.ID_FACTURA=x.ID_FACTURA JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL',
          devoluciones:'DEVOLUCION x'
        }[kind];
        const field={facturas:'f.ID_FACTURA','detalle-factura':'d.ID_DETALLE_FACTURA',
          compras:'co.ID_COMPRA','detalle-compra':'d.ID_DETALLE_COMPRA',
          'notas-credito':'n.ID_NOTA_CREDITO','pagos-clientes':'x.ID_PAGO_CLIENTE',
          'cobros-pendientes':'f.ID_FACTURA','historial-cobros':'x.ID_PAGO_CLIENTE',
          'pagos-proveedores':'x.ID_PAGO_PROVEEDOR','compras-pendientes':'co.ID_COMPRA',
          'historial-pagos-proveedores':'x.ID_PAGO_PROVEEDOR',kardex:'x.ID_MOVIMIENTO_INVENTARIO',
          'cuentas-cobrar':'f.ID_FACTURA','cuentas-pagar':'co.ID_COMPRA',
          envios:'x.ID_ENVIO',garantias:'x.ID_GARANTIA',devoluciones:'x.ID_DEVOLUCION'}[kind];
        const branch=['kardex'].includes(kind)?'ps.ID_SUCURSAL':
          ['envios','devoluciones'].includes(kind)?'x.ID_SUCURSAL':'es.ID_SUCURSAL';
        scoped=` AND EXISTS (SELECT 1 FROM ${source} WHERE ${field}=q.${pk} ${clause(alcance,branch,binds)})`;
      }
    }
    const orden=kind==='kardex' ? ' ORDER BY q.ID_MOVIMIENTO_INVENTARIO DESC' : '';
    const sql=`SELECT * FROM (${def.sql + filtro}) q WHERE 1=1 ${scoped}${orden} FETCH FIRST ${limit} ROWS ONLY`;
    const r=await c.execute(sql,binds);
    return r.rows;
  });
}

module.exports={queries,query};
