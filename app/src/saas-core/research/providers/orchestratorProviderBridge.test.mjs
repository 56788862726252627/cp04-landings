import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { collectEvidenceViaProviders, REAL_PROVIDER_ID, SEO_PROVIDER_ID, DEFAULT_PLUGINS_DIR } from "./orchestratorProviderBridge.js";
import { createProviderRegistry } from "./core/providerRegistry.js";
import { createProviderCircuitBreaker } from "./providerCircuitBreaker.js";
import { defineResearchProvider, defineProviderCapabilities, defineProviderResult, defineProviderHealth } from "./core/providerTypes.js";
import { createEvidence } from "../evidenceSchema.js";
import { PROVIDER as SEO_PROVIDER } from "./plugins/seoProviderPlugin.js";

function fakeUnavailable(url, reason) {
  return createEvidence({
    sourceId: url,
    sourceType: "local_html",
    title: "no consultada",
    excerpt: reason ?? "sin red",
    normalizedContent: url,
    classification: "unavailable",
    relatedDimension: "digitalMaturitySignal",
    signal: { strength: 0, polarity: "neutral" },
    confidence: 0,
    provenance: "network_disabled",
  });
}

function fakeRealProvider({ status = "success", evidenceFor = (url) => [makeRealEvidence(url)], throwsHealthy = true } = {}) {
  return defineResearchProvider({
    id: REAL_PROVIDER_ID,
    status: "real",
    priority: 10,
    capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
    async collect(input) {
      const urls = input.urls ?? [];
      const evidence = status === "success" ? urls.flatMap((u) => evidenceFor(u)) : [];
      return defineProviderResult({ providerId: REAL_PROVIDER_ID, status, evidence });
    },
    async healthCheck() {
      return defineProviderHealth({ healthy: throwsHealthy, mode: "real", message: "ok" });
    },
  });
}

function makeRealEvidence(url) {
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

function fakeRealProviderWithPages({ status = "success", pages } = {}) {
  return defineResearchProvider({
    id: REAL_PROVIDER_ID,
    status: "real",
    priority: 10,
    capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
    async collect(input) {
      const urls = input.urls ?? [];
      const resolvedPages = pages ?? urls.map((u) => ({ url: u, httpStatus: 200, contentType: "text/html", body: "<html><head><title>t</title></head></html>", headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] }));
      const evidence = status === "success" ? urls.map((u) => makeRealEvidence(u)) : [];
      return defineProviderResult({ providerId: REAL_PROVIDER_ID, status, evidence, metadata: { pages: status === "success" ? resolvedPages : [] } });
    },
    async healthCheck() {
      return defineProviderHealth({ healthy: true, mode: "real", message: "ok" });
    },
  });
}

function fakeStubProvider(id, { priority = 50 } = {}) {
  return defineResearchProvider({
    id,
    status: "stub",
    priority,
    capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
    async collect() {
      return defineProviderResult({ providerId: id, status: "not_implemented", evidence: [{ sourceId: id, sourceType: "provider_stub" }] });
    },
  });
}

const noop = fakeUnavailable;

test("sin allowNetwork: el proveedor real nunca se invoca, todas las URLs quedan 'unavailable'", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider());
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: false, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop });
  assert.equal(out.networkUsed, false);
  assert.equal(out.consultedUrls.length, 0);
  assert.equal(out.evidence.length, 1);
  assert.equal(out.evidence[0].classification, "unavailable");
  const realSummary = out.providerRunSummary.providers.find((p) => p.providerId === REAL_PROVIDER_ID);
  assert.equal(realSummary, undefined, "el proveedor real no debería ni aparecer en el resumen: nunca se intentó");
});

test("con allowNetwork + modo compatible: el proveedor real se invoca y su evidencia se agrega", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider());
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop });
  assert.equal(out.networkUsed, true);
  assert.deepEqual(out.consultedUrls, ["https://x.example"]);
  assert.equal(out.evidence.length, 1);
  assert.equal(out.evidence[0].classification, "confirmed");
  assert.equal(out.provenanceIndex[out.evidence[0].evidenceId].providerId, REAL_PROVIDER_ID);
});

test("allowNetwork=true pero mode='offline' (modeAllowsNetwork=false): sigue sin red real (Paso 13, defensa en profundidad)", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider());
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: false, registry, evidenceForUnavailableUrl: noop });
  assert.equal(out.networkUsed, false);
  assert.equal(out.evidence[0].classification, "unavailable");
});

