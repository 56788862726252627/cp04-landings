// Paso 12 · Fase 12 — Recomendaciones y priorización.
//
// Cada recomendación nace de una dimensión con score bajo o ausente (ver
// dimensionRegistry.js) y SIEMPRE enlaza a evidenceIds concretos (o queda
// vacía si la dimensión es "unknown": no se recomienda nada sin base).
// Fórmula explicable: priority = (impact × confidence × urgency) ÷ effort.

const IMPLEMENTATION_KINDS = Object.freeze(["contenido", "diseño", "frontend", "backend", "módulo SaaS", "Make", "worker", "serverless", "proceso manual", "integración externa", "formación", "revisión profesional"]);

// Esfuerzo por defecto (1=trivial, 5=muy alto) y tipo de implementación sugerido por dimensión.
// Solo cubre las dimensiones con una recomendación típica clara; el resto usa el default declarado abajo.
const DIMENSION_PROFILES = Object.freeze({
  mobileExperience: { effort: 3, implementation: "frontend", owner: "frontend" },
  pwaApp: { effort: 3, implementation: "módulo SaaS", owner: "frontend" },
  seoTechnical: { effort: 2, implementation: "contenido", owner: "marketing" },
  seoContent: { effort: 2, implementation: "contenido", owner: "marketing" },
  seoLocal: { effort: 2, implementation: "contenido", owner: "marketing" },
  accessibility: { effort: 3, implementation: "frontend", owner: "frontend" },
  bookingCapability: { effort: 4, implementation: "módulo SaaS", owner: "producto" },
  contactInfo: { effort: 1, implementation: "contenido", owner: "marketing" },
  socialMediaPresence: { effort: 2, implementation: "proceso manual", owner: "marketing" },
  observableSecurity: { effort: 2, implementation: "backend", owner: "backend" },
  visiblePrivacy: { effort: 1, implementation: "contenido", owner: "legal" },
  visibleCompliance: { effort: 1, implementation: "contenido", owner: "legal" },
  analyticsDeclared: { effort: 2, implementation: "frontend", owner: "marketing" },
  observableAutomation: { effort: 3, implementation: "Make", owner: "operaciones" },
  ctaQuality: { effort: 1, implementation: "diseño", owner: "marketing" },
  navigation: { effort: 2, implementation: "frontend", owner: "frontend" },
  visualConsistency: { effort: 3, implementation: "diseño", owner: "diseño" },
  branding: { effort: 3, implementation: "diseño", owner: "diseño" },
  publicReputation: { effort: 3, implementation: "proceso manual", owner: "atención al cliente" },
  directoryPresence: { effort: 1, implementation: "proceso manual", owner: "marketing" },
  performance: { effort: 3, implementation: "backend", owner: "backend" },
  friction: { effort: 2, implementation: "frontend", owner: "producto" },
  serviceClarity: { effort: 2, implementation: "contenido", owner: "marketing" },
});

const DEFAULT_PROFILE = Object.freeze({ effort: 3, implementation: "proceso manual", owner: "operaciones" });

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Construye una recomendación a partir de un resultado de dimensión.
 * Devuelve null si la dimensión no amerita recomendación (score alto o
 * desconocida sin evidencia — no se recomienda sobre la nada).
 */
export function buildRecommendationFromDimension(dimensionResult, { priorityDimensionIds = [], mustNotAutoInfer = [] } = {}) {
  if (dimensionResult.score === null || dimensionResult.score >= 70) return null;

  const profile = DIMENSION_PROFILES[dimensionResult.dimensionId] ?? DEFAULT_PROFILE;
  const impact = round2((100 - dimensionResult.score) / 100);
  const urgency = priorityDimensionIds.includes(dimensionResult.dimensionId) ? 0.9 : 0.5;
  const confidence = dimensionResult.confidence;
  const effort = profile.effort;
  const priority = round2((impact * confidence * urgency) / effort);
  const requiresProfessionalReview = mustNotAutoInfer.length > 0 && ["bookingCapability", "serviceClarity", "visibleCompliance"].includes(dimensionResult.dimensionId);

  return Object.freeze({
    recommendationId: `rec_${dimensionResult.dimensionId}`,
    title: `Mejorar: ${dimensionResult.label}`,
    category: dimensionResult.dimensionId,
    problem: dimensionResult.opportunities[0] ?? `"${dimensionResult.label}" obtiene un score bajo (${dimensionResult.score}/100).`,
    evidenceIds: dimensionResult.evidenceIds,
    impact,
    effort,
    urgency,
    confidence,
    priority,
    dependencies: Object.freeze([]),
    risks: dimensionResult.risks,
    quickWin: effort <= 2 && impact >= 0.4,
    proposedImplementation: requiresProfessionalReview ? "revisión profesional" : profile.implementation,
    suggestedOwner: profile.owner,
    kpi: `Score de "${dimensionResult.label}" > 70/100 en la próxima auditoría`,
    acceptanceCriteria: [`El score de ${dimensionResult.dimensionId} alcanza ≥70 en una reauditoría`, "Sin regresión en otras dimensiones relacionadas"],
    automationCandidate: profile.implementation === "Make" || profile.implementation === "backend" || profile.implementation === "worker",
    businessIntentMapping: dimensionResult.dimensionId,
    blueprintMapping: profile.implementation === "módulo SaaS" ? "modules" : profile.implementation === "diseño" ? "branding" : profile.implementation === "contenido" ? "landing" : null,
    moduleMapping: dimensionResult.dimensionId === "bookingCapability" ? "citas" : null,
  });
}

/** Construye todas las recomendaciones y las ordena por prioridad descendente (determinista: empate = orden alfabético de id). */
export function buildRecommendations(dimensionResults, { priorityDimensionIds = [], mustNotAutoInfer = [] } = {}) {
  const recs = Object.values(dimensionResults)
    .map((d) => buildRecommendationFromDimension(d, { priorityDimensionIds, mustNotAutoInfer }))
    .filter(Boolean);
  return recs.sort((a, b) => b.priority - a.priority || a.recommendationId.localeCompare(b.recommendationId));
}

/** Backlog = mismas recomendaciones, ya ordenadas por prioridad (alias explícito para claridad de reporting). */
export function buildBacklog(recommendations) {
  return [...recommendations];
}

/** Matriz impacto/esfuerzo en 4 cuadrantes deterministas. */
export function buildImpactEffortMatrix(recommendations) {
  const matrix = { quickWins: [], majorProjects: [], fillIns: [], questionable: [] };
  for (const rec of recommendations) {
    const highImpact = rec.impact >= 0.4;
    const lowEffort = rec.effort <= 2;
    if (highImpact && lowEffort) matrix.quickWins.push(rec.recommendationId);
    else if (highImpact && !lowEffort) matrix.majorProjects.push(rec.recommendationId);
    else if (!highImpact && lowEffort) matrix.fillIns.push(rec.recommendationId);
    else matrix.questionable.push(rec.recommendationId);
  }
  return matrix;
}

export { IMPLEMENTATION_KINDS };
