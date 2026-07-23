#!/usr/bin/env node
// Paso 20 · npm run commercial:preview -- [--input=<ruta.json>] [--profile=<id>] [--view=<id>|all] [--device=mobile|tablet|desktop|all] [--output=<ruta>|--output-dir=<dir>] [--mock-integrations] [--dry-run]
//
// Genera previews HTML/CSS autocontenidos (móvil/tablet/desktop) de las
// 7 vistas del panel comercial. --dry-run: calcula todo pero no escribe
// nada en disco (ni siquiera --output-dir), solo informa cuántos
// archivos se habrían generado.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseCliArgs, writeOutputOrPrint, resolveDeviceFilter, resolveViewFilter, resolveCommercialInputFromArgs, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { buildCommercialAssessment } from "../src/saas-core/commercial/commercialAssessment.js";
import { computeRoiScenarios } from "../src/saas-core/commercial/roiEngine.js";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildImplementationRoadmap } from "../src/saas-core/commercial/implementationRoadmap.js";
import { buildCommercialPanel } from "../src/saas-core/commercial/commercialPanel.js";
import { buildCommercialProposal } from "../src/saas-core/commercial/proposalGenerator.js";
import { renderDevicePreviewHtml } from "../src/saas-core/commercial/devicePreview.js";

const HELP = `Uso: npm run commercial:preview -- [--input=<ruta.json>] [--profile=<id>] [opciones]

  --view=<id>|all         diagnostic|roi|proposal|integrations|roadmap|clientView|agencyView|all (por defecto: all)
  --device=<id>|all       mobile|tablet|desktop|all (por defecto: all)
  --output=<ruta>         Guarda UNA combinación view+device en un archivo (requiere --view y --device concretos)
  --output-dir=<dir>      Guarda TODAS las combinaciones resueltas como <dir>/<view>-<device>.html
  --mock-integrations     Simula credenciales de TEST para el resumen de integraciones (nunca red real)
  --dry-run               No escribe nada en disco; solo informa cuántos previews se generarían
  --help                  Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    const views = resolveViewFilter(args);
    const devices = resolveDeviceFilter(args);
    const input = await resolveCommercialInputFromArgs(args);
    const env = resolveMockIntegrationsEnv(args);

    const panel = buildCommercialPanel({ ...input, env });
    const assessment = buildCommercialAssessment(input);
    const roi = computeRoiScenarios(input.roiInputs, { profileId: assessment.profileId });
    const integrationsReadiness = computeIntegrationReadiness(env, input.externalContext);
    const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
    const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness });
    const context = { panel, proposal };

    const combos = views.flatMap((view) => devices.map((device) => ({ view, device })));

    if (Boolean(args["dry-run"])) {
      console.log(`(--dry-run: se generarían ${combos.length} preview(s), nada escrito en disco)`);
      return;
    }

    if (args["output-dir"]) {
      const dir = path.resolve(String(args["output-dir"]));
      await mkdir(dir, { recursive: true });
      for (const { view, device } of combos) {
        const html = renderDevicePreviewHtml(view, device, context);
        await writeFile(path.join(dir, `${view}-${device}.html`), html, "utf8");
      }
      console.log(`Generados ${combos.length} preview(s) en ${dir}`);
      return;
    }

    if (combos.length === 1) {
      const html = renderDevicePreviewHtml(combos[0].view, combos[0].device, context);
      await writeOutputOrPrint(args, html);
      return;
    }

    if (args.output) throw new CommercialCliError("--output solo admite UNA combinación view+device — usa --output-dir para varias.");
    for (const { view, device } of combos) console.log(`\n===== ${view} / ${device} =====\n${renderDevicePreviewHtml(view, device, context)}`);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
