// Paso 10 · Fase 2 — Business Blueprint: descriptor único y versionado.
//
// El Business Blueprint es la ENTRADA de la fábrica (One Prompt Factory):
// un solo objeto que describe un negocio completo. El orquestador (Fase 3)
// lo transforma en tenant.config.json + branding + landing + datos demo +
// documentación, reutilizando el núcleo de Paso 09 (tenantSchema, templates,
// presets, terminology, moduleRegistry) sin duplicarlo.
//
// Regla de secretos: igual que tenantSchema.js, el blueprint NUNCA contiene
// valores de credenciales, solo nombres de variables de entorno.

import { KNOWN_SECTORS, KNOWN_INTEGRATION_PROVIDERS, INTEGRATION_STATUSES } from "../tenant/tenantSchema.js";
import { GENERIC_AUTOMATION_CAPABILITIES } from "../automations/capabilityMap.js";
import { SECTOR_TEMPLATE_IDS } from "../templates/templates.js";
import { SECTOR_PRESET_IDS } from "../templates/presets.js";

export const BUSINESS_BLUEPRINT_SCHEMA_VERSION = 1;

export const KNOWN_PLANS = Object.freeze(["starter", "pro", "business"]);

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TENANT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const LOCALE_PATTERN = /^[a-z]{2}(-[A-Z]{2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const COUNTRY_PATTERN = /^[A-Z]{2}$/;
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECRET_LOOKALIKE = /(sk_live|sk_test|whsec_|AIza|xox[baprs]-)/;

const TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "businessId",
  "tenantId",
  "commercialName",
  "legalName",
  "sector",
  "subsector",
  "country",
  "timezone",
  "locale",
  "currencies",
  "publicInfo",
  "branding",
  "plan",
  "modules",
  "navigation",
  "roles",
  "permissions",
  "services",
  "resources",
  "professionals",
  "schedules",
  "locations",
  "automations",
  "aiCapabilities",
  "integrations",
  "pwa",
  "landingPage",
  "demoData",
  "flags",
  "limits",
  "privacy",
  "manualSteps",
  "generationMeta",
]);

const REQUIRED_TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "businessId",
  "tenantId",
  "commercialName",
  "sector",
  "country",
  "timezone",
  "locale",
  "currencies",
  "plan",
]);

function pushError(errors, path, message) {
  errors.push({ path, message });
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function validatePublicInfo(publicInfo, errors) {
  if (publicInfo === undefined) return;
  if (!isPlainObject(publicInfo)) {
    pushError(errors, "publicInfo", "publicInfo debe ser un objeto");
    return;
  }
  const allowed = ["shortDescription", "website", "email", "phone", "address"];
  for (const key of Object.keys(publicInfo)) {
    if (!allowed.includes(key)) pushError(errors, `publicInfo.${key}`, "propiedad de publicInfo desconocida");
  }
  if (publicInfo.email !== undefined && !EMAIL_PATTERN.test(String(publicInfo.email))) {
    pushError(errors, "publicInfo.email", "email con formato inválido");
  }
  if (publicInfo.address !== undefined && publicInfo.address !== null && !isPlainObject(publicInfo.address)) {
    pushError(errors, "publicInfo.address", "address debe ser un objeto o null");
  }
}

function validateBranding(branding, errors) {
  if (branding === undefined) return;
  if (!isPlainObject(branding)) {
    pushError(errors, "branding", "branding debe ser un objeto");
    return;
  }
  const allowed = ["logoRef", "colors", "fonts", "tone", "iconRefs", "faviconRef"];
  for (const key of Object.keys(branding)) {
    if (!allowed.includes(key)) pushError(errors, `branding.${key}`, "propiedad de branding desconocida");
  }
  if (branding.colors !== undefined) {
    if (!isPlainObject(branding.colors)) {
      pushError(errors, "branding.colors", "colors debe ser un objeto de tokens hex");
    } else {
      for (const [token, value] of Object.entries(branding.colors)) {
        if (!HEX_COLOR_PATTERN.test(String(value))) {
          pushError(errors, `branding.colors.${token}`, "color debe ser hexadecimal #rrggbb");
        }
      }
    }
  }
  if (branding.fonts !== undefined && !isPlainObject(branding.fonts)) {
    pushError(errors, "branding.fonts", "fonts debe ser un objeto {display, body}");
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
      if (!isStringArray(entry.envVars)) {
        pushError(errors, `integrations.${provider}.envVars`, "envVars debe ser un array de nombres de variables de entorno");
      } else if (entry.envVars.some((v) => /=.+/.test(v))) {
        pushError(errors, `integrations.${provider}.envVars`, "envVars debe contener solo NOMBRES de variables, nunca valores");
      }
    }
  }
}

