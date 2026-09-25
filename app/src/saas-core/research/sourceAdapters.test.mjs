import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { SOURCE_ADAPTERS, SOURCE_ADAPTER_IDS, getSourceAdapter, evidenceFromHtmlText, SourceAdapterError, LOCAL_HTML_ADAPTER, LOCAL_JSON_ADAPTER, LOCAL_MARKDOWN_ADAPTER } from "./sourceAdapters.js";
import { validateEvidence } from "./evidenceSchema.js";

const GOOD_HTML = `<!doctype html><html><head><meta name="viewport" content="w"><link rel="manifest" href="/m.json"><title>Negocio de Ejemplo Málaga</title><meta name="description" content="Una descripción suficientemente larga para pasar el umbral mínimo de longitud recomendado."><script type="application/ld+json">{}</script><link rel="canonical" href="https://x.invalid/"></head><body><header><nav><a href="/">a</a></nav></header><h1>a</h1><h2>b</h2><img src="a.jpg" alt="foto"><form class="reserva"><input required></form><p>Reserva ahora. Llama al 912345678.</p><a href="https://facebook.com/x">FB</a></body></html>`;

test("SOURCE_ADAPTER_IDS contiene los 13 adaptadores offline del enunciado", () => {
  assert.equal(SOURCE_ADAPTER_IDS.length, 13);
  for (const id of ["local_html", "local_json", "local_markdown", "fixture_website", "mock_directory", "mock_maps_listing", "mock_social_presence", "mock_review_summary", "mock_performance", "mock_accessibility", "mock_seo", "mock_technology_detector", "mock_competitor"]) {
    assert.ok(SOURCE_ADAPTER_IDS.includes(id), `falta adaptador: ${id}`);
  }
});

test("cada adaptador declara el contrato completo (name/version/capabilities/limits/collect/healthCheck)", async () => {
  for (const adapter of Object.values(SOURCE_ADAPTERS)) {
    assert.ok(adapter.id);
    assert.ok(adapter.capabilities.length > 0);
    assert.ok(adapter.limits.timeoutMs > 0);
    assert.equal(typeof adapter.collect, "function");
    const health = await adapter.healthCheck();
    assert.equal(health.healthy, true);
  }
});

test("getSourceAdapter devuelve null para un id desconocido", () => {
  assert.equal(getSourceAdapter("no_existe"), null);
  assert.equal(getSourceAdapter("local_html"), LOCAL_HTML_ADAPTER);
});

test("evidenceFromHtmlText produce evidencia válida y con polaridad positiva coherente para HTML moderno", () => {
  const list = evidenceFromHtmlText("fixture-1", GOOD_HTML);
  assert.ok(list.length >= 10);
  for (const ev of list) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
  }
  const mobile = list.find((e) => e.relatedDimension === "mobileExperience");
  assert.equal(mobile.signal.polarity, "positive");
  const booking = list.find((e) => e.relatedDimension === "bookingCapability");
  assert.equal(booking.signal.polarity, "positive");
});

test("evidenceFromHtmlText detecta señales negativas para HTML anticuado sin viewport/manifest/booking", () => {
  const oldHtml = "<html><head><title>x</title></head><body><table><tr><td>club</td></tr></table></body></html>";
  const list = evidenceFromHtmlText("fixture-2", oldHtml);
  const mobile = list.find((e) => e.relatedDimension === "mobileExperience");
  assert.equal(mobile.signal.polarity, "negative");
  const booking = list.find((e) => e.relatedDimension === "bookingCapability");
  assert.equal(booking.signal.polarity, "negative");
});

test("evidenceFromHtmlText sobre un snapshot HTML completamente vacío no lanza y produce evidencia válida", () => {
  const list = evidenceFromHtmlText("fixture-vacio", "");
  assert.ok(list.length > 0);
  for (const ev of list) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
  }
});

