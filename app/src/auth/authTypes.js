// Club Pádel 04 · Tipos y constantes compartidas de autenticación.
// Proyecto en JS puro: usamos JSDoc typedefs para dar forma a los objetos
// de sesión sin introducir TypeScript. Esto NO duplica CP04_ROLE_PERMISSIONS
// de App.jsx (esa matriz de navegación por secciones sigue viviendo allí):
// aquí solo se define la identidad/sesión, no qué módulos ve cada rol.

export const AUTH_MODES = Object.freeze({
  DEMO: "demo",
  PRODUCTION: "production",
});

export const CP04_SESSION_ROLES = Object.freeze(["PLAYER", "STAFF", "ADMIN", "SUPPORT"]);

/**
 * @typedef {Object} Cp04AuthUser
 * @property {string} id
 * @property {string} email
 * @property {string} role
 * @property {string[]} [permissions]
 * @property {string|null} [clubId]
 * @property {string|null} [organizationId]
 */

/**
 * @typedef {Object} Cp04AuthAdapterResult
 * @property {boolean} ok
 * @property {Cp04AuthUser} [user]
 * @property {string} [role]
 * @property {string} [accessToken]
 * @property {string} [refreshToken]
 * @property {boolean} [authReady]  // false = backend_stub, proveedor no configurado
 * @property {string} [error]
 * @property {string} [message]
 */
