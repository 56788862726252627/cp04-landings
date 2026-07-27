#!/usr/bin/env node
// App 3 · Prompt 2/6 · npm run app3:demo:report [-- --base-dir=<ruta>]
//
// Informe de solo lectura sobre el paquete ya generado: versión,
// recuento de entregables por estado e historial de ejecuciones. Nunca
// regenera ni modifica nada.
import path from "node:path";
import { CP04_DEMO_DEFAULT_BASE_DIR } from "../src/saas-core/deliverables/demo/demoOrchestrator.js";
import { cp04BuildDemoReportText } from "../src/saas-core/deliverables/demo/demoReport.js";

function parseArgs(argv) {
  const args = {};
  for (const raw of argv) {
    const match = raw.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseDir = args["base-dir"] ? path.resolve(args["base-dir"]) : path.resolve(CP04_DEMO_DEFAULT_BASE_DIR);
  const text = await cp04BuildDemoReportText({ baseDir });
  console.log(text);
}

main().catch((error) => {
  console.error(`[app3:demo:report] Error: ${error.message}`);
  process.exitCode = 1;
});
