// Club Pádel 04 · Puente React ↔ community-logic (Comunidad).
//
// community-logic (app/projects/club-padel-04/community-logic/) es una
// librería de funciones puras, sin React, ya probada (59 tests). Este
// puente es la ÚNICA pieza que la conecta con la UI real: mantiene el
// store en memoria como fuente única de verdad y expone funciones simples
// que React puede llamar desde sus handlers. Ninguna regla de negocio se
// reimplementa aquí — solo se invocan las funciones ya existentes.
//
// P0.1 Amistades/Follow · P0.2 Feed/Posts · P0.3 Partidos abiertos
// P0.4 Moderación/Reportes/Privacidad · P0.5 Hardening: CERRADOS.
//
// PERSISTENCIA: el store vive solo en memoria del proceso. El punto de
// migración a backend real es reemplazar `let store = createEmptyStore()`
// por operaciones async (leer/escribir desde Supabase/API). Todos los
// wrappers son síncronos hoy; migrar requiere hacerlos async y adaptar
// los tests. Para multi-club/multi-tenant: COMMUNITY_BRIDGE_CLUB_ID debe
// convertirse en parámetro de contexto, no constante.
//
// Contrato de las funciones mutantes: siempre devuelven { ok, error? },
// nunca lanzan hacia el componente que las llama, y nunca convierten un
// error real (p. ej. intentar bloquearse/seguirse a uno mismo) en éxito.
import {
  createEmptyStore,
  createUserProfile,
  createPlayerSocialProfile,
  hasSocialLayerActive,
  hasConsent,
  grantConsent,
  revokeConsent,
  isBlocked,
  blockUser,
  unblockUser,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  areFriends,
  followUser,
  unfollowUser,
  countFollowers,
  createPostMock,
  getVisibleFeed,
  commentOnPost,
  reactTo,
  createOpenMatchMock,
  listVisibleOpenMatches,
  requestToJoin,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelOpenMatch,
  reportContent,
  markInReview,
  applyModerationAction,
  dismissReport,
  getReportStatusForReporter,
  getSanctionSummaryForUser,
  isContentHidden,
  canReport,
} from "../../projects/club-padel-04/community-logic/index.mjs";

import { createMemoryCommunityRepository } from "./communityRepository.js";

// Mismo id de club ficticio que ya usa community-logic/entities/seed.mjs —
// sin inventar uno nuevo, solo para mantener consistencia si en el futuro
// se comparten datos entre el seed de test y este puente.
export const COMMUNITY_BRIDGE_CLUB_ID = "club-demo-04";

const SOCIAL_LAYER_CONSENT_TYPE = "social_layer_opt_in";

// IDs de los moderadores ficticios para la demo — uno por rol con permiso de
// moderación. Se crean en communitySeedDemoRelationships con el rol correcto
// para que assertModeratorRole de community-logic los encuentre en el store.
export const DEMO_MODERATOR_IDS = {
  STAFF: "demo-moderator-staff",
  ADMIN: "demo-moderator-admin",
  SUPPORT: "demo-moderator-support",
};

// P1.1: el store ahora vive dentro de un CommunityRepository aislado por tenant.
// La variable `store` sigue siendo una referencia directa (mismo patrón de P0)
// pero se deriva del repo. Al hacer reset, se reasignan ambos para que todo el
// código del bridge siga funcionando sin cambios. Para multi-tenant real, crear
// un repo distinto por club; el bridge actual es el repo del club demo.
let _communityRepo = createMemoryCommunityRepository(COMMUNITY_BRIDGE_CLUB_ID);
let store = _communityRepo.getStore();
let demoSeeded = false;

// Expone el repo activo para tests de integración y diagnóstico.
// No usar en producción para acceso directo al store — usar solo las funciones del bridge.
export function __getCommunityRepoForTests() {
  return _communityRepo;
}

// Solo para tests: reinicia el store en memoria a un estado vacío, igual
// que ya hacen __resetAvailabilityCacheForTests / __resetCrearReservaRateLimitForTests
// en worker-reservas — mismo patrón ya establecido en el proyecto. También
// limpia el flag de seeding de demo para que un test pueda volver a poblarlo.
export function __resetCommunityStoreForTests() {
  _communityRepo = createMemoryCommunityRepository(COMMUNITY_BRIDGE_CLUB_ID);
  store = _communityRepo.getStore();
  demoSeeded = false;
}

