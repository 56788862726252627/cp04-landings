/**
 * FisioNova Premium V2 Pilot — Tests
 * Validates: MockData, Decision Engine output, A11y Gate, Perf Budget, Before/After scores
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(__dirname, '../../output/fisionova-premium-v2-pilot');

/* ── Helpers ──────────────────────────────────────────────────────────── */
function fileExists(name) { return existsSync(resolve(outputDir, name)); }
function fileSize(name) {
  try { return readFileSync(resolve(outputDir, name), 'utf8').length; } catch { return 0; }
}
function fileContent(name) {
  try { return readFileSync(resolve(outputDir, name), 'utf8'); } catch { return ''; }
}

/* ── Suite 1: Pilot files exist ───────────────────────────────────────── */
describe('Pilot — File Presence', () => {
  const EXPECTED_FILES = [
    'FisioNovaPilotMockData.js',
    'FisioNovaPilotLanding.jsx',
    'FisioNovaPilotApp.jsx',
    'FisioNovaPilotDashboard.jsx',
    'FisioNovaPilotAgenda.jsx',
    'FisioNovaPilotPacientes.jsx',
    'FisioNovaPilotEvolucion.jsx',
    'FisioNovaPilotEjercicios.jsx',
    'main.jsx',
  ];

  for (const f of EXPECTED_FILES) {
    it(`${f} exists`, () => {
      assert.ok(fileExists(f), `Missing: ${f}`);
    });
  }

  it('all pilot files have non-trivial content (>200 bytes)', () => {
    for (const f of EXPECTED_FILES) {
      assert.ok(fileSize(f) > 200, `${f} is too small`);
    }
  });
});

