                                                  
import { escape } from "./state.js";
const PAISES = {"502": "Guatemala", "503": "El Salvador", "504": "Honduras"};
const INICIOS = {"502": /^[234567]/, "503": /^[267]/, "504": /^[23789]/};

function partesTelefono(actual = "") {
  const m = /^\+(502|503|504)[ -]*([0-9 -]+)$/.exec(String(actual).trim());
  return { codigo: m?.[1] || "502", local: m?.[2]?.replace(/\D/g, "") || String(actual).replace(/\D/g, "").slice(-8) };
}
function controlTelefono(nombre, valor = "", codigoFijo = null) {
  const partes = partesTelefono(valor);
  const local = partes.local;
  const fijo = codigoFijo && PAISES[codigoFijo] ? String(codigoFijo) : null;
  const mostrado = local.length > 4 ? `${local.slice(0,4)}-${local.slice(4,8)}` : local;
  return `<div class="telefono-compuesto">
      <select data-telefono-pais aria-label="Código internacional" title="Código del país" ${fijo ? 'disabled' : ''}>
      ${Object.entries(PAISES).filter(([c])=>!fijo || c===fijo).map(([c,p])=>`<option value="${c}" ${c===(fijo || partes.codigo)?'selected':''}>+${c} · ${p}</option>`).join("")}</select>
      <input name="${escape(nombre)}" type="tel" inputmode="numeric" autocomplete="tel-national"
        data-telefono-local maxlength="9" placeholder="0000-0000" value="${escape(mostrado)}" aria-label="Número nacional de ocho dígitos">
    </div>`;
}
function formatearTelefono(form, nombre) {
  const input = form.querySelector(`[name="${nombre}"]`);
  const valor = String(input?.value || "").trim();
  if (!valor) return null;
  if (!/^[\d -]+$/.test(valor)) throw Error("El número solo admite cifras y guiones");
  const digitos = valor.replace(/\D/g, "");
  const prefijo = input.closest(".telefono-compuesto")?.querySelector("[data-telefono-pais]")?.value || "502";
  if (!/^\d{8}$/.test(digitos) || !INICIOS[prefijo]?.test(digitos))
    throw Error(`Para +${prefijo} ingresá un número válido de 8 dígitos`);
  return `+${prefijo} ${digitos.slice(0,4)}-${digitos.slice(4)}`;
}
function prepararTelefono(form) {
  for (const input of form.querySelectorAll("[data-telefono-local]")) {
    input.addEventListener("input", () => {
      const numeros = input.value.replace(/\D/g, "").slice(0,8);
      input.value = numeros.length > 4 ? numeros.slice(0,4)+"-"+numeros.slice(4) : numeros;
      input.setCustomValidity("");
    });
    const country = input.closest(".telefono-compuesto")?.querySelector("[data-telefono-pais]");
    const parent = form.querySelector('[name="ID_DEPARTAMENTO"]') || form.querySelector('[name="ID_PAIS"]');
    if (parent && country) {
      const actualizar = () => {
        const prefijo = parent.selectedOptions[0]?.dataset.codigoTelefono;
        if (prefijo && PAISES[prefijo]) { country.value=prefijo; country.disabled=true; }
        else { country.disabled=false; }
      };
      parent.addEventListener("change", actualizar);
      actualizar();
    }
  }
}
export { controlTelefono, formatearTelefono, prepararTelefono };
