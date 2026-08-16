// Tests P1.3 — notificaciones sociales y feed paginado (lógica aislada).
import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import {
  listNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  getPaginatedFeed,
} from "../logic/notifications.mjs";
import { createNotification } from "../entities/store.mjs";
import { sendFriendRequest, acceptFriendRequest } from "../logic/friendship.mjs";
import { followUser } from "../logic/follow.mjs";
import { createPostMock, getVisibleFeed, commentOnPost, reactTo } from "../logic/feed.mjs";
import { createOpenMatchMock, requestToJoin } from "../logic/open-matches.mjs";
import { blockUser } from "../logic/blocking.mjs";

// ── Notificaciones generadas por amistad ──────────────────────────────────

test("sendFriendRequest genera notificación friendship_request para el destinatario", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  const notif = store.notifications.find(
    (n) => n.userId === users.bruno.id && n.notificationType === "friendship_request"
  );
  assert.ok(notif, "el destinatario debe recibir notificación");
  assert.equal(notif.payload.requesterId, users.alice.id);
  assert.equal(notif.clubId, clubId);
});

test("acceptFriendRequest genera notificación friendship_accepted para el solicitante", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.bruno.id });
  const notif = store.notifications.find(
    (n) => n.userId === users.alice.id && n.notificationType === "friendship_accepted"
  );
  assert.ok(notif, "el solicitante debe recibir notificación de aceptación");
  assert.equal(notif.payload.acceptedBy, users.bruno.id);
});

// ── Notificaciones generadas por seguimiento ──────────────────────────────

test("followUser genera notificación new_follower para el seguido", () => {
  const { store, users, clubId } = buildSeedStore();
  followUser(store, { clubId, followerId: users.alice.id, followedId: users.carla.id });
  const notif = store.notifications.find(
    (n) => n.userId === users.carla.id && n.notificationType === "new_follower"
  );
  assert.ok(notif, "el seguido debe recibir notificación");
  assert.equal(notif.payload.followerId, users.alice.id);
});

// ── Notificaciones generadas por comentarios y reacciones ─────────────────

test("commentOnPost genera notificación new_comment para el autor del post", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "test", visibility: "club" });
  commentOnPost(store, { clubId, postId: post.id, authorId: users.bruno.id, body: "buen partido" });
  const notif = store.notifications.find(
    (n) => n.userId === users.alice.id && n.notificationType === "new_comment"
  );
  assert.ok(notif, "el autor del post debe recibir notificación de comentario");
  assert.equal(notif.payload.postId, post.id);
});

test("commentOnPost no genera notificación si el autor comenta su propio post", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "self comment test", visibility: "club" });
  commentOnPost(store, { clubId, postId: post.id, authorId: users.alice.id, body: "me contesto" });
  const notifs = store.notifications.filter(
    (n) => n.userId === users.alice.id && n.notificationType === "new_comment"
  );
  assert.equal(notifs.length, 0, "no debe autonotificarse");
});

test("reactTo post genera notificación new_reaction para el autor del post", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "reacción test", visibility: "club" });
  reactTo(store, { clubId, targetType: "post", targetId: post.id, userId: users.bruno.id });
  const notif = store.notifications.find(
    (n) => n.userId === users.alice.id && n.notificationType === "new_reaction"
  );
  assert.ok(notif, "el autor debe recibir notificación de reacción");
  assert.equal(notif.payload.userId, users.bruno.id);
});

test("reactTo no genera notificación si el actor reacciona a su propio contenido", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "self react", visibility: "club" });
  reactTo(store, { clubId, targetType: "post", targetId: post.id, userId: users.alice.id });
  const notifs = store.notifications.filter(
    (n) => n.userId === users.alice.id && n.notificationType === "new_reaction"
  );
  assert.equal(notifs.length, 0, "no debe autonotificarse");
});

// ── Notificaciones de partidos abiertos (ya existentes, regresión) ────────

test("requestToJoin genera notificación match_invite para el creador (regresión P0.3)", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, {
    clubId,
    creatorId: users.alice.id,
    scheduledAt: new Date(Date.now() + 86400000).toISOString(),
  });
  requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });
  const notif = store.notifications.find(
    (n) => n.userId === users.alice.id && n.notificationType === "match_invite"
  );
  assert.ok(notif, "el creador debe recibir notificación de solicitud de plaza");
});

// ── listNotifications ─────────────────────────────────────────────────────

