// Paso 09 · Núcleo SaaS replicable — esquema central de tenant.
//
// Objeto de configuración puro (sin React, sin I/O) que describe un negocio
// que corre sobre el núcleo. Club Pádel 04 es el tenant por defecto
// (ver defaultTenant.js) y debe validar contra este mismo esquema: no hay
// un "modo especial" para el tenant original.
//
// No se almacenan secretos aquí. Las integraciones solo referencian NOMBRES
// de variables de entorno (`envVar`) o un estado (`status`), nunca valores.

export const TENANT_SCHEMA_VERSION = 1;

export const KNOWN_BUSINESS_TYPES = Object.freeze([
  "padel-club",
  "sports-club",
  "healthcare-clinic",
  "professional-services",
  "beauty-salon",
  "veterinary-clinic",
  "local-service",
]);

// Sector es más fino que businessType (permite presets: p.ej. businessType
// "healthcare-clinic" + sector "dental").
export const KNOWN_SECTORS = Object.freeze([
  "padel",
  "sports",
  "dental",
  "physiotherapy",
  "speech-therapy",
  "psychology",
  "law",
  "fertility",
  "hair-salon",
  "beauty",
  "veterinary",
  "restaurant",
  "education",
  "automotive",
  "real-estate",
  "generic-local-service",
]);

export const KNOWN_INTEGRATION_PROVIDERS = Object.freeze([
  "automation", // Make
  "dataRepository", // Airtable / Supabase
  "payments", // Stripe
  "messaging", // WhatsApp Business
  "email", // Gmail
  "calendar", // Google Calendar
  "fileStorage",
  "analytics",
]);

export const INTEGRATION_STATUSES = Object.freeze([
  "not_configured",
  "mock",
  "configured_untested",
  "connected",
]);

const TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "tenantId",
  "slug",
  "legalName",
  "displayName",
  "businessType",
  "sector",
  "locale",
  "timezone",
  "currency",
  "country",
  "branding",
  "contact",
  "address",
  "businessHours",
  "roles",
  "permissions",
  "modulesEnabled",
  "featuresEnabled",
  "navigationOverrides",
  "terminologyOverrides",
  "integrations",
  "policies",
  "demoData",
  "flags",
  "meta",
]);

const REQUIRED_TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "tenantId",
  "slug",
  "legalName",
  "displayName",
  "businessType",
  "sector",
  "locale",
  "timezone",
  "currency",
  "country",
  "roles",
  "modulesEnabled",
]);

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

