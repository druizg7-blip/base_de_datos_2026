                                                          
import { $, api, button, escape, has, logout, message, nice, state } from "./state.js";
import { catalogPage } from "../modules/catalogos/listado.js";
import { employeePage } from "../modules/catalogos/empleados.js";
import { comprasUnificadas } from "../modules/compras/page.js";
import { enviosGestion } from "../modules/envios/page.js";
import { misEntregas } from "../modules/envios/mis-entregas.js";
import { inventoryPage, kardexPage } from "../modules/inventario/page.js";
import { documentForm } from "../modules/operaciones/documentos.js";
import { simpleOperation } from "../modules/operaciones/simples.js";
import { dashboard } from "../modules/reportes/dashboard.js";
import { reportPage } from "../modules/reportes/page.js";
import { listQuery } from "../modules/seguridad/consultas.js";
import { rolePage } from "../modules/seguridad/roles.js";
import { users } from "../modules/seguridad/usuarios.js";
import { ventasUnificadas } from "../modules/ventas/page.js";

function section(route) {
  if (route === "dashboard") return "Panel principal";
  return state.menu.find((x) => x.RUTA === route)?.MODULO || "Gestión";
}
function closeMenus() {
  const nav = $("nav");
  nav.querySelectorAll(".nav-category").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
  nav.querySelectorAll(".nav-dropdown").forEach((menu) => { menu.hidden = true; });
}
function closeMobileMenu() {
  $("navWrap").classList.remove("mobile-open");
  $("mobileMenu").setAttribute("aria-expanded", "false");
}
function renderNavigation() {
  const nav = $("nav");
  const groups = new Map();
  for (const item of state.menu) {
                                                                                        
    if (item.RUTA !== "/ventas/facturar" &&
        ["/ventas/pagos", "/ventas/notas-credito", "/ventas/devoluciones", "/ventas/garantias"].includes(item.RUTA) &&
        has("/ventas/facturar", "C")) continue;
    if (item.RUTA === "/reportes/dashboard") continue;                                    
    if (["/catalogos/roles","/catalogos/rol","/catalogos/rol-opcion","/catalogos/opciones","/catalogos/opcion"].includes(item.RUTA)) continue;
    if (item.PUEDE_CONSULTAR !== "S" || !item.RUTA) continue;
    if (item.RUTA === "/compras/pagos" && has("/compras/registro", "C")) continue;
    const group = item.MODULO || "General";
    if (!groups.has(group)) groups.set(group, []);
    if (!groups.get(group).some((x) => x.RUTA === item.RUTA)) groups.get(group).push(item);
  }
  const preferred = ["Ventas", "Catálogos", "Compras", "Inventario", "Envíos", "Reportes", "Seguridad"];
  const ordered = [...groups].sort((a, b) => {
    const aa = preferred.indexOf(a[0]); const bb = preferred.indexOf(b[0]);
    return (aa < 0 ? 99 : aa) - (bb < 0 ? 99 : bb);
  });
  const home = `<button type="button" class="nav-home ${state.current === "dashboard" ? "active" : ""}" data-route="dashboard">Inicio</button>`;
  const menus = ordered.map(([group, items], index) => {
    const active = items.some((i) => i.RUTA === state.current);
    return `<div class="nav-group">
      <button type="button" class="nav-category ${active ? "active" : ""}" aria-haspopup="true" aria-expanded="false" aria-controls="submenu-${index}">${escape(group)}</button>
      <div id="submenu-${index}" class="nav-dropdown" hidden>
        ${items.map((i) => `<button type="button" class="nav-link ${state.current === i.RUTA ? "active" : ""}" data-route="${escape(i.RUTA)}">${escape(i.RUTA === "/ventas/facturar" ? "Ventas" : i.RUTA === "/compras/registro" ? "Compras" : i.OPCION || i.RUTA)}</button>`).join("")}
      </div>
    </div>`;
  });
  nav.innerHTML = home + menus.join("");
  nav.querySelectorAll("[data-route]").forEach((btn) => {
    btn.addEventListener("click", () => { closeMenus(); closeMobileMenu(); openPage(btn.dataset.route); });
  });
  nav.querySelectorAll(".nav-category").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      const shouldOpen = panel.hidden;
      closeMenus();
      panel.hidden = !shouldOpen;
      btn.setAttribute("aria-expanded", String(shouldOpen));
    });
    btn.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        btn.click();
        document.getElementById(btn.getAttribute("aria-controls")).querySelector(".nav-link")?.focus();
      }
    });
  });
}

