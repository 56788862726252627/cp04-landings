#!/usr/bin/env node
// Paso 20 · npm run factory:proposal -- [--input=<ruta.json>] [--profile=<id>] [--format json|markdown|html] [--output=<ruta>] [--include-roadmap] [--mock-integrations]
//
// Atajo de conveniencia sobre `commercial:proposal` pensado como
// "entregable listo para el cliente": por defecto genera HTML
// imprimible (a diferencia de `commercial:proposal`, que por defecto es
// Markdown). --include-roadmap añade el detalle completo del roadmap al
// final del documento.
import { parseCliArgs, writeOutputOrPrint, resolveCommercialInputFromArgs, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { buildCommercialAssessment } from "../src/saas-core/commercial/commercialAssessment.js";
import { computeRoiScenarios } from "../src/saas-core/commercial/roiEngine.js";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildImplementationRoadmap } from "../src/saas-core/commercial/implementationRoadmap.js";
import { buildCommercialProposal, renderProposalJson, renderProposalMarkdown, renderProposalHtml } from "../src/saas-core/commercial/proposalGenerator.js";

const HELP = `Uso: npm run factory:proposal -- [--input=<ruta.json>] [--profile=<id>] [opciones]

  --format=json|markdown|html   (por defecto: html — entregable listo para el cliente)
  --output=<ruta>          Guarda el resultado en un archivo
  --include-roadmap         Añade el detalle completo del roadmap al final del documento
  --mock-integrations       Simula credenciales de TEST (nunca red real)
  --help                    Muestra esta ayuda
`;

const FORMATS = Object.freeze(["json", "markdown", "html"]);

function appendRoadmap(output, format, roadmap) {
  if (format === "json") return output;
  const roadmapText = roadmap.steps.map((s) => `${s.order}. ${s.title}`).join(format === "html" ? "</li><li>" : "\n");
  if (format === "html") return `${output}\n<section><h2>Roadmap detallado</h2><ol><li>${roadmapText}</li></ol></section>`;
  return `${output}\n## Roadmap detallado\n${roadmap.steps.map((s) => `${s.order}. ${s.title}`).join("\n")}\n`;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const format = args.format ? String(args.format) : "html";
    if (!FORMATS.includes(format)) throw new CommercialCliError(`--format desconocido: "${args.format}". Usa uno de: ${FORMATS.join(", ")}.`);

    const input = await resolveCommercialInputFromArgs(args);
    const env = resolveMockIntegrationsEnv(args);
    const assessment = buildCommercialAssessment(input);
    const roi = computeRoiScenarios(input.roiInputs, { profileId: assessment.profileId });
    const integrationsReadiness = computeIntegrationReadiness(env, input.externalContext);
    const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
    const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness });

    let output = format === "json" ? renderProposalJson(proposal) : format === "html" ? renderProposalHtml(proposal) : renderProposalMarkdown(proposal);
    if (Boolean(args["include-roadmap"])) output = appendRoadmap(output, format, roadmap);
    await writeOutputOrPrint(args, output);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
