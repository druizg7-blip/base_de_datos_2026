                                                                    
import { $, api, escape, button, has, message, state } from "../../core/state.js";
import { commandFields, header, payload } from "../../core/ui.js";
import { openCatalogForm } from "../catalogos/formulario.js";
import { listQuery } from "../seguridad/consultas.js";

async function inventoryPage(queryOnly = false) {
  if (queryOnly) {
    await listQuery("existencias");

    const def = state.catalogs.PRODUCTO_SUCURSAL;

                                            
    if (!def || !has(def.path, "I")) return;

    const panel = $("content").querySelector(".content-header .button-bar");

    if (!panel) return;

    const boton = document.createElement("button");

    boton.type = "button";
    boton.className = "btn green";
    boton.textContent = "＋ Asignar producto a sucursal";

    boton.onclick = () => {
      openCatalogForm("PRODUCTO_SUCURSAL").catch((e) =>
        message(e.message, true),
      );
    };

    panel.append(boton);
    return;
  }
  const meta = (await api("/transacciones/metadata")).commands;
  let forms = "";
  for (const kind of ["inventario-baja", "inventario-ajuste"]) {
    const def = meta[kind],
      controls = await commandFields(def.args, def.path);
    forms += `<div class="card"><h2>${kind === "inventario-baja" ? "Registrar baja de inventario" : "Ajuste positivo de existencias"}</h2><form data-operation="${kind}"><div class="form-grid">${controls}</div><div class="form-footer"><button type="submit" class="btn green">Guardar movimiento</button></div></form></div>`;
  }
  $("content").innerHTML =
    header(
      "Ajustes y bajas de inventario",
    ) +
    forms;
  $("content")
    .querySelectorAll("form[data-operation]")
    .forEach(
      (form) =>
        (form.onsubmit = async (e) => {
          e.preventDefault();
          try {
            if (!confirm("¿Confirmar este ajuste en Oracle?")) return;
            await api("/transacciones/" + form.dataset.operation, {
              method: "POST",
              body: JSON.stringify(payload(form)),
            });
            message("Inventario actualizado");
            form.reset();
          } catch (err) {
            message(err.message, true);
          }
        }),
    );
}


async function kardexPage() {
  const movimientos = await api('/consultas/kardex?limite=300');
  const host = $('content');
  host.innerHTML = header('Movimientos de inventario (Kardex)') + `
    <div class="card">
      <div class="kardex-toolbar">
        <label>Sucursal<select id="kSucursal"><option value="">Todas</option></select></label>
        <label>Movimiento<select id="kTipo"><option value="">Todos</option></select></label>
        <label>Buscar producto<input id="kBuscar" type="search" placeholder="Código o producto"></label>
      </div>
      <div class="kardex-count" id="kConteo"></div>
      <div class="table-wrap"><table class="kardex-table">
        <thead><tr><th>Fecha</th><th>Sucursal</th><th>Producto</th><th>Movimiento</th>
          <th class="num">Entrada</th><th class="num">Salida</th><th class="num">Anterior</th><th class="num">Saldo</th></tr></thead>
        <tbody id="kFilas"></tbody>
      </table></div>
    </div>`;
  const $local=id=>host.querySelector('#'+id);
  const sucursales=[...new Set(movimientos.map(r=>r.SUCURSAL).filter(Boolean))].sort();
  const tipos=[...new Set(movimientos.map(r=>r.TIPO_MOVIMIENTO).filter(Boolean))].sort();
  $local('kSucursal').insertAdjacentHTML('beforeend',sucursales.map(x=>`<option value="${escape(x)}">${escape(x)}</option>`).join(''));
  $local('kTipo').insertAdjacentHTML('beforeend',tipos.map(x=>`<option value="${escape(x)}">${escape(x)}</option>`).join(''));
  const numero=x=>Number.isFinite(Number(x))?Number(x).toLocaleString('es-GT',{maximumFractionDigits:2}):'—';
  const dibujar=()=>{
    const suc=$local('kSucursal').value,tipo=$local('kTipo').value,buscar=$local('kBuscar').value.trim().toLowerCase();
    const filas=movimientos.filter(r=>(!suc||r.SUCURSAL===suc)&&(!tipo||r.TIPO_MOVIMIENTO===tipo)&&(!buscar||`${r.CODIGO||''} ${r.PRODUCTO||''}`.toLowerCase().includes(buscar)));
    $local('kConteo').textContent=`${filas.length} movimientos · Del más reciente al más antiguo`;
    $local('kFilas').innerHTML=filas.map(r=>{
      const qty=Number(r.CANTIDAD)||0;const signo=Number(r.SIGNO);
      const entrada=signo>0?numero(qty):'—',salida=signo<0?numero(qty):'—';
      return `<tr><td>${escape(String(r.FECHA||'').slice(0,16))}</td>
        <td>${escape(r.SUCURSAL||'—')}</td><td><strong>${escape(r.CODIGO||'')}</strong><div class="product-sub">${escape(r.PRODUCTO||'')}</div></td>
        <td>${escape(r.TIPO_MOVIMIENTO||'—')}</td><td class="num">${entrada}</td><td class="num">${salida}</td>
        <td class="num">${numero(r.EXISTENCIA_ANTERIOR)}</td><td class="num"><strong>${numero(r.EXISTENCIA_NUEVA)}</strong></td></tr>`;
    }).join('')||'<tr><td colspan="8">No hay movimientos con esos filtros.</td></tr>';
  };
  for(const id of ['kSucursal','kTipo','kBuscar'])$local(id).addEventListener('input',dibujar);
  dibujar();
}

export { inventoryPage, kardexPage };