async function boot() {
  try {
    state.menu = await api("/auth/menu");
    state.catalogs = await api("/catalogos/metadata");
    state.reports = await api("/reportes/metadata");
    $("loginView").hidden = true;
    $("appView").hidden = false;
    $("userName").textContent = state.user?.nombre_usuario || "Usuario";
    await openPage("dashboard");
  } catch (e) {
    logout(false);
    $("loginError").textContent = "No se pudo cargar la sesión: " + e.message;
    $("loginError").hidden = false;
  }
}
function titleFor(path) {
  if (path === "dashboard") return "Resumen general";
  return (
    state.menu.find((x) => x.RUTA === path)?.OPCION ||
    nice(path.split("/").pop())
  );
}
async function openPage(path) {
  state.current = path;
  state.page = 1;
  state.term = "";
  state.catalogStatus = "A";
  $("pageTitle").textContent = titleFor(path);
  $("sectionName").textContent = section(path);
  closeMenus();
  closeMobileMenu();
  renderNavigation();
  $("content").innerHTML =
    '<div class="card">Cargando información...</div>';
  try {
    if (
      [
        "/ventas/facturar",
        "/ventas/pagos",
        "/ventas/notas-credito",
        "/ventas/devoluciones",
        "/ventas/garantias",
      ].includes(path) &&
      has("/ventas/facturar", "C")
    ) {
      const tab =
        {
          "/ventas/pagos": "cobros",
          "/ventas/notas-credito": "nota",
          "/ventas/devoluciones": "devoluciones",
          "/ventas/garantias": "garantias",
        }[path] ||
        ventasUnificadas.pestana ||
        "nueva";

      return await ventasUnificadas(tab);
    }
    if (path === "dashboard") return await dashboard();
    if (path === "/catalogos/empleados") return await employeePage();
    const cat = Object.entries(state.catalogs).find(
      ([key, def]) =>
        def.path === path &&
        ![
          "ROL_OPCION",
          "MODULO",
          "MENU",
          "OPCION",
          "PERSONA",
          "EMPLEADO_SUCURSAL",
          "EMPLEADO_PUESTO",
          "PRODUCTO_SUCURSAL",
        ].includes(key),
    );
    if (path === "/admin/roles") return await rolePage();
    if (path === "/admin/usuarios") return await users();
    if (path === "/admin/bitacora") return await listQuery("bitacora");
    if (path === "/ventas/facturar") return await documentForm("facturas");
    if (path === "/compras/registro") return await comprasUnificadas();
    if (path === "/ventas/notas-credito")
      return await documentForm("notas-credito");
    if (path === "/ventas/pagos") return await simpleOperation("venta-pago");
    if (path === "/compras/pagos")
      return has("/compras/registro", "C")
        ? await comprasUnificadas("pagos")
        : await simpleOperation("compra-pago");
    if (path === "/inventario/bajas") return await inventoryPage();
    if (path === "/inventario/existencias")
      return await inventoryPage("existencias");
    if (path === "/inventario/kardex") return await kardexPage();
    if (path === "/ventas/garantias") return await catalogPage("GARANTIA");
    if (path === "/ventas/devoluciones") return await catalogPage("DEVOLUCION");
    if (path === "/envios/gestion") return await enviosGestion();
    if (path === "/envios/mis-entregas") return await misEntregas();
    if (path.startsWith("/reportes/")) return await reportPage(path);
    if (cat) return await catalogPage(cat[0]);
    $("content").innerHTML =
      '<div class="card">Esta ruta está registrada en Oracle, pero no cuenta con una pantalla habilitada.</div>';
  } catch (e) {
    $("content").innerHTML =
      `<div class="notice error">${escape(e.message)}</div><div class="card"><p>Comprueba que la tabla y los paquetes estén compilados en Oracle. La terminal de Node.js contiene el detalle técnico.</p></div>`;
  }
}

export { boot, closeMenus, closeMobileMenu, openPage, section, renderNavigation, titleFor };
