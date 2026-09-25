// Paso 19 · Fase 2 — Adaptador Stripe AISLADO. Distinto del mock de Make
// (audit/) y del adapter de una sesión anterior (Stripe sandbox
// readiness, otra rama/worktree no visible aquí) — este es un build
// nuevo para la cadena de ramas apiladas de Pasos 14-18.
//
// Contrato:
//  - NUNCA realiza una petición real sin `STRIPE_SECRET_KEY` presente en
//    `env` — sin ella, toda función de escritura/lectura remota devuelve
//    `status: "not_configured"` de forma determinista, nunca lanza,
//    nunca inventa una respuesta de Stripe.
//  - Si la clave presente es de modo LIVE (`sk_live_`), se BLOQUEA por
//    defecto (`status: "blocked_live_mode"`) salvo `allowLiveMode: true`
//    explícito — nunca se asume que "hay clave" significa "usar en
//    producción sin más".
//  - La verificación de firma de webhook es REAL y verificable offline
//    (HMAC-SHA256 sobre el esquema documentado de Stripe) — no depende
//    de ninguna credencial de API, solo del secreto de firma del
//    webhook (`STRIPE_WEBHOOK_SECRET`), que el propio panel de Stripe
//    entrega sin necesidad de una cuenta activa para poder probarlo.
//  - Nunca añade `stripe` (el SDK npm) como dependencia: usa `fetch`
//    nativo de Node contra la API REST documentada de Stripe,
//    igual que `publicWebsiteFetcher.js` usa `node:https` directamente
//    en vez de una librería de terceros.
//  - `fetchImpl` es inyectable (por defecto `fetch` global) — permite
//    testear la construcción exacta de la petición sin red real.

import process from "node:process";

import { generateIdempotencyKey, redactSecret, constantTimeEqual, computeHmacSha256Hex, classifySecretMode } from "./commercialShared.js";
import { validateCheckoutSessionParams, validateRefundParams } from "./commercialSchemas.js";

export const STRIPE_API_BASE = "https://api.stripe.com/v1";
const LIVE_PREFIXES = Object.freeze(["sk_live_"]);
const TEST_PREFIXES = Object.freeze(["sk_test_"]);

export function isStripeConfigured(env = process.env) {
  return typeof env.STRIPE_SECRET_KEY === "string" && env.STRIPE_SECRET_KEY.length > 0;
}

/** Nunca expone la clave completa — seguro para volcar en un informe/log. */
export function getStripeRuntimeStatus(env = process.env) {
  const secretKey = env.STRIPE_SECRET_KEY;
  const mode = classifySecretMode(secretKey, { livePrefixes: LIVE_PREFIXES, testPrefixes: TEST_PREFIXES });
  return {
    configured: isStripeConfigured(env),
    mode,
    secretKeyRedacted: redactSecret(secretKey),
    webhookSecretConfigured: typeof env.STRIPE_WEBHOOK_SECRET === "string" && env.STRIPE_WEBHOOK_SECRET.length > 0,
  };
}

function guardConfiguredAndSafeMode(env, allowLiveMode) {
  if (!isStripeConfigured(env)) {
    return { blocked: true, result: { status: "not_configured", reason: "STRIPE_SECRET_KEY no está definida en el entorno — ninguna petición real se ha realizado." } };
  }
  const status = getStripeRuntimeStatus(env);
  if (status.mode === "live" && !allowLiveMode) {
    return { blocked: true, result: { status: "blocked_live_mode", reason: "La clave configurada es de modo LIVE y allowLiveMode no se ha activado explícitamente — ninguna petición real se ha realizado." } };
  }
  if (status.mode === "unknown") {
    return { blocked: true, result: { status: "unknown_key_format", reason: "STRIPE_SECRET_KEY no tiene un prefijo reconocido (sk_test_/sk_live_) — ninguna petición real se ha realizado." } };
  }
  return { blocked: false, mode: status.mode };
}

function buildFormBody(fields) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    params.append(key, String(value));
  }
  return params;
}

/**
 * Crea una Checkout Session real de Stripe. Sin configuración/modo
 * seguro, nunca llega a `fetchImpl` — verificado por test.
 */
