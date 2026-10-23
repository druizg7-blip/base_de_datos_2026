"use strict";
const S=require("../security");
function numeroId(valor) {
  const n = Number(valor);

  if (!Number.isSafeInteger(n) || n < 1) {
    throw S.error("Identificador invalido", 400);
  }

  return n;
}


module.exports={numeroId};
