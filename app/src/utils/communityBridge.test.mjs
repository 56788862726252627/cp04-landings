import test from "node:test";
import assert from "node:assert/strict";
import { beforeEach } from "node:test";

import {
  COMMUNITY_BRIDGE_CLUB_ID,
  COMMUNITY_BRIDGE_CLUB_B_ID,
  __resetCommunityStoreForTests,
  __resetAllClubStoresForTests,
  __getCommunityRepoForTests,
  __getRepoForClubForTests,
  communityHasSocialConsent,
  communityGrantSocialConsent,
  communityRevokeSocialConsent,
  communityIsBlocked,
  communityBlockUser,
  communityUnblockUser,
  communityEnsurePlayerProfile,
  communityEnsureUserProfile,
  communityGetFriendshipState,
  communityAreFriends,
  communitySendFriendRequest,
  communityAcceptFriendRequest,
  communityRejectFriendRequest,
  communityCancelFriendRequest,
  communityRemoveFriend,
  communityFollowUser,
  communityUnfollowUser,
  communityIsFollowing,
  communityCountFollowers,
  communityCreatePost,
  communityGetVisibleFeed,
  communityGetCommentsForPost,
  communityCommentOnPost,
  communityGetReactionsCount,
  communityHasUserReacted,
  communityReactToPost,
  communityCreateOpenMatch,
  communityListVisibleOpenMatches,
  communityRequestToJoin,
  communityAcceptJoinRequest,
  communityRejectJoinRequest,
  communityCancelOpenMatch,
  communityGetPendingInvitesForMatch,
  communityGetMyInviteForMatch,
  DEMO_MODERATOR_IDS,
  communityCanReport,
  communityReportContent,
  communityGetReportStatusForReporter,
  communityGetSanctionSummaryForUser,
  communityIsContentHidden,
  communityGetReportsQueue,
  communityMarkInReview,
  communityApplyModerationAction,
  communityDismissReport,
  communityUpdateProfileVisibility,
  communityGetProfileVisibility,
  communityGetFeedPage,
  communityGetNotifications,
  communityGetUnreadCount,
  communityMarkNotificationRead,
  communityMarkAllNotificationsRead,
} from "./communityBridge.js";

import { createEmptyStore, createFriendship, blockUser } from "../../projects/club-padel-04/community-logic/index.mjs";

// Fase 2 (2026-08-15, P0.1): amistad y seguidores reales. Mismo patrón que
// Fase 1 — solo se confirma que el puente invoca correctamente a
// community-logic (sendFriendRequest, followUser, etc.) y nunca convierte
// un error real en éxito; no se repite la cobertura de reglas de negocio
// que ya tienen sus propios tests en projects/club-padel-04/community-logic/tests/.
function grantConsentFor(userId) {
  const result = communityGrantSocialConsent(userId);
  if (!result.ok) throw new Error(`No se pudo otorgar consentimiento de prueba a ${userId}: ${result.error}`);
}

// Fase 1 de la integración real de Comunidad (2026-08-13): el puente es la
// única pieza nueva de código de negocio de esta fase (el resto es
// community-logic, ya probado con 59 tests propios). Estos tests cubren
// específicamente el contrato del puente, no repiten la cobertura de
// community-logic — solo confirman que lo invoca correctamente y que
// nunca convierte un error real en éxito.

beforeEach(() => {
  __resetAllClubStoresForTests();
});

test("COMMUNITY_BRIDGE_CLUB_ID es un id fijo y no vacío", () => {
  assert.equal(typeof COMMUNITY_BRIDGE_CLUB_ID, "string");
  assert.ok(COMMUNITY_BRIDGE_CLUB_ID.length > 0);
});

// --- Consentimiento --------------------------------------------------

test("sin consentimiento otorgado -> communityHasSocialConsent es false (acción bloqueada)", () => {
  assert.equal(communityHasSocialConsent("jugador-1"), false);
});

test("consentimiento válido -> communityHasSocialConsent true tras otorgarlo (acción permitida)", () => {
  const result = communityGrantSocialConsent("jugador-1");
  assert.equal(result.ok, true);
  assert.equal(communityHasSocialConsent("jugador-1"), true);
});

test("revocación -> communityHasSocialConsent vuelve a false (comportamiento real de community-logic, no solo un toggle visual)", () => {
  communityGrantSocialConsent("jugador-1");
  assert.equal(communityHasSocialConsent("jugador-1"), true);

  const result = communityRevokeSocialConsent("jugador-1");
  assert.equal(result.ok, true);
  assert.equal(communityHasSocialConsent("jugador-1"), false);
});

test("el consentimiento es por usuario: otorgarlo a uno no afecta a otro", () => {
  communityGrantSocialConsent("jugador-1");
  assert.equal(communityHasSocialConsent("jugador-1"), true);
  assert.equal(communityHasSocialConsent("jugador-2"), false);
});

// --- Bloqueo -----------------------------------------------------------

test("sin bloqueo -> communityIsBlocked false en ambas direcciones", () => {
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), false);
  assert.equal(communityIsBlocked("jugador-2", "jugador-1"), false);
});

test("bloquear usuario -> communityIsBlocked true en AMBAS direcciones (bidireccional, misma regla que community-logic)", () => {
  const result = communityBlockUser("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), true);
  assert.equal(communityIsBlocked("jugador-2", "jugador-1"), true);
});

test("doble barrera: un segundo intento de bloquear entre los mismos usuarios se rechaza explícitamente, no crea un segundo registro ni fuerza éxito", () => {
  const first = communityBlockUser("jugador-1", "jugador-2");
  assert.equal(first.ok, true);

  const second = communityBlockUser("jugador-1", "jugador-2");
  assert.equal(second.ok, false);
  assert.match(second.error, /ya existe/i);
  // Sigue bloqueado, no se ha desbloqueado ni duplicado nada.
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), true);
});

test("efecto secundario definido por blocking: bloquear deshace una amistad existente entre las partes", () => {
  // El store del puente es privado a propósito (encapsulación deliberada,
  // ver comentario en communityBridge.js) — communityBlockUser() de Fase 1
  // no crea amistades todavía (friendship.mjs no está integrado hasta
  // Fase 2), así que no hay forma de preparar este escenario a través del
  // puente. Para demostrar que el efecto secundario es real (no una
  // promesa vacía), se usa un store aislado igual de real, con la MISMA
  // blockUser() de community-logic que el puente llama internamente —
  // nunca una reimplementación propia.
  const isolatedStore = createEmptyStore();
  isolatedStore.friendships.push(
    createFriendship({ clubId: COMMUNITY_BRIDGE_CLUB_ID, requesterId: "jugador-1", addresseeId: "jugador-2", status: "accepted" })
  );
  assert.equal(isolatedStore.friendships.length, 1);

  blockUser(isolatedStore, { clubId: COMMUNITY_BRIDGE_CLUB_ID, blockerId: "jugador-1", blockedId: "jugador-2" });

  // La amistad "accepted" desaparece; solo queda el registro "blocked".
  assert.equal(isolatedStore.friendships.length, 1);
  assert.equal(isolatedStore.friendships[0].status, "blocked");
});

test("desbloqueo -> communityIsBlocked vuelve a false", () => {
  communityBlockUser("jugador-1", "jugador-2");
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), true);

  const result = communityUnblockUser("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), false);
});

