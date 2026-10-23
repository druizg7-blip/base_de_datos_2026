                                                     
import { options } from "./ui.js";
import { dashboard } from "../modules/reportes/dashboard.js";

const $ = (id) => document.getElementById(id);
const state = {
  token: sessionStorage.getItem("casa_constructor_token"),
  user: null,
  menu: [],
  catalogs: {},
  reports: {},
  current: "dashboard",
  page: 1,
  term: "",
  catalogStatus: "A",
};
const escape = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const nice = (s) =>
  String(s || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
const money = (n) =>
  new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" }).format(
    Number(n) || 0,
  );
const renderDate = (v) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v) ? v.slice(0, 10) : v;
const button = (label, fn, style = "") =>
  `<button type="button" class="btn ${style}" data-action="${escape(fn)}">${escape(label)}</button>`;
const label = (t, k, required = false) =>
  `<label class="field">${escape(nice(k))}${required ? " *" : ""}${t}</label>`;
const today = () => new Date().toISOString().slice(0, 10);
function message(text, isError = false) {
  const el = $("toast");
  $("toastHeading").textContent = isError ? "Atención" : "Operación realizada";
  $("toastMessage").textContent = String(text ?? "");
  el.className = "toast" + (isError ? " error" : "");
  el.setAttribute("role", isError ? "alert" : "status");
  el.hidden = false;
  $("toastDismiss").onclick = () => {
    clearTimeout(message.timer);
    el.hidden = true;
  };
  clearTimeout(message.timer);
  message.timer = setTimeout(() => { el.hidden = true; }, 5700);
}

async function api(uri, options = {}) {
  const res = await fetch("/api" + uri, {
    ...options,
    headers: {
      ...(!options.body ? {} : { "Content-Type": "application/json" }),
      ...(state.token ? { Authorization: "Bearer " + state.token } : {}),
      ...(options.headers || {}),
    },
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch {}
    if (res.status === 401 && uri !== "/auth/login") logout(false);
    throw Error(body.error || `Error HTTP ${res.status}`);
  }
  return ct.includes("application/json") ? res.json() : res.blob();
}
function has(path, mode = "C") {
  return state.menu.some(
    (x) =>
      x.RUTA === path &&
      x[
        "PUEDE_" +
          { C: "CONSULTAR", I: "INSERTAR", U: "ACTUALIZAR", D: "ELIMINAR" }[
            mode
          ]
      ] === "S",
  );
}
function logout(showMessage = false) {
  sessionStorage.removeItem("casa_constructor_token");
  state.token = null;
  state.user = null;
  state.menu = [];
  $("appView").hidden = true;
  $("loginView").hidden = false;
  $("navWrap").classList.remove("mobile-open");
  $("mobileMenu").setAttribute("aria-expanded", "false");
  if (showMessage) message("Sesión cerrada");
}

export { $, api, button, escape, has, label, logout, message, money, nice, renderDate, state, today };
