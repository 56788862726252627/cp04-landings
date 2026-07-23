import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzePerformanceForPage, analyzePerformanceForPages, PERF_CATEGORIES, SEVERITIES, MEASUREMENT_TYPES } from "./perfAnalyzer.js";

function page(overrides = {}) {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    body: "<html><head><title>t</title></head><body></body></html>",
    headers: {},
    timing: { timeToHeadersMs: 100, totalMs: 200 },
    httpVersion: "1.1",
    redirectChain: [],
    byteSize: 200,
    ...overrides,
  };
}
function findById(findings, id) {
  return findings.find((f) => f.id === id);
}

test("todo finding declara categoría/severidad/status(measurementType) dentro de vocabularios cerrados, dimension='performance'", () => {
  const findings = analyzePerformanceForPage(page());
  for (const f of findings) {
    assert.ok(PERF_CATEGORIES.includes(f.category), `categoría inválida: ${f.category}`);
    assert.ok(SEVERITIES.includes(f.severity), `severidad inválida: ${f.severity}`);
    assert.ok(MEASUREMENT_TYPES.includes(f.status), `measurementType inválido: ${f.status}`);
    assert.equal(f.dimension, "performance");
  }
});

test("es determinista (mismo input -> mismos findings)", () => {
  const p = page();
  assert.equal(JSON.stringify(analyzePerformanceForPage(p)), JSON.stringify(analyzePerformanceForPage(p)));
});

test("1. HTML pequeño no dispara el umbral de 'excesivamente grande'", () => {
  const f = findById(analyzePerformanceForPage(page()), "perf.html.size");
  assert.equal(f.polarity, "positive");
});

test("2. HTML excesivamente grande dispara severidad alta", () => {
  const bigHtml = `<html><body>${"x".repeat(250_000)}</body></html>`;
  const f = findById(analyzePerformanceForPage(page({ body: bigHtml })), "perf.html.size");
  assert.equal(f.severity, "high");
  assert.equal(f.polarity, "negative");
});

test("3. scripts bloqueantes (sin async/defer en head) se detectan", () => {
  const p = page({ body: '<html><head><title>t</title><script src="a.js"></script></head><body></body></html>' });
  const f = findById(analyzePerformanceForPage(p), "perf.javascript.blocking");
  assert.equal(f.value, 1);
  assert.equal(f.severity, "high");
});

test("4. scripts async/defer NO se cuentan como bloqueantes", () => {
  const p = page({ body: '<html><head><title>t</title><script src="a.js" async></script><script src="b.js" defer></script></head><body></body></html>' });
  const f = findById(analyzePerformanceForPage(p), "perf.javascript.blocking");
  assert.equal(f.value, 0);
  assert.equal(f.polarity, "positive");
});

test("5. CSS bloqueante (link stylesheet en head sin media=print) se detecta", () => {
  const p = page({ body: '<html><head><title>t</title><link rel="stylesheet" href="a.css"></head><body></body></html>' });
  const f = findById(analyzePerformanceForPage(p), "perf.css.blocking");
  assert.equal(f.value, 1);
});

test("6. imágenes sin dimensiones se detectan como severidad alta", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><img src="a.jpg"></body></html>' });
  const f = findById(analyzePerformanceForPage(p), "perf.images.missingDimensions");
  assert.equal(f.severity, "high");
});

test("7. imágenes lazy se detectan y cuentan positivamente", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><img src="a.jpg" loading="lazy" width="10" height="10"></body></html>' });
  const findings = analyzePerformanceForPage(p);
  const lazy = findById(findings, "perf.images.lazyLoading");
  assert.equal(lazy.value, 1);
  const missingDim = findById(findings, "perf.images.missingDimensions");
  assert.equal(missingDim.value, 0);
});

test("8. fuentes externas se detectan y cuentan", () => {
  const p = page({ url: "https://mi-sitio.com/", body: '<html><head><title>t</title><link rel="preload" href="https://fonts.example.com/f.woff2" as="font"></head><body></body></html>' });
  const findings = analyzePerformanceForPage(p);
  const external = findById(findings, "perf.fonts.external");
  assert.ok(external);
  assert.equal(external.value, 1);
});

test("9. compresión presente (content-encoding) se observa", () => {
  const p = page({ headers: { "content-encoding": "gzip" } });
  const f = findById(analyzePerformanceForPage(p), "perf.response.compression");
  assert.equal(f.status, "observed");
  assert.equal(f.value, "gzip");
});

test("10. compresión ausente se marca 'not_measured' con la limitación de Accept-Encoding:identity explicada", () => {
  const f = findById(analyzePerformanceForPage(page({ headers: {} })), "perf.response.compression");
  assert.equal(f.status, "not_measured");
  assert.ok(f.limitations.length > 0);
});

