'use strict';
const {error}=require('../security');

// Toda venta o cobro se atribuye al empleado vinculado al usuario autenticado.
// Nunca se acepta una asignacion de otro vendedor enviada por el navegador.
async function sellerContext(cn,user) {
  const result=await cn.execute(`
    SELECT es.ID_EMPLEADO_SUCURSAL AS ID_EMPLEADO_SUCURSAL,
           es.ID_SUCURSAL AS ID_SUCURSAL,
           pe.NOMBRES || ' ' || pe.APELLIDOS AS EMPLEADO,
           s.NOMBRE AS SUCURSAL,
           TRIM(p.CODIGO_ISO) AS PAIS_ISO
      FROM USUARIO u
      JOIN EMPLEADO e ON e.ID_EMPLEADO=u.ID_EMPLEADO
      JOIN PERSONA pe ON pe.ID_PERSONA=e.ID_PERSONA
      JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO=e.ID_EMPLEADO
      JOIN SUCURSAL s ON s.ID_SUCURSAL=es.ID_SUCURSAL
      JOIN DEPARTAMENTO d ON d.ID_DEPARTAMENTO=s.ID_DEPARTAMENTO
      JOIN PAIS p ON p.ID_PAIS=d.ID_PAIS
     WHERE u.ID_USUARIO=:id_usuario
       AND u.ESTADO_REGISTRO='A' AND u.BLOQUEADO='N'
       AND e.ESTADO_REGISTRO='A' AND e.FECHA_BAJA IS NULL
       AND pe.ESTADO_REGISTRO='A'
       AND es.ESTADO_REGISTRO='A' AND es.FECHA_FIN IS NULL
       AND s.ESTADO_REGISTRO='A'
     FETCH FIRST 2 ROWS ONLY`,{id_usuario:user.id_usuario});
  if(result.rows.length===0)throw error('Esta cuenta no tiene un empleado activo asignado a una sucursal. Solicitá que lo asignen antes de facturar o cobrar.',403);
  if(result.rows.length!==1)throw error('El usuario tiene varias asignaciones de sucursal activas. Debe tener una única para facturar o cobrar.',409);
  const r=result.rows[0];
  const prefijos={GT:'502',SV:'503',HN:'504'};
  const prefijo=prefijos[String(r.PAIS_ISO||'').trim().toUpperCase()];
  if(!prefijo)throw error('El país de la sucursal no tiene un código telefónico configurado',409);
  return {
    ID_EMPLEADO_SUCURSAL:Number(r.ID_EMPLEADO_SUCURSAL),
    ID_SUCURSAL:Number(r.ID_SUCURSAL),
    ETIQUETA:String(r.EMPLEADO)+' · '+String(r.SUCURSAL),
    CODIGO_TELEFONO:prefijo,
    PAIS_ISO:String(r.PAIS_ISO).trim().toUpperCase()
  };
}

function sameSeller(payload,seller) {
  if(payload?.id_empleado_sucursal!=null && payload.id_empleado_sucursal!=='' &&
     Number(payload.id_empleado_sucursal)!==seller.ID_EMPLEADO_SUCURSAL)
    throw error('Solo puede registrar la venta o el cobro el empleado que inició sesión',403);
  return {...payload,id_empleado_sucursal:seller.ID_EMPLEADO_SUCURSAL};
}
function assertCountryPhone(phone,seller) {
  if(phone && !String(phone).trim().startsWith('+'+seller.CODIGO_TELEFONO+' '))
    throw error('El teléfono del cliente debe tener el prefijo +'+seller.CODIGO_TELEFONO+' de la sucursal',400);
}
module.exports={sellerContext,sameSeller,assertCountryPhone};
