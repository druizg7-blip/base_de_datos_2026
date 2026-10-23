                                                                       
import { section } from "../../core/navigation.js";
import { $, api, button, escape, label, message } from "../../core/state.js";
import { dataTable, header, options, payload } from "../../core/ui.js";

async function users() {
  $("content").innerHTML = header('Gestión de usuarios',
    'Cuentas y contraseñas administradas desde Oracle');
  try {
    const actuales = await api("/seguridad/usuarios");
    const reset = document.createElement('section');
    reset.className='card';
    reset.innerHTML=`<h2>Administrar contraseña</h2>
      <p class="micro">Seleccioná la cuenta y establecé una contraseña nueva. No se muestran las contraseñas anteriores.</p>
      <form id="adminResetPassword" class="form-grid two">
        <label class="field">Usuario *<select name="id" required><option value="">Elegí un usuario...</option>
          ${actuales.filter(u=>u.ESTADO_REGISTRO==='A').map(u=>`<option value="${escape(u.ID_USUARIO)}">${escape(u.NOMBRE_USUARIO)} · ${escape(u.ROL)}</option>`).join('')}
        </select></label>
        <label class="field">Contraseña nueva (10+ caracteres) *<input name="clave" type="password" minlength="10" required autocomplete="new-password"></label>
        <button class="btn green">Actualizar contraseña de este usuario</button>
      </form>`;
    $('content').append(reset);
    $('adminResetPassword').onsubmit=async ev=>{
      ev.preventDefault(); const form=ev.target;
      if(!confirm('¿Restablecer la contraseña de este usuario?'))return;
      try {await api('/seguridad/usuarios/'+encodeURIComponent(form.elements.id.value)+'/clave',{
        method:'PUT',body:JSON.stringify({clave:form.elements.clave.value})});
        form.reset();message('Contraseña restablecida en Oracle');}
      catch(e){message(e.message,true)}
    };

    const panel = document.createElement("section");
    panel.className = "card";

    panel.innerHTML = `
      <h2>Usuarios registrados · ${actuales.length}</h2>
      <p class="micro">
        Roles y estado de acceso. Las contraseñas no se muestran.
      </p>
      ${dataTable(actuales)}
    `;

    $("content").append(panel);

  } catch (err) {
    message(
      "No se pudo cargar el listado de usuarios: " + err.message,
      true
    );
  }
}

export { users };
