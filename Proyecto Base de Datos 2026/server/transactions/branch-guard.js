'use strict';
const {scope,assertBranch}=require('../branch-scope');
const {error}=require('../security');
async function branchFor(cn,entity,id) {
  const defs={
   empleado_sucursal:`SELECT ID_SUCURSAL AS ID FROM EMPLEADO_SUCURSAL WHERE ID_EMPLEADO_SUCURSAL=:id`,
   producto_sucursal:`SELECT ID_SUCURSAL AS ID FROM PRODUCTO_SUCURSAL WHERE ID_PRODUCTO_SUCURSAL=:id`,
   factura:`SELECT es.ID_SUCURSAL AS ID FROM FACTURA f JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=f.ID_EMPLEADO_SUCURSAL WHERE f.ID_FACTURA=:id`,
   compra:`SELECT es.ID_SUCURSAL AS ID FROM COMPRA co JOIN EMPLEADO_SUCURSAL es ON es.ID_EMPLEADO_SUCURSAL=co.ID_EMPLEADO_SUCURSAL WHERE co.ID_COMPRA=:id`,
   empleado:`SELECT ID_SUCURSAL AS ID FROM EMPLEADO_SUCURSAL WHERE ID_EMPLEADO=:id AND ESTADO_REGISTRO='A' AND FECHA_FIN IS NULL`
  };
  const n=Number(id);
  if(!Number.isSafeInteger(n)||n<1)throw error('Identificador incorrecto para la sucursal',400);
  if(!defs[entity])throw error('Tipo de registro no autorizado',403);
  const r=await cn.execute(defs[entity],{id:n});
  if(r.rows.length!==1)throw error('El registro no está asignado a una sucursal válida',400);
  return Number(r.rows[0].ID);
}
async function assertEntity(cn,alcance,entity,id) {
  const branch=await branchFor(cn,entity,id);
  assertBranch(alcance,branch);
  return branch;
}
async function checkDocument(cn,user,kind,body) {
  const s=await scope(cn,user);if(s.admin)return;
  let branch;
  if(kind==='facturas'||kind==='compras')
    branch=await assertEntity(cn,s,'empleado_sucursal',body.id_empleado_sucursal);
  else if(kind==='notas-credito') {
    branch=await assertEntity(cn,s,'factura',body.id_factura);
    const worker=await branchFor(cn,'empleado',body.id_empleado);
    if(worker!==branch)throw error('Empleado de otra sucursal',403);
  }else throw error('Documento sin sucursal verificable',403);
  for(const line of body.detalles||[]) {
    const idProduct=line.id_producto_sucursal;
    if(idProduct) {
      const productBranch=await branchFor(cn,'producto_sucursal',idProduct);
      if(productBranch!==branch)throw error('Producto de otra sucursal',403);
    }
  }
  const payments=[body.pago,body.pago_compra_inmediato,body.cobro_inmediato].filter(x=>x&&typeof x==='object');
  for(const payment of payments)if(payment.id_empleado_sucursal){
    const paymentBranch=await branchFor(cn,'empleado_sucursal',payment.id_empleado_sucursal);
    if(paymentBranch!==branch)throw error('Cobro o pago de otra sucursal',403);
  }
}
async function checkCommand(cn,user,key,payload) {
  const s=await scope(cn,user);if(s.admin)return;
  const b=payload||{};
  if(['inventario-baja','inventario-ajuste'].includes(key))return assertEntity(cn,s,'producto_sucursal',b.id_producto_sucursal);
  if(key==='venta-pago'){
    const one=await assertEntity(cn,s,'factura',b.id_factura);
    const two=await branchFor(cn,'empleado_sucursal',b.id_empleado_sucursal);
    if(one!==two)throw error('Pago de otra sucursal',403);
    return;
  }
  if(key==='compra-pago'){
    const one=await assertEntity(cn,s,'compra',b.id_compra);
    const two=await branchFor(cn,'empleado_sucursal',b.id_empleado_sucursal);
    if(one!==two)throw error('Pago de otra sucursal',403);
    return;
  }
  throw error('Comando sin validación de sucursal',403);
}
module.exports={branchFor,assertEntity,checkDocument,checkCommand};
