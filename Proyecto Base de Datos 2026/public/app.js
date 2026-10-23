                                                                       
import { $, state, api, logout } from "./js/core/state.js";
import { boot, closeMenus, closeMobileMenu } from "./js/core/navigation.js";
$("logout").onclick = () => logout(true);
$("mobileMenu").onclick = () => {
  const wrap = $("navWrap");
  const open = wrap.classList.toggle("mobile-open");
  $("mobileMenu").setAttribute("aria-expanded", String(open));
};
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-nav")) closeMenus();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") { closeMenus(); closeMobileMenu(); }
});
$("loginForm").onsubmit = async (ev) => {
  ev.preventDefault();
  $("loginError").hidden = true;
  try {
    const v = Object.fromEntries(new FormData(ev.target));
    const r = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify(v),
    });
    state.token = r.token;
    state.user = r.user;
    sessionStorage.setItem("casa_constructor_token", r.token);
    await boot();
    ev.target.reset();
  } catch (e) {
    $("loginError").textContent = e.message;
    $("loginError").hidden = false;
  }
};

if (state.token) {
  try {
    const payload = JSON.parse(atob(state.token.split(".")[1]));
    state.user = payload;
    boot();
  } catch {
    logout(false);
  }
}
