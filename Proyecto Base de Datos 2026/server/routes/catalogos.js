"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                                                                           
router.use('/catalogos/EMPLEADO', (req,res,next)=> {
  if (['POST','PUT','PATCH','DELETE'].includes(req.method)) return next(S.error('Usa Gestión de Empleados para contratar, reasignar o despedir',405));
  next();
});
                        
                                               

router.get(
  "/catalogos/metadata",
  wrap(async (req, res) =>
    res.json(
      Object.fromEntries(
        Object.entries(C.defs)
          .filter(
            ([key]) =>
              !["DETALLE_ENVIO", "DETALLE_GARANTIA"].includes(key),
          )
          .map(([key, d]) => [
            key,
            { ...d, columns: C.editable(d) },
          ]),
      ),
    ),
  ),
);

const catalogPath = (req) =>
  C.definition(req.params.table).path;

                                               
                        
                          
                                               

router.get(
  "/catalogos/:table",
  S.permit(catalogPath, "C"),
  wrap(async (req, res) =>
    res.json(
      await C.list(
        req.user,
        req.params.table,
        req.query,
      ),
    ),
  ),
);

                                               
                               
                                               

router.get(
  "/catalogos/:table/:id",
  S.permit(catalogPath, "C"),
  wrap(async (req, res) =>
    res.json(
      await C.get(
        req.user,
        req.params.table,
        req.params.id,
      ),
    ),
  ),
);

                                               
                       
                                               

router.post(
  "/catalogos/:table",
  S.permit(catalogPath, "I"),
  wrap(async (req, res) =>
    res.status(201).json(
      await C.insert(
        req.user,
        req.params.table,
        req.body,
      ),
    ),
  ),
);

                                               
                         
                                               

router.put(
  "/catalogos/:table/:id",
  S.permit(catalogPath, "U"),
  wrap(async (req, res) =>
    res.json(
      await C.update(
        req.user,
        req.params.table,
        req.params.id,
        req.body,
      ),
    ),
  ),
);

                                               
                                  
                                               

router.delete(
  "/catalogos/:table/:id",
  S.permit(catalogPath, "D"),
  wrap(async (req, res) =>
    res.json(
      await C.deactivate(
        req.user,
        req.params.table,
        req.params.id,
      ),
    ),
  ),
);

                                               
                                 
                      
                                               

router.patch(
  "/catalogos/:table/:id/reactivar",
  S.permit(catalogPath, "U"),
  wrap(async (req, res) =>
    res.json(
      await C.reactivate(
        req.user,
        req.params.table,
        req.params.id,
      ),
    ),
  ),
);


};
