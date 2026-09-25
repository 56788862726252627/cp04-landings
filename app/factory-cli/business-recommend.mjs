#!/usr/bin/env node
// Paso 11 · npm run business:recommend -- --intent=<intent.json> [--help]
//
// Muestra solo las recomendaciones de un Business Intent ya generado:
// automatizaciones sugeridas y módulos en estado "suggested" (posibles
// mejoras futuras no activadas por defecto). No modifica nada.
import { parseCliArgs, loadIntentFromFile, NlBuilderCliError } from "./lib/nlBuilderCli.mjs";

const HELP = `Uso: npm run business:recommend -- --intent=<ruta.json> [--help]

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

  console.log(`Recomendaciones para "${intent.business.proposedName}":\n`);

  console.log("Automatizaciones recomendadas:");
  if (intent.automations.length === 0) console.log("  (ninguna con los módulos habilitados actuales)");
  for (const a of intent.automations) console.log(`  - ${a.id} (capacidad: ${a.capability}, disparador: ${a.trigger})`);

  const suggestedModules = intent.modules.filter((m) => m.status === "suggested");
  console.log("\nMódulos sugeridos como posible mejora futura (no activados por defecto):");
  if (suggestedModules.length === 0) console.log("  (ninguno)");
  for (const m of suggestedModules) console.log(`  - ${m.id}: ${m.justification}`);
}

main();