test("un proveedor stub nunca aporta evidencia real, aunque se ejecute (modo sequential)", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider());
  registry.register(fakeStubProvider("seoProvider"));
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, policyOptions: { execution: "sequential" }, registry, evidenceForUnavailableUrl: noop });
  const stubSummary = out.providerRunSummary.providers.find((p) => p.providerId === "seoProvider");
  assert.equal(stubSummary.orchestratorStatus, "unavailable");
  assert.equal(stubSummary.evidenceContributed, 0);
  assert.equal(out.evidence.every((e) => e.sourceType !== "provider_stub"), true);
});

test("un proveedor con healthCheck no saludable se excluye de la cadena (health gate)", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider({ throwsHealthy: false }));
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop });
  assert.equal(out.networkUsed, false);
  assert.equal(out.providerRunSummary.providers.length, 0, "no debería haberse intentado ningún proveedor no saludable");
});

test("circuit breaker compartido bloquea el proveedor real tras fallos consecutivos entre llamadas", async () => {
  const registry1 = createProviderRegistry();
  registry1.register(fakeRealProvider({ status: "failed" }));
  const breaker = createProviderCircuitBreaker({ failureThreshold: 2 });

  await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, registry: registry1, circuitBreaker: breaker, evidenceForUnavailableUrl: noop });
  assert.equal(breaker.isBlocked(REAL_PROVIDER_ID), false);

  const registry2 = createProviderRegistry();
  registry2.register(fakeRealProvider({ status: "failed" }));
  await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, registry: registry2, circuitBreaker: breaker, evidenceForUnavailableUrl: noop });
  assert.equal(breaker.isBlocked(REAL_PROVIDER_ID), true);

  const registry3 = createProviderRegistry();
  registry3.register(fakeRealProvider({ status: "success" }));
  const out3 = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, registry: registry3, circuitBreaker: breaker, evidenceForUnavailableUrl: noop });
  assert.equal(out3.networkUsed, false, "el breaker abierto debe excluir el proveedor incluso si esta vez habría tenido éxito");
});

test("un perfil sectorial que excluye un proveedor lo desactiva aunque esté registrado", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider());
  registry.register(fakeStubProvider("aiContentProvider"));
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, profileId: "abogado", policyOptions: { execution: "sequential" }, registry, evidenceForUnavailableUrl: noop });
  const aiSummary = out.providerRunSummary.providers.find((p) => p.providerId === "aiContentProvider");
  assert.equal(aiSummary, undefined, "abogado excluye aiContentProvider: no debería haberse intentado");
  assert.equal(out.providerRunSummary.profileId, "abogado");
});

test("providerPriorityOverrides explícito cambia qué proveedor se intenta primero (modo fallback)", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider({ status: "failed" }));
  registry.register(fakeStubProvider("seoProvider", { priority: 5 }));
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: true, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop });
  const seoAttempted = out.providerRunSummary.providers.some((p) => p.providerId === "seoProvider");
  assert.equal(seoAttempted, true, "seoProvider tiene mayor prioridad (5 < 10): debe intentarse antes en la cadena");
});

test("sin URLs: no se intenta ningún proveedor y el resumen queda vacío", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProvider());
  const out = await collectEvidenceViaProviders([], { allowNetwork: true, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop });
  assert.deepEqual(out.evidence, []);
  assert.deepEqual(out.providerRunSummary.providers, []);
});

test("collectEvidenceViaProviders exige evidenceForUnavailableUrl (evita import circular silencioso)", async () => {
  await assert.rejects(() => collectEvidenceViaProviders(["https://x.example"], {}));
});

test("con el directorio real de plugins, los stubs con dimensiones concretas (no '*') SÍ se intentan", async () => {
  // Regresión: una versión anterior de este puente resolvía la cadena con
  // `registry.resolveFallbackChain("*")`, que solo compara la dimensión
  // LITERAL "*" — un stub real (seoProvider) declara dimensiones concretas
  // (seoTechnical/seoContent/seoLocal), nunca "*", así que nunca aparecía
  // en la cadena pese a estar habilitado y recomendado por el perfil.
  const out = await collectEvidenceViaProviders(["https://x.example"], {
    allowNetwork: false,
    modeAllowsNetwork: true,
    profileId: "restaurante",
    policyOptions: { execution: "sequential" },
    pluginsDir: DEFAULT_PLUGINS_DIR,
    evidenceForUnavailableUrl: noop,
  });
  const attemptedIds = out.providerRunSummary.providers.map((p) => p.providerId);
  assert.ok(attemptedIds.includes("seoProvider"), `seoProvider (seoLocal) debería intentarse para el perfil restaurante; se intentaron: ${attemptedIds.join(", ")}`);
  assert.ok(attemptedIds.includes("socialProvider"), `socialProvider (socialMediaPresence) debería intentarse para el perfil restaurante; se intentaron: ${attemptedIds.join(", ")}`);
  for (const id of attemptedIds) {
    const summary = out.providerRunSummary.providers.find((p) => p.providerId === id);
    if (summary.providerResultStatus === "not_implemented") assert.equal(summary.evidenceContributed, 0);
  }
});

