"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                        
router.use(
  ['/catalogos/ENVIO', '/catalogos/DETALLE_ENVIO'],
  (req, res, next) => {
    if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
      return next(S.error(
        'Usa Gestión de Envíos para registrar productos y seguimiento',
        403
      ));
    }
    next();
  }
);

                                                                     
                                                                            
router.use('/garantias', async(req,res,next)=>{
  try {
    const {scope}=require('../branch-scope');
    const s=await connection(req.user.nombre_usuario,cn=>scope(cn,req.user));
    if(!s.admin)throw S.error('Garantías entre sucursales: operación restringida hasta validación de alcance',403);
    next();
  }catch(e){next(e)}
});
                                                              
                                                            
router.use('/catalogos/USUARIO',(req,res,next)=>next(S.error('Administra usuarios desde Seguridad',403)));
router.use('/catalogos/ROL_OPCION',(req,res,next)=>{
  if(['POST','PUT','PATCH','DELETE'].includes(req.method))return next(S.error('Configura permisos por nombre de opción desde Seguridad',403));
  next();
});
                                                             
router.use(require("../guarantees"));

                                                        
router.use("/catalogos/:table", (req, res, next) => {
  const tabla = String(
    req.params.table || ""
  ).toUpperCase();

  if (
    tabla === "GARANTIA" &&
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method)
  ) {
    return next(
      S.error(
        "Registra las garantias desde Ventas > Garantias",
        405
      )
    );
  }

  next();
});


};
