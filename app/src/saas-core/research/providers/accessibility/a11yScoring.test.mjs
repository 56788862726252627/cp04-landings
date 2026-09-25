import { test } from "node:test";
import assert from "node:assert/strict";

import { computeA11yScoreBreakdown, A11Y_SCORE_GROUPS } from "./a11yScoring.js";
import { analyzeAccessibilityForPage } from "./a11yAnalyzer.js";
import { buildEvidenceFromA11yFindings } from "./a11yEvidence.js";

function goodPage() {
  return {
    url: "https://x.example/",
    body: `<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Club Pádel 04</title></head><body><a href="#main">Saltar al contenido</a><nav></nav><h1>Club Pádel 04</h1><img src="a.jpg" alt="pista de padel"><label for="tel">Teléfono</label><input id="tel" type="tel" autocomplete="tel"><button>Reservar</button></body></html>`,
  };
}
function badPage() {
  return { url: "https://x.example/", body: "<html><head></head><body><img src=\"a.jpg\"><input type=\"email\"><button></button></body></html>" };
}
function evidenceFor(page, profileId = "generic") {
  return buildEvidenceFromA11yFindings(analyzeAccessibilityForPage(page, { profileId }), { profileId });
}

test("A11Y_SCORE_GROUPS incluye exactamente los 9 grupos del enunciado (Fase 5)", () => {
  for (const g of ["structure", "images", "forms", "navigation", "aria", "tables", "keyboard", "contrast", "content"]) {
    assert.ok(A11Y_SCORE_GROUPS.includes(g), `falta el grupo "${g}"`);
  }
  assert.equal(A11Y_SCORE_GROUPS.length, 9);
});

test("una página accesible razonable produce scores mayoritariamente positivos", () => {
  const breakdown = computeA11yScoreBreakdown(evidenceFor(goodPage()));
  assert.ok(breakdown.groups.structure.score > 50, `structure=${breakdown.groups.structure.score}`);
  assert.ok(breakdown.groups.images.score > 50, `images=${breakdown.groups.images.score}`);
  assert.ok(breakdown.overall.score !== null);
});

test("una página con errores de accesibilidad produce scores bajos", () => {
  const breakdown = computeA11yScoreBreakdown(evidenceFor(badPage()));
  assert.ok(breakdown.groups.structure.score < 50, `structure=${breakdown.groups.structure.score}`);
  assert.ok(breakdown.groups.forms.score < 50, `forms=${breakdown.groups.forms.score}`);
});

test("sin evidencia de un grupo, el score es null (nunca 0 inventado)", () => {
  const breakdown = computeA11yScoreBreakdown([]);
  for (const group of A11Y_SCORE_GROUPS) assert.equal(breakdown.groups[group].score, null);
  assert.equal(breakdown.overall.score, null);
});

test("las comprobaciones manuales/no evaluables no se penalizan como fallo (reducen cobertura, no score)", () => {
  const breakdown = computeA11yScoreBreakdown(evidenceFor(goodPage()));
  assert.ok(breakdown.groups.contrast.manualReviewCount > 0);
  assert.ok(breakdown.groups.keyboard.manualReviewCount > 0);
  // el grupo keyboard tiene señales positivas (skip link) pese a incluir una comprobación manual
  assert.ok(breakdown.groups.keyboard.score !== null);
});

test("el desglose incluye un disclaimer explícito: no es certificación legal", () => {
  const breakdown = computeA11yScoreBreakdown(evidenceFor(goodPage()));
  assert.match(breakdown.disclaimer, /no constituye una certificación/i);
});

test("computeA11yScoreBreakdown ignora evidencia que no proviene de accessibilityProvider", () => {
  const otherEvidence = [{ sourceType: "seo_analysis_derived", metadata: {}, relatedDimension: "seoTechnical", signal: { strength: 1, polarity: "positive" }, confidence: 1 }];
  assert.equal(computeA11yScoreBreakdown(otherEvidence).overall.score, null);
});

test("es determinista: misma evidencia -> mismo desglose", () => {
  const ev = evidenceFor(goodPage());
  assert.deepEqual(computeA11yScoreBreakdown(ev), computeA11yScoreBreakdown(ev));
});
