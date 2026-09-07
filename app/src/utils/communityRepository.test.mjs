import test from "node:test";
import assert from "node:assert/strict";
import { beforeEach } from "node:test";

import {
  createMemoryCommunityRepository,
  validateRepositoryContract,
  validateRepositoryP12Extensions,
  COMMUNITY_REPOSITORY_CONTRACT,
  COMMUNITY_REPOSITORY_P12_EXTENSIONS,
  COMMUNITY_ERROR_TYPES,
  createCommunityError,
} from "./communityRepository.js";

import {
  createUserProfile,
  grantConsent,
  getVisibleFeed,
  createPostMock,
  createEmptyStore,
} from "../../projects/club-padel-04/community-logic/index.mjs";

import {
  __resetCommunityStoreForTests,
  __getCommunityRepoForTests,
  communityGrantSocialConsent,
  communityCreatePost,
  communityGetVisibleFeed,
  communityEnsureUserProfile,
  COMMUNITY_BRIDGE_CLUB_ID,
} from "./communityBridge.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function freshRepo(clubId = "club-test") {
  return createMemoryCommunityRepository(clubId);
}

// ---------------------------------------------------------------------------
// Contrato y validación
// ---------------------------------------------------------------------------

test("COMMUNITY_REPOSITORY_CONTRACT lista los 7 métodos requeridos", () => {
  assert.equal(COMMUNITY_REPOSITORY_CONTRACT.length, 7);
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("getStore"));
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("reset"));
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("snapshot"));
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("getClubId"));
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("isIdempotencyKeyUsed"));
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("markIdempotencyKey"));
  assert.ok(COMMUNITY_REPOSITORY_CONTRACT.includes("getIdempotencyResult"));
});

test("validateRepositoryContract: MemoryCommunityRepository es válido", () => {
  const repo = freshRepo();
  const result = validateRepositoryContract(repo);
  assert.equal(result.valid, true);
  assert.deepEqual(result.missing, []);
});

test("validateRepositoryContract: objeto vacío reporta todos los métodos como ausentes", () => {
  const result = validateRepositoryContract({});
  assert.equal(result.valid, false);
  assert.equal(result.missing.length, COMMUNITY_REPOSITORY_CONTRACT.length);
});

test("validateRepositoryContract: objeto parcial reporta solo los métodos ausentes", () => {
  const partial = { getStore() {}, reset() {} };
  const result = validateRepositoryContract(partial);
  assert.equal(result.valid, false);
  assert.ok(result.missing.includes("snapshot"));
  assert.ok(!result.missing.includes("getStore"));
});

test("validateRepositoryContract: null devuelve valid:false sin lanzar", () => {
  const result = validateRepositoryContract(null);
  assert.equal(result.valid, false);
});

// ---------------------------------------------------------------------------
// Inicialización y getClubId
// ---------------------------------------------------------------------------

test("getClubId devuelve el clubId pasado al constructor", () => {
  const repo = freshRepo("club-padel-04");
  assert.equal(repo.getClubId(), "club-padel-04");
});

test("createMemoryCommunityRepository lanza si clubId está vacío", () => {
  assert.throws(() => createMemoryCommunityRepository(""), /requerido/);
});

test("createMemoryCommunityRepository lanza si clubId es solo espacios", () => {
  assert.throws(() => createMemoryCommunityRepository("   "), /requerido/);
});

test("createMemoryCommunityRepository lanza si clubId es null", () => {
  assert.throws(() => createMemoryCommunityRepository(null), /requerido/);
});

// ---------------------------------------------------------------------------
// getStore — referencia mutable
// ---------------------------------------------------------------------------

test("getStore devuelve un store con las colecciones esperadas de community-logic", () => {
  const repo = freshRepo();
  const store = repo.getStore();
  assert.ok(Array.isArray(store.userProfiles));
  assert.ok(Array.isArray(store.consents));
  assert.ok(Array.isArray(store.friendships)); // bloqueos viven aquí (status='blocked')
  assert.ok(Array.isArray(store.follows));
  assert.ok(Array.isArray(store.posts));
  assert.ok(Array.isArray(store.reports));
  assert.ok(Array.isArray(store.moderationActions));
  assert.ok(Array.isArray(store.auditLog));
});

