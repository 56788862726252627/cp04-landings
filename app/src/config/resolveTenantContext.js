// Construye el objeto de contexto de tenant descrito en
// docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md. Puramente derivado del
// resolvedConfig ya calculado (mergeConfigLayers) — no lee disco, no hace
// I/O, no conecta ningún servicio real. Los bloques integrations.* son
// referencias inertes (nombres, no valores) para integración futura.

/**
 * @param {object} resolvedConfig Salida de mergeConfigLayers().
 * @returns {object} tenantContext
 */
export function resolveTenantContext(resolvedConfig) {
  if (!resolvedConfig?.tenantId) {
    throw new Error("resolveTenantContext requiere resolvedConfig.tenantId — ningún tenant es implícito");
  }

  const tenantId = resolvedConfig.tenantId;

  return {
    tenantId,
    slug: resolvedConfig.slug ?? null,
    verticalId: resolvedConfig.verticalId ?? null,
    domain: {
      primary: resolvedConfig.domains?.primary ?? null,
      subdomain: resolvedConfig.domains?.subdomain ?? null,
    },
    cacheNamespace: `tenant:${tenantId}`,
    storageNamespace: `tenant:${tenantId}`,
    observability: {
      tenantId,
      correlationPrefix: `${tenantId}:`,
    },
    backup: {
      tenantId,
      scope: "client-config",
    },
    audit: {
      tenantId,
      actorRole: null,
    },
    integrations: {
      make: {
        tenantId,
        scenarioSetRef: resolvedConfig.integrations?.automation?.webhookRef ?? null,
      },
      airtable: {
        tenantId,
        baseContextRef: resolvedConfig.integrations?.data?.baseIdRef ?? null,
      },
      stripe: {
        tenantId,
        customerContextRef: null,
        enabled: false,
      },
      whatsapp: {
        tenantId,
        senderContextRef: null,
        enabled: false,
      },
    },
  };
}
