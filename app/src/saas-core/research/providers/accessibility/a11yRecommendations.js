// Paso 17 · Fase 7 — Recomendaciones de accesibilidad basadas
// EXCLUSIVAMENTE en los hallazgos de a11yAnalyzer.js. Una recomendación
// por regla (`finding.id`) — deduplicada entre páginas del mismo lote.
// Nunca afirma certificación ni cumplimiento legal automático: cada
// recomendación de severidad "manual_review" se presenta como una
// revisión pendiente, no como un hallazgo confirmado.

export const RECOMMENDATION_SEVERITIES = Object.freeze(["critical", "high", "medium", "low", "opportunity", "manual_review"]);

const EFFORT_BY_RULE_PREFIX = Object.freeze({
  "a11y.document.lang": "low",
  "a11y.document.title": "low",
  "a11y.document.duplicateIds": "medium",
  "a11y.headings.": "medium",
  "a11y.media.imagesMissingAlt": "medium",
  "a11y.media.svgWithoutLabel": "low",
  "a11y.linksButtons.emptyLinks": "low",
  "a11y.linksButtons.genericLinkText": "medium",
  "a11y.linksButtons.buttonsWithoutName": "low",
  "a11y.forms.inputsWithoutLabel": "medium",
  "a11y.forms.placeholderAsLabel": "medium",
  "a11y.aria.": "medium",
  "a11y.tables.": "medium",
  "a11y.keyboard.positiveTabindex": "medium",
  "a11y.keyboard.focusIndicatorRemoved": "high",
  "a11y.contrast.pair": "high",
});

function estimateEffort(ruleId) {
  for (const [prefix, effort] of Object.entries(EFFORT_BY_RULE_PREFIX)) {
    if (ruleId.startsWith(prefix)) return effort;
  }
  return "medium";
}

const SEVERITY_TO_URGENCY = Object.freeze({ critical: "inmediata", high: "alta", medium: "media", low: "baja", opportunity: "oportunista", manual_review: "revisión manual pendiente" });

function isActionable(finding) {
  if (finding.checkType === "manual") return true; // siempre se recomienda como revisión pendiente
  if (finding.polarity === "positive") return false;
  return finding.polarity === "negative" || finding.severity === "opportunity";
}

/**
 * @param {object[]} findings - de a11yAnalyzer.js
 * @param {{profileId?: string|null}} context
 */
export function buildA11yRecommendations(findings, { profileId = null } = {}) {
  const byRule = new Map();
  for (const finding of findings) {
    if (!isActionable(finding)) continue;
    const key = finding.id;
    const bucket = byRule.get(key) ?? { ruleId: finding.id, category: finding.category, severity: finding.checkType === "manual" ? "manual_review" : finding.severity, checkType: finding.checkType, rule: finding.rule, wcag: finding.wcag, urls: [], confidenceSum: 0, count: 0, sampleTitle: finding.title };
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
    checkType: bucket.checkType,
    requiresManualReview: bucket.checkType === "manual",
    confidence: Math.round((bucket.confidenceSum / bucket.count) * 100) / 100,
    affectedUrls: [...new Set(bucket.urls)],
    acceptanceCriteria: bucket.checkType === "manual" ? `Revisión manual documentada por una persona (idealmente con tecnología de asistencia real) para la regla "${bucket.ruleId}".` : `La regla "${bucket.ruleId}" deja de reportarse en una nueva ejecución de accessibilityProvider sobre las mismas URLs.`,
    wcagCriterion: bucket.wcag,
    explanation: bucket.rule,
    provenance: `accessibilityProvider:${bucket.ruleId}`,
    profileId,
  }));

  const severityRank = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s, i) => [s, i]));
  recommendations.sort((a, b) => severityRank[a.severity] - severityRank[b.severity] || b.confidence - a.confidence || a.id.localeCompare(b.id));

  return recommendations;
}

export function groupA11yRecommendationsBySeverity(recommendations) {
  const groups = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s) => [s, []]));
  for (const r of recommendations) groups[r.severity].push(r);
  return groups;
}
