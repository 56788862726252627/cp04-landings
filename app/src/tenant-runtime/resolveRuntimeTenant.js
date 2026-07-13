// Runtime tenant resolution — envuelve resolveDomainTenant() (ya existente
// y probado en src/config/resolveDomainTenant.js) añadiendo la única pieza
// que faltaba para uso en runtime: un tenant de fallback EXPLÍCITO, para
// cuando ningún dominio del tenant-registry coincide con el hostname
// entrante. No reimplementa la resolución dominio→tenant, solo la envuelve.
//
// Regla de la misión ("fallback tenant only when explicitly configured"):
// sin `fallbackTenantId` pasado por quien llama, un dominio desconocido
// sigue siendo unknown_domain — nunca se inventa un tenant por defecto.
import { resolveDomainTenant } from "../config/resolveDomainTenant.js";

/**
 * @param {string} hostname
 * @param {object} registry tenant-registry ya cargado (loadTenantRegistry()).
 * @param {{fallbackTenantId?: string}} [options] Si se pasa fallbackTenantId
 *   y el hostname no resuelve a ningún tenant, se usa ese tenant (debe
 *   existir en el registry) en vez de unknown_domain.
 * @returns {{status: string, hostname: string, tenantId: string|null, verticalId: string|null, slug: string|null, resolvedVia: "domain"|"fallback"|"none"}}
 */
export function resolveRuntimeTenant(hostname, registry, options = {}) {
  const domainResult = resolveDomainTenant(hostname, registry);

  if (domainResult.status !== "unknown_domain") {
    return { ...domainResult, resolvedVia: "domain" };
  }

  const { fallbackTenantId } = options;
  if (!fallbackTenantId) {
    return { ...domainResult, resolvedVia: "none" };
  }

  const fallbackTenant = registry.tenants.find((tenant) => tenant.tenantId === fallbackTenantId);
  if (!fallbackTenant) {
    throw new Error(`resolveRuntimeTenant: fallbackTenantId "${fallbackTenantId}" no existe en el tenant-registry`);
  }

  return {
    status: fallbackTenant.status,
    hostname,
    tenantId: fallbackTenant.tenantId,
    verticalId: fallbackTenant.verticalId,
    slug: fallbackTenant.slug,
    resolvedVia: "fallback",
  };
}
