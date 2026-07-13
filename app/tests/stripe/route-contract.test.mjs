// FASE 2 (cierre técnico 2026-07-10) — cobertura de
// worker-reservas/payments/stripe-route-contract.js: content-type, raw body,
// signature header, request_id/correlation_id, sanitized logging, timeout
// budget, response mapping. Módulo preparatorio, no registrado en el router
// real (ver worker-reservas/src/index.js) — estos tests no ejercitan ninguna
// ruta HTTP real, solo las funciones puras del contrato.
import test from "node:test";
import assert from "node:assert/strict";
import {
  STRIPE_WEBHOOK_ROUTE,
  STRIPE_SIGNATURE_HEADER,
  EXPECTED_CONTENT_TYPE,
  validateContentType,
  assertRawBodyNotConsumed,
  extractSignatureHeader,
  NEVER_LOG_FIELDS,
  sanitizeForRouteLogging,
  resolveRouteRequestContext,
  HANDLER_TIME_BUDGET_MS,
  withTimeoutBudget,
  CLASSIFICATION_TO_HTTP_RESPONSE,
  mapClassificationToHttpResponse,
} from "../../worker-reservas/payments/stripe-route-contract.js";
import { HARNESS_CLASSIFICATIONS } from "../../worker-reservas/payments/stripe-integration-harness.js";
import { STRIPE_ENDPOINTS } from "../../worker-reservas/payments/stripe-contract.js";

test("STRIPE_WEBHOOK_ROUTE es POST /api/payments/stripe/webhook (contrato exacto pedido por la misión)", () => {
  assert.deepEqual(STRIPE_WEBHOOK_ROUTE, { method: "POST", path: "/api/payments/stripe/webhook" });
});

test("anti-divergencia: STRIPE_ENDPOINTS.webhook (stripe-contract.js) y STRIPE_WEBHOOK_ROUTE.path (stripe-route-contract.js) deben ser exactamente la misma ruta canónica (riesgo residual #1, Production Readiness)", () => {
  assert.equal(
    STRIPE_ENDPOINTS.webhook,
    STRIPE_WEBHOOK_ROUTE.path,
    "Las dos constantes que describen la ruta del webhook Stripe han divergido de nuevo — reconcilia stripe-contract.js#STRIPE_ENDPOINTS.webhook y stripe-route-contract.js#STRIPE_WEBHOOK_ROUTE.path a un único valor.",
  );
});

test("la ruta canónica del webhook Stripe usa segmentos anidados por barra, nunca guion uniendo recurso+acción (consistente con /api/auth/login, /api/support/health/ready del Worker real)", () => {
  assert.equal(STRIPE_WEBHOOK_ROUTE.path, "/api/payments/stripe/webhook");
  assert.doesNotMatch(STRIPE_WEBHOOK_ROUTE.path, /stripe-webhook/);
});

// --- content-type ---------------------------------------------------------

test("validateContentType: application/json puro es válido", () => {
  assert.equal(validateContentType({ "content-type": "application/json" }).valid, true);
});

test("validateContentType: application/json con charset sigue siendo válido", () => {
  assert.equal(validateContentType({ "content-type": "application/json; charset=utf-8" }).valid, true);
});

test("validateContentType: acepta un objeto Headers-like (con .get)", () => {
  const headersLike = { get: (name) => (name.toLowerCase() === "content-type" ? "application/json" : null) };
  assert.equal(validateContentType(headersLike).valid, true);
});

test("validateContentType: rechaza form-urlencoded", () => {
  const result = validateContentType({ "content-type": "application/x-www-form-urlencoded" });
  assert.equal(result.valid, false);
  assert.match(result.reason, /unexpected_content_type/);
});

test("validateContentType: rechaza ausencia de content-type", () => {
  assert.equal(validateContentType({}).valid, false);
  assert.equal(validateContentType({}).reason, "missing_content_type");
});

// --- raw body ---------------------------------------------------------

test("assertRawBodyNotConsumed: no lanza si bodyUsed es false", () => {
  assert.doesNotThrow(() => assertRawBodyNotConsumed({ bodyUsed: false }));
});

test("assertRawBodyNotConsumed: lanza si el body ya fue consumido (p.ej. request.json() prematuro)", () => {
  assert.throws(() => assertRawBodyNotConsumed({ bodyUsed: true }), /el body de la request ya fue consumido/);
});

// --- signature header ---------------------------------------------------------

test("extractSignatureHeader: lee la cabecera Stripe-Signature de un objeto plano", () => {
  assert.equal(extractSignatureHeader({ "Stripe-Signature": "t=1,v1=abc" }), "t=1,v1=abc");
});

test("extractSignatureHeader: es case-insensitive en objeto plano", () => {
  assert.equal(extractSignatureHeader({ "stripe-signature": "t=1,v1=abc" }), "t=1,v1=abc");
});

test("extractSignatureHeader: acepta Headers-like (.get)", () => {
  const headersLike = { get: (name) => (name === STRIPE_SIGNATURE_HEADER ? "t=1,v1=abc" : null) };
  assert.equal(extractSignatureHeader(headersLike), "t=1,v1=abc");
});

