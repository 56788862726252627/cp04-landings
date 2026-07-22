#!/usr/bin/env node
// Paso 10 · npm run business:build -- --business=<businessId> [--blueprint=<ruta.json>] [--force] [--verbose]
//
// Ejecuta la generación completa (crea o regenera) sin publicar nada:
// no hace deploy, no conecta proveedores. Pensado para regenerar un
// negocio ya existente tras editar su Business Blueprint.
import { parseCliArgs, resolveBlueprintFromArgs, runFactoryPipeline, BusinessCliError, BusinessFactoryError } from "./lib/businessCli.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
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
    const result = await runFactoryPipeline({ blueprint, force: args.force === true, verbose: args.verbose === true });
    console.log(`Build completado para "${result.businessId}" (sin publicar).`);
    console.log(`Directorio: ${result.outputDir}`);
    console.log(`Creados: ${result.filesCreated.length} · Actualizados: ${result.filesUpdated.length} · Preservados: ${result.filesPreserved.length}`);
    console.log(`Idempotente: ${result.idempotent ? "sí (sin cambios respecto a la última generación)" : "no (hubo cambios)"}`);
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
