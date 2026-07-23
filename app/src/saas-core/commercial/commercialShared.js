// Paso 19 · Fase 2/3 — utilidades compartidas por stripeAdapter.js y
// whatsappAdapter.js. Puro/determinista donde es posible (mismo
// principio que evidenceSchema.js, Paso 12/16-18): ninguna clave de
// idempotencia depende de un reloj real, para que sea reproducible en
// tests y estable entre reintentos del MISMO comando.

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";

/**
 * Clave de idempotencia determinista: mismo `parts` -> misma clave,
 * siempre. Nunca usa `Date.now()`/`Math.random()` — a diferencia de un
 * UUID aleatorio, esto permite que un reintento del MISMO comando (p.
 * ej. tras un timeout de red) reutilice la MISMA clave, que es
 * justamente el propósito de una idempotency key en Stripe/Graph API.
 */
export function generateIdempotencyKey(parts) {
  if (!Array.isArray(parts) || parts.length === 0) {
    throw new Error("generateIdempotencyKey requiere un array no vacío de partes deterministas");
  }
  const hash = createHash("sha256").update(parts.map((p) => String(p)).join("|")).digest("hex");
  return `idem_${hash.slice(0, 32)}`;
}

/** Nunca expone un secreto completo — usado en cualquier salida de estado/log. */
export function redactSecret(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.length <= 8) return "***";
  return `${value.slice(0, 7)}***${value.slice(-4)}`;
}

/**
 * Comparación de HMAC en tiempo constante — evita ataques de timing al
 * verificar firmas de webhook (Stripe/Meta). Nunca usa `===` sobre
 * secretos/firmas.
 */
export function constantTimeEqual(a, b) {
  const bufA = Buffer.from(String(a), "utf8");
  const bufB = Buffer.from(String(b), "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function computeHmacSha256Hex(secret, payload) {
  return createHmac("sha256", secret).update(payload, "utf8").digest("hex");
}

/**
 * Reintento con backoff exponencial determinista (sin jitter aleatorio,
 * para que los tests sean reproducibles). `sleepFn` es inyectable — los
 * tests pasan una función no-bloqueante para no ralentizar la suite.
 */
export async function withRetryBackoff(fn, { retries = 3, baseDelayMs = 200, isRetryable = () => true, sleepFn = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt === retries || !isRetryable(err)) throw err;
      await sleepFn(baseDelayMs * 2 ** attempt);
    }
  }
  throw lastError;
}

export function classifySecretMode(secret, { livePrefixes, testPrefixes }) {
  if (typeof secret !== "string" || secret.length === 0) return "unconfigured";
  if (livePrefixes.some((p) => secret.startsWith(p))) return "live";
  if (testPrefixes.some((p) => secret.startsWith(p))) return "test";
  return "unknown";
}
