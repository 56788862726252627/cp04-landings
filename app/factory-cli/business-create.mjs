#!/usr/bin/env node
// Paso 10 · npm run business:create -- --blueprint=<ruta.json> | --example=minimal|full [--force] [--verbose]
//
// Comportamiento: valida el Blueprint -> ejecuta dry-run -> genera tenant y
// artefactos -> entrega un resumen. Falla limpio (sin stack trace) ante
// errores esperados (blueprint inválido, colisión de archivos).
import { parseCliArgs, resolveBlueprintFromArgs, validateBusinessDeep, runFactoryPipeline, BusinessCliError, BusinessFactoryError } from "./lib/businessCli.mjs";

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

  console.log(`Paso 1/3 — Validando Business Blueprint "${blueprint.businessId}"...`);
  const { valid, errors } = validateBusinessDeep(blueprint);
  if (!valid) {
    console.error(`INVÁLIDO: ${errors.length} error(es):`);
    for (const err of errors) console.error(`  - ${err.path}: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  console.log("  OK.");

  console.log("Paso 2/3 — Ejecutando dry-run...");
  try {
    const dry = await runFactoryPipeline({ blueprint, dryRun: true, verbose: args.verbose === true });
    console.log(`  Se crearían ${dry.filesCreated.length} archivo(s), se actualizarían ${dry.filesUpdated.length}, colisiones: ${dry.collisions.length}.`);
  } catch (err) {
    if (err instanceof BusinessFactoryError) {
      console.error(`Error en dry-run: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  console.log("Paso 3/3 — Generando tenant y artefactos...");
  let result;
  try {
    result = await runFactoryPipeline({ blueprint, force: args.force === true, verbose: args.verbose === true });
  } catch (err) {
    if (err instanceof BusinessFactoryError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  console.log("");
  console.log(`Negocio generado: ${result.businessId}`);
  console.log(`Directorio: ${result.outputDir}`);
  console.log(`Archivos creados: ${result.filesCreated.length} · actualizados: ${result.filesUpdated.length} · preservados: ${result.filesPreserved.length}`);
  console.log(`Duración: ${result.durationMs} ms`);
  if (result.risks.length > 0) {
    console.log("Riesgos:");
    for (const risk of result.risks) console.log(`  - ${risk}`);
  }
  console.log(`Siguiente paso recomendado: ${result.nextStep}`);
}

main();
