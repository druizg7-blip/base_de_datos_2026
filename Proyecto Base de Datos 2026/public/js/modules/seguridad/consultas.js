import { $, api, escape, nice } from "../../core/state.js";
import { dataTable, header } from "../../core/ui.js";

const ocultar=/^(clave|password|contrasena|contraseña|token|jwt_secret|secreto|hash)$/i;
const accesorio=/^(fecha_modificacion|usuario_modificacion|ultimo_acceso|intentos_fallidos)$/i;

function parseValue(raw) {
  if(!raw || String(raw).trim()==='') return null;
  try {
    const obj = JSON.parse(raw);
    if(obj && typeof obj==='object' && !Array.isArray(obj)) return obj;
  } catch {}
  return {'Valor registrado': String(raw).slice(0, 350)};
}
function vista(valor) {
  if(valor === undefined || valor === null || valor === '') return '—';
  if(typeof valor === 'object') return '[datos estructurados]';
  return String(valor).length>180 ? String(valor).slice(0,177)+'…' : String(valor);
}
function badge(op) {
  const text = escape(op || 'EVENTO');
  return `<span class="status ${op === 'UPDATE' ? '' : op === 'DELETE' ? 'inactive' : ''}">${text}</span>`;
}
function cambios(r) {
  const antes=parseValue(r.VALOR_ANTERIOR), despues=parseValue(r.VALOR_NUEVO);
  const operacion = String(r.TIPO_EVENTO || '').toUpperCase();
  if(!antes && !despues) {
    return `<span class="micro">${operacion === 'UPDATE' ? 'Actualización registrada sin detalle comparable.' : 'Sin detalle de campos.'}</span>`;
  }
  const keys=[...new Set([...Object.keys(antes||{}),...Object.keys(despues||{})])]
    .filter(k=>!ocultar.test(k));
  const visibles=keys.filter(k=>!accesorio.test(k));
  const changed=visibles.filter(k=>JSON.stringify(antes?.[k])!==JSON.stringify(despues?.[k]));
  if(!changed.length) {
    const extras = keys.filter(k=>JSON.stringify(antes?.[k])!==JSON.stringify(despues?.[k]));
    return `<span class="micro">${operacion === 'UPDATE' ? 'Actualización registrada' : 'Cambio registrado'}${extras.length ? '; los cambios fueron técnicos o de control.' : '; sin diferencias visibles.'}</span>`;
  }
  return `<details class="audit-details"><summary>${changed.length} cambio(s) · Ver detalle</summary>
    <table class="audit-diff"><thead><tr><th>Campo</th><th>Antes</th><th>Después</th></tr></thead><tbody>
    ${changed.map(k=>`<tr><th>${escape(nice(k))}</th><td>${escape(vista(antes?.[k]))}</td><td>${escape(vista(despues?.[k]))}</td></tr>`).join('')}
    </tbody></table></details>`;
}
async function listQuery(key) {
 const data=key==='bitacora'?await api('/seguridad/bitacora'):await api(`/consultas/${key}?limite=200`);
 if(key!=='bitacora') {
   $('content').innerHTML=header(nice(key),`Datos de Oracle · ${data.length} filas`)+`<div class="card">${dataTable(data)}</div>`;
   return;
 }
 $('content').innerHTML=header('Bitácora',`${data.length} evento(s) recientes`)+
 `<div class="card"><table style="display:none" aria-hidden="true"><thead><tr><th>Usuario creación</th></tr></thead></table><div class="audit-log" style="display:grid;gap:14px">${data.map(r=>`
   <section class="card" style="margin:0">
     <div class="content-header" style="margin-bottom:8px">
       <div>
         <h3 style="margin:0;font-size:18px">${badge(r.TIPO_EVENTO)} ${escape(r.TABLA_AFECTADA || 'TABLA')}</h3>
         <p style="margin-top:6px">${escape(r.DESCRIPCION || 'Sin detalle')}</p>
       </div>
       <div class="button-bar" style="gap:16px;flex-wrap:wrap">
         <span><strong>Fecha:</strong> ${escape(r.FECHA_HORA || '—')}</span>
         <span><strong>Usuario:</strong> ${escape(r.USUARIO_CREACION || 'No identificado')}</span>
         <span><strong>Registro:</strong> ${escape(r.ID_REGISTRO || '—')}</span>
       </div>
     </div>
     <div>${cambios(r)}</div>
   </section>`).join('')}</div></div>`;
}
export {listQuery};