function pushError(errors, path, message) {
  errors.push({ path, message });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateBranding(branding, errors) {
  if (branding === undefined) return;
  if (!isPlainObject(branding)) {
    pushError(errors, "branding", "branding debe ser un objeto");
    return;
  }
  const allowed = ["colors", "logoUrl", "ogImageUrl", "fontDisplay", "fontBody"];
  for (const key of Object.keys(branding)) {
    if (!allowed.includes(key)) {
      pushError(errors, `branding.${key}`, "propiedad de branding desconocida");
    }
  }
  if (branding.colors !== undefined) {
    if (!isPlainObject(branding.colors)) {
      pushError(errors, "branding.colors", "colors debe ser un objeto de tokens");
    } else {
      for (const [token, value] of Object.entries(branding.colors)) {
        if (!HEX_COLOR_PATTERN.test(String(value))) {
          pushError(errors, `branding.colors.${token}`, "color debe ser hexadecimal #rrggbb");
        }
      }
    }
  }
  for (const urlKey of ["logoUrl", "ogImageUrl"]) {
    if (branding[urlKey] !== undefined && typeof branding[urlKey] !== "string") {
      pushError(errors, `branding.${urlKey}`, "debe ser una cadena (ruta o URL)");
    }
  }
}

function validateContact(contact, errors) {
  if (contact === undefined) return;
  if (!isPlainObject(contact)) {
    pushError(errors, "contact", "contact debe ser un objeto");
    return;
  }
  const allowed = ["email", "phone", "website"];
  for (const key of Object.keys(contact)) {
    if (!allowed.includes(key)) {
      pushError(errors, `contact.${key}`, "propiedad de contact desconocida");
    }
  }
  if (contact.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    pushError(errors, "contact.email", "email con formato inválido");
  }
}

function validateIntegrations(integrations, errors) {
  if (integrations === undefined) return;
  if (!isPlainObject(integrations)) {
    pushError(errors, "integrations", "integrations debe ser un objeto");
    return;
  }
  for (const [provider, entry] of Object.entries(integrations)) {
    if (!KNOWN_INTEGRATION_PROVIDERS.includes(provider)) {
      pushError(errors, `integrations.${provider}`, "proveedor de integración desconocido");
      continue;
    }
    if (!isPlainObject(entry)) {
      pushError(errors, `integrations.${provider}`, "debe ser un objeto {status, envVars}");
      continue;
    }
    if (!INTEGRATION_STATUSES.includes(entry.status)) {
      pushError(errors, `integrations.${provider}.status`, `status debe ser uno de: ${INTEGRATION_STATUSES.join(", ")}`);
    }
    if (entry.envVars !== undefined) {
      if (!Array.isArray(entry.envVars) || entry.envVars.some((v) => typeof v !== "string")) {
        pushError(errors, `integrations.${provider}.envVars`, "envVars debe ser un array de nombres de variables de entorno");
      } else if (entry.envVars.some((v) => /=.+/.test(v))) {
        pushError(errors, `integrations.${provider}.envVars`, "envVars debe contener solo NOMBRES de variables, nunca valores (posible secreto)");
      }
    }
  }
}

function validatePolicies(policies, errors) {
  if (policies === undefined) return;
  if (!isPlainObject(policies)) {
    pushError(errors, "policies", "policies debe ser un objeto");
    return;
  }
  const allowed = ["privacyReviewRequired", "regulatedSector", "sensitiveDataCategories", "notes"];
  for (const key of Object.keys(policies)) {
    if (!allowed.includes(key)) {
      pushError(errors, `policies.${key}`, "propiedad de policies desconocida");
    }
  }
}

/**
 * Valida un objeto de configuración de tenant contra el esquema central.
 * No lanza excepciones: siempre devuelve {valid, errors}. Diseñado para
 * fallar de forma segura (fail-closed) — un tenant con errores no debe
 * tratarse como válido en ningún llamador.
 * @param {unknown} config
 * @returns {{valid: boolean, errors: {path: string, message: string}[]}}
 */
export function validateTenantConfig(config) {
  const errors = [];

  if (!isPlainObject(config)) {
    return { valid: false, errors: [{ path: "$", message: "la configuración de tenant debe ser un objeto" }] };
  }

  for (const key of Object.keys(config)) {
    if (!TOP_LEVEL_FIELDS.includes(key)) {
      pushError(errors, key, "propiedad de nivel superior desconocida");
    }
  }

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (config[field] === undefined || config[field] === null) {
      pushError(errors, field, "campo obligatorio ausente");
    }
  }

  if (config.schemaVersion !== undefined && config.schemaVersion !== TENANT_SCHEMA_VERSION) {
    pushError(errors, "schemaVersion", `versión de esquema no soportada (esperado ${TENANT_SCHEMA_VERSION})`);
  }

  if (config.tenantId !== undefined && !TENANT_ID_PATTERN.test(String(config.tenantId))) {
    pushError(errors, "tenantId", "tenantId debe ser minúsculas/números/guiones, 2-64 caracteres");
  }

  if (config.slug !== undefined && !SLUG_PATTERN.test(String(config.slug))) {
    pushError(errors, "slug", "slug debe ser kebab-case en minúsculas");
  }

  if (config.legalName !== undefined && !isNonEmptyString(config.legalName)) {
    pushError(errors, "legalName", "legalName no puede estar vacío");
  }
  if (config.displayName !== undefined && !isNonEmptyString(config.displayName)) {
    pushError(errors, "displayName", "displayName no puede estar vacío");
  }

  if (config.businessType !== undefined && !KNOWN_BUSINESS_TYPES.includes(config.businessType)) {
    pushError(errors, "businessType", `businessType debe ser uno de: ${KNOWN_BUSINESS_TYPES.join(", ")}`);
  }
  if (config.sector !== undefined && !KNOWN_SECTORS.includes(config.sector)) {
    pushError(errors, "sector", `sector debe ser uno de: ${KNOWN_SECTORS.join(", ")}`);
  }

  if (config.locale !== undefined && !LOCALE_PATTERN.test(String(config.locale))) {
    pushError(errors, "locale", "locale debe tener formato xx o xx-XX");
  }
  if (config.currency !== undefined && !CURRENCY_PATTERN.test(String(config.currency))) {
    pushError(errors, "currency", "currency debe ser un código ISO 4217 de 3 letras mayúsculas");
  }
  if (config.country !== undefined && !COUNTRY_PATTERN.test(String(config.country))) {
    pushError(errors, "country", "country debe ser un código ISO 3166-1 alpha-2");
  }
  if (config.timezone !== undefined && !isNonEmptyString(config.timezone)) {
    pushError(errors, "timezone", "timezone no puede estar vacío");
  }

  if (config.roles !== undefined) {
    if (!Array.isArray(config.roles) || config.roles.length === 0 || !config.roles.every(isNonEmptyString)) {
      pushError(errors, "roles", "roles debe ser un array no vacío de strings");
    }
  }

  if (config.modulesEnabled !== undefined) {
    if (!Array.isArray(config.modulesEnabled) || !config.modulesEnabled.every(isNonEmptyString)) {
      pushError(errors, "modulesEnabled", "modulesEnabled debe ser un array de identificadores de módulo");
    }
  }
  if (config.featuresEnabled !== undefined) {
    if (!Array.isArray(config.featuresEnabled) || !config.featuresEnabled.every(isNonEmptyString)) {
      pushError(errors, "featuresEnabled", "featuresEnabled debe ser un array de strings");
    }
  }

  if (config.permissions !== undefined && !isPlainObject(config.permissions)) {
    pushError(errors, "permissions", "permissions debe ser un objeto {rol: [moduleId,...]}");
  }

  if (config.terminologyOverrides !== undefined && !isPlainObject(config.terminologyOverrides)) {
    pushError(errors, "terminologyOverrides", "terminologyOverrides debe ser un objeto");
  }

  if (config.navigationOverrides !== undefined && !isPlainObject(config.navigationOverrides)) {
    pushError(errors, "navigationOverrides", "navigationOverrides debe ser un objeto");
  }

  if (config.demoData !== undefined) {
    if (!isPlainObject(config.demoData)) {
      pushError(errors, "demoData", "demoData debe ser un objeto {enabled, source}");
    } else if (typeof config.demoData.enabled !== "boolean") {
      pushError(errors, "demoData.enabled", "demoData.enabled debe ser boolean");
    }
  }

  if (config.flags !== undefined && !isPlainObject(config.flags)) {
    pushError(errors, "flags", "flags debe ser un objeto de booleans");
  }

  if (config.address !== undefined && config.address !== null && !isPlainObject(config.address)) {
    pushError(errors, "address", "address debe ser un objeto (opcional) o null");
  }

  validateBranding(config.branding, errors);
  validateContact(config.contact, errors);
  validateIntegrations(config.integrations, errors);
  validatePolicies(config.policies, errors);

  // Búsqueda de secretos evidentes filtrados por error de config: cualquier
  // valor de cadena que "parezca" una clave/token no debe vivir en el tenant.
  const SECRET_LOOKALIKE = /(sk_live|sk_test|whsec_|AIza|xox[baprs]-)/;
  const flatValues = JSON.stringify(config);
  if (SECRET_LOOKALIKE.test(flatValues)) {
    pushError(errors, "$", "la configuración parece contener un secreto o credencial; los tenants solo referencian nombres de variables de entorno");
  }

  return { valid: errors.length === 0, errors };
}

/** Lanza si la config es inválida; útil en scripts/CLI donde fallar rápido es lo seguro. */
export function assertValidTenantConfig(config) {
  const { valid, errors } = validateTenantConfig(config);
  if (!valid) {
    const details = errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n");
    throw new Error(`Configuración de tenant inválida:\n${details}`);
  }
  return config;
}
