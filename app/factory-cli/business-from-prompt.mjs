#!/usr/bin/env node
// Paso 11 · npm run business:from-prompt -- --prompt="..." | --prompt-file=<ruta> | --demo=<id>
//   [--seed=<id>] [--answers=<ruta.json>] [--plan=starter|pro|business]
//   [--dry-run] [--execute] [--strict] [--format=json|markdown|summary] [--help]
//
// Pipeline completo: interpretar → componer Blueprint → validar → preview →
// (opcional) ejecutar la fábrica de Paso 10 → informe.
//
//   --dry-run   nada se escribe en disco: solo análisis + preview en stdout.
//   (por defecto, sin --dry-run ni --execute)
//               escribe intent.json + business.blueprint.json + informe en
//               src/saas-core/nl-builder/requests/<businessId>/ (nunca en
//               saas-core/businesses/, territorio del Paso 10).
//   --execute   además, ejecuta el orquestador REAL de Paso 10
//               (runFactoryPipeline, idempotente) y materializa el tenant.
//   --strict    una ambigüedad BLOQUEANTE produce una salida controlada
//               (se imprime el análisis) y código de salida 2, SIN escribir
//               nada en el repositorio (ni siquiera en modo por defecto).
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import {
  parseCliArgs,
  resolvePromptFromArgs,
  resolveSeedFromArgs,
  resolveAnswersFromArgs,
  interpretBusinessDescription,
  composeBlueprintFromIntent,
  renderIntentInFormat,
  writeRequestArtifacts,
  resolveRequestDir,
  hasBlockingAmbiguities,
  NlBuilderCliError,
} from "./lib/nlBuilderCli.mjs";
import { runFactoryPipeline, BusinessFactoryError } from "../src/saas-core/factory/orchestrator.js";
import { buildReportData, renderReportMarkdown, renderReportJson } from "../src/saas-core/factory/reportGenerator.js";

const HELP = `Uso: npm run business:from-prompt -- --prompt="..." | --prompt-file=<ruta> | --demo=<id> [opciones]

Opciones:
  --seed=<id>              Seed determinista (por defecto: "default-seed")
  --answers=<ruta.json>    Respuestas no interactivas a ambigüedades
  --plan=starter|pro|business   Fuerza el plan del Business Blueprint compuesto
  --business-id=<slug>     Fuerza el businessId/tenantId (evita colisiones cuando dos
                           peticiones distintas derivarían el mismo nombre por defecto)
  --format=json|markdown|summary   Formato del análisis impreso en stdout
  --dry-run                No escribe NADA en disco: solo análisis + preview
  --execute                Ejecuta la fábrica real de Paso 10 (idempotente)
  --strict                 Ambigüedades bloqueantes → código de salida 2, sin escribir nada
  --help                    Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let sourceText, answers;
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
  const start = Date.now();
  const intent = interpretBusinessDescription(sourceText, { seed, answers });
  const format = typeof args.format === "string" ? args.format : "summary";

  console.log("Paso 1/4 — Interpretando la petición en lenguaje natural...");
  console.log(renderIntentInFormat(intent, format));

  if (args.strict && hasBlockingAmbiguities(intent)) {
    console.error("\nModo estricto: hay ambigüedades BLOQUEANTES. Salida controlada, no se ha escrito nada en el repositorio.");
    process.exitCode = 2;
    return;
  }

  console.log("\nPaso 2/4 — Componiendo el Business Blueprint...");
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
  console.log(`  OK. businessId="${blueprint.businessId}", plan="${blueprint.plan}", módulos: ${blueprint.modules.length}.`);

  console.log("\nPaso 3/4 — Preview (dry-run del orquestador de Paso 10)...");
  const preview = await runFactoryPipeline({ blueprint, dryRun: true });
  console.log(`  Se crearían ${preview.filesCreated.length} archivo(s), se actualizarían ${preview.filesUpdated.length}, colisiones: ${preview.collisions.length}.`);

  if (args["dry-run"]) {
    console.log("\n--dry-run: no se ha escrito nada en disco.");
    console.log(`Duración total: ${Date.now() - start} ms`);
    return;
  }

  console.log("\nPaso 4/4 — Guardando artefactos de análisis...");
  const artifacts = await writeRequestArtifacts({ businessId: blueprint.businessId, intent, blueprint });
  console.log(`  Guardado en ${artifacts.dir}`);

  let reportData;
  if (args.execute) {
    console.log("\n--execute: ejecutando la fábrica real de Paso 10 (idempotente)...");
    let result;
    try {
      result = await runFactoryPipeline({ blueprint });
    } catch (err) {
      if (err instanceof BusinessFactoryError) {
        console.error(`Error en la fábrica: ${err.message}`);
        process.exitCode = 1;
        return;
      }
      throw err;
    }
    console.log(`  Negocio generado en ${result.outputDir}. Creados: ${result.filesCreated.length} · actualizados: ${result.filesUpdated.length} · preservados: ${result.filesPreserved.length}.`);
    reportData = buildReportData(result);
  } else {
    console.log("\n(sin --execute: el negocio NO se ha materializado en src/saas-core/businesses/; solo se guardó el análisis)");
    reportData = {
      businessId: blueprint.businessId,
      blueprint: { businessId: blueprint.businessId, sector: blueprint.sector, commercialName: blueprint.commercialName },
      filesCreated: [],
      filesUpdated: [],
      filesPreserved: [],
      modulesActivated: blueprint.modules,
      modulesDiscarded: intent.rejectedFeatures.map((f) => f.id),
      automationsSelected: blueprint.automations,
      integrationsDeclared: Object.keys(blueprint.integrations),
      demoDataSummary: { note: "no generado (requiere --execute)" },
      reuse: { note: "100% del catálogo genérico de Paso 09/10; 0 archivos centrales modificados por este negocio" },
      manualSteps: blueprint.manualSteps,
      risks: intent.complianceNotes,
      limitations: ["Análisis únicamente: pasa --execute para materializar el tenant real."],
      durationMs: Date.now() - start,
      compatibility: { note: "ver app/docs/paso-10-one-prompt-factory/" },
      idempotent: preview.idempotent,
      dryRun: false,
      nextStep: "Ejecutar de nuevo con --execute para generar el tenant, o revisar manualSteps/ambigüedades primero.",
      generatedAt: null,
    };
  }

  await mkdir(artifacts.dir, { recursive: true });
  await writeFile(path.join(artifacts.dir, "report.md"), renderReportMarkdown(reportData), "utf8");
  await writeFile(path.join(artifacts.dir, "report.json"), renderReportJson(reportData), "utf8");
  console.log(`  Informe guardado en ${path.join(artifacts.dir, "report.md")}`);

  console.log(`\nDuración total: ${Date.now() - start} ms`);
}

main();
