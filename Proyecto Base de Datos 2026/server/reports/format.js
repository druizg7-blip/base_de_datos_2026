"use strict";
function fgEtiq(nombre) {
  return String(nombre)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, c => c.toUpperCase());
}

function fgMonetario(k) {
  k = String(k).toUpperCase();

  if (/^(ID_|NUMERO|FACTURAS|UNIDADES|CANTIDAD|EXISTENCIA|DIAS)/.test(k)) {
    return false;
  }

  return /(^TOTAL$|TOTAL_VENDIDO|TOTAL_PAGADO|TOTAL_COBRADO|MONTO|SALDO|SUBTOTAL|PRECIO|COSTO|IMPUESTO|INGRESO|UTILIDAD)/.test(k);
}

function fgFormato(v, k) {
  if (v === null || v === undefined) return "-";

  if (v instanceof Date) {
    return new Intl.DateTimeFormat("es-GT", {
      timeZone: "America/Guatemala",
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(v);
  }

  if (typeof v === "number") {
    if (fgMonetario(k)) {
      return "Q " + new Intl.NumberFormat("es-GT", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(v);
    }

    return new Intl.NumberFormat("es-GT", {
      maximumFractionDigits: 2
    }).format(v);
  }

  return String(v);
}

function fgPeriodo(def, filtros) {
  if (def.view) {
    return "Vista de Oracle (sin filtro de fechas)";
  }

  const desde = /^\d{4}-\d{2}-\d{2}$/.test(filtros.desde || "")
    ? filtros.desde : "Inicio";

  const hasta = /^\d{4}-\d{2}-\d{2}$/.test(filtros.hasta || "")
    ? filtros.hasta : "Actualidad";

  return (desde === "Inicio" && hasta === "Actualidad" ? "Todas las fechas (sin filtro)" : `Del ${desde} al ${hasta}`) +
    (def.top
      ? ` | Top ${Math.max(1, Math.min(100, Number(filtros.top) || 15))}`
      : "");
}

function fgResumen(rows) {
  const partes = [`Registros: ${rows.length}`];

  for (const k of ["FACTURAS", "UNIDADES", "TOTAL_VENDIDO"]) {
    if (rows.some(r => typeof r[k] === "number")) {
      const suma = rows.reduce(
        (total, r) => total + (Number(r[k]) || 0),
        0
      );

      partes.push(`${fgEtiq(k)}: ${fgFormato(suma, k)}`);
    }
  }

  return partes.join("   |   ");
}


module.exports={fgEtiq,fgMonetario,fgFormato,fgPeriodo,fgResumen};
