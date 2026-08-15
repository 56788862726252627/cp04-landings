import test from "node:test";
import assert from "node:assert/strict";
import { buildSeedStore } from "../entities/seed.mjs";
import { hasConsent, grantConsent, revokeConsent, hasSocialLayerActive } from "../logic/consent.mjs";
import { createOpenMatchMock } from "../logic/open-matches.mjs";
import { getVisibleFeed, createPostMock } from "../logic/feed.mjs";

test("hasConsent: false por defecto si no hay ningún registro", () => {
  const { store, users } = buildSeedStore();
  assert.equal(hasConsent(store, users.elena.id, "ranking_visibility"), false);
});

test("grantConsent: otorga y queda reflejado en hasConsent", () => {
  const { store, users, clubId } = buildSeedStore();
  grantConsent(store, { clubId, userId: users.elena.id, consentType: "social_layer_opt_in" });
  assert.equal(hasSocialLayerActive(store, users.elena.id), true);
});

test("revokeConsent: retira el consentimiento sin borrar el histórico previo", () => {
  const { store, users, clubId } = buildSeedStore();
  const before = store.consents.filter((c) => c.userId === users.alice.id && c.consentType === "appear_in_feed").length;

  revokeConsent(store, { clubId, userId: users.alice.id, consentType: "appear_in_feed" });

  const after = store.consents.filter((c) => c.userId === users.alice.id && c.consentType === "appear_in_feed").length;
  assert.equal(after, before + 1, "revocar debe crear un registro nuevo, no editar el anterior");
  assert.equal(hasConsent(store, users.alice.id, "appear_in_feed"), false);
});

test("consentimiento ningún registro premarcado: ningún tipo aparece otorgado sin acción explícita", () => {
  const { store, users } = buildSeedStore();
  // No se otorgó explícitamente ranking_visibility ni publish_photos en el seed.
  assert.equal(hasConsent(store, users.alice.id, "ranking_visibility"), false);
  assert.equal(hasConsent(store, users.alice.id, "publish_photos"), false);
});

test("revocación retroactiva: retirar appear_in_feed oculta el post ya publicado a terceros", () => {
  const { store, users, clubId } = buildSeedStore();
  createPostMock(store, { clubId, authorId: users.alice.id, body: "Actividad", postType: "player_activity", visibility: "club" });

  assert.equal(getVisibleFeed(store, users.bruno.id).length, 1);

  revokeConsent(store, { clubId, userId: users.alice.id, consentType: "appear_in_feed" });

  assert.equal(getVisibleFeed(store, users.bruno.id).length, 0, "el post debe ocultarse de inmediato a terceros");
  assert.equal(getVisibleFeed(store, users.alice.id).length, 1, "el propio autor sigue viendo su contenido");
});

test("crear partido abierto: bloqueado por falta de activity_sharing tras revocación", () => {
  const { store, users, clubId } = buildSeedStore();
  revokeConsent(store, { clubId, userId: users.bruno.id, consentType: "activity_sharing" });
  assert.throws(
    () => createOpenMatchMock(store, { clubId, creatorId: users.bruno.id, scheduledAt: new Date().toISOString() }),
    /activity_sharing/
  );
});
