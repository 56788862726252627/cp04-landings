#!/usr/bin/env node
// Paso 12 · npm run research:compare -- --before=<audit-v1.json> --after=<audit-v2.json> [--format=json|markdown] [--output=<ruta>] [--help]
import { parseCliArgs, loadJsonFile, resolveFormat, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import { diffAudits, renderAuditDiffMarkdown } from "../src/saas-core/research/auditDiff.js";

const HELP = `Uso: npm run research:compare -- --before=<audit-v1.json> --after=<audit-v2.json> [--format=json|markdown] [--output=<ruta>] [--help]

Opciones:
  --before=<ruta.json>   audit.json de la auditoría anterior
  --after=<ruta.json>    audit.json de la auditoría posterior
  --format=json|markdown  Formato de salida (por defecto: markdown)
  --output=<ruta>         Guarda el resultado en un archivo
  --help                  Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args.before || !args.after) {
    console.error("Error: debes indicar --before=<audit.json> y --after=<audit.json>.");
    process.exitCode = 1;
    return;
  }

  let before, after;
  try {
    before = await loadJsonFile(args.before, "--before");
    after = await loadJsonFile(args.after, "--after");
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const diff = diffAudits(before, after);
  const format = resolveFormat({ format: args.format || "markdown" });
  await writeOutputOrPrint(args, format === "json" ? JSON.stringify(diff, null, 2) : renderAuditDiffMarkdown(diff));
}

main();
