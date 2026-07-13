// Resolución hostname → tenant → vertical, descrita en
// docs/agencia-ia/DOMAIN_TENANT_RESOLUTION.md. Función pura sobre un
// tenant-registry ya cargado — no hace I/O, no consulta DNS ni Cloudflare.

/**
 * @param {string} hostname
 * @param {object} registry Documento tenant-registry ya cargado y validado (loadTenantRegistry()).
 * @returns {{ status: "active"|"staging"|"maintenance"|"disabled"|"unknown_domain", hostname: string, tenantId: string|null, verticalId: string|null, slug: string|null }}
 */
export function resolveDomainTenant(hostname, registry) {
  if (!hostname) {
    throw new Error("resolveDomainTenant requiere un hostname");
  }
  if (!registry?.tenants) {
    throw new Error("resolveDomainTenant requiere un tenant-registry ya cargado (registry.tenants)");
  }

  const match = registry.tenants.find(
    (tenant) => tenant.domains.primary === hostname || tenant.domains.subdomain === hostname
  );

  if (!match) {
    return { status: "unknown_domain", hostname, tenantId: null, verticalId: null, slug: null };
  }

  return {
    status: match.status,
    hostname,
    tenantId: match.tenantId,
    verticalId: match.verticalId,
    slug: match.slug,
  };
}