test("11. cache-control correcto se observa positivamente", () => {
  const f = findById(analyzePerformanceForPage(page({ headers: { "cache-control": "max-age=3600" } })), "perf.caching.cacheControl");
  assert.equal(f.polarity, "positive");
  assert.equal(f.value, "max-age=3600");
});

test("12. caché ausente se marca como negativo, nunca oculto", () => {
  const f = findById(analyzePerformanceForPage(page({ headers: {} })), "perf.caching.cacheControl");
  assert.equal(f.polarity, "negative");
  assert.equal(f.value, null);
});

test("13. muchos dominios de terceros se detectan", () => {
  const scripts = Array.from({ length: 7 }, (_, i) => `<script src="https://cdn${i}.terceros.example/x.js"></script>`).join("");
  const p = page({ body: `<html><head><title>t</title>${scripts}</head><body></body></html>` });
  const f = findById(analyzePerformanceForPage(p), "perf.resources.thirdPartyDomains");
  assert.equal(f.value.length, 7);
  assert.equal(f.severity, "medium");
});

test("14. redirecciones se cuentan desde redirectChain", () => {
  const f = findById(analyzePerformanceForPage(page({ redirectChain: [{ from: "a", to: "b" }] })), "perf.response.redirects");
  assert.equal(f.value, 1);
});

test("17. datos no medidos (sin timing) se marcan explícitamente, nunca se estima un valor", () => {
  const f = findById(analyzePerformanceForPage(page({ timing: null })), "perf.response.timing");
  assert.equal(f.status, "not_measured");
  assert.equal(f.confidence, 0);
});

test("nunca se produce ningún finding con nombres LCP/CLS/INP/FCP como si fueran valores reales", () => {
  const findings = analyzePerformanceForPage(page());
  for (const f of findings) {
    assert.doesNotMatch(f.id, /\b(lcp|cls|inp|fcp)\b/i);
    assert.doesNotMatch(`${f.title} ${f.rule}`, /\bLCP\b|\bCLS\b|\bINP\b|\bFCP\b/);
  }
});

test("peso real de imágenes/coste de ejecución JS/CSS no usado quedan explícitamente 'unavailable'/'browser_test_required'", () => {
  const p = page({ body: '<html><head><title>t</title><script src="a.js"></script><link rel="stylesheet" href="b.css"></head><body><img src="c.jpg" width="1" height="1"></body></html>' });
  const findings = analyzePerformanceForPage(p);
  assert.equal(findById(findings, "perf.images.weight").status, "unavailable");
  assert.equal(findById(findings, "perf.javascript.executionCost").severity, "browser_test_required");
  assert.equal(findById(findings, "perf.css.unusedCss").severity, "browser_test_required");
});

test("evidencia de CDN solo se declara si existe una cabecera pública, nunca se infiere sin ella", () => {
  const withCdn = findById(analyzePerformanceForPage(page({ headers: { "cf-ray": "abc123" } })), "perf.caching.cdnEvidence");
  assert.equal(withCdn.status, "observed");
  const withoutCdn = findById(analyzePerformanceForPage(page({ headers: {} })), "perf.caching.cdnEvidence");
  assert.equal(withoutCdn.status, "not_measured");
  assert.equal(withoutCdn.value, null);
});

test("recursos duplicados (scripts) se detectan", () => {
  const p = page({ body: '<html><head><title>t</title><script src="a.js"></script><script src="a.js"></script></head><body></body></html>' });
  const f = findById(analyzePerformanceForPage(p), "perf.javascript.duplicated");
  assert.ok(f);
  assert.equal(f.value[0].count, 2);
});

test("21. perfil clínica se resuelve sin lanzar (pesos aplicados fuera del análisis de código)", () => {
  assert.doesNotThrow(() => analyzePerformanceForPage(page(), { profileId: "clinica" }));
});

test("analyzePerformanceForPages combina hallazgos de varias páginas conservando la URL de cada una", () => {
  const pageA = page({ url: "https://x.example/a" });
  const pageB = page({ url: "https://x.example/b", body: '<html><head><title>t</title></head><body><img src="a.jpg"></body></html>' });
  const findings = analyzePerformanceForPages([pageA, pageB]);
  assert.ok(findings.some((f) => f.url === "https://x.example/a"));
  assert.ok(findings.some((f) => f.url === "https://x.example/b"));
});

test("métricas derivadas (imageOptimizationCoverage/cachingCoverage) se calculan solo cuando hay datos suficientes", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><img src="a.jpg" width="1" height="1" loading="lazy"></body></html>', headers: { "cache-control": "max-age=1" } });
  const findings = analyzePerformanceForPage(p);
  const coverage = findById(findings, "perf.derived.imageOptimizationCoverage");
  assert.ok(coverage);
  assert.ok(coverage.value > 0);
});
