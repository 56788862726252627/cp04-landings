// Paso 18 · Fase 7 — Recomendaciones de rendimiento basadas
// EXCLUSIVAMENTE en los hallazgos de perfAnalyzer.js. Una recomendación
// por regla (`finding.id`) — deduplicada entre páginas del mismo lote.
// Nunca promete una mejora concreta de Core Web Vitals ni afirma que
// sustituye a Lighthouse o a una prueba de navegador real — cada
// recomendación de severidad "browser_test_required" se presenta como
// una prueba pendiente, no como un hallazgo confirmado.

export const RECOMMENDATION_SEVERITIES = Object.freeze(["critical", "high", "medium", "low", "opportunity", "not_measured", "browser_test_required"]);

const EFFORT_BY_RULE_PREFIX = Object.freeze({
  "perf.html.size": "high",
  "perf.javascript.blocking": "medium",
  "perf.javascript.duplicated": "low",
  "perf.css.blocking": "medium",
  "perf.css.duplicated": "low",
  "perf.images.missingDimensions": "medium",
  "perf.images.duplicated": "low",
  "perf.resources.duplicated": "low",
  "perf.resources.renderBlocking": "medium",
  "perf.mobile.viewport": "low",
  "perf.caching.cacheControl": "medium",
  "perf.response.https": "high",
});

function estimateEffort(ruleId) {
  for (const [prefix, effort] of Object.entries(EFFORT_BY_RULE_PREFIX)) {
    if (ruleId.startsWith(prefix)) return effort;
  }
  return "medium";
}

const SEVERITY_TO_URGENCY = Object.freeze({ critical: "inmediata", high: "alta", medium: "media", low: "baja", opportunity: "oportunista", not_measured: "pendiente de medición", browser_test_required: "requiere prueba de navegador" });

// Qué métrica debería volver a medirse tras aplicar la recomendación (Fase 7: "indicación de qué métrica debe volver a medirse").
const REMEASURE_METRIC_BY_RULE_PREFIX = Object.freeze({
  "perf.html.size": "html.sizeBytes",
  "perf.javascript.blocking": "javascript.blockingCount",
  "perf.css.blocking": "css.blockingCount",
  "perf.images.missingDimensions": "images.missingDimensionsCount",
  "perf.response": "response.timeToHeadersMs",
  "perf.caching": "response.cacheControl",
  "perf.resources": "resources.declaredCount",
});

function resolveRemeasureMetric(ruleId) {
  for (const [prefix, metric] of Object.entries(REMEASURE_METRIC_BY_RULE_PREFIX)) {
    if (ruleId.startsWith(prefix)) return metric;
  }
  return null;
}

function isActionable(finding) {
  if (finding.severity === "browser_test_required") return true; // siempre se recomienda como prueba pendiente
  if (finding.severity === "not_measured") return false; // dato no medido no es, por sí solo, una recomendación accionable
  if (finding.polarity === "positive") return false;
  return finding.polarity === "negative" || finding.severity === "opportunity";
}

/**
 * @param {object[]} findings - de perfAnalyzer.js
 * @param {{profileId?: string|null}} context
 */
export function buildPerfRecommendations(findings, { profileId = null } = {}) {
  const byRule = new Map();
  for (const finding of findings) {
    if (!isActionable(finding)) continue;
    const key = finding.id;
    const bucket = byRule.get(key) ?? { ruleId: finding.id, category: finding.category, severity: finding.severity, metric: finding.metric, rule: finding.rule, urls: [], confidenceSum: 0, count: 0, sampleTitle: finding.title };
    bucket.urls.push(finding.url);
    bucket.confidenceSum += finding.confidence;
    bucket.count += 1;
    byRule.set(key, bucket);
  }

  const recommendations = [...byRule.values()].map((bucket) => ({
    id: `reco.${bucket.ruleId}`,
    title: bucket.sampleTitle,
    category: bucket.category,
    severity: bucket.severity,
    urgency: SEVERITY_TO_URGENCY[bucket.severity],
    effort: estimateEffort(bucket.ruleId),
    confidence: Math.round((bucket.confidenceSum / bucket.count) * 100) / 100,
    affectedUrls: [...new Set(bucket.urls)],
    acceptanceCriteria: bucket.severity === "browser_test_required" ? `Prueba con navegador real documentada para la regla "${bucket.ruleId}" (esta herramienta no la automatiza).` : `La regla "${bucket.ruleId}" deja de reportarse (o mejora de severidad) en una nueva ejecución de performanceProvider sobre las mismas URLs.`,
    remeasureMetric: resolveRemeasureMetric(bucket.ruleId),
    explanation: bucket.rule,
    provenance: `performanceProvider:${bucket.ruleId}`,
    profileId,
  }));

  const severityRank = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s, i) => [s, i]));
  recommendations.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.confidence - a.confidence || a.id.localeCompare(b.id));

  return recommendations;
}

export function groupPerfRecommendationsBySeverity(recommendations) {
  const groups = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s) => [s, []]));
  for (const r of recommendations) groups[r.severity].push(r);
  return groups;
}
