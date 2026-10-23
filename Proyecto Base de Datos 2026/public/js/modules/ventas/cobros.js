                                                                  
import { section } from "../../core/navigation.js";
import { $, api, button, escape, has, label, message, money } from "../../core/state.js";
import { options } from "../../core/ui.js";
import { ventasUnificadas } from "./page.js";

                                   
async function cuentasPorCobrar() {
  const host = $("content");
  const ruta = "/ventas/pagos";
  const puedeCobrar = has(ruta, "I");

  const [pendientes, pagos] = await Promise.all([
    api("/consultas/cobros-pendientes?limite=300"),
    api("/consultas/pagos-clientes?limite=300")
  ]);

  let facturas = [];

  if (has("/ventas/facturar", "C")) {
    facturas = await api("/consultas/facturas?limite=300");
  }

  const [cajero, metodos] = puedeCobrar
    ? await Promise.all([
        api("/ventas/mi-caja"),
        options("METODO_PAGO", ruta)
      ])
    : [null, []];

  const facturasPorId = new Map(
    facturas.map(f => [String(f.ID_FACTURA), f])
  );

  const metodosPorId = new Map(
    metodos.map(m => [String(m.ID), m.ETIQUETA])
  );

  const pendientesPorId = new Map(
    pendientes.map(f => [String(f.ID), f])
  );

  const totalPendiente = pendientes.reduce(
    (suma, f) => suma + Number(f.SALDO || 0),
    0
  );

  const listaOpciones = registros =>
    registros.map(r => `
      <option value="${escape(r.ID)}">
        ${escape(r.ETIQUETA)}
      </option>
    `).join("");

  const numeroFactura = f =>
    `${f.SERIE || ""}-${f.NUMERO || ""}`;

  const historialOrdenado = [...pagos].sort(
    (a, b) =>
      Number(b.ID_PAGO_CLIENTE) -
      Number(a.ID_PAGO_CLIENTE)
  );

  host.innerHTML = `
    <div class="card">
      <h2>Cuentas por cobrar</h2>
      <p class="micro">
        Facturas pendientes, abonos e historial de pagos.
      </p>

      <div class="kpis" style="margin:18px 0">
        <div class="kpi">
          <span class="desc">Saldo pendiente consultado</span>
          <strong class="number">
            ${money(totalPendiente)}
          </strong>
        </div>

        <div class="kpi">
          <span class="desc">Facturas pendientes</span>
          <strong class="number">
            ${pendientes.length}
          </strong>
        </div>

        <div class="kpi">
          <span class="desc">Pagos consultados</span>
          <strong class="number">
            ${pagos.length}
          </strong>
        </div>
      </div>

      <p class="micro">
        Resumen de hasta 300 registros por consulta.
        Las ventas cobradas al facturar no se cobran nuevamente.
      </p>

      <div class="button-bar"
           style="gap:8px;flex-wrap:wrap;margin-top:16px">
        <button type="button"
                class="btn green"
                id="cxpTabPendientes">
          Pendientes
        </button>

        <button type="button"
                class="btn"
                id="cxpTabHistorial">
          Historial de cobros
        </button>
      </div>
    </div>

    <section id="cxpVistaPendientes">
      <div class="card">
        <h2>Facturas pendientes</h2>

        ${pendientes.length ? `
          <label class="field" style="margin:15px 0">
            Buscar cliente o factura
            <input type="search"
                   id="cxpBuscar"
                   placeholder="Nombre o numero de factura">
          </label>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Saldo pendiente</th>
                  <th>Accion</th>
                </tr>
              </thead>

              <tbody id="cxpFilas">
                ${pendientes.map(f => `
                  <tr data-busqueda="${escape(
                    (numeroFactura(f) + " " + f.TITULAR)
                      .toLowerCase()
                  )}">
                    <td>${escape(numeroFactura(f))}</td>
                    <td>${escape(f.TITULAR)}</td>
                    <td>${escape(money(f.TOTAL))}</td>
                    <td>
                      <strong>${escape(money(f.SALDO))}</strong>
                    </td>
                    <td>
                      ${puedeCobrar ? `
                        <button
                          class="btn green"
                          type="button"
                          data-cxp-abono="${escape(f.ID)}">
                          Registrar abono
                        </button>
                      ` : "Solo consulta"}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty" style="padding:30px">
            <strong>No hay facturas pendientes de cobro</strong>
            <p>
              Cuando registres una venta a credito,
              aparecera aqui para recibir abonos.
            </p>
          </div>
        `}
      </div>

      <div class="card" id="cxpCajaAbono" hidden>
        <h2>Registrar abono</h2>

        <div class="notice">
          El pago se vinculara a la factura seleccionada.
          Oracle validara el saldo antes de registrarlo.
        </div>

        <div class="summary-box"
             style="margin:16px 0;gap:18px;flex-wrap:wrap">
          <span id="cxpFacturaSeleccionada"></span>
          <span>
            Saldo actual:
            <strong id="cxpSaldoActual"></strong>
          </span>
        </div>

        <form id="cxpFormulario">
          <div class="form-grid">
            <label class="field">
              Empleado que recibe el cobro *
              <input type="hidden" name="id_empleado_sucursal" value="${escape(cajero?.ID_EMPLEADO_SUCURSAL || '')}">
              <div class="notice">${escape(cajero?.ETIQUETA || '')}</div>
            </label>

            <label class="field">
              Forma de pago *
              <select name="id_metodo_pago" required>
                <option value="">Selecciona...</option>
                ${listaOpciones(metodos)}
              </select>
            </label>

            <label class="field">
              Importe del abono (Q) *
              <input name="monto"
                     type="number"
                     min="0.01"
                     step="0.01"
                     required>
            </label>

            <label class="field">
              Referencia de pago
              <input name="referencia"
                     type="text"
                     maxlength="50"
                     placeholder="Autorizacion o comprobante">
            </label>
          </div>

          <p class="micro" id="cxpSaldoPosterior"
             style="margin:14px 0"></p>

          <div class="button-bar">
            <button type="button"
                    class="btn"
                    id="cxpCancelar">
              Cancelar
            </button>

            <button type="submit"
                    class="btn green"
                    id="cxpConfirmar">
              Confirmar abono
            </button>
          </div>
        </form>
      </div>
    </section>

    <section id="cxpVistaHistorial" hidden>
      <div class="card">
        <h2>Historial de cobros</h2>

        <p class="micro">
          Hasta 300 pagos consultados desde Oracle.
          Cada pago conserva su factura original.
        </p>

        <label class="field" style="margin:15px 0">
          Buscar factura o cliente
          <input type="search"
                 id="cxpBuscarHistorial"
                 placeholder="Factura o cliente">
        </label>

        ${historialOrdenado.length ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Metodo</th>
                  <th>Referencia</th>
                </tr>
              </thead>

              <tbody id="cxpHistorialFilas">
                ${historialOrdenado.map(p => {
                  const f = facturasPorId.get(
                    String(p.ID_FACTURA)
                  );

                  const numero = f
                    ? numeroFactura(f)
                    : "Factura #" + p.ID_FACTURA;

                  const cliente = f?.CLIENTE || "";

                  const metodo =
                    metodosPorId.get(
                      String(p.ID_METODO_PAGO)
                    ) || "Metodo #" + p.ID_METODO_PAGO;

                  const busqueda =
                    (numero + " " + cliente).toLowerCase();

                  return `
                    <tr data-busqueda="${escape(busqueda)}">
                      <td>${escape(numero)}</td>
                      <td>${escape(cliente || "—")}</td>
                      <td>${escape(
                        String(p.FECHA || "").slice(0, 10)
                      )}</td>
                      <td>${escape(money(p.MONTO))}</td>
                      <td>${escape(metodo)}</td>
                      <td>${escape(p.REFERENCIA || "—")}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="empty">
            <strong>Sin pagos registrados</strong>
            <p>El historial aparecera despues del primer cobro.</p>
          </div>
        `}
      </div>
    </section>
  `;

  const pendientesVista = $("cxpVistaPendientes");
  const historialVista = $("cxpVistaHistorial");
  const tabPendientes = $("cxpTabPendientes");
  const tabHistorial = $("cxpTabHistorial");

  function cambiarVista(historial) {
    pendientesVista.hidden = historial;
    historialVista.hidden = !historial;

    tabPendientes.classList.toggle("green", !historial);
    tabHistorial.classList.toggle("green", historial);
  }

  tabPendientes.onclick = () => cambiarVista(false);
  tabHistorial.onclick = () => cambiarVista(true);

  function buscar(input, tabla) {
    if (!input || !tabla) return;

    input.addEventListener("input", () => {
      const texto = input.value.trim().toLowerCase();

      tabla.querySelectorAll("tr").forEach(fila => {
        fila.hidden = !fila.dataset.busqueda.includes(texto);
      });
    });
  }

  buscar($("cxpBuscar"), $("cxpFilas"));
  buscar(
    $("cxpBuscarHistorial"),
    $("cxpHistorialFilas")
  );

  if (!puedeCobrar) return;

  const caja = $("cxpCajaAbono");
  const formulario = $("cxpFormulario");
  const campoMonto = formulario.elements.monto;
  const campoMetodo = formulario.elements.id_metodo_pago;
  const campoReferencia = formulario.elements.referencia;

  let facturaSeleccionada = null;

  function actualizarImporte() {
    const saldo = Number(
      facturaSeleccionada?.SALDO || 0
    );

    const importe = Number(campoMonto.value || 0);
    const restante = saldo - importe;

    $("cxpSaldoPosterior").textContent =
      importe > 0
        ? "Despues del abono quedarian " +
          money(Math.max(0, restante)) + " pendientes."
        : "Ingresa el importe que entrega el cliente.";

    $("cxpSaldoPosterior").style.color =
      importe > saldo + 0.005
        ? "#222222"
        : "";
  }

  host.querySelectorAll("[data-cxp-abono]")
    .forEach(boton => {
      boton.onclick = () => {
        const factura = pendientesPorId.get(
          boton.dataset.cxpAbono
        );

        if (!factura) return;

        facturaSeleccionada = factura;
        formulario.reset();

        $("cxpFacturaSeleccionada").textContent =
          numeroFactura(factura) +
          " · " + factura.TITULAR;

        $("cxpSaldoActual").textContent =
          money(factura.SALDO);

        campoMonto.value =
          Number(factura.SALDO).toFixed(2);

        campoMonto.max = String(factura.SALDO);

        caja.hidden = false;
        actualizarImporte();

        caja.scrollIntoView({
          behavior: "smooth",
          block: "nearest"
        });
      };
    });

  $("cxpCancelar").onclick = () => {
    caja.hidden = true;
    facturaSeleccionada = null;
    formulario.reset();
  };

  campoMonto.addEventListener(
    "input",
    actualizarImporte
  );

  campoMetodo.addEventListener("change", () => {
    const nombre =
      campoMetodo.selectedOptions[0]?.textContent
        .trim().toUpperCase() || "";

    campoReferencia.required =
      Boolean(campoMetodo.value) &&
      nombre !== "EFECTIVO";
  });

  formulario.onsubmit = async e => {
    e.preventDefault();

    const factura = facturaSeleccionada;
    const monto = Number(campoMonto.value);

    if (!factura) {
      return message(
        "Selecciona una factura pendiente",
        true
      );
    }

    if (
      !Number.isFinite(monto) ||
      monto <= 0 ||
      Math.round(monto * 100) / 100 >
        Number(factura.SALDO) + 0.005
    ) {
      return message(
        "El importe debe ser mayor que cero y no superar el saldo",
        true
      );
    }

    const empleado = Number(
      formulario.elements.id_empleado_sucursal.value
    );

    const metodo = Number(campoMetodo.value);

    if (
      !Number.isSafeInteger(empleado) ||
      empleado < 1 ||
      !Number.isSafeInteger(metodo) ||
      metodo < 1
    ) {
      return message(
        "Selecciona forma de pago y verifica la cuenta del empleado",
        true
      );
    }

    if (!formulario.reportValidity()) return;

    if (!confirm(
      "Registrar abono de " + money(monto) +
      " para " + factura.TITULAR +
      " en factura " + numeroFactura(factura) + "?"
    )) return;

    const boton = $("cxpConfirmar");
    boton.disabled = true;

    let registrado = false;

    try {
      await api("/transacciones/venta-pago", {
        method: "POST",
        body: JSON.stringify({
          id_factura: Number(factura.ID),
          id_empleado_sucursal: empleado,
          id_metodo_pago: metodo,
          monto,
          referencia:
            campoReferencia.value.trim() || null
        })
      });

      registrado = true;

      message(
        "Abono registrado correctamente en Oracle."
      );

      await ventasUnificadas("cobros");

    } catch (err) {
      message(
        registrado
          ? "El abono fue registrado, pero fallo la recarga. Actualiza la pagina."
          : err.message,
        true
      );

      if (!registrado) boton.disabled = false;
    }
  };
}

export { cuentasPorCobrar };
