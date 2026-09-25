// Club Pádel 04 · Aplica al DOM el estado calculado por
// src/utils/screenState.js (única fuente de verdad, derivada de
// `selectedRole`/módulo activo — nunca de texto visible).
//
// Sustituye la parte de aplicación al DOM de internal-background-detector.js
// y role-background-detector.js. Sigue siendo imperativo porque el CSS
// existente apunta deliberadamente a `body.*` y a `#root`/`html`, fuera del
// árbol que React controla declarativamente — reescribir cientos de
// selectores CSS para que apunten a un wrapper interno de React queda fuera
// del alcance de esta migración (cambiaría la identidad visual validada).
// La diferencia real frente a los detectores anteriores es que esto ya NO
// escanea texto ni usa MutationObserver: se llama una vez por render desde
// un useEffect de React, con las mismas clases/estilos exactos que ya
// existían.

const MODULE_CATEGORY_CLASSES = {
  admin: "cp04-module-admin",
  user: "cp04-module-user",
  general: "cp04-module-general",
};

// Mismo degradado + imagen que usaba antes role-background-detector.js.
const ROLE_SCREEN_BG_IMAGE =
  "linear-gradient(180deg, rgba(2,6,23,0.00) 0%, rgba(2,6,23,0.03) 45%, rgba(2,6,23,0.12) 100%), url('/images/torcal-padel-bg.png')";

export function cp04ApplyScreenState(state) {
  const { roleScreenActive, moduleScreenActive, moduleCategory, roleId, moduleId } = state || {};

  document.body.classList.toggle("cp04-role-screen-active", Boolean(roleScreenActive));
  document.body.classList.toggle("cp04-module-screen-active", Boolean(moduleScreenActive));

  Object.values(MODULE_CATEGORY_CLASSES).forEach((cls) => document.body.classList.remove(cls));
  if (moduleScreenActive && moduleCategory) {
    document.body.classList.add(MODULE_CATEGORY_CLASSES[moduleCategory] || MODULE_CATEGORY_CLASSES.general);
  }

  // Data attributes estables (identificadores internos, no texto
  // traducido) — no los usa ningún CSS todavía, se dejan preparados como
  // fuente de depuración/futuro enganche declarativo.
  document.body.dataset.cp04Role = roleId ? roleId.toLowerCase() : "";
  document.body.dataset.cp04Module = moduleId || "";

  const bgTargets = [
    document.documentElement,
    document.body,
    document.getElementById("root"),
    document.getElementById("root")?.firstElementChild,
  ].filter(Boolean);

  bgTargets.forEach((el) => {
    if (roleScreenActive) {
      el.style.backgroundImage = ROLE_SCREEN_BG_IMAGE;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center center";
      el.style.backgroundRepeat = "no-repeat";
      el.style.backgroundAttachment = "fixed";
      el.style.backgroundColor = "transparent";
      el.style.minHeight = "100vh";
    } else {
      el.style.backgroundImage = "";
      el.style.backgroundSize = "";
      el.style.backgroundPosition = "";
      el.style.backgroundRepeat = "";
      el.style.backgroundAttachment = "";
      el.style.backgroundColor = "";
    }
  });
}