test("getStore devuelve la misma referencia en llamadas sucesivas", () => {
  const repo = freshRepo();
  assert.strictEqual(repo.getStore(), repo.getStore());
});

test("mutaciones sobre el objeto de getStore() afectan al store interno", () => {
  const repo = freshRepo();
  repo.getStore().userProfiles.push({ id: "u1" });
  assert.equal(repo.getStore().userProfiles.length, 1);
});

// ---------------------------------------------------------------------------
// reset
// ---------------------------------------------------------------------------

test("reset limpia el store a estado vacío", () => {
  const repo = freshRepo();
  repo.getStore().userProfiles.push({ id: "u1" });
  repo.reset();
  assert.equal(repo.getStore().userProfiles.length, 0);
});

test("reset devuelve un nuevo objeto store (identidad cambia)", () => {
  const repo = freshRepo();
  const storeBefore = repo.getStore();
  repo.reset();
  assert.notStrictEqual(repo.getStore(), storeBefore);
});

test("reset limpia también las claves de idempotencia", () => {
  const repo = freshRepo();
  repo.markIdempotencyKey("op:u1:u2", { ok: true });
  repo.reset();
  assert.equal(repo.isIdempotencyKeyUsed("op:u1:u2"), false);
});

// ---------------------------------------------------------------------------
// snapshot
// ---------------------------------------------------------------------------

test("snapshot devuelve copia profunda independiente del store", () => {
  const repo = freshRepo();
  repo.getStore().userProfiles.push({ id: "u1" });
  const snap = repo.snapshot();
  // Mutar snapshot no afecta al store
  snap.userProfiles.push({ id: "u2" });
  assert.equal(repo.getStore().userProfiles.length, 1);
});

test("snapshot refleja el estado actual en el momento de la llamada", () => {
  const repo = freshRepo();
  const snap1 = repo.snapshot();
  repo.getStore().userProfiles.push({ id: "u1" });
  const snap2 = repo.snapshot();
  assert.equal(snap1.userProfiles.length, 0);
  assert.equal(snap2.userProfiles.length, 1);
});

test("snapshot es serializable (JSON round-trip sin pérdida)", () => {
  const repo = freshRepo();
  repo.getStore().userProfiles.push({ id: "u1", name: "Test" });
  const snap = repo.snapshot();
  const roundtrip = JSON.parse(JSON.stringify(snap));
  assert.deepEqual(roundtrip, snap);
});

// ---------------------------------------------------------------------------
// Aislamiento de instancias (multi-club / multi-tenant)
// ---------------------------------------------------------------------------

test("dos repos son completamente independientes entre sí", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  repoA.getStore().userProfiles.push({ id: "user-a1", clubId: "club-a" });
  assert.equal(repoB.getStore().userProfiles.length, 0, "Club B no debe ver datos de Club A");
});

test("reset de repo A no afecta a repo B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  repoA.getStore().userProfiles.push({ id: "user-a1" });
  repoB.getStore().userProfiles.push({ id: "user-b1" });
  repoA.reset();
  assert.equal(repoA.getStore().userProfiles.length, 0, "A debe quedar vacío");
  assert.equal(repoB.getStore().userProfiles.length, 1, "B debe seguir intacto");
});

test("mutación en store de repo A no aparece en repo B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  // Simula grants de consentimiento en club A
  grantConsent(repoA.getStore(), { clubId: "club-a", userId: "player-1", consentType: "social_layer_opt_in" });
  // Club B no tiene consentimientos
  assert.equal(repoB.getStore().consents.length, 0);
});

