#!/usr/bin/env node
// Paso 20 · npm run factory:package -- [--input=<ruta.json>] [--profile=<id>] [--output-dir=<dir>] [--include-roi] [--include-proposal] [--include-roadmap] [--mock-integrations] [--dry-run]
//
// DeliverableGenerator: bundle completo (CommercialPackage) — assessment
// + ROI + integraciones + roadmap + propuesta + panel + previews.
//
// Sin --output-dir: imprime el bundle en JSON a stdout (o --output).
// Con --output-dir: escribe package.json + proposal.{md,html,json} +
// panel.html + previews/<view>-<device>.html (21 archivos) — SOLO
// dentro del directorio indicado, nunca fuera de él.
// --dry-run: no escribe nada en disco, informa qué se generaría.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseCliArgs, writeOutputOrPrint, resolveCommercialInputFromArgs, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { buildCommercialAssessment } from "../src/saas-core/commercial/commercialAssessment.js";
import { computeRoiScenarios } from "../src/saas-core/commercial/roiEngine.js";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildImplementationRoadmap } from "../src/saas-core/commercial/implementationRoadmap.js";
import { buildCommercialPanel, renderCommercialPanelHtml } from "../src/saas-core/commercial/commercialPanel.js";
import { buildCommercialProposal, renderProposalJson, renderProposalMarkdown, renderProposalHtml } from "../src/saas-core/commercial/proposalGenerator.js";
import { buildAllDevicePreviews, PREVIEW_VIEWS, PREVIEW_DEVICES } from "../src/saas-core/commercial/devicePreview.js";

const HELP = `Uso: npm run factory:package -- [--input=<ruta.json>] [--profile=<id>] [opciones]

  --output-dir=<dir>      Escribe el paquete completo (package.json+proposal+panel+previews) en este directorio
  --output=<ruta>         Sin --output-dir: guarda solo el bundle JSON en un archivo
  --mock-integrations     Simula credenciales de TEST para el resumen de integraciones (nunca red real)
  --dry-run               No escribe nada en disco; informa qué se generaría
  --help                  Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const input = await resolveCommercialInputFromArgs(args);
    const env = resolveMockIntegrationsEnv(args);

    const assessment = buildCommercialAssessment(input);
    const roi = computeRoiScenarios(input.roiInputs, { profileId: assessment.profileId });
    const integrationsReadiness = computeIntegrationReadiness(env, input.externalContext);
    const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
    const panel = buildCommercialPanel({ ...input, env });
    const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness });
    const commercialPackage = Object.freeze({ generatedForProfile: assessment.profileId, assessment, roi, integrationsReadiness, roadmap, proposal, panel });

    if (Boolean(args["dry-run"])) {
      console.log(`(--dry-run: se generarían package.json + proposal.{json,md,html} + panel.html + ${PREVIEW_VIEWS.length * PREVIEW_DEVICES.length} preview(s), nada escrito en disco)`);
      return;
    }

    if (args["output-dir"]) {
      const dir = path.resolve(String(args["output-dir"]));
      await mkdir(path.join(dir, "previews"), { recursive: true });
      await writeFile(path.join(dir, "package.json"), JSON.stringify(commercialPackage, null, 2) + "\n", "utf8");
      await writeFile(path.join(dir, "proposal.json"), renderProposalJson(proposal), "utf8");
      await writeFile(path.join(dir, "proposal.md"), renderProposalMarkdown(proposal), "utf8");
      await writeFile(path.join(dir, "proposal.html"), renderProposalHtml(proposal), "utf8");
      await writeFile(path.join(dir, "panel.html"), renderCommercialPanelHtml(panel), "utf8");
      const previews = buildAllDevicePreviews({ panel, proposal });
      for (const view of PREVIEW_VIEWS) for (const device of PREVIEW_DEVICES) await writeFile(path.join(dir, "previews", `${view}-${device}.html`), previews[view][device], "utf8");
      console.log(`CommercialPackage generado en ${dir} (package.json + proposal.{json,md,html} + panel.html + ${PREVIEW_VIEWS.length * PREVIEW_DEVICES.length} previews)`);
      return;
    }

    await writeOutputOrPrint(args, JSON.stringify(commercialPackage, null, 2) + "\n");
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
