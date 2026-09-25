// Comunidad Pádel 04 — Lógica aislada: bloqueo
// Implementa la "regla crítica" ya documentada en Prompts D/E/G:
// ningún MatchInvite/Friendship/Follow puede crearse entre usuarios
// bloqueados, en ninguna dirección. Doble barrera: listado + creación.

import { randomUUID } from "node:crypto";
import { appendAudit } from "../entities/store.mjs";

/** true si existe un Friendship(status=blocked) entre las dos partes, en cualquier dirección. */
export function isBlocked(store, userIdA, userIdB) {
  return store.friendships.some(
    (f) =>
      f.status === "blocked" &&
      ((f.requesterId === userIdA && f.addresseeId === userIdB) ||
        (f.requesterId === userIdB && f.addresseeId === userIdA))
  );
}

/**
 * Bloquea a un usuario: marca (o crea) el Friendship como blocked y elimina
 * cualquier amistad activa/pendiente y cualquier Follow existente entre las
 * partes, en ambas direcciones — regla propuesta en
 * AMIGOS_SEGUIDORES_CONEXIONES_COMUNIDAD_PADEL_04.md, sección 17.
 */
export function blockUser(store, { clubId, blockerId, blockedId }) {
  if (blockerId === blockedId) {
    throw new Error("Un usuario no puede bloquearse a sí mismo");
  }

  // Elimina cualquier amistad o solicitud existente entre las partes.
  store.friendships = store.friendships.filter(
    (f) =>
      !(
        (f.requesterId === blockerId && f.addresseeId === blockedId) ||
        (f.requesterId === blockedId && f.addresseeId === blockerId)
      )
  );

  // Elimina cualquier relación de seguimiento en ambas direcciones.
  store.follows = store.follows.filter(
    (fw) =>
      !(
        (fw.followerId === blockerId && fw.followedId === blockedId) ||
        (fw.followerId === blockedId && fw.followedId === blockerId)
      )
  );

  const record = {
    id: randomUUID(),
    clubId,
    requesterId: blockerId,
    addresseeId: blockedId,
    status: "blocked",
    createdAt: new Date().toISOString(),
    respondedAt: null,
  };
  store.friendships.push(record);

  appendAudit(store, {
    clubId,
    actorId: blockerId,
    action: "friendship.blocked",
    targetType: "Friendship",
    targetId: record.id,
    metadata: { blockedId },
  });

  return record;
}

/** Desbloquea — solo quien ejecutó el bloqueo puede revertirlo. */
export function unblockUser(store, { clubId, blockerId, blockedId }) {
  const blockRecord = store.friendships.find(
    (f) => f.status === "blocked" && f.requesterId === blockerId && f.addresseeId === blockedId
  );
  if (!blockRecord) {
    throw new Error("No existe un bloqueo activo iniciado por este usuario sobre el objetivo indicado");
  }
  store.friendships = store.friendships.filter((f) => f.id !== blockRecord.id);

  appendAudit(store, {
    clubId,
    actorId: blockerId,
    action: "friendship.unblocked",
    targetType: "Friendship",
    targetId: blockRecord.id,
    metadata: { blockedId },
  });

  return true;
}
