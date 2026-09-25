import { test } from "node:test";
import assert from "node:assert/strict";

import { buildPerfRecommendations, groupPerfRecommendationsBySeverity, RECOMMENDATION_SEVERITIES } from "./perfRecommendations.js";
import { analyzePerformanceForPage } from "./perfAnalyzer.js";

function badPage(url = "http://x.example/") {
  return {
    url,
    httpStatus: 200,
    body: '<html><head><title>t</title><script src="a.js"></script><link rel="stylesheet" href="b.css"></head><body><img src="c.jpg"></body></html>',
    headers: {},
    timing: { timeToHeadersMs: 50, totalMs: 100 },
    httpVersion: "1.1",
    redirectChain: [],
    byteSize: 400,
  };
}

test("genera recomendaciones críticas/altas para problemas reales", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  const httpsReco = recos.find((r) => r.id === "reco.perf.response.https");
  assert.ok(httpsReco);
  assert.equal(httpsReco.severity, "high");
  assert.ok(httpsReco.acceptanceCriteria.length > 0);
  assert.ok(httpsReco.provenance.startsWith("performanceProvider:"));
});

test("recomendaciones 'browser_test_required' se presentan como prueba pendiente, nunca como hallazgo confirmado", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  const browserTest = recos.filter((r) => r.severity === "browser_test_required");
  assert.ok(browserTest.length > 0);
  for (const r of browserTest) {
    assert.match(r.acceptanceCriteria, /prueba con navegador real/i);
  }
});

test("recomendaciones 'not_measured' no se generan como accionables por sí solas (solo browser_test_required lo es)", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  assert.ok(!recos.some((r) => r.severity === "not_measured"));
});

test("ninguna recomendación promete una mejora concreta de Core Web Vitals ni afirma sustituir a Lighthouse", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  for (const r of recos) {
    assert.doesNotMatch(`${r.title} ${r.explanation} ${r.acceptanceCriteria}`, /mejorará (tu|el) LCP|garantiz|sustituye a Lighthouse|reemplaza PageSpeed/i);
  }
});

test("cada recomendación indica qué métrica debe volver a medirse cuando aplica", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  const httpsReco = recos.find((r) => r.id === "reco.perf.response.https");
  assert.equal(httpsReco.remeasureMetric, "response.timeToHeadersMs");
});

test("recomendaciones ordenadas por severidad (crítico/alto primero)", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  const severityRank = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s, i) => [s, i]));
  for (let i = 1; i < recos.length; i++) assert.ok(severityRank[recos[i - 1].severity] <= severityRank[recos[i].severity]);
});

test("la misma regla en varias páginas del lote se deduplica en una sola recomendación", () => {
  const findings = [...analyzePerformanceForPage(badPage("http://x.example/a")), ...analyzePerformanceForPage(badPage("http://x.example/b"))];
  const recos = buildPerfRecommendations(findings);
  const httpsRecos = recos.filter((r) => r.id === "reco.perf.response.https");
  assert.equal(httpsRecos.length, 1);
  assert.deepEqual(httpsRecos[0].affectedUrls.sort(), ["http://x.example/a", "http://x.example/b"]);
});

test("groupPerfRecommendationsBySeverity agrupa en los 7 baldes del enunciado", () => {
  const recos = buildPerfRecommendations(analyzePerformanceForPage(badPage()));
  const grouped = groupPerfRecommendationsBySeverity(recos);
  for (const s of RECOMMENDATION_SEVERITIES) assert.ok(Array.isArray(grouped[s]));
  assert.ok(grouped.browser_test_required.length > 0);
});
