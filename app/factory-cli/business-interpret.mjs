#!/usr/bin/env node
// Paso 11 · npm run business:interpret -- --prompt="..." | --prompt-file=<ruta> | --demo=<id>
//   [--seed=<id>] [--answers=<ruta.json>] [--format=json|markdown|summary]
//   [--output=<ruta>] [--compare=<intent-anterior.json>] [--strict] [--help]
//
// Interpreta una descripción en lenguaje natural y produce un Business
// Intent. NUNCA escribe en el repositorio salvo que se indique --output
// explícitamente. En --strict, una ambigüedad bloqueante produce una salida
// controlada (se imprime igualmente el análisis completo) y código de
// salida 2, sin escribir nada más allá de lo que el usuario pidió.
import {
  parseCliArgs,
  resolvePromptFromArgs,
  resolveSeedFromArgs,
  resolveAnswersFromArgs,
  interpretBusinessDescription,
  renderIntentInFormat,
  writeOutputIfRequested,
  loadIntentFromFile,
  structuralDiff,
  serializeDiffAsMarkdown,
  hasBlockingAmbiguities,
  NlBuilderCliError,
} from "./lib/nlBuilderCli.mjs";

const HELP = `Uso: npm run business:interpret -- --prompt="..." | --prompt-file=<ruta> | --demo=<id> [opciones]

Opciones:
  --seed=<id>              Seed determinista (por defecto: "default-seed")
  --answers=<ruta.json>    Respuestas no interactivas a ambigüedades ({"campo": valor})
  --format=json|markdown|summary   Formato de salida (por defecto: json)
  --output=<ruta>          Escribe el resultado en esta ruta (si no, solo stdout)
  --compare=<intent.json>  Compara contra un Business Intent previo (imprime un diff)
  --strict                 Ambigüedades bloqueantes producen código de salida 2
  --help                   Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let sourceText;
  let answers;
  try {
    sourceText = await resolvePromptFromArgs(args);
    answers = await resolveAnswersFromArgs(args);
  } catch (err) {
    if (err instanceof NlBuilderCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const seed = resolveSeedFromArgs(args);
  const intent = interpretBusinessDescription(sourceText, { seed, answers });
  const format = typeof args.format === "string" ? args.format : "json";

  let rendered;
  try {
    rendered = renderIntentInFormat(intent, format);
  } catch (err) {
    if (err instanceof NlBuilderCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  console.log(rendered);
  const written = await writeOutputIfRequested(args, format === "json" ? rendered : rendered);
  if (written) console.error(`(escrito en ${written})`);

  if (args.compare) {
    try {
      const previous = await loadIntentFromFile(args.compare);
      const diff = structuralDiff(previous, intent);
      console.log("");
      console.log(serializeDiffAsMarkdown(diff, { titleA: "anterior", titleB: "actual" }));
    } catch (err) {
      if (err instanceof NlBuilderCliError) {
        console.error(`Error al comparar: ${err.message}`);
        process.exitCode = 1;
        return;
      }
      throw err;
    }
  }

  if (args.strict && hasBlockingAmbiguities(intent)) {
    console.error("\nModo estricto: hay ambigüedades BLOQUEANTES sin resolver. Revisa la sección de ambigüedades antes de continuar.");
    process.exitCode = 2;
  }
}

main();
