import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzeSeoForPage, analyzeSeoForPages, analyzeTitleDuplication, SEO_CATEGORIES, SEVERITIES, FINDING_STATUSES } from "./seoAnalyzer.js";

function page(overrides = {}) {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    contentType: "text/html",
    body: "<html><head><title>Página</title></head><body></body></html>",
    headers: {},
    robotsTxt: { available: false, content: "" },
    redirectChain: [],
    ...overrides,
  };
}

function findById(findings, id) {
  return findings.find((f) => f.id === id);
}

test("todo finding declara categoría/severidad/status dentro de los vocabularios cerrados", () => {
  const findings = analyzeSeoForPage(page());
  for (const f of findings) {
    assert.ok(SEO_CATEGORIES.includes(f.category), `categoría inválida: ${f.category}`);
    assert.ok(SEVERITIES.includes(f.severity), `severidad inválida: ${f.severity}`);
    assert.ok(FINDING_STATUSES.includes(f.status), `status inválido: ${f.status}`);
    assert.ok(["seoTechnical", "seoContent", "seoLocal"].includes(f.dimension), `dimensión inválida: ${f.dimension}`);
  }
});

test("analyzeSeoForPage es determinista (mismo HTML -> mismos findings, JSON idéntico)", () => {
  const p = page();
  const a = JSON.stringify(analyzeSeoForPage(p));
  const b = JSON.stringify(analyzeSeoForPage(p));
  assert.equal(a, b);
});

// --- Indexación ---
test("meta robots noindex se detecta como crítico y negativo", () => {
  const p = page({ body: '<html><head><title>t</title><meta name="robots" content="noindex, nofollow"></head></html>' });
  const f = findById(analyzeSeoForPage(p), "seo.indexation.metaRobots");
  assert.equal(f.severity, "critical");
  assert.equal(f.polarity, "negative");
});

test("x-robots-tag se marca 'unavailable' cuando la página no trae headers (fixture sin ese dato)", () => {
  const p = page({ headers: undefined });
  const f = findById(analyzeSeoForPage(p), "seo.indexation.xRobotsTag");
  assert.equal(f.status, "unavailable");
  assert.equal(f.severity, "not_evaluable");
});

test("x-robots-tag observado cuando headers sí está presente (aunque sea null)", () => {
  const p = page({ headers: { "x-robots-tag": "noindex" } });
  const f = findById(analyzeSeoForPage(p), "seo.indexation.xRobotsTag");
  assert.equal(f.status, "observed");
  assert.equal(f.severity, "critical");
});

test("canonical ausente se marca negativo; canonical autorreferenciado, positivo", () => {
  const noCanon = findById(analyzeSeoForPage(page()), "seo.indexation.canonical");
  assert.equal(noCanon.polarity, "negative");

  const withCanon = page({ url: "https://x.example/", body: '<html><head><title>t</title><link rel="canonical" href="https://x.example/"></head></html>' });
  const f = findById(analyzeSeoForPage(withCanon), "seo.indexation.canonical");
  assert.equal(f.polarity, "positive");
});

test("robots.txt con directiva Sitemap se detecta sin volver a descargarlo", () => {
  const p = page({ robotsTxt: { available: true, content: "User-agent: *\nSitemap: https://x.example/sitemap.xml\n" } });
  const f = findById(analyzeSeoForPage(p), "seo.indexation.sitemapDeclared");
  assert.equal(f.observedValue, true);
  assert.equal(f.polarity, "positive");
});

// --- Metadatos ---
test("title ausente es crítico; title de longitud óptima es positivo", () => {
  const noTitle = findById(analyzeSeoForPage(page({ body: "<html></html>" })), "seo.metadata.title");
  assert.equal(noTitle.severity, "critical");

  const goodTitle = findById(analyzeSeoForPage(page({ body: "<html><head><title>Club Pádel 04 — Reserva tu pista</title></head></html>" })), "seo.metadata.title");
  assert.equal(goodTitle.polarity, "positive");
});

