import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import { canView } from "../logic/permissions.mjs";
import { sendFriendRequest, acceptFriendRequest } from "../logic/friendship.mjs";
import { blockUser } from "../logic/blocking.mjs";

test("canView: el propio usuario siempre puede ver su propio dato", () => {
  const { store, users } = buildSeedStore();
  assert.equal(canView(store, users.alice.id, users.alice.id, "private"), true);
});

test("canView: visibilidad private -> nadie más puede verlo", () => {
  const { store, users } = buildSeedStore();
  assert.equal(canView(store, users.bruno.id, users.alice.id, "private"), false);
});

test("canView: visibilidad friends -> false sin amistad, true con amistad aceptada", () => {
  const { store, users, clubId } = buildSeedStore();
  assert.equal(canView(store, users.bruno.id, users.alice.id, "friends"), false);

  const req = sendFriendRequest(store, { clubId, requesterId: users.bruno.id, addresseeId: users.alice.id });
  acceptFriendRequest(store, { friendshipId: req.id, actingUserId: users.alice.id });

  assert.equal(canView(store, users.bruno.id, users.alice.id, "friends"), true);
});

test("canView: visibilidad club -> visible a cualquiera del mismo club", () => {
  const { store, users } = buildSeedStore();
  assert.equal(canView(store, users.bruno.id, users.alice.id, "club"), true);
});

test("canView: distinto club -> false aunque la visibilidad sea club", () => {
  const { store, users, clubId } = buildSeedStore();
  const otroClubUser = { ...users.bruno, id: "usuario-otro-club", clubId: "club-demo-99" };
  store.userProfiles.push(otroClubUser);
  assert.equal(canView(store, otroClubUser.id, users.alice.id, "club"), false);
});

test("canView: usuario bloqueado -> false incluso con visibilidad club", () => {
  const { store, users, clubId } = buildSeedStore();
  blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.bruno.id });
  assert.equal(canView(store, users.bruno.id, users.alice.id, "club"), false);
});

test("canView: espectador sin social_layer_opt_in -> false", () => {
  const { store, users } = buildSeedStore();
  assert.equal(canView(store, users.elena.id, users.alice.id, "club"), false);
});