test("errores no se silencian: bloquearse a uno mismo devuelve ok:false con el mensaje real de community-logic, nunca ok:true", () => {
  const result = communityBlockUser("jugador-1", "jugador-1");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
  assert.ok(result.error.length > 0);
});

test("errores no se silencian: desbloquear sin un bloqueo activo iniciado por ese usuario devuelve ok:false con mensaje real", () => {
  const result = communityUnblockUser("jugador-1", "jugador-2");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
  assert.ok(result.error.length > 0);
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), false);
});

test("errores no se silencian: solo quien bloqueó puede desbloquear (community-logic lo exige, el puente no lo relaja)", () => {
  communityBlockUser("jugador-1", "jugador-2");
  // jugador-2 (el bloqueado) intenta desbloquear en la dirección contraria: debe fallar.
  const result = communityUnblockUser("jugador-2", "jugador-1");
  assert.equal(result.ok, false);
  // El bloqueo original sigue intacto.
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), true);
});

test("__resetCommunityStoreForTests realmente limpia el estado entre tests (garantía de aislamiento)", () => {
  communityGrantSocialConsent("jugador-1");
  communityBlockUser("jugador-1", "jugador-2");
  assert.equal(communityHasSocialConsent("jugador-1"), true);
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), true);

  __resetCommunityStoreForTests();

  assert.equal(communityHasSocialConsent("jugador-1"), false);
  assert.equal(communityIsBlocked("jugador-1", "jugador-2"), false);
});

// --- Amistad (Fase 2, P0.1) ------------------------------------------

test("communityGetFriendshipState devuelve 'none' cuando no hay relación", () => {
  assert.deepEqual(communityGetFriendshipState("jugador-1", "jugador-2"), { status: "none" });
});

test("solicitud válida -> ok:true y el estado pasa a request_sent/request_received en cada dirección", () => {
  grantConsentFor("jugador-1");
  const result = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(typeof result.friendshipId, "string");

  assert.deepEqual(communityGetFriendshipState("jugador-1", "jugador-2").status, "request_sent");
  assert.deepEqual(communityGetFriendshipState("jugador-2", "jugador-1").status, "request_received");
});

test("auto-solicitud prohibida: ok:false, nunca se llega a crear un registro", () => {
  grantConsentFor("jugador-1");
  const result = communitySendFriendRequest("jugador-1", "jugador-1");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
});

test("duplicado: una segunda solicitud pendiente entre los mismos usuarios se rechaza", () => {
  grantConsentFor("jugador-1");
  communitySendFriendRequest("jugador-1", "jugador-2");
  const second = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(second.ok, false);
});

test("bloqueo: no se puede enviar una solicitud de amistad entre usuarios bloqueados", () => {
  grantConsentFor("jugador-1");
  communityBlockUser("jugador-1", "jugador-2");
  const result = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(result.ok, false);
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "blocked");
});

test("aceptar: el addressee acepta -> ok:true, estado pasa a friends, communityAreFriends true", () => {
  grantConsentFor("jugador-1");
  const sent = communitySendFriendRequest("jugador-1", "jugador-2");
  const result = communityAcceptFriendRequest(sent.friendshipId, "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "friends");
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), true);
});

test("rechazar: el addressee rechaza -> ok:true, la relación vuelve a 'none'", () => {
  grantConsentFor("jugador-1");
  const sent = communitySendFriendRequest("jugador-1", "jugador-2");
  const result = communityRejectFriendRequest(sent.friendshipId, "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "none");
});

test("cancelar: el requester cancela su propia solicitud -> ok:true, relación vuelve a 'none'", () => {
  grantConsentFor("jugador-1");
  const sent = communitySendFriendRequest("jugador-1", "jugador-2");
  const result = communityCancelFriendRequest(sent.friendshipId, "jugador-1");
  assert.equal(result.ok, true);
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "none");
});

test("eliminar amistad: ok:true, deja de haber amistad activa", () => {
  grantConsentFor("jugador-1");
  const sent = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(sent.friendshipId, "jugador-2");
  const result = communityRemoveFriend("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), false);
});

test("actor incorrecto: solo el addressee puede aceptar/rechazar, solo el requester puede cancelar", () => {
  grantConsentFor("jugador-1");
  const sent = communitySendFriendRequest("jugador-1", "jugador-2");

  const acceptByWrongActor = communityAcceptFriendRequest(sent.friendshipId, "jugador-1");
  assert.equal(acceptByWrongActor.ok, false);

  const rejectByWrongActor = communityRejectFriendRequest(sent.friendshipId, "jugador-1");
  assert.equal(rejectByWrongActor.ok, false);

  const cancelByWrongActor = communityCancelFriendRequest(sent.friendshipId, "jugador-2");
  assert.equal(cancelByWrongActor.ok, false);

  // La solicitud original sigue intacta pese a los tres intentos fallidos.
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "request_sent");
});

// --- Follow (Fase 2, P0.1) --------------------------------------------

test("seguir: perfil público -> ok:true, communityIsFollowing true y el contador sube", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  assert.equal(communityCountFollowers("jugador-2"), 0);

  const result = communityFollowUser("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityIsFollowing("jugador-1", "jugador-2"), true);
  assert.equal(communityCountFollowers("jugador-2"), 1);
});

test("dejar de seguir: ok:true, communityIsFollowing vuelve a false", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  communityFollowUser("jugador-1", "jugador-2");

  const result = communityUnfollowUser("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(communityIsFollowing("jugador-1", "jugador-2"), false);
});

test("autofollow prohibido: ok:false", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-1", { visibilityLevel: "friends" });
  const result = communityFollowUser("jugador-1", "jugador-1");
  assert.equal(result.ok, false);
});

test("duplicado: seguir dos veces al mismo usuario se rechaza la segunda vez", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  communityFollowUser("jugador-1", "jugador-2");
  const second = communityFollowUser("jugador-1", "jugador-2");
  assert.equal(second.ok, false);
  assert.equal(communityCountFollowers("jugador-2"), 1);
});

test("perfil privado: no se puede seguir a un usuario con visibilityLevel 'private'", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "private" });
  const result = communityFollowUser("jugador-1", "jugador-2");
  assert.equal(result.ok, false);
  assert.equal(communityIsFollowing("jugador-1", "jugador-2"), false);
});

test("bloqueo: no se puede seguir a un usuario bloqueado", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  communityBlockUser("jugador-1", "jugador-2");
  const result = communityFollowUser("jugador-1", "jugador-2");
  assert.equal(result.ok, false);
});

test("consentimiento: sin social_layer_opt_in, seguir devuelve ok:false", () => {
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  const result = communityFollowUser("jugador-1", "jugador-2");
  assert.equal(result.ok, false);
  assert.equal(communityIsFollowing("jugador-1", "jugador-2"), false);
});

test("contador: countFollowers refleja varios seguidores del mismo usuario", () => {
  communityEnsurePlayerProfile("jugador-3", { visibilityLevel: "friends" });
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  communityFollowUser("jugador-1", "jugador-3");
  communityFollowUser("jugador-2", "jugador-3");
  assert.equal(communityCountFollowers("jugador-3"), 2);
});

