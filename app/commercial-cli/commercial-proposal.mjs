#!/usr/bin/env node
// Paso 20 · npm run commercial:proposal -- [--input=<ruta.json>] [--profile=<id>] [--format json|markdown|html] [--output=<ruta>] [--mock-integrations]
//
// Genera la propuesta comercial completa (JSON/Markdown/HTML) basada en
// evidencia — nunca inventa datos del cliente; lo que falta queda
// marcado como pendiente.
import { parseCliArgs, writeOutputOrPrint, resolveFormat, resolveCommercialInputFromArgs, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { buildCommercialAssessment } from "../src/saas-core/commercial/commercialAssessment.js";
import { computeRoiScenarios } from "../src/saas-core/commercial/roiEngine.js";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildImplementationRoadmap } from "../src/saas-core/commercial/implementationRoadmap.js";
import { buildCommercialProposal, renderProposalJson, renderProposalMarkdown, renderProposalHtml } from "../src/saas-core/commercial/proposalGenerator.js";

const HELP = `Uso: npm run commercial:proposal -- [--input=<ruta.json>] [--profile=<id>] [opciones]

  --input=<ruta.json>     business/auditScores/risks/opportunities/recommendations/roiInputs/externalContext
  --profile=<id>          Perfil sectorial
  --format=json|markdown|html   (por defecto: markdown)
  --output=<ruta>         Guarda el resultado en un archivo
  --mock-integrations     Simula credenciales de TEST para el resumen de integraciones (nunca red real)
  --help                  Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const format = resolveFormat(args);
    const input = await resolveCommercialInputFromArgs(args);
    const env = resolveMockIntegrationsEnv(args);

    const assessment = buildCommercialAssessment(input);
    const roi = computeRoiScenarios(input.roiInputs, { profileId: assessment.profileId });
    const integrationsReadiness = computeIntegrationReadiness(env, input.externalContext);
    const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
    const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness });

    const output = format === "json" ? renderProposalJson(proposal) : format === "html" ? renderProposalHtml(proposal) : renderProposalMarkdown(proposal);
    await writeOutputOrPrint(args, output);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
