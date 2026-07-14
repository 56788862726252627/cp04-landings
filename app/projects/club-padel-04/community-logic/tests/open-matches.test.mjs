import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import {
  createOpenMatchMock,
  listVisibleOpenMatches,
  requestToJoin,
  acceptJoinRequest,
  rejectJoinRequest,
  cancelOpenMatch,
} from "../logic/open-matches.mjs";
import { blockUser } from "../logic/blocking.mjs";
import { revokeConsent } from "../logic/consent.mjs";

function futureDate() {
  return new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
}

test("crear partido abierto: requiere activity_sharing", () => {
  const { store, users, clubId } = buildSeedStore();
  revokeConsent(store, { clubId, userId: users.alice.id, consentType: "activity_sharing" });
  assert.throws(
    () => createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate() }),
    /activity_sharing/
  );
});

test("listado visible: respeta bloqueo (barrera 1) y visibilidad", () => {
  const { store, users, clubId } = buildSeedStore();
  createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate(), visibility: "club" });
  blockUser(store, { clubId, blockerId: users.bruno.id, blockedId: users.alice.id });

  const visible = listVisibleOpenMatches(store, users.bruno.id);
  assert.equal(visible.length, 0, "un partido de un usuario bloqueado no debe listarse");
});

test("solicitar plaza: nivel fuera de rango -> lanza error", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, {
    clubId,
    creatorId: users.alice.id,
    scheduledAt: futureDate(),
    levelMin: "avanzado",
    levelMax: "profesional",
  });
  // bruno tiene nivel "intermedio" por defecto en el seed -> fuera de rango.
  assert.throws(
    () => requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id }),
    /fuera del rango/
  );
});

test("solicitar plaza: doble solicitud pendiente del mismo usuario -> lanza error", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate() });
  requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });
  assert.throws(
    () => requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id }),
    /pendiente/
  );
});

test("solicitar plaza: barrera 2 — bloqueo detectado incluso si se fuerza la llamada directa", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate() });
  blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.carla.id });

  // Se llama directamente a requestToJoin (sin pasar por listVisibleOpenMatches),
  // simulando un fallo de la barrera 1 — debe seguir bloqueado por la barrera 2.
  assert.throws(
    () => requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.carla.id }),
    /bloqueado/
  );
});

test("aceptar solicitud: incrementa slots y cierra el partido a 'full' al completarse", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate(), slotsTotal: 2 });
  const invite = requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });

  acceptJoinRequest(store, { inviteId: invite.id, actingUserId: users.alice.id });

  assert.equal(match.slotsFilled, 2);
  assert.equal(match.status, "full");
});

test("aceptar solicitud: solo el creador puede aceptar", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate() });
  const invite = requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });

  assert.throws(
    () => acceptJoinRequest(store, { inviteId: invite.id, actingUserId: users.carla.id }),
    /Solo el creador/
  );
});

test("rechazar solicitud: no incrementa slots", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate() });
  const invite = requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });

  rejectJoinRequest(store, { inviteId: invite.id, actingUserId: users.alice.id });

  assert.equal(match.slotsFilled, 1);
  assert.equal(invite.status, "rejected");
});

test("cancelar partido: solo el creador, genera notificaciones a los ya aceptados", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate(), slotsTotal: 4 });
  const invite = requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });
  acceptJoinRequest(store, { inviteId: invite.id, actingUserId: users.alice.id });

  assert.throws(() => cancelOpenMatch(store, { openMatchId: match.id, actingUserId: users.bruno.id }), /Solo el creador/);

  cancelOpenMatch(store, { openMatchId: match.id, actingUserId: users.alice.id });
  assert.equal(match.status, "cancelled");
  const notif = store.notifications.find((n) => n.userId === users.bruno.id && n.payload.result === "match_cancelled");
  assert.ok(notif, "el jugador aceptado debe recibir notificación de cancelación");
});

test("partido cerrado (full): no acepta nuevas solicitudes", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate(), slotsTotal: 2 });
  const invite = requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.bruno.id });
  acceptJoinRequest(store, { inviteId: invite.id, actingUserId: users.alice.id });

  assert.throws(
    () => requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.carla.id }),
    /no acepta solicitudes/
  );
});
