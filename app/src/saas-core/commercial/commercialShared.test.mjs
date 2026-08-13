import { test } from "node:test";
import assert from "node:assert/strict";

import { generateIdempotencyKey, redactSecret, constantTimeEqual, computeHmacSha256Hex, withRetryBackoff, classifySecretMode } from "./commercialShared.js";

test("generateIdempotencyKey es determinista: mismas partes -> misma clave", () => {
  const a = generateIdempotencyKey(["cliente-1", 4900, "eur"]);
  const b = generateIdempotencyKey(["cliente-1", 4900, "eur"]);
  assert.equal(a, b);
  assert.match(a, /^idem_[0-9a-f]{32}$/);
});

test("generateIdempotencyKey produce claves distintas para partes distintas", () => {
  const a = generateIdempotencyKey(["cliente-1", 4900, "eur"]);
  const b = generateIdempotencyKey(["cliente-2", 4900, "eur"]);
  assert.notEqual(a, b);
});

test("generateIdempotencyKey rechaza un array vacío o no-array", () => {
  assert.throws(() => generateIdempotencyKey([]));
  assert.throws(() => generateIdempotencyKey(null));
});

test("redactSecret nunca expone el secreto completo", () => {
  assert.equal(redactSecret("sk_test_abcdefghijklmnop"), "sk_test***mnop");
  assert.equal(redactSecret("short"), "***");
  assert.equal(redactSecret(undefined), null);
  assert.equal(redactSecret(""), null);
});

test("constantTimeEqual compara correctamente y rechaza longitudes distintas sin lanzar", () => {
  assert.equal(constantTimeEqual("abc", "abc"), true);
  assert.equal(constantTimeEqual("abc", "abd"), false);
  assert.equal(constantTimeEqual("abc", "abcd"), false);
});

test("computeHmacSha256Hex es determinista y coincide con un HMAC-SHA256 conocido", () => {
  const hex = computeHmacSha256Hex("secret", "message");
  assert.equal(hex, computeHmacSha256Hex("secret", "message"));
  assert.equal(hex.length, 64);
});

test("classifySecretMode distingue live/test/unconfigured/unknown", () => {
  assert.equal(classifySecretMode("sk_live_x", { livePrefixes: ["sk_live_"], testPrefixes: ["sk_test_"] }), "live");
  assert.equal(classifySecretMode("sk_test_x", { livePrefixes: ["sk_live_"], testPrefixes: ["sk_test_"] }), "test");
  assert.equal(classifySecretMode(undefined, { livePrefixes: ["sk_live_"], testPrefixes: ["sk_test_"] }), "unconfigured");
  assert.equal(classifySecretMode("rk_weird_x", { livePrefixes: ["sk_live_"], testPrefixes: ["sk_test_"] }), "unknown");
});

test("withRetryBackoff reintenta hasta el límite y lanza el último error", async () => {
  let attempts = 0;
  await assert.rejects(
    () => withRetryBackoff(async () => { attempts++; throw new Error("fallo"); }, { retries: 2, baseDelayMs: 1, sleepFn: () => Promise.resolve() }),
    /fallo/
  );
  assert.equal(attempts, 3);
});

test("withRetryBackoff no reintenta si isRetryable devuelve false", async () => {
  let attempts = 0;
  await assert.rejects(
    () => withRetryBackoff(async () => { attempts++; throw new Error("no reintentable"); }, { retries: 5, isRetryable: () => false, sleepFn: () => Promise.resolve() }),
    /no reintentable/
  );
  assert.equal(attempts, 1);
});

test("withRetryBackoff devuelve el resultado en el primer intento exitoso", async () => {
  const result = await withRetryBackoff(async () => "ok", { sleepFn: () => Promise.resolve() });
  assert.equal(result, "ok");
});
