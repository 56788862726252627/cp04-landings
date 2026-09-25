#!/usr/bin/env node
// Paso 15 · npm run research:providers -- --list | --describe=<id> | --health | --plan [opciones]
//
// Inspecciona el registro multiproveedor (Paso 14) SIN ejecutar ninguna
// auditoría real. --plan resuelve la cadena de fallback que SE USARÍA con
// una política dada, pero nunca llama a collect() de ningún proveedor —
// sin --allow-network, ninguna de estas operaciones toca la red jamás
// (el proveedor real no hace red en healthCheck() ni al listarse).
import path from "node:path";

import { parseCliArgs, resolveProviderExecutionOptionsFromArgs, ResearchCliError } from "./lib/researchCli.mjs";
import { createProviderRegistry, discoverAndRegisterPlugins } from "../src/saas-core/research/providers/core/providerRegistry.js";
import { defineProviderExecutionPolicy, applyExecutionPolicyToRegistry } from "../src/saas-core/research/providers/providerExecutionPolicy.js";
import { getProviderSectorProfile, mergePolicyOptionsWithProfile } from "../src/saas-core/research/providers/providerSectorProfiles.js";

const PLUGINS_DIR = path.resolve("src", "saas-core", "research", "providers", "plugins");

const HELP = `Uso: npm run research:providers -- --list | --describe=<id> | --health | --plan [opciones]

Comandos:
  --list                   Lista los proveedores descubiertos (id, status, prioridad, dimensiones)
  --describe=<id>          Detalle completo de un proveedor (capabilities, credenciales, limitaciones)
  --health                 Ejecuta healthCheck() de todos los proveedores (sin red real salvo el proveedor real, que solo reporta config)
  --plan                   Simula la cadena de fallback resultante de una política, SIN ejecutar collect() de ningún proveedor

Opciones (aplican a --plan, mismas que research:audit --pipeline=multiprovider):
  --execution=sequential|parallel|fallback
  --providers=<id>[,<id>...]
  --exclude-providers=<id>[,...]
  --provider-priority=<id:n>[,...]
  --profile=<id>
  --format=json|markdown   (por defecto: markdown)
  --output=<ruta>          Escribe el resultado en un archivo en vez de stdout
  --help                   Muestra esta ayuda
`;

async function loadRegistry() {
  const registry = createProviderRegistry();
  const { errors } = await discoverAndRegisterPlugins(registry, PLUGINS_DIR);
  return { registry, errors };
}

function renderProviderRow(p) {
  return `- **${p.id}** (${p.status}, prioridad ${p.priority}, ${p.enabled ? "habilitado" : "deshabilitado"}) — dimensiones: ${p.capabilities.dimensions.join(", ")}`;
}

async function runList(format) {
  const { registry, errors } = await loadRegistry();
  const providers = registry.list();
  if (format === "json") return JSON.stringify({ providers, pluginLoadErrors: errors }, null, 2) + "\n";
  const lines = [`# Proveedores descubiertos (${providers.length})`, "", ...providers.map(renderProviderRow)];
  if (errors.length > 0) lines.push("", "## Errores al cargar plugins", ...errors.map((e) => `- ${e.file}: ${e.reason}`));
  return lines.join("\n") + "\n";
}

async function runDescribe(id, format) {
  const { registry } = await loadRegistry();
  const provider = registry.get(id);
  if (!provider) throw new ResearchCliError(`--describe: proveedor desconocido "${id}". Usa --list para ver los disponibles.`);
  if (format === "json") return JSON.stringify(provider, null, 2) + "\n";
  return [
    `# ${provider.id}`,
    "",
    `- status: ${provider.status}`,
    `- versión: ${provider.version}`,
    `- prioridad: ${provider.priority}`,
    `- habilitado por defecto: ${provider.enabledByDefault ? "sí" : "no"}`,
    `- dimensiones: ${provider.capabilities.dimensions.join(", ") || "ninguna"}`,
    `- categorías: ${provider.capabilities.categories.join(", ") || "ninguna"}`,
    `- credenciales necesarias: ${provider.credentialsNeeded.join(", ") || "ninguna"}`,
    "- limitaciones:",
    ...provider.limitations.map((l) => `  - ${l}`),
  ].join("\n") + "\n";
}

async function runHealth(format) {
  const { registry } = await loadRegistry();
  const results = await registry.healthCheckAll();
  if (format === "json") return JSON.stringify(results, null, 2) + "\n";
  const lines = ["# Salud de proveedores", ""];
  for (const r of results) lines.push(`- ${r.healthy ? "OK  " : "FAIL"} ${r.id} (${r.mode}): ${r.message}`);
  return lines.join("\n") + "\n";
}

async function runPlan(args, format) {
  const providerOptions = resolveProviderExecutionOptionsFromArgs(args);
  const profile = getProviderSectorProfile(providerOptions.profileId);
  const mergedPolicyOptions = mergePolicyOptionsWithProfile(providerOptions.providerPolicyOptions, profile);
  const policy = defineProviderExecutionPolicy({ ...mergedPolicyOptions, pipeline: "multiprovider", allowNetwork: Boolean(args["allow-network"]) });

  const { registry, errors } = await loadRegistry();
  applyExecutionPolicyToRegistry(registry, policy);
  const chain = registry.list({ onlyEnabled: true });

  const plan = {
    profileId: profile.id,
    execution: policy.execution,
    allowNetwork: policy.allowNetwork,
    chain: chain.map((p) => ({ id: p.id, status: p.status, priority: p.priority })),
    excludedByPolicy: registry.list().filter((p) => !registry.isEnabled(p.id)).map((p) => p.id),
    pluginLoadErrors: errors,
  };

  if (format === "json") return JSON.stringify(plan, null, 2) + "\n";
  return [
    `# Plan simulado (sin ejecutar collect())`,
    "",
    `Perfil: **${plan.profileId}** · Ejecución: **${plan.execution}** · Red permitida: **${plan.allowNetwork ? "sí" : "no"}**`,
    "",
    "## Cadena de fallback resultante (orden de intento)",
    ...(plan.chain.length > 0 ? plan.chain.map((p, i) => `${i + 1}. ${p.id} (${p.status}, prioridad ${p.priority})`) : ["_ninguno habilitado_"]),
    "",
    "## Excluidos por política/perfil",
    ...(plan.excludedByPolicy.length > 0 ? plan.excludedByPolicy.map((id) => `- ${id}`) : ["_ninguno_"]),
  ].join("\n") + "\n";
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help || (!args.list && !args.describe && !args.health && !args.plan)) {
    console.log(HELP);
    return;
  }
  const format = args.format ? String(args.format) : "markdown";
  if (!["json", "markdown"].includes(format)) throw new ResearchCliError(`--format desconocido: "${format}". Usa json|markdown.`);

  try {
    let output;
    if (args.list) output = await runList(format);
    else if (args.describe) output = await runDescribe(String(args.describe), format);
    else if (args.health) output = await runHealth(format);
    else if (args.plan) output = await runPlan(args, format);

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
