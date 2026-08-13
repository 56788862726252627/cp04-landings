#!/usr/bin/env node
// Paso 12 · npm run research:plan -- --request=<research-request.json> | --demo=<id> [--format=json|markdown|summary] [--output=<ruta>] [--help]
//
// Construye y muestra el Research Plan (objetivos/preguntas/hipótesis/
// fuentes/adaptadores/orden/límites/criterios de parada) SIN recolectar
// evidencia ni escribir en research/audits/.
import { parseCliArgs, resolveResearchRequestFromArgs, resolveFormat, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import { buildResearchPlan } from "../src/saas-core/research/researchPlanEngine.js";

const HELP = `Uso: npm run research:plan -- --request=<research-request.json> | --demo=<id> [opciones]

Opciones:
  --request=<ruta.json>   Research Request ya construido y válido
  --demo=<id>              Usa una fixture de demostración como negocio (ver research:doctor para la lista)
  --business-name=<...>    Nombre del negocio (si no usas --request/--demo)
  --sector=<id>            Sector (si no usas --request/--demo)
  --format=json|markdown|summary   Formato de salida (por defecto: summary)
  --output=<ruta>          Guarda el resultado en un archivo en vez de stdout
  --help                   Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let request;
  try {
    request = await resolveResearchRequestFromArgs(args);
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const plan = buildResearchPlan(request);
  const format = resolveFormat(args);

  if (format === "json") {
    await writeOutputOrPrint(args, JSON.stringify(plan, null, 2));
    return;
  }
  if (format === "markdown") {
    const lines = [`# Research Plan — ${request.business.name}`, "", ...plan.objectives.map((o) => `- ${o}`), "", "## Preguntas", ...plan.questions.map((q) => `- ${q}`), "", `Adaptadores seleccionados: ${plan.selectedAdapters.join(", ") || "ninguno"}`, `Riesgos: ${plan.risks.join("; ") || "ninguno"}`];
    await writeOutputOrPrint(args, lines.join("\n") + "\n");
    return;
  }
  await writeOutputOrPrint(args, `Plan para "${request.business.name}" (sector ${plan.sectorPresetId}): ${plan.dimensions.length} dimensiones, ${plan.selectedAdapters.length} adaptador(es) seleccionado(s), cobertura esperada: ${plan.expectedCoverage}.`);
}

main();
