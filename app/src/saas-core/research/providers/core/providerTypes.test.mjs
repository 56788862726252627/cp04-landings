import { test } from "node:test";
import assert from "node:assert/strict";

import { defineProviderCapabilities, defineProviderHealth, defineProviderResult, defineResearchProvider, defineStubProvider, PROVIDER_STATUSES, DEFAULT_PROVIDER_PRIORITY } from "./providerTypes.js";

test("defineProviderCapabilities aplica defaults y congela los arrays", () => {
  const caps = defineProviderCapabilities({ dimensions: ["seoTechnical"], categories: ["seo"] });
  assert.deepEqual([...caps.dimensions], ["seoTechnical"]);
  assert.throws(() => caps.dimensions.push("x"));
});

test("defineProviderHealth normaliza healthy a booleano", () => {
  const h = defineProviderHealth({ healthy: 1, mode: "stub", message: "ok" });
  assert.equal(h.healthy, true);
});

test("defineProviderResult rechaza un status desconocido", () => {
  assert.throws(() => defineProviderResult({ providerId: "x", status: "inventado" }));
});

test("defineProviderResult acepta todos los status válidos del enunciado", () => {
  for (const status of ["success", "partial", "failed", "not_implemented", "skipped", "timeout", "cancelled"]) {
    const result = defineProviderResult({ providerId: "x", status });
    assert.equal(result.status, status);
  }
});

test("defineResearchProvider exige id no vacío", () => {
  assert.throws(() => defineResearchProvider({ status: "stub", collect: async () => {} }));
  assert.throws(() => defineResearchProvider({ id: "", status: "stub", collect: async () => {} }));
});

test("defineResearchProvider rechaza un status fuera de PROVIDER_STATUSES", () => {
  assert.throws(() => defineResearchProvider({ id: "x", status: "raro", collect: async () => {} }));
});

test("defineResearchProvider exige collect como función", () => {
  assert.throws(() => defineResearchProvider({ id: "x", status: "stub" }));
});

test("defineResearchProvider aplica DEFAULT_PROVIDER_PRIORITY cuando no se indica prioridad", () => {
  const provider = defineResearchProvider({ id: "x", status: "stub", collect: async () => {} });
  assert.equal(provider.priority, DEFAULT_PROVIDER_PRIORITY);
});

test("defineResearchProvider genera un healthCheck por defecto coherente con el status", () => {
  const provider = defineResearchProvider({ id: "x", status: "stub", collect: async () => {} });
  return provider.healthCheck().then((health) => {
    assert.equal(health.healthy, true);
    assert.equal(health.mode, "stub");
  });
});

test("PROVIDER_STATUSES incluye real/stub/disabled", () => {
  assert.deepEqual([...PROVIDER_STATUSES], ["real", "stub", "disabled"]);
});

test("defineStubProvider produce un ProviderResult not_implemented con evidencia placeholder por dimensión", async () => {
  const provider = defineStubProvider({ id: "seoProvider", label: "SEO Provider", capabilities: defineProviderCapabilities({ dimensions: ["seoTechnical", "seoContent"] }), priority: 40 });
  const result = await provider.collect({}, {});
  assert.equal(result.status, "not_implemented");
  assert.equal(result.evidence.length, 2);
  assert.equal(result.evidence[0].classification, "unknown");
});

test("defineStubProvider nunca hace red ni lanza, incluso sin input", async () => {
  const provider = defineStubProvider({ id: "dnsProvider", label: "DNS Provider", capabilities: defineProviderCapabilities({ dimensions: [] }) });
  const result = await provider.collect();
  assert.equal(result.status, "not_implemented");
  assert.deepEqual([...result.evidence], []);
});

test("defineStubProvider healthCheck siempre reporta healthy=true (preparado, no roto)", async () => {
  const provider = defineStubProvider({ id: "whoisProvider", label: "Whois Provider", capabilities: defineProviderCapabilities() });
  const health = await provider.healthCheck();
  assert.equal(health.healthy, true);
  assert.equal(health.mode, "stub");
});
