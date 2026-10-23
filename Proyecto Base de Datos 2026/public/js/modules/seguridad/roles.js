import { $, api, escape, message } from "../../core/state.js";
import { header } from "../../core/ui.js";
async function rolePage() {
 const datos=await api('/seguridad/roles-datos');
 const roles=datos.roles.filter(r=>r.ESTADO_REGISTRO==='A');
 const options=datos.opciones.filter(o=>o.ESTADO_REGISTRO==='A');
 const record=(r,o)=>datos.permisos.find(p=>Number(p.ID_ROL)===Number(r)&&Number(p.ID_OPCION)===Number(o));
 $('content').innerHTML=header('Roles y permisos','')+
 `<div class="card"><label class="field" style="max-width:420px">Rol a configurar
 <select id="securityRoleSelect">${roles.map(r=>`<option value="${escape(r.ID_ROL)}">${escape(r.NOMBRE)}</option>`).join('')}</select></label>
 <p class="micro">Elegí una opción y sus permisos. No es necesario escribir rutas ni crear opciones duplicadas.</p>
 <div id="permissionsGrid"></div></div>`;
 function render(){
  const id=Number($('securityRoleSelect').value);
  $('permissionsGrid').innerHTML=`<div class="table-wrap"><table><thead><tr>
    <th>Opción del sistema</th><th>Consultar</th><th>Crear</th><th>Actualizar</th><th>Desactivar</th><th>Guardar</th>
  </tr></thead><tbody>${options.map(o=>{
    const rec=record(id,o.ID_OPCION);
    const fields=[['c','CONSULTAR'],['i','INSERTAR'],['u','ACTUALIZAR'],['d','ELIMINAR']];
    return `<tr data-opcion="${escape(o.ID_OPCION)}"><td>${escape(o.NOMBRE)}</td>
      ${fields.map(([k,f])=>`<td><input type="checkbox" aria-label="${escape(f)} ${escape(o.NOMBRE)}" data-field="${k}" ${rec?.[f]==='S'?'checked':''}></td>`).join('')}
      <td><button type="button" class="btn" data-save="${escape(o.ID_OPCION)}">Guardar</button></td></tr>`;
  }).join('')}</tbody></table></div>`;
  $('permissionsGrid').querySelectorAll('[data-save]').forEach(btn=>btn.onclick=async()=>{
   const tr=btn.closest('tr');
   const get=k=>tr.querySelector(`[data-field="${k}"]`).checked?'S':'N';
   btn.disabled=true;
   try{await api('/seguridad/permisos',{method:'PUT',body:JSON.stringify({
     id_rol:id,id_opcion:Number(btn.dataset.save),
     puede_consultar:get('c'),puede_insertar:get('i'),
     puede_actualizar:get('u'),puede_eliminar:get('d')})});
     message('Permisos guardados en Oracle. Volvé a iniciar sesión para actualizar el menú.');}
   catch(e){message(e.message,true)}finally{btn.disabled=false}
  });
 }
 $('securityRoleSelect').onchange=render;render();
}
export {rolePage};
