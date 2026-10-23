'use strict';
                                                                                      
const { error } = require('./security');
async function scope(cn, user) {
  const r = await cn.execute(`SELECT r.NOMBRE AS ROL, u.ID_EMPLEADO
    FROM USUARIO u JOIN ROL r ON r.ID_ROL=u.ID_ROL
    WHERE u.ID_USUARIO=:id AND u.ESTADO_REGISTRO='A' AND u.BLOQUEADO='N'`, { id:user.id_usuario });
  if (r.rows.length!==1) throw error('Cuenta sin acceso',403);
  if (r.rows[0].ROL==='Administrador General') return {admin:true, ids:[]};
  const branches=await cn.execute(`SELECT DISTINCT es.ID_SUCURSAL AS ID
    FROM EMPLEADO_SUCURSAL es JOIN EMPLEADO e ON e.ID_EMPLEADO=es.ID_EMPLEADO
    WHERE es.ID_EMPLEADO=:empleado AND e.ESTADO_REGISTRO='A'
      AND es.ESTADO_REGISTRO='A' AND es.FECHA_FIN IS NULL`, {empleado:r.rows[0].ID_EMPLEADO||0});
  return {admin:false, ids:branches.rows.map(x=>Number(x.ID))};
}
function clause(s,column,binds={}) {
  if (s.admin) return '';
  if (!s.ids.length) return ' AND 1=0';
  const names=s.ids.map((id,i)=>{const k='sc_'+i; binds[k]=id;return ':'+k;});
  return ` AND ${column} IN (${names.join(',')})`;
}
function assertBranch(s,id) {
  if (!s.admin && !s.ids.includes(Number(id))) throw error('No autorizado para esta sucursal',403);
}
async function owner(cn, s, table, pk, id, branchColumn='ID_SUCURSAL') {
  if(s.admin) return;
  const binds={id:Number(id)};
  const filter=clause(s,branchColumn,binds);
  const r=await cn.execute(`SELECT 1 AS OK FROM ${table} WHERE ${pk}=:id ${filter}`,binds);
  if(!r.rows.length) throw error('Registro fuera de la sucursal autorizada',403);
}
module.exports={scope,clause,assertBranch,owner};
