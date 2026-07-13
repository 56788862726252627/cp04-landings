import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMakePayload, extractCorrelationFromPayload } from "../../../scripts/observability/make-propagation.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../../fixtures/observability/integration/make-webhook-payload-base.json"), "utf8")
);

test("propagación: buildMakePayload añade _cp04_correlation sin tocar ningún campo de negocio existente", () => {
  const result = buildMakePayload(FIXTURE.base_payload, { requestId: "req_aaaaaaaa-0001", correlationId: "corr_bbbbbbbb-0001", scenarioId: "5697630" });
  for (const key of Object.keys(FIXTURE.base_payload)) {
    assert.equal(result[key], FIXTURE.base_payload[key]);
  }
});

test("propagación: buildMakePayload nunca muta el payload base original", () => {
  const before = JSON.stringify(FIXTURE.base_payload);
  buildMakePayload(FIXTURE.base_payload, { requestId: "req_x", correlationId: "corr_y", scenarioId: "1" });
  assert.equal(JSON.stringify(FIXTURE.base_payload), before);
});

test("propagación: round-trip buildMakePayload -> extractCorrelationFromPayload devuelve exactamente lo que se puso", () => {
  const built = buildMakePayload(FIXTURE.base_payload, { requestId: "req_roundtrip-0001", correlationId: "corr_roundtrip-0001", scenarioId: "6199248" });
  const extracted = extractCorrelationFromPayload(built);
  assert.deepEqual(extracted, { requestId: "req_roundtrip-0001", correlationId: "corr_roundtrip-0001", scenarioId: "6199248" });
});

test("propagación: correlationId ausente (null) se propaga como null explícito, no se omite la clave ni se inventa un valor", () => {
  const built = buildMakePayload(FIXTURE.base_payload, { requestId: "req_sin-corr-00001", scenarioId: null });
  assert.equal(built._cp04_correlation.correlation_id, null);
  assert.equal(built._cp04_correlation.scenario_id, null);
});

test("extractCorrelationFromPayload sobre un payload sin _cp04_correlation devuelve los 3 campos en null, nunca lanza", () => {
  const extracted = extractCorrelationFromPayload({ accion: "cancelar" });
  assert.deepEqual(extracted, { requestId: null, correlationId: null, scenarioId: null });
});
