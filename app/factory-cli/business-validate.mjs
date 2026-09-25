#!/usr/bin/env node
// Paso 10 · npm run business:validate -- --blueprint=<ruta.json> | --example=minimal|full | --business=<businessId>
import { parseCliArgs, resolveBlueprintFromArgs, validateBusinessDeep, BusinessCliError } from "./lib/businessCli.mjs";

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

  const { valid, errors, warnings } = validateBusinessDeep(blueprint);
  if (!valid) {
    console.error(`INVÁLIDO: el blueprint "${blueprint.businessId || "(sin businessId)"}" tiene ${errors.length} error(es):`);
    for (const err of errors) console.error(`  - ${err.path}: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(`OK: "${blueprint.businessId}" es un Business Blueprint válido (estructura, sector/plantilla, branding).`);
  for (const warning of warnings) console.log(`ADVERTENCIA: ${warning}`);
}

main();