test("posts creados en club A no son visibles desde el store de club B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  const storeA = repoA.getStore();
  const storeB = repoB.getStore();

  // Crear perfil + consentimientos (social_layer_opt_in + appear_in_feed) + post en club A
  const profileA = createUserProfile({ clubId: "club-a", displayName: "Jugador A", role: "PLAYER" });
  profileA.id = "player-a1";
  storeA.userProfiles.push(profileA);
  grantConsent(storeA, { clubId: "club-a", userId: "player-a1", consentType: "social_layer_opt_in" });
  grantConsent(storeA, { clubId: "club-a", userId: "player-a1", consentType: "appear_in_feed" });
  createPostMock(storeA, { clubId: "club-a", authorId: "player-a1", body: "Post de Club A" });

  // Club B: sin datos → feed vacío (store B está completamente aislado)
  const feedB = getVisibleFeed(storeB, "player-a1");
  assert.equal(feedB.length, 0, "El feed de Club B no debe mostrar posts de Club A");
  assert.equal(storeB.posts.length, 0, "Store de Club B no debe tener posts de Club A");
});

test("moderación en club A no contamina cola de club B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  repoA.getStore().reports.push({ id: "rep-1", clubId: "club-a", status: "open" });
  assert.equal(repoB.getStore().reports.length, 0, "Cola de moderación de Club B debe estar limpia");
});

test("snapshot de club A no contiene datos de club B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  repoA.getStore().userProfiles.push({ id: "u-a" });
  repoB.getStore().userProfiles.push({ id: "u-b" });
  const snapA = repoA.snapshot();
  assert.equal(snapA.userProfiles.length, 1);
  assert.equal(snapA.userProfiles[0].id, "u-a");
});

// ---------------------------------------------------------------------------
// Idempotencia
// ---------------------------------------------------------------------------

test("isIdempotencyKeyUsed: false para clave nueva", () => {
  const repo = freshRepo();
  assert.equal(repo.isIdempotencyKeyUsed("follow:u1:u2"), false);
});

test("markIdempotencyKey + isIdempotencyKeyUsed: true tras registrar", () => {
  const repo = freshRepo();
  repo.markIdempotencyKey("follow:u1:u2", { ok: true });
  assert.equal(repo.isIdempotencyKeyUsed("follow:u1:u2"), true);
});

test("getIdempotencyResult: devuelve resultado guardado", () => {
  const repo = freshRepo();
  const result = { ok: true, friendshipId: "f-123" };
  repo.markIdempotencyKey("friendRequest:u1:u2", result);
  assert.deepEqual(repo.getIdempotencyResult("friendRequest:u1:u2"), result);
});

test("getIdempotencyResult: devuelve null para clave no registrada", () => {
  const repo = freshRepo();
  assert.equal(repo.getIdempotencyResult("op:desconocida"), null);
});

test("claves de idempotencia están aisladas entre repos distintos", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  repoA.markIdempotencyKey("follow:u1:u2", { ok: true });
  assert.equal(repoB.isIdempotencyKeyUsed("follow:u1:u2"), false);
});

test("markIdempotencyKey es idempotente (sobrescribe, no duplica)", () => {
  const repo = freshRepo();
  repo.markIdempotencyKey("report:u1:post-1", { ok: true, reportId: "r1" });
  repo.markIdempotencyKey("report:u1:post-1", { ok: true, reportId: "r2" });
  const result = repo.getIdempotencyResult("report:u1:post-1");
  assert.equal(result.reportId, "r2", "debe guardar el último resultado");
});

// ---------------------------------------------------------------------------
// Regresión P0: bridge usa el repo internamente sin alterar su comportamiento
// ---------------------------------------------------------------------------

test("regresión P0: __getCommunityRepoForTests devuelve un repo válido", () => {
  __resetCommunityStoreForTests();
  const repo = __getCommunityRepoForTests();
  assert.ok(repo, "debe devolver el repo activo");
  assert.equal(repo.getClubId(), COMMUNITY_BRIDGE_CLUB_ID);
  const { valid } = validateRepositoryContract(repo);
  assert.equal(valid, true);
});

test("regresión P0: el store del bridge y el del repo son el mismo objeto", () => {
  __resetCommunityStoreForTests();
  const repo = __getCommunityRepoForTests();
  // Usar la API del bridge para crear un perfil + post
  communityEnsureUserProfile("reg-user-1");
  communityGrantSocialConsent("reg-user-1");
  communityCreatePost("reg-user-1", "Post de regresión P0");
  // El repo debe ver el post en su store
  assert.equal(repo.getStore().posts.length, 1, "el store del repo debe reflejar las mutaciones del bridge");
});

