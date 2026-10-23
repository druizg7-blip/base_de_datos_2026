"use strict";
const { connection } = require("../db");
const { definition, refLabel } = require("./validation");

async function options(user, table) {
  const d = definition(table);
  const label = refLabel(d.table);
  const sqlEspecial = {
    DEPARTAMENTO: `SELECT d.ID_DEPARTAMENTO AS ID,
      d.NOMBRE || ' · ' || p.NOMBRE AS ETIQUETA,
      CASE TRIM(p.CODIGO_ISO) WHEN 'GT' THEN '502' WHEN 'SV' THEN '503' WHEN 'HN' THEN '504' END AS CODIGO_TELEFONO
      FROM DEPARTAMENTO d JOIN PAIS p ON p.ID_PAIS=d.ID_PAIS
      WHERE d.ESTADO_REGISTRO='A' ORDER BY d.NOMBRE FETCH FIRST 300 ROWS ONLY`,
    PAIS: `SELECT ID_PAIS AS ID, NOMBRE AS ETIQUETA,
      CASE TRIM(CODIGO_ISO) WHEN 'GT' THEN '502' WHEN 'SV' THEN '503' WHEN 'HN' THEN '504' END AS CODIGO_TELEFONO
      FROM PAIS WHERE ESTADO_REGISTRO='A' ORDER BY NOMBRE FETCH FIRST 300 ROWS ONLY`,
  }[d.table];

  return connection(user.nombre_usuario, async (cn) => {
    const result = await cn.execute(
      sqlEspecial ||
        `
          SELECT
            ${d.pk} AS ID,
            ${label} AS ETIQUETA
          FROM ${d.table}
          WHERE ESTADO_REGISTRO = 'A'
          ORDER BY 2
          FETCH FIRST 300 ROWS ONLY
        `,
    );

    return result.rows;
  });
}

module.exports = { options };
