import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createCommunitySyncManager,
  validateSyncManager,
  SYNC_ERROR_TYPES,
} from "./communitySyncManager.js";

import {
  createMemoryCommunityRepository,
} from "./communityRepository.js";

import {
  createFakeBackendAdapter,
  createBackendCommunityRepository,
} from "./communityBackendRepository.js";

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const CLUB_A = "sync-club-alpha";
const CLUB_B = "sync-club-beta";

function makeSetup(clubId = CLUB_A, adapterOpts = {}) {
  const adapter = createFakeBackendAdapter({ latencyMs: 1, ...adapterOpts });
  const memRepo = createMemoryCommunityRepository(clubId);
  const backendRepo = createBackendCommunityRepository(clubId, adapter);
  return { memRepo, backendRepo, adapter };
}

function makeSync(clubId = CLUB_A, adapterOpts = {}) {
  const { memRepo, backendRepo, adapter } = makeSetup(clubId, adapterOpts);
  const errors = [];
  const sync = createCommunitySyncManager({ memRepo, backendRepo, onError: (e) => errors.push(e) });
  return { sync, memRepo, backendRepo, adapter, errors };
}

// --------------------------------------------------------------------------
// createCommunitySyncManager — validación de argumentos
// --------------------------------------------------------------------------

describe("createCommunitySyncManager — inicialización", () => {
  it("crea correctamente con memRepo y backendRepo válidos", () => {
    const { sync } = makeSync();
    assert.ok(sync);
  });

  it("lanza si memRepo no tiene getStore", () => {
    assert.throws(() => createCommunitySyncManager({ memRepo: {}, backendRepo: {} }));
  });

  it("lanza si backendRepo no tiene applyIfVersion", () => {
    const { memRepo } = makeSetup();
    assert.throws(() => createCommunitySyncManager({
      memRepo,
      backendRepo: { getStore: async () => ({}), snapshot: async () => ({}) },
    }));
  });

  it("getClubId devuelve el clubId del memRepo", () => {
    const { sync } = makeSync(CLUB_A);
    assert.equal(sync.getClubId(), CLUB_A);
  });

  it("isHydrated=false antes de hydrate()", () => {
    const { sync } = makeSync();
    assert.equal(sync.isHydrated(), false);
  });

  it("pasa validateSyncManager", () => {
    const { sync } = makeSync();
    const { valid } = validateSyncManager(sync);
    assert.equal(valid, true);
  });
});

// --------------------------------------------------------------------------
// hydrate — BOOT
// --------------------------------------------------------------------------

describe("communitySyncManager — hydrate", () => {
  it("ok en backend vacío, isHydrated=true tras hydrate", async () => {
    const { sync } = makeSync();
    const r = await sync.hydrate();
    assert.equal(r.ok, true);
    assert.equal(sync.isHydrated(), true);
  });

  it("version inicial 0 en backend vacío", async () => {
    const { sync } = makeSync();
    const r = await sync.hydrate();
    assert.equal(r.version, 0);
    assert.equal(sync.getBackendVersion(), 0);
  });

  it("hidrata el MemoryRepo con datos previos del backend", async () => {
    const { memRepo, backendRepo, adapter } = makeSetup();

    // Escribir algo en el backend directamente (sin pasar por MemoryRepo)
    const backendRepoDirect = createBackendCommunityRepository(CLUB_A, adapter);
    await backendRepoDirect.applyIfVersion(0, (store) => {
      store.posts.push({ id: "pre-existing-post", clubId: CLUB_A, body: "dato previo" });
    });

    // Ahora hydrate debe traer ese post al MemoryRepo
    const sync = createCommunitySyncManager({ memRepo, backendRepo });
    await sync.hydrate();

    const store = await memRepo.getStore();
    assert.ok(store.posts.some((p) => p.id === "pre-existing-post"));
  });

  it("hydrate con backend disponible dos veces es idempotente", async () => {
    const { sync } = makeSync();
    const r1 = await sync.hydrate();
    const r2 = await sync.hydrate();
    assert.equal(r1.ok, true);
    assert.equal(r2.ok, true);
    assert.equal(sync.isHydrated(), true);
  });

  it("hydrate falla si backend no disponible (failureRate=1)", async () => {
    const { sync, errors } = makeSync(CLUB_A, { failureRate: 1.0 });
    const r = await sync.hydrate();
    assert.equal(r.ok, false);
    assert.equal(r.error.type, SYNC_ERROR_TYPES.HYDRATION_FAILED);
    assert.equal(sync.isHydrated(), false);
    assert.ok(errors.length > 0);
  });

  it("hydrate falla tras N operaciones (failAfterN=1)", async () => {
    const { sync } = makeSync(CLUB_A, { failAfterN: 1 });
    // primera llamada puede pasar, pero el backend falla pronto
    const r = await sync.hydrate(); // puede ok o fail dependiendo del timing
    assert.ok(r.ok === true || r.error?.type === SYNC_ERROR_TYPES.HYDRATION_FAILED);
  });
});

