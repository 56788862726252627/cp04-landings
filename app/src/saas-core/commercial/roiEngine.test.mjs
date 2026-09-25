import { test } from "node:test";
import assert from "node:assert/strict";

import { computeRoiScenarios, ROI_SCENARIOS } from "./roiEngine.js";

function fullInputs(overrides = {}) {
  return {
    averageTicket: 40,
    monthlyBookings: 300,
    noShowRate: 0.15,
    adminHoursPerWeek: 10,
    hourlyCost: 16,
    conversionRate: 0.2,
    currentMonthlyRevenue: 12000,
    implementationCost: 1200,
    monthlyMaintenanceCost: 60,
    ...overrides,
  };
}

test("computeRoiScenarios es determinista: mismos inputs -> mismo resultado byte a byte", () => {
  const a = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  const b = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  assert.deepEqual(a, b);
});

test("computeRoiScenarios produce los 3 escenarios pedidos, ordenados y con label", () => {
  const result = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  for (const scenarioId of ROI_SCENARIOS) assert.ok(result.scenarios[scenarioId]);
  assert.equal(result.scenarios.conservative.label, "Conservador");
  assert.equal(result.scenarios.optimistic.label, "Optimista");
});

test("con inputs completos, cada campo relevante se marca source:'provided'", () => {
  const result = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  assert.equal(result.inputs.averageTicket.source, "provided");
  assert.equal(result.inputs.monthlyBookings.source, "provided");
  assert.equal(result.inputs.currentMonthlyRevenue.source, "provided");
  assert.deepEqual([...result.unavailableVariables], []);
});

test("sin inputs, se usan los supuestos sectoriales marcados como 'assumed', nunca como si fueran reales", () => {
  const result = computeRoiScenarios({}, { profileId: "restaurante" });
  assert.equal(result.inputs.averageTicket.source, "assumed");
  assert.match(result.inputs.averageTicket.assumption, /supuesto/i);
  assert.ok(result.assumptionsUsed.some((a) => a.field === "averageTicket"));
});

test("sin currentMonthlyRevenue: potentialRevenueIncrease queda 'unavailable', nunca inventa un valor", () => {
  const result = computeRoiScenarios(fullInputs({ currentMonthlyRevenue: undefined }), { profileId: "restaurante" });
  assert.equal(result.scenarios.central.potentialRevenueIncrease.source, "unavailable");
  assert.equal(result.scenarios.central.potentialRevenueIncrease.value, null);
  assert.ok(result.unavailableVariables.includes("currentMonthlyRevenue"));
});

test("cada cifra calculada indica formula/source/confidence explícitos", () => {
  const result = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  const central = result.scenarios.central;
  for (const key of ["hoursSavedPerMonth", "economicSavingsPerMonth", "noShowSavingsPerMonth", "totalMonthlyBenefit", "paybackMonths", "roi3Months", "roi6Months", "roi12Months"]) {
    const f = central[key];
    assert.equal(f.source, "calculated", key);
    assert.ok(typeof f.confidence === "number", key);
  }
  assert.ok(central.hoursSavedPerMonth.formula);
});

test("el escenario optimista produce un beneficio mensual total mayor o igual que el conservador", () => {
  const result = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  assert.ok(result.scenarios.optimistic.totalMonthlyBenefit.value >= result.scenarios.conservative.totalMonthlyBenefit.value);
});

test("con beneficio neto mensual no positivo, paybackMonths queda null con explicación, nunca Infinity/NaN", () => {
  const result = computeRoiScenarios(fullInputs({ monthlyMaintenanceCost: 999999 }), { profileId: "restaurante" });
  for (const scenarioId of ROI_SCENARIOS) {
    const payback = result.scenarios[scenarioId].paybackMonths;
    assert.equal(payback.value, null);
    assert.ok(payback.assumption);
  }
});

test("nunca presenta el resultado como garantizado: el disclaimer lo declara explícitamente", () => {
  const result = computeRoiScenarios(fullInputs(), { profileId: "restaurante" });
  assert.match(result.disclaimer, /NUNCA.*garantizad/i);
});

test("perfiles distintos producen supuestos de partida distintos cuando no se aportan datos", () => {
  const restauranteResult = computeRoiScenarios({}, { profileId: "restaurante" });
  const abogadoResult = computeRoiScenarios({}, { profileId: "abogado" });
  assert.notEqual(restauranteResult.inputs.averageTicket.value, abogadoResult.inputs.averageTicket.value);
});

test("perfil desconocido/nulo cae en el perfil genérico sin lanzar", () => {
  const result = computeRoiScenarios({}, { profileId: "sector-inexistente" });
  assert.equal(result.profileId, "generic");
  const noProfile = computeRoiScenarios({}, {});
  assert.equal(noProfile.profileId, "generic");
});
