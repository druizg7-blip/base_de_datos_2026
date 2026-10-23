                                                                       
import { $, api, escape, has, message, nice, state } from "../../core/state.js";
import { dataTable, header } from "../../core/ui.js";

function bars(rows) {
  if (!rows.length) return "";
  const key = Object.keys(rows[0]).find(
    (k) =>
      typeof rows[0][k] === "number" &&
      !k.startsWith("ID_") &&
      /TOTAL|UNIDADES|FACTURAS|ENVIOS|MONTO/i.test(k),
  );
  const name = Object.keys(rows[0]).find(
    (k) => typeof rows[0][k] === "string" && !/ESTADO|FECHA/i.test(k),
  );
  if (!key || !name) return "";
  const values = rows.slice(0, 12),
    maximum = Math.max(...values.map((r) => Number(r[key]) || 0), 1);
  return `<h3>Visualización · ${escape(nice(key))}</h3><div class="chart-list" style="margin:20px 0 25px">${values.map((r) => `<div class="chartrow"><span>${escape(String(r[name] || "Sin nombre").slice(0, 35))}</span><div class="bar"><span style="width:${Math.max(0, Math.min(100, (Number(r[key]) / maximum) * 100))}%"></span></div><b>${escape(String(r[key]))}</b></div>`).join("")}</div>`;
}
async function dashboard(isReport = false) {
  const paths = [
    "/reportes/ventas-sucursal",
    "/reportes/productos",
    "/reportes/clientes-region",
  ];
  const keys = ["ventas-sucursal", "productos", "clientes-region"];
  const widgets = [];
  for (let i = 0; i < 3; i++) {
    if (has(paths[i])) {
      try {
        const r = await api("/reportes/" + keys[i]);
        widgets.push(r);
      } catch (e) {
        widgets.push({ title: keys[i], rows: [], error: e.message });
      }
    }
  }
  const show = {
    facturas: "/ventas/facturar",
    compras: "/compras/registro",
    existencias: "/inventario/existencias",
    envios: "/envios/gestion",
  };
  let counts = [];
  try {
    counts = await api("/dashboard/resumen");
  } catch (err) {
    console.error("No se pudieron cargar indicadores", err);
  }
  $("content").innerHTML =
    header(
      isReport ? "Dashboard gerencial" : "Panel principal",
      "",
    ) +
    `<div class="kpis">${counts.map(({ key, count }) => `<div class="kpi"><div class="desc">${escape(nice(key))}</div><strong class="number">${count === null ? "—" : count}</strong><span class="desc">Registros</span></div>`).join("") || '<div class="card">Consultá los módulos disponibles en la barra superior.</div>'}</div>` +
    `<div class="double-panel">${widgets.map((w) => `<div class="card"><h2>${escape(w.title)}</h2>${w.error ? `<div class="notice error">${escape(w.error)}</div>` : bars(w.rows) || dataTable(w.rows.slice(0, 5))}</div>`).join("") || '<div class="card"><h2>Bienvenido a La Casa del Constructor de Derek</h2>Selecciona una sección autorizada desde el menú. Los reportes gerenciales se muestran a los roles con permiso de consulta.</div>'}</div>`;
}

export { bars, dashboard };
