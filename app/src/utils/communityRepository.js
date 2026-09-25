// Club Pádel 04 · CommunityRepository — contrato de persistencia social.
//
// El bridge (communityBridge.js) es la capa de acceso para React. Esta capa
// encapsula el estado y lo aisla por club/tenant. Hoy: solo MemoryCommunityRepository
// (en memoria, sin red, sin disco). Cuando el backend sea real, se añade
// SupabaseCommunityRepository / AirtableCommunityRepository con el mismo contrato.
//
// CONTRATO MÍNIMO P1.1 (COMMUNITY_REPOSITORY_CONTRACT — 7 métodos):
//   getStore()          → objeto store (sync, referencia interna mutable)
//   reset()             → reinicia a estado vacío (sync, solo para tests)
//   snapshot()          → copia serializable + _meta {clubId, version, timestamp}
//   getClubId()         → string clubId de este tenant
//   isIdempotencyKeyUsed(key)   → boolean
//   markIdempotencyKey(key, result) → void
//   getIdempotencyResult(key)   → resultado guardado | null
//
// EXTENSIONES P1.2 (COMMUNITY_REPOSITORY_P12_EXTENSIONS — async-ready + hardening):
//   getVersion()                        → número de versión actual (int, 0-based)
//   restoreSnapshot(snap)               → { ok, error?, version? } — valida tenant + estructura
//   applyIfVersion(expectedVer, mutFn)  → { ok, error?, result?, version? } — locking optimista
//   buildIdempotencyKey(op, actor, tgt) → string con scope de clubId incluido
//
// ERRORES NORMALIZADOS (COMMUNITY_ERROR_TYPES):
//   validation | forbidden | not_found | conflict | tenant_mismatch |
//   idempotency_conflict | internal
//
// ASYNC-READY: todos los métodos devuelven valores síncronos hoy. Una implementación
// backend puede devolver Promise sin cambiar el contrato de tipos — ver documentación
// en docs/club-padel-04/comunidad/P1_2_ASYNC_RECOVERY_TENANT_HARDENING.md
//
// AISLAMIENTO: cada instancia tiene su propio store + version + idempotencyKeys.
// Dos clubs = dos repos. No hay forma de contaminar club-b desde el repo de club-a.

import {
  createEmptyStore,
} from "../../projects/club-padel-04/community-logic/index.mjs";

// Métodos mínimos que cualquier implementación de repository debe tener (P1.1).
// No modificar sin actualizar todos los adaptadores existentes.
export const COMMUNITY_REPOSITORY_CONTRACT = Object.freeze([
  "getStore",
  "reset",
  "snapshot",
  "getClubId",
  "isIdempotencyKeyUsed",
  "markIdempotencyKey",
  "getIdempotencyResult",
]);

// Extensiones P1.2 — async-ready, versionado, recovery, locking optimista.
// Una implementación backend debe implementar estos métodos además del contrato base.
export const COMMUNITY_REPOSITORY_P12_EXTENSIONS = Object.freeze([
  "getVersion",
  "restoreSnapshot",
  "applyIfVersion",
  "buildIdempotencyKey",
]);

// Tipos de error normalizados — nunca exponer stack trace ni datos internos a la UI.
export const COMMUNITY_ERROR_TYPES = Object.freeze({
  VALIDATION: "validation",           // parámetro inválido o faltante
  FORBIDDEN: "forbidden",             // el actor no tiene permiso
  NOT_FOUND: "not_found",             // entidad no encontrada
  CONFLICT: "conflict",               // versión o estado no coincide
  TENANT_MISMATCH: "tenant_mismatch", // snapshot/datos de otro club
  IDEMPOTENCY_CONFLICT: "idempotency_conflict", // clave ya usada con resultado distinto
  INTERNAL: "internal",              // error inesperado del repositorio
});

/**
 * Crea un error normalizado de repositorio.
 * { type, message, details? } — nunca incluye stack ni datos internos.
 */
