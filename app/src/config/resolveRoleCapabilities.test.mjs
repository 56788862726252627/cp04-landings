import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveRoleCapabilities, ROLE_CAPABILITY_CATALOG } from "./resolveRoleCapabilities.js";
import { mergeConfigLayers } from "./mergeConfigLayers.js";
import { loadCoreConfig } from "./loadCoreConfig.js";
import { loadVerticalConfig } from "./loadVerticalConfig.js";
import { loadClientConfig } from "./loadClientConfig.js";
import { repoPath } from "./paths.js";

function resolveCp04() {
  return mergeConfigLayers({
    core: loadCoreConfig(),
    vertical: loadVerticalConfig(),
    client: loadClientConfig(repoPath("config", "client-config.example.valid.json")),
  });
}

test("resolveRoleCapabilities: PLAYER obtiene reservation.* pero no admin.manage_config", () => {
  const capabilities = resolveRoleCapabilities(resolveCp04());
  assert.ok(capabilities.PLAYER.includes("reservation.create"));
  assert.ok(capabilities.PLAYER.includes("reservation.cancel"));
  assert.ok(capabilities.PLAYER.includes("reservation.reschedule"));
  assert.ok(!capabilities.PLAYER.includes("admin.manage_config"));
  assert.ok(!capabilities.PLAYER.includes("player.create"));
});

test("resolveRoleCapabilities: ADMIN obtiene tournament.manage/ranking.manage porque el vertical padel los activa", () => {
  const capabilities = resolveRoleCapabilities(resolveCp04());
  assert.ok(capabilities.ADMIN.includes("tournament.manage"));
  assert.ok(capabilities.ADMIN.includes("ranking.manage"));
  assert.ok(capabilities.ADMIN.includes("admin.manage_config")); // no depende de feature
});

test("resolveRoleCapabilities: SUPPORT solo obtiene support.view_health", () => {
  const capabilities = resolveRoleCapabilities(resolveCp04());
  assert.deepEqual(capabilities.SUPPORT, ["support.view_health"]);
});

test("resolveRoleCapabilities: una capability con feature gated a OFF no aparece para ningún rol", () => {
  const resolved = resolveCp04();
  resolved.features = { ...resolved.features, torneos: false };
  const capabilities = resolveRoleCapabilities(resolved);
  assert.ok(!capabilities.ADMIN.includes("tournament.manage"));
  assert.ok(!capabilities.STAFF.includes("tournament.manage"));
});

test("resolveRoleCapabilities: un rol no activo en el cliente no aparece en el resultado", () => {
  const resolved = resolveCp04();
  resolved.roles = ["PLAYER"];
  const capabilities = resolveRoleCapabilities(resolved);
  assert.deepEqual(Object.keys(capabilities), ["PLAYER"]);
});

test("resolveRoleCapabilities: lanza sin resolvedConfig.roles/.features", () => {
  assert.throws(() => resolveRoleCapabilities({}), /requiere un resolvedConfig/);
});

test("ROLE_CAPABILITY_CATALOG: todo feature referenciado existe en el catálogo cerrado de core-config", () => {
  const core = loadCoreConfig();
  const knownFeatures = new Set(Object.keys(core.featureDefaults));
  for (const capability of ROLE_CAPABILITY_CATALOG) {
    if (capability.feature !== null) {
      assert.ok(knownFeatures.has(capability.feature), `capability ${capability.id} referencia feature desconocida "${capability.feature}"`);
    }
  }
});
