import { test } from "node:test";
import assert from "node:assert/strict";

import { detectAmbiguities, applyAnswers } from "./ambiguityEngine.js";
import { normalizeInput } from "./inputNormalizer.js";
import { matchSectorPreset } from "./sectorLexicon.js";
import { resolveModules } from "./moduleDependencyEngine.js";

function analyze(text) {
  const normalized = normalizeInput(text);
  const sectorMatch = matchSectorPreset(normalized.lowerText);
  const { modules } = resolveModules(normalized.lowerText, sectorMatch.preset);
  return { normalized, sectorMatch, resolvedModules: modules, ...detectAmbiguities({ normalized, sectorMatch, resolvedModules: modules }) };
}

test("entrada vacía produce una ambigüedad bloqueante y ninguna otra suposición", () => {
  const result = analyze("");
  assert.ok(result.ambiguities.some((a) => a.field === "sourceText" && a.blocking === true));
});

test("sector no detectado produce ambigüedad no bloqueante + supuesto + pregunta recomendada", () => {
  const result = analyze("quiero un software para gestionar mi negocio");
  const sectorAmbiguity = result.ambiguities.find((a) => a.field === "business.sector");
  assert.ok(sectorAmbiguity);
  assert.equal(sectorAmbiguity.blocking, false);
  assert.ok(result.assumptions.some((a) => a.field === "business.sector"));
  assert.ok(result.recommendedQuestions.some((q) => q.includes("sector")));
});

test("sin ciudad detectada produce ambigüedad no bloqueante sobre locations + supuesto de país/zona horaria", () => {
  const result = analyze("clínica dental con reservas");
  const locationAmbiguity = result.ambiguities.find((a) => a.field === "business.locations");
  assert.ok(locationAmbiguity);
  assert.equal(locationAmbiguity.blocking, false);
  assert.ok(result.assumptions.some((a) => a.field === "country/timezone"));
});

test("con ciudad detectada NO hay ambigüedad de locations", () => {
  const result = analyze("clínica dental de Málaga con reservas");
  assert.ok(!result.ambiguities.some((a) => a.field === "business.locations"));
});

test("contradicción real (pedir pagos explícitamente + 'sin pagos online') se marca BLOQUEANTE", () => {
  const result = analyze("clínica dental con pagos pero sin pagos online");
  const contradiction = result.ambiguities.find((a) => a.field === "modules.pagos");
  assert.ok(contradiction, "debería detectar la contradicción sobre pagos");
  assert.equal(contradiction.blocking, true);
});

test("sin contradicción, pedir pagos normalmente no genera ninguna ambigüedad bloqueante", () => {
  const result = analyze("clínica dental de Málaga con reservas y pagos");
  assert.ok(!result.ambiguities.some((a) => a.blocking === true));
});

test("un módulo fuera de lo recomendado para el sector pedido explícitamente genera ambigüedad no bloqueante", () => {
  const result = analyze("despacho de abogados que también quiero que tenga torneos y ranking");
  const outOfSector = result.ambiguities.find((a) => a.field === "modules.torneos");
  assert.ok(outOfSector);
  assert.equal(outOfSector.blocking, false);
});

test("applyAnswers retira la ambigüedad respondida y añade un supuesto con evidencia de respuesta del usuario", () => {
  const result = analyze("quiero un software para gestionar mi negocio");
  const before = result.ambiguities.length;
  const after = applyAnswers(result, { "business.sector": "dental" });
  assert.equal(after.ambiguities.length, before - 1);
  assert.ok(after.assumptions.some((a) => a.field === "business.sector" && a.assumedValue === "dental" && a.reason.includes("--answers")));
});

test("determinista: la misma entrada produce exactamente la misma lista de ambigüedades", () => {
  const a = analyze("clínica dental con reservas y expedientes");
  const b = analyze("clínica dental con reservas y expedientes");
  assert.deepEqual(a.ambiguities, b.ambiguities);
  assert.deepEqual(a.assumptions, b.assumptions);
  assert.deepEqual(a.recommendedQuestions, b.recommendedQuestions);
});
