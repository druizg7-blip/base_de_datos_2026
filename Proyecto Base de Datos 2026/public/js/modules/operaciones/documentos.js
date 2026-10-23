                                                                           
import { openPage } from "../../core/navigation.js";
import { $, api, button, escape, has, label, message, money, state } from "../../core/state.js";
import { commandFields, header, headerUI, modal, options, payload } from "../../core/ui.js";
import {controlTelefono, formatearTelefono, prepararTelefono} from "../../core/telefono.js";

async function documentForm(kind) {
  const metas = await api("/transacciones/metadata");
  const d = metas.documents[kind];
  const head = metas.commands[d.header];
  const line = metas.commands[d.detail];
  const context = d.path;
  const cajero = kind === "facturas" ? await api("/ventas/mi-caja") : null;
  let header = await commandFields(
    cajero ? head.args.filter(a=>a!=="id_empleado_sucursal") : head.args, context
  );
  if (cajero) header += `
    <label class="field">Empleado que realiza la venta *
      <input type="hidden" name="id_empleado_sucursal" value="${escape(cajero.ID_EMPLEADO_SUCURSAL)}" data-sucursal="${escape(cajero.ID_SUCURSAL)}">
      <div class="notice">${escape(cajero.ETIQUETA)}</div>
    </label>`;
  let template = await commandFields(
    line.args.filter((a) => a !== d.id),
    context,
  );
                                                                          
  $("content").innerHTML =
    `${headerTitle()}<form id="documentForm"><div class="card"><h2>1 · Datos generales</h2><div class="form-grid">${header}</div></div><div class="card"><div class="content-header"><div><h2>2 · Detalle del documento</h2></div><button type="button" id="addLine" class="btn green">＋ Agregar línea</button></div><div id="lines"></div><div class="summary-box"><span>Total de líneas: <strong id="lineCount">0</strong></span><span><b>Estimación: <strong id="estimate">Q 0.00</strong></b><br><small id="taxEstimate" class="micro">Los importes finales son validados por Oracle</small></span></div></div><div class="form-footer"><button class="btn green" type="submit">Confirmar documento completo</button></div></form>`;
                                           
  if (kind === "compras") {
    const autorizado = has("/compras/pagos", "I") && has("/compras/pagos", "C");

    let metodosCompra = [];
    if (autorizado)
      metodosCompra = await options("METODO_PAGO", "/compras/pagos");

    const panel = document.createElement("div");
    panel.className = "card";
    panel.innerHTML = `
      <h2>3 · Pago de esta compra</h2>
      <p class="micro">
        Puedes pagar ahora o dejar la compra pendiente.
        Oracle registra ambas operaciones en una transaccion.
      </p>
      ${
        autorizado && metodosCompra.length
          ? `
        <label style="display:flex;gap:10px;align-items:center;margin:12px 0">
          <input type="checkbox" id="pagarCompraAhora" checked>
          <strong>Registrar el pago junto con la compra</strong>
        </label>
        <div class="form-grid" id="datosPagoCompra">
          <label class="field">Forma de pago *
            <select id="metodoPagoCompra">
              <option value="">Seleccione...</option>
              ${metodosCompra
                .map(
                  (m) =>
                    `<option value="${escape(m.ID)}">${escape(m.ETIQUETA)}</option>`,
                )
                .join("")}
            </select>
          </label>
          <label class="field">Referencia del pago
            <input id="referenciaPagoCompra" maxlength="50"
                   placeholder="Comprobante o transferencia">
          </label>
        </div>
        <p id="avisoPagoCompra" class="micro"></p>
      `
          : `
        <div class="notice">
          Podras registrar el pago posteriormente si tienes permiso.
        </div>
      `
      }`;

    $("documentForm").querySelector(".form-footer").before(panel);

    if (autorizado && metodosCompra.length) {
      const condicion = $("documentForm").querySelector(
        '[name="condicion_pago"]',
      );
      const pagar = $("pagarCompraAhora");
      const metodo = $("metodoPagoCompra");
      const referencia = $("referenciaPagoCompra");

      function actualizarPago() {
        const contado = condicion.value === "CONTADO";
        if (!contado) pagar.checked = false;
        pagar.disabled = !contado;

        const activo = contado && pagar.checked;

        $("datosPagoCompra").hidden = !activo;
        metodo.disabled = !activo;
        metodo.required = activo;
        referencia.disabled = !activo;

        referencia.required =
          activo &&
          !!metodo.value &&
          !/efectivo/i.test(metodo.selectedOptions[0]?.textContent || "");

        $("avisoPagoCompra").textContent = !contado
          ? "Esta compra quedara pendiente de pago."
          : activo
            ? "Oracle calculara y pagara el total exacto."
            : "Podras pagar esta compra en la seccion inferior.";

        const boton = $("documentForm").querySelector('button[type="submit"]');

        if (boton)
          boton.textContent = activo
            ? "Registrar compra y pagar"
            : "Registrar compra pendiente";
      }

      condicion.addEventListener("change", () => {
        if (condicion.value === "CONTADO") pagar.checked = true;
        actualizarPago();
      });

      pagar.addEventListener("change", actualizarPago);
      metodo.addEventListener("change", actualizarPago);
      actualizarPago();
    }
  }
                                                                         
  if (kind === "facturas") {
    const entrega = document.createElement("div");
    entrega.className = "card";
    entrega.innerHTML = `
      <h2>3 · Forma de entrega</h2>
      <p class="micro">Indica cómo recibe sus productos el cliente. Es diferente de si la factura está pagada.</p>
      <label class="field" style="max-width:520px;margin-top:14px">
        Entrega de esta venta *
        <select name="modalidad_entrega" id="modalidadEntregaFactura" required>
          <option value="">Selecciona la forma de entrega...</option>
          <option value="CAJA">Entregado al cliente en caja / mostrador</option>
          <option value="ENVIO">Pendiente para envío o retiro posterior</option>
        </select>
      </label>
      <p class="micro" id="avisoEntregaFactura" style="margin-top:10px">
        Se debe indicar si los productos ya fueron entregados o quedarán pendientes.
      </p>`;
    $("documentForm").querySelector(".form-footer").before(entrega);
    $("modalidadEntregaFactura").addEventListener("change", (ev) => {
      $("avisoEntregaFactura").textContent = ev.target.value === "CAJA"
        ? "El cliente se llevó los productos: esta factura no aparecerá pendiente en Envíos."
        : ev.target.value === "ENVIO"
          ? "Los productos se entregarán después: se gestionarán desde Envíos."
          : "Selecciona cómo se entregarán los productos.";
    });
    const puedeCobrar = has("/ventas/pagos", "I");
    let metodos = [];
    if (puedeCobrar) {
      metodos = await options("METODO_PAGO", "/ventas/pagos");
    }
    const caja = document.createElement("div");
    caja.className = "card";
    caja.innerHTML = `
      <h2>4 · Caja y cobro</h2>
      <p class="micro">El total definitivo se calcula en Oracle. Si cobras ahora, factura, inventario y pago se guardan juntos.</p>
      ${
        puedeCobrar && metodos.length
          ? `<label style="display:flex;gap:10px;align-items:center;margin:14px 0">
             <input type="checkbox" id="cobrarAhora" checked>
             <strong>Cobrar al emitir esta factura</strong>
           </label>
           <div id="datosCobro" class="form-grid">
             <label class="field">Forma de pago *
               <select id="metodoCaja" required>${metodos
                 .map(
                   (m) =>
                     `<option value="${escape(m.ID)}">${escape(m.ETIQUETA)}</option>`,
                 )
                 .join("")}</select>
             </label>
             <label class="field" id="grupoRecibido">Dinero recibido (Q) *
               <input id="efectivoRecibido" type="number" min="0" step="0.01" placeholder="Ej. 1000" required>
             </label>
             <label class="field" id="grupoReferencia" hidden>Referencia de pago *
               <input id="referenciaCaja" type="text" maxlength="50" placeholder="Número de autorización / comprobante">
             </label>
           </div>
           <div class="summary-box" style="margin-top:16px;flex-wrap:wrap;gap:18px">
             <span>Total estimado: <strong id="totalCaja">Q 0.00</strong></span>
             <span>Cambio estimado: <strong id="cambioCaja">Q 0.00</strong></span>
           </div>
           <p class="micro" id="mensajeCaja" style="margin-top:10px">Para efectivo, escribe cuánto te entregó el cliente.</p>`
          : `<div class="notice">La factura quedará pendiente de cobro. Para registrar el pago, necesitas acceso a Pagos de Clientes y formas de pago activas.</div>`
      }`;
    $("documentForm").querySelector(".form-footer").before(caja);
    if (!(puedeCobrar && metodos.length)) {
      const botonFactura = $("documentForm").querySelector(
        'button[type="submit"]',
      );
      if (botonFactura)
        botonFactura.textContent = "Emitir factura pendiente de cobro";
    }
    if (puedeCobrar && metodos.length) {
      const metodo = $("metodoCaja");
      const indiceEfectivo = metodos.findIndex((m) =>
        /^efectivo$/i.test(String(m.ETIQUETA).trim()),
      );
      if (indiceEfectivo >= 0)
        metodo.value = String(metodos[indiceEfectivo].ID);

      const condicion = $("documentForm").querySelector(
        '[name="condicion_pago"]',
      );
      const cobrar = $("cobrarAhora");
      const esEfectivo = () =>
        /efectivo/i.test(metodo.selectedOptions[0]?.textContent || "");
      const actualizarCaja = () => {
        const contado = condicion.value === "CONTADO";
        cobrar.disabled = !contado;
        if (!contado) cobrar.checked = false;
        const activo = contado && cobrar.checked;
        const botonFactura = $("documentForm").querySelector(
          'button[type="submit"]',
        );
        if (botonFactura) {
          botonFactura.textContent = activo
            ? "Cobrar y emitir factura"
            : contado
              ? "Emitir factura sin cobrar"
              : "Emitir factura al crédito";
        }
        $("datosCobro").hidden = !activo;
        const efectivo = activo && esEfectivo();
        $("grupoRecibido").hidden = !efectivo;
        $("grupoReferencia").hidden = !activo || efectivo;
        $("efectivoRecibido").required = efectivo;
        $("referenciaCaja").required = activo && !efectivo;
        const total = Number(caja.dataset.total || 0);
        $("totalCaja").textContent = money(total);
        const recibido = Number($("efectivoRecibido").value || 0);
        const cambio = efectivo ? Math.max(0, recibido - total) : 0;
        $("cambioCaja").textContent = money(cambio);
        $("mensajeCaja").textContent = !contado
          ? "Las facturas a crédito quedan pendientes para su cobro posterior."
          : !activo
            ? "Se emitirá la factura sin registrar pago; quedará pendiente."
            : efectivo && recibido < total
              ? "Indica cuánto dinero recibiste; debe cubrir el total de la factura."
              : "El cambio definitivo se validará con el total calculado por Oracle.";
      };
      condicion.addEventListener("change", () => {
        if (condicion.value === "CONTADO") cobrar.checked = true;
        actualizarCaja();
      });
      cobrar.addEventListener("change", actualizarCaja);
      metodo.addEventListener("change", actualizarCaja);
      $("efectivoRecibido").addEventListener("input", actualizarCaja);
      actualizarCaja();
      caja.actualizarCaja = actualizarCaja;
    }
  }
                              
  if (kind === "facturas") {
    const selector = $("documentForm").querySelector('[name="id_cliente"]');

    const campoSelector = selector.closest(".field");
    const area = document.createElement("div");

    area.style.gridColumn = "1 / -1";

    area.innerHTML = `
      <h3>¿A nombre de quien facturamos?</h3>

      <div class="form-grid" id="datosClienteNuevo">

        <label class="field">
          Nombres *
          <input
            name="nuevo_nombres"
            maxlength="100"
            required
          >
        </label>

        <label class="field">
          Apellidos *
          <input
            name="nuevo_apellidos"
            maxlength="100"
            required
          >
        </label>

        <label class="field">
          NIT (opcional)
          <input
            name="nuevo_nit"
            maxlength="20"
            placeholder="NIT si corresponde"
          >
        </label>

        <label class="field">
          Telefono (opcional)
          ${controlTelefono("nuevo_telefono", "", cajero.CODIGO_TELEFONO)}
        </label>

      </div>

      <label style="display:block;margin-top:12px;font-size:12px">
        <input
          type="checkbox"
          id="modoClienteRegistrado"
        >
        Elegir un cliente que ya esta registrado
      </label>
    `;

    campoSelector.before(area);
    prepararTelefono($("documentForm"));

    function elegirModoCliente() {
      const existente = $("modoClienteRegistrado").checked;

      campoSelector.hidden = !existente;
      selector.disabled = !existente;
      selector.required = existente;

      $("datosClienteNuevo").hidden = existente;

      for (const inp of $("datosClienteNuevo").querySelectorAll("input")) {
        inp.disabled = existente;

        if (inp.name === "nuevo_nombres" || inp.name === "nuevo_apellidos") {
          inp.required = !existente;
        }
      }
    }

    $("modoClienteRegistrado").onchange = elegirModoCliente;
    elegirModoCliente();
  }
  function headerTitle() {
    return headerUI(kind);
  }
  function makeLine() {
    const child = document.createElement("div");
    child.className = "line-card";
    child.innerHTML = `<div class="form-grid">${template}</div><div class="form-footer"><button type="button" class="btn danger">Quitar línea</button></div>`;
    child.querySelector("button").onclick = () => {
      child.remove();
      updateCount();
    };
    $("lines").append(child);
    child.addEventListener("input", updateCount);
    child.addEventListener("change", updateCount);

                            
    if (kind === "compras") {
      const productoCompra = child.querySelector(
        '[name="id_producto_sucursal"]',
      );

      const costoCompra = child.querySelector('[name="costo_unitario"]');

      if (productoCompra && costoCompra) {
        costoCompra.min = "0";
        costoCompra.step = "0.01";

        const ayuda = document.createElement("small");
        ayuda.className = "micro";
        ayuda.textContent =
          "Costo sugerido de Oracle. Verifica el precio real del proveedor.";

        costoCompra.closest("label.field")?.append(ayuda);

        function cargarCosto() {
          const opcion = productoCompra.selectedOptions[0];
          const costo = opcion?.dataset.cost;

          if (!opcion?.value || costo == null || costo === "") {
            costoCompra.value = "";
          } else {
            const numero = Number(costo);
            costoCompra.value =
              Number.isFinite(numero) && numero >= 0 ? numero.toFixed(2) : "";
          }

          updateCount();
        }

        productoCompra.addEventListener("change", cargarCosto);
        cargarCosto();
      }
    }
    applyBranch();
    updateCount();
  }
  function applyBranch() {
    const master = $("documentForm").querySelector(
      "[name=id_empleado_sucursal]",
    );
    if (!master) return;
    const sucursal = master.dataset.sucursal || master.selectedOptions?.[0]?.dataset.sucursal;
    for (const list of $("lines").querySelectorAll(
      "[name=id_producto_sucursal]",
    )) {
      for (const opt of list.options) {
        if (!opt.value) continue;
        const valid = !sucursal || opt.dataset.sucursal === sucursal;
        opt.disabled = !valid;
        if (!valid && opt.selected) list.value = "";
      }
    }
  }
  function updateCount() {
    $("lineCount").textContent = $("lines").children.length;
    let total = 0;
    for (const item of $("lines").children) {
      const product = item.querySelector("[name=id_producto_sucursal]");
      const quantity = Number(
        item.querySelector("[name=cantidad]")?.value || 0,
      );
      const discount = Number(
        item.querySelector("[name=descuento]")?.value || 0,
      );
      const directCost = Number(
        item.querySelector("[name=costo_unitario]")?.value || 0,
      );
      const selected = product?.selectedOptions[0];
      const price =
        kind === "compras" ? directCost : Number(selected?.dataset.price || 0);
      total += Math.max(
        0,
        quantity * price - (kind === "facturas" ? discount : 0),
      );
    }
    if ($("estimate")) $("estimate").textContent = money(total);
    const caja = $("totalCaja")?.closest(".card");
    if (caja) {
      caja.dataset.total = String(total);
      if (typeof caja.actualizarCaja === "function") caja.actualizarCaja();
    }
    if ($("taxEstimate"))
      $("taxEstimate").textContent =
        kind === "facturas"
          ? `IVA incluido (12%): ${money(total - total / 1.12)} · Precio final validado por Oracle`
          : "Estimación informativa · El saldo definitivo lo calcula Oracle";
  }
  $("addLine").onclick = makeLine;
  makeLine();
  $("documentForm")
    .querySelector("[name=id_empleado_sucursal]")
    ?.addEventListener("change", applyBranch);
  $("documentForm").onsubmit = async (e) => {
    e.preventDefault();
    const guardar = e.target.querySelector('button[type="submit"]');
    if (guardar.disabled) return;
    try {
      const master = Object.fromEntries(new FormData(e.target));
      const details = [...$("lines").children].map((child) => payload(child));
      if (!details.length) throw Error("Agrega al menos un detalle");
      const request = { ...master, detalles: details };

      if (kind === "notas-credito") {
        request.apto_reingreso_stock = $("ncAptoReingreso")?.checked === true;
      }

      if (kind === "facturas" && !$("modoClienteRegistrado").checked) {
        request.cliente_nuevo = {
          nombres: master.nuevo_nombres,
          apellidos: master.nuevo_apellidos,
          nit: master.nuevo_nit,
          telefono: formatearTelefono(e.target, "nuevo_telefono"),
        };
        delete request.id_cliente;
        for (const nombre of [
          "nuevo_nombres",
          "nuevo_apellidos",
          "nuevo_nit",
          "nuevo_telefono",
        ]) {
          delete request[nombre];
        }
      }

      let confirmar =
        "¿Registrar el documento y actualizar el inventario en Oracle?";
      if (
        kind === "facturas" &&
        $("cobrarAhora")?.checked &&
        !$("cobrarAhora").disabled
      ) {
        const totalEstimado = Number(
          $("totalCaja")?.closest(".card")?.dataset.total || 0,
        );
        const efectivo = /efectivo/i.test(
          $("metodoCaja").selectedOptions[0]?.textContent || "",
        );
        const recibido = $("efectivoRecibido").value;
        if (totalEstimado <= 0) throw Error("El total debe ser mayor que cero");
        if (
          efectivo &&
          (recibido === "" ||
            !Number.isFinite(Number(recibido)) ||
            Number(recibido) < totalEstimado - 0.005)
        ) {
          throw Error("El dinero recibido no alcanza para la venta estimada");
        }
        request.cobro_inmediato = {
          id_metodo_pago: Number($("metodoCaja").value),
          efectivo_recibido: efectivo ? recibido : null,
          referencia: $("referenciaCaja").value,
        };
        confirmar = `¿Emitir la factura y cobrar ${money(totalEstimado)} aproximadamente? Oracle validará el total exacto.`;
      }
      if (
        kind === "compras" &&
        $("pagarCompraAhora")?.checked &&
        !$("pagarCompraAhora").disabled
      ) {
        const metodo = Number($("metodoPagoCompra").value);

        if (!Number.isSafeInteger(metodo) || metodo <= 0)
          throw Error("Selecciona una forma de pago");

        request.pago_compra_inmediato = {
          id_metodo_pago: metodo,
          referencia: $("referenciaPagoCompra").value,
        };

        confirmar = "¿Registrar la compra y pagar su total exacto en Oracle?";
      }
      if (kind === "facturas") {
        const modo = $("modalidadEntregaFactura").value;
        if (!["CAJA", "ENVIO"].includes(modo))
          throw Error("Selecciona la forma de entrega de los productos");
        confirmar += modo === "CAJA"
          ? "\nLos productos quedarán registrados como ENTREGADOS EN CAJA."
          : "\nLos productos quedarán PENDIENTES PARA ENVÍO O RETIRO POSTERIOR.";
      }
      if (!confirm(confirmar)) return;
      guardar.disabled = true;
      const r = await api("/transacciones/documentos/" + kind, {
        method: "POST",
        body: JSON.stringify(request),
      });
      await openPage(state.current);
      if (r.pagoCompra?.pagado) {
        message(
          `Compra #${r.id} registrada y pagada: ${money(r.pagoCompra.total)}`,
        );

        modal(
          `<p>Compra <strong>#${escape(r.id)}</strong> registrada.</p>
          <p style="margin-top:12px">
            Pago realizado: <strong>${escape(money(r.pagoCompra.total))}</strong>
            mediante ${escape(r.pagoCompra.metodo)}.
          </p>`,
          "Compra y pago confirmados",
          "Mercaderia ingresada y proveedor pagado",
        );
      } else if (r.cobro?.pagado) {
        message(
          `Factura #${r.id} cobrada: ${money(r.cobro.total)} · Cambio: ${money(r.cobro.cambio)}`,
        );
        modal(
          `<div class="summary-box" style="flex-wrap:wrap;gap:16px">
          <span>Factura <strong>#${escape(r.id)}</strong></span>
          <span>Total cobrado <strong>${escape(money(r.cobro.total))}</strong></span>
          <span>Cambio a entregar <strong>${escape(money(r.cobro.cambio))}</strong></span>
        </div><p style="margin-top:15px">Pago registrado en Oracle por ${escape(r.cobro.metodo)}. La factura quedó pagada.</p>
        <p style="margin-top:10px"><strong>Entrega:</strong> ${r.modalidad_entrega === "CAJA" ? "Productos entregados en caja" : "Pendiente para envío o retiro posterior"}.</p>`,
          "Venta y cobro confirmados",
          "Operación finalizada correctamente",
        );
      } else {
        message(
          `Documento registrado #${r.id} (${r.detalles} líneas). ${kind === "facturas" ? "Pendiente de cobro." : ""}`,
        );
      }
    } catch (err) {
      message(err.message, true);
    } finally {
      if (guardar.isConnected) guardar.disabled = false;
    }
  };
}

export { documentForm };
