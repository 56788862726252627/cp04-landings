import { test } from "node:test";
import assert from "node:assert/strict";
import { getRuntimeRoleCapabilities, runtimeHasCapability } from "./getRuntimeRoleCapabilities.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

function cp04Config() {
  return loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") }).resolvedConfig;
}

test("getRuntimeRoleCapabilities: PLAYER puede reservation.create/cancel/reschedule pero no player.create ni admin.manage_config", () => {
  const capabilities = getRuntimeRoleCapabilities(cp04Config());
  assert.ok(capabilities.PLAYER.includes("reservation.create"));
  assert.ok(capabilities.PLAYER.includes("reservation.cancel"));
  assert.ok(capabilities.PLAYER.includes("reservation.reschedule"));
  assert.ok(!capabilities.PLAYER.includes("player.create"));
  assert.ok(!capabilities.PLAYER.includes("admin.manage_config"));
});

test("getRuntimeRoleCapabilities: STAFF puede player.create y tournament.manage/ranking.manage (torneos/ranking ON en cp04)", () => {
  const capabilities = getRuntimeRoleCapabilities(cp04Config());
  assert.ok(capabilities.STAFF.includes("player.create"));
  assert.ok(capabilities.STAFF.includes("tournament.manage"));
  assert.ok(capabilities.STAFF.includes("ranking.manage"));
});

test("getRuntimeRoleCapabilities: SUPPORT solo tiene support.view_health, nunca reservation.* ni admin.manage_config", () => {
  const capabilities = getRuntimeRoleCapabilities(cp04Config());
  assert.deepEqual(capabilities.SUPPORT, ["support.view_health"]);
});

test("getRuntimeRoleCapabilities: ADMIN puede admin.manage_config, PLAYER/STAFF/SUPPORT no", () => {
  const capabilities = getRuntimeRoleCapabilities(cp04Config());
  assert.ok(capabilities.ADMIN.includes("admin.manage_config"));
  assert.ok(!capabilities.PLAYER.includes("admin.manage_config"));
  assert.ok(!capabilities.STAFF.includes("admin.manage_config"));
  assert.ok(!capabilities.SUPPORT.includes("admin.manage_config"));
});

test("runtimeHasCapability: conveniencia booleana coherente con el catálogo completo", () => {
  const config = cp04Config();
  assert.equal(runtimeHasCapability(config, "ADMIN", "admin.manage_config"), true);
  assert.equal(runtimeHasCapability(config, "PLAYER", "admin.manage_config"), false);
  assert.equal(runtimeHasCapability(config, "SUPPORT", "reservation.create"), false);
});

test("getRuntimeRoleCapabilities: torneos/ranking OFF haría desaparecer tournament.manage/ranking.manage aunque el rol siga activo (capability atada a feature)", () => {
  const config = { ...cp04Config(), features: { ...cp04Config().features, torneos: false, ranking: false } };
  const capabilities = getRuntimeRoleCapabilities(config);
  assert.ok(!capabilities.STAFF.includes("tournament.manage"));
  assert.ok(!capabilities.STAFF.includes("ranking.manage"));
  assert.ok(capabilities.STAFF.includes("player.create"), "player.create no depende de ninguna feature (feature: null)");
});
