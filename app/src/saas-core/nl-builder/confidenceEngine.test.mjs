import { test } from "node:test";
import assert from "node:assert/strict";

import { computeConfidence, confidenceLevel } from "./confidenceEngine.js";
import { matchSectorPreset } from "./sectorLexicon.js";
import { resolveModules } from "./moduleDependencyEngine.js";

test("overall siempre está en [0,1] y redondeado a 2 decimales", () => {
  const sectorMatch = matchSectorPreset("clínica dental con citas");
  const { modules } = resolveModules("clínica dental con citas", sectorMatch.preset);
  const result = computeConfidence({ sectorMatch, resolvedModules: modules, ambiguities: [], lowerText: "clínica dental con citas" });
  assert.ok(result.overall >= 0 && result.overall <= 1);
  assert.equal(result.overall, Math.round(result.overall * 100) / 100);
});

test("una petición sin coincidencias de sector produce confianza de sector baja (0.25)", () => {
  const sectorMatch = matchSectorPreset("un negocio cualquiera sin detalles");
  const { modules } = resolveModules("un negocio cualquiera sin detalles", sectorMatch.preset);
  const result = computeConfidence({ sectorMatch, resolvedModules: modules, ambiguities: [], lowerText: "un negocio cualquiera sin detalles" });
  assert.equal(result.bySection.sector, 0.25);
});

test("más ambigüedades bloqueantes reduce overall (monótono)", () => {
  const sectorMatch = matchSectorPreset("clínica dental con citas");
  const { modules } = resolveModules("clínica dental con citas", sectorMatch.preset);
  const base = { sectorMatch, resolvedModules: modules, lowerText: "clínica dental con citas" };
  const zero = computeConfidence({ ...base, ambiguities: [] });
  const one = computeConfidence({ ...base, ambiguities: [{ blocking: true }] });
  const two = computeConfidence({ ...base, ambiguities: [{ blocking: true }, { blocking: true }] });
  assert.ok(zero.overall >= one.overall);
  assert.ok(one.overall >= two.overall);
});

test("mencionar branding/premium sube la confianza de la sección branding", () => {
  const sectorMatch = matchSectorPreset("clínica dental con branding premium");
  const { modules } = resolveModules("clínica dental con branding premium", sectorMatch.preset);
  const withBranding = computeConfidence({ sectorMatch, resolvedModules: modules, ambiguities: [], lowerText: "clínica dental con branding premium" });
  const withoutBranding = computeConfidence({ sectorMatch, resolvedModules: modules, ambiguities: [], lowerText: "clínica dental con citas" });
  assert.ok(withBranding.bySection.branding > withoutBranding.bySection.branding);
});

test("determinista: misma entrada produce el mismo resultado exacto", () => {
  const sectorMatch = matchSectorPreset("despacho de abogados con citas y documentos");
  const { modules } = resolveModules("despacho de abogados con citas y documentos", sectorMatch.preset);
  const input = { sectorMatch, resolvedModules: modules, ambiguities: [{ blocking: false }], lowerText: "despacho de abogados con citas y documentos" };
  assert.deepEqual(computeConfidence(input), computeConfidence(input));
});

test("confidenceLevel clasifica correctamente los umbrales", () => {
  assert.equal(confidenceLevel(0.1), "baja");
  assert.equal(confidenceLevel(0.5), "media");
  assert.equal(confidenceLevel(0.9), "alta");
});
