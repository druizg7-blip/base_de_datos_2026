"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
test("Identificador de usuario en la sesión Oracle se configura y se limpia", () => {
  const db = read("server/db.js");
  assert.match(db, /DBMS_SESSION\.SET_IDENTIFIER\(:u\)/);
  assert.match(db, /DBMS_SESSION\.CLEAR_IDENTIFIER/);
});
test("Bitácora consulta un único usuario de creación", () => {
  const s = read("server/routes/seguridad.js");
  assert.match(s, /b\.USUARIO_CREACION/);
  assert.doesNotMatch(s, /b\.USUARIO_APLICACION|b\.USUARIO_ORACLE/);
  assert.match(s, /S\.permit\("\/admin\/bitacora", "C"\)/);
});
test("Bitácora presenta una sola columna y oculta secretos", () => {
  const s = read("public/js/modules/seguridad/consultas.js");
  assert.match(s, /<th>Usuario creación<\/th>/);
  assert.doesNotMatch(
    s,
    /<th>Usuario Oracle<\/th>|<th>Usuario aplicación<\/th>/,
  );
  assert.match(s, /ocultar=/);
});
