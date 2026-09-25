#!/usr/bin/env node
// Paso 20 · npm run factory:preview -- [--input=<ruta.json>] [--profile=<id>] --output-dir=<dir> [--mock-integrations] [--dry-run]
//
// Atajo de conveniencia: genera las 7 vistas × 3 dispositivos = 21
// previews SIEMPRE (equivalente a `commercial:preview --view=all
// --device=all`), pensado para producir de un golpe el directorio de
// mockups completo (p. ej. docs/paso-20-visual-roi-commercial/mockups/).
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { parseCliArgs, resolveCommercialInputFromArgs, resolveMockIntegrationsEnv, CommercialCliError } from "./lib/commercialCli.mjs";
import { buildCommercialAssessment } from "../src/saas-core/commercial/commercialAssessment.js";
import { computeRoiScenarios } from "../src/saas-core/commercial/roiEngine.js";
import { computeIntegrationReadiness } from "../src/saas-core/commercial/integrationReadiness.js";
import { buildImplementationRoadmap } from "../src/saas-core/commercial/implementationRoadmap.js";
import { buildCommercialPanel } from "../src/saas-core/commercial/commercialPanel.js";
import { buildCommercialProposal } from "../src/saas-core/commercial/proposalGenerator.js";
import { buildAllDevicePreviews, PREVIEW_VIEWS, PREVIEW_DEVICES } from "../src/saas-core/commercial/devicePreview.js";

const HELP = `Uso: npm run factory:preview -- [--input=<ruta.json>] [--profile=<id>] --output-dir=<dir> [opciones]

  --output-dir=<dir>      OBLIGATORIO salvo --dry-run: escribe <dir>/<view>-<device>.html (21 archivos)
  --mock-integrations     Simula credenciales de TEST (nunca red real)
  --dry-run               No escribe nada en disco
  --help                  Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) { console.log(HELP); return; }
  try {
    if (!args["output-dir"] && !args["dry-run"]) throw new CommercialCliError("factory:preview requiere --output-dir (o --dry-run para solo calcular).");

    const input = await resolveCommercialInputFromArgs(args);
    const env = resolveMockIntegrationsEnv(args);
    const assessment = buildCommercialAssessment(input);
    const roi = computeRoiScenarios(input.roiInputs, { profileId: assessment.profileId });
    const integrationsReadiness = computeIntegrationReadiness(env, input.externalContext);
    const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
    const panel = buildCommercialPanel({ ...input, env });
    const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness });

    if (Boolean(args["dry-run"])) {
      console.log(`(--dry-run: se generarían ${PREVIEW_VIEWS.length * PREVIEW_DEVICES.length} preview(s), nada escrito en disco)`);
      return;
    }

    const dir = path.resolve(String(args["output-dir"]));
    await mkdir(dir, { recursive: true });
    const previews = buildAllDevicePreviews({ panel, proposal });
    for (const view of PREVIEW_VIEWS) for (const device of PREVIEW_DEVICES) await writeFile(path.join(dir, `${view}-${device}.html`), previews[view][device], "utf8");
    console.log(`Generados ${PREVIEW_VIEWS.length * PREVIEW_DEVICES.length} preview(s) en ${dir}`);
  } catch (err) {
    if (err instanceof CommercialCliError) { console.error(`Error: ${err.message}`); process.exitCode = 1; return; }
    throw err;
  }
}

main();
