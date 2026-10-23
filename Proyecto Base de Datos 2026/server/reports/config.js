"use strict";
const reports = {
  "ventas-sucursal": {
    path: "/reportes/ventas-sucursal",
    title: "Ventas por sucursal",
    proc: "VENTAS_POR_SUCURSAL",
  },
  productos: {
    path: "/reportes/productos",
    title: "Productos más vendidos",
    proc: "PRODUCTOS_MAS_VENDIDOS",
    top: true,
  },
  "clientes-region": {
    path: "/reportes/clientes-region",
    title: "Clientes por región",
    proc: "CLIENTES_POR_REGION",
  },
  "vendedores-area": {
    path: "/reportes/vendedores-area",
    title: "Vendedores por área",
    proc: "VENDEDORES_POR_AREA",
  },
  envios: {
    path: "/reportes/envios",
    title: "Envíos por sucursal",
    proc: "ENVIOS_POR_SUCURSAL",
  },
  "productos-menos": {
    path: "/reportes/productos",
    title: "Productos menos vendidos",
    view: "V_PRODUCTOS_MENOS_VENDIDOS",
  },
  "ventas-mensuales": {
    path: "/reportes/dashboard",
    title: "Ventas mensuales",
    view: "V_VENTAS_MENSUALES",
  },
  cxc: {
    path: "/reportes/cxc",
    title: "Cuentas por cobrar",
    view: "V_CUENTAS_POR_COBRAR",
  },
  cxp: {
    path: "/reportes/cxp",
    title: "Cuentas por pagar",
    view: "V_CUENTAS_POR_PAGAR",
  },
};

module.exports={reports};
