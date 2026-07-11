import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveFeatureFlags } from "./resolveFeatureFlags.js";
import { loadCoreConfig } from "./loadCoreConfig.js";
import { loadVerticalConfig } from "./loadVerticalConfig.js";
import { loadClientConfig } from "./loadClientConfig.js";
import { repoPath } from "./paths.js";

test("resolveFeatureFlags: sin vertical ni cliente, devuelve exactamente GLOBAL_DEFAULT", () => {
  const core = loadCoreConfig();
  const { features, degraded } = resolveFeatureFlags(core);
  assert.deepEqual(features, core.featureDefaults);
  assert.deepEqual(degraded, []);
});

test("resolveFeatureFlags: VERTICAL_DEFAULT sobrescribe GLOBAL_DEFAULT", () => {
  const core = loadCoreConfig();
  const vertical = loadVerticalConfig(); // padel: torneos:true, ranking:true
  const { features } = resolveFeatureFlags(core, vertical);
  assert.equal(features.torneos, true);
  assert.equal(features.ranking, true);
  assert.equal(features.crm, false); // no tocado por vertical, sigue GLOBAL_DEFAULT
});

test("resolveFeatureFlags: CLIENT_OVERRIDE gana sobre VERTICAL_DEFAULT y GLOBAL_DEFAULT", () => {
  const core = loadCoreConfig();
  const vertical = loadVerticalConfig();
  const client = loadClientConfig(repoPath("config", "client-config.example.valid.json"));
  const { features } = resolveFeatureFlags(core, vertical, client);
  assert.equal(features.torneos, true); // client no lo toca, hereda vertical
  assert.equal(features.pagos, false); // forzado en las 3 capas
});

test("resolveFeatureFlags: degrada en cascada todo lo que depende de una feature apagada por el cliente (fixture 9)", () => {
  const core = loadCoreConfig();
  const vertical = loadVerticalConfig();
  const client = loadClientConfig(
    repoPath("fixtures", "tenant-config", "invalid-incompatible-feature-dependency.client-config.json")
  );
  const { features, degraded } = resolveFeatureFlags(core, vertical, client);
  assert.equal(features.reservas, false); // CLIENT_OVERRIDE explícito
  // reservas=false arrastra a OFF todo lo que dependía de ella y estaba ON:
  // listaEspera (pedido true por el cliente, incompatible), y cancelaciones/
  // reprogramaciones (ON por GLOBAL_DEFAULT, nunca tocadas por el cliente).
  assert.equal(features.listaEspera, false);
  assert.equal(features.cancelaciones, false);
  assert.equal(features.reprogramaciones, false);
  const degradedFeatures = degraded.map((d) => d.feature).sort();
  assert.deepEqual(degradedFeatures, ["cancelaciones", "listaEspera", "reprogramaciones"]);
  assert.ok(degraded.every((d) => d.missingDependencies.includes("reservas")));
});

test("resolveFeatureFlags: lanza si core no tiene featureDefaults", () => {
  assert.throws(() => resolveFeatureFlags({}), /requiere core\.featureDefaults/);
});
