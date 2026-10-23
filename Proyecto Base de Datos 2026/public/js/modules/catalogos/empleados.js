                                                                                       
import { $, api, escape, has, message } from '../../core/state.js';
import { header } from '../../core/ui.js';

const esc = escape;
const selector = (values, placeholder) => `<option value="">${placeholder}</option>${values.map(x=>`<option value="${esc(x.ID)}">${esc(x.NOMBRE)}</option>`).join('')}`;
function yearsAt(date, atDate) {
  if(!date || !atDate) return null;
  const [y,m,d] = date.split('-').map(Number);
  const [a,b,c] = atDate.split('-').map(Number);
  if([y,m,d,a,b,c].some(x=>!Number.isFinite(x))) return null;
  return a-y-((b<m || (b===m&&c<d))?1:0);
}
const currentDate = () => {
  const d = new Date();
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
};
async function employeePage() {
  const [options, employees] = await Promise.all([api('/personal/opciones'),api('/personal/empleados')]);
  const mayCreate = has('/catalogos/empleados','I');
  const mayUpdate = has('/catalogos/empleados','U');
  const mayFire = has('/catalogos/empleados','D');
  const canCreateLogin = has('/admin/usuarios','I');
  const p = selector(options.roles,'Elegí el cargo');
  const s = selector(options.sucursales,'Elegí la sucursal');
  $('content').innerHTML = header('Gestión de empleados','Contrataciones, asignaciones de sucursal y bajas laborales')+
  (mayCreate ? `<section class="card personnel-card"><div class="staff-head"><h2>Contratar empleado</h2><p>Edad mínima: 18 años.</p></div>
  <form id="hireForm"><div class="form-grid four">
  <label class="field">Nombres *<input name="nombres" maxlength="100" required autocomplete="off"></label>
  <label class="field">Apellidos *<input name="apellidos" maxlength="100" required></label>
  <label class="field">Documento de identidad *<input name="dpi" maxlength="25" required></label>
  <label class="field">Fecha de nacimiento *<input id="hireBirth" name="fecha_nacimiento" type="date" max="${currentDate()}" required></label>
  <label class="field">Edad al contratar<input id="hireAge" readonly placeholder="Calculada automáticamente"></label>
  <label class="field">Fecha de contratación *<input id="hireDate" name="fecha_contratacion" type="date" value="${currentDate()}" max="${currentDate()}" required></label>
  <label class="field">Cargo *<select id="hirePosition" name="id_rol" required>${p}</select></label>
  <label class="field">Sucursal *<select name="id_sucursal" required>${s}</select></label>
  </div><p id="ageWarning" class="staff-warning" hidden>La persona debe tener al menos 18 años cumplidos en la fecha de contratación.</p>
  ${canCreateLogin ? `<div class="staff-account"><label class="staff-check"><input type="checkbox" id="createAccount"> Crear también cuenta de acceso al sistema</label><div class="form-grid three" id="accountFields" hidden>
  <label class="field">Usuario<input name="usuario" maxlength="50"></label>
  <label class="field">Contraseña (mínimo 10 caracteres)<input name="clave" type="password" minlength="10" autocomplete="new-password"></label>
  </div><p class="micro" id="staffRoleNote" aria-live="polite">El cargo seleccionado también define los permisos de acceso.</p></div>` : `<p class="micro">Las cuentas de acceso se crean desde Seguridad → Gestión de Usuarios.</p>`}
  <div class="form-footer"><button id="hireSubmit" class="btn green" type="submit">Contratar empleado</button></div></form></section>` : '')+
  `<section class="card personnel-card"><div class="staff-head"><h2>Empleados registrados · ${employees.length}</h2><p>Los empleados despedidos conservan su historial. No se eliminan registros.</p></div>
  <div class="staff-filters"><input id="staffSearch" type="search" placeholder="Buscar nombre, puesto o sucursal" aria-label="Buscar empleados"><select id="staffStatus"><option value="ALL">Todos los estados</option><option value="A">Activos</option><option value="I">Despedidos / inactivos</option></select></div>
  <div id="staffList" class="table-wrap"></div></section>`;

  const list = () => {
    const term=($('staffSearch')?.value||'').trim().toLowerCase(), status=$('staffStatus')?.value||'ALL';
    const filtered=employees.filter(e=>(status==='ALL'||e.ESTADO_REGISTRO===status) &&
      [e.NOMBRES,e.APELLIDOS,e.PUESTO,e.ROL_ACCESO,e.SUCURSAL,e.CODIGO_EMPLEADO].some(x=>String(x||'').toLowerCase().includes(term)));
    $('staffList').innerHTML = `<table class="staff-table"><thead><tr><th>Código</th><th>Empleado</th><th>Cargo</th><th>Sucursal</th><th>Edad</th><th>Contratación</th><th>Acceso</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${filtered.map(e=>{
      const live=e.ESTADO_REGISTRO==='A';
      return `<tr><td>${esc(e.CODIGO_EMPLEADO)}</td><td>${esc(e.NOMBRES+' '+e.APELLIDOS)}</td><td>${esc(e.ROL_ACCESO||e.PUESTO||'Sin asignación')}</td><td>${esc(e.SUCURSAL||'Sin asignación')}</td><td>${e.EDAD??'—'}</td><td>${esc(e.FECHA_CONTRATACION||'—')}</td><td>${esc(e.NOMBRE_USUARIO||'Sin cuenta')}${e.ROL_ACCESO?`<div class="micro">${esc(e.ROL_ACCESO)}</div>`:''}</td><td>${live?'Activo':'Despedido'}</td><td class="staff-row-actions">${live&&mayUpdate?`<button class="btn" data-staff-edit="${e.ID_EMPLEADO}">Reasignar</button>`:''}${live&&mayFire?`<button class="btn danger" data-staff-fire="${e.ID_EMPLEADO}">Despedir</button>`:''}</td></tr>`;
    }).join('') || '<tr><td colspan="9">Sin empleados para este filtro</td></tr>'}</tbody></table>`;
    $('staffList').querySelectorAll('[data-staff-fire]').forEach(btn=>btn.onclick=async()=>{
      const id=Number(btn.dataset.staffFire), e=employees.find(x=>x.ID_EMPLEADO===id);
      if(!window.confirm(`¿Confirmás el despido de ${e.NOMBRES} ${e.APELLIDOS}? Se cerrarán sus asignaciones y se desactivará su usuario. No se borrará su historial.`))return;
      try { btn.disabled=true;await api(`/personal/empleados/${id}/despedir`,{method:'POST',body:'{}'});message('Empleado despedido; historial conservado');await employeePage(); }
      catch(err){btn.disabled=false;message(err.message,true);}
    });
    $('staffList').querySelectorAll('[data-staff-edit]').forEach(btn=>btn.onclick=()=>{
      const id=Number(btn.dataset.staffEdit), e=employees.find(x=>x.ID_EMPLEADO===id);
      const box=document.createElement('div');box.className='staff-edit';
      box.innerHTML=`<h3>Reasignar a ${esc(e.NOMBRES+' '+e.APELLIDOS)}</h3><p class="micro">El cargo y los permisos usan la misma lista de roles de Oracle. Se conserva el historial.</p><form class="form-grid two"><label class="field">Cargo<select name="id_rol" required>${p}</select></label><label class="field">Sucursal<select name="id_sucursal" required>${s}</select></label><button class="btn green">Guardar asignación</button><button class="btn" type="button" id="cancelAssign">Cancelar</button></form>`;
      $('staffList').prepend(box);
      const nombreActual = e.ROL_ACCESO || e.PUESTO;
      const rolActual = options.roles.find(r=>r.NOMBRE?.toLowerCase()===String(nombreActual||'').toLowerCase());
      box.querySelector('[name=id_rol]').value=String(e.ID_ROL||rolActual?.ID||'');
      box.querySelector('[name=id_sucursal]').value=String(e.ID_SUCURSAL||'');
      box.querySelector('#cancelAssign').onclick=()=>box.remove();
      box.querySelector('form').onsubmit=async(ev)=>{
        ev.preventDefault();const data=Object.fromEntries(new FormData(ev.target));
        try{await api(`/personal/empleados/${id}/asignacion`,{method:'PUT',body:JSON.stringify(data)});message('Puesto y sucursal actualizados');await employeePage();}
        catch(err){message(err.message,true);}
      };
    });
  };
  $('staffSearch').oninput=list;$('staffStatus').onchange=list;list();
  if(!mayCreate)return;
  const ageCheck = () => {
    const age=yearsAt($('hireBirth').value,$('hireDate').value);
    $('hireAge').value=age===null?'':String(age);
    const invalid=age!==null&&age<18;
    $('ageWarning').hidden=!invalid;
    $('hireSubmit').disabled = invalid;
    return !invalid&&age!==null;
  };
  $('hireBirth').onchange=ageCheck;$('hireDate').onchange=ageCheck;
  const accountCheck = () => {
    if (!canCreateLogin) return true;
    const active = $('createAccount').checked;
    $('accountFields').hidden = !active;
    $('accountFields').querySelectorAll('input').forEach(n=>n.required=active);
    const selected = options.roles.find(x=>String(x.ID)===$('hirePosition').value);
    $('staffRoleNote').textContent = active
      ? (selected ? `La cuenta utilizará el rol ${selected.NOMBRE}, igual que el cargo elegido.` : 'Seleccioná un cargo para definir el acceso.')
      : 'El cargo se registra aunque no se cree una cuenta de acceso.';
    $('hireSubmit').disabled = !ageCheck();
    return true;
  };
  if(canCreateLogin) $('createAccount').onchange=accountCheck;
  $('hirePosition').onchange=accountCheck;
  accountCheck();
  $('hireForm').onsubmit=async(ev)=>{
    ev.preventDefault();if(!ageCheck()){message('La fecha de nacimiento debe demostrar al menos 18 años cumplidos',true);return;}
    accountCheck();
    const data=Object.fromEntries(new FormData(ev.target));
    if(!canCreateLogin||!$('createAccount').checked){delete data.usuario;delete data.clave;}
    $('hireSubmit').disabled=true;
    try{const resp=await api('/personal/contratar',{method:'POST',body:JSON.stringify(data)});message(`Contratación registrada: EMP-${String(resp.id_empleado).padStart(4,'0')}`);await employeePage();}
    catch(err){$('hireSubmit').disabled=false;message(err.message,true);}
  };
}
export {employeePage,yearsAt};
