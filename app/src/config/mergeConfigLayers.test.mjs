import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeConfigLayers } from "./mergeConfigLayers.js";
import { loadCoreConfig } from "./loadCoreConfig.js";
import { loadVerticalConfig } from "./loadVerticalConfig.js";
import { loadClientConfig } from "./loadClientConfig.js";
import { repoPath } from "./paths.js";

function loadCp04() {
  return {
    core: loadCoreConfig(),
    vertical: loadVerticalConfig(),
    client: loadClientConfig(repoPath("config", "client-config.example.valid.json")),
  };
}

test("mergeConfigLayers: resuelve Club Pádel 04 (CORE < VERTICAL < CLIENT)", () => {
  const resolved = mergeConfigLayers(loadCp04());
  assert.equal(resolved.layer, "resolved");
  assert.equal(resolved.tenantId, "cp04");
  assert.equal(resolved.verticalId, "padel");
  assert.equal(resolved.resourceType, "pista");
  assert.deepEqual(resolved.roles, ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]);
  assert.equal(resolved.features.torneos, true); // heredado del vertical
  assert.equal(resolved.features.reservas, true); // heredado del core
  assert.equal(resolved.features.pagos, false); // protegido
});

test("mergeConfigLayers: campo protegido — lanza si roles del cliente sale del conjunto CORE", () => {
  const { core, vertical, client } = loadCp04();
  const tampered = { ...client, roles: [...client.roles, "OWNER"] };
  assert.throws(() => mergeConfigLayers({ core, vertical, client: tampered }), /campo protegido/);
});

test("mergeConfigLayers: campo protegido — lanza si features.pagos resuelve a true por manipulación directa", () => {
  const { core, vertical } = loadCp04();
  // El client-config real de Club Pádel 04 fija pagos:false explícitamente
  // (CLIENT_OVERRIDE ganaría igualmente), así que para probar la defensa en
  // profundidad de mergeConfigLayers se usa el fixture del segundo club, que
  // no declara "pagos" en absoluto — deja pasar el GLOBAL_DEFAULT manipulado.
  const client = loadClientConfig(repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"));
  const tamperedCore = { ...core, featureDefaults: { ...core.featureDefaults, pagos: true } };
  assert.throws(() => mergeConfigLayers({ core: tamperedCore, vertical, client }), /campo protegido/);
});

test("mergeConfigLayers: lanza si falta alguna de las 3 capas", () => {
  const { core, vertical, client } = loadCp04();
  assert.throws(() => mergeConfigLayers({ core, vertical }), /requiere \{ core, vertical, client \}/);
  assert.throws(() => mergeConfigLayers({ vertical, client }), /requiere \{ core, vertical, client \}/);
});

test("mergeConfigLayers: replica al segundo club fixture sin tocar CORE", () => {
  const { core, vertical } = loadCp04();
  const client = loadClientConfig(repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"));
  const resolved = mergeConfigLayers({ core, vertical, client });
  assert.equal(resolved.tenantId, "fixture-club-02");
  assert.equal(resolved.verticalId, "padel"); // mismo CORE/VERTICAL, cero cambios
  assert.equal(resolved.features.torneos, true);
});
