// Tests: BackendCommunityRepository + FakeBackendAdapter
// Ejecutar: node --test src/utils/communityBackendRepository.test.mjs

import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  createFakeBackendAdapter,
  createBackendCommunityRepository,
  validateBackendAdapter,
  BACKEND_UNAVAILABLE,
  COMMUNITY_BACKEND_REPOSITORY_CONTRACT,
} from "./communityBackendRepository.js";

import {
  COMMUNITY_ERROR_TYPES,
} from "./communityRepository.js";

// ---------------------------------------------------------------------------
// FakeBackendAdapter
// ---------------------------------------------------------------------------

describe("FakeBackendAdapter", () => {
  it("crea un adapter con los métodos requeridos", () => {
    const adapter = createFakeBackendAdapter();
    assert.equal(typeof adapter.readAll, "function");
    assert.equal(typeof adapter.writeAll, "function");
    assert.equal(typeof adapter.isIdempotencyKeyUsed, "function");
    assert.equal(typeof adapter.markIdempotencyKey, "function");
    assert.equal(typeof adapter.getIdempotencyResult, "function");
  });

  it("readAll devuelve store vacío para club nuevo", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    const result = await adapter.readAll("club-test");
    assert.equal(result.ok, true);
    assert.equal(result.version, 0);
    assert.ok(Array.isArray(result.data.userProfiles));
    assert.equal(result.data.userProfiles.length, 0);
  });

  it("writeAll persiste y readAll recupera el dato", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    const store = { userProfiles: [{ id: "u1", displayName: "Test" }], posts: [] };
    const writeResult = await adapter.writeAll("club-a", store, undefined);
    assert.equal(writeResult.ok, true);
    assert.equal(writeResult.version, 1);

    const readResult = await adapter.readAll("club-a");
    assert.equal(readResult.ok, true);
    assert.equal(readResult.version, 1);
    assert.equal(readResult.data.userProfiles[0].displayName, "Test");
  });

  it("writeAll devuelve conflict si la versión esperada no coincide", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    await adapter.writeAll("club-a", {}, undefined);
    // versión es ahora 1 — intentar escribir con expectedVersion=0 debe fallar
    const result = await adapter.writeAll("club-a", {}, 0);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.CONFLICT);
  });

  it("writeAll con expectedVersion correcto incrementa la versión", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    await adapter.writeAll("club-a", {}, undefined); // version 0 → 1
    const result = await adapter.writeAll("club-a", {}, 1); // version 1 → 2
    assert.equal(result.ok, true);
    assert.equal(result.version, 2);
  });

  it("idempotencia: isUsed / mark / getResult", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    const used = await adapter.isIdempotencyKeyUsed("club-a", "op:u1:u2");
    assert.equal(used, false);

    await adapter.markIdempotencyKey("club-a", "op:u1:u2", { postId: "p1" });
    const used2 = await adapter.isIdempotencyKeyUsed("club-a", "op:u1:u2");
    assert.equal(used2, true);

    const result = await adapter.getIdempotencyResult("club-a", "op:u1:u2");
    assert.deepEqual(result, { postId: "p1" });
  });

  it("idempotencia de club A no contamina club B", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    await adapter.markIdempotencyKey("club-a", "key1", { ok: true });
    const usedInB = await adapter.isIdempotencyKeyUsed("club-b", "key1");
    assert.equal(usedInB, false);
  });

  it("readAll de club A no devuelve datos de club B", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    await adapter.writeAll("club-a", { userProfiles: [{ id: "ua" }] }, undefined);
    await adapter.writeAll("club-b", { userProfiles: [{ id: "ub" }] }, undefined);

    const resA = await adapter.readAll("club-a");
    const resB = await adapter.readAll("club-b");
    assert.equal(resA.data.userProfiles[0].id, "ua");
    assert.equal(resB.data.userProfiles[0].id, "ub");
  });

  it("failAfterN: falla después de N operaciones", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0, failAfterN: 1 });
    const r1 = await adapter.readAll("club-a"); // op 1 → ok
    assert.equal(r1.ok, true);
    const r2 = await adapter.readAll("club-a"); // op 2 → falla
    assert.equal(r2.ok, false);
    assert.equal(r2.error.type, BACKEND_UNAVAILABLE);
  });

  it("__reset limpia todo el estado", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    await adapter.writeAll("club-a", { data: "x" }, undefined);
    await adapter.markIdempotencyKey("club-a", "k1", { r: 1 });
    adapter.__reset();

    const r = await adapter.readAll("club-a");
    assert.equal(r.version, 0);
    const used = await adapter.isIdempotencyKeyUsed("club-a", "k1");
    assert.equal(used, false);
  });
});

// ---------------------------------------------------------------------------
// validateBackendAdapter
// ---------------------------------------------------------------------------