// --- Regresión: consentimiento y bloqueo tras integrar amistad/follow ---

test("regresión — consentimiento: sin social_layer_opt_in, enviar solicitud de amistad devuelve ok:false", () => {
  const result = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(result.ok, false);
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "none");
});

test("regresión — revocación: revocar consentimiento tras haberlo otorgado impide nuevas solicitudes/follow, pero no rompe communityHasSocialConsent", () => {
  grantConsentFor("jugador-1");
  assert.equal(communityHasSocialConsent("jugador-1"), true);

  communityRevokeSocialConsent("jugador-1");
  assert.equal(communityHasSocialConsent("jugador-1"), false);

  const friendResult = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(friendResult.ok, false);

  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  const followResult = communityFollowUser("jugador-1", "jugador-2");
  assert.equal(followResult.ok, false);
});

test("regresión — bloqueo: bloquear a un amigo existente deshace la amistad (mismo efecto secundario que Fase 1)", () => {
  grantConsentFor("jugador-1");
  const sent = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(sent.friendshipId, "jugador-2");
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), true);

  communityBlockUser("jugador-1", "jugador-2");
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), false);
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "blocked");
});

test("regresión — bloqueo: bloquear a alguien que ya sigues elimina el follow existente", () => {
  grantConsentFor("jugador-1");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" });
  communityFollowUser("jugador-1", "jugador-2");
  assert.equal(communityIsFollowing("jugador-1", "jugador-2"), true);

  communityBlockUser("jugador-1", "jugador-2");
  assert.equal(communityIsFollowing("jugador-1", "jugador-2"), false);
});

test("regresión — desbloqueo: tras desbloquear, se puede volver a enviar una solicitud de amistad", () => {
  grantConsentFor("jugador-1");
  communityBlockUser("jugador-1", "jugador-2");
  assert.equal(communitySendFriendRequest("jugador-1", "jugador-2").ok, false);

  const unblock = communityUnblockUser("jugador-1", "jugador-2");
  assert.equal(unblock.ok, true);

  const result = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(result.ok, true);
});

// --- Feed / Publicaciones (Fase 3, P0.2) ---------------------------------

test("communityEnsureUserProfile crea un UserProfile con el id exacto del userId", () => {
  const profile = communityEnsureUserProfile("jugador-x");
  assert.equal(profile.id, "jugador-x");
  // Segunda llamada: idempotente, mismo objeto
  const profile2 = communityEnsureUserProfile("jugador-x");
  assert.equal(profile2.id, "jugador-x");
});

test("publicación válida: con consentimiento -> ok:true, post retornado", () => {
  grantConsentFor("jugador-1");
  const result = communityCreatePost("jugador-1", "Hola club!");
  assert.equal(result.ok, true);
  assert.equal(typeof result.postId, "string");
  assert.equal(result.post.body, "Hola club!");
});

test("publicación sin consentimiento -> ok:false, nunca crea un post", () => {
  const result = communityCreatePost("jugador-1", "Sin consentimiento");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
  assert.equal(communityGetVisibleFeed("jugador-1").length, 0);
});

test("communityGetVisibleFeed: sin consentimiento retorna [] (community-logic lo exige)", () => {
  communityEnsureUserProfile("jugador-1");
  const feed = communityGetVisibleFeed("jugador-1");
  assert.deepEqual(feed, []);
});

test("communityGetVisibleFeed: con consentimiento muestra los propios posts", () => {
  grantConsentFor("jugador-1");
  communityCreatePost("jugador-1", "Post propio");
  const feed = communityGetVisibleFeed("jugador-1");
  assert.equal(feed.length, 1);
  assert.equal(feed[0].body, "Post propio");
});

test("feed visible: post de amigo con visibility=friends es visible para el actor", () => {
  // Amigos entre jugador-1 y jugador-2
  grantConsentFor("jugador-1");
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(req.friendshipId, "jugador-2");

  // jugador-2 publica con los consents necesarios
  grantConsentFor("jugador-2");
  communityCreatePost("jugador-2", "Post de amigo");

  const feed = communityGetVisibleFeed("jugador-1");
  assert.equal(feed.length, 1);
  assert.equal(feed[0].authorId, "jugador-2");
});

test("feed oculta posts de usuarios bloqueados en cualquier dirección", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  communityCreatePost("jugador-2", "Post que no debe verse");
  // No son amigos: el post de jugador-2 con visibility=friends no se ve de todos modos.
  // Verificamos con visibility=club si existiera — pero el bridge solo expone friends por defecto.
  // Comprobamos el caso de bloqueo: aunque fueran amigos, el bloqueo lo elimina.
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(req.friendshipId, "jugador-2");
  const feedAntes = communityGetVisibleFeed("jugador-1");
  assert.equal(feedAntes.length, 1);

  communityBlockUser("jugador-1", "jugador-2");
  const feedDespues = communityGetVisibleFeed("jugador-1");
  assert.equal(feedDespues.length, 0);
});

test("revocación: revocar social_layer_opt_in del viewer hace que el feed vuelva a estar vacío para ese viewer", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(req.friendshipId, "jugador-2");
  communityCreatePost("jugador-2", "Post visible por ahora");

  const feedAntes = communityGetVisibleFeed("jugador-1");
  assert.equal(feedAntes.length, 1);

  // jugador-1 revoca su consentimiento social: ya no puede ver el feed
  communityRevokeSocialConsent("jugador-1");
  const feedDespues = communityGetVisibleFeed("jugador-1");
  assert.deepEqual(feedDespues, []);
});

// --- Comentarios (P0.2) --------------------------------------------------

test("comentario válido: con acceso de lectura -> ok:true, comment retornado", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post para comentar");
  const result = communityCommentOnPost(post.postId, "jugador-1", "Buen post");
  assert.equal(result.ok, true);
  assert.equal(typeof result.commentId, "string");
  assert.equal(result.comment.body, "Buen post");
});

test("communityGetCommentsForPost: retorna solo los comentarios del post indicado", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post A");
  communityCommentOnPost(post.postId, "jugador-1", "Comentario 1");
  communityCommentOnPost(post.postId, "jugador-1", "Comentario 2");
  const comments = communityGetCommentsForPost(post.postId);
  assert.equal(comments.length, 2);
  assert.equal(comments[0].postId, post.postId);
  assert.equal(comments[1].postId, post.postId);
});

test("comentario en post no accesible (bloqueado) -> ok:false", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post del bloqueador");
  communityBlockUser("jugador-2", "jugador-1");
  // jugador-2 intenta comentar en el post de jugador-1 (quien le bloqueó)
  const result = communityCommentOnPost(post.postId, "jugador-2", "No debería poder");
  assert.equal(result.ok, false);
  assert.equal(communityGetCommentsForPost(post.postId).length, 0);
});

// --- Reacciones (P0.2) ---------------------------------------------------

test("reacción válida: ok:true y el contador sube a 1", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post para reaccionar");
  assert.equal(communityGetReactionsCount("post", post.postId), 0);
  assert.equal(communityHasUserReacted("post", post.postId, "jugador-1"), false);

  const result = communityReactToPost(post.postId, "jugador-1");
  assert.equal(result.ok, true);
  assert.equal(communityGetReactionsCount("post", post.postId), 1);
  assert.equal(communityHasUserReacted("post", post.postId, "jugador-1"), true);
});

