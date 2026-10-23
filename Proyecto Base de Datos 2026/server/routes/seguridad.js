"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                       

router.get(
  "/seguridad/usuarios",
  S.permit("/admin/usuarios", "C"),
  wrap(async (req, res) => {
    const filas = await connection(
      req.user.nombre_usuario,
      async c => {
        const resultado = await c.execute(`
          SELECT
            u.ID_USUARIO,
            u.NOMBRE_USUARIO,
            u.ID_ROL,
            r.NOMBRE AS ROL,
            u.ESTADO_REGISTRO,
            u.BLOQUEADO,
            u.INTENTOS_FALLIDOS,
            TO_CHAR(
              u.ULTIMO_ACCESO,
              'YYYY-MM-DD HH24:MI'
            ) AS ULTIMO_ACCESO
          FROM USUARIO u
          JOIN ROL r ON r.ID_ROL = u.ID_ROL
          ORDER BY u.ID_USUARIO
        `);

        return resultado.rows;
      }
    );

    res.json(filas);
  })
);

router.get(
  "/seguridad/roles-datos",
  S.permit("/admin/roles", "C"),
  wrap(async (req, res) => {
    const datos = await connection(
      req.user.nombre_usuario,
      async c => {
        const roles = await c.execute(`
          SELECT
            ID_ROL,
            NOMBRE,
            DESCRIPCION,
            ESTADO_REGISTRO
          FROM ROL
          ORDER BY ID_ROL
        `);

        const permisos = await c.execute(`
          SELECT
            ro.ID_ROL_OPCION AS ID,
            ro.ID_ROL,
            ro.ID_OPCION,
            r.NOMBRE AS ROL,
            o.NOMBRE AS OPCION,
            o.RUTA,
            ro.PUEDE_CONSULTAR AS CONSULTAR,
            ro.PUEDE_INSERTAR AS INSERTAR,
            ro.PUEDE_ACTUALIZAR AS ACTUALIZAR,
            ro.PUEDE_ELIMINAR AS ELIMINAR
          FROM ROL_OPCION ro
          JOIN ROL r ON r.ID_ROL = ro.ID_ROL
          JOIN OPCION o ON o.ID_OPCION = ro.ID_OPCION
          ORDER BY r.NOMBRE, o.NOMBRE
        `);

        const opciones = await c.execute(`
          SELECT
            ID_OPCION,
            NOMBRE,
            RUTA,
            ESTADO_REGISTRO
          FROM OPCION
          ORDER BY ID_OPCION
        `);

        return {
          roles: roles.rows,
          permisos: permisos.rows,
          opciones: opciones.rows
        };
      }
    );

    res.json(datos);
  })
);

router.get(
  "/seguridad/bitacora",
  S.permit("/admin/bitacora", "C"),
  wrap(async (req, res) => {
    const filas = await connection(
      req.user.nombre_usuario,
      async c => {
        const resultado = await c.execute(`
          SELECT
            b.ID_BITACORA,
            TO_CHAR(
              b.FECHA_HORA,
              'YYYY-MM-DD HH24:MI:SS'
            ) AS FECHA_HORA,
            b.ID_USUARIO,
            NVL(b.USUARIO_CREACION, NVL(u.NOMBRE_USUARIO, 'No identificado (histórico)')) AS USUARIO_CREACION,
            b.TIPO_EVENTO,
            b.TABLA_AFECTADA,
            b.ID_REGISTRO,
            b.MODULO,
            b.DESCRIPCION,
            DBMS_LOB.SUBSTR(b.VALOR_ANTERIOR,1800,1) AS VALOR_ANTERIOR,
            DBMS_LOB.SUBSTR(b.VALOR_NUEVO,1800,1) AS VALOR_NUEVO
          FROM BITACORA b
          LEFT JOIN USUARIO u
            ON u.ID_USUARIO = b.ID_USUARIO
          ORDER BY b.ID_BITACORA DESC
          FETCH FIRST 200 ROWS ONLY
        `);

        return resultado.rows;
      }
    );

    res.json(filas);
  })
);

