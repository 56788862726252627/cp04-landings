import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  areFriends,
} from "../logic/friendship.mjs";
import { followUser, unfollowUser, countFollowers } from "../logic/follow.mjs";
import { blockUser } from "../logic/blocking.mjs";

test("enviar solicitud de amistad: flujo feliz", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  assert.equal(req.status, "pending");
});

test("enviar solicitud de amistad: duplicada -> lanza error", () => {
  const { store, users, clubId } = buildSeedStore();
  sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  assert.throws(
    () => sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id }),
    /pendiente/
  );
});

test("enviar solicitud de amistad: entre usuarios bloqueados -> lanza error", () => {
  const { store, users, clubId } = buildSeedStore();
  blockUser(store, { clubId, blockerId: users.bruno.id, blockedId: users.alice.id });
  assert.throws(
    () => sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id }),
    /bloqueados/
  );
});

test("aceptar solicitud: solo el destinatario puede aceptar", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });

  assert.throws(() => acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.alice.id }), /destinatario/);

  const accepted = acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.bruno.id });
  assert.equal(accepted.status, "accepted");
  assert.equal(areFriends(store, users.alice.id, users.bruno.id), true);
});

test("rechazar solicitud: no crea amistad", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  rejectFriendRequest(store, { friendshipId: req.id, actingUserId: users.bruno.id });
  assert.equal(areFriends(store, users.alice.id, users.bruno.id), false);
});

test("cancelar solicitud enviada: solo el remitente puede cancelarla", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });

  assert.throws(() => cancelFriendRequest(store, { friendshipId: req.id, actingUserId: users.bruno.id }), /Solo quien envió/);

  const cancelled = cancelFriendRequest(store, { friendshipId: req.id, actingUserId: users.alice.id });
  assert.equal(cancelled.status, "cancelled");
});

test("eliminar amigo: borrado inmediato, deja de ser amigo", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.bruno.id });

  removeFriend(store, { actingUserId: users.alice.id, otherUserId: users.bruno.id });
  assert.equal(areFriends(store, users.alice.id, users.bruno.id), false);
});

test("seguir jugador: requiere visibilidad club o superior", () => {
  const { store, users, clubId } = buildSeedStore();
  // Perfil de Elena está en visibilidad "private" (ver seed) -> no se puede seguir.
  assert.throws(
    () => followUser(store, { clubId, followerId: users.alice.id, followedId: users.elena.id }),
    /visibilidad insuficiente/
  );

  followUser(store, { clubId, followerId: users.alice.id, followedId: users.bruno.id });
  assert.equal(countFollowers(store, users.bruno.id), 1);
});

test("seguir jugador: no se puede seguir a un usuario bloqueado", () => {
  const { store, users, clubId } = buildSeedStore();
  blockUser(store, { clubId, blockerId: users.carla.id, blockedId: users.alice.id });
  assert.throws(
    () => followUser(store, { clubId, followerId: users.alice.id, followedId: users.carla.id }),
    /bloqueado/
  );
});

test("dejar de seguir: elimina la relación", () => {
  const { store, users, clubId } = buildSeedStore();
  followUser(store, { clubId, followerId: users.alice.id, followedId: users.bruno.id });
  unfollowUser(store, { followerId: users.alice.id, followedId: users.bruno.id });
  assert.equal(countFollowers(store, users.bruno.id), 0);
});

test("bloquear deshace amistad y seguimiento existentes (regla propuesta, sección 17)", () => {
  const { store, users, clubId } = buildSeedStore();
  const req = sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.bruno.id });
  acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.bruno.id });
  followUser(store, { clubId, followerId: users.alice.id, followedId: users.bruno.id });

  assert.equal(areFriends(store, users.alice.id, users.bruno.id), true);
  assert.equal(countFollowers(store, users.bruno.id), 1);

  blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.bruno.id });

  assert.equal(areFriends(store, users.alice.id, users.bruno.id), false, "el bloqueo debe deshacer la amistad");
  assert.equal(countFollowers(store, users.bruno.id), 0, "el bloqueo debe deshacer el seguimiento");
});
