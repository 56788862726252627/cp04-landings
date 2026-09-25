// Paso 12 · Fase 11 — Comparación de competidores (offline/mock).
//
// Compara al negocio auditado contra competidores proporcionados
// EXPLÍCITAMENTE mediante fixtures (nunca negocios reales inventados ni
// descubiertos por scraping). Reutiliza scoringEngine.js/dimensionRegistry
// para puntuar cada competidor con el mismo criterio que al sujeto.

import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { computeAllScores, SCORE_CATEGORIES } from "./scoringEngine.js";

/**
 * @param {{subjectScores: object, subjectEvidence: object[]}} subject
 * @param {{competitorId: string, evidence: object[]}[]} competitors - cada uno YA debe venir de un fixture explícito
 * @param {object} sectorPreset
 */
export function compareCompetitors(subject, competitors, sectorPreset = {}) {
  if (!Array.isArray(competitors) || competitors.length === 0) {
    return Object.freeze({
      table: Object.freeze([]),
      advantages: Object.freeze([]),
      weaknesses: Object.freeze([]),
      gaps: Object.freeze([]),
      differentiators: Object.freeze([]),
      coverageWarnings: Object.freeze(["No se proporcionaron competidores mediante fixtures: no se realiza ninguna comparación ni se inventa competencia."]),
    });
  }

  const rows = [{ id: "subject", label: "Negocio auditado", scores: subject.subjectScores }];
  for (const competitor of competitors) {
    const dimensionResults = evaluateAllDimensions(competitor.evidence);
    const scores = computeAllScores(dimensionResults, sectorPreset);
    rows.push({ id: competitor.competitorId, label: competitor.competitorId, scores });
  }

  const table = SCORE_CATEGORIES.map((category) => ({
    category,
    subject: rows[0].scores.categories[category]?.score ?? null,
    competitors: Object.fromEntries(rows.slice(1).map((r) => [r.id, r.scores.categories[category]?.score ?? null])),
  }));

  const advantages = [];
  const weaknesses = [];
  const gaps = [];
  for (const row of table) {
    if (row.subject === null) {
      gaps.push(`Sin datos propios para "${row.category}": no se puede comparar con seguridad.`);
      continue;
    }
    const competitorScores = Object.values(row.competitors).filter((s) => s !== null);
    if (competitorScores.length === 0) continue;
    const avgCompetitor = competitorScores.reduce((a, b) => a + b, 0) / competitorScores.length;
    if (row.subject - avgCompetitor >= 10) advantages.push(`"${row.category}": el negocio auditado supera la media de competidores (${row.subject} vs ${Math.round(avgCompetitor)}).`);
    else if (avgCompetitor - row.subject >= 10) weaknesses.push(`"${row.category}": el negocio auditado queda por debajo de la media de competidores (${row.subject} vs ${Math.round(avgCompetitor)}).`);
  }

  const differentiators = advantages.length > 0 ? advantages.slice(0, 3).map((a) => `Diferenciador potencial: ${a}`) : ["Sin diferenciadores claros detectados frente a los competidores proporcionados."];

  return Object.freeze({
    table: Object.freeze(table),
    advantages: Object.freeze(advantages),
    weaknesses: Object.freeze(weaknesses),
    gaps: Object.freeze(gaps),
    differentiators: Object.freeze(differentiators),
    coverageWarnings: Object.freeze(competitors.length < 2 ? ["Solo se proporcionó 1 competidor: la comparación tiene cobertura limitada."] : []),
  });
}
