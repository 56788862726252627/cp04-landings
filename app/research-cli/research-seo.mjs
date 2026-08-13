#!/usr/bin/env node
// Paso 16 · npm run research:seo -- --local-file=<ruta.html> | --demo=<id> | --url=<url> --allow-network --mode=public-web [opciones]
//
// Comando dedicado al segundo proveedor real (seoProvider). Dos modos:
//
//  1) OFFLINE puro (--local-file / --demo): analiza HTML ya existente,
//     directamente vía seoProvider.collect({pages:[...]}) — NUNCA toca
//     red, ni siquiera intenta publicWebsiteFetcher. No persiste nada en
//     research/audits/ (solo imprime/guarda el análisis SEO).
//
//  2) AUDITORÍA completa (--url [--allow-network]): ejecuta
//     runResearchAudit() completo con pipeline=multiprovider y la
//     allowlist restringida a publicWebsiteFetcher+seoProvider (atajo
//     --seo-only), persistiendo igual que research:audit. Sin
//     --allow-network, se comporta exactamente igual que research:audit
//     sin red (evidencia "unavailable", seoProvider sin páginas que
//     analizar).
import path from "node:path";
import { readFile } from "node:fs/promises";

import { parseCliArgs, resolveResearchRequestFromArgs, resolveNetworkOptionsFromArgs, resolveProviderExecutionOptionsFromArgs, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import { runResearchAudit, RequestValidationError, PolicyViolationError, AuditCollisionError, StrictModeBlockedError } from "../src/saas-core/research/auditOrchestrator.js";
import { renderSeoReportMarkdown } from "../src/saas-core/research/auditReportGenerator.js";
import { PROVIDER as SEO_PROVIDER } from "../src/saas-core/research/providers/plugins/seoProviderPlugin.js";
import { DEMO_FIXTURES, DEMO_FIXTURE_IDS, getDemoFixture } from "../src/saas-core/research/fixtures/demoFixtures.js";

const HELP = `Uso: npm run research:seo -- --local-file=<ruta.html> | --demo=<id> | (--business-name=... --sector=<id> --url=<url> [--allow-network] --mode=public-web) [opciones]

Modo offline (recomendado para probar reglas sin red):
  --local-file=<ruta>              Analiza un archivo HTML local directamente (nunca toca red)
  --demo=<id>                      Analiza el HTML de una fixture de demostración (${DEMO_FIXTURE_IDS.join(", ")})

Modo auditoría completa (persiste en research/audits/, igual que research:audit):
  --business-name=<...> --sector=<id>   Datos mínimos del negocio
  --url=<url>[,<url>...]           URL(s) a recopilar y analizar
  --allow-network                  Obligatorio para red real (Paso 13)
  --mode=public-web|hybrid         Requerido junto con --allow-network
  --max-pages=<n>                  Máximo de páginas a consultar
  --dry-run                        Solo plan, nunca red real
  --strict                         Bloquea si hay contradicciones sin resolver
  --force                          Permite sobrescribir una colisión

Comunes:
  --profile=<id>                   Perfil sectorial (ver research:profiles -- --list)
  --format=json|markdown           (por defecto: markdown)
  --output=<ruta>                  Guarda el resultado en un archivo
  --help                           Muestra esta ayuda
`;

function buildOfflinePage(url, body) {
  return { url, httpStatus: 200, contentType: "text/html", body, headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] };
}

async function runOffline(args, format) {
  let url;
  let body;
  if (args["local-file"]) {
    url = `file://${path.resolve(String(args["local-file"]))}`;
    body = await readFile(String(args["local-file"]), "utf8").catch((err) => {
      throw new ResearchCliError(`No se pudo leer --local-file="${args["local-file"]}": ${err.message}`);
    });
  } else {
    const demoId = String(args.demo);
    if (!DEMO_FIXTURE_IDS.includes(demoId)) throw new ResearchCliError(`--demo desconocido: "${demoId}". Ids válidos: ${DEMO_FIXTURE_IDS.join(", ")}`);
    const fixture = getDemoFixture(demoId);
    if (!fixture?.htmlText) throw new ResearchCliError(`--demo="${demoId}" no declara htmlText (nada que analizar offline).`);
    url = `fixture://${demoId}`;
    body = fixture.htmlText;
  }

  const profileId = args.profile ? String(args.profile) : null;
  const result = await SEO_PROVIDER.collect({ pages: [buildOfflinePage(url, body)], profileId, sourceProviderId: args["local-file"] ? "local-file" : "fixture" });

  const reportData = { providerRunSummary: { seo: result.status === "success" ? { scoreBreakdown: result.metadata.scoreBreakdown, recommendations: result.metadata.recommendations } : null } };
  if (format === "json") {
    return JSON.stringify({ status: result.status, evidence: result.evidence, metadata: result.metadata }, null, 2) + "\n";
  }
  return renderSeoReportMarkdown(reportData);
}

async function runFullAudit(args, networkOptions, providerOptions, format) {
  const request = await resolveResearchRequestFromArgs(args);
  const result = await runResearchAudit(request, {
    localFilesBaseDir: args["local-files-base-dir"],
    dryRun: Boolean(args["dry-run"]),
    force: Boolean(args.force),
    strict: Boolean(args.strict),
    allowNetwork: networkOptions.allowNetwork,
    networkLimits: networkOptions.networkLimits,
    pipeline: "multiprovider",
    providerPolicyOptions: { ...providerOptions.providerPolicyOptions, includeProviders: providerOptions.providerPolicyOptions.includeProviders ?? ["publicWebsiteFetcher", "seoProvider"] },
    profileId: providerOptions.profileId,
  });

  console.log(`Auditoría "${result.auditId}" completada en ${result.durationMs}ms.`);
  console.log(result.networkUsed ? `Red REAL usada — URLs consultadas: ${result.consultedUrls.join(", ")}` : "Sin red real (offline).");
  if (result.dryRun) console.log("(--dry-run: no se escribió nada en disco ni se realizó ninguna petición de red)");

  const reportData = { providerRunSummary: result.providerRunSummary };
  if (format === "json") return JSON.stringify({ seo: result.providerRunSummary?.seo ?? null, auditId: result.auditId }, null, 2) + "\n";
  return renderSeoReportMarkdown(reportData);
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help || (!args["local-file"] && !args.demo && !args.url)) {
    console.log(HELP);
    return;
  }
  const format = args.format ? String(args.format) : "markdown";
  if (!["json", "markdown"].includes(format)) throw new ResearchCliError(`--format desconocido: "${format}". Usa json|markdown.`);

  try {
    let output;
    if (args["local-file"] || args.demo) {
      output = await runOffline(args, format);
    } else {
      const networkOptions = resolveNetworkOptionsFromArgs(args);
      const providerOptions = resolveProviderExecutionOptionsFromArgs(args);
      output = await runFullAudit(args, networkOptions, providerOptions, format);
    }
    await writeOutputOrPrint(args, output);
  } catch (err) {
    if (err instanceof StrictModeBlockedError) {
      console.error(`Bloqueado por --strict: ${err.message}`);
      process.exitCode = 2;
      return;
    }
    if (err instanceof ResearchCliError || err instanceof RequestValidationError || err instanceof PolicyViolationError || err instanceof AuditCollisionError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
