// Accesor de runtime sobre el catálogo de capabilities ya implementado en
// src/config/resolveRoleCapabilities.js (docs/agencia-ia/ROLE_CAPABILITY_CONTRACT.md).
// IMPORTANTE (repetido aquí porque es fácil de malinterpretar en runtime):
// esto NO sustituye RBAC ni el Role Gate del Worker — es un catálogo de
// capabilities para que la UI decida qué mostrar, no para autorizar nada.
// La autorización real sigue viviendo exclusivamente en
// worker-reservas/auth/authorization.js (requireRoles) y en
// CP04_ENFORCE_ROLE_GATES. Este módulo no se toca ni se referencia desde ahí.
import { resolveRoleCapabilities } from "../config/resolveRoleCapabilities.js";

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @returns {Record<string, string[]>} capabilities por rol activo del tenant.
 */
export function getRuntimeRoleCapabilities(resolvedConfig) {
  return resolveRoleCapabilities(resolvedConfig);
}

/**
 * Conveniencia de solo-lectura para la UI ("¿muestro este botón?"). No es
 * una función de autorización — un false aquí no bloquea nada en el
 * backend, y un true aquí tampoco autoriza nada por sí solo.
 */
export function runtimeHasCapability(resolvedConfig, role, capabilityId) {
  const capabilities = resolveRoleCapabilities(resolvedConfig);
  return Boolean(capabilities[role]?.includes(capabilityId));
}
