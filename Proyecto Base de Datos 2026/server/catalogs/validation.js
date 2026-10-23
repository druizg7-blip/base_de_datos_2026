"use strict";
const defs = require("./definitions");
const { error } = require("../security");
const { normalizarTelefono } = require("../phone");

const auditColumns = new Set([
  "FECHA_CREACION",
  "USUARIO_CREACION",
  "FECHA_MODIFICACION",
  "USUARIO_MODIFICACION",
]);

const readOnly = new Set(["ID_PRODUCTO_SUCURSAL", "EXISTENCIA"]);

function definition(input) {
  const d = defs[String(input || "").toUpperCase()];

  if (!d) {
    throw error("Tabla no disponible en esta aplicación", 404);
  }

  return d;
}

function editable(d) {
  return d.columns.filter(
    (c) =>
      c.name !== d.pk &&
      !auditColumns.has(c.name) &&
      c.name !== "ESTADO_REGISTRO" &&
      !(d.table === "PRODUCTO_SUCURSAL" && readOnly.has(c.name)),
  );
}

function validId(id) {
  const value = Number(id);

  if (!Number.isSafeInteger(value) || value < 1) {
    throw error("ID de registro inválido", 400);
  }

  return value;
}

function normalize(d, data, { partial = false } = {}) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw error("Formulario inválido", 400);
  }

  const fields = editable(d).filter((c) => Object.hasOwn(data, c.name));

  if (!partial) {
    for (const c of editable(d)) {
      if (c.required && !c.default && !Object.hasOwn(data, c.name)) {
        throw error(`Campo obligatorio: ${c.name}`, 400);
      }
    }
  }

  if (!fields.length) {
    throw error("Indique al menos un campo válido", 400);
  }

  const values = {};

  for (const c of fields) {
    let v = data[c.name];

    if (v === "" || v === undefined) {
      v = null;
    }

    if (v === null && c.required && !c.default) {
      throw error(`Campo obligatorio: ${c.name}`, 400);
    }

    if (v !== null && /^(INTEGER|NUMBER)/.test(c.type)) {
      if (!Number.isFinite(Number(v))) {
        throw error(`Número inválido: ${c.name}`, 400);
      }

      v = Number(v);
    }

    if (v !== null && /^(DATE|TIMESTAMP)/.test(c.type)) {
      if (
        typeof v !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(v) ||
        Number.isNaN(Date.parse(v))
      ) {
        throw error(`Fecha inválida: ${c.name}`, 400);
      }

      v = new Date(v + "T12:00:00Z");
    }

    if (v !== null && /(CHAR|VARCHAR2)/.test(c.type)) {
      v = String(v).trim();

      const max = Number(/\((\d+)\)/.exec(c.type)?.[1] || 0);

      if (max && v.length > max) {
        throw error(`${c.name} excede ${max} caracteres`, 400);
      }
    }

    if (c.name === "TELEFONO") v = normalizarTelefono(v);
    values[c.name] = v;
  }

  return values;
}

function refLabel(table) {
  return (
    {
      PERSONA: "NOMBRES||' '||APELLIDOS",
      CLIENTE: "'Cliente '||ID_CLIENTE",
      EMPLEADO: "'Empleado '||CODIGO_EMPLEADO",
      EMPLEADO_SUCURSAL: "'Asignación '||ID_EMPLEADO_SUCURSAL",
      PRODUCTO_SUCURSAL: "'Inventario '||ID_PRODUCTO_SUCURSAL",
      ROL: "NOMBRE",
      USUARIO: "NOMBRE_USUARIO",
      PRODUCTO: "CODIGO||' · '||NOMBRE",
      VEHICULO: "PLACA||' · '||MARCA",
      PROVEEDOR: "NOMBRE",
      METODO_PAGO: "NOMBRE",
      SUCURSAL: "NOMBRE",
      CATEGORIA: "NOMBRE",
      MARCA: "NOMBRE",
      PUESTO: "NOMBRE",
      DEPARTAMENTO: "NOMBRE",
      PAIS: "NOMBRE",
      MONEDA: "NOMBRE",
      MOTIVO_BAJA: "NOMBRE",
      MENU: "NOMBRE",
      MODULO: "NOMBRE",
      OPCION: "NOMBRE",
      TIPO_MOVIMIENTO: "NOMBRE",
      REGION_GEOGRAFICA: "NOMBRE",
    }[table] || "TO_CHAR(" + definition(table).pk + ")"
  );
}

module.exports = { defs, definition, editable, validId, normalize, refLabel };
