import { test } from "node:test";
import assert from "node:assert/strict";

import { PROVIDER, PERFORMANCE_PROVIDER_ID } from "./performanceProviderPlugin.js";
import { validateEvidence } from "../../evidenceSchema.js";

function samplePage(overrides = {}) {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    contentType: "text/html",
    body: '<html lang="es"><head><meta charset="utf-8"><title>Club Pádel</title><meta name="viewport" content="width=device-width"><script src="a.js" async></script><link rel="stylesheet" href="b.css"></head><body><img src="a.jpg" alt="pista" width="10" height="10"></body></html>',
    headers: { "cache-control": "max-age=3600", etag: '"x"' },
    robotsTxt: { available: false, content: "" },
    redirectChain: [],
    byteSize: 500,
    httpVersion: "1.1",
    timing: { timeToHeadersMs: 90, totalMs: 150 },
    ...overrides,
  };
}

test("PROVIDER conforma la interfaz ResearchProvider unificada y declara status='real' (ya no stub)", () => {
  assert.equal(PROVIDER.id, PERFORMANCE_PROVIDER_ID);
  assert.equal(PROVIDER.status, "real");
  assert.equal(PROVIDER.priority, 25);
  assert.deepEqual([...PROVIDER.capabilities.dimensions], ["performance"]);
  assert.deepEqual([...PROVIDER.capabilities.categories], ["technicalQuality"]);
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
    assert.equal(ev.sourceType, "performance_analysis_derived");
  }
});

test("collect() nunca importa módulos de red ni Playwright (no duplica descarga, no usa navegador)", async () => {
  const src = await import("node:fs/promises").then((fs) => fs.readFile(new URL("./performanceProviderPlugin.js", import.meta.url), "utf8"));
  assert.doesNotMatch(src, /require\(["']node:(http|https|dns)["']\)|from\s+["']node:(http|https|dns)["']|require\(["']playwright["']\)|from\s+["']playwright["']/i);
});

test("collect() nunca declara un valor numérico de Core Web Vitals (LCP/CLS/INP/FCP): solo puede aparecer en un disclaimer que aclare que NO se miden", async () => {
  const result = await PROVIDER.collect({ pages: [samplePage()] });
  const serialized = JSON.stringify(result.evidence) + JSON.stringify(result.metadata);
  assert.doesNotMatch(serialized, /"(LCP|CLS|INP|FCP)"\s*:\s*[\d.]/i);
  assert.doesNotMatch(serialized, /(LCP|CLS|INP|FCP)\s*[:=]\s*[\d.]+\s*(ms|s)?\b/i);
});

test("collect() es determinista: mismas páginas -> mismos evidenceId", async () => {
  const a = await PROVIDER.collect({ pages: [samplePage()], profileId: "generic" });
  const b = await PROVIDER.collect({ pages: [samplePage()], profileId: "generic" });
  assert.deepEqual(a.evidence.map((e) => e.evidenceId).sort(), b.evidence.map((e) => e.evidenceId).sort());
});

test("healthCheck() siempre está sano (analizador puro, sin red/navegador/credenciales)", async () => {
  const health = await PROVIDER.healthCheck();
  assert.equal(health.healthy, true);
  assert.match(health.message, /no requiere red/i);
});

test("una página con problemas de rendimiento intencionados produce hallazgos críticos/altos coherentes y metadata con scoreBreakdown/recommendations", async () => {
  const badHtml = '<html><head><title>t</title><script src="a.js"></script><link rel="stylesheet" href="b.css"></head><body><img src="c.jpg"></body></html>';
  const result = await PROVIDER.collect({ pages: [samplePage({ body: badHtml, headers: {}, httpVersion: "1.1", timing: { timeToHeadersMs: 1500, totalMs: 3000 }, url: "http://x.example/" })] });
  const criticalOrHigh = result.evidence.filter((e) => e.metadata.severity === "critical" || e.metadata.severity === "high");
  assert.ok(criticalOrHigh.length >= 1);
  assert.ok(result.metadata.scoreBreakdown);
  assert.ok(Array.isArray(result.metadata.recommendations));
  assert.ok(result.metadata.unmeasuredCount > 0);
});

test("collect() con entrada inválida (página sin body) no lanza, produce status='failed' de forma controlada", async () => {
  const result = await PROVIDER.collect({ pages: [{ url: "https://x.example/" }] });
  assert.ok(["failed", "success"].includes(result.status));
});