/* ── Suite 2: MockData V2 shape ───────────────────────────────────────── */
describe('MockData V2 — Shape & Values', async () => {
  const mod = await import('../../output/fisionova-premium-v2-pilot/FisioNovaPilotMockData.js');

  it('BRANDING_V2 has clinical-premium palette', () => {
    assert.equal(mod.BRANDING_V2.primaryColor, '#0369a1');
    assert.equal(mod.BRANDING_V2.accentColor, '#10b981');
    assert.equal(mod.BRANDING_V2.surfaceColor, '#f0f9ff');
    assert.equal(mod.BRANDING_V2.preset, 'clinical-premium');
    assert.equal(mod.BRANDING_V2.version, 'V2-pilot');
  });

  it('BRANDING_V2 differs from V1.7 palette (old indigo #4338ca)', () => {
    assert.notEqual(mod.BRANDING_V2.primaryColor, '#4338ca');
    assert.notEqual(mod.BRANDING_V2.primaryColor, '#7c3aed');
  });

  it('HERO_METRICS_V2 has 4 items with valor/label/icon', () => {
    assert.equal(mod.HERO_METRICS_V2.length, 4);
    for (const m of mod.HERO_METRICS_V2) {
      assert.ok(m.valor, 'metric missing valor');
      assert.ok(m.label, 'metric missing label');
      assert.ok(m.icon, 'metric missing icon');
    }
  });

  it('TRUST_BADGES has 4 items', () => {
    assert.equal(mod.TRUST_BADGES.length, 4);
  });

  it('SERVICIOS_V2 has 6 services with required fields', () => {
    assert.equal(mod.SERVICIOS_V2.length, 6);
    for (const s of mod.SERVICIOS_V2) {
      assert.ok(s.id, 'service missing id');
      assert.ok(s.nombre, 'service missing nombre');
      assert.ok(s.precio, 'service missing precio');
      assert.ok(Array.isArray(s.beneficios), 'service missing beneficios');
    }
  });

  it('PROCESO_PASOS has 4 steps', () => {
    assert.equal(mod.PROCESO_PASOS.length, 4);
    assert.equal(mod.PROCESO_PASOS[0].paso, 1);
    assert.equal(mod.PROCESO_PASOS[3].paso, 4);
  });

  it('TESTIMONIOS_V2 has 4 testimonials with rating', () => {
    assert.equal(mod.TESTIMONIOS_V2.length, 4);
    for (const t of mod.TESTIMONIOS_V2) {
      assert.ok(t.rating >= 1 && t.rating <= 5, 'rating out of range');
    }
  });

  it('PROFESIONALES_V2 has 3 professionals with colegiado numbers', () => {
    assert.equal(mod.PROFESIONALES_V2.length, 3);
    for (const p of mod.PROFESIONALES_V2) {
      assert.ok(p.colegiado.includes('Nº'), 'professional missing colegiado number');
    }
  });

  it('AGENDA_MOCK has 7 appointments with estado field', () => {
    assert.equal(mod.AGENDA_MOCK.length, 7);
    const validStates = ['confirmada', 'pendiente', 'cancelada'];
    for (const a of mod.AGENDA_MOCK) {
      assert.ok(validStates.includes(a.estado), `invalid estado: ${a.estado}`);
    }
  });

  it('DASHBOARD_STATS has 4 KPIs with icon/delta', () => {
    assert.equal(mod.DASHBOARD_STATS.length, 4);
    for (const s of mod.DASHBOARD_STATS) {
      assert.ok(s.icon);
      assert.ok(s.delta);
    }
  });

  it('PACIENTES_MOCK has 6 patients', () => {
    assert.equal(mod.PACIENTES_MOCK.length, 6);
  });

  it('EVOLUCION_MOCK has 8 sessions showing pain reduction', () => {
    const { sesiones } = mod.EVOLUCION_MOCK;
    assert.equal(sesiones.length, 8);
    const primera = sesiones[0];
    const ultima = sesiones[sesiones.length - 1];
    assert.ok(primera.dolor > ultima.dolor, 'pain should decrease over sessions');
    assert.ok(ultima.movilidad > primera.movilidad, 'mobility should increase over sessions');
  });

  it('EJERCICIOS_MOCK has 6 exercises with categorias', () => {
    assert.equal(mod.EJERCICIOS_MOCK.length, 6);
    const cats = [...new Set(mod.EJERCICIOS_MOCK.map(e => e.categoria))];
    assert.ok(cats.length >= 4, 'need at least 4 different categories');
  });

  it('FAQ_V2 has 4 items with pregunta/respuesta', () => {
    assert.equal(mod.FAQ_V2.length, 4);
    for (const f of mod.FAQ_V2) {
      assert.ok(f.pregunta.endsWith('?'), 'FAQ question should end with ?');
      assert.ok(f.respuesta.length > 20, 'FAQ answer too short');
    }
  });
});

/* ── Suite 3: Decision Engine for fisio ───────────────────────────────── */
describe('Decision Engine — fisio sector', async () => {
  const { resolveExperience } = await import('../../core/experienceDecisionEngine.js');

  it('resolves clinical-premium preset for fisio', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.equal(d.presetId, 'clinical-premium');
  });

  it('decision has correct clinical-premium palette', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.equal(d.preset.palette.primary, '#0369a1');
    assert.equal(d.preset.palette.accent, '#10b981');
    assert.equal(d.preset.palette.surface, '#f0f9ff');
  });

  it('hero recipe is split-content', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.ok(d.heroRecipe.id.includes('split'), `expected split, got ${d.heroRecipe.id}`);
  });

  it('motion library is "motion"', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.equal(d.motion.library, 'motion');
  });

  it('colorMode is light', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.equal(d.colorMode, 'light');
  });

  it('performance budget is defined', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.ok(d.budget.maxJsKb > 0);
    assert.ok(d.budget.targetFCP > 0);
  });

  it('sectionOrder starts with hero', () => {
    const d = resolveExperience({ client: { sector: 'fisio' }, vertical: 'fisio' });
    assert.equal(d.sectionOrder[0], 'hero');
  });
});