test("reacción duplicada: ok:false, contador no aumenta", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post para reaccionar dos veces");
  communityReactToPost(post.postId, "jugador-1");

  const second = communityReactToPost(post.postId, "jugador-1");
  assert.equal(second.ok, false);
  assert.equal(communityGetReactionsCount("post", post.postId), 1);
});

test("múltiples usuarios pueden reaccionar al mismo post", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(req.friendshipId, "jugador-2");
  const post = communityCreatePost("jugador-1", "Post popular");
  communityReactToPost(post.postId, "jugador-1");
  communityReactToPost(post.postId, "jugador-2");
  assert.equal(communityGetReactionsCount("post", post.postId), 2);
  assert.equal(communityHasUserReacted("post", post.postId, "jugador-1"), true);
  assert.equal(communityHasUserReacted("post", post.postId, "jugador-2"), true);
});

// --- Regresión feed/P0.1 -------------------------------------------------

test("regresión feed/P0.1: amistad/follow/consent/bloqueo siguen funcionando tras añadir feed", () => {
  grantConsentFor("jugador-1");
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  assert.equal(req.ok, true);

  communityEnsurePlayerProfile("jugador-3", { visibilityLevel: "friends" });
  const follow = communityFollowUser("jugador-1", "jugador-3");
  assert.equal(follow.ok, true);

  communityBlockUser("jugador-1", "jugador-2");
  assert.equal(communityGetFriendshipState("jugador-1", "jugador-2").status, "blocked");

  // Feed sigue independiente
  communityCreatePost("jugador-1", "Post de regresión");
  const feed = communityGetVisibleFeed("jugador-1");
  assert.equal(feed.length, 1);
});

// --- Partidos abiertos (P0.3) --------------------------------------------

test("crear partido válido: con consentimiento -> ok:true, match retornado", () => {
  grantConsentFor("jugador-1");
  const result = communityCreateOpenMatch("jugador-1", { slotsTotal: 4, visibility: "club" });
  assert.equal(result.ok, true);
  assert.equal(typeof result.matchId, "string");
  assert.equal(result.match.creatorId, "jugador-1");
  assert.equal(result.match.slotsFilled, 1); // creator ocupa la primera plaza
  assert.equal(result.match.status, "open");
});

test("crear partido sin consentimiento -> ok:false", () => {
  const result = communityCreateOpenMatch("jugador-1");
  assert.equal(result.ok, false);
  assert.equal(typeof result.error, "string");
});

test("communityListVisibleOpenMatches: sin UserProfile retorna [] vacío (dominio lo impone)", () => {
  // Sin llamar a communityEnsureUserProfile ni ningún wrapper que lo haga,
  // el store no tiene UserProfile para jugador-desconocido.
  // El wrapper siempre garantiza el perfil, así que el listado es [].
  const list = communityListVisibleOpenMatches("jugador-desconocido");
  // El wrapper crea el UserProfile pero no hay partidos visibles aún.
  assert.deepEqual(list, []);
});

test("partido visible: creador con visibility=club puede ser visto por otros miembros del club", () => {
  grantConsentFor("jugador-1");
  communityCreateOpenMatch("jugador-1", { visibility: "club" });
  const list = communityListVisibleOpenMatches("jugador-2");
  assert.equal(list.length, 1);
  assert.equal(list[0].creatorId, "jugador-1");
});

test("partido con visibility=friends: solo visible para amigos del creador", () => {
  grantConsentFor("jugador-1");
  communityCreateOpenMatch("jugador-1", { visibility: "friends" });

  // jugador-2 sin amistad: no ve el partido
  const sinAmistad = communityListVisibleOpenMatches("jugador-2");
  assert.equal(sinAmistad.length, 0);

  // jugador-3 que es amigo: sí lo ve
  grantConsentFor("jugador-3");
  const req = communitySendFriendRequest("jugador-3", "jugador-1");
  communityAcceptFriendRequest(req.friendshipId, "jugador-1");
  const conAmistad = communityListVisibleOpenMatches("jugador-3");
  assert.equal(conAmistad.length, 1);
});

test("partido bloqueado: usuario bloqueado no ve el partido del bloqueador", () => {
  grantConsentFor("jugador-1");
  communityCreateOpenMatch("jugador-1", { visibility: "club" });
  communityBlockUser("jugador-1", "jugador-2");

  const list = communityListVisibleOpenMatches("jugador-2");
  assert.equal(list.length, 0);
});

test("solicitar plaza: ok:true, inviteId retornado y el partido sigue abierto", () => {
  grantConsentFor("jugador-1");
  const match = communityCreateOpenMatch("jugador-1", { slotsTotal: 4, visibility: "club" });

  grantConsentFor("jugador-2");
  const result = communityRequestToJoin(match.matchId, "jugador-2");
  assert.equal(result.ok, true);
  assert.equal(typeof result.inviteId, "string");
  assert.equal(result.invite.status, "pending");
  // Una solicitud pendiente registrada
  assert.equal(communityGetPendingInvitesForMatch(match.matchId).length, 1);
});

test("solicitar plaza sin consentimiento -> ok:false", () => {
  grantConsentFor("jugador-1");
  const match = communityCreateOpenMatch("jugador-1", { visibility: "club" });
  // jugador-2 sin consentimiento
  const result = communityRequestToJoin(match.matchId, "jugador-2");
  assert.equal(result.ok, false);
});

test("solicitud duplicada: segunda solicitud del mismo usuario -> ok:false", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const match = communityCreateOpenMatch("jugador-1", { visibility: "club" });
  communityRequestToJoin(match.matchId, "jugador-2");
  const second = communityRequestToJoin(match.matchId, "jugador-2");
  assert.equal(second.ok, false);
  assert.equal(communityGetPendingInvitesForMatch(match.matchId).length, 1);
});

test("nivel fuera de rango: solicitud rechazada por nivel del jugador", () => {
  grantConsentFor("jugador-1");
  const match = communityCreateOpenMatch("jugador-1", {
    levelMin: "avanzado",
    levelMax: "profesional",
    visibility: "club",
  });
  // jugador-2 tiene levelDeclared="intermedio" (por defecto en communityEnsurePlayerProfile)
  grantConsentFor("jugador-2");
  communityEnsurePlayerProfile("jugador-2", { visibilityLevel: "friends" }); // levelDeclared="intermedio"
  const result = communityRequestToJoin(match.matchId, "jugador-2");
  assert.equal(result.ok, false);
  assert.match(result.error, /nivel/i);
});

test("aceptar solicitud: ok:true, slotsFilled aumenta", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const match = communityCreateOpenMatch("jugador-1", { slotsTotal: 4, visibility: "club" });
  const req = communityRequestToJoin(match.matchId, "jugador-2");

  const result = communityAcceptJoinRequest(req.inviteId, "jugador-1");
  assert.equal(result.ok, true);
  assert.equal(result.invite.status, "accepted");
  assert.equal(communityGetPendingInvitesForMatch(match.matchId).length, 0);

  const updated = communityListVisibleOpenMatches("jugador-1").find((m) => m.id === match.matchId);
  assert.equal(updated.slotsFilled, 2);
});

