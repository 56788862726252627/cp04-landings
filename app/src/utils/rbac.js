// Club Pádel 04 · RBAC puro y reutilizable.
//
// Extraído de App.jsx para poder testearlo con node --test sin arrastrar
// React/JSX ni efectos secundarios (CSS, watchers de DOM, etc.), y para que
// exista una única fuente de verdad de permisos que consuman tanto la
// navegación (Sidebar) como el guard final de render (App.jsx). Antes había
// dos mapas de permisos casi idénticos mantenidos a mano por separado
// (CP04_ROLE_PERMISSIONS aquí y un menuByRole duplicado dentro de Sidebar):
// eso es exactamente el tipo de deriva que puede abrir un hueco de RBAC sin
// que nadie lo note. Ahora solo hay uno.
//
// Importante: esto es SOLO la representación de permisos de navegación de
// la UI. La autoridad real de autorización de operaciones mutables sigue
// siendo el Worker (worker-reservas/auth/authorization.js) — este módulo no
// la sustituye ni la simula.

export const CP04_ROLES = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];

export const CP04_PROTECTED_SECTIONS = [
  "gestion",
  "admin",
  "flujos_make",
  "soporte",
];

// Secciones exclusivas de SUPPORT: ni ADMIN ni ningún otro rol de negocio
// deben verlas. Se usa específicamente para el Centro Técnico y cualquier
// superficie de observabilidad de Make.
export const CP04_SUPPORT_ONLY_SECTIONS = ["flujos_make", "soporte"];

// PASO 07G (2026-07-19): "cierre_pistas" (Cierre Temporal de Pistas, Paso
// 07E) se concede a los mismos 3 roles que ya tenían acceso a "gestion"
// (STAFF/ADMIN/SUPPORT) — es una acción administrativa sobre pistas, no
// una sección nueva de negocio. PLAYER nunca lo recibe.
// PASO 07I (2026-07-19): "baja_jugador" se concede a los mismos 3 roles
// que ya tenían "alta_jugador" — es el mismo componente/formulario (Paso
// 07C), solo con acceso directo propio en el sidebar. PLAYER nunca lo recibe.
// PASO 07N (2026-07-20): "lista_espera" — módulo visual preparado para
// Gestión Lista de Espera (Make ID 5791113), mismos 3 roles que
// "cierre_pistas" (STAFF/ADMIN/SUPPORT). Es una acción operativa sobre
// jugadores/reservas, no expone datos personales adicionales a PLAYER, que
// nunca lo recibe.
// PASO 07O (2026-07-20): consolidación de 4 módulos visuales más, agrupando
// 14 escenarios del inventario Make (ver
// docs/paso-07o-sidebar-flujos-50/sidebar-flujos-50-consolidacion.md):
//   - "control_qr" y "pistas_recordatorios": operación diaria, mismos 3
//     roles que "cierre_pistas"/"lista_espera" (STAFF/ADMIN/SUPPORT).
//   - "dashboard_kpi" y "backups_seguridad": métricas/infraestructura,
//     mismo nivel que la sección "admin" ya existente (ADMIN + SUPPORT,
//     sin STAFF) — STAFF no necesita KPIs de negocio ni gestión de
//     backups/seguridad para su operación diaria.
// PLAYER nunca recibe ninguno de los 4.
// PASO 07P (2026-07-20): 4 módulos visuales más, agrupando 20 escenarios
// más del inventario (ver
// docs/paso-07p-ampliacion-sidebar-31-flujos/sidebar-31-flujos-restantes.md):
//   - "comunicaciones_socio" y "calendario_disponibilidad": operación
//     diaria de atención al jugador, mismos 3 roles que
//     "cierre_pistas"/"control_qr" (STAFF/ADMIN/SUPPORT).
//   - "facturacion_pagos" y "automatizaciones_bots": gestión/negocio y
//     configuración técnica de bots, mismo nivel que "dashboard_kpi"/
//     "backups_seguridad" (ADMIN + SUPPORT, sin STAFF).
// PLAYER nunca recibe ninguno de los 4.
export const CP04_ROLE_PERMISSIONS = {
  PLAYER: ["inicio", "reservas", "torneos", "ranking", "comunidad", "perfil"],
  STAFF: ["inicio", "reservas", "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion", "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios", "comunicaciones_socio", "calendario_disponibilidad", "torneos", "comunidad", "perfil"],
  ADMIN: ["inicio", "reservas", "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion", "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios", "comunicaciones_socio", "calendario_disponibilidad", "torneos", "ranking", "comunidad", "admin", "dashboard_kpi", "backups_seguridad", "facturacion_pagos", "automatizaciones_bots", "perfil"],
  SUPPORT: ["inicio", "reservas", "alta_jugador", "baja_jugador", "reprogramar", "cancelar", "gestion", "cierre_pistas", "lista_espera", "control_qr", "pistas_recordatorios", "comunicaciones_socio", "calendario_disponibilidad", "torneos", "ranking", "comunidad", "admin", "dashboard_kpi", "backups_seguridad", "facturacion_pagos", "automatizaciones_bots", "flujos_make", "soporte", "perfil"],
};

// Fail-closed: cualquier valor que no sea exactamente uno de los 4 roles
// oficiales se degrada a PLAYER (el conjunto de permisos más restrictivo),
// nunca a un rol más privilegiado.
export function cp04NormalizeRole(role) {
  const value = String(role || "").trim().toUpperCase();
  if (CP04_ROLES.includes(value)) return value;
  return "PLAYER";
}

export function cp04IsProtectedSection(section) {
  return CP04_PROTECTED_SECTIONS.includes(String(section || "").trim());
}

export function cp04IsSupportOnlySection(section) {
  return CP04_SUPPORT_ONLY_SECTIONS.includes(String(section || "").trim());
}

export function cp04CanAccessSection(role, section) {
  const safeRole = cp04NormalizeRole(role);
  const safeSection = String(section || "inicio").trim();
  return (CP04_ROLE_PERMISSIONS[safeRole] || CP04_ROLE_PERMISSIONS.PLAYER).includes(safeSection);
}

export function cp04GetSafeStartSection(role) {
  const safeRole = cp04NormalizeRole(role);
  const allowed = CP04_ROLE_PERMISSIONS[safeRole] || CP04_ROLE_PERMISSIONS.PLAYER;
  return allowed[0] || "inicio";
}
