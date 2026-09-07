// Comunidad Pádel 04 — Lógica aislada
// Datos semilla 100% ficticios para pruebas y demos locales.
// Ningún nombre, club, fecha o dato corresponde a una persona o club real.

import {
  createEmptyStore,
  createUserProfile,
  createPlayerSocialProfile,
  createConsent,
} from "./store.mjs";

const CLUB_ID = "club-demo-04";

/**
 * Construye un almacén con 5 usuarios ficticios, sus perfiles sociales y
 * consentimientos base ya otorgados (salvo el usuario 5, usado para probar
 * el estado "sin consentimiento").
 */
export function buildSeedStore() {
  const store = createEmptyStore();

  const alice = createUserProfile({ clubId: CLUB_ID, displayName: "Jugador Demo 1" });
  const bruno = createUserProfile({ clubId: CLUB_ID, displayName: "Jugador Demo 2" });
  const carla = createUserProfile({ clubId: CLUB_ID, displayName: "Jugador Demo 3" });
  const dani = createUserProfile({ clubId: CLUB_ID, displayName: "Jugador Demo 4" });
  const elena = createUserProfile({ clubId: CLUB_ID, displayName: "Jugador Demo 5 (sin consentimiento)" });
  const staff = createUserProfile({ clubId: CLUB_ID, displayName: "Staff Demo", role: "STAFF" });
  const admin = createUserProfile({ clubId: CLUB_ID, displayName: "Admin Demo", role: "ADMIN" });

  store.userProfiles.push(alice, bruno, carla, dani, elena, staff, admin);

  for (const user of [alice, bruno, carla, dani, staff, admin]) {
    store.playerSocialProfiles.push(
      createPlayerSocialProfile({ clubId: CLUB_ID, userProfileId: user.id })
    );
    store.consents.push(
      createConsent({ clubId: CLUB_ID, userId: user.id, consentType: "social_layer_opt_in", granted: true }),
      createConsent({ clubId: CLUB_ID, userId: user.id, consentType: "activity_sharing", granted: true }),
      createConsent({ clubId: CLUB_ID, userId: user.id, consentType: "appear_in_feed", granted: true })
    );
  }

  // Elena no tiene consentimiento social — usado para probar el consent-gate.
  store.playerSocialProfiles.push(
    createPlayerSocialProfile({ clubId: CLUB_ID, userProfileId: elena.id, visibilityLevel: "private" })
  );

  return { store, users: { alice, bruno, carla, dani, elena, staff, admin }, clubId: CLUB_ID };
}