test("meta description ausente se marca de severidad alta", () => {
  const f = findById(analyzeSeoForPage(page({ body: "<html><head><title>t</title></head></html>" })), "seo.metadata.description");
  assert.equal(f.severity, "high");
  assert.equal(f.polarity, "negative");
});

test("idioma (html lang) y viewport ausentes se detectan", () => {
  const findings = analyzeSeoForPage(page({ body: "<html><head><title>t</title></head></html>" }));
  assert.equal(findById(findings, "seo.metadata.lang").observedValue, null);
  assert.equal(findById(findings, "seo.metadata.viewport").severity, "high");
});

// --- Estructura ---
test("h1 count: 0, 1 y >1 producen severidades distintas", () => {
  const zero = findById(analyzeSeoForPage(page({ body: "<html><head><title>t</title></head><body></body></html>" })), "seo.structure.h1Count");
  assert.equal(zero.observedValue, 0);
  assert.equal(zero.severity, "high");

  const one = findById(analyzeSeoForPage(page({ body: "<html><head><title>t</title></head><body><h1>a</h1></body></html>" })), "seo.structure.h1Count");
  assert.equal(one.observedValue, 1);
  assert.equal(one.severity, "low");

  const many = findById(analyzeSeoForPage(page({ body: "<html><head><title>t</title></head><body><h1>a</h1><h1>b</h1></body></html>" })), "seo.structure.h1Count");
  assert.equal(many.observedValue, 2);
  assert.equal(many.severity, "medium");
});

test("salto de nivel de encabezado (h2 -> h4) se detecta", () => {
  const p = page({ body: "<html><head><title>t</title></head><body><h1>a</h1><h2>b</h2><h4>c</h4></body></html>" });
  const f = findById(analyzeSeoForPage(p), "seo.structure.headingJumps");
  assert.ok(f, "debería haberse detectado un salto de nivel");
});

// --- Enlaces ---
test("enlace roto SOLO se declara comprobado cuando apunta a otra página del mismo lote con httpStatus>=400", () => {
  const pageA = page({ url: "https://x.example/a", body: '<html><head><title>a</title></head><body><a href="https://x.example/b">ir a b</a></body></html>' });
  const pageB = page({ url: "https://x.example/b", httpStatus: 404, body: "<html><head><title>b</title></head></html>" });

  const unverified = findById(analyzeSeoForPage(pageA), "seo.links.brokenVerified");
  assert.equal(unverified.status, "unverified");

  const verified = findById(analyzeSeoForPage(pageA, { allPages: [pageA, pageB] }), "seo.links.brokenVerified");
  assert.equal(verified.status, "observed");
  assert.equal(verified.observedValue, 1);
});

test("esquema inseguro (javascript:) en href se detecta como severidad alta", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><a href="javascript:alert(1)">malo</a></body></html>' });
  const f = findById(analyzeSeoForPage(p), "seo.links.insecureScheme");
  assert.equal(f.severity, "high");
});

// --- Imágenes ---
test("imágenes sin alt se detectan con severidad alta; nunca se declara peso sin datos reales", () => {
  const p = page({ body: '<html><head><title>t</title></head><body><img src="a.jpg"></body></html>' });
  const findings = analyzeSeoForPage(p);
  const missingAlt = findById(findings, "seo.images.missingAlt");
  assert.equal(missingAlt.severity, "high");
  const heavy = findById(findings, "seo.images.heavyImages");
  assert.equal(heavy.status, "unavailable");
  assert.equal(heavy.severity, "not_evaluable");
});

