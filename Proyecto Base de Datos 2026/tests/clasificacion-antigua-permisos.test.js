"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const registrarRutas = require("../server/routes/transacciones");

const error = (msg, status = 400) => Object.assign(new Error(msg), { status });

function escenario({
  admin = false,
  sucursalFactura = 6,
  sucursalesPermitidas = [6],
  modalidadActual = null,
  envios = 0,
  clasificacion = "CAJA",
} = {}) {
  const rutas = new Map();
  const permisos = [];
  const llamadas = [];
  let guardado = false;
  const router = {
    get() {},
    post() {},
    patch(path, ...handlers) {
      rutas.set(path, handlers);
    },
  };
  const S = {
    permit: (ruta, accion) => {
      permisos.push({ ruta, accion });
      return () => {};
    },
    error,
  };
  const c = {
    execute: async (sql, binds) => {
      llamadas.push({ sql, binds });
      if (sql.includes("SELECT r.NOMBRE AS ROL"))
        return {
          rows: [
            {
              ROL: admin ? "Administrador General" : "Cajero",
              ID_EMPLEADO: 14,
            },
          ],
        };
      if (sql.includes("SELECT DISTINCT es.ID_SUCURSAL AS ID"))
        return { rows: sucursalesPermitidas.map((ID) => ({ ID })) };
      if (sql.includes("FROM FACTURA f JOIN EMPLEADO_SUCURSAL es")) {
        return {
          rows: [
            {
              MODALIDAD_ENTREGA: modalidadActual,
              ID_SUCURSAL: sucursalFactura,
              ID_EMPLEADO: 999,
            },
          ],
        };
      }
      if (sql.includes("SELECT COUNT(*) AS TOTAL FROM ENVIO"))
        return { rows: [{ TOTAL: envios }] };
      if (sql.includes("UPDATE FACTURA SET MODALIDAD_ENTREGA")) {
        guardado = true;
        return { rowsAffected: 1 };
      }
      throw Error(`Consulta no simulada: ${sql}`);
    },
  };
  registrarRutas(router, {
    S,
    connection: async (_, cb) => cb(c),
    wrap: (x) => x,
  });
  const handlers = rutas.get("/ventas/facturas/:id/modalidad");
  const req = {
    params: { id: "35" },
    user: { nombre_usuario: "oscar", id_usuario: 70 },
    body: { modalidad_entrega: clasificacion },
  };
  let resultado;
  const res = { json: (x) => (resultado = x) };
  return {
    permisos,
    llamadas,
    req,
    res,
    get guardado() {
      return guardado;
    },
    get resultado() {
      return resultado;
    },
    accion: () => handlers.at(-1)(req, res),
  };
}

test("Cajero con permiso y de la misma sucursal puede clasificar factura antigua aunque ID_EMPLEADO sea diferente", async () => {
  const t = escenario();
  assert.deepEqual(t.permisos[0], { ruta: "/ventas/facturar", accion: "I" });
  await t.accion();
  assert.equal(t.guardado, true);
  assert.equal(t.resultado.modalidad_entrega, "CAJA");
  assert.equal(
    t.llamadas.some((q) => /SELECT ID_EMPLEADO FROM USUARIO/.test(q.sql)),
    false,
  );
});

test("Cajero NO puede clasificar factura de otra sucursal", async () => {
  const t = escenario({ sucursalFactura: 9, sucursalesPermitidas: [6] });
  await assert.rejects(
    t.accion(),
    (e) => e.status === 403 && /sucursal/.test(e.message),
  );
  assert.equal(t.guardado, false);
});

test("Administrador conserva alcance para clasificar facturas de otras sucursales", async () => {
  const t = escenario({
    admin: true,
    sucursalFactura: 9,
    sucursalesPermitidas: [],
  });
  await t.accion();
  assert.equal(t.guardado, true);
});

test("Una factura ya clasificada no admite otra clasificación", async () => {
  const t = escenario({ modalidadActual: "CAJA", clasificacion: "ENVIO" });
  await assert.rejects(
    t.accion(),
    (e) => e.status === 409 && /ya tiene una modalidad/.test(e.message),
  );
  assert.equal(t.guardado, false);
});

test("Una factura con envíos no se puede declarar entregada en caja", async () => {
  const t = escenario({ envios: 1 });
  await assert.rejects(
    t.accion(),
    (e) => e.status === 409 && /despachos registrados/.test(e.message),
  );
  assert.equal(t.guardado, false);
});

test("Clasificar como ENVIO no altera inventario ni pago", async () => {
  const t = escenario({ clasificacion: "ENVIO", envios: 1 });
  await t.accion();
  assert.equal(t.guardado, true);
  assert.equal(t.llamadas.filter((q) => /^\s*UPDATE\b/i.test(q.sql)).length, 1);
  assert.match(
    t.llamadas.filter((q) => /^\s*UPDATE\b/i.test(q.sql))[0].sql,
    /UPDATE FACTURA SET MODALIDAD_ENTREGA/,
  );
});
