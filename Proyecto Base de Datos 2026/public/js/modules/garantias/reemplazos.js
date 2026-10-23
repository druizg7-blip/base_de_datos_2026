                                                                         
import { api, button, escape, label, message } from "../../core/state.js";
import { ventasUnificadas } from "../ventas/page.js";

                           
async function mostrarEntregaReemplazoGarantia(id, panel) {
  const info = await api(
    "/garantias/" + id + "/reemplazo"
  );

  if (
    info.RESOLUCION !== "REEMPLAZO" ||
    !["ENTREGADO", "CERRADO"].includes(info.ESTADO)
  ) return;

  const bloque = document.createElement("div");
  bloque.className = "card";
  bloque.style.marginTop = "16px";

  const entregado = Boolean(info.MOVIMIENTO);

  bloque.innerHTML = `
    <h3>Entrega fisica del reemplazo</h3>

    <p>
      <strong>${escape(info.PRODUCTO)}</strong>
      · Sucursal: ${escape(info.SUCURSAL)}
    </p>

    <p>
      Cantidad: <strong>${escape(info.CANTIDAD)}</strong>
      · Existencia actual:
      <strong>${escape(info.STOCK)}</strong>
    </p>

    ${entregado
      ? `<p>
           <strong>
             Reemplazo registrado en Kardex
             #${escape(info.MOVIMIENTO)}
           </strong>
         </p>`
      : `
        <div class="notice">
          La garantia esta ENTREGADA, pero falta registrar
          la salida fisica del producto. Se entregara
          el mismo modelo de la sucursal original.
        </div>

        <label style="
          display:flex;
          align-items:center;
          gap:8px;
          margin:12px 0
        ">
          <input
            type="checkbox"
            id="fgConfirmaReemplazo"
          >

          Confirmo que estoy entregando este producto al cliente.
        </label>

        <button
          type="button"
          class="btn green"
          id="fgRegistrarReemplazo"
        >
          Registrar salida del reemplazo
        </button>
      `}
  `;

  panel.append(bloque);

  const boton = bloque.querySelector(
    "#fgRegistrarReemplazo"
  );

  if (!boton) return;

  boton.onclick = async () => {
    if (!bloque.querySelector("#fgConfirmaReemplazo").checked) {
      return message(
        "Confirma que entregaste el producto",
        true
      );
    }

    if (!confirm(
      "Se descontaran " + info.CANTIDAD +
      " unidades de " + info.PRODUCTO +
      ". Continuar?"
    )) return;

    boton.disabled = true;

    try {
      const resultado = await api(
        "/garantias/" + id + "/reemplazo",
        {
          method: "POST",
          body: JSON.stringify({
            confirmado: true
          })
        }
      );

      message(
        "Reemplazo registrado en Kardex #" +
        resultado.id_movimiento
      );

      await ventasUnificadas("garantias");

    } catch (err) {
      boton.disabled = false;
      message(err.message, true);
    }
  };
}

export { mostrarEntregaReemplazoGarantia };
