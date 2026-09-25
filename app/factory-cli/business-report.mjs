#!/usr/bin/env node
// Paso 10 · npm run business:report -- --business=<businessId>
//
// Regenera report.md/report.json de un negocio ya generado, reutilizando
// su business.blueprint.json almacenado. El resto de artefactos permanecen
// sin cambios si el blueprint no cambió (idempotencia del orquestador).
import { parseCliArgs, resolveBlueprintFromArgs, runFactoryPipeline, BusinessCliError, BusinessFactoryError } from "./lib/businessCli.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.business) {
    console.error("Error: falta --business=<businessId>");
    process.exitCode = 1;
    return;
  }
  let blueprint;
  try {
    blueprint = await resolveBlueprintFromArgs(args);
  } catch (err) {
    if (err instanceof BusinessCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  try {
    const result = await runFactoryPipeline({ blueprint });
    console.log(result.reportMarkdown);
    console.log(`(informe también escrito en ${result.outputDir}/report.md y report.json)`);
  } catch (err) {
    if (err instanceof BusinessFactoryError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