test("partido completo: cuando slotsFilled === slotsTotal, status pasa a full", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const match = communityCreateOpenMatch("jugador-1", { slotsTotal: 2, visibility: "club" });
  // slotsFilled=1 (creator), slotsTotal=2 — aceptar una solicitud completa el partido
  const req = communityRequestToJoin(match.matchId, "jugador-2");
  communityAcceptJoinRequest(req.inviteId, "jugador-1");

  const updated = communityListVisibleOpenMatches("jugador-1").find((m) => m.id === match.matchId);
  assert.equal(updated.status, "full");
});

test("rechazar solicitud: ok:true, invite pasa a rejected, slotsFilled no cambia", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const match = communityCreateOpenMatch("jugador-1", { slotsTotal: 4, visibility: "club" });
  const req = communityRequestToJoin(match.matchId, "jugador-2");

  const result = communityRejectJoinRequest(req.inviteId, "jugador-1");
  assert.equal(result.ok, true);
  assert.equal(result.invite.status, "rejected");
  const updated = communityListVisibleOpenMatches("jugador-1").find((m) => m.id === match.matchId);
  assert.equal(updated.slotsFilled, 1);
});

test("cancelar partido: ok:true, status pasa a cancelled", () => {
  grantConsentFor("jugador-1");
  const match = communityCreateOpenMatch("jugador-1", { visibility: "club" });
  const result = communityCancelOpenMatch(match.matchId, "jugador-1");
  assert.equal(result.ok, true);
  assert.equal(result.match.status, "cancelled");
  // Partido cancelado no aparece en el listado
  const list = communityListVisibleOpenMatches("jugador-1");
  assert.equal(list.find((m) => m.id === match.matchId), undefined);
});

test("permiso de organizador: solo el creador puede aceptar/rechazar/cancelar", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  grantConsentFor("jugador-3");
  const match = communityCreateOpenMatch("jugador-1", { slotsTotal: 4, visibility: "club" });
  const req = communityRequestToJoin(match.matchId, "jugador-2");

  // jugador-3 (no creador) intenta aceptar — debe fallar
  const accept = communityAcceptJoinRequest(req.inviteId, "jugador-3");
  assert.equal(accept.ok, false);

  // jugador-3 intenta cancelar — debe fallar
  const cancel = communityCancelOpenMatch(match.matchId, "jugador-3");
  assert.equal(cancel.ok, false);

  // La solicitud sigue pendiente
  assert.equal(communityGetPendingInvitesForMatch(match.matchId).length, 1);
});

test("communityGetMyInviteForMatch: retorna la invitación del usuario si existe, null si no", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const match = communityCreateOpenMatch("jugador-1", { visibility: "club" });

  assert.equal(communityGetMyInviteForMatch(match.matchId, "jugador-2"), null);

  communityRequestToJoin(match.matchId, "jugador-2");
  const invite = communityGetMyInviteForMatch(match.matchId, "jugador-2");
  assert.ok(invite !== null);
  assert.equal(invite.requesterId, "jugador-2");
  assert.equal(invite.status, "pending");
});

// --- Regresión P0.1/P0.2 tras añadir partidos ----------------------------

test("regresión P0.3: amistad, feed y partidos coexisten sin interferencias", () => {
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");

  // Amistad (P0.1)
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(req.friendshipId, "jugador-2");
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), true);

  // Feed (P0.2)
  communityCreatePost("jugador-1", "Post de regresión P0.3");
  assert.equal(communityGetVisibleFeed("jugador-1").length, 1);

  // Partido (P0.3)
  const match = communityCreateOpenMatch("jugador-1", { visibility: "club" });
  communityRequestToJoin(match.matchId, "jugador-2");
  assert.equal(communityGetPendingInvitesForMatch(match.matchId).length, 1);
  assert.equal(communityListVisibleOpenMatches("jugador-1").length, 1);
});

// --- Moderación y reportes (P0.4) ----------------------------------------

test("communityCanReport: sin consentimiento social -> false", () => {
  assert.equal(communityCanReport("jugador-1"), false);
});

test("communityCanReport: con consentimiento social -> true", () => {
  grantConsentFor("jugador-1");
  assert.equal(communityCanReport("jugador-1"), true);
});

test("reportar contenido válido: ok:true, reportId retornado", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post a reportar");
  grantConsentFor("jugador-2");
  const result = communityReportContent("jugador-2", {
    targetType: "post",
    targetId: post.postId,
    reason: "spam",
  });
  assert.equal(result.ok, true);
  assert.equal(typeof result.reportId, "string");
});

test("reportContent (dominio): no añade gate de consent propio — la UI es responsable de canReport", () => {
  // reportContent en moderation.mjs no valida consent — el puente no añade
  // un gate extra. Este test documenta ese contrato explícitamente.
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const result = communityReportContent("usuario-sin-consent", {
    targetType: "post",
    targetId: post.postId,
    reason: "spam",
  });
  assert.equal(result.ok, true);
});

test("getReportStatusForReporter: reportante ve estado y motivo, sin notas ni identidad del moderador", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  grantConsentFor("jugador-2");
  const rep = communityReportContent("jugador-2", { targetType: "post", targetId: post.postId, reason: "harassment" });
  const status = communityGetReportStatusForReporter(rep.reportId, "jugador-2");
  assert.equal(status.ok, true);
  assert.equal(status.reason, "harassment");
  assert.equal(typeof status.status, "string");
  assert.ok(!("notes" in status));
  assert.ok(!("moderatorId" in status));
});

test("getReportStatusForReporter: otro usuario no puede ver el reporte ajeno -> ok:false", () => {
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  const result = communityGetReportStatusForReporter(rep.reportId, "jugador-tercero");
  assert.equal(result.ok, false);
});

test("communityGetReportsQueue: PLAYER -> lista vacía", () => {
  communityEnsureUserProfile("jugador-player");
  const queue = communityGetReportsQueue("jugador-player");
  assert.deepEqual(queue, []);
});

test("communityGetReportsQueue: STAFF ve reportes open/in_review, sin reporterId (minimización)", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  const queue = communityGetReportsQueue(DEMO_MODERATOR_IDS.STAFF);
  assert.equal(queue.length, 1);
  assert.equal(queue[0].status, "open");
  assert.ok(!("reporterId" in queue[0]));
});

test("communityGetReportsQueue: ADMIN ve reporterId en los reportes", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.ADMIN, { role: "ADMIN" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  const queue = communityGetReportsQueue(DEMO_MODERATOR_IDS.ADMIN);
  assert.equal(queue.length, 1);
  assert.equal(typeof queue[0].reporterId, "string");
});

test("markInReview: STAFF puede marcar reporte open -> in_review", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  const result = communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  assert.equal(result.ok, true);
  assert.equal(result.report.status, "in_review");
});

test("markInReview: PLAYER no puede moderar -> ok:false con mensaje real del dominio", () => {
  communityEnsureUserProfile("jugador-player");
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  const result = communityMarkInReview(rep.reportId, "jugador-player");
  assert.equal(result.ok, false);
  assert.match(result.error, /rol no autorizado/i);
});

test("applyModerationAction: STAFF puede aplicar 'warning' -> ok:true", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  const action = communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.STAFF, "warning");
  assert.equal(action.ok, true);
  assert.equal(action.action.actionType, "warning");
});