test("listNotifications devuelve solo las notificaciones del usuario en el club indicado", () => {
  const { store, users, clubId } = buildSeedStore();
  const OTHER_CLUB = "otro-club";
  store.notifications.push(
    createNotification({ clubId, userId: users.alice.id, notificationType: "test_a", payload: {} }),
    createNotification({ clubId, userId: users.alice.id, notificationType: "test_b", payload: {} }),
    createNotification({ clubId: OTHER_CLUB, userId: users.alice.id, notificationType: "cross_tenant", payload: {} }),
    createNotification({ clubId, userId: users.bruno.id, notificationType: "other_user", payload: {} })
  );
  const notifs = listNotifications(store, { userId: users.alice.id, clubId });
  assert.equal(notifs.length, 2);
  assert.ok(notifs.every((n) => n.clubId === clubId && n.userId === users.alice.id));
});

test("listNotifications: tenant isolation — otro club no filtra en las notificaciones de este club", () => {
  const { store, users, clubId } = buildSeedStore();
  const OTHER = "club-otro";
  store.notifications.push(
    createNotification({ clubId: OTHER, userId: users.alice.id, notificationType: "cross", payload: {} })
  );
  const notifs = listNotifications(store, { userId: users.alice.id, clubId });
  assert.equal(notifs.length, 0, "notificación de otro club no debe aparecer");
});

test("listNotifications: orden cronológico descendente", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  followUser(store, { clubId, followerId: users.carla.id, followedId: users.bruno.id });
  const notifs = listNotifications(store, { userId: users.bruno.id, clubId });
  for (let i = 1; i < notifs.length; i++) {
    assert.ok(
      notifs[i - 1].createdAt >= notifs[i].createdAt,
      "deben estar en orden descendente"
    );
  }
});

test("listNotifications: limit respetado", () => {
  const { store, users, clubId } = buildSeedStore();
  for (let i = 0; i < 15; i++) {
    store.notifications.push(
      createNotification({ clubId, userId: users.alice.id, notificationType: "test", payload: {} })
    );
  }
  const notifs = listNotifications(store, { userId: users.alice.id, clubId, limit: 5 });
  assert.equal(notifs.length, 5);
});

// ── getUnreadCount ────────────────────────────────────────────────────────

test("getUnreadCount devuelve 0 si no hay notificaciones", () => {
  const { store, users, clubId } = buildSeedStore();
  assert.equal(getUnreadCount(store, users.alice.id, clubId), 0);
});

test("getUnreadCount incrementa cuando se generan notificaciones", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  assert.equal(getUnreadCount(store, users.bruno.id, clubId), 1);
});

test("getUnreadCount es 0 para otro club (tenant isolation)", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  assert.equal(getUnreadCount(store, users.bruno.id, "otro-club"), 0);
});

// ── markNotificationRead ──────────────────────────────────────────────────

test("markNotificationRead marca una notificación como leída", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  const notif = store.notifications.find((n) => n.userId === users.bruno.id);
  assert.ok(!notif.readAt, "debe estar no leída inicialmente");

  const result = markNotificationRead(store, notif.id, users.bruno.id);
  assert.equal(result.ok, true);
  assert.ok(notif.readAt, "debe tener readAt tras marcarla");
  assert.equal(getUnreadCount(store, users.bruno.id, clubId), 0);
});

test("markNotificationRead falla si el usuario no es el destinatario", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  const notif = store.notifications.find((n) => n.userId === users.bruno.id);
  const result = markNotificationRead(store, notif.id, users.alice.id);
  assert.equal(result.ok, false);
  assert.ok(result.error);
});

test("markNotificationRead con id inexistente devuelve ok:false", () => {
  const { store } = buildSeedStore();
  const result = markNotificationRead(store, "no-existe", "cualquier-usuario");
  assert.equal(result.ok, false);
});

// ── markAllNotificationsRead ──────────────────────────────────────────────

test("markAllNotificationsRead marca todas las no leídas del usuario en el club", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  followUser(store, { clubId, followerId: users.carla.id, followedId: users.bruno.id });
  assert.equal(getUnreadCount(store, users.bruno.id, clubId), 2);

  const result = markAllNotificationsRead(store, users.bruno.id, clubId);
  assert.equal(result.ok, true);
  assert.equal(result.count, 2);
  assert.equal(getUnreadCount(store, users.bruno.id, clubId), 0);
});

