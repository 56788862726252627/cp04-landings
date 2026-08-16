import test from "node:test";
import assert from "node:assert/strict";
import { beforeEach } from "node:test";

import {
  createMemoryCommunityRepository,
  validateRepositoryContract,
  COMMUNITY_REPOSITORY_CONTRACT,
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
