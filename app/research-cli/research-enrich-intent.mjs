#!/usr/bin/env node
// Paso 12 · npm run research:enrich-intent -- --intent=<intent.json> --audit=<audit.json> [--apply] [--output=<ruta>] [--help]
//
// Sin --apply: muestra la propuesta de enriquecimiento (diff/justificación/
// conflictos/preservados) SIN tocar ningún archivo.
// Con --apply: escribe un archivo NUEVO versionado (nunca sobrescribe el
// Business Intent original).
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { parseCliArgs, loadJsonFile, ResearchCliError } from "./lib/researchCli.mjs";
import { proposeIntentEnrichment, applyIntentEnrichment } from "../src/saas-core/research/intentEnrichment.js";

const HELP = `Uso: npm run research:enrich-intent -- --intent=<intent.json> --audit=<audit.json> [--apply] [--output=<ruta>] [--help]

Opciones:
  --intent=<ruta.json>   Business Intent existente (Paso 11)
  --audit=<ruta.json>    audit.json de una auditoría de investigación (Paso 12)
  --apply                Escribe un archivo NUEVO versionado con el intent enriquecido (nunca sobrescribe el original)
  --output=<ruta>        Con --apply, ruta del archivo nuevo (por defecto: <intent>.enriched.json)
  --help                 Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args.intent || !args.audit) {
    console.error("Error: debes indicar --intent=<intent.json> y --audit=<audit.json>.");
    process.exitCode = 1;
    return;
  }

  let intent, auditResult;
  try {
    intent = await loadJsonFile(args.intent, "--intent");
    auditResult = await loadJsonFile(args.audit, "--audit");
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const proposal = proposeIntentEnrichment(intent, auditResult);

  if (!args.apply) {
    console.log(`Propuesta de enriquecimiento para "${intent.business?.proposedName ?? "(sin nombre)"}":`);
    console.log(`  Módulos a añadir: ${proposal.additions.modules.map((m) => m.id).join(", ") || "ninguno"}`);
    console.log(`  Automatizaciones a añadir: ${proposal.additions.automations.join(", ") || "ninguna"}`);
    console.log(`  Preguntas recomendadas nuevas: ${proposal.additions.recommendedQuestions.length}`);
    console.log(`  Preservado sin cambios: ${proposal.preserved.length} entrada(s)`);
    console.log(`  Válido si se aplica: ${proposal.validation.valid ? "sí" : "NO — " + proposal.validation.errors.map((e) => e.path).join(", ")}`);
    console.log("\n(No se escribió ningún archivo: usa --apply para generar la versión enriquecida en un archivo nuevo.)");
    return;
  }

  if (!proposal.validation.valid) {
    console.error(`Error: el enriquecimiento propuesto no es válido, no se aplica:\n${proposal.validation.errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
    process.exitCode = 1;
    return;
  }

  const enriched = applyIntentEnrichment(proposal);
  const outputPath = args.output || String(args.intent).replace(/\.json$/, "") + ".enriched.json";
  await writeFile(path.resolve(outputPath), JSON.stringify(enriched, null, 2) + "\n", "utf8");
  console.log(`Business Intent enriquecido guardado en: ${outputPath} (el original "${args.intent}" no fue modificado).`);
}

main();
