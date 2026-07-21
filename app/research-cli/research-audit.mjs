#!/usr/bin/env node
// Paso 12 · npm run research:audit -- --demo=<id> | --request=<research-request.json> | --business-name=... --sector=... [opciones] [--help]
//
// Ejecuta el pipeline COMPLETO (Fase 16) y persiste los artefactos en
// src/saas-core/research/audits/<auditId>/, salvo --dry-run. Idempotente:
// una segunda ejecución sobre el mismo Research Request no crea ni
// actualiza ningún archivo.
import { parseCliArgs, resolveResearchRequestFromArgs, ResearchCliError } from "./lib/researchCli.mjs";
import { runResearchAudit, RequestValidationError, PolicyViolationError, AuditCollisionError, StrictModeBlockedError } from "../src/saas-core/research/auditOrchestrator.js";

const HELP = `Uso: npm run research:audit -- --demo=<id> | --request=<ruta.json> | --business-name=... --sector=<id> [opciones]

Opciones:
  --demo=<id>                     Usa una fixture de demostración ficticia
  --request=<ruta.json>            Research Request ya construido y válido
  --business-name=<...> --sector=<id>   Construye un request inline mínimo
  --fixture=<id>[,<id>...]         Fixtures locales a usar como fuente
  --url=<url>[,<url>...]           URL(s) declaradas (sin conexión real en este paso; --offline por defecto)
  --local-file=<ruta>[,...]        Archivo(s) locales (requiere --local-files-base-dir)
  --local-files-base-dir=<ruta>    Directorio base seguro para --local-file
  --competitor=<id>[,<id>...]      Competidor(es) ficticios para comparación
  --online                         Cambia el modo a "online" (sigue sin conectarse realmente: contrato futuro)
  --dry-run                        Solo calcula, no escribe en disco
  --force                          Permite sobrescribir una colisión de archivos
  --strict                         Bloquea (sin escribir nada) si hay contradicciones sin resolver entre evidencias
  --seed=<valor>                   Semilla determinista (por defecto: "default-seed")
  --help                           Muestra esta ayuda
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

  try {
    const result = await runResearchAudit(request, { localFilesBaseDir: args["local-files-base-dir"], dryRun: Boolean(args["dry-run"]), force: Boolean(args.force), strict: Boolean(args.strict) });
    console.log(`Auditoría "${result.auditId}" completada en ${result.durationMs}ms.`);
    console.log(`Score global: ${result.scores.global.score ?? "sin datos"}/100 (${result.scores.global.status}).`);
    console.log(`Evidencias: ${result.evidence.length} · Recomendaciones: ${result.recommendations.length} · Automatizaciones candidatas: ${result.automations.length}.`);
    console.log(`Archivos creados: ${result.filesCreated.length} · actualizados: ${result.filesUpdated.length} · preservados: ${result.filesPreserved.length}.`);
    if (result.dryRun) console.log("(--dry-run: no se escribió nada en disco)");
    if (result.limitations.length > 0) console.log(`Limitaciones: ${result.limitations.join(" | ")}`);
  } catch (err) {
    if (err instanceof StrictModeBlockedError) {
      console.error(`Bloqueado por --strict: ${err.message}`);
      process.exitCode = 2;
      return;
    }
    if (err instanceof RequestValidationError || err instanceof PolicyViolationError || err instanceof AuditCollisionError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