test("con el directorio real de plugins (Paso 14) y allowNetwork=false, se descubren los 13 proveedores sin red real", async () => {
  const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: false, modeAllowsNetwork: true, pluginsDir: DEFAULT_PLUGINS_DIR, evidenceForUnavailableUrl: noop });
  assert.equal(out.networkUsed, false);
  assert.equal(out.providerRunSummary.pluginLoadErrors.length, 0);
});

test("un plugin corrupto en pluginsDir se reporta en pluginLoadErrors y en limitations, sin romper el resto", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-bad-plugins-"));
  try {
    await writeFile(path.join(dir, "broken.js"), "export const PROVIDER = null;\n", "utf8");
    const out = await collectEvidenceViaProviders(["https://x.example"], { allowNetwork: false, modeAllowsNetwork: true, pluginsDir: dir, evidenceForUnavailableUrl: noop });
    assert.equal(out.providerRunSummary.pluginLoadErrors.length, 1);
    assert.ok(out.limitations.some((l) => l.includes("broken.js")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------
// Paso 16 — publicWebsiteFetcher recopila -> seoProvider analiza (real)
// ---------------------------------------------------------------------

test("Paso 16 — publicWebsiteFetcher y seoProvider producen evidencia diferenciada, deduplicada, con procedencia distinta por proveedor", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProviderWithPages());
  registry.register(SEO_PROVIDER);
  const out = await collectEvidenceViaProviders(["https://x.example/"], { allowNetwork: true, modeAllowsNetwork: true, policyOptions: { execution: "sequential" }, registry, evidenceForUnavailableUrl: noop });

  const fromFetcher = out.providerRunSummary.providers.find((p) => p.providerId === REAL_PROVIDER_ID);
  const fromSeo = out.providerRunSummary.providers.find((p) => p.providerId === SEO_PROVIDER_ID);
  assert.equal(fromFetcher.orchestratorStatus, "available");
  assert.equal(fromSeo.orchestratorStatus, "available");
  assert.ok(fromFetcher.evidenceContributed > 0);
  assert.ok(fromSeo.evidenceContributed > 0);

  // Evidencias diferenciadas por sourceType/procedencia, no mezcladas.
  const seoEvidenceIds = Object.entries(out.provenanceIndex).filter(([, v]) => v.providerId === SEO_PROVIDER_ID).map(([id]) => id);
  const fetcherEvidenceIds = Object.entries(out.provenanceIndex).filter(([, v]) => v.providerId === REAL_PROVIDER_ID).map(([id]) => id);
  assert.ok(seoEvidenceIds.length > 0);
  assert.ok(fetcherEvidenceIds.length > 0);
  const overlap = seoEvidenceIds.filter((id) => fetcherEvidenceIds.includes(id));
  assert.deepEqual(overlap, [], "las evidencias de cada proveedor deben quedar deduplicadas sin mezclarse ni perder procedencia");

  const seoEvidence = out.evidence.filter((e) => e.sourceType === "seo_analysis_derived");
  assert.ok(seoEvidence.length > 0);

  assert.ok(out.providerRunSummary.seo, "providerRunSummary.seo debe estar poblado tras un análisis SEO con éxito");
  assert.ok(out.providerRunSummary.seo.scoreBreakdown.overall.score !== undefined);
  assert.ok(Array.isArray(out.providerRunSummary.seo.recommendations));
});

test("Paso 16 — sin páginas recopiladas (sin red), seoProvider se marca 'skipped' y nunca aporta evidencia inventada", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProviderWithPages());
  registry.register(SEO_PROVIDER);
  const out = await collectEvidenceViaProviders(["https://x.example/"], { allowNetwork: false, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop });
  // Sin --allow-network, publicWebsiteFetcher se desactiva ANTES de resolver
  // la cadena; seoProvider sigue habilitado y SÍ se intenta (vía la cadena
  // genérica, con {urls,limits} en vez de {pages}) — su propio contrato
  // (seoProviderPlugin.js) responde "skipped" al no recibir `pages`, nunca
  // inventa hallazgos. El paso explícito post-cadena tampoco lo reinvoca
  // (no hay `fetchedPages`, ver collectEvidenceViaProviders).
  const seoSummary = out.providerRunSummary.providers.find((p) => p.providerId === SEO_PROVIDER_ID);
  assert.equal(seoSummary.orchestratorStatus, "skipped");
  assert.equal(seoSummary.evidenceContributed, 0);
  assert.equal(out.evidence.filter((e) => e.sourceType === "seo_analysis_derived").length, 0);
});

