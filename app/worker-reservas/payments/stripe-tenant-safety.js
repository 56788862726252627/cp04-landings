// Club Pádel 04 · Stripe Payments — Tenant Safety (FASE 5, cierre técnico).
//
// Capa de verificación multi-tenant construida ENCIMA de
// validateEventMetadata()/handleWebhookEvent() (stripe-adapter.mock.js) —
// no los reemplaza. Esos dos ya cubren "wrong_tenant"/"wrong_user" cuando
// se les pasa expectedTenantId/expectedUserId. Este módulo añade dos
// chequeos que ninguno de los dos cubre: el ESTADO del tenant en
// config/tenant-registry.schema.json#status (activo/disabled/staging/
// maintenance) y la regla de plataforma vigente
// (integrations.payments.enabled, const:false) — ambos datos externos al
// propio evento Stripe, que el adapter no conoce por diseño.

export const TENANT_SAFETY_RESULTS = Object.freeze([
  "TENANT_OK",
  "WRONG_TENANT",
  "MISSING_TENANT",
  "TENANT_DISABLED",
  "PAYMENTS_FEATURE_DISABLED",
  "CROSS_TENANT_METADATA_MISMATCH",
]);

function result(name, detail = {}) {
  return { result: name, ...detail };
}

/**
 * Sin un registro real cliente<->tenant todavía (mono-tenant hoy, ver
 * docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md), el default es permisivo —
 * el caller SIEMPRE debe inyectar `isClientOfTenant` real en cuanto exista
 * un registro N:1 verificable. Este default solo evita un falso-positivo
 * bloqueante en el caso mono-tenant actual, nunca debe usarse en un
 * endpoint real sin sustituirlo.
 */
function defaultIsClientOfTenant() {
  return true;
}

/**
 * @param {object} args
 * @param {{tenant_id?: string, client_id?: string}} args.metadata metadata del evento Stripe ya extraída (puede venir incompleta)
 * @param {string|null} args.expectedTenantId tenant al que pertenece el endpoint/webhook que recibió el evento — null si no se pudo resolver
 * @param {{status: string}|null} args.tenantRegistryEntry entrada de config/tenant-registry.schema.json para expectedTenantId, null si no existe
 * @param {{integrations?: {payments?: {enabled?: boolean}}}|null} args.clientConfig client-config resuelto de ese tenant
 * @param {(tenantId: string, clientId: string) => boolean} [args.isClientOfTenant]
 * @returns {{result: string, reason?: string}}
 */
export function checkTenantSafety({ metadata, expectedTenantId, tenantRegistryEntry, clientConfig, isClientOfTenant = defaultIsClientOfTenant }) {
  if (!metadata?.tenant_id) {
    return result("MISSING_TENANT", { reason: "metadata.tenant_id ausente en el evento — no se puede resolver a qué tenant pertenece" });
  }
  if (!expectedTenantId || !tenantRegistryEntry) {
    return result("MISSING_TENANT", { reason: "expectedTenantId no resuelto o sin entrada en tenant-registry para este endpoint" });
  }
  if (metadata.tenant_id !== expectedTenantId) {
    return result("WRONG_TENANT", { reason: `metadata.tenant_id="${metadata.tenant_id}" no coincide con expectedTenantId="${expectedTenantId}"` });
  }
  if (tenantRegistryEntry.status !== "active") {
    return result("TENANT_DISABLED", { reason: `tenant "${expectedTenantId}" tiene status "${tenantRegistryEntry.status}" — nunca se procesan pagos de un tenant no activo` });
  }
  if (clientConfig?.integrations?.payments?.enabled !== true) {
    return result("PAYMENTS_FEATURE_DISABLED", { reason: "integrations.payments.enabled no es true para este tenant (regla de plataforma vigente, const:false) — ningún webhook de Stripe debería procesarse mientras esto sea así" });
  }
  if (metadata.client_id && !isClientOfTenant(metadata.tenant_id, metadata.client_id)) {
    return result("CROSS_TENANT_METADATA_MISMATCH", { reason: `client_id="${metadata.client_id}" no pertenece al tenant_id="${metadata.tenant_id}" según el registro — metadata internamente inconsistente` });
  }
  return result("TENANT_OK");
}
