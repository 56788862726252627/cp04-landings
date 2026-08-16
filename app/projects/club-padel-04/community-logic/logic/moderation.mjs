// Comunidad Pádel 04 — Lógica aislada: moderación y reportes
// Espejo funcional de MODERACION_REPORTES_ROLES_COMUNIDAD_PADEL_04.md y
// MATRIZ_ACCIONES_MODERACION_COMUNIDAD_PADEL_04.md.
//
// Regla explícita: ninguna función de este archivo ejecuta una acción de
// moderación de forma automática — toda ModerationAction requiere un
// moderatorId humano con rol STAFF/ADMIN/SUPPORT, pasado explícitamente por
// quien llama a la función (nunca inferido ni por defecto).

import { createReport, createModerationAction, createNotification, appendAudit } from "../entities/store.mjs";

const MODERATOR_ROLES = ["STAFF", "ADMIN", "SUPPORT"];
const ADMIN_ONLY_ACTIONS = ["user_suspended", "user_banned"];

/** Reportar contenido o usuario — sin gate de consentimiento, disponible siempre. */
export function reportContent(store, { clubId, reporterId, targetType, targetId, reason, details = null }) {
  const report = createReport({ clubId, reporterId, targetType, targetId, reason, details });
  store.reports.push(report);

  appendAudit(store, {
    clubId,
    actorId: reporterId,
    action: "report.created",
    targetType: "Report",
    targetId: report.id,
    metadata: { targetType, targetId, reason },
  });

  return report;
}

/** Marcar un reporte "en revisión" — cualquier STAFF/ADMIN/SUPPORT. */
export function markInReview(store, { reportId, moderatorId }) {
  const report = store.reports.find((r) => r.id === reportId);
  if (!report) throw new Error("Reporte no encontrado");
  assertModeratorRole(store, moderatorId);
  if (report.status !== "open") throw new Error("Solo un reporte abierto puede pasar a revisión");

  report.status = "in_review";
  return report;
}

/**
 * Aplica una acción de moderación sobre un reporte. Reafirma la regla
 * explícita: requiere moderatorId humano con rol válido, nunca automática.
 * user_suspended/user_banned están reservados a ADMIN (STAFF no puede
 * ejecutarlos, solo proponer escalado).
 */
export function applyModerationAction(store, { clubId, reportId, moderatorId, actionType, notes = null }) {
  const report = store.reports.find((r) => r.id === reportId);
  if (!report) throw new Error("Reporte no encontrado");

  const moderator = assertModeratorRole(store, moderatorId);

  if (ADMIN_ONLY_ACTIONS.includes(actionType) && moderator.role !== "ADMIN") {
    throw new Error(`Solo ADMIN puede ejecutar la acción "${actionType}"`);
  }

  const action = createModerationAction({ clubId, reportId, moderatorId, actionType, notes });
  store.moderationActions.push(action);

  if (actionType === "content_removed") {
    hideReportedContent(store, report);
  }

  report.status = actionType === "no_action" ? "dismissed" : "resolved";
  report.resolvedAt = new Date().toISOString();

  appendAudit(store, {
    clubId,
    actorId: moderatorId,
    action: "moderation_action.created",
    targetType: "ModerationAction",
    targetId: action.id,
    metadata: { reportId, actionType },
  });

  // Notificar al usuario afectado — nunca incluir moderatorId ni reporterId.
  const NOTIFY_ACTIONS = ["warning", "content_removed", "user_suspended", "user_banned"];
  if (NOTIFY_ACTIONS.includes(actionType)) {
    let affectedUserId = null;
    if (report.targetType === "post") {
      const post = store.posts.find((p) => p.id === report.targetId);
      if (post) affectedUserId = post.authorId;
    } else if (report.targetType === "comment") {
      const comment = store.comments.find((c) => c.id === report.targetId);
      if (comment) affectedUserId = comment.authorId;
    } else if (report.targetType === "user") {
      affectedUserId = report.targetId;
    }
    if (affectedUserId) {
      store.notifications.push(
        createNotification({
          clubId,
          userId: affectedUserId,
          notificationType: "moderation_action",
          payload: { actionType },
        })
      );
    }
  }

  return action;
}

/** Desestimar un reporte sin acción (equivalente a "no procede"). */
export function dismissReport(store, { reportId, moderatorId, notes = null }) {
  return applyModerationAction(store, {
    clubId: store.reports.find((r) => r.id === reportId)?.clubId,
    reportId,
    moderatorId,
    actionType: "no_action",
    notes,
  });
}

function assertModeratorRole(store, moderatorId) {
  const moderator = store.userProfiles.find((u) => u.id === moderatorId);
  if (!moderator || !MODERATOR_ROLES.includes(moderator.role)) {
    throw new Error("Rol no autorizado para moderar (se requiere STAFF, ADMIN o SUPPORT)");
  }
  return moderator;
}

function hideReportedContent(store, report) {
  if (report.targetType === "post") {
    const post = store.posts.find((p) => p.id === report.targetId);
    if (post) post.hiddenByModeration = true;
  }
  if (report.targetType === "comment") {
    const comment = store.comments.find((c) => c.id === report.targetId);
    if (comment) comment.deletedAt = new Date().toISOString();
  }
}

/** true si un contenido está oculto por moderación (visible solo para STAFF/ADMIN, ver getVisibleFeed). */
export function isContentHidden(store, targetType, targetId) {
  if (targetType === "post") {
    const post = store.posts.find((p) => p.id === targetId);
    return Boolean(post?.hiddenByModeration);
  }
  if (targetType === "comment") {
    const comment = store.comments.find((c) => c.id === targetId);
    return Boolean(comment?.deletedAt);
  }
  return false;
}

/**
 * Vista mínima de un reporte para su propio reportante (flujo 10 de
 * FLUJOS_UI_MODERACION_REPORTES_COMUNIDAD_PADEL_04.md): solo estado y motivo,
 * nunca las notas internas de moderación ni la identidad de quien decidió.
 */
export function getReportStatusForReporter(store, reportId, requestingUserId) {
  const report = store.reports.find((r) => r.id === reportId);
  if (!report) throw new Error("Reporte no encontrado");
  if (report.reporterId !== requestingUserId) {
    throw new Error("Solo el reportante puede consultar el estado de su propio reporte");
  }
  return { reportId: report.id, reason: report.reason, status: report.status, createdAt: report.createdAt };
}

/**
 * Resumen genérico de una sanción para el usuario afectado (flujo 12): nunca
 * incluye ModerationAction.notes ni la identidad del reportante.
 */
export function getSanctionSummaryForUser(store, moderationActionId) {
  const action = store.moderationActions.find((a) => a.id === moderationActionId);
  if (!action) throw new Error("Acción de moderación no encontrada");
  const report = store.reports.find((r) => r.id === action.reportId);
  return { actionType: action.actionType, createdAt: action.createdAt, reasonCategory: report?.reason ?? "unknown" };
}
