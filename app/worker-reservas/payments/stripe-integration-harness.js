// Club Pádel 04 · Stripe Payments — Integration Harness (FASE 1, cierre técnico).
//
// Orquesta el recorrido completo de un webhook entrante SIN reimplementar
// ninguna de las piezas ya construidas y probadas en la fase de Sandbox
// Readiness (2026-07-09) — este módulo es composición, no reescritura:
//
//   fixture event
//     -> signature contract mock      (verifyWebhookSignature, stripe-adapter.mock.js)
//     -> webhook parser                (JSON.parse + forma mínima, este módulo)
//     -> tenant resolution             (checkTenantSafety, stripe-tenant-safety.js)
//     -> business validation           (validateEventMetadata, stripe-adapter.mock.js)
//     -> idempotency check             (StripeEventProcessingLockStore, stripe-idempotency-lock-store.js)
//     -> handler                       (mapPaymentStatus, stripe-adapter.mock.js)
//     -> side-effect abstraction       (createInMemorySideEffects + PaymentIdempotencyStore, stripe-side-effects.js/stripe-idempotency.js)
//     -> result classification         (classify(), este módulo)
//
// Ningún I/O real en ningún punto de este pipeline — todas las dependencias
// externas (secret, registro de tenant, client-config, side effects, locks)
// se inyectan por el caller. Ver scripts/stripe/sandbox-harness.mjs (FASE 6)
// para el CLI que ejercita este módulo con fixtures reales del repo.

import { verifyWebhookSignature, validateEventMetadata, mapPaymentStatus, idempotencyKey } from "./stripe-adapter.mock.js";
import { checkTenantSafety } from "./stripe-tenant-safety.js";
import { PRIMARY_EFFECT_BY_STATUS, PermanentSideEffectError } from "./stripe-side-effects.js";

/**
 * Los 8 estados pedidos por la misión de cierre técnico (2026-07-10).
 * De los 6 resultados de checkTenantSafety() (TENANT_OK aparte),
 * PAYMENTS_FEATURE_DISABLED tiene su propio bucket externo PAYMENTS_DISABLED
 * (nombrado explícitamente por la misión); los otros 3
 * (MISSING_TENANT/TENANT_DISABLED/CROSS_TENANT_METADATA_MISMATCH) colapsan en
 * WRONG_TENANT — ver `mapTenantSafetyToClassification()` para el porqué
 * exacto de cada colapso, con el detalle fino preservado en
 * `tenantSafetyResult` del resultado devuelto (nunca se pierde información,
 * solo se agrega a nivel del contrato de 8 estados pedido).
 */
export const HARNESS_CLASSIFICATIONS = Object.freeze([
  "PROCESSED",
  "DUPLICATE",
  "RETRYABLE_FAILURE",
  "PERMANENT_FAILURE",
  "INVALID_SIGNATURE",
  "WRONG_TENANT",
  "MISSING_METADATA",
  "PAYMENTS_DISABLED",
]);

function classify(classification, detail = {}) {
  if (!HARNESS_CLASSIFICATIONS.includes(classification)) {
    throw new Error(`classify: "${classification}" no es una de HARNESS_CLASSIFICATIONS`);
  }
  return { classification, ...detail };
}

/**
 * PAYMENTS_FEATURE_DISABLED tiene su propio bucket externo PAYMENTS_DISABLED
 * (nombrado explícitamente por la misión de cierre técnico). Los otros 3
 * resultados de tenant-safety distintos de TENANT_OK/WRONG_TENANT
 * (MISSING_TENANT, TENANT_DISABLED, CROSS_TENANT_METADATA_MISMATCH) se
 * agregan bajo la clasificación externa WRONG_TENANT: los 8 estados pedidos
 * por la misión no reservan un bucket propio para cada uno, y los 3
 * comparten la misma consecuencia de negocio ("este evento no puede
 * aplicarse de forma segura a ningún tenant") — el detalle preciso NUNCA se
 * descarta, viaja en `tenantSafetyResult`. checkTenantSafety() (FASE 5) se
 * prueba con sus 6 resultados propios y finos por separado, en
 * tests/stripe/tenant-safety.test.mjs.
 */
