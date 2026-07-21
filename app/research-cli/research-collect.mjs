#!/usr/bin/env node
// Paso 12 · npm run research:collect -- --request=<research-request.json> | --demo=<id> [--output=<ruta>] [--help]
//
// Ejecuta SOLO la etapa de recolección de evidencia (offline/fixtures),
// sin analizar ni escribir en research/audits/. Útil para inspeccionar
// qué evidencia se obtendría antes de correr la auditoría completa.
import { parseCliArgs, resolveResearchRequestFromArgs, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import { collectEvidence } from "../src/saas-core/research/auditOrchestrator.js";
import { deduplicateEvidence } from "../src/saas-core/research/evidenceDeduper.js";

const HELP = `Uso: npm run research:collect -- --request=<research-request.json> | --demo=<id> [--local-files-base-dir=<ruta>] [--output=<ruta>] [--help]

Opciones:
  --request=<ruta.json>        Research Request ya construido y válido
  --demo=<id>                   Usa una fixture de demostración
  --local-files-base-dir=<ruta> Directorio base seguro para --local-file(s)
  --output=<ruta>               Guarda la evidencia (JSON) en un archivo
  --help                        Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let request;
  try {
    request = await resolveResearchRequestFromArgs(args);
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const { evidence: rawEvidence, competitorBundles, limitations } = await collectEvidence(request, { localFilesBaseDir: args["local-files-base-dir"] });
  const evidence = deduplicateEvidence(rawEvidence);

  await writeOutputOrPrint(args, JSON.stringify({ evidence, competitorBundles, limitations }, null, 2));
  console.log(`Recolectadas ${evidence.length} evidencia(s) (tras deduplicar), ${competitorBundles.length} paquete(s) de competidor, ${limitations.length} limitación(es).`);
}

main();
