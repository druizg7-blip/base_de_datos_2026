                                                                
import { $, api, button, escape, has, label, message } from "../../core/state.js";
import { header, options } from "../../core/ui.js";

                        
async function enviosGestion() {
  const ruta = '/envios/gestion';
  const datos = await api('/envios/gestion/datos');

  const host = $('content');
  const puedeCrear = has(ruta, 'I');
  const puedeActualizar = has(ruta, 'U');

  const opciones = (lista, id, texto, sucursal = '') =>
    (lista || []).map(x => `
      <option
        value="${escape(x[id])}"
        ${sucursal
          ? `data-sucursal="${escape(x[sucursal])}"`
          : ''}
      >
        ${escape(x[texto])}
      </option>
    `).join('');

  const siguientes = {
    PENDIENTE: 'EN_RUTA',
  };

  host.innerHTML =
    header('Gestión de Envíos') + `

    ${puedeCrear ? `
      <div class="card">
        <h2>Registrar envío</h2>


        <form id="fgEnvioFormulario">
          <div class="form-grid">

            <label class="field">
              Factura y cliente *
              <select name="id_factura" required>
                <option value="">Selecciona una factura pendiente...</option>
                ${(datos.facturas || []).map(f => `
                  <option value="${escape(f.ID)}">
                    ${escape(f.DOCUMENTO)} ·
                    ${escape(f.CLIENTE)} ·
                    ${escape(f.SUCURSAL)}
                  </option>
                `).join('')}
              </select>
              ${!(datos.facturas || []).length ? '<span class="field-hint">No hay facturas con productos pendientes de envío.</span>' : ''}
            </label>

            <label class="field">
              Responsable del envío *
              <select name="id_empleado" required>
                <option value="">Selecciona...</option>
                ${opciones(
                  datos.empleados,
                  'ID',
                  'NOMBRE',
                  'ID_SUCURSAL'
                )}
              </select>
            </label>

            <label class="field" id="fgVehiculoCampo">
              Vehículo de la sucursal *
              <select name="id_vehiculo" required>
                <option value="">Seleccioná un vehículo registrado...</option>
                ${opciones(
                  datos.vehiculos,
                  'ID',
                  'NOMBRE',
                  'ID_SUCURSAL'
                )}
              </select>
            </label>

            <label class="field">
              Departamento de destino *
              <select name="id_departamento" required>
                <option value="">Selecciona...</option>
                ${opciones(
                  datos.departamentos,
                  'ID',
                  'NOMBRE'
                )}
              </select>
            </label>

            <label class="field">
              Dirección de entrega *
              <input
                name="direccion_entrega"
                maxlength="250"
                required
                placeholder="Dirección donde recibe el cliente">
            </label>

            <label class="field" id="fgPilotoCampo">
              Piloto (empleado registrado) *
              <select name="id_piloto" required>
                <option value="">Seleccioná un piloto registrado de la sucursal...</option>
                ${opciones(datos.pilotos,'ID','NOMBRE','ID_SUCURSAL')}
              </select>
            </label>

            <label class="field">
              ¿El cliente retira los productos por su cuenta?
              <select name="transporta_cliente">
                <option value="N">No, realiza el envío la ferretería</option>
                <option value="S">Sí, el cliente los retira</option>
              </select>
            </label>

          </div>
          <p class="micro" id="fgNotaRetiro" aria-live="polite">
            En envíos de la ferretería son obligatorios vehículo y piloto.
          </p>

          <div
            id="fgEnvioOrigen"
            class="context-line"
            style="margin:12px 0">
            Selecciona una factura para mostrar sus productos.
          </div>

          <div
            id="fgEnvioLineas"
            class="table-wrap">
          </div>

          <div class="button-bar" style="margin-top:16px">
            <button
              type="submit"
              class="btn green"
              id="fgEnviarFormulario">
              Registrar envío con sus productos
            </button>
          </div>
        </form>
      </div>
    ` : ''}

    <div class="card">
      <h2>Seguimiento de envíos</h2>


      ${(datos.envios || []).length ? `
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Envío</th>
                <th>Factura</th>
                <th>Cliente</th>
                <th>Sucursal</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              ${datos.envios.map(e => `
                <tr>
                  <td>#${escape(e.ID)}</td>
                  <td>${escape(e.DOCUMENTO)}</td>
                  <td>${escape(e.CLIENTE)}</td>
                  <td>${escape(e.SUCURSAL)}</td>
                  <td>${escape(e.FECHA_ENVIO)}</td>
                  <td>${escape(e.LINEAS)}</td>
                  <td>
                    <strong>${escape(e.ESTADO)}</strong>
                    ${e.TRANSPORTA_CLIENTE === 'S' ? '<div class="micro">Retirado por cliente</div>' : ''}
                  </td>
                  <td>
                    ${puedeActualizar && siguientes[e.ESTADO]
                      ? `
                        <button
                          type="button"
                          class="btn"
                          data-fg-envio="${escape(e.ID)}"
                          data-fg-estado="${siguientes[e.ESTADO]}">
                          Avanzar a ${siguientes[e.ESTADO]}
                        </button>
                      `
                      : e.ESTADO === 'EN_RUTA' ? 'Pendiente del piloto' : '—'
                    }
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div class="empty">
          <strong>Aún no hay envíos registrados.</strong>
          <p>
            Al crear el primero aparecerá aquí.
          </p>
        </div>
      `}
    </div>
  `;

  host.querySelectorAll('[data-fg-envio]')
    .forEach(boton => {
      boton.onclick = async () => {

        const id = Number(boton.dataset.fgEnvio);
        const estado = boton.dataset.fgEstado;

        if (!confirm(
          `¿Cambiar el envío #${id} a ${estado}?`
        )) return;

        boton.disabled = true;

        try {
          await api(
            `/envios/gestion/${id}/estado`,
            {
              method: 'PATCH',
              body: JSON.stringify({ estado })
            }
          );

          message(
            `Envío #${id} actualizado a ${estado}`
          );

          await enviosGestion();

        } catch (err) {
          message(err.message, true);
          boton.disabled = false;
        }
      };
    });

  if (!puedeCrear) return;

  const form = $('fgEnvioFormulario');

  const factura = form.elements.id_factura;
  const empleado = form.elements.id_empleado;
  const vehiculo = form.elements.id_vehiculo;
  const piloto = form.elements.id_piloto;
  const transporte = form.elements.transporta_cliente;
  const actualizarModoTransporte = () => {
    const retiro = transporte.value === 'S';
    for (const [campo, selector] of [
      ['fgVehiculoCampo', vehiculo], ['fgPilotoCampo', piloto]
    ]) {
      selector.disabled = retiro;
      selector.required = !retiro;
      $(campo).hidden = retiro;
      if (retiro) selector.value = '';
    }
    $('fgNotaRetiro').textContent = retiro
      ? 'Retiro en sucursal: no requiere piloto ni vehículo de la ferretería. Al registrar quedará como ENTREGADO. Indicá el lugar del retiro en la dirección.'
      : 'En envíos de la ferretería son obligatorios vehículo y piloto.';
  };
  transporte.onchange = actualizarModoTransporte;
  actualizarModoTransporte();

  const origen = $('fgEnvioOrigen');
  const lineas = $('fgEnvioLineas');

  let disponibles = [];

  function filtrarPorSucursal(selector, sucursal) {
    for (const opt of selector.options) {
      if (!opt.value) continue;

      opt.disabled =
        String(opt.dataset.sucursal) !== String(sucursal);

      if (opt.disabled && opt.selected) {
        selector.value = '';
      }
    }
  }

  factura.onchange = async () => {
    const f = (datos.facturas || [])
      .find(x => String(x.ID) === factura.value);

    lineas.replaceChildren();
    disponibles = [];

    empleado.value = '';
    vehiculo.value = '';
    piloto.value = '';

    filtrarPorSucursal(empleado, f?.ID_SUCURSAL);
    filtrarPorSucursal(vehiculo, f?.ID_SUCURSAL);
    filtrarPorSucursal(piloto, f?.ID_SUCURSAL);

    origen.textContent = f
      ? `Factura ${f.DOCUMENTO} · ${f.CLIENTE} · Origen: ${f.SUCURSAL}`
      : 'Selecciona una factura para ver sus productos.';

    if (!f) return;

    try {
      const detalle = await api(
        `/envios/gestion/factura/${f.ID}`
      );

      if (String(f.ID) !== factura.value) return;

      disponibles = detalle.filter(
        d => Number(d.DISPONIBLE) > 0
      );

      if (!disponibles.length) {
        lineas.innerHTML = `
          <p class="micro">
            La factura no tiene unidades pendientes de envío.
          </p>
        `;
        return;
      }

      lineas.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Enviar</th>
              <th>Producto</th>
              <th>Vendido</th>
              <th>Pendiente</th>
              <th>Cantidad a enviar</th>
            </tr>
          </thead>

          <tbody>
            ${disponibles.map(d => `
              <tr>
                <td>
                  <input
                    type="checkbox"
                    data-linea="${escape(d.ID)}"
                    checked>
                </td>
                <td>
                  ${escape(d.CODIGO)} ·
                  ${escape(d.PRODUCTO)}
                </td>
                <td>${escape(d.VENDIDA)}</td>
                <td>${escape(d.DISPONIBLE)}</td>
                <td>
                  <input
                    type="number"
                    data-cantidad="${escape(d.ID)}"
                    min="0.01"
                    max="${escape(d.DISPONIBLE)}"
                    step="0.01"
                    value="${escape(d.DISPONIBLE)}">
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    } catch (err) {
      message(err.message, true);
      lineas.replaceChildren();
    }
  };

  form.onsubmit = async ev => {
    ev.preventDefault();

    if (!form.reportValidity()) return;

    const detalles = disponibles
      .filter(d => lineas.querySelector(
        `[data-linea="${d.ID}"]`
      )?.checked)
      .map(d => ({
        id_detalle_factura: Number(d.ID),
        cantidad: Number(
          lineas.querySelector(
            `[data-cantidad="${d.ID}"]`
          )?.value
        )
      }));

    if (
      !detalles.length ||
      detalles.some(d =>
        !Number.isFinite(d.cantidad) ||
        d.cantidad <= 0
      )
    ) {
      message(
        'Selecciona productos y cantidades válidas',
        true
      );
      return;
    }

    const f = (datos.facturas || [])
      .find(x => String(x.ID) === factura.value);

    if (!confirm(
      `¿Registrar envío para la factura ${f?.DOCUMENTO} con ${detalles.length} líneas?`
    )) return;

    const boton = $('fgEnviarFormulario');
    boton.disabled = true;

    let registrado = false;

    try {
      const resultado = await api(
        '/envios/gestion/registrar',
        {
          method: 'POST',
          body: JSON.stringify({
            id_factura: Number(factura.value),
            id_empleado: Number(empleado.value),
            id_piloto: transporte.value === 'S' ? null : Number(piloto.value),
            id_vehiculo: transporte.value === 'S'
              ? null
              : (vehiculo.value ? Number(vehiculo.value) : null),
            id_departamento: Number(
              form.elements.id_departamento.value
            ),
            direccion_entrega:
              form.elements.direccion_entrega.value,
            transporta_cliente:
              form.elements.transporta_cliente.value,
            detalles
          })
        }
      );

      registrado = true;

      message(
        `Envío #${resultado.id_envio} registrado correctamente`
      );

      await enviosGestion();

    } catch (err) {
      message(
        registrado
          ? 'El envío se guardó, pero falló la recarga. Actualiza la página.'
          : err.message,
        true
      );

      if (!registrado) boton.disabled = false;
    }
  };
}

export { enviosGestion };
