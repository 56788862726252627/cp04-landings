#!/usr/bin/env node
// Paso 10 · npm run business:list [-- --catalog]
// --catalog lista plantillas/presets disponibles; sin flags lista negocios generados.
import { parseCliArgs, listGeneratedBusinesses, listCatalog } from "./lib/businessCli.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.catalog) {
    const { templates, presets } = listCatalog();
    console.log("Plantillas disponibles (sector -> --blueprint con ese sector):");
    for (const id of templates) console.log(`  - ${id}`);
    console.log("Presets disponibles:");
    for (const id of presets) console.log(`  - ${id}`);
    return;
  }
  const businesses = await listGeneratedBusinesses({});
  if (businesses.length === 0) {
    console.log("Ningún negocio generado todavía. Usa `npm run business:create -- --example=full`.");
    return;
  }
  for (const b of businesses) {
    console.log(`${b.businessId}\t${b.sector}\t${b.plan}\t${b.commercialName}\t${b.lastRunAt || "(sin ejecutar)"}`);
  }
}

main();