describe("validateBackendAdapter", () => {
  it("devuelve valid=true para adapter completo", () => {
    const adapter = createFakeBackendAdapter();
    const { valid, missing } = validateBackendAdapter(adapter);
    assert.equal(valid, true);
    assert.equal(missing.length, 0);
  });

  it("devuelve valid=false con missing para adapter incompleto", () => {
    const { valid, missing } = validateBackendAdapter({ readAll: () => {} });
    assert.equal(valid, false);
    assert.ok(missing.includes("writeAll"));
    assert.ok(missing.includes("isIdempotencyKeyUsed"));
  });

  it("devuelve valid=false para null", () => {
    const { valid } = validateBackendAdapter(null);
    assert.equal(valid, false);
  });
});

// ---------------------------------------------------------------------------
// createBackendCommunityRepository — creación
// ---------------------------------------------------------------------------

describe("createBackendCommunityRepository — creación", () => {
  it("lanza si clubId está vacío", () => {
    const adapter = createFakeBackendAdapter();
    assert.throws(() => createBackendCommunityRepository("", adapter), /clubId/);
  });

  it("lanza si el adapter es incompleto", () => {
    assert.throws(
      () => createBackendCommunityRepository("club-a", {}),
      /adapter incompleto/
    );
  });

  it("crea el repo con todos los métodos del contrato", () => {
    const adapter = createFakeBackendAdapter();
    const repo = createBackendCommunityRepository("club-a", adapter);
    for (const method of COMMUNITY_BACKEND_REPOSITORY_CONTRACT) {
      assert.equal(typeof repo[method], "function", `falta método: ${method}`);
    }
  });

  it("getClubId es sync y devuelve el clubId correcto", () => {
    const adapter = createFakeBackendAdapter();
    const repo = createBackendCommunityRepository("club-test-123", adapter);
    assert.equal(repo.getClubId(), "club-test-123");
  });
});

// ---------------------------------------------------------------------------
// Operaciones básicas
// ---------------------------------------------------------------------------

describe("BackendCommunityRepository — operaciones básicas", () => {
  let adapter;
  let repo;

  beforeEach(() => {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    repo = createBackendCommunityRepository("club-a", adapter);
  });

  it("getStore devuelve store vacío para repo nuevo", async () => {
    const store = await repo.getStore();
    assert.ok(Array.isArray(store.userProfiles));
    assert.equal(store.userProfiles.length, 0);
    assert.ok(Array.isArray(store.posts));
  });

  it("reset deja el store vacío en el backend", async () => {
    // Primero escribe algo
    await adapter.writeAll("club-a", { userProfiles: [{ id: "u1" }] }, undefined);
    await repo.reset();
    const store = await repo.getStore();
    assert.equal(store.userProfiles.length, 0);
  });

  it("snapshot incluye _meta.clubId, version, source=backend", async () => {
    const snap = await repo.snapshot();
    assert.equal(snap._meta.clubId, "club-a");
    assert.equal(typeof snap._meta.version, "number");
    assert.equal(snap._meta.source, "backend");
    assert.ok(snap._meta.timestamp);
  });

  it("getVersion devuelve la versión actual del backend", async () => {
    const v0 = await repo.getVersion();
    assert.equal(v0, 0);
    await adapter.writeAll("club-a", {}, undefined); // version → 1
    const v1 = await repo.getVersion();
    assert.equal(v1, 1);
  });
});

// ---------------------------------------------------------------------------
// applyIfVersion — locking optimista
// ---------------------------------------------------------------------------

describe("BackendCommunityRepository — applyIfVersion", () => {
  let adapter;
  let repo;

  beforeEach(() => {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    repo = createBackendCommunityRepository("club-a", adapter);
  });

  it("aplica la mutación si la versión coincide", async () => {
    const result = await repo.applyIfVersion(0, (store) => {
      store.userProfiles = [{ id: "u1" }];
      return "mutation-result";
    });
    assert.equal(result.ok, true);
    assert.equal(result.result, "mutation-result");
    assert.equal(result.version, 1);
  });

  it("devuelve conflict si la versión no coincide", async () => {
    await adapter.writeAll("club-a", {}, undefined); // version → 1
    const result = await repo.applyIfVersion(0, (store) => {
      store.data = "no-debe-escribirse";
    });
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.CONFLICT);
  });

  it("no escribe si la mutationFn lanza", async () => {
    const result = await repo.applyIfVersion(0, () => {
      throw new Error("error en mutación");
    });
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.INTERNAL);
    // El store no debería haber cambiado
    const version = await repo.getVersion();
    assert.equal(version, 0);
  });

  it("devuelve error si expectedVersion no es número", async () => {
    const result = await repo.applyIfVersion("0", () => {});
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });
});

// ---------------------------------------------------------------------------
// restoreSnapshot — restauración
// ---------------------------------------------------------------------------

