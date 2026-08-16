// Tests E2E contractuales — Comunidad Club Pádel 04, P1.4
//
// Simula el flujo completo de dos usuarios en el mismo club y un
// usuario en otro club. Usa BackendCommunityRepository + FakeBackendAdapter
// para probar todos los aspectos de P1.4 sin datos reales ni backend remoto.
//
// Ejecutar: node --test src/utils/communityE2E.test.mjs

import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  createFakeBackendAdapter,
  createBackendCommunityRepository,
} from "./communityBackendRepository.js";

import {
  createMemoryCommunityRepository,
  COMMUNITY_ERROR_TYPES,
} from "./communityRepository.js";

import {
  migrateMemoryToBackend,
} from "./communityMigration.js";

import {
  AGE_STATUS,
  isCommunityAllowed,
} from "./communityAgePolicy.js";

import {
  createEmptyStore,
  createUserProfile,
  grantConsent,
  sendFriendRequest,
  acceptFriendRequest,
  followUser,
  createPostMock,
  getPaginatedFeed,
  getVisibleFeed,
  commentOnPost,
  reactTo,
  createOpenMatchMock,
  requestToJoin,
  acceptJoinRequest,
  reportContent,
  markInReview,
  applyModerationAction,
  listNotifications,
  getUnreadCount,
  markNotificationRead,
} from "../../projects/club-padel-04/community-logic/index.mjs";

// ---------------------------------------------------------------------------
// Fixtures E2E
// ---------------------------------------------------------------------------

// Usuarios ficticios etiquetados TEST — nunca son datos reales
const ADULT_A = { id: "e2e-adult-a", name: "E2E Adult A" };
const ADULT_B = { id: "e2e-adult-b", name: "E2E Adult B" };
const ADULT_C_CLUB_B = { id: "e2e-adult-c", name: "E2E Adult C (Club B)" };
const MINOR_LIKE = { id: "e2e-age-unknown", name: "E2E Age Unknown" };

const CLUB_A = "e2e-club-alpha";
const CLUB_B = "e2e-club-beta";

const CONSENT_TYPE = "social_layer_opt_in";

// ---------------------------------------------------------------------------
// E2E Suite — Backend con FakeAdapter
// ---------------------------------------------------------------------------

