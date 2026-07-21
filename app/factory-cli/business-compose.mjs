#!/usr/bin/env node
// Paso 11 · npm run business:compose -- --intent=<intent.json> [--output=<ruta>] [--plan=starter|pro|business] [--help]
//
// Compone un Business Blueprint (compatible con business:create de Paso 10)
// a partir de un Business Intent ya generado. Nunca escribe en el
// repositorio salvo que se indique --output explícitamente.
import { parseCliArgs, loadIntentFromFile, composeBlueprintFromIntent, writeOutputIfRequested, serializeAsJson, NlBuilderCliError } from "./lib/nlBuilderCli.mjs";

const HELP = `Uso: npm run business:compose -- --intent=<ruta.json> [opciones]

Opciones:
  --intent=<ruta.json>   Business Intent generado por business:interpret
  --output=<ruta>        Escribe el Business Blueprint en esta ruta (si no, solo stdout)
  --plan=starter|pro|business   Fuerza el plan (por defecto se infiere del número de módulos)
  --business-id=<slug>   Fuerza el businessId/tenantId (evita colisiones de nombre)
  --help                 Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args.intent) {
    console.error("Error: debes indicar --intent=<ruta.json> (genera uno con business:interpret).");
    process.exitCode = 1;
    return;
  }

  let intent;
  try {
    intent = await loadIntentFromFile(args.intent);
  } catch (err) {
    if (err instanceof NlBuilderCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  let blueprint;
  try {
    blueprint = composeBlueprintFromIntent(intent, {
      plan: typeof args.plan === "string" ? args.plan : undefined,
      businessIdOverride: typeof args["business-id"] === "string" ? args["business-id"] : undefined,
    });
  } catch (err) {
    console.error(`Error al componer el Business Blueprint: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const rendered = serializeAsJson(blueprint);
  console.log(rendered);
  const written = await writeOutputIfRequested(args, rendered);
  if (written) console.error(`(escrito en ${written})`);
}

main();
