#!/usr/bin/env node
/**
 * CORE V1.4 · package-client.mjs
 * Empaqueta dist/<slug>.html → deploy/<slug>/index.html + assets exclusivos del cliente.
 *
 * PROBLEMA QUE RESUELVE: dist/index.html pertenece al proyecto base (Club Pádel 04).
 * Cloudflare Pages sirve index.html por defecto → mostraría el proyecto base, no Aurora.
 * Este script crea fabrica-saas/deploy/<slug>/ con index.html = el HTML correcto del cliente.
 *
 * Comando: node package-client.mjs --slug <slug>
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = resolve(__dir, '../../..');

/**
 * Extrae paths de assets (/assets/...) referenciados en un HTML.
 * Reconoce src="..." y href="..." con prefijo /assets/.
 */
export function extractAssetPaths(html) {
  const paths = new Set();
  const patterns = [
    /\bsrc="(\/assets\/[^"]+)"/g,
    /\bhref="(\/assets\/[^"]+)"/g,
  ];
  for (const p of patterns) {
    let m;
    while ((m = p.exec(html)) !== null) paths.add(m[1]);
  }
  return [...paths];
}

/**
 * Verifica que el HTML del cliente NO contenga contenido de otro cliente/producto.
 * Lanza Error con la lista de términos prohibidos encontrados.
 */
export function validateClientContent(html, slug) {
  const forbidden = [
    { term: 'Club Pádel 04',   label: 'Club Pádel 04' },
    { term: 'Reservar pista',  label: 'Reservar pista' },
    { term: 'main-BP0rXwkC',  label: 'bundle Club Pádel 04 (main-BP0rXwkC)' },
    { term: '/api/reservas',   label: 'API reservas CP04' },
    { term: 'Ranking ELO',     label: 'Ranking ELO' },
    { term: 'ranking-elo',     label: 'ranking-elo' },
    { term: 'jugador de pádel', label: 'jugador de pádel' },
    { term: 'torneo de pádel', label: 'torneo de pádel' },
  ];
  const found = forbidden.filter(f => html.includes(f.term));
  if (found.length > 0) {
    throw new Error(
      `packageClientForDeploy [${slug}]: contenido prohibido en HTML del cliente: ` +
      found.map(f => `"${f.label}"`).join(', ')
    );
  }
}

/**
 * Empaqueta un cliente específico en fabrica-saas/deploy/<slug>/.
 *
 * Estructura resultante:
 *   deploy/<slug>/
 *     index.html               ← copia de dist/<slug>.html (NO dist/index.html)
 *     assets/                  ← solo los assets referenciados por el HTML del cliente
 *       <cliente>-<hash>.js
 *       jsx-runtime-<hash>.js
 *       <shared-chunks>...
 *     favicon.svg              ← si existe en dist/
 *     deployment-manifest.json ← de fabrica-saas/output/<slug>/
 *     release-metadata.json
 *     rollback-instructions.txt
 *     deploy-checklist.json
 *     pre-deploy-validation.json
 *     env.example
 *
 * @param {object} opts
 * @param {string}  opts.slug           - slug del cliente (requerido)
 * @param {string}  [opts.distDir]      - ruta a dist/ (default: ROOT/dist)
 * @param {string}  [opts.deployDir]    - ruta base deploy/ (default: ROOT/fabrica-saas/deploy)
 * @param {string}  [opts.artifactsDir] - ruta a output/<slug>/ (default: ROOT/fabrica-saas/output/<slug>)
 * @returns {PackageResult}
 */
