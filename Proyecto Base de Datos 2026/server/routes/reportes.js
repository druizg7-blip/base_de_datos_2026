"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
                       
                                               

router.get(
  "/reportes/metadata",
  wrap(async (req, res) =>
    res.json(R.reports),
  ),
);

router.get(
  "/reportes/:key",
  S.permit(
    (req) => R.reports[req.params.key]?.path,
    "C",
  ),
  wrap(async (req, res) => {
    const def = R.reports[req.params.key];
    const rows = await R.data(
      req.user,
      req.params.key,
      req.query,
    );

    const format = req.query.format;

    if (["xlsx", "pdf"].includes(format)) {
      return R.exportReport(res, rows, def, format, req.query);
    }

    res.json({
      title: def.title,
      rows,
    });
  }),
);


};
