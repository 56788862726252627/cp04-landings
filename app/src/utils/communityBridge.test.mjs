import test from "node:test";
import assert from "node:assert/strict";
import { beforeEach } from "node:test";

import {
  COMMUNITY_BRIDGE_CLUB_ID,
  __resetCommunityStoreForTests,
  communityHasSocialConsent,
  communityGrantSocialConsent,
  communityRevokeSocialConsent,
  communityIsBlocked,
  communityBlockUser,
  communityUnblockUser,
} from "./communityBridge.js";

import { createEmptyStore, createFriendship, blockUser } from "../../projects/club-padel-04/community-logic/index.mjs";

// Fase 1 de la integración real de Comunidad (2026-08-13): el puente es la
// única pieza nueva de código de negocio de esta fase (el resto es
// community-logic, ya probado con 59 tests propios). Estos tests cubren
// específicamente el contrato del puente, no repiten la cobertura de
// community-logic — solo confirman que lo invoca correctamente y que
// nunca convierte un error real en éxito.

beforeEach(() => {
  __resetCommunityStoreForTests();
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
