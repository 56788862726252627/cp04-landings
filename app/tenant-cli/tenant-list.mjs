#!/usr/bin/env node
// Paso 09 · npm run tenant:list [-- --catalog]  (--catalog lista plantillas/presets disponibles en vez de tenants generados)
import { parseCliArgs, listTenantsOnDisk } from "./lib/tenantProvisioning.mjs";
import { SECTOR_TEMPLATE_IDS } from "../src/saas-core/templates/templates.js";
import { SECTOR_PRESET_IDS } from "../src/saas-core/templates/presets.js";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.catalog) {
    console.log("Plantillas disponibles (--template=):");
    for (const id of SECTOR_TEMPLATE_IDS) console.log(`  - ${id}`);
    console.log("Presets disponibles (--preset=):");
    for (const id of SECTOR_PRESET_IDS) console.log(`  - ${id}`);
    return;
  }
  const tenants = await listTenantsOnDisk({});
  for (const t of tenants) {
    console.log(`${t.tenantId}\t${t.kind}\t${t.businessType}/${t.sector}\t${t.displayName}`);
  }
}

main();
