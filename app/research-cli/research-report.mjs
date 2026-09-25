#!/usr/bin/env node
// Paso 12 · npm run research:report -- --audit=<research/audits/<id>/audit.json> [--format=executive|technical|commercial|opportunities|backlog|matrix|automations|risks|evidence] [--output=<ruta>] [--help]
//
// Regenera un informe (Markdown) a partir del audit.json ya persistido por
// research:audit, sin volver a recolectar ni recalcular nada.
import { parseCliArgs, loadJsonFile, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import {
  renderExecutiveReportMarkdown,
  renderTechnicalReportMarkdown,
  renderCommercialReportMarkdown,
  renderOpportunitiesSummaryMarkdown,
  renderBacklogMarkdown,
  renderImpactEffortMatrixMarkdown,
  renderAutomationMapMarkdown,
  renderRiskReportMarkdown,
  renderEvidenceAppendixMarkdown,
} from "../src/saas-core/research/auditReportGenerator.js";

const RENDERERS = Object.freeze({
  executive: renderExecutiveReportMarkdown,
  technical: renderTechnicalReportMarkdown,
  commercial: renderCommercialReportMarkdown,
  opportunities: renderOpportunitiesSummaryMarkdown,
  backlog: renderBacklogMarkdown,
  matrix: renderImpactEffortMatrixMarkdown,
  automations: renderAutomationMapMarkdown,
  risks: renderRiskReportMarkdown,
  evidence: renderEvidenceAppendixMarkdown,
});

const HELP = `Uso: npm run research:report -- --audit=<ruta/audit.json> [--format=${Object.keys(RENDERERS).join("|")}] [--output=<ruta>] [--help]

Opciones:
  --audit=<ruta.json>   audit.json ya persistido por research:audit
  --format=<tipo>       Tipo de informe a regenerar (por defecto: executive)
  --output=<ruta>        Guarda el informe en un archivo
  --help                 Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }
  if (!args.audit) {
    console.error("Error: debes indicar --audit=<ruta/audit.json> (generado por research:audit).");
    process.exitCode = 1;
    return;
  }

  const format = args.format || "executive";
  const renderer = RENDERERS[format];
  if (!renderer) {
    console.error(`Error: --format desconocido: "${format}". Usa uno de: ${Object.keys(RENDERERS).join(", ")}.`);
    process.exitCode = 1;
    return;
  }

  let reportData;
  try {
    reportData = await loadJsonFile(args.audit, "--audit");
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  await writeOutputOrPrint(args, renderer(reportData));
}

main();
