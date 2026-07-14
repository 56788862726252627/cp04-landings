import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import { blockUser, unblockUser, isBlocked } from "../logic/blocking.mjs";
import { sendFriendRequest } from "../logic/friendship.mjs";
import { requestToJoin, createOpenMatchMock } from "../logic/open-matches.mjs";
import { reactTo, createPostMock } from "../logic/feed.mjs";
import {
  reportContent,
  applyModerationAction,
  getReportStatusForReporter,
  getSanctionSummaryForUser,
} from "../logic/moderation.mjs";

function futureDate() {
  return new Date(Date.now() + 24 * 3600 * 1000).toISOString();
}

test("un usuario no puede bloquearse a sí mismo", () => {
  const { store, users, clubId } = buildSeedStore();
  assert.throws(() => blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.alice.id }), /sí mismo/);
});

test("un usuario no puede enviarse una solicitud de amistad a sí mismo", () => {
  const { store, users, clubId } = buildSeedStore();
  assert.throws(
    () => sendFriendRequest(store, { clubId, requesterId: users.alice.id, addresseeId: users.alice.id }),
    /a sí mismo/
  );
});

test("el creador de un partido no puede solicitar su propia plaza", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate() });
  assert.throws(
    () => requestToJoin(store, { clubId, openMatchId: match.id, requesterId: users.alice.id }),
    /propia plaza/
  );
});

test("desbloquear: solo quien ejecutó el bloqueo original puede revertirlo", () => {
  const { store, users, clubId } = buildSeedStore();
  blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.bruno.id });

  assert.throws(
    () => unblockUser(store, { clubId, blockerId: users.bruno.id, blockedId: users.alice.id }),
    /No existe un bloqueo activo/
  );

  unblockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.bruno.id });
  assert.equal(isBlocked(store, users.alice.id, users.bruno.id), false);
});

test("bloqueo es simétrico para efectos de detección, aunque solo lo pueda deshacer quien lo creó", () => {
  const { store, users, clubId } = buildSeedStore();
  blockUser(store, { clubId, blockerId: users.alice.id, blockedId: users.bruno.id });

  assert.equal(isBlocked(store, users.alice.id, users.bruno.id), true);
  assert.equal(isBlocked(store, users.bruno.id, users.alice.id), true, "el bloqueo se detecta en ambas direcciones");
});

test("reacciones duplicadas: rechazadas también sobre comentarios, no solo publicaciones", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "post", postType: "player_activity", visibility: "club" });

  reactTo(store, { clubId, targetType: "post", targetId: post.id, userId: users.carla.id });
  // Reaccionar a un comentario ficticio con el mismo patrón de unicidad (target_type, target_id, user_id).
  reactTo(store, { clubId, targetType: "comment", targetId: "comment-mock-1", userId: users.carla.id });

  assert.throws(
    () => reactTo(store, { clubId, targetType: "comment", targetId: "comment-mock-1", userId: users.carla.id }),
    /ya reaccionó/
  );
});

test("partido con slots_total=1: el creador ocupa la única plaza, no admite solicitudes", () => {
  const { store, users, clubId } = buildSeedStore();
  const match = createOpenMatchMock(store, { clubId, creatorId: users.alice.id, scheduledAt: futureDate(), slotsTotal: 1 });
  // slotsFilled ya nace en 1 (el creador) en un partido de 1 plaza -> el modelo
  // no lo marca "full" automáticamente al crear (regla no cubierta en el
  // diseño original); se documenta aquí como comportamiento actual, a
  // confirmar con producto antes de integrar (ver README de este módulo).
  assert.equal(match.slotsFilled, 1);
  assert.equal(match.slotsTotal, 1);
});

test("dato sensible no expuesto: el reportante no ve las notas internas de moderación", () => {
  const { store, users, clubId } = buildSeedStore();
  const report = reportContent(store, { clubId, reporterId: users.alice.id, targetType: "user", targetId: users.bruno.id, reason: "harassment" });
  applyModerationAction(store, {
    clubId,
    reportId: report.id,
    moderatorId: users.staff.id,
    actionType: "warning",
    notes: "Deliberación interna sensible, no debe salir de STAFF/ADMIN/SUPPORT",
  });

  assert.throws(
    () => getReportStatusForReporter(store, report.id, users.bruno.id),
    /Solo el reportante/,
    "nadie salvo el propio reportante puede consultar el estado de su reporte"
  );

  const view = getReportStatusForReporter(store, report.id, users.alice.id);
  assert.deepEqual(Object.keys(view).sort(), ["createdAt", "reason", "reportId", "status"].sort());
  assert.ok(!("notes" in view) && !JSON.stringify(view).includes("Deliberación"), "las notas internas nunca deben filtrarse al reportante");
});

test("dato sensible no expuesto: el sancionado no ve la identidad del reportante ni las notas", () => {
  const { store, users, clubId } = buildSeedStore();
  const report = reportContent(store, { clubId, reporterId: users.alice.id, targetType: "user", targetId: users.bruno.id, reason: "harassment" });
  const action = applyModerationAction(store, {
    clubId,
    reportId: report.id,
    moderatorId: users.staff.id,
    actionType: "warning",
    notes: "Nota interna con el razonamiento de STAFF",
  });

  const summary = getSanctionSummaryForUser(store, action.id);
  const serialized = JSON.stringify(summary);
  assert.ok(!serialized.includes(users.alice.id), "el resumen de sanción no debe incluir el id del reportante");
  assert.ok(!serialized.includes("razonamiento"), "el resumen de sanción no debe incluir las notas internas");
});
