// Paso 16 — Integración end-to-end del SEO Provider real a través de
// runResearchAudit() completo (evidencia -> scoring -> informes JSON/MD).
// Siempre offline por defecto (proveedor real inyectado con páginas
// hand-built) — la validación con red real de verdad vive en el informe
// técnico (Fase 9, ejecutada manualmente, no en la suite automática).

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

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-audit-seo-"));
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
  return createEvidence({
    sourceId: url,
    sourceType: "public_website_real",
    title: `real:${url}`,
    excerpt: "contenido real",
    normalizedContent: `${url}-content`,
    classification: "confirmed",
    relatedDimension: "trustSignals",
    signal: { strength: 0.7, polarity: "positive" },
    confidence: 0.7,
    provenance: url,
  });
}

function fakeRealProviderWithHtml(html) {
  return defineResearchProvider({
    id: "publicWebsiteFetcher",
    status: "real",
    priority: 10,
    capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
    async collect(input) {
      const urls = input.urls ?? [];
      const pages = urls.map((u) => ({ url: u, httpStatus: 200, contentType: "text/html", body: html, headers: { "x-robots-tag": null, "content-language": "es" }, robotsTxt: { available: false, content: "" }, redirectChain: [] }));
      return defineProviderResult({ providerId: "publicWebsiteFetcher", status: "success", evidence: urls.map(fetcherEvidence), metadata: { pages } });
    },
  });
}

const GOOD_HTML = `<html lang="es"><head><meta charset="utf-8"><title>Club Pádel 04 — Reserva tu pista online</title><meta name="description" content="Club deportivo con pistas de pádel, reserva online, horarios y torneos todo el año."><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://club-padel-mp-seo.invalid/"></head><body><h1>Club Pádel 04</h1><a href="/reservas">Reservar pista ahora</a></body></html>`;

test("auditoría multiproveedor con publicWebsiteFetcher + seoProvider: evidencia real de ambos llega al scoring y a los informes", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP SEO", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-seo.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry.register(SEO_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "club-deportivo" });

    assert.equal(result.networkUsed, true);
    assert.ok(result.evidence.some((e) => e.sourceType === "public_website_real"));
    assert.ok(result.evidence.some((e) => e.sourceType === "seo_analysis_derived"));

    assert.ok(result.providerRunSummary.seo, "el resumen debe incluir el desglose SEO");
    assert.ok(result.providerRunSummary.seo.scoreBreakdown.overall.score !== null);
    assert.ok(result.scores.categories.seo.score !== null, "la categoría 'seo' del scoring general debe tener datos");

    assert.ok(await fileExists(path.join(dir, result.auditId, "reports", "seo.md")));
    const seoMd = await readFile(path.join(dir, result.auditId, "reports", "seo.md"), "utf8");
    assert.match(seoMd, /Score SEO global/);
  });
});

test("auditoría multiproveedor con HTML deficiente: recomendaciones críticas aparecen en el informe SEO", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio MP SEO Malo", sector: "restaurant" }, mode: "public-web", inputs: { urls: ["https://negocio-mp-seo-malo.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml("<html></html>"));
    registry.register(SEO_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "restaurante" });

    const critical = result.providerRunSummary.seo.recommendations.filter((r) => r.severity === "critical");
    assert.ok(critical.length > 0);
    const seoMd = await readFile(path.join(dir, result.auditId, "reports", "seo.md"), "utf8");
    assert.match(seoMd, /Crítico/);
  });
});

test("idempotencia de extremo a extremo con SEO real: segunda ejecución produce 0 creados/0 actualizados", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP SEO Idem", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-seo-idem.invalid/"] } });

    const registry1 = createProviderRegistry();
    registry1.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry1.register(SEO_PROVIDER);
    const first = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry1, profileId: "club-deportivo" });

    const registry2 = createProviderRegistry();
    registry2.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry2.register(SEO_PROVIDER);
    const second = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry2, profileId: "club-deportivo" });

    assert.ok(first.filesCreated.length > 0);
    assert.equal(second.filesCreated.length, 0);
    assert.equal(second.filesUpdated.length, 0);
    const manifest = JSON.parse(await readFile(path.join(dir, first.auditId, RESEARCH_MANIFEST_FILENAME), "utf8"));
    assert.ok(manifest.files["reports/seo.md"]);
  });
});

test("legacy sigue sin generar reports/seo.md (compatibilidad)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Legacy SEO", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "seo.md")), false);
  });
});

test("sin seoProvider registrado (registro solo con el fetcher), providerRunSummary.seo es null y nada se rompe", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Sin SEO Provider", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-sin-seo.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry });
    assert.equal(result.providerRunSummary.seo, null);
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "seo.md")), false);
  });
});