test("applyModerationAction: STAFF NO puede user_suspended -> ok:false (solo ADMIN)", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  const action = communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.STAFF, "user_suspended");
  assert.equal(action.ok, false);
  assert.match(action.error, /admin/i);
});

test("applyModerationAction: ADMIN puede user_suspended -> ok:true", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.ADMIN, { role: "ADMIN" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.ADMIN);
  const action = communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.ADMIN, "user_suspended");
  assert.equal(action.ok, true);
});

test("applyModerationAction: ADMIN puede user_banned -> ok:true", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.ADMIN, { role: "ADMIN" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.ADMIN);
  const action = communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.ADMIN, "user_banned");
  assert.equal(action.ok, true);
});

test("content_removed: post retirado ya no aparece en feed para usuario normal", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.ADMIN, { role: "ADMIN" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post a retirar");
  assert.equal(communityGetVisibleFeed("jugador-1").length, 1);

  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.ADMIN);
  communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.ADMIN, "content_removed");

  assert.equal(communityIsContentHidden("post", post.postId), true);
  const feedDespues = communityGetVisibleFeed("jugador-1");
  assert.equal(feedDespues.length, 0);
});

test("getSanctionSummaryForUser: retorna actionType y reasonCategory, nunca notas ni moderatorId", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.ADMIN, { role: "ADMIN" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.ADMIN);
  const action = communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.ADMIN, "warning", "nota confidencial");
  const summary = communityGetSanctionSummaryForUser(action.actionId);
  assert.equal(summary.ok, true);
  assert.equal(summary.actionType, "warning");
  assert.equal(summary.reasonCategory, "spam");
  assert.ok(!("notes" in summary));
  assert.ok(!("moderatorId" in summary));
});

test("dismissReport: STAFF puede desestimar -> ok:true, reporte queda fuera de la cola STAFF", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  const post = communityCreatePost("jugador-1", "Post");
  const rep = communityReportContent("jugador-1", { targetType: "post", targetId: post.postId, reason: "spam" });
  const result = communityDismissReport(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  assert.equal(result.ok, true);
  const queue = communityGetReportsQueue(DEMO_MODERATOR_IDS.STAFF);
  assert.equal(queue.find((r) => r.id === rep.reportId), undefined);
});

// --- Privacidad de perfil (P0.4) -----------------------------------------

test("communityGetProfileVisibility: 'friends' por defecto cuando hay perfil creado con ese nivel", () => {
  communityEnsurePlayerProfile("jugador-1", { visibilityLevel: "friends" });
  assert.equal(communityGetProfileVisibility("jugador-1"), "friends");
});

test("communityUpdateProfileVisibility: cambiar a 'private' y restaurar a 'friends'", () => {
  communityEnsurePlayerProfile("jugador-1", { visibilityLevel: "friends" });
  communityUpdateProfileVisibility("jugador-1", "private");
  assert.equal(communityGetProfileVisibility("jugador-1"), "private");
  communityUpdateProfileVisibility("jugador-1", "friends");
  assert.equal(communityGetProfileVisibility("jugador-1"), "friends");
});

test("communityUpdateProfileVisibility: sin perfil previo crea uno con el nivel indicado", () => {
  communityUpdateProfileVisibility("jugador-nuevo", "club");
  assert.equal(communityGetProfileVisibility("jugador-nuevo"), "club");
});

test("communityGetProfileVisibility: 'friends' por defecto si no existe perfil", () => {
  assert.equal(communityGetProfileVisibility("jugador-sin-perfil"), "friends");
});

// --- Regresión P0.1/P0.2/P0.3 tras moderación ----------------------------

test("regresión P0.4: amistad, feed, partidos y moderación coexisten sin interferencias", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");

  // P0.1
  const req = communitySendFriendRequest("jugador-1", "jugador-2");
  communityAcceptFriendRequest(req.friendshipId, "jugador-2");
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), true);

  // P0.2
  const post = communityCreatePost("jugador-1", "Post de regresión P0.4");
  assert.equal(communityGetVisibleFeed("jugador-1").length, 1);

  // P0.3
  const match = communityCreateOpenMatch("jugador-1", { visibility: "club" });
  communityRequestToJoin(match.matchId, "jugador-2");
  assert.equal(communityGetPendingInvitesForMatch(match.matchId).length, 1);

  // P0.4 — reporte y cola
  const rep = communityReportContent("jugador-2", { targetType: "post", targetId: post.postId, reason: "spam" });
  assert.equal(rep.ok, true);
  const queue = communityGetReportsQueue(DEMO_MODERATOR_IDS.STAFF);
  assert.equal(queue.length, 1);

  // Feed intacto antes de la acción de moderación
  assert.equal(communityGetVisibleFeed("jugador-1").length, 1);
  // Aplicar content_removed oculta el post del feed
  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.STAFF, "content_removed");
  assert.equal(communityGetVisibleFeed("jugador-1").length, 0);
  // Partidos siguen intactos
  assert.equal(communityListVisibleOpenMatches("jugador-1").length, 1);
  // Amistad intacta
  assert.equal(communityAreFriends("jugador-1", "jugador-2"), true);
});

// --- Hardening P0.5 -----------------------------------------------------------

test("P0.5: communityGetReportsQueue SUPPORT recibe cola sin reporterId", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.SUPPORT, { role: "SUPPORT" });
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const post = communityCreatePost("jugador-1", "Post para test SUPPORT");
  communityReportContent("jugador-2", { targetType: "post", targetId: post.postId, reason: "spam" });

  const queue = communityGetReportsQueue(DEMO_MODERATOR_IDS.SUPPORT);
  assert.equal(queue.length >= 1, true);
  const item = queue.find((r) => r.targetId === post.postId);
  assert.ok(item, "el reporte debe aparecer en la cola SUPPORT");
  assert.ok(!("reporterId" in item), "SUPPORT no debe recibir reporterId");
});

test("P0.5: communityReportContent con targetType 'comment' registra reporte y devuelve ok:true", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const post = communityCreatePost("jugador-1", "Post con comentario");
  const comment = communityCommentOnPost(post.postId, "jugador-2", "Comentario que se va a reportar");

  const result = communityReportContent("jugador-1", {
    targetType: "comment",
    targetId: comment.commentId,
    reason: "harassment",
  });
  assert.equal(result.ok, true);
  assert.ok(result.reportId, "debe devolver reportId");

  const queue = communityGetReportsQueue(DEMO_MODERATOR_IDS.STAFF);
  const item = queue.find((r) => r.id === result.reportId);
  assert.ok(item, "el reporte de comentario debe aparecer en la cola");
  assert.equal(item.targetType, "comment");
});

test("P0.5: communityMarkInReview sobre reporte ya resuelto devuelve ok:false", () => {
  communityEnsureUserProfile(DEMO_MODERATOR_IDS.STAFF, { role: "STAFF" });
  grantConsentFor("jugador-1");
  grantConsentFor("jugador-2");
  const post = communityCreatePost("jugador-1", "Post para ciclo cerrado");
  const rep = communityReportContent("jugador-2", { targetType: "post", targetId: post.postId, reason: "spam" });

  communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  communityApplyModerationAction(rep.reportId, DEMO_MODERATOR_IDS.STAFF, "warning");

  const result = communityMarkInReview(rep.reportId, DEMO_MODERATOR_IDS.STAFF);
  assert.equal(result.ok, false);
  assert.ok(result.error, "debe incluir mensaje de error");
});

