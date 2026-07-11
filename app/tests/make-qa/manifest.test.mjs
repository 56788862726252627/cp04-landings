import test from "node:test";
import assert from "node:assert/strict";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";
import { loadManifest, loadScenarios, findByScenarioId, findByTestId, findByWave } from "../../scripts/make-qa/manifest-loader.mjs";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = JSON.parse(readFileSync(path.resolve(__dirname, "../../schemas/make-qa/scenario-manifest.schema.json"), "utf8"));

test("el manifest tiene exactamente 50 escenarios", () => {
  assert.equal(loadScenarios().length, 50);
});

test("los scenario_id son únicos", () => {
  const ids = loadScenarios().map((s) => s.scenario_id);
  assert.equal(new Set(ids).size, ids.length);
});

test("todas las filas del manifest cumplen scenario-manifest.schema.json", () => {
  for (const scenario of loadScenarios()) {
    const result = validateAgainstSchema(SCHEMA, scenario);
    assert.equal(result.valid, true, `${scenario.scenario_name}: ${JSON.stringify(result.errors)}`);
  }
});

test("el estado existente (baseline dado por el usuario) se conserva exactamente: PASS=1, READY=8, BLOCKED=17, CONFIG_ERROR=3, NOT_SAFE=2, NOT_TESTED=18, NEEDS_FIX=1", () => {
  const scenarios = loadScenarios();
  const count = (pred) => scenarios.filter(pred).length;

  assert.equal(count((s) => s.current_status === "PASS_VERIFIED"), 1);
  assert.equal(count((s) => s.current_status === "READY_PENDING_AIRTABLE_PREFLIGHT" || s.current_status === "SAFE_WITH_RESTRICTIONS"), 8);
  assert.equal(count((s) => s.current_status === "BLOCKED_PENDING_AIRTABLE_VERIFICATION" || s.current_status === "BLOCKED_EXTERNAL_RATE_LIMIT" || s.current_status === "BLOCKED_EXTERNAL_WHATSAPP_PENDING"), 17);
  assert.equal(count((s) => s.current_status === "CONFIG_ERROR"), 3);
  assert.equal(count((s) => s.current_status === "NOT_SAFE"), 2);
  assert.equal(count((s) => s.current_status === "NOT_TESTED"), 18);
  assert.equal(count((s) => s.current_status === "NEEDS_FIX_BEFORE_TEST"), 1);
});

test("findByScenarioId encuentra Generación QR Acceso (6244975)", () => {
  const s = findByScenarioId("6244975");
  assert.equal(s.scenario_name, "🔑 Generación QR Acceso");
  assert.equal(s.current_status, "PASS_VERIFIED");
});

test("findByTestId encuentra QA-A3-002 (API Reservas)", () => {
  const s = findByTestId("QA-A3-002");
  assert.equal(s.scenario_id, "5697630");
});

test("findByWave('wave_1') devuelve exactamente los 3 escenarios de la prioridad Wave 1 del brief", () => {
  const wave1Ids = findByWave("wave_1").map((s) => s.scenario_id).sort();
  assert.deepEqual(wave1Ids, ["5291559", "5697630", "6199248"].sort());
});

test("findByWave('wave_2') devuelve exactamente los 5 escenarios de la prioridad Wave 2 del brief", () => {
  const wave2Ids = findByWave("wave_2").map((s) => s.scenario_id).sort();
  assert.deepEqual(wave2Ids, ["6323457", "5288809", "4919937", "5330078", "5791128"].sort());
});

test("todo escenario con payload_schema no nulo también tiene fixture no nulo, y viceversa", () => {
  for (const s of loadScenarios()) {
    assert.equal(!!s.payload_schema, !!s.fixture, `${s.scenario_name}: payload_schema y fixture deben ir juntos`);
  }
});

test("todo escenario NOT_SAFE o NEEDS_FIX_BEFORE_TEST no tiene payload_schema (no se preparan payloads para escenarios que no deben ejecutarse)", () => {
  for (const s of loadScenarios()) {
    if (s.current_status === "NOT_SAFE" || s.current_status === "NEEDS_FIX_BEFORE_TEST") {
      assert.equal(s.payload_schema, null, `${s.scenario_name} no debería tener payload_schema`);
    }
  }
});

test("manifest completo sigue siendo JSON válido con cabecera esperada", () => {
  const manifest = loadManifest();
  assert.equal(manifest.total_scenarios, 50);
  assert.equal(manifest.scenarios.length, 50);
});
