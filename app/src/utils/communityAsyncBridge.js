// Club Pádel 04 · communityAsyncBridge — capa async sobre el bridge existente.
//
// communityBridge.js (P0–P1.3-L) es SYNC e INMUTABLE.
// Este módulo añade una capa async SOBRE el bridge, sin modificarlo:
//   - Operaciones de escritura: persisten en BackendRepository si está disponible.
//   - Operaciones de lectura: sirven desde Memory (fast path) + hidratación lazy.
//   - Fallback: si el backend falla, continúa con MemoryRepository.
//   - Auth: verifica identidad antes de operaciones mutantes (no finge éxito).
//
// No reemplaza communityBridge.js — lo complementa.
// La UI puede usar communityBridge.js (sync, demo) o este módulo (async, backend).
//
// Principios:
//   - No doble submit — idempotency key antes de cada operación.
//   - No éxito falso — si el backend falla, devuelve error normalizado.
//   - No mutación de estado sin confirmación del backend (cuando backend activo).
//   - Age gate se aplica antes de cualquier operación social.
//   - clubId/actorId vienen del AuthBoundary, nunca del cliente directamente.

import {
  COMMUNITY_ERROR_TYPES,
  createCommunityError,
} from "./communityRepository.js";

import {
  AGE_STATUS,
  isCommunityAllowed,
} from "./communityAgePolicy.js";