test("P0.5: communityGetReportStatusForReporter con reportId inexistente devuelve ok:false", () => {
  grantConsentFor("jugador-1");
  const result = communityGetReportStatusForReporter("reporte-que-no-existe", "jugador-1");
  assert.equal(result.ok, false);
  assert.ok(result.error, "debe incluir mensaje de error");
});

// ── P1.3 — Feed paginado ──────────────────────────────────────────────────

test("P1.3 feed: primera página devuelve items, nextCursor y hasMore correctos", () => {
  grantConsentFor("autor-1");
  for (let i = 0; i < 15; i++) communityCreatePost("autor-1", `Post ${i}`);

  grantConsentFor("lector-1");
  communityEnsureUserProfile("lector-1");
  // autor-1 publica con visibility=friends; necesito amistad para ver
  // En este test uso visibility por defecto "friends" y cargo sin amistad ->
  // el actor ve solo sus propios posts (los de "lector-1" = ninguno).
  // Para ver los de autor-1 necesitamos amistad. Usaré el viewerId = "autor-1".
  const result = communityGetFeedPage("autor-1", { limit: 5 });
  assert.equal(result.ok, true);
  assert.equal(result.items.length, 5);
  assert.equal(result.hasMore, true);
  assert.ok(result.nextCursor, "debe haber cursor para la siguiente página");
});

test("P1.3 feed: segunda página devuelve items distintos sin duplicados", () => {
  grantConsentFor("autor-feed");
  communityEnsureUserProfile("autor-feed");
  for (let i = 0; i < 12; i++) communityCreatePost("autor-feed", `Post ${i}`, { visibility: "friends" });

  const page1 = communityGetFeedPage("autor-feed", { limit: 7 });
  const page2 = communityGetFeedPage("autor-feed", { cursor: page1.nextCursor, limit: 7 });

  assert.equal(page1.ok, true);
  assert.equal(page2.ok, true);
  assert.equal(page1.items.length, 7);
  assert.equal(page2.items.length, 5);
  assert.equal(page2.hasMore, false);

  const allIds = [...page1.items.map((p) => p.id), ...page2.items.map((p) => p.id)];
  assert.equal(new Set(allIds).size, 12, "no debe haber duplicados entre páginas");
});

test("P1.3 feed: cursor inválido devuelve ok:false con error", () => {
  const result = communityGetFeedPage("actor-test", { cursor: "id-que-no-existe", limit: 5 });
  assert.equal(result.ok, false);
  assert.ok(result.error);
  assert.equal(result.items.length, 0);
});

test("P1.3 feed: feed vacío devuelve ok:true, items:[] hasMore:false", () => {
  grantConsentFor("actor-vacio");
  const result = communityGetFeedPage("actor-vacio", { limit: 10 });
  assert.equal(result.ok, true);
  assert.equal(result.items.length, 0);
  assert.equal(result.hasMore, false);
  assert.equal(result.nextCursor, null);
});

test("P1.3 feed: bloqueo excluye posts del bloqueado", () => {
  grantConsentFor("bloqueador");
  grantConsentFor("bloqueado");
  communityEnsureUserProfile("bloqueado");
  communityCreatePost("bloqueado", "post de bloqueado", { visibility: "friends" });
  communityBlockUser("bloqueador", "bloqueado");

  const result = communityGetFeedPage("bloqueador", { limit: 10 });
  assert.equal(result.ok, true);
  const leaks = result.items.filter((p) => p.authorId === "bloqueado");
  assert.equal(leaks.length, 0, "post de bloqueado no debe aparecer");
});

test("P1.3 feed: tenant isolation — club B no ve posts de club A", () => {
  grantConsentFor("autor-a");
  communityCreatePost("autor-a", "Post del club A", { visibility: "friends" });

  // Feed para el mismo userId pero en club B
  const resultB = communityGetFeedPage("autor-a", { limit: 10, clubId: COMMUNITY_BRIDGE_CLUB_B_ID });
  assert.equal(resultB.ok, true);
  assert.equal(resultB.items.length, 0, "club B no debe ver posts de club A");
});

test("P1.3 feed: cursor de club A es inválido en club B", () => {
  grantConsentFor("autor-a");
  communityEnsureUserProfile("autor-a");
  for (let i = 0; i < 3; i++) communityCreatePost("autor-a", `Post ${i}`, { visibility: "friends" });

  const pageA = communityGetFeedPage("autor-a", { limit: 2 });
  assert.equal(pageA.ok, true);
  assert.ok(pageA.nextCursor);

  // Usar el cursor de A en B debe fallar
  const resultB = communityGetFeedPage("autor-a", {
    cursor: pageA.nextCursor,
    limit: 10,
    clubId: COMMUNITY_BRIDGE_CLUB_B_ID,
  });
  assert.equal(resultB.ok, false, "cursor de club A debe ser inválido en club B");
});

// ── P1.3 — Notificaciones ─────────────────────────────────────────────────

test("P1.3 notif: communitySendFriendRequest genera notificación al destinatario", () => {
  grantConsentFor("solicitante");
  communityEnsureUserProfile("destinatario");
  communityEnsurePlayerProfile("destinatario");
  grantConsentFor("destinatario");
  communitySendFriendRequest("solicitante", "destinatario");

  const notifs = communityGetNotifications("destinatario");
  assert.ok(notifs.some((n) => n.notificationType === "friendship_request"), "debe haber notif de solicitud");
});

test("P1.3 notif: communityAcceptFriendRequest genera notificación al solicitante", () => {
  grantConsentFor("solicitante2");
  communityEnsureUserProfile("destinatario2");
  communityEnsurePlayerProfile("destinatario2");
  grantConsentFor("destinatario2");
  const { friendshipId } = communitySendFriendRequest("solicitante2", "destinatario2");
  communityAcceptFriendRequest(friendshipId, "destinatario2");

  const notifs = communityGetNotifications("solicitante2");
  assert.ok(notifs.some((n) => n.notificationType === "friendship_accepted"), "debe haber notif de aceptación");
});

test("P1.3 notif: communityFollowUser genera notificación al seguido", () => {
  grantConsentFor("seguidor");
  communityEnsurePlayerProfile("seguido", { visibilityLevel: "friends" });
  communityEnsureUserProfile("seguido");
  communityFollowUser("seguidor", "seguido");

  const notifs = communityGetNotifications("seguido");
  assert.ok(notifs.some((n) => n.notificationType === "new_follower"), "debe haber notif de nuevo seguidor");
});

test("P1.3 notif: communityCommentOnPost genera notificación al autor del post", () => {
  grantConsentFor("autor-post");
  grantConsentFor("comentador");
  communityEnsureUserProfile("comentador");
  // visibility "club" para que comentador (sin amistad) pueda ver el post
  const post = communityCreatePost("autor-post", "Post para comentar", { visibility: "club" });
  const r = communityCommentOnPost(post.postId, "comentador", "hola");
  assert.equal(r.ok, true, `el comentario debería funcionar: ${r.error}`);

  const notifs = communityGetNotifications("autor-post");
  assert.ok(notifs.some((n) => n.notificationType === "new_comment"), "debe haber notif de comentario");
});

