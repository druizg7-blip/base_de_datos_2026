                                                                      
import { $, api, button, escape, has, label, message, nice, state } from "../../core/state.js";
import { dataTable, header } from "../../core/ui.js";
import { openCatalogForm } from "./formulario.js";
import { altaCliente } from "./alta-cliente.js";

async function catalogPage(name) {
  const def = state.catalogs[name];
  if (!def) throw Error("La tabla " + name + " no está definida en el modelo");
  const page = state.page;
  const estado = state.catalogStatus || "A";
  const data = await api(
    `/catalogos/${name}?page=${page}&size=20&term=${encodeURIComponent(state.term)}&estado=${encodeURIComponent(estado)}`,
  );
  const admin = state.user?.rol === "Administrador General";
  const perms = {
    I: has(def.path, "I") && (name !== "CLIENTE" || admin),
    U: has(def.path, "U") && (name !== "CLIENTE" || admin),
    D: has(def.path, "D") && (name !== "CLIENTE" || admin),
  };
  const tabs = name === "CLIENTE" ? "" : name === "EMPLEADO" ? "" : "";
  const content =
    header(
      nice(name),
      `${data.total} registros en Oracle · página ${page}`,
      tabs + (perms.I ? button(name === "CLIENTE" ? "+ Nuevo cliente" : "＋ Nuevo registro", "add", "green") : ""),
    ) +
    `<div class="card"><div class="button-bar" style="margin-bottom:15px"><select id="catalogStatus" class="search" aria-label="Estado"><option value="A" ${estado === "A" ? "selected" : ""}>Activos</option><option value="I" ${estado === "I" ? "selected" : ""}>Inactivos</option><option value="T" ${estado === "T" ? "selected" : ""}>Todos</option></select><input class="search" id="catalogSearch" style="max-width:320px" placeholder="Buscar por nombre o código" value="${escape(state.term)}"><button class="btn" id="searchBtn">Buscar</button><span class="micro">Tabla: ${escape(name)}</span></div>` +
    dataTable(data.rows, (r, i) =>
      r.ESTADO_REGISTRO === "I"
        ? perms.U
          ? button("Reactivar", "reactivate:" + i, "green")
          : ""
        : (perms.U ? button("Editar", "edit:" + i) : "") +
          (perms.D ? button("Desactivar", "delete:" + i, "danger") : ""),
    ) +
    `<div class="pager"><span>Mostrando ${data.rows.length} de ${data.total} registros</span><div class="button-bar"><button class="btn" id="prev" ${page <= 1 ? "disabled" : ""}>← Anterior</button><span>Página ${page}</span><button class="btn" id="next" ${page * 20 >= data.total ? "disabled" : ""}>Siguiente →</button></div></div></div>`;
  $("content").innerHTML = content;
  $("catalogStatus").onchange = (e) => {
    state.catalogStatus = e.target.value;
    state.page = 1;
    catalogPage(name).catch((err) => message(err.message, true));
  };
  $("searchBtn").onclick = () => {
    state.term = $("catalogSearch").value.trim();
    state.page = 1;
    catalogPage(name).catch((e) => message(e.message, true));
  };
  $("catalogSearch").onkeydown = (e) => {
    if (e.key === "Enter") $("searchBtn").click();
  };
  $("prev").onclick = () => {
    state.page--;
    catalogPage(name).catch((e) => message(e.message, true));
  };
  $("next").onclick = () => {
    state.page++;
    catalogPage(name).catch((e) => message(e.message, true));
  };
  $("content")
    .querySelectorAll("[data-action]")
    .forEach(
      (btn) =>
        (btn.onclick = async () => {
          try {
            const act = btn.dataset.action;
            if (act === "add") return name === "CLIENTE" ? await altaCliente() : await openCatalogForm(name);
            if (act === "person") return await openCatalogForm("PERSONA");
            if (act === "assign")
              return await openCatalogForm("EMPLEADO_SUCURSAL");
            const [type, index] = act.split(":"),
              row = data.rows[Number(index)];
            if (!row) return;
            if (type === "edit") return await openCatalogForm(name, row);
            if (type === "reactivate") {
              if (!confirm("¿Reactivar este registro?")) return;
              await api(`/catalogos/${name}/${row[def.pk]}/reactivar`, {
                method: "PATCH",
              });
              message("Registro reactivado. Puedes verlo en Activos o Todos.");
              return await catalogPage(name);
            }
            if (
              type === "delete" &&
              confirm(
                "¿Desactivar este registro? La operación no elimina físicamente los datos.",
              )
            ) {
              await api(`/catalogos/${name}/${row[def.pk]}`, {
                method: "DELETE",
              });
              message("Registro desactivado");
              await catalogPage(name);
            }
          } catch (e) {
            message(e.message, true);
          }
        }),
    );
}

export { catalogPage };
