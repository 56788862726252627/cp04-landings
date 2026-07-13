import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runPipeline, generatePipelineReport, toSloSamples, deriveDependencySnapshotFromSamples } from "../../scripts/observability/pipeline.mjs";
import { WINDOWS_MS } from "../../scripts/observability/slo-calculator.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = path.resolve(__dirname, "../../fixtures/observability");

function loadAllRawEvents() {
  const events = [];
  for (const f of readdirSync(FIXTURES_DIR).filter((f) => f.endsWith(".json")).sort()) {
    const data = JSON.parse(readFileSync(path.join(FIXTURES_DIR, f), "utf8"));
    if (Array.isArray(data)) events.push(...data);
    else events.push(data);
  }
  return events;
}

function nowFromData(rawEvents) {
  return Math.max(...rawEvents.map((e) => Date.parse(e.occurred_at) || 0)) + 60_000;
}

function deepStringValues(obj, out = []) {
  if (obj === null || obj === undefined) return out;
  if (typeof obj === "string") { out.push(obj); return out; }
  if (Array.isArray(obj)) { obj.forEach((v) => deepStringValues(v, out)); return out; }
  if (typeof obj === "object") { for (const v of Object.values(obj)) deepStringValues(v, out); return out; }
  return out;
}

function deepKeys(obj, out = []) {
  if (obj === null || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    out.push(k);
    deepKeys(v, out);
  }
  return out;
}

test("las 12 fixtures (15 eventos aplanados) existen y se cargan", () => {
  const events = loadAllRawEvents();
  assert.equal(events.length, 15);
});

test("normalización correcta: 14 de 15 eventos crudos se normalizan (solo el tipo desconocido no)", () => {
  const events = loadAllRawEvents();
  const { rejected } = runPipeline(events);
  const rejectedAtNormalize = rejected.filter((r) => r.stage === "normalize");
  assert.equal(rejectedAtNormalize.length, 1);
  assert.equal(rejectedAtNormalize[0].reason, "UNKNOWN_RAW_EVENT_TYPE");
});

test("evento unknown: el tipo no reconocido se rechaza, no se cuela como si fuera válido", () => {
  const events = loadAllRawEvents();
  const { accepted } = runPipeline(events);
  assert.ok(!accepted.some((e) => e.message?.includes("legacy_widget_ping")));
});

test("redacción de secretos: el evento con secreto embebido termina aceptado y sin ningún dato sensible", () => {
  const events = loadAllRawEvents();
  const { accepted } = runPipeline(events);
  const cleaned = accepted.find((e) => e.request_id === "req_local-0009");
  assert.ok(cleaned, "el evento 9 debería haber sido aceptado tras la redacción");

  const allStrings = deepStringValues(cleaned).join(" | ");
  assert.ok(!allStrings.includes("eyJhbGciOiJIUzI1NiJ9"), "no debe quedar el JWT");
  assert.ok(!allStrings.includes("supersecretvalue123"), "no debe quedar el valor del webhook token");
  assert.ok(!allStrings.includes("jugador.demo@example.com"), "no debe quedar el email en claro");
});

test("rechazo de campos prohibidos: ningún evento aceptado por el pipeline conserva una clave prohibida en ningún nivel", () => {
  const events = loadAllRawEvents();
  const { accepted } = runPipeline(events);
  const forbidden = /(password|token|secret|api[_-]?key|authorization|cookie|access_token|refresh_token)/i;
  for (const e of accepted) {
    const keys = deepKeys(e);
    for (const k of keys) {
      assert.ok(!forbidden.test(k), `la clave "${k}" no debería sobrevivir en un evento aceptado`);
    }
  }
});

test("preservación de correlation_id: el valor de salida es idéntico al de entrada para cada evento de la cadena válida", () => {
  const events = loadAllRawEvents();
  const { accepted } = runPipeline(events);
  const chainAEvents = accepted.filter((e) => e.correlation_id === "corr_local-chain-a");
  assert.equal(chainAEvents.length, 3);
});

test("la cadena de correlación válida (10) está completa; la rota (11) señala exactamente el eslabón que falta", () => {
  const events = loadAllRawEvents();
  const { chains } = runPipeline(events);
  const chainA = chains.find((c) => c.correlation_id === "corr_local-chain-a");
  const chainB = chains.find((c) => c.correlation_id === "corr_local-chain-b");
  assert.equal(chainA.complete, true);
  assert.equal(chainB.complete, false);
  assert.deepEqual(chainB.missingSteps, ["airtable"]);
});

test("feed al SLO engine: toSloSamples produce samples con el shape que consume slo-calculator.mjs", () => {
  const events = loadAllRawEvents();
  const { accepted } = runPipeline(events);
  const samples = toSloSamples(accepted);
  for (const s of samples) {
    assert.ok("timestamp" in s && "service" in s && "status" in s && "latency_ms" in s);
  }
  assert.equal(samples.length, accepted.length);
});

test("feed al health model: deriveDependencySnapshotFromSamples nunca asume 'todo bien' sin datos (servicio sin samples -> UNKNOWN)", () => {
  const snapshot = deriveDependencySnapshotFromSamples("stripe", [], Date.now(), WINDOWS_MS["24h"]);
  assert.equal(snapshot.status, "UNKNOWN");
});

test("feed al health model: un servicio con éxitos y fallos reales en la ventana se deriva como DEGRADED, no como HEALTHY por defecto", () => {
  const events = loadAllRawEvents();
  const { accepted } = runPipeline(events);
  const samples = toSloSamples(accepted);
  const now = nowFromData(events);
  const makeSnapshot = deriveDependencySnapshotFromSamples("make", samples, now, WINDOWS_MS["24h"]);
  assert.equal(makeSnapshot.status, "DEGRADED"); // 1 éxito (chain-a) + 1 fallo (chain-b) en la ventana
});

test("el reporte local incluye las 4 secciones pedidas por FASE 8, en orden", () => {
  const events = loadAllRawEvents();
  const report = generatePipelineReport(events, nowFromData(events));
  const idx = ["=== OBSERVABILITY PIPELINE ===", "=== TAXONOMY ===", "=== SECURITY ===", "=== SLO FEED ==="].map((h) => report.indexOf(h));
  assert.ok(idx.every((i) => i !== -1));
  assert.ok(idx[0] < idx[1] && idx[1] < idx[2] && idx[2] < idx[3]);
});

test("el reporte declara explícitamente que no se ha conectado a producción ni enviado alertas", () => {
  const events = loadAllRawEvents();
  const report = generatePipelineReport(events, nowFromData(events));
  assert.ok(report.includes("No se ha conectado a ningún sistema real"));
});

test("el reporte nunca contiene 'undefined'", () => {
  const events = loadAllRawEvents();
  const report = generatePipelineReport(events, nowFromData(events));
  assert.ok(!report.includes("undefined"));
});