test("Paso 16 — seoProvider excluido por perfil no se invoca aunque publicWebsiteFetcher tenga éxito", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProviderWithPages());
  registry.register(SEO_PROVIDER);
  const out = await collectEvidenceViaProviders(["https://x.example/"], { allowNetwork: true, modeAllowsNetwork: true, policyOptions: { excludeProviders: [SEO_PROVIDER_ID] }, registry, evidenceForUnavailableUrl: noop });
  const seoSummary = out.providerRunSummary.providers.find((p) => p.providerId === SEO_PROVIDER_ID);
  assert.equal(seoSummary, undefined);
});

test("Paso 16 — modo fallback (por defecto): publicWebsiteFetcher detiene la cadena principal, pero seoProvider igualmente analiza sus páginas", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProviderWithPages());
  registry.register(SEO_PROVIDER);
  const out = await collectEvidenceViaProviders(["https://x.example/"], { allowNetwork: true, modeAllowsNetwork: true, registry, evidenceForUnavailableUrl: noop }); // execution por defecto: fallback
  const seoSummary = out.providerRunSummary.providers.find((p) => p.providerId === SEO_PROVIDER_ID);
  assert.ok(seoSummary, "seoProvider debe ejecutarse como paso explícito aunque el modo fallback no lo alcance en la cadena genérica");
  assert.equal(seoSummary.orchestratorStatus, "available");
});

test("Paso 16 — seoProvider respeta individualTimeoutMs (hereda el timeout del pipeline, no lo bypassa)", async () => {
  const registry = createProviderRegistry();
  registry.register(fakeRealProviderWithPages());
  const slowSeoProvider = defineResearchProvider({
    id: SEO_PROVIDER_ID,
    status: "real",
    priority: 15,
    capabilities: defineProviderCapabilities({ dimensions: ["seoTechnical", "seoContent", "seoLocal"] }),
    async collect() {
      await new Promise((r) => setTimeout(r, 200));
      return defineProviderResult({ providerId: SEO_PROVIDER_ID, status: "success", evidence: [] });
    },
    async healthCheck() {
      return defineProviderHealth({ healthy: true, mode: "real", message: "ok" });
    },
  });
  registry.register(slowSeoProvider);
  const out = await collectEvidenceViaProviders(["https://x.example/"], {
    allowNetwork: true,
    modeAllowsNetwork: true,
    policyOptions: { individualTimeoutMs: 20 },
    registry,
    evidenceForUnavailableUrl: noop,
  });
  const seoSummary = out.providerRunSummary.providers.find((p) => p.providerId === SEO_PROVIDER_ID);
  assert.equal(seoSummary.orchestratorStatus, "timed_out");
});

test("Paso 16 — idempotencia: dos ejecuciones sobre el mismo HTML producen el mismo conjunto de evidenceId de seoProvider", async () => {
  const registry1 = createProviderRegistry();
  registry1.register(fakeRealProviderWithPages());
  registry1.register(SEO_PROVIDER);
  const out1 = await collectEvidenceViaProviders(["https://x.example/"], { allowNetwork: true, modeAllowsNetwork: true, registry: registry1, evidenceForUnavailableUrl: noop });

  const registry2 = createProviderRegistry();
  registry2.register(fakeRealProviderWithPages());
  registry2.register(SEO_PROVIDER);
  const out2 = await collectEvidenceViaProviders(["https://x.example/"], { allowNetwork: true, modeAllowsNetwork: true, registry: registry2, evidenceForUnavailableUrl: noop });

  const ids1 = out1.evidence.filter((e) => e.sourceType === "seo_analysis_derived").map((e) => e.evidenceId).sort();
  const ids2 = out2.evidence.filter((e) => e.sourceType === "seo_analysis_derived").map((e) => e.evidenceId).sort();
  assert.deepEqual(ids1, ids2);
});
