"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  rolesContratables,
  comprobarRolContratable,
} = require("../server/staff/asignacion-roles");
const registrarRutas = require("../server/routes/envios");

test("Un operador no administrador no obtiene roles privilegiados en el selector", async () => {
  const log = [];
  const cn = {
    execute: async (sql) => {
      log.push(sql);
      return { rows: [{ ID: 2, NOMBRE: "Cajero" }] };
    },
  };
  const out = await rolesContratables(cn, false);
  assert.equal(out[0].NOMBRE, "Cajero");
  assert.match(log[0], /NOT EXISTS/);
  assert.match(log[0], /ADMINISTRADOR GENERAL/);
  assert.match(log[0], /\/admin\/usuarios/);
  assert.match(log[0], /\/admin\/roles/);
  log.length = 0;
  await rolesContratables(cn, true);
  assert.doesNotMatch(log[0], /NOT EXISTS/);
});

test("La validación de roles también rechaza una petición falsificada por API", async () => {
  const cn = {
    execute: async (sql) => ({
      rows: sql.includes("NOT EXISTS") ? [] : [{ ID: 1 }],
    }),
  };
  await assert.rejects(
    comprobarRolContratable(cn, 1, false),
    (e) => e.status === 403,
  );
  await assert.doesNotReject(comprobarRolContratable(cn, 1, true));
});

function entorno(transporta) {
  const routes = new Map(),
    log = [];
  const router = {
    get() {},
    patch() {},
    post(path, ...handlers) {
      routes.set(path, handlers.at(-1));
    },
  };
  const cn = {
    execute: async (sql, binds = {}) => {
      log.push({ sql, binds });
      if (sql.includes("FROM USUARIO u JOIN ROL r"))
        return { rows: [{ ROL: "Administrador General", ID_EMPLEADO: 1 }] };
      if (sql.includes("FOR UPDATE OF f.ID_FACTURA"))
        return { rows: [{ ID_SUCURSAL: 2 }] };
      if (
        sql.includes("COUNT(*) AS TOTAL") &&
        sql.includes("FROM EMPLEADO_SUCURSAL")
      )
        return { rows: [{ TOTAL: 1 }] };
      if (sql.includes("COUNT(*) AS TOTAL") && sql.includes("FROM VEHICULO"))
        return { rows: [{ TOTAL: 1 }] };
      if (sql.includes("UPPER(pu.NOMBRE)='PILOTO'"))
        return { rows: [{ NOMBRE: "Piloto Prueba" }] };
      if (sql.includes("FROM DEPARTAMENTO")) return { rows: [{ TOTAL: 1 }] };
      if (sql.includes("df.ID_DETALLE_FACTURA AS ID"))
        return { rows: [{ ID: 10, DISPONIBLE: 3 }] };
      if (sql.includes("INSERT INTO ENVIO"))
        return { outBinds: { id: [99] }, rowsAffected: 1 };
      if (sql.includes("INSERT INTO DETALLE_ENVIO")) return { rowsAffected: 1 };
      throw Error("SQL no simulado: " + sql.slice(0, 120));
    },
  };
  const ctx = {
    S: {
      permit: () => () => {},
      error: (msg, status) => Object.assign(new Error(msg), { status }),
    },
    connection: async (_, cb) => cb(cn),
    oracledb: { BIND_OUT: 3003, NUMBER: 2 },
    wrap: (fn) => fn,
  };
  registrarRutas(router, ctx);
  const req = {
    user: { id_usuario: 1, nombre_usuario: "admin" },
    body: {
      id_factura: 1,
      id_empleado: 2,
      id_departamento: 4,
      id_vehiculo: transporta === "S" ? null : 3,
      id_piloto: transporta === "S" ? null : 6,
      direccion_entrega: "Mostrador de sucursal",
      transporta_cliente: transporta,
      detalles: [{ id_detalle_factura: 10, cantidad: 1 }],
    },
  };
  let result = null;
  const res = {
    status(s) {
      assert.equal(s, 201);
      return this;
    },
    json(obj) {
      result = obj;
    },
  };
  return {
    handler: routes.get("/envios/gestion/registrar"),
    req,
    res,
    log,
    result: () => result,
  };
}

test("Retiro por cliente sin vehículo ni piloto: deja ENTREGADO y fecha registrada", async () => {
  const e = entorno("S");
  await e.handler(e.req, e.res);
  assert.equal(e.result().id_envio, 99);
  assert.equal(
    e.log.some((x) => x.sql.includes("FROM VEHICULO")),
    false,
  );
  assert.equal(
    e.log.some((x) => x.sql.includes("UPPER(pu.NOMBRE)='PILOTO'")),
    false,
  );
  const insert = e.log.find((x) => x.sql.includes("INSERT INTO ENVIO"));
  assert.ok(insert);
  assert.equal(insert.binds.vehiculo, null);
  assert.equal(insert.binds.id_piloto, null);
  assert.equal(insert.binds.piloto, null);
  assert.equal(insert.binds.estado, "ENTREGADO");
  assert.equal(insert.binds.retiro, "S");
  assert.match(
    insert.sql,
    /CASE WHEN :retiro = 'S' THEN SYSDATE ELSE NULL END/,
  );
});

test("Envío de la ferretería sigue exigiendo vehículo y piloto válidos", async () => {
  const e = entorno("N");
  await e.handler(e.req, e.res);
  assert.equal(
    e.log.some((x) => x.sql.includes("FROM VEHICULO")),
    true,
  );
  assert.equal(
    e.log.some((x) => x.sql.includes("UPPER(pu.NOMBRE)='PILOTO'")),
    true,
  );
  const insert = e.log.find((x) => x.sql.includes("INSERT INTO ENVIO"));
  assert.equal(insert.binds.estado, "PENDIENTE");
  assert.equal(insert.binds.piloto, "Piloto Prueba");
  assert.equal(insert.binds.id_piloto, 6);
});
