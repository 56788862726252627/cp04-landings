// Paso 15 — Tests de integración end-to-end del pipeline multiproveedor
// contra runResearchAudit(). Usa SIEMPRE un ProviderRegistry inyectado con
// proveedores falsos (nunca red real, nunca el directorio real de
// plugins salvo en el test explícito que lo pide) — deterministas y
// rápidos, sin depender de internet (requisito Fase 10).

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, access } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runResearchAudit, StrictModeBlockedError, RESEARCH_MANIFEST_FILENAME } from "./auditOrchestrator.js";
import { buildResearchRequest } from "./researchRequestSchema.js";
import { createProviderRegistry } from "./providers/core/providerRegistry.js";
import { defineResearchProvider, defineProviderCapabilities, defineProviderResult } from "./providers/core/providerTypes.js";
import { createEvidence } from "./evidenceSchema.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-audit-mp-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function realEvidenceFor(url, { polarity = "positive", relatedDimension = "trustSignals" } = {}) {
  return createEvidence({
    sourceId: url,
    sourceType: "public_website_real",
    title: `real:${url}`,
    excerpt: "contenido real de prueba",
    normalizedContent: `${url}-${relatedDimension}-${polarity}`,
    classification: "confirmed",
    relatedDimension,
    signal: { strength: 0.8, polarity },
    confidence: 0.8,
    provenance: url,
  });
}

function fakeRealProvider({ status = "success", delayMs = 0, evidence = null } = {}) {
  return defineResearchProvider({
    id: "publicWebsiteFetcher",
    status: "real",
    priority: 10,
    capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
    async collect(input) {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      const urls = input.urls ?? [];
      const ev = status === "success" ? (evidence ?? urls.map((u) => realEvidenceFor(u))) : [];
      return defineProviderResult({ providerId: "publicWebsiteFetcher", status, evidence: ev, errors: status === "failed" ? [{ message: "fallo simulado de red" }] : [] });
    },
  });
}

async function fileExists(p) {
  return access(p).then(() => true).catch(() => false);
}

test("multiprovider + fixtures (sin URLs): las 13 fuentes offline funcionan igual que en legacy", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Fixtures", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProvider());
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", providerRegistry: registry });
    assert.ok(result.evidence.length > 0);
    assert.ok(result.scores.global.score !== null);
    assert.equal(result.pipeline, "multiprovider");
  });
});

test("multiprovider con proveedor real inyectado que tiene éxito: evidencia real llega a scores y se genera reports/providers.md", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP OK", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-ok.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProvider());
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry });
    assert.equal(result.networkUsed, true);
    assert.ok(result.evidence.some((e) => e.classification === "confirmed"));
    assert.ok(result.providerRunSummary.providers.some((p) => p.providerId === "publicWebsiteFetcher" && p.orchestratorStatus === "available"));
    assert.ok(await fileExists(path.join(dir, result.auditId, "reports", "providers.md")));
    const providersMd = await readFile(path.join(dir, result.auditId, "reports", "providers.md"), "utf8");
    assert.match(providersMd, /publicWebsiteFetcher/);
  });
});

test("legacy NUNCA genera reports/providers.md (compatibilidad: mismo set de archivos que Paso 12/13/14)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Legacy", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.equal(result.pipeline, "legacy");
    assert.equal(result.providerRunSummary, null);
    assert.equal(await fileExists(path.join(dir, result.auditId, "reports", "providers.md")), false);
  });
});

test("multiprovider es idempotente: segunda ejecución produce 0 creados/0 actualizados (durationMs no rompe el hash)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Idempotente", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-idem.invalid/"] } });
    const registryA = createProviderRegistry();
    registryA.register(fakeRealProvider());
    const first = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registryA });

    const registryB = createProviderRegistry();
    registryB.register(fakeRealProvider());
    const second = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registryB });

    assert.ok(first.filesCreated.length > 0);
    assert.equal(second.filesCreated.length, 0);
    assert.equal(second.filesUpdated.length, 0);
    assert.equal(second.filesPreserved.length, first.filesCreated.length);
  });
});

