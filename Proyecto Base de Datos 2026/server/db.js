"use strict";
require("dotenv").config();
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
let pool;
function config() {
  const { DB_USER, DB_PASSWORD, DB_CONNECT_STRING, JWT_SECRET } = process.env;
  for (const [k, v] of Object.entries({
    DB_USER,
    DB_PASSWORD,
    DB_CONNECT_STRING,
    JWT_SECRET,
  })) {
    if (!v || v.includes("PEGA_AQUI") || v.includes("PON_AQUI"))
      throw new Error(`Configure ${k} en .env`);
  }
  if (JWT_SECRET.length < 32)
    throw new Error("JWT_SECRET necesita al menos 32 caracteres");
  return {
    user: DB_USER,
    password: DB_PASSWORD,
    connectString: DB_CONNECT_STRING,
    poolMin: 0,
    poolMax: 5,
    poolIncrement: 1,
    poolTimeout: 60,
    stmtCacheSize: 30,
  };
}
async function init() {
  pool = await oracledb.createPool(config());
  const cn = await pool.getConnection();
  try {
    await cn.execute("SELECT 1 AS OK FROM DUAL");
  } finally {
    await cn.close();
  }
}
async function connection(usuario, fn, { write = false } = {}) {
  if (!pool) throw new Error("Pool de Oracle sin inicializar");
  const cn = await pool.getConnection();
  cn.callTimeout = 25000;
  try {
    await cn.execute("BEGIN DBMS_SESSION.SET_IDENTIFIER(:u); END;", {
      u: String(usuario || "ANONIMO").slice(0, 64),
    });
    const value = await fn(cn);
    if (write) await cn.commit();
    return value;
  } catch (err) {
    try {
      await cn.rollback();
    } catch (e) {
      console.error("Rollback:", e.message);
    }
    throw err;
  } finally {
    try {
      await cn.execute("BEGIN DBMS_SESSION.CLEAR_IDENTIFIER; END;");
    } catch (err) {
      console.error("Limpieza identificador:", err.message);
    }
    await cn.close();
  }
}
async function close() {
  if (pool) await pool.close(10);
}
module.exports = { oracledb, init, connection, close };
