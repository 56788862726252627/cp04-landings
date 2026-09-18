#!/usr/bin/env node
// Prompt Agencia IA 4/7 · npm run business:status -- --business=<businessId> [opciones]
//
// Informe de preparación de un negocio YA generado: estado operativo
// normalizado (8 estados, ./operationalState.js) + matriz de las 11
// integraciones (commercial/integrationReadiness.js, Paso 20) + clasificación
// A/B/C. Modo lectura: no llama a ningún servicio externo, no escribe nada
// salvo con --output, no revela ninguna credencial.
import { parseCliArgs, DEFAULT_BUSINESSES_DIR, loadGeneratedBusinessStatusInputs, BusinessCliError } from "./lib/businessCli.mjs";
import { writeOutputOrPrint } from "../research-cli/lib/researchCli.mjs";
import { resolveFormat, resolveMockIntegrationsEnv, CommercialCliError } from "../commercial-cli/lib/commercialCli.mjs";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildBusinessStatusReport, renderBusinessStatusMarkdown, renderBusinessStatusJson } from "../src/saas-core/factory/businessStatusReport.js";

const HELP = `Uso: npm run business:status -- --business=<businessId> [opciones]

  --business=<id>          Obligatorio: negocio ya generado (business:create/business:build)
  --scope=dryRun|production (por defecto: dryRun)
  --format=json|markdown    (por defecto: markdown)
  --output=<ruta>           Guarda el resultado en un archivo
  --mock-integrations       Simula credenciales de TEST (nunca red real)
  --strict                  Sale con código 1 si la clasificación final es "C"
  --help                    Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  if (!args.business) {
    console.error("Error: falta --business=<businessId>");
    process.exitCode = 1;
    return;
  }

  try {
    const scope = args.scope ? String(args.scope) : "dryRun";
    if (scope !== "dryRun" && scope !== "production") {
      throw new BusinessCliError(`--scope desconocido: "${args.scope}". Usa "dryRun" o "production".`);
    }
    const format = resolveFormat(args);
    const { report, tenantConfig } = await loadGeneratedBusinessStatusInputs({ businessId: args.business, baseDir: DEFAULT_BUSINESSES_DIR });
    const env = { ...process.env, ...resolveMockIntegrationsEnv(args) };
    const integrationsReadiness = computeIntegrationReadiness(env, {});
    const status = buildBusinessStatusReport({ report, tenantConfig, integrationsReadiness, scope });

    const output = format === "json" ? renderBusinessStatusJson(status) : renderBusinessStatusMarkdown(status);
    await writeOutputOrPrint(args, output);

    if (Boolean(args.strict) && status.classification === "C") {
      console.error(`--strict: clasificación "C" (bloqueado) para "${args.business}"`);
      process.exitCode = 1;
    }
  } catch (err) {
    if (err instanceof BusinessCliError || err instanceof CommercialCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
