import { test } from "node:test";
import assert from "node:assert/strict";

import { computeSeoScoreBreakdown, SEO_SCORE_GROUPS } from "./seoScoring.js";
import { analyzeSeoForPage } from "./seoAnalyzer.js";
import { buildEvidenceFromSeoFindings } from "./seoEvidence.js";

function goodPage() {
  return {
    url: "https://x.example/",
    httpStatus: 200,
    body: `<html lang="es"><head><meta charset="utf-8"><title>Club Pádel 04 — Reserva tu pista online</title><meta name="description" content="Club deportivo con pistas de pádel, reserva online, horarios y torneos todo el año en un solo sitio."><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://x.example/"><script type="application/ld+json">{"@type":"SportsActivityLocation","name":"Club Pádel 04"}</script></head><body><h1>Club Pádel 04</h1><img src="a.jpg" alt="pista de padel" width="10" height="10" loading="lazy"><a href="/reservas">Reservar pista ahora</a></body></html>`,
    headers: { "x-robots-tag": null, "content-language": "es" },
    robotsTxt: { available: true, content: "User-agent: *\nSitemap: https://x.example/sitemap.xml\n" },
    redirectChain: [],
  };
}

function badPage() {
  return { url: "http://x.example/", httpStatus: 200, body: "<html></html>", headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] };
}

function evidenceFor(page, profileId = "club-deportivo") {
  return buildEvidenceFromSeoFindings(analyzeSeoForPage(page), { profileId });
}

test("SEO_SCORE_GROUPS incluye como mínimo los 9 grupos del enunciado (Fase 5)", () => {
  for (const g of ["indexation", "metadata", "structure", "links", "images", "structuredData", "content", "local", "technical"]) {
    assert.ok(SEO_SCORE_GROUPS.includes(g), `falta el grupo "${g}"`);
  }
});

test("una página SEO razonable produce scores por grupo mayoritariamente positivos", () => {
  const breakdown = computeSeoScoreBreakdown(evidenceFor(goodPage()));
  assert.ok(breakdown.groups.metadata.score > 50, `metadata.score=${breakdown.groups.metadata.score}`);
  assert.ok(breakdown.groups.indexation.score > 50, `indexation.score=${breakdown.groups.indexation.score}`);
  assert.ok(breakdown.overall.score !== null);
});

test("una página con errores intencionados produce scores bajos, nunca null si hay evidencia evaluada", () => {
  const breakdown = computeSeoScoreBreakdown(evidenceFor(badPage()));
  assert.ok(breakdown.groups.metadata.score < 50, `metadata.score=${breakdown.groups.metadata.score}`);
  assert.ok(breakdown.groups.technical.score < 60, `technical.score=${breakdown.groups.technical.score}`);
});

test("sin evidencia de un grupo, el score de ese grupo es null (nunca 0 inventado)", () => {
  const breakdown = computeSeoScoreBreakdown([]);
  for (const group of SEO_SCORE_GROUPS) {
    assert.equal(breakdown.groups[group].score, null, `${group} debería ser null sin evidencia`);
  }
  assert.equal(breakdown.overall.score, null);
});

test("hallazgos 'no comprobables' (unavailable/unverified/blocked) no cuentan como fallo confirmado en cobertura", () => {
  const breakdown = computeSeoScoreBreakdown(evidenceFor(goodPage()));
  // images.heavyImages siempre es "unavailable" -> coverage del grupo images < 1
  assert.ok(breakdown.groups.images.coverage < 1, `coverage=${breakdown.groups.images.coverage}`);
  assert.ok(breakdown.groups.images.score !== null, "debe seguir habiendo score aunque un hallazgo no sea comprobable");
});

test("computeSeoScoreBreakdown ignora evidencia que no proviene de seoProvider", () => {
  const otherEvidence = [{ sourceType: "public_website_real", metadata: {}, relatedDimension: "trustSignals", signal: { strength: 1, polarity: "positive" }, confidence: 1 }];
  const breakdown = computeSeoScoreBreakdown(otherEvidence);
  assert.equal(breakdown.overall.score, null);
});

test("cada grupo declara confianza y cobertura numéricas entre 0 y 1", () => {
  const breakdown = computeSeoScoreBreakdown(evidenceFor(goodPage()));
  for (const group of SEO_SCORE_GROUPS) {
    const g = breakdown.groups[group];
    assert.ok(g.confidence >= 0 && g.confidence <= 1);
    assert.ok(g.coverage >= 0 && g.coverage <= 1);
  }
});

test("es determinista: misma evidencia -> mismo desglose", () => {
  const ev = evidenceFor(goodPage());
  assert.deepEqual(computeSeoScoreBreakdown(ev), computeSeoScoreBreakdown(ev));
});
