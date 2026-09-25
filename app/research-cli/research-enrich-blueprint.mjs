#!/usr/bin/env node
// Paso 12 · npm run research:enrich-blueprint -- --blueprint=<business.blueprint.json> --audit=<audit.json> [--apply] [--output=<ruta>] [--help]
//
// Mismo principio que research:enrich-intent, pero para el Business
// Blueprint de Paso 10. Nunca sobrescribe el original.
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { parseCliArgs, loadJsonFile, ResearchCliError } from "./lib/researchCli.mjs";
import { proposeBlueprintEnrichment, applyBlueprintEnrichment } from "../src/saas-core/research/blueprintEnrichment.js";

const HELP = `Uso: npm run research:enrich-blueprint -- --blueprint=<business.blueprint.json> --audit=<audit.json> [--apply] [--output=<ruta>] [--help]

Opciones:
  --blueprint=<ruta.json>   Business Blueprint existente (Paso 10)
  --audit=<ruta.json>        audit.json de una auditoría de investigación (Paso 12)
  --apply                    Escribe un archivo NUEVO versionado con el blueprint enriquecido (nunca sobrescribe el original)
  --output=<ruta>            Con --apply, ruta del archivo nuevo (por defecto: <blueprint>.enriched.json)
  --help                     Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args.blueprint || !args.audit) {
    console.error("Error: debes indicar --blueprint=<business.blueprint.json> y --audit=<audit.json>.");
    process.exitCode = 1;
    return;
  }

  let blueprint, auditResult;
  try {
    blueprint = await loadJsonFile(args.blueprint, "--blueprint");
    auditResult = await loadJsonFile(args.audit, "--audit");
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const proposal = proposeBlueprintEnrichment(blueprint, auditResult);

  if (!args.apply) {
    console.log(`Propuesta de enriquecimiento para "${blueprint.commercialName ?? blueprint.businessId ?? "(sin nombre)"}":`);
    console.log(`  Módulos a añadir: ${proposal.additions.modules.join(", ") || "ninguno"}`);
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

  const enriched = applyBlueprintEnrichment(proposal);
  const outputPath = args.output || String(args.blueprint).replace(/\.json$/, "") + ".enriched.json";
  await writeFile(path.resolve(outputPath), JSON.stringify(enriched, null, 2) + "\n", "utf8");
  console.log(`Business Blueprint enriquecido guardado en: ${outputPath} (el original "${args.blueprint}" no fue modificado).`);
}

main();
