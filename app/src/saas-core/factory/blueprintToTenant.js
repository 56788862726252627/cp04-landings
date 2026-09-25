// Paso 10 · Fase 4 — Puente Business Blueprint → tenant.config.json.
//
// Reutiliza el esquema y catálogo de Paso 09 (templates/presets/moduleRegistry
// /terminology) tal cual: este puente NUNCA redefine módulos ni permisos,
// solo traduce campos del blueprint a la forma que ya entiende
// `tenantSchema.validateTenantConfig`. Un tenant generado por la fábrica
// valida contra el MISMO esquema que Club Pádel 04 (sin modo especial).

import { TENANT_SCHEMA_VERSION, validateTenantConfig } from "../tenant/tenantSchema.js";
import { getTemplate, SECTOR_TEMPLATE_IDS } from "../templates/templates.js";
import { getPreset, SECTOR_PRESET_IDS } from "../templates/presets.js";
import { buildTerminology } from "../terminology/terminology.js";
import { buildSidebarNavigation } from "../modules/moduleRegistry.js";

export const ENV_VAR_NAMES_BY_PROVIDER = Object.freeze({
  automation: ["MAKE_WEBHOOK_URL"],
  dataRepository: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"],
  payments: ["STRIPE_SECRET_KEY"],
  messaging: ["WHATSAPP_BUSINESS_TOKEN"],
  email: ["GMAIL_OAUTH_CLIENT_ID"],
  calendar: ["GOOGLE_CALENDAR_CLIENT_ID"],
  fileStorage: ["FILE_STORAGE_BUCKET_NAME"],
  analytics: ["ANALYTICS_WRITE_KEY"],
});

/** Encuentra la plantilla/preset más adecuado para un blueprint por su sector. */
function resolveBaseForSector(sector) {
  for (const presetId of SECTOR_PRESET_IDS) {
    const preset = getPreset(presetId);
    if (preset && preset.sector === sector) return { base: preset, sourceKind: "preset" };
  }
  for (const templateId of SECTOR_TEMPLATE_IDS) {
    const template = getTemplate(templateId);
    if (template && template.sector === sector) return { base: template, sourceKind: "template" };
  }
  return { base: getTemplate("local-service"), sourceKind: "template" };
}

/**
 * Traduce un Business Blueprint YA VALIDADO a un tenant.config.json válido
 * contra tenantSchema. Es una función pura (sin I/O). El caller (orquestador)
 * es responsable de validar el blueprint de entrada antes de llamar aquí.
 * @param {object} blueprint
 */
export function blueprintToTenantConfig(blueprint) {
  const { base, sourceKind } = resolveBaseForSector(blueprint.sector);
  if (!base) {
    throw new Error(`No se encontró plantilla/preset base para el sector "${blueprint.sector}"`);
  }

  const { dictionary: terminology, ignoredKeys } = buildTerminology({ ...base.terminologyOverrides });
  if (ignoredKeys.length > 0) {
    throw new Error(`Terminología del blueprint tiene claves inválidas: ${ignoredKeys.join(", ")}`);
  }

  const modulesEnabled = Array.isArray(blueprint.modules) && blueprint.modules.length > 0 ? blueprint.modules : base.modules;

  const integrations = {};
  const declaredIntegrations = blueprint.integrations || {};
  const providersToDeclare = Object.keys(declaredIntegrations).length > 0 ? Object.keys(declaredIntegrations) : base.recommendedIntegrations;
  for (const provider of providersToDeclare) {
    const declared = declaredIntegrations[provider];
    integrations[provider] = {
      status: declared?.status || "not_configured",
      envVars: declared?.envVars || ENV_VAR_NAMES_BY_PROVIDER[provider] || [],
    };
  }

  const primaryCurrency = Array.isArray(blueprint.currencies) ? blueprint.currencies[0] : "EUR";

  const tenantConfig = {
    schemaVersion: TENANT_SCHEMA_VERSION,
    tenantId: blueprint.tenantId,
    slug: blueprint.tenantId,
    legalName: blueprint.legalName || blueprint.commercialName,
    displayName: blueprint.commercialName,
    businessType: base.businessType,
    sector: blueprint.sector,
    locale: blueprint.locale,
    timezone: blueprint.timezone,
    currency: primaryCurrency,
    country: blueprint.country,
    branding: blueprint.branding?.colors ? { colors: blueprint.branding.colors } : { colors: { accent: "#2f6bff" } },
    contact: blueprint.publicInfo?.email ? { email: blueprint.publicInfo.email } : undefined,
    roles: base.roles,
    permissions: base.permissions,
    modulesEnabled,
    featuresEnabled: [],
    terminologyOverrides: base.terminologyOverrides,
    integrations,
    policies: base.policies || blueprint.privacy || { privacyReviewRequired: false, regulatedSector: false, sensitiveDataCategories: [] },
    demoData: { enabled: Boolean(blueprint.demoData?.enabled ?? true), source: sourceKind === "preset" ? `preset:${base.presetId}` : `template:${base.templateId}` },
    flags: blueprint.flags || {},
    meta: {
      templateId: sourceKind === "preset" ? base.baseTemplateId : base.templateId,
      presetId: sourceKind === "preset" ? base.presetId : null,
      isDefaultTenant: false,
      generatedBy: "one-prompt-factory:business:create",
      businessId: blueprint.businessId,
    },
  };
  if (tenantConfig.contact === undefined) delete tenantConfig.contact;

  const { valid, errors } = validateTenantConfig(tenantConfig);
  if (!valid) {
    throw new Error(`El tenant.config.json derivado del blueprint no es válido (bug del puente blueprint→tenant): ${JSON.stringify(errors)}`);
  }

  return { tenantConfig, base, sourceKind, terminology };
}

/** Navegación por rol para el tenant derivado — reutiliza moduleRegistry sin duplicar lógica. */
export function buildNavigationPreview(tenantConfig) {
  const byRole = {};
  for (const role of tenantConfig.roles) {
    byRole[role] = buildSidebarNavigation(tenantConfig, role).map((n) => n.id);
  }
  return byRole;
}
