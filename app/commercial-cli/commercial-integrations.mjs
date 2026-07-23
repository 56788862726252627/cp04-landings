#!/usr/bin/env node
// Paso 20 · npm run commercial:integrations -- [--format json|markdown] [--output=<ruta>] [--mock-integrations]
//
// Imprime el estado de las 10 integraciones (Airtable/Make/Stripe/
// WhatsApp/Gmail/dominio/SSL/hosting/backups/monitorización). Nunca
// realiza ninguna comprobación de red real.
import { parseCliArgs, writeOutputOrPrint, resolveFormat, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";

const HELP = `Uso: npm run commercial:integrations -- [opciones]

  --format=json|markdown   (por defecto: markdown)
  --output=<ruta>          Guarda el resultado en un archivo
  --mock-integrations      Simula credenciales de TEST (nunca red real)
  --airtable-degraded      Marca Airtable como DEGRADED (cuota agotada, según el contexto conocido del proyecto)
  --make-validated=<n>     Nº de flujos Make ya validados con llamadas reales (por defecto: 0)
  --help                   Muestra esta ayuda
`;

function renderMarkdown(result) {
  const lines = [`# Estado de integraciones`, "", `> ${result.disclaimer}`, "", "| Integración | Estado | Bloqueo | Próximos pasos |", "|---|---|---|---|"];
  for (const i of Object.values(result.integrations)) lines.push(`| ${i.label} | ${i.status} | ${i.blockedBy ?? "—"} | ${i.nextSteps.join("; ") || "—"} |`);
  return lines.join("\n") + "\n";
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const format = resolveFormat(args);
    const env = resolveMockIntegrationsEnv(args);
    const externalContext = { airtableKnownDegraded: Boolean(args["airtable-degraded"]), makeValidatedFlowCount: args["make-validated"] !== undefined ? Number(args["make-validated"]) : 0 };
    const result = computeIntegrationReadiness(env, externalContext);
    const output = format === "json" ? JSON.stringify(result, null, 2) + "\n" : renderMarkdown(result);
    await writeOutputOrPrint(args, output);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
