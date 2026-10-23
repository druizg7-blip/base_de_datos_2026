"use strict";

                                                                               
module.exports = function errorHandler(err, req, res, next) {
  const code = err.status || (/ORA-20\d{3}/.test(err.message || "") ? 422 : 500);
  const reference = Date.now().toString(36);
  console.error(`[${reference}] ${req.method} ${req.originalUrl}`, err);

  let message = err.message || "Error interno";
  if (code === 500) {
    message = `Error interno de Oracle o servidor. Revisa la terminal (referencia ${reference})`;
  }
  if (/ORA-02291/.test(err.message || "")) {
    message = "La referencia seleccionada no existe en Oracle (clave foránea).";
  }
  if (/ORA-00001/.test(err.message || "")) {
    message = "Ya existe un registro con ese código o valor único.";
  }
  if (/ORA-01400/.test(err.message || "")) {
    message = "Falta un campo obligatorio para Oracle.";
  }
  if (/ORA-00942/.test(err.message || "")) {
    message = "La tabla/vista no está disponible para el usuario conectado.";
  }
  if (/ORA-04063|ORA-06508/.test(err.message || "")) {
    message = "Objeto PL/SQL inválido. Consulta /api/sistema/diagnostico.";
  }
  if (code === 422) {
    message = (err.message || "")
      .replace(/^.*ORA-20\d{3}:\s*/s, "")
      .split("\n")[0];
  }
  if (res.headersSent) return next(err);
  res.status(code).json({ error: message, reference });
};
