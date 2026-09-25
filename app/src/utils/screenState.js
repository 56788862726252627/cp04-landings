// Club Pádel 04 · Estado de pantalla puro y reutilizable.
//
// Sustituye a internal-background-detector.js / role-background-detector.js:
// antes decidían qué clase de fondo aplicar escaneando
// `document.body.innerText` en busca de subcadenas EN ESPAÑOL ("modo
// seguro", "centro tecnico", "ranking"...). Eso se rompía en cualquier
// idioma cuya traducción no contuviera esas palabras exactas (confirmado:
// STAFF+francés, STAFF+italiano, STAFF+alemán — ver
// docs/mejora-2-visual-identity-audit-20260724/14-*.md).
//
// Aquí el estado se deriva EXCLUSIVAMENTE de lo que React ya sabe con
// certeza — `selectedRole` y el módulo activo (`current` /
// `safeCurrentSection` en ClubPadel04SaaSApp) — nunca de texto visible ni
// del idioma activo. Es la única fuente de verdad: ni App.jsx ni ningún
// script duplican esta decisión por su cuenta.

import { cp04NormalizeRole } from "./rbac.js";

// Fiel al comportamiento real y ya documentado del detector anterior (ver
// cp04-legibility-polish.css, comentario "PASO 07M"): el sidebar completo
// del rol se renderiza siempre junto al contenido, así que ADMIN/SUPPORT
// activaban "cp04-module-admin" en CUALQUIER pantalla que vieran (por la
// presencia constante de "Automatizaciones"/"Centro técnico"/"Soporte
// técnico" en su propio sidebar), y PLAYER/STAFF activaban siempre
// "cp04-module-user". "general" nunca se alcanzaba con un rol válido —
// se conserva como categoría de reserva/fail-safe, igual que antes.
export const CP04_MODULE_BACKGROUND_CATEGORY = {
  PLAYER: "user",
  STAFF: "user",
  ADMIN: "admin",
  SUPPORT: "admin",
};

export function cp04GetModuleBackgroundCategory(role) {
  const safeRole = cp04NormalizeRole(role);
  return CP04_MODULE_BACKGROUND_CATEGORY[safeRole] || "general";
}

// `selectedRole` vacío/null => todavía en la pantalla de selección de rol
// (antes: role-background-detector.js buscaba "iniciar como rol" /
// "selecciona como quieres entrar" / las 4 tarjetas de rol juntas — todo
// eso ocurre exactamente cuando `selectedRole` aún no se ha fijado).
export function cp04ComputeScreenState({ selectedRole, moduleId } = {}) {
  const roleScreenActive = !selectedRole;
  const moduleScreenActive = !roleScreenActive;

  return {
    roleScreenActive,
    moduleScreenActive,
    roleId: moduleScreenActive ? cp04NormalizeRole(selectedRole) : null,
    moduleId: moduleScreenActive ? String(moduleId || "") : null,
    moduleCategory: moduleScreenActive ? cp04GetModuleBackgroundCategory(selectedRole) : null,
  };
}
