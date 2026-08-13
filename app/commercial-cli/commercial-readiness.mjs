#!/usr/bin/env node
// Paso 20 · npm run commercial:readiness -- [--format json|markdown] [--output=<ruta>] [--mock-integrations] [--strict]
//
// "Doctor" comercial: combina integrationReadiness + sandboxReadiness en
// un resumen único de qué está listo, qué falta y cuál es el bloqueo
// actual. --strict: sale con código 1 si hay algún estado ERROR.
import { parseCliArgs, writeOutputOrPrint, resolveFormat, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { describeSandboxReadiness } from "../src/saas-core/commercial/commercialSandbox.js";

const HELP = `Uso: npm run commercial:readiness -- [opciones]

  --format=json|markdown   (por defecto: markdown)
  --output=<ruta>          Guarda el resultado en un archivo
  --mock-integrations      Simula credenciales de TEST (nunca red real)
  --strict                 Sale con código 1 si alguna integración está en estado ERROR
  --help                   Muestra esta ayuda
`;

function renderMarkdown(readiness, sandbox) {
  const lines = [
    "# Readiness comercial", "",
    `Bloqueado globalmente: ${readiness.overallBlocked ? "sí" : "no"}`, "",
    "## Resumen por estado", ...Object.entries(readiness.summary).map(([status, count]) => `- ${status}: ${count}`),
    "", "## Sandbox Stripe/WhatsApp", `- Stripe: ${sandbox.stripe.message}`, `- WhatsApp: ${sandbox.whatsapp.message}`,
  ];
  return lines.join("\n") + "\n";
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const format = resolveFormat(args);
    const env = resolveMockIntegrationsEnv(args);
    const readiness = computeIntegrationReadiness(env, {});
    const sandbox = describeSandboxReadiness(env);
    const output = format === "json" ? JSON.stringify({ readiness, sandbox }, null, 2) + "\n" : renderMarkdown(readiness, sandbox);
    await writeOutputOrPrint(args, output);

    if (Boolean(args.strict) && readiness.summary.ERROR > 0) {
      console.error(`--strict: ${readiness.summary.ERROR} integración(es) en estado ERROR`);
      process.exitCode = 1;
    }
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
