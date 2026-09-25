#!/usr/bin/env node
// Paso 10 · npm run business:diff -- --business=<businessId> [--blueprint=<ruta.json>]
//
// Muestra qué cambiaría (crear/actualizar/colisión) si se aplicara el
// blueprint indicado (o el ya almacenado) — modo dry-run, no escribe nada.
import { parseCliArgs, resolveBlueprintFromArgs, diffBusiness, BusinessCliError } from "./lib/businessCli.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.business && !args.blueprint) {
    console.error("Error: indica --business=<businessId> (compara contra lo ya generado) y opcionalmente --blueprint=<ruta.json> (candidato nuevo)");
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

  const diff = await diffBusiness({ blueprint });
  console.log(JSON.stringify(diff, null, 2));
  if (diff.collisions.length > 0) {
    console.error(`Atención: ${diff.collisions.length} colisión(es) — requeriría --force en business:build.`);
    process.exitCode = 1;
  }
}

main();
