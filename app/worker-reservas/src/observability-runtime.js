// Club Pádel 04 · Worker Observability Runtime — integración mínima y aditiva
// de la arquitectura de Observabilidad (audit/observability/) en el Worker
// real (worker-reservas/src/index.js). Ver audit/observability/19 y 20 para
// el plan que precede este archivo.
//
// Por qué este archivo existe en vez de importar scripts/observability/*.mjs
// directamente: varios de esos módulos (header-contract.mjs, request-logger.mjs,
// validate-log-event.mjs, normalize.mjs) tienen imports de nivel superior a
// "node:crypto" o "node:fs" para uso en Node (tooling/tests). wrangler.toml no
// declara `nodejs_compat`, y Cloudflare Workers no tiene filesystem en runtime
// — bundlear esos imports rompería el `wrangler deploy` real aunque los tests
// (que corren bajo Node puro con `node --test`) no lo detecten. Mismo criterio
// ya aplicado en worker-reservas/payments/stripe-adapter.mock.js (usa
// crypto.subtle en vez de node:crypto por el mismo motivo).
//
// Los módulos SIN imports de node:* (redactor.mjs, service-model.mjs,
// health-endpoints.mjs, make-propagation.mjs) sí se importan directamente
// aquí — son Worker-safe tal cual, verificado leyendo cada uno antes de
// importar.
//
// Contrato de IDs (mismo formato exacto que scripts/observability/header-contract.mjs
// y schemas/observability/log-event.schema.json): request_id ^req_[A-Za-z0-9-]{8,}$,
// correlation_id ^corr_[A-Za-z0-9-]{8,}$ (nullable). Generación vía
// globalThis.crypto.randomUUID(), nativo tanto en Cloudflare Workers como en
// Node >=19 (usado por los tests de este mismo directorio) — sin polyfill.

import { redactEvent } from "../../scripts/observability/redactor.mjs";
import {
  buildHealthLiveResponse,
  buildHealthReadyResponse,
} from "../../scripts/observability/health-endpoints.mjs";
import { buildMakePayload } from "../../scripts/observability/make-propagation.mjs";

export const REQUEST_ID_HEADER = "X-CP04-Request-Id";
export const CORRELATION_ID_HEADER = "X-CP04-Correlation-Id";

const REQUEST_ID_PATTERN = /^req_[A-Za-z0-9-]{8,}$/;
const CORRELATION_ID_PATTERN = /^corr_[A-Za-z0-9-]{8,}$/;

function isValidRequestId(value) {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

function isValidCorrelationId(value) {
  return typeof value === "string" && CORRELATION_ID_PATTERN.test(value);
}

function generateRequestId() {
  return `req_${crypto.randomUUID()}`;
}

function generateCorrelationId() {
  return `corr_${crypto.randomUUID()}`;
}

function readHeader(headersLike, name) {
  if (!headersLike) return null;
  if (typeof headersLike.get === "function") return headersLike.get(name);
  const lowerName = name.toLowerCase();
  const key = Object.keys(headersLike).find((k) => k.toLowerCase() === lowerName);
  return key ? headersLike[key] : null;
}

// request_id SIEMPRE existe al salir: cada hop genera el suyo si no llega uno
// válido (mismo criterio que header-contract.mjs::resolveRequestId).
export function resolveRequestId(headersLike) {
  const incoming = readHeader(headersLike, REQUEST_ID_HEADER);
  return isValidRequestId(incoming) ? incoming : generateRequestId();
}

// correlation_id respeta el valor entrante si es válido; si no llega, null
// explícito — nunca se inventa aquí (mismo criterio que
// header-contract.mjs::resolveCorrelationId). Generarlo si hace falta es
// responsabilidad de un punto de entrada de negocio explícito, no de esta
// lectura pasiva.
export function resolveCorrelationId(headersLike) {
  const incoming = readHeader(headersLike, CORRELATION_ID_HEADER);
  return isValidCorrelationId(incoming) ? incoming : null;
}

export function resolveOrStartCorrelationId(headersLike) {
  return resolveCorrelationId(headersLike) ?? generateCorrelationId();
}

// Añade las cabeceras de correlación a una Response ya construida sin tocar
// status ni body — mismo principio de "logging/observabilidad es aditivo,
// nunca decide comportamiento" de request-logger.mjs::withRequestLogging.
export function attachCorrelationHeaders(response, { requestId, correlationId }) {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);
  if (correlationId) headers.set(CORRELATION_ID_HEADER, correlationId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Construye un log-event conforme a schemas/observability/log-event.schema.json
// (mismo shape que scripts/observability/request-logger.mjs::buildRequestLogEvent).
// No valida contra el JSON Schema en runtime (validate-log-event.mjs lee el
// fichero de schema de disco vía node:fs — imposible en el Worker); se
// construye ya conforme al contrato por diseño, y el contrato se verifica en
// tests/observability/ (Node) sobre fixtures equivalentes.
export function buildRequestLogEvent({
  requestId,
  correlationId,
  service = "worker",
  environment = "production",
  eventType,
  message,
  status,
  errorCode = null,
  durationMs,
  metadata = null,
  clientId = "club-padel-04",
  tenantId = null,
  scenarioId = null,
  executionId = null,
  userIdHash = null,
  timestamp = new Date().toISOString(),
}) {
  return {
    schema_version: "1.0.0",
    timestamp,
    level: errorCode ? "error" : "info",
    service,
    environment,
    event_type: eventType,
    message,
    request_id: requestId,
    correlation_id: correlationId,
    client_id: clientId,
    tenant_id: tenantId,
    scenario_id: scenarioId,
    execution_id: executionId,
    user_id_hash: userIdHash,
    error_code: errorCode,
    duration_ms: durationMs,
    status,
    metadata,
  };
}

// Redacta (via redactor.mjs) y emite el log-event. Destino: console.log en
// stdout — capturable con `wrangler tail` / Cloudflare Logpush. El destino
// final de retención sigue sin decidir (audit/observability/16_RETENTION_POLICY.md),
// console.log es el sink Worker-nativo mínimo, no una decisión de producto.
// Nunca lanza: un fallo de logging no puede tumbar una respuesta real.
export function logStructuredEvent(rawEvent) {
  try {
    const { redacted } = redactEvent(rawEvent);
    console.log(JSON.stringify(redacted));
  } catch {
    // El logging es un efecto secundario de observación — un fallo aquí
    // nunca debe propagarse ni afectar la respuesta HTTP real.
  }
}

export { buildHealthLiveResponse, buildHealthReadyResponse, buildMakePayload };

// Clasifica una dependencia externa por PRESENCIA de configuración, sin
// realizar ninguna llamada de red real (Fase 7 de la misión: "No realices
// llamadas reales innecesarias"). health-status.schema.json cierra
// dependencies[].status a HEALTHY/DEGRADED/UNHEALTHY/UNKNOWN — no existe un
// valor "NOT_CONFIGURED" en el contrato ya cerrado, así que ambos casos
// (configurada sin ping en vivo todavía, y no configurada) se reportan como
// "UNKNOWN" (mismo principio SIN_DATOS: ausencia de dato no es "todo bien").
// La distinción entre ambos casos viaja en `retryable`: false si falta
// configuración (ningún reintento lo arregla), true si está configurada y
// solo falta implementar el ping en vivo (fase futura).
export function dependencyStatusFromConfig({ name, configured, latencyMs = null }) {
  return {
    name,
    status: "UNKNOWN",
    latency_ms: latencyMs,
    error_code: null,
    last_success_at: null,
    retryable: configured,
  };
}