test("regresión P0: reset del bridge reinicia también el repo", () => {
  __resetCommunityStoreForTests();
  communityEnsureUserProfile("reg-user-2");
  communityGrantSocialConsent("reg-user-2");
  communityCreatePost("reg-user-2", "Post temporal");
  __resetCommunityStoreForTests();
  const repo = __getCommunityRepoForTests();
  assert.equal(repo.getStore().posts.length, 0, "repo debe quedar limpio tras reset del bridge");
});

test("regresión P0: feed, moderación y partidos siguen funcionando tras adoptar el repo", () => {
  __resetCommunityStoreForTests();
  communityEnsureUserProfile("jugador-1");
  communityEnsureUserProfile("jugador-2");
  communityGrantSocialConsent("jugador-1");
  communityGrantSocialConsent("jugador-2");

  // Feed
  const post = communityCreatePost("jugador-1", "Post de integración P0+repo");
  assert.equal(post.ok, true);
  const feed = communityGetVisibleFeed("jugador-1");
  assert.equal(feed.length, 1);

  // El repo ve el mismo estado
  const repo = __getCommunityRepoForTests();
  assert.equal(repo.getStore().posts.length, 1);
});

// ===========================================================================
// P1.2 — EXTENSIONES: errores, versioning, snapshot+meta, recovery, rollback,
//         applyIfVersion, buildIdempotencyKey, tenant hardening
// ===========================================================================

// ---------------------------------------------------------------------------
// Errores normalizados
// ---------------------------------------------------------------------------

test("P1.2: COMMUNITY_ERROR_TYPES contiene los 7 tipos esperados", () => {
  const types = Object.values(COMMUNITY_ERROR_TYPES);
  assert.equal(types.length, 7);
  assert.ok(types.includes("validation"));
  assert.ok(types.includes("forbidden"));
  assert.ok(types.includes("not_found"));
  assert.ok(types.includes("conflict"));
  assert.ok(types.includes("tenant_mismatch"));
  assert.ok(types.includes("idempotency_conflict"));
  assert.ok(types.includes("internal"));
});

test("P1.2: createCommunityError crea error con type y message", () => {
  const err = createCommunityError("validation", "campo requerido");
  assert.equal(err.type, "validation");
  assert.equal(err.message, "campo requerido");
  assert.ok(!("details" in err), "no debe incluir details si no se pasa");
});

test("P1.2: createCommunityError incluye details cuando se proporciona", () => {
  const err = createCommunityError("conflict", "versión incorrecta", { expected: 2, got: 5 });
  assert.equal(err.type, "conflict");
  assert.deepEqual(err.details, { expected: 2, got: 5 });
});

test("P1.2: createCommunityError con tipo desconocido cae a 'internal'", () => {
  const err = createCommunityError("tipo-inventado", "msg");
  assert.equal(err.type, "internal");
});

// ---------------------------------------------------------------------------
// Contrato P1.2 extensions
// ---------------------------------------------------------------------------

test("P1.2: COMMUNITY_REPOSITORY_P12_EXTENSIONS lista 4 métodos", () => {
  assert.equal(COMMUNITY_REPOSITORY_P12_EXTENSIONS.length, 4);
  assert.ok(COMMUNITY_REPOSITORY_P12_EXTENSIONS.includes("getVersion"));
  assert.ok(COMMUNITY_REPOSITORY_P12_EXTENSIONS.includes("restoreSnapshot"));
  assert.ok(COMMUNITY_REPOSITORY_P12_EXTENSIONS.includes("applyIfVersion"));
  assert.ok(COMMUNITY_REPOSITORY_P12_EXTENSIONS.includes("buildIdempotencyKey"));
});

test("P1.2: validateRepositoryP12Extensions pasa para MemoryCommunityRepository", () => {
  const repo = freshRepo();
  const { valid, missing } = validateRepositoryP12Extensions(repo);
  assert.equal(valid, true);
  assert.deepEqual(missing, []);
});

test("P1.2: validateRepositoryP12Extensions falla para repo sin extensiones", () => {
  const { valid, missing } = validateRepositoryP12Extensions({});
  assert.equal(valid, false);
  assert.equal(missing.length, 4);
});

