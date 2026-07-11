import { test } from "node:test";
import assert from "node:assert/strict";
import { getRuntimeBusinessHours } from "./getRuntimeBusinessHours.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

test("getRuntimeBusinessHours: lanza sin resolvedConfig.tenantId", () => {
  assert.throws(() => getRuntimeBusinessHours({}), /requiere un resolvedConfig ya resuelto/);
});

test("getRuntimeBusinessHours: Club Pádel 04 expone las franjas reales y su timezone IANA", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const businessHours = getRuntimeBusinessHours(resolvedConfig);
  assert.deepEqual(businessHours.slots, ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"]);
  assert.equal(businessHours.timezone, "Europe/Madrid");
});

test("getRuntimeBusinessHours: segundo tenant fixture tiene un horario distinto (no comparte el de cp04)", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"),
  });
  const businessHours = getRuntimeBusinessHours(resolvedConfig);
  assert.deepEqual(businessHours.slots, ["09:00", "10:00", "11:00", "17:00", "18:00", "19:00", "20:00"]);
});
