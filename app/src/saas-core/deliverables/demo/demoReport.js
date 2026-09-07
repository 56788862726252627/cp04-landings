// App 3 · Prompt 2/6 — Informe legible del paquete demo.
//
// Lee el manifiesto y el historial de ejecuciones ya escritos en disco
// y produce un texto de resumen — base de `npm run app3:demo:report`.
// Solo lectura: nunca regenera ni modifica nada.

import path from "node:path";
import { readFile } from "node:fs/promises";

export async function cp04BuildDemoReportText(options = {}) {
  const baseDir = options.baseDir;
  if (!baseDir) return "Error: baseDir es obligatorio.\n";

  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(baseDir, "manifest", "manifest.json"), "utf8"));
  } catch {
    return `No se encontró ningún manifiesto en ${baseDir}. Ejecuta primero "npm run app3:demo".\n`;
  }

  let historyLines;
  try {
    const raw = await readFile(path.join(baseDir, "manifest", "history.jsonl"), "utf8");
    historyLines = raw.trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    historyLines = [];
  }

  const byStatus = {};
  for (const item of manifest.items || []) {
    byStatus[item.status] = (byStatus[item.status] || 0) + 1;
  }

  const lines = [
    `Informe — ${manifest.projectName || manifest.projectId}`,
    `Versión del paquete: ${manifest.version}`,
    `Generado: ${manifest.generatedAt}`,
    `Entregables en el manifiesto: ${manifest.itemCount}`,
    ...Object.entries(byStatus).map(([status, count]) => `  - ${status}: ${count}`),
    `Ejecuciones registradas en el historial: ${historyLines.length}`,
  ];
  if (historyLines.length > 0) {
    const last = historyLines[historyLines.length - 1];
    lines.push(`Última ejecución: ${last.ranAt} (versión ${last.version}, ¿hubo cambios?: ${last.hasChanges ? "sí" : "no"})`);
  }
  return lines.join("\n") + "\n";
}
