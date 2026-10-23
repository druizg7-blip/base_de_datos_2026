                                                                  
import { $, api, button, escape, label, message, state } from "../../core/state.js";
import { dataTable, header } from "../../core/ui.js";
import { dashboard } from "./dashboard.js";
import { visualizacion } from "./visualizacion.js";

async function reportPage(path) {
  const items = Object.entries(state.reports).filter(
    ([, d]) => d.path === path,
  );
  if (path === "/reportes/dashboard") return await dashboard(true);
  if (!items.length) throw Error("Reporte sin definición");
  $("content").innerHTML =
    header(
      "Reportes gerenciales",
      "",
    ) +
    `<div class="card"><div class="form-grid four"><label class="field">Reporte<select id="reportType">${items.map(([k, v]) => `<option value="${escape(k)}">${escape(v.title)}</option>`).join("")}</select></label><label class="field" id="fgCampoDesde">Fecha inicial (opcional)<input type="date" id="dateStart"></label><label class="field" id="fgCampoHasta">Fecha final (opcional)<input type="date" id="dateEnd"></label><label class="field" id="fgCampoTop">Top productos<input type="number" id="topN" min="1" max="100" value="15"></label></div><p class="micro" id="fgNotaPeriodo" hidden></p><div class="flow-actions"><button class="btn green" id="runReport">Consultar</button><button class="btn" id="exportXlsx">Descargar Excel</button><button class="btn" id="exportPdf">Descargar PDF</button></div></div><div id="results" class="card"><div class="empty">Selecciona Consultar para visualizar el reporte.</div></div>`;
                         
  function actualizarFiltrosReporte() {
    const definicion = state.reports[$("reportType").value] || {};

    const mostrarTop = definicion.top === true;
    const mostrarFechas = !definicion.view;

    const controles = [
      ["fgCampoTop", mostrarTop],
      ["fgCampoDesde", mostrarFechas],
      ["fgCampoHasta", mostrarFechas],
      ["fgNotaPeriodo", mostrarFechas]
    ];

    for (const [id, visible] of controles) {
      const elemento = $(id);

      if (!elemento) continue;

      elemento.hidden = !visible;
      elemento.style.display = visible ? "" : "none";
    }
  }

  $("reportType").addEventListener("change", () => {
    actualizarFiltrosReporte();

    $("results").innerHTML =
      '<div class="empty">Presiona Consultar para visualizar el reporte seleccionado.</div>';
  });

  actualizarFiltrosReporte();
  const url = () =>
    `/reportes/${$("reportType").value}?` +
    new URLSearchParams({
      desde: $("dateStart").value,
      hasta: $("dateEnd").value,
      ...(state.reports[$("reportType").value]?.top ? { top: $("topN").value } : {}),
    }).toString();
  $("runReport").onclick = async () => {
    try {
      const r = await api(url());
      $("results").innerHTML =
        `<h2>${escape(r.title)} · ${r.rows.length} filas</h2>${visualizacion(r.rows, $("reportType").value, r.title)}`;
    } catch (err) {
      message(err.message, true);
    }
  };
  for (const [id, type] of [
    ["exportXlsx", "xlsx"],
    ["exportPdf", "pdf"],
  ])
    $(id).onclick = async () => {
      try {
        const blob = await api(url() + "&format=" + type);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = $("reportType").value + "." + type;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1500);
      } catch (err) {
        message(err.message, true);
      }
    };
}

export { reportPage };
