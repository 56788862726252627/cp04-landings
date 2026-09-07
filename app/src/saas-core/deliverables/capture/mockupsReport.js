// App 3 · Prompt 3/6 — Informe de solo lectura del manifiesto de capturas.
import path from "node:path";
import { readFile } from "node:fs/promises";

export async function cp04BuildMockupsReportText({ baseDir }) {
  if (!baseDir) return "Error: baseDir es obligatorio.\n";
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(baseDir, "mockups", "mockups-manifest.json"), "utf8"));
  } catch {
    return `No se encontró ningún manifiesto de capturas en ${baseDir}. Ejecuta primero "npm run app3:mockups".\n`;
  }

  const byType = {};
  for (const item of manifest.items || []) byType[item.deliverableType] = (byType[item.deliverableType] || 0) + 1;

  const lines = [
    `Informe de capturas — ${manifest.projectName}`,
    `Versión del manifiesto de capturas: ${manifest.version}`,
    `Generado: ${manifest.generatedAt}`,
    `Artefactos: ${manifest.itemCount}`,
    ...Object.entries(byType).map(([type, count]) => `  - ${type}: ${count}`),
    "",
    "Aviso: las capturas de dispositivo son simulaciones de viewport dentro de Chromium — no certifican renderizado físico. Validación física pendiente.",
  ];
  return lines.join("\n") + "\n";
}
