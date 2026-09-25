#!/usr/bin/env node
// Paso 11 · npm run business:explain -- --intent=<intent.json> [--output=<ruta>] [--help]
//
// Explica por qué se eligió cada módulo/automatización/supuesto de un
// Business Intent ya generado. Nunca inventa datos nuevos: solo reexpone
// las justificaciones que los motores de interpretación ya calcularon.
import { parseCliArgs, loadIntentFromFile, renderExplanation, writeOutputIfRequested, NlBuilderCliError } from "./lib/nlBuilderCli.mjs";

const HELP = `Uso: npm run business:explain -- --intent=<ruta.json> [opciones]

Opciones:
  --intent=<ruta.json>   Business Intent generado por business:interpret
  --output=<ruta>        Escribe la explicación en esta ruta (si no, solo stdout)
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

  const rendered = renderExplanation(intent);
  console.log(rendered);
  const written = await writeOutputIfRequested(args, rendered);
  if (written) console.error(`(escrito en ${written})`);
}

main();
