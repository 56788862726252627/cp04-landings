import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCommercialAssessment } from "./commercialAssessment.js";

test("sin ningún dato: businessComplete false, scores.hasScores false, missingData refleja ambos", () => {
  const assessment = buildCommercialAssessment({});
  assert.equal(assessment.businessComplete, false);
  assert.equal(assessment.scores.hasScores, false);
  assert.deepEqual([...assessment.missingData], ["business.name", "auditScores"]);
});

test("con business.name y auditScores: se normalizan correctamente y overall se calcula", () => {
  const assessment = buildCommercialAssessment({
    business: { name: "Club Pádel Demo", sector: "padel-sports" },
    auditScores: { seo: { score: 60, coverage: 0.8 }, accessibility: { score: 40, coverage: 0.5 } },
  });
  assert.equal(assessment.businessComplete, true);
  assert.equal(assessment.scores.hasScores, true);
  assert.equal(assessment.scores.overall.score, 50);
  assert.equal(assessment.scores.overall.categoriesEvaluated, 2);
});

test("categorías con score null no cuentan como evaluadas pero se mantienen en la lista", () => {
  const assessment = buildCommercialAssessment({ auditScores: { seo: { score: 70 }, performance: { score: null } } });
  assert.equal(assessment.scores.overall.categoriesEvaluated, 1);
  assert.equal(assessment.scores.overall.categoriesTotal, 2);
  assert.equal(assessment.scores.categories.performance.score, null);
});

test("risks/opportunities/recommendations se filtran si no tienen los campos requeridos, nunca lanzan", () => {
  const assessment = buildCommercialAssessment({
    risks: [{ title: "Sin HTTPS", severity: "high" }, { title: "sin severity" }, "no-es-objeto"],
    opportunities: [{ title: "Automatizar recordatorios" }, {}],
    recommendations: [{ title: "Activar reservas online" }],
  });
  assert.equal(assessment.risks.length, 1);
  assert.equal(assessment.opportunities.length, 1);
  assert.equal(assessment.recommendations.length, 1);
});

test("es determinista y congelado (Object.freeze en todos los niveles relevantes)", () => {
  const input = { business: { name: "X" }, auditScores: { seo: { score: 50 } } };
  const a = buildCommercialAssessment(input);
  const b = buildCommercialAssessment(input);
  assert.deepEqual(a, b);
  assert.throws(() => { a.business.name = "Y"; }, /Cannot assign/);
});

test("perfil desconocido cae en genérico sin lanzar", () => {
  const assessment = buildCommercialAssessment({ profileId: "sector-raro" });
  assert.equal(assessment.profileId, "generic");
});
