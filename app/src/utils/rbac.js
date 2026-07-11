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

export const CP04_ROLE_PERMISSIONS = {
  PLAYER: ["inicio", "reservas", "torneos", "ranking", "perfil"],
  STAFF: ["inicio", "reservas", "alta_jugador", "reprogramar", "cancelar", "gestion", "torneos", "perfil"],
  ADMIN: ["inicio", "reservas", "alta_jugador", "reprogramar", "cancelar", "gestion", "torneos", "ranking", "admin", "perfil"],
  SUPPORT: ["inicio", "reservas", "alta_jugador", "reprogramar", "cancelar", "gestion", "torneos", "ranking", "admin", "flujos_make", "soporte", "perfil"],
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

// Edición del bracket de torneos (añadir/editar/eliminar parejas, cambiar
// formato, reordenar, marcar ganador, publicar, deshacer/rehacer) es
// operación de STAFF/ADMIN/SUPPORT — mismo criterio que el resto de acciones
// de staff en CP04_ROLE_PERMISSIONS (cancelar/reprogramar/alta_jugador).
// PLAYER conserva acceso de solo lectura a la sección "torneos" (ya está en
// su lista de secciones permitidas) pero no a estas acciones mutativas.
export const CP04_TOURNAMENT_EDITOR_ROLES = ["STAFF", "ADMIN", "SUPPORT"];

export function cp04CanEditTournament(role) {
  return CP04_TOURNAMENT_EDITOR_ROLES.includes(cp04NormalizeRole(role));
}