// --- Consentimiento --------------------------------------------------

export function communityHasSocialConsent(userId) {
  return hasSocialLayerActive(store, userId);
}

export function communityGrantSocialConsent(userId) {
  try {
    grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId, consentType: SOCIAL_LAYER_CONSENT_TYPE });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo otorgar el consentimiento." };
  }
}

export function communityRevokeSocialConsent(userId) {
  try {
    revokeConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId, consentType: SOCIAL_LAYER_CONSENT_TYPE });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo revocar el consentimiento." };
  }
}

// --- Bloqueo -----------------------------------------------------------

export function communityIsBlocked(userIdA, userIdB) {
  return isBlocked(store, userIdA, userIdB);
}

// Doble barrera aplicada aquí, con lo único disponible en Fase 1
// (consent + blocking, sin feed/friendship todavía):
//   barrera 1: la UI decide si mostrar/habilitar la acción según
//              communityIsBlocked (ver ComunidadDemo.jsx);
//   barrera 2: el propio puente vuelve a comprobar isBlocked antes de
//              intentar el bloqueo, y nunca confía en el estado que ya
//              tuviera pintado la UI — si ya estaban bloqueados, no
//              vuelve a crear un segundo registro ni finge éxito.
export function communityBlockUser(blockerId, blockedId) {
  if (isBlocked(store, blockerId, blockedId)) {
    return { ok: false, error: "Ya existe un bloqueo activo entre estos usuarios." };
  }
  try {
    blockUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, blockerId, blockedId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo bloquear al usuario." };
  }
}

export function communityUnblockUser(blockerId, blockedId) {
  try {
    unblockUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, blockerId, blockedId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo desbloquear al usuario." };
  }
}

// --- Perfiles de usuario (soporte para getVisibleFeed) -------------------
//
// getVisibleFeed() busca el UserProfile del viewer para comprobar su rol
// (STAFF/ADMIN) y para validar que post.clubId === viewer.clubId. Sin
// UserProfile, viewer?.clubId es undefined y todos los posts se filtran.
// Este puente garantiza un UserProfile mínimo por id antes de necesitarlo.
export function communityEnsureUserProfile(userId, { displayName = userId, role = "PLAYER" } = {}) {
  const existing = store.userProfiles.find((u) => u.id === userId);
  if (existing) return existing;
  const profile = createUserProfile({ clubId: COMMUNITY_BRIDGE_CLUB_ID, displayName, role });
  profile.id = userId; // override auto-UUID with the caller-controlled id
  store.userProfiles.push(profile);
  return profile;
}

// --- Perfiles sociales (soporte para follow) ----------------------------
//
// followUser() de community-logic exige que el usuario seguido tenga ya un
// PlayerSocialProfile con visibilityLevel distinto de "private" — no es una
// regla nueva, es un requisito de datos que community-logic ya impone. La
// UI demo no crea usuarios completos (UserProfile), así que este puente
// asegura un PlayerSocialProfile mínimo por id antes de necesitarlo.
export function communityEnsurePlayerProfile(userId, { visibilityLevel = "friends" } = {}) {
  const existing = store.playerSocialProfiles.find((p) => p.userProfileId === userId);
  if (existing) return existing;
  const profile = createPlayerSocialProfile({ clubId: COMMUNITY_BRIDGE_CLUB_ID, userProfileId: userId, visibilityLevel });
  store.playerSocialProfiles.push(profile);
  return profile;
}

// --- Amistad --------------------------------------------------------------

