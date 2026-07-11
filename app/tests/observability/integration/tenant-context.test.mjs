import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateLogEvent } from "../../../scripts/observability/validate-log-event.mjs";
import { buildRequestLogEvent } from "../../../scripts/observability/request-logger.mjs";
import {
  deriveTenantObservabilityContext,
  deriveTenantObservabilityContextFromTenantContext,
  applyTenantContextToLogEvent,
} from "../../../scripts/observability/tenant-context.mjs";
import { resolveTenantContext } from "../../../src/config/resolveTenantContext.js";
import { mergeConfigLayers } from "../../../src/config/mergeConfigLayers.js";
import { loadCoreConfig } from "../../../src/config/loadCoreConfig.js";
import { loadVerticalConfig } from "../../../src/config/loadVerticalConfig.js";
import { loadClientConfig } from "../../../src/config/loadClientConfig.js";
import { repoPath } from "../../../src/config/paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resolveCp04() {
  return mergeConfigLayers({
    core: loadCoreConfig(),
    vertical: loadVerticalConfig(),
    client: loadClientConfig(repoPath("config", "client-config.example.valid.json")),
  });
}

test("deriveTenantObservabilityContext: produce exactamente los 5 campos pedidos por la misión (tenant_id, request_id, correlation_id, service, operation)", () => {
  const context = deriveTenantObservabilityContext({
    resolvedConfig: resolveCp04(),
    requestId: "req_desde-tenant-context1",
    correlationId: "corr_desde-tenant-context",
    service: "worker",
    operation: "crear_reserva",
  });
  assert.deepEqual(Object.keys(context).sort(), ["correlation_id", "operation", "request_id", "service", "tenant_id"]);
  assert.equal(context.tenant_id, "cp04");
  assert.equal(context.request_id, "req_desde-tenant-context1");
  assert.equal(context.correlation_id, "corr_desde-tenant-context");
  assert.equal(context.service, "worker");
  assert.equal(context.operation, "crear_reserva");
});

test("deriveTenantObservabilityContext: correlation_id null se propaga tal cual, nunca se inventa ni se prefija con el tenant", () => {
  const context = deriveTenantObservabilityContext({
    resolvedConfig: resolveCp04(),
    requestId: "req_sin-correlacion-0001",
    service: "worker",
    operation: "consultar_disponibilidad",
  });
  assert.equal(context.correlation_id, null);
});

test("deriveTenantObservabilityContext: el log-event final con tenant_id aplicado pasa validateLogEvent contra log-event.schema.json", () => {
  const context = deriveTenantObservabilityContext({
    resolvedConfig: resolveCp04(),
    requestId: "req_valido-para-schema001",
    correlationId: "corr_valido-para-schema0",
    service: "worker",
    operation: "cancelar_reserva",
  });
  const rawEvent = buildRequestLogEvent({
    requestId: context.request_id,
    correlationId: context.correlation_id,
    service: context.service,
    eventType: context.operation,
    message: "prueba multi-tenant",
    status: "success",
    durationMs: 12,
  });
  const eventWithTenant = applyTenantContextToLogEvent(rawEvent, context);
  const result = validateLogEvent(eventWithTenant);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
  assert.equal(eventWithTenant.tenant_id, "cp04");
});

test("deriveTenantObservabilityContext: sin tenantId en resolvedConfig, lanza igual que resolveTenantContext — ningún tenant es implícito", () => {
  assert.throws(() => deriveTenantObservabilityContext({ resolvedConfig: {}, requestId: "req_x", service: "worker", operation: "op_valida" }), /ningún tenant es implícito/);
});

test("deriveTenantObservabilityContext: rechaza un service fuera del enum de log-event.schema.json", () => {
  assert.throws(
    () => deriveTenantObservabilityContext({ resolvedConfig: resolveCp04(), requestId: "req_x", service: "servicio-inventado", operation: "op_valida" }),
    /no está en el enum/
  );
});

test("deriveTenantObservabilityContext: rechaza una operation que no cumple el patrón snake_case", () => {
  assert.throws(
    () => deriveTenantObservabilityContext({ resolvedConfig: resolveCp04(), requestId: "req_x", service: "worker", operation: "Operacion-Invalida" }),
    /no cumple el patrón snake_case/
  );
});

test("deriveTenantObservabilityContextFromTenantContext: parte de un tenantContext ya resuelto (resolveTenantContext) sin volver a resolver config", () => {
  const tenantContext = resolveTenantContext(resolveCp04());
  const context = deriveTenantObservabilityContextFromTenantContext({
    tenantContext,
    requestId: "req_desde-contexto-ya-listo",
    correlationId: null,
    service: "airtable",
    operation: "leer_disponibilidad",
  });
  assert.equal(context.tenant_id, tenantContext.tenantId);
  assert.equal(context.service, "airtable");
});

test("applyTenantContextToLogEvent: no toca client_id (identidad mono-cliente existente), solo tenant_id/request_id/correlation_id", () => {
  const rawEvent = buildRequestLogEvent({
    requestId: "req_original-antes-de-tenant1",
    correlationId: null,
    service: "worker",
    eventType: "operacion_generica",
    message: "prueba",
    status: "success",
    durationMs: 5,
    clientId: "club-padel-04",
  });
  const context = deriveTenantObservabilityContext({
    resolvedConfig: resolveCp04(),
    requestId: "req_sustituido-por-tenant01",
    service: "worker",
    operation: "operacion_generica",
  });
  const merged = applyTenantContextToLogEvent(rawEvent, context);
  assert.equal(merged.client_id, "club-padel-04");
  assert.equal(merged.tenant_id, "cp04");
  assert.equal(merged.request_id, "req_sustituido-por-tenant01");
});
