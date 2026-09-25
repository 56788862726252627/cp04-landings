#!/usr/bin/env node
// Paso 20 · npm run commercial:roi -- [--input=<ruta.json>] [--profile=<id>] [--scenario=conservative|central|optimistic|all] [--format json|markdown] [--output=<ruta>]
//
// Calcula los 3 escenarios ROI (determinista) — nunca presenta el
// resultado como garantizado.
import { parseCliArgs, writeOutputOrPrint, resolveFormat, resolveScenarioFilter, resolveCommercialInputFromArgs, CommercialCliError } from "./lib/commercialCli.mjs";
import { computeRoiScenarios } from "../src/saas-core/commercial/roiEngine.js";

const HELP = `Uso: npm run commercial:roi -- [--input=<ruta.json>] [--profile=<id>] [opciones]

  --input=<ruta.json>     roiInputs (averageTicket, monthlyBookings, noShowRate, adminHoursPerWeek, hourlyCost, conversionRate, currentMonthlyRevenue, implementationCost, monthlyMaintenanceCost)
  --profile=<id>          Perfil sectorial (supuestos de partida si faltan datos)
  --scenario=<id>|all     conservative|central|optimistic|all (por defecto: all)
  --format=json|markdown  (por defecto: markdown)
  --output=<ruta>         Guarda el resultado en un archivo
  --help                  Muestra esta ayuda
`;

function renderMarkdown(result, scenarioFilter) {
  const scenarios = scenarioFilter === "all" ? Object.values(result.scenarios) : [result.scenarios[scenarioFilter]];
  const lines = [`# ROI — perfil ${result.profileId}`, "", `> ${result.disclaimer}`, ""];
  for (const s of scenarios) {
    lines.push(`## ${s.label}`, `- Horas ahorradas/mes: ${s.hoursSavedPerMonth.value} (${s.hoursSavedPerMonth.source})`, `- Ahorro económico/mes: ${s.economicSavingsPerMonth.value} EUR`, `- Ahorro por no-shows/mes: ${s.noShowSavingsPerMonth.value ?? "sin datos"} EUR`, `- Beneficio mensual total: ${s.totalMonthlyBenefit.value} EUR`, `- Payback: ${s.paybackMonths.value ?? "sin datos"} meses`, `- ROI 3/6/12 meses: ${s.roi3Months.value ?? "s/d"}% / ${s.roi6Months.value ?? "s/d"}% / ${s.roi12Months.value ?? "s/d"}%`, "");
  }
  if (result.assumptionsUsed.length > 0) lines.push("## Supuestos usados", ...result.assumptionsUsed.map((a) => `- ${a.field} = ${a.value}: ${a.assumption}`));
  if (result.unavailableVariables.length > 0) lines.push("", "## Variables no disponibles", ...result.unavailableVariables.map((v) => `- ${v}`));
  return lines.join("\n") + "\n";
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const format = resolveFormat(args);
    const scenarioFilter = resolveScenarioFilter(args);
    const input = await resolveCommercialInputFromArgs(args);
    const result = computeRoiScenarios(input.roiInputs, { profileId: input.profileId });
    const output = format === "json" ? JSON.stringify(result, null, 2) + "\n" : renderMarkdown(result, scenarioFilter);
    await writeOutputOrPrint(args, output);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
