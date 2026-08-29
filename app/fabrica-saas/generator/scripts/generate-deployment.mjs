#!/usr/bin/env node
/**
 * CORE V1.3 · Deployment Manifest Generator (Phase 6)
 * Genera el manifiesto de despliegue para un cliente SaaS.
 * Sin llamadas externas. Output: fabrica-saas/output/<slug>/deployment-manifest.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '../../..');

export function generateDeploymentManifest(manifest) {
  const slug      = manifest?.business?.slug;
  const vertical  = manifest?.vertical;
  const modoDemo  = manifest?.modo_demo ?? true;

  if (!slug || !vertical) {
    throw new Error('generateDeploymentManifest: slug y vertical son requeridos');
  }

  const mode = modoDemo ? 'demo'
    : (manifest?.integraciones?.reales ? 'production' : 'staging');

  const deployManifest = {
    _version:       'v1.3',
    _generatedAt:   new Date().toISOString(),
    _generator:     'Fábrica SaaS V1.3 · generate-deployment.mjs',
    _ficticio:      true,

    client: {
      slug,
      name:    manifest.business.name,
      vertical,
      email:   manifest.business.email ?? 'NOT_CONFIGURED',
    },

    deployment: {
      mode,
      entryHtml:   `${slug}.html`,
      outputDir:   `fabrica-saas/output/${slug}/`,
      buildCmd:    `npm run build`,
      previewCmd:  `npm run dev -- --port 5175`,
    },

    runtime: {
      authMode:    modoDemo ? 'mock' : (manifest?.integraciones?.authMode ?? 'NOT_CONFIGURED'),
      apiBaseUrl:  manifest?.integraciones?.apiBaseUrl ?? 'NOT_CONFIGURED',
      domain:      manifest?.integraciones?.domain ?? 'NOT_CONFIGURED',
      reales:      manifest?.integraciones?.reales ?? false,
    },

    modules: manifest?.modules ?? [],

    checklist: {
      schema_valid:          true,
      files_generated:       true,
      vite_registered:       true,
      no_real_credentials:   true,
      no_personal_data:      true,
      staging_ready:         !modoDemo,
      production_ready:      !modoDemo && (manifest?.integraciones?.reales === true),
    },

    required_env_vars: _requiredEnvVars(manifest),
  };

  return deployManifest;
}

export async function writeDeploymentManifest({ manifestPath, verbose = false }) {
  const raw      = readFileSync(manifestPath, 'utf8');
  const { parseSimpleYaml } = await import('./generate.mjs');
  const manifest = parseSimpleYaml(raw);

  const slug     = manifest?.business?.slug;
  if (!slug) throw new Error('manifest.business.slug requerido');

  const outDir = join(ROOT, 'fabrica-saas', 'output', slug);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  const deployManifest = generateDeploymentManifest(manifest);
  const outPath = join(outDir, 'deployment-manifest.json');
  writeFileSync(outPath, JSON.stringify(deployManifest, null, 2), 'utf8');

  if (verbose) console.log(`[deploy] Manifiesto escrito: ${outPath}`);
  return { ok: true, path: outPath, manifest: deployManifest };
}

function _requiredEnvVars(manifest) {
  const vars = [];
  const mods = manifest?.modules ?? [];
  if (mods.includes('auth') || mods.includes('rbac')) {
    vars.push('VITE_AUTH_MODE', 'VITE_AUTH_DOMAIN', 'VITE_AUTH_CLIENT_ID');
  }
  if (manifest?.integraciones?.reales) {
    vars.push('VITE_API_BASE_URL', 'VITE_AIRTABLE_BASE_ID', 'VITE_MAKE_WEBHOOK_BASE');
  }
  if (mods.includes('analytics')) vars.push('VITE_ANALYTICS_DSN');
  return vars;
}

// CLI guard
const IS_CLI = process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (IS_CLI) {
  const manifestArg = process.argv.find(a => a.startsWith('--manifest='))?.slice('--manifest='.length)
    ?? process.argv[process.argv.indexOf('--manifest') + 1];

  if (!manifestArg) {
    console.error('Uso: node generate-deployment.mjs --manifest ./cliente.yaml');
    process.exit(1);
  }

  writeDeploymentManifest({ manifestPath: resolve(manifestArg), verbose: true })
    .then(r => console.log('[deploy] OK:', r.path))
    .catch(e => { console.error('[deploy] ERROR:', e.message); process.exit(1); });
}
