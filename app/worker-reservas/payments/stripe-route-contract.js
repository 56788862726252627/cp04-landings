// Club Pádel 04 · Stripe Payments — Worker Route Contract (FASE 2, cierre técnico).
//
// Contrato PREPARATORIO de `POST /api/payments/stripe/webhook` — NO
// registrado en worker-reservas/src/index.js, mismo patrón que
// worker-reservas/auth/auth-contract.js y worker-reservas/payments/
// stripe-contract.js: define la forma exacta que tendrá la ruta el día
// que se integre, sin tocar el router real. Ver
// audit/stripe-technical-closure-20260710/WORKER_ROUTE_INTEGRATION_PLAN.md
// para el diff exacto pendiente cuando se decida integrar.
//
// Nota de nomenclatura (RESUELTA — Production Readiness, riesgo residual
// #1): STRIPE_ENDPOINTS.webhook (stripe-contract.js) usaba
// "/api/payments/stripe-webhook" (guion) hasta esta sesión; ahora coincide
// con STRIPE_WEBHOOK_ROUTE.path de aquí abajo, "/api/payments/stripe/webhook"
// (barra) — consistente con el patrón real de rutas de
// worker-reservas/src/index.js (/api/auth/login, /api/support/health/ready).
// tests/stripe/route-contract.test.mjs prueba que ambas constantes nunca
// vuelvan a divergir. Ambas rutas siguen siendo solo conceptuales hoy
// (ninguna existe en el router real) — ver WORKER_ROUTE_INTEGRATION_PLAN.md
// para el diff pendiente cuando se decida integrar.

import { redactEvent } from "../../scripts/observability/redactor.mjs";
import { resolveRequestId, resolveCorrelationId, buildOutgoingHeaders } from "../../scripts/observability/header-contract.mjs";

export const STRIPE_WEBHOOK_ROUTE = Object.freeze({ method: "POST", path: "/api/payments/stripe/webhook" });

export const STRIPE_SIGNATURE_HEADER = "Stripe-Signature";
export const EXPECTED_CONTENT_TYPE = "application/json";

// ---------------------------------------------------------------------------
// 1. Content-Type validation
// ---------------------------------------------------------------------------

/**
 * Acepta "application/json" con o sin parámetros (`; charset=utf-8`) —
 * rechaza cualquier otro tipo (form-urlencoded, texto plano, ausente).
 * @param {{get?: (name: string) => string|null}|Record<string,string>} headersLike
 * @returns {{valid: boolean, reason?: string}}
 */
export function validateContentType(headersLike) {
  const raw = typeof headersLike?.get === "function" ? headersLike.get("content-type") : headersLike?.["content-type"] ?? headersLike?.["Content-Type"];
  if (!raw) return { valid: false, reason: "missing_content_type" };
  const mimeType = raw.split(";")[0].trim().toLowerCase();
  if (mimeType !== EXPECTED_CONTENT_TYPE) {
    return { valid: false, reason: `unexpected_content_type:${mimeType}` };
  }
  return { valid: true };
}

// ---------------------------------------------------------------------------
// 2. Raw body preservation contract
// ---------------------------------------------------------------------------

/**
 * La verificación de firma (verifyWebhookSignature, stripe-adapter.mock.js)
 * necesita los BYTES EXACTOS que Stripe firmó — un `request.json()` seguido
 * de `JSON.stringify()` puede reordenar claves o cambiar espaciado y romper
 * la firma en silencio. Regla dura para el futuro handler real: llamar
 * SIEMPRE `await request.text()` primero, verificar la firma sobre ese
 * string, y solo entonces `JSON.parse()` ese mismo string (nunca uno nuevo).
 *
 * Este helper es la única comprobación runtime posible sin un Worker real:
 * Cloudflare's Request expone `.bodyUsed` — si ya es `true` al llegar aquí,
 * alguien leyó el body antes (probable `request.json()` prematuro) y la
 * firma ya no puede verificarse de forma fiable.
 */
export function assertRawBodyNotConsumed(requestLike) {
  if (requestLike?.bodyUsed) {
    throw new Error(
      "stripe-route-contract: el body de la request ya fue consumido antes de leer el raw body — la verificación de firma requiere los bytes EXACTOS originales, nunca un JSON re-serializado. Llama a request.text() antes que cualquier otro acceso al body.",
    );
  }
}

