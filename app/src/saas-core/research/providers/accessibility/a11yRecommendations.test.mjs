import { test } from "node:test";
import assert from "node:assert/strict";

import { buildA11yRecommendations, groupA11yRecommendationsBySeverity, RECOMMENDATION_SEVERITIES } from "./a11yRecommendations.js";
import { analyzeAccessibilityForPage } from "./a11yAnalyzer.js";

function badPage(url = "https://x.example/") {
  return { url, body: "<html><head></head><body><img src=\"a.jpg\"><input type=\"email\"><button></button></body></html>" };
}

test("genera recomendaciones críticas/altas para errores reales, con criterio WCAG cuando aplica", () => {
  const recos = buildA11yRecommendations(analyzeAccessibilityForPage(badPage()));
  const langReco = recos.find((r) => r.id === "reco.a11y.document.lang");
  assert.ok(langReco);
  assert.equal(langReco.severity, "critical");
  assert.equal(langReco.wcagCriterion.criterion, "3.1.1");
  assert.ok(langReco.acceptanceCriteria.length > 0);
});

test("las comprobaciones manuales generan recomendación de severidad 'manual_review', nunca 'critical'", () => {
  const recos = buildA11yRecommendations(analyzeAccessibilityForPage(badPage()));
  const manual = recos.filter((r) => r.checkType === "manual");
  assert.ok(manual.length > 0);
  for (const r of manual) {
    assert.equal(r.severity, "manual_review");
    assert.equal(r.requiresManualReview, true);
    assert.match(r.acceptanceCriteria, /revisión manual/i);
  }
});

test("ninguna recomendación afirma certificación o cumplimiento legal automático", () => {
  const recos = buildA11yRecommendations(analyzeAccessibilityForPage(badPage()));
  for (const r of recos) {
    assert.doesNotMatch(`${r.title} ${r.explanation} ${r.acceptanceCriteria}`, /certificaci[oó]n|cumplimiento legal garantizado|100% accesible|conforme wcag/i);
  }
});

test("recomendaciones ordenadas por severidad (crítico primero, manual_review al final)", () => {
  const recos = buildA11yRecommendations(analyzeAccessibilityForPage(badPage()));
  const severityRank = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s, i) => [s, i]));
  for (let i = 1; i < recos.length; i++) assert.ok(severityRank[recos[i - 1].severity] <= severityRank[recos[i].severity]);
});

test("la misma regla en varias páginas del lote se deduplica en una sola recomendación", () => {
  const findings = [...analyzeAccessibilityForPage(badPage("https://x.example/a")), ...analyzeAccessibilityForPage(badPage("https://x.example/b"))];
  const recos = buildA11yRecommendations(findings);
  const langRecos = recos.filter((r) => r.id === "reco.a11y.document.lang");
  assert.equal(langRecos.length, 1);
  assert.deepEqual(langRecos[0].affectedUrls.sort(), ["https://x.example/a", "https://x.example/b"]);
});

test("groupA11yRecommendationsBySeverity agrupa en los 6 baldes del enunciado", () => {
  const recos = buildA11yRecommendations(analyzeAccessibilityForPage(badPage()));
  const grouped = groupA11yRecommendationsBySeverity(recos);
  for (const s of RECOMMENDATION_SEVERITIES) assert.ok(Array.isArray(grouped[s]));
  assert.ok(grouped.critical.length > 0);
  assert.ok(grouped.manual_review.length > 0);
});

test("cada recomendación declara esfuerzo estimado y confianza numérica", () => {
  const recos = buildA11yRecommendations(analyzeAccessibilityForPage(badPage()));
  for (const r of recos) {
    assert.ok(["low", "medium", "high"].includes(r.effort));
    assert.ok(r.confidence >= 0 && r.confidence <= 1);
  }
});