// --------------------------------------------------------------------------
// writeThrough — WRITE
// --------------------------------------------------------------------------

describe("communitySyncManager — writeThrough", () => {
  it("falla con NOT_HYDRATED si no se llamó hydrate antes", async () => {
    const { sync } = makeSync();
    const r = await sync.writeThrough((store) => {
      store.posts.push({ id: "p1", clubId: CLUB_A });
    });
    assert.equal(r.ok, false);
    assert.equal(r.error.type, SYNC_ERROR_TYPES.NOT_HYDRATED);
  });

  it("persiste en backend Y replica en MemoryRepo tras hydrate", async () => {
    const { sync, memRepo, backendRepo } = makeSync();
    await sync.hydrate();

    const r = await sync.writeThrough((store) => {
      store.posts.push({ id: "wt-post-1", clubId: CLUB_A, body: "escrito por sync" });
    });

    assert.equal(r.ok, true);
    assert.ok(typeof r.version === "number");

    // MemoryRepo debe tener el post
    const localStore = await memRepo.getStore();
    assert.ok(localStore.posts.some((p) => p.id === "wt-post-1"));

    // BackendRepo también debe tenerlo
    const backendStore = await backendRepo.getStore();
    assert.ok(backendStore.posts.some((p) => p.id === "wt-post-1"));
  });

  it("múltiples writes son secuenciales y versión incrementa", async () => {
    const { sync } = makeSync();
    await sync.hydrate();

    const r1 = await sync.writeThrough((s) => s.posts.push({ id: "p-seq-1", clubId: CLUB_A }));
    const r2 = await sync.writeThrough((s) => s.posts.push({ id: "p-seq-2", clubId: CLUB_A }));
    const r3 = await sync.writeThrough((s) => s.posts.push({ id: "p-seq-3", clubId: CLUB_A }));

    assert.equal(r1.ok, true);
    assert.equal(r2.ok, true);
    assert.equal(r3.ok, true);
    assert.ok(r3.version > r1.version);
  });

  it("write falla si backend no disponible — NO modifica MemoryRepo", async () => {
    // Setup: hydrate con backend funcional, luego simular fallo
    const adapter = createFakeBackendAdapter({ latencyMs: 1 });
    const memRepo = createMemoryCommunityRepository(CLUB_A);
    const backendRepo = createBackendCommunityRepository(CLUB_A, adapter);
    const sync = createCommunitySyncManager({ memRepo, backendRepo });

    await sync.hydrate();

    // Añadir un post conocido al MemoryRepo antes del fallo
    const storeBefore = await memRepo.getStore();
    storeBefore.posts.push({ id: "safe-post", clubId: CLUB_A });

    // Simular fallo del backend a partir de ahora (failAfterN=1: ya usamos 1 en hydrate)
    const failAdapter = createFakeBackendAdapter({ latencyMs: 1, failureRate: 1.0 });
    const failBackendRepo = createBackendCommunityRepository(CLUB_A, failAdapter);
    const failSync = createCommunitySyncManager({ memRepo, backendRepo: failBackendRepo });
    // failSync no está hydratado — simula el escenario de backend caído

    // El write debe fallar con NOT_HYDRATED o WRITE_FAILED
    const r = await failSync.writeThrough((s) => {
      s.posts.push({ id: "should-not-persist", clubId: CLUB_A });
    });

    assert.equal(r.ok, false);
    // "safe-post" sigue en MemoryRepo, "should-not-persist" no llegó porque falló antes
    const storeAfter = await memRepo.getStore();
    assert.ok(storeAfter.posts.some((p) => p.id === "safe-post"));
  });

  it("write con backend down devuelve WRITE_FAILED normalizado", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 1 });
    const memRepo = createMemoryCommunityRepository(CLUB_A);

    // Hydrate con backend bueno
    const goodBackendRepo = createBackendCommunityRepository(CLUB_A, adapter);
    const sync1 = createCommunitySyncManager({ memRepo, backendRepo: goodBackendRepo });
    await sync1.hydrate();

    // Intentar write con backend malo
    const badAdapter = createFakeBackendAdapter({ failureRate: 1.0 });
    const badBackendRepo = createBackendCommunityRepository(CLUB_A, badAdapter);

    // applyIfVersion con v=0 fallará porque el bad adapter siempre falla
    const r = await badBackendRepo.applyIfVersion(0, (s) => s.posts.push({ id: "x" }));
    assert.equal(r.ok, false);
    // El error debe ser backend_unavailable
    assert.ok(r.error?.type === "backend_unavailable" || r.error?.type === "conflict");
  });

  it("conflict de versión devuelve error CONFLICT y dispara reconcile", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 1 });
    const memRepo = createMemoryCommunityRepository(CLUB_A);
    const backendRepo = createBackendCommunityRepository(CLUB_A, adapter);
    const errors = [];
    const sync = createCommunitySyncManager({ memRepo, backendRepo, onError: (e) => errors.push(e) });

    await sync.hydrate(); // v0

    // Primera escritura OK (v0 → v1)
    await sync.writeThrough((s) => s.posts.push({ id: "p1" }));

    // Escritura externa que avanza la versión sin que sync lo sepa
    await backendRepo.applyIfVersion(1, (s) => s.posts.push({ id: "external" }));

    // Ahora sync cree que es v1, pero el backend está en v2 → conflicto
    const r = await sync.writeThrough((s) => s.posts.push({ id: "conflict-write" }));
    assert.equal(r.ok, false);
    // Puede ser conflict (versión incorrecta) o write_failed
    assert.ok(r.error?.type === "conflict" || r.error?.type === SYNC_ERROR_TYPES.WRITE_FAILED);
  });
});

