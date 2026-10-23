"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { app } = require("../index");

test("Express sirve frontend modular y deniega APIs sin JWT, sin conectar Oracle", async (t) => {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const origin = "http://127.0.0.1:" + server.address().port;
  for (const file of [
    "/",
    "/app.js",
    "/js/core/state.js",
    "/js/modules/ventas/page.js",
    "/css/base.css",
  ]) {
    const r = await fetch(origin + file);
    assert.equal(r.status, 200, file);
    const body = await r.text();
    assert.ok(body.length > 50, file);
  }
  for (const uri of [
    "/api/seguridad/usuarios",
    "/api/envios/gestion/datos",
    "/api/catalogos/CATEGORIA",
    "/api/reportes/ventas-sucursal",
  ]) {
    const r = await fetch(origin + uri);
    assert.equal(r.status, 401, uri);
  }
});
