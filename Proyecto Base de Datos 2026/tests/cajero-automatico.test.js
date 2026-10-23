"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  sellerContext,
  sameSeller,
  assertCountryPhone,
} = require("../server/transactions/seller-context");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const usuario = { id_usuario: 14, nombre_usuario: "oscar" };
function conexion(filas) {
  return {
    execute: async (sql, binds) => {
      assert.match(sql, /USUARIO u/);
      assert.match(sql, /u.ID_USUARIO=:id_usuario/);
      assert.match(sql, /es.FECHA_FIN IS NULL/);
      assert.equal(binds.id_usuario, 14);
      return { rows: filas };
    },
  };
}
const tegucigalpa = {
  ID_EMPLEADO_SUCURSAL: 22,
  ID_SUCURSAL: 5,
  EMPLEADO: "Oscar Mejia",
  SUCURSAL: "Sucursal Tegucigalpa",
  PAIS_ISO: "HN",
};

test("Cajero procede de la cuenta y la sucursal en Oracle; Honduras usa +504", async () => {
  const caja = await sellerContext(conexion([tegucigalpa]), usuario);
  assert.deepEqual(caja, {
    ID_EMPLEADO_SUCURSAL: 22,
    ID_SUCURSAL: 5,
    ETIQUETA: "Oscar Mejia · Sucursal Tegucigalpa",
    CODIGO_TELEFONO: "504",
    PAIS_ISO: "HN",
  });
  assert.equal(sameSeller({ detalles: [] }, caja).id_empleado_sucursal, 22);
  assert.equal(
    sameSeller({ id_empleado_sucursal: "22" }, caja).id_empleado_sucursal,
    22,
  );
  assert.throws(
    () => sameSeller({ id_empleado_sucursal: 23 }, caja),
    (e) => e.status === 403,
  );
  assert.throws(
    () => assertCountryPhone("+502 4578-1919", caja),
    (e) => e.status === 400,
  );
  assert.doesNotThrow(() => assertCountryPhone("+504 2200-3333", caja));
  assert.doesNotThrow(() => assertCountryPhone(null, caja));
});
test("Se niega facturar sin empleado o con varias asignaciones activas", async () => {
  await assert.rejects(
    sellerContext(conexion([]), usuario),
    (e) => e.status === 403,
  );
  await assert.rejects(
    sellerContext(conexion([tegucigalpa, tegucigalpa]), usuario),
    (e) => e.status === 409,
  );
});
test("Teléfono sigue el país real GT/SV/HN, sin prefijo elegido por el navegador", async () => {
  for (const [pais, codigo] of [
    ["GT", "502"],
    ["SV", "503"],
    ["HN", "504"],
  ]) {
    const c = await sellerContext(
      conexion([{ ...tegucigalpa, PAIS_ISO: pais }]),
      usuario,
    );
    assert.equal(c.CODIGO_TELEFONO, codigo);
  }
  const formulario = read("public/js/modules/operaciones/documentos.js");
  const tel = read("public/js/core/telefono.js");
  assert.match(formulario, /cajero.CODIGO_TELEFONO/);
  assert.match(formulario, /api\("\/ventas\/mi-caja"\)/);
  assert.match(tel, /filter\(\(\[c\]\)=>!fijo \|\| c===fijo\)/);
});
test("Ventas y abonos no permiten escoger otro cajero y verifican el usuario también en servidor", () => {
  const documentos = read("server/transactions/documents.js");
  const operaciones = read("server/transactions/operations.js");
  const pantalla = read("public/js/modules/ventas/cobros.js");
  assert.match(
    documentos,
    /kind === "facturas" \? await sellerContext\(c,user\)/,
  );
  assert.match(documentos, /datos = caja \? sameSeller\(body,caja\)/);
  assert.match(documentos, /datos.pago = sameSeller\(datos.pago,caja\)/);
  assert.match(
    operaciones,
    /key === "venta-pago" \? sameSeller\(payload,await sellerContext\(c,user\)\)/,
  );
  assert.match(pantalla, /api\("\/ventas\/mi-caja"\)/);
  assert.doesNotMatch(pantalla, /options\("EMPLEADO_SUCURSAL", ruta\)/);
});
