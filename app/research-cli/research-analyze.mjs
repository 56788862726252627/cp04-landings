#!/usr/bin/env node
// Paso 12 · npm run research:analyze -- --evidence=<evidence.json> --sector=<id> [--output=<ruta>] [--help]
//
// Ejecuta SOLO las etapas de análisis (dimensiones/scores/recomendaciones/
// automatizaciones/comparación) a partir de evidencia YA recolectada
// (research:collect), sin volver a recolectar ni escribir en disco.
import { readFile } from "node:fs/promises";
import { parseCliArgs, writeOutputOrPrint } from "./lib/researchCli.mjs";
import { analyzeEvidence } from "../src/saas-core/research/auditOrchestrator.js";

const HELP = `Uso: npm run research:analyze -- --evidence=<evidence.json> --sector=<id> [--output=<ruta>] [--help]

Opciones:
  --evidence=<ruta.json>   Archivo de evidencia generado por research:collect (o el evidence.json de una auditoría)
  --sector=<id>            Sector para aplicar el preset de auditoría correspondiente
  --output=<ruta>          Guarda el resultado (JSON) en un archivo
  --help                   Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args.evidence) {
    console.error("Error: debes indicar --evidence=<ruta.json> (genera uno con research:collect).");
    process.exitCode = 1;
    return;
  }

  let raw;
  try {
    raw = JSON.parse(await readFile(String(args.evidence), "utf8"));
  } catch (err) {
    console.error(`Error: no se pudo leer/parsear --evidence="${args.evidence}": ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const evidence = Array.isArray(raw) ? raw : raw.evidence ?? [];
  const competitorBundles = Array.isArray(raw?.competitorBundles) ? raw.competitorBundles : [];
  const result = analyzeEvidence(evidence, args.sector, { competitorBundles });

  await writeOutputOrPrint(args, JSON.stringify(result, null, 2));
  console.log(`Análisis completo: score global ${result.scores.global.score ?? "sin datos"}, ${result.recommendations.length} recomendación(es), ${result.automations.length} automatización(es) candidata(s).`);
}

main();
