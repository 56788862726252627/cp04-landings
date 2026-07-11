import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classifyAirtableResponse, isSlowResponse, simulateRetrySequence, simulateTimeout, TTLCache, RequestDedupStore, buildRequestSignature } from "../../scripts/make-qa/airtable-mock.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AT_FIXTURES = path.join(__dirname, "../../fixtures/make-qa/airtable");

function load(name) {
  return JSON.parse(readFileSync(path.join(AT_FIXTURES, name), "utf8"));
}

test("clasifica 429 por minuto como RATE_LIMIT_PER_MINUTE (no cuota mensual)", () => {
  assert.equal(classifyAirtableResponse(load("response-429-rate-limit.json")), "RATE_LIMIT_PER_MINUTE");
});

test("clasifica el texto real de cuota mensual como MONTHLY_QUOTA_EXHAUSTED, distinto del rate-limit", () => {
  assert.equal(classifyAirtableResponse(load("response-quota-exhausted.json")), "MONTHLY_QUOTA_EXHAUSTED");
});

test("clasifica una respuesta 200 como OK", () => {
  assert.equal(classifyAirtableResponse(load("response-fast.json")), "OK");
});

test("respuesta lenta (>5000ms) se detecta como slow; una rápida no", () => {
  assert.equal(isSlowResponse(load("response-slow.json")), true);
  assert.equal(isSlowResponse(load("response-fast.json")), false);
});

test("timeout: latencia real muy por encima del configurado -> timedOut:true", () => {
  const fixture = load("response-timeout.json");
  const result = simulateTimeout(fixture.timeout_ms_configured, fixture.actual_latency_ms);
  assert.equal(result.timedOut, true);
});

test("timeout: latencia dentro del límite -> timedOut:false", () => {
  const result = simulateTimeout(5000, 200);
  assert.equal(result.timedOut, false);
});

test("retry: 2 fallos + éxito al 3er intento (dentro de maxRetries=3) -> success", () => {
  const { attempts } = load("retry-sequence-eventual-success.json");
  const result = simulateRetrySequence(attempts, 3);
  assert.equal(result.outcome, "success");
  assert.equal(result.attemptsUsed, 3);
});

test("retry: 4 fallos de rate-limit seguidos con maxRetries=3 -> exhausted_retries (mismo patrón que P0-2 persistente)", () => {
  const { attempts } = load("retry-sequence-exhausted.json");
  const result = simulateRetrySequence(attempts, 3);
  assert.equal(result.outcome, "exhausted_retries");
  assert.equal(result.attemptsUsed, 4);
});

test("retry: error 401 no reintentable se detiene en el primer intento, no agota reintentos en vano", () => {
  const { attempts } = load("retry-sequence-non-retryable.json");
  const result = simulateRetrySequence(attempts, 3);
  assert.equal(result.outcome, "non_retryable_error");
  assert.equal(result.attemptsUsed, 1);
});

test("TTLCache: primera lectura miss, segunda dentro del TTL hit, tercera tras expirar miss otra vez", () => {
  const fixture = load("cache-hit-miss-sequence.json");
  const cache = new TTLCache();
  const baseMs = 1000000;
  const results = fixture.reads_at_ms_offset.map((offset, i) => {
    const nowMs = baseMs + offset;
    const read = cache.get(fixture.cache_key, nowMs);
    if (!read.hit) cache.set(fixture.cache_key, `value-${i}`, fixture.ttl_ms, nowMs);
    return read.hit;
  });
  assert.deepEqual(results, [false, true, false]);
  assert.deepEqual(cache.stats, { hits: 1, misses: 2 });
});

test("RequestDedupStore: misma firma (tabla+filtro+campos, orden de campos irrelevante) se detecta duplicada dentro de la ventana", () => {
  const fixture = load("dedup-requests.json");
  const store = new RequestDedupStore();
  const nowMs = 5000;

  const sigA = buildRequestSignature(fixture.request_a);
  const sigB = buildRequestSignature(fixture.request_b_same_signature);
  assert.equal(sigA, sigB, "el orden de fields no debe afectar a la firma");

  assert.equal(store.isDuplicate(sigA, nowMs), false);
  store.markRequested(sigA, fixture.dedup_window_ms, nowMs);
  assert.equal(store.isDuplicate(sigB, nowMs + 500), true, "misma firma dentro de la ventana -> duplicada");

  const sigC = buildRequestSignature(fixture.request_c_different_signature);
  assert.equal(store.isDuplicate(sigC, nowMs + 500), false, "firma distinta no debe marcarse como duplicada");
});

test("RequestDedupStore: pasada la ventana de dedup, la misma firma ya no se considera duplicada", () => {
  const fixture = load("dedup-requests.json");
  const store = new RequestDedupStore();
  const sig = buildRequestSignature(fixture.request_a);
  store.markRequested(sig, fixture.dedup_window_ms, 0);
  assert.equal(store.isDuplicate(sig, fixture.dedup_window_ms + 1), false);
});