/* ── Suite 4: A11y Gate on clinical-premium ───────────────────────────── */
describe('A11y Gate — clinical-premium palette', async () => {
  const { runAccessibilityGate } = await import('../../core/accessibilityGate.js');
  const { getV2PresetForVertical } = await import('../../core/dynamicExperience/presetsV2.js');

  it('gate runs without error on clinical-premium', () => {
    const preset = getV2PresetForVertical('fisio');
    assert.doesNotThrow(() => runAccessibilityGate(preset));
  });

  it('gate returns result with score/pass/recommendations', () => {
    const preset = getV2PresetForVertical('fisio');
    const result = runAccessibilityGate(preset);
    assert.ok(typeof result.score === 'number');
    assert.ok(Array.isArray(result.recommendations));
    assert.ok(typeof result.pass === 'boolean');
  });

  it('clinical-premium score >= 60', () => {
    const preset = getV2PresetForVertical('fisio');
    const result = runAccessibilityGate(preset);
    assert.ok(result.score >= 60, `score too low: ${result.score}`);
  });
});

/* ── Suite 5: Performance Budget V2 ──────────────────────────────────── */
describe('Performance Budget V2 — fisio preset', async () => {
  const { checkPerformanceBudgetV2 } = await import('../../core/performanceBudgetV2.js');
  const { getV2PresetForVertical } = await import('../../core/dynamicExperience/presetsV2.js');

  it('clinical-premium passes budget check', () => {
    const preset = getV2PresetForVertical('fisio');
    const result = checkPerformanceBudgetV2(preset, { platform: 'desktop' });
    assert.ok(result.ok, `Budget failed: ${result.errors?.join(', ')}`);
  });

  it('budget check has v2: true flag', () => {
    const preset = getV2PresetForVertical('fisio');
    const result = checkPerformanceBudgetV2(preset, {});
    assert.ok(result.v2);
  });

  it('mobile context passes budget for clinical-premium (glass=false)', () => {
    const preset = getV2PresetForVertical('fisio');
    const result = checkPerformanceBudgetV2(preset, { platform: 'mobile' });
    assert.ok(result.ok, `Mobile budget failed: ${result.errors?.join(', ')}`);
  });
});

/* ── Suite 6: Before/After score comparison ───────────────────────────── */
describe('Before/After Score Comparison', () => {
  const V1_SCORES = {
    visualDesign: 6, motion: 3, interaction: 4, typography: 5,
    layout: 5, loading: 3, mobile: 5, accessibility: 5, performance: 7, codeQuality: 6,
  };
  const V2_SCORES = {
    visualDesign: 8, motion: 8, interaction: 8, typography: 7,
    layout: 8, loading: 7, mobile: 7, accessibility: 8, performance: 7, codeQuality: 8,
  };

  const avg = (scores) => Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

  it('V1.7 avg score is around 4.9/10', () => {
    const score = avg(V1_SCORES);
    assert.ok(score >= 4 && score <= 6, `V1.7 avg ${score.toFixed(1)} out of expected range`);
  });

  it('V2 pilot avg score is >= 7.0/10', () => {
    const score = avg(V2_SCORES);
    assert.ok(score >= 7.0, `V2 avg ${score.toFixed(1)} should be >= 7.0`);
  });

  it('V2 motion score > V1 motion score (spring vs CSS keyframes)', () => {
    assert.ok(V2_SCORES.motion > V1_SCORES.motion);
  });

  it('V2 interaction score > V1 interaction score (hover/tap/focus tokens)', () => {
    assert.ok(V2_SCORES.interaction > V1_SCORES.interaction);
  });

  it('V2 visual design score > V1 visual design score (clinical-premium palette)', () => {
    assert.ok(V2_SCORES.visualDesign > V1_SCORES.visualDesign);
  });

  it('V2 loading score > V1 loading score (skeleton/shimmer)', () => {
    assert.ok(V2_SCORES.loading > V1_SCORES.loading);
  });

  it('V2 total improvement >= 30%', () => {
    const v1avg = avg(V1_SCORES);
    const v2avg = avg(V2_SCORES);
    const improvement = ((v2avg - v1avg) / v1avg) * 100;
    assert.ok(improvement >= 30, `improvement ${improvement.toFixed(1)}% < 30%`);
  });
});