function validateServices(services, errors) {
  if (services === undefined) return;
  if (!Array.isArray(services)) {
    pushError(errors, "services", "services debe ser un array");
    return;
  }
  services.forEach((service, i) => {
    if (!isPlainObject(service) || !isNonEmptyString(service.name)) {
      pushError(errors, `services[${i}]`, "cada servicio requiere al menos {name}");
    }
  });
}

function validateProfessionals(professionals, errors) {
  if (professionals === undefined) return;
  if (!Array.isArray(professionals)) {
    pushError(errors, "professionals", "professionals debe ser un array");
    return;
  }
  professionals.forEach((pro, i) => {
    if (!isPlainObject(pro) || !isNonEmptyString(pro.name)) {
      pushError(errors, `professionals[${i}]`, "cada profesional requiere al menos {name}");
    }
  });
}

function validateSchedules(schedules, errors) {
  if (schedules === undefined) return;
  if (!isPlainObject(schedules)) {
    pushError(errors, "schedules", "schedules debe ser un objeto {lunes: [...], ...} o {enabled, hours}");
    return;
  }
}

function validateLocations(locations, errors) {
  if (locations === undefined) return;
  if (!Array.isArray(locations)) {
    pushError(errors, "locations", "locations debe ser un array");
    return;
  }
  locations.forEach((loc, i) => {
    if (!isPlainObject(loc) || !isNonEmptyString(loc.name)) {
      pushError(errors, `locations[${i}]`, "cada localización requiere al menos {name}");
    }
  });
}

function validateAutomations(automations, errors) {
  if (automations === undefined) return;
  if (!isStringArray(automations)) {
    pushError(errors, "automations", "automations debe ser un array de capacidades genéricas (ids)");
    return;
  }
  for (const capability of automations) {
    if (!GENERIC_AUTOMATION_CAPABILITIES.includes(capability)) {
      pushError(errors, "automations", `capacidad de automatización desconocida: "${capability}"`);
    }
  }
}

function validatePwa(pwa, errors) {
  if (pwa === undefined) return;
  if (!isPlainObject(pwa)) {
    pushError(errors, "pwa", "pwa debe ser un objeto");
    return;
  }
  const allowed = ["shortName", "themeColor", "backgroundColor", "display", "orientation", "startUrl"];
  for (const key of Object.keys(pwa)) {
    if (!allowed.includes(key)) pushError(errors, `pwa.${key}`, "propiedad de pwa desconocida");
  }
  for (const colorKey of ["themeColor", "backgroundColor"]) {
    if (pwa[colorKey] !== undefined && !HEX_COLOR_PATTERN.test(String(pwa[colorKey]))) {
      pushError(errors, `pwa.${colorKey}`, "debe ser hexadecimal #rrggbb");
    }
  }
}

function validateLandingPage(landingPage, errors) {
  if (landingPage === undefined) return;
  if (!isPlainObject(landingPage)) {
    pushError(errors, "landingPage", "landingPage debe ser un objeto");
    return;
  }
  const allowed = ["sectionsEnabled", "ctaLabel", "ctaHref", "testimonials", "faq"];
  for (const key of Object.keys(landingPage)) {
    if (!allowed.includes(key)) pushError(errors, `landingPage.${key}`, "propiedad de landingPage desconocida");
  }
  if (landingPage.sectionsEnabled !== undefined && !isStringArray(landingPage.sectionsEnabled)) {
    pushError(errors, "landingPage.sectionsEnabled", "sectionsEnabled debe ser un array de strings");
  }
  if (landingPage.testimonials !== undefined && !Array.isArray(landingPage.testimonials)) {
    pushError(errors, "landingPage.testimonials", "testimonials debe ser un array");
  }
  if (landingPage.faq !== undefined && !Array.isArray(landingPage.faq)) {
    pushError(errors, "landingPage.faq", "faq debe ser un array");
  }
}

function validateDemoData(demoData, errors) {
  if (demoData === undefined) return;
  if (!isPlainObject(demoData)) {
    pushError(errors, "demoData", "demoData debe ser un objeto");
    return;
  }
  if (demoData.enabled !== undefined && typeof demoData.enabled !== "boolean") {
    pushError(errors, "demoData.enabled", "demoData.enabled debe ser boolean");
  }
  if (demoData.seed !== undefined && typeof demoData.seed !== "number" && typeof demoData.seed !== "string") {
    pushError(errors, "demoData.seed", "demoData.seed debe ser number o string (determinismo reproducible)");
  }
  if (demoData.sizes !== undefined && !isPlainObject(demoData.sizes)) {
    pushError(errors, "demoData.sizes", "demoData.sizes debe ser un objeto {customers, professionals, ...}");
  }
}

