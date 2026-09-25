/**
 * GENERATOR · Script principal
 * Lee un manifiesto YAML, valida su estructura y genera runtime-config.js
 * en el directorio de salida del cliente. Es idempotente: si el contenido
 * no cambia, no sobrescribe el archivo.
 *
 * Uso:
 *   node fabrica-saas/generator/scripts/generate.mjs --manifest <ruta-manifest.yaml>
 *
 * Sin dependencias externas. Solo node:fs, node:path, node:crypto.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FABRICA_ROOT = path.resolve(__dirname, '../..');
const OUTPUT_BASE = path.join(FABRICA_ROOT, 'output');

// ── YAML parser mínimo para el formato del manifiesto ──────────────────────

function parseScalar(str) {
  if (!str || str === '') return '';
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null' || str === '~') return null;
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  if (/^\d+\.\d+$/.test(str)) return parseFloat(str);
  if ((str.startsWith('"') && str.endsWith('"')) ||
      (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
}

export function parseSimpleYaml(text) {
  const lines = text.split('\n').map(l => l.trimEnd());
  const result = {};
  let i = 0;

  function getIndent(line) {
    return line.length - line.trimStart().length;
  }

  function parseObject(baseIndent) {
    const obj = {};
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trimStart();
      if (!trimmed || trimmed.startsWith('#')) { i++; continue; }
      const indent = getIndent(line);
      if (indent < baseIndent) break;
      if (indent > baseIndent) { i++; continue; }

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) { i++; continue; }
      const key = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();

      if (rest === '') {
        i++;
        // Peek next non-empty line
        let j = i;
        while (j < lines.length && !lines[j].trim()) j++;
        if (j >= lines.length) { obj[key] = null; continue; }
        const nextIndent = getIndent(lines[j]);
        const nextTrimmed = lines[j].trimStart();
        if (nextTrimmed.startsWith('- ') || nextTrimmed === '-') {
          obj[key] = parseList(nextIndent);
        } else {
          obj[key] = parseObject(nextIndent);
        }
      } else {
        obj[key] = parseScalar(rest);
        i++;
      }
    }
    return obj;
  }

  function parseList(baseIndent) {
    const arr = [];
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trimStart();
      if (!trimmed || trimmed.startsWith('#')) { i++; continue; }
      const indent = getIndent(line);
      if (indent < baseIndent) break;
      if (!trimmed.startsWith('- ') && trimmed !== '-') { i++; continue; }

      const itemStr = trimmed.slice(2).trim();
      if (itemStr === '') {
        // Empty list item or block
        i++;
        continue;
      }
      if (itemStr.includes(':') && !itemStr.startsWith('"') && !itemStr.startsWith("'")) {
        // Object item — first key on same line
        const firstColon = itemStr.indexOf(':');
        const firstKey = itemStr.slice(0, firstColon).trim();
        const firstVal = itemStr.slice(firstColon + 1).trim();
        i++;
        const obj = { [firstKey]: parseScalar(firstVal) };
        // Read following indented fields
        while (i < lines.length) {
          const nl = lines[i];
          const nt = nl.trimStart();
          if (!nt || nt.startsWith('#')) { i++; continue; }
          const ni = getIndent(nl);
          if (ni <= indent) break;
          const nc = nt.indexOf(':');
          if (nc === -1) { i++; continue; }
          obj[nt.slice(0, nc).trim()] = parseScalar(nt.slice(nc + 1).trim());
          i++;
        }
        arr.push(obj);
      } else {
        arr.push(parseScalar(itemStr));
        i++;
      }
    }
    return arr;
  }

  i = 0;
  return parseObject(0);
}

// ── Idempotencia ───────────────────────────────────────────────────────────

function sha256(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

export function writeIdempotent(filePath, content) {
  const newHash = sha256(content);
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf8');
    if (sha256(existing) === newHash) {
      return { action: 'skipped', hash: newHash };
    }
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return { action: 'written', hash: newHash };
}

// ── Generación de runtime-config.js ───────────────────────────────────────

export function generateRuntimeConfig(manifest) {
  const serialized = JSON.stringify(manifest, null, 2);
  return `// Generado por Fábrica SaaS · Generator v1
// Fuente: manifest del cliente "${manifest.cliente}"
// NO EDITAR MANUALMENTE — regenerar con: npm run factory:generate
// Datos ficticios. No conectado a sistemas reales.

export const RUNTIME_CONFIG = ${serialized};
`;
}

// ── Función principal exportable (para tests) ──────────────────────────────

export function readManifest(manifestPath) {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifiesto no encontrado: ${manifestPath}`);
  }
  const text = fs.readFileSync(manifestPath, 'utf8');
  return parseSimpleYaml(text);
}

export async function runGeneration({ manifestPath, outputDir, verbose = false }) {
  const log = verbose ? console.log : () => {};
  const results = { success: false, generated: [], skipped: [], errors: [] };

  // 1. Leer manifiesto
  let manifest;
  try {
    manifest = readManifest(manifestPath);
    log(`✓ Manifiesto leído: ${manifestPath}`);
  } catch (err) {
    results.errors.push(`Error leyendo manifiesto: ${err.message}`);
    return results;
  }

  // 2. Validar manifiesto
  const { validateManifest } = await import('../schema/manifestSchema.js');
  const { valid, errors } = validateManifest(manifest);
  if (!valid) {
    results.errors.push(...errors.map(e => `Validación: ${e}`));
    return results;
  }
  log(`✓ Manifiesto válido`);

  // 3. Determinar directorio de salida
  const clientId = manifest.cliente
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const outDir = outputDir || path.join(OUTPUT_BASE, clientId);

  // 4. Generar runtime-config.js
  const runtimeConfigPath = path.join(outDir, 'runtime-config.js');
  const runtimeConfigContent = generateRuntimeConfig(manifest);
  const r = writeIdempotent(runtimeConfigPath, runtimeConfigContent);
  if (r.action === 'written') {
    results.generated.push('runtime-config.js');
    log(`✓ Generado: runtime-config.js`);
  } else {
    results.skipped.push('runtime-config.js');
    log(`→ Sin cambios: runtime-config.js (hash: ${r.hash.slice(0, 8)})`);
  }

  results.success = true;
  results.manifest = manifest;
  results.outputDir = outDir;
  return results;
}

// ── CLI ────────────────────────────────────────────────────────────────────

const IS_CLI = process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (IS_CLI) {
  const args = process.argv.slice(2);
  const manifestIdx = args.indexOf('--manifest');
  if (manifestIdx === -1 || !args[manifestIdx + 1]) {
    console.error('Uso: node generate.mjs --manifest <ruta-manifiesto.yaml>');
    process.exit(1);
  }
  const manifestPath = path.resolve(args[manifestIdx + 1]);
  const outIdx = args.indexOf('--output');
  const outputDir = outIdx !== -1 && args[outIdx + 1] ? path.resolve(args[outIdx + 1]) : undefined;

  console.log('\n🏭 Fábrica SaaS · Generador v1\n');
  runGeneration({ manifestPath, outputDir, verbose: true }).then(res => {
    if (!res.success) {
      console.error('\n❌ Generación fallida:');
      res.errors.forEach(e => console.error(`   ${e}`));
      process.exit(1);
    }
    console.log('\n📦 Resumen:');
    console.log(`   Generados: ${res.generated.length > 0 ? res.generated.join(', ') : 'ninguno (sin cambios)'}`);
    console.log(`   Sin cambios: ${res.skipped.length > 0 ? res.skipped.join(', ') : 'ninguno'}`);
    console.log(`   Directorio: ${res.outputDir}`);
    console.log('\n✅ Generación completada.\n');
  }).catch(err => {
    console.error('Error inesperado:', err.message);
    process.exit(1);
  });
}