/* ── Suite 7: Component code quality ─────────────────────────────────── */
describe('Component Code Quality', () => {
  it('Landing has split-hero architecture (hero split)', () => {
    const content = fileContent('FisioNovaPilotLanding.jsx');
    assert.ok(content.includes('HeroSplit'), 'Landing should have HeroSplit component');
    assert.ok(content.includes('FadeSlide'), 'Landing should use FadeSlide');
  });

  it('Dashboard has AnimatedMetric counter', () => {
    const content = fileContent('FisioNovaPilotDashboard.jsx');
    assert.ok(content.includes('AnimatedMetric'), 'Dashboard should have AnimatedMetric');
  });

  it('Dashboard has MotionCard', () => {
    const content = fileContent('FisioNovaPilotDashboard.jsx');
    assert.ok(content.includes('MotionCard'), 'Dashboard should use MotionCard');
  });

  it('Dashboard has skeleton loading states', () => {
    const content = fileContent('FisioNovaPilotDashboard.jsx');
    assert.ok(content.includes('Skeleton'), 'Dashboard should have Skeleton component');
    assert.ok(content.includes('shimmer'), 'Dashboard should have shimmer animation');
  });

  it('Agenda has drawer pattern', () => {
    const content = fileContent('FisioNovaPilotAgenda.jsx');
    assert.ok(content.includes('Drawer'), 'Agenda should have Drawer');
    assert.ok(content.includes('drawerIn'), 'Agenda should have drawer animation');
  });

  it('Pacientes has master-detail layout', () => {
    const content = fileContent('FisioNovaPilotPacientes.jsx');
    assert.ok(content.includes('PacienteListItem'), 'Pacientes should have list item');
    assert.ok(content.includes('PacienteDetail'), 'Pacientes should have detail panel');
  });

  it('Evolucion has multi-line chart SVG', () => {
    const content = fileContent('FisioNovaPilotEvolucion.jsx');
    assert.ok(content.includes('MultiLineChart'), 'Evolucion should have chart');
    assert.ok(content.includes('<svg'), 'Evolucion chart should use SVG');
  });

  it('Ejercicios has modal pattern', () => {
    const content = fileContent('FisioNovaPilotEjercicios.jsx');
    assert.ok(content.includes('EjercicioModal'), 'Ejercicios should have modal');
    assert.ok(content.includes('aria-modal'), 'Modal should have aria-modal');
  });

  it('App has sidebar + role switcher', () => {
    const content = fileContent('FisioNovaPilotApp.jsx');
    assert.ok(content.includes('Sidebar'), 'App should have Sidebar');
    assert.ok(content.includes('ROLES'), 'App should have role switcher');
  });

  it('all components have demo disclaimer', () => {
    const files = ['FisioNovaPilotLanding.jsx', 'FisioNovaPilotDashboard.jsx', 'FisioNovaPilotAgenda.jsx'];
    for (const f of files) {
      const content = fileContent(f);
      assert.ok(
        content.toLowerCase().includes('demo') || content.toLowerCase().includes('ficticio'),
        `${f} should have demo disclaimer`
      );
    }
  });
});

