"use strict";
const router=require("express").Router();
const oracledb=require("oracledb");
const S=require("../security");
const C=require("../catalogs");
const T=require("../transactions");
const R=require("../reports");
const {connection}=require("../db");
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const deps={S,C,T,R,connection,oracledb,wrap};

                                         
require("./auth-login")(router,deps);
router.use(S.authenticate);
                                                                  
require("./guards")(router,deps);
require("./auth-private")(router,deps);
require("./empleados")(router,deps);
require("./catalogos")(router,deps);
require("./clientes")(router,deps);
require("./opciones")(router,deps);
require("./transacciones")(router,deps);
require("./dashboard")(router,deps);
require("./consultas")(router,deps);
require("./reportes")(router,deps);
require("./diagnostico")(router,deps);
require("./envios")(router,deps);
require("./seguridad")(router,deps);
module.exports=router;
