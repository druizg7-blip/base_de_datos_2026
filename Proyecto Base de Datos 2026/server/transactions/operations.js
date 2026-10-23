"use strict";
const {connection}=require("../db");
const {call}=require("./commands");
const {checkCommand}=require("./branch-guard");
const {sellerContext,sameSeller}=require("./seller-context");
async function one(user, key, payload) {
  return connection(
    user.nombre_usuario,
    async (c) => {
      const data=key === "venta-pago" ? sameSeller(payload,await sellerContext(c,user)) : payload;
      await checkCommand(c,user,key,data);
      const id = await call(c, key, data);
      return { id, ok: true };
    },
    { write: true },
  );
}

module.exports={one};
