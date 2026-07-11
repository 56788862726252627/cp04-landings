// Implementación del catálogo de capabilities descrito en
// docs/agencia-ia/ROLE_CAPABILITY_CONTRACT.md. Contrato para integración
// futura — no autoriza nada en runtime, no toca src/utils/rbac.js.

export const ROLE_CAPABILITY_CATALOG = Object.freeze([
  Object.freeze({ id: "reservation.create", feature: "reservas", roles: Object.freeze(["PLAYER", "STAFF", "ADMIN"]) }),
  Object.freeze({ id: "reservation.cancel", feature: "cancelaciones", roles: Object.freeze(["PLAYER", "STAFF", "ADMIN"]) }),
  Object.freeze({ id: "reservation.reschedule", feature: "reprogramaciones", roles: Object.freeze(["PLAYER", "STAFF", "ADMIN"]) }),
  Object.freeze({ id: "player.create", feature: null, roles: Object.freeze(["STAFF", "ADMIN"]) }),
  Object.freeze({ id: "player.manage", feature: null, roles: Object.freeze(["STAFF", "ADMIN"]) }),
  Object.freeze({ id: "tournament.manage", feature: "torneos", roles: Object.freeze(["STAFF", "ADMIN"]) }),
  Object.freeze({ id: "ranking.manage", feature: "ranking", roles: Object.freeze(["STAFF", "ADMIN"]) }),
  Object.freeze({ id: "support.view_health", feature: "soporte", roles: Object.freeze(["SUPPORT"]) }),
  Object.freeze({ id: "admin.manage_config", feature: null, roles: Object.freeze(["ADMIN"]) }),
]);

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers() — necesita
 *   .roles (activos del cliente) y .features (ya resueltos por cascada).
 * @returns {Record<string, string[]>} capabilities por rol activo.
 */
export function resolveRoleCapabilities(resolvedConfig) {
  if (!resolvedConfig?.roles || !resolvedConfig?.features) {
    throw new Error("resolveRoleCapabilities requiere un resolvedConfig con .roles y .features (usar mergeConfigLayers primero)");
  }
  const result = {};
  for (const role of resolvedConfig.roles) {
    result[role] = ROLE_CAPABILITY_CATALOG.filter(
      (capability) =>
        capability.roles.includes(role) &&
        (capability.feature === null || resolvedConfig.features[capability.feature] === true)
    ).map((capability) => capability.id);
  }
  return result;
}
