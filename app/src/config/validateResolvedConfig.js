// Validaciones cruzadas que un JSON Schema de un solo documento no puede
// expresar (comparan varios documentos entre sí, o aplican heurísticas sobre
// valores ya resueltos). Las validaciones de forma de un único documento
// (tipos/enums/required/additionalProperties) ya las cubre
// src/config/schemaValidator.js contra cada *.schema.json — esta capa no las
// repite. Ver Fase 4 de la misión multi-tenant y
// docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md.

const CANONICAL_ROLES = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];
const FORCED_OFF_FEATURES = ["pagos", "ia", "whatsapp"];

// Nombre de referencia válido: MAYUSCULAS_CON_GUION_BAJO (mismo patrón que
// los ejemplos ya usados en el repo: "MAKE_RESERVAS_WEBHOOK", "AIRTABLE_BASE_ID").
const SECRET_REF_PATTERN = /^[A-Z][A-Z0-9_]*$/;

// Formas que delatan un valor de secreto real colado en un campo *Ref, en
// vez de un nombre de referencia.
const SECRET_LITERAL_PATTERNS = [
  /^sk_/i,
  /^whsec_/i,
  /^xox[baprs]-/i,
  /^ghp_/i,
  /^Bearer\s/i,
  /^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/, // JWT
  /^[A-Za-z0-9+/]{32,}={0,2}$/, // blob base64 largo
];

function isSecretLiteral(value) {
  if (typeof value !== "string" || value.length === 0) return false;
  if (SECRET_LITERAL_PATTERNS.some((pattern) => pattern.test(value))) return true;
  return !SECRET_REF_PATTERN.test(value);
}

function collectRefFields(resolved) {
  return [
    { path: "integrations.automation.webhookRef", value: resolved.integrations?.automation?.webhookRef },
    { path: "integrations.data.baseIdRef", value: resolved.integrations?.data?.baseIdRef },
  ].filter((entry) => entry.value !== null && entry.value !== undefined);
}

function checkForbiddenOverrides(resolved, core, errors) {
  const canonicalRoles = core?.roles ?? CANONICAL_ROLES;
  const invalidRoles = (resolved.roles ?? []).filter((role) => !canonicalRoles.includes(role));
  if (invalidRoles.length > 0) {
    errors.push({ code: "FORBIDDEN_OVERRIDE", message: `roles fuera del conjunto CORE: ${invalidRoles.join(", ")}` });
  }
  for (const feature of FORCED_OFF_FEATURES) {
    if (resolved.features?.[feature]) {
      errors.push({ code: "FORBIDDEN_OVERRIDE", message: `features.${feature} debe ser false (forzado por CORE)` });
    }
  }
}

function checkSecretLiterals(resolved, errors) {
  for (const { path, value } of collectRefFields(resolved)) {
    if (isSecretLiteral(value)) {
      errors.push({ code: "SECRET_LITERAL", message: `${path} contiene un valor que parece un secreto literal, no un nombre de referencia: "${value}"` });
    }
  }
}

function checkCrossTenantReferences(resolved, registry, errors) {
  if (!registry?.tenants) return;
  const ownTenantId = resolved.tenantId;
  const refValues = collectRefFields(resolved);
  for (const tenant of registry.tenants) {
    if (tenant.tenantId === ownTenantId) continue;
    // Los *Ref son MAYUSCULAS_CON_GUION_BAJO (SECRET_REF_PATTERN); los
    // tenantId son minúsculas-con-guion — se normaliza el guion a guion bajo
    // para poder comparar "fixture-club-02" con "..._FIXTURE_CLUB_02".
    const needle = tenant.tenantId.toUpperCase().replace(/-/g, "_");
    for (const { path, value } of refValues) {
      if (typeof value === "string" && value.toUpperCase().includes(needle)) {
        errors.push({ code: "CROSS_TENANT_REFERENCE", message: `${path} ("${value}") referencia al tenant "${tenant.tenantId}", distinto del tenant propio "${ownTenantId}"` });
      }
    }
  }
}

function checkFeatureDependencyPostCondition(resolved, core, errors) {
  const dependencies = core?.featureDependencies;
  if (!dependencies || !resolved.features) return;
  for (const [feature, deps] of Object.entries(dependencies)) {
    if (!resolved.features[feature]) continue;
    const unmet = deps.filter((dep) => !resolved.features[dep]);
    if (unmet.length > 0) {
      errors.push({ code: "INVALID_FEATURE_DEPENDENCY", message: `features.${feature} está ON pero su dependencia ${unmet.join(", ")} está OFF` });
    }
  }
}

function checkIncompatibleIntegrations(resolved, errors) {
  const integrations = resolved.integrations ?? {};
  for (const key of ["payments", "messaging", "ai"]) {
    if (integrations[key]?.enabled === true) {
      errors.push({ code: "INCOMPATIBLE_INTEGRATION", message: `integrations.${key}.enabled no puede ser true (bloqueado por regla de proyecto vigente)` });
    }
  }
  if (resolved.features?.reservas && integrations.data?.enabled === false) {
    errors.push({ code: "INCOMPATIBLE_INTEGRATION", message: "features.reservas está ON pero integrations.data.enabled es false — no hay dónde persistir reservas" });
  }
}

