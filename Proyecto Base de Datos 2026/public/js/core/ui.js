                                                  
import { $, api, button, escape, label, nice, renderDate, today } from "./state.js";
import {controlTelefono, formatearTelefono} from "./telefono.js";

function dataTable(rows, actions) {
  if (!rows?.length)
    return '<div class="empty"><strong>Sin registros para mostrar</strong></div>';
  const fields = Object.keys(rows[0])
    .filter(
      (k) =>
        ![
          "VALOR_ANTERIOR",
          "VALOR_NUEVO",
          "USUARIO_CREACION",
          "FECHA_CREACION",
          "USUARIO_MODIFICACION",
          "FECHA_MODIFICACION",
        ].includes(k),
    )
    .slice(0, 11);
  return `<div class="table-wrap"><table><thead><tr>${fields.map((f) => `<th>${escape(nice(f))}</th>`).join("")}${actions ? "<th>Acciones</th>" : ""}</tr></thead><tbody>${rows.map((r, i) => `<tr>${fields.map((f) => `<td>${f === "ESTADO_REGISTRO" ? `<span class="status ${r[f] === "I" ? "inactive" : ""}">${r[f] === "I" ? "Inactivo" : "Activo"}</span>` : escape(String(renderDate(r[f]) ?? "—").slice(0, 130))}</td>`).join("")}${actions ? `<td><div class="table-actions">${actions(r, i)}</div></td>` : ""}</tr>`).join("")}</tbody></table></div>`;
}
function header(title, subtitle = "", buttons = "") {
  return `<div class="content-header"><div><h2>${escape(title)}</h2>${subtitle ? `<p>${escape(subtitle)}</p>` : ""}</div><div class="button-bar">${buttons}</div></div>`;
}
function modal(content, title, subtitle = "") {
  const host = $("modalHost");
  host.innerHTML = `<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-header"><div><h2>${escape(title)}</h2>${subtitle ? `<p>${escape(subtitle)}</p>` : ""}</div><button id="closeModal" class="btn">✕ Cerrar</button></div>${content}</div></div>`;
  host.querySelector("#closeModal").onclick = closeModal;
  host.querySelector(".modal-backdrop").onclick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) closeModal();
  };
}
function closeModal() {
  $("modalHost").replaceChildren();
}
async function options(table, context) {
  return await api(`/opciones/${table}?context=${encodeURIComponent(context)}`);
}
function fieldInfo(c, initial) {
  let value =
    initial?.[c.name] ??
    (c.name === "FECHA_REGISTRO" ||
    c.name === "FECHA_ENVIO" ||
    c.name === "FECHA_RECLAMO" ||
    c.name === "FECHA"
      ? today()
      : "");
  if (value instanceof Date) value = value.toISOString().slice(0, 10);
  value = renderDate(value);
  return value;
}
function enumValues(c) {
  return {
    TIPO_CLIENTE: ["I", "E"],
    CONDICION_PAGO: ["CONTADO", "CREDITO"],
    ESTADO: ["PENDIENTE", "EN_PROCESO", "EN_RUTA", "ENTREGADO", "CERRADO"],
    REINGRESA_INVENTARIO: ["S", "N"],
    TRANSPORTA_CLIENTE: ["S", "N"],
    REQUIERE_REFERENCIA: ["S", "N"],
    PUEDE_CONSULTAR: ["S", "N"],
    PUEDE_INSERTAR: ["S", "N"],
    PUEDE_ACTUALIZAR: ["S", "N"],
    PUEDE_ELIMINAR: ["S", "N"],
  }[c.name];
}
async function formFields(columns, initial = {}, context = "") {
  let html = "";
  const refs = [...new Set(columns.map((c) => c.reference).filter(Boolean))];
  const refEntries = await Promise.all(
    refs.map(async (ref) => [ref, await options(ref, context)]),
  );
  const refmap = Object.fromEntries(refEntries);
  for (const c of columns) {
    const value = fieldInfo(c, initial),
      req = c.required && !c.default ? "required" : "";
    let input = "";
    if (c.reference) {
      input = `<select name="${c.name}" ${req}><option value="">Seleccione...</option>${(refmap[c.reference] || []).map((r) => `<option value="${escape(r.ID)}" data-codigo-telefono="${escape(r.CODIGO_TELEFONO || "")}" ${String(value) === String(r.ID) ? "selected" : ""}>${escape(r.ETIQUETA)}</option>`).join("")}</select>`;
    } else if (c.name === "TELEFONO") {
      input = controlTelefono(c.name, value);
    } else if (enumValues(c)) {
      input = `<select name="${c.name}" ${req}><option value="">Seleccione...</option>${enumValues(
        c,
      )
        .map(
          (v) =>
            `<option value="${v}" ${value === v ? "selected" : ""}>${v}</option>`,
        )
        .join("")}</select>`;
    } else if (c.type.startsWith("DATE") || c.type.startsWith("TIMESTAMP"))
      input = `<input type="date" name="${c.name}" value="${escape(value)}" ${req}>`;
    else if (c.type.startsWith("NUMBER") || c.type === "INTEGER")
      input = `<input type="number" step="any" name="${c.name}" value="${escape(value)}" ${req}>`;
    else
      input = `<input type="text" name="${c.name}" value="${escape(value)}" maxlength="${/\((\d+)\)/.exec(c.type)?.[1] || 200}" ${req}>`;
    html += label(input, c.name, !!req);
  }
  return html;
}
function formBody(form, columns) {
  const fd = new FormData(form),
    out = {};
  for (const c of columns) {
    let v = fd.get(c.name);
    if (v === "") {
      if (c.required && !c.default)
        throw Error("Campo requerido: " + nice(c.name));
      continue;
    }
    if (/^(INTEGER|NUMBER)/.test(c.type)) {
      v = Number(v);
      if (!Number.isFinite(v)) throw Error("Número inválido: " + nice(c.name));
    }
    if (c.name === "TELEFONO") v = formatearTelefono(form, c.name);
    out[c.name] = v;
  }
  return out;
}