function validateLimits(limits, errors) {
  if (limits === undefined) return;
  if (!isPlainObject(limits)) pushError(errors, "limits", "limits debe ser un objeto");
}

function validatePrivacy(privacy, errors) {
  if (privacy === undefined) return;
  if (!isPlainObject(privacy)) {
    pushError(errors, "privacy", "privacy debe ser un objeto");
    return;
  }
  if (privacy.regulatedSector !== undefined && typeof privacy.regulatedSector !== "boolean") {
    pushError(errors, "privacy.regulatedSector", "regulatedSector debe ser boolean");
  }
  if (privacy.sensitiveDataCategories !== undefined && !isStringArray(privacy.sensitiveDataCategories)) {
    pushError(errors, "privacy.sensitiveDataCategories", "sensitiveDataCategories debe ser un array de strings");
  }
}

function validateGenerationMeta(meta, errors) {
  if (meta === undefined) return;
  if (!isPlainObject(meta)) pushError(errors, "generationMeta", "generationMeta debe ser un objeto");
}

/**
 * Valida un Business Blueprint contra el esquema versionado. No lanza:
 * siempre devuelve {valid, errors}. Fail-closed, igual que
 * tenantSchema.validateTenantConfig — un blueprint con errores nunca debe
 * tratarse como válido en ningún llamador.
 * @param {unknown} blueprint
 * @returns {{valid: boolean, errors: {path: string, message: string}[]}}
 */
export function validateBusinessBlueprint(blueprint) {
  const errors = [];

  if (!isPlainObject(blueprint)) {
    return { valid: false, errors: [{ path: "$", message: "el Business Blueprint debe ser un objeto" }] };
  }

  for (const key of Object.keys(blueprint)) {
    if (!TOP_LEVEL_FIELDS.includes(key)) pushError(errors, key, "propiedad de nivel superior desconocida");
  }
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (blueprint[field] === undefined || blueprint[field] === null) {
      pushError(errors, field, "campo obligatorio ausente");
    }
  }

  if (blueprint.schemaVersion !== undefined && blueprint.schemaVersion !== BUSINESS_BLUEPRINT_SCHEMA_VERSION) {
    pushError(errors, "schemaVersion", `versión de esquema no soportada (esperado ${BUSINESS_BLUEPRINT_SCHEMA_VERSION}; usa migrateBusinessBlueprint())`);
  }
  if (blueprint.businessId !== undefined && !SLUG_PATTERN.test(String(blueprint.businessId))) {
    pushError(errors, "businessId", "businessId debe ser kebab-case en minúsculas");
  }
  if (blueprint.tenantId !== undefined && !TENANT_ID_PATTERN.test(String(blueprint.tenantId))) {
    pushError(errors, "tenantId", "tenantId debe ser minúsculas/números/guiones, 2-64 caracteres");
  }
  if (blueprint.commercialName !== undefined && !isNonEmptyString(blueprint.commercialName)) {
    pushError(errors, "commercialName", "commercialName no puede estar vacío");
  }
  if (blueprint.legalName !== undefined && !isNonEmptyString(blueprint.legalName)) {
    pushError(errors, "legalName", "legalName no puede estar vacío si se indica");
  }
  if (blueprint.sector !== undefined && !KNOWN_SECTORS.includes(blueprint.sector)) {
    pushError(errors, "sector", `sector debe ser uno de: ${KNOWN_SECTORS.join(", ")}`);
  }
  if (blueprint.subsector !== undefined && !isNonEmptyString(blueprint.subsector)) {
    pushError(errors, "subsector", "subsector no puede estar vacío si se indica");
  }
  if (blueprint.country !== undefined && !COUNTRY_PATTERN.test(String(blueprint.country))) {
    pushError(errors, "country", "country debe ser un código ISO 3166-1 alpha-2");
  }
  if (blueprint.timezone !== undefined && !isNonEmptyString(blueprint.timezone)) {
    pushError(errors, "timezone", "timezone no puede estar vacío");
  }
  if (blueprint.locale !== undefined && !LOCALE_PATTERN.test(String(blueprint.locale))) {
    pushError(errors, "locale", "locale debe tener formato xx o xx-XX");
  }
  if (blueprint.currencies !== undefined) {
    if (!Array.isArray(blueprint.currencies) || blueprint.currencies.length === 0 || !blueprint.currencies.every((c) => CURRENCY_PATTERN.test(String(c)))) {
      pushError(errors, "currencies", "currencies debe ser un array no vacío de códigos ISO 4217");
    }
  }
  if (blueprint.plan !== undefined && !KNOWN_PLANS.includes(blueprint.plan)) {
    pushError(errors, "plan", `plan debe ser uno de: ${KNOWN_PLANS.join(", ")}`);
  }
  if (blueprint.modules !== undefined && !isStringArray(blueprint.modules)) {
    pushError(errors, "modules", "modules debe ser un array de identificadores de módulo");
  }
  if (blueprint.roles !== undefined && (!isStringArray(blueprint.roles) || blueprint.roles.length === 0)) {
    pushError(errors, "roles", "roles debe ser un array no vacío de strings");
  }
  if (blueprint.permissions !== undefined && !isPlainObject(blueprint.permissions)) {
    pushError(errors, "permissions", "permissions debe ser un objeto {rol: [moduleId,...]}");
  }
  if (blueprint.navigation !== undefined && !isPlainObject(blueprint.navigation)) {
    pushError(errors, "navigation", "navigation debe ser un objeto de overrides");
  }
  if (blueprint.flags !== undefined && !isPlainObject(blueprint.flags)) {
    pushError(errors, "flags", "flags debe ser un objeto de booleans");
  }
  if (blueprint.manualSteps !== undefined && !isStringArray(blueprint.manualSteps)) {
    pushError(errors, "manualSteps", "manualSteps debe ser un array de strings");
  }
  if (blueprint.aiCapabilities !== undefined && !isStringArray(blueprint.aiCapabilities)) {
    pushError(errors, "aiCapabilities", "aiCapabilities debe ser un array de strings (ids declarativos, no ejecutables aún)");
  }

  validatePublicInfo(blueprint.publicInfo, errors);
  validateBranding(blueprint.branding, errors);
  validateServices(blueprint.services, errors);
  validateProfessionals(blueprint.professionals, errors);
  validateSchedules(blueprint.schedules, errors);
  validateLocations(blueprint.locations, errors);
  validateAutomations(blueprint.automations, errors);
  validateIntegrations(blueprint.integrations, errors);
  validatePwa(blueprint.pwa, errors);
  validateLandingPage(blueprint.landingPage, errors);
  validateDemoData(blueprint.demoData, errors);
  validateLimits(blueprint.limits, errors);
  validatePrivacy(blueprint.privacy, errors);
  validateGenerationMeta(blueprint.generationMeta, errors);

  const flatValues = JSON.stringify(blueprint);
  if (SECRET_LOOKALIKE.test(flatValues)) {
    pushError(errors, "$", "el Business Blueprint parece contener un secreto o credencial; solo se permiten nombres de variables de entorno");
  }

  return { valid: errors.length === 0, errors };
}

