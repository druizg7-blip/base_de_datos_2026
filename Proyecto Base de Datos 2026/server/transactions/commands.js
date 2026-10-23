"use strict";
const {oracledb}=require("../db");
const {error}=require("../security");
const commands = {
  "venta-nueva": {
    path: "/ventas/facturar",
    pkg: "PKG_VENTAS",
    proc: "NUEVA_FACTURA",
    returns: true,
    args: ["id_cliente", "id_empleado_sucursal", "condicion_pago", "serie"],
  },
  "venta-detalle": {
    path: "/ventas/facturar",
    pkg: "PKG_VENTAS",
    proc: "AGREGAR_DETALLE",
    args: ["id_factura", "id_producto_sucursal", "cantidad", "descuento"],
  },
  "venta-pago": {
    path: "/ventas/pagos",
    pkg: "PKG_VENTAS",
    proc: "REGISTRAR_PAGO",
    args: [
      "id_factura",
      "id_empleado_sucursal",
      "id_metodo_pago",
      "monto",
      "referencia",
    ],
  },
  "nota-nueva": {
    path: "/ventas/notas-credito",
    pkg: "PKG_VENTAS",
    proc: "NUEVA_NOTA_CREDITO",
    returns: true,
    args: ["id_factura", "id_empleado", "motivo"],
  },
  "nota-detalle": {
    path: "/ventas/notas-credito",
    pkg: "PKG_VENTAS",
    proc: "AGREGAR_DETALLE_NC",
    args: ["id_nota_credito", "id_detalle_factura", "cantidad"],
  },
  "compra-nueva": {
    path: "/compras/registro",
    pkg: "PKG_COMPRAS",
    proc: "NUEVA_COMPRA",
    returns: true,
    args: [
      "id_empleado_sucursal",
      "id_proveedor",
      "numero_documento",
      "condicion_pago",
    ],
  },
  "compra-detalle": {
    path: "/compras/registro",
    pkg: "PKG_COMPRAS",
    proc: "AGREGAR_DETALLE",
    args: ["id_compra", "id_producto_sucursal", "cantidad", "costo_unitario"],
  },
  "compra-pago": {
    path: "/compras/pagos",
    pkg: "PKG_COMPRAS",
    proc: "REGISTRAR_PAGO",
    args: [
      "id_compra",
      "id_empleado_sucursal",
      "id_metodo_pago",
      "monto",
      "referencia",
    ],
  },
  "inventario-baja": {
    path: "/inventario/bajas",
    pkg: "PKG_INVENTARIO",
    proc: "REGISTRAR_BAJA",
    args: ["id_producto_sucursal", "cantidad", "id_motivo_baja", "referencia"],
  },
  "inventario-ajuste": {
    path: "/inventario/bajas",
    pkg: "PKG_INVENTARIO",
    proc: "AJUSTE_POSITIVO",
    args: ["id_producto_sucursal", "cantidad", "referencia"],
  },
};
const stringArgs = new Set([
  "condicion_pago",
  "serie",
  "numero_documento",
  "referencia",
  "motivo",
]);
function numeric(k, val) {
  const n = Number(val);
  if (!Number.isFinite(n) || val === "" || val === null || val === undefined)
    throw error(`Valor numérico obligatorio: ${k}`);
  if (k === "cantidad" && n <= 0)
    throw error("Cantidad debe ser mayor que cero");
  if (["monto", "costo_unitario", "descuento"].includes(k) && n < 0)
    throw error(`${k} no puede ser negativo`);
  return n;
}
async function call(c, key, raw) {
  const def = commands[key];
  if (!def) throw error("Operación desconocida", 404);
  const binds = {};
  const parts = [];
  for (const [i, arg] of def.args.entries()) {
    let value = raw?.[arg];
    if (
      (value === "" || value === undefined || value === null) &&
      ["descuento", "serie", "referencia"].includes(arg)
    )
      value = arg === "descuento" ? 0 : arg === "serie" ? "A001" : null;
    if (value === undefined || (value === null && arg !== "referencia"))
      throw error(`Falta el campo ${arg}`);
    if (stringArgs.has(arg)) {
      if (value !== null) {
        value = String(value).trim();
        if (!value) throw error(`Campo obligatorio: ${arg}`);
        if (value.length > 200) throw error(`${arg}: texto demasiado largo`);
        if (
          arg === "condicion_pago" &&
          !["CONTADO", "CREDITO"].includes(value.toUpperCase())
        )
          throw error("Condición CONTADO o CREDITO");
      }
    } else value = numeric(arg, value);
    binds["a" + i] = value;
    parts.push(":a" + i);
  }
  if (def.returns)
    binds.result = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };
  const sql = `BEGIN ${def.returns ? ":result := " : ""}${def.pkg}.${def.proc}(${parts.join(",")}); END;`;
  const r = await c.execute(sql, binds);
  return def.returns ? r.outBinds.result : null;
}

module.exports={commands,numeric,call};
