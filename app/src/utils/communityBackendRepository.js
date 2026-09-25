// Club Pádel 04 · BackendCommunityRepository — adapter de backend async.
//
// Implementa el mismo contrato conceptual que MemoryCommunityRepository
// (COMMUNITY_REPOSITORY_CONTRACT + COMMUNITY_REPOSITORY_P12_EXTENSIONS)
// con operaciones async: todos los métodos relevantes devuelven Promise.
//
// Arquitectura de capas:
//   BackendCommunityRepository
//     ↓ usa
//   BackendAdapter (FakeBackendAdapter | SupabaseAdapter | ...)
//     ↓ implementa
//   readAll(clubId) / writeAll(clubId, data, expectedVersion) / idempotency
//
// BACKEND REMOTO: BLOQUEADO POR CONFIGURACIÓN/ENTORNO
// — no existe Supabase DEV/TEST configurado en este proyecto.
// — usar FakeBackendAdapter para desarrollo, tests contractuales y E2E local.
//
// Cuando se configure un backend real:
//   1. Implementar SupabaseAdapter con el mismo contrato de adapter.
//   2. Pasar a createBackendCommunityRepository(clubId, supabaseAdapter).
//   3. Ningún cambio en communityBridge.js — solo el adapter cambia.

import {
  createEmptyStore,
} from "../../projects/club-padel-04/community-logic/index.mjs";

import {
  COMMUNITY_ERROR_TYPES,
  createCommunityError,
  COMMUNITY_REPOSITORY_CONTRACT,
  COMMUNITY_REPOSITORY_P12_EXTENSIONS,
} from "./communityRepository.js";

export { COMMUNITY_ERROR_TYPES, createCommunityError };

// Tipo de error especial para backend no disponible.
// NO pasa por createCommunityError (que lo transformaría a "internal").
export const BACKEND_UNAVAILABLE = "backend_unavailable";

// Crea un error de backend no disponible sin pasar por el validator de tipos.
function createBackendUnavailableError(message) {
  return { type: BACKEND_UNAVAILABLE, message };
}

// Contrato completo que un BackendCommunityRepository debe implementar.
export const COMMUNITY_BACKEND_REPOSITORY_CONTRACT = Object.freeze([
  ...COMMUNITY_REPOSITORY_CONTRACT,
  ...COMMUNITY_REPOSITORY_P12_EXTENSIONS,
]);

/**
 * Valida que un objeto adapter tiene los métodos de I/O necesarios.
 * { valid: boolean, missing: string[] }
 */
export function validateBackendAdapter(adapter) {
  const required = [
    "readAll",
    "writeAll",
    "isIdempotencyKeyUsed",
    "markIdempotencyKey",
    "getIdempotencyResult",
  ];
  const missing = required.filter((m) => typeof adapter?.[m] !== "function");
  return { valid: missing.length === 0, missing };
}

/**
 * FakeBackendAdapter — simula un backend async en memoria con latencia
 * configurable y modos de fallo. Mantiene estado real entre operaciones
 * (no es un mock que solo verifica llamadas — es una implementación real).
 *
 * Parámetros:
 *   latencyMs   — latencia artificial por operación (ms, default 5)
 *   failureRate — probabilidad de fallo aleatoria 0-1 (default 0)
 *   failAfterN  — falla en todas las ops después de N llamadas (default Infinity)
 */
