#!/usr/bin/env node
// Prompt Agencia IA 5/7 · npm run agency:status [opciones]
// Prompt Agencia IA 6/7 · Ampliado con filtros, --summary-only y --webhook-simulate
//
// Vista agregada del estado operativo de TODOS los negocios generados por la agencia.
// Reutiliza `buildBusinessStatusReport` (P4/7) por cada negocio y agrega los resultados.
// Modo lectura: no llama a ningún servicio externo, no escribe nada salvo --output,
// no revela ninguna credencial, nunca lanza si un negocio individual falla al cargar.
import { parseCliArgs, DEFAULT_BUSINESSES_DIR, loadAllGeneratedBusinessStatusInputs, BusinessCliError } from "./lib/businessCli.mjs";
import { writeOutputOrPrint } from "../research-cli/lib/researchCli.mjs";
import { resolveFormat, resolveMockIntegrationsEnv, CommercialCliError } from "../commercial-cli/lib/commercialCli.mjs";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildAgencyStatusReport, renderAgencyStatusMarkdown, renderAgencyStatusJson } from "../src/saas-core/factory/agencyStatusReport.js";
import {
  buildAgencyServiceRequest,
  filterAgencyReport,
  summarizeAgencyReport,
  AgencyServiceError,
} from "../src/saas-core/factory/agencyService.js";
import { buildWebhookPayload, simulateWebhookDelivery } from "../src/saas-core/factory/agencyWebhookAdapter.js";

const HELP = `Uso: npm run agency:status [-- opciones]

  --scope=dryRun|production     (por defecto: dryRun)
  --format=json|markdown        (por defecto: markdown)
  --output=<ruta>               Guarda el resultado en un archivo
  --mock-integrations           Simula credenciales de TEST (nunca red real)
  --strict                      Sale con código 1 si la clasificación global es "C"

Filtros (Prompt 6/7):
  --sector=<id>[,<id>...]       Filtra por sector (ej. padel,veterinary,dental)
  --classification=A|B|C[,...]  Filtra por clasificación final
  --integration=<id>[,<id>...]  Filtra negocios que usen esa integración
  --summary-only                Solo muestra el resumen (sin lista de negocios)

Webhook simulado (Prompt 6/7):
  --webhook-simulate            Genera y muestra el payload de webhook (dry-run, sin red)
  --webhook-destination=<url>   URL de destino para la simulación (nunca se llama)
  --webhook-retries=<número>    Reintentos simulados (por defecto: 3, máximo: 5)

  --help                        Muestra esta ayuda

Ejemplos:
  npm run agency:status
  npm run agency:status -- --scope=production --format=json
  npm run agency:status -- --sector=padel-club,veterinary-clinic --classification=A,B
  npm run agency:status -- --webhook-simulate --webhook-destination=https://hook.make.com/abc
  npm run agency:status -- --summary-only --format=json
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }

  try {
    // Parámetros validados por el servicio
    const serviceReq = buildAgencyServiceRequest({
      scope: args.scope,
      format: args.format,
      sectors: args.sector,
      classifications: args.classification,
      integrations: args.integration,
      mockIntegrations: args["mock-integrations"],
      strict: args.strict,
      summaryOnly: args["summary-only"],
    });

    const format = resolveFormat(args);
    const env = { ...process.env, ...resolveMockIntegrationsEnv(args) };
    const integrationsReadiness = computeIntegrationReadiness(env, {});

    const { loaded, errors } = await loadAllGeneratedBusinessStatusInputs({ baseDir: DEFAULT_BUSINESSES_DIR });

    if (errors.length > 0) {
      for (const e of errors) {
        console.error(`Advertencia: no se pudo cargar "${e.businessId}" — ${e.error}`);
      }
    }

    const agencyReport = buildAgencyStatusReport(loaded, integrationsReadiness, { scope: serviceReq.scope });
    const filteredReport = filterAgencyReport(agencyReport, {
      sectors: serviceReq.sectors,
      classifications: serviceReq.classifications,
      integrations: serviceReq.integrations,
    });

    // Simulación de webhook (Prompt 6/7)
    if (args["webhook-simulate"]) {
      const destination = args["webhook-destination"] ? String(args["webhook-destination"]) : null;
      const retries = args["webhook-retries"] ? Number(args["webhook-retries"]) : 3;
      const webhookPayload = buildWebhookPayload(filteredReport);
      const simulation = simulateWebhookDelivery(webhookPayload, { destination, retries, dryRun: true });
      const output = JSON.stringify(simulation, null, 2);
      await writeOutputOrPrint(args, output);
      return;
    }

    const displayReport = serviceReq.summaryOnly ? summarizeAgencyReport(filteredReport) : filteredReport;
    const output = format === "json" ? renderAgencyStatusJson(displayReport) : renderAgencyStatusMarkdown(displayReport);
    await writeOutputOrPrint(args, output);

    if (Boolean(args.strict) && filteredReport.overallClassification === "C") {
      console.error(`--strict: clasificación global "C" (al menos un negocio bloqueado)`);
      process.exitCode = 1;
    }
  } catch (err) {
    if (err instanceof BusinessCliError || err instanceof CommercialCliError || err instanceof AgencyServiceError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
