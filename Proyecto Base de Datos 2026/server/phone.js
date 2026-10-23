"use strict";
const { error } = require("./security");

                                                                      
const INICIOS = { "502": /^[234567]/, "503": /^[267]/, "504": /^[23789]/ };
const POR_ISO = { GT: "502", SV: "503", HN: "504" };

function normalizarTelefono(valor) {
  if (valor === null || valor === undefined || valor === "") return null;
  if (typeof valor !== "string") throw error("Teléfono inválido", 400);
  const texto = valor.trim();
  if (!texto) return null;
  const match = /^\+(502|503|504)[ -]*([\d -]+)$/.exec(texto);
  if (!match) throw error("Elegí +502, +503 o +504 e ingresá ocho dígitos", 400);
  const prefijo = match[1];
  const numero = match[2].replace(/[ -]/g, "");
  if (!/^\d{8}$/.test(numero) || !INICIOS[prefijo].test(numero)) {
    throw error(`Número inválido para +${prefijo}: debe tener 8 dígitos con una serie válida del país`, 400);
  }
  return `+${prefijo} ${numero.slice(0,4)}-${numero.slice(4)}`;
}

                                                                                 
async function validarPaisTelefono(cn, tabla, campos, id = null) {
  if (!["SUCURSAL", "PROVEEDOR"].includes(tabla)) return;
  if (campos.TELEFONO === undefined && campos.ID_DEPARTAMENTO === undefined && campos.ID_PAIS === undefined) return;
  const fk = tabla === "SUCURSAL" ? "ID_DEPARTAMENTO" : "ID_PAIS";
  let idPais = campos[fk];
  let telefono = campos.TELEFONO;
  if (id && (idPais === undefined || telefono === undefined)) {
    const res = await cn.execute(`SELECT ${fk} AS FK, TELEFONO FROM ${tabla} WHERE ID_${tabla} = :id`, {id});
    if (!res.rows.length) return;
    if (idPais === undefined) idPais = res.rows[0].FK;
    if (telefono === undefined) telefono = res.rows[0].TELEFONO;
  }
  if (!telefono || !idPais) return;
  const sql = tabla === "SUCURSAL"
    ? `SELECT p.CODIGO_ISO AS ISO FROM PAIS p JOIN DEPARTAMENTO d ON d.ID_PAIS=p.ID_PAIS WHERE d.ID_DEPARTAMENTO=:id`
    : `SELECT CODIGO_ISO AS ISO FROM PAIS WHERE ID_PAIS=:id`;
  const resultado = await cn.execute(sql, {id: idPais});
  if (!resultado.rows.length) throw error("País o departamento inexistente", 400);
  const prefijo = POR_ISO[String(resultado.rows[0].ISO).trim().toUpperCase()];
  if (!prefijo) throw error("País sin código telefónico configurado", 400);
  if (!String(telefono).startsWith(`+${prefijo} `)) {
    throw error(`El teléfono no corresponde al país seleccionado. Debe usar +${prefijo}`, 400);
  }
}

module.exports = { normalizarTelefono, validarPaisTelefono };
