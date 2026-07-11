import { test } from "node:test";
import assert from "node:assert/strict";
import { getRuntimeResources } from "./getRuntimeResources.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

test("getRuntimeResources: lanza sin resolvedConfig.tenantId", () => {
  assert.throws(() => getRuntimeResources({}), /requiere un resolvedConfig ya resuelto/);
});

test("getRuntimeResources: Club Pádel 04 expone 4 courts, 3 duraciones y las modalidades/niveles del vertical padel", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const resources = getRuntimeResources(resolvedConfig);
  assert.equal(resources.courts.length, 4);
  assert.deepEqual(resources.durations, [60, 90, 120]);
  assert.deepEqual(resources.bookingRules.modalities, ["libre", "partido", "clase", "torneo"]);
  assert.deepEqual(resources.bookingRules.levels, ["iniciacion", "intermedio", "avanzado", "competicion"]);
  assert.equal(resources.businessHours.length, 11);
});

test("getRuntimeResources: rooms/services no existen en el vertical padel — quedan null, nunca fabricados", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const resources = getRuntimeResources(resolvedConfig);
  assert.equal(resources.rooms, null);
  assert.equal(resources.services, null);
});

test("getRuntimeResources: operationalLimits refleja plan.limits (todo null si el cliente no fijó límites concretos, vía defaults del schema)", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const resources = getRuntimeResources(resolvedConfig);
  assert.deepEqual(resources.operationalLimits, { bookingsPerMonth: null, users: null, storageMB: null });
});

test("getRuntimeResources: segundo tenant fixture (courts sin price120) deriva solo las duraciones presentes", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "valid-second-club-fixture.client-config.json"),
  });
  const resources = getRuntimeResources(resolvedConfig);
  assert.equal(resources.courts.length, 2);
  assert.deepEqual(resources.durations, [60, 90, 120]);
});
