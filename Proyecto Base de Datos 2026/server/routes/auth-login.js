"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
router.post(
  "/auth/login",
  wrap(async (req, res) =>
    res.json(await S.login(req.body.usuario, req.body.clave)),
  ),
);


};