// --- Datos estructurados ---
test("JSON-LD válido con tipo coherente con el perfil se detecta como adecuado", () => {
  const p = page({ body: '<html><head><title>t</title><script type="application/ld+json">{"@type":"Restaurant","name":"X"}</script></head></html>' });
  const fit = findById(analyzeSeoForPage(p, { profileId: "restaurante" }), "seo.structuredData.profileFit");
  assert.equal(fit.polarity, "positive");
  assert.ok(fit.limitations.some((l) => l.includes("no sustituye") || l.toLowerCase().includes("no sustituye") || l.toLowerCase().includes("validación oficial")));
});

test("JSON-LD inválido se reporta como error de sintaxis, sin lanzar", () => {
  const p = page({ body: '<html><head><title>t</title><script type="application/ld+json">{ mal json }</script></head></html>' });
  assert.doesNotThrow(() => analyzeSeoForPage(p));
  const f = findById(analyzeSeoForPage(p), "seo.structuredData.jsonLdSyntaxError");
  assert.ok(f);
  assert.equal(f.severity, "high");
});

test("sin datos estructurados en absoluto se reporta como ausencia negativa", () => {
  const f = findById(analyzeSeoForPage(page()), "seo.structuredData.presence");
  assert.equal(f.polarity, "negative");
});

// --- Contenido / local ---
test("contenido escaso se detecta bajo el umbral del perfil", () => {
  const p = page({ body: "<html><head><title>t</title></head><body><p>Poco texto.</p></body></html>" });
  const f = findById(analyzeSeoForPage(p, { profileId: "restaurante" }), "seo.content.thinContent");
  assert.equal(f.polarity, "negative");
});

test("duplicación de contenido SOLO se compara entre páginas del mismo lote", () => {
  const html = "<html><head><title>t</title></head><body><p>Mismo contenido exacto repetido en dos páginas del sitio.</p></body></html>";
  const pageA = page({ url: "https://x.example/a", body: html });
  const pageB = page({ url: "https://x.example/b", body: html });
  const findings = analyzeSeoForPage(pageA, { allPages: [pageA, pageB] });
  const dup = findById(findings, "seo.content.duplicateContent");
  assert.equal(dup.observedValue, true);
});

// --- Técnico ---
test("HTTP sin cifrar se detecta como crítico; HTTPS como positivo", () => {
  const http = findById(analyzeSeoForPage(page({ url: "http://x.example/" })), "seo.technical.https");
  assert.equal(http.severity, "critical");
  const https = findById(analyzeSeoForPage(page({ url: "https://x.example/" })), "seo.technical.https");
  assert.equal(https.polarity, "positive");
});

test("nunca se produce ningún finding relacionado con Core Web Vitals o Lighthouse", () => {
  const findings = analyzeSeoForPage(page());
  for (const f of findings) {
    assert.doesNotMatch(f.id, /lighthouse|core-web-vitals|cwv/i);
    assert.doesNotMatch(f.title, /core web vitals|lighthouse score/i);
  }
});

// --- Multi-página ---
test("analyzeTitleDuplication detecta title repetido entre páginas del lote", () => {
  const pageA = page({ url: "https://x.example/a", body: "<html><head><title>Mismo título</title></head></html>" });
  const pageB = page({ url: "https://x.example/b", body: "<html><head><title>Mismo título</title></head></html>" });
  const dup = analyzeTitleDuplication([pageA, pageB]);
  assert.equal(dup.length, 1);
  assert.equal(dup[0].observedValue.length, 2);
});

test("analyzeSeoForPages combina hallazgos por página + cross-page en un único lote", () => {
  const pageA = page({ url: "https://x.example/a", body: "<html><head><title>Mismo título</title></head></html>" });
  const pageB = page({ url: "https://x.example/b", body: "<html><head><title>Mismo título</title></head></html>" });
  const findings = analyzeSeoForPages([pageA, pageB], { profileId: "generic" });
  assert.ok(findings.some((f) => f.id === "seo.metadata.duplicateTitle"));
  assert.ok(findings.filter((f) => f.url === pageA.url).length > 0);
  assert.ok(findings.filter((f) => f.url === pageB.url).length > 0);
});
