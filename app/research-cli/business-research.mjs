#!/usr/bin/env node
// Paso 12 · npm run business:research -- --business-intent=<intent.json> [--fixture=<id>] [--offline|--online] [--dry-run] [--help]
//
// Puente Business Intent (Paso 11) → Research Audit (Paso 12): toma un
// Business Intent ya generado y ejecuta una auditoría de investigación
// sobre el mismo negocio, para poder comparar lo que se INTERPRETÓ de la
// petición del usuario con lo que la investigación pública/local
// encuentra realmente. Offline por defecto, igual que research:audit.
import { parseCliArgs, loadJsonFile, ResearchCliError } from "./lib/researchCli.mjs";
import { buildResearchRequest } from "../src/saas-core/research/researchRequestSchema.js";
import { runResearchAudit, RequestValidationError, PolicyViolationError, AuditCollisionError } from "../src/saas-core/research/auditOrchestrator.js";

const HELP = `Uso: npm run business:research -- --business-intent=<intent.json> [opciones]

Opciones:
  --business-intent=<ruta.json>   Business Intent generado por business:interpret (Paso 11)
  --fixture=<id>[,<id>...]         Fixtures locales a usar como fuente de investigación
  --url=<url>[,...]                URL(s) declaradas (sin conexión real en este paso)
  --online                         Cambia el modo a "online" (sigue sin conectarse realmente)
  --dry-run                        Solo calcula, no escribe en disco
  --force                          Permite sobrescribir una colisión de archivos
  --help                           Muestra esta ayuda
`;

function splitList(value) {
  if (value === undefined || value === true) return [];
  return String(value).split(",").map((s) => s.trim()).filter(Boolean);
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args["business-intent"]) {
    console.error("Error: debes indicar --business-intent=<ruta.json> (generado por business:interpret).");
    process.exitCode = 1;
    return;
  }

  let intent;
  try {
    intent = await loadJsonFile(args["business-intent"], "--business-intent");
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  const request = buildResearchRequest({
    mode: args.online ? "online" : "offline",
    language: intent.language,
    country: intent.country,
    business: { name: intent.business?.proposedName, sector: intent.business?.sector, subsector: intent.business?.subsector },
    inputs: { urls: splitList(args.url), fixtures: splitList(args.fixture ?? args.fixtures), businessIntent: [String(args["business-intent"])] },
    objectives: [`Contrastar el Business Intent "${intent.business?.proposedName}" (Paso 11) con evidencia de investigación real.`],
  });

  try {
    const result = await runResearchAudit(request, { dryRun: Boolean(args["dry-run"]), force: Boolean(args.force) });
    console.log(`Auditoría "${result.auditId}" (a partir de Business Intent) completada en ${result.durationMs}ms.`);
    console.log(`Score global: ${result.scores.global.score ?? "sin datos"}/100 (${result.scores.global.status}).`);
    console.log(`Archivos creados: ${result.filesCreated.length} · actualizados: ${result.filesUpdated.length} · preservados: ${result.filesPreserved.length}.`);
    console.log(`Siguiente paso: usa research:enrich-intent --intent="${args["business-intent"]}" --audit=<ruta al audit.json generado> para proponer mejoras al Business Intent.`);
  } catch (err) {
    if (err instanceof RequestValidationError || err instanceof PolicyViolationError || err instanceof AuditCollisionError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
