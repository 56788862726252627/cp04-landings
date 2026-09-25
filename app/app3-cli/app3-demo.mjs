#!/usr/bin/env node
// App 3 · Prompt 2/6 · npm run app3:demo [-- --base-dir=<ruta>]
//
// Ejecuta el flujo end-to-end completo del proyecto demo: genera,
// clasifica, valida, hashea, versiona, registra en el manifiesto,
// empaqueta y encola en DriveSync (siempre en modo disabled/dry-run).
// Repetible: no destruye la ejecución anterior, solo sube de versión
// si algo cambió de verdad.
import path from "node:path";
import { cp04RunDemoFlow, CP04_DEMO_DEFAULT_BASE_DIR } from "../src/saas-core/deliverables/demo/demoOrchestrator.js";

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

  console.log(`[app3:demo] Generando paquete de demostración en ${baseDir} ...`);
  const result = await cp04RunDemoFlow({ baseDir });

  console.log(`[app3:demo] Proyecto: ${result.project.displayName}`);
  console.log(`[app3:demo] Versión del paquete: ${result.manifest.version} (¿cambió?: ${result.hasChanges ? "sí" : "no, idempotente"})`);
  console.log(`[app3:demo] Entregables generados: ${result.manifest.itemCount}`);
  console.log(`[app3:demo] Formatos pendientes (not_implemented): ${result.notImplemented.length}`);
  console.log(`[app3:demo] Cola Drive: ${result.driveDryRun.length} elemento(s), todos dry-run (sincronización desactivada)`);
  console.log(`[app3:demo] Paquete comprimido: ${result.packageResult.created ? result.packageResult.archivePath : `no disponible (${result.packageResult.reason})`}`);
  console.log(`[app3:demo] Índice: ${path.join(baseDir, "index.html")}`);

  if (!result.denylistValid) {
    console.error("[app3:demo] ERROR: el paquete violó la denylist de seguridad.");
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`[app3:demo] Error: ${error.message}`);
  process.exitCode = 1;
});
