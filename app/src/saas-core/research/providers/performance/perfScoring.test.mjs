import { test } from "node:test";
import assert from "node:assert/strict";

import { computePerfScoreBreakdown, PERF_SCORE_GROUPS } from "./perfScoring.js";
import { analyzePerformanceForPage } from "./perfAnalyzer.js";
import { buildEvidenceFromPerfFindings } from "./perfEvidence.js";

function goodPage() {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    body: '<html><head><title>t</title><meta name="viewport" content="width=device-width"><script src="a.js" async></script><link rel="stylesheet" href="b.css" media="print"></head><body><img src="c.jpg" width="10" height="10" loading="lazy" srcset="c-2x.jpg 2x"></body></html>',
    headers: { "content-encoding": "gzip", "cache-control": "max-age=3600", etag: '"x"' },
    timing: { timeToHeadersMs: 80, totalMs: 150 },
    httpVersion: "2.0",
    redirectChain: [],
    byteSize: 500,
  };
}
function badPage() {
  return {
    url: "http://x.example/",
    httpStatus: 200,
    body: '<html><head><title>t</title><script src="a.js"></script><link rel="stylesheet" href="b.css"></head><body><img src="c.jpg"></body></html>',
    headers: {},
    timing: { timeToHeadersMs: 1200, totalMs: 3000 },
    httpVersion: "1.1",
    redirectChain: [],
    byteSize: 500,
  };
}
function evidenceFor(page, profileId = "generic") {
  return buildEvidenceFromPerfFindings(analyzePerformanceForPage(page, { profileId }), { profileId });
}

test("PERF_SCORE_GROUPS incluye exactamente los 11 grupos del enunciado (Fase 5)", () => {
  for (const g of ["response", "html", "resources", "images", "javascript", "css", "fonts", "caching", "compression", "thirdParty", "mobile"]) {
    assert.ok(PERF_SCORE_GROUPS.includes(g), `falta el grupo "${g}"`);
  }
  assert.equal(PERF_SCORE_GROUPS.length, 11);
});

test("una página de buen rendimiento produce scores mayoritariamente positivos", () => {
  const breakdown = computePerfScoreBreakdown(evidenceFor(goodPage()));
  assert.ok(breakdown.groups.response.score > 50, `response=${breakdown.groups.response.score}`);
  assert.ok(breakdown.groups.javascript.score > 50, `javascript=${breakdown.groups.javascript.score}`);
  assert.ok(breakdown.overall.score !== null);
});

test("una página con problemas de rendimiento produce scores bajos", () => {
  const breakdown = computePerfScoreBreakdown(evidenceFor(badPage()));
  assert.ok(breakdown.groups.javascript.score < 50, `javascript=${breakdown.groups.javascript.score}`);
  assert.ok(breakdown.groups.response.score < 50, `response=${breakdown.groups.response.score}`);
});

test("sin evidencia de un grupo, el score es null (nunca 0 inventado)", () => {
  const breakdown = computePerfScoreBreakdown([]);
  for (const group of PERF_SCORE_GROUPS) assert.equal(breakdown.groups[group].score, null);
  assert.equal(breakdown.overall.score, null);
});

test("compresión y terceros son grupos de scoring propios, independientes de su categoría de análisis", () => {
  const breakdown = computePerfScoreBreakdown(evidenceFor(goodPage()));
  assert.ok(breakdown.groups.compression.findingsCount > 0);
});

test("datos 'not_measured'/'unavailable' no se penalizan como fallo (reducen cobertura, no score)", () => {
  const breakdown = computePerfScoreBreakdown(evidenceFor(goodPage()));
  assert.ok(breakdown.groups.images.unmeasuredCount > 0, "el peso real de imágenes siempre es 'unavailable'");
  assert.ok(breakdown.groups.images.score !== null, "debe seguir habiendo score aunque un hallazgo no sea medible");
});

test("el desglose incluye un disclaimer explícito: no es Lighthouse/PageSpeed ni mide Core Web Vitals", () => {
  const breakdown = computePerfScoreBreakdown(evidenceFor(goodPage()));
  assert.match(breakdown.disclaimer, /no es una puntuación de Lighthouse/i);
  assert.match(breakdown.disclaimer, /Core Web Vitals/);
});

test("computePerfScoreBreakdown ignora evidencia que no proviene de performanceProvider", () => {
  const otherEvidence = [{ sourceType: "seo_analysis_derived", metadata: {}, relatedDimension: "seoTechnical", signal: { strength: 1, polarity: "positive" }, confidence: 1 }];
  assert.equal(computePerfScoreBreakdown(otherEvidence).overall.score, null);
});

test("es determinista: misma evidencia -> mismo desglose", () => {
  const ev = evidenceFor(goodPage());
  assert.deepEqual(computePerfScoreBreakdown(ev), computePerfScoreBreakdown(ev));
});