// Consulta de solo lectura, no existe como tal en community-logic (que solo
// expone areFriends). Combina los datos ya guardados en el store para que
// la UI sepa qué botones mostrar (sin relación / solicitud enviada /
// recibida / amistad / bloqueado) sin repetir ninguna validación de negocio.
function findFriendshipState(userId, otherUserId) {
  if (isBlocked(store, userId, otherUserId)) return { status: "blocked" };

  const accepted = store.friendships.find(
    (f) =>
      f.status === "accepted" &&
      ((f.requesterId === userId && f.addresseeId === otherUserId) ||
        (f.requesterId === otherUserId && f.addresseeId === userId))
  );
  if (accepted) return { status: "friends", friendshipId: accepted.id };

  const pendingSent = store.friendships.find(
    (f) => f.status === "pending" && f.requesterId === userId && f.addresseeId === otherUserId
  );
  if (pendingSent) return { status: "request_sent", friendshipId: pendingSent.id };

  const pendingReceived = store.friendships.find(
    (f) => f.status === "pending" && f.requesterId === otherUserId && f.addresseeId === userId
  );
  if (pendingReceived) return { status: "request_received", friendshipId: pendingReceived.id };

  return { status: "none" };
}

export function communityGetFriendshipState(userId, otherUserId) {
  return findFriendshipState(userId, otherUserId);
}

export function communityAreFriends(userIdA, userIdB) {
  return areFriends(store, userIdA, userIdB);
}

export function communitySendFriendRequest(requesterId, addresseeId) {
  try {
    const record = sendFriendRequest(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, requesterId, addresseeId });
    return { ok: true, friendshipId: record.id };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo enviar la solicitud de amistad." };
  }
}

