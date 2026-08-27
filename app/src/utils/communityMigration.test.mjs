// Tests: CommunityMigration (Memory → Backend)
// Ejecutar: node --test src/utils/communityMigration.test.mjs

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  validateMigrationSnapshot,
  migrateMemoryToBackend,
} from "./communityMigration.js";

import {
  createMemoryCommunityRepository,
  COMMUNITY_ERROR_TYPES,
} from "./communityRepository.js";

import {
  createFakeBackendAdapter,
  createBackendCommunityRepository,
} from "./communityBackendRepository.js";

// Helper: crea un snapshot de memory repo con algunos datos ficticios.
function buildFakeSnapshot(clubId = "club-test", overrides = {}) {
  const repo = createMemoryCommunityRepository(clubId);
  const store = repo.getStore();
  // Añadir algunos datos ficticios
  store.userProfiles.push({ id: "u1", clubId, displayName: "Demo A" });
  store.posts.push({ id: "p1", clubId, authorId: "u1", body: "hola" });
  return { ...repo.snapshot(), ...overrides };
}

// ---------------------------------------------------------------------------
// validateMigrationSnapshot
// ---------------------------------------------------------------------------

describe("validateMigrationSnapshot", () => {
  it("aprueba snapshot válido", () => {
    const snap = buildFakeSnapshot();
    const result = validateMigrationSnapshot(snap);
    assert.equal(result.ok, true);
    assert.ok(result.summary);
    assert.equal(result.summary.clubId, "club-test");
    assert.ok(result.summary.totalEntities >= 2);
    assert.equal(result.summary.hasDuplicates, false);
  });

  it("rechaza null", () => {
    const r = validateMigrationSnapshot(null);
    assert.equal(r.ok, false);
    assert.equal(r.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });

  it("rechaza array", () => {
    const r = validateMigrationSnapshot([]);
    assert.equal(r.ok, false);
    assert.equal(r.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });

  it("rechaza snapshot sin _meta", () => {
    const r = validateMigrationSnapshot({ userProfiles: [] });
    assert.equal(r.ok, false);
    assert.equal(r.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
    assert.ok(r.error.message.includes("_meta"));
  });

  it("rechaza snapshot con _meta.clubId vacío", () => {
    const r = validateMigrationSnapshot({ _meta: { clubId: "" }, userProfiles: [] });
    assert.equal(r.ok, false);
    assert.equal(r.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });

  it("rechaza snapshot con entidad no-array", () => {
    const r = validateMigrationSnapshot({
      _meta: { clubId: "c1" },
      userProfiles: "no-es-array",
    });
    assert.equal(r.ok, false);
    assert.equal(r.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });

  it("detecta IDs duplicados", () => {
    const snap = buildFakeSnapshot();
    snap.posts.push({ id: "p1", clubId: "club-test", body: "duplicado" }); // ID duplicado
    const r = validateMigrationSnapshot(snap);
    assert.equal(r.ok, false);
    assert.ok(r.summary.hasDuplicates);
    assert.ok(r.summary.duplicateIds.includes("p1"));
    assert.ok(r.error.message.includes("duplicado"));
  });

  it("el summary contiene entity counts correctos", () => {
    const snap = buildFakeSnapshot();
    const { summary } = validateMigrationSnapshot(snap);
    assert.equal(summary.entityCounts.userProfiles, 1);
    assert.equal(summary.entityCounts.posts, 1);
    assert.equal(summary.entityCounts.comments, 0);
  });
});

// ---------------------------------------------------------------------------
// migrateMemoryToBackend — dry run
// ---------------------------------------------------------------------------

describe("migrateMemoryToBackend — dry run", () => {
  let adapter;
  let backendRepo;

  beforeEach(() => {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    backendRepo = createBackendCommunityRepository("club-test", adapter);
  });

  it("dry run (default) devuelve ok=true sin escribir", async () => {
    const snap = buildFakeSnapshot("club-test");
    const result = await migrateMemoryToBackend({ snapshot: snap, backendRepo });
    assert.equal(result.ok, true);
    assert.equal(result.dryRun, true);
    assert.ok(result.summary);

    // El backend no debería haber cambiado
    const v = await backendRepo.getVersion();
    assert.equal(v, 0);
  });

  it("dry run rechaza snapshot inválido", async () => {
    const result = await migrateMemoryToBackend({
      snapshot: null,
      backendRepo,
    });
    assert.equal(result.ok, false);
    assert.equal(result.dryRun, true);
  });

  it("dry run rechaza tenant mismatch", async () => {
    const snap = buildFakeSnapshot("otro-club");
    const result = await migrateMemoryToBackend({ snapshot: snap, backendRepo });
    assert.equal(result.ok, false);
    assert.equal(result.dryRun, true);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.TENANT_MISMATCH);
  });

  it("dry run con IDs duplicados devuelve error", async () => {
    const snap = buildFakeSnapshot("club-test");
    snap.posts.push({ id: "p1", body: "dup" });
    const result = await migrateMemoryToBackend({ snapshot: snap, backendRepo });
    assert.equal(result.ok, false);
    assert.equal(result.dryRun, true);
  });
});

// ---------------------------------------------------------------------------
// migrateMemoryToBackend — escritura real (dryRun=false)
// ---------------------------------------------------------------------------

describe("migrateMemoryToBackend — escritura real", () => {
  let adapter;
  let backendRepo;

  beforeEach(() => {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    backendRepo = createBackendCommunityRepository("club-test", adapter);
  });

  it("migra el snapshot al backend y actualiza el store", async () => {
    const snap = buildFakeSnapshot("club-test");
    const result = await migrateMemoryToBackend({
      snapshot: snap,
      backendRepo,
      dryRun: false,
    });
    assert.equal(result.ok, true);
    assert.equal(result.dryRun, false);
    assert.ok(result.summary.backendVersion >= 1);

    const store = await backendRepo.getStore();
    assert.equal(store.userProfiles.length, 1);
    assert.equal(store.userProfiles[0].id, "u1");
  });

  it("dryRun=false no escribe si hay error de validación", async () => {
    const result = await migrateMemoryToBackend({
      snapshot: null,
      backendRepo,
      dryRun: false,
    });
    assert.equal(result.ok, false);
    const v = await backendRepo.getVersion();
    assert.equal(v, 0); // no se escribió nada
  });

  it("dryRun=false rechaza tenant mismatch y no escribe", async () => {
    const snap = buildFakeSnapshot("club-x");
    const result = await migrateMemoryToBackend({
      snapshot: snap,
      backendRepo,
      dryRun: false,
    });
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.TENANT_MISMATCH);
    const v = await backendRepo.getVersion();
    assert.equal(v, 0);
  });

  it("la migración real preserva todos los datos del snapshot", async () => {
    const repo = createMemoryCommunityRepository("club-test");
    const store = repo.getStore();
    store.userProfiles.push({ id: "u1", displayName: "Ana" });
    store.userProfiles.push({ id: "u2", displayName: "Luis" });
    store.posts.push({ id: "p1", body: "post uno" });
    store.notifications.push({ id: "n1", type: "friend_request" });
    const snap = repo.snapshot();

    await migrateMemoryToBackend({ snapshot: snap, backendRepo, dryRun: false });
    const migrated = await backendRepo.getStore();

    assert.equal(migrated.userProfiles.length, 2);
    assert.equal(migrated.posts.length, 1);
    assert.equal(migrated.notifications.length, 1);
  });
});