test("markAllNotificationsRead no afecta notificaciones de otro club (tenant isolation)", () => {
  const { store, users, clubId } = buildSeedStore();
  const OTHER = "club-otro";
  store.notifications.push(
    createNotification({ clubId: OTHER, userId: users.alice.id, notificationType: "test", payload: {} })
  );
  markAllNotificationsRead(store, users.alice.id, clubId);
  const otherNotif = store.notifications.find(
    (n) => n.userId === users.alice.id && n.clubId === OTHER
  );
  assert.ok(!otherNotif.readAt, "la notificación del otro club no debe marcarse");
});

test("markAllNotificationsRead: count 0 si no hay no leídas", () => {
  const { store, users, clubId } = buildSeedStore();
  const result = markAllNotificationsRead(store, users.alice.id, clubId);
  assert.equal(result.count, 0);
});

// ── getPaginatedFeed ──────────────────────────────────────────────────────

test("getPaginatedFeed: primera página con limit < total", () => {
  const { store, users, clubId } = buildSeedStore();
  for (let i = 0; i < 15; i++) {
    createPostMock(store, { clubId, authorId: users.alice.id, body: `post ${i}`, visibility: "club" });
  }
  const result = getPaginatedFeed(store, users.alice.id, { limit: 5, getVisibleFeed });
  assert.equal(result.ok, true);
  assert.equal(result.items.length, 5);
  assert.equal(result.hasMore, true);
  assert.ok(result.nextCursor, "debe devolver cursor");
});

test("getPaginatedFeed: segunda página sin duplicados", () => {
  const { store, users, clubId } = buildSeedStore();
  for (let i = 0; i < 8; i++) {
    createPostMock(store, { clubId, authorId: users.alice.id, body: `post ${i}`, visibility: "club" });
  }
  const page1 = getPaginatedFeed(store, users.alice.id, { limit: 5, getVisibleFeed });
  const page2 = getPaginatedFeed(store, users.alice.id, { cursor: page1.nextCursor, limit: 5, getVisibleFeed });
  assert.equal(page2.ok, true);
  assert.equal(page2.items.length, 3);
  assert.equal(page2.hasMore, false);

  const allIds = [...page1.items.map((p) => p.id), ...page2.items.map((p) => p.id)];
  assert.equal(new Set(allIds).size, allIds.length, "no debe haber duplicados");
});

test("getPaginatedFeed: cursor inválido devuelve error", () => {
  const { store, users } = buildSeedStore();
  const result = getPaginatedFeed(store, users.alice.id, { cursor: "id-que-no-existe", limit: 5, getVisibleFeed });
  assert.equal(result.ok, false);
  assert.equal(result.error, "cursor_invalid");
});

test("getPaginatedFeed: feed vacío devuelve hasMore false y items []", () => {
  const { store, users } = buildSeedStore();
  const result = getPaginatedFeed(store, users.alice.id, { limit: 5, getVisibleFeed });
  assert.equal(result.ok, true);
  assert.equal(result.items.length, 0);
  assert.equal(result.hasMore, false);
  assert.equal(result.nextCursor, null);
});

test("getPaginatedFeed: respeta bloqueo — posts de bloqueado no aparecen", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.alice.id, body: "visible", visibility: "club" });
  createPostMock(store, { clubId, authorId: users.dani.id, body: "de bloqueado", visibility: "club" });
  blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.dani.id });

  const result = getPaginatedFeed(store, users.alice.id, { limit: 10, getVisibleFeed });
  assert.equal(result.ok, true);
  const hasBlockedPost = result.items.some((p) => p.authorId === users.dani.id);
  assert.equal(hasBlockedPost, false, "post de usuario bloqueado no debe aparecer");
});

test("getPaginatedFeed: respeta visibilidad 'friends'", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.alice.id, body: "solo amigos", visibility: "friends" });

  const resultBruno = getPaginatedFeed(store, users.bruno.id, { limit: 10, getVisibleFeed });
  assert.equal(resultBruno.items.length, 0, "no amigo no debe ver post friends");

  const req = sendFriendRequest(store, { clubId, requesterId: users.bruno.id, addresseeId: users.alice.id });
  acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.alice.id });

  const resultFriend = getPaginatedFeed(store, users.bruno.id, { limit: 10, getVisibleFeed });
  assert.equal(resultFriend.items.length, 1, "tras amistad debe ver el post");
});

test("getPaginatedFeed: sin consentimiento devuelve feed vacío", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.alice.id, body: "test", visibility: "club" });

  // Elena no tiene social_layer_opt_in en buildSeedStore
  const result = getPaginatedFeed(store, users.elena.id, { limit: 10, getVisibleFeed });
  assert.equal(result.ok, true);
  assert.equal(result.items.length, 0, "sin consentimiento el feed es vacío");
});