export function createFakeBackendAdapter({
  latencyMs = 5,
  failureRate = 0,
  failAfterN = Infinity,
} = {}) {
  const _stores = new Map();       // clubId → { data, version }
  const _idempotency = new Map();  // `${clubId}:${key}` → result
  let _opCount = 0;

  function _delay() {
    if (latencyMs <= 0) return Promise.resolve();
    return new Promise((r) => setTimeout(r, latencyMs));
  }

  function _maybeError() {
    _opCount++;
    if (_opCount > failAfterN) {
      return createBackendUnavailableError("Backend no disponible (failAfterN alcanzado)");
    }
    if (failureRate > 0 && Math.random() < failureRate) {
      return createBackendUnavailableError("Backend no disponible (fallo aleatorio)");
    }
    return null;
  }

  return {
    async readAll(clubId) {
      await _delay();
      const err = _maybeError();
      if (err) return { ok: false, error: err };
      const entry = _stores.get(clubId);
      if (!entry) return { ok: true, data: createEmptyStore(), version: 0 };
      return { ok: true, data: JSON.parse(JSON.stringify(entry.data)), version: entry.version };
    },

    async writeAll(clubId, data, expectedVersion) {
      await _delay();
      const err = _maybeError();
      if (err) return { ok: false, error: err };

      const entry = _stores.get(clubId);
      const currentVersion = entry?.version ?? 0;

      if (typeof expectedVersion === "number" && currentVersion !== expectedVersion) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.CONFLICT,
            `Conflicto de versión: esperada ${expectedVersion}, actual ${currentVersion}`
          ),
        };
      }

      const newVersion = currentVersion + 1;
      _stores.set(clubId, { data: JSON.parse(JSON.stringify(data)), version: newVersion });
      return { ok: true, version: newVersion };
    },

    async isIdempotencyKeyUsed(clubId, key) {
      await _delay();
      return _idempotency.has(`${clubId}:${key}`);
    },

    async markIdempotencyKey(clubId, key, result) {
      await _delay();
      _idempotency.set(`${clubId}:${key}`, result);
    },

    async getIdempotencyResult(clubId, key) {
      await _delay();
      return _idempotency.get(`${clubId}:${key}`) ?? null;
    },

    // Solo para tests — resetea el adapter completamente.
    __reset() {
      _stores.clear();
      _idempotency.clear();
      _opCount = 0;
    },

    // Solo para inspección en tests.
    __getStores() { return _stores; },
    __getOpCount() { return _opCount; },
  };
}

/**
 * createBackendCommunityRepository — repositorio async de comunidad.
 *
 * Implementa el mismo contrato que MemoryCommunityRepository pero con
 * operaciones async que delegan en un BackendAdapter.
 *
 * Incluye:
 *   - locking optimista (applyIfVersion)
 *   - idempotencia persistente en backend
 *   - snapshot/restore con validación de tenant
 *   - error normalizado BACKEND_UNAVAILABLE
 *   - buildIdempotencyKey compatible con MemoryCommunityRepository
 */
