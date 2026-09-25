// Paso 16 · Fase 7 — Recomendaciones SEO basadas EXCLUSIVAMENTE en los
// hallazgos de seoAnalyzer.js (nunca en evidencia inventada). Una
// recomendación por regla (`finding.id`) — si varias URLs del mismo lote
// incurren en la misma regla, se deduplica en una sola recomendación con
// todas las URLs afectadas (nunca N recomendaciones idénticas).
//
// No promete resultados de posicionamiento: cada recomendación describe
// una ACCIÓN verificable ("añade X"), nunca un resultado ("subirás en
// Google").

export const RECOMMENDATION_SEVERITIES = Object.freeze(["critical", "high", "medium", "low", "opportunity", "not_evaluable"]);

// Coste de implementación estimado por regla — heurística editorial, no
// medida: sirve para priorizar, no es una promesa de tiempo real.
const EFFORT_BY_RULE_PREFIX = Object.freeze({
  "seo.metadata.": "low",
  "seo.indexation.metaRobots": "low",
  "seo.indexation.canonical": "low",
  "seo.structure.h1Count": "low",
  "seo.structure.emptyHeadings": "low",
  "seo.images.missingAlt": "medium",
  "seo.images.emptyAlt": "low",
  "seo.links.emptyHref": "low",
  "seo.links.insecureScheme": "medium",
  "seo.links.genericAnchorText": "medium",
  "seo.structuredData.": "medium",
  "seo.content.thinContent": "high",
  "seo.content.duplicateContent": "high",
  "seo.technical.https": "high",
});

function estimateEffort(ruleId) {
  for (const [prefix, effort] of Object.entries(EFFORT_BY_RULE_PREFIX)) {
    if (ruleId.startsWith(prefix)) return effort;
  }
  return "medium";
}

const SEVERITY_TO_URGENCY = Object.freeze({ critical: "inmediata", high: "alta", medium: "media", low: "baja", opportunity: "oportunista", not_evaluable: "no evaluable" });

/** Solo los findings que representan un problema (negativo) o una oportunidad explícita (ni positivo ni "not_evaluable") generan recomendación. */
function isActionable(finding) {
  if (finding.severity === "not_evaluable") return false;
  if (finding.polarity === "positive") return false;
  return finding.polarity === "negative" || finding.severity === "opportunity";
}

/**
 * @param {object[]} findings - de seoAnalyzer.js (analyzeSeoForPage/analyzeSeoForPages)
 * @param {{profileId?: string|null}} context
 */
export function buildSeoRecommendations(findings, { profileId = null } = {}) {
  const byRule = new Map();
  for (const finding of findings) {
    if (!isActionable(finding)) continue;
    const key = finding.id;
    const bucket = byRule.get(key) ?? { ruleId: finding.id, category: finding.category, dimension: finding.dimension, severity: finding.severity, rule: finding.rule, urls: [], confidenceSum: 0, count: 0, sampleTitle: finding.title };
    bucket.urls.push(finding.url);
    bucket.confidenceSum += finding.confidence;
    bucket.count += 1;
    // la severidad más alta observada entre URLs gana (nunca se suaviza)
    if (RECOMMENDATION_SEVERITIES.indexOf(finding.severity) < RECOMMENDATION_SEVERITIES.indexOf(bucket.severity)) bucket.severity = finding.severity;
    byRule.set(key, bucket);
  }

  const recommendations = [...byRule.values()].map((bucket) => ({
    id: `reco.${bucket.ruleId}`,
    title: bucket.sampleTitle,
    category: bucket.category,
    dimension: bucket.dimension,
    severity: bucket.severity,
    urgency: SEVERITY_TO_URGENCY[bucket.severity],
    effort: estimateEffort(bucket.ruleId),
    confidence: Math.round((bucket.confidenceSum / bucket.count) * 100) / 100,
    affectedUrls: [...new Set(bucket.urls)],
    acceptanceCriteria: `La regla "${bucket.ruleId}" deja de reportarse en una nueva ejecución de seoProvider sobre las mismas URLs.`,
    explanation: bucket.rule,
    provenance: `seoProvider:${bucket.ruleId}`,
    profileId,
  }));

  const severityRank = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s, i) => [s, i]));
  recommendations.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.confidence - a.confidence || a.id.localeCompare(b.id));

  return recommendations;
}

/** Agrupa por severidad para presentación (Fase 7: crítico/alto/medio/bajo/oportunidad/no evaluable). */
export function groupSeoRecommendationsBySeverity(recommendations) {
  const groups = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s) => [s, []]));
  for (const r of recommendations) groups[r.severity].push(r);
  return groups;
}
