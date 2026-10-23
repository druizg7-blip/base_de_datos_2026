"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { puestoParaRol } = require("../server/staff/roles");

function cnFake({ presente = false, activo = true } = {}) {
  const log = [];
  const cn = {
    execute: async (sql, binds = {}) => {
      log.push({ sql, binds });
      if (sql.includes("FROM ROL") && sql.includes("FOR UPDATE"))
        return { rows: activo ? [{ ID: 3, NOMBRE: "Gerente" }] : [] };
      if (sql.includes("FROM PUESTO") && sql.includes("FETCH FIRST"))
        return { rows: presente ? [{ ID: 12 }] : [] };
      if (sql.includes("SEQ_PUESTO.NEXTVAL")) return { rows: [{ ID: 14 }] };
      return { rows: [], rowsAffected: 1 };
    },
  };
  return { cn, log };
}

test("Usa rol Oracle como único nombre del cargo, sin puesto duplicado", async () => {
  const { cn, log } = cnFake({ presente: true });
  const result = await puestoParaRol(cn, 3, "admin");
  assert.deepEqual(result, {
    idRol: 3,
    idPuesto: 12,
    nombre: "Gerente",
    creado: false,
  });
  assert.equal(
    log.filter((e) => e.sql.includes("INSERT INTO PUESTO")).length,
    0,
  );
});

test("Si no hay puesto con el nombre del rol, lo crea sin borrar el histórico", async () => {
  const { cn, log } = cnFake();
  const result = await puestoParaRol(cn, 3, "admin");
  assert.deepEqual(result, {
    idRol: 3,
    idPuesto: 14,
    nombre: "Gerente",
    creado: true,
  });
  const inserts = log.filter((e) => e.sql.includes("INSERT INTO PUESTO"));
  assert.equal(inserts.length, 1);
  assert.equal(inserts[0].binds.nombre, "Gerente");
  assert.ok(!log.some((e) => /\bDELETE\b|\bDROP\b/i.test(e.sql)));
});

test("Rechaza rol inactivo", async () => {
  const { cn } = cnFake({ activo: false });
  await assert.rejects(puestoParaRol(cn, 3, "admin"), /inexistente o inactivo/);
});

test("El frontend usa solo ROL y el servidor no confía en id_puesto", () => {
  const front = fs.readFileSync(
    path.join(__dirname, "../public/js/modules/catalogos/empleados.js"),
    "utf8",
  );
  const back = fs.readFileSync(
    path.join(__dirname, "../server/routes/empleados.js"),
    "utf8",
  );
  assert.match(front, /selector\(options\.roles/);
  assert.match(front, /name="id_rol"/);
  assert.doesNotMatch(front, /name="id_puesto"/);
  assert.match(back, /puestoParaRol\(cn, rolSolicitado/);
  assert.match(back, /b\.id_puesto !== undefined/);
  assert.match(back, /UPDATE USUARIO SET ID_ROL=:rol/);
});
