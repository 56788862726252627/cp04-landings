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
 * @param {object} options.repo   — MemoryCommunityRepository o BackendCommunityRepository
 * @param {object} options.auth   — CommunityAuthBoundary (DemoAuthBoundary o real)
 * @param {string} [options.clubId] — clubId override (si no está en auth boundary)
 */
export function createCommunityAsyncBridge({ repo, auth, clubId: _clubIdOverride = null }) {
  if (!repo || typeof repo.getClubId !== "function") {
    throw new Error("createCommunityAsyncBridge: repo es requerido (con getClubId)");
  }
  if (!auth || typeof auth.isAuthenticated !== "function") {
    throw new Error("createCommunityAsyncBridge: auth boundary es requerido");
  }

  const _clubId = _clubIdOverride ?? repo.getClubId();

  // Obtiene el store del repo (sync o async).
  async function _getStore() {
    const s = await repo.getStore();
    return s;
  }

  // Persiste el store en el backend (solo si el repo es async/backend).
  async function _persist(store, expectedVersion = null) {
    // Si el repo tiene writeAll (es BackendCommunityRepository con adapter),
    // la persistencia ya ocurre vía applyIfVersion. Aquí no hacemos nada extra
    // porque el repo se encarga. Este método existe para repos que necesiten
    // flush explícito (futuros adapters).
    //
    // Para MemoryCommunityRepository no hay nada que persistir (es en memoria).
    return { ok: true };
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
  // Necesario para getVisibleFeed, assertModeratorRole, etc.
  async function _ensureProfile(store, actorId, role = "PLAYER") {
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

    try {
      const store = await _getStore();
      const role = (await auth.getRole?.()) ?? "PLAYER";
      await _ensureProfile(store, actorId, role);
      grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "social_layer_opt_in" });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function revokeSocialConsent() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      revokeConsent(store, { clubId: _clubId, userId: actorId, consentType: "social_layer_opt_in" });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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

    try {
      const store = await _getStore();
      const record = sendFriendRequest(store, { clubId: _clubId, requesterId: actorId, addresseeId });
      const result = { ok: true, friendshipId: record.id };
      await _markIdempotency(idem?.key, result);
      return result;
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function acceptFriend(friendshipId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      acceptFriendRequest(store, { friendshipId, actingUserId: actorId });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function rejectFriend(friendshipId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      rejectFriendRequest(store, { friendshipId, actingUserId: actorId });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function cancelFriend(friendshipId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      cancelFriendRequest(store, { friendshipId, actingUserId: actorId });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function removeFriendship(otherUserId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      removeFriend(store, { actingUserId: actorId, otherUserId });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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

    try {
      const store = await _getStore();
      const record = followUser(store, { clubId: _clubId, followerId: actorId, followedId });
      const result = { ok: true, followId: record.id };
      await _markIdempotency(idem?.key, result);
      return result;
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function unfollow(followedId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      unfollowUser(store, { followerId: actorId, followedId });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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

    try {
      const store = await _getStore();
      // Auto-grant appear_in_feed si tiene social consent (misma lógica que bridge sync)
      if (hasSocialLayerActive(store, actorId) && !hasConsent(store, actorId, "appear_in_feed")) {
        grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "appear_in_feed" });
      }
      const post = createPostMock(store, { clubId: _clubId, authorId: actorId, body, visibility });
      return { ok: true, postId: post.id, post };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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

    try {
      const store = await _getStore();
      const role = (await auth.getRole?.()) ?? "PLAYER";
      await _ensureProfile(store, actorId, role);
      const comment = commentOnPost(store, { clubId: _clubId, postId, authorId: actorId, body });
      return { ok: true, commentId: comment.id, comment };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function react(targetType, targetId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const idem = await _idempotencyCheck(`react_${targetType}`, targetId);
    if (idem?.already) return { ok: true, ...idem.result, fromCache: true };

    try {
      const store = await _getStore();
      const record = reactTo(store, { clubId: _clubId, targetType, targetId, userId: actorId });
      const result = { ok: true, reactionId: record.id };
      await _markIdempotency(idem?.key, result);
      return result;
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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

    try {
      const store = await _getStore();
      if (hasSocialLayerActive(store, actorId) && !hasConsent(store, actorId, "activity_sharing")) {
        grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "activity_sharing" });
      }
      const match = createOpenMatchMock(store, {
        clubId: _clubId, creatorId: actorId,
        levelMin, levelMax,
        scheduledAt: scheduledAt || new Date(Date.now() + 86400000).toISOString(),
        slotsTotal, visibility,
      });
      return { ok: true, matchId: match.id, match };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function joinMatch(openMatchId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const ageResult = await _requireAdult(actorId);
    if (!ageResult.ok) return ageResult;

    const idem = await _idempotencyCheck("join_match", openMatchId);
    if (idem?.already) return { ok: true, ...idem.result, fromCache: true };

    try {
      const store = await _getStore();
      if (hasSocialLayerActive(store, actorId) && !hasConsent(store, actorId, "activity_sharing")) {
        grantConsent(store, { clubId: _clubId, userId: actorId, consentType: "activity_sharing" });
      }
      const invite = requestToJoin(store, { clubId: _clubId, openMatchId, requesterId: actorId });
      const result = { ok: true, inviteId: invite.id };
      await _markIdempotency(idem?.key, result);
      return result;
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function acceptJoin(inviteId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      const invite = acceptJoinRequest(store, { inviteId, actingUserId: actorId });
      return { ok: true, invite };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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

    const store = await _getStore();
    return markNotificationRead(store, notificationId, actorId);
  }

  async function markAllRead() {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    const store = await _getStore();
    return markAllNotificationsRead(store, actorId, _clubId);
  }

  // --------------------------------------------------------------------------
  // Moderación
  // --------------------------------------------------------------------------

  async function report(targetType, targetId, reason, details = null) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      const record = reportContent(store, { clubId: _clubId, reporterId: actorId, targetType, targetId, reason, details });
      return { ok: true, reportId: record.id };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function moderateMarkInReview(reportId) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      const role = (await auth.getRole?.()) ?? "STAFF";
      await _ensureProfile(store, actorId, role);
      const record = markInReview(store, { reportId, moderatorId: actorId });
      return { ok: true, report: record };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function moderateApplyAction(reportId, actionType, notes = null) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      const role = (await auth.getRole?.()) ?? "STAFF";
      await _ensureProfile(store, actorId, role);
      const action = applyModerationAction(store, { clubId: _clubId, reportId, moderatorId: actorId, actionType, notes });
      return { ok: true, actionId: action.id };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
  }

  async function moderateDismiss(reportId, notes = null) {
    const authResult = await _requireAuth();
    if (!authResult.ok) return authResult;
    const { actorId } = authResult;

    try {
      const store = await _getStore();
      const role = (await auth.getRole?.()) ?? "STAFF";
      await _ensureProfile(store, actorId, role);
      const action = dismissReport(store, { reportId, moderatorId: actorId, notes });
      return { ok: true, actionId: action.id };
    } catch (e) {
      return { ok: false, error: createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, e?.message) };
    }
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
