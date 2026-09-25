// Paso 18 — Integración end-to-end del proveedor de rendimiento real a
// través de runResearchAudit() completo, junto a publicWebsiteFetcher,
// seoProvider y accessibilityProvider (los 4 proveedores reales del
// sistema). Siempre offline por defecto (proveedor real inyectado con
// páginas hand-built) — la validación con red real de verdad vive en el
// informe técnico (Fase 9, ejecutada manualmente, no en la suite
// automática).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runResearchAudit, RESEARCH_MANIFEST_FILENAME } from "./auditOrchestrator.js";
import { buildResearchRequest } from "./researchRequestSchema.js";
import { createProviderRegistry } from "./providers/core/providerRegistry.js";
import { defineResearchProvider, defineProviderCapabilities, defineProviderResult } from "./providers/core/providerTypes.js";
import { createEvidence } from "./evidenceSchema.js";
import { PROVIDER as SEO_PROVIDER } from "./providers/plugins/seoProviderPlugin.js";
import { PROVIDER as ACCESSIBILITY_PROVIDER } from "./providers/plugins/accessibilityProviderPlugin.js";
import { PROVIDER as PERFORMANCE_PROVIDER } from "./providers/plugins/performanceProviderPlugin.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-audit-perf-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
async function fileExists(p) {
  return access(p).then(() => true).catch(() => false);
}
function fetcherEvidence(url) {
  return createEvidence({ sourceId: url, sourceType: "public_website_real", title: `real:${url}`, excerpt: "contenido real", normalizedContent: `${url}-content`, classification: "confirmed", relatedDimension: "trustSignals", signal: { strength: 0.7, polarity: "positive" }, confidence: 0.7, provenance: url });
}
function fakeRealProviderWithHtml(html, { headers = {}, httpVersion = "1.1", timing = { timeToHeadersMs: 90, totalMs: 150 }, byteSize = 500 } = {}) {
  return defineResearchProvider({
    id: "publicWebsiteFetcher",
    status: "real",
    priority: 10,
    capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
    async collect(input) {
      const urls = input.urls ?? [];
      const pages = urls.map((u) => ({ url: u, httpStatus: 200, contentType: "text/html", body: html, headers, robotsTxt: { available: false, content: "" }, redirectChain: [], httpVersion, timing, byteSize }));
      return defineProviderResult({ providerId: "publicWebsiteFetcher", status: "success", evidence: urls.map(fetcherEvidence), metadata: { pages } });
    },
  });
}

const GOOD_HTML = `<html lang="es"><head><meta charset="utf-8"><title>Club Pádel 04 — Reserva tu pista online</title><meta name="viewport" content="width=device-width"><script src="a.js" async></script><link rel="stylesheet" href="b.css" media="print"></head><body><h1>Club Pádel 04</h1><img src="a.jpg" alt="pista de padel" width="10" height="10" loading="lazy"></body></html>`;
const BAD_HTML = `<html><head><title>t</title><script src="a.js"></script><link rel="stylesheet" href="b.css"></head><body><img src="c.jpg"></body></html>`;

