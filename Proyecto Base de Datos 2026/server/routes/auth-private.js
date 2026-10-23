"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
router.get(
  "/auth/menu",
  wrap(async (req, res) => res.json(await S.menu(req.user))),
);

router.get(
  "/auth/me",
  wrap(async (req, res) => res.json(req.user)),
);

router.put(
  "/auth/clave",
  wrap(async (req, res) =>
    res.json(
      await S.changePassword(
        req.user,
        req.body.actual,
        req.body.nueva,
      ),
    ),
  ),
);

router.post(
  "/auth/usuarios",
  S.permit("/admin/usuarios", "I"),
  wrap(async (req, res) =>
    res.status(201).json(
      await S.createUser(req.user, req.body),
    ),
  ),
);

router.post(
  "/auth/usuarios/:id/desbloquear",
  S.permit("/admin/usuarios", "U"),
  wrap(async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      throw S.error("ID inválido", 400);
    }

    await connection(
      req.user.nombre_usuario,
      async (cn) =>
        cn.execute(
          "BEGIN PKG_SEGURIDAD.DESBLOQUEAR(:id); END;",
          { id },
        ),
      { write: true },
    );

    res.json({ ok: true });
  }),
);


};
