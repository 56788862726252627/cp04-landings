// Paso 20 · Fase 4 — `ImplementationRoadmap`: ordena los módulos
// prioritarios del perfil sectorial + los bloqueos reales de
// integraciones (Fase 7) en un plan de implantación con calendario
// estimado. Determinista — nunca dos ejecuciones con el mismo input
// producen roadmaps distintos.

import { getCommercialSectorProfile } from "./commercialSectorProfiles.js";

const WEEKS_PER_MODULE = 1;

/**
 * @param {object} params
 * @param {string|null} params.profileId
 * @param {ReturnType<import("./integrationReadiness.js").computeIntegrationReadiness>|null} params.integrationsReadiness
 */
export function buildImplementationRoadmap({ profileId = null, integrationsReadiness = null } = {}) {
  const profile = getCommercialSectorProfile(profileId);

  const moduleSteps = profile.priorityModules.map((moduleName, index) => ({
    order: index + 1,
    type: "module",
    title: `Implantar: ${moduleName}`,
    estimatedWeeks: WEEKS_PER_MODULE,
    dependsOn: index === 0 ? [] : [index],
  }));

  let nextOrder = moduleSteps.length + 1;
  const integrationSteps = [];
  if (integrationsReadiness) {
    for (const integration of Object.values(integrationsReadiness.integrations)) {
      if (integration.blockedBy) {
        integrationSteps.push({ order: nextOrder++, type: "integration_blocker", title: `Resolver bloqueo de "${integration.label}"`, detail: integration.blockedBy, nextSteps: [...integration.nextSteps], estimatedWeeks: null });
      }
    }
  }

  const totalEstimatedWeeks = moduleSteps.reduce((sum, s) => sum + (s.estimatedWeeks ?? 0), 0);

  return Object.freeze({
    profileId: profile.profileId,
    steps: Object.freeze([...moduleSteps, ...integrationSteps]),
    totalEstimatedWeeks,
    disclaimer: "Calendario estimado, no comprometido — cada bloqueo de integración depende de terceros (credenciales/cuotas/contratación) fuera del control de este roadmap.",
  });
}