function mapTenantSafetyToClassification(tenantSafety) {
  if (tenantSafety.result === "PAYMENTS_FEATURE_DISABLED") {
    return classify("PAYMENTS_DISABLED", { reason: tenantSafety.reason, tenantSafetyResult: tenantSafety.result });
  }
  return classify("WRONG_TENANT", { reason: tenantSafety.reason, tenantSafetyResult: tenantSafety.result });
}

/**
 * @param {object} args
 * @param {string} args.rawBody
 * @param {string} args.signatureHeader
 * @param {string} args.webhookSecret
 * @param {string|null} args.expectedTenantId
 * @param {string|null} [args.expectedUserId] check de nivel USUARIO, distinto de tenant-safety (FASE 5) — se colapsa en el mismo bucket externo WRONG_TENANT, ver mapTenantSafetyToClassification()
 * @param {{status:string}|null} [args.tenantRegistryEntry]
 * @param {object|null} [args.clientConfig]
 * @param {(tenantId:string, clientId:string) => boolean} [args.isClientOfTenant]
 * @param {import("./stripe-idempotency-lock-store.js").StripeEventProcessingLockStore} args.eventLockStore
 * @param {import("./stripe-idempotency.js").PaymentIdempotencyStore} args.businessIdempotencyStore
 * @param {ReturnType<import("./stripe-side-effects.js").createInMemorySideEffects>} args.sideEffects
 * @param {number} [args.toleranceSeconds]
 * @param {number} [args.now] epoch seconds — inyectable para tests deterministas de firma/replay
 * @returns {Promise<object>} `{ classification, reason?, stageTrace, ... }`
 */
export async function runStripeWebhookIntegrationHarness({
  rawBody,
  signatureHeader,
  webhookSecret,
  expectedTenantId = null,
  expectedUserId = null,
  tenantRegistryEntry = null,
  clientConfig = null,
  isClientOfTenant,
  eventLockStore,
  businessIdempotencyStore,
  sideEffects,
  toleranceSeconds,
  now,
}) {
  const stageTrace = [];

  // 1. signature contract mock
  stageTrace.push("signature");
  const signatureResult = await verifyWebhookSignature(rawBody, signatureHeader, webhookSecret, { toleranceSeconds, now });
  if (!signatureResult.valid) {
    return classify("INVALID_SIGNATURE", { reason: signatureResult.reason, stageTrace });
  }

  // 2. webhook parser
  stageTrace.push("parse");
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return classify("PERMANENT_FAILURE", { reason: "malformed_payload", stageTrace });
  }
  if (!event || typeof event !== "object" || !event.id || !event.type || !event.data?.object?.id) {
    return classify("PERMANENT_FAILURE", { reason: "malformed_payload_shape", stageTrace });
  }

  const metadata = event.data.object.metadata ?? {};

  // 3. tenant resolution
  stageTrace.push("tenant_resolution");
  const tenantSafety = checkTenantSafety({ metadata, expectedTenantId, tenantRegistryEntry, clientConfig, isClientOfTenant });
  if (tenantSafety.result !== "TENANT_OK") {
    return { ...mapTenantSafetyToClassification(tenantSafety), stageTrace, eventId: event.id };
  }

  // 3b. user resolution — no forma parte de checkTenantSafety() (FASE 5, alcance
  // exclusivamente de tenant), pero comparte el mismo bucket externo WRONG_TENANT
  // por la misma razón: "este evento no puede aplicarse de forma segura a la
  // identidad esperada". Reutiliza el mismo criterio opt-in que el
  // handleWebhookEvent() original (stripe-adapter.mock.js): solo se comprueba
  // si el caller pasa expectedUserId explícitamente.
  if (expectedUserId && metadata.user_id !== expectedUserId) {
    return classify("WRONG_TENANT", { reason: "wrong_user", tenantSafetyResult: "WRONG_USER", stageTrace, eventId: event.id });
  }

  // 4. business validation
  stageTrace.push("business_validation");
  const metadataCheck = validateEventMetadata(event);
  if (!metadataCheck.valid) {
    return classify("MISSING_METADATA", { reason: "missing_required_metadata_fields", missing: metadataCheck.missing, stageTrace, eventId: event.id });
  }

  // 5. idempotency check (lock por event.id, namespaced por tenant — protege
  // reenvíos del MISMO evento y, en profundidad, colisiones same-key/
  // different-tenant — ver stripe-idempotency-lock-store.js)
  stageTrace.push("idempotency_check");
  const lock = await eventLockStore.markEventProcessing(event.id, metadata.tenant_id);
  if (!lock.acquired) {
    return classify("DUPLICATE", { reason: lock.reason, stageTrace, eventId: event.id });
  }

  // 6. handler — mapea el tipo de evento a un estado de negocio
  stageTrace.push("handler");
  const status = mapPaymentStatus(event.type);
  if (!status) {
    // Tipo de evento fuera del alcance de este adapter (STRIPE_WEBHOOK_EVENT_TYPES).
    // Se reconoce con 2xx (PROCESSED, sin side-effect) para que Stripe deje de
    // reintentar — reintentar un tipo no soportado nunca lo hará soportado.
    await eventLockStore.markEventProcessed(event.id, metadata.tenant_id);
    return classify("PROCESSED", { reason: "unsupported_event_type_acknowledged", eventId: event.id, eventType: event.type, stageTrace });
  }

  const key = idempotencyKey({ tenantId: metadata.tenant_id, bookingId: metadata.booking_id, paymentReference: metadata.payment_reference });

  // 7. side-effect abstraction
  stageTrace.push("side_effect");
  const dispatchOutcome = await dispatchSideEffect({ status, metadata, event, sideEffects, businessIdempotencyStore, key });

  // 8. result classification
  stageTrace.push("classification");
  if (dispatchOutcome.outcome === "already_completed" || dispatchOutcome.outcome === "in_flight_skip") {
    await eventLockStore.markEventProcessed(event.id, metadata.tenant_id);
    return classify("DUPLICATE", { reason: dispatchOutcome.outcome, stageTrace, eventId: event.id, idempotencyKey: key });
  }
  if (dispatchOutcome.outcome === "failed_permanent") {
    await eventLockStore.markEventFailed(event.id, metadata.tenant_id);
    return classify("PERMANENT_FAILURE", { reason: dispatchOutcome.error, stageTrace, eventId: event.id, idempotencyKey: key });
  }
  if (dispatchOutcome.outcome === "failed_retry_safe") {
    await eventLockStore.markEventFailed(event.id, metadata.tenant_id);
    return classify("RETRYABLE_FAILURE", { reason: dispatchOutcome.error, stageTrace, eventId: event.id, idempotencyKey: key });
  }

  await eventLockStore.markEventProcessed(event.id, metadata.tenant_id);
  return classify("PROCESSED", {
    reason: "side_effect_applied",
    status,
    eventId: event.id,
    tenantId: metadata.tenant_id,
    bookingId: metadata.booking_id,
    idempotencyKey: key,
    stageTrace,
  });
}