test("LOCAL_HTML_ADAPTER.collect lee un archivo real dentro de un directorio temporal seguro", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-"));
  try {
    await writeFile(path.join(dir, "index.html"), GOOD_HTML, "utf8");
    const evidence = await LOCAL_HTML_ADAPTER.collect({ sourceId: "s1", filePath: "index.html", baseDir: dir });
    assert.ok(evidence.length > 0);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("LOCAL_HTML_ADAPTER.collect rechaza un path traversal", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-"));
  try {
    await assert.rejects(() => LOCAL_HTML_ADAPTER.collect({ sourceId: "s1", filePath: "../../../etc/passwd", baseDir: dir }), SourceAdapterError);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("LOCAL_JSON_ADAPTER.collect parsea evidencia estructurada desde JSON local", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-"));
  try {
    await writeFile(path.join(dir, "data.json"), JSON.stringify({ evidence: [{ relatedDimension: "trustSignals", title: "t", excerpt: "e", polarity: "positive" }] }), "utf8");
    const evidence = await LOCAL_JSON_ADAPTER.collect({ sourceId: "s1", filePath: "data.json", baseDir: dir });
    assert.equal(evidence.length, 1);
    assert.equal(evidence[0].relatedDimension, "trustSignals");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("LOCAL_JSON_ADAPTER.collect lanza SourceAdapterError con JSON corrupto (sin proceso caído)", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-"));
  try {
    await writeFile(path.join(dir, "roto.json"), "{ esto no es json ", "utf8");
    await assert.rejects(() => LOCAL_JSON_ADAPTER.collect({ sourceId: "s1", filePath: "roto.json", baseDir: dir }), SourceAdapterError);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("LOCAL_MARKDOWN_ADAPTER.collect analiza estructura y menciones de servicio en Markdown", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-"));
  try {
    await writeFile(path.join(dir, "doc.md"), "# Servicios\n\n## Fisioterapia\n\nOfrecemos tratamiento de fisioterapia deportiva y rehabilitación para todo tipo de pacientes con seguimiento personalizado.", "utf8");
    const evidence = await LOCAL_MARKDOWN_ADAPTER.collect({ sourceId: "s1", filePath: "doc.md", baseDir: dir });
    const serviceClarity = evidence.find((e) => e.relatedDimension === "serviceClarity");
    assert.equal(serviceClarity.signal.polarity, "positive");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("MOCK_MAPS_LISTING_ADAPTER.collect produce evidencia coherente con rating alto vs bajo", async () => {
  const adapter = SOURCE_ADAPTERS.mock_maps_listing;
  const good = await adapter.collect({ sourceId: "s", rating: 4.8, reviewCount: 40, addressComplete: true, hoursListed: true });
  const bad = await adapter.collect({ sourceId: "s", rating: 2.5, reviewCount: 40, addressComplete: false, hoursListed: false });
  assert.equal(good.find((e) => e.relatedDimension === "publicReputation").signal.polarity, "positive");
  assert.equal(bad.find((e) => e.relatedDimension === "publicReputation").signal.polarity, "negative");
});

test("MOCK_REVIEW_SUMMARY_ADAPTER.collect: buena reputación + mala conversión es un caso representable (dimensiones independientes)", async () => {
  const adapter = SOURCE_ADAPTERS.mock_review_summary;
  const evidence = await adapter.collect({ sourceId: "s", averageRating: 4.7, reviewCount: 50, negativeReviewRatio: 0.05 });
  assert.equal(evidence.find((e) => e.relatedDimension === "publicReputation").signal.polarity, "positive");
  assert.equal(evidence.find((e) => e.relatedDimension === "reputationalRisk").signal.polarity, "positive");
});

test("MOCK_ACCESSIBILITY_ADAPTER.collect penaliza violaciones críticas", async () => {
  const adapter = SOURCE_ADAPTERS.mock_accessibility;
  const bad = await adapter.collect({ sourceId: "s", violations: [{ severity: "critical" }, { severity: "moderate" }], score: 40 });
  assert.equal(bad[0].signal.polarity, "negative");
});

test("MOCK_TECHNOLOGY_DETECTOR_ADAPTER.collect detecta automatización observable por widget de reserva", async () => {
  const adapter = SOURCE_ADAPTERS.mock_technology_detector;
  const evidence = await adapter.collect({ sourceId: "s", technologies: ["WordPress", "Google Analytics"], hasBookingWidget: true, hasCrmPixel: false });
  assert.equal(evidence.find((e) => e.relatedDimension === "observableAutomation").signal.polarity, "positive");
});

test("todas las evidencias producidas por todos los adaptadores mock son válidas según evidenceSchema", async () => {
  const cases = [
    [SOURCE_ADAPTERS.mock_directory, { sourceId: "s", listings: [{ name: "Guía Local", category: "salud" }], businessListed: true }],
    [SOURCE_ADAPTERS.mock_social_presence, { sourceId: "s", platforms: [{ name: "Instagram", followers: 500, lastPostDaysAgo: 5 }] }],
    [SOURCE_ADAPTERS.mock_performance, { sourceId: "s", performanceScore: 55, lcpMs: 4200 }],
    [SOURCE_ADAPTERS.mock_seo, { sourceId: "s", sitemapPresent: false, structuredDataPresent: false, indexablePages: 3 }],
  ];
  for (const [adapter, input] of cases) {
    const evidence = await adapter.collect(input);
    for (const ev of evidence) {
      const { valid, errors } = validateEvidence(ev);
      assert.equal(valid, true, `${adapter.id}: ${JSON.stringify(errors)}`);
    }
  }
});
