"use strict";
const definitions = {
  facturas: {
    path: "/ventas/facturar",
    header: "venta-nueva",
    detail: "venta-detalle",
    id: "id_factura",
  },
  compras: {
    path: "/compras/registro",
    header: "compra-nueva",
    detail: "compra-detalle",
    id: "id_compra",
  },
  "notas-credito": {
    path: "/ventas/notas-credito",
    header: "nota-nueva",
    detail: "nota-detalle",
    id: "id_nota_credito",
  },
};

module.exports={definitions};
