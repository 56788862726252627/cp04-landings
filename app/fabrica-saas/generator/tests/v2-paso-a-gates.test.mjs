/**
 * Factory Paso A Gates — Integration Tests
 * Tests for Dead Control Gate, Functional Experience Gate, Mobile Product Gate,
 * Interactive Pattern Registry, Premium V2 Default Policy, and AI Router V2.
 *
 * All tests run pure logic — no DOM, no browser required.
 *
 * Converted from vitest to node:test (vitest not installed in CI).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  auditDeadControls,
  auditDeadControlsMulti,
  isButtonLive,
  isCtaLive,
  makeButtonSpec,
  makePlaceholderSpec,
  DEAD_CONTROL_GATE,
} from '../../core/gates/deadControlGate.js';

import {
  validatePattern,
  auditFunctionalExperience,
  auditDemoPage,
  listPatterns,
  FUNCTIONAL_EXPERIENCE_GATE,
} from '../../core/gates/functionalExperienceGate.js';

import {
  validateMobileComponent,
  auditMobileProduct,
  auditTouchTargets,
  makeMobileSidebarSpec,
  makeMobileDialogSpec,
  MOBILE_PRODUCT_GATE,
  BREAKPOINTS,
  MIN_TOUCH_TARGET,
} from '../../core/gates/mobileProductGate.js';

import {
  INTERACTIVE_PATTERN_RECIPES,
  getInteractivePatternById,
  getInteractivePatternsByClassification,
  listInteractivePatternIds,
  INTERACTIVE_PATTERN_COUNT,
} from '../../factory-registry/recipes/interactivePatterns.js';

import {
  PREMIUM_V2_DEFAULT_POLICY,
  resolvePremiumV2Intensity,
} from '../../core/experienceDecisionEngine.js';

import {
  lookupPatternRegistry,
  routeRequest,
  AI_ROUTER_V2_VERSION,
} from '../../core/aiRouterV2.js';

import {
  RECIPE_REGISTRY,
  RECIPE_COUNT,
} from '../../factory-registry/recipes/index.js';

import {
  REGISTRY_VERSION,
  PASO_A_STATUS,
} from '../../factory-registry/index.js';

// ═══════════════════════════════════════════════════════════════════════════════
// DEAD CONTROL GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Dead Control Gate — DEAD_CONTROL_GATE_VERSION', () => {
  it('gate object has version and audit methods', () => {
    assert.ok(DEAD_CONTROL_GATE.version);
    assert.strictEqual(typeof DEAD_CONTROL_GATE.audit, 'function');
    assert.strictEqual(typeof DEAD_CONTROL_GATE.auditMulti, 'function');
  });
});

describe('Dead Control Gate — button detection', () => {
  it('PASS: button with action string', () => {
    const spec = { type: 'button', id: 'btn-1', label: 'Pedir cita', action: 'openBookingModal' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
    assert.strictEqual(result.counts.errors, 0);
  });

  it('PASS: button with onClick string', () => {
    const spec = { type: 'button', id: 'btn-2', label: 'Save', onClick: 'handleSave' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
  });

  it('FAIL: button with null action', () => {
    const spec = { type: 'button', id: 'btn-dead', label: 'Dead', action: null };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, false);
    assert.strictEqual(result.issues[0].type, 'DEAD_BUTTON');
  });

  it('FAIL: button with empty string action', () => {
    const spec = { type: 'button', id: 'btn-empty', label: 'Empty', action: '' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, false);
  });

  it('FAIL: button with "TODO" action', () => {
    const spec = { type: 'button', id: 'btn-todo', label: 'Todo', action: 'TODO' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, false);
  });

  it('PASS: placeholder button is exempted', () => {
    const spec = { type: 'button', id: 'ph', label: 'Placeholder', action: null, placeholder: true };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
    assert.strictEqual(result.issues.length, 0);
  });
});

describe('Dead Control Gate — link detection', () => {
  it('FAIL: link with empty href and no onClick', () => {
    const spec = { type: 'link', id: 'lnk', label: 'Ver más', href: '#', onClick: null };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, false);
    assert.strictEqual(result.issues[0].type, 'DEAD_LINK');
  });

  it('PASS: link with valid href', () => {
    const spec = { type: 'link', id: 'lnk2', label: 'Contact', href: '/contact' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
  });

  it('PASS: link with onClick handler', () => {
    const spec = { type: 'link', id: 'lnk3', label: 'Action', href: '#', onClick: 'handleNav' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
  });
});

describe('Dead Control Gate — CTA detection', () => {
  it('FAIL: CTA with no action, onClick, or href', () => {
    const spec = { type: 'cta', id: 'cta-dead', label: 'Dead CTA', action: null };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, false);
    assert.strictEqual(result.issues[0].type, 'DEAD_CTA');
  });

  it('PASS: CTA with action', () => {
    const spec = { type: 'cta', id: 'cta-live', label: 'Pedir cita', action: 'openModal' };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
  });
});

describe('Dead Control Gate — quick actions', () => {
  it('FAIL: quick action without handler', () => {
    const spec = {
      id: 'qa-section',
      actions: [
        { type: 'quick-action', id: 'qa-dead', label: 'Registro pago', action: null }
      ]
    };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, false);
  });

  it('PASS: quick action with navigate', () => {
    const spec = {
      type: 'quick-action', id: 'qa-live', label: 'Ver agenda', navigate: 'agenda'
    };
    const result = auditDeadControls(spec);
    assert.strictEqual(result.pass, true);
  });
});

describe('Dead Control Gate — multi spec audit', () => {
  it('passes when all specs are clean', () => {
    const specs = [
      { type: 'button', id: 'b1', label: 'OK', action: 'doSomething' },
      { type: 'cta', id: 'c1', label: 'Call', onClick: 'handleCall' },
    ];
    const result = auditDeadControlsMulti(specs);
    assert.strictEqual(result.pass, true);
    assert.strictEqual(result.counts.errors, 0);
  });

  it('fails when any spec has dead control', () => {
    const specs = [
      { type: 'button', id: 'b1', label: 'OK', action: 'doSomething' },
      { type: 'button', id: 'b2', label: 'Dead', action: null },
    ];
    const result = auditDeadControlsMulti(specs);
    assert.strictEqual(result.pass, false);
    assert.ok(result.counts.errors > 0);
  });
});

describe('Dead Control Gate — helpers', () => {
  it('isButtonLive returns true for live button', () => {
    assert.strictEqual(isButtonLive({ action: 'openModal' }), true);
  });
  it('isButtonLive returns false for dead button', () => {
    assert.strictEqual(isButtonLive({ action: null }), false);
  });
  it('isCtaLive returns true for CTA with href', () => {
    assert.strictEqual(isCtaLive({ href: '/contact' }), true);
  });
  it('isCtaLive returns false for dead CTA', () => {
    assert.strictEqual(isCtaLive({ href: '#', action: null, onClick: null }), false);
  });
  it('makeButtonSpec generates a valid button spec', () => {
    const spec = makeButtonSpec('btn-1', 'Submit', 'handleSubmit');
    assert.strictEqual(spec.type, 'button');
    assert.strictEqual(spec.action, 'handleSubmit');
    const audit = auditDeadControls(spec);
    assert.strictEqual(audit.pass, true);
  });
  it('makePlaceholderSpec is exempted from gate', () => {
    const spec = makePlaceholderSpec('ph-1', 'Coming soon');
    const audit = auditDeadControls(spec);
    assert.strictEqual(audit.pass, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTIONAL EXPERIENCE GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Functional Experience Gate — version and patterns', () => {
  it('gate object has version and patterns', () => {
    assert.ok(FUNCTIONAL_EXPERIENCE_GATE.version);
    assert.strictEqual(Array.isArray(FUNCTIONAL_EXPERIENCE_GATE.patterns), true);
    assert.ok(FUNCTIONAL_EXPERIENCE_GATE.patterns.length > 8);
  });

  it('listPatterns returns all pattern definitions', () => {
    const patterns = listPatterns();
    assert.ok(patterns.length > 8);
    patterns.forEach(p => {
      assert.ok('id' in p);
      assert.ok('required' in p);
      assert.ok('description' in p);
    });
  });
});

describe('Functional Experience Gate — navigation pattern', () => {
  it('PASS: navigation with onNavigate', () => {
    const result = validatePattern('navigation', { onNavigate: 'handleNav' });
    assert.strictEqual(result.pass, true);
  });
  it('FAIL: navigation without onNavigate', () => {
    const result = validatePattern('navigation', {});
    assert.strictEqual(result.pass, false);
    assert.ok(result.missing.includes('onNavigate'));
  });
});

describe('Functional Experience Gate — modal pattern', () => {
  it('PASS: modal with onOpen and onClose', () => {
    const result = validatePattern('modal', { onOpen: 'openModal', onClose: 'closeModal' });
    assert.strictEqual(result.pass, true);
  });
  it('FAIL: modal missing onClose', () => {
    const result = validatePattern('modal', { onOpen: 'open' });
    assert.strictEqual(result.pass, false);
    assert.ok(result.missing.includes('onClose'));
  });
});

describe('Functional Experience Gate — role switcher pattern', () => {
  it('PASS: role switcher with handler and roles array', () => {
    const result = validatePattern('roleSwitcher', {
      onRoleChange: 'handleRoleChange',
      roles: ['admin', 'fisio'],
    });
    assert.strictEqual(result.pass, true);
  });
  it('FAIL: role switcher with empty roles array', () => {
    const result = validatePattern('roleSwitcher', { onRoleChange: 'fn', roles: [] });
    assert.strictEqual(result.pass, false);
    assert.ok(result.missing.includes('roles'));
  });
});

describe('Functional Experience Gate — booking flow pattern', () => {
  it('PASS: booking flow with onComplete and steps', () => {
    const result = validatePattern('bookingFlow', {
      onComplete: 'handleBookingComplete',
      steps: ['service', 'datetime', 'confirm', 'success'],
    });
    assert.strictEqual(result.pass, true);
  });
  it('FAIL: booking flow missing steps', () => {
    const result = validatePattern('bookingFlow', { onComplete: 'fn' });
    assert.strictEqual(result.pass, false);
  });
});

describe('Functional Experience Gate — unknown pattern', () => {
  it('returns error for unknown pattern', () => {
    const result = validatePattern('unknown-pattern', {});
    assert.strictEqual(result.pass, false);
    assert.ok(result.error);
  });
});

describe('Functional Experience Gate — multi-pattern audit', () => {
  it('PASS: all patterns valid', () => {
    const entries = [
      { pattern: 'navigation', spec: { onNavigate: 'nav' }, id: 'nav' },
      { pattern: 'modal', spec: { onOpen: 'open', onClose: 'close' }, id: 'modal' },
      { pattern: 'filter', spec: { onFilter: 'filter', options: ['a', 'b'] }, id: 'filter' },
    ];
    const result = auditFunctionalExperience(entries);
    assert.strictEqual(result.pass, true);
    assert.strictEqual(result.counts.failed, 0);
  });

  it('FAIL: one pattern invalid in multi-audit', () => {
    const entries = [
      { pattern: 'navigation', spec: { onNavigate: 'nav' }, id: 'nav' },
      { pattern: 'modal', spec: { onOpen: 'open' }, id: 'modal-incomplete' },
    ];
    const result = auditFunctionalExperience(entries);
    assert.strictEqual(result.pass, false);
    assert.strictEqual(result.counts.failed, 1);
  });
});

describe('Functional Experience Gate — demo page audit', () => {
  it('PASS: demo page with navigation and booking', () => {
    const pageSpec = {
      patterns: [
        { pattern: 'navigation', spec: { onNavigate: 'nav' } },
        { pattern: 'bookingFlow', spec: { onComplete: 'fn', steps: ['a', 'b'] } },
      ],
    };
    const result = auditDemoPage(pageSpec);
    assert.strictEqual(result.pass, true);
  });

  it('FAIL: demo page missing navigation', () => {
    const pageSpec = {
      patterns: [
        { pattern: 'modal', spec: { onOpen: 'fn', onClose: 'fn' } },
      ],
    };
    const result = auditDemoPage(pageSpec);
    assert.strictEqual(result.pass, false);
    assert.ok(result.missing.length > 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE PRODUCT GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Mobile Product Gate — constants', () => {
  it('has correct breakpoints', () => {
    assert.strictEqual(BREAKPOINTS.mobile, 390);
    assert.strictEqual(BREAKPOINTS.tablet, 768);
    assert.strictEqual(BREAKPOINTS.desktop, 1440);
  });
  it('minimum touch target is 44px', () => {
    assert.strictEqual(MIN_TOUCH_TARGET, 44);
  });
});

describe('Mobile Product Gate — sidebar', () => {
  it('PASS: fully specified mobile sidebar', () => {
    const result = validateMobileComponent('sidebar', {
      mobileHamburger: true,
      mobileOverlay: true,
      onClose: 'closeSidebar',
    });
    assert.strictEqual(result.pass, true);
  });

  it('FAIL: sidebar missing mobileHamburger', () => {
    const result = validateMobileComponent('sidebar', {
      mobileOverlay: true,
      onClose: 'close',
    });
    assert.strictEqual(result.pass, false);
    const ids = result.issues.map(i => i.id);
    assert.ok(ids.includes('hamburger'));
  });

  it('FAIL: sidebar missing mobileOverlay', () => {
    const result = validateMobileComponent('sidebar', {
      mobileHamburger: true,
      onClose: 'close',
    });
    assert.strictEqual(result.pass, false);
    const ids = result.issues.map(i => i.id);
    assert.ok(ids.includes('overlay'));
  });

  it('makeMobileSidebarSpec generates a passing spec', () => {
    const spec = makeMobileSidebarSpec();
    const result = validateMobileComponent('sidebar', spec);
    assert.strictEqual(result.pass, true);
  });
});

describe('Mobile Product Gate — dialog', () => {
  it('PASS: fully specified mobile dialog', () => {
    const result = validateMobileComponent('dialog', {
      mobileFullWidth: true,
      onClose: 'closeDialog',
      scrollable: true,
    });
    assert.strictEqual(result.pass, true);
  });

  it('FAIL: dialog missing scrollable', () => {
    const result = validateMobileComponent('dialog', {
      mobileFullWidth: true,
      onClose: 'close',
    });
    assert.strictEqual(result.pass, false);
    const ids = result.issues.map(i => i.id);
    assert.ok(ids.includes('scroll'));
  });

  it('makeMobileDialogSpec generates a passing spec', () => {
    const spec = makeMobileDialogSpec();
    const result = validateMobileComponent('dialog', spec);
    assert.strictEqual(result.pass, true);
  });
});

describe('Mobile Product Gate — unknown component type', () => {
  it('returns pass with warning for unknown type', () => {
    const result = validateMobileComponent('unknown-widget', {});
    assert.strictEqual(result.pass, true);
    assert.ok(result.warning);
  });
});

describe('Mobile Product Gate — touch targets', () => {
  it('PASS: all elements above 44px', () => {
    const result = auditTouchTargets([
      { label: 'nav item', height: 48 },
      { label: 'button', height: 44 },
      { label: 'fab', height: 56 },
    ]);
    assert.strictEqual(result.pass, true);
  });

  it('FAIL: element below 44px', () => {
    const result = auditTouchTargets([
      { label: 'small-btn', height: 32 },
    ]);
    assert.strictEqual(result.pass, false);
    assert.strictEqual(result.issues[0].actual, 32);
  });

  it('PASS: element exactly 44px', () => {
    const result = auditTouchTargets([{ label: 'exact', height: 44 }]);
    assert.strictEqual(result.pass, true);
  });
});

describe('Mobile Product Gate — full page audit', () => {
  it('PASS: complete mobile-aware page', () => {
    const pageSpec = {
      mobileAware: true,
      components: [
        { type: 'sidebar', spec: { mobileHamburger: true, mobileOverlay: true, onClose: 'fn' } },
        { type: 'dialog',  spec: { mobileFullWidth: true, onClose: 'fn', scrollable: true } },
      ],
    };
    const result = auditMobileProduct(pageSpec);
    assert.strictEqual(result.pass, true);
  });

  it('FAIL: page with sidebar that is not overlay on mobile', () => {
    const pageSpec = {
      components: [
        { type: 'sidebar', spec: { mobileHamburger: true, mobileOverlay: false, onClose: 'fn' } },
      ],
    };
    const result = auditMobileProduct(pageSpec);
    assert.strictEqual(result.pass, false);
  });

  it('MOBILE_PRODUCT_GATE.knownTypes includes sidebar and dialog', () => {
    assert.ok(MOBILE_PRODUCT_GATE.knownTypes.includes('sidebar'));
    assert.ok(MOBILE_PRODUCT_GATE.knownTypes.includes('dialog'));
    assert.ok(MOBILE_PRODUCT_GATE.knownTypes.includes('bookingFlow'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE PATTERN REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interactive Pattern Registry — structure', () => {
  it('has at least 10 patterns', () => {
    assert.ok(INTERACTIVE_PATTERN_COUNT >= 10);
  });

  it('every pattern has required fields', () => {
    INTERACTIVE_PATTERN_RECIPES.forEach(p => {
      assert.ok('id' in p);
      assert.ok('name' in p);
      assert.ok('purpose' in p);
      assert.ok('mobileSafe' in p);
      assert.ok('classification' in p);
      assert.ok('functionalRequirements' in p);
      assert.ok('testRequirements' in p);
    });
  });

  it('all ids are unique', () => {
    const ids = INTERACTIVE_PATTERN_RECIPES.map(p => p.id);
    assert.strictEqual(new Set(ids).size, ids.length);
  });

  it('all patterns are mobileSafe: true', () => {
    INTERACTIVE_PATTERN_RECIPES.forEach(p => {
      assert.strictEqual(p.mobileSafe, true);
    });
  });

  it('all patterns are classified as CORE_REUSABLE', () => {
    INTERACTIVE_PATTERN_RECIPES.forEach(p => {
      assert.strictEqual(p.classification, 'CORE_REUSABLE');
    });
  });
});

describe('Interactive Pattern Registry — lookups', () => {
  it('getInteractivePatternById returns correct recipe', () => {
    const recipe = getInteractivePatternById('booking-flow');
    assert.ok(recipe);
    assert.strictEqual(recipe.id, 'booking-flow');
  });

  it('getInteractivePatternById returns null for unknown id', () => {
    assert.strictEqual(getInteractivePatternById('unknown-pattern-xyz'), null);
  });

  it('getInteractivePatternsByClassification returns CORE_REUSABLE set', () => {
    const core = getInteractivePatternsByClassification('CORE_REUSABLE');
    assert.ok(core.length > 0);
    core.forEach(p => assert.strictEqual(p.classification, 'CORE_REUSABLE'));
  });

  it('listInteractivePatternIds returns all ids', () => {
    const ids = listInteractivePatternIds();
    assert.ok(ids.includes('booking-flow'));
    assert.ok(ids.includes('responsive-sidebar'));
    assert.ok(ids.includes('role-switcher'));
    assert.ok(ids.includes('error-boundary'));
    assert.ok(ids.includes('reduced-motion-hook'));
  });
});

describe('Interactive Pattern Registry — specific patterns', () => {
  it('booking-flow has 4 steps', () => {
    const recipe = getInteractivePatternById('booking-flow');
    assert.strictEqual(recipe.steps.length, 4);
    assert.strictEqual(recipe.steps[0], 'service-selection');
    assert.strictEqual(recipe.steps[3], 'success');
  });

  it('responsive-sidebar has correct mobile breakpoint', () => {
    const recipe = getInteractivePatternById('responsive-sidebar');
    assert.strictEqual(recipe.mobileBreakpoint, 768);
  });

  it('role-switcher has mobile and desktop variants', () => {
    const recipe = getInteractivePatternById('role-switcher');
    assert.strictEqual(recipe.mobileVariant, 'select-dropdown');
    assert.strictEqual(recipe.desktopVariant, 'pill-buttons');
  });

  it('error-boundary uses class component implementation', () => {
    const recipe = getInteractivePatternById('error-boundary');
    assert.match(recipe.implementation, /getDerivedStateFromError/);
  });

  it('reduced-motion-hook documents the anti-pattern', () => {
    const recipe = getInteractivePatternById('reduced-motion-hook');
    assert.ok(recipe.antiPattern);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM V2 DEFAULT POLICY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Premium V2 Default Policy', () => {
  it('is enabled by default', () => {
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.enabled, true);
  });

  it('default intensity is medium', () => {
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.defaultIntensity, 'medium');
  });

  it('all four gates are required', () => {
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.gates.deadControlGate, true);
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.gates.functionalExperienceGate, true);
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.gates.mobileProductGate, true);
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.gates.accessibilityGate, true);
  });

  it('mobileAware is true', () => {
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.mobileAware, true);
  });

  it('error boundary is required', () => {
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.errorBoundaryRequired, true);
  });

  it('basic professional standard is 8.5/10', () => {
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.basicProfessionalStandard, '8.5/10');
  });
});

describe('resolvePremiumV2Intensity', () => {
  it('fisioterapia default → medium', () => {
    assert.strictEqual(resolvePremiumV2Intensity('fisioterapia'), 'medium');
  });

  it('tech default → high', () => {
    assert.strictEqual(resolvePremiumV2Intensity('tech'), 'high');
  });

  it('abogados default → low', () => {
    assert.strictEqual(resolvePremiumV2Intensity('abogados'), 'low');
  });

  it('senior audience caps to low', () => {
    assert.strictEqual(resolvePremiumV2Intensity('tech', 'senior'), 'low');
  });

  it('mobile device caps high to medium', () => {
    assert.strictEqual(resolvePremiumV2Intensity('tech', 'general', true), 'medium');
  });

  it('unknown sector defaults to medium', () => {
    assert.strictEqual(resolvePremiumV2Intensity('unknown-sector-xyz'), 'medium');
  });

  it('professional audience caps high to low', () => {
    assert.strictEqual(resolvePremiumV2Intensity('tech', 'professional'), 'low');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI ROUTER V2 — TIER 0 REGISTRY LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════

describe('AI Router V2 — version', () => {
  it('version is 2.1.0', () => {
    assert.strictEqual(AI_ROUTER_V2_VERSION, '2.1.0');
  });
});

describe('AI Router V2 — Tier 0 registry lookup', () => {
  const mockRegistry = { getInteractivePatternById };

  it('finds known pattern at Tier 0', () => {
    const result = lookupPatternRegistry('booking-flow', { _registry: mockRegistry });
    assert.strictEqual(result.found, true);
    assert.strictEqual(result.tier, 0);
    assert.strictEqual(result.aiCallNeeded, false);
    assert.ok(result.recipe);
  });

  it('misses unknown pattern → escalate to Tier 1', () => {
    const result = lookupPatternRegistry('unknown-pattern-xyz', { _registry: mockRegistry });
    assert.strictEqual(result.found, false);
    assert.strictEqual(result.tier, 1);
  });

  it('returns fallback without registry injection', () => {
    const result = lookupPatternRegistry('booking-flow', {});
    assert.strictEqual(result.found, false);
    assert.match(result.reason, /Registry not injected/);
  });
});

describe('AI Router V2 — routeRequest', () => {
  const mockRegistry = { getInteractivePatternById };

  it('routes known pattern to Tier 0', () => {
    const result = routeRequest({ patternId: 'responsive-sidebar' }, { _registry: mockRegistry });
    assert.strictEqual(result.tier, 0);
    assert.strictEqual(result.aiCallNeeded, false);
  });

  it('routes unknown pattern to AI tier', () => {
    const result = routeRequest({ patternId: 'bespoke-custom-widget', manifest: {} }, { _registry: mockRegistry });
    assert.ok(result.tier > 0);
    assert.strictEqual(result.aiCallNeeded, true);
  });

  it('routes without patternId to AI tier selection', () => {
    const result = routeRequest({ manifest: { sections: ['hero', 'features'] } }, { _registry: mockRegistry });
    assert.strictEqual(result.aiCallNeeded, true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RECIPE REGISTRY INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recipe Registry — backward compatibility', () => {
  it('all existing sections still present', () => {
    assert.ok('hero' in RECIPE_REGISTRY);
    assert.ok('features' in RECIPE_REGISTRY);
    assert.ok('socialProof' in RECIPE_REGISTRY);
    assert.ok('conversion' in RECIPE_REGISTRY);
    assert.ok('appShell' in RECIPE_REGISTRY);
    assert.ok('dashboard' in RECIPE_REGISTRY);
  });

  it('new interactivePatterns section added', () => {
    assert.ok('interactivePatterns' in RECIPE_REGISTRY);
    assert.ok(RECIPE_REGISTRY.interactivePatterns.length > 0);
  });

  it('total recipe count increased after Paso A', () => {
    assert.ok(RECIPE_COUNT > 40);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY VERSION & PASO A STATUS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Registry version and Paso A status', () => {
  it('registry version is set', () => {
    assert.ok(REGISTRY_VERSION, 'registry version must be set');
  });

  it('PASO_A_STATUS is 100_PERCENT', () => {
    assert.strictEqual(PASO_A_STATUS, '100_PERCENT');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY (existing verticals not broken)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Backward compatibility — existing vertical isolation', () => {
  it('gates have no side effects on recipe registry', () => {
    const appShellCount = RECIPE_REGISTRY.appShell.length;
    assert.ok(appShellCount > 0);
    // Running a gate does not mutate the registry
    auditDeadControls({ type: 'button', action: null });
    assert.strictEqual(RECIPE_REGISTRY.appShell.length, appShellCount);
  });

  it('Premium V2 policy does not affect existing vertical settings', () => {
    // The policy is additive — it only applies to new projects
    assert.strictEqual(PREMIUM_V2_DEFAULT_POLICY.enabled, true);
    // Existing demos are opt-in to migration
    assert.strictEqual(typeof resolvePremiumV2Intensity, 'function');
    // Function is pure — calling it with dental returns medium (no side effects)
    assert.strictEqual(resolvePremiumV2Intensity('dental'), 'medium');
  });

  it('all INTERACTIVE_PATTERN_RECIPES are CORE_REUSABLE (not vertical-specific)', () => {
    const nonCore = INTERACTIVE_PATTERN_RECIPES.filter(r => r.classification !== 'CORE_REUSABLE');
    assert.strictEqual(nonCore.length, 0);
  });
});
