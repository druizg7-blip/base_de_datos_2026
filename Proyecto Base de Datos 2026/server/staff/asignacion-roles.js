"use strict";
// La posibilidad de contratar no implica permiso para conceder acceso administrativo.
// La restricción se basa en los permisos reales guardados en Oracle ROL_OPCION.
const restriccion = `
  UPPER(TRIM(r.NOMBRE)) NOT IN ('ADMINISTRADOR GENERAL', 'ADMINISTRADOR')
  AND NOT EXISTS (
    SELECT 1 FROM ROL_OPCION ro
    JOIN OPCION o ON o.ID_OPCION = ro.ID_OPCION
    WHERE ro.ID_ROL = r.ID_ROL
      AND ro.ESTADO_REGISTRO = 'A'
      AND o.ESTADO_REGISTRO = 'A'
      AND o.RUTA IN ('/admin/usuarios', '/admin/roles')
      AND (ro.PUEDE_CONSULTAR='S' OR ro.PUEDE_INSERTAR='S'
           OR ro.PUEDE_ACTUALIZAR='S' OR ro.PUEDE_ELIMINAR='S')
  )`;

async function rolesContratables(cn, esAdministrador) {
  const filtro = esAdministrador ? '' : ` AND ${restriccion}`;
  const r = await cn.execute(`SELECT r.ID_ROL AS ID, r.NOMBRE
    FROM ROL r WHERE r.ESTADO_REGISTRO='A' ${filtro} ORDER BY r.ID_ROL`);
  return r.rows;
}

async function comprobarRolContratable(cn, idRol, esAdministrador) {
  const filtro = esAdministrador ? '' : ` AND ${restriccion}`;
  const r = await cn.execute(`SELECT r.ID_ROL AS ID
    FROM ROL r WHERE r.ID_ROL=:rol AND r.ESTADO_REGISTRO='A' ${filtro}`,
  {rol:idRol});
  if (r.rows.length !== 1) {
    const err = new Error('No tenés autorización para asignar ese rol / cargo, o el rol no está activo');
    err.status = 403;
    throw err;
  }
}
module.exports = {rolesContratables, comprobarRolContratable};
