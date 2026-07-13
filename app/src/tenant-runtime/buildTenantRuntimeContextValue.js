// Función pura que construye el valor exacto que expondrá
// TenantConfigProvider. Separada del componente React a propósito: es la
// parte con lógica real (composición de los accessors de runtime) y debe
// poder probarse con node:test sin necesitar un entorno de render de React.
import { createTenantRuntimeContext } from "./createTenantRuntimeContext.js";
import { getRuntimeFeatureFlags } from "./getRuntimeFeatureFlags.js";
import { getRuntimeRoleCapabilities } from "./getRuntimeRoleCapabilities.js";
import { getRuntimeBranding } from "./getRuntimeBranding.js";
import { getRuntimeResources } from "./getRuntimeResources.js";
import { getRuntimeBusinessHours } from "./getRuntimeBusinessHours.js";

/**
 * @param {object} params
 * @param {object} params.resolvedConfig Salida de mergeConfigLayers()/loadResolvedRuntimeConfig().
 * @param {{status: string}} params.tenantStatus Salida de resolveRuntimeTenant() — requerido, ningún estado es implícito.
 * @returns {object} El valor exacto consumido por TenantConfigProvider/useTenantConfig.
 */
export function buildTenantRuntimeContextValue({ resolvedConfig, tenantStatus }) {
  const runtimeContext = createTenantRuntimeContext({ resolvedConfig, tenantStatus });
  const { features: featureFlags } = getRuntimeFeatureFlags(resolvedConfig);

  return {
    tenantId: runtimeContext.tenantId,
    verticalId: runtimeContext.verticalId,
    resolvedConfig,
    branding: getRuntimeBranding(resolvedConfig),
    resources: getRuntimeResources(resolvedConfig),
    businessHours: getRuntimeBusinessHours(resolvedConfig),
    featureFlags,
    roleCapabilities: getRuntimeRoleCapabilities(resolvedConfig),
    locale: resolvedConfig.locale ?? null,
    timezone: resolvedConfig.timezone ?? null,
    maintenanceMode: runtimeContext.maintenanceMode,
    deploymentState: runtimeContext.deploymentState,
    // Expuesto además del set pedido explícitamente por la misión, porque
    // el Provider es el único punto por el que un consumidor futuro podría
    // llegar a observability/backup/audit context sin volver a llamar a
    // resolveTenantContext (ver Fase 8) — no se pidió omitirlo.
    observability: runtimeContext.observability,
    backup: runtimeContext.backup,
    audit: runtimeContext.audit,
    disabled: runtimeContext.disabled,
    status: runtimeContext.status,
  };
}
