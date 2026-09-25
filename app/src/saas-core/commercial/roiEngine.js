// Paso 20 · Fase 3 — Motor ROI determinista, configurable y honesto.
//
// Principios (idénticos en espíritu a scoringEngine.js/perfScoring.js de
// pasos anteriores):
//  - NUNCA presenta una estimación como un resultado garantizado — cada
//    cifra de salida declara `source` ("provided"|"calculated"|
//    "assumed"), `formula`, `assumption` (si aplica) y `confidence`.
//  - Determinista: mismos inputs -> mismos 3 escenarios, siempre. Nunca
//    usa `Math.random()` ni el reloj del sistema.
//  - Si un input no se aporta, se usa un supuesto SECTORIAL declarado
//    (`commercialSectorProfiles.js`) — nunca se inventa un número sin
//    dejar constancia de que es un supuesto, nunca del cliente.
//  - Los 3 escenarios (conservador/central/optimista) son variaciones de
//    LOS MISMOS supuestos de mejora (reducción de no-shows, mejora de
//    conversión, horas ahorradas) — nunca varían el ticket medio ni el
//    volumen de reservas del propio negocio (esos son datos de entrada,
//    no supuestos de mejora).

import { getCommercialSectorProfile } from "./commercialSectorProfiles.js";

export const ROI_SCENARIOS = Object.freeze(["conservative", "central", "optimistic"]);

const SCENARIO_LABELS = Object.freeze({ conservative: "Conservador", central: "Central", optimistic: "Optimista" });

// Supuestos de MEJORA (no de negocio) por escenario — cuánta parte del
// problema detectado se estima resuelta con las automatizaciones
// propuestas. Documentados aquí, nunca ocultos en una fórmula.
const SCENARIO_IMPROVEMENT_FACTORS = Object.freeze({
  conservative: { noShowReduction: 0.3, conversionUplift: 0.02, hoursSavedFactor: 0.5, confidence: 0.55 },
  central: { noShowReduction: 0.5, conversionUplift: 0.05, hoursSavedFactor: 0.7, confidence: 0.65 },
  optimistic: { noShowReduction: 0.7, conversionUplift: 0.08, hoursSavedFactor: 0.9, confidence: 0.45 },
});

const DEFAULT_IMPLEMENTATION_COST = 900;
const DEFAULT_MONTHLY_MAINTENANCE_COST = 45;

function field(value, { source, formula = null, assumption = null, confidence, unit = null }) {
  return Object.freeze({ value, source, formula, assumption, unit, confidence: Math.round(confidence * 100) / 100 });
}

/**
 * Resuelve un input: si el usuario lo aportó explícitamente (no
 * undefined/null), se marca `source: "provided"`, confianza alta. Si
 * no, se usa el supuesto sectorial, `source: "assumed"`, confianza
 * media, y el `assumption` describe de dónde sale.
 */
function resolveInput(rawValue, sectorDefault, { label, confidence = 0.9, assumedConfidence = 0.5 }) {
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return field(rawValue, { source: "provided", confidence });
  }
  if (sectorDefault !== undefined) {
    return field(sectorDefault, { source: "assumed", assumption: `Supuesto de partida del perfil sectorial para "${label}" — sustituir por el dato real del negocio en cuanto se conozca.`, confidence: assumedConfidence });
  }
  return field(null, { source: "unavailable", assumption: `No se aportó "${label}" y no hay supuesto sectorial aplicable.`, confidence: 0 });
}

/**
 * @param {object} inputs - ver Fase 3 del enunciado (sector, monthlyBookings, averageTicket, conversionRate, cancellationRate, noShowRate, adminHoursPerWeek, hourlyCost, currentMonthlyRevenue, implementationCost, monthlyMaintenanceCost, packagePrice)
 * @param {{profileId?: string|null}} context
 */