export function createCommunityError(type, message, details = null) {
  if (!Object.values(COMMUNITY_ERROR_TYPES).includes(type)) {
    type = COMMUNITY_ERROR_TYPES.INTERNAL;
  }
  const err = { type, message };
  if (details !== null && details !== undefined) err.details = details;
  return err;
}

/**
 * Verifica que un objeto implementa el contrato mínimo P1.1.
 * Devuelve { valid: boolean, missing: string[] }
 */
export function validateRepositoryContract(repo) {
  const missing = COMMUNITY_REPOSITORY_CONTRACT.filter(
    (m) => typeof repo?.[m] !== "function"
  );
  return { valid: missing.length === 0, missing };
}

/**
 * Verifica que un objeto implementa también las extensiones P1.2.
 * Devuelve { valid: boolean, missing: string[] }
 */
export function validateRepositoryP12Extensions(repo) {
  const missing = COMMUNITY_REPOSITORY_P12_EXTENSIONS.filter(
    (m) => typeof repo?.[m] !== "function"
  );
  return { valid: missing.length === 0, missing };
}

/**
 * Crea un repositorio en memoria, aislado por instancia.
 * Es la implementación activa para desarrollo, tests y el demo de P0.
 *
 * Contrato P1.1 + extensiones P1.2.
 * Migración a backend real: implementar el mismo contrato con operaciones
 * async (fetch/Supabase/Airtable). Ver docs/club-padel-04/comunidad/
 */