test("auditoría con los 4 proveedores reales: evidencia de publicWebsiteFetcher+seoProvider+accessibilityProvider+performanceProvider llega al scoring y a los informes", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Perf", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-perf.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML, { headers: { "cache-control": "max-age=3600", etag: '"x"' } }));
    registry.register(SEO_PROVIDER);
    registry.register(ACCESSIBILITY_PROVIDER);
    registry.register(PERFORMANCE_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "club-deportivo" });

    assert.equal(result.networkUsed, true);
    assert.ok(result.evidence.some((e) => e.sourceType === "public_website_real"));
    assert.ok(result.evidence.some((e) => e.sourceType === "seo_analysis_derived"));
    assert.ok(result.evidence.some((e) => e.sourceType === "accessibility_analysis_derived"));
    assert.ok(result.evidence.some((e) => e.sourceType === "performance_analysis_derived"));

    assert.ok(result.providerRunSummary.performance, "el resumen debe incluir el desglose de rendimiento");
    assert.ok(result.providerRunSummary.performance.scoreBreakdown.overall.score !== null);
    assert.ok(result.scores.categories.technicalQuality.score !== null, "la categoría 'technicalQuality' del scoring general debe tener datos");

    assert.ok(await fileExists(path.join(dir, result.auditId, "reports", "performance.md")));
    const perfMd = await readFile(path.join(dir, result.auditId, "reports", "performance.md"), "utf8");
    assert.match(perfMd, /Score de rendimiento global/);
    assert.match(perfMd, /no es una puntuación de Lighthouse/i);
    assert.doesNotMatch(perfMd, /\bLCP\b\s*[:=]\s*[\d.]/);
  });
});

test("auditoría con HTML con problemas de rendimiento: recomendaciones críticas/altas aparecen en el informe", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio MP Perf Malo", sector: "restaurant" }, mode: "public-web", inputs: { urls: ["https://negocio-mp-perf-malo.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(BAD_HTML, { headers: {}, httpVersion: "1.1", timing: { timeToHeadersMs: 1500, totalMs: 3000 } }));
    registry.register(PERFORMANCE_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "restaurante" });

    const criticalOrHigh = result.providerRunSummary.performance.recommendations.filter((r) => r.severity === "critical" || r.severity === "high");
    assert.ok(criticalOrHigh.length > 0);
    const perfMd = await readFile(path.join(dir, result.auditId, "reports", "performance.md"), "utf8");
    assert.match(perfMd, /Alto|Crítico/);
  });
});

test("idempotencia de extremo a extremo con los 4 proveedores reales: segunda ejecución produce 0 creados/0 actualizados", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Perf Idem", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-perf-idem.invalid/"] } });

    const registry1 = createProviderRegistry();
    registry1.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry1.register(SEO_PROVIDER);
    registry1.register(ACCESSIBILITY_PROVIDER);
    registry1.register(PERFORMANCE_PROVIDER);
    const first = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry1, profileId: "club-deportivo" });

    const registry2 = createProviderRegistry();
    registry2.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry2.register(SEO_PROVIDER);
    registry2.register(ACCESSIBILITY_PROVIDER);
    registry2.register(PERFORMANCE_PROVIDER);
    const second = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry2, profileId: "club-deportivo" });

    assert.ok(first.filesCreated.length > 0);
    assert.equal(second.filesCreated.length, 0);
    assert.equal(second.filesUpdated.length, 0);
    const manifest = JSON.parse(await readFile(path.join(dir, first.auditId, RESEARCH_MANIFEST_FILENAME), "utf8"));
    assert.ok(manifest.files["reports/performance.md"]);
    assert.ok(manifest.files["reports/accessibility.md"]);
    assert.ok(manifest.files["reports/seo.md"]);
  });
});

test("legacy sigue sin generar reports/performance.md (compatibilidad)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Legacy Perf", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "performance.md")), false);
  });
});

test("sin performanceProvider registrado, providerRunSummary.performance es null y nada se rompe", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Sin Perf Provider", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-sin-perf.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry.register(SEO_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry });
    assert.equal(result.providerRunSummary.performance, null);
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "performance.md")), false);
  });
});

test("perfil clínica: perfil sectorial se refleja en la evidencia informativa de rendimiento", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Clínica MP Perf", sector: "physiotherapy" }, mode: "public-web", inputs: { urls: ["https://clinica-mp-perf.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry.register(PERFORMANCE_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "clinica" });
    assert.equal(result.providerRunSummary.performance.scoreBreakdown.overall.groupsTotal, 11);
    assert.ok(result.evidence.some((e) => e.metadata?.profileId === "clinica" && e.sourceType === "performance_analysis_derived"));
  });
});
