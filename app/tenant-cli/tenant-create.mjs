#!/usr/bin/env node
// Paso 09 · npm run tenant:create -- --template=<id> [--preset=<id>] --name="Nombre" [--tenant-id=<slug>] [--no-demo-data] [--force]
import { parseCliArgs, createTenant, TenantProvisioningError } from "./lib/tenantProvisioning.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  try {
    const result = await createTenant({
      template: args.template,
      preset: args.preset,
      name: args.name,
      tenantId: args["tenant-id"],
      demoDataEnabled: args["no-demo-data"] !== true,
      force: args.force === true,
    });
    console.log(`Tenant creado: ${result.tenantId}`);
    console.log(`Directorio: ${result.outputDir}`);
    for (const file of result.filesWritten) console.log(`  - ${file}`);
  } catch (err) {
    if (err instanceof TenantProvisioningError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