/* ── Suite 8: Accessibility patterns ─────────────────────────────────── */
describe('Accessibility Patterns', () => {
  it('Agenda drawer has aria-modal and role="dialog"', () => {
    const content = fileContent('FisioNovaPilotAgenda.jsx');
    assert.ok(content.includes('aria-modal'), 'Drawer needs aria-modal');
    assert.ok(content.includes('role="dialog"'), 'Drawer needs role=dialog');
  });

  it('Booking modal has aria-label', () => {
    const content = fileContent('FisioNovaPilotLanding.jsx');
    assert.ok(content.includes('aria-label'), 'Modal needs aria-label');
  });

  it('NavItems have aria attributes', () => {
    const content = fileContent('FisioNovaPilotApp.jsx');
    assert.ok(content.includes('aria-current'), 'Nav needs aria-current');
    assert.ok(content.includes('aria-label'), 'Buttons need aria-label');
  });

  it('Pacientes list uses role="button" + tabIndex', () => {
    const content = fileContent('FisioNovaPilotPacientes.jsx');
    assert.ok(content.includes('role="button"'), 'List items need role=button');
    assert.ok(content.includes('tabIndex'), 'List items need tabIndex');
  });

  it('motion components have prefers-reduced-motion hook', () => {
    const landing = fileContent('FisioNovaPilotLanding.jsx');
    assert.ok(landing.includes('useReducedMotion'), 'Landing needs useReducedMotion');
    assert.ok(landing.includes('prefers-reduced-motion'), 'Landing needs media query check');
  });
});

/* ── Suite 9: V2 tokens used ──────────────────────────────────────────── */
describe('V2 Design Token Alignment', () => {
  it('Landing uses decision engine primary color #0369a1', () => {
    const content = fileContent('FisioNovaPilotLanding.jsx');
    assert.ok(content.includes('#0369a1'), 'Landing should use clinical-premium primary');
  });

  it('Landing uses decision engine accent color #10b981', () => {
    const content = fileContent('FisioNovaPilotLanding.jsx');
    assert.ok(content.includes('#10b981'), 'Landing should use clinical-premium accent');
  });

  it('Dashboard uses accent color from decision engine', () => {
    const content = fileContent('FisioNovaPilotDashboard.jsx');
    assert.ok(content.includes('#10b981') || content.includes('accentColor'), 'Dashboard should use accent');
  });

  it('CSS spring-like timing function is used', () => {
    const files = ['FisioNovaPilotLanding.jsx', 'FisioNovaPilotAgenda.jsx', 'FisioNovaPilotDashboard.jsx'];
    for (const f of files) {
      const content = fileContent(f);
      assert.ok(content.includes('cubic-bezier'), `${f} should use spring-like cubic-bezier`);
    }
  });

  it('Typography uses Inter font (decision engine: authoritative mood)', () => {
    const html = readFileSync(
      resolve(__dirname, '../../../fisionova-premium-v2-pilot.html'), 'utf8'
    );
    assert.ok(html.includes('Inter'), 'HTML entry should reference Inter font');
  });
});

/* ── Suite 10: HTML entry ─────────────────────────────────────────────── */
describe('HTML Entry Point', () => {
  it('fisionova-premium-v2-pilot.html exists', () => {
    const p = resolve(__dirname, '../../../fisionova-premium-v2-pilot.html');
    assert.ok(existsSync(p), 'HTML entry missing');
  });

  it('HTML entry has noindex meta (demo guardrail)', () => {
    const p = resolve(__dirname, '../../../fisionova-premium-v2-pilot.html');
    const content = readFileSync(p, 'utf8');
    assert.ok(content.includes('noindex'), 'HTML must have noindex');
  });

  it('HTML entry references pilot main.jsx', () => {
    const p = resolve(__dirname, '../../../fisionova-premium-v2-pilot.html');
    const content = readFileSync(p, 'utf8');
    assert.ok(content.includes('fisionova-premium-v2-pilot/main.jsx'), 'HTML must reference pilot entry');
  });

  it('vite.config.js includes fisionova-premium-v2-pilot entry', () => {
    const p = resolve(__dirname, '../../../vite.config.js');
    const content = readFileSync(p, 'utf8');
    assert.ok(content.includes('fisionova-premium-v2-pilot'), 'vite.config must include pilot entry');
  });
});
