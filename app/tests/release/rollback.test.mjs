import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { isReleaseStable, selectPreviousStableRelease, buildRollbackManifestRef, buildRollbackPlan, buildMaintenanceModeStep } from "../../scripts/release/rollback.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
function loadFixture(name) {
  return JSON.parse(readFileSync(path.resolve(__dirname, "../../fixtures/release", name), "utf8"));
}

const stagingManifest = loadFixture("release-manifest.example.valid-staging.json");
const productionManifest = loadFixture("release-manifest.example.valid-production.json");

test("rollback selection: la fixture de producción (todos los gates PASS) se considera estable", () => {
  assert.equal(isReleaseStable(productionManifest), true);
});

test("rollback selection: la fixture de staging (security WARN, qa PENDING) NO se considera estable", () => {
  assert.equal(isReleaseStable(stagingManifest), false);
});

test("rollback selection: selecciona la release estable más reciente del mismo entorno, ignorando otros entornos", () => {
  const olderStable = { ...productionManifest, release_id: "rel_older00000000001", created_at: "2026-07-01T00:00:00.000Z" };
  const newerStable = { ...productionManifest, release_id: "rel_newer00000000001", created_at: "2026-07-08T00:00:00.000Z" };
  const selected = selectPreviousStableRelease([olderStable, newerStable, stagingManifest], { environment: "PRODUCTION" });
  assert.equal(selected.release_id, "rel_newer00000000001");
});

test("rollback selection: excluye explícitamente la release que está fallando (excludeReleaseId)", () => {
  const failingButStableShaped = { ...productionManifest, release_id: "rel_failing000000001" };
  const selected = selectPreviousStableRelease([productionManifest, failingButStableShaped], { environment: "PRODUCTION", excludeReleaseId: "rel_failing000000001" });
  assert.equal(selected.release_id, productionManifest.release_id);
});

test("rollback selection: sin ninguna release estable disponible devuelve null explícito", () => {
  const selected = selectPreviousStableRelease([stagingManifest], { environment: "PRODUCTION" });
  assert.equal(selected, null);
});

test("buildRollbackManifestRef: forma exacta de rollback_ref del schema", () => {
  const ref = buildRollbackManifestRef({ previousStableRelease: productionManifest, trigger: "incident", owner: "soporte" });
  assert.deepEqual(ref, {
    previous_release_id: productionManifest.release_id,
    previous_commit_sha: productionManifest.commit_sha,
    trigger: "incident",
    owner: "soporte",
  });
});

test("release rollback manifest / config rollback / feature flag rollback: plan completo con release estable previa", () => {
  const failing = { ...productionManifest, release_id: "rel_failing000000002", dependency_status: { ...productionManifest.dependency_status, stripe: { status: "BLOCKED" } } };
  const plan = buildRollbackPlan({ failingManifest: failing, environment: "PRODUCTION", trigger: "incident", releaseHistory: [productionManifest, failing] });

  const actions = plan.steps.map((s) => s.action);
  assert.ok(actions.includes("CONFIG_ROLLBACK"));
  assert.ok(actions.includes("FEATURE_FLAG_ROLLBACK"));
  assert.ok(actions.includes("INTEGRATION_DISABLE"));
  assert.equal(plan.previous_stable_release.release_id, productionManifest.release_id);
  assert.equal(plan.rollback_ref.trigger, "incident");
});

test("integration disable: solo se generan pasos para dependencias realmente BLOCKED/FAIL, no para las sanas", () => {
  const failing = { ...productionManifest, release_id: "rel_failing000000003" };
  const plan = buildRollbackPlan({ failingManifest: failing, environment: "PRODUCTION", trigger: "manual", releaseHistory: [productionManifest, failing] });
  const disableSteps = plan.steps.filter((s) => s.action === "INTEGRATION_DISABLE");
  assert.equal(disableSteps.length, 0, "ninguna dependencia está BLOCKED en la fixture de producción, no debe generarse ningún disable");
});

test("modo mantenimiento: se activa como último recurso cuando no hay ninguna release estable anterior", () => {
  const failing = { ...productionManifest, release_id: "rel_failing000000004" };
  const plan = buildRollbackPlan({ failingManifest: failing, environment: "PRODUCTION", trigger: "incident", releaseHistory: [failing] });
  assert.equal(plan.previous_stable_release, null);
  assert.ok(plan.steps.some((s) => s.action === "MAINTENANCE_MODE_ENABLE"));
});

test("modo mantenimiento: buildMaintenanceModeStep invocable de forma independiente", () => {
  assert.deepEqual(buildMaintenanceModeStep({ enable: true, reason: "incidente activo" }), { action: "MAINTENANCE_MODE_ENABLE", reason: "incidente activo" });
  assert.deepEqual(buildMaintenanceModeStep({ enable: false, reason: "resuelto" }), { action: "MAINTENANCE_MODE_DISABLE", reason: "resuelto" });
});

test("rollback: PRODUCTION con trigger=incident NO exige aprobación humana previa (mismo criterio que CLIENT_ROLLBACK_CONTRACT.md)", () => {
  const failing = { ...productionManifest, release_id: "rel_failing000000005" };
  const plan = buildRollbackPlan({ failingManifest: failing, environment: "PRODUCTION", trigger: "incident", releaseHistory: [productionManifest, failing] });
  assert.equal(plan.requires_human_approval, false);
});

test("rollback: PRODUCTION con trigger=manual SÍ exige aprobación humana", () => {
  const failing = { ...productionManifest, release_id: "rel_failing000000006" };
  const plan = buildRollbackPlan({ failingManifest: failing, environment: "PRODUCTION", trigger: "manual", releaseHistory: [productionManifest, failing] });
  assert.equal(plan.requires_human_approval, true);
});
