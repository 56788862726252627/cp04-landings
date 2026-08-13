// Paso 20 · Fase 2/4 — `CommercialAssessment`: normaliza la información
// de negocio + puntuaciones opcionales (propias o de una auditoría real
// del motor de investigación, Pasos 12-18) en una forma estable que
// consume `commercialPanel.js`/`proposalGenerator.js`.
//
// Deliberadamente DESACOPLADO de `auditOrchestrator.js`: acepta
// `auditScores` en la MISMA forma que `result.scores.categories` de una
// auditoría real (`{[categoryId]: {score, coverage, ...}}`), pero
// también funciona con puntuaciones manuales o sin ninguna puntuación —
// nunca asume que existe una auditoría previa.

import { getCommercialSectorProfile } from "./commercialSectorProfiles.js";

function normalizeCategoryScores(rawScores) {
  if (!rawScores || typeof rawScores !== "object") return {};
  const normalized = {};
  for (const [categoryId, entry] of Object.entries(rawScores)) {
    if (!entry || typeof entry !== "object") continue;
    normalized[categoryId] = { score: typeof entry.score === "number" ? entry.score : null, coverage: typeof entry.coverage === "number" ? entry.coverage : null };
  }
  return normalized;
}

function computeOverallScore(categoryScores) {
  const scored = Object.values(categoryScores).filter((c) => c.score !== null);
  if (scored.length === 0) return { score: null, coverage: 0, categoriesEvaluated: 0, categoriesTotal: Object.keys(categoryScores).length };
  const average = scored.reduce((sum, c) => sum + c.score, 0) / scored.length;
  return { score: Math.round(average), coverage: Math.round((scored.length / Object.keys(categoryScores).length) * 100) / 100, categoriesEvaluated: scored.length, categoriesTotal: Object.keys(categoryScores).length };
}

function normalizeList(list, { requiredFields = ["title"] } = {}) {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item) => item && typeof item === "object" && requiredFields.every((f) => typeof item[f] === "string" && item[f].trim().length > 0))
    .map((item) => ({ ...item }));
}

/**
 * @param {object} input
 * @param {string|null} input.profileId
 * @param {{name?: string, sector?: string, size?: string}} input.business - datos del cliente; NUNCA se inventan si faltan
 * @param {object} [input.auditScores] - `{[categoryId]: {score, coverage}}`, opcional
 * @param {Array} [input.risks] - `{title, severity, evidence?}`
 * @param {Array} [input.opportunities] - `{title, impact?, evidence?}`
 * @param {Array} [input.recommendations] - `{title, priority?, explanation?}`
 */
export function buildCommercialAssessment(input = {}) {
  const profile = getCommercialSectorProfile(input.profileId);
  const business = {
    name: typeof input.business?.name === "string" && input.business.name.trim().length > 0 ? input.business.name.trim() : null,
    sector: typeof input.business?.sector === "string" ? input.business.sector : null,
    size: typeof input.business?.size === "string" ? input.business.size : null,
  };
  const businessComplete = business.name !== null;

  const categoryScores = normalizeCategoryScores(input.auditScores);
  const overall = computeOverallScore(categoryScores);
  const hasScores = Object.keys(categoryScores).length > 0;

  const risks = normalizeList(input.risks, { requiredFields: ["title", "severity"] });
  const opportunities = normalizeList(input.opportunities, { requiredFields: ["title"] });
  const recommendations = normalizeList(input.recommendations, { requiredFields: ["title"] });

  return Object.freeze({
    profileId: profile.profileId,
    profileLabel: profile.label,
    business: Object.freeze(business),
    businessComplete,
    scores: Object.freeze({ overall, categories: Object.freeze(categoryScores), hasScores, source: hasScores ? "provided" : "not_available" }),
    risks: Object.freeze(risks),
    opportunities: Object.freeze(opportunities),
    recommendations: Object.freeze(recommendations),
    missingData: Object.freeze([...(businessComplete ? [] : ["business.name"]), ...(hasScores ? [] : ["auditScores"])]),
  });
}
