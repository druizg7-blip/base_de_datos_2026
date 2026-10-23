"use strict";
module.exports=(router,{S,C,T,R,connection,oracledb,wrap})=>{
const {scope,assertBranch}=require('../branch-scope');
const {sellerContext}=require('../transactions/seller-context');
// Identidad del cajero y pais de su sucursal, obtenidos desde Oracle.
router.get('/ventas/mi-caja',wrap(async (req,res)=>{
  const usuario=req.user;
  if(!await S.allowed(usuario,'/ventas/facturar','C') &&
     !await S.allowed(usuario,'/ventas/pagos','C'))
    throw S.error('No autorizado para ventas o cobros',403);
  return res.json(await connection(usuario.nombre_usuario,cn=>sellerContext(cn,usuario)));
}));

                            
                                               

router.patch(
  "/ventas/facturas/:id/modalidad",
  S.permit("/ventas/facturar", "I"),
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    const modalidad = req.body?.modalidad_entrega;
    if (!Number.isSafeInteger(id) || id < 1 || !["CAJA", "ENVIO"].includes(modalidad))
      throw S.error("Factura o modalidad de entrega inválida", 400);
    const respuesta = await connection(req.user.nombre_usuario, async c => {
      const alcance = await scope(c, req.user);
      const f = await c.execute(`
        SELECT f.MODALIDAD_ENTREGA, es.ID_SUCURSAL, es.ID_EMPLEADO
        FROM FACTURA f JOIN EMPLEADO_SUCURSAL es
          ON es.ID_EMPLEADO_SUCURSAL = f.ID_EMPLEADO_SUCURSAL
        WHERE f.ID_FACTURA = :id AND f.ESTADO_REGISTRO = 'A'
        FOR UPDATE OF f.MODALIDAD_ENTREGA
      `,{ id });
      if (f.rows.length !== 1) throw S.error("Factura no disponible", 404);
      const fila = f.rows[0];
      assertBranch(alcance, fila.ID_SUCURSAL);
      // La factura guarda el EMPLEADO_SUCURSAL elegido en el formulario,
      // que no necesariamente corresponde al usuario que inició sesión.
      // Por eso la autorización para clasificar una factura antigua se basa
      // en el permiso /ventas/facturar (I) y la sucursal de la factura.
      // S.permit valida el permiso en Oracle antes de entrar a esta ruta,
      // y assertBranch impide que un cajero altere otra sucursal.
      if (fila.MODALIDAD_ENTREGA !== null)
        throw S.error("Esta factura ya tiene una modalidad asignada", 409);
      if (modalidad === 'CAJA') {
        const envios = await c.execute(`SELECT COUNT(*) AS TOTAL FROM ENVIO
          WHERE ID_FACTURA = :id AND ESTADO_REGISTRO = 'A'`,{id});
        if (Number(envios.rows[0]?.TOTAL) > 0)
          throw S.error("La factura ya tiene despachos registrados; no se puede marcar como entregada en caja",409);
      }
      const actualizado = await c.execute(`UPDATE FACTURA SET MODALIDAD_ENTREGA = :modalidad
        WHERE ID_FACTURA = :id AND MODALIDAD_ENTREGA IS NULL`,{id,modalidad});
      if (actualizado.rowsAffected !== 1)
        throw S.error("No se pudo clasificar la factura",409);
      return {ok:true,id_factura:id,modalidad_entrega:modalidad};
    },{write:true});
    res.json(respuesta);
  })
);

router.get(
  "/transacciones/metadata",
  wrap(async (req, res) =>
    res.json({
      commands: T.commands,
      documents: T.definitions,
      queries: Object.fromEntries(
        Object.entries(T.queries).map(
          ([key, d]) => [key, { path: d.path }],
        ),
      ),
    }),
  ),
);

                                               
                             
                                       
                                               

router.post(
  "/transacciones/documentos/:kind",
  S.permit(
    (req) => T.definitions[req.params.kind]?.path,
    "I",
  ),
  wrap(async (req, res) => {
    if (req.body?.pago) {
      const ruta =
        req.params.kind === "facturas"
          ? "/ventas/pagos"
          : req.params.kind === "compras"
            ? "/compras/pagos"
            : null;

      if (
        !ruta ||
        !(await S.allowed(req.user, ruta, "I"))
      ) {
        throw S.error(
          "No tienes permiso para registrar el pago junto con el documento",
          403,
        );
      }
    }

    res.status(201).json(
      await T.createDocument(
        req.user,
        req.params.kind,
        req.body,
      ),
    );
  }),
);

                                        
                                              
                                                 

const standaloneCommands = new Set([
  "venta-pago",
  "compra-pago",
  "inventario-baja",
  "inventario-ajuste",
]);

router.post(
  "/transacciones/:command",
  wrap(async (req, res, next) => {
    if (!standaloneCommands.has(req.params.command)) {
      throw S.error(
        "Para facturas, compras y notas de crédito utiliza /transacciones/documentos/:kind",
        405,
      );
    }

    next();
  }),
  S.permit(
    (req) => T.commands[req.params.command]?.path,
    "I",
  ),
  wrap(async (req, res) =>
    res.status(201).json(
      await T.one(
        req.user,
        req.params.command,
        req.body,
      ),
    ),
  ),
);


};
