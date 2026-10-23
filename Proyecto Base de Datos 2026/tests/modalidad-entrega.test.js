"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");
const rutasEnvio = require("../server/routes/envios");
const rutasTransacciones = require("../server/routes/transacciones");
const { createDocument } = require("../server/transactions/documents");

test("Factura nueva exige elegir modalidad, incluso si habrá cobro inmediato", async () => {
  await assert.rejects(
    createDocument({ nombre_usuario: "oscar" }, "facturas", {
      detalles: [{ cantidad: 1 }],
      condicion_pago: "CONTADO",
    }),
    (err) =>
      err.status === 400 &&
      /Selecciona si el cliente recibe en caja/.test(err.message),
  );
});

test("Factura y modalidad se guardan en una misma transacción", () => {
  const src = read("server/transactions/documents.js");
  assert.match(src, /const id = await call\(c, d.header, encabezado\)/);
  assert.match(src, /UPDATE FACTURA SET MODALIDAD_ENTREGA = :modalidad/);
  assert.match(src, /if \(entrega.rowsAffected !== 1\)/);
  assert.match(src, /\}, \{ write: true \}\)/);
});

test("Ventas muestra modalidades y el envío solo lista facturas permitidas", () => {
  const front = read("public/js/modules/ventas/page.js");
  const docs = read("public/js/modules/operaciones/documentos.js");
  const env = read("server/routes/envios.js");
  assert.match(docs, /id="modalidadEntregaFactura" required/);
  assert.match(front, /Entregado en caja/);
  assert.match(front, /Definir entrega/);
  assert.match(
    env,
    /f\.MODALIDAD_ENTREGA = 'ENVIO' OR f\.MODALIDAD_ENTREGA IS NULL/,
  );
  assert.match(env, /Los productos se entregaron en caja/);
});

test("Registro de envío rechaza factura ya entregada en caja, aunque se falsifique el POST", async () => {
  const rutas = new Map();
  const log = [];
  const router = {
    get() {},
    patch() {},
    post(path, ...h) {
      rutas.set(path, h.at(-1));
    },
  };
  const cn = {
    execute: async (sql, binds) => {
      log.push(sql);
      if (sql.includes("SELECT r.NOMBRE AS ROL"))
        return { rows: [{ ROL: "Administrador General", ID_EMPLEADO: 1 }] };
      if (sql.includes("FOR UPDATE OF f.ID_FACTURA"))
        return { rows: [{ ID_SUCURSAL: 2, MODALIDAD_ENTREGA: "CAJA" }] };
      throw new Error("Consulta inesperada:" + sql);
    },
  };
  const S = {
    permit: () => () => {},
    error: (msg, status) => Object.assign(new Error(msg), { status }),
  };
  rutasEnvio(router, {
    S,
    connection: async (_, cb) => cb(cn),
    oracledb: {},
    wrap: (fn) => fn,
  });
  const req = {
    user: { nombre_usuario: "admin", id_usuario: 1 },
    body: {
      id_factura: 5,
      id_empleado: 1,
      id_departamento: 2,
      direccion_entrega: "Sucursal",
      transporta_cliente: "S",
      detalles: [{ id_detalle_factura: 1, cantidad: 1 }],
    },
  };
  await assert.rejects(
    rutas.get("/envios/gestion/registrar")(req, {}),
    (e) => e.status === 409 && /entregaron en caja/.test(e.message),
  );
  assert.equal(
    log.some((x) => x.includes("INSERT INTO ENVIO")),
    false,
  );
});

test("La clasificación de facturas antiguas se permite una sola vez", async () => {
  const rutas = new Map(),
    queries = [];
  let escritura = false,
    result;
  const router = {
    get() {},
    post() {},
    patch(path, ...h) {
      rutas.set(path, h.at(-1));
    },
  };
  const cn = {
    execute: async (sql, binds) => {
      queries.push({ sql, binds });
      if (sql.includes("SELECT r.NOMBRE AS ROL"))
        return { rows: [{ ROL: "Administrador General", ID_EMPLEADO: 1 }] };
      if (sql.includes("FROM FACTURA f JOIN EMPLEADO_SUCURSAL es"))
        return {
          rows: [{ MODALIDAD_ENTREGA: null, ID_SUCURSAL: 2, ID_EMPLEADO: 1 }],
        };
      if (sql.includes("SELECT COUNT(*) AS TOTAL FROM ENVIO"))
        return { rows: [{ TOTAL: 0 }] };
      if (sql.includes("UPDATE FACTURA SET MODALIDAD_ENTREGA"))
        return { rowsAffected: 1 };
      throw new Error("Consulta inesperada:" + sql);
    },
  };
  const S = {
    permit: () => () => {},
    error: (msg, status) => Object.assign(new Error(msg), { status }),
  };
  rutasTransacciones(router, {
    S,
    connection: async (_, fn, config) => {
      escritura = config?.write === true;
      return fn(cn);
    },
    wrap: (fn) => fn,
  });
  const req = {
    params: { id: "35" },
    user: { nombre_usuario: "admin", id_usuario: 1 },
    body: { modalidad_entrega: "CAJA" },
  };
  const res = {
    json(x) {
      result = x;
    },
  };
  await rutas.get("/ventas/facturas/:id/modalidad")(req, res);
  assert.equal(result.modalidad_entrega, "CAJA");
  assert.equal(escritura, true);
  assert.ok(
    queries.some((x) => x.sql.includes("COUNT(*) AS TOTAL FROM ENVIO")),
  );
  assert.ok(
    queries.some((x) => x.sql.includes("UPDATE FACTURA SET MODALIDAD_ENTREGA")),
  );
});