export function communityAcceptFriendRequest(friendshipId, actingUserId) {
  try {
    acceptFriendRequest(store, { friendshipId, actingUserId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo aceptar la solicitud de amistad." };
  }
}

export function communityRejectFriendRequest(friendshipId, actingUserId) {
  try {
    rejectFriendRequest(store, { friendshipId, actingUserId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo rechazar la solicitud de amistad." };
  }
}

export function communityCancelFriendRequest(friendshipId, actingUserId) {
  try {
    cancelFriendRequest(store, { friendshipId, actingUserId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo cancelar la solicitud de amistad." };
  }
}

export function communityRemoveFriend(actingUserId, otherUserId) {
  try {
    removeFriend(store, { actingUserId, otherUserId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo eliminar la amistad." };
  }
}

// --- Follow -----------------------------------------------------------

export function communityFollowUser(followerId, followedId) {
  try {
    const record = followUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, followerId, followedId });
    return { ok: true, followId: record.id };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo seguir al usuario." };
  }
}

export function communityUnfollowUser(followerId, followedId) {
  try {
    unfollowUser(store, { followerId, followedId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo dejar de seguir al usuario." };
  }
}

export function communityIsFollowing(followerId, followedId) {
  return store.follows.some((f) => f.followerId === followerId && f.followedId === followedId);
}

export function communityCountFollowers(userId) {
  return countFollowers(store, userId);
}

// --- Seeding de demo (solo para ComunidadDemo.jsx) -----------------------
//
// Construye un estado inicial de ejemplo (amistad activa, solicitud
// recibida, bloqueo, follow) usando ÚNICAMENTE las funciones reales de
// community-logic/el propio puente — nunca escribiendo el store a mano —
// para que la demo arranque mostrando los distintos estados posibles sin
// inventar una segunda vía de creación de datos. Otorga consentimiento al
// actor temporalmente para poder construir el estado inicial (algunas
// acciones de creación lo exigen) y lo revoca al final, dejando al actor
// en el mismo estado por defecto que ya tenía la demo (sin consentimiento
// otorgado todavía). Idempotente: una segunda llamada no hace nada.
export function communitySeedDemoRelationships({
  actorId,
  friendId,
  pendingReceivedFrom,
  blockedId,
  followingId,
  privateProfileId,
  publicUnrelatedId,
} = {}) {
  if (demoSeeded) return;
  demoSeeded = true;

  // Seed moderadores ficticios (STAFF/ADMIN/SUPPORT) — sin ellos,
  // assertModeratorRole de community-logic rechazaría toda acción en la demo.
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { displayName: "Demo STAFF", role: "STAFF" });
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.ADMIN, { displayName: "Demo ADMIN", role: "ADMIN" });
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.SUPPORT, { displayName: "Demo SUPPORT", role: "SUPPORT" });

  // UserProfiles needed by getVisibleFeed (clubId check + staff-role logic).
  for (const uid of [actorId, friendId, pendingReceivedFrom, blockedId, followingId, publicUnrelatedId].filter(Boolean)) {
    communityEnsureUserProfile(uid);
  }
  if (privateProfileId) communityEnsureUserProfile(privateProfileId);

  for (const uid of [actorId, friendId, pendingReceivedFrom, blockedId, followingId, publicUnrelatedId].filter(Boolean)) {
    communityEnsurePlayerProfile(uid, { visibilityLevel: "friends" });
  }
  if (privateProfileId) communityEnsurePlayerProfile(privateProfileId, { visibilityLevel: "private" });

  grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: actorId, consentType: SOCIAL_LAYER_CONSENT_TYPE });

  if (friendId) {
    const req = sendFriendRequest(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, requesterId: actorId, addresseeId: friendId });
    acceptFriendRequest(store, { friendshipId: req.id, actingUserId: friendId });
    // Seed a demo post from the active friend so the feed starts populated.
    // Consents for friendId are left granted (not revoked) so the post stays
    // visible via the appear_in_feed retroactive-revocation rule in getVisibleFeed.
    grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: friendId, consentType: SOCIAL_LAYER_CONSENT_TYPE });
    grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: friendId, consentType: "appear_in_feed" });
    createPostMock(store, {
      clubId: COMMUNITY_BRIDGE_CLUB_ID,
      authorId: friendId,
      body: "¡Buena sesión de pádel esta mañana! Me siento cada vez más cómodo en el lado izquierdo. (publicación demo de Jugador Demo 2)",
      visibility: "friends",
    });
    // Seed a demo open match from the active friend (visibility=friends so the
    // actor, who is friends with friendId, can see and request to join it).
    grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: friendId, consentType: "activity_sharing" });
    createOpenMatchMock(store, {
      clubId: COMMUNITY_BRIDGE_CLUB_ID,
      creatorId: friendId,
      levelMin: "intermedio",
      levelMax: "avanzado",
      scheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
      slotsTotal: 4,
      visibility: "friends",
    });
  }
  // Seed de un reporte para que la cola de moderación arranque con un item.
  if (pendingReceivedFrom && friendId) {
    const seedPost = store.posts.find((p) => p.authorId === friendId);
    if (seedPost) {
      reportContent(store, {
        clubId: COMMUNITY_BRIDGE_CLUB_ID,
        reporterId: pendingReceivedFrom,
        targetType: "post",
        targetId: seedPost.id,
        reason: "spam",
      });
    }
  }
  if (pendingReceivedFrom) {
    grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: pendingReceivedFrom, consentType: SOCIAL_LAYER_CONSENT_TYPE });
    sendFriendRequest(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, requesterId: pendingReceivedFrom, addresseeId: actorId });
  }
  if (blockedId) {
    blockUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, blockerId: actorId, blockedId });
  }
  if (followingId) {
    followUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, followerId: actorId, followedId: followingId });
  }

  revokeConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: actorId, consentType: SOCIAL_LAYER_CONSENT_TYPE });
}

// --- Feed (P0.2) ---------------------------------------------------------

// appear_in_feed es un consentimiento separado de social_layer_opt_in en el
// modelo real. En esta demo se auto-concede en la primera publicación si el
// usuario ya tiene social_layer_opt_in — simplificación consciente para que
// el único botón de la pestaña Consentimiento sea suficiente. En producción
// ambos consentimientos se recogen de forma explícita y separada.
export function communityCreatePost(authorId, body, { visibility = "friends" } = {}) {
  try {
    communityEnsureUserProfile(authorId);
    if (hasSocialLayerActive(store, authorId) && !hasConsent(store, authorId, "appear_in_feed")) {
      grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: authorId, consentType: "appear_in_feed" });
    }
    const post = createPostMock(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, authorId, body, visibility });
    return { ok: true, postId: post.id, post };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo crear la publicación." };
  }
}

export function communityGetVisibleFeed(viewerId) {
  communityEnsureUserProfile(viewerId);
  return getVisibleFeed(store, viewerId);
}