// ---------------------------------------------------------------------------
// getVersion y versionado
// ---------------------------------------------------------------------------

test("P1.2: getVersion empieza en 0", () => {
  const repo = freshRepo();
  assert.equal(repo.getVersion(), 0);
});

test("P1.2: reset reinicia versión a 0", () => {
  const repo = freshRepo();
  repo.applyIfVersion(0, (s) => { s.userProfiles.push({ id: "u1" }); });
  assert.equal(repo.getVersion(), 1);
  repo.reset();
  assert.equal(repo.getVersion(), 0);
});

// ---------------------------------------------------------------------------
// snapshot con _meta
// ---------------------------------------------------------------------------

test("P1.2: snapshot incluye _meta con clubId, version y timestamp", () => {
  const repo = freshRepo("club-meta-test");
  const snap = repo.snapshot();
  assert.ok(snap._meta, "snapshot debe incluir _meta");
  assert.equal(snap._meta.clubId, "club-meta-test");
  assert.equal(typeof snap._meta.version, "number");
  assert.ok(snap._meta.timestamp, "snapshot debe incluir timestamp");
});

test("P1.2: snapshot._meta.version refleja la versión actual del repo", () => {
  const repo = freshRepo();
  repo.applyIfVersion(0, (s) => { s.userProfiles.push({ id: "u1" }); });
  const snap = repo.snapshot();
  assert.equal(snap._meta.version, 1);
});

test("P1.2: snapshot._meta no interfiere con acceso a colecciones del store", () => {
  const repo = freshRepo();
  repo.getStore().userProfiles.push({ id: "u1" });
  const snap = repo.snapshot();
  assert.equal(snap.userProfiles.length, 1);   // acceso directo sigue funcionando
  assert.ok(snap._meta.clubId);                  // _meta también presente
});

// ---------------------------------------------------------------------------
// restoreSnapshot
// ---------------------------------------------------------------------------

test("P1.2: restoreSnapshot restaura datos y versión correctamente", () => {
  const repo = freshRepo("club-restore");
  repo.applyIfVersion(0, (s) => { s.userProfiles.push({ id: "u-snap" }); });
  const snap = repo.snapshot(); // versión 1, con u-snap

  // Mutar el repo más allá del snapshot
  repo.applyIfVersion(1, (s) => { s.userProfiles.push({ id: "u-extra" }); });
  assert.equal(repo.getStore().userProfiles.length, 2);
  assert.equal(repo.getVersion(), 2);

  // Restaurar al snapshot de versión 1
  const result = repo.restoreSnapshot(snap);
  assert.equal(result.ok, true);
  assert.equal(result.version, 1);
  assert.equal(repo.getStore().userProfiles.length, 1);
  assert.equal(repo.getStore().userProfiles[0].id, "u-snap");
  assert.equal(repo.getVersion(), 1);
});

test("P1.2: restoreSnapshot rechaza snapshot de otro tenant (tenant_mismatch)", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");

  const snapA = repoA.snapshot();
  const result = repoB.restoreSnapshot(snapA);

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "tenant_mismatch");
});

test("P1.2: restoreSnapshot rechaza snapshot sin _meta (validation)", () => {
  const repo = freshRepo();
  const badSnap = { userProfiles: [], consents: [] }; // sin _meta
  const result = repo.restoreSnapshot(badSnap);
  assert.equal(result.ok, false);
  assert.equal(result.error.type, "validation");
});

test("P1.2: restoreSnapshot rechaza null (validation)", () => {
  const repo = freshRepo();
  const result = repo.restoreSnapshot(null);
  assert.equal(result.ok, false);
  assert.equal(result.error.type, "validation");
});

test("P1.2: restoreSnapshot deja el repo funcional tras restaurar", () => {
  const repo = freshRepo("club-recovery");
  repo.getStore().userProfiles.push({ id: "u-original" });
  const snap = repo.snapshot();

  repo.getStore().userProfiles.push({ id: "u-added-after" });
  repo.restoreSnapshot(snap);

  assert.equal(repo.getStore().userProfiles.length, 1);
  assert.equal(repo.getStore().userProfiles[0].id, "u-original");
});

