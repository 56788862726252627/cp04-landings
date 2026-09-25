#!/usr/bin/env node
/**
 * CORE V1.4 · prepare-deploy.mjs
 * Genera el paquete completo de despliegue para un cliente.
 * Comando: npm run factory:prepare-deploy -- --manifest ./cliente.yaml
 * Sin llamadas externas. Sin secretos reales. Todo reversible.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '../../..');

export async function generateDeployPackage({ manifestPath, provider = 'cloudflare', verbose = false }) {
  // 1. Parse manifest
  const { parseSimpleYaml } = await import('./generate.mjs');
  const raw      = readFileSync(manifestPath, 'utf8');
  const manifest = parseSimpleYaml(raw);

  const slug = manifest?.business?.slug;
  if (!slug) throw new Error('prepare-deploy: manifest.business.slug requerido');

  // 2. Validate client readiness
  const { validateClientReadiness } = await import('../../core/onboarding/clientValidator.js');
  const readiness = validateClientReadiness(manifest);

  // 3. Production config
  const { createProductionConfig, generateEnvExample, generateReleaseMetadata, generateDeployChecklist } =
    await import('../../core/productionConfig.js');
  const prodConfig = createProductionConfig(manifest);

  // 4. Pre-deploy validation
  const { validatePreDeploy, validateRollbackPossible } =
    await import('../../core/validation/preDeployValidator.js');
  const preValidation = validatePreDeploy(manifest, prodConfig);

  // 5. Deployment manifest
  const { generateDeploymentManifest } = await import('./generate-deployment.mjs');
  const deployManifest = generateDeploymentManifest(manifest);

  // 6. Provider
  const providerInstance = await _getProvider(provider, slug);

  // 7. Generate artifacts
  const envExample          = providerInstance.generateEnvExample(prodConfig);
  const rollbackCmds        = providerInstance.getRollbackCommands(deployManifest);
  const dryRunCommands      = providerInstance.getDryRunCommands(deployManifest);
  const manualBoundary      = providerInstance.getManualBoundary();
  const envVarMapping       = providerInstance.getEnvVarMapping(prodConfig.requiredEnv);
  const releaseMetadata     = generateReleaseMetadata(manifest, prodConfig);
  const checklist           = generateDeployChecklist(preValidation, readiness, prodConfig);
  const rollbackValidation  = validateRollbackPossible(deployManifest);

  // 8. Write all outputs
  const outDir = join(ROOT, 'fabrica-saas', 'output', slug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const outputs = {
    deployManifest:        join(outDir, 'deployment-manifest.json'),
    envExample:            join(outDir, 'env.example'),
    releaseMetadata:       join(outDir, 'release-metadata.json'),
    rollbackInstructions:  join(outDir, 'rollback-instructions.txt'),
    deployChecklist:       join(outDir, 'deploy-checklist.json'),
    preValidation:         join(outDir, 'pre-deploy-validation.json'),
    productionConfig:      join(outDir, 'production-config.json'),
    envVarMapping:         join(outDir, 'env-var-mapping.json'),
  };

  writeFileSync(outputs.deployManifest,       JSON.stringify(deployManifest, null, 2),   'utf8');
  writeFileSync(outputs.envExample,           envExample,                                'utf8');
  writeFileSync(outputs.releaseMetadata,      JSON.stringify(releaseMetadata, null, 2),  'utf8');
  writeFileSync(outputs.rollbackInstructions, rollbackCmds.join('\n'),                   'utf8');
  writeFileSync(outputs.deployChecklist,      JSON.stringify(checklist, null, 2),        'utf8');
  writeFileSync(outputs.preValidation,        JSON.stringify(preValidation, null, 2),    'utf8');
  writeFileSync(outputs.productionConfig,     JSON.stringify(prodConfig, null, 2),       'utf8');
  writeFileSync(outputs.envVarMapping,        JSON.stringify(envVarMapping, null, 2),    'utf8');

  // 9. Empaquetar cliente: deploy/<slug>/index.html = dist/<slug>.html (no dist/index.html)
  // Esto evita que Cloudflare sirva el index.html del proyecto base en lugar del cliente.
  const { packageClientForDeploy } = await import('./package-client.mjs');
  const deployPackage = packageClientForDeploy({ slug, artifactsDir: outDir });

  if (verbose) {
    console.log(`[prepare-deploy] Paquete generado: ${outDir}`);
    console.log(`[prepare-deploy] Pre-deploy ready: ${preValidation.ready}`);
    if (deployPackage.skipped) {
      console.warn(`[prepare-deploy] Package aislado omitido: ${deployPackage.reason}`);
    } else {
      console.log(`[prepare-deploy] Deploy package: ${deployPackage.deployPath}`);
    }
    if (preValidation.blockers.length) console.warn('[prepare-deploy] Blockers:', preValidation.blockers);
    if (preValidation.warnings.length) console.warn('[prepare-deploy] Warnings:', preValidation.warnings);
  }

  return {
    ok: preValidation.ready,
    slug,
    outDir,
    outputs,
    preValidation,
    readiness,
    prodConfig,
    deployManifest,
    releaseMetadata,
    checklist,
    rollbackValidation,
    dryRunCommands,
    manualBoundary,
    envVarMapping,
    provider:         providerInstance.getStatus(),
    deployPackage,
    deployPackagePath: deployPackage.deployPath,
  };
}

async function _getProvider(providerName, slug) {
  if (providerName === 'cloudflare') {
    const { CloudflareProvider } = await import('../../core/providers/cloudflareProvider.js');
    return new CloudflareProvider({ projectName: slug });
  }
  throw new Error(`prepare-deploy: provider desconocido: "${providerName}". Soportados: cloudflare`);
}

// CLI guard
const IS_CLI = process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (IS_CLI) {
  const manifestArg = process.argv.find(a => a.startsWith('--manifest='))?.slice('--manifest='.length)
    ?? process.argv[process.argv.indexOf('--manifest') + 1];

  if (!manifestArg) {
    console.error('Uso: node prepare-deploy.mjs --manifest ./cliente.yaml [--provider cloudflare]');
    process.exit(1);
  }

  const providerArg = process.argv.find(a => a.startsWith('--provider='))?.slice('--provider='.length) ?? 'cloudflare';

  generateDeployPackage({ manifestPath: resolve(manifestArg), provider: providerArg, verbose: true })
    .then(r => {
      console.log('[prepare-deploy] ✓ Completado:', r.slug);
      if (!r.preValidation.ready) {
        console.error('[prepare-deploy] BLOCKERS:', r.preValidation.blockers);
        process.exit(1);
      }
    })
    .catch(e => { console.error('[prepare-deploy] ERROR:', e.message); process.exit(1); });
}
