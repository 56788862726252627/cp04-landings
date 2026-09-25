// Club Pádel 04 · CommunitySyncManager
//
// Coordina el estado local (MemoryRepo) con el backend durable (BackendRepo).
//
// Arquitectura:
//   MemoryRepo   = estado local en RAM, lectura/escritura rápida, efímero
//   BackendRepo  = persistencia durable, optimistic lock, async
//
// Flujos:
//   BOOT:        backend → hydrate MemoryRepo
//   WRITE:       domain mutation → BackendRepo atomic write → si OK, replica en MemoryRepo
//   FAIL:        si backend falla → NO optimistic success falso → error normalizado
//   REFRESH:     backend → reconcile MemoryRepo (reemplaza estado local)
//   CLUB SWITCH: limpiar MemoryRepo → hydrate con nuevo club
//
// Principios:
//   - No duplicados: idempotencia en escrituras via BackendRepo.applyIfVersion
//   - No cross-tenant: cada SyncManager está fijo a un clubId
//   - No offline-sync complejo: sin cola de operaciones pendientes
//   - Rollback: si BackendRepo falla, MemoryRepo queda en estado previo al write
//   - Age gate: no responsabilidad del SyncManager — lo maneja el bridge/dominio
//
// Para usar:
//   const sync = createCommunitySyncManager({ memRepo, backendRepo });
//   await sync.hydrate();                  // BOOT: carga estado desde backend
//   await sync.writeThrough(mutFn);        // WRITE: mutación atómica
//   await sync.reconcile();               // REFRESH: reconcilia estado
//   await sync.switchClub(newClubId);     // CLUB SWITCH: cambia tenant

import { createCommunityError, COMMUNITY_ERROR_TYPES } from "./communityRepository.js";

export const SYNC_ERROR_TYPES = Object.freeze({
  NOT_HYDRATED: "sync_not_hydrated",
  HYDRATION_FAILED: "sync_hydration_failed",
  WRITE_FAILED: "sync_write_failed",
  RECONCILE_FAILED: "sync_reconcile_failed",
  CLUB_MISMATCH: "sync_club_mismatch",
  BACKEND_UNAVAILABLE: "backend_unavailable",
});

function syncError(type, message) {
  return { type, message };
}

/**
 * Crea un SyncManager que coordina MemoryRepo y BackendRepo.
 *
 * @param {object} options
 * @param {object} options.memRepo      — MemoryCommunityRepository (estado local)
 * @param {object} options.backendRepo  — BackendCommunityRepository (persistencia durable)
 * @param {object} [options.onError]    — callback(error) para errores no fatales
 */
