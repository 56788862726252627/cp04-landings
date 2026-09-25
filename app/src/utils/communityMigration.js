// Club Pádel 04 · CommunityMigration — Memory → Backend.
//
// Mecanismo contractual/testable para migrar un snapshot de
// MemoryCommunityRepository a BackendCommunityRepository.
//
// NUNCA migra datos reales. Solo opera sobre snapshots ficticios o de test.
// El contrato garantiza:
//   - dry-run por defecto (sin escritura)
//   - validación de clubId/tenant
//   - validación de estructura mínima
//   - detección de IDs duplicados
//   - resumen con conteo de entidades
//   - rollback implícito: si falla la escritura, el backend no cambia
//
// Para producción futura: añadir validación de schema version y
// conversión de tipos cuando el modelo del backend difiera del snapshot.

import {
  COMMUNITY_ERROR_TYPES,
  createCommunityError,
} from "./communityRepository.js";

// Entidades del store que se migran.
const STORE_ENTITY_KEYS = [
  "userProfiles",
  "playerSocialProfiles",
  "playerStats",
  "friendships",
  "follows",
  "posts",
  "comments",
  "reactions",
  "openMatches",
  "matchInvites",
  "groups",
  "groupMembers",
  "eventRegistrations",
  "socialRankings",
  "notifications",
  "reports",
  "moderationActions",
  "consents",
  "auditLog",
];

/**
 * Valida un snapshot antes de migrar.
 * @returns {{ ok: boolean, error?: object, summary?: object }}
 */
export function validateMigrationSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return {
      ok: false,
      error: createCommunityError(
        COMMUNITY_ERROR_TYPES.VALIDATION,
        "Snapshot inválido: debe ser un objeto no nulo"
      ),
    };
  }

  if (!snapshot._meta || typeof snapshot._meta !== "object") {
    return {
      ok: false,
      error: createCommunityError(
        COMMUNITY_ERROR_TYPES.VALIDATION,
        "Snapshot sin _meta: no fue creado por MemoryCommunityRepository"
      ),
    };
  }

  const { _meta } = snapshot;

  if (!_meta.clubId || typeof _meta.clubId !== "string" || !_meta.clubId.trim()) {
    return {
      ok: false,
      error: createCommunityError(
        COMMUNITY_ERROR_TYPES.VALIDATION,
        "Snapshot sin _meta.clubId válido"
      ),
    };
  }

  const entityCounts = {};
  let totalEntities = 0;
  const allIds = [];

  for (const key of STORE_ENTITY_KEYS) {
    const arr = snapshot[key];
    if (arr === undefined || arr === null) {
      entityCounts[key] = 0;
    } else if (!Array.isArray(arr)) {
      return {
        ok: false,
        error: createCommunityError(
          COMMUNITY_ERROR_TYPES.VALIDATION,
          `snapshot.${key} debe ser array, encontrado: ${typeof arr}`
        ),
      };
    } else {
      entityCounts[key] = arr.length;
      totalEntities += arr.length;
      for (const item of arr) {
        if (item?.id) allIds.push(item.id);
      }
    }
  }

  const idSet = new Set();
  const duplicateIds = [];
  for (const id of allIds) {
    if (idSet.has(id)) duplicateIds.push(id);
    else idSet.add(id);
  }

  const summary = {
    clubId: _meta.clubId,
    snapshotVersion: typeof _meta.version === "number" ? _meta.version : 0,
    snapshotTimestamp: _meta.timestamp ?? null,
    totalEntities,
    entityCounts,
    duplicateIds,
    hasDuplicates: duplicateIds.length > 0,
  };

  if (duplicateIds.length > 0) {
    return {
      ok: false,
      error: createCommunityError(
        COMMUNITY_ERROR_TYPES.VALIDATION,
        `Snapshot contiene ${duplicateIds.length} ID(s) duplicado(s) — migración abortada`
      ),
      summary,
    };
  }

  return { ok: true, summary };
}

/**
 * Migra un snapshot de MemoryCommunityRepository a un BackendCommunityRepository.
 *
 * Por defecto opera en dry-run (dryRun=true): valida sin escribir.
 * Pasar dryRun=false para ejecutar la migración real.
 *
 * @param {object} options
 * @param {object} options.snapshot    — snapshot de MemoryCommunityRepository.snapshot()
 * @param {object} options.backendRepo — BackendCommunityRepository (métodos async)
 * @param {boolean} [options.dryRun=true] — si true, solo valida, no escribe
 * @returns {Promise<{ ok, dryRun, summary?, error? }>}
 */
export async function migrateMemoryToBackend({ snapshot, backendRepo, dryRun = true }) {
  // Validación del snapshot
  const validation = validateMigrationSnapshot(snapshot);
  if (!validation.ok) {
    return { ok: false, dryRun, error: validation.error, summary: validation.summary };
  }

  const { summary } = validation;

  // Validación de tenant
  if (typeof backendRepo?.getClubId !== "function") {
    return {
      ok: false,
      dryRun,
      error: createCommunityError(COMMUNITY_ERROR_TYPES.VALIDATION, "backendRepo no tiene getClubId()"),
    };
  }

  const repoClubId = backendRepo.getClubId();
  if (repoClubId !== summary.clubId) {
    return {
      ok: false,
      dryRun,
      error: createCommunityError(
        COMMUNITY_ERROR_TYPES.TENANT_MISMATCH,
        `Snapshot es de '${summary.clubId}', backendRepo es de '${repoClubId}'`
      ),
      summary,
    };
  }

  if (dryRun) {
    return { ok: true, dryRun: true, summary };
  }

  // Escritura real
  if (typeof backendRepo?.restoreSnapshot !== "function") {
    return {
      ok: false,
      dryRun: false,
      error: createCommunityError(COMMUNITY_ERROR_TYPES.VALIDATION, "backendRepo no tiene restoreSnapshot()"),
      summary,
    };
  }

  const writeResult = await backendRepo.restoreSnapshot(snapshot);
  if (!writeResult.ok) {
    return { ok: false, dryRun: false, error: writeResult.error, summary };
  }

  return {
    ok: true,
    dryRun: false,
    summary: { ...summary, backendVersion: writeResult.version },
  };
}