export function createMemoryCommunityRepository(clubId) {
  if (!clubId || typeof clubId !== "string" || !clubId.trim()) {
    throw new Error("createMemoryCommunityRepository: clubId es requerido y no puede estar vacío.");
  }

  let _store = createEmptyStore();
  let _version = 0;
  const _idempotencyKeys = new Map();

  return {
    // -------------------------------------------------------------------------
    // CONTRATO MÍNIMO P1.1
    // -------------------------------------------------------------------------

    /** Devuelve referencia al store actual. Las mutaciones sobre el objeto retornado
     *  afectan al store interno (comportamiento intencional — mismo patrón que el bridge).
     *  En un backend real este método no existiría: cada operación sería async y atómica. */
    getStore() {
      return _store;
    },

    /** Reinicia el store a un estado vacío. SOLO para tests — en producción
     *  equivaldría a borrar todos los datos del tenant. */
    reset() {
      _store = createEmptyStore();
      _version = 0;
      _idempotencyKeys.clear();
    },

    /** Devuelve una copia profunda serializable del estado actual, con metadatos
     *  de tenant y versión en `_meta`. Los tests existentes acceden a propiedades
     *  del store directamente (snap.userProfiles, etc.) — siguen funcionando porque
     *  _meta es una propiedad extra, no reemplaza ninguna existente.
     *
     *  snap._meta.clubId   — para validar tenant en restoreSnapshot
     *  snap._meta.version  — para restaurar el número de versión
     *  snap._meta.timestamp — para diagnóstico y auditoría */
    snapshot() {
      const data = JSON.parse(JSON.stringify(_store));
      data._meta = {
        clubId,
        version: _version,
        timestamp: new Date().toISOString(),
      };
      return data;
    },

    /** El clubId de este tenant — inmutable tras la creación. */
    getClubId() {
      return clubId;
    },

    /** True si la clave ya fue usada en esta instancia. */
    isIdempotencyKeyUsed(key) {
      return _idempotencyKeys.has(key);
    },

    /** Registra una clave con su resultado. Llamar dos veces sobrescribe. */
    markIdempotencyKey(key, result) {
      _idempotencyKeys.set(key, result);
    },

    /** Devuelve el resultado guardado para una clave, o null si no existe. */
    getIdempotencyResult(key) {
      return _idempotencyKeys.get(key) ?? null;
    },

    // -------------------------------------------------------------------------
    // EXTENSIONES P1.2 — async-ready, versionado, recovery, hardening
    // -------------------------------------------------------------------------

    /** Número de versión del store. Empieza en 0 y se incrementa en cada
     *  llamada exitosa a applyIfVersion(). Las mutaciones directas vía getStore()
     *  no lo incrementan — esto es intencional: en producción todo cambio pasaría
     *  por applyIfVersion (o su equivalente async). */
    getVersion() {
      return _version;
    },

    /** Restaura el store desde un snapshot previo.
     *
     *  Validaciones:
     *  - snap debe ser un objeto no nulo
     *  - snap._meta debe existir (snapshot creado por este contrato)
     *  - snap._meta.clubId debe coincidir con el clubId de esta instancia
     *
     *  Si la restauración tiene éxito, la versión se restaura al valor del snapshot.
     *  Las claves de idempotencia NO se restauran — quedan en su estado actual.
     *
     *  Devuelve { ok: true, version } o { ok: false, error } con tipo normalizado. */
    restoreSnapshot(snap) {
      if (!snap || typeof snap !== "object" || Array.isArray(snap)) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.VALIDATION,
            "Snapshot inválido: debe ser un objeto no nulo"
          ),
        };
      }
      if (!snap._meta || typeof snap._meta !== "object") {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.VALIDATION,
            "Snapshot sin _meta: no fue creado por este contrato"
          ),
        };
      }
      if (snap._meta.clubId !== clubId) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.TENANT_MISMATCH,
            `Snapshot pertenece a '${snap._meta.clubId}', este repo es '${clubId}'`
          ),
        };
      }

      // Deep-clone los datos del store (excluir _meta)
      const { _meta, ...storeData } = snap;
      try {
        _store = JSON.parse(JSON.stringify(storeData));
        _version = typeof _meta.version === "number" ? _meta.version : 0;
        return { ok: true, version: _version };
      } catch (e) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.INTERNAL,
            "Error al restaurar el snapshot"
          ),
        };
      }
    },

    /** Locking optimista para backend futuro.
     *
     *  Si la versión actual coincide con expectedVersion, ejecuta mutationFn(store)
     *  e incrementa la versión. Si no coincide, devuelve error de conflicto.
     *
     *  mutationFn(store): función síncrona que muta el store y devuelve cualquier
     *  resultado. Si lanza, el store queda en el estado antes de la llamada y
     *  se devuelve error "internal".
     *
     *  En producción: este patrón se reemplaza por transacciones atómicas del backend
     *  (Supabase row-level locking, Airtable ETag, etc.).
     *
     *  Devuelve { ok, error?, result?, version? } */
    applyIfVersion(expectedVersion, mutationFn) {
      if (typeof expectedVersion !== "number") {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.VALIDATION,
            "expectedVersion debe ser un número"
          ),
        };
      }
      if (_version !== expectedVersion) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.CONFLICT,
            `Conflicto de versión: se esperaba ${expectedVersion}, versión actual es ${_version}`
          ),
        };
      }
      try {
        const result = mutationFn(_store);
        _version += 1;
        return { ok: true, result, version: _version };
      } catch (e) {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.INTERNAL,
            e?.message ?? "Error inesperado en la mutación"
          ),
        };
      }
    },

    /** Construye una clave de idempotencia con scope de clubId explícito.
     *
     *  Aunque la instancia ya está aislada por club, incluir clubId en la clave
     *  facilita el debugging, logging y la migración a KV compartido en producción.
     *
     *  Formato: "<clubId>:<operación>:<actorId>:<targetId>"
     *  Ejemplo: "club-demo-04:follow:user-1:user-2" */
    buildIdempotencyKey(operation, actorId, targetId) {
      if (!operation || !actorId || !targetId) {
        throw new Error("buildIdempotencyKey: operation, actorId y targetId son requeridos");
      }
      return `${clubId}:${operation}:${actorId}:${targetId}`;
    },
  };
}
