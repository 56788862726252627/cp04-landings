// Club Pádel 04 · CommunityRepository — contrato de persistencia social.
//
// El bridge (communityBridge.js) es la capa de acceso para React. Esta capa
// encapsula el estado y lo aisla por club/tenant. Hoy: solo MemoryCommunityRepository
// (en memoria, sin red, sin disco). Cuando el backend sea real, se añade
// SupabaseCommunityRepository / AirtableCommunityRepository con el mismo contrato.
//
// CONTRATO MÍNIMO (COMMUNITY_REPOSITORY_CONTRACT):
//   getStore()          → objeto store (sync, referencia interna mutable)
//   reset()             → reinicia a estado vacío (sync, solo para tests)
//   snapshot()          → copia serializable del estado actual (sync)
//   getClubId()         → string clubId de este tenant
//
// IDEMPOTENCIA (para futura integración backend):
//   isIdempotencyKeyUsed(key)   → boolean
//   markIdempotencyKey(key, result) → void
//   getIdempotencyResult(key)   → resultado guardado | null
//   En producción: keys irían a Redis/KV con TTL. Aquí: Map en memoria.
//
// AISLAMIENTO: cada instancia tiene su propio store. Dos clubs = dos repos.
// No es posible contaminar el store de club-b desde el repo de club-a.

import {
  createEmptyStore,
} from "../../projects/club-padel-04/community-logic/index.mjs";

// Métodos mínimos que cualquier implementación de repository debe tener.
export const COMMUNITY_REPOSITORY_CONTRACT = Object.freeze([
  "getStore",
  "reset",
  "snapshot",
  "getClubId",
  "isIdempotencyKeyUsed",
  "markIdempotencyKey",
  "getIdempotencyResult",
]);

/**
 * Verifica que un objeto implementa el contrato completo.
 * Devuelve { valid: boolean, missing: string[] }
 */
export function validateRepositoryContract(repo) {
  const missing = COMMUNITY_REPOSITORY_CONTRACT.filter(
    (m) => typeof repo?.[m] !== "function"
  );
  return { valid: missing.length === 0, missing };
}

/**
 * Crea un repositorio en memoria, aislado por instancia.
 * Es la implementación activa para desarrollo, tests y el demo de P0.
 *
 * Migración a backend real: implementar el mismo contrato con operaciones
 * async (fetch/Supabase/Airtable). Ver docs/club-padel-04/comunidad/P1_1_PERSISTENCIA_SOCIAL_CONTRATO.md
 */
export function createMemoryCommunityRepository(clubId) {
  if (!clubId || typeof clubId !== "string" || !clubId.trim()) {
    throw new Error("createMemoryCommunityRepository: clubId es requerido y no puede estar vacío.");
  }

  let _store = createEmptyStore();
  const _idempotencyKeys = new Map();

  return {
    /** Devuelve referencia al store actual. Las mutaciones sobre el objeto retornado
     *  afectan al store interno (comportamiento intencional — mismo patrón que el bridge). */
    getStore() {
      return _store;
    },

    /** Reinicia el store a un estado vacío. SOLO para tests — en producción
     *  equivaldría a borrar todos los datos del tenant. */
    reset() {
      _store = createEmptyStore();
      _idempotencyKeys.clear();
    },

    /** Devuelve una copia profunda serializable del estado actual.
     *  Útil para diagnóstico, migración incremental y tests de aislamiento. */
    snapshot() {
      return JSON.parse(JSON.stringify(_store));
    },

    /** El clubId de este tenant — no cambia tras la creación. */
    getClubId() {
      return clubId;
    },

    // --- Idempotencia (preparada para futura persistencia backend) --------
    //
    // En producción: antes de ejecutar una operación potencialmente duplicada
    // (follow, friendRequest, report…), el servicio comprueba si ya existe
    // una clave de idempotencia. Si existe, devuelve el resultado guardado
    // sin ejecutar de nuevo. Aquí la clave vive en memoria (sin TTL).
    // Formato de clave sugerido: "<operación>:<actorId>:<targetId>"

    /** True si la clave ya fue usada en esta instancia. */
    isIdempotencyKeyUsed(key) {
      return _idempotencyKeys.has(key);
    },

    /** Registra una clave con su resultado. Idempotente: llamar dos veces
     *  con la misma clave sobrescribe el resultado (última llamada gana). */
    markIdempotencyKey(key, result) {
      _idempotencyKeys.set(key, result);
    },

    /** Devuelve el resultado guardado para una clave, o null si no existe. */
    getIdempotencyResult(key) {
      return _idempotencyKeys.get(key) ?? null;
    },
  };
}
