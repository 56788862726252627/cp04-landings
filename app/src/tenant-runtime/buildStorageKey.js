// Club Pádel 04 · Helper de namespacing de localStorage/sessionStorage por
// tenant (y, opcionalmente, por usuario).
//
// No es una segunda API de namespace: reutiliza tal cual el formato
// canónico ya definido y probado en src/config/resolveTenantContext.js
// (`storageNamespace: "tenant:${tenantId}"`, ver TENANT_ISOLATION_CONTRACT.md
// §9-10). Antes de este archivo esa constante tenía 0 consumidores reales
// (confirmado por auditoría, ver audit/tenant-storage-isolation/) — este
// módulo es el primer punto del repo que la usa para construir claves de
// storage individuales.
//
// Formato:
//   tenant:{tenantId}:{key}                        — dato de tenant/negocio
//   tenant:{tenantId}:user:{userId}:{key}          — dato específico de un usuario
//
// Se reutiliza el `key` original completo (p.ej. "cp04_access_token", no
// solo "access_token") para que la clave siga siendo reconocible al
// inspeccionar localStorage a mano en DevTools durante la migración —
// mismo criterio ya documentado en TENANT_STORAGE_MIGRATION_PLAN.md.

/**
 * @param {{tenantId: string, key: string, userId?: string}} params
 * @returns {string}
 */
export function buildStorageKey({ tenantId, key, userId } = {}) {
  if (!tenantId) {
    throw new Error("buildStorageKey requiere tenantId — ningún namespace es implícito");
  }
  if (!key) {
    throw new Error("buildStorageKey requiere key");
  }
  if (userId) {
    return `tenant:${tenantId}:user:${userId}:${key}`;
  }
  return `tenant:${tenantId}:${key}`;
}

// Helpers seguros de lectura/escritura/borrado — mismo patrón defensivo
// (try/catch silencioso, nunca lanza por un storage no disponible) que
// src/auth/authService.js safeLocalStorage()/persist()/clearPersisted(), y
// mismo diseño (reciben el storage como parámetro) que el resto de módulos
// puros de src/tenant-runtime/: no acceden a `window` directamente, así que
// son testeables con cualquier objeto que implemente
// getItem/setItem/removeItem, sin necesitar un navegador real.
//
// legacyKey (opcional): si la clave namespaced no tiene valor, se lee la
// clave legacy como fallback. Leer la legacy NUNCA la borra ni la
// sobreescribe — eso sería una migración, y esta fase solo implementa
// lectura de compatibilidad (ver LEGACY_CP04_STORAGE_MIGRATION_PLAN.md,
// estrategia "lazy on-read", pasos 1-2; los pasos 3+ de migración real de
// datos de negocio quedan fuera de este lote).

/**
 * @param {{getItem: Function}|null} storage
 * @param {{tenantId: string, key: string, userId?: string, legacyKey?: string}} params
 * @returns {string|null}
 */
export function readTenantStorageItem(storage, { tenantId, key, userId, legacyKey } = {}) {
  if (!storage) return null;

  const namespacedKey = buildStorageKey({ tenantId, key, userId });
  try {
    const value = storage.getItem(namespacedKey);
    if (value !== null && value !== undefined) return value;
  } catch {
    // Almacenamiento no disponible para la clave namespaced: se intenta
    // igualmente el fallback legacy antes de rendirse.
  }

  if (!legacyKey) return null;
  try {
    return storage.getItem(legacyKey);
  } catch {
    return null;
  }
}

/**
 * @param {{setItem: Function}|null} storage
 * @param {{tenantId: string, key: string, userId?: string}} params
 * @param {string} value
 */
export function writeTenantStorageItem(storage, { tenantId, key, userId } = {}, value) {
  if (!storage) return;

  const namespacedKey = buildStorageKey({ tenantId, key, userId });
  try {
    storage.setItem(namespacedKey, value);
  } catch {
    // Cuota excedida / modo privado: la sesión en memoria de quien llama
    // sigue siendo válida para esta pestaña, igual que en
    // authService.persist() hoy.
  }
}

// removeLegacy por defecto en false: borrar la clave namespaced es siempre
// seguro (es la clave "activa" de esta sesión/dato), pero borrar la clave
// legacy además es una decisión explícita de quien llama — solo debe
// activarse en flujos de cierre de sesión reales (logout), nunca como
// comportamiento por defecto de un removeItem genérico, para no convertir
// este helper en una migración destructiva silenciosa.
/**
 * @param {{removeItem: Function}|null} storage
 * @param {{tenantId: string, key: string, userId?: string, legacyKey?: string, removeLegacy?: boolean}} params
 */
export function removeTenantStorageItem(storage, { tenantId, key, userId, legacyKey, removeLegacy = false } = {}) {
  if (!storage) return;

  const namespacedKey = buildStorageKey({ tenantId, key, userId });
  try {
    storage.removeItem(namespacedKey);
  } catch {
    // Nada que hacer si el almacenamiento no está disponible.
  }

  if (legacyKey && removeLegacy) {
    try {
      storage.removeItem(legacyKey);
    } catch {
      // Nada que hacer.
    }
  }
}