export function computeRoiScenarios(inputs = {}, { profileId = null } = {}) {
  const profile = getCommercialSectorProfile(profileId);
  const d = profile.defaultAssumptions;

  const resolved = {
    averageTicket: resolveInput(inputs.averageTicket, d.averageTicket, { label: "ticket medio" }),
    monthlyBookings: resolveInput(inputs.monthlyBookings, d.monthlyBookings, { label: "reservas/citas mensuales" }),
    noShowRate: resolveInput(inputs.noShowRate, d.noShowRate, { label: "tasa de no-shows" }),
    adminHoursPerWeek: resolveInput(inputs.adminHoursPerWeek, d.adminHoursPerWeek, { label: "horas administrativas semanales" }),
    hourlyCost: resolveInput(inputs.hourlyCost, d.hourlyCost, { label: "coste por hora administrativa" }),
    conversionRate: resolveInput(inputs.conversionRate, undefined, { label: "tasa de conversión actual" }),
    currentMonthlyRevenue: resolveInput(inputs.currentMonthlyRevenue, undefined, { label: "ingresos mensuales actuales" }),
    implementationCost: resolveInput(inputs.implementationCost, DEFAULT_IMPLEMENTATION_COST, { label: "coste de implementación", assumedConfidence: 0.4 }),
    monthlyMaintenanceCost: resolveInput(inputs.monthlyMaintenanceCost, DEFAULT_MONTHLY_MAINTENANCE_COST, { label: "mantenimiento mensual", assumedConfidence: 0.4 }),
  };

  const unavailableVariables = Object.entries(resolved).filter(([, f]) => f.source === "unavailable").map(([key]) => key);
  const assumptionsUsed = Object.entries(resolved).filter(([, f]) => f.source === "assumed").map(([key, f]) => ({ field: key, assumption: f.assumption, value: f.value }));

  const scenarios = {};
  for (const scenarioId of ROI_SCENARIOS) {
    const improvement = SCENARIO_IMPROVEMENT_FACTORS[scenarioId];
    const monthlyAdminHours = resolved.adminHoursPerWeek.value * 52 / 12;
    const hoursSavedPerMonth = field(Math.round(monthlyAdminHours * improvement.hoursSavedFactor * 10) / 10, {
      source: "calculated",
      formula: "adminHoursPerWeek × (52/12) × hoursSavedFactor(escenario)",
      assumption: `Se asume que las automatizaciones propuestas eliminan el ${Math.round(improvement.hoursSavedFactor * 100)}% de las horas administrativas actuales dedicadas a tareas automatizables (escenario ${SCENARIO_LABELS[scenarioId].toLowerCase()}).`,
      confidence: improvement.confidence,
      unit: "horas/mes",
    });
    const economicSavingsPerMonth = field(Math.round(hoursSavedPerMonth.value * resolved.hourlyCost.value * 100) / 100, {
      source: "calculated",
      formula: "hoursSavedPerMonth × hourlyCost",
      confidence: Math.min(hoursSavedPerMonth.confidence, resolved.hourlyCost.confidence),
      unit: "EUR/mes",
    });

    let noShowSavingsPerMonth;
    if (resolved.averageTicket.source !== "unavailable" && resolved.monthlyBookings.source !== "unavailable" && resolved.noShowRate.source !== "unavailable") {
      const value = resolved.averageTicket.value * resolved.monthlyBookings.value * resolved.noShowRate.value * improvement.noShowReduction;
      noShowSavingsPerMonth = field(Math.round(value * 100) / 100, {
        source: "calculated",
        formula: "averageTicket × monthlyBookings × noShowRate × noShowReduction(escenario)",
        assumption: `Se asume que los recordatorios/confirmaciones automáticas reducen los no-shows en un ${Math.round(improvement.noShowReduction * 100)}% (escenario ${SCENARIO_LABELS[scenarioId].toLowerCase()}).`,
        confidence: improvement.confidence,
        unit: "EUR/mes",
      });
    } else {
      noShowSavingsPerMonth = field(null, { source: "unavailable", assumption: "Faltan averageTicket/monthlyBookings/noShowRate para calcular el ahorro por no-shows.", confidence: 0, unit: "EUR/mes" });
    }

    let potentialRevenueIncrease;
    if (resolved.currentMonthlyRevenue.source !== "unavailable") {
      const value = resolved.currentMonthlyRevenue.value * improvement.conversionUplift;
      potentialRevenueIncrease = field(Math.round(value * 100) / 100, {
        source: "calculated",
        formula: "currentMonthlyRevenue × conversionUplift(escenario)",
        assumption: `Se asume una mejora de conversión del ${Math.round(improvement.conversionUplift * 100)}% sobre los ingresos actuales (escenario ${SCENARIO_LABELS[scenarioId].toLowerCase()}) — NUNCA garantizado.`,
        confidence: improvement.confidence * 0.8,
        unit: "EUR/mes",
      });
    } else {
      potentialRevenueIncrease = field(null, { source: "unavailable", assumption: "Falta currentMonthlyRevenue para estimar un incremento potencial de ingresos.", confidence: 0, unit: "EUR/mes" });
    }

    const monthlyBenefitValue = economicSavingsPerMonth.value + (noShowSavingsPerMonth.value ?? 0) + (potentialRevenueIncrease.value ?? 0);
    const totalMonthlyBenefit = field(Math.round(monthlyBenefitValue * 100) / 100, { source: "calculated", formula: "economicSavingsPerMonth + noShowSavingsPerMonth + potentialRevenueIncrease", confidence: improvement.confidence, unit: "EUR/mes" });

    const netMonthlyBenefit = totalMonthlyBenefit.value - resolved.monthlyMaintenanceCost.value;
    let paybackMonths;
    if (netMonthlyBenefit > 0) {
      paybackMonths = field(Math.round((resolved.implementationCost.value / netMonthlyBenefit) * 10) / 10, { source: "calculated", formula: "implementationCost / (totalMonthlyBenefit − monthlyMaintenanceCost)", confidence: improvement.confidence, unit: "meses" });
    } else {
      paybackMonths = field(null, { source: "calculated", formula: "implementationCost / (totalMonthlyBenefit − monthlyMaintenanceCost)", assumption: "El beneficio neto mensual estimado no es positivo en este escenario: no hay un plazo de recuperación calculable.", confidence: 0, unit: "meses" });
    }

    function roiAt(months) {
      const netBenefit = netMonthlyBenefit * months - resolved.implementationCost.value;
      const ratio = resolved.implementationCost.value > 0 ? netBenefit / resolved.implementationCost.value : null;
      return field(ratio === null ? null : Math.round(ratio * 1000) / 10, { source: "calculated", formula: `((totalMonthlyBenefit − monthlyMaintenanceCost) × ${months} − implementationCost) / implementationCost`, confidence: improvement.confidence, unit: "%" });
    }

    scenarios[scenarioId] = Object.freeze({
      label: SCENARIO_LABELS[scenarioId],
      hoursSavedPerMonth,
      economicSavingsPerMonth,
      noShowSavingsPerMonth,
      potentialRevenueIncrease,
      totalMonthlyBenefit,
      paybackMonths,
      roi3Months: roiAt(3),
      roi6Months: roiAt(6),
      roi12Months: roiAt(12),
    });
  }

  return Object.freeze({
    profileId: profile.profileId,
    inputs: Object.freeze(resolved),
    implementationCost: resolved.implementationCost,
    monthlyMaintenanceCost: resolved.monthlyMaintenanceCost,
    scenarios: Object.freeze(scenarios),
    assumptionsUsed: Object.freeze(assumptionsUsed),
    unavailableVariables: Object.freeze(unavailableVariables),
    disclaimer: "Estimaciones basadas en supuestos declarados y fórmulas deterministas — NUNCA son un resultado garantizado. Cada cifra indica si fue introducida, calculada o asumida, con su fórmula y su nivel de confianza.",
  });
}
