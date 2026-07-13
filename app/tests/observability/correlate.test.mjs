import test from "node:test";
import assert from "node:assert/strict";
import { buildCorrelationChains, EXPECTED_BOOKING_CHAIN } from "../../scripts/observability/correlate.mjs";

function ev(service, correlationId) {
  return { service, correlation_id: correlationId, request_id: `req_${service}` };
}

test("una cadena con los 3 servicios esperados está completa", () => {
  const { chains } = buildCorrelationChains([ev("worker", "corr_a"), ev("make", "corr_a"), ev("airtable", "corr_a")]);
  const chain = chains.find((c) => c.correlation_id === "corr_a");
  assert.equal(chain.complete, true);
  assert.deepEqual(chain.missingSteps, []);
});

test("una cadena a la que le falta un eslabón queda marcada como rota, con el eslabón exacto que falta", () => {
  const { chains } = buildCorrelationChains([ev("worker", "corr_b"), ev("make", "corr_b")]);
  const chain = chains.find((c) => c.correlation_id === "corr_b");
  assert.equal(chain.complete, false);
  assert.deepEqual(chain.missingSteps, ["airtable"]);
});

test("eventos sin correlation_id son huérfanos, no un error — nunca se les inventa uno", () => {
  const { orphans, chains } = buildCorrelationChains([{ service: "worker", correlation_id: null }]);
  assert.equal(orphans.length, 1);
  assert.equal(chains.length, 0);
});

test("nunca sobreescribe correlation_id — el valor devuelto en cada evento de la cadena es exactamente el de entrada", () => {
  const input = [ev("worker", "corr_c"), ev("make", "corr_c")];
  const { chains } = buildCorrelationChains(input);
  const chain = chains.find((c) => c.correlation_id === "corr_c");
  for (const e of chain.events) assert.equal(e.correlation_id, "corr_c");
});

test("EXPECTED_BOOKING_CHAIN es exactamente worker -> make -> airtable", () => {
  assert.deepEqual(EXPECTED_BOOKING_CHAIN, ["worker", "make", "airtable"]);
});

test("dos correlation_id distintos producen dos cadenas independientes", () => {
  const { chains } = buildCorrelationChains([ev("worker", "corr_x"), ev("make", "corr_x"), ev("airtable", "corr_x"), ev("worker", "corr_y")]);
  assert.equal(chains.length, 2);
});
