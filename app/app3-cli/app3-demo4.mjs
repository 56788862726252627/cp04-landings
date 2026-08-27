#!/usr/bin/env node
// App 3 · Prompt 4/6 · npm run app3:demo4 [-- --base-dir=<ruta>]
//
// Genera los 2 casos de demostración de los motores binarios reales
// (PDF/DOCX/PPTX): "Clínica Dental Nova" (completo, 6 entregables) y
// "Club Pádel 04" (ligero, 3 entregables, branding real del tenant de
// producción). 0 llamadas externas, Drive en dry-run, coste 0€.
import path from "node:path";
import {
  cp04RunPrompt4DemoFlow, cp04BuildClinicaDentalNovaPlan, cp04BuildClubPadel04Plan,
  cp04BuildClinicaDentalNovaBrief, cp04BuildClubPadel04Brief,
} from "../src/saas-core/deliverables/demo/demo4Orchestrator.js";
import { CLUB_PADEL_04_TENANT } from "../src/saas-core/tenant/defaultTenant.js";

const CP04_DEMO4_DEFAULT_BASE_DIR = path.resolve("output", "clientes-prompt4");

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

function printResult(label, result) {
  console.log(`[app3:demo4] ${label}: versión ${result.manifest.version} (¿cambió?: ${result.hasChanges ? "sí" : "no, idempotente"})`);
  console.log(`[app3:demo4] ${label}: ${result.manifest.itemCount} elementos en el manifiesto, ${result.failed.length} fallidos`);
  for (const v of result.validationReport) {
    console.log(`[app3:demo4]   ${v.file}: ${v.state}${v.errors.length ? " — " + v.errors.join("; ") : ""}`);
  }
  if (result.failed.length > 0) {
    console.error(`[app3:demo4] ${label}: entregables fallidos:`, result.failed);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseDir = args["base-dir"] ? path.resolve(args["base-dir"]) : CP04_DEMO4_DEFAULT_BASE_DIR;

  const novaBrief = cp04BuildClinicaDentalNovaBrief();
  const novaPlan = cp04BuildClinicaDentalNovaPlan(novaBrief);
  const novaResult = await cp04RunPrompt4DemoFlow({ baseDir: path.join(baseDir, "clinica-dental-nova"), brief: novaBrief, plan: novaPlan });
  printResult("Clínica Dental Nova", novaResult);

  const cp04Brief = cp04BuildClubPadel04Brief();
  const cp04Plan = cp04BuildClubPadel04Plan(cp04Brief, CLUB_PADEL_04_TENANT);
  const cp04Result = await cp04RunPrompt4DemoFlow({ baseDir: path.join(baseDir, "club-padel-04"), brief: cp04Brief, plan: cp04Plan });
  printResult("Club Pádel 04", cp04Result);

  const anyFailed = novaResult.failed.length > 0 || cp04Result.failed.length > 0;
  const anyInvalid = [...novaResult.validationReport, ...cp04Result.validationReport].some((v) => v.state !== "validated");
  if (anyFailed || anyInvalid) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[app3:demo4] Error: ${error.message}`);
  process.exitCode = 1;
});
