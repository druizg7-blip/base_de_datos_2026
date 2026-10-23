                                                                         
import { openPage } from "../../core/navigation.js";
import { $, api, button, message, nice, state } from "../../core/state.js";
import { closeModal, formBody, formFields, modal } from "../../core/ui.js";
import {prepararTelefono} from "../../core/telefono.js";

async function openCatalogForm(name, initial = null) {
  const def = state.catalogs[name],
    columns = def.columns;
  modal(
    "<p>Cargando campos y referencias...</p>",
    initial ? "Editar " + nice(name) : "Nuevo " + nice(name),
  );
  try {
    const controls = await formFields(columns, initial, "CAT:" + name);
    $("modalHost")
      .querySelector(".modal")
      .insertAdjacentHTML(
        "beforeend",
        `<form id="entityForm"><div class="form-grid">${controls}</div><div class="form-footer"><button type="button" class="btn" id="cancelForm">Cancelar</button><button type="submit" class="btn green">Guardar</button></div></form>`,
      );
    $("modalHost").querySelector(".modal > p")?.remove();
    prepararTelefono($("entityForm"));
    $("cancelForm").onclick = closeModal;
    $("entityForm").onsubmit = async (e) => {
      e.preventDefault();
      try {
        const body = formBody(e.target, columns);
        await api(`/catalogos/${name}${initial ? "/" + initial[def.pk] : ""}`, {
          method: initial ? "PUT" : "POST",
          body: JSON.stringify(body),
        });
        closeModal();
        message("Registro guardado correctamente");
        await openPage(state.current);
      } catch (err) {
        message(err.message, true);
      }
    };
  } catch (e) {
    closeModal();
    message(e.message, true);
  }
}

export { openCatalogForm };
