// Comunidad Pádel 04 — Lógica aislada: seguidores (fase 2)
// Espejo funcional de FLUJOS_UI_AMIGOS_SEGUIDORES_COMUNIDAD_PADEL_04.md (flujos 9-10).

import { createFollow } from "../entities/store.mjs";
import { hasSocialLayerActive } from "./consent.mjs";
import { isBlocked } from "./blocking.mjs";

/** Flujo 9 — Seguir jugador. Requiere visibilidad club o superior del seguido. */
export function followUser(store, { clubId, followerId, followedId }) {
  if (followerId === followedId) {
    throw new Error("Un usuario no puede seguirse a sí mismo");
  }
  if (!hasSocialLayerActive(store, followerId)) {
    throw new Error("social_layer_opt_in requerido para seguir a otros jugadores");
  }
  if (isBlocked(store, followerId, followedId)) {
    throw new Error("No se puede seguir a un usuario bloqueado");
  }

  const followedProfile = store.playerSocialProfiles.find((p) => p.userProfileId === followedId);
  if (!followedProfile || followedProfile.visibilityLevel === "private") {
    throw new Error("El perfil objetivo no permite ser seguido (visibilidad insuficiente)");
  }

  const already = store.follows.find((f) => f.followerId === followerId && f.followedId === followedId);
  if (already) throw new Error("Ya sigues a este jugador");

  const record = createFollow({ clubId, followerId, followedId });
  store.follows.push(record);
  return record;
}

/** Flujo 10 — Dejar de seguir. */
export function unfollowUser(store, { followerId, followedId }) {
  const record = store.follows.find((f) => f.followerId === followerId && f.followedId === followedId);
  if (!record) throw new Error("No sigues a este jugador");
  store.follows = store.follows.filter((f) => f.id !== record.id);
  return true;
}

/** Nº de seguidores de un usuario (contador público, ya definido como el máximo dato agregado visible). */
export function countFollowers(store, userId) {
  return store.follows.filter((f) => f.followedId === userId).length;
}