router.put('/seguridad/usuarios/:id/clave',S.permit('/admin/usuarios','U'),wrap(async(req,res)=>{
 const id=Number(req.params.id),clave=req.body?.clave;
 if(!Number.isSafeInteger(id)||id<=0||typeof clave!=='string'||clave.length<10||clave.length>200)
  throw S.error('Seleccioná un usuario y una contraseña de 10 a 200 caracteres',400);
 await connection(req.user.nombre_usuario,async cn=>{
   const r=await cn.execute(`UPDATE USUARIO SET CLAVE=FN_HASH_CLAVE(:clave),
     INTENTOS_FALLIDOS=0,BLOQUEADO='N',FECHA_MODIFICACION=SYSTIMESTAMP,
     USUARIO_MODIFICACION=:actor WHERE ID_USUARIO=:id AND ESTADO_REGISTRO='A'`,
     {clave,id,actor:req.user.nombre_usuario});
   if(r.rowsAffected!==1)throw S.error('Usuario inactivo o inexistente',404);
 },{write:true});
 res.json({ok:true});
}));
router.put('/seguridad/permisos',S.permit('/admin/roles','U'),wrap(async(req,res)=>{
 const b=req.body||{}; const idRol=Number(b.id_rol),idOpcion=Number(b.id_opcion);
 if(!Number.isSafeInteger(idRol)||idRol<1||!Number.isSafeInteger(idOpcion)||idOpcion<1)
  throw S.error('Seleccioná un rol y una opción existente',400);
 const campos=['puede_consultar','puede_insertar','puede_actualizar','puede_eliminar'];
 if(campos.some(k=>!['S','N'].includes(b[k])))throw S.error('Permisos inválidos',400);
 await connection(req.user.nombre_usuario,async cn=>{
   const valid=await cn.execute(`SELECT COUNT(*) TOTAL FROM ROL r CROSS JOIN OPCION o
     WHERE r.ID_ROL=:rol AND o.ID_OPCION=:opcion AND r.ESTADO_REGISTRO='A' AND o.ESTADO_REGISTRO='A'`,
     {rol:idRol,opcion:idOpcion});
   if(Number(valid.rows[0].TOTAL)!==1) throw S.error('Rol u opción inactiva',400);
   const rolName=await cn.execute('SELECT NOMBRE FROM ROL WHERE ID_ROL=:id',{id:idRol});
   const opRoute=await cn.execute('SELECT RUTA FROM OPCION WHERE ID_OPCION=:id',{id:idOpcion});
   if(rolName.rows[0]?.NOMBRE==='Administrador General' &&
      ['/admin/usuarios','/admin/roles'].includes(opRoute.rows[0]?.RUTA) &&
      (b.puede_consultar!=='S'||b.puede_actualizar!=='S'))
     throw S.error('No se puede quitar al administrador el acceso básico a Seguridad',400);
   const binds={rol:idRol,opcion:idOpcion,c:b.puede_consultar,i:b.puede_insertar,
      u:b.puede_actualizar,d:b.puede_eliminar,actor:req.user.nombre_usuario};
   const current=await cn.execute(`SELECT ID_ROL_OPCION AS ID FROM ROL_OPCION
     WHERE ID_ROL=:rol AND ID_OPCION=:opcion FOR UPDATE`,{rol:idRol,opcion:idOpcion});
   if(current.rows.length){
    await cn.execute(`UPDATE ROL_OPCION SET PUEDE_CONSULTAR=:c,PUEDE_INSERTAR=:i,
      PUEDE_ACTUALIZAR=:u,PUEDE_ELIMINAR=:d,ESTADO_REGISTRO='A',
      FECHA_MODIFICACION=SYSTIMESTAMP,USUARIO_MODIFICACION=:actor
      WHERE ID_ROL_OPCION=:id`,{c:binds.c,i:binds.i,u:binds.u,d:binds.d,actor:binds.actor,id:current.rows[0].ID});
   }else{
    await cn.execute(`INSERT INTO ROL_OPCION
      (ID_ROL_OPCION,ID_ROL,ID_OPCION,PUEDE_CONSULTAR,PUEDE_INSERTAR,PUEDE_ACTUALIZAR,PUEDE_ELIMINAR,
       FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
      VALUES(SEQ_ROL_OPCION.NEXTVAL,:rol,:opcion,:c,:i,:u,:d,SYSTIMESTAMP,:actor,'A')`,binds);
   }
 },{write:true});res.json({ok:true});
}));

};
