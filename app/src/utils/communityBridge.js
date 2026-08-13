// Club Pádel 04 · Puente React ↔ community-logic (Comunidad, Fase 1).
//
// community-logic (app/projects/club-padel-04/community-logic/) es una
// librería de funciones puras, sin React, ya probada (59 tests). Este
// puente es la ÚNICA pieza que la conecta con la UI real: mantiene el
// store en memoria como fuente única de verdad para consentimiento y
// bloqueo, y expone funciones simples que React puede llamar desde sus
// handlers. Ninguna regla de negocio se reimplementa aquí — solo se
// invocan las funciones ya existentes de community-logic.
//
// Fase 1 (2026-08-13): integra ÚNICAMENTE consentimiento y bloqueo.
// friendship/follow/feed/moderation/open-matches/permissions completos
// quedan para fases siguientes — solo se importa lo que blocking.mjs
// necesita internamente (createEmptyStore), nada más.
//
// Contrato de las funciones mutantes: siempre devuelven { ok, error? },
// nunca lanzan hacia el componente que las llama, y nunca convierten un
// error real (p. ej. intentar bloquearse a uno mismo) en éxito.
import {
  createEmptyStore,
  hasSocialLayerActive,
  grantConsent,
  revokeConsent,
  isBlocked,
  blockUser,
  unblockUser,
} from "../../projects/club-padel-04/community-logic/index.mjs";

// Mismo id de club ficticio que ya usa community-logic/entities/seed.mjs —
// sin inventar uno nuevo, solo para mantener consistencia si en el futuro
// se comparten datos entre el seed de test y este puente.
export const COMMUNITY_BRIDGE_CLUB_ID = "club-demo-04";

const SOCIAL_LAYER_CONSENT_TYPE = "social_layer_opt_in";

let store = createEmptyStore();

// Solo para tests: reinicia el store en memoria a un estado vacío, igual
// que ya hacen __resetAvailabilityCacheForTests / __resetCrearReservaRateLimitForTests
// en worker-reservas — mismo patrón ya establecido en el proyecto.
export function __resetCommunityStoreForTests() {
  store = createEmptyStore();
}

// --- Consentimiento --------------------------------------------------

export function communityHasSocialConsent(userId) {
  return hasSocialLayerActive(store, userId);
}

export function communityGrantSocialConsent(userId) {
  try {
    grantConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId, consentType: SOCIAL_LAYER_CONSENT_TYPE });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo otorgar el consentimiento." };
  }
}

export function communityRevokeSocialConsent(userId) {
  try {
    revokeConsent(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, userId, consentType: SOCIAL_LAYER_CONSENT_TYPE });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo revocar el consentimiento." };
  }
}

// --- Bloqueo -----------------------------------------------------------

export function communityIsBlocked(userIdA, userIdB) {
  return isBlocked(store, userIdA, userIdB);
}

// Doble barrera aplicada aquí, con lo único disponible en Fase 1
// (consent + blocking, sin feed/friendship todavía):
//   barrera 1: la UI decide si mostrar/habilitar la acción según
//              communityIsBlocked (ver ComunidadDemo.jsx);
//   barrera 2: el propio puente vuelve a comprobar isBlocked antes de
//              intentar el bloqueo, y nunca confía en el estado que ya
//              tuviera pintado la UI — si ya estaban bloqueados, no
//              vuelve a crear un segundo registro ni finge éxito.
export function communityBlockUser(blockerId, blockedId) {
  if (isBlocked(store, blockerId, blockedId)) {
    return { ok: false, error: "Ya existe un bloqueo activo entre estos usuarios." };
  }
  try {
    blockUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, blockerId, blockedId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo bloquear al usuario." };
  }
}

export function communityUnblockUser(blockerId, blockedId) {
  try {
    unblockUser(store, { clubId: COMMUNITY_BRIDGE_CLUB_ID, blockerId, blockedId });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error?.message || "No se pudo desbloquear al usuario." };
  }
}
