import { $, api, escape, message } from '../../core/state.js';
import { modal, closeModal } from '../../core/ui.js';
import { openPage } from '../../core/navigation.js';

const prefijos = {
  '502': 'Guatemala +502',
  '503': 'El Salvador +503',
  '504': 'Honduras +504',
};

function opcionesPrefijo(fijo) {
  if (fijo && prefijos[fijo]) {
    return `<option value="${fijo}">${prefijos[fijo]}</option>`;
  }
  return Object.entries(prefijos)
    .map(([valor, texto]) => `<option value="${valor}">${texto}</option>`)
    .join('');
}

export async function altaCliente(){
 let caja=null;
 try { caja = await api('/ventas/mi-caja'); } catch {}
 const prefijoFijo = caja?.CODIGO_TELEFONO || '';
 modal(`<form id="altaCliente" class="form-grid two">
 <label class="field">Nombres *<input name="nombres" maxlength="100" required></label>
 <label class="field">Apellidos *<input name="apellidos" maxlength="100" required></label>
 <label class="field">NIT (opcional)<input name="nit" maxlength="20"></label>
 <label class="field">Prefijo telefónico<select name="prefijo" ${prefijoFijo ? 'disabled' : ''}>${opcionesPrefijo(prefijoFijo)}</select></label>
 <label class="field">Teléfono (8 dígitos, opcional)<input name="numero" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" placeholder="45781919"></label>
 <div class="form-footer"><button type="button" class="btn" id="cancelAltaCliente">Cancelar</button>
 <button class="btn green">Registrar cliente</button></div></form>`,
 'Registrar cliente');
 $('cancelAltaCliente').onclick=closeModal;
 $('altaCliente').onsubmit=async e=>{
  e.preventDefault(); const form=e.target;
  const b=Object.fromEntries(new FormData(form).entries());
  if(prefijoFijo) b.prefijo = prefijoFijo;
  if(b.numero)b.telefono=`+${b.prefijo} ${b.numero.slice(0,4)}-${b.numero.slice(4)}`;
  delete b.prefijo;delete b.numero;
  const btn=form.querySelector('button[type=submit],button:not([type])'); if(btn)btn.disabled=true;
  try{await api('/clientes/alta',{method:'POST',body:JSON.stringify(b)});
   closeModal();message('Cliente registrado correctamente'); await openPage('/catalogos/clientes');}
  catch(err){message(err.message,true);if(btn)btn.disabled=false;}
 };
}
