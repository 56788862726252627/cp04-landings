#!/usr/bin/env node
// Paso 09 · npm run tenant:validate -- --tenant=<tenantId>
import { parseCliArgs, validateTenantOnDisk } from "./lib/tenantProvisioning.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const tenantId = args.tenant;
  if (!tenantId) {
    console.error("Error: falta --tenant=<tenantId>");
    process.exitCode = 1;
    return;
  }
  const { valid, errors } = await validateTenantOnDisk({ tenantId });
  if (valid) {
    console.log(`OK: "${tenantId}" es una configuración de tenant válida.`);
    return;
  }
  console.error(`INVÁLIDO: "${tenantId}" tiene ${errors.length} error(es):`);
  for (const err of errors) console.error(`  - ${err.path}: ${err.message}`);
  process.exitCode = 1;
}

main();
