#!/usr/bin/env node
// Paso 15 · npm run research:profiles -- --list | --describe=<id> [--format=json|markdown] [--output=<ruta>]
//
// Inspecciona los perfiles sectoriales del sistema multiproveedor
// (providerSectorProfiles.js). Solo lectura de datos en memoria: nunca
// toca red ni disco salvo --output.
import path from "node:path";

import { parseCliArgs, ResearchCliError } from "./lib/researchCli.mjs";
import { PROVIDER_SECTOR_PROFILES, GENERIC_PROVIDER_SECTOR_PROFILE, getProviderSectorProfile } from "../src/saas-core/research/providers/providerSectorProfiles.js";

const HELP = `Uso: npm run research:profiles -- --list | --describe=<id> [opciones]

Comandos:
  --list                  Lista los perfiles sectoriales disponibles (incluye el genérico)
  --describe=<id>         Detalle completo de un perfil (proveedores recomendados, pesos, reglas, consentimiento)

Opciones:
  --format=json|markdown  (por defecto: markdown)
  --output=<ruta>         Escribe el resultado en un archivo en vez de stdout
  --help                  Muestra esta ayuda
`;

function renderProfileRow(p) {
  return `- **${p.id}** — ${p.label}${p.consentRequired ? " ⚠ requiere consentimiento" : ""}`;
}

function runList(format) {
  const profiles = [...Object.values(PROVIDER_SECTOR_PROFILES), GENERIC_PROVIDER_SECTOR_PROFILE];
  if (format === "json") return JSON.stringify(profiles, null, 2) + "\n";
  return [`# Perfiles sectoriales (${profiles.length})`, "", ...profiles.map(renderProfileRow)].join("\n") + "\n";
}

function runDescribe(id, format) {
  const profile = getProviderSectorProfile(id);
  if (format === "json") return JSON.stringify(profile, null, 2) + "\n";
  return [
    `# ${profile.label} (${profile.id})`,
    "",
    `- preset de auditoría base: ${profile.auditPresetId ?? "genérico"}`,
    `- proveedores recomendados (orden de prioridad): ${profile.recommendedProviders.join(" → ")}`,
    `- proveedores excluidos: ${profile.exclusions.join(", ") || "ninguno"}`,
    `- dimensiones relevantes: ${profile.relevantDimensions.join(", ")}`,
    `- requiere consentimiento: ${profile.consentRequired ? "sí" : "no"}${profile.consentNote ? ` — ${profile.consentNote}` : ""}`,
    `- campos opcionales: ${profile.optionalFields.join(", ") || "ninguno"}`,
    "- reglas:",
    ...profile.rules.map((r) => `  - ${r}`),
    "- advertencias:",
    ...profile.warnings.map((w) => `  - ${w}`),
    "- recomendaciones:",
    ...profile.recommendations.map((r) => `  - ${r}`),
  ].join("\n") + "\n";
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help || (!args.list && !args.describe)) {
    console.log(HELP);
    return;
  }
  const format = args.format ? String(args.format) : "markdown";
  if (!["json", "markdown"].includes(format)) throw new ResearchCliError(`--format desconocido: "${format}". Usa json|markdown.`);

  try {
    const output = args.list ? runList(format) : runDescribe(String(args.describe), format);
    if (args.output) {
      const { writeFile, mkdir } = await import("node:fs/promises");
      await mkdir(path.dirname(path.resolve(String(args.output))), { recursive: true });
      await writeFile(String(args.output), output, "utf8");
      console.log(`Guardado en ${args.output}`);
    } else {
      console.log(output);
    }
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
