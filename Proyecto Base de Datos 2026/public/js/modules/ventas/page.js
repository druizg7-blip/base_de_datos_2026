                                                                
import { section } from "../../core/navigation.js";
import { $, api, button, escape, has, label, message, money } from "../../core/state.js";
import { header, options, modal, closeModal } from "../../core/ui.js";
import { openCatalogForm } from "../catalogos/formulario.js";
import { catalogPage } from "../catalogos/listado.js";
import { garantiaVinculada } from "../garantias/page.js";
import { documentForm } from "../operaciones/documentos.js";
import { cuentasPorCobrar } from "./cobros.js";

async function ventasUnificadas(tab = "nueva", idOriginal = null) {
  const permisos = {
    nueva: "/ventas/facturar",
    facturas: "/ventas/facturar",
    cobros: "/ventas/pagos",
    nota: "/ventas/notas-credito",
    devoluciones: "/ventas/devoluciones",
    garantias: "/ventas/garantias",
  };

  if (!permisos[tab] || !has(permisos[tab], "C")) {
    throw Error("No tienes permiso para esta seccion");
  }

  ventasUnificadas.pestana = tab;
  const host = $("content");

  if (tab === "nueva") {
    await documentForm("facturas");
  } else if (tab === "cobros") {
    await cuentasPorCobrar();
  } else if (tab === "nota") {
    await documentForm("notas-credito");
  } else if (tab === "garantias") {
    await garantiaVinculada(idOriginal);
  } else if (tab === "devoluciones") {
    await catalogPage("DEVOLUCION");

    host.querySelector('button[data-action="add"]')?.remove();

    const aviso = document.createElement("div");
    aviso.className = "notice";
    aviso.textContent =
      "Las devoluciones vinculadas se registran desde " +
      "Ventas > Facturas > Devolucion. " +
      "No es necesario registrarlas dos veces.";

    host.prepend(aviso);
  } else if (tab === "facturas") {
    const facturas = await api("/consultas/facturas?limite=300");

    facturas.sort((a, b) => Number(b.ID_FACTURA) - Number(a.ID_FACTURA));

    host.innerHTML = `
      <div class="card">
        <h2>Facturas emitidas</h2>
        <p class="micro">
          Busca una factura para ver sus productos y gestionar postventa.
        </p>

        <label class="field" style="margin:15px 0">
          Buscar factura o cliente
          <input id="buscarFacturaVenta" type="search"
                 placeholder="Numero o nombre del cliente">
        </label>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Factura</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Saldo</th>
                <th>Pago</th>
                <th>Entrega</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="filasFacturasVenta">
              ${facturas
                .map((f) => {
                  const numero = `${f.SERIE || ""}-${f.NUMERO || ""}`;

                  const busqueda = (
                    numero +
                    " " +
                    (f.CLIENTE || "")
                  ).toLowerCase();

                  return `
                  <tr data-filtro="${escape(busqueda)}">
                    <td>${escape(numero)}</td>
                    <td>${escape(f.CLIENTE || "-")}</td>
                    <td>${escape(money(f.TOTAL))}</td>
                    <td>${escape(money(f.SALDO))}</td>
                    <td>${escape(f.ESTADO || "-")}</td>
                    <td>
                      ${f.MODALIDAD_ENTREGA === "CAJA"
                        ? "Entregado en caja"
                        : f.MODALIDAD_ENTREGA === "ENVIO"
                          ? "Para envío / retiro posterior"
                          : "<strong>Sin clasificar (factura antigua)</strong>"}
                    </td>
                    <td>
                      <div class="button-bar"
                           style="flex-wrap:wrap;gap:4px">

                        <button type="button" class="btn"
                          data-factura-accion="detalle"
                          data-id="${escape(f.ID_FACTURA)}">
                          Ver productos
                        </button>

                        ${
                          has("/ventas/facturar", "I") && !f.MODALIDAD_ENTREGA
                            ? `<button type="button" class="btn"
                               data-factura-accion="modalidad"
                               data-id="${escape(f.ID_FACTURA)}">
                               Definir entrega
                             </button>`
                            : ""
                        }

                        ${
                          has("/ventas/notas-credito", "I")
                            ? `<button type="button" class="btn"
                               data-factura-accion="nota"
                               data-id="${escape(f.ID_FACTURA)}">
                               Nota de credito
                             </button>`
                            : ""
                        }

                        ${
                          has("/ventas/devoluciones", "I")
                            ? `<button type="button" class="btn"
                               data-factura-accion="devoluciones"
                               data-id="${escape(f.ID_FACTURA)}">
                               Devolucion
                             </button>`
                            : ""
                        }

                        ${
                          has("/ventas/garantias", "I")
                            ? `<button type="button" class="btn"
                               data-factura-accion="garantias"
                               data-id="${escape(f.ID_FACTURA)}">
                               Garantia
                             </button>`
                            : ""
                        }
                      </div>
                    </td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div id="detalleFacturaVenta"
             style="margin-top:14px"></div>
      </div>
    `;
  }

                                                      
  const contenidoAnterior = [...host.childNodes];
  host.replaceChildren();

  $("pageTitle").textContent = "Ventas";

  const pestanas = [
    ["nueva", "Nueva venta", "/ventas/facturar"],
    ["facturas", "Facturas", "/ventas/facturar"],
    ["devoluciones", "Devoluciones", "/ventas/devoluciones"],
    ["garantias", "Garantias", "/ventas/garantias"],
    ["cobros", "Cuentas por cobrar", "/ventas/pagos"],
  ];

  host.innerHTML =
    header("Ventas", "Facturas, devoluciones, garantias y cobros") +
    `<div class="card" style="padding:14px">
      <div class="button-bar"
           style="flex-wrap:wrap;gap:8px">

        ${pestanas
          .filter(([, , ruta]) => has(ruta, "C"))
          .map(
            ([clave, nombre]) => `
            <button type="button"
                    class="btn ${
                      (tab === "nota" ? "devoluciones" : tab) === clave
                        ? "green"
                        : ""
                    }"
                    data-tab-venta="${clave}">
              ${nombre}
            </button>
          `,
          )
          .join("")}
      </div>
    </div>
    <section id="contenidoVentas"></section>`;

  for (const nodo of contenidoAnterior) {
    if (nodo.nodeType === 1 && nodo.classList.contains("content-header"))
      continue;

    $("contenidoVentas").append(nodo);
  }

  host.querySelectorAll("[data-tab-venta]").forEach((boton) => {
    boton.onclick = () => {
      ventasUnificadas(boton.dataset.tabVenta).catch((e) =>
        message(e.message, true),
      );
    };
  });

                                           
  if (tab === "facturas") {
    $("buscarFacturaVenta").oninput = (e) => {
      const texto = e.target.value.trim().toLowerCase();

      $("filasFacturasVenta")
        .querySelectorAll("tr")
        .forEach((fila) => {
          fila.hidden = !fila.dataset.filtro.includes(texto);
        });
    };

    host.querySelectorAll("[data-factura-accion]").forEach((boton) => {
      boton.onclick = async () => {
        const id = Number(boton.dataset.id);
        const accion = boton.dataset.facturaAccion;

        try {
          if (accion === "modalidad") {
            modal(`
              <div style="padding:18px">
                <p>Esta factura es anterior a la elección de entrega. Indicá lo que <strong>realmente ocurrió</strong>; no se cambiará el pago ni el inventario.</p>
                <label class="field" style="margin-top:14px">Forma de entrega *
                  <select id="ventaModalidadAnterior" required>
                    <option value="">Seleccionar...</option>
                    <option value="CAJA">El cliente recibió los productos en caja</option>
                    <option value="ENVIO">Quedaron para envío o retiro posterior</option>
                  </select>
                </label>
                <button type="button" id="guardarModalidadAnterior" class="btn green" style="margin-top:16px">Confirmar entrega</button>
              </div>
            `, "Definir entrega de factura antigua", "Solo se puede indicar una vez");
            $("guardarModalidadAnterior").onclick = async () => {
              const modalidad = $("ventaModalidadAnterior").value;
              if (!["CAJA", "ENVIO"].includes(modalidad)) {
                message("Seleccioná una modalidad", true);return;
              }
              if (!confirm("¿Confirmás que esta es la modalidad real de esta factura?")) return;
              $("guardarModalidadAnterior").disabled = true;
              try {
                await api(`/ventas/facturas/${id}/modalidad`, {
                  method:"PATCH", body:JSON.stringify({modalidad_entrega:modalidad})
                });
                closeModal();
                await ventasUnificadas("facturas");
                message("Forma de entrega registrada sin cambiar el pago ni el inventario");
              } catch (err) {
                message(err.message,true);
                if ($("guardarModalidadAnterior")) $("guardarModalidadAnterior").disabled=false;
              }
            };
            return;
          }
          if (accion === "devoluciones") {
            await ventasUnificadas("nota", id);
            return;
          }

          if (accion !== "detalle") {
            await ventasUnificadas(accion, id);
            return;
          }

          const lineas = await api(
            `/consultas/detalle-factura?id=${id}&limite=100`,
          );

          const productos = new Map();

          try {
            const lista = await options(
              "PRODUCTO_SUCURSAL",
              "/ventas/facturar",
            );

            lista.forEach((p) => {
              productos.set(String(p.ID), p.ETIQUETA);
            });
          } catch (_) {}

          $("detalleFacturaVenta").innerHTML = `
              <div class="card">
                <h2>Productos de la factura #${escape(id)}</h2>

                ${
                  lineas.length
                    ? lineas
                        .map(
                          (d) => `
                    <p>
                      <strong>${escape(
                        productos.get(String(d.ID_PRODUCTO_SUCURSAL)) ||
                          "Producto",
                      )}</strong>

                      · Cantidad ${escape(d.CANTIDAD)}
                      · ${escape(money(d.SUBTOTAL))}
                    </p>
                  `,
                        )
                        .join("")
                    : "<p>Sin detalles disponibles.</p>"
                }
              </div>
            `;
        } catch (err) {
          message(err.message, true);
        }
      };
    });
  }

                           
  if (tab === "nota") {
    const form = host.querySelector("#documentForm");
    const factura = form?.querySelector('[name="id_factura"]');

    if (!form || !factura) {
      throw Error("No se encontro el formulario de nota de credito");
    }

    const panel = document.createElement("div");
    panel.className = "card";

    panel.innerHTML = `
      <h2>Nota de credito vinculada a una factura</h2>

      <p class="micro" id="ncFacturaInfo">
        Selecciona la factura original.
      </p>

      <div class="notice" style="margin-top:12px">
        Este procedimiento registra la nota de credito y la
        devolucion en una misma transaccion.
        El producto regresara al inventario disponible.
        Utilizalo solamente si la mercaderia esta en buen estado.
      </div>

      <label style="display:flex;gap:10px;align-items:start;margin:15px 0">
        <input type="checkbox" id="ncAptoReingreso">
        <span>
          Confirmo que el producto fue recibido y revisado,
          y esta apto para volver a venderse.
        </span>
      </label>

      <p class="micro" id="ncMensaje">
        El valor de la devolucion se calcula desde la factura.
      </p>
    `;

    form.before(panel);

    const boton = form.querySelector('button[type="submit"]');
    if (boton) {
      boton.textContent = "Registrar nota de credito y devolucion";
    }

    const lineasFactura = new Map();
    const nombresProductos = new Map();

    try {
      const productos = await options("PRODUCTO_SUCURSAL", "/ventas/facturar");

      for (const producto of productos) {
        const nombre = String(producto.ETIQUETA).split(" · Stock")[0];

        nombresProductos.set(String(producto.ID), nombre);
      }
    } catch (_) {
    }

    function revisarNota() {
      let total = 0;
      let problema = "";
      const seleccionados = new Set();

      const bloques = [...form.querySelectorAll("#lines .line-card")];

      if (!Number(factura.value)) {
        problema = "Selecciona la factura original.";
      }

      if (!bloques.length) {
        problema = "Agrega al menos un producto.";
      }

      for (const bloque of bloques) {
        const selector = bloque.querySelector('[name="id_detalle_factura"]');

        const cantidad = bloque.querySelector('[name="cantidad"]');

        if (!selector || !cantidad) continue;

        const detalle = lineasFactura.get(String(selector.value));

        const unidades = Number(cantidad.value);

        if (!detalle) {
          problema ||= "Selecciona un producto de la factura.";
          continue;
        }

        if (seleccionados.has(String(selector.value))) {
          problema ||= "No repitas el mismo producto.";
        }

        seleccionados.add(String(selector.value));

        if (
          cantidad.value === "" ||
          !Number.isFinite(unidades) ||
          unidades <= 0 ||
          unidades > Number(detalle.CANTIDAD)
        ) {
          problema ||= "Cantidad invalida o mayor que la vendida.";
          continue;
        }

        const precioNeto =
          Math.round(
            (Number(detalle.SUBTOTAL) / Number(detalle.CANTIDAD)) * 100,
          ) / 100;

        total += Math.round(unidades * precioNeto * 100) / 100;
      }

      const estimacion = form.querySelector("#estimate");

      if (estimacion) {
        estimacion.textContent = money(total);
      }

      const notaImporte = form.querySelector("#taxEstimate");

      if (notaImporte) {
        notaImporte.textContent =
          "Valor estimado segun la factura original. " +
          "Oracle valida el importe definitivo. " +
          "No registra un reembolso de dinero.";
      }

      $("ncMensaje").textContent =
        problema ||
        "La nota y la devolucion quedaran vinculadas " +
          "a esta factura y sus productos.";

      return problema;
    }

    function mostrarProductos() {
      const bloques = form.querySelectorAll("#lines .line-card");

      for (const bloque of bloques) {
        const selector = bloque.querySelector('[name="id_detalle_factura"]');

        const cantidad = bloque.querySelector('[name="cantidad"]');

        if (!selector || !cantidad) continue;

        const anterior = selector.value;

        selector.replaceChildren(
          new Option("Selecciona el producto devuelto...", ""),
        );

        for (const detalle of lineasFactura.values()) {
          const nombre =
            nombresProductos.get(String(detalle.ID_PRODUCTO_SUCURSAL)) ||
            "Producto #" + detalle.ID_PRODUCTO_SUCURSAL;

          selector.add(
            new Option(
              `${nombre} · Vendidas: ${detalle.CANTIDAD}` +
                ` · ${money(detalle.SUBTOTAL)}`,
              String(detalle.ID_DETALLE_FACTURA),
            ),
          );
        }

        if (lineasFactura.has(anterior)) {
          selector.value = anterior;
        } else if (lineasFactura.size === 1) {
          selector.value = String([...lineasFactura.keys()][0]);
        }

        cantidad.min = "0.01";
        cantidad.step = "0.01";

        cantidad.max = String(
          lineasFactura.get(String(selector.value))?.CANTIDAD || "",
        );
      }

      revisarNota();
    }

    async function cargarFactura() {
      lineasFactura.clear();
      $("ncAptoReingreso").checked = false;

      const id = Number(factura.value);

      if (!id) {
        $("ncFacturaInfo").textContent = "Selecciona la factura original.";

        mostrarProductos();
        return;
      }

      const [detalles, facturas] = await Promise.all([
        api(`/consultas/detalle-factura?id=${id}&limite=100`),
        api("/consultas/facturas?limite=300"),
      ]);

      for (const detalle of detalles) {
        if (Number(detalle.ID_FACTURA) === id) {
          lineasFactura.set(String(detalle.ID_DETALLE_FACTURA), detalle);
        }
      }

      const info = facturas.find((x) => Number(x.ID_FACTURA) === id);

      $("ncFacturaInfo").textContent = info
        ? `Factura ${info.SERIE}-${info.NUMERO}` +
          ` · Cliente: ${info.CLIENTE}` +
          ` · Total original: ${money(info.TOTAL)}`
        : `Factura #${id}`;

      mostrarProductos();
    }

    factura.addEventListener("change", () => {
      cargarFactura().catch((e) => message(e.message, true));
    });

    form.querySelector("#addLine")?.addEventListener("click", mostrarProductos);

    form.addEventListener("input", revisarNota);
    form.addEventListener("change", revisarNota);

                                                               
    form.addEventListener(
      "submit",
      (e) => {
        const problema =
          revisarNota() ||
          (!$("ncAptoReingreso").checked
            ? "Confirma que el producto esta apto para reingresar. " +
              "Si esta danado, no emitas esta nota."
            : "");

        if (problema) {
          e.preventDefault();
          e.stopImmediatePropagation();
          message(problema, true);
        }
      },
      true,
    );

    if (Number(idOriginal) > 0) {
      factura.value = String(idOriginal);
    }

    await cargarFactura();
  }
                                                                
  if (Number(idOriginal) > 0 && ["devoluciones"].includes(tab)) {
    const tabla = tab === "garantias" ? "GARANTIA" : "DEVOLUCION";

    await openCatalogForm(tabla);

    const form = $("modalHost").querySelector("#entityForm");

    const campoFactura = form?.querySelector('[name="ID_FACTURA"]');

    if (campoFactura) {
      campoFactura.value = String(idOriginal);
    }
  }
}

export { ventasUnificadas };
