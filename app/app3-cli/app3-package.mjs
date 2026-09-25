#!/usr/bin/env node
// App 3 · Prompt 5/6 · npm run app3:package -- --source=<ruta> --project-name=<nombre> [--target=<ruta>] [--project-id=<id>] [--top-level=Clientes]
//
// Empaqueta en un único comando un proyecto ya generado por cualquier
// combinación de los flujos anteriores (Prompt 2/6, 3/6, 4/6) en una
// entrega profesional final: estructura estándar de carpetas, índice
// HTML, README, manifiesto con checksum + versionChecksum, y un .zip
// real reproducible. 0 llamadas externas, Google Drive desactivado,
// coste 0€.
import path from "node:path";
import { cp04BuildFinalExportPackage } from "../src/saas-core/deliverables/packaging/exportPackageManager.js";

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
  if (!args.source) throw new Error("uso: npm run app3:package -- --source=<ruta> --project-name=<nombre> [--target=<ruta>] [--project-id=<id>] [--top-level=Clientes]");
  if (!args["project-name"]) throw new Error("falta --project-name");

  const sourceBaseDir = path.resolve(args.source);
  const targetBaseDir = args.target ? path.resolve(args.target) : path.resolve(sourceBaseDir, "..", "paquete-final");

  console.log(`[app3:package] Origen: ${sourceBaseDir}`);
  console.log(`[app3:package] Destino: ${targetBaseDir}`);

  const result = await cp04BuildFinalExportPackage({
    sourceBaseDir,
    targetBaseDir,
    projectId: args["project-id"],
    projectName: args["project-name"],
    topLevel: args["top-level"],
  });

  console.log(`[app3:package] Proyecto: ${result.projectName}`);
  console.log(`[app3:package] Versión del paquete: ${result.manifest.version} (¿cambió?: ${result.hasChanges ? "sí" : "no, idempotente"})`);
  console.log(`[app3:package] Entregables empaquetados: ${result.packagedCount}`);
  console.log(`[app3:package] Entregables excluidos: ${result.failed.length}`);
  if (result.failed.length > 0) console.error("[app3:package] Excluidos:", result.failed);
  console.log(`[app3:package] ZIP: ${path.join(targetBaseDir, result.zipPath)}`);
  console.log(`[app3:package] Índice: ${path.join(targetBaseDir, "index.html")}`);

  if (result.failed.length > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[app3:package] Error: ${error.message}`);
  process.exitCode = 1;
});