test("P1.3 notif: communityReactToPost genera notificación al autor", () => {
  grantConsentFor("autor-react");
  grantConsentFor("reactor");
  communityEnsureUserProfile("reactor");
  const post = communityCreatePost("autor-react", "Post para reaccionar");
  communityReactToPost(post.postId, "reactor");

  const notifs = communityGetNotifications("autor-react");
  assert.ok(notifs.some((n) => n.notificationType === "new_reaction"), "debe haber notif de reacción");
});

test("P1.3 notif: communityGetUnreadCount aumenta con notificaciones nuevas", () => {
  grantConsentFor("n-actor");
  communityEnsureUserProfile("n-target");
  communityEnsurePlayerProfile("n-target");
  grantConsentFor("n-target");
  assert.equal(communityGetUnreadCount("n-target"), 0);
  communitySendFriendRequest("n-actor", "n-target");
  assert.equal(communityGetUnreadCount("n-target"), 1);
});

test("P1.3 notif: communityMarkNotificationRead marca una y reduce el contador", () => {
  grantConsentFor("mark-actor");
  communityEnsureUserProfile("mark-target");
  communityEnsurePlayerProfile("mark-target");
  grantConsentFor("mark-target");
  communitySendFriendRequest("mark-actor", "mark-target");
  const notifs = communityGetNotifications("mark-target");
  assert.equal(notifs.length, 1);

  const result = communityMarkNotificationRead(notifs[0].id, "mark-target");
  assert.equal(result.ok, true);
  assert.equal(communityGetUnreadCount("mark-target"), 0);
});

test("P1.3 notif: communityMarkNotificationRead falla si usuario incorrecto", () => {
  grantConsentFor("mark2-actor");
  communityEnsureUserProfile("mark2-target");
  communityEnsurePlayerProfile("mark2-target");
  grantConsentFor("mark2-target");
  communitySendFriendRequest("mark2-actor", "mark2-target");
  const notifs = communityGetNotifications("mark2-target");

  const result = communityMarkNotificationRead(notifs[0].id, "otro-usuario");
  assert.equal(result.ok, false);
  assert.ok(result.error);
});

test("P1.3 notif: communityMarkAllNotificationsRead marca todas y devuelve count", () => {
  grantConsentFor("all-actor");
  communityEnsureUserProfile("all-target");
  communityEnsurePlayerProfile("all-target");
  grantConsentFor("all-target");
  communitySendFriendRequest("all-actor", "all-target");
  communityFollowUser("all-actor", "all-target");

  assert.equal(communityGetUnreadCount("all-target"), 2);
  const result = communityMarkAllNotificationsRead("all-target");
  assert.equal(result.ok, true);
  assert.equal(result.count, 2);
  assert.equal(communityGetUnreadCount("all-target"), 0);
});

test("P1.3 notif: orden descendente — notificación más reciente primero", () => {
  grantConsentFor("order-actor");
  communityEnsureUserProfile("order-target");
  communityEnsurePlayerProfile("order-target");
  grantConsentFor("order-target");
  communitySendFriendRequest("order-actor", "order-target");
  communityFollowUser("order-actor", "order-target");

  const notifs = communityGetNotifications("order-target");
  assert.equal(notifs.length, 2);
  assert.ok(notifs[0].createdAt >= notifs[1].createdAt, "más reciente primero");
});

// ── P1.3 — Multi-club / tenant isolation ──────────────────────────────────

test("P1.3 multi-club: notificaciones de club A no aparecen en club B", () => {
  grantConsentFor("mc-actor");
  communityEnsureUserProfile("mc-target");
  communityEnsurePlayerProfile("mc-target");
  grantConsentFor("mc-target");
  communitySendFriendRequest("mc-actor", "mc-target");

  // Las notificaciones de club-demo-04 no deben aparecer en club-demo-05
  const notifsB = communityGetNotifications("mc-target", { clubId: COMMUNITY_BRIDGE_CLUB_B_ID });
  assert.equal(notifsB.length, 0, "notificaciones de club A no deben cruzar a club B");
});

test("P1.3 multi-club: unreadCount de club B es 0 aunque haya no-leídas en club A", () => {
  grantConsentFor("uc-actor");
  communityEnsureUserProfile("uc-target");
  communityEnsurePlayerProfile("uc-target");
  grantConsentFor("uc-target");
  communitySendFriendRequest("uc-actor", "uc-target");

  assert.equal(communityGetUnreadCount("uc-target", COMMUNITY_BRIDGE_CLUB_ID), 1);
  assert.equal(communityGetUnreadCount("uc-target", COMMUNITY_BRIDGE_CLUB_B_ID), 0);
});

test("P1.3 multi-club: repos son instancias separadas", () => {
  const repoA = __getRepoForClubForTests(COMMUNITY_BRIDGE_CLUB_ID);
  const repoB = __getRepoForClubForTests(COMMUNITY_BRIDGE_CLUB_B_ID);
  assert.notEqual(repoA, repoB, "deben ser instancias distintas");
  assert.equal(repoA.getClubId(), COMMUNITY_BRIDGE_CLUB_ID);
  assert.equal(repoB.getClubId(), COMMUNITY_BRIDGE_CLUB_B_ID);
});

test("P1.3 multi-club: markAllNotificationsRead en club A no afecta club B", () => {
  grantConsentFor("mab-actor");
  communityEnsureUserProfile("mab-target");
  communityEnsurePlayerProfile("mab-target");
  grantConsentFor("mab-target");
  communitySendFriendRequest("mab-actor", "mab-target");

  // Solo hay 1 notif en club A; club B tiene 0
  communityMarkAllNotificationsRead("mab-target", COMMUNITY_BRIDGE_CLUB_ID);
  assert.equal(communityGetUnreadCount("mab-target", COMMUNITY_BRIDGE_CLUB_B_ID), 0, "no debe afectar al otro club");
});

// ── P1.3 — Regresión P0/P1.1/P1.2 ───────────────────────────────────────

test("P1.3 regresión: P0 feed, amistad y partidos abiertos siguen funcionando tras cambios P1.3", () => {
  grantConsentFor("reg-actor");
  grantConsentFor("reg-amigo");
  communityEnsureUserProfile("reg-amigo");
  communityEnsurePlayerProfile("reg-amigo", { visibilityLevel: "friends" });

  const { friendshipId } = communitySendFriendRequest("reg-actor", "reg-amigo");
  communityAcceptFriendRequest(friendshipId, "reg-amigo");

  communityCreatePost("reg-actor", "post de regresión", { visibility: "friends" });
  const feed = communityGetVisibleFeed("reg-amigo");
  assert.ok(feed.length > 0, "amigo debe ver el post");

  const match = communityCreateOpenMatch("reg-actor", {
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
    visibility: "friends",
  });
  assert.equal(match.ok, true);

  // friendship_accepted va al solicitante (reg-actor), no al aceptante (reg-amigo)
  const notifsActor = communityGetNotifications("reg-actor");
  assert.ok(notifsActor.some((n) => n.notificationType === "friendship_accepted"), "notif aceptación OK");
});
