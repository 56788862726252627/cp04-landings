// Paso 17 — Integración end-to-end del proveedor de accesibilidad real a
// través de runResearchAudit() completo, junto a publicWebsiteFetcher y
// seoProvider (los 3 proveedores reales del sistema). Siempre offline
// por defecto (proveedor real inyectado con páginas hand-built) — la
// validación con red real de verdad vive en el informe técnico (Fase 9,
// ejecutada manualmente, no en la suite automática).

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

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-audit-a11y-"));
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

const GOOD_HTML = `<html lang="es"><head><meta charset="utf-8"><title>Club Pádel 04 — Reserva tu pista online</title><meta name="description" content="Club deportivo con pistas de pádel, reserva online, horarios y torneos todo el año."><meta name="viewport" content="width=device-width"></head><body><a href="#main">Saltar al contenido</a><nav></nav><h1>Club Pádel 04</h1><img src="a.jpg" alt="pista de padel"><label for="tel">Teléfono</label><input id="tel" type="tel" autocomplete="tel"><a href="/reservas">Reservar pista ahora</a></body></html>`;
const BAD_HTML = `<html><body><img src="a.jpg"><input type="email"><button></button></body></html>`;

test("auditoría con los 3 proveedores reales: evidencia de publicWebsiteFetcher+seoProvider+accessibilityProvider llega al scoring y a los informes", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP A11y", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-a11y.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry.register(SEO_PROVIDER);
    registry.register(ACCESSIBILITY_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "club-deportivo" });

    assert.equal(result.networkUsed, true);
    assert.ok(result.evidence.some((e) => e.sourceType === "public_website_real"));
    assert.ok(result.evidence.some((e) => e.sourceType === "seo_analysis_derived"));
    assert.ok(result.evidence.some((e) => e.sourceType === "accessibility_analysis_derived"));

    assert.ok(result.providerRunSummary.accessibility, "el resumen debe incluir el desglose de accesibilidad");
    assert.ok(result.providerRunSummary.accessibility.scoreBreakdown.overall.score !== null);
    assert.ok(result.scores.categories.accessibility.score !== null, "la categoría 'accessibility' del scoring general debe tener datos");

    assert.ok(await fileExists(path.join(dir, result.auditId, "reports", "accessibility.md")));
    const a11yMd = await readFile(path.join(dir, result.auditId, "reports", "accessibility.md"), "utf8");
    assert.match(a11yMd, /Score de accesibilidad global/);
    assert.match(a11yMd, /no constituye una certificación/i);
  });
});

test("auditoría con HTML deficiente: recomendaciones críticas de accesibilidad aparecen en el informe, con criterio WCAG", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio MP A11y Malo", sector: "restaurant" }, mode: "public-web", inputs: { urls: ["https://negocio-mp-a11y-malo.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(BAD_HTML));
    registry.register(ACCESSIBILITY_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "restaurante" });

    const critical = result.providerRunSummary.accessibility.recommendations.filter((r) => r.severity === "critical");
    assert.ok(critical.length > 0);
    const a11yMd = await readFile(path.join(dir, result.auditId, "reports", "accessibility.md"), "utf8");
    assert.match(a11yMd, /Crítico/);
    assert.match(a11yMd, /WCAG/);
  });
});

test("idempotencia de extremo a extremo con los 3 proveedores reales: segunda ejecución produce 0 creados/0 actualizados", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP A11y Idem", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-a11y-idem.invalid/"] } });

    const registry1 = createProviderRegistry();
    registry1.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry1.register(SEO_PROVIDER);
    registry1.register(ACCESSIBILITY_PROVIDER);
    const first = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry1, profileId: "club-deportivo" });

    const registry2 = createProviderRegistry();
    registry2.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry2.register(SEO_PROVIDER);
    registry2.register(ACCESSIBILITY_PROVIDER);
    const second = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry2, profileId: "club-deportivo" });

    assert.ok(first.filesCreated.length > 0);
    assert.equal(second.filesCreated.length, 0);
    assert.equal(second.filesUpdated.length, 0);
    const manifest = JSON.parse(await readFile(path.join(dir, first.auditId, RESEARCH_MANIFEST_FILENAME), "utf8"));
    assert.ok(manifest.files["reports/accessibility.md"]);
    assert.ok(manifest.files["reports/seo.md"]);
  });
});

test("legacy sigue sin generar reports/accessibility.md (compatibilidad)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Legacy A11y", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "accessibility.md")), false);
  });
});

test("sin accessibilityProvider registrado, providerRunSummary.accessibility es null y nada se rompe", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Sin A11y Provider", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-sin-a11y.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry.register(SEO_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry });
    assert.equal(result.providerRunSummary.accessibility, null);
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "accessibility.md")), false);
  });
});

test("perfil clínica: notas de prioridad de contenido/formularios se reflejan en la evidencia informativa", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Clínica MP A11y", sector: "physiotherapy" }, mode: "public-web", inputs: { urls: ["https://clinica-mp-a11y.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProviderWithHtml(GOOD_HTML));
    registry.register(ACCESSIBILITY_PROVIDER);
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "clinica" });
    assert.equal(result.providerRunSummary.accessibility.scoreBreakdown.overall.groupsTotal, 9);
    assert.ok(result.evidence.some((e) => e.metadata?.profileId === "clinica"));
  });
});