export function communityGetCommentsForPost(postId) {
  return store.comments.filter((c) => c.postId === postId && !c.deletedAt);
}

export function communityCommentOnPost(postId, authorId, body) {
  try {
    communityEnsureUserProfile(authorId);
    const comment = commentOnPost(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, postId, authorId, body });
    return { ok: true, commentId: comment.id, comment };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo añadir el comentario." };
  }
}

export function communityGetReactionsCount(targetType, targetId) {
  return store.reactions.filter((r) => r.targetType === targetType && r.targetId === targetId).length;
}

export function communityHasUserReacted(targetType, targetId, userId) {
  return store.reactions.some((r) => r.targetType === targetType && r.targetId === targetId && r.userId === userId);
}

export function communityReactToPost(postId, userId) {
  try {
    const record = reactTo(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, targetType: "post", targetId: postId, userId });
    return { ok: true, reactionId: record.id };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo reaccionar a la publicación." };
  }
}

// --- Partidos abiertos (P0.3) --------------------------------------------

// activity_sharing se auto-concede cuando el usuario ya tiene social_layer_opt_in
// pero aún no tiene activity_sharing — misma estrategia de bundled-consent-demo
// usada para appear_in_feed en P0.2.
export function communityCreateOpenMatch(creatorId, { scheduledAt, levelMin = "intermedio", levelMax = "intermedio", slotsTotal = 4, visibility = "club" } = {}) {
  try {
    communityEnsureUserProfile(creatorId);
    communityEnsurePlayerProfile(creatorId);
    if (hasSocialLayerActive(store, creatorId) && !hasConsent(store, creatorId, "activity_sharing")) {
      grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: creatorId, consentType: "activity_sharing" });
    }
    const scheduledAtFinal = scheduledAt || new Date(Date.now() + 86400000).toISOString();
    const match = createOpenMatchMock(store, {
      clubId: COMMUNITY_BRIDGE_CLUB_ID,
      creatorId,
      levelMin,
      levelMax,
      scheduledAt: scheduledAtFinal,
      slotsTotal,
      visibility,
    });
    return { ok: true, matchId: match.id, match };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo crear el partido." };
  }
}

export function communityListVisibleOpenMatches(viewerId) {
  communityEnsureUserProfile(viewerId);
  return listVisibleOpenMatches(store, viewerId);
}

export function communityRequestToJoin(openMatchId, requesterId) {
  try {
    communityEnsureUserProfile(requesterId);
    communityEnsurePlayerProfile(requesterId);
    if (hasSocialLayerActive(store, requesterId) && !hasConsent(store, requesterId, "activity_sharing")) {
      grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId: requesterId, consentType: "activity_sharing" });
    }
    const invite = requestToJoin(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, openMatchId, requesterId });
    return { ok: true, inviteId: invite.id, invite };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo solicitar la plaza." };
  }
}

export function communityAcceptJoinRequest(inviteId, actingUserId) {
  try {
    const invite = acceptJoinRequest(store, { inviteId, actingUserId });
    return { ok: true, invite };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo aceptar la solicitud." };
  }
}

export function communityRejectJoinRequest(inviteId, actingUserId) {
  try {
    const invite = rejectJoinRequest(store, { inviteId, actingUserId });
    return { ok: true, invite };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo rechazar la solicitud." };
  }
}

export function communityCancelOpenMatch(openMatchId, actingUserId) {
  try {
    const match = cancelOpenMatch(store, { openMatchId, actingUserId });
    return { ok: true, match };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo cancelar el partido." };
  }
}

export function communityGetPendingInvitesForMatch(openMatchId) {
  return store.matchInvites.filter((i) => i.openMatchId === openMatchId && i.status === "pending");
}

export function communityGetMyInviteForMatch(openMatchId, requesterId) {
  return store.matchInvites.find((i) => i.openMatchId === openMatchId && i.requesterId === requesterId) || null;
}

// --- Moderación y reportes (P0.4) ----------------------------------------

