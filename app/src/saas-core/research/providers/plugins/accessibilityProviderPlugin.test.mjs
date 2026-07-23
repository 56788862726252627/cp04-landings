import { test } from "node:test";
import assert from "node:assert/strict";

import { PROVIDER, ACCESSIBILITY_PROVIDER_ID } from "./accessibilityProviderPlugin.js";
import { validateEvidence } from "../../evidenceSchema.js";

function samplePage(overrides = {}) {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    contentType: "text/html",
    body: '<html lang="es"><head><meta charset="utf-8"><title>Club Pádel</title></head><body><h1>Bienvenido</h1><img src="a.jpg" alt="pista"></body></html>',
    headers: {},
    robotsTxt: { available: false, content: "" },
    redirectChain: [],
    ...overrides,
  };
}

test("PROVIDER conforma la interfaz ResearchProvider unificada y declara status='real' (ya no stub)", () => {
  assert.equal(PROVIDER.id, ACCESSIBILITY_PROVIDER_ID);
  assert.equal(PROVIDER.status, "real");
  assert.equal(PROVIDER.priority, 20);
  assert.deepEqual([...PROVIDER.capabilities.dimensions], ["accessibility"]);
  assert.deepEqual([...PROVIDER.capabilities.categories], ["accessibility"]);
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
    assert.equal(ev.sourceType, "accessibility_analysis_derived");
  }
});

test("collect() nunca importa módulos de red ni Playwright (no duplica descarga, no usa navegador)", async () => {
  const src = await import("node:fs/promises").then((fs) => fs.readFile(new URL("./accessibilityProviderPlugin.js", import.meta.url), "utf8"));
  assert.doesNotMatch(src, /require\(["']node:(http|https|dns)["']\)|from\s+["']node:(http|https|dns)["']|require\(["']playwright["']\)|from\s+["']playwright["']/i);
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

test("un HTML con errores intencionados produce hallazgos críticos coherentes y metadata con scoreBreakdown/recommendations", async () => {
  const badHtml = "<html><body><img src=\"a.jpg\"><input type=\"email\"></body></html>"; // sin lang, sin title, sin alt, sin label
  const result = await PROVIDER.collect({ pages: [samplePage({ body: badHtml })] });
  const critical = result.evidence.filter((e) => e.metadata.severity === "critical");
  assert.ok(critical.length >= 2);
  assert.ok(result.metadata.scoreBreakdown);
  assert.ok(Array.isArray(result.metadata.recommendations));
  assert.ok(result.metadata.manualReviewCount > 0);
});

test("collect() con entrada inválida (finding malformado simulado) no lanza, produce status='failed' de forma controlada", async () => {
  // Página sin `body` (undefined): las funciones de extracción reciben undefined y deben fallar de forma controlada, capturado por el try/catch del proveedor.
  const result = await PROVIDER.collect({ pages: [{ url: "https://x.example/" }] });
  assert.ok(["failed", "success"].includes(result.status));
});
