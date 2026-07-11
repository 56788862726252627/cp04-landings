// Club Pádel 04 · Puente entre App.jsx y los helpers de namespacing de
// src/tenant-runtime/buildStorageKey.js.
//
// No reimplementa el namespacing (reutiliza tal cual
// readTenantStorageItem/writeTenantStorageItem/removeTenantStorageItem):
// solo añade la única pieza que App.jsx necesita y que esos helpers no
// resuelven por sí solos — qué hacer cuando `tenantId` no está disponible.
// buildStorageKey() lanza deliberadamente si falta tenantId ("ningún
// namespace es implícito"), lo cual es correcto para el módulo de bajo
// nivel, pero App.jsx necesita un comportamiento no destructivo en ese
// caso (requisito de fallback seguro): si no hay tenantId, se usa
// exactamente la clave legacy plana, es decir, el mismo comportamiento que
// tenía la app antes de esta integración. Mismo criterio defensivo que
// src/auth/authService.js (writeAuthField/readAuthField/removeAuthField),
// generalizado aquí con un parámetro `key` explícito porque App.jsx
// necesita namespacear varias claves distintas (rol, email, perfil...), no
// solo las de sesión.
//
// Extraído a su propio módulo (en vez de vivir inline en App.jsx) por el
// mismo motivo que rbac.js: poder probarlo con node --test sin arrastrar
// React/JSX.
import { readTenantStorageItem, writeTenantStorageItem, removeTenantStorageItem } from "../tenant-runtime/buildStorageKey.js";

/**
 * @param {{getItem: Function}|null} storage
 * @param {{tenantId?: string|null, key: string, userId?: string}} params
 * @returns {string|null}
 */
export function cp04ReadTenantAware(storage, { tenantId, key, userId } = {}) {
  if (!storage) return null;

  if (!tenantId) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  return readTenantStorageItem(storage, { tenantId, key, userId, legacyKey: key });
}

/**
 * @param {{setItem: Function}|null} storage
 * @param {{tenantId?: string|null, key: string, userId?: string}} params
 * @param {string} value
 */
export function cp04WriteTenantAware(storage, { tenantId, key, userId } = {}, value) {
  if (!storage) return;

  if (!tenantId) {
    try {
      storage.setItem(key, value);
    } catch {
      // Almacenamiento no disponible (modo privado, cuota, etc.): sin
      // namespace ni con él el dato en memoria de quien llama sigue siendo
      // válido para esta pestaña.
    }
    return;
  }

  writeTenantStorageItem(storage, { tenantId, key, userId }, value);
}

/**
 * @param {{removeItem: Function}|null} storage
 * @param {{tenantId?: string|null, key: string, userId?: string, removeLegacy?: boolean}} params
 */
export function cp04RemoveTenantAware(storage, { tenantId, key, userId, removeLegacy = false } = {}) {
  if (!storage) return;

  if (!tenantId) {
    try {
      storage.removeItem(key);
    } catch {
      // Nada que hacer si el almacenamiento no está disponible.
    }
    return;
  }

  removeTenantStorageItem(storage, { tenantId, key, userId, legacyKey: key, removeLegacy });
}
