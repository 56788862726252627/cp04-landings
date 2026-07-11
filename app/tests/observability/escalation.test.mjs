import test from "node:test";
import assert from "node:assert/strict";
import {
  nextSeverity,
  computeEscalatedSeverity,
  escalationChainFor,
  SEVERITY_ORDER,
  ESCALATION_THRESHOLDS_MS,
} from "../../scripts/observability/escalation.mjs";

test("nextSeverity sube un nivel: P3->P2->P1->P0", () => {
  assert.equal(nextSeverity("P3"), "P2");
  assert.equal(nextSeverity("P2"), "P1");
  assert.equal(nextSeverity("P1"), "P0");
});

test("nextSeverity de P0 se queda en P0 — ya es el techo", () => {
  assert.equal(nextSeverity("P0"), "P0");
});

test("computeEscalatedSeverity por debajo del umbral no escala", () => {
  assert.equal(computeEscalatedSeverity("P2", 60 * 1000), "P2");
});

test("computeEscalatedSeverity P1 que supera 1h sin resolver escala a P0", () => {
  const age = ESCALATION_THRESHOLDS_MS.P1 + 60 * 1000;
  assert.equal(computeEscalatedSeverity("P1", age), "P0");
});

test("computeEscalatedSeverity encadena varios saltos si la edad cruza varios umbrales", () => {
  const age = ESCALATION_THRESHOLDS_MS.P2 + ESCALATION_THRESHOLDS_MS.P1 + 1000;
  assert.equal(computeEscalatedSeverity("P2", age), "P0");
});

test("computeEscalatedSeverity nunca escala más allá de P0 aunque la edad sea enorme", () => {
  assert.equal(computeEscalatedSeverity("P3", Number.MAX_SAFE_INTEGER), "P0");
});

test("computeEscalatedSeverity con severidad ya en P0 se mantiene en P0 (umbral Infinity)", () => {
  assert.equal(computeEscalatedSeverity("P0", 999 * ESCALATION_THRESHOLDS_MS.P1), "P0");
});

test("escalationChainFor devuelve una cadena no vacía para cada severidad definida", () => {
  for (const s of SEVERITY_ORDER) assert.ok(escalationChainFor(s).length > 0);
});

test("escalationChainFor de P0 incluye on-call-primario y on-call-secundario", () => {
  const chain = escalationChainFor("P0");
  assert.ok(chain.includes("on-call-primario"));
  assert.ok(chain.includes("on-call-secundario"));
});

test("escalationChainFor de una severidad desconocida cae a la cadena de P3 (dashboard pasivo), nunca lanza", () => {
  assert.deepEqual(escalationChainFor("NO_EXISTE"), escalationChainFor("P3"));
});