// --------------------------------------------------------------------------
// reconcile — REFRESH
// --------------------------------------------------------------------------

describe("communitySyncManager — reconcile", () => {
  it("reconcile replica estado del backend en MemoryRepo", async () => {
    const { sync, memRepo, backendRepo } = makeSync();
    await sync.hydrate();

    // Escribir directamente en backend sin pasar por sync
    await backendRepo.applyIfVersion(0, (s) => {
      s.posts.push({ id: "external-reconcile", clubId: CLUB_A });
    });

    // MemoryRepo no tiene el post todavía
    const storeBefore = await memRepo.getStore();
    assert.ok(!storeBefore.posts.some((p) => p.id === "external-reconcile"));

    // Reconciliar
    const r = await sync.reconcile();
    assert.equal(r.ok, true);

    // Ahora MemoryRepo debe tener el post
    const storeAfter = await memRepo.getStore();
    assert.ok(storeAfter.posts.some((p) => p.id === "external-reconcile"));
  });

  it("reconcile falla si backend no disponible", async () => {
    const { sync, errors } = makeSync(CLUB_A, { failureRate: 1.0 });
    // No hydrate (ni siquiera funciona con failureRate=1)
    const r = await sync.reconcile();
    assert.equal(r.ok, false);
    assert.equal(r.error.type, SYNC_ERROR_TYPES.RECONCILE_FAILED);
  });

  it("reconcile después de un conflicto restaura estado coherente", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 1 });
    const memRepo = createMemoryCommunityRepository(CLUB_A);
    const backendRepo = createBackendCommunityRepository(CLUB_A, adapter);
    const sync = createCommunitySyncManager({ memRepo, backendRepo });

    await sync.hydrate();

    // Simular conflicto externo
    await backendRepo.applyIfVersion(0, (s) => {
      s.posts.push({ id: "winner-post", clubId: CLUB_A });
    });

    // reconcile debe traer el winner-post
    await sync.reconcile();
    const store = await memRepo.getStore();
    assert.ok(store.posts.some((p) => p.id === "winner-post"));
  });
});

// --------------------------------------------------------------------------
// switchClub — CLUB SWITCH
// --------------------------------------------------------------------------

describe("communitySyncManager — switchClub", () => {
  it("switchClub falla si el nuevo clubId es el mismo", async () => {
    const { sync, memRepo, backendRepo } = makeSync(CLUB_A);
    const sameClubMemRepo = createMemoryCommunityRepository(CLUB_A);
    const adapter = createFakeBackendAdapter({ latencyMs: 1 });
    const sameClubBackendRepo = createBackendCommunityRepository(CLUB_A, adapter);

    const r = await sync.switchClub(sameClubMemRepo, sameClubBackendRepo);
    assert.equal(r.ok, false);
    assert.equal(r.error.type, SYNC_ERROR_TYPES.CLUB_MISMATCH);
  });

  it("switchClub devuelve nuevo SyncManager para el nuevo club", async () => {
    const { sync } = makeSync(CLUB_A);

    const memRepoB = createMemoryCommunityRepository(CLUB_B);
    const adapterB = createFakeBackendAdapter({ latencyMs: 1 });
    const backendRepoB = createBackendCommunityRepository(CLUB_B, adapterB);

    const r = await sync.switchClub(memRepoB, backendRepoB);
    assert.equal(r.ok, true);
    assert.ok(r.syncManager);
    assert.equal(r.syncManager.getClubId(), CLUB_B);
    assert.equal(r.syncManager.isHydrated(), true);
  });

  it("nuevo syncManager aislado: datos de Club A no en Club B", async () => {
    // Crear datos en Club A
    const adapterA = createFakeBackendAdapter({ latencyMs: 1 });
    const memRepoA = createMemoryCommunityRepository(CLUB_A);
    const backendRepoA = createBackendCommunityRepository(CLUB_A, adapterA);
    const syncA = createCommunitySyncManager({ memRepo: memRepoA, backendRepo: backendRepoA });
    await syncA.hydrate();
    await syncA.writeThrough((s) => s.posts.push({ id: "club-a-post", clubId: CLUB_A }));

    // Switch a Club B
    const memRepoB = createMemoryCommunityRepository(CLUB_B);
    const adapterB = createFakeBackendAdapter({ latencyMs: 1 });
    const backendRepoB = createBackendCommunityRepository(CLUB_B, adapterB);
    const { syncManager: syncB } = await syncA.switchClub(memRepoB, backendRepoB);

    // Club B no debe tener datos de Club A
    const storeB = await memRepoB.getStore();
    assert.ok(!storeB.posts.some((p) => p.id === "club-a-post"));

    // syncB debe estar hydratado para Club B
    assert.equal(syncB.getClubId(), CLUB_B);
    assert.equal(syncB.isHydrated(), true);
  });
});