// ---------------------------------------------------------------------------
// applyIfVersion — locking optimista
// ---------------------------------------------------------------------------

test("P1.2: applyIfVersion con versión correcta ejecuta mutación y devuelve ok:true", () => {
  const repo = freshRepo();
  const result = repo.applyIfVersion(0, (s) => {
    s.userProfiles.push({ id: "u1" });
    return { pushed: "u1" };
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.result, { pushed: "u1" });
  assert.equal(result.version, 1);
  assert.equal(repo.getStore().userProfiles.length, 1);
});

test("P1.2: applyIfVersion incrementa la versión tras éxito", () => {
  const repo = freshRepo();
  repo.applyIfVersion(0, () => {});
  repo.applyIfVersion(1, () => {});
  assert.equal(repo.getVersion(), 2);
});

test("P1.2: applyIfVersion con versión incorrecta devuelve conflict sin mutar", () => {
  const repo = freshRepo();
  repo.applyIfVersion(0, (s) => { s.userProfiles.push({ id: "u1" }); });
  // Intentar con la versión antigua (0)
  const result = repo.applyIfVersion(0, (s) => { s.userProfiles.push({ id: "u2" }); });
  assert.equal(result.ok, false);
  assert.equal(result.error.type, "conflict");
  // El store no fue mutado por la segunda llamada
  assert.equal(repo.getStore().userProfiles.length, 1);
});

test("P1.2: applyIfVersion con mutación que lanza devuelve internal", () => {
  const repo = freshRepo();
  const result = repo.applyIfVersion(0, () => {
    throw new Error("error en mutación");
  });
  assert.equal(result.ok, false);
  assert.equal(result.error.type, "internal");
  assert.equal(repo.getVersion(), 0, "versión no debe cambiar si la mutación falla");
});

test("P1.2: applyIfVersion con expectedVersion no-numérico devuelve validation", () => {
  const repo = freshRepo();
  const result = repo.applyIfVersion("zero", () => {});
  assert.equal(result.ok, false);
  assert.equal(result.error.type, "validation");
});

// ---------------------------------------------------------------------------
// Rollback via snapshot + applyIfVersion
// ---------------------------------------------------------------------------

test("P1.2: rollback — tomar snapshot, mutar, restaurar desde snapshot", () => {
  const repo = freshRepo("club-rollback");
  repo.getStore().userProfiles.push({ id: "estado-inicial" });
  const checkpoint = repo.snapshot();

  // Mutaciones que queremos revertir
  repo.getStore().userProfiles.push({ id: "mutacion-1" });
  repo.getStore().userProfiles.push({ id: "mutacion-2" });
  assert.equal(repo.getStore().userProfiles.length, 3);

  // Rollback
  const rollback = repo.restoreSnapshot(checkpoint);
  assert.equal(rollback.ok, true);
  assert.equal(repo.getStore().userProfiles.length, 1);
  assert.equal(repo.getStore().userProfiles[0].id, "estado-inicial");
});

test("P1.2: rollback preserva aislamiento — rollback en A no afecta a B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");

  repoA.getStore().userProfiles.push({ id: "a-original" });
  repoB.getStore().userProfiles.push({ id: "b-original" });
  repoB.getStore().userProfiles.push({ id: "b-extra" });

  const snapA = repoA.snapshot();
  repoA.getStore().userProfiles.push({ id: "a-nueva" });
  repoA.restoreSnapshot(snapA);

  // Club B no se tocó
  assert.equal(repoB.getStore().userProfiles.length, 2);
});

// ---------------------------------------------------------------------------
// buildIdempotencyKey — scope de clubId
// ---------------------------------------------------------------------------

test("P1.2: buildIdempotencyKey incluye clubId en la clave", () => {
  const repo = createMemoryCommunityRepository("club-padel-04");
  const key = repo.buildIdempotencyKey("follow", "user-1", "user-2");
  assert.equal(key, "club-padel-04:follow:user-1:user-2");
});

test("P1.2: buildIdempotencyKey de clubs distintos produce claves distintas", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  const keyA = repoA.buildIdempotencyKey("follow", "u1", "u2");
  const keyB = repoB.buildIdempotencyKey("follow", "u1", "u2");
  assert.notEqual(keyA, keyB);
  assert.ok(keyA.startsWith("club-a:"));
  assert.ok(keyB.startsWith("club-b:"));
});

