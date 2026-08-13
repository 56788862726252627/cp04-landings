// Comunidad Pádel 04 — Lógica aislada: partidos abiertos
// Espejo funcional de PARTIDOS_ABIERTOS_BUSCAR_COMPANERO_COMUNIDAD_PADEL_04.md
// y FLUJOS_UI_PARTIDOS_ABIERTOS_COMUNIDAD_PADEL_04.md.

import { createOpenMatch, createMatchInvite, createNotification } from "../entities/store.mjs";
import { hasConsent } from "./consent.mjs";
import { isBlocked } from "./blocking.mjs";
import { areFriends } from "./friendship.mjs";

const LEVELS = ["iniciacion", "intermedio", "avanzado", "profesional"];

function levelRank(level) {
  const idx = LEVELS.indexOf(level);
  if (idx === -1) throw new Error(`Nivel desconocido: ${level}`);
  return idx;
}

/** Crear partido abierto — requiere activity_sharing (Prompt F, flujo 4 de consentimiento). */
export function createOpenMatchMock(store, params) {
  const { clubId, creatorId } = params;
  if (!hasConsent(store, creatorId, "activity_sharing")) {
    throw new Error("activity_sharing requerido para crear un partido abierto");
  }
  const match = createOpenMatch(params);
  store.openMatches.push(match);
  return match;
}

/**
 * Listado de partidos visibles para un espectador: mismo club, sin usuarios
 * bloqueados en ninguna dirección (primera barrera de la regla crítica),
 * respetando visibility (club/friends) y excluyendo partidos ya cerrados.
 */
export function listVisibleOpenMatches(store, viewerId) {
  const viewer = store.userProfiles.find((u) => u.id === viewerId);
  if (!viewer) return [];

  return store.openMatches.filter((match) => {
    if (match.clubId !== viewer.clubId) return false;
    if (match.status === "cancelled") return false;
    if (isBlocked(store, viewerId, match.creatorId)) return false; // barrera 1

    if (match.visibility === "club") return true;
    if (match.visibility === "friends") {
      return match.creatorId === viewerId || areFriends(store, viewerId, match.creatorId);
    }
    return false;
  });
}

/**
 * Solicitar plaza (flujo 5). Regla crítica — barrera 2: incluso si el
 * partido fuera visible por algún fallo de listado, la creación de la
 * invitación vuelve a validar el bloqueo de forma independiente.
 */
export function requestToJoin(store, { clubId, openMatchId, requesterId }) {
  const match = store.openMatches.find((m) => m.id === openMatchId);
  if (!match) throw new Error("Partido no encontrado");
  if (match.status !== "open") throw new Error("El partido no acepta solicitudes (cerrado, completo o cancelado)");
  if (match.creatorId === requesterId) throw new Error("El creador no puede solicitar su propia plaza");

  if (isBlocked(store, requesterId, match.creatorId)) {
    // Barrera 2 de la regla crítica — nunca confiar solo en el filtrado de listado.
    throw new Error("No se puede solicitar plaza en un partido de un usuario bloqueado");
  }

  if (!hasConsent(store, requesterId, "activity_sharing")) {
    throw new Error("activity_sharing requerido para solicitar plaza");
  }

  const requesterProfile = store.playerSocialProfiles.find((p) => p.userProfileId === requesterId);
  if (requesterProfile) {
    const rank = levelRank(requesterProfile.levelDeclared);
    if (rank < levelRank(match.levelMin) || rank > levelRank(match.levelMax)) {
      throw new Error("El nivel del jugador está fuera del rango del partido");
    }
  }

  const existingPending = store.matchInvites.find(
    (i) => i.openMatchId === openMatchId && i.requesterId === requesterId && i.status === "pending"
  );
  if (existingPending) throw new Error("Ya existe una solicitud pendiente de este usuario para este partido");

  const invite = createMatchInvite({ clubId, openMatchId, requesterId });
  store.matchInvites.push(invite);

  store.notifications.push(
    createNotification({
      clubId,
      userId: match.creatorId,
      notificationType: "match_invite",
      payload: { openMatchId, inviteId: invite.id, requesterId },
    })
  );

  return invite;
}

/** Aceptar solicitud (flujo 6) — solo el creador; incrementa slots_filled y cierra el partido si se completa. */
export function acceptJoinRequest(store, { inviteId, actingUserId }) {
  const invite = store.matchInvites.find((i) => i.id === inviteId);
  if (!invite) throw new Error("Solicitud no encontrada");
  if (invite.status !== "pending") throw new Error("La solicitud ya no está pendiente");

  const match = store.openMatches.find((m) => m.id === invite.openMatchId);
  if (!match) throw new Error("Partido no encontrado");
  if (match.creatorId !== actingUserId) throw new Error("Solo el creador del partido puede aceptar solicitudes");
  if (match.slotsFilled >= match.slotsTotal) throw new Error("El partido ya está completo");

  invite.status = "accepted";
  invite.respondedAt = new Date().toISOString();
  match.slotsFilled += 1;
  if (match.slotsFilled >= match.slotsTotal) {
    match.status = "full";
  }

  store.notifications.push(
    createNotification({
      clubId: match.clubId,
      userId: invite.requesterId,
      notificationType: "match_invite",
      payload: { openMatchId: match.id, inviteId: invite.id, result: "accepted" },
    })
  );

  return invite;
}

/** Rechazar solicitud (flujo 7) — solo el creador, sin exponer el motivo. */
export function rejectJoinRequest(store, { inviteId, actingUserId }) {
  const invite = store.matchInvites.find((i) => i.id === inviteId);
  if (!invite) throw new Error("Solicitud no encontrada");
  if (invite.status !== "pending") throw new Error("La solicitud ya no está pendiente");

  const match = store.openMatches.find((m) => m.id === invite.openMatchId);
  if (!match) throw new Error("Partido no encontrado");
  if (match.creatorId !== actingUserId) throw new Error("Solo el creador del partido puede rechazar solicitudes");

  invite.status = "rejected";
  invite.respondedAt = new Date().toISOString();

  store.notifications.push(
    createNotification({
      clubId: match.clubId,
      userId: invite.requesterId,
      notificationType: "match_invite",
      payload: { openMatchId: match.id, inviteId: invite.id, result: "rejected" },
    })
  );

  return invite;
}

/** Cancelar partido propio (flujo 4 del catálogo de partidos). */
export function cancelOpenMatch(store, { openMatchId, actingUserId }) {
  const match = store.openMatches.find((m) => m.id === openMatchId);
  if (!match) throw new Error("Partido no encontrado");
  if (match.creatorId !== actingUserId) throw new Error("Solo el creador puede cancelar el partido");
  if (match.status === "cancelled") throw new Error("El partido ya está cancelado");

  match.status = "cancelled";
  match.cancelledAt = new Date().toISOString();

  const affected = store.matchInvites.filter((i) => i.openMatchId === openMatchId && i.status === "accepted");
  for (const invite of affected) {
    store.notifications.push(
      createNotification({
        clubId: match.clubId,
        userId: invite.requesterId,
        notificationType: "match_invite",
        payload: { openMatchId: match.id, result: "match_cancelled" },
      })
    );
  }

  return match;
}
