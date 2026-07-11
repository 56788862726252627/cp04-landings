import test from "node:test";
import assert from "node:assert/strict";
import {
  WINDOWS_MS,
  filterSamplesInWindow,
  percentile,
  computeAvailability,
  computeSuccessRate,
  computeErrorRate,
  computeDependencyFailureRate,
  computeLatencyPercentiles,
  computeErrorBudget,
} from "../../scripts/observability/slo-calculator.mjs";

// --- percentiles ---

test("percentile: p50 de una lista impar es el valor central", () => {
  assert.equal(percentile([10, 20, 30, 40, 50], 50), 30);
});

test("percentile: p95/p99 sobre 100 valores devuelven el rango más cercano esperado", () => {
  const values = Array.from({ length: 100 }, (_, i) => i + 1); // 1..100
  assert.equal(percentile(values, 95), 95);
  assert.equal(percentile(values, 99), 99);
});

test("percentile: array vacío devuelve null (nunca un número inventado)", () => {
  assert.equal(percentile([], 95), null);
});

test("computeLatencyPercentiles ignora samples sin latency_ms numérica", () => {
  const samples = [{ latency_ms: 100 }, { latency_ms: null }, { latency_ms: 200 }, { latency_ms: 300 }];
  const result = computeLatencyPercentiles(samples);
  assert.equal(result.p50, 200);
});

// --- availability / error_rate / success_rate ---

test("computeAvailability: solo 'success' cuenta como bueno", () => {
  const samples = [
    { status: "success" }, { status: "success" }, { status: "success" },
    { status: "failure" }, { status: "partial" }, { status: "degraded" }, { status: "unknown" },
  ];
  assert.equal(computeAvailability(samples), 3 / 7);
});

test("computeAvailability sobre array vacío es null, no 0 ni 1 inventados", () => {
  assert.equal(computeAvailability([]), null);
});

test("computeErrorRate cuenta solo 'failure'", () => {
  const samples = [{ status: "success" }, { status: "failure" }, { status: "failure" }, { status: "unknown" }];
  assert.equal(computeErrorRate(samples), 2 / 4);
});

test("computeSuccessRate es la misma fórmula que computeAvailability (alias semántico)", () => {
  const samples = [{ status: "success" }, { status: "failure" }];
  assert.equal(computeSuccessRate(samples), computeAvailability(samples));
});

test("computeDependencyFailureRate filtra por service antes de calcular", () => {
  const samples = [
    { service: "airtable", status: "failure" },
    { service: "airtable", status: "success" },
    { service: "make", status: "failure" },
  ];
  assert.equal(computeDependencyFailureRate(samples, "airtable"), 1 / 2);
  assert.equal(computeDependencyFailureRate(samples, "make"), 1 / 1);
});

// --- ventanas ---

test("las 5 ventanas pedidas (5m/1h/24h/7d/30d) están definidas y en orden creciente", () => {
  const keys = ["5m", "1h", "24h", "7d", "30d"];
  for (const k of keys) assert.ok(WINDOWS_MS[k] > 0, `falta la ventana ${k}`);
  for (let i = 1; i < keys.length; i++) {
    assert.ok(WINDOWS_MS[keys[i]] > WINDOWS_MS[keys[i - 1]], `${keys[i]} debería ser mayor que ${keys[i - 1]}`);
  }
});

test("filterSamplesInWindow excluye muestras fuera de la ventana y respeta el filtro de servicio", () => {
  const now = Date.parse("2026-07-08T12:00:00.000Z");
  const samples = [
    { timestamp: "2026-07-08T11:59:50.000Z", service: "worker", status: "success" }, // dentro de 5m
    { timestamp: "2026-07-08T11:50:00.000Z", service: "worker", status: "success" }, // fuera de 5m, dentro de 1h
    { timestamp: "2026-07-07T00:00:00.000Z", service: "worker", status: "success" }, // fuera de 1h y 24h
    { timestamp: "2026-07-08T11:59:55.000Z", service: "airtable", status: "success" }, // dentro de 5m, otro servicio
  ];
  const within5mWorker = filterSamplesInWindow(samples, now, WINDOWS_MS["5m"], "worker");
  assert.equal(within5mWorker.length, 1);

  const within1hWorker = filterSamplesInWindow(samples, now, WINDOWS_MS["1h"], "worker");
  assert.equal(within1hWorker.length, 2);

  const within5mAll = filterSamplesInWindow(samples, now, WINDOWS_MS["5m"]);
  assert.equal(within5mAll.length, 2);
});

// --- error budget / burn rate ---

test("computeErrorBudget: sistema perfecto (0 fallos) deja el presupuesto intacto", () => {
  const samples = Array.from({ length: 10 }, () => ({ status: "success" }));
  const budget = computeErrorBudget(samples, 0.99);
  assert.equal(budget.observedErrorRate, 0);
  assert.equal(budget.burnRate, 0);
  assert.equal(budget.budgetRemainingRatio, 1);
});

test("computeErrorBudget: burn_rate = tasa de error observada / tasa permitida por el SLO", () => {
  // 20 muestras, 3 fallos -> error rate 0.15; SLO 0.99 -> allowed 0.01 -> burn = 15
  const samples = [
    ...Array.from({ length: 17 }, () => ({ status: "success" })),
    ...Array.from({ length: 3 }, () => ({ status: "failure" })),
  ];
  const budget = computeErrorBudget(samples, 0.99);
  assert.equal(budget.observedErrorRate, 0.15);
  assert.ok(Math.abs(budget.allowedErrorRate - 0.01) < 1e-9);
  assert.ok(Math.abs(budget.burnRate - 15) < 1e-9);
});

test("computeErrorBudget: presupuesto agotado da budgetRemainingRatio negativo, nunca oculto como 0", () => {
  const samples = [
    ...Array.from({ length: 17 }, () => ({ status: "success" })),
    ...Array.from({ length: 3 }, () => ({ status: "failure" })),
  ];
  const budget = computeErrorBudget(samples, 0.99);
  assert.ok(budget.budgetRemainingRatio < 0, "el presupuesto agotado debe quedar en negativo, no truncado a 0");
});

test("computeErrorBudget sobre array vacío devuelve null explícito en todo, no ceros inventados", () => {
  const budget = computeErrorBudget([], 0.999);
  assert.equal(budget.observedAvailability, null);
  assert.equal(budget.burnRate, null);
  assert.equal(budget.budgetRemainingRatio, null);
});