export async function createCheckoutSession(params, { env = process.env, allowLiveMode = false, fetchImpl = fetch, idempotencyParts } = {}) {
  const { valid, errors } = validateCheckoutSessionParams(params);
  if (!valid) return { status: "invalid_params", errors };

  const guard = guardConfiguredAndSafeMode(env, allowLiveMode);
  if (guard.blocked) return guard.result;

  const idempotencyKey = generateIdempotencyKey(idempotencyParts ?? [params.customerReference, params.amountMinorUnits, params.currency, params.successUrl, params.cancelUrl]);
  const body = buildFormBody({
    mode: "payment",
    "line_items[0][price_data][currency]": params.currency.toLowerCase(),
    "line_items[0][price_data][unit_amount]": params.amountMinorUnits,
    "line_items[0][price_data][product_data][name]": params.description ?? "Pedido",
    "line_items[0][quantity]": 1,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.customerReference,
  });

  const response = await fetchImpl(`${STRIPE_API_BASE}/checkout/sessions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": idempotencyKey },
    body,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { status: "stripe_error", httpStatus: response.status, error: data?.error ?? null };
  return { status: "created", checkoutSessionId: data?.id ?? null, checkoutUrl: data?.url ?? null, idempotencyKey };
}

export async function retrieveCheckoutSession(sessionId, { env = process.env, allowLiveMode = false, fetchImpl = fetch } = {}) {
  if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) return { status: "invalid_params", errors: [{ field: "sessionId", message: "debe ser un id de Checkout Session (prefijo 'cs_')" }] };
  const guard = guardConfiguredAndSafeMode(env, allowLiveMode);
  if (guard.blocked) return guard.result;

  const response = await fetchImpl(`${STRIPE_API_BASE}/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { status: "stripe_error", httpStatus: response.status, error: data?.error ?? null };
  return { status: "retrieved", paymentStatus: data?.payment_status ?? null, checkoutSessionId: data?.id ?? null };
}

export async function createRefund(params, { env = process.env, allowLiveMode = false, fetchImpl = fetch, idempotencyParts } = {}) {
  const { valid, errors } = validateRefundParams(params);
  if (!valid) return { status: "invalid_params", errors };

  const guard = guardConfiguredAndSafeMode(env, allowLiveMode);
  if (guard.blocked) return guard.result;

  const idempotencyKey = generateIdempotencyKey(idempotencyParts ?? [params.paymentIntentId, params.amountMinorUnits ?? "full"]);
  const body = buildFormBody({ payment_intent: params.paymentIntentId, amount: params.amountMinorUnits });

  const response = await fetchImpl(`${STRIPE_API_BASE}/refunds`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded", "Idempotency-Key": idempotencyKey },
    body,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { status: "stripe_error", httpStatus: response.status, error: data?.error ?? null };
  return { status: "refunded", refundId: data?.id ?? null, idempotencyKey };
}

/**
 * Verificación REAL de la firma de webhook de Stripe (esquema
 * documentado: `t=<timestamp>,v1=<hex>`, firmado sobre
 * `${timestamp}.${rawPayload}`) — funciona completamente offline, sin
 * ninguna llamada de red, con solo el secreto de firma del webhook.
 */
export function verifyStripeWebhookSignature(rawPayload, signatureHeader, secret, { toleranceSeconds = null, nowSeconds = Math.floor(Date.now() / 1000) } = {}) {
  if (typeof signatureHeader !== "string" || signatureHeader.length === 0) return { valid: false, reason: "cabecera Stripe-Signature ausente o vacía" };
  const parts = Object.fromEntries(signatureHeader.split(",").map((kv) => kv.split("=")));
  const timestamp = parts.t;
  const v1Signatures = signatureHeader.split(",").filter((kv) => kv.startsWith("v1=")).map((kv) => kv.slice(3));
  if (!timestamp || v1Signatures.length === 0) return { valid: false, reason: "cabecera Stripe-Signature mal formada (falta t= o v1=)" };

  const expected = computeHmacSha256Hex(secret, `${timestamp}.${rawPayload}`);
  const matches = v1Signatures.some((sig) => sig.length === expected.length && constantTimeEqual(sig, expected));
  if (!matches) return { valid: false, reason: "firma no coincide con el HMAC esperado" };

  if (toleranceSeconds !== null) {
    const age = nowSeconds - Number(timestamp);
    if (age > toleranceSeconds || age < -toleranceSeconds) return { valid: false, reason: `timestamp fuera de tolerancia (${age}s, límite ${toleranceSeconds}s)` };
  }
  return { valid: true, reason: null };
}

export function parseStripeWebhookEvent(rawPayload, signatureHeader, secret, options = {}) {
  const verification = verifyStripeWebhookSignature(rawPayload, signatureHeader, secret, options);
  if (!verification.valid) return { valid: false, reason: verification.reason, event: null };
  let event;
  try {
    event = JSON.parse(rawPayload);
  } catch {
    return { valid: false, reason: "payload no es JSON válido tras verificar la firma", event: null };
  }
  return { valid: true, reason: null, event };
}
