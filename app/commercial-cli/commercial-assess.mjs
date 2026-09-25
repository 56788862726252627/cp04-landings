#!/usr/bin/env node
// Paso 20 · npm run commercial:assess -- [--input=<ruta.json>] [--profile=<id>] [--business-name=...] [--sector=...] [--format json|markdown] [--output=<ruta>] [--dry-run]
//
// Construye un CommercialAssessment (normaliza negocio + scores
// opcionales, nunca inventa datos ausentes) y lo imprime/guarda.
// --dry-run: no escribe nada fuera de --output (igual que sin --output,
// ya que este comando nunca toca red ni escribe fuera del output
// explícito).
import { parseCliArgs, writeOutputOrPrint, resolveFormat, resolveCommercialInputFromArgs, CommercialCliError } from "./lib/commercialCli.mjs";
import { buildCommercialAssessment } from "../src/saas-core/commercial/commercialAssessment.js";

const HELP = `Uso: npm run commercial:assess -- [--input=<ruta.json>] [--profile=<id>] [--business-name=...] [--sector=...] [opciones]

  --input=<ruta.json>     Business/scores/risks/opportunities/recommendations ya construidos
  --profile=<id>          Perfil sectorial (club-deportivo|clinica|dentista|veterinario|abogado|restaurante|hotel|inmobiliaria|peluqueria|centro-estetica|generic)
  --business-name=<...>   Nombre del negocio
  --sector=<...>          Sector declarado (informativo)
  --format=json|markdown  (por defecto: markdown)
  --output=<ruta>         Guarda el resultado en un archivo
  --dry-run               No escribe nada fuera de --output (este comando nunca toca red)
  --help                  Muestra esta ayuda
`;

function renderMarkdown(assessment) {
  const lines = [
    `# CommercialAssessment — ${assessment.business.name ?? "[nombre pendiente]"}`,
    "",
    `Perfil: ${assessment.profileLabel}`,
    `Puntuación global: ${assessment.scores.overall.score ?? "sin datos"}/100 (${assessment.scores.overall.categoriesEvaluated}/${assessment.scores.overall.categoriesTotal} categorías)`,
    "",
    "## Riesgos", ...assessment.risks.map((r) => `- ${r.title} (${r.severity})`),
    "", "## Oportunidades", ...assessment.opportunities.map((o) => `- ${o.title}`),
    "", "## Recomendaciones", ...assessment.recommendations.map((r) => `- ${r.title}`),
  ];
  if (assessment.missingData.length > 0) lines.push("", "## Datos pendientes", ...assessment.missingData.map((m) => `- ${m}`));
  return lines.join("\n") + "\n";
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const format = resolveFormat(args);
    const input = await resolveCommercialInputFromArgs(args);
    const assessment = buildCommercialAssessment(input);
    const output = format === "json" ? JSON.stringify(assessment, null, 2) + "\n" : renderMarkdown(assessment);
    await writeOutputOrPrint(args, output);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
