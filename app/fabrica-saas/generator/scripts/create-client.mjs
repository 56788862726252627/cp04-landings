/**
 * GENERATOR · create-client.mjs · Orquestador V1.2
 * Genera todos los archivos de un cliente SaaS desde un único manifest YAML.
 * Uso: node fabrica-saas/generator/scripts/create-client.mjs --manifest <path>
 *
 * Genera:
 *   fabrica-saas/output/<slug>/{PascalSlug}MockData.js
 *   fabrica-saas/output/<slug>/{PascalSlug}App.jsx
 *   fabrica-saas/output/<slug>/{PascalSlug}Chatbot.jsx
 *   fabrica-saas/output/<slug>/{PascalSlug}Crm.jsx
 *   fabrica-saas/output/<slug>/{PascalSlug}Dashboard.jsx
 *   fabrica-saas/output/<slug>/{PascalSlug}Recovery.jsx
 *   fabrica-saas/output/<slug>/main.jsx
 *   fabrica-saas/output/<slug>/runtime-config.js
 *   <slug>.html (raíz del proyecto)
 * Actualiza: vite.config.js (nuevo input), package.json (nuevos scripts)
 *
 * Sin dependencias externas. Sin llamadas de red. Datos demo únicamente.
 */

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateSingleInputManifest } from '../schema/singleInputSchema.js';
import { parseSimpleYaml } from './generate.mjs';
import {
  toPascalCase,
  genMockData,
  genApp,
  genChatbot,
  genCrm,
  genDashboard,
  genRecovery,
  genMain,
  genHtml,
} from '../templates/componentTemplates.mjs';

// ── Paths base ────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT  = resolve(__dirname, '../../..');      // …/app/
const FAB_ROOT  = resolve(__dirname, '../..');          // …/app/fabrica-saas/
const OUT_ROOT  = join(FAB_ROOT, 'output');

// ── Escritura idempotente ─────────────────────────────────────────────────────

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function writeIdempotent(filePath, content) {
  if (existsSync(filePath)) {
    const existing = readFileSync(filePath, 'utf8');
    if (sha256(existing) === sha256(content)) return { written: false, path: filePath };
  }
  writeFileSync(filePath, content, 'utf8');
  return { written: true, path: filePath };
}

// ── Runtime config ────────────────────────────────────────────────────────────

function generateRuntimeConfig(manifest) {
  const biz = manifest.business;
  const br  = manifest.branding ?? {};
  return `/**
 * OUTPUT GENERADO · ${biz.name} · Runtime config
 * Generado por Fábrica SaaS V1.2 · create-client.mjs
 * NO editar manualmente.
 */
export const RUNTIME_CONFIG = ${JSON.stringify({
    business:       biz,
    branding:       br,
    modules:        manifest.modules ?? [],
    sedes:          manifest.sedes ?? [],
    modo_demo:      manifest.modo_demo ?? true,
    integraciones:  manifest.integraciones ?? { reales: false },
    mock:           manifest.mock ?? { obligatorio: true },
    generadoPor:    'fabrica-saas-v1.2',
    generadoEn:     new Date().toISOString().split('T')[0],
  }, null, 2)};
`;
}

// ── Actualización vite.config.js ─────────────────────────────────────────────

function updateViteConfig(slug) {
  const vitePath = join(APP_ROOT, 'vite.config.js');
  const content  = readFileSync(vitePath, 'utf8');
  const htmlFile = `${slug}.html`;

  // Already present?
  if (content.includes(`'${htmlFile}'`) || content.includes(`"${htmlFile}"`)) {
    return { updated: false };
  }

  // Keys with hyphens must be quoted in JS object literals
  const needsQuotes = /[^a-zA-Z0-9_$]/.test(slug);
  const keyStr  = needsQuotes ? `'${slug}'` : slug;
  const newEntry = `        ${keyStr}: '${htmlFile}',\n`;

  // Insert before the closing }, of the input block (last occurrence)
  const inputBlockEnd = content.lastIndexOf('},\n');
  if (inputBlockEnd === -1) {
    return { updated: false, error: 'No se pudo localizar el bloque input de vite.config.js' };
  }
  const newContent = content.slice(0, inputBlockEnd) + newEntry + content.slice(inputBlockEnd);
  writeFileSync(vitePath, newContent, 'utf8');
  return { updated: true };
}

// ── Actualización package.json ────────────────────────────────────────────────

