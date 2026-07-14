// Comunidad Pádel 04 — Lógica aislada: amistad
// Espejo funcional de FLUJOS_UI_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md (flujos 4-8).

import { createFriendship, appendAudit } from "../entities/store.mjs";
import { hasSocialLayerActive } from "./consent.mjs";
import { isBlocked } from "./blocking.mjs";

function findPendingBetween(store, a, b) {
  return store.friendships.find(
    (f) =>
      f.status === "pending" &&
      ((f.requesterId === a && f.addresseeId === b) || (f.requesterId === b && f.addresseeId === a))
  );
}

function findAcceptedBetween(store, a, b) {
  return store.friendships.find(
    (f) =>
      f.status === "accepted" &&
      ((f.requesterId === a && f.addresseeId === b) || (f.requesterId === b && f.addresseeId === a))
  );
}

/** true si a y b son amigos con relación aceptada (base de la visibilidad "friends" en feed/perfil/partidos). */
export function areFriends(store, a, b) {
  return Boolean(findAcceptedBetween(store, a, b));
}

/** Flujo 4 — Enviar solicitud de amistad. */
export function sendFriendRequest(store, { clubId, requesterId, addresseeId }) {
  if (requesterId === addresseeId) {
    throw new Error("Un usuario no puede enviarse una solicitud a sí mismo");
  }
  if (!hasSocialLayerActive(store, requesterId)) {
    throw new Error("social_layer_opt_in requerido para enviar solicitudes de amistad");
  }
  if (isBlocked(store, requesterId, addresseeId)) {
    // Regla crítica: bloqueado en cualquier dirección impide la solicitud.
    throw new Error("No se puede enviar una solicitud entre usuarios bloqueados");
  }
  if (findPendingBetween(store, requesterId, addresseeId)) {
    throw new Error("Ya existe una solicitud pendiente entre estos usuarios");
  }
  if (areFriends(store, requesterId, addresseeId)) {
    throw new Error("Los usuarios ya son amigos");
  }

  const record = createFriendship({ clubId, requesterId, addresseeId, status: "pending" });
  store.friendships.push(record);
  return record;
}

/** Flujo 5 — Aceptar solicitud (solo el addressee decide). */
export function acceptFriendRequest(store, { friendshipId, actingUserId }) {
  const request = store.friendships.find((f) => f.id === friendshipId);
  if (!request) throw new Error("Solicitud no encontrada");
  if (request.status !== "pending") throw new Error("La solicitud ya no está pendiente");
  if (request.addresseeId !== actingUserId) throw new Error("Solo el destinatario puede aceptar la solicitud");

  request.status = "accepted";
  request.respondedAt = new Date().toISOString();
  return request;
}

/** Flujo 6 — Rechazar solicitud (sin obligación de justificar el motivo). */
export function rejectFriendRequest(store, { friendshipId, actingUserId }) {
  const request = store.friendships.find((f) => f.id === friendshipId);
  if (!request) throw new Error("Solicitud no encontrada");
  if (request.status !== "pending") throw new Error("La solicitud ya no está pendiente");
  if (request.addresseeId !== actingUserId) throw new Error("Solo el destinatario puede rechazar la solicitud");

  request.status = "rejected";
  request.respondedAt = new Date().toISOString();
  return request;
}

/**
 * Flujo 7 — Cancelar solicitud enviada (solo el requester).
 * Nota: MODELO_DATOS_SOCIAL_COMUNIDAD_PADEL_04.md no define un status
 * "cancelled" explícito para Friendship — hueco ya documentado en
 * CHECKLIST_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md. Esta implementación usa
 * "cancelled" como extensión mínima local, marcada explícitamente aquí para
 * que la integración futura decida si se formaliza en el modelo real.
 */
export function cancelFriendRequest(store, { friendshipId, actingUserId }) {
  const request = store.friendships.find((f) => f.id === friendshipId);
  if (!request) throw new Error("Solicitud no encontrada");
  if (request.status !== "pending") throw new Error("La solicitud ya no está pendiente");
  if (request.requesterId !== actingUserId) throw new Error("Solo quien envió la solicitud puede cancelarla");

  request.status = "cancelled";
  request.respondedAt = new Date().toISOString();
  return request;
}

/** Flujo 8 — Eliminar amigo (borrado inmediato, no soft delete, ambas partes pueden ejecutarlo). */
export function removeFriend(store, { actingUserId, otherUserId }) {
  const friendship = findAcceptedBetween(store, actingUserId, otherUserId);
  if (!friendship) throw new Error("No existe una amistad activa entre estos usuarios");

  store.friendships = store.friendships.filter((f) => f.id !== friendship.id);

  appendAudit(store, {
    clubId: friendship.clubId,
    actorId: actingUserId,
    action: "friendship.removed",
    targetType: "Friendship",
    targetId: friendship.id,
    metadata: { otherUserId },
  });

  return true;
}
