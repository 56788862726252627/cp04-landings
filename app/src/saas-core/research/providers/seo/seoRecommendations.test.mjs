import { test } from "node:test";
import assert from "node:assert/strict";

import { buildSeoRecommendations, groupSeoRecommendationsBySeverity, RECOMMENDATION_SEVERITIES } from "./seoRecommendations.js";
import { analyzeSeoForPage, analyzeSeoForPages } from "./seoAnalyzer.js";

function badPage(url = "http://x.example/") {
  return { url, httpStatus: 200, body: "<html></html>", headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] };
}

test("solo se generan recomendaciones a partir de hallazgos negativos/oportunidad, nunca de hallazgos positivos", () => {
  const goodPage = { url: "https://x.example/", httpStatus: 200, body: '<html lang="es"><head><meta charset="utf-8"><title>Un título correcto y descriptivo</title><meta name="description" content="Una descripción de longitud adecuada para aparecer completa en buscadores, con suficiente detalle."><meta name="viewport" content="w"><link rel="canonical" href="https://x.example/"></head><body><h1>ok</h1></body></html>', headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] };
  const recos = buildSeoRecommendations(analyzeSeoForPage(goodPage));
  assert.ok(recos.every((r) => r.severity !== "not_evaluable"));
  assert.ok(!recos.some((r) => r.id === "reco.seo.metadata.title"));
});

test("una página con errores produce recomendaciones críticas/altas con procedencia y criterio de aceptación", () => {
  const recos = buildSeoRecommendations(analyzeSeoForPage(badPage()));
  assert.ok(recos.length > 0);
  const titleReco = recos.find((r) => r.id === "reco.seo.metadata.title");
  assert.ok(titleReco);
  assert.equal(titleReco.severity, "critical");
  assert.ok(titleReco.acceptanceCriteria.length > 0);
  assert.ok(titleReco.provenance.startsWith("seoProvider:"));
  assert.deepEqual(titleReco.affectedUrls, ["http://x.example/"]);
});

test("recomendaciones ordenadas por severidad (crítico primero)", () => {
  const recos = buildSeoRecommendations(analyzeSeoForPage(badPage()));
  const severityRank = Object.fromEntries(RECOMMENDATION_SEVERITIES.map((s, i) => [s, i]));
  for (let i = 1; i < recos.length; i++) {
    assert.ok(severityRank[recos[i - 1].severity] <= severityRank[recos[i].severity]);
  }
});

test("la misma regla incumplida en varias páginas del lote se deduplica en UNA recomendación con todas las URLs", () => {
  const pageA = badPage("http://x.example/a");
  const pageB = badPage("http://x.example/b");
  const findings = analyzeSeoForPages([pageA, pageB]);
  const recos = buildSeoRecommendations(findings);
  const titleRecos = recos.filter((r) => r.id === "reco.seo.metadata.title");
  assert.equal(titleRecos.length, 1, "no debe haber una recomendación por página para la misma regla");
  assert.deepEqual(titleRecos[0].affectedUrls.sort(), ["http://x.example/a", "http://x.example/b"]);
});

test("ninguna recomendación promete resultados de posicionamiento (nunca menciona 'subirás'/'primer lugar'/'garantizado')", () => {
  const recos = buildSeoRecommendations(analyzeSeoForPage(badPage()));
  for (const r of recos) {
    assert.doesNotMatch(`${r.title} ${r.explanation} ${r.acceptanceCriteria}`, /garantiz|subirás|primer lugar|top 1|posición #1/i);
  }
});

test("groupSeoRecommendationsBySeverity agrupa en los 6 baldes del enunciado", () => {
  const recos = buildSeoRecommendations(analyzeSeoForPage(badPage()));
  const grouped = groupSeoRecommendationsBySeverity(recos);
  for (const s of RECOMMENDATION_SEVERITIES) assert.ok(Array.isArray(grouped[s]));
  assert.ok(grouped.critical.length > 0);
});

test("cada recomendación declara esfuerzo estimado y confianza numérica", () => {
  const recos = buildSeoRecommendations(analyzeSeoForPage(badPage()));
  for (const r of recos) {
    assert.ok(["low", "medium", "high"].includes(r.effort));
    assert.ok(r.confidence >= 0 && r.confidence <= 1);
  }
});
