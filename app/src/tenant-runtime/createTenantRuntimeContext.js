// Extiende resolveTenantContext() (src/config/resolveTenantContext.js, ya
// existente — observability/backup/audit/integrations context) con las dos
// piezas que faltan para runtime: maintenanceMode/disabled (derivados del
// status de dominio, no de resolvedConfig) y deploymentState (del propio
// client-config). No reimplementa resolveTenantContext, lo compone.
import { resolveTenantContext } from "../config/resolveTenantContext.js";

/**
 * @param {object} params
 * @param {object} params.resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @param {{status: string}} params.tenantStatus Salida de resolveRuntimeTenant()/resolveDomainTenant() —
 *   requerido explícitamente: el estado del tenant nunca se asume "active" por defecto.
 * @returns {object} tenantRuntimeContext — forma consumida por TenantConfigProvider.
 */
export function createTenantRuntimeContext({ resolvedConfig, tenantStatus }) {
  if (!tenantStatus?.status) {
    throw new Error("createTenantRuntimeContext requiere tenantStatus.status (salida de resolveRuntimeTenant) — ningún estado es implícito");
  }

  const tenantContext = resolveTenantContext(resolvedConfig);

  return {
    ...tenantContext,
    status: tenantStatus.status,
    maintenanceMode: tenantStatus.status === "maintenance",
    disabled: tenantStatus.status === "disabled",
    deploymentState: resolvedConfig.deploymentProfile ?? null,
  };
}
