"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  validateHire,
  differenceInYears,
  parseDate,
} = require("../server/staff/validacion");
test("Contratación rechaza menores de 18 en fecha de ingreso, incluso antes del cumpleaños", () => {
  assert.throws(
    () => validateHire("2008-10-23", "2026-10-22", "2026-10-22"),
    /18 años/,
  );
  assert.equal(validateHire("2008-10-22", "2026-10-22", "2026-10-22"), 18);
});
test("Contratación rechaza fechas futuras o imposibles", () => {
  assert.throws(() => validateHire("2027-01-01", "2026-10-22", "2026-10-22"));
  assert.throws(() => validateHire("2000-02-30", "2026-10-22", "2026-10-22"));
  assert.throws(() => validateHire("2001-10-22", "2026-10-23", "2026-10-22"));
});
test("Las rutas de personal verifican permisos y no ejecutan borrados físicos", () => {
  const src = fs.readFileSync(
    path.join(__dirname, "../server/routes/empleados.js"),
    "utf8",
  );
  assert.match(src, /S\.permit\(ruta, "I"\)/);
  assert.match(src, /S\.permit\(ruta, "D"\)/);
  assert.match(src, /ESTADO_REGISTRO='I'/);
  assert.doesNotMatch(src, /DELETE\s+FROM\s+(?:EMPLEADO|PERSONA|USUARIO)/i);
  assert.match(src, /\{ write:true \}/);
});
