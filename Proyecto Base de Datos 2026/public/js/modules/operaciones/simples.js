                                                                        
import { openPage } from "../../core/navigation.js";
import { $, api, button, escape, has, label, message, money, renderDate } from "../../core/state.js";
import { header, options, payload } from "../../core/ui.js";

async function simpleOperation(kind) {
  const esCliente = kind === "venta-pago";
  const ruta = esCliente ? "/ventas/pagos" : "/compras/pagos";
  const clave = esCliente ? "cobros-pendientes" : "compras-pendientes";
  const historial = esCliente
    ? "historial-cobros"
    : "historial-pagos-proveedores";
  const nombreDocumento = esCliente ? "factura" : "compra";
  const [pendientes, empleados, metodos] = await Promise.all([
    api("/consultas/" + clave + "?limite=300"),
    options("EMPLEADO_SUCURSAL", ruta),
    options("METODO_PAGO", ruta),
  ]);

  const encabezado = esCliente ? "Cobros pendientes" : "Pagos a proveedores";
  const descripcion = esCliente
    ? "Busca una factura, revisa el cliente y recibe el pago completo o un abono."
    : "Busca una compra, revisa el proveedor y registra el pago o un abono.";
  const opciones = pendientes
    .map((p) => {
      const numero = esCliente ? `${p.SERIE}-${p.NUMERO}` : p.NUMERO;
      return `<option value="${escape(p.ID)}">${escape(numero + " · " + p.TITULAR + " · Pendiente " + money(p.SALDO))}</option>`;
    })
    .join("");
  const lista = (items) =>
    items
      .map(
        (i) => `<option value="${escape(i.ID)}">${escape(i.ETIQUETA)}</option>`,
      )
      .join("");

  $("content").innerHTML =
    header(encabezado, descripcion) +
    `
    <div class="card">
      <div class="notice">${
        esCliente
          ? "Las ventas de contado se pueden cobrar en Emisión de Factura. Aquí se gestionan los saldos pendientes y abonos."
          : "Los pagos a proveedores no son cobros de clientes. Selecciona la compra correspondiente."
      }</div>
      <form id="commandForm">
        <div class="form-grid" style="margin-top:14px">
          <label class="field" style="grid-column:1/-1">Buscar ${nombreDocumento} o ${esCliente ? "cliente" : "proveedor"}
            <input type="search" id="buscarDocumento" placeholder="Escribe el nombre o número de documento" autocomplete="off">
          </label>
          <label class="field" style="grid-column:1/-1">${esCliente ? "Factura / Cliente" : "Compra / Proveedor"} *
            <select name="${esCliente ? "id_factura" : "id_compra"}" required>
              <option value="">Seleccione el documento...</option>${opciones}
            </select>
          </label>
        </div>
        <div class="summary-box" style="margin:16px 0; flex-wrap:wrap; gap:18px">
          <span><small class="micro">A nombre de</small><br><strong id="titularPago">—</strong></span>
          <span><small class="micro">Total del documento</small><br><strong id="totalPago">—</strong></span>
          <span><small class="micro">Saldo pendiente</small><br><strong id="saldoPago">—</strong></span>
        </div>
        <div class="form-grid">
          <label class="field">Empleado que ${esCliente ? "recibe el cobro" : "realiza el pago"} *
            <select name="id_empleado_sucursal" required>
              <option value="">Seleccione...</option>${lista(empleados)}
            </select>
          </label>
          <label class="field">Forma de pago *
            <select name="id_metodo_pago" required>
              <option value="">Seleccione...</option>${lista(metodos)}
            </select>
          </label>
          <label class="field">Monto del abono (Q) *
            <input type="number" name="monto" min="0.01" step="0.01" required placeholder="0.00">
          </label>
          <label class="field">Referencia (según forma de pago)
            <input type="text" name="referencia" maxlength="50" placeholder="Número de autorización o comprobante">
          </label>
        </div>
        <p class="micro" id="saldoRestante" style="margin-top:14px">Selecciona un documento para consultar el saldo.</p>
        <div class="form-footer">
          <button class="btn green" type="submit" id="guardarCobro" disabled>
            ${esCliente ? "Registrar cobro" : "Registrar pago al proveedor"}
          </button>
        </div>
      </form>
    </div>
    <div class="card">
      <h2>Historial de pagos del documento</h2>
      <div id="historialPagos" class="micro" style="margin-top:14px">
        Selecciona una ${nombreDocumento} para ver sus pagos anteriores.
      </div>
    </div>`;

  const form = $("commandForm");
  const doc = form.querySelector(
    esCliente ? '[name="id_factura"]' : '[name="id_compra"]',
  );
  const monto = form.querySelector('[name="monto"]');
  const metodo = form.querySelector('[name="id_metodo_pago"]');
  const referencia = form.querySelector('[name="referencia"]');
  const guardar = $("guardarCobro");
  const registros = new Map(pendientes.map((p) => [String(p.ID), p]));
  let versionHistorial = 0;

  const actualizarAbono = () => {
    const actual = registros.get(doc.value);
    const valor = Number(monto.value || 0);
    if (!actual) {
      $("saldoRestante").textContent =
        "Selecciona una factura o compra pendiente.";
      guardar.disabled = true;
      return;
    }
    const resto = Number(actual.SALDO) - valor;
    $("saldoRestante").textContent =
      valor > 0
        ? `Después de este abono quedarán pendientes aproximadamente ${money(Math.max(0, resto))}.`
        : "Puedes pagar el saldo completo o escribir un abono menor.";
    guardar.disabled = !(valor > 0 && valor <= Number(actual.SALDO) + 0.005);
  };

  const mostrarDocumento = async () => {
    const actual = registros.get(doc.value);
    $("titularPago").textContent = actual?.TITULAR || "—";
    $("totalPago").textContent = actual ? money(actual.TOTAL) : "—";
    $("saldoPago").textContent = actual ? money(actual.SALDO) : "—";
    monto.value = actual ? Number(actual.SALDO).toFixed(2) : "";
    monto.max = actual ? String(actual.SALDO) : "";
    actualizarAbono();

    const consecutivo = ++versionHistorial;
    if (!actual) {
      $("historialPagos").textContent =
        "Selecciona un documento para revisar sus pagos.";
      return;
    }
    $("historialPagos").textContent = "Consultando movimientos en Oracle...";
    try {
      const lista = await api(
        `/consultas/${historial}?id=${encodeURIComponent(actual.ID)}&limite=300`,
      );
      if (consecutivo !== versionHistorial) return;
      if (!lista.length) {
        $("historialPagos").textContent =
          "Esta factura o compra todavía no tiene pagos registrados.";
      } else {
        $("historialPagos").innerHTML =
          `<div class="table-wrap"><table><thead><tr>
          <th>Fecha</th><th>Monto</th><th>Forma de pago</th><th>Referencia</th>
          </tr></thead><tbody>${lista
            .map(
              (p) => `<tr>
            <td>${escape(renderDate(p.FECHA) || "—")}</td>
            <td>${escape(money(p.MONTO))}</td>
            <td>${escape(p.METODO || "—")}</td>
            <td>${escape(p.REFERENCIA || "—")}</td>
          </tr>`,
            )
            .join("")}</tbody></table></div>`;
      }
    } catch (e) {
      if (consecutivo === versionHistorial) {
        $("historialPagos").textContent =
          "No se pudo consultar el historial: " + e.message;
      }
    }
  };

  $("buscarDocumento").oninput = () => {
    const q = $("buscarDocumento").value.trim().toLowerCase();
    for (const opcion of [...doc.options]) {
      if (!opcion.value) continue;
      opcion.hidden = !opcion.textContent.toLowerCase().includes(q);
    }
  };
  doc.onchange = () => {
    mostrarDocumento().catch((e) => message(e.message, true));
  };
  monto.oninput = actualizarAbono;
  metodo.onchange = () => {
    const nombre = metodo.selectedOptions[0]?.textContent || "";
    referencia.required = !!metodo.value && !/efectivo/i.test(nombre);
  };
  mostrarDocumento();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const actual = registros.get(doc.value);
    if (!actual) return message("Selecciona un documento pendiente", true);
    const importe = Number(monto.value);
    if (
      !Number.isFinite(importe) ||
      importe <= 0 ||
      importe > Number(actual.SALDO) + 0.005
    ) {
      return message(
        "El importe debe ser mayor que cero y no superar el saldo",
        true,
      );
    }
    if (
      !confirm(
        `¿Registrar ${esCliente ? "el cobro" : "el pago"} de ${money(importe)} para ${actual.TITULAR}?`,
      )
    )
      return;
    guardar.disabled = true;
    try {
      await api("/transacciones/" + kind, {
        method: "POST",
        body: JSON.stringify(payload(form)),
      });
      message(
        `${esCliente ? "Cobro" : "Pago"} de ${money(importe)} registrado en Oracle.`,
      );
      try {
        if (kind === "compra-pago" && has("/compras/registro", "C")) {
          await openPage("/compras/registro");
          $("seccionPagosCompra")?.scrollIntoView({ behavior: "smooth" });
        } else {
          await simpleOperation(kind);
        }                                               
      } catch (recargaError) {
        message(
          "El pago se guardó, pero no se pudo actualizar la lista. Recarga la página.",
          true,
        );
      }
    } catch (e) {
      message(e.message, true);
      actualizarAbono();
    }
  };
}
                                                                
                                                             

export { simpleOperation };
