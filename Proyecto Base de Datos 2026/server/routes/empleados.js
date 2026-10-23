"use strict";
                                                                                         
const { validateHire } = require("../staff/validacion");
const { puestoParaRol } = require("../staff/roles");
const { rolesContratables, comprobarRolContratable } = require("../staff/asignacion-roles");
const {scope,clause,assertBranch}=require("../branch-scope");
module.exports = (router, { S, connection, oracledb, wrap }) => {
  const ruta = "/catalogos/empleados";
  const invalid = (msg) => { throw S.error(msg, 400); };
  const requiredText = (value, max, label) => {
    if (typeof value !== "string" || !value.trim() || value.trim().length > max) invalid(`${label} obligatorio (máximo ${max} caracteres)`);
    return value.trim();
  };
  const positiveId = (n, label) => {
    const v = Number(n);
    if (!Number.isSafeInteger(v) || v <= 0) invalid(`${label} inválido`);
    return v;
  };
  const currentDate = () => new Intl.DateTimeFormat('en-CA', {
    timeZone:'America/Guatemala', year:'numeric',month:'2-digit',day:'2-digit'
  }).format(new Date());
  const rows = async (cn, sql, binds = {}) => (await cn.execute(sql, binds)).rows;

  router.get("/personal/opciones", S.permit(ruta, "C"), wrap(async (req, res) => {
    const values = await connection(req.user.nombre_usuario, async (cn) => {
      const alcance=await scope(cn,req.user);
      const roles = await rolesContratables(cn, alcance.admin);
      const binds={};const filtro=clause(alcance,'ID_SUCURSAL',binds);
      const sucursales = await rows(cn, `SELECT ID_SUCURSAL AS ID, NOMBRE FROM SUCURSAL WHERE ESTADO_REGISTRO = 'A' ${filtro} ORDER BY NOMBRE`,binds);
                                                                                                         
      return { roles, sucursales };
    });
    res.json(values);
  }));

  router.get("/personal/empleados", S.permit(ruta, "C"), wrap(async (req, res) => {
    const values = await connection(req.user.nombre_usuario, async (cn) => {
      const alcance=await scope(cn,req.user);
      const binds={};const filtro=clause(alcance,'su.ID_SUCURSAL',binds);
      return rows(cn, `
      SELECT e.ID_EMPLEADO, e.CODIGO_EMPLEADO,
             p.NOMBRES, p.APELLIDOS, p.DOCUMENTO_IDENTIDAD AS DPI,
             TO_CHAR(p.FECHA_NACIMIENTO, 'YYYY-MM-DD') AS FECHA_NACIMIENTO,
             CASE WHEN p.FECHA_NACIMIENTO IS NOT NULL THEN
               TRUNC(MONTHS_BETWEEN(TRUNC(SYSDATE),p.FECHA_NACIMIENTO)/12)
             END AS EDAD,
             TO_CHAR(e.FECHA_CONTRATACION,'YYYY-MM-DD') AS FECHA_CONTRATACION,
             TO_CHAR(e.FECHA_BAJA,'YYYY-MM-DD') AS FECHA_BAJA,
             e.ESTADO_REGISTRO,
             pu.ID_PUESTO, pu.NOMBRE AS PUESTO,
             rx.ID_ROL AS ID_ROL,
             su.ID_SUCURSAL, su.NOMBRE AS SUCURSAL,
             ux.NOMBRE_USUARIO, rx.NOMBRE AS ROL_ACCESO
      FROM EMPLEADO e
      JOIN PERSONA p ON p.ID_PERSONA=e.ID_PERSONA
      LEFT JOIN (
        SELECT x.*, ROW_NUMBER() OVER(PARTITION BY ID_EMPLEADO ORDER BY FECHA_INICIO DESC, ID_EMPLEADO_PUESTO DESC) rn
        FROM EMPLEADO_PUESTO x WHERE x.ESTADO_REGISTRO='A' AND x.FECHA_FIN IS NULL
      ) ep ON ep.ID_EMPLEADO=e.ID_EMPLEADO AND ep.rn=1
      LEFT JOIN PUESTO pu ON pu.ID_PUESTO=ep.ID_PUESTO
      LEFT JOIN (
        SELECT x.*, ROW_NUMBER() OVER(PARTITION BY ID_EMPLEADO ORDER BY FECHA_INICIO DESC, ID_EMPLEADO_SUCURSAL DESC) rn
        FROM EMPLEADO_SUCURSAL x WHERE x.ESTADO_REGISTRO='A' AND x.FECHA_FIN IS NULL
      ) es ON es.ID_EMPLEADO=e.ID_EMPLEADO AND es.rn=1
      LEFT JOIN SUCURSAL su ON su.ID_SUCURSAL=es.ID_SUCURSAL
      LEFT JOIN (
        SELECT x.*, ROW_NUMBER() OVER(PARTITION BY ID_EMPLEADO ORDER BY ID_USUARIO DESC) rn
        FROM USUARIO x
      ) ux ON ux.ID_EMPLEADO=e.ID_EMPLEADO AND ux.rn=1
      LEFT JOIN ROL rx ON rx.ID_ROL=ux.ID_ROL
      WHERE 1=1 ${filtro}
      ORDER BY e.ID_EMPLEADO DESC
      FETCH FIRST 400 ROWS ONLY
    `,binds);
    });
    res.json(values);
  }));

  router.post("/personal/contratar", S.permit(ruta, "I"), wrap(async (req, res) => {
    const b = req.body || {};
    const names = requiredText(b.nombres, 100, "Nombres");
    const surnames = requiredText(b.apellidos, 100, "Apellidos");
    const dpi = requiredText(b.dpi, 25, "Documento de identidad");
    const rolSolicitado = positiveId(b.id_rol, "Rol / cargo");
    if (b.id_puesto !== undefined) invalid("Elegí el rol / cargo, no id_puesto");
    const sucursal = positiveId(b.id_sucursal, "Sucursal");
    const fecha = b.fecha_contratacion || currentDate();
    let edad;
    try { edad = validateHire(b.fecha_nacimiento, fecha, currentDate()); }
    catch (e) { invalid(e.message); }
                                                                                         
    const wantsUser = !!(b.usuario || b.clave);
    let usuario, clave;
    if (wantsUser) {
      if (!await S.allowed(req.user, "/admin/usuarios", "I")) throw S.error("Sin permiso para crear usuarios", 403);
      usuario = requiredText(b.usuario, 50, "Usuario");
      clave = requiredText(b.clave, 200, "Contraseña");
      if (clave.length < 10) invalid("La contraseña debe tener al menos 10 caracteres");
    }
    const result = await connection(req.user.nombre_usuario, async (cn) => {
      const alcance = await scope(cn,req.user);
      assertBranch(alcance,sucursal);
                                                                                 
      const existing = await rows(cn, "SELECT ID_PERSONA FROM PERSONA WHERE DOCUMENTO_IDENTIDAD=:dpi FETCH FIRST 1 ROWS ONLY", { dpi });
      if (existing.length) invalid("Ya existe una persona con ese documento. No se duplicó el empleado.");
      const sucursales = await rows(cn, "SELECT ID_SUCURSAL FROM SUCURSAL WHERE ID_SUCURSAL=:id AND ESTADO_REGISTRO='A'", {id:sucursal});
      if (!sucursales.length) invalid("Sucursal inexistente o inactiva");
                                                                                                       
      await comprobarRolContratable(cn, rolSolicitado, alcance.admin);
      const cargo = await puestoParaRol(cn, rolSolicitado, req.user.nombre_usuario);
      const puesto = cargo.idPuesto;
      const rol = cargo.idRol;
      const ids = await rows(cn, "SELECT SEQ_PERSONA.NEXTVAL AS PERSONA, SEQ_EMPLEADO.NEXTVAL AS EMPLEADO FROM DUAL");
      const idPersona = ids[0].PERSONA, idEmpleado = ids[0].EMPLEADO;
      await cn.execute(`INSERT INTO PERSONA (ID_PERSONA,NOMBRES,APELLIDOS,DOCUMENTO_IDENTIDAD,FECHA_NACIMIENTO,
        FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
        VALUES (:id,:n,:a,:dpi,TO_DATE(:nacimiento,'YYYY-MM-DD'),SYSTIMESTAMP,:actor,'A')`,
        { id:idPersona, n:names, a:surnames, dpi, nacimiento:b.fecha_nacimiento, actor:req.user.nombre_usuario });
      await cn.execute(`INSERT INTO EMPLEADO (ID_EMPLEADO,ID_PERSONA,CODIGO_EMPLEADO,FECHA_CONTRATACION,
        FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
        VALUES (:id,:persona,:codigo,TO_DATE(:fecha,'YYYY-MM-DD'),SYSTIMESTAMP,:actor,'A')`,
        { id:idEmpleado, persona:idPersona, codigo:`EMP-${String(idEmpleado).padStart(4,'0')}`, fecha, actor:req.user.nombre_usuario });
      await cn.execute(`INSERT INTO EMPLEADO_PUESTO (ID_EMPLEADO_PUESTO,ID_EMPLEADO,ID_PUESTO,FECHA_INICIO,
        FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
        VALUES (SEQ_EMPLEADO_PUESTO.NEXTVAL,:e,:p,TO_DATE(:fecha,'YYYY-MM-DD'),SYSTIMESTAMP,:actor,'A')`,
        { e:idEmpleado, p:puesto, fecha, actor:req.user.nombre_usuario });
      await cn.execute(`INSERT INTO EMPLEADO_SUCURSAL (ID_EMPLEADO_SUCURSAL,ID_EMPLEADO,ID_SUCURSAL,FECHA_INICIO,
        FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
        VALUES (SEQ_EMPLEADO_SUCURSAL.NEXTVAL,:e,:s,TO_DATE(:fecha,'YYYY-MM-DD'),SYSTIMESTAMP,:actor,'A')`,
        { e:idEmpleado, s:sucursal, fecha, actor:req.user.nombre_usuario });
      let idUsuario = null;
      if (wantsUser) {
        const out = await cn.execute("BEGIN :id := PKG_SEGURIDAD.CREAR_USUARIO(:usuario,:clave,:rol,:empleado); END;", {
          id: {dir:oracledb.BIND_OUT,type:oracledb.NUMBER},usuario,clave,rol,empleado:idEmpleado,
        });
        idUsuario = out.outBinds.id;
      }
      return { id_empleado:idEmpleado, id_usuario:idUsuario, rol_asignado:rol, puesto_asignado:puesto, edad };
    }, { write:true });
    res.status(201).json(result);
  }));

  router.put("/personal/empleados/:id/asignacion", S.permit(ruta, "U"), wrap(async (req, res) => {
    const id = positiveId(req.params.id, "Empleado");
    const rolSolicitado = positiveId(req.body?.id_rol, "Rol / cargo");
    if (req.body?.id_puesto !== undefined) invalid("Elegí el rol / cargo, no id_puesto");
    const sucursal = positiveId(req.body?.id_sucursal, "Sucursal");
    await connection(req.user.nombre_usuario, async (cn) => {
      const alcance=await scope(cn,req.user);
      assertBranch(alcance,sucursal);
      const records = await rows(cn, "SELECT ID_EMPLEADO FROM EMPLEADO WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' FOR UPDATE", { id });
      if (!records.length) throw S.error("El empleado no existe o ya fue despedido", 404);
      if(!alcance.admin){
        const ubic=await rows(cn,`SELECT ID_SUCURSAL FROM EMPLEADO_SUCURSAL
          WHERE ID_EMPLEADO=:id AND FECHA_FIN IS NULL AND ESTADO_REGISTRO='A'`,{id});
        if(ubic.some(u=>!alcance.ids.includes(Number(u.ID_SUCURSAL))))throw S.error('No puede cambiar empleados de otra sucursal',403);
      }
      await comprobarRolContratable(cn, rolSolicitado, alcance.admin);
      const sucursales = await rows(cn,"SELECT ID_SUCURSAL FROM SUCURSAL WHERE ID_SUCURSAL=:id AND ESTADO_REGISTRO='A'",{id:sucursal});
      if (!sucursales.length) invalid("Sucursal inexistente o inactiva");
      const cuentas = await rows(cn,"SELECT ID_USUARIO, ID_ROL FROM USUARIO WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' FOR UPDATE",{id});
      if (cuentas.some(x=>Number(x.ID_ROL)!==rolSolicitado) &&
          !await S.allowed(req.user,"/admin/usuarios","U")) {
        throw S.error("Cambiar el cargo también cambia los permisos. Requiere autorización de Seguridad.",403);
      }
      const actor = req.user.nombre_usuario;
      const cargo = await puestoParaRol(cn, rolSolicitado, actor);
      const puesto = cargo.idPuesto;
      await cn.execute(`UPDATE EMPLEADO_PUESTO SET FECHA_FIN=TRUNC(SYSDATE), ESTADO_REGISTRO='I', FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
        WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' AND FECHA_FIN IS NULL`, {id,actor});
      await cn.execute(`UPDATE EMPLEADO_SUCURSAL SET FECHA_FIN=TRUNC(SYSDATE), ESTADO_REGISTRO='I', FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
        WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' AND FECHA_FIN IS NULL`, {id,actor});
      await cn.execute(`INSERT INTO EMPLEADO_PUESTO (ID_EMPLEADO_PUESTO,ID_EMPLEADO,ID_PUESTO,FECHA_INICIO,FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
        VALUES(SEQ_EMPLEADO_PUESTO.NEXTVAL,:id,:puesto,TRUNC(SYSDATE),SYSTIMESTAMP,:actor,'A')`, {id,puesto,actor});
      await cn.execute(`INSERT INTO EMPLEADO_SUCURSAL (ID_EMPLEADO_SUCURSAL,ID_EMPLEADO,ID_SUCURSAL,FECHA_INICIO,FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
        VALUES(SEQ_EMPLEADO_SUCURSAL.NEXTVAL,:id,:sucursal,TRUNC(SYSDATE),SYSTIMESTAMP,:actor,'A')`, {id,sucursal,actor});
      if (cuentas.length) {
        await cn.execute(`UPDATE USUARIO SET ID_ROL=:rol, FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
          WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A'`, {rol:rolSolicitado,id,actor});
      }
    }, {write:true});
    res.json({ok:true});
  }));

  router.post("/personal/empleados/:id/despedir", S.permit(ruta, "D"), wrap(async (req, res) => {
    const id = positiveId(req.params.id,"Empleado");
    await connection(req.user.nombre_usuario, async (cn) => {
      const record = await rows(cn,"SELECT ID_EMPLEADO FROM EMPLEADO WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' FOR UPDATE",{id});
      if (!record.length) throw S.error("Empleado inexistente o ya despedido",404);
      const self = await rows(cn,"SELECT ID_USUARIO FROM USUARIO WHERE ID_EMPLEADO=:id AND ID_USUARIO=:user_id",{id,user_id:req.user.id_usuario});
      if (self.length) invalid("No podés despedir tu propia cuenta");
      const actor = req.user.nombre_usuario;
      await cn.execute(`UPDATE EMPLEADO SET FECHA_BAJA=TRUNC(SYSDATE), ESTADO_REGISTRO='I', FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
        WHERE ID_EMPLEADO=:id`,{id,actor});
      await cn.execute(`UPDATE EMPLEADO_PUESTO SET FECHA_FIN=TRUNC(SYSDATE), ESTADO_REGISTRO='I', FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
        WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' AND FECHA_FIN IS NULL`,{id,actor});
      await cn.execute(`UPDATE EMPLEADO_SUCURSAL SET FECHA_FIN=TRUNC(SYSDATE), ESTADO_REGISTRO='I', FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
        WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' AND FECHA_FIN IS NULL`,{id,actor});
      await cn.execute(`UPDATE USUARIO SET ESTADO_REGISTRO='I', BLOQUEADO='S', FECHA_MODIFICACION=SYSTIMESTAMP, USUARIO_MODIFICACION=:actor
        WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A'`,{id,actor});
    }, {write:true});
    res.json({ok:true,mensaje:"Empleado dado de baja; historial conservado y accesos desactivados"});
  }));
};