/**
 * Envuelve businessIdempotencyStore.processOnce() (stripe-idempotency.js,
 * SIN modificarlo) para poder distinguir RETRYABLE_FAILURE de
 * PERMANENT_FAILURE — processOnce por sí solo solo sabe "completed" vs
 * "failed_retry_safe" (correcto para su propio contrato, pensado para un
 * único tipo de fallo). Aquí se captura el error real ANTES de que
 * processOnce lo trague, para reclasificarlo si es un PermanentSideEffectError.
 */
async function dispatchSideEffect({ status, metadata, event, sideEffects, businessIdempotencyStore, key }) {
  let capturedError = null;

  const effect = async () => {
    try {
      const primaryEffectName = PRIMARY_EFFECT_BY_STATUS[status];
      if (primaryEffectName) {
        await sideEffects[primaryEffectName]({
          tenantId: metadata.tenant_id,
          clientId: metadata.client_id,
          bookingId: metadata.booking_id,
          paymentReference: metadata.payment_reference,
          eventId: event.id,
        });
      }
      await sideEffects.publishPaymentEvent({ eventType: event.type, status, tenantId: metadata.tenant_id, bookingId: metadata.booking_id, eventId: event.id });
      await sideEffects.writeAuditEvent({ action: `stripe_webhook_${status.toLowerCase()}`, tenantId: metadata.tenant_id, eventId: event.id, metadata });
      return { status };
    } catch (error) {
      capturedError = error;
      throw error;
    }
  };

  const outcome = await businessIdempotencyStore.processOnce(key, effect);

  if (outcome.outcome === "failed_retry_safe" && capturedError instanceof PermanentSideEffectError) {
    return { ...outcome, outcome: "failed_permanent" };
  }
  return outcome;
}
