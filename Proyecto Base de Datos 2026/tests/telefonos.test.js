"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizarTelefono, validarPaisTelefono } = require("../server/phone");

test("Admite formatos y códigos de los tres países", () => {
  assert.equal(normalizarTelefono("+502 4578-1919"), "+502 4578-1919");
  assert.equal(normalizarTelefono("+503 25003333"), "+503 2500-3333");
  assert.equal(normalizarTelefono("+504 2200-4444"), "+504 2200-4444");
  assert.equal(normalizarTelefono(""), null);
});
test("Rechaza teléfonos incompletos, sin prefijo o con serie ajena", () => {
  for (const numero of [
    "45781919",
    "+502 1234-5678",
    "+503 4578-1919",
    "+504 6012-3456",
    "+504 123-4567",
    "+505 8888-8888",
    "+502 4578-19191",
  ]) {
    assert.throws(
      () => normalizarTelefono(numero),
      /invalido|inválido|Elegí/i,
      numero,
    );
  }
});
test("Sucursal debe usar prefijo del país de su departamento", async () => {
  const cn = { execute: async () => ({ rows: [{ ISO: "GT" }] }) };
  await validarPaisTelefono(cn, "SUCURSAL", {
    TELEFONO: "+502 4578-1919",
    ID_DEPARTAMENTO: 3,
  });
  await assert.rejects(
    validarPaisTelefono(cn, "SUCURSAL", {
      TELEFONO: "+503 2500-3333",
      ID_DEPARTAMENTO: 3,
    }),
    /no corresponde/i,
  );
});
test("Proveedor debe respetar país; edición sin teléfono consulta el existente", async () => {
  const cn = {
    execute: async (sql) =>
      sql.includes("FROM PROVEEDOR WHERE")
        ? { rows: [{ FK: 6, TELEFONO: "+504 2200-4444" }] }
        : { rows: [{ ISO: "HN" }] },
  };
  await validarPaisTelefono(cn, "PROVEEDOR", { ID_PAIS: 6 }, 14);
  await assert.rejects(
    validarPaisTelefono(cn, "PROVEEDOR", {
      TELEFONO: "+502 4578-1919",
      ID_PAIS: 6,
    }),
    /no corresponde/i,
  );
});
