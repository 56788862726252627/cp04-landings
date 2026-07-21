// Paso 12 · Fase 14 — Enriquecimiento del Business Intent (Paso 11).
//
// NUNCA sobrescribe silenciosamente: `proposeIntentEnrichment` es puro
// (solo calcula un diff propuesto); aplicar el enriquecimiento (crear un
// archivo nuevo versionado) es responsabilidad del CLI
// (research-enrich-intent.mjs), nunca de esta función.

import { validateBusinessIntent } from "../nl-builder/businessIntentSchema.js";

function uniqueBy(list, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/**
 * Calcula una propuesta de enriquecimiento (sin aplicarla) a partir de un
 * Business Intent existente y el resultado de una auditoría de
 * investigación. Determinista.
 * @param {object} intent - Business Intent válido (Paso 11)
 * @param {{recommendations: object[], dimensionResults: object, sectorPresetId: string}} auditResult
 */
export function proposeIntentEnrichment(intent, auditResult) {
  const existingModuleIds = new Set((intent.modules ?? []).map((m) => m.id));
  const existingAutomationIds = new Set((intent.automations ?? []).map((a) => (typeof a === "string" ? a : a.id)));
  const existingQuestions = new Set(intent.recommendedQuestions ?? []);

  const additions = { modules: [], automations: [], recommendedQuestions: [], assumptions: [] };
  const conflicts = [];
  const preserved = [];

  for (const rec of auditResult.recommendations ?? []) {
    if (rec.moduleMapping && !existingModuleIds.has(rec.moduleMapping)) {
      additions.modules.push({ id: rec.moduleMapping, source: "recommended", status: "suggested", confidence: rec.confidence, dependsOn: [] });
    } else if (rec.moduleMapping) {
      preserved.push(`modules: "${rec.moduleMapping}" ya presente en el intent, no se modifica`);
    }
  }

  for (const automation of auditResult.automations ?? []) {
    if (!existingAutomationIds.has(automation.id)) additions.automations.push(automation.id);
    else preserved.push(`automations: "${automation.id}" ya presente en el intent, no se modifica`);
  }

  for (const dimensionId of Object.keys(auditResult.dimensionResults ?? {})) {
    const result = auditResult.dimensionResults[dimensionId];
    if (result.status === "unknown") {
      const question = `¿Puedes aportar más información sobre "${result.label}"? La investigación no encontró evidencia suficiente.`;
      if (!existingQuestions.has(question)) additions.recommendedQuestions.push(question);
    }
  }

  additions.modules = uniqueBy(additions.modules, (m) => m.id);
  additions.automations = [...new Set(additions.automations)];
  additions.recommendedQuestions = [...new Set(additions.recommendedQuestions)];

  const proposedIntent = {
    ...intent,
    modules: [...(intent.modules ?? []), ...additions.modules],
    automations: [...(intent.automations ?? []), ...additions.automations],
    recommendedQuestions: [...(intent.recommendedQuestions ?? []), ...additions.recommendedQuestions],
    generationMetadata: {
      ...(intent.generationMetadata ?? {}),
      enrichedFromAudit: true,
      enrichmentSource: "research-audit",
      sectorPresetId: auditResult.sectorPresetId,
    },
  };

  const { valid, errors } = validateBusinessIntent(proposedIntent);

  return Object.freeze({
    additions: Object.freeze({
      modules: Object.freeze(additions.modules),
      automations: Object.freeze(additions.automations),
      recommendedQuestions: Object.freeze(additions.recommendedQuestions),
      assumptions: Object.freeze(additions.assumptions),
    }),
    conflicts: Object.freeze(conflicts),
    preserved: Object.freeze(preserved),
    diff: Object.freeze({
      modulesAdded: additions.modules.length,
      automationsAdded: additions.automations.length,
      recommendedQuestionsAdded: additions.recommendedQuestions.length,
    }),
    proposedIntent,
    validation: Object.freeze({ valid, errors }),
  });
}

/**
 * "Aplica" un enriquecimiento devolviendo el nuevo intent PROPUESTO
 * (ya validado en proposeIntentEnrichment). No escribe a disco: eso lo
 * decide el CLI, que debe escribir a un archivo NUEVO, preservando el
 * original.
 */
export function applyIntentEnrichment(proposal) {
  if (!proposal.validation.valid) {
    throw new Error(`No se puede aplicar un enriquecimiento inválido:\n${proposal.validation.errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  }
  return proposal.proposedIntent;
}