export function createCommunitySyncManager({ memRepo, backendRepo, onError = null } = {}) {
  if (!memRepo || typeof memRepo.getStore !== "function") {
    throw new Error("createCommunitySyncManager: memRepo es requerido (con getStore)");
  }
  if (!backendRepo || typeof backendRepo.getStore !== "function") {
    throw new Error("createCommunitySyncManager: backendRepo es requerido");
  }
  if (!backendRepo.applyIfVersion) {
    throw new Error("createCommunitySyncManager: backendRepo debe tener applyIfVersion");
  }

  const _clubId = memRepo.getClubId();
  let _hydrated = false;
  let _backendVersion = null; // última versión conocida del backend

  function _reportError(err) {
    if (typeof onError === "function") {
      try { onError(err); } catch { /* no propagar errores del callback */ }
    }
  }

  // --------------------------------------------------------------------------
  // hydrate — BOOT: lee desde backend y reemplaza el estado de MemoryRepo
  // --------------------------------------------------------------------------

  /**
   * Carga el estado desde BackendRepo y lo escribe en MemoryRepo.
   * Debe llamarse antes de usar el SyncManager para escrituras.
   *
   * @returns {{ ok, version?, error? }}
   */
  async function hydrate() {
    let backendData;
    try {
      const r = await backendRepo.getStore();
      backendData = r;
    } catch (e) {
      const err = syncError(SYNC_ERROR_TYPES.HYDRATION_FAILED, e?.message ?? "Error hidratando desde backend");
      _reportError(err);
      return { ok: false, error: err };
    }

    if (!backendData || typeof backendData !== "object") {
      const err = syncError(SYNC_ERROR_TYPES.HYDRATION_FAILED, "Backend devolvió datos inválidos");
      _reportError(err);
      return { ok: false, error: err };
    }

    // Obtener versión actual del backend
    let version = 0;
    try {
      const snap = await backendRepo.snapshot();
      version = snap?._meta?.version ?? 0;
    } catch {
      version = 0;
    }

    // Restaurar el estado de MemoryRepo desde el snapshot del backend.
    // restoreSnapshot valida clubId (_meta.clubId debe coincidir).
    try {
      const snapshot = { ...backendData };
      snapshot._meta = {
        clubId: _clubId,
        version,
        timestamp: new Date().toISOString(),
        source: "hydration",
      };
      await memRepo.restoreSnapshot(snapshot);
    } catch (e) {
      const err = syncError(SYNC_ERROR_TYPES.HYDRATION_FAILED, `Error restaurando snapshot: ${e?.message}`);
      _reportError(err);
      return { ok: false, error: err };
    }

    _hydrated = true;
    _backendVersion = version;
    return { ok: true, version };
  }

  // --------------------------------------------------------------------------
  // writeThrough — WRITE: mutación atómica backend-first, luego MemoryRepo
  // --------------------------------------------------------------------------

  /**
   * Ejecuta una mutación de forma atómica:
   *   1. Aplica en BackendRepo vía applyIfVersion (persiste de forma durable).
   *   2. Si OK: replica la mutación en MemoryRepo.
   *   3. Si FAIL: devuelve error normalizado sin modificar MemoryRepo.
   *
   * @param {Function} mutFn — función que recibe (store) y lo muta in-place
   * @param {object} [opts]
   * @param {boolean} [opts.bypassVersionCheck] — para operaciones de admin (con cuidado)
   * @returns {{ ok, version?, error? }}
   */
  async function writeThrough(mutFn, { bypassVersionCheck = false } = {}) {
    if (!_hydrated) {
      const err = syncError(SYNC_ERROR_TYPES.NOT_HYDRATED, "writeThrough llamado antes de hydrate()");
      return { ok: false, error: err };
    }

    const expectedVersion = bypassVersionCheck ? undefined : _backendVersion;

    // Intentar escritura en backend primero.
    let backendResult;
    try {
      backendResult = await backendRepo.applyIfVersion(expectedVersion ?? 0, mutFn);
    } catch (e) {
      const err = syncError(SYNC_ERROR_TYPES.WRITE_FAILED, e?.message ?? "Error en applyIfVersion");
      _reportError(err);
      return { ok: false, error: err };
    }

    if (!backendResult.ok) {
      // Si es conflicto de versión → intentar reconciliar y devolver error
      if (backendResult.error?.type === COMMUNITY_ERROR_TYPES.CONFLICT) {
        // Reconciliar en background (no bloquear al caller)
        reconcile().catch(() => {}); // eslint-disable-line no-use-before-define
      }
      _reportError(backendResult.error);
      return { ok: false, error: backendResult.error };
    }

    // Backend OK → aplicar la misma mutación en MemoryRepo
    try {
      const localStore = await memRepo.getStore();
      mutFn(localStore);
    } catch (e) {
      // MemoryRepo falló — inconsistencia leve: backend tiene el dato, memoria no.
      // Reconciliar para volver a sincronizar.
      const err = syncError(
        SYNC_ERROR_TYPES.WRITE_FAILED,
        `Backend persistido pero MemoryRepo falló: ${e?.message}. Reconciliando...`
      );
      _reportError(err);
      reconcile().catch(() => {}); // eslint-disable-line no-use-before-define
      // No devolvemos error al caller porque el backend SÍ persistió.
      // El caller recibirá ok:true — la inconsistencia se resolverá con reconcile.
    }

    _backendVersion = backendResult.version ?? (_backendVersion ?? 0) + 1;
    // Propagar el valor devuelto por mutFn (útil para capturar IDs de entidades creadas).
    return { ok: true, version: _backendVersion, result: backendResult.result };
  }

  // --------------------------------------------------------------------------
  // reconcile — REFRESH: re-lee backend y reemplaza estado de MemoryRepo
  // --------------------------------------------------------------------------

  /**
   * Re-lee el estado desde BackendRepo y lo replica en MemoryRepo.
   * Útil tras un conflicto de versión o para refrescar estado stale.
   *
   * @returns {{ ok, version?, error? }}
   */
  async function reconcile() {
    let data;
    try {
      data = await backendRepo.getStore();
    } catch (e) {
      const err = syncError(SYNC_ERROR_TYPES.RECONCILE_FAILED, e?.message ?? "Error leyendo backend");
      _reportError(err);
      return { ok: false, error: err };
    }

    let version = _backendVersion ?? 0;
    try {
      const snap = await backendRepo.snapshot();
      version = snap?._meta?.version ?? version;
    } catch { /* usar versión cached si snapshot falla */ }

    try {
      const snapshot = { ...data };
      snapshot._meta = {
        clubId: _clubId,
        version,
        timestamp: new Date().toISOString(),
        source: "reconcile",
      };
      await memRepo.restoreSnapshot(snapshot);
    } catch (e) {
      const err = syncError(SYNC_ERROR_TYPES.RECONCILE_FAILED, `Error en restoreSnapshot: ${e?.message}`);
      _reportError(err);
      return { ok: false, error: err };
    }

    _backendVersion = version;
    return { ok: true, version };
  }

  // --------------------------------------------------------------------------
  // switchClub — CLUB SWITCH: cambia tenant, limpia MemoryRepo y rehidrata
  // --------------------------------------------------------------------------

  /**
   * Cambia el club activo:
   *   1. Valida que el nuevo clubId sea distinto del actual.
   *   2. Limpia el MemoryRepo local (reset).
   *   3. Devuelve un nuevo SyncManager para el nuevo club.
   *
   * El caller debe reemplazar la instancia de SyncManager actual por la devuelta.
   *
   * @param {object} newMemRepo       — MemoryRepo del nuevo club
   * @param {object} newBackendRepo   — BackendRepo del nuevo club
   * @returns {{ ok, syncManager? }}
   */
  async function switchClub(newMemRepo, newBackendRepo) {
    const newClubId = newMemRepo?.getClubId?.();
    if (!newClubId || newClubId === _clubId) {
      return {
        ok: false,
        error: syncError(SYNC_ERROR_TYPES.CLUB_MISMATCH, `switchClub requiere un clubId distinto al actual (${_clubId})`),
      };
    }

    // Limpiar MemoryRepo actual (no BackendRepo — los datos persisten en backend)
    try {
      memRepo.reset();
    } catch { /* no fatal — el MemoryRepo del club antiguo no importa */ }

    // Crear nuevo SyncManager para el nuevo club
    const newSync = createCommunitySyncManager({
      memRepo: newMemRepo,
      backendRepo: newBackendRepo,
      onError,
    });

    // Hidratar nuevo club
    const hydrateResult = await newSync.hydrate();
    if (!hydrateResult.ok) {
      // Backend no disponible — devolver SyncManager no hidratado
      // El caller puede operar con MemoryRepo vacío (fallback)
      return { ok: false, error: hydrateResult.error, syncManager: newSync };
    }

    return { ok: true, syncManager: newSync };
  }

  // --------------------------------------------------------------------------
  // Introspección
  // --------------------------------------------------------------------------

  function getClubId() { return _clubId; }
  function isHydrated() { return _hydrated; }
  function getBackendVersion() { return _backendVersion; }

  return {
    hydrate,
    writeThrough,
    reconcile,
    switchClub,
    getClubId,
    isHydrated,
    getBackendVersion,
  };
}

// --------------------------------------------------------------------------
// validateSyncManager — contrato para tests y extensión
// --------------------------------------------------------------------------

export function validateSyncManager(manager) {
  const required = ["hydrate", "writeThrough", "reconcile", "switchClub", "getClubId", "isHydrated"];
  const missing = required.filter((m) => typeof manager?.[m] !== "function");
  return { valid: missing.length === 0, missing };
}
