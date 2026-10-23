"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("Las rutas críticas están separadas por módulo", () => {
  for (const filename of [
    "auth-login",
    "auth-private",
    "catalogos",
    "opciones",
    "transacciones",
    "dashboard",
    "consultas",
    "reportes",
    "diagnostico",
    "envios",
    "seguridad",
  ]) {
    assert.ok(
      fs.existsSync(path.join(root, "server/routes", filename + ".js")),
      filename,
    );
  }
  const index = read("server/routes/index.js");
  assert.ok(
    index.indexOf('require("./auth-login")') <
      index.indexOf("router.use(S.authenticate)"),
  );
  assert.match(index, /require\("\.\/envios"\)/);
});

test("No es posible registrar documentos por las rutas de operaciones simples", () => {
  const s = read("server/routes/transacciones.js");
  assert.match(s, /standaloneCommands = new Set/);
  assert.match(s, /if \(!standaloneCommands.has\(req.params.command\)\)/);
  assert.match(s, /"\/transacciones\/documentos\/:kind"/);
  const docs = read("server/transactions/documents.js");
  assert.match(docs, /async function createDocument/);
  assert.match(docs, /\{ write: true \}/);
});

test("Gestión de Usuarios y otras rutas administrativas siguen con permiso Oracle", () => {
  const s = read("server/routes/seguridad.js");
  assert.match(s, /S.permit\("\/admin\/usuarios", "C"\)/);
  assert.match(s, /S.permit\("\/admin\/roles", "C"\)/);
  assert.match(s, /S.permit\("\/admin\/bitacora", "C"\)/);
  const cat = read("server/routes/catalogos.js");
  assert.match(cat, /S.permit\(catalogPath, "I"\)/);
  assert.match(cat, /S.permit\(catalogPath, "D"\)/);
  assert.match(read("server/security.js"), /PKG_SEGURIDAD.TIENE_PERMISO/);
});

test("Rutas de envío vinculadas a factura y protegidas por permiso", () => {
  const s = read("server/routes/envios.js");
  for (const name of [
    "/envios/gestion/datos",
    "/envios/gestion/factura/:id",
    "/envios/gestion/registrar",
    "/envios/gestion/:id/estado",
  ])
    assert.ok(s.includes(name), name);
  assert.match(s, /FOR UPDATE OF f.ID_FACTURA/);
});
