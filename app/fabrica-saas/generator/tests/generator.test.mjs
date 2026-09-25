/**
 * GENERATOR · Tests del generador
 * node:test built-in. Sin dependencias externas. Sin llamadas a APIs.
 * Cubre: validación de schema, parser YAML, idempotencia, runtime-config.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GENERATOR_ROOT = path.resolve(__dirname, '../..');

// Imports bajo test
const { validateManifest } = await import('../schema/manifestSchema.js');
const { parseSimpleYaml, generateRuntimeConfig, writeIdempotent, runGeneration } = await import('../scripts/generate.mjs');

// ── MANIFEST VÁLIDO DE REFERENCIA ──────────────────────────────────────────

const VALID_MANIFEST = {
  cliente: 'Clínica Dental Demo',
  vertical: 'dental',
  modo_demo: true,
  modulos: ['chatbot_ia', 'crm', 'reservas', 'recuperacion_leads', 'dashboard'],
  sedes: [
    { id: 'centro', nombre: 'Sede Centro' },
    { id: 'norte', nombre: 'Sede Norte' },
  ],
  integraciones: { reales: false, email: false },
  mock: { obligatorio: true },
};

// ── SCHEMA VALIDATION ──────────────────────────────────────────────────────

describe('validateManifest', () => {
  test('manifiesto válido pasa', () => {
    const { valid, errors } = validateManifest(VALID_MANIFEST);
    assert.equal(valid, true, `Errores inesperados: ${errors.join(', ')}`);
    assert.deepEqual(errors, []);
  });

  test('falta campo cliente → falla', () => {
    const { valid, errors } = validateManifest({ ...VALID_MANIFEST, cliente: undefined });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('cliente')));
  });

  test('falta campo vertical → falla', () => {
    const { valid, errors } = validateManifest({ ...VALID_MANIFEST, vertical: undefined });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('vertical')));
  });

  test('vertical inválido → falla', () => {
    const { valid, errors } = validateManifest({ ...VALID_MANIFEST, vertical: 'bar-vertical-inventado' });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('inválido')));
  });

  test('modo_demo no booleano → falla', () => {
    const { valid } = validateManifest({ ...VALID_MANIFEST, modo_demo: 'si' });
    assert.equal(valid, false);
  });

  test('modulos vacío → falla', () => {
    const { valid } = validateManifest({ ...VALID_MANIFEST, modulos: [] });
    assert.equal(valid, false);
  });

  test('módulo inválido → falla', () => {
    const { valid, errors } = validateManifest({ ...VALID_MANIFEST, modulos: ['chatbot_ia', 'modulo_inventado'] });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('inválidos')));
  });

  test('integraciones.reales=true con modo_demo=true → falla (conflicto)', () => {
    const { valid, errors } = validateManifest({
      ...VALID_MANIFEST,
      integraciones: { reales: true },
    });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('Conflicto')));
  });

  test('sedes vacías → falla', () => {
    const { valid } = validateManifest({ ...VALID_MANIFEST, sedes: [] });
    assert.equal(valid, false);
  });

  test('sede sin id → falla', () => {
    const { valid, errors } = validateManifest({
      ...VALID_MANIFEST,
      sedes: [{ nombre: 'Sin ID' }],
    });
    assert.equal(valid, false);
    assert.ok(errors.some(e => e.includes('id')));
  });

  test('input null → falla', () => {
    const { valid } = validateManifest(null);
    assert.equal(valid, false);
  });
});

// ── YAML PARSER ────────────────────────────────────────────────────────────

describe('parseSimpleYaml', () => {
  test('parsea scalares básicos', () => {
    const yaml = `
cliente: "Clínica Demo"
vertical: dental
modo_demo: true
numero: 42
`.trim();
    const result = parseSimpleYaml(yaml);
    assert.equal(result.cliente, 'Clínica Demo');
    assert.equal(result.vertical, 'dental');
    assert.equal(result.modo_demo, true);
    assert.equal(result.numero, 42);
  });

  test('parsea listas simples', () => {
    const yaml = `
modulos:
  - chatbot_ia
  - crm
  - dashboard
`.trim();
    const result = parseSimpleYaml(yaml);
    assert.deepEqual(result.modulos, ['chatbot_ia', 'crm', 'dashboard']);
  });

  test('parsea objetos anidados', () => {
    const yaml = `
branding:
  nombre: Demo
  color: azul
`.trim();
    const result = parseSimpleYaml(yaml);
    assert.equal(result.branding.nombre, 'Demo');
    assert.equal(result.branding.color, 'azul');
  });

  test('parsea lista de objetos (sedes)', () => {
    const yaml = `
sedes:
  - id: centro
    nombre: "Sede Centro"
  - id: norte
    nombre: "Sede Norte"
`.trim();
    const result = parseSimpleYaml(yaml);
    assert.equal(result.sedes.length, 2);
    assert.equal(result.sedes[0].id, 'centro');
    assert.equal(result.sedes[1].nombre, 'Sede Norte');
  });

  test('parsea el manifest real del cliente dental', () => {
    const manifestPath = path.join(GENERATOR_ROOT, 'clients/clinica-dental-demo/manifest.yaml');
    assert.ok(fs.existsSync(manifestPath), `Manifiesto no encontrado: ${manifestPath}`);
    const text = fs.readFileSync(manifestPath, 'utf8');
    const result = parseSimpleYaml(text);
    assert.equal(result.cliente, 'Clínica Dental Demo');
    assert.equal(result.vertical, 'dental');
    assert.equal(result.modo_demo, true);
    assert.ok(Array.isArray(result.modulos), 'modulos debe ser array');
    assert.ok(result.modulos.length >= 4, 'Debe tener al menos 4 módulos');
    assert.ok(Array.isArray(result.sedes), 'sedes debe ser array');
  });
});

// ── RUNTIME CONFIG GENERATION ──────────────────────────────────────────────

describe('generateRuntimeConfig', () => {
  test('genera JS válido con el cliente', () => {
    const config = generateRuntimeConfig(VALID_MANIFEST);
    assert.ok(config.includes('export const RUNTIME_CONFIG'), 'Debe exportar RUNTIME_CONFIG');
    assert.ok(config.includes('Clínica Dental Demo'), 'Debe incluir nombre del cliente');
    assert.ok(config.includes('dental'), 'Debe incluir vertical');
    assert.ok(config.includes('// Generado por Fábrica SaaS'), 'Debe incluir header');
  });

  test('no contiene secretos ni URLs de webhook', () => {
    const config = generateRuntimeConfig(VALID_MANIFEST);
    assert.ok(!config.includes('hook.eu1.make.com'), 'No debe contener URLs de Make');
    assert.ok(!config.includes('airtableapi'), 'No debe contener Airtable API');
    assert.ok(!config.includes('supabase.co'), 'No debe contener URLs de Supabase');
    assert.ok(!config.toLowerCase().includes('password'), 'No debe contener passwords');
    assert.ok(!config.toLowerCase().includes('apikey'), 'No debe contener API keys');
    assert.ok(!config.toLowerCase().includes('secret'), 'No debe contener secrets');
  });

  test('es determinista (mismo input → mismo output)', () => {
    const config1 = generateRuntimeConfig(VALID_MANIFEST);
    const config2 = generateRuntimeConfig(VALID_MANIFEST);
    // El timestamp está embebido, por lo que no serán idénticas si el segundo tarda
    // Por diseño, comparamos sin el timestamp
    const stripTs = s => s.replace(/\/\/ Fecha: .+/, '// Fecha: [stripped]');
    assert.equal(stripTs(config1), stripTs(config2));
  });
});

// ── IDEMPOTENCIA ───────────────────────────────────────────────────────────

describe('writeIdempotent + runGeneration idempotencia', () => {
  test('writeIdempotent: primera escritura → action=written', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-test-'));
    const tmpFile = path.join(tmpDir, 'test.js');
    const content = 'export const x = 1;';
    const result = writeIdempotent(tmpFile, content);
    assert.equal(result.action, 'written');
    assert.ok(result.hash.length === 64, 'Hash debe ser SHA-256 hex (64 chars)');
    fs.rmSync(tmpDir, { recursive: true });
  });

  test('writeIdempotent: segunda escritura con mismo contenido → action=skipped', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-test-'));
    const tmpFile = path.join(tmpDir, 'test.js');
    const content = 'export const x = 1;';
    writeIdempotent(tmpFile, content);
    const result2 = writeIdempotent(tmpFile, content);
    assert.equal(result2.action, 'skipped', 'Segunda escritura idéntica debe ser skipped');
    fs.rmSync(tmpDir, { recursive: true });
  });

  test('writeIdempotent: contenido diferente → action=written', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-test-'));
    const tmpFile = path.join(tmpDir, 'test.js');
    writeIdempotent(tmpFile, 'export const x = 1;');
    const result2 = writeIdempotent(tmpFile, 'export const x = 2;');
    assert.equal(result2.action, 'written', 'Contenido diferente debe sobreescribirse');
    fs.rmSync(tmpDir, { recursive: true });
  });

  test('runGeneration idempotencia: primera ejecución genera, segunda es skipped', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-idempotence-'));
    const manifestPath = path.join(GENERATOR_ROOT, 'clients/clinica-dental-demo/manifest.yaml');

    const res1 = await runGeneration({ manifestPath, outputDir: tmpDir, verbose: false });
    assert.equal(res1.success, true, `Primera generación falló: ${res1.errors.join(', ')}`);
    assert.ok(res1.generated.length > 0, 'Primera ejecución debe generar archivos');

    const res2 = await runGeneration({ manifestPath, outputDir: tmpDir, verbose: false });
    assert.equal(res2.success, true, `Segunda generación falló: ${res2.errors.join(', ')}`);
    assert.equal(res2.generated.length, 0, 'Segunda ejecución no debe generar cambios');
    assert.ok(res2.skipped.length > 0, 'Segunda ejecución debe reportar archivos sin cambios');

    fs.rmSync(tmpDir, { recursive: true });
  });

  test('runGeneration: manifiesto inexistente → falla limpiamente', async () => {
    const res = await runGeneration({ manifestPath: '/no/existe/manifest.yaml', verbose: false });
    assert.equal(res.success, false);
    assert.ok(res.errors.length > 0);
  });

  test('runGeneration: manifiesto inválido → falla con errores de validación', async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fabrica-invalid-'));
    const badManifest = path.join(tmpDir, 'bad.yaml');
    fs.writeFileSync(badManifest, 'cliente: Demo\nvertical: vertical_inventado\nmodo_demo: true\nmodulos:\n  - chatbot_ia\nsedes:\n  - id: a\n    nombre: A\n');
    const res = await runGeneration({ manifestPath: badManifest, outputDir: tmpDir, verbose: false });
    assert.equal(res.success, false);
    assert.ok(res.errors.some(e => e.includes('Validación')));
    fs.rmSync(tmpDir, { recursive: true });
  });
});
