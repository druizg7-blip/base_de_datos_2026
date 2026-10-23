'use strict';
const jwt=require('jsonwebtoken');
const {connection,oracledb}=require('./db');
function error(message,status=400){return Object.assign(new Error(message),{status});}
async function login(usuario,clave){
  if(typeof usuario!=='string'||typeof clave!=='string'||usuario.length>50||clave.length>200||!usuario.trim()||!clave)throw error('Ingresa usuario y contraseña');
  return connection(usuario,async c=>{
    const result=await c.execute('BEGIN :id := PKG_SEGURIDAD.LOGIN(:usuario,:clave); END;',{
      id:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER},usuario,clave});
    const id=result.outBinds.id;
    if(id===-1)throw error('Usuario bloqueado. Solicita desbloqueo.',423);
    if(!id || id<1)throw error('Usuario o contraseña incorrectos',401);
    const data=await c.execute("SELECT u.ID_USUARIO,u.NOMBRE_USUARIO,u.ID_ROL,r.NOMBRE AS ROL FROM USUARIO u JOIN ROL r ON r.ID_ROL=u.ID_ROL WHERE u.ID_USUARIO=:id AND u.ESTADO_REGISTRO='A'",{id});
    const item=data.rows[0];if(!item)throw error('Usuario inactivo',403);
    const payload={id_usuario:item.ID_USUARIO,nombre_usuario:item.NOMBRE_USUARIO,id_rol:item.ID_ROL,rol:item.ROL};
    return {token:jwt.sign(payload,process.env.JWT_SECRET,{algorithm:'HS256',expiresIn:'8h'}),user:payload};
  });
}
function authenticate(req,res,next){
  try{const match=/^Bearer\s+(.+)$/i.exec(req.headers.authorization||'');if(!match)throw error('Inicie sesión',401);
    req.user=jwt.verify(match[1],process.env.JWT_SECRET,{algorithms:['HS256']});
                                                                               
    connection(req.user.nombre_usuario, async cn => {
      const r=await cn.execute(`SELECT COUNT(*) AS ACTIVO FROM USUARIO u
        WHERE u.ID_USUARIO=:id AND u.ESTADO_REGISTRO='A' AND u.BLOQUEADO='N'`,{id:req.user.id_usuario});
      return Number(r.rows[0]?.ACTIVO)===1;
    }).then(active=>active?next():next(error('Cuenta desactivada o empleado despedido',401))).catch(next);
  }catch(err){next(err.status?err:error('Sesión vencida o inválida',401));}
}
async function allowed(user,ruta,accion='C'){
  if(!/^\/[\w/áéíóúñ-]+$/i.test(ruta))return false;
  const n=await connection(user.nombre_usuario,async cn=>(await cn.execute('BEGIN :resultado := PKG_SEGURIDAD.TIENE_PERMISO(:id,:ruta,:accion); END;',{
    resultado:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER},id:user.id_usuario,ruta,accion})).outBinds.resultado);
  return Number(n)===1;
}
function permit(ruta,accion='C'){
 return async(req,res,next)=>{try{const path=typeof ruta==='function'?ruta(req):ruta;if(!path||!await allowed(req.user,path,accion))throw error(`Acceso no autorizado: ${path||'ruta desconocida'} (${accion})`,403);next();}catch(e){next(e)}};
}
async function menu(user){return connection(user.nombre_usuario,async cn=>{
 const r=await cn.execute('BEGIN PKG_SEGURIDAD.MENU_USUARIO(:id,:cursor); END;', {id:user.id_usuario,cursor:{dir:oracledb.BIND_OUT,type:oracledb.CURSOR}});
 const cur=r.outBinds.cursor;try{return await cur.getRows(400)}finally{await cur.close()}
});}
async function changePassword(user,current,next){
 if(typeof next!=='string'||next.length<10)throw error('La nueva contraseña debe tener al menos 10 caracteres');
 return connection(user.nombre_usuario,async cn=>{await cn.execute('BEGIN PKG_SEGURIDAD.CAMBIAR_CLAVE(:id,:actual,:nueva); END;',{id:user.id_usuario,actual:current,nueva:next});return{ok:true};},{write:true});
}
async function createUser(user,{usuario,clave,id_rol,id_empleado}){
 if(!usuario||typeof clave!=='string'||clave.length<10||!Number.isInteger(Number(id_rol)))throw error('Usuario, rol y clave (mínimo 10 caracteres) obligatorios');
 return connection(user.nombre_usuario,async cn=>{const r=await cn.execute('BEGIN :id := PKG_SEGURIDAD.CREAR_USUARIO(:usuario,:clave,:rol,:empleado); END;',{
  id:{dir:oracledb.BIND_OUT,type:oracledb.NUMBER},usuario,clave,rol:Number(id_rol),empleado:id_empleado?Number(id_empleado):null});return{id_usuario:r.outBinds.id};},{write:true});
}
module.exports={error,login,authenticate,allowed,permit,menu,changePassword,createUser};
