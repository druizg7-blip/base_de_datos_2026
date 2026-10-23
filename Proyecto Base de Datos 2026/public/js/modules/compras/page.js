                                                                 
import { section } from "../../core/navigation.js";
import { $, api, button, escape, has, label, message, money, renderDate } from "../../core/state.js";
import { header, options } from "../../core/ui.js";
import { documentForm } from "../operaciones/documentos.js";
import { simpleOperation } from "../operaciones/simples.js";

async function comprasUnificadas(irAPagos = "alta") {
  const host = $("content");

                                                         
  await documentForm("compras");
  const compraNodos = [...host.childNodes];
  host.replaceChildren();

  let pagoNodos = [];
  let falloPagos = "";

  if (has("/compras/pagos", "C")) {
    try {
      await simpleOperation("compra-pago");
      pagoNodos = [...host.childNodes];
    } catch (err) {
      falloPagos = err.message;
    }
  }

  host.replaceChildren();
  $("pageTitle").textContent = "Compras";

  host.innerHTML =
    header("Compras", "Mercaderia, cuentas por pagar e historial") +
    `
    <div class="card" style="padding:16px">
      <div class="button-bar" role="tablist"
           aria-label="Secciones de compras">

        <button type="button" class="btn green"
                id="tabNuevaCompra">
          Nueva compra
        </button>

        <button type="button" class="btn"
                id="tabPendientesCompra">
          Pendientes
        </button>

        <button type="button" class="btn"
                id="tabHistorialCompra">
          Historial
        </button>

      </div>
    </div>

    <section id="seccionNuevaCompra"></section>

    <section id="seccionPagosCompra" hidden></section>

    <section id="seccionHistorialCompra" hidden>
      <div class="card">
        <h2>Historial de compras</h2>
        <p class="micro">
          Consulta de las ultimas 300 compras registradas en Oracle.
        </p>
        <div id="historialComprasDatos">
          Abre esta pestaña para consultar las compras.
        </div>
      </div>
    </section>
  `;

                             
  for (const nodo of compraNodos) {
    if (nodo.nodeType === 1 && nodo.classList.contains("content-header"))
      continue;

                                                           
    if (
      nodo.nodeType === 1 &&
      nodo.classList.contains("notice") &&
      nodo.textContent.includes("No se permite anular facturas")
    ) {
      nodo.textContent =
        "Registra productos y costos de compra. Oracle actualiza " +
        "las existencias y permite pagar ahora o dejar saldo pendiente.";
    }

    $("seccionNuevaCompra").append(nodo);
  }

                                   
  if (pagoNodos.length) {
    const titulo = document.createElement("div");
    titulo.className = "content-header";

    titulo.innerHTML = `
      <div>
        <h2>Cuentas por pagar</h2>
        <p>
          Selecciona una compra pendiente para abonar o liquidarla.
        </p>
      </div>
    `;

    $("seccionPagosCompra").append(titulo);

    for (const nodo of pagoNodos) {
      if (nodo.nodeType === 1 && nodo.classList.contains("content-header"))
        continue;

      $("seccionPagosCompra").append(nodo);
    }

    const selector =
      $("seccionPagosCompra").querySelector('[name="id_compra"]');

    const hayPendientes =
      selector && [...selector.options].some((o) => o.value);

    if (!hayPendientes) {
      $("seccionPagosCompra").innerHTML = `
        <div class="card">
          <h2>Cuentas por pagar</h2>
          <div class="empty">
            No hay compras con saldo pendiente.
            Las compras pagadas se consultan en Historial.
          </div>
        </div>
      `;
    }
  } else {
    const texto = falloPagos
      ? escape(falloPagos)
      : "No tienes permiso para consultar pagos de proveedores.";

    $("seccionPagosCompra").innerHTML =
      `<div class="card"><p>${texto}</p></div>`;
  }

                                       
                                     
                                                 
  {
    const zona = $("seccionPagosCompra");
    const formPago = zona.querySelector("#commandForm");
    const selectorCompra = formPago?.querySelector('select[name="id_compra"]');

    const pendientes = selectorCompra
      ? [...selectorCompra.options].filter((o) => o.value)
      : [];

    if (formPago && pendientes.length) {
      const panelPago = formPago.closest(".card");
      const panelHistorial = zona
        .querySelector("#historialPagos")
        ?.closest(".card");

                                              
      const busqueda = zona.querySelector("#buscarDocumento, #cpBuscar");
      if (busqueda) {
        busqueda.closest("label")?.setAttribute("hidden", "");
      }

      const campoCompra = selectorCompra.closest("label");
      if (campoCompra) campoCompra.hidden = true;

      const avisoAntiguo = panelPago.querySelector(".notice");
      if (avisoAntiguo) avisoAntiguo.hidden = true;

                                                    
      const panelLista = document.createElement("div");
      panelLista.className = "card";

      panelLista.innerHTML = `
        <h2>Compras con saldo pendiente (${pendientes.length})</h2>

        <p class="micro" style="margin:8px 0 18px">
          Elige la compra que deseas pagar o abonar.
        </p>

        <div style="
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
          gap:12px
        ">
          ${pendientes
            .map((opcion) => {
              const partes = opcion.textContent.split(" · ");
              const documento = partes[0]?.trim() || "Compra";
              const proveedor = partes[1]?.trim() || "Proveedor";

              const saldo =
                partes
                  .slice(2)
                  .join(" · ")
                  .replace(/^Pendiente\s*/i, "") || "Saldo por pagar";

              return `
              <button
                type="button"
                class="btn"
                data-pendiente-id="${escape(opcion.value)}"
                aria-pressed="false"
                style="
                  text-align:left;
                  white-space:normal;
                  height:auto;
                  padding:16px
                "
              >
                <strong>Documento ${escape(documento)}</strong>
                <br>
                <span>${escape(proveedor)}</span>
                <br>
                <strong style="color:#222222">
                  Saldo: ${escape(saldo)}
                </strong>
                <br>
                <small>Seleccionar para pagar / abonar →</small>
              </button>
            `;
            })
            .join("")}
        </div>
      `;

      panelPago.before(panelLista);

                                                       
      panelPago.hidden = true;
      if (panelHistorial) panelHistorial.hidden = true;

      for (const boton of panelLista.querySelectorAll("[data-pendiente-id]")) {
        boton.onclick = () => {
          selectorCompra.value = boton.dataset.pendienteId;

          selectorCompra.dispatchEvent(new Event("change", { bubbles: true }));

          panelPago.hidden = false;
          if (panelHistorial) panelHistorial.hidden = false;

          for (const otro of panelLista.querySelectorAll(
            "[data-pendiente-id]",
          )) {
            const elegido = otro === boton;
            otro.setAttribute("aria-pressed", String(elegido));
            otro.style.outline = elegido ? "2px solid #222222" : "";
          }

          panelPago.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        };
      }
    }
  }
  let historialCargado = false;

  async function cargarHistorial() {
    const destino = $("historialComprasDatos");
    destino.textContent = "Consultando Oracle...";

    try {
      const [compras, proveedores] = await Promise.all([
        api("/consultas/compras?limite=300"),
        options("PROVEEDOR", "/compras/registro"),
      ]);

      const nombres = new Map(
        proveedores.map((p) => [String(p.ID), p.ETIQUETA]),
      );

      const lista = compras
        .filter((c) => c.ESTADO_REGISTRO !== "I")
        .sort((a, b) => Number(b.ID_COMPRA) - Number(a.ID_COMPRA));

      if (!lista.length) {
        destino.innerHTML =
          '<div class="empty">Todavia no hay compras registradas.</div>';
        return;
      }

      destino.innerHTML = `
        <label class="field" style="margin:14px 0">
          Buscar documento o proveedor
          <input
            type="search"
            id="buscarHistorialCompra"
            placeholder="Numero o proveedor"
          >
        </label>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Documento</th>
                <th>Proveedor</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody id="filasHistorialCompra">
              ${lista
                .map((c) => {
                  const proveedor =
                    nombres.get(String(c.ID_PROVEEDOR)) ||
                    "Proveedor #" + c.ID_PROVEEDOR;

                  const pendiente = Number(c.SALDO || 0) > 0.005;

                  const buscar = (
                    String(c.NUMERO_DOCUMENTO || "") +
                    " " +
                    proveedor
                  ).toLowerCase();

                  return `
                  <tr data-buscar="${escape(buscar)}">
                    <td>
                      ${escape(c.NUMERO_DOCUMENTO || "#" + c.ID_COMPRA)}
                    </td>
                    <td>${escape(proveedor)}</td>
                    <td>
                      ${escape(renderDate(c.FECHA) || "-")}
                    </td>
                    <td>${escape(money(c.TOTAL))}</td>
                    <td>${escape(money(c.SALDO))}</td>
                    <td>
                      <span class="status ${pendiente ? "inactive" : ""}">
                        ${pendiente ? "Pendiente" : "Pagada"}
                      </span>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `;

      $("buscarHistorialCompra").oninput = (e) => {
        const q = e.target.value.trim().toLowerCase();

        for (const fila of $("filasHistorialCompra").rows) {
          fila.hidden = !fila.dataset.buscar.includes(q);
        }
      };
    } catch (err) {
      destino.textContent = "No se pudo cargar el historial: " + err.message;

      historialCargado = false;
    }
  }

                                       
  function seleccionar(nombre) {
    comprasUnificadas.pestana = nombre;

    for (const [pestana, seccion, boton] of [
      ["nueva", "seccionNuevaCompra", "tabNuevaCompra"],
      ["pendientes", "seccionPagosCompra", "tabPendientesCompra"],
      ["historial", "seccionHistorialCompra", "tabHistorialCompra"],
    ]) {
      $(seccion).hidden = pestana !== nombre;

      $(boton).className = "btn" + (pestana === nombre ? " green" : "");

      $(boton).setAttribute(
        "aria-pressed",
        pestana === nombre ? "true" : "false",
      );
    }

    if (nombre === "historial" && !historialCargado) {
      historialCargado = true;

      cargarHistorial().catch((e) => message(e.message, true));
    }
  }

  $("tabNuevaCompra").onclick = () => seleccionar("nueva");

  $("tabPendientesCompra").onclick = () => seleccionar("pendientes");

  $("tabHistorialCompra").onclick = () => seleccionar("historial");

  seleccionar(
    irAPagos === "pagos" || irAPagos === "pendientes"
      ? "pendientes"
      : comprasUnificadas.pestana || "nueva",
  );
}
                                                                        

export { comprasUnificadas };
