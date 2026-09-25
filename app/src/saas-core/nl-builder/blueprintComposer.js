// Paso 11 · Fase "E" — Compositor de Business Blueprint.
//
// Transforma un Business Intent (YA validado, con toda su incertidumbre
// visible) en un Business Blueprint válido contra el mismo esquema que
// exige `business:create` del Paso 10 (businessBlueprintSchema.js). Es una
// función PURA de proyección: nunca añade módulos/roles/automatizaciones
// que no vinieran ya del Intent, solo reduce/reordena su forma a los campos
// más estrictos que el Blueprint permite. Un Blueprint compuesto aquí debe
// ser indistinguible, para el orquestador de Paso 10, de uno escrito a mano.

import { slugify } from "../../../tenant-cli/lib/tenantProvisioning.mjs";
import { BUSINESS_BLUEPRINT_SCHEMA_VERSION, validateBusinessBlueprint } from "../factory/businessBlueprintSchema.js";

const PLAN_MODULE_COUNT_THRESHOLD_PRO = 8;
const DRAFT_SUFFIX_PATTERN = /\s*\(borrador\)\s*$/i;

function stripDraftSuffix(name) {
  return String(name || "").replace(DRAFT_SUFFIX_PATTERN, "").trim();
}

/** Garantiza un id estable de al menos 2 caracteres, kebab-case, sin depender de I/O. */
function toStableId(name) {
  const slug = slugify(name);
  if (slug.length >= 2) return slug;
  return `${slug || "negocio"}-borrador`;
}

function dedupeStrings(list) {
  return [...new Set(list)];
}

function projectBranding(brandingProposal) {
  return {
    logoRef: brandingProposal.logoRef,
    faviconRef: brandingProposal.faviconRef,
    tone: brandingProposal.tone,
    colors: {
      primary: brandingProposal.palette.primary,
      accent: brandingProposal.palette.accent,
      bg: brandingProposal.palette.bg,
      text: brandingProposal.palette.text,
    },
    fonts: { ...brandingProposal.fonts },
  };
}

function projectPwa(pwaProposal) {
  return {
    shortName: pwaProposal.shortName,
    themeColor: pwaProposal.themeColor,
    backgroundColor: pwaProposal.backgroundColor,
    display: pwaProposal.display,
    orientation: pwaProposal.orientation,
    startUrl: pwaProposal.startUrl,
  };
}

function projectLandingPage(landingProposal) {
  return {
    sectionsEnabled: [...landingProposal.sectionsEnabled],
    ctaLabel: landingProposal.ctaLabel,
    ctaHref: landingProposal.ctaHref,
    testimonials: landingProposal.testimonials.map((t) => ({ ...t })),
    faq: landingProposal.faq.map((f) => ({ ...f })),
  };
}

function derivePlan(enabledModuleCount, explicitPlan) {
  if (explicitPlan) return explicitPlan;
  return enabledModuleCount >= PLAN_MODULE_COUNT_THRESHOLD_PRO ? "pro" : "starter";
}

/**
 * @param {object} intent Business Intent ya validado (ver businessIntentSchema.js)
 * @param {{plan?: string, businessIdOverride?: string}} [options]
 * @returns {object} Business Blueprint válido
 */
export function composeBlueprintFromIntent(intent, options = {}) {
  const commercialName = stripDraftSuffix(intent.business.proposedName);
  const businessId = options.businessIdOverride ? toStableId(options.businessIdOverride) : toStableId(commercialName);
  const enabledModuleIds = intent.modules.filter((m) => m.status === "enabled").map((m) => m.id);

  const manualSteps = dedupeStrings([
    ...intent.complianceNotes,
    ...intent.recommendedQuestions.map((q) => `Confirmar antes de producción: ${q}`),
    ...intent.assumptions.map((a) => `Revisar supuesto — ${a.field}: se asumió "${a.assumedValue}" (${a.reason})`),
  ]);

  const blueprint = {
    schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION,
    businessId,
    tenantId: businessId,
    commercialName,
    sector: intent.business.sector,
    country: intent.country,
    timezone: intent.timezone,
    locale: intent.locale,
    currencies: [intent.currency],
    plan: derivePlan(enabledModuleIds.length, options.plan),
    publicInfo: { shortDescription: intent.normalizedSummary },
    branding: projectBranding(intent.branding),
    modules: enabledModuleIds,
    roles: intent.roles,
    permissions: intent.permissions,
    automations: dedupeStrings(intent.automations.map((a) => a.capability)),
    aiCapabilities: [],
    integrations: intent.integrations,
    pwa: projectPwa(intent.pwa),
    landingPage: projectLandingPage(intent.landing),
    demoData: { enabled: true, seed: intent.generationMetadata.seed || "default-seed", sizes: {} },
    flags: {},
    limits: {},
    privacy: { regulatedSector: intent.security.regulatedSector, sensitiveDataCategories: intent.security.sensitiveDataCategories },
    manualSteps,
    generationMeta: {
      generatedBy: "nl-builder:business:compose",
      sourceIntentRequestId: intent.requestId,
      seed: intent.generationMetadata.seed || "default-seed",
    },
  };

  const { valid, errors } = validateBusinessBlueprint(blueprint);
  if (!valid) {
    throw new Error(`Bug interno de blueprintComposer: el Business Blueprint compuesto no es válido:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  }

  return blueprint;
}
