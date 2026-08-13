import { test } from "node:test";
import assert from "node:assert/strict";

import { compareCompetitors } from "./competitorComparison.js";
import { evaluateAllDimensions } from "./dimensionRegistry.js";
import { computeAllScores } from "./scoringEngine.js";
import { createEvidence } from "./evidenceSchema.js";

function ev(dimensionId, polarity, strength = 1, confidence = 0.9) {
  return createEvidence({ sourceId: "s", sourceType: "local_html", title: "t", excerpt: "e", normalizedContent: "e", relatedDimension: dimensionId, signal: { strength, polarity }, confidence });
}

test("compareCompetitors sin competidores devuelve advertencia de cobertura y ninguna comparación inventada", () => {
  const subjectScores = computeAllScores(evaluateAllDimensions([ev("branding", "positive")]));
  const result = compareCompetitors({ subjectScores, subjectEvidence: [] }, []);
  assert.equal(result.table.length, 0);
  assert.ok(result.coverageWarnings.length > 0);
});

test("compareCompetitors detecta una ventaja clara cuando el sujeto supera claramente a los competidores fixture", () => {
  const subjectScores = computeAllScores(evaluateAllDimensions([ev("branding", "positive", 1, 0.95)]));
  const weakCompetitor = { competitorId: "competidor-a", evidence: [ev("branding", "negative", 1, 0.95)] };
  const result = compareCompetitors({ subjectScores, subjectEvidence: [] }, [weakCompetitor]);
  assert.ok(result.advantages.some((a) => a.includes("branding")));
});

test("compareCompetitors detecta una debilidad clara cuando el sujeto queda por debajo de los competidores", () => {
  const subjectScores = computeAllScores(evaluateAllDimensions([ev("branding", "negative", 1, 0.95)]));
  const strongCompetitor = { competitorId: "competidor-a", evidence: [ev("branding", "positive", 1, 0.95)] };
  const result = compareCompetitors({ subjectScores, subjectEvidence: [] }, [strongCompetitor]);
  assert.ok(result.weaknesses.some((w) => w.includes("branding")));
});

test("compareCompetitors advierte cobertura limitada con un solo competidor", () => {
  const subjectScores = computeAllScores(evaluateAllDimensions([ev("branding", "positive")]));
  const result = compareCompetitors({ subjectScores, subjectEvidence: [] }, [{ competitorId: "solo-uno", evidence: [ev("branding", "positive")] }]);
  assert.ok(result.coverageWarnings.some((w) => w.includes("Solo se proporcionó 1")));
});

test("compareCompetitors marca gap cuando el sujeto no tiene datos propios para una categoría evaluable en competidores", () => {
  const subjectScores = computeAllScores(evaluateAllDimensions([]));
  const result = compareCompetitors({ subjectScores, subjectEvidence: [] }, [{ competitorId: "a", evidence: [ev("branding", "positive")] }, { competitorId: "b", evidence: [ev("branding", "positive")] }]);
  assert.ok(result.gaps.length > 0);
});
