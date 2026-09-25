#!/usr/bin/env node
// Paso 10 · npm run business:preview -- --blueprint=<ruta.json> | --example=minimal|full | --business=<businessId>
//
// "Previsualización segura": no escribe nada a disco, no levanta ningún
// servidor ni conecta ningún proveedor. Imprime en JSON todo lo que la
// fábrica derivaría del blueprint (tenant, navegación, branding, landing).
import { parseCliArgs, resolveBlueprintFromArgs, buildPreview, BusinessCliError } from "./lib/businessCli.mjs";

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

  let preview;
  try {
    preview = buildPreview(blueprint);
  } catch (err) {
    console.error(`Error al construir la previsualización: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify({
    businessId: blueprint.businessId,
    tenantId: preview.tenantConfig.tenantId,
    sourceKind: preview.sourceKind,
    templateOrPresetId: preview.sourceKind === "preset" ? preview.base.presetId : preview.base.templateId,
    modulesEnabled: preview.tenantConfig.modulesEnabled,
    navigationByRole: preview.navigationByRole,
    branding: { colors: preview.brandTokens.colors, contrastAllPassAA: preview.brandTokens.contrast.allPassAA },
    landingSections: preview.landingConfig.sectionsEnabled,
    integrations: preview.tenantConfig.integrations,
  }, null, 2));
}

main();
