"use strict";
const { connection } = require("../db");
const { error } = require("../security");
const { scope, clause } = require("../branch-scope");
const { definition, validId } = require("./validation");

async function list(
  user,
  table,
  { page = 1, size = 30, term = "", estado, inactive = false } = {},
) {
  const d = definition(table);

  page = Math.max(1, Math.min(100000, parseInt(page, 10) || 1));

  size = Math.max(1, Math.min(100, parseInt(size, 10) || 30));

  term = String(term || "")
    .trim()
    .slice(0, 90);

  if (estado === undefined || estado === null || estado === "") {
    estado = inactive === true || inactive === "true" ? "T" : "A";
  }

  estado = String(estado).trim().toUpperCase();

  if (!["A", "I", "T"].includes(estado)) {
    throw error("Filtro de estado inválido", 400);
  }

  const filters = [];
  const binds = {};

  if (estado !== "T") {
    filters.push("ESTADO_REGISTRO = :estado");
    binds.estado = estado;
  }

  const searchCol =
    d.columns.find((c) => c.name === "NOMBRE") ||
    d.columns.find((c) => c.name === "NOMBRES") ||
    d.columns.find((c) => c.name === "CODIGO");

  if (term && searchCol) {
    filters.push(`UPPER(${searchCol.name}) LIKE :term`);

    binds.term = "%" + term.toUpperCase() + "%";
  }

  const where = filters.length ? "WHERE " + filters.join(" AND ") : "";

  return connection(user.nombre_usuario, async (cn) => {
    const alcance = await scope(cn, user);
    const branch = filterCatalog(alcance, d.table, binds);
    const totalWhere = filters.concat(branch ? [branch] : []);
    const scopedWhere = totalWhere.length
      ? "WHERE " + totalWhere.join(" AND ")
      : "";

    const count = await cn.execute(
      `SELECT COUNT(*) AS TOTAL
         FROM ${d.table} t
         ${scopedWhere}`,
      binds,
    );

    const start = (page - 1) * size + 1;
    const end = page * size;

    const sql = `
        SELECT *
        FROM (
          SELECT
            t.*,
            ROW_NUMBER() OVER (
              ORDER BY ${d.pk}
            ) AS RN_FERREGEST
          FROM ${d.table} t
          ${scopedWhere}
        )
        WHERE RN_FERREGEST BETWEEN ${start} AND ${end}
      `;

    const result = await cn.execute(sql, binds, { fetchArraySize: size });

    return {
      rows: result.rows.map(({ RN_FERREGEST, ...row }) => row),
      total: count.rows[0].TOTAL,
      page,
      size,
      estado,
    };
  });
}

async function get(user, table, id) {
  const d = definition(table);
  const pk = validId(id);

  return connection(user.nombre_usuario, async (cn) => {
    const alcance = await scope(cn, user);
    const binds = { id: pk };
    const cond = filterCatalog(alcance, d.table, binds);
    const result = await cn.execute(
      `SELECT * FROM ${d.table} t WHERE ${d.pk} = :id ${cond ? "AND " + cond : ""}`,
      binds,
    );

    return result.rows[0] || null;
  });
}

function filterCatalog(alcance, tabla, binds) {
  if (alcance.admin) return "";
  const simple = {
    SUCURSAL: "ID_SUCURSAL",
    VEHICULO: "ID_SUCURSAL",
    PRODUCTO_SUCURSAL: "ID_SUCURSAL",
    EMPLEADO_SUCURSAL: "ID_SUCURSAL",
    ENVIO: "ID_SUCURSAL",
    DEVOLUCION: "ID_SUCURSAL",
  };
  if (simple[tabla])
    return clause(alcance, simple[tabla], binds).replace(/^ AND /, "");
  const refs = {
    EMPLEADO: `EXISTS(SELECT 1 FROM EMPLEADO_SUCURSAL es WHERE es.ID_EMPLEADO=t.ID_EMPLEADO AND es.FECHA_FIN IS NULL AND es.ESTADO_REGISTRO='A' {FILTER})`,
    CLIENTE:
      "EXISTS(SELECT 1 FROM FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE f.ID_CLIENTE=t.ID_CLIENTE {FILTER})",
    PERSONA:
      "EXISTS(SELECT 1 FROM EMPLEADO e JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO=e.ID_EMPLEADO WHERE e.ID_PERSONA=t.ID_PERSONA {FILTER}) OR EXISTS(SELECT 1 FROM CLIENTE cl JOIN FACTURA f ON f.ID_CLIENTE=cl.ID_CLIENTE JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE cl.ID_PERSONA=t.ID_PERSONA {FILTER2})",
  };
  if (!refs[tabla]) return "";
  let r = refs[tabla].replace(
    "{FILTER}",
    clause(alcance, "es.ID_SUCURSAL", binds),
  );
  r = r.replace("{FILTER2}", clause(alcance, "es.ID_SUCURSAL", binds));
  return "(" + r + ")";
}
module.exports = { list, get, filterCatalog };
