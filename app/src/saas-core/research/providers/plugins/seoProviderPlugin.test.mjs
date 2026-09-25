import { test } from "node:test";
import assert from "node:assert/strict";

import { PROVIDER, SEO_PROVIDER_ID } from "./seoProviderPlugin.js";
import { validateEvidence } from "../../evidenceSchema.js";

function samplePage(overrides = {}) {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    contentType: "text/html",
    body: "<html><head><title>Club Pádel</title><meta name=\"description\" content=\"Reserva tu pista de pádel hoy mismo en nuestro club deportivo.\"></head><body><h1>Bienvenido</h1></body></html>",
    headers: { "x-robots-tag": null, "content-language": "es" },
    robotsTxt: { available: false, content: "" },
    redirectChain: [],
    ...overrides,
  };
}

test("PROVIDER conforma la interfaz ResearchProvider unificada y declara status='real' (ya no stub)", () => {
  assert.equal(PROVIDER.id, SEO_PROVIDER_ID);
  assert.equal(PROVIDER.status, "real");
  assert.equal(PROVIDER.priority, 15);
  assert.deepEqual([...PROVIDER.capabilities.dimensions].sort(), ["seoContent", "seoLocal", "seoTechnical"]);
  assert.deepEqual([...PROVIDER.capabilities.categories], ["seo"]);
  assert.deepEqual([...PROVIDER.credentialsNeeded], []);
});

test("collect() sin `pages` devuelve status='skipped', nunca inventa evidencia", async () => {
  const result = await PROVIDER.collect({});
  assert.equal(result.status, "skipped");
  assert.deepEqual(result.evidence, []);
});

test("collect() con `pages` produce evidencia real válida contra evidenceSchema.js", async () => {
  const result = await PROVIDER.collect({ pages: [samplePage()], profileId: "club-deportivo" });
  assert.equal(result.status, "success");
  assert.ok(result.evidence.length > 0);
  for (const ev of result.evidence) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
    assert.equal(ev.sourceType, "seo_analysis_derived");
  }
});

test("collect() nunca importa módulos de red (no duplica la descarga)", async () => {
  const src = await import("node:fs/promises").then((fs) => fs.readFile(new URL("./seoProviderPlugin.js", import.meta.url), "utf8"));
  assert.doesNotMatch(src, /require\(["']node:(http|https|dns)["']\)|from ["']node:(http|https|dns)["']/);
});

test("collect() es determinista: mismas páginas -> mismo número de evidencias y mismos evidenceId", async () => {
  const a = await PROVIDER.collect({ pages: [samplePage()], profileId: "generic" });
  const b = await PROVIDER.collect({ pages: [samplePage()], profileId: "generic" });
  assert.equal(a.evidence.length, b.evidence.length);
  assert.deepEqual(a.evidence.map((e) => e.evidenceId).sort(), b.evidence.map((e) => e.evidenceId).sort());
});

test("collect() con dos páginas detecta comprobaciones cross-page (title duplicado)", async () => {
  const p1 = samplePage({ url: "https://x.example/a" });
  const p2 = samplePage({ url: "https://x.example/b" });
  const result = await PROVIDER.collect({ pages: [p1, p2] });
  assert.ok(result.evidence.some((e) => e.metadata.ruleId === "seo.metadata.duplicateTitle"));
});

test("healthCheck() siempre está sano (analizador puro, sin red ni credenciales)", async () => {
  const health = await PROVIDER.healthCheck();
  assert.equal(health.healthy, true);
  assert.equal(typeof health.message, "string");
});

test("un HTML con múltiples errores intencionados produce hallazgos críticos/altos coherentes", async () => {
  const badHtml = "<html><body></body></html>"; // sin title, sin description, sin h1, http (no https)
  const result = await PROVIDER.collect({ pages: [samplePage({ url: "http://x.example/", body: badHtml })] });
  const critical = result.evidence.filter((e) => e.metadata.severity === "critical");
  assert.ok(critical.length >= 2, "se esperaban al menos 2 hallazgos críticos (sin title, http sin cifrar)");
});