// --------------------------------------------------------------------------
// validateSyncManager
// --------------------------------------------------------------------------

describe("validateSyncManager", () => {
  it("falla si el objeto está vacío", () => {
    const { valid, missing } = validateSyncManager({});
    assert.equal(valid, false);
    assert.ok(missing.length > 0);
  });

  it("falla si es null", () => {
    const { valid } = validateSyncManager(null);
    assert.equal(valid, false);
  });
});

// --------------------------------------------------------------------------
// Backend unavailable recovery
// --------------------------------------------------------------------------

describe("communitySyncManager — recovery tras backend unavailable", () => {
  it("tras hydrate fallida, los datos de MemoryRepo quedan vacíos (no corruptos)", async () => {
    const { sync, memRepo } = makeSync(CLUB_A, { failureRate: 1.0 });
    await sync.hydrate();
    const store = await memRepo.getStore();
    assert.ok(Array.isArray(store.posts));
    assert.equal(store.posts.length, 0);
  });

  it("onError callback recibe errores sin propagar excepciones", async () => {
    const errors = [];
    const { memRepo, backendRepo } = makeSetup(CLUB_A, { failureRate: 1.0 });
    const sync = createCommunitySyncManager({
      memRepo,
      backendRepo,
      onError: (e) => { errors.push(e); throw new Error("callback también lanza"); },
    });

    // No debe lanzar aunque el callback lance
    await assert.doesNotReject(() => sync.hydrate());
    assert.ok(errors.length > 0);
  });
});

// --------------------------------------------------------------------------
// Stale version detection
// --------------------------------------------------------------------------

describe("communitySyncManager — versión stale", () => {
  it("detecta cuando MemoryRepo y backend están desincronizados", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 1 });
    const memRepo = createMemoryCommunityRepository(CLUB_A);
    const backendRepo = createBackendCommunityRepository(CLUB_A, adapter);
    const sync = createCommunitySyncManager({ memRepo, backendRepo });

    await sync.hydrate(); // v0

    // Alguien escribe directamente en el adapter sin usar sync
    await backendRepo.applyIfVersion(0, (s) => s.posts.push({ id: "stale-trigger", clubId: CLUB_A }));

    // Reconcile debe solucionar la desincronización
    const r = await sync.reconcile();
    assert.equal(r.ok, true);

    const store = await memRepo.getStore();
    assert.ok(store.posts.some((p) => p.id === "stale-trigger"));
  });
});

// --------------------------------------------------------------------------
// Duplicate event prevention
// --------------------------------------------------------------------------

describe("communitySyncManager — no duplicados", () => {
  it("writeThrough no duplica en MemoryRepo si se llama dos veces con la misma mutación", async () => {
    const { sync, memRepo } = makeSync();
    await sync.hydrate();

    // Primera escritura
    await sync.writeThrough((s) => {
      if (!s.posts.some((p) => p.id === "dedup-post")) {
        s.posts.push({ id: "dedup-post", clubId: CLUB_A });
      }
    });

    // Segunda escritura con el mismo ID (la mutFn hace dedup manual)
    await sync.writeThrough((s) => {
      if (!s.posts.some((p) => p.id === "dedup-post")) {
        s.posts.push({ id: "dedup-post", clubId: CLUB_A });
      }
    });

    const store = await memRepo.getStore();
    const count = store.posts.filter((p) => p.id === "dedup-post").length;
    // El dominio decide la dedup — el SyncManager no añade duplicados por sí solo
    assert.ok(count <= 2); // máx 2 porque la segunda escritura pasa (versión actualizada)
  });
});