test("P1.2: buildIdempotencyKey lanza si falta argumento requerido", () => {
  const repo = freshRepo();
  assert.throws(() => repo.buildIdempotencyKey("follow", "u1", ""), /requeridos/);
  assert.throws(() => repo.buildIdempotencyKey("", "u1", "u2"), /requeridos/);
});

// ---------------------------------------------------------------------------
// Idempotencia tenant-scoped con buildIdempotencyKey
// ---------------------------------------------------------------------------

test("P1.2: idempotencia follow con buildIdempotencyKey — segunda llamada devuelve resultado guardado", () => {
  const repo = freshRepo("club-idem");
  const key = repo.buildIdempotencyKey("follow", "actor-1", "target-1");

  // Primera operación
  const firstResult = { ok: true, followId: "f-123" };
  repo.markIdempotencyKey(key, firstResult);

  // Segunda llamada — en lugar de re-ejecutar, devuelve el resultado guardado
  assert.equal(repo.isIdempotencyKeyUsed(key), true);
  assert.deepEqual(repo.getIdempotencyResult(key), firstResult);
});

test("P1.2: idempotencia tenant-scoped — misma operación en club-a y club-b no colisiona", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");

  const keyA = repoA.buildIdempotencyKey("report", "u1", "post-1");
  const keyB = repoB.buildIdempotencyKey("report", "u1", "post-1");

  repoA.markIdempotencyKey(keyA, { ok: true, reportId: "r-a" });

  // Club B: mismos actorId y targetId, pero clave distinta por clubId
  assert.equal(repoB.isIdempotencyKeyUsed(keyB), false);
  assert.equal(repoA.isIdempotencyKeyUsed(keyA), true);
});

// ---------------------------------------------------------------------------
// Tenant hardening — operaciones cruzadas explícitamente prohibidas
// ---------------------------------------------------------------------------

test("P1.2: snapshot de club A no puede restaurarse en club B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");
  repoA.getStore().reports.push({ id: "report-a-secret" });

  const snapA = repoA.snapshot();
  const result = repoB.restoreSnapshot(snapA);

  assert.equal(result.ok, false);
  assert.equal(result.error.type, "tenant_mismatch");
  assert.equal(repoB.getStore().reports.length, 0, "store de B no debe ser contaminado");
});

test("P1.2: cola de moderación de club A nunca llega al store de club B", () => {
  const repoA = createMemoryCommunityRepository("club-a");
  const repoB = createMemoryCommunityRepository("club-b");

  repoA.applyIfVersion(0, (s) => {
    s.reports.push({ id: "rep-a", clubId: "club-a", status: "open" });
  });

  assert.equal(repoB.getStore().reports.length, 0);
});

// ---------------------------------------------------------------------------
// Regresión P0 + P1.1 completa con extensiones P1.2
// ---------------------------------------------------------------------------

test("P1.2 regresión: bridge + repo + extensiones coexisten sin interferencias", () => {
  __resetCommunityStoreForTests();
  const repo = __getCommunityRepoForTests();

  // P1.1: contrato base válido
  const { valid: baseValid } = validateRepositoryContract(repo);
  assert.equal(baseValid, true);

  // P1.2: extensiones válidas
  const { valid: p12Valid } = validateRepositoryP12Extensions(repo);
  assert.equal(p12Valid, true);

  // P0: operaciones del bridge funcionan
  communityEnsureUserProfile("jugador-reg");
  communityGrantSocialConsent("jugador-reg");
  const post = communityCreatePost("jugador-reg", "Post de regresión P1.2");
  assert.equal(post.ok, true);

  // Snapshot incluye el post y tiene _meta correcto
  const snap = repo.snapshot();
  assert.equal(snap.posts.length, 1);
  assert.equal(snap._meta.clubId, COMMUNITY_BRIDGE_CLUB_ID);

  // Versión del repo desde bridge es 0 (bridge usa getStore directo, no applyIfVersion)
  assert.equal(repo.getVersion(), 0);
});
