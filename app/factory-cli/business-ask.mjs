#!/usr/bin/env node
// Paso 11 · npm run business:ask -- --intent=<intent.json> [--help]
//
// Muestra las preguntas recomendadas (y las ambigüedades bloqueantes, si
// las hay) de un Business Intent ya generado, sin modificar nada. Nunca
// bloquea la generación por sí solo: es informativo.
import { parseCliArgs, loadIntentFromFile, NlBuilderCliError } from "./lib/nlBuilderCli.mjs";

const HELP = `Uso: npm run business:ask -- --intent=<ruta.json> [--help]

Opciones:
  --intent=<ruta.json>   Business Intent generado por business:interpret
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

  console.log(`Preguntas recomendadas para "${intent.business.proposedName}":\n`);
  if (intent.recommendedQuestions.length === 0) {
    console.log("(ninguna: la petición no dejó ambigüedades relevantes sin resolver)");
  } else {
    for (const q of intent.recommendedQuestions) console.log(`  - ${q}`);
  }

  const blocking = intent.ambiguities.filter((a) => a.blocking);
  if (blocking.length > 0) {
    console.log("\nAmbigüedades BLOQUEANTES (conviene resolverlas antes de generar el negocio):");
    for (const a of blocking) console.log(`  - ${a.field}: ${a.reason}`);
  }
}

main();
