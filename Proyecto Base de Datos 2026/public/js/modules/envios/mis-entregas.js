import { $, api, escape, message } from '../../core/state.js';
import { header } from '../../core/ui.js';

                                                                                              
async function misEntregas() {
  const entregas=await api('/envios/mis-entregas');
  $('content').innerHTML=header('Mis entregas','Solo aparecen envíos asignados a tu cuenta de piloto.')+`
    <section class="card"><h2>Envíos asignados · ${entregas.length}</h2>
    ${entregas.length ? `<div class="table-wrap"><table><thead><tr>
      <th>Envío</th><th>Factura</th><th>Cliente</th><th>Dirección</th>
      <th>Sucursal</th><th>Vehículo</th><th>Productos</th><th>Estado</th><th>Acción</th>
      </tr></thead><tbody>${entregas.map(e=>`<tr>
      <td>#${escape(e.ID)}</td><td>${escape(e.FACTURA)}</td>
      <td>${escape(e.CLIENTE)}</td><td>${escape(e.DIRECCION_ENTREGA)}</td>
      <td>${escape(e.SUCURSAL)}</td><td>${escape(e.VEHICULO||'—')}</td>
      <td>${escape(e.LINEAS)}</td><td>${escape(e.ESTADO)}</td>
      <td>${e.ESTADO==='EN_RUTA' ? `<button class="btn" type="button" data-confirmar="${escape(e.ID)}">Confirmar entrega</button>` : '—'}</td>
      </tr>`).join('')}</tbody></table></div>` : '<p>No tenés envíos asignados por el momento.</p>'}
    <p class="micro">Podés confirmar los pedidos que estén en ruta.</p></section>`;
  document.querySelectorAll('[data-confirmar]').forEach(btn=>btn.onclick=async()=>{
    const id=Number(btn.dataset.confirmar);
    if(!confirm(`¿Confirmás que el envío #${id} fue entregado al cliente?`))return;
    btn.disabled=true;
    try {
      await api(`/envios/mis-entregas/${id}/confirmar`,{method:'PATCH'});
      message(`Envío #${id} confirmado en Oracle`);
      await misEntregas();
    }catch(err){message(err.message,true);btn.disabled=false;}
  });
}
export { misEntregas };
