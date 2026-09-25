/**
 * Factory V1.6 test suite
 * Tests: design system (10 verticals), AI router, repomix profiles,
 * manifest V1.6 schema, UI components tokens, media engine, backward compat.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// ─── Design System V1.6 ────────────────────────────────────────────────────

import {
  VERTICAL_TOKENS, getTokens, getVerticalTheme, getVerticalSector,
  getVerticalStyle, getSupportedVerticals, generateThemeCss,
} from '../../core/branding/designSystem.js';

describe('Design System V1.6 — 10 verticals', () => {
  const CANONICAL_VERTICALS = [
    'dental', 'legal', 'physio', 'psychology', 'speech-therapy',
    'sports', 'veterinary', 'hairdresser', 'beauty', 'fertility',
  ];

  test('getSupportedVerticals returns at least 10 canonical verticals', () => {
    const supported = getSupportedVerticals();
    for (const v of CANONICAL_VERTICALS) {
      assert.ok(supported.includes(v), `Missing vertical: ${v}`);
    }
    assert.ok(supported.length >= 10);
  });

  for (const vertical of CANONICAL_VERTICALS) {
    test(`${vertical}: has complete token structure`, () => {
      const t = VERTICAL_TOKENS[vertical];
      assert.ok(t, `VERTICAL_TOKENS[${vertical}] missing`);
      assert.ok(t.colors,     `${vertical}.colors missing`);
      assert.ok(t.typography, `${vertical}.typography missing`);
      assert.ok(t.spacing,    `${vertical}.spacing missing`);
      assert.ok(t.radii,      `${vertical}.radii missing`);
      assert.ok(t.shadows,    `${vertical}.shadows missing`);
      assert.ok(t.sector,     `${vertical}.sector missing`);
      assert.ok(t.style,      `${vertical}.style missing`);
    });

    test(`${vertical}: colors are distinct (no all-same primary)`, () => {
      const c = VERTICAL_TOKENS[vertical].colors;
      assert.ok(c.primary,   `${vertical}: no primary color`);
      assert.ok(c.secondary, `${vertical}: no secondary color`);
      assert.match(c.primary, /^#[0-9a-fA-F]{6}$/, `${vertical}: primary not a hex`);
    });

    test(`${vertical}: style object has required keys`, () => {
      const s = VERTICAL_TOKENS[vertical].style;
      assert.ok(s.density,        `${vertical}.style.density missing`);
      assert.ok(s.heroStyle,      `${vertical}.style.heroStyle missing`);
      assert.ok(s.ctaStyle,       `${vertical}.style.ctaStyle missing`);
      assert.ok(s.imageTreatment, `${vertical}.style.imageTreatment missing`);
    });

    test(`${vertical}: sector has icon, label, entity, booking`, () => {
      const sec = VERTICAL_TOKENS[vertical].sector;
      assert.ok(sec.icon,    `${vertical}.sector.icon missing`);
      assert.ok(sec.label,   `${vertical}.sector.label missing`);
      assert.ok(sec.entity,  `${vertical}.sector.entity missing`);
      assert.ok(sec.booking, `${vertical}.sector.booking missing`);
    });
  }

  test('getVerticalTheme is alias for getTokens', () => {
    const t1 = getTokens('dental');
    const t2 = getVerticalTheme('dental');
    assert.deepStrictEqual(t1, t2);
  });

  test('getTokens applies branding override correctly', () => {
    const t = getTokens('dental', { primaryColor: '#ff0000' });
    assert.strictEqual(t.colors.primary, '#ff0000');
    assert.notStrictEqual(t.colors.secondary, '#ff0000');
  });

  test('getTokens unknown vertical falls back to dental', () => {
    const t = getTokens('unknown-sector');
    assert.strictEqual(t.colors.primary, VERTICAL_TOKENS.dental.colors.primary);
  });

  test('backward compat: fisioterapia → physio', () => {
    const physio     = getTokens('physio');
    const fisio      = getTokens('fisioterapia');
    assert.strictEqual(physio.colors.primary, fisio.colors.primary);
  });

  test('backward compat: estetica → beauty', () => {
    const beauty  = getTokens('beauty');
    const estetica = getTokens('estetica');
    assert.strictEqual(beauty.colors.primary, estetica.colors.primary);
  });

  test('backward compat: abogados → legal', () => {
    const legal   = getTokens('legal');
    const abogados = getTokens('abogados');
    assert.strictEqual(legal.colors.primary, abogados.colors.primary);
  });

  test('generateThemeCss includes V1.6 shadcn-compatible vars', () => {
    const css = generateThemeCss(getTokens('dental'));
    assert.ok(css.includes('--primary:'),    'missing --primary');
    assert.ok(css.includes('--background:'), 'missing --background');
    assert.ok(css.includes('--foreground:'), 'missing --foreground');
    assert.ok(css.includes('--border:'),     'missing --border');
    assert.ok(css.includes('--muted:'),      'missing --muted');
    assert.ok(css.includes('--radius:'),     'missing --radius');
  });

  test('dental primary color unchanged from V1.5', () => {
    assert.strictEqual(VERTICAL_TOKENS.dental.colors.primary, '#0c7873');
  });

  test('no two canonical verticals share the same primary color', () => {
    const CANONICAL_VERTICALS = ['dental','legal','physio','psychology','speech-therapy','sports','veterinary','hairdresser','beauty','fertility'];
    const primaries = CANONICAL_VERTICALS.map(v => VERTICAL_TOKENS[v].colors.primary);
    const unique = new Set(primaries);
    assert.strictEqual(unique.size, primaries.length, 'Duplicate primary colors found');
  });

  test('getVerticalStyle returns density for each canonical vertical', () => {
    const CANONICAL_VERTICALS = ['dental','legal','physio','psychology','speech-therapy','sports','veterinary','hairdresser','beauty','fertility'];
    const VALID_DENSITIES = ['compact', 'comfortable', 'spacious'];
    for (const v of CANONICAL_VERTICALS) {
      const style = getVerticalStyle(v);
      assert.ok(VALID_DENSITIES.includes(style.density), `${v} density "${style.density}" invalid`);
    }
  });
});

// ─── AI Router ────────────────────────────────────────────────────────────────

import { classifyTask, getRoutingInstructions, AI_TIERS } from '../../core/aiRouter.js';

describe('AI Router V1.6', () => {
  test('search → TIER1_LOCAL when local model available', () => {
    const r = classifyTask('search for a function', { localModelAvailable: true });
    assert.strictEqual(r.tier, AI_TIERS.TIER1_LOCAL);
  });

  test('search → TIER2_CONTEXT when local model unavailable', () => {
    const r = classifyTask('search for a function', { localModelAvailable: false });
    assert.strictEqual(r.tier, AI_TIERS.TIER2_CONTEXT);
  });

  test('refactor → TIER2_CONTEXT when local available', () => {
    const r = classifyTask('refactor the generator module', { localModelAvailable: true });
    assert.strictEqual(r.tier, AI_TIERS.TIER2_CONTEXT);
  });

  test('architecture → TIER3_CLAUDE', () => {
    const r = classifyTask('design architecture for new vertical');
    assert.strictEqual(r.tier, AI_TIERS.TIER3_CLAUDE);
  });

  test('security → TIER3_CLAUDE', () => {
    const r = classifyTask('security audit for auth flow');
    assert.strictEqual(r.tier, AI_TIERS.TIER3_CLAUDE);
  });

  test('production deploy → TIER4_REVIEW', () => {
    const r = classifyTask('production deploy to cloudflare');
    assert.strictEqual(r.tier, AI_TIERS.TIER4_REVIEW);
  });

  test('payment stripe → TIER4_REVIEW', () => {
    const r = classifyTask('configure payment and stripe');
    assert.strictEqual(r.tier, AI_TIERS.TIER4_REVIEW);
  });

  test('all tiers have routing instructions', () => {
    for (const tier of Object.values(AI_TIERS)) {
      const inst = getRoutingInstructions(tier);
      assert.ok(inst.engine, `${tier}: no engine`);
      assert.ok(Array.isArray(inst.steps) && inst.steps.length > 0, `${tier}: no steps`);
    }
  });

  test('TIER1 instructions mention Ollama', () => {
    const inst = getRoutingInstructions(AI_TIERS.TIER1_LOCAL);
    assert.ok(inst.engine.includes('Ollama') || inst.steps.some(s => s.includes('ollama')));
  });

  test('TIER3 instructions mention Claude', () => {
    const inst = getRoutingInstructions(AI_TIERS.TIER3_CLAUDE);
    assert.ok(inst.engine.includes('Claude'));
  });

  test('classifyTask returns repomixProfile', () => {
    const r = classifyTask('architecture review', { localModelAvailable: true });
    assert.ok(r.repomixProfile !== undefined);
  });
});

// ─── Manifest V1.6 Schema ────────────────────────────────────────────────────

import { validateV16Fields, normalizeManifestV16, V16_SUPPORTED_VERTICALS } from '../../generator/schema/v1.6Schema.js';

describe('Manifest V1.6 Schema', () => {
  test('empty manifest validates with no warnings', () => {
    const r = validateV16Fields({});
    assert.ok(r.valid);
    assert.strictEqual(r.warnings.length, 0);
  });

  test('valid ai section passes', () => {
    const r = validateV16Fields({ ai: { routing: 'TIER3_CLAUDE', localModel: 'qwen2.5-coder:1.5b', contextProfile: 'generator' } });
    assert.ok(r.valid);
    assert.ok(r.v16Fields.includes('ai'));
  });

  test('invalid ai.routing produces warning', () => {
    const r = validateV16Fields({ ai: { routing: 'INVALID_TIER' } });
    assert.ok(!r.valid);
    assert.ok(r.warnings.some(w => w.includes('routing')));
  });

  test('valid design section passes', () => {
    const r = validateV16Fields({ design: { vertical: 'dental', density: 'comfortable' } });
    assert.ok(r.valid);
    assert.ok(r.v16Fields.includes('design'));
  });

  test('invalid design.vertical produces warning', () => {
    const r = validateV16Fields({ design: { vertical: 'plumbing' } });
    assert.ok(!r.valid);
    assert.ok(r.warnings.some(w => w.includes('vertical')));
  });

  test('invalid design.density produces warning', () => {
    const r = validateV16Fields({ design: { density: 'ultra-dense' } });
    assert.ok(!r.valid);
  });

  test('valid media section passes', () => {
    const r = validateV16Fields({ media: { hero: 'https://example.com/hero.jpg', gallery: [] } });
    assert.ok(r.valid);
    assert.ok(r.v16Fields.includes('media'));
  });

  test('invalid media.hero type produces warning', () => {
    const r = validateV16Fields({ media: { hero: { url: 'bad' } } });
    assert.ok(!r.valid);
  });

  test('valid components section passes', () => {
    const r = validateV16Fields({ components: { variantSet: 'shadcn-compat' } });
    assert.ok(r.valid);
  });

  test('invalid components.variantSet produces warning', () => {
    const r = validateV16Fields({ components: { variantSet: 'react-bootstrap' } });
    assert.ok(!r.valid);
  });

  test('V1.5 branding manifest detected as v15Compat', () => {
    const r = validateV16Fields({ branding: { nombre: 'Test', primaryColor: '#0c7873' }, modules: ['landing'] });
    assert.ok(r.v15Compat);
  });

  test('normalizeManifestV16 returns default vertical if absent', () => {
    const n = normalizeManifestV16({});
    assert.strictEqual(n.vertical, 'dental');
  });

  test('normalizeManifestV16 picks vertical from design.vertical first', () => {
    const n = normalizeManifestV16({ design: { vertical: 'legal' }, sector: 'dental' });
    assert.strictEqual(n.vertical, 'legal');
  });

  test('normalizeManifestV16 falls back to manifest.sector', () => {
    const n = normalizeManifestV16({ sector: 'physio' });
    assert.strictEqual(n.vertical, 'physio');
  });

  test('normalizeManifestV16 preserves V1.5 branding fields', () => {
    const n = normalizeManifestV16({ branding: { nombre: 'Aurora', primaryColor: '#0c7873' } });
    assert.strictEqual(n.branding.primaryColor, '#0c7873');
  });

  test('normalizeManifestV16 returns all expected top-level keys', () => {
    const n = normalizeManifestV16({});
    for (const k of ['nombre', 'vertical', 'slug', 'branding', 'modules', 'design', 'ai', 'media', 'components', 'experiencia']) {
      assert.ok(k in n, `Missing key: ${k}`);
    }
  });

  test('V16_SUPPORTED_VERTICALS includes all 10 canonical verticals', () => {
    const canonical = ['dental', 'legal', 'physio', 'psychology', 'speech-therapy', 'sports', 'veterinary', 'hairdresser', 'beauty', 'fertility'];
    for (const v of canonical) {
      assert.ok(V16_SUPPORTED_VERTICALS.includes(v), `Missing: ${v}`);
    }
  });
});

// ─── Media Engine ────────────────────────────────────────────────────────────

import { getPlaceholderImage, resolveManifestMedia, generateFaviconDataUri, generateSocialMeta, makeSvgPlaceholder } from '../../core/mediaEngine.js';

describe('Media Engine V1.6', () => {
  test('getPlaceholderImage returns src and alt for each canonical vertical', () => {
    const canonical = ['dental','legal','physio','psychology','speech-therapy','sports','veterinary','hairdresser','beauty','fertility'];
    for (const v of canonical) {
      const img = getPlaceholderImage(v, 'hero');
      assert.ok(img.src, `${v} hero: no src`);
      assert.ok(img.alt, `${v} hero: no alt`);
      assert.strictEqual(img.placeholder, true);
    }
  });

  test('getPlaceholderImage types: hero, team, service, gallery', () => {
    for (const type of ['hero', 'team', 'service', 'gallery']) {
      const img = getPlaceholderImage('dental', type);
      assert.ok(img.src.startsWith('data:image/svg+xml;base64,'), `${type}: not a data URI`);
    }
  });

  test('resolveManifestMedia returns hero placeholder when no media', () => {
    const media = resolveManifestMedia({ vertical: 'dental' });
    assert.ok(media.hero);
    assert.strictEqual(media.hero.placeholder, true);
  });

  test('resolveManifestMedia uses real hero when provided', () => {
    const media = resolveManifestMedia({ media: { hero: 'https://example.com/h.jpg' } });
    assert.strictEqual(media.hero.src, 'https://example.com/h.jpg');
    assert.strictEqual(media.hero.placeholder, false);
  });

  test('resolveManifestMedia gallery fallback to 1 placeholder', () => {
    const media = resolveManifestMedia({});
    assert.ok(Array.isArray(media.gallery));
    assert.strictEqual(media.gallery.length, 1);
    assert.strictEqual(media.gallery[0].placeholder, true);
  });

  test('resolveManifestMedia video is null when not in media', () => {
    const media = resolveManifestMedia({});
    assert.strictEqual(media.video, null);
  });

  test('generateFaviconDataUri returns valid base64 data URI', () => {
    const uri = generateFaviconDataUri('A', '#0c7873', '#ffffff');
    assert.ok(uri.startsWith('data:image/svg+xml;base64,'));
    assert.ok(uri.length > 50);
  });

  test('generateFaviconDataUri includes given letter in SVG', () => {
    const uri = generateFaviconDataUri('Z', '#000000', '#ffffff');
    const decoded = Buffer.from(uri.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf-8');
    assert.ok(decoded.includes('>Z<'), 'Letter Z not found in SVG');
  });

  test('generateSocialMeta includes title and og:title', () => {
    const meta = generateSocialMeta({ title: 'Aurora Test', color: '#0c7873' });
    assert.ok(meta.includes('og:title'));
    assert.ok(meta.includes('Aurora Test'));
    assert.ok(meta.includes('theme-color'));
  });

  test('makeSvgPlaceholder returns valid data URI', () => {
    const uri = makeSvgPlaceholder({ width: 400, height: 200, label: 'Test' });
    assert.ok(uri.startsWith('data:image/svg+xml;base64,'));
  });

  test('no copyright-dubious external URLs in placeholder generation', () => {
    for (const v of ['dental','beauty','sports']) {
      const img = getPlaceholderImage(v, 'hero');
      assert.ok(!img.src.startsWith('http'), `${v}: placeholder should not fetch external URLs`);
    }
  });
});

// ─── UI Components tokens ────────────────────────────────────────────────────

import { BASE_TOKENS, SEMANTIC_TOKENS, buildThemeVars, mergeTokens } from '../../core/ui/tokens.js';

describe('UI Components V1.6 — tokens', () => {
  test('BASE_TOKENS has radius, shadow, font vars', () => {
    assert.ok('--radius' in BASE_TOKENS);
    assert.ok('--shadow-sm' in BASE_TOKENS);
    assert.ok('--font-sans' in BASE_TOKENS);
    assert.ok('--transition' in BASE_TOKENS);
  });

  test('SEMANTIC_TOKENS has shadcn-compatible keys', () => {
    const required = ['--background','--foreground','--primary','--secondary','--muted','--border','--input','--ring'];
    for (const k of required) {
      assert.ok(k in SEMANTIC_TOKENS, `Missing: ${k}`);
    }
  });

  test('SEMANTIC_TOKENS default primary matches dental', () => {
    assert.strictEqual(SEMANTIC_TOKENS['--primary'], '#0c7873');
  });

  test('buildThemeVars returns primary and ring overrides', () => {
    const vars = buildThemeVars('#ff0000');
    assert.strictEqual(vars['--primary'], '#ff0000');
    assert.strictEqual(vars['--ring'], '#ff0000');
  });

  test('mergeTokens combines base + semantic + overrides', () => {
    const merged = mergeTokens({ '--custom-var': 'test' });
    assert.ok('--radius' in merged);
    assert.ok('--primary' in merged);
    assert.strictEqual(merged['--custom-var'], 'test');
  });

  test('mergeTokens override wins over defaults', () => {
    const merged = mergeTokens({ '--primary': '#123456' });
    assert.strictEqual(merged['--primary'], '#123456');
  });
});

// ─── Repomix profiles config ──────────────────────────────────────────────────

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir     = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dir, '../../../');
const FABRICA   = resolve(ROOT, 'fabrica-saas');

describe('Repomix profiles — config validation', () => {
  const PROFILES = [
    '.ai/context/repomix.config.json',
    '.ai/context/presets/factory-core.json',
    '.ai/context/presets/generator.json',
    '.ai/context/presets/client-current.json',
    '.ai/context/presets/design-system.json',
    '.ai/context/presets/tests.json',
    '.ai/context/presets/architecture.json',
  ];

  for (const profile of PROFILES) {
    test(`${profile}: exists and is valid JSON`, () => {
      const path = resolve(FABRICA, profile);
      assert.ok(existsSync(path), `Missing: ${path}`);
      const content = readFileSync(path, 'utf-8');
      const config  = JSON.parse(content);
      assert.ok(typeof config === 'object');
    });

    test(`${profile}: has output.filePath`, () => {
      const path   = resolve(FABRICA, profile);
      const config = JSON.parse(readFileSync(path, 'utf-8'));
      assert.ok(config.output?.filePath, `${profile}: missing output.filePath`);
    });

    test(`${profile}: excludes node_modules`, () => {
      const path    = resolve(FABRICA, profile);
      const config  = JSON.parse(readFileSync(path, 'utf-8'));
      const customs = config.ignore?.customPatterns ?? [];
      assert.ok(
        customs.some(p => p.includes('node_modules')),
        `${profile}: should exclude node_modules`
      );
    });

    test(`${profile}: excludes .env patterns`, () => {
      const path    = resolve(FABRICA, profile);
      const config  = JSON.parse(readFileSync(path, 'utf-8'));
      const customs = config.ignore?.customPatterns ?? [];
      assert.ok(
        customs.some(p => p.includes('.env')),
        `${profile}: should exclude .env files`
      );
    });
  }

  test('main repomix config excludes secrets and credentials', () => {
    const path    = resolve(FABRICA, '.ai/context/repomix.config.json');
    const config  = JSON.parse(readFileSync(path, 'utf-8'));
    const customs = config.ignore?.customPatterns ?? [];
    assert.ok(customs.some(p => p.includes('secret')), 'should exclude secrets');
    assert.ok(customs.some(p => p.includes('credentials')), 'should exclude credentials');
    assert.ok(customs.some(p => p.includes('.key')), 'should exclude key files');
  });

  test('main repomix config excludes deploy artifacts', () => {
    const path    = resolve(FABRICA, '.ai/context/repomix.config.json');
    const config  = JSON.parse(readFileSync(path, 'utf-8'));
    const customs = config.ignore?.customPatterns ?? [];
    assert.ok(customs.some(p => p.includes('dist') || p.includes('deploy') || p.includes('build')));
  });

  test('main repomix config enables security check', () => {
    const path   = resolve(FABRICA, '.ai/context/repomix.config.json');
    const config = JSON.parse(readFileSync(path, 'utf-8'));
    assert.strictEqual(config.security?.enableSecurityCheck, true);
  });
});

// ─── Isolation — no CP04 references ──────────────────────────────────────────

describe('V1.6 isolation — no CP04 contamination', () => {
  const V16_NEW_FILES = [
    '../../core/aiRouter.js',
    '../../core/mediaEngine.js',
    '../../core/ui/tokens.js',
  ];

  const CP04_FORBIDDEN = ['club-padel-04', 'cp04', 'padel-04', 'Club Pádel 04', 'localhost:5175'];

  for (const relPath of V16_NEW_FILES) {
    test(`${relPath}: no CP04 references`, () => {
      const abs = resolve(__dir, relPath);
      if (!existsSync(abs)) {
        assert.fail(`File not found: ${abs}`);
      }
      const content = readFileSync(abs, 'utf-8');
      for (const forbidden of CP04_FORBIDDEN) {
        assert.ok(
          !content.toLowerCase().includes(forbidden.toLowerCase()),
          `${relPath}: found forbidden reference "${forbidden}"`
        );
      }
    });
  }

  test('designSystem.js: no CP04 references', () => {
    const abs     = resolve(__dir, '../../core/branding/designSystem.js');
    const content = readFileSync(abs, 'utf-8');
    for (const forbidden of CP04_FORBIDDEN) {
      assert.ok(!content.toLowerCase().includes(forbidden.toLowerCase()), `designSystem: "${forbidden}"`);
    }
  });
});

// ─── Aurora V1.5 regression ──────────────────────────────────────────────────

import { existsSync as fsExists, readFileSync as fsReadFile } from 'node:fs';

describe('Aurora V1.5 regression — V1.6 does not break existing output', () => {
  const AURORA_FILES = [
    '../../output/clinica-dental-aurora-demo/ClinicaDentalAuroraDemoApp.jsx',
    '../../output/clinica-dental-aurora-demo/ClinicaDentalAuroraDemoDashboard.jsx',
    '../../output/clinica-dental-aurora-demo/ClinicaDentalAuroraDemoMockData.js',
  ];

  for (const relPath of AURORA_FILES) {
    test(`${relPath}: file exists`, () => {
      const abs = resolve(__dir, relPath);
      assert.ok(fsExists(abs), `Missing Aurora file: ${relPath}`);
    });

    test(`${relPath}: contains ficticio marker`, () => {
      const abs     = resolve(__dir, relPath);
      if (!fsExists(abs)) return;
      const content = fsReadFile(abs, 'utf-8');
      assert.ok(content.includes('ficticio') || content.includes('FICTICIO') || content.includes('Demo'),
        `${relPath}: missing ficticio/demo marker`
      );
    });
  }

  test('Aurora manifest V1.6 fields are present', () => {
    const manifestPath = resolve(__dir, '../../clients/clinica-dental-aurora-demo/manifest-gen.yaml');
    assert.ok(fsExists(manifestPath));
    const content = fsReadFile(manifestPath, 'utf-8');
    assert.ok(content.includes('ai:'),         'Aurora manifest missing ai: section');
    assert.ok(content.includes('design:'),     'Aurora manifest missing design: section');
    assert.ok(content.includes('components:'), 'Aurora manifest missing components: section');
  });

  test('Aurora manifest specifies dental vertical in design section', () => {
    const manifestPath = resolve(__dir, '../../clients/clinica-dental-aurora-demo/manifest-gen.yaml');
    const content = fsReadFile(manifestPath, 'utf-8');
    assert.ok(content.includes('vertical: dental'), 'design.vertical should be dental');
  });
});
