"use strict";
const { connection } = require("../db");
const { error } = require("../security");
const { definition, validId, normalize } = require("./validation");
const { validarPaisTelefono } = require("../phone");
const { scope, assertBranch, owner } = require("../branch-scope");

async function insert(user, table, payload) {
  const d = definition(table);
  const obj = normalize(d, payload);
  const names = Object.keys(obj);

  const binds = Object.fromEntries(
    names.map((name, i) => ["p" + i, obj[name]]),
  );

  const sql = `
    INSERT INTO ${d.table}
    (
      ${d.pk},
      ${names.join(",")}
    )
    VALUES
    (
      SEQ_${d.table}.NEXTVAL,
      ${names.map((_, i) => ":p" + i).join(",")}
    )
    RETURNING ${d.pk} INTO :id
  `;

  return connection(
    user.nombre_usuario,
    async (cn) => {
      const { oracledb } = require("../db");
      await checkCatalogWrite(cn, user, d.table, "insert", null, obj);
      await validarPaisTelefono(cn, d.table, obj);

      binds.id = {
        dir: oracledb.BIND_OUT,
        type: oracledb.NUMBER,
      };

      const result = await cn.execute(sql, binds);

      return {
        id: result.outBinds.id[0],
      };
    },
    { write: true },
  );
}

async function update(user, table, id, payload) {
  const d = definition(table);
  const pk = validId(id);

  const obj = normalize(d, payload, {
    partial: true,
  });

  const names = Object.keys(obj);
  const binds = { id: pk };

  for (let i = 0; i < names.length; i++) {
    binds["p" + i] = obj[names[i]];
  }

  binds.actor = user.nombre_usuario.slice(0, 50);

  const sql = `
    UPDATE ${d.table}
    SET
      ${names.map((name, i) => name + " = :p" + i).join(",")},
      FECHA_MODIFICACION = SYSTIMESTAMP,
      USUARIO_MODIFICACION = :actor
    WHERE ${d.pk} = :id
      AND ESTADO_REGISTRO = 'A'
  `;

  return connection(
    user.nombre_usuario,
    async (cn) => {
      await checkCatalogWrite(cn, user, d.table, "update", pk, obj);
      await validarPaisTelefono(cn, d.table, obj, pk);
      const result = await cn.execute(sql, binds);

      if (!result.rowsAffected) {
        throw error("Registro inexistente o inactivo", 404);
      }

      return { ok: true };
    },
    { write: true },
  );
}

async function deactivate(user, table, id) {
  const d = definition(table);
  const pk = validId(id);

  return connection(
    user.nombre_usuario,
    async (cn) => {
      await checkCatalogWrite(cn, user, d.table, "update", pk, {});
      const result = await cn.execute(
        `
          UPDATE ${d.table}
          SET
            ESTADO_REGISTRO = 'I',
            FECHA_MODIFICACION = SYSTIMESTAMP,
            USUARIO_MODIFICACION = :usuario
          WHERE ${d.pk} = :id
            AND ESTADO_REGISTRO = 'A'
        `,
        {
          id: pk,
          usuario: user.nombre_usuario.slice(0, 50),
        },
      );

      if (!result.rowsAffected) {
        throw error("Registro no encontrado o ya inactivo", 404);
      }

      return {
        ok: true,
        mensaje: "Registro desactivado correctamente",
        estado: "I",
      };
    },
    { write: true },
  );
}

async function reactivate(user, table, id) {
  const d = definition(table);
  const pk = validId(id);

  return connection(
    user.nombre_usuario,
    async (cn) => {
      await checkCatalogWrite(cn, user, d.table, "update", pk, {});
      const result = await cn.execute(
        `
          UPDATE ${d.table}
          SET
            ESTADO_REGISTRO = 'A',
            FECHA_MODIFICACION = SYSTIMESTAMP,
            USUARIO_MODIFICACION = :usuario
          WHERE ${d.pk} = :id
            AND ESTADO_REGISTRO = 'I'
        `,
        {
          id: pk,
          usuario: user.nombre_usuario.slice(0, 50),
        },
      );

      if (!result.rowsAffected) {
        throw error("Registro no encontrado o ya activo", 404);
      }

      return {
        ok: true,
        mensaje: "Registro reactivado correctamente",
        estado: "A",
      };
    },
    { write: true },
  );
}

async function checkCatalogWrite(cn, user, tabla, action, id, obj) {
  const s = await scope(cn, user);
  if (s.admin) return;
  const branchTables = {
    SUCURSAL: "ID_SUCURSAL",
    VEHICULO: "ID_SUCURSAL",
    PRODUCTO_SUCURSAL: "ID_SUCURSAL",
    EMPLEADO_SUCURSAL: "ID_SUCURSAL",
  };
  const pk = {
    SUCURSAL: "ID_SUCURSAL",
    VEHICULO: "ID_VEHICULO",
    PRODUCTO_SUCURSAL: "ID_PRODUCTO_SUCURSAL",
    EMPLEADO_SUCURSAL: "ID_EMPLEADO_SUCURSAL",
  };

  if (!branchTables[tabla]) {
    if (["CLIENTE", "PERSONA"].includes(tabla) && action === "insert") return;
    throw error(
      "Este catálogo compartido sólo puede modificarlo el administrador",
      403,
    );
  }
  if (action === "insert") assertBranch(s, obj.ID_SUCURSAL);
  else {
    await owner(cn, s, tabla, pk[tabla], id);
    if (obj.ID_SUCURSAL !== undefined) assertBranch(s, obj.ID_SUCURSAL);
  }
}
module.exports = { insert, update, deactivate, reactivate };
