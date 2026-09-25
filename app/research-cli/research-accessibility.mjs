#!/usr/bin/env node
// Paso 17 · npm run research:accessibility -- --local-file=<ruta.html> | --demo=<id> | --url=<url> --allow-network --mode=public-web [opciones]
//
// Comando dedicado al tercer proveedor real (accessibilityProvider). Dos modos:
//
//  1) OFFLINE puro (--local-file / --demo): analiza HTML ya existente,
//     directamente vía accessibilityProvider.collect({pages:[...]}) —
//     NUNCA toca red, no usa navegador automatizado, no instala
//     Playwright. No persiste nada en research/audits/.
//
//  2) AUDITORÍA completa (--url [--allow-network]): ejecuta
//     runResearchAudit() completo con pipeline=multiprovider y la
//     allowlist restringida a publicWebsiteFetcher+accessibilityProvider
//     (atajo --accessibility-only), persistiendo igual que
//     research:audit. Sin --allow-network, se comporta exactamente igual
//     que research:audit sin red (evidencia "unavailable",
//     accessibilityProvider sin páginas que analizar).
//
// Puntuación automática orientativa — NUNCA constituye una certificación
// de accesibilidad ni sustituye una auditoría manual completa.
import path from "node:path";
import { readFile } from "node:fs/promises";

import { parseCliArgs, resolveResearchRequestFromArgs, resolveNetworkOptionsFromArgs, resolveProviderExecutionOptionsFromArgs, writeOutputOrPrint, ResearchCliError } from "./lib/researchCli.mjs";
import { runResearchAudit, RequestValidationError, PolicyViolationError, AuditCollisionError, StrictModeBlockedError } from "../src/saas-core/research/auditOrchestrator.js";
import { renderAccessibilityReportMarkdown } from "../src/saas-core/research/auditReportGenerator.js";
import { PROVIDER as ACCESSIBILITY_PROVIDER } from "../src/saas-core/research/providers/plugins/accessibilityProviderPlugin.js";
import { DEMO_FIXTURE_IDS, getDemoFixture } from "../src/saas-core/research/fixtures/demoFixtures.js";

const HELP = `Uso: npm run research:accessibility -- --local-file=<ruta.html> | --demo=<id> | (--business-name=... --sector=<id> --url=<url> [--allow-network] --mode=public-web) [opciones]

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
  --wcag-level=A|AA                 Filtra qué criterios WCAG mostrar (nunca cambia qué se analiza)
  --show-manual-checks              Lista las comprobaciones marcadas como revisión manual pendiente
  --format=json|markdown           (por defecto: markdown)
  --output=<ruta>                  Guarda el resultado en un archivo
  --help                           Muestra esta ayuda

Aviso: la puntuación es automática y orientativa. NUNCA certifica
conformidad WCAG ni sustituye una auditoría de accesibilidad humana completa.
`;

function buildOfflinePage(url, body) {
  return { url, httpStatus: 200, contentType: "text/html", body, headers: {}, robotsTxt: { available: false, content: "" }, redirectChain: [] };
}

function printManualChecks(recommendations) {
  const manual = recommendations.filter((r) => r.requiresManualReview);
  console.log(`\n--show-manual-checks: ${manual.length} comprobación(es) requieren revisión manual`);
  for (const r of manual) console.log(`  - ${r.title}${r.wcagCriterion ? ` [WCAG ${r.wcagCriterion.criterion}]` : ""}`);
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
  const result = await ACCESSIBILITY_PROVIDER.collect({ pages: [buildOfflinePage(url, body)], profileId, sourceProviderId: args["local-file"] ? "local-file" : "fixture" });

  if (args["show-manual-checks"] && result.status === "success") printManualChecks(result.metadata.recommendations);

  const reportData = { providerRunSummary: { accessibility: result.status === "success" ? { scoreBreakdown: result.metadata.scoreBreakdown, recommendations: result.metadata.recommendations } : null } };
  if (format === "json") return JSON.stringify({ status: result.status, evidence: result.evidence, metadata: result.metadata }, null, 2) + "\n";
  return renderAccessibilityReportMarkdown(reportData);
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
    providerPolicyOptions: { ...providerOptions.providerPolicyOptions, includeProviders: providerOptions.providerPolicyOptions.includeProviders ?? ["publicWebsiteFetcher", "accessibilityProvider"] },
    profileId: providerOptions.profileId,
  });

  console.log(`Auditoría "${result.auditId}" completada en ${result.durationMs}ms.`);
  console.log(result.networkUsed ? `Red REAL usada — URLs consultadas: ${result.consultedUrls.join(", ")}` : "Sin red real (offline).");
  if (result.dryRun) console.log("(--dry-run: no se escribió nada en disco ni se realizó ninguna petición de red)");
  if (args["show-manual-checks"] && result.providerRunSummary?.accessibility) printManualChecks(result.providerRunSummary.accessibility.recommendations);

  const reportData = { providerRunSummary: result.providerRunSummary };
  if (format === "json") return JSON.stringify({ accessibility: result.providerRunSummary?.accessibility ?? null, auditId: result.auditId }, null, 2) + "\n";
  return renderAccessibilityReportMarkdown(reportData);
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
