"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { scope, clause, assertBranch } = require("../server/branch-scope");
const {
  checkDocument,
  checkCommand,
} = require("../server/transactions/branch-guard");
const user = { id_usuario: 5, nombre_usuario: "mariana" };
const fake = () => ({
  async execute(sql, binds) {
    if (sql.includes("FROM USUARIO u JOIN ROL r"))
      return { rows: [{ ROL: "Cajero", ID_EMPLEADO: 5 }] };
    if (sql.includes("SELECT DISTINCT es.ID_SUCURSAL"))
      return { rows: [{ ID: 1 }] };
    if (sql.includes("FROM EMPLEADO_SUCURSAL WHERE ID_EMPLEADO_SUCURSAL="))
      return { rows: [{ ID: Number(binds.id) === 999 ? 4 : 1 }] };
    if (sql.includes("FROM PRODUCTO_SUCURSAL WHERE ID_PRODUCTO_SUCURSAL="))
      return { rows: [{ ID: Number(binds.id) === 444 ? 4 : 1 }] };
    if (sql.includes("FROM FACTURA f JOIN EMPLEADO_SUCURSAL"))
      return { rows: [{ ID: Number(binds.id) === 3 ? 4 : 1 }] };
    return { rows: [] };
  },
});
test("Sucursales del usuario se consultan en Oracle y no vienen del navegador", async () => {
  const s = await scope(fake(), user);
  assert.deepEqual(s, { admin: false, ids: [1] });
  const b = {};
  const sql = clause(s, "f.ID_SUCURSAL", b);
  assert.match(sql, /f.ID_SUCURSAL IN/);
  assert.deepEqual(b, { sc_0: 1 });
  assert.throws(() => assertBranch(s, 4), { status: 403 });
  assert.doesNotThrow(() => assertBranch(s, 1));
});
test("Venta ajena queda bloqueada antes de hacer INSERT", async () => {
  await assert.rejects(
    () =>
      checkDocument(fake(), user, "facturas", {
        id_empleado_sucursal: 999,
        detalles: [{ id_producto_sucursal: 111 }],
      }),
    (e) => e.status === 403,
  );
  await assert.rejects(
    () =>
      checkDocument(fake(), user, "facturas", {
        id_empleado_sucursal: 1,
        detalles: [{ id_producto_sucursal: 444 }],
      }),
    (e) => e.status === 403,
  );
});
test("Ajustes y cobros ajenos quedan bloqueados", async () => {
  await assert.rejects(
    () =>
      checkCommand(fake(), user, "inventario-baja", {
        id_producto_sucursal: 444,
      }),
    (e) => e.status === 403,
  );
  await assert.rejects(
    () =>
      checkCommand(fake(), user, "venta-pago", {
        id_factura: 3,
        id_empleado_sucursal: 1,
      }),
    (e) => e.status === 403,
  );
});
