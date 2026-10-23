"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
test("La lista de facturas excluye las completamente despachadas", () => {
  const source = read("server/routes/envios.js");
  assert.match(source, /const fgPendienteFactura = alias/);
  assert.match(source, /fgPendienteFactura\("df"\)\} > 0/);
  assert.match(source, /fgPendienteFactura\("df"\)\} AS DISPONIBLE/);
  assert.match(source, /FROM DETALLE_ENVIO de/);
  assert.match(source, /FROM DETALLE_NOTA_CREDITO nc/);
  assert.match(source, /FOR UPDATE OF f\.ID_FACTURA/);
});
test("La pantalla de envios recarga las facturas despues de crear uno", () => {
  const source = read("public/js/modules/envios/page.js");
  assert.match(source, /await enviosGestion\(\)/);
  assert.match(source, /factura pendiente/);
});
test("El Kardex lista movimientos recientes con filtros y saldos", () => {
  const q = read("server/transactions/queries.js");
  const nav = read("public/js/core/navigation.js");
  const ui = read("public/js/modules/inventario/page.js");
  assert.match(q, /ORDER BY q\.ID_MOVIMIENTO_INVENTARIO DESC/);
  assert.match(nav, /await kardexPage\(\)/);
  assert.match(ui, /kSucursal/);
  assert.match(ui, /kTipo/);
  assert.match(ui, /EXISTENCIA_NUEVA/);
});
