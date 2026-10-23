"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                       
                                               

router.get(
  "/consultas/:key",
  S.permit(
    (req) => T.queries[req.params.key]?.path,
    "C",
  ),
  wrap(async (req, res) =>
    res.json(
      await T.query(
        req.user,
        req.params.key,
        req.query,
      ),
    ),
  ),
);


};