describe("E2E Contractual — BackendCommunityRepository", () => {
  let adapter;
  let repoA;
  let repoB;
  let storeA;
  let storeB;

  // Inicializa el adapter y repos antes de cada test de E2E
  async function setupStores() {
    adapter = createFakeBackendAdapter({ latencyMs: 0 });
    repoA = createBackendCommunityRepository(CLUB_A, adapter);
    repoB = createBackendCommunityRepository(CLUB_B, adapter);

    // Preparar stores vacíos en el backend
    await repoA.reset();
    await repoB.reset();

    storeA = await repoA.getStore();
    storeB = await repoB.getStore();

    // Perfiles en club A
    const profA = createUserProfile({ clubId: CLUB_A, displayName: ADULT_A.name, role: "PLAYER" });
    profA.id = ADULT_A.id;
    storeA.userProfiles.push(profA);

    const profB = createUserProfile({ clubId: CLUB_A, displayName: ADULT_B.name, role: "PLAYER" });
    profB.id = ADULT_B.id;
    storeA.userProfiles.push(profB);

    // Perfil en club B
    const profC = createUserProfile({ clubId: CLUB_B, displayName: ADULT_C_CLUB_B.name, role: "PLAYER" });
    profC.id = ADULT_C_CLUB_B.id;
    storeB.userProfiles.push(profC);

    // Persistir los stores en el backend
    const vA = await repoA.getVersion();
    await adapter.writeAll(CLUB_A, storeA, vA);

    const vB = await repoB.getVersion();
    await adapter.writeAll(CLUB_B, storeB, vB);
  }

  // ---------------------------------------------------------------------------
  // 1. Age gate
  // ---------------------------------------------------------------------------

  describe("Age gate", () => {
    it("ADULT_VERIFIED permite acceso a la capa social", () => {
      const { allowed } = isCommunityAllowed(AGE_STATUS.ADULT_VERIFIED);
      assert.equal(allowed, true);
    });

    it("AGE_UNKNOWN bloquea acceso a la capa social", () => {
      const { allowed } = isCommunityAllowed(AGE_STATUS.AGE_UNKNOWN);
      assert.equal(allowed, false);
    });

    it("MINOR_OR_BELOW_POLICY bloquea acceso a la capa social", () => {
      const { allowed } = isCommunityAllowed(AGE_STATUS.MINOR_OR_BELOW_POLICY);
      assert.equal(allowed, false);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Consentimiento
  // ---------------------------------------------------------------------------

  describe("Consentimiento → persistencia backend", () => {
    it("consentimiento se persiste y recupera del backend", async () => {
      await setupStores();

      storeA = await repoA.getStore();
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      // Simular "reload" leyendo de nuevo desde el backend
      const storeAfterReload = await repoA.getStore();
      const consent = storeAfterReload.consents.find(
        (c) => c.userId === ADULT_A.id && c.consentType === CONSENT_TYPE
      );
      assert.ok(consent, "Consentimiento no encontrado tras reload");
      assert.equal(consent.granted, true);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Post → Feed → Feed paginado
  // ---------------------------------------------------------------------------

  describe("Post y Feed paginado", () => {
    it("post publicado por A visible en feed de B (amigos) — backend aware", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      // Grant consents
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: "appear_in_feed" });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      // Amistad A↔B
      const req = sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });
      acceptFriendRequest(storeA, { friendshipId: req.id, actingUserId: ADULT_B.id });

      // Post de A (visibility=friends)
      const post = createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "post e2e", visibility: "friends" });

      // Feed paginado para B
      const page = getPaginatedFeed(storeA, ADULT_B.id, { cursor: null, limit: 10, getVisibleFeed });
      assert.equal(page.ok, true);
      assert.equal(page.items.length, 1);
      assert.equal(page.items[0].id, post.id);

      // Persistir y verificar cursor estable
      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const storeReloaded = await repoA.getStore();
      const page2 = getPaginatedFeed(storeReloaded, ADULT_B.id, { cursor: null, limit: 10, getVisibleFeed });
      assert.equal(page2.items.length, 1);
      assert.equal(page2.items[0].id, post.id);
    });

    it("cursor de feed no produce duplicados al añadir posts nuevos", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: "appear_in_feed" });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      const req = sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });
      acceptFriendRequest(storeA, { friendshipId: req.id, actingUserId: ADULT_B.id });

      // 3 posts de A
      const p1 = createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "post 1", visibility: "friends" });
      const p2 = createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "post 2", visibility: "friends" });
      createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "post 3", visibility: "friends" });

      // Página 1: últimos 2 posts
      const page1 = getPaginatedFeed(storeA, ADULT_B.id, { cursor: null, limit: 2, getVisibleFeed });
      assert.equal(page1.items.length, 2);

      // Página 2: usando el cursor de la página 1
      const page2 = getPaginatedFeed(storeA, ADULT_B.id, { cursor: page1.nextCursor, limit: 2, getVisibleFeed });
      assert.equal(page2.items.length, 1);

      // Sin duplicados
      const ids1 = page1.items.map((p) => p.id);
      const ids2 = page2.items.map((p) => p.id);
      const intersection = ids1.filter((id) => ids2.includes(id));
      assert.equal(intersection.length, 0, "Hay duplicados entre páginas");
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Follow y amistad
  // ---------------------------------------------------------------------------

  describe("Follow y amistad", () => {
    it("A sigue a B → follower count correcto", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      // Perfiles sociales necesarios para followUser
      storeA.playerSocialProfiles.push({
        id: "psp-b",
        clubId: CLUB_A,
        userProfileId: ADULT_B.id,
        visibilityLevel: "friends",
      });

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      followUser(storeA, { clubId: CLUB_A, followerId: ADULT_A.id, followedId: ADULT_B.id });

      assert.equal(
        storeA.follows.filter((f) => f.followedId === ADULT_B.id).length,
        1
      );
    });

    it("amistad aceptada persiste en backend y es recuperable", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      const req = sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });
      acceptFriendRequest(storeA, { friendshipId: req.id, actingUserId: ADULT_B.id });

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const reloaded = await repoA.getStore();
      const friendship = reloaded.friendships.find((f) => f.id === req.id);
      assert.ok(friendship, "Amistad no encontrada tras reload");
      assert.equal(friendship.status, "accepted");
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Comentario y reacción
  // ---------------------------------------------------------------------------

  describe("Comentario y reacción", () => {
    it("comentario y reacción persisten en backend", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: "appear_in_feed" });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      const req = sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });
      acceptFriendRequest(storeA, { friendshipId: req.id, actingUserId: ADULT_B.id });

      const post = createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "test post", visibility: "friends" });
      const comment = commentOnPost(storeA, { clubId: CLUB_A, postId: post.id, authorId: ADULT_B.id, body: "buen post" });
      const reaction = reactTo(storeA, { clubId: CLUB_A, targetType: "post", targetId: post.id, userId: ADULT_B.id });

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const reloaded = await repoA.getStore();
      assert.ok(reloaded.comments.find((c) => c.id === comment.id), "Comentario no encontrado");
      assert.ok(reloaded.reactions.find((r) => r.id === reaction.id), "Reacción no encontrada");
    });
  });

  // ---------------------------------------------------------------------------
  // 6. Partido abierto y solicitud de plaza
  // ---------------------------------------------------------------------------

  describe("Partido abierto y solicitud", () => {
    it("A crea partido → B solicita plaza → A acepta → persiste en backend", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: "activity_sharing" });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: "activity_sharing" });

      storeA.playerSocialProfiles.push({
        id: "psp-a", clubId: CLUB_A, userProfileId: ADULT_A.id,
        visibilityLevel: "friends", levelDeclared: "intermedio",
      });
      storeA.playerSocialProfiles.push({
        id: "psp-b2", clubId: CLUB_A, userProfileId: ADULT_B.id,
        visibilityLevel: "friends", levelDeclared: "intermedio",
      });

      const req2 = sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });
      acceptFriendRequest(storeA, { friendshipId: req2.id, actingUserId: ADULT_B.id });

      const match = createOpenMatchMock(storeA, {
        clubId: CLUB_A, creatorId: ADULT_A.id,
        levelMin: "intermedio", levelMax: "avanzado",
        scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        slotsTotal: 4, visibility: "friends",
      });

      const invite = requestToJoin(storeA, { clubId: CLUB_A, openMatchId: match.id, requesterId: ADULT_B.id });
      acceptJoinRequest(storeA, { inviteId: invite.id, actingUserId: ADULT_A.id });

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const reloaded = await repoA.getStore();
      const inv = reloaded.matchInvites.find((i) => i.id === invite.id);
      assert.ok(inv, "Invitación no encontrada");
      assert.equal(inv.status, "accepted");
    });
  });

  // ---------------------------------------------------------------------------
  // 7. Notificaciones persistentes y unread
  // ---------------------------------------------------------------------------

  describe("Notificaciones persistentes", () => {
    it("notificaciones persisten en backend y unread count es correcto", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      // Generar notificación vía friend request
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });

      const unreadBefore = getUnreadCount(storeA, ADULT_B.id, CLUB_A);
      assert.ok(unreadBefore >= 1, "Debe haber al menos 1 notificación no leída");

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const reloaded = await repoA.getStore();
      const unreadAfter = getUnreadCount(reloaded, ADULT_B.id, CLUB_A);
      assert.equal(unreadAfter, unreadBefore);
    });

    it("markNotificationRead persiste el read_at en backend", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });

      const notifications = listNotifications(storeA, { userId: ADULT_B.id, clubId: CLUB_A, limit: 10 });
      assert.ok(notifications.length >= 1);

      markNotificationRead(storeA, notifications[0].id, ADULT_B.id);

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const reloaded = await repoA.getStore();
      const n = reloaded.notifications.find((n) => n.id === notifications[0].id);
      assert.ok(n?.readAt, "readAt no fue persistido");
    });
  });

  // ---------------------------------------------------------------------------
  // 8. Moderación
  // ---------------------------------------------------------------------------

  describe("Moderación", () => {
    it("reporte → in_review → acción de moderación → persiste", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      // Moderador
      const mod = createUserProfile({ clubId: CLUB_A, displayName: "Mod Staff", role: "STAFF" });
      mod.id = "e2e-mod-staff";
      storeA.userProfiles.push(mod);

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: "appear_in_feed" });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_B.id, consentType: CONSENT_TYPE });

      const req = sendFriendRequest(storeA, { clubId: CLUB_A, requesterId: ADULT_A.id, addresseeId: ADULT_B.id });
      acceptFriendRequest(storeA, { friendshipId: req.id, actingUserId: ADULT_B.id });

      const post = createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "contenido reportable", visibility: "friends" });

      // Conceder consent a B para poder reportar
      const report = reportContent(storeA, {
        clubId: CLUB_A, reporterId: ADULT_B.id,
        targetType: "post", targetId: post.id, reason: "spam",
      });

      markInReview(storeA, { reportId: report.id, moderatorId: mod.id });

      const action = applyModerationAction(storeA, {
        clubId: CLUB_A, reportId: report.id,
        moderatorId: mod.id, actionType: "warning", notes: "aviso e2e",
      });

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      const reloaded = await repoA.getStore();
      const r = reloaded.reports.find((r) => r.id === report.id);
      assert.ok(r, "Reporte no encontrado");
      assert.equal(r.status, "resolved");

      const a = reloaded.moderationActions.find((a) => a.id === action.id);
      assert.ok(a, "Acción de moderación no encontrada");
      assert.equal(a.actionType, "warning");
    });
  });

  // ---------------------------------------------------------------------------
  // 9. Aislamiento entre clubs
  // ---------------------------------------------------------------------------

  describe("Aislamiento tenant (Club A vs Club B)", () => {
    it("datos de Club A no son visibles en el store de Club B", async () => {
      await setupStores();
      storeA = await repoA.getStore();

      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: CONSENT_TYPE });
      grantConsent(storeA, { clubId: CLUB_A, userId: ADULT_A.id, consentType: "appear_in_feed" });

      createPostMock(storeA, { clubId: CLUB_A, authorId: ADULT_A.id, body: "post de club A", visibility: "club" });

      const ver = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, storeA, ver);

      // Club B no tiene posts
      const storeBFresh = await repoB.getStore();
      assert.equal(storeBFresh.posts.length, 0, "Club B no debería ver posts de Club A");
    });

    it("usuario C de Club B no puede acceder a datos de Club A", async () => {
      await setupStores();

      // Intentar restaurar un snapshot de Club A en el repo de Club B
      storeA = await repoA.getStore();
      const snapA = await repoA.snapshot();
      const result = await repoB.restoreSnapshot(snapA);
      assert.equal(result.ok, false);
      assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.TENANT_MISMATCH);
    });

    it("idempotency keys de Club A no existen en Club B", async () => {
      await setupStores();
      await repoA.markIdempotencyKey("post:u1:p1", { postId: "p1" });
      const usedInB = await repoB.isIdempotencyKeyUsed("post:u1:p1");
      assert.equal(usedInB, false);
    });
  });

  // ---------------------------------------------------------------------------
  // 10. Idempotencia end-to-end
  // ---------------------------------------------------------------------------

  describe("Idempotencia", () => {
    it("operación repetida con misma clave devuelve resultado guardado", async () => {
      await setupStores();

      const key = repoA.buildIdempotencyKey("post", ADULT_A.id, "target-1");
      const originalResult = { postId: "p-idem-1" };

      const alreadyUsed = await repoA.isIdempotencyKeyUsed(key);
      assert.equal(alreadyUsed, false);

      await repoA.markIdempotencyKey(key, originalResult);

      const usedNow = await repoA.isIdempotencyKeyUsed(key);
      assert.equal(usedNow, true);

      const retrieved = await repoA.getIdempotencyResult(key);
      assert.deepEqual(retrieved, originalResult);
    });

    it("clave de idempotencia incluye clubId — distintos clubs, misma operación", async () => {
      await setupStores();

      const keyA = repoA.buildIdempotencyKey("post", ADULT_A.id, "target-1");
      const keyB = repoB.buildIdempotencyKey("post", ADULT_A.id, "target-1");

      assert.notEqual(keyA, keyB);
      assert.ok(keyA.startsWith(CLUB_A));
      assert.ok(keyB.startsWith(CLUB_B));
    });
  });

  // ---------------------------------------------------------------------------
  // 11. Versionado / conflict handling
  // ---------------------------------------------------------------------------

  describe("Versionado y conflicto", () => {
    it("applyIfVersion detecta conflicto si versión cambió entre lectura y escritura", async () => {
      await setupStores();

      // Escritura concurrente fuera del repo (simula race condition)
      const currentVer = await repoA.getVersion();
      await adapter.writeAll(CLUB_A, { posts: [{ id: "race-post" }] }, currentVer); // versión ahora +1

      // applyIfVersion con la versión anterior debe detectar conflicto
      const result = await repoA.applyIfVersion(currentVer, (s) => {
        s.posts.push({ id: "conflicting-post" });
      });

      assert.equal(result.ok, false);
      assert.equal(result.error.type, COMMUNITY_ERROR_TYPES.CONFLICT);
    });
  });

  // ---------------------------------------------------------------------------
  // 12. Migración Memory → Backend
  // ---------------------------------------------------------------------------

  describe("Migración Memory → Backend", () => {
    it("snapshot de MemoryRepo migra correctamente al BackendRepo", async () => {
      await setupStores();

      // Construir un memory repo con datos ficticios
      const memRepo = createMemoryCommunityRepository(CLUB_A);
      const memStore = memRepo.getStore();
      memStore.userProfiles.push({ id: "migrated-u1", clubId: CLUB_A, displayName: "Migrated User" });
      memStore.posts.push({ id: "migrated-p1", clubId: CLUB_A, authorId: "migrated-u1", body: "migrated post" });
      const snap = memRepo.snapshot();

      // Dry run primero
      const dryResult = await migrateMemoryToBackend({ snapshot: snap, backendRepo: repoA });
      assert.equal(dryResult.ok, true);
      assert.equal(dryResult.dryRun, true);
      assert.equal(dryResult.summary.totalEntities, 2);

      // Migración real
      const realResult = await migrateMemoryToBackend({
        snapshot: snap,
        backendRepo: repoA,
        dryRun: false,
      });
      assert.equal(realResult.ok, true);
      assert.equal(realResult.dryRun, false);
      assert.ok(realResult.summary.backendVersion >= 1);

      const migratedStore = await repoA.getStore();
      assert.ok(
        migratedStore.userProfiles.find((u) => u.id === "migrated-u1"),
        "Usuario migrado no encontrado en backend"
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 13. Resiliencia — backend no disponible
  // ---------------------------------------------------------------------------

  describe("Resiliencia — backend no disponible", () => {
    it("getStore lanza error normalizado si el backend cae", async () => {
      const failingAdapter = createFakeBackendAdapter({ latencyMs: 0, failAfterN: 0 });
      const failingRepo = createBackendCommunityRepository(CLUB_A, failingAdapter);

      await assert.rejects(
        async () => failingRepo.getStore(),
        (err) => {
          assert.equal(err.type, "backend_unavailable");
          return true;
        }
      );
    });

    it("applyIfVersion devuelve error en vez de fingir éxito si el backend cae", async () => {
      const failingAdapter = createFakeBackendAdapter({ latencyMs: 0, failAfterN: 0 });
      const failingRepo = createBackendCommunityRepository(CLUB_A, failingAdapter);

      const result = await failingRepo.applyIfVersion(0, (s) => {
        s.posts.push({ id: "fake-post" });
      });

      assert.equal(result.ok, false);
      assert.ok(result.error, "Debe haber un error normalizado");
    });
  });

  // ---------------------------------------------------------------------------
  // 14. Perfil con age_unknown — bloqueado en dominio
  // ---------------------------------------------------------------------------

  describe("Perfil age_unknown — gate activo", () => {
    it("isCommunityAllowed bloquea AGE_UNKNOWN correctamente", () => {
      const { allowed, reason } = isCommunityAllowed(AGE_STATUS.AGE_UNKNOWN);
      assert.equal(allowed, false);
      assert.ok(reason && reason.length > 0, "Debe haber un mensaje de razón");
    });

    it("AGE_UNKNOWN y MINOR_OR_BELOW_POLICY → operaciones sociales rechazadas por el bridge/dominio", () => {
      // El bridge comprueba el age gate antes de cualquier operación social.
      // Este test verifica que isCommunityAllowed responde correctamente.
      const statuses = [AGE_STATUS.AGE_UNKNOWN, AGE_STATUS.MINOR_OR_BELOW_POLICY, AGE_STATUS.VERIFICATION_PENDING];
      for (const status of statuses) {
        const { allowed } = isCommunityAllowed(status);
        assert.equal(allowed, false, `${status} debería estar bloqueado`);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// E2E — Datos reales confirmados como no usados
// ---------------------------------------------------------------------------

describe("E2E — Garantías de seguridad de datos", () => {
  it("ningún ID de usuario es un email o dato real", () => {
    const ids = [ADULT_A.id, ADULT_B.id, ADULT_C_CLUB_B.id, MINOR_LIKE.id];
    for (const id of ids) {
      assert.ok(!id.includes("@"), `ID contiene '@': ${id}`);
      assert.ok(!id.includes(".com"), `ID parece email: ${id}`);
      assert.ok(id.startsWith("e2e-"), `ID no etiquetado como e2e: ${id}`);
    }
  });

  it("ningún club ID es un recurso de producción real", () => {
    for (const club of [CLUB_A, CLUB_B]) {
      assert.ok(club.startsWith("e2e-"), `Club ID no etiquetado como e2e: ${club}`);
    }
  });
});
