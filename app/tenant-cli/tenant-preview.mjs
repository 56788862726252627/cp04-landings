#!/usr/bin/env node
// Paso 09 · npm run tenant:preview -- --tenant=<tenantId>
import { parseCliArgs, previewTenantOnDisk } from "./lib/tenantProvisioning.mjs";

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const tenantId = args.tenant;
  if (!tenantId) {
    console.error("Error: falta --tenant=<tenantId>");
    process.exitCode = 1;
    return;
  }
  let preview;
  try {
    preview = await previewTenantOnDisk({ tenantId });
  } catch (err) {
    console.error(`Error: no se pudo cargar el tenant "${tenantId}": ${err.message}`);
    process.exitCode = 1;
    return;
  }
  console.log(JSON.stringify({
    tenantId: preview.tenantConfig.tenantId,
    displayName: preview.tenantConfig.displayName,
    businessType: preview.tenantConfig.businessType,
    sector: preview.tenantConfig.sector,
    valid: preview.valid,
    errors: preview.errors,
    navigationByRole: preview.navigationByRole,
    integrations: preview.tenantConfig.integrations,
    regulatoryNotice: preview.regulatoryNotice,
  }, null, 2));
}

main();
