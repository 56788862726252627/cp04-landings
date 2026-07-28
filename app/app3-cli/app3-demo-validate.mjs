#!/usr/bin/env node
// App 3 · Prompt 2/6 · npm run app3:demo:validate [-- --base-dir=<ruta>]
//
// Vuelve a leer el paquete ya generado en disco (nunca confía en la
// última ejecución en memoria) y comprueba: manifiesto válido, cada
// checksum coincide con el archivo real, y ningún archivo del árbol
// completo viola la denylist de seguridad.
import path from "node:path";
import { CP04_DEMO_DEFAULT_BASE_DIR } from "../src/saas-core/deliverables/demo/demoOrchestrator.js";
import { cp04ValidateDemoOutput } from "../src/saas-core/deliverables/demo/demoValidator.js";

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

  console.log(`[app3:demo:validate] Validando ${baseDir} ...`);
  const result = await cp04ValidateDemoOutput({ baseDir });

  console.log(`[app3:demo:validate] Archivos comprobados: ${result.checkedFiles}`);
  if (result.valid) {
    console.log("[app3:demo:validate] OK — manifiesto válido, checksums correctos, sin archivos denegados.");
    return;
  }

  console.error("[app3:demo:validate] FALLÓ:");
  for (const error of result.errors) console.error(`  - ${error}`);
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[app3:demo:validate] Error: ${error.message}`);
  process.exitCode = 1;
});