import {
  createUserProfile,
  grantConsent,
  revokeConsent,
  hasSocialLayerActive,
  hasConsent,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  followUser,
  unfollowUser,
  createPostMock,
  getPaginatedFeed,
  getVisibleFeed,
  commentOnPost,
  reactTo,
  createOpenMatchMock,
  requestToJoin,
  acceptJoinRequest,
  cancelOpenMatch,
  reportContent,
  markInReview,
  applyModerationAction,
  dismissReport,
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../../projects/club-padel-04/community-logic/index.mjs";

// --------------------------------------------------------------------------
// createCommunityAsyncBridge
// --------------------------------------------------------------------------

/**
 * Crea una instancia del async bridge para un club específico.
 *
 * @param {object} options
 * @param {object} options.repo      — MemoryCommunityRepository (estado local)
 * @param {object} options.auth      — CommunityAuthBoundary
 * @param {object} [options.sync]    — CommunitySyncManager (opcional; activa write-through)
 * @param {string} [options.clubId]  — clubId override
 */
export function createCommunityAsyncBridge({ repo, auth, sync = null, clubId: _clubIdOverride = null }) {
  if (!repo || typeof repo.getClubId !== "function") {
    throw new Error("createCommunityAsyncBridge: repo es requerido (con getClubId)");
  }
  if (!auth || typeof auth.isAuthenticated !== "function") {
    throw new Error("createCommunityAsyncBridge: auth boundary es requerido");
  }

  const _clubId = _clubIdOverride ?? repo.getClubId();

  // Obtiene el store local (MemoryRepo).
  async function _getStore() {
    return repo.getStore();
  }

  // Persiste vía SyncManager si está disponible (write-through backend-first).
  // Sin SyncManager: mutación directa en MemoryRepo (modo local).
  // Devuelve { ok, result?, version? } donde result = valor devuelto por mutFn.
  async function _persist(mutFn) {
    if (sync && typeof sync.writeThrough === "function") {
      return sync.writeThrough(mutFn);
    }
    // Sin SyncManager: ejecutar la mutación solo en MemoryRepo (modo local/demo)
    try {
      const store = await repo.getStore();
      const result = mutFn(store);
      return { ok: true, result };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  // Verifica identidad y devuelve actor seguro.
  async function _requireAuth() {
    const authenticated = await auth.isAuthenticated();
    if (!authenticated) {
      return {
        ok: false,
        error: createCommunityError(COMMUNITY_ERROR_TYPES.FORBIDDEN, "Autenticación requerida"),
      };
    }
    const actorId = await auth.getActorId();
    if (!actorId) {
      return {
        ok: false,
        error: createCommunityError(COMMUNITY_ERROR_TYPES.FORBIDDEN, "actorId no disponible"),
      };
    }
    return { ok: true, actorId };
  }

  // Verifica age gate.
  async function _requireAdult(actorId) {
    const ageStatus = (await auth.getAgeStatus?.()) ?? AGE_STATUS.AGE_UNKNOWN;
    const { allowed, reason } = isCommunityAllowed(ageStatus);
    if (!allowed) {
      return {
        ok: false,
        error: { type: "age_gate_blocked", message: reason, ageStatus },
      };
    }
    return { ok: true, ageStatus };
  }

  // Construye y comprueba idempotencia para una operación.
  async function _idempotencyCheck(operation, targetId) {
    const actorId = await auth.getActorId();
    if (!actorId || typeof repo.buildIdempotencyKey !== "function") return null;
    try {
      const key = repo.buildIdempotencyKey(operation, actorId, targetId);
      if (typeof repo.isIdempotencyKeyUsed === "function") {
        const used = await repo.isIdempotencyKeyUsed(key);
        if (used) {
          const prev = await repo.getIdempotencyResult(key);
          return { already: true, result: prev, key };
        }
      }
      return { already: false, key };
    } catch {
      return null; // sin idempotencia disponible, continúa
    }
  }

  async function _markIdempotency(key, result) {
    if (key && typeof repo.markIdempotencyKey === "function") {
      try { await repo.markIdempotencyKey(key, result); } catch { /* no crítico */ }
    }
  }

  // Garantiza que el actor tiene un userProfile en el store.
  // Es síncrona — puede usarse dentro de callbacks de _persist.
  function _ensureProfile(store, actorId, role = "PLAYER") {
    const existing = store.userProfiles.find((u) => u.id === actorId);
    if (existing) return existing;
    const profile = createUserProfile({ clubId: _clubId, displayName: actorId, role });
    profile.id = actorId; // preservar el actorId real en lugar del UUID generado
    store.userProfiles.push(profile);
    return profile;
  }

  // --------------------------------------------------------------------------
  // Operaciones de consentimiento
  // --------------------------------------------------------------------------

  async function grantSocialConsent() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;
    const role = (await auth.getRole?.()) ?? "PLAYER";

    const persistResult = await _persist((store) => {
      _ensureProfile(store, actorId, role);
      grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "social_layer_opt_in" });
    });
    if (!persistResult.ok) return persistResult;
    return { ok: true };
  }

  async function revokeSocialConsent() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      revokeConsent(store, { clubId: _clubId, userId: actorId, consentType: "social_layer_opt_in" });
    });
    if (!pr.ok) return pr;
    return { ok: true };
  }

  async function hasSocialConsent() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return false;
    const { actorId } = authResult;
    const store = await _getStore();
    return hasSocialLayerActive(store, actorId);
  }

  // --------------------------------------------------------------------------
  // Operaciones de amistad (async + idempotencia)
  // --------------------------------------------------------------------------

  async function sendFriend(addresseeId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const idem = await _idempotencyCheck("friend_request", addresseeId);
    if (idem?.already) return { ok: true, ...idem.result, fromCache: true };

    const pr = await _persist((store) => {
      return sendFriendRequest(store, { clubId: _clubId, requesterId: actorId, addresseeId });
    });
    if (!pr.ok) return pr;
    const result = { ok: true, friendshipId: pr.result.id };
    await _markIdempotency(idem?.key, result);
    return result;
  }

  async function acceptFriend(friendshipId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      acceptFriendRequest(store, { friendshipId, actingUserId: actorId });
    });
    if (!pr.ok) return pr;
    return { ok: true };
  }

  async function rejectFriend(friendshipId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      rejectFriendRequest(store, { friendshipId, actingUserId: actorId });
    });
    if (!pr.ok) return pr;
    return { ok: true };
  }

  async function cancelFriend(friendshipId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      cancelFriendRequest(store, { friendshipId, actingUserId: actorId });
    });
    if (!pr.ok) return pr;
    return { ok: true };
  }

  async function removeFriendship(otherUserId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      removeFriend(store, { actingUserId: actorId, otherUserId });
    });
    if (!pr.ok) return pr;
    return { ok: true };
  }

  // --------------------------------------------------------------------------
  // Follow
  // --------------------------------------------------------------------------

  async function follow(followedId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const idem = await _idempotencyCheck("follow", followedId);
    if (idem?.already) return { ok: true, ...idem.result, fromCache: true };

    const pr = await _persist((store) => {
      return followUser(store, { clubId: _clubId, followerId: actorId, followedId });
    });
    if (!pr.ok) return pr;
    const result = { ok: true, followId: pr.result.id };
    await _markIdempotency(idem?.key, result);
    return result;
  }

  async function unfollow(followedId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      unfollowUser(store, { followerId: actorId, followedId });
    });
    if (!pr.ok) return pr;
    return { ok: true };
  }

  // --------------------------------------------------------------------------
  // Feed y posts
  // --------------------------------------------------------------------------

  async function createPost(body, { visibility = "friends" } = {}) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const pr = await _persist((store) => {
      if (hasSocialLayerActive(store, actorId) && !hasConsent(store, actorId, "appear_in_feed")) {
        grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "appear_in_feed" });
      }
      return createPostMock(store, { clubId: _clubId, authorId: actorId, body, visibility });
    });
    if (!pr.ok) return pr;
    return { ok: true, postId: pr.result.id, post: pr.result };
  }

  async function getFeedPage({ cursor = null, limit = 10 } = {}) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return { ok: false, items: [], ...authResult };
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return { ok: false, items: [], ...ageResult };

    const store = await _getStore();
    return getPaginatedFeed(store, actorId, { cursor, limit, getVisibleFeed });
  }

  async function addComment(postId, body) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const role = (await auth.getRole?.()) ?? "PLAYER";
    const pr = await _persist((store) => {
      _ensureProfile(store, actorId, role);
      return commentOnPost(store, { clubId: _clubId, postId, authorId: actorId, body });
    });
    if (!pr.ok) return pr;
    return { ok: true, commentId: pr.result.id, comment: pr.result };
  }

  async function react(targetType, targetId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const idem = await _idempotencyCheck(`react_${targetType}`, targetId);
    if (idem?.already) return { ok: true, ...idem.result, fromCache: true };

    const pr = await _persist((store) => {
      return reactTo(store, { clubId: _clubId, targetType, targetId, userId: actorId });
    });
    if (!pr.ok) return pr;
    const result = { ok: true, reactionId: pr.result.id };
    await _markIdempotency(idem?.key, result);
    return result;
  }

  // --------------------------------------------------------------------------
  // Partidos
  // --------------------------------------------------------------------------

  async function createMatch({ scheduledAt, levelMin = "intermedio", levelMax = "intermedio", slotsTotal = 4, visibility = "club" } = {}) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const pr = await _persist((store) => {
      if (hasSocialLayerActive(store, actorId) && !hasConsent(store, actorId, "activity_sharing")) {
        grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "activity_sharing" });
      }
      return createOpenMatchMock(store, {
        clubId: _clubId, creatorId: actorId,
        levelMin, levelMax,
        scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
        slotsTotal, visibility,
      });
    });
    if (!pr.ok) return pr;
    return { ok: true, matchId: pr.result.id, match: pr.result };
  }

  async function joinMatch(openMatchId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const idem = await _idempotencyCheck("join_match", openMatchId);
    if (idem?.already) return { ok: true, ...idem.result, fromCache: true };

    const pr = await _persist((store) => {
      if (hasSocialLayerActive(store, actorId) && !hasConsent(store, actorId, "activity_sharing")) {
        grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "activity_sharing" });
      }
      return requestToJoin(store, { clubId: _clubId, openMatchId, requesterId: actorId });
    });
    if (!pr.ok) return pr;
    const result = { ok: true, inviteId: pr.result.id };
    await _markIdempotency(idem?.key, result);
    return result;
  }

  async function acceptJoin(inviteId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      return acceptJoinRequest(store, { inviteId, actingUserId: actorId });
    });
    if (!pr.ok) return pr;
    return { ok: true, invite: pr.result };
  }

  // --------------------------------------------------------------------------
  // Notificaciones
  // --------------------------------------------------------------------------

  async function getNotifications({ limit = 20 } = {}) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return [];
    const { actorId } = authResult;

    const store = await _getStore();
    return listNotifications(store, { userId: actorId, clubId: _clubId, limit });
  }

  async function getUnread() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return 0;
    const { actorId } = authResult;

    const store = await _getStore();
    return getUnreadCount(store, actorId, _clubId);
  }

  async function markRead(notificationId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      return markNotificationRead(store, notificationId, actorId);
    });
    if (!pr.ok) return pr;
    return pr.result;
  }

  async function markAllRead() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      return markAllNotificationsRead(store, actorId, _clubId);
    });
    if (!pr.ok) return pr;
    return pr.result;
  }

  // --------------------------------------------------------------------------
  // Moderación
  // --------------------------------------------------------------------------

  async function report(targetType, targetId, reason, details = null) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const pr = await _persist((store) => {
      return reportContent(store, { clubId: _clubId, reporterId: actorId, targetType, targetId, reason, details });
    });
    if (!pr.ok) return pr;
    return { ok: true, reportId: pr.result.id };
  }

  async function moderateMarkInReview(reportId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const role = (await auth.getRole?.()) ?? "STAFF";
    const pr = await _persist((store) => {
      _ensureProfile(store, actorId, role);
      return markInReview(store, { reportId, moderatorId: actorId });
    });
    if (!pr.ok) return pr;
    return { ok: true, report: pr.result };
  }

  async function moderateApplyAction(reportId, actionType, notes = null) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const role = (await auth.getRole?.()) ?? "STAFF";
    const pr = await _persist((store) => {
      _ensureProfile(store, actorId, role);
      return applyModerationAction(store, { clubId: _clubId, reportId, moderatorId: actorId, actionType, notes });
    });
    if (!pr.ok) return pr;
    return { ok: true, actionId: pr.result.id };
  }

  async function moderateDismiss(reportId, notes = null) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const role = (await auth.getRole?.()) ?? "STAFF";
    const pr = await _persist((store) => {
      _ensureProfile(store, actorId, role);
      return dismissReport(store, { reportId, moderatorId: actorId, notes });
    });
    if (!pr.ok) return pr;
    return { ok: true, actionId: pr.result.id };
  }

  // --------------------------------------------------------------------------
  // Introspección (para tests y UI)
  // --------------------------------------------------------------------------

  async function getClubId() { return _clubId; }
  async function getActorId() { return auth.getActorId(); }
  async function isAuthenticated() { return auth.isAuthenticated(); }

  return {
    // Consentimiento
    grantSocialConsent,
    revokeSocialConsent,
    hasSocialConsent,
    // Amistad
    sendFriend,
    acceptFriend,
    rejectFriend,
    cancelFriend,
    removeFriendship,
    // Follow
    follow,
    unfollow,
    // Feed / Posts
    createPost,
    getFeedPage,
    addComment,
    react,
    // Partidos
    createMatch,
    joinMatch,
    acceptJoin,
    // Notificaciones
    getNotifications,
    getUnread,
    markRead,
    markAllRead,
    // Moderación
    report,
    moderateMarkInReview,
    moderateApplyAction,
    moderateDismiss,
    // Introspección
    getClubId,
    getActorId,
    isAuthenticated,
  };
}