// canReport en community-logic requiere solo social_layer_opt_in. El bridge
// lo expone para que la UI decida si mostrar el botón — la autoridad sigue
// siendo el dominio; el bridge no añade ni relaja ningún gate propio.
export function communityCanReport(userId) {
  return canReport(store, userId);
}

export function communityReportContent(reporterId, { targetType, targetId, reason, details = null }) {
  try {
    const report = reportContent(store, {
      clubId: COMMUNITY_BRIDGE_CLUB_ID,
      reporterId,
      targetType,
      targetId,
      reason,
      details,
    });
    return { ok: true, reportId: report.id, report };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo crear el reporte." };
  }
}

// Vista mínima para el reportante — solo estado y motivo, sin notas internas
// ni identidad del moderador (getReportStatusForReporter en moderation.mjs
// ya garantiza esta minimización; el bridge solo añade el envoltorio ok/error).
export function communityGetReportStatusForReporter(reportId, requestingUserId) {
  try {
    const status = getReportStatusForReporter(store, reportId, requestingUserId);
    return { ok: true, ...status };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo obtener el estado del reporte." };
  }
}

// Resumen de sanción para el usuario afectado — nunca incluye notas ni moderatorId.
export function communityGetSanctionSummaryForUser(moderationActionId) {
  try {
    const summary = getSanctionSummaryForUser(store, moderationActionId);
    return { ok: true, ...summary };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo obtener el resumen de la sanción." };
  }
}

export function communityIsContentHidden(targetType, targetId) {
  return isContentHidden(store, targetType, targetId);
}

// Reportes visibles para el moderador — minimización de datos según rol:
// STAFF/SUPPORT ven open/in_review sin reporterId; ADMIN ve todo (incluyendo
// resolved/dismissed) y recibe también el reporterId para auditoría.
export function communityGetReportsQueue(moderatorId) {
  const moderator = store.userProfiles.find((u) => u.id === moderatorId);
  if (!moderator || !["STAFF", "ADMIN", "SUPPORT"].includes(moderator.role)) return [];
  const isAdmin = moderator.role === "ADMIN";
  const visible = isAdmin
    ? store.reports
    : store.reports.filter((r) => r.status === "open" || r.status === "in_review");
  return visible.map((r) => ({
    id: r.id,
    targetType: r.targetType,
    targetId: r.targetId,
    reason: r.reason,
    status: r.status,
    createdAt: r.createdAt,
    ...(isAdmin ? { reporterId: r.reporterId } : {}),
  }));
}

export function communityMarkInReview(reportId, moderatorId) {
  try {
    const report = markInReview(store, { reportId, moderatorId });
    return { ok: true, report };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo marcar en revisión." };
  }
}

export function communityApplyModerationAction(reportId, moderatorId, actionType, notes = null) {
  try {
    const action = applyModerationAction(store, {
      clubId: COMMUNITY_BRIDGE_CLUB_ID,
      reportId,
      moderatorId,
      actionType,
      notes,
    });
    return { ok: true, actionId: action.id, action };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo aplicar la acción." };
  }
}

export function communityDismissReport(reportId, moderatorId, notes = null) {
  try {
    const action = dismissReport(store, { reportId, moderatorId, notes });
    return { ok: true, actionId: action.id, action };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo desestimar el reporte." };
  }
}

// --- Privacidad de perfil (P0.4) -----------------------------------------

// Actualiza el visibilityLevel del playerSocialProfile del actor para que
// community-logic (canView, listVisibleOpenMatches, etc.) lo use al decidir
// quién puede ver este perfil. Se conecta al toggle de privacidad del PerfilTab.
export function communityUpdateProfileVisibility(userId, visibilityLevel) {
  const existing = store.playerSocialProfiles.find((p) => p.userProfileId === userId);
  if (existing) {
    existing.visibilityLevel = visibilityLevel;
    existing.updatedAt = new Date().toISOString();
  } else {
    communityEnsurePlayerProfile(userId, { visibilityLevel });
  }
  return { ok: true };
}

export function communityGetProfileVisibility(userId) {
  const profile = store.playerSocialProfiles.find((p) => p.userProfileId === userId);
  return profile?.visibilityLevel ?? "friends";
}
