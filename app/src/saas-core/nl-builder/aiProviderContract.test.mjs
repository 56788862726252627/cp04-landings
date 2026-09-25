import { test } from "node:test";
import assert from "node:assert/strict";

import {
  createMockAiLanguageProvider,
  interpretWithProviderOrFallback,
  sanitizePromptForProvider,
  implementsAiProviderInterface,
  findMissingAiProviderMethods,
  MAX_PROMPT_LENGTH_FOR_PROVIDER,
} from "./aiProviderContract.js";

function fallback(text) {
  return { fromFallback: true, receivedText: text };
}

test("sin proveedor configurado, siempre usa el fallback determinista y lo declara en la traza", async () => {
  const result = await interpretWithProviderOrFallback({ promptText: "hola", provider: undefined, deterministicFallback: fallback });
  assert.equal(result.usedProvider, false);
  assert.equal(result.fallbackReason, "no_provider_configured");
  assert.equal(result.intent.fromFallback, true);
});

test("un proveedor sin el método requerido hace fallback sin intentar llamarlo", async () => {
  const brokenProvider = { otroMetodo: () => {} };
  const result = await interpretWithProviderOrFallback({ promptText: "hola", provider: brokenProvider, deterministicFallback: fallback });
  assert.equal(result.usedProvider, false);
  assert.match(result.fallbackReason, /provider_incomplete_interface/);
});

test("proveedor mock en modo success se usa directamente (usedProvider=true)", async () => {
  const provider = createMockAiLanguageProvider({ mode: "success" });
  const result = await interpretWithProviderOrFallback({ promptText: "clínica dental de Málaga", provider, deterministicFallback: fallback });
  assert.equal(result.usedProvider, true);
  assert.equal(result.fallbackReason, null);
  assert.equal(result.intent.business.sector, "generic-local-service");
});

test("proveedor mock que lanza excepción hace fallback determinista", async () => {
  const provider = createMockAiLanguageProvider({ mode: "throws" });
  const result = await interpretWithProviderOrFallback({ promptText: "hola", provider, deterministicFallback: fallback, retryPolicy: { maxRetries: 0, timeoutMs: 1000 } });
  assert.equal(result.usedProvider, false);
  assert.match(result.fallbackReason, /provider_failed_after/);
  assert.equal(result.intent.fromFallback, true);
});

test("proveedor mock con JSON/forma inválida hace fallback determinista (nunca propaga la salida cruda)", async () => {
  const provider = createMockAiLanguageProvider({ mode: "invalid_shape" });
  const result = await interpretWithProviderOrFallback({ promptText: "hola", provider, deterministicFallback: fallback, retryPolicy: { maxRetries: 0, timeoutMs: 1000 } });
  assert.equal(result.usedProvider, false);
  assert.equal(result.intent.fromFallback, true);
});

test("proveedor mock que nunca resuelve (timeout) hace fallback tras el timeout configurado, sin colgar el proceso", async () => {
  const provider = createMockAiLanguageProvider({ mode: "never_resolves" });
  const start = Date.now();
  const result = await interpretWithProviderOrFallback({ promptText: "hola", provider, deterministicFallback: fallback, retryPolicy: { maxRetries: 0, timeoutMs: 50 } });
  const elapsed = Date.now() - start;
  assert.equal(result.usedProvider, false);
  assert.match(result.fallbackReason, /provider_failed_after/);
  assert.ok(elapsed < 2000, `no debería tardar mucho más que el timeout configurado (tardó ${elapsed}ms)`);
});

test("reintenta hasta maxRetries antes de hacer fallback", async () => {
  let calls = 0;
  const provider = {
    async interpretBusinessDescription() {
      calls++;
      throw new Error("fallo simulado");
    },
  };
  const result = await interpretWithProviderOrFallback({ promptText: "hola", provider, deterministicFallback: fallback, retryPolicy: { maxRetries: 2, timeoutMs: 1000 } });
  assert.equal(calls, 3);
  assert.equal(result.attempts.length, 3);
  assert.equal(result.usedProvider, false);
});

test("sanitizePromptForProvider elimina caracteres de control y trunca al límite máximo", () => {
  const withControlChars = "hola\x00mundo\x1f!";
  assert.ok(!sanitizePromptForProvider(withControlChars).includes("\x00"));
  const veryLong = "a".repeat(MAX_PROMPT_LENGTH_FOR_PROVIDER + 500);
  assert.equal(sanitizePromptForProvider(veryLong).length, MAX_PROMPT_LENGTH_FOR_PROVIDER);
});

test("implementsAiProviderInterface / findMissingAiProviderMethods detectan un mock válido", () => {
  const provider = createMockAiLanguageProvider();
  assert.equal(implementsAiProviderInterface(provider), true);
  assert.deepEqual(findMissingAiProviderMethods({}), ["interpretBusinessDescription"]);
});