// ---------------------------------------------------------------------------
// 3. Signature header contract
// ---------------------------------------------------------------------------

/** @param {{get?: (name:string)=>string|null}|Record<string,string>} headersLike @returns {string|null} */
export function extractSignatureHeader(headersLike) {
  if (typeof headersLike?.get === "function") return headersLike.get(STRIPE_SIGNATURE_HEADER);
  const key = Object.keys(headersLike ?? {}).find((k) => k.toLowerCase() === STRIPE_SIGNATURE_HEADER.toLowerCase());
  return key ? headersLike[key] : null;
}

// ---------------------------------------------------------------------------
// 4. No logging de secrets
// ---------------------------------------------------------------------------

/** Campos que NUNCA deben viajar completos a un log de esta ruta, aunque redactEvent() ya los cubra por patrón — lista explícita como segunda red de seguridad. */
export const NEVER_LOG_FIELDS = Object.freeze(["webhookSecret", "signatureHeader", "rawBody", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);

/**
 * Reutiliza redactEvent() (scripts/observability/redactor.mjs, ya construido
 * y probado — detecta `sk_(live|test)_...`/`whsec_...`/claves con nombre
 * "secret"/"token"/"key" por patrón) y además fuerza `[REDACTED]` sobre
 * NEVER_LOG_FIELDS de forma explícita, incluso si redactEvent no los tocara
 * por algún cambio futuro de sus patrones — defensa en profundidad, no
 * confía en una sola capa para un dato tan sensible como un secreto Stripe.
 */
export function sanitizeForRouteLogging(payload) {
  const { redacted } = redactEvent(payload ?? {});
  const hardRedacted = { ...redacted };
  for (const field of NEVER_LOG_FIELDS) {
    if (field in hardRedacted) hardRedacted[field] = "[REDACTED]";
  }
  return hardRedacted;
}

// ---------------------------------------------------------------------------
// 5 & 6. request_id / correlation_id
// ---------------------------------------------------------------------------

/**
 * Reutiliza scripts/observability/header-contract.mjs sin modificarlo —
 * mismo contrato de cabeceras (X-CP04-Request-Id/X-CP04-Correlation-Id) que
 * el resto de la app usará cuando se integre observabilidad al Worker (ver
 * audit/observability/19_WORKER_INTEGRATION_PLAN_NOT_INTEGRATED.md, mismo
 * patrón "preparado, no conectado").
 */
export function resolveRouteRequestContext(headersLike) {
  return {
    requestId: resolveRequestId(headersLike),
    correlationId: resolveCorrelationId(headersLike),
  };
}

export { buildOutgoingHeaders };

// ---------------------------------------------------------------------------
// 7. Tenant resolution (referencia — implementación real en stripe-tenant-safety.js)
// ---------------------------------------------------------------------------

/**
 * Documental: el handler real derivará `expectedTenantId` de la config del
 * dominio que recibió el webhook (mismo mecanismo que resolveDomainTenant(),
 * ver docs/agencia-ia/DOMAIN_TENANT_RESOLUTION.md) — NUNCA del propio
 * payload de Stripe (eso sería confiar en el atacante para decir de qué
 * tenant es su evento). checkTenantSafety() (stripe-tenant-safety.js, FASE
 * 5) hace la verificación real una vez `expectedTenantId` está resuelto.
 */
export const TENANT_RESOLUTION_CONTRACT_NOTE =
  "expectedTenantId se deriva del dominio/endpoint que recibió el webhook (resolveDomainTenant), nunca de metadata.tenant_id del payload entrante — ese valor solo se usa para COMPARAR, nunca para decidir.";

// ---------------------------------------------------------------------------
// 8. Timeout handling
// ---------------------------------------------------------------------------

/** Stripe reintenta si no recibe respuesta a tiempo — presupuesto conservador, por debajo del límite real de Stripe (~20s) y del límite de CPU de un Worker. */
export const HANDLER_TIME_BUDGET_MS = 10_000;

/**
 * Corre `taskFactory()` con un presupuesto de tiempo. Si expira, devuelve la
 * MISMA forma de resultado que el harness (FASE 1) para RETRYABLE_FAILURE —
 * un timeout es, por definición, seguro de reintentar (nunca se supo si el
 * side-effect llegó a aplicarse o no, y el store de idempotencia — FASE 4 —
 * es precisamente lo que hace ese reintento seguro).
 * @template T
 * @param {() => Promise<T>} taskFactory
 * @param {number} [budgetMs]
 * @returns {Promise<{timedOut: false, value: T} | {timedOut: true, classification: "RETRYABLE_FAILURE", reason: "handler_timeout"}>}
 */
export async function withTimeoutBudget(taskFactory, budgetMs = HANDLER_TIME_BUDGET_MS) {
  let timer;
  const timeoutPromise = new Promise((resolve) => {
    timer = setTimeout(() => resolve({ timedOut: true, classification: "RETRYABLE_FAILURE", reason: "handler_timeout" }), budgetMs);
  });
  try {
    const result = await Promise.race([taskFactory().then((value) => ({ timedOut: false, value })), timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// 9. Normalized response mapping
// ---------------------------------------------------------------------------

/**
 * Traduce una clasificación del harness (FASE 1) a la respuesta HTTP que el
 * futuro handler real debería devolver a Stripe. Decisiones no obvias:
 *  - DUPLICATE -> 200: Stripe debe dejar de reintentar un evento que ya se
 *    procesó — un 4xx/5xx aquí provocaría reintentos infinitos inútiles.
 *  - PERMANENT_FAILURE -> 200: reintentar NUNCA va a arreglar un payload
 *    inválido — se acusa recibo para detener los reintentos y el fallo
 *    queda para revisión manual vía writeAuditEvent() (FASE 3), no vía
 *    reintento automático de Stripe.
 *  - RETRYABLE_FAILURE -> 500: es la ÚNICA clasificación donde SÍ interesa
 *    que Stripe reintente (fallo transitorio de infraestructura propia).
 *  - INVALID_SIGNATURE -> 400: nunca 401/403 (evitaría filtrar si la ruta
 *    exige autenticación distinta) ni 200 (aceptar una firma inválida
 *    silenciosamente sería un agujero de seguridad).
 *  - WRONG_TENANT -> 400 genérico: nunca 404 (404 confirmaría a un atacante
 *    que el tenant/recurso no existe vs. existe-pero-no-coincide — mismo
 *    principio de no enumeración que TENANT_ISOLATION_CONTRACT.md).
 *  - MISSING_METADATA -> 400: dato de origen incompleto, el propio emisor
 *    (o la Checkout Session que lo creó) debe corregirlo, no es transitorio.
 *  - PAYMENTS_DISABLED -> 200 (received, sin procesar): igual que
 *    PERMANENT_FAILURE, reintentar nunca lo arreglará mientras
 *    integrations.payments.enabled siga en const:false — acusar recibo evita
 *    reintentos infinitos de Stripe por una regla de plataforma, no un fallo.
 */
export const CLASSIFICATION_TO_HTTP_RESPONSE = Object.freeze({
  PROCESSED: { status: 200, body: { received: true } },
  DUPLICATE: { status: 200, body: { received: true, duplicate: true } },
  RETRYABLE_FAILURE: { status: 500, body: { received: false, retry: true } },
  PERMANENT_FAILURE: { status: 200, body: { received: true, processed: false } },
  INVALID_SIGNATURE: { status: 400, body: { received: false, error: "invalid_signature" } },
  WRONG_TENANT: { status: 400, body: { received: false, error: "tenant_mismatch" } },
  MISSING_METADATA: { status: 400, body: { received: false, error: "missing_metadata" } },
  PAYMENTS_DISABLED: { status: 200, body: { received: true, processed: false, error: "payments_disabled" } },
});

/**
 * @param {string} classification uno de HARNESS_CLASSIFICATIONS (stripe-integration-harness.js)
 * @param {{requestId: string, correlationId: string|null}} routeContext
 * @returns {{status: number, headers: Record<string,string>, body: object}}
 */
export function mapClassificationToHttpResponse(classification, routeContext) {
  const mapped = CLASSIFICATION_TO_HTTP_RESPONSE[classification];
  if (!mapped) throw new Error(`mapClassificationToHttpResponse: clasificación desconocida "${classification}"`);
  return {
    status: mapped.status,
    headers: buildOutgoingHeaders({ requestId: routeContext.requestId, correlationId: routeContext.correlationId }),
    body: mapped.body,
  };
}
