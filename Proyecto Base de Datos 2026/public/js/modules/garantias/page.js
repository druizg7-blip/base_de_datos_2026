                                                                   
import { $, api, button, escape, label, message } from "../../core/state.js";
import { options } from "../../core/ui.js";
import { mostrarEntregaReemplazoGarantia } from "./reemplazos.js";
import { ventasUnificadas } from "../ventas/page.js";

async function garantiaVinculada(idOriginal = null) {
  const host = $("content");
  const datos = await api("/garantias/datos");
  const inicial = String(idOriginal || "");

  host.innerHTML = `
    <div class="card">
      <h2>Nuevo reclamo de garantia</h2>

      <p class="micro">
        Selecciona la factura y el producto.
        El reclamo comienza en PENDIENTE.
      </p>

      <div class="notice">
        Registrar una garantia no modifica el inventario
        ni emite notas de credito.
      </div>

      <form id="fgGarantiaForm">
        <div class="form-grid">

          <label class="field">
            Factura original *
            <select name="id_factura" required>
              <option value="">Selecciona una factura...</option>

              ${datos.facturas.map(f => `
                <option
                  value="${escape(f.ID)}"
                  ${String(f.ID) === inicial ? "selected" : ""}
                >
                  ${escape(f.DOCUMENTO)} -
                  ${escape(f.CLIENTE)}
                </option>
              `).join("")}
            </select>
          </label>

          <label class="field">
            Empleado responsable *
            <select name="id_empleado" required>
              <option value="">Selecciona empleado...</option>

              ${datos.empleados.map(e => `
                <option value="${escape(e.ID)}">
                  ${escape(e.NOMBRE)}
                </option>
              `).join("")}
            </select>
          </label>

          <label class="field">
            Producto reclamado *
            <select name="id_detalle_factura"
                    required disabled>
              <option value="">
                Selecciona primero la factura...
              </option>
            </select>
          </label>

          <label class="field">
            Cantidad *
            <input type="number"
                   name="cantidad"
                   min="0.01"
                   step="0.01"
                   placeholder="Ej. 1"
                   required>
          </label>

          <label class="field">
            Nota de credito (opcional)
            <select name="id_nota_credito" disabled>
              <option value="">Sin nota de credito</option>
            </select>
          </label>

          <label class="field">
            Descripcion de la falla *
            <textarea name="descripcion_falla"
                      maxlength="300"
                      rows="2"
                      placeholder="Que le ocurre al producto"
                      required></textarea>
          </label>

          <label class="field">
            Observaciones (opcional)
            <textarea name="observaciones"
                      maxlength="300"
                      rows="2"
                      placeholder="Accesorios, numero de serie..."
                      ></textarea>
          </label>

        </div>

        <p class="micro" id="fgGarantiaAviso">
          La nota de credito solo se puede asociar
          si corresponde a la misma factura y producto.
        </p>

        <div class="button-bar">
          <button type="submit"
                  class="btn green"
                  id="fgGarantiaGuardar">
            Registrar garantia pendiente
          </button>
        </div>
      </form>
    </div>

    <div class="card">
      <h2>Garantias registradas</h2>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reclamo</th>
              <th>Factura</th>
              <th>Producto</th>
              <th>Fecha</th>
              <th>Estado</th><th>Seguimiento</th>
            </tr>
          </thead>

          <tbody>
            ${datos.historial.length
              ? datos.historial.map(g => `
                <tr>
                  <td>#${escape(g.ID)}</td>
                  <td>${escape(g.FACTURA)}</td>
                  <td>${escape(
                    g.PRODUCTOS ||
                    "Sin detalle vinculado (registro anterior)"
                  )}</td>
                  <td>${escape(g.FECHA)}</td>
                  <td>${escape(g.ESTADO)}</td>
                  <td>
                    <button type="button"
                            class="btn"
                            data-seguimiento-id="${escape(g.ID)}">
                      ${g.ESTADO === "CERRADO" ? "Ver" : "Gestionar"}
                    </button>
                  </td>
                </tr>
              `).join("")
              : `<tr>
                   <td colspan="6">
                     Todavia no hay garantias registradas.
                   </td>
                 </tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;

                             
  const panelSeguimiento = document.createElement("div");
  panelSeguimiento.className = "card";
  panelSeguimiento.id = "fgSeguimientoPanel";
  panelSeguimiento.hidden = true;

  host.querySelector(".table-wrap")
    ?.closest(".card")
    ?.after(panelSeguimiento);

  host.querySelectorAll("[data-seguimiento-id]")
    .forEach(boton => {

      boton.addEventListener("click", async () => {
        try {
          const id = Number(
            boton.dataset.seguimientoId
          );

          const resultado = await api(
            "/garantias/" + id + "/seguimiento"
          );

          const garantia = resultado.garantia;

          const pasos = {
            PENDIENTE: "EN_PROCESO",
            EN_PROCESO: "ENTREGADO",
            EN_RUTA: "ENTREGADO",
            ENTREGADO: "CERRADO"
          };

          const siguiente = pasos[garantia.ESTADO];
          const requiereResolucion =
            siguiente === "ENTREGADO";

          const eventos = (resultado.historial || [])
            .map(h => {
              let cambio = h.TIPO_EVENTO;

              try {
                const antes = JSON.parse(
                  h.VALOR_ANTERIOR || "{}"
                );

                const despues = JSON.parse(
                  h.VALOR_NUEVO || "{}"
                );

                const previo =
                  antes.estado || antes.ESTADO;

                const nuevo =
                  despues.estado || despues.ESTADO;

                if (previo && nuevo) {
                  cambio = previo + " → " + nuevo;
                }
              } catch (_) {}

              return `
                <li>
                  ${escape(h.FECHA)}:
                  ${escape(cambio)}
                </li>
              `;
            }).join("");

          panelSeguimiento.hidden = false;

          panelSeguimiento.innerHTML = `
            <h2>
              Seguimiento de garantia #${escape(garantia.ID)}
            </h2>

            <p>
              Factura:
              <strong>${escape(garantia.FACTURA)}</strong>
              · Estado:
              <strong>${escape(garantia.ESTADO)}</strong>
            </p>

            <p class="micro">
              ${escape(
                garantia.OBSERVACIONES ||
                "Sin observaciones"
              )}
            </p>

            ${(resultado.detalles || []).map(d => `
              <div style="
                padding:10px 0;
                border-bottom:1px solid #ddd
              ">
                <strong>${escape(d.PRODUCTO)}</strong>

                <p class="micro">
                  Cantidad: ${escape(d.CANTIDAD)}
                </p>

                <p>
                  Falla: ${escape(d.DESCRIPCION_FALLA)}
                </p>

                <p>
                  Resolucion:
                  ${escape(d.RESOLUCION || "Pendiente")}
                  ${d.FECHA_RESOLUCION
                    ? " · " + escape(d.FECHA_RESOLUCION)
                    : ""}
                </p>
              </div>
            `).join("")}

            ${siguiente ? `
              <form id="fgCambiarEstado"
                    style="margin-top:18px">

                <h3>
                  Siguiente paso: ${escape(siguiente)}
                </h3>

                ${requiereResolucion ? `
                  <label class="field">
                    Resolucion del reclamo *
                    <select name="resolucion" required>
                      <option value="">Selecciona...</option>
                      <option value="REPARACION">
                        Reparacion
                      </option>
                      <option value="REEMPLAZO">
                        Reemplazo
                      </option>
                      <option value="SIN_COBERTURA">
                        Sin cobertura
                      </option>
                      <option value="OTRA">
                        Otra
                      </option>
                    </select>
                  </label>

                  <p class="micro">
                    Un reemplazo debe gestionar su
                    movimiento de inventario por separado.
                  </p>
                ` : ""}

                <button type="submit" class="btn green">
                  Avanzar a ${escape(siguiente)}
                </button>
              </form>
            ` : `
              <p>
                <strong>Garantia cerrada.</strong>
              </p>
            `}

            <h3 style="margin-top:18px">
              Historial de cambios
            </h3>

            ${eventos
              ? `<ul>${eventos}</ul>`
              : `<p class="micro">
                   Sin eventos de auditoria registrados.
                 </p>`
            }
          `;

          await mostrarEntregaReemplazoGarantia(
            id,
            panelSeguimiento
          );

          panelSeguimiento.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });

          panelSeguimiento
            .querySelector("#fgCambiarEstado")
            ?.addEventListener("submit", async e => {

              e.preventDefault();

              if (!confirm(
                "Cambiar la garantia a " +
                siguiente + "?"
              )) return;

              const enviar = e.currentTarget
                .querySelector('button[type="submit"]');

              enviar.disabled = true;

              try {
                await api(
                  "/garantias/" + id + "/seguimiento",
                  {
                    method: "PATCH",
                    body: JSON.stringify({
                      estado: siguiente,
                      resolucion:
                        e.currentTarget
                          .elements.resolucion?.value || null
                    })
                  }
                );

                message(
                  "Garantia #" + id +
                  " actualizada a " + siguiente
                );

                await ventasUnificadas("garantias");

              } catch (err) {
                message(err.message, true);
                enviar.disabled = false;
              }
            });

        } catch (err) {
          message(err.message, true);
        }
      });
    });
  const form = $("fgGarantiaForm");
  const factura = form.elements.id_factura;
  const producto = form.elements.id_detalle_factura;
  const cantidad = form.elements.cantidad;
  const nota = form.elements.id_nota_credito;

  let solicitudActual = 0;
  let notasFactura = [];

  function actualizarNotas() {
    nota.replaceChildren(
      new Option("Sin nota de credito", "")
    );

    for (const n of notasFactura.filter(
      x => String(x.LINEA) === producto.value
    )) {
      nota.add(
        new Option(n.ETIQUETA, String(n.ID))
      );
    }

    nota.disabled = nota.options.length === 1;
  }

  async function actualizarFactura() {
    const solicitud = ++solicitudActual;

    producto.replaceChildren(
      new Option("Selecciona el producto...", "")
    );

    producto.disabled = true;
    notasFactura = [];
    actualizarNotas();
    cantidad.value = "";

    if (!factura.value) return;

    try {
      const info = await api(
        "/garantias/datos?factura=" +
        encodeURIComponent(factura.value)
      );

      if (solicitud !== solicitudActual) return;

      for (const linea of info.lineas) {
        const opcion = new Option(
          `${linea.PRODUCTO} - Vendidas: ${linea.CANTIDAD}`,
          String(linea.ID)
        );

        opcion.dataset.max = String(linea.CANTIDAD);
        producto.add(opcion);
      }

      notasFactura = info.notas;
      producto.disabled = !info.lineas.length;

      actualizarNotas();

      $("fgGarantiaAviso").textContent =
        info.lineas.length
          ? "El reclamo quedara relacionado con la factura y producto."
          : "Esta factura no tiene productos disponibles.";

    } catch (err) {
      if (solicitud === solicitudActual) {
        message(err.message, true);
      }
    }
  }

  factura.addEventListener(
    "change",
    actualizarFactura
  );

  producto.addEventListener("change", () => {
    actualizarNotas();

    const max = producto.selectedOptions[0]?.dataset.max;
    cantidad.max = max || "";

    if (max && !cantidad.value) {
      cantidad.value = String(
        Math.min(1, Number(max))
      );
    }
  });

  if (factura.value) {
    await actualizarFactura();
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    const max = Number(
      producto.selectedOptions[0]?.dataset.max
    );

    const unidades = Number(cantidad.value);

    if (
      !producto.value ||
      !Number.isFinite(unidades) ||
      unidades <= 0 ||
      unidades > max
    ) {
      return message(
        "Selecciona un producto y una cantidad valida",
        true
      );
    }

    if (!confirm(
      "Registrar este reclamo en estado PENDIENTE?"
    )) return;

    const boton = $("fgGarantiaGuardar");
    boton.disabled = true;

    try {
      const resultado = await api(
        "/garantias/registrar",
        {
          method: "POST",
          body: JSON.stringify({
            id_factura: factura.value,
            id_empleado: form.elements.id_empleado.value,
            id_detalle_factura: producto.value,
            cantidad: cantidad.value,
            id_nota_credito: nota.value || null,
            descripcion_falla:
              form.elements.descripcion_falla.value,
            observaciones:
              form.elements.observaciones.value
          })
        }
      );

      message(
        "Garantia #" +
        resultado.id_garantia +
        " registrada y vinculada"
      );

      await ventasUnificadas("garantias");

    } catch (err) {
      message(err.message, true);
      boton.disabled = false;
    }
  });
}

export { garantiaVinculada };
