// Comunidad Pádel 04 — Lógica aislada: permisos transversales
// Reúne las validaciones "puede ver / comentar / reportar / unirse" que se
// repiten en feed, perfil y partidos abiertos, para no duplicar la lógica
// de bloqueo y consentimiento en cada módulo.

import { hasSocialLayerActive } from "./consent.mjs";
import { isBlocked } from "./blocking.mjs";
import { areFriends } from "./friendship.mjs";
import { getVisibleFeed } from "./feed.mjs";
import { listVisibleOpenMatches } from "./open-matches.mjs";

/** ¿Puede viewerId ver el contenido de ownerId según su visibilidad (private/friends/club)? */
export function canView(store, viewerId, ownerId, visibility) {
  if (viewerId === ownerId) return true;
  if (!hasSocialLayerActive(store, viewerId)) return false;
  if (isBlocked(store, viewerId, ownerId)) return false;

  const viewer = store.userProfiles.find((u) => u.id === viewerId);
  const owner = store.userProfiles.find((u) => u.id === ownerId);
  if (!viewer || !owner || viewer.clubId !== owner.clubId) return false;

  if (visibility === "private") return false;
  if (visibility === "friends") return areFriends(store, viewerId, ownerId);
  if (visibility === "club") return true;
  return false;
}

/** ¿Puede userId comentar la publicación postId? (delegado en feed.js, expuesto aquí como fachada). */
export function canComment(store, userId, postId) {
  const post = store.posts.find((p) => p.id === postId);
  if (!post) return false;
  if (isBlocked(store, userId, post.authorId)) return false;
  return getVisibleFeed(store, userId).some((p) => p.id === postId);
}

/** Reportar está disponible siempre que la capa social esté activa — sin gate de consentimiento adicional. */
export function canReport(store, userId) {
  return hasSocialLayerActive(store, userId);
}

/** ¿Puede userId solicitar plaza en el partido openMatchId? (nivel, bloqueo y estado ya evaluados aquí como resumen). */
export function canJoinMatch(store, userId, openMatchId) {
  const match = store.openMatches.find((m) => m.id === openMatchId);
  if (!match) return false;
  if (match.status !== "open") return false;
  if (match.creatorId === userId) return false;
  if (isBlocked(store, userId, match.creatorId)) return false;
  return listVisibleOpenMatches(store, userId).some((m) => m.id === openMatchId);
}
