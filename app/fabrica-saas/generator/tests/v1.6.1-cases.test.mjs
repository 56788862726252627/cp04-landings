/**
 * V1.6.1 Runtime Hardening — test suite
 * Covers 3 bottleneck fixes:
 *   1. Ollama headless runner (unit tests, no live Ollama required)
 *   2. Context preprocessor (Repomix XML → structured minimal context)
 *   3. AI Router bilingual ES/EN classification
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT    = resolve(__dir, '../../../');
const FABRICA = resolve(ROOT, 'fabrica-saas');

// ─── 1. OLLAMA RUNNER — unit tests ────────────────────────────────────────

describe('Ollama Runner — argument parsing', () => {
  let runner;
  test('imports successfully', async () => {
    runner = await import(`${FABRICA}/.ai/runner/ollama-runner.mjs`);
    assert.ok(runner, 'module loaded');
  });

  test('parseArgs: empty argv', () => {
    const args = runner.parseArgs([]);
    assert.deepEqual(args, {});
  });

  test('parseArgs: extracts --prompt', () => {
    const args = runner.parseArgs(['--prompt', 'hello']);
    assert.equal(args.prompt, 'hello');
  });

  test('parseArgs: extracts --model and --timeout', () => {
    const args = runner.parseArgs(['--model', 'qwen2.5-coder:1.5b', '--timeout', '90']);
    assert.equal(args.model, 'qwen2.5-coder:1.5b');
    assert.equal(args.timeout, '90');
  });

  test('parseArgs: boolean flags (--json, --silent)', () => {
    const args = runner.parseArgs(['--json', '--silent']);
    assert.equal(args.json, true);
    assert.equal(args.silent, true);
  });

  test('parseArgs: mixed flags and values', () => {
    const args = runner.parseArgs(['--prompt', 'test task', '--max-tokens', '200', '--json']);
    assert.equal(args.prompt, 'test task');
    assert.equal(args['max-tokens'], '200');
    assert.equal(args.json, true);
  });
});

describe('Ollama Runner — host validation', () => {
  let runner;
  test('setup', async () => {
    runner = await import(`${FABRICA}/.ai/runner/ollama-runner.mjs`);
  });

  test('validateHost: 127.0.0.1:11434 is valid', () => {
    const r = runner.validateHost('127.0.0.1:11434');
    assert.equal(r.valid, true);
  });

  test('validateHost: localhost:11434 is valid', () => {
    const r = runner.validateHost('localhost:11434');
    assert.equal(r.valid, true);
  });

  test('validateHost: external host is rejected', () => {
    const r = runner.validateHost('0.0.0.0:11434');
    assert.equal(r.valid, false);
    assert.ok(r.reason.includes('localhost'));
  });

  test('validateHost: remote IP is rejected', () => {
    const r = runner.validateHost('192.168.1.100:11434');
    assert.equal(r.valid, false);
  });

  test('validateHost: example.com is rejected', () => {
    const r = runner.validateHost('example.com:11434');
    assert.equal(r.valid, false);
  });
});

describe('Ollama Runner — prompt building', () => {
  let runner;
  test('setup', async () => {
    runner = await import(`${FABRICA}/.ai/runner/ollama-runner.mjs`);
  });

  test('buildPrompt: no context → just prompt', () => {
    const p = runner.buildPrompt('', 'analyze this');
    assert.equal(p, 'analyze this');
  });

  test('buildPrompt: null context → just prompt', () => {
    const p = runner.buildPrompt(null, 'analyze this');
    assert.equal(p, 'analyze this');
  });

  test('buildPrompt: with context → structured block', () => {
    const p = runner.buildPrompt('file content here', 'what does this do?');
    assert.ok(p.includes('CONTEXT:'));
    assert.ok(p.includes('file content here'));
    assert.ok(p.includes('TASK: what does this do?'));
  });

  test('buildPrompt: context appears before task', () => {
    const p = runner.buildPrompt('ctx', 'task');
    assert.ok(p.indexOf('ctx') < p.indexOf('task'));
  });
});

describe('Ollama Runner — context truncation', () => {
  let runner;
  test('setup', async () => {
    runner = await import(`${FABRICA}/.ai/runner/ollama-runner.mjs`);
  });

  test('truncateContext: short text passes through', () => {
    const text = 'hello world';
    const r = runner.truncateContext(text, 100);
    assert.equal(r, text);
  });

  test('truncateContext: long text is cut at maxChars', () => {
    const text = 'x'.repeat(10000);
    const r = runner.truncateContext(text, 500);
    assert.ok(r.length < 600);
    assert.ok(r.includes('truncated'));
  });

  test('truncateContext: default 8000 chars', () => {
    const text = 'a'.repeat(9000);
    const r = runner.truncateContext(text);
    assert.ok(r.length < 9000);
  });
});

describe('Ollama Runner — availability check (no live server)', () => {
  let runner;
  test('setup', async () => {
    runner = await import(`${FABRICA}/.ai/runner/ollama-runner.mjs`);
  });

  test('checkOllamaAvailable: returns boolean', async () => {
    // Port 19999 should be unreachable
    const result = await runner.checkOllamaAvailable('http://127.0.0.1:19999');
    assert.equal(typeof result, 'boolean');
    assert.equal(result, false);
  });
});

// ─── 2. CONTEXT PREPROCESSOR ──────────────────────────────────────────────

describe('Context Preprocessor — XML parsing', () => {
  let preprocessor;
  test('imports successfully', async () => {
    preprocessor = await import(`${FABRICA}/.ai/context/scripts/context-preprocessor.mjs`);
    assert.ok(preprocessor.parseRepomixXml, 'parseRepomixXml exported');
    assert.ok(preprocessor.processRepomixXml, 'processRepomixXml exported');
  });

  test('parseRepomixXml: empty XML returns empty array', () => {
    const files = preprocessor.parseRepomixXml('<repomix></repomix>');
    assert.deepEqual(files, []);
  });

  test('parseRepomixXml: extracts file paths', () => {
    const xml = `<repomix>
      <file path="core/aiRouter.js"><content>export function classifyTask() {}</content></file>
      <file path="core/mediaEngine.js"><content>export function getPlaceholder() {}</content></file>
    </repomix>`;
    const files = preprocessor.parseRepomixXml(xml);
    assert.equal(files.length, 2);
    assert.equal(files[0].path, 'core/aiRouter.js');
    assert.equal(files[1].path, 'core/mediaEngine.js');
  });

  test('parseRepomixXml: extracts file content', () => {
    const xml = `<file path="test.js"><content>const x = 1;</content></file>`;
    const files = preprocessor.parseRepomixXml(xml);
    assert.ok(files[0].content.includes('const x = 1'));
  });

  test('parseRepomixXml: handles CDATA sections', () => {
    const xml = `<file path="test.js"><![CDATA[export const foo = 42;]]></file>`;
    const files = preprocessor.parseRepomixXml(xml);
    assert.ok(files[0].content.includes('export const foo = 42'));
  });

  test('parseRepomixXml: handles document elements', () => {
    const xml = `<document path="core/index.js"><content>export * from './a.js';</content></document>`;
    const files = preprocessor.parseRepomixXml(xml);
    assert.equal(files.length, 1);
    assert.equal(files[0].path, 'core/index.js');
  });
});

describe('Context Preprocessor — extraction modes', () => {
  let preprocessor;
  const sampleXml = `<repomix>
    <file path="core/aiRouter.js"><content>
export const AI_TIERS = {};
export function classifyTask(desc) {}
export async function checkLocalModelAvailable(host) {}
    </content></file>
    <file path="core/mediaEngine.js"><content>
export function getPlaceholderImage(vertical, type) {}
export function generateFaviconDataUri(letter, bg) {}
    </content></file>
    <file path="README.md"><content>
# Factory SaaS
This is the SaaS factory documentation.
    </content></file>
  </repomix>`;

  test('setup', async () => {
    preprocessor = await import(`${FABRICA}/.ai/context/scripts/context-preprocessor.mjs`);
  });

  test('mode=files: lists paths and line counts', () => {
    const files = preprocessor.parseRepomixXml(sampleXml);
    const result = preprocessor.extractFiles(files);
    assert.ok(result.includes('core/aiRouter.js'));
    assert.ok(result.includes('core/mediaEngine.js'));
    assert.ok(result.includes('README.md'));
    assert.ok(result.includes('lines)'));
  });

  test('mode=symbols: extracts JS exports', () => {
    const files = preprocessor.parseRepomixXml(sampleXml);
    const result = preprocessor.extractSymbols(files);
    assert.ok(result.includes('AI_TIERS'));
    assert.ok(result.includes('classifyTask'));
    assert.ok(result.includes('checkLocalModelAvailable'));
    assert.ok(result.includes('getPlaceholderImage'));
    assert.ok(result.includes('generateFaviconDataUri'));
  });

  test('mode=symbols: skips non-JS files', () => {
    const files = preprocessor.parseRepomixXml(sampleXml);
    const result = preprocessor.extractSymbols(files);
    // README.md should not appear as a symbol source
    assert.ok(!result.includes('README'));
  });

  test('mode=summary: includes preview of each file', () => {
    const files = preprocessor.parseRepomixXml(sampleXml);
    const result = preprocessor.extractSummary(files);
    assert.ok(result.includes('core/aiRouter.js'));
    assert.ok(result.includes('core/mediaEngine.js'));
    assert.ok(result.includes('README.md'));
  });

  test('mode=auto: JS files → uses symbols mode', () => {
    const files = preprocessor.parseRepomixXml(sampleXml);
    const result = preprocessor.autoMode(files);
    assert.ok(result.includes('classifyTask'));
  });
});

describe('Context Preprocessor — size reduction', () => {
  let preprocessor;
  test('setup', async () => {
    preprocessor = await import(`${FABRICA}/.ai/context/scripts/context-preprocessor.mjs`);
  });

  test('processRepomixXml: reduces size vs raw XML', () => {
    const bigXml = `<repomix>${Array.from({ length: 10 }, (_, i) =>
      `<file path="module${i}.js"><content>
        // Module ${i} — lots of comments and code
        export function init${i}(config) { return config; }
        export function process${i}(data) { return data.map(x => x * 2); }
        export const MODULE_${i}_CONST = 'value-${i}';
        // More comments here to bulk up the file
        function internal${i}() { return null; }
      </content></file>`
    ).join('')}</repomix>`;

    const result = preprocessor.processRepomixXml(bigXml, 'symbols', 99999);
    assert.ok(result.length < bigXml.length, 'output is smaller than raw XML');
  });

  test('processRepomixXml: max-chars limits output', () => {
    const xml = `<repomix>${Array.from({ length: 5 }, (_, i) =>
      `<file path="f${i}.js"><content>export function fn${i}() { return ${i}; }</content></file>`
    ).join('')}</repomix>`;

    const result = preprocessor.processRepomixXml(xml, 'symbols', 100);
    assert.ok(result.length <= 200, 'output is capped near max-chars');
    assert.ok(result.includes('truncated') || result.length <= 100);
  });

  test('processRepomixXml: preserves export names', () => {
    const xml = `<file path="design.js"><content>
export const VERTICAL_TOKENS = {};
export function getTokens(vertical) {}
export function generateThemeCss(tokens) {}
    </content></file>`;
    const result = preprocessor.processRepomixXml(xml, 'symbols', 9999);
    assert.ok(result.includes('VERTICAL_TOKENS'));
    assert.ok(result.includes('getTokens'));
    assert.ok(result.includes('generateThemeCss'));
  });

  test('processRepomixXml: handles non-XML input gracefully', () => {
    const result = preprocessor.processRepomixXml('not xml at all', 'auto', 9999);
    assert.ok(result.includes('No files found') || typeof result === 'string');
  });

  test('applyMaxChars: truncates at boundary', () => {
    const text = 'a'.repeat(500);
    const r = preprocessor.applyMaxChars(text, 100);
    assert.ok(r.length < 500);
    assert.ok(r.includes('truncated'));
  });

  test('applyMaxChars: passthrough if within limit', () => {
    const text = 'short';
    const r = preprocessor.applyMaxChars(text, 1000);
    assert.equal(r, text);
  });
});

// ─── 3. BILINGUAL AI ROUTER ────────────────────────────────────────────────

describe('AI Router — normalizeForClassification', () => {
  let router;
  test('imports successfully', async () => {
    router = await import(`${FABRICA}/core/aiRouter.js`);
    assert.ok(router.normalizeForClassification, 'exported');
  });

  test('strips accents: producción → produccion', () => {
    assert.equal(router.normalizeForClassification('producción'), 'produccion');
  });

  test('strips accents: autenticación → autenticacion', () => {
    assert.equal(router.normalizeForClassification('autenticación'), 'autenticacion');
  });

  test('strips accents: diseño → diseno', () => {
    assert.equal(router.normalizeForClassification('diseño'), 'diseno');
  });

  test('strips accents: migración → migracion', () => {
    assert.equal(router.normalizeForClassification('migración'), 'migracion');
  });

  test('lowercases: DEPLOY → deploy', () => {
    assert.equal(router.normalizeForClassification('DEPLOY'), 'deploy');
  });

  test('ASCII passes through unchanged', () => {
    assert.equal(router.normalizeForClassification('production deploy'), 'production deploy');
  });
});

describe('AI Router — bilingual TIER4 classification', () => {
  let router;
  test('setup', async () => {
    router = await import(`${FABRICA}/core/aiRouter.js`);
  });

  const t4Cases = [
    // Spanish
    'Modifica autenticación y despliega producción',
    'Rediseña la arquitectura del módulo de pagos',
    'Agrega credenciales al Worker de producción',
    'Despliega el sistema a producción',
    'Actualiza secretos del Worker de facturación',
    'Migración de datos en producción',
    // English
    'Deploy to production',
    'Update stripe payment credentials',
    'Rotate secrets in production infrastructure',
  ];

  for (const task of t4Cases) {
    test(`TIER4: "${task.slice(0, 60)}"`, () => {
      const r = router.classifyTask(task, { localModelAvailable: true });
      assert.equal(r.tier, 'TIER4_REVIEW',
        `Expected TIER4_REVIEW but got ${r.tier}. Normalized: "${router.normalizeForClassification(task)}"`);
    });
  }
});

describe('AI Router — bilingual TIER3 classification', () => {
  let router;
  test('setup', async () => {
    router = await import(`${FABRICA}/core/aiRouter.js`);
  });

  const t3Cases = [
    // Spanish
    'Revisa la arquitectura del módulo de reservas',
    'Analiza el rendimiento del sistema de diseño',
    'Modifica el esquema de la base de datos',
    // English
    'Design the authentication architecture',
    'Debug complex performance regression',
    'Review security model for the API',
  ];

  for (const task of t3Cases) {
    test(`TIER3: "${task.slice(0, 60)}"`, () => {
      const r = router.classifyTask(task, { localModelAvailable: true });
      assert.equal(r.tier, 'TIER3_CLAUDE',
        `Expected TIER3_CLAUDE but got ${r.tier}`);
    });
  }
});

describe('AI Router — bilingual TIER1/TIER2 classification', () => {
  let router;
  test('setup', async () => {
    router = await import(`${FABRICA}/core/aiRouter.js`);
  });

  test('TIER1 ES: "Busca todos los exports en core/"', () => {
    const r = router.classifyTask('Busca todos los exports en core/', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER1_LOCAL');
  });

  test('TIER1 EN: "Search for unused variables"', () => {
    const r = router.classifyTask('Search for unused variables', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER1_LOCAL');
  });

  test('TIER2 ES: "Refactoriza el módulo de cliente"', () => {
    const r = router.classifyTask('Refactoriza el módulo de cliente', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER2_CONTEXT');
  });

  test('TIER2 EN: "Refactor the generator module"', () => {
    const r = router.classifyTask('Refactor the generator module', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER2_CONTEXT');
  });
});

describe('AI Router — no false positives', () => {
  let router;
  test('setup', async () => {
    router = await import(`${FABRICA}/core/aiRouter.js`);
  });

  test('"List all tests" stays TIER1, not confused with Spanish listar', () => {
    const r = router.classifyTask('List all tests', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER1_LOCAL');
  });

  test('"Document the mediaEngine" stays TIER1', () => {
    const r = router.classifyTask('Document the mediaEngine function', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER1_LOCAL');
  });

  test('"Produccion" (Spanish word in TIER1 task description) escalates to TIER4', () => {
    // If "produccion" appears in task, it SHOULD escalate — this is correct behavior
    const r = router.classifyTask('Busca logs de produccion', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER4_REVIEW', 'produccion keyword in any context → TIER4');
  });

  test('TIER4 patterns take priority over TIER3', () => {
    const r = router.classifyTask('Rediseña arquitectura de producción', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER4_REVIEW', 'produccion beats arquitectura');
  });
});

describe('AI Router — regression: existing V1.6 behavior', () => {
  let router;
  test('setup', async () => {
    router = await import(`${FABRICA}/core/aiRouter.js`);
  });

  test('AI_TIERS exported', () => {
    assert.ok(router.AI_TIERS);
    assert.ok(router.AI_TIERS.TIER1_LOCAL);
    assert.ok(router.AI_TIERS.TIER4_REVIEW);
  });

  test('classifyTask returns tier and reason', () => {
    const r = router.classifyTask('document this function');
    assert.ok(r.tier);
    assert.ok(r.reason);
  });

  test('getRoutingInstructions returns engine and steps', () => {
    const inst = router.getRoutingInstructions('TIER1_LOCAL');
    assert.ok(inst.engine);
    assert.ok(Array.isArray(inst.steps));
  });

  test('checkLocalModelAvailable is async function', () => {
    assert.ok(typeof router.checkLocalModelAvailable === 'function');
  });

  test('normalizeForClassification is exported', () => {
    assert.ok(typeof router.normalizeForClassification === 'function');
  });
});