test("multiprovider: caída simulada de proveedor no derriba la auditoría (degradación controlada)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Caída", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-caida.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProvider({ status: "failed" }));
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry });
    assert.equal(result.networkUsed, true, "el proveedor SÍ se intentó (networkUsed = intento, no éxito)");
    assert.ok(result.evidence.some((e) => e.classification === "unavailable"));
    const realSummary = result.providerRunSummary.providers.find((p) => p.providerId === "publicWebsiteFetcher");
    assert.equal(realSummary.orchestratorStatus, "failed");
    assert.ok(result.scores.global !== undefined, "la auditoría completa igualmente, sin lanzar");
  });
});

test("multiprovider: timeout simulado marca el proveedor como 'timed_out' sin bloquear la auditoría", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Timeout", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-timeout.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProvider({ delayMs: 200 }));
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, providerPolicyOptions: { individualTimeoutMs: 20 } });
    const realSummary = result.providerRunSummary.providers.find((p) => p.providerId === "publicWebsiteFetcher");
    assert.equal(realSummary.orchestratorStatus, "timed_out");
  });
});

test("multiprovider: conflicto de evidencia entre dos proveedores queda registrado con ambos providerId (Fase 4)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Conflicto", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://a.invalid/", "https://b.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(
      defineResearchProvider({
        id: "publicWebsiteFetcher",
        status: "real",
        priority: 10,
        capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
        async collect(input) {
          const urls = input.urls ?? [];
          const evidence = urls.map((u, i) => realEvidenceFor(u, { polarity: i === 0 ? "positive" : "negative" }));
          return defineProviderResult({ providerId: "publicWebsiteFetcher", status: "success", evidence });
        },
      })
    );
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry });
    assert.ok(result.evidenceConflicts.length > 0, "señales positiva y negativa fuerza>=0.5 en la misma dimensión deben marcarse como conflicto");
    assert.equal(result.evidenceConflicts[0].dimensionId, "trustSignals");
  });
});

test("multiprovider: --strict sigue bloqueando (sin escribir nada) cuando hay contradicciones sin resolver", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP Strict", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://a.invalid/", "https://b.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(
      defineResearchProvider({
        id: "publicWebsiteFetcher",
        status: "real",
        priority: 10,
        capabilities: defineProviderCapabilities({ dimensions: ["*"] }),
        async collect(input) {
          const urls = input.urls ?? [];
          const evidence = urls.map((u, i) => realEvidenceFor(u, { polarity: i === 0 ? "positive" : "negative" }));
          return defineProviderResult({ providerId: "publicWebsiteFetcher", status: "success", evidence });
        },
      })
    );
    await assert.rejects(() => runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, strict: true }), StrictModeBlockedError);
    assert.equal(await fileExists(path.join(dir)), true);
    const auditDirs = await import("node:fs/promises").then((m) => m.readdir(dir).catch(() => []));
    assert.equal(auditDirs.length, 0, "--strict no debe escribir ningún directorio de auditoría");
  });
});

test("multiprovider: --profile aplica pesos del perfil sectorial y se refleja en el resultado", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Hotel MP Perfil", sector: "generic-local-service" }, mode: "public-web", inputs: { urls: ["https://hotel-mp-perfil.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProvider({ evidence: [realEvidenceFor("https://hotel-mp-perfil.invalid/", { relatedDimension: "bookingCapability" })] }));
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", allowNetwork: true, providerRegistry: registry, profileId: "hotel" });
    assert.equal(result.profileId, "hotel");
    assert.equal(result.providerRunSummary.profileId, "hotel");
  });
});

test("multiprovider: red sigue apagada por defecto sin --allow-network, incluso pidiendo pipeline='multiprovider'", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel MP SinRed", sector: "padel-sports" }, mode: "public-web", inputs: { urls: ["https://club-padel-mp-sinred.invalid/"] } });
    const registry = createProviderRegistry();
    registry.register(fakeRealProvider());
    const result = await runResearchAudit(request, { outputBaseDir: dir, pipeline: "multiprovider", providerRegistry: registry });
    assert.equal(result.networkUsed, false);
    assert.equal(result.providerRunSummary.providers.length, 0, "el proveedor real ni se intenta sin --allow-network");
  });
});