export function packageClientForDeploy({ slug, distDir, deployDir, artifactsDir }) {
  if (!slug) throw new Error('packageClientForDeploy: slug requerido');

  const resolvedDistDir    = distDir    ?? join(ROOT, 'dist');
  const resolvedDeployDir  = deployDir  ?? join(ROOT, 'fabrica-saas', 'deploy');
  const clientHtmlSrc      = join(resolvedDistDir, `${slug}.html`);

  // Graceful skip si dist/<slug>.html no existe (antes del build)
  if (!existsSync(clientHtmlSrc)) {
    return {
      slug,
      deployPath:   null,
      indexHtml:    null,
      assets:       [],
      favicon:      false,
      artifacts:    [],
      skipped:      true,
      reason:       `dist/${slug}.html no encontrado — ejecuta npm run build primero`,
      _ficticio:    true,
    };
  }

  // Leer HTML y validar que no tiene contenido de otros clientes
  const html = readFileSync(clientHtmlSrc, 'utf8');
  validateClientContent(html, slug);

  // Extraer assets requeridos
  const assetPaths = extractAssetPaths(html);

  // Crear estructura deploy/<slug>/assets/
  const clientDeployDir = join(resolvedDeployDir, slug);
  const clientAssetsDir = join(clientDeployDir, 'assets');
  mkdirSync(clientAssetsDir, { recursive: true });

  // Escribir index.html = copia exacta de dist/<slug>.html
  const indexDest = join(clientDeployDir, 'index.html');
  writeFileSync(indexDest, html, 'utf8');

  // Copiar SOLO los assets referenciados por el HTML del cliente
  const srcAssetsDir  = join(resolvedDistDir, 'assets');
  const copiedAssets  = [];
  for (const assetPath of assetPaths) {
    const filename = basename(assetPath);
    const src      = join(srcAssetsDir, filename);
    if (existsSync(src)) {
      copyFileSync(src, join(clientAssetsDir, filename));
      copiedAssets.push(filename);
    }
  }

  // Copiar favicon (opcional)
  const faviconSrc    = join(resolvedDistDir, 'favicon.svg');
  let   faviconCopied = false;
  if (existsSync(faviconSrc)) {
    copyFileSync(faviconSrc, join(clientDeployDir, 'favicon.svg'));
    faviconCopied = true;
  }

  // Copiar artifacts de fabrica-saas/output/<slug>/
  const artifactFiles = [
    'deployment-manifest.json',
    'release-metadata.json',
    'rollback-instructions.txt',
    'deploy-checklist.json',
    'pre-deploy-validation.json',
    'env.example',
  ];
  const resolvedArtifactsDir = artifactsDir ?? join(ROOT, 'fabrica-saas', 'output', slug);
  const copiedArtifacts      = [];
  if (existsSync(resolvedArtifactsDir)) {
    for (const f of artifactFiles) {
      const src = join(resolvedArtifactsDir, f);
      if (existsSync(src)) {
        copyFileSync(src, join(clientDeployDir, f));
        copiedArtifacts.push(f);
      }
    }
  }

  return {
    slug,
    deployPath: clientDeployDir,
    indexHtml:  indexDest,
    assets:     copiedAssets,
    favicon:    faviconCopied,
    artifacts:  copiedArtifacts,
    skipped:    false,
    _ficticio:  true,
  };
}

// CLI guard
const IS_CLI = process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (IS_CLI) {
  const slugArg = process.argv.find(a => a.startsWith('--slug='))?.slice('--slug='.length)
    ?? process.argv[process.argv.indexOf('--slug') + 1];

  if (!slugArg) {
    console.error('Uso: node package-client.mjs --slug <slug>');
    process.exit(1);
  }

  try {
    const result = packageClientForDeploy({ slug: slugArg });
    if (result.skipped) {
      console.warn('[package-client] Omitido:', result.reason);
    } else {
      console.log('[package-client] ✓ Empaquetado en:', result.deployPath);
      console.log('[package-client] index.html:', result.indexHtml);
      console.log('[package-client] Assets copiados:', result.assets.length, result.assets);
      console.log('[package-client] Artifacts:', result.artifacts.length);
    }
  } catch (e) {
    console.error('[package-client] ERROR:', e.message);
    process.exit(1);
  }
}