/** Lanza si el blueprint es inválido; falla rápido para CLI/scripts. */
export function assertValidBusinessBlueprint(blueprint) {
  const { valid, errors } = validateBusinessBlueprint(blueprint);
  if (!valid) {
    const details = errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n");
    throw new Error(`Business Blueprint inválido:\n${details}`);
  }
  return blueprint;
}

/**
 * Migra un blueprint de una versión anterior (o sin versión, "borrador
 * legacy") a BUSINESS_BLUEPRINT_SCHEMA_VERSION. No muta la entrada.
 * Único salto soportado hoy: "legacy" (sin schemaVersion, con `currency`
 * singular) → v1 (`currencies` array). Un blueprint ya en v1 se devuelve
 * sin cambios. Versiones futuras (>1) deben añadir un paso más a esta
 * cadena, nunca reescribir los anteriores.
 * @param {unknown} raw
 * @returns {{blueprint: object, migrated: boolean, notes: string[]}}
 */
export function migrateBusinessBlueprint(raw) {
  if (!isPlainObject(raw)) {
    throw new Error("migrateBusinessBlueprint requiere un objeto");
  }
  const notes = [];
  let working = { ...raw };

  const looksLegacy = working.schemaVersion === undefined || working.schemaVersion === 0;
  if (looksLegacy) {
    if (working.currency !== undefined && working.currencies === undefined) {
      working.currencies = [working.currency];
      notes.push(`legacy→v1: currency "${working.currency}" convertido a currencies:["${working.currency}"]`);
    }
    delete working.currency;
    working.schemaVersion = 1;
    notes.push("legacy→v1: schemaVersion asignado explícitamente");
  }

  if (working.schemaVersion !== BUSINESS_BLUEPRINT_SCHEMA_VERSION) {
    throw new Error(`No hay ruta de migración conocida desde schemaVersion=${raw.schemaVersion} hasta ${BUSINESS_BLUEPRINT_SCHEMA_VERSION}`);
  }

  return { blueprint: working, migrated: notes.length > 0, notes };
}

export { SECTOR_TEMPLATE_IDS, SECTOR_PRESET_IDS };
