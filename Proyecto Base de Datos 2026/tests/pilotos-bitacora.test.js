"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const read = (p) => fs.readFileSync(path.join(__dirname, "..", p), "utf8");

test("Asignar un piloto exige rol Piloto y sucursal activa", () => {
  const src = read("server/routes/envios.js");
  assert.match(src, /UPPER\(pu\.NOMBRE\)='PILOTO'/);
  assert.match(src, /UPPER\(r\.NOMBRE\)='PILOTO'/);
  assert.match(src, /es\.ID_SUCURSAL=:sucursal/);
  assert.match(src, /ID_PILOTO/);
});
test("El piloto no puede consultar ni confirmar envíos ajenos", () => {
  const src = read("server/routes/envios.js");
  assert.match(src, /JOIN USUARIO u ON u\.ID_EMPLEADO=e\.ID_PILOTO/g);
  assert.match(src, /u\.ID_USUARIO=:usuario/g);
  assert.match(src, /S\.permit\('\/envios\/mis-entregas','U'\)/);
  assert.match(src, /anterior\.rows\[0\]\.ESTADO!=='EN_RUTA'/);
});
test("El encargado sólo puede despachar; el piloto confirma entrega", () => {
  const src = read("server/routes/envios.js");
  assert.match(src, /const pasos = \{ PENDIENTE: 'EN_RUTA' \}/);
  assert.match(src, /UPDATE ENVIO SET ESTADO='ENTREGADO'/);
});
test("La bitácora oculta contraseñas y muestra cambios solo cuando se solicitan", () => {
  const src = read("public/js/modules/seguridad/consultas.js");
  assert.match(src, /ocultar=/);
  assert.match(src, /clave\|password\|contrasena/);
  assert.match(src, /<details class=/);
});
test("Seguridad muestra solo un formulario para cambiar contraseña de otra cuenta", () => {
  const src = read("public/js/modules/seguridad/usuarios.js");
  assert.match(src, /adminResetPassword/);
  assert.doesNotMatch(src, /id="userForm"/);
  assert.doesNotMatch(src, /id="passwordForm"/);
});