export function createBackendCommunityRepository(clubId, adapter) {
  if (!clubId || typeof clubId !== "string" || !clubId.trim()) {
    throw new Error("createBackendCommunityRepository: clubId es requerido y no puede estar vacío.");
  }

  const validation = validateBackendAdapter(adapter);
  if (!validation.valid) {
    throw new Error(
      `createBackendCommunityRepository: adapter incompleto. Faltan: ${validation.missing.join(", ")}`
    );
  }

  // Cache local — solo para reducir lecturas redundantes en una misma "sesión".
  // La fuente de verdad siempre es el adapter. Ninguna escritura es solo local.
  let _cachedStore = null;
  let _cachedVersion = -1;

  async function _readFresh() {
    const result = await adapter.readAll(clubId);
    if (!result.ok) throw result.error;
    _cachedStore = result.data;
    _cachedVersion = result.version;
    return result;
  }

  return {
    // -----------------------------------------------------------------------
    // CONTRATO P1.1 — async
    // -----------------------------------------------------------------------

    /** Async: lee el store completo desde el backend. */
    async getStore() {
      const r = await _readFresh();
      return r.data;
    },

    /** Async: reinicia el store en el backend. SOLO para tests. */
    async reset() {
      const empty = createEmptyStore();
      const result = await adapter.writeAll(clubId, empty, undefined);
      if (!result.ok) throw result.error;
      _cachedStore = empty;
      _cachedVersion = result.version;
    },

    /** Async: snapshot del estado backend actual. */
    async snapshot() {
      const r = await _readFresh();
      const data = JSON.parse(JSON.stringify(r.data));
      data._meta = {
        clubId,
        version: r.version,
        timestamp: new Date().toISOString(),
        source: "backend",
      };
      return data;
    },

    /** Sync: el clubId de este tenant — inmutable. */
    getClubId() {
      return clubId;
    },

    /** Async: comprueba si una clave de idempotencia ya fue usada. */
    async isIdempotencyKeyUsed(key) {
      return adapter.isIdempotencyKeyUsed(clubId, key);
    },

    /** Async: registra clave con su resultado en el backend. */
    async markIdempotencyKey(key, result) {
      return adapter.markIdempotencyKey(clubId, key, result);
    },

    /** Async: recupera resultado de idempotencia del backend. */
    async getIdempotencyResult(key) {
      return adapter.getIdempotencyResult(clubId, key);
    },

    // -----------------------------------------------------------------------
    // EXTENSIONES P1.2 — async
    // -----------------------------------------------------------------------

    /** Async: versión actual del store en el backend. */
    async getVersion() {
      const r = await _readFresh();
      return r.version;
    },

    /** Async: restaura el store desde un snapshot.
     *  Valida tenant, no comprueba versión esperada (escritura forzada). */
    async restoreSnapshot(snap) {
      if (!snap || typeof snap !== "object" || Array.isArray(snap)) {
        return {
          ok: false,
          error: createCommunityError(COMMUNITY_ERROR_TYPES.VALIDATION, "Snapshot inválido: debe ser objeto no nulo"),
        };
      }
      if (!snap._meta || typeof snap._meta !== "object") {
        return {
          ok: false,
          error: createCommunityError(COMMUNITY_ERROR_TYPES.VALIDATION, "Snapshot sin _meta: no fue creado por este contrato"),
        };
      }
      if (snap._meta.clubId !== clubId) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.TENANT_MISMATCH,
            `Snapshot pertenece a '${snap._meta.clubId}', repo es '${clubId}'`
          ),
        };
      }

      const { _meta, ...storeData } = snap;
      try {
        const result = await adapter.writeAll(clubId, storeData, undefined);
        if (!result.ok) return result;
        _cachedStore = JSON.parse(JSON.stringify(storeData));
        _cachedVersion = result.version;
        return { ok: true, version: _cachedVersion };
      } catch (e) {
        return {
          ok: false,
          error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message ?? "Error inesperado"),
        };
      }
    },

    /** Async: locking optimista — lee, verifica versión, muta, escribe atómicamente.
     *  Si la versión en backend no coincide, devuelve conflict sin escribir. */
    async applyIfVersion(expectedVersion, mutationFn) {
      if (typeof expectedVersion !== "number") {
        return {
          ok: false,
          error: createCommunityError(COMMUNITY_ERROR_TYPES.VALIDATION, "expectedVersion debe ser un número"),
        };
      }

      const readResult = await adapter.readAll(clubId);
      if (!readResult.ok) return readResult;

      if (readResult.version !== expectedVersion) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.CONFLICT,
            `Conflicto de versión: se esperaba ${expectedVersion}, actual ${readResult.version}`
          ),
        };
      }

      const storeCopy = JSON.parse(JSON.stringify(readResult.data));
      let mutResult;
      try {
        mutResult = mutationFn(storeCopy);
      } catch (e) {
        return {
          ok: false,
          error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message ?? "Error en mutación"),
        };
      }

      const writeResult = await adapter.writeAll(clubId, storeCopy, expectedVersion);
      if (!writeResult.ok) return writeResult;

      _cachedStore = storeCopy;
      _cachedVersion = writeResult.version;
      return { ok: true, result: mutResult, version: _cachedVersion };
    },

    /** Sync: construye clave de idempotencia con scope de clubId.
     *  Compatible con MemoryCommunityRepository.buildIdempotencyKey. */
    buildIdempotencyKey(operation, actorId, targetId) {
      if (!operation || !actorId || !targetId) {
        throw new Error("buildIdempotencyKey: operation, actorId y targetId son requeridos");
      }
      return `${clubId}:${operation}:${actorId}:${targetId}`;
    },
  };
}
