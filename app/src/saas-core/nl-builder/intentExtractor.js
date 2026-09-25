// Paso 11 · Motor de interpretación (Capa A: modo determinista local).
//
// Punto de entrada único del Natural Language Business Builder:
// `interpretBusinessDescription` conecta normalizador → léxico sectorial →
// motor de módulos → automatizaciones → roles/permisos → branding/landing/
// PWA → ambigüedades → confianza, y ensambla un Business Intent que SIEMPRE
// valida contra businessIntentSchema.js (si no, es un bug de este módulo,
// nunca del llamador). No depende de ninguna API externa: funciona 100%
// offline y de forma determinista (mismo texto + mismo seed ⇒ mismo intent).

import { createHash } from "node:crypto";

import { normalizeInput } from "./inputNormalizer.js";
import { matchSectorPreset } from "./sectorLexicon.js";
import { resolveModules } from "./moduleDependencyEngine.js";
import { recommendAutomations } from "./automationCatalog.js";
import { buildRolesAndPermissions } from "./roleEngine.js";
import { buildBrandingProposal, buildLandingProposal, buildPwaProposal } from "./brandingLandingProposal.js";
import { detectAmbiguities, applyAnswers } from "./ambiguityEngine.js";
import { computeConfidence } from "./confidenceEngine.js";
import { BUSINESS_INTENT_SCHEMA_VERSION, validateBusinessIntent } from "./businessIntentSchema.js";
import { ENV_VAR_NAMES_BY_PROVIDER } from "../factory/blueprintToTenant.js";

const HEALTH_LIKE_SECTORS = Object.freeze(["dental", "physiotherapy", "veterinary"]);
const PROFESSIONAL_COUNT_PATTERN = /\b(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho)\s+(profesionales?|dentistas?|odont[oó]logos?|fisioterapeutas?|abogados?|veterinarios?|peluqueros?|estilistas?|mec[aá]nicos?|agentes?|profesores?|especialistas?|entrenadores?)\b/i;