test("extractSignatureHeader: devuelve null si la cabecera no existe", () => {
  assert.equal(extractSignatureHeader({}), null);
});

// --- sanitized logging ---------------------------------------------------------

test("NEVER_LOG_FIELDS incluye los campos sensibles de esta ruta", () => {
  assert.deepEqual(NEVER_LOG_FIELDS, ["webhookSecret", "signatureHeader", "rawBody", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);
});

test("sanitizeForRouteLogging: webhookSecret coincide con el patrón de redactEvent y se ELIMINA por completo (nunca queda ni el nombre de la clave con un valor)", () => {
  const sanitized = sanitizeForRouteLogging({ webhookSecret: "whsec_super_secreto", eventId: "evt_1" });
  assert.equal("webhookSecret" in sanitized, false);
  assert.equal(sanitized.eventId, "evt_1");
});

test("sanitizeForRouteLogging: rawBody/signatureHeader NO coinciden con el patrón de redactEvent (ninguno contiene 'secret'/'token') — la defensa en profundidad de NEVER_LOG_FIELDS es la que realmente los fuerza a [REDACTED]", () => {
  const sanitized = sanitizeForRouteLogging({ rawBody: '{"id":"evt_1"}', signatureHeader: "t=123,v1=abcdef" });
  assert.equal(sanitized.rawBody, "[REDACTED]");
  assert.equal(sanitized.signatureHeader, "[REDACTED]");
});

test("sanitizeForRouteLogging: acepta payload undefined sin lanzar", () => {
  assert.doesNotThrow(() => sanitizeForRouteLogging(undefined));
});

// --- request_id / correlation_id ---------------------------------------------------------

test("resolveRouteRequestContext: genera requestId/correlationId aunque no vengan en las cabeceras", () => {
  const context = resolveRouteRequestContext({});
  assert.ok(context.requestId, "requestId siempre debe resolverse, generado si falta");
  assert.ok("correlationId" in context);
});

// --- timeout ---------------------------------------------------------

test("withTimeoutBudget: task rápida resuelve con timedOut:false y el valor real", async () => {
  const result = await withTimeoutBudget(async () => "ok", 100);
  assert.deepEqual(result, { timedOut: false, value: "ok" });
});

test("withTimeoutBudget: task que excede el presupuesto se clasifica RETRYABLE_FAILURE por handler_timeout", async () => {
  const result = await withTimeoutBudget(() => new Promise((resolve) => setTimeout(resolve, 200)), 20);
  assert.deepEqual(result, { timedOut: true, classification: "RETRYABLE_FAILURE", reason: "handler_timeout" });
});

test("HANDLER_TIME_BUDGET_MS está por debajo del límite real de reintento de Stripe (~20s)", () => {
  assert.ok(HANDLER_TIME_BUDGET_MS < 20_000);
});

// --- response mapping ---------------------------------------------------------

test("CLASSIFICATION_TO_HTTP_RESPONSE cubre las 8 clasificaciones del harness, ni una de más ni de menos", () => {
  assert.deepEqual(Object.keys(CLASSIFICATION_TO_HTTP_RESPONSE).sort(), [...HARNESS_CLASSIFICATIONS].sort());
});

test("mapClassificationToHttpResponse: DUPLICATE -> 200 (Stripe debe dejar de reintentar)", () => {
  const response = mapClassificationToHttpResponse("DUPLICATE", { requestId: "req_1", correlationId: "corr_1" });
  assert.equal(response.status, 200);
  assert.equal(response.body.duplicate, true);
});

test("mapClassificationToHttpResponse: RETRYABLE_FAILURE -> 500 (única clasificación donde interesa que Stripe reintente)", () => {
  const response = mapClassificationToHttpResponse("RETRYABLE_FAILURE", { requestId: "req_1", correlationId: null });
  assert.equal(response.status, 500);
});

test("mapClassificationToHttpResponse: INVALID_SIGNATURE -> 400, nunca 401/403/200", () => {
  const response = mapClassificationToHttpResponse("INVALID_SIGNATURE", { requestId: "req_1", correlationId: null });
  assert.equal(response.status, 400);
});

test("mapClassificationToHttpResponse: PAYMENTS_DISABLED -> 200 acusando recibo, sin procesar (misma lógica que PERMANENT_FAILURE)", () => {
  const response = mapClassificationToHttpResponse("PAYMENTS_DISABLED", { requestId: "req_1", correlationId: null });
  assert.equal(response.status, 200);
  assert.equal(response.body.processed, false);
  assert.equal(response.body.error, "payments_disabled");
});

test("mapClassificationToHttpResponse: incluye siempre las cabeceras de request_id/correlation_id", () => {
  const response = mapClassificationToHttpResponse("PROCESSED", { requestId: "req_xyz", correlationId: "corr_xyz" });
  assert.ok(response.headers);
});

test("mapClassificationToHttpResponse: clasificación desconocida lanza error explícito (nunca responde silenciosamente)", () => {
  assert.throws(() => mapClassificationToHttpResponse("NO_EXISTE", { requestId: "req_1", correlationId: null }), /clasificación desconocida/);
});

test("EXPECTED_CONTENT_TYPE es application/json", () => {
  assert.equal(EXPECTED_CONTENT_TYPE, "application/json");
});
