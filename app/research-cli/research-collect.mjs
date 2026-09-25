#!/usr/bin/env node
// Paso 12/13 · npm run research:collect -- --request=<research-request.json> | --demo=<id> [opciones] [--help]
//
// Ejecuta SOLO la etapa de recolección de evidencia, sin analizar ni
// escribir en research/audits/. Útil para inspeccionar qué evidencia se
// obtendría antes de correr la auditoría completa.
//
// Paso 13: con --url --provider publicWebsiteFetcher --allow-network (y
// --mode=public-web/hybrid) recolecta de verdad contra la red pública.
// Sin --allow-network, cualquier URL produce evidencia "unavailable".
import { parseCliArgs, resolveResearchRequestFromArgs, resolveNetworkOptionsFromArgs, resolveProviderExecutionOptionsFromArgs, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import { collectEvidence } from "../src/saas-core/research/auditOrchestrator.js";
import { deduplicateEvidence } from "../src/saas-core/research/evidenceDeduper.js";

const HELP = `Uso: npm run research:collect -- --request=<research-request.json> | --demo=<id> [opciones] [--help]

Opciones:
  --request=<ruta.json>        Research Request ya construido y válido
  --demo=<id>                   Usa una fixture de demostración
  --url=<url>[,...]             URL(s) a recolectar (requiere --mode=public-web/hybrid + --allow-network para red real)
  --mode=offline|online|public-web|hybrid
  --allow-network               Habilita conexión real para esta ejecución (Paso 13)
  --provider=publicWebsiteFetcher
  --timeout=<ms> --max-bytes=<n> --max-pages=<n> --respect-robots=true|false --user-agent=<texto>
  --local-files-base-dir=<ruta> Directorio base seguro para --local-file(s)
  --output=<ruta>               Guarda la evidencia (JSON) en un archivo
  --pipeline=legacy|multiprovider   Paso 15 (por defecto: legacy) — ver npm run research:audit -- --help
  --execution / --providers / --exclude-providers / --provider-priority / --profile / --max-concurrency / --global-timeout / --provider-timeout
  --help                        Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let request;
  let networkOptions;
  let providerOptions;
  try {
    request = await resolveResearchRequestFromArgs(args);
    networkOptions = resolveNetworkOptionsFromArgs(args);
    providerOptions = resolveProviderExecutionOptionsFromArgs(args);
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const { evidence: rawEvidence, competitorBundles, limitations, networkUsed, consultedUrls, providerRunSummary } = await collectEvidence(request, {
    localFilesBaseDir: args["local-files-base-dir"],
    allowNetwork: networkOptions.allowNetwork,
    networkLimits: networkOptions.networkLimits,
    pipeline: providerOptions.pipeline,
    providerPolicyOptions: providerOptions.providerPolicyOptions,
    profileId: providerOptions.profileId,
  });
  const evidence = deduplicateEvidence(rawEvidence);

  await writeOutputOrPrint(args, JSON.stringify({ evidence, competitorBundles, limitations, providerRunSummary }, null, 2));
  console.log(`Recolectadas ${evidence.length} evidencia(s) (tras deduplicar), ${competitorBundles.length} paquete(s) de competidor, ${limitations.length} limitación(es).`);
  console.log(networkUsed ? `Red REAL usada — URLs consultadas: ${consultedUrls.join(", ")}` : "Sin red real (offline / fixtures).");
}

main();