function basicField(name, type = "number", required = true, value = "") {
  return label(
    `<input type="${type}" name="${name}" ${required ? "required" : ""} value="${escape(value)}" ${type === "number" ? 'step="any"' : ""}>`,
    name,
    required,
  );
}
async function commandFields(args, context, defaults = {}) {
  const fields = [];
  for (const arg of args) {
    const lookup = {
      id_cliente: "CLIENTE",
      id_proveedor: "PROVEEDOR",
      id_empleado_sucursal: "EMPLEADO_SUCURSAL",
      id_producto_sucursal: "PRODUCTO_SUCURSAL",
      id_metodo_pago: "METODO_PAGO",
      id_factura: "FACTURA",
      id_compra: "COMPRA",
      id_empleado: "EMPLEADO",
      id_motivo_baja: "MOTIVO_BAJA",
      id_detalle_factura: "DETALLE_FACTURA",
    }[arg];
    if (lookup) {
      let opts = await options(lookup, context);
      fields.push(
        label(
          `<select name="${arg}" required><option value="">Seleccione...</option>${opts.map((o) => `<option value="${escape(o.ID)}" data-sucursal="${escape(o.SUCURSAL_ID || "")}" data-price="${escape(o.PRECIO_VENTA || 0)}" data-cost="${escape(o.PRECIO_COSTO || 0)}" data-saldo="${escape(o.SALDO ?? "")}" data-cliente="${escape(o.CLIENTE ?? "")}">${escape(o.ETIQUETA)}</option>`).join("")}</select>`,
          context === "/ventas/pagos"
            ? {
                id_factura: "Factura / Cliente / Saldo",
                id_empleado_sucursal: "Empleado que recibe el cobro",
                id_metodo_pago: "Forma de pago",
              }[arg] || arg
            : arg,
          true,
        ),
      );
    } else if (arg === "condicion_pago")
      fields.push(
        label(
          `<select name="${arg}" required><option value="CONTADO">Contado</option><option value="CREDITO">Crédito</option></select>`,
          arg,
          true,
        ),
      );
    else if (
      ["serie", "referencia", "motivo", "numero_documento"].includes(arg)
    )
      fields.push(
        label(
          `<input name="${arg}" type="text" ${arg === "referencia" ? "" : "required"} value="${escape(defaults[arg] ?? (arg === "serie" ? "A001" : ""))}">`,
          arg,
          arg !== "referencia",
        ),
      );
    else
      fields.push(
        basicField(
          arg,
          "number",
          !["descuento"].includes(arg),
          defaults[arg] ?? (arg === "descuento" ? 0 : ""),
        ),
      );
  }
  return fields.join("");
}
function payload(root) {
  const entries =
    root instanceof HTMLFormElement
      ? new FormData(root)
      : [...root.querySelectorAll("[name]")].map((x) => [x.name, x.value]);
  const r = {};
  for (const [k, v] of entries)
    if (v !== "")
      r[k] = /^(id_|cantidad$|descuento$|monto$|costo_unitario$)/.test(k)
        ? Number(v)
        : v;
  return r;
}

function headerUI(kind) {
  return header(
    {
      facturas: "Nueva factura",
      "notas-credito": "Nota de crédito",
      compras: "Nueva compra",
    }[kind] || nice(kind),
  );
}

export { basicField, closeModal, commandFields, dataTable, enumValues, fieldInfo, formBody, formFields, header, headerUI, modal, options, payload };
