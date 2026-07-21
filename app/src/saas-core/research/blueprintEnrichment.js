// Paso 12 · Fase 14 — Enriquecimiento del Business Blueprint (Paso 10).
//
// Mismo principio que intentEnrichment.js: nunca sobrescribe en
// silencio. `blueprint.modules` aquí es un array de ids (a diferencia del
// Business Intent, donde cada módulo es un objeto con metadata) — ver
// businessBlueprintSchema.js.

import { validateBusinessBlueprint } from "../factory/businessBlueprintSchema.js";

/**
 * Calcula una propuesta de enriquecimiento del Business Blueprint a
 * partir del resultado de una auditoría de investigación. Determinista.
 * @param {object} blueprint - Business Blueprint válido (Paso 10)
 * @param {{recommendations: object[]}} auditResult
 */
export function proposeBlueprintEnrichment(blueprint, auditResult) {
  const existingModules = new Set(blueprint.modules ?? []);
  const modulesToAdd = [];
  const conflicts = [];
  const preserved = [];

  for (const rec of auditResult.recommendations ?? []) {
    if (!rec.moduleMapping) continue;
    if (existingModules.has(rec.moduleMapping)) {
      preserved.push(`modules: "${rec.moduleMapping}" ya presente en el blueprint, no se modifica`);
      continue;
    }
    modulesToAdd.push(rec.moduleMapping);
  }

  const uniqueModulesToAdd = [...new Set(modulesToAdd)];
  const proposedBlueprint = {
    ...blueprint,
    modules: [...(blueprint.modules ?? []), ...uniqueModulesToAdd],
    generationMeta: {
      ...(blueprint.generationMeta ?? {}),
      enrichedFromAudit: true,
      enrichmentSource: "research-audit",
    },
  };

  const { valid, errors } = validateBusinessBlueprint(proposedBlueprint);

  return Object.freeze({
    additions: Object.freeze({ modules: Object.freeze(uniqueModulesToAdd) }),
    conflicts: Object.freeze(conflicts),
    preserved: Object.freeze(preserved),
    diff: Object.freeze({ modulesAdded: uniqueModulesToAdd.length }),
    proposedBlueprint,
    validation: Object.freeze({ valid, errors }),
  });
}

export function applyBlueprintEnrichment(proposal) {
  if (!proposal.validation.valid) {
    throw new Error(`No se puede aplicar un enriquecimiento inválido:\n${proposal.validation.errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  }
  return proposal.proposedBlueprint;
}
