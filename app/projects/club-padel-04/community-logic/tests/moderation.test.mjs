import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import { createPostMock } from "../logic/feed.mjs";
import {
  reportContent,
  markInReview,
  applyModerationAction,
  dismissReport,
  isContentHidden,
} from "../logic/moderation.mjs";

test("reportar contenido: disponible sin gate de consentimiento adicional", () => {
  const { store, users, clubId } = buildSeedStore();
  // Elena no tiene social_layer_opt_in activo y aun así puede reportar
  // (reportar es una función de protección, no de exposición — ver
  // MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md, sección 21).
  const report = reportContent(store, {
    clubId,
    reporterId: users.elena.id,
    targetType: "user",
    targetId: users.bruno.id,
    reason: "harassment",
  });
  assert.equal(report.status, "open");
});

test("marcar en revisión: requiere rol STAFF/ADMIN/SUPPORT", () => {
  const { store, users, clubId } = buildSeedStore();
  const report = reportContent(store, { clubId, reporterId: users.alice.id, targetType: "user", targetId: users.bruno.id, reason: "spam" });

  assert.throws(() => markInReview(store, { reportId: report.id, moderatorId: users.alice.id }), /Rol no autorizado/);

  const updated = markInReview(store, { reportId: report.id, moderatorId: users.staff.id });
  assert.equal(updated.status, "in_review");
});

test("aplicar acción de moderación: PLAYER no autorizado", () => {
  const { store, users, clubId } = buildSeedStore();
  const report = reportContent(store, { clubId, reporterId: users.alice.id, targetType: "user", targetId: users.bruno.id, reason: "spam" });

  assert.throws(
    () => applyModerationAction(store, { clubId, reportId: report.id, moderatorId: users.carla.id, actionType: "warning" }),
    /Rol no autorizado/
  );
});

test("user_banned/user_suspended: reservados a ADMIN, STAFF no puede ejecutarlos", () => {
  const { store, users, clubId } = buildSeedStore();
  const report = reportContent(store, { clubId, reporterId: users.alice.id, targetType: "user", targetId: users.bruno.id, reason: "harassment" });

  assert.throws(
    () => applyModerationAction(store, { clubId, reportId: report.id, moderatorId: users.staff.id, actionType: "user_banned" }),
    /Solo ADMIN/
  );

  const action = applyModerationAction(store, { clubId, reportId: report.id, moderatorId: users.admin.id, actionType: "user_banned" });
  assert.equal(action.actionType, "user_banned");
});

test("content_removed: oculta el post reportado", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "contenido dudoso", postType: "player_activity", visibility: "club" });
  const report = reportContent(store, { clubId, reporterId: users.bruno.id, targetType: "post", targetId: post.id, reason: "inappropriate_content" });

  applyModerationAction(store, { clubId, reportId: report.id, moderatorId: users.staff.id, actionType: "content_removed" });

  assert.equal(isContentHidden(store, "post", post.id), true);
  assert.equal(post.hiddenByModeration, true);
});

test("desestimar reporte: no procede, el contenido no se oculta", () => {
  const { store, users, clubId } = buildSeedStore();
  const post = createPostMock(store, { clubId, authorId: users.alice.id, body: "contenido normal", postType: "player_activity", visibility: "club" });
  const report = reportContent(store, { clubId, reporterId: users.bruno.id, targetType: "post", targetId: post.id, reason: "other" });

  const action = dismissReport(store, { reportId: report.id, moderatorId: users.staff.id, notes: "no procede" });

  assert.equal(action.actionType, "no_action");
  assert.equal(report.status, "dismissed");
  assert.equal(isContentHidden(store, "post", post.id), false);
});

test("toda ModerationAction requiere moderatorId humano explícito (nunca ejecución automática)", () => {
  const { store, users, clubId } = buildSeedStore();
  const report = reportContent(store, { clubId, reporterId: users.alice.id, targetType: "user", targetId: users.bruno.id, reason: "spam" });

  assert.throws(
    () => applyModerationAction(store, { clubId, reportId: report.id, moderatorId: undefined, actionType: "warning" }),
    /Rol no autorizado/,
    "sin un moderatorId válido con rol autorizado, la acción debe rechazarse siempre"
  );
});
