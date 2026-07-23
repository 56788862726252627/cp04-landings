#!/usr/bin/env node
// Paso 12/13 · npm run research:audit -- --demo=<id> | --request=<research-request.json> | --business-name=... --sector=... [opciones] [--help]
//
// Ejecuta el pipeline COMPLETO (Fase 16 de Paso 12) y persiste los
// artefactos en src/saas-core/research/audits/<auditId>/, salvo --dry-run.
// Idempotente: una segunda ejecución sobre el mismo Research Request no
// crea ni actualiza ningún archivo.
//
// Paso 13: --url solo se consulta REALMENTE si se pasan A LA VEZ
// --mode=public-web (o hybrid) Y --allow-network. Sin ambas, cualquier URL
// produce evidencia "unavailable" (comportamiento idéntico a Paso 12).
import { parseCliArgs, resolveResearchRequestFromArgs, resolveNetworkOptionsFromArgs, resolveProviderExecutionOptionsFromArgs, ResearchCliError } from "./lib/researchCli.mjs";
import { runResearchAudit, RequestValidationError, PolicyViolationError, AuditCollisionError, StrictModeBlockedError } from "../src/saas-core/research/auditOrchestrator.js";

const HELP = `Uso: npm run research:audit -- --demo=<id> | --request=<ruta.json> | --business-name=... --sector=<id> [opciones]

Opciones:
  --demo=<id>                     Usa una fixture de demostración ficticia
  --request=<ruta.json>            Research Request ya construido y válido
  --business-name=<...> --sector=<id>   Construye un request inline mínimo
  --fixture=<id>[,<id>...]         Fixtures locales a usar como fuente
  --url=<url>[,<url>...]           URL(s) declaradas
  --local-file=<ruta>[,...]        Archivo(s) locales (requiere --local-files-base-dir)
  --local-files-base-dir=<ruta>    Directorio base seguro para --local-file
  --competitor=<id>[,<id>...]      Competidor(es) ficticios para comparación
  --mode=offline|online|public-web|hybrid   Modo de investigación (por defecto: offline)
  --online                         Atajo heredado de Paso 12 (equivale a --mode=online)
  --allow-network                  OBLIGATORIO además de --mode=public-web/hybrid para conectarse de verdad (Paso 13)
  --provider=publicWebsiteFetcher  Proveedor de red a usar (por ahora solo hay uno)
  --timeout=<ms>                   Timeout por petición (por defecto 8000ms)
  --max-bytes=<n>                  Tamaño máximo de descarga por página (por defecto 2000000)
  --max-pages=<n>                  Máximo de páginas a consultar por auditoría (por defecto 3)
  --respect-robots=true|false      Respetar robots.txt (por defecto true)
  --user-agent=<texto>             User-Agent a declarar en las peticiones reales
  --dry-run                        Solo calcula y muestra el plan; NUNCA realiza peticiones de red reales
  --force                          Permite sobrescribir una colisión de archivos
  --strict                         Bloquea (sin escribir nada) si hay contradicciones sin resolver entre evidencias
  --seed=<valor>                   Semilla determinista (por defecto: "default-seed")

Paso 15 — pipeline multiproveedor (opt-in, "legacy" por defecto):
  --pipeline=legacy|multiprovider  legacy (por defecto): idéntico a Paso 13/14. multiprovider: usa ProviderRegistry+ProviderPipeline
  --execution=sequential|parallel|fallback   Modo de ejecución del pipeline multiproveedor (por defecto: fallback)
  --providers=<id>[,<id>...]       Allowlist explícita de proveedores (por defecto: todos los descubiertos)
  --exclude-providers=<id>[,...]   Excluye proveedores concretos (se acumula con las exclusiones del --profile)
  --provider-priority=<id:n>[,...] Prioridad explícita por proveedor, p.ej. "seoProvider:5,whoisProvider:60"
  --profile=<id>                   Perfil sectorial (ver npm run research:profiles -- --list)
  --max-concurrency=<n>            Límite de concurrencia en --execution=parallel (por defecto: sin límite)
  --global-timeout=<ms>            Timeout global del pipeline multiproveedor
  --provider-timeout=<ms>          Timeout individual por proveedor

Paso 16 — SEO Provider real (segundo proveedor real; requiere --pipeline=multiprovider):
  --seo / --include-seo            Asegura que seoProvider participa (si ya se indicó --providers explícito)
  --seo-only                       Restringe la ejecución a publicWebsiteFetcher+seoProvider únicamente
  --exclude-seo                    Excluye seoProvider explícitamente de esta ejecución
  --explain-score                  Imprime la explicación de cada categoría de score (incluido el desglose SEO si lo hay)
  --show-coverage                  Imprime la cobertura de dimensiones/categorías y, si aplica, del desglose SEO
  --help                           Muestra esta ayuda
`;

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    return;
  }

  let request;
  let networkOptions;
  let providerOptions;
  try {
    request = await resolveResearchRequestFromArgs(args);
    networkOptions = resolveNetworkOptionsFromArgs(args);
    providerOptions = resolveProviderExecutionOptionsFromArgs(args);
  } catch (err) {
    if (err instanceof ResearchCliError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }

  try {
    const result = await runResearchAudit(request, {
      localFilesBaseDir: args["local-files-base-dir"],
      dryRun: Boolean(args["dry-run"]),
      force: Boolean(args.force),
      strict: Boolean(args.strict),
      allowNetwork: networkOptions.allowNetwork,
      networkLimits: networkOptions.networkLimits,
      pipeline: providerOptions.pipeline,
      providerPolicyOptions: providerOptions.providerPolicyOptions,
      profileId: providerOptions.profileId,
    });
    console.log(`Auditoría "${result.auditId}" completada en ${result.durationMs}ms (pipeline="${result.pipeline}").`);
    console.log(`Score global: ${result.scores.global.score ?? "sin datos"}/100 (${result.scores.global.status}).`);
    console.log(`Evidencias: ${result.evidence.length} · Recomendaciones: ${result.recommendations.length} · Automatizaciones candidatas: ${result.automations.length}.`);
    console.log(`Archivos creados: ${result.filesCreated.length} · actualizados: ${result.filesUpdated.length} · preservados: ${result.filesPreserved.length}.`);
    if (result.dryRun) console.log("(--dry-run: no se escribió nada en disco ni se realizó ninguna petición de red)");
    console.log(result.networkUsed ? `Red REAL usada — URLs consultadas: ${result.consultedUrls.join(", ")}` : "Sin red real (offline / fixtures).");
    if (result.providerRunSummary) {
      const summary = result.providerRunSummary;
      console.log(`Proveedores intentados: ${summary.providers.length} · usado: ${summary.usedProviderId ?? "ninguno"} · perfil: ${summary.profileId ?? "genérico"}.`);
      if (result.evidenceConflicts.length > 0) console.log(`Conflictos de evidencia entre proveedores: ${result.evidenceConflicts.length} (ver reports/providers.md).`);
      if (summary.seo) {
        console.log(`SEO: score global ${summary.seo.scoreBreakdown.overall.score ?? "sin datos"}/100 · ${summary.seo.recommendations.length} recomendación(es) (ver reports/seo.md).`);
      }
    }
    if (result.limitations.length > 0) console.log(`Limitaciones: ${result.limitations.join(" | ")}`);
    if (args["explain-score"]) {
      console.log("\n--explain-score:");
      for (const [category, c] of Object.entries(result.scores.categories)) console.log(`  ${category}: ${c.explanation}`);
      if (result.providerRunSummary?.seo) {
        console.log("  SEO (desglose):");
        for (const g of Object.values(result.providerRunSummary.seo.scoreBreakdown.groups)) console.log(`    ${g.label}: ${g.explanation}`);
      }
    }
    if (args["show-coverage"]) {
      console.log("\n--show-coverage:");
      console.log(`  Global: ${Math.round(result.scores.global.coverage * 100)}%`);
      for (const [category, c] of Object.entries(result.scores.categories)) console.log(`  ${category}: ${Math.round(c.coverage * 100)}%`);
      if (result.providerRunSummary?.seo) {
        console.log(`  SEO (grupos evaluados): ${result.providerRunSummary.seo.scoreBreakdown.overall.groupsEvaluated}/${result.providerRunSummary.seo.scoreBreakdown.overall.groupsTotal}`);
      }
    }
  } catch (err) {
    if (err instanceof StrictModeBlockedError) {
      console.error(`Bloqueado por --strict: ${err.message}`);
      process.exitCode = 2;
      return;
    }
    if (err instanceof RequestValidationError || err instanceof PolicyViolationError || err instanceof AuditCollisionError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    throw err;
  }
}

main();