describe("BackendCommunityRepository — restoreSnapshot", () => {
  let adapter;
  let repoA;
  let repoB;

  beforeEach(() => {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    repoA = createBackendCommunityRepository("club-a", adapter);
    repoB = createBackendCommunityRepository("club-b", adapter);
  });

  it("restaura un snapshot válido del mismo tenant", async () => {
    // Simular snapshot de club-a
    const fakeSnap = {
      userProfiles: [{ id: "u1", displayName: "Ana" }],
      posts: [],
      _meta: { clubId: "club-a", version: 3, timestamp: new Date().toISOString() },
    };
    const result = await repoA.restoreSnapshot(fakeSnap);
    assert.equal(result.ok, true);
    assert.ok(result.version >= 1);

    const store = await repoA.getStore();
    assert.equal(store.userProfiles[0].displayName, "Ana");
  });

  it("rechaza snapshot de otro tenant", async () => {
    const fakeSnap = {
      _meta: { clubId: "club-x", version: 1, timestamp: new Date().toISOString() },
      userProfiles: [],
    };
    const result = await repoA.restoreSnapshot(fakeSnap);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.TENANT_MISMATCH);
  });

  it("rechaza snapshot sin _meta", async () => {
    const result = await repoA.restoreSnapshot({ userProfiles: [] });
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });

  it("rechaza snapshot null", async () => {
    const result = await repoA.restoreSnapshot(null);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.VALIDATION);
  });

  it("restaurar snapshot de club-a no afecta club-b", async () => {
    await adapter.writeAll("club-b", { userProfiles: [{ id: "ub1" }] }, undefined);

    const fakeSnapA = {
      userProfiles: [{ id: "ua1" }],
      _meta: { clubId: "club-a", version: 0, timestamp: new Date().toISOString() },
    };
    await repoA.restoreSnapshot(fakeSnapA);

    const storeB = await repoB.getStore();
    assert.equal(storeB.userProfiles[0].id, "ub1");
  });
});

// ---------------------------------------------------------------------------
// Idempotencia
// ---------------------------------------------------------------------------

describe("BackendCommunityRepository — idempotencia", () => {
  let adapter;
  let repo;

  beforeEach(() => {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    repo = createBackendCommunityRepository("club-a", adapter);
  });

  it("isIdempotencyKeyUsed devuelve false para clave nueva", async () => {
    const used = await repo.isIdempotencyKeyUsed("op:u1:u2");
    assert.equal(used, false);
  });

  it("markIdempotencyKey y getIdempotencyResult funcionan", async () => {
    await repo.markIdempotencyKey("op:u1:u2", { postId: "p1" });
    const used = await repo.isIdempotencyKeyUsed("op:u1:u2");
    assert.equal(used, true);
    const r = await repo.getIdempotencyResult("op:u1:u2");
    assert.deepEqual(r, { postId: "p1" });
  });

  it("getIdempotencyResult devuelve null para clave inexistente", async () => {
    const r = await repo.getIdempotencyResult("no-existe");
    assert.equal(r, null);
  });

  it("buildIdempotencyKey incluye clubId", () => {
    const key = repo.buildIdempotencyKey("follow", "u1", "u2");
    assert.equal(key, "club-a:follow:u1:u2");
  });

  it("buildIdempotencyKey lanza si falta parámetro", () => {
    assert.throws(() => repo.buildIdempotencyKey("", "u1", "u2"), /requeridos/);
    assert.throws(() => repo.buildIdempotencyKey("op", "", "u2"), /requeridos/);
    assert.throws(() => repo.buildIdempotencyKey("op", "u1", ""), /requeridos/);
  });
});

// ---------------------------------------------------------------------------
// Resiliencia — backend no disponible
// ---------------------------------------------------------------------------

describe("BackendCommunityRepository — resiliencia", () => {
  it("getStore lanza (error normalizado) si el backend falla", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0, failAfterN: 0 });
    const repo = createBackendCommunityRepository("club-a", adapter);
    await assert.rejects(async () => repo.getStore(), (err) => {
      assert.equal(err.type, BACKEND_UNAVAILABLE);
      return true;
    });
  });

  it("applyIfVersion propaga error de backend en readAll", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0, failAfterN: 0 });
    const repo = createBackendCommunityRepository("club-a", adapter);
    const result = await repo.applyIfVersion(0, (s) => s);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, BACKEND_UNAVAILABLE);
  });
});

// ---------------------------------------------------------------------------
// Aislamiento tenant — dos repos con el mismo adapter
// ---------------------------------------------------------------------------

describe("BackendCommunityRepository — aislamiento tenant", () => {
  it("club-a y club-b tienen stores completamente separados", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    const repoA = createBackendCommunityRepository("club-a", adapter);
    const repoB = createBackendCommunityRepository("club-b", adapter);

    await repoA.applyIfVersion(0, (s) => {
      s.userProfiles = [{ id: "ua1", displayName: "Club A User" }];
    });

    const storeA = await repoA.getStore();
    const storeB = await repoB.getStore();

    assert.equal(storeA.userProfiles.length, 1);
    assert.equal(storeB.userProfiles.length, 0);
  });

  it("idempotency keys de club-a no aparecen en club-b", async () => {
    const adapter = createFakeBackendAdapter({ latencyMs: 0 });
    const repoA = createBackendCommunityRepository("club-a", adapter);
    const repoB = createBackendCommunityRepository("club-b", adapter);

    await repoA.markIdempotencyKey("key-shared", { op: "done" });
    const usedInB = await repoB.isIdempotencyKeyUsed("key-shared");
    assert.equal(usedInB, false);
  });
});
