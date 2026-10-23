'use strict';
const {clienteEnMostrador}=require('../transactions/documents');
module.exports=(router,{S,connection,wrap})=>{
router.post('/clientes/alta',S.permit('/catalogos/clientes','I'),wrap(async(req,res)=>{
 const id=await connection(req.user.nombre_usuario,async cn=>
  clienteEnMostrador(cn,req.body,req.user.nombre_usuario),{write:true});
 res.status(201).json({ok:true,id_cliente:id});
}));
};