function titleCase(text) {
  return String(text || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

function deriveProposedName(normalized, sectorMatch) {
  const label = titleCase(sectorMatch.preset.label);
  if (normalized.detectedCity) return `${label} ${titleCase(normalized.detectedCity)} (borrador)`;
  return `${label} (borrador)`;
}

function deriveRequestId(seed, cleanedText) {
  const hash = createHash("sha256").update(`${seed}\n${cleanedText}`).digest("hex").slice(0, 16);
  return `intent-${hash}`;
}

function deriveObjectivesAndProblems(sectorPreset) {
  const objectives = [`digitalizar la gestión de ${sectorPreset.label.toLowerCase()}`, ...sectorPreset.processes.map((p) => `agilizar: ${p}`)];
  const problemsToSolve = ["gestión manual/en papel de la operación diaria", "falta de recordatorios automáticos para reducir ausencias"];
  return { objectives, problemsToSolve };
}

function deriveIntegrations(sectorPreset) {
  const integrations = {};
  for (const provider of sectorPreset.optionalIntegrations) {
    integrations[provider] = { status: "not_configured", envVars: ENV_VAR_NAMES_BY_PROVIDER[provider] || [] };
  }
  return integrations;
}

function deriveSecurity(sectorPreset, hasReinforcedPermissionModules) {
  const regulatedSector = hasReinforcedPermissionModules || HEALTH_LIKE_SECTORS.includes(sectorPreset.blueprintSector);
  const sensitiveDataCategories = regulatedSector ? ["health"] : [];
  return { regulatedSector, sensitiveDataCategories };
}

/**
 * Interpreta una descripción libre de negocio en modo 100% determinista y
 * local (sin IA real). Nunca lanza por una entrada "mala" (vacía, muy larga,
 * contradictoria): siempre devuelve un Business Intent válido, con las
 * incertidumbres visibles en assumptions/ambiguities/confidence.
 * @param {string} sourceText
 * @param {{seed?: string, answers?: Record<string, unknown>}} [options]
 * @returns {object} Business Intent (ver businessIntentSchema.js)
 */
export function interpretBusinessDescription(sourceText, options = {}) {
  const seed = options.seed || "default-seed";
  const normalized = normalizeInput(sourceText);
  const sectorMatch = matchSectorPreset(normalized.lowerText);
  const { modules, hasReinforcedPermissionModules } = resolveModules(normalized.lowerText, sectorMatch.preset);
  const automations = recommendAutomations(modules, sectorMatch.preset);
  const { roles, permissions } = buildRolesAndPermissions(sectorMatch.preset, modules);

  const rawAmbiguityAnalysis = detectAmbiguities({ normalized, sectorMatch, resolvedModules: modules });
  const { ambiguities, assumptions, recommendedQuestions } = options.answers
    ? applyAnswers(rawAmbiguityAnalysis, options.answers)
    : rawAmbiguityAnalysis;

  if (!PROFESSIONAL_COUNT_PATTERN.test(normalized.cleanedText) && !normalized.isEmpty && !recommendedQuestions.some((q) => q.includes("profesionales o miembros"))) {
    recommendedQuestions.push("¿Cuántos profesionales o miembros del equipo trabajarán en el negocio?");
  }

  const confidence = computeConfidence({ sectorMatch, resolvedModules: modules, ambiguities, lowerText: normalized.lowerText });

  const proposedName = deriveProposedName(normalized, sectorMatch);
  const branding = buildBrandingProposal({ business: { proposedName, sector: sectorMatch.blueprintSector }, sectorPreset: sectorMatch.preset });
  const landing = buildLandingProposal({ business: { proposedName }, sectorPreset: sectorMatch.preset });
  const pwa = buildPwaProposal({ business: { proposedName }, brandingProposal: branding });

  const { objectives, problemsToSolve } = deriveObjectivesAndProblems(sectorMatch.preset);
  const security = deriveSecurity(sectorMatch.preset, hasReinforcedPermissionModules);

  const requestedFeatures = modules.filter((m) => m.source === "explicit").map((m) => ({ id: m.id, raw: m.justification }));
  const inferredFeatures = modules.filter((m) => m.source === "inferred").map((m) => ({ id: m.id, raw: m.justification }));
  const rejectedFeatures = modules.filter((m) => m.status === "rejected").map((m) => ({ id: m.id, raw: m.justification }));

  const intent = {
    schemaVersion: BUSINESS_INTENT_SCHEMA_VERSION,
    requestId: deriveRequestId(seed, normalized.cleanedText),
    language: normalized.language,
    locale: normalized.language === "en" ? "en-US" : "es-ES",
    country: normalized.country,
    currency: normalized.currency,
    timezone: normalized.timezone,
    business: {
      proposedName,
      sector: sectorMatch.blueprintSector,
      locations: normalized.detectedCity ? [{ city: titleCase(normalized.detectedCity), country: normalized.country }] : [],
      channels: normalized.channels.length > 0 ? normalized.channels : ["web"],
    },
    objectives,
    problemsToSolve,
    actors: [...sectorMatch.preset.actors],
    processes: [...sectorMatch.preset.processes],
    entities: [...sectorMatch.preset.entities],
    requestedFeatures,
    inferredFeatures,
    rejectedFeatures,
    modules,
    roles,
    permissions,
    automations: automations.map((a) => ({ id: a.id, capability: a.capability, trigger: a.trigger })),
    integrations: deriveIntegrations(sectorMatch.preset),
    branding,
    landing,
    pwa,
    analytics: { enabled: false, note: "sin proveedor real conectado en este paso" },
    security,
    complianceNotes: [...sectorMatch.preset.risks],
    nonFunctionalRequirements: ["disponible en móvil, tablet y escritorio (PWA)"],
    assumptions,
    ambiguities,
    recommendedQuestions,
    confidence,
    sourceText: normalized.originalText,
    normalizedSummary: `${sectorMatch.preset.label}${normalized.detectedCity ? ` en ${titleCase(normalized.detectedCity)}` : ""} (${normalized.country}) — ${modules.filter((m) => m.status === "enabled").length} módulo(s) habilitado(s).`,
    generationMetadata: {
      generatedBy: "nl-builder:deterministic-v1",
      seed,
      sourceLanguageDetected: normalized.language,
      truncatedInput: normalized.truncated,
      matchedSectorKeywords: sectorMatch.matchedKeywords,
    },
  };

  const { valid, errors } = validateBusinessIntent(intent);
  if (!valid) {
    throw new Error(`Bug interno de intentExtractor: el Business Intent generado no es válido:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  }

  return intent;
}