function checkLocaleAndTimezone(resolved, errors) {
  if (!resolved.locale?.language || !resolved.locale?.currency) {
    errors.push({ code: "MISSING_LOCALE", message: "locale.language y locale.currency son obligatorios" });
  }
  const ianaPattern = /^[A-Za-z]+(_[A-Za-z]+)*\/[A-Za-z]+(_[A-Za-z]+)*(\/[A-Za-z]+(_[A-Za-z]+)*)?$/;
  if (!resolved.timezone || !ianaPattern.test(resolved.timezone)) {
    errors.push({ code: "INVALID_TIMEZONE", message: `timezone "${resolved.timezone}" no tiene forma de IANA tz database (p. ej. Europe/Madrid)` });
  }
}

function checkBusinessHours(resolved, errors) {
  const hours = resolved.bookingHours ?? [];
  const hourPattern = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
  const invalid = hours.filter((h) => !hourPattern.test(h));
  if (invalid.length > 0) {
    errors.push({ code: "INVALID_BUSINESS_HOURS", message: `bookingHours con formato inválido: ${invalid.join(", ")}` });
  }
  if (resolved.features?.reservas && hours.length === 0) {
    errors.push({ code: "INVALID_BUSINESS_HOURS", message: "features.reservas está ON pero bookingHours está vacío — ninguna franja sería reservable" });
  }
}

function checkRoleCapabilityCombinations(resolved, core, errors) {
  if (!core?.roleCapabilities) return;
  for (const role of resolved.roles ?? []) {
    if (!core.roleCapabilities[role]) {
      errors.push({ code: "INVALID_ROLE_CAPABILITY", message: `rol "${role}" activo en el cliente pero sin capabilities declaradas en core-config.roleCapabilities` });
    }
  }
}

/**
 * Detecta tenantId o dominios (primary/subdomain) repetidos dentro de un
 * mismo tenant-registry. Independiente de validateResolvedConfig porque
 * opera sobre el registro completo, no sobre un tenant resuelto — reutilizable
 * también como gate de promoción (Fase 9: validación de tenant antes de
 * promoción, ver DEPLOYMENT_PROMOTION_GATES.md).
 */
export function checkTenantRegistryDuplicates(registry) {
  const errors = [];
  const seenIds = new Map();
  const seenDomains = new Map();
  for (const tenant of registry?.tenants ?? []) {
    if (seenIds.has(tenant.tenantId)) {
      errors.push({ code: "DUPLICATE_TENANT_ID", message: `tenantId duplicado: "${tenant.tenantId}"` });
    }
    seenIds.set(tenant.tenantId, true);

    for (const domain of [tenant.domains?.primary, tenant.domains?.subdomain]) {
      if (!domain) continue;
      if (seenDomains.has(domain)) {
        errors.push({ code: "DUPLICATE_DOMAIN", message: `dominio duplicado entre tenants: "${domain}"` });
      }
      seenDomains.set(domain, true);
    }
  }
  return { valid: errors.length === 0, errors };
}

/**
 * Fase 9 (DEPLOYMENT_PROMOTION_GATES.md): validación de tenant antes de
 * promoción. Un deployment-profile con environment "production" solo es
 * válido si el tenant correspondiente está "active" en el registro — un
 * tenant "disabled"/"staging"/"maintenance" no puede promocionarse a
 * producción aunque el resto de gates estén en PASS.
 * @param {object} deploymentProfile Documento deployment-profile ya cargado.
 * @param {object} registry Documento tenant-registry ya cargado.
 */
export function checkTenantActiveForPromotion(deploymentProfile, registry) {
  const errors = [];
  const tenant = registry?.tenants?.find((t) => t.slug === deploymentProfile.clientSlug);
  if (!tenant) {
    errors.push({ code: "UNKNOWN_TENANT", message: `clientSlug "${deploymentProfile.clientSlug}" no está en el tenant-registry` });
    return { valid: false, errors };
  }
  if (deploymentProfile.environment === "production" && tenant.status !== "active") {
    errors.push({
      code: "DISABLED_TENANT_DEPLOYMENT",
      message: `no se puede promocionar clientSlug "${deploymentProfile.clientSlug}" a production: tenant "${tenant.tenantId}" tiene status "${tenant.status}"`,
    });
  }
  return { valid: errors.length === 0, errors };
}

/**
 * @param {object} resolved Salida de mergeConfigLayers().
 * @param {{core?: object, registry?: object}} [context] core-config ya
 *   cargado (para checks de roles/dependencias/capabilities) y/o
 *   tenant-registry ya cargado (para checks cross-tenant). Ambos opcionales:
 *   sin ellos se aplican los checks que no los requieren.
 */
export function validateResolvedConfig(resolved, context = {}) {
  const errors = [];
  const { core, registry } = context;

  checkForbiddenOverrides(resolved, core, errors);
  checkSecretLiterals(resolved, errors);
  checkCrossTenantReferences(resolved, registry, errors);
  checkFeatureDependencyPostCondition(resolved, core, errors);
  checkIncompatibleIntegrations(resolved, errors);
  checkLocaleAndTimezone(resolved, errors);
  checkBusinessHours(resolved, errors);
  checkRoleCapabilityCombinations(resolved, core, errors);

  return { valid: errors.length === 0, errors };
}