function updatePackageJson(slug) {
  const pkgPath = join(APP_ROOT, 'package.json');
  const pkg     = JSON.parse(readFileSync(pkgPath, 'utf8'));

  const scriptCreate  = `factory:create:${slug}`;
  const scriptTest    = `factory:test:v1.2`;

  let changed = false;
  if (!pkg.scripts[scriptCreate]) {
    pkg.scripts[scriptCreate] = `node fabrica-saas/generator/scripts/create-client.mjs --manifest fabrica-saas/clients/${slug}/manifest.yaml`;
    changed = true;
  }
  if (!pkg.scripts['factory:create']) {
    pkg.scripts['factory:create'] = `node fabrica-saas/generator/scripts/create-client.mjs`;
    changed = true;
  }
  if (!pkg.scripts[scriptTest]) {
    pkg.scripts[scriptTest] = `node --test fabrica-saas/generator/tests/v1.2-cases.test.mjs`;
    changed = true;
  }
  // Also add to factory:test
  const ftKey = 'factory:test';
  if (pkg.scripts[ftKey] && !pkg.scripts[ftKey].includes('v1.2-cases.test.mjs')) {
    pkg.scripts[ftKey] = pkg.scripts[ftKey] + ' fabrica-saas/generator/tests/v1.2-cases.test.mjs';
    changed = true;
  }

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  }
  return { updated: changed };
}

// ── Orchestrador principal ────────────────────────────────────────────────────

export async function createClient({ manifestPath, verbose = false }) {
  // 1. Leer manifest
  const absManifest = resolve(manifestPath);
  if (!existsSync(absManifest)) {
    throw new Error(`Manifest no encontrado: ${absManifest}`);
  }
  const yamlText = readFileSync(absManifest, 'utf8');
  const manifest = parseSimpleYaml(yamlText);

  // 2. Validar
  const { valid, errors } = validateSingleInputManifest(manifest);
  if (!valid) {
    throw new Error(`Manifest inválido:\n${errors.map(e => '  · ' + e).join('\n')}`);
  }

  const slug   = manifest.business.slug;
  const pascal = toPascalCase(slug);
  const outDir = join(OUT_ROOT, slug);

  // 3. Crear directorio de salida
  mkdirSync(outDir, { recursive: true });

  // 4. Generar archivos
  const files = [
    { name: `${pascal}MockData.js`,    content: genMockData(manifest) },
    { name: `${pascal}App.jsx`,        content: genApp(manifest) },
    { name: `${pascal}Chatbot.jsx`,    content: genChatbot(manifest) },
    { name: `${pascal}Crm.jsx`,        content: genCrm(manifest) },
    { name: `${pascal}Dashboard.jsx`,  content: genDashboard(manifest) },
    { name: `${pascal}Recovery.jsx`,   content: genRecovery(manifest) },
    { name: 'main.jsx',                content: genMain(manifest) },
    { name: 'runtime-config.js',       content: generateRuntimeConfig(manifest) },
  ];

  const results = [];
  for (const f of files) {
    const r = writeIdempotent(join(outDir, f.name), f.content);
    results.push({ file: f.name, ...r });
    if (verbose) console.log(`  ${r.written ? '✓ escrito' : '· sin cambios'} → ${f.name}`);
  }

  // 5. Generar HTML en raíz
  const htmlPath = join(APP_ROOT, `${slug}.html`);
  const htmlResult = writeIdempotent(htmlPath, genHtml(manifest));
  results.push({ file: `${slug}.html`, ...htmlResult });
  if (verbose) console.log(`  ${htmlResult.written ? '✓ escrito' : '· sin cambios'} → ${slug}.html`);

  // 6. Actualizar vite.config.js
  const viteResult = updateViteConfig(slug);
  if (verbose) {
    if (viteResult.error) console.warn(`  ⚠ vite.config.js: ${viteResult.error}`);
    else console.log(`  ${viteResult.updated ? '✓ actualizado' : '· sin cambios'} → vite.config.js`);
  }

  // 7. Actualizar package.json
  const pkgResult = updatePackageJson(slug);
  if (verbose) console.log(`  ${pkgResult.updated ? '✓ actualizado' : '· sin cambios'} → package.json`);

  const written = results.filter(r => r.written).length;
  const skipped = results.filter(r => !r.written).length;
  return { slug, pascal, outDir, results, written, skipped, viteUpdated: viteResult.updated, pkgUpdated: pkgResult.updated };
}

// ── CLI ───────────────────────────────────────────────────────────────────────

async function main() {
  const args         = process.argv.slice(2);
  const manifestIdx  = args.indexOf('--manifest');
  const verbose      = args.includes('--verbose') || args.includes('-v');

  if (manifestIdx === -1 || !args[manifestIdx + 1]) {
    console.error('Uso: node create-client.mjs --manifest <ruta/al/manifest.yaml> [--verbose]');
    process.exit(1);
  }

  const manifestPath = args[manifestIdx + 1];
  console.log(`\nFábrica SaaS V1.2 · Generando cliente desde: ${manifestPath}\n`);

  try {
    const result = await createClient({ manifestPath, verbose: verbose || true });
    console.log(`\n✅ Cliente generado: ${result.slug}`);
    console.log(`   Output: ${result.outDir}`);
    console.log(`   Archivos escritos: ${result.written} | Sin cambios: ${result.skipped}`);
    console.log(`   vite.config.js: ${result.viteUpdated ? 'actualizado' : 'sin cambios'}`);
    console.log(`   package.json: ${result.pkgUpdated ? 'actualizado' : 'sin cambios'}\n`);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
  }
}

const IS_CLI = process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (IS_CLI) main();
