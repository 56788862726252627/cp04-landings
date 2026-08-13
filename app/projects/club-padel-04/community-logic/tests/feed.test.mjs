import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import { createPostMock, getVisibleFeed, commentOnPost, reactTo } from "../logic/feed.mjs";
import { sendFriendRequest, acceptFriendRequest } from "../logic/friendship.mjs";
import { blockUser } from "../logic/blocking.mjs";
import { revokeConsent } from "../logic/consent.mjs";

test("crear publicación: autor con consentimiento -> visible en su propio feed", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.alice.id, body: "Buen partido hoy", postType: "player_activity", visibility: "club" });

  const feed = getVisibleFeed(store, users.alice.id);
  assert.equal(feed.length, 1);
  assert.equal(feed[0].body, "Buen partido hoy");
});

test("crear publicación: sin social_layer_opt_in -> lanza error", () => {
  const { store, users, clubId } = buildSeedStore();
  assert.throws(
    () => createPostMock(store, { clubId, authorId: users.elena.id, body: "hola", postType: "player_activity" }),
    /social_layer_opt_in/
  );
});

test("crear publicación player_activity: sin appear_in_feed -> lanza error", () => {
  const { store, users, clubId } = buildSeedStore();
  revokeConsent(store, { clubId, userId: users.bruno.id, consentType: "appear_in_feed" });
  assert.throws(
    () => createPostMock(store, { clubId, authorId: users.bruno.id, body: "hola", postType: "player_activity" }),
    /appear_in_feed/
  );
});

test("crear club_announcement: PLAYER no autorizado, STAFF sí", () => {
  const { store, users, clubId } = buildSeedStore();
  assert.throws(
    () => createPostMock(store, { clubId, authorId: users.alice.id, body: "Anuncio", postType: "club_announcement" }),
    /STAFF\/ADMIN/
  );
  const post = createPostMock(store, { clubId, authorId: users.staff.id, body: "Anuncio oficial", postType: "club_announcement", visibility: "club" });
  assert.equal(post.postType, "club_announcement");
});

test("visibilidad friends: no visible para no-amigos, visible tras aceptar amistad", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.alice.id, body: "Solo para amigos", postType: "player_activity", visibility: "friends" });

  let feedBruno = getVisibleFeed(store, users.bruno.id);
  assert.equal(feedBruno.length, 0, "sin amistad, el post friends no debe verse");

  const req = sendFriendRequest(store, { clubId, requesterId: users.bruno.id, addresseeId: users.alice.id });
  acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.alice.id });

  feedBruno = getVisibleFeed(store, users.bruno.id);
  assert.equal(feedBruno.length, 1, "tras aceptar amistad, el post friends debe verse");
});

test("bloqueo oculta el contenido del feed en ambas direcciones", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.carla.id, body: "Visible al club", postType: "player_activity", visibility: "club" });

  blockUser(store, { clubId, blockerId: users.dani.id, blockedId: users.carla.id });

  assert.equal(getVisibleFeed(store, users.dani.id).length, 0);
});

test("contenido oculto por moderación: no visible a PLAYER, visible a STAFF/ADMIN", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "Contenido a moderar", postType: "player_activity", visibility: "club" });
  post.hiddenByModeration = true;

  assert.equal(getVisibleFeed(store, users.bruno.id).length, 0);
  assert.equal(getVisibleFeed(store, users.admin.id).some((p) => p.id === post.id), true);
});

test("comentar: bloqueo impide comentar contenido del bloqueado", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "Post", postType: "player_activity", visibility: "club" });
  blockUser(store, { clubId, blockerId: users.bruno.id, blockedId: users.alice.id });

  assert.throws(
    () => commentOnPost(store, { clubId, postId: post.id, authorId: users.bruno.id, body: "comentario" }),
    /bloqueado/
  );
});

test("reaccionar: un usuario no puede reaccionar dos veces al mismo contenido", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "Post", postType: "player_activity", visibility: "club" });

  reactTo(store, { clubId, targetType: "post", targetId: post.id, userId: users.bruno.id });
  assert.throws(
    () => reactTo(store, { clubId, targetType: "post", targetId: post.id, userId: users.bruno.id }),
    /ya reaccionó/
  );
});
