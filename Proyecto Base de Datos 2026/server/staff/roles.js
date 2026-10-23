"use strict";
                                                                        
                                                                            
                                                                           
function normalizar(valor) {
  return String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim().replace(/\s+/g, " ").toUpperCase();
}

async function puestoParaRol(cn, idRol, actor) {
                                                                         
                                                      
  const result = await cn.execute(
    "SELECT ID_ROL AS ID, NOMBRE FROM ROL WHERE ID_ROL=:id AND ESTADO_REGISTRO='A' FOR UPDATE",
    { id: idRol }
  );
  const rol = result.rows[0];
  if (!rol) throw new Error("Rol inexistente o inactivo");
  const current = await cn.execute(
    "SELECT ID_PUESTO AS ID FROM PUESTO WHERE UPPER(TRIM(NOMBRE))=UPPER(TRIM(:nombre)) AND ESTADO_REGISTRO='A' ORDER BY ID_PUESTO FETCH FIRST 1 ROWS ONLY",
    { nombre: rol.NOMBRE }
  );
  if (current.rows.length) {
    return { idRol: Number(rol.ID), idPuesto: Number(current.rows[0].ID), nombre: rol.NOMBRE, creado: false };
  }
  const seq = await cn.execute("SELECT SEQ_PUESTO.NEXTVAL AS ID FROM DUAL");
  const idPuesto = Number(seq.rows[0].ID);
  await cn.execute(`INSERT INTO PUESTO (ID_PUESTO,NOMBRE,DESCRIPCION,FECHA_CREACION,USUARIO_CREACION,ESTADO_REGISTRO)
    VALUES (:id,:nombre,:descripcion,SYSTIMESTAMP,:actor,'A')`,
    { id: idPuesto, nombre: rol.NOMBRE,
      descripcion: "Cargo homologado con rol de acceso", actor });
  return { idRol: Number(rol.ID), idPuesto, nombre: rol.NOMBRE, creado: true };
}

module.exports = { normalizar, puestoParaRol };
