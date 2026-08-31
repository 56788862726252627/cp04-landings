/**
 * Factory Paso A Gates — Integration Tests
 * Tests for Dead Control Gate, Functional Experience Gate, Mobile Product Gate,
 * Interactive Pattern Registry, Premium V2 Default Policy, and AI Router V2.
 *
 * All tests run pure logic — no DOM, no browser required.
 */

import { describe, it, expect } from 'vitest';

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
    expect(DEAD_CONTROL_GATE.version).toBeTruthy();
    expect(typeof DEAD_CONTROL_GATE.audit).toBe('function');
    expect(typeof DEAD_CONTROL_GATE.auditMulti).toBe('function');
  });
});

describe('Dead Control Gate — button detection', () => {
  it('PASS: button with action string', () => {
    const spec = { type: 'button', id: 'btn-1', label: 'Pedir cita', action: 'openBookingModal' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
    expect(result.counts.errors).toBe(0);
  });

  it('PASS: button with onClick string', () => {
    const spec = { type: 'button', id: 'btn-2', label: 'Save', onClick: 'handleSave' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
  });

  it('FAIL: button with null action', () => {
    const spec = { type: 'button', id: 'btn-dead', label: 'Dead', action: null };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(false);
    expect(result.issues[0].type).toBe('DEAD_BUTTON');
  });

  it('FAIL: button with empty string action', () => {
    const spec = { type: 'button', id: 'btn-empty', label: 'Empty', action: '' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(false);
  });

  it('FAIL: button with "TODO" action', () => {
    const spec = { type: 'button', id: 'btn-todo', label: 'Todo', action: 'TODO' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(false);
  });

  it('PASS: placeholder button is exempted', () => {
    const spec = { type: 'button', id: 'ph', label: 'Placeholder', action: null, placeholder: true };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
    expect(result.issues).toHaveLength(0);
  });
});

describe('Dead Control Gate — link detection', () => {
  it('FAIL: link with empty href and no onClick', () => {
    const spec = { type: 'link', id: 'lnk', label: 'Ver más', href: '#', onClick: null };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(false);
    expect(result.issues[0].type).toBe('DEAD_LINK');
  });

  it('PASS: link with valid href', () => {
    const spec = { type: 'link', id: 'lnk2', label: 'Contact', href: '/contact' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
  });

  it('PASS: link with onClick handler', () => {
    const spec = { type: 'link', id: 'lnk3', label: 'Action', href: '#', onClick: 'handleNav' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
  });
});

describe('Dead Control Gate — CTA detection', () => {
  it('FAIL: CTA with no action, onClick, or href', () => {
    const spec = { type: 'cta', id: 'cta-dead', label: 'Dead CTA', action: null };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(false);
    expect(result.issues[0].type).toBe('DEAD_CTA');
  });

  it('PASS: CTA with action', () => {
    const spec = { type: 'cta', id: 'cta-live', label: 'Pedir cita', action: 'openModal' };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
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
    expect(result.pass).toBe(false);
  });

  it('PASS: quick action with navigate', () => {
    const spec = {
      type: 'quick-action', id: 'qa-live', label: 'Ver agenda', navigate: 'agenda'
    };
    const result = auditDeadControls(spec);
    expect(result.pass).toBe(true);
  });
});

describe('Dead Control Gate — multi spec audit', () => {
  it('passes when all specs are clean', () => {
    const specs = [
      { type: 'button', id: 'b1', label: 'OK', action: 'doSomething' },
      { type: 'cta', id: 'c1', label: 'Call', onClick: 'handleCall' },
    ];
    const result = auditDeadControlsMulti(specs);
    expect(result.pass).toBe(true);
    expect(result.counts.errors).toBe(0);
  });

  it('fails when any spec has dead control', () => {
    const specs = [
      { type: 'button', id: 'b1', label: 'OK', action: 'doSomething' },
      { type: 'button', id: 'b2', label: 'Dead', action: null },
    ];
    const result = auditDeadControlsMulti(specs);
    expect(result.pass).toBe(false);
    expect(result.counts.errors).toBeGreaterThan(0);
  });
});

describe('Dead Control Gate — helpers', () => {
  it('isButtonLive returns true for live button', () => {
    expect(isButtonLive({ action: 'openModal' })).toBe(true);
  });
  it('isButtonLive returns false for dead button', () => {
    expect(isButtonLive({ action: null })).toBe(false);
  });
  it('isCtaLive returns true for CTA with href', () => {
    expect(isCtaLive({ href: '/contact' })).toBe(true);
  });
  it('isCtaLive returns false for dead CTA', () => {
    expect(isCtaLive({ href: '#', action: null, onClick: null })).toBe(false);
  });
  it('makeButtonSpec generates a valid button spec', () => {
    const spec = makeButtonSpec('btn-1', 'Submit', 'handleSubmit');
    expect(spec.type).toBe('button');
    expect(spec.action).toBe('handleSubmit');
    const audit = auditDeadControls(spec);
    expect(audit.pass).toBe(true);
  });
  it('makePlaceholderSpec is exempted from gate', () => {
    const spec = makePlaceholderSpec('ph-1', 'Coming soon');
    const audit = auditDeadControls(spec);
    expect(audit.pass).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCTIONAL EXPERIENCE GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Functional Experience Gate — version and patterns', () => {
  it('gate object has version and patterns', () => {
    expect(FUNCTIONAL_EXPERIENCE_GATE.version).toBeTruthy();
    expect(Array.isArray(FUNCTIONAL_EXPERIENCE_GATE.patterns)).toBe(true);
    expect(FUNCTIONAL_EXPERIENCE_GATE.patterns.length).toBeGreaterThan(8);
  });

  it('listPatterns returns all pattern definitions', () => {
    const patterns = listPatterns();
    expect(patterns.length).toBeGreaterThan(8);
    patterns.forEach(p => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('required');
      expect(p).toHaveProperty('description');
    });
  });
});

describe('Functional Experience Gate — navigation pattern', () => {
  it('PASS: navigation with onNavigate', () => {
    const result = validatePattern('navigation', { onNavigate: 'handleNav' });
    expect(result.pass).toBe(true);
  });
  it('FAIL: navigation without onNavigate', () => {
    const result = validatePattern('navigation', {});
    expect(result.pass).toBe(false);
    expect(result.missing).toContain('onNavigate');
  });
});

describe('Functional Experience Gate — modal pattern', () => {
  it('PASS: modal with onOpen and onClose', () => {
    const result = validatePattern('modal', { onOpen: 'openModal', onClose: 'closeModal' });
    expect(result.pass).toBe(true);
  });
  it('FAIL: modal missing onClose', () => {
    const result = validatePattern('modal', { onOpen: 'open' });
    expect(result.pass).toBe(false);
    expect(result.missing).toContain('onClose');
  });
});

describe('Functional Experience Gate — role switcher pattern', () => {
  it('PASS: role switcher with handler and roles array', () => {
    const result = validatePattern('roleSwitcher', {
      onRoleChange: 'handleRoleChange',
      roles: ['admin', 'fisio'],
    });
    expect(result.pass).toBe(true);
  });
  it('FAIL: role switcher with empty roles array', () => {
    const result = validatePattern('roleSwitcher', { onRoleChange: 'fn', roles: [] });
    expect(result.pass).toBe(false);
    expect(result.missing).toContain('roles');
  });
});

describe('Functional Experience Gate — booking flow pattern', () => {
  it('PASS: booking flow with onComplete and steps', () => {
    const result = validatePattern('bookingFlow', {
      onComplete: 'handleBookingComplete',
      steps: ['service', 'datetime', 'confirm', 'success'],
    });
    expect(result.pass).toBe(true);
  });
  it('FAIL: booking flow missing steps', () => {
    const result = validatePattern('bookingFlow', { onComplete: 'fn' });
    expect(result.pass).toBe(false);
  });
});

describe('Functional Experience Gate — unknown pattern', () => {
  it('returns error for unknown pattern', () => {
    const result = validatePattern('unknown-pattern', {});
    expect(result.pass).toBe(false);
    expect(result.error).toBeTruthy();
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
    expect(result.pass).toBe(true);
    expect(result.counts.failed).toBe(0);
  });

  it('FAIL: one pattern invalid in multi-audit', () => {
    const entries = [
      { pattern: 'navigation', spec: { onNavigate: 'nav' }, id: 'nav' },
      { pattern: 'modal', spec: { onOpen: 'open' }, id: 'modal-incomplete' },
    ];
    const result = auditFunctionalExperience(entries);
    expect(result.pass).toBe(false);
    expect(result.counts.failed).toBe(1);
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
    expect(result.pass).toBe(true);
  });

  it('FAIL: demo page missing navigation', () => {
    const pageSpec = {
      patterns: [
        { pattern: 'modal', spec: { onOpen: 'fn', onClose: 'fn' } },
      ],
    };
    const result = auditDemoPage(pageSpec);
    expect(result.pass).toBe(false);
    expect(result.missing.length).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE PRODUCT GATE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Mobile Product Gate — constants', () => {
  it('has correct breakpoints', () => {
    expect(BREAKPOINTS.mobile).toBe(390);
    expect(BREAKPOINTS.tablet).toBe(768);
    expect(BREAKPOINTS.desktop).toBe(1440);
  });
  it('minimum touch target is 44px', () => {
    expect(MIN_TOUCH_TARGET).toBe(44);
  });
});

describe('Mobile Product Gate — sidebar', () => {
  it('PASS: fully specified mobile sidebar', () => {
    const result = validateMobileComponent('sidebar', {
      mobileHamburger: true,
      mobileOverlay: true,
      onClose: 'closeSidebar',
    });
    expect(result.pass).toBe(true);
  });

  it('FAIL: sidebar missing mobileHamburger', () => {
    const result = validateMobileComponent('sidebar', {
      mobileOverlay: true,
      onClose: 'close',
    });
    expect(result.pass).toBe(false);
    const ids = result.issues.map(i => i.id);
    expect(ids).toContain('hamburger');
  });

  it('FAIL: sidebar missing mobileOverlay', () => {
    const result = validateMobileComponent('sidebar', {
      mobileHamburger: true,
      onClose: 'close',
    });
    expect(result.pass).toBe(false);
    const ids = result.issues.map(i => i.id);
    expect(ids).toContain('overlay');
  });

  it('makeMobileSidebarSpec generates a passing spec', () => {
    const spec = makeMobileSidebarSpec();
    const result = validateMobileComponent('sidebar', spec);
    expect(result.pass).toBe(true);
  });
});

describe('Mobile Product Gate — dialog', () => {
  it('PASS: fully specified mobile dialog', () => {
    const result = validateMobileComponent('dialog', {
      mobileFullWidth: true,
      onClose: 'closeDialog',
      scrollable: true,
    });
    expect(result.pass).toBe(true);
  });

  it('FAIL: dialog missing scrollable', () => {
    const result = validateMobileComponent('dialog', {
      mobileFullWidth: true,
      onClose: 'close',
    });
    expect(result.pass).toBe(false);
    const ids = result.issues.map(i => i.id);
    expect(ids).toContain('scroll');
  });

  it('makeMobileDialogSpec generates a passing spec', () => {
    const spec = makeMobileDialogSpec();
    const result = validateMobileComponent('dialog', spec);
    expect(result.pass).toBe(true);
  });
});

describe('Mobile Product Gate — unknown component type', () => {
  it('returns pass with warning for unknown type', () => {
    const result = validateMobileComponent('unknown-widget', {});
    expect(result.pass).toBe(true);
    expect(result.warning).toBeTruthy();
  });
});

describe('Mobile Product Gate — touch targets', () => {
  it('PASS: all elements above 44px', () => {
    const result = auditTouchTargets([
      { label: 'nav item', height: 48 },
      { label: 'button', height: 44 },
      { label: 'fab', height: 56 },
    ]);
    expect(result.pass).toBe(true);
  });

  it('FAIL: element below 44px', () => {
    const result = auditTouchTargets([
      { label: 'small-btn', height: 32 },
    ]);
    expect(result.pass).toBe(false);
    expect(result.issues[0].actual).toBe(32);
  });

  it('PASS: element exactly 44px', () => {
    const result = auditTouchTargets([{ label: 'exact', height: 44 }]);
    expect(result.pass).toBe(true);
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
    expect(result.pass).toBe(true);
  });

  it('FAIL: page with sidebar that is not overlay on mobile', () => {
    const pageSpec = {
      components: [
        { type: 'sidebar', spec: { mobileHamburger: true, mobileOverlay: false, onClose: 'fn' } },
      ],
    };
    const result = auditMobileProduct(pageSpec);
    expect(result.pass).toBe(false);
  });

  it('MOBILE_PRODUCT_GATE.knownTypes includes sidebar and dialog', () => {
    expect(MOBILE_PRODUCT_GATE.knownTypes).toContain('sidebar');
    expect(MOBILE_PRODUCT_GATE.knownTypes).toContain('dialog');
    expect(MOBILE_PRODUCT_GATE.knownTypes).toContain('bookingFlow');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTERACTIVE PATTERN REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interactive Pattern Registry — structure', () => {
  it('has at least 10 patterns', () => {
    expect(INTERACTIVE_PATTERN_COUNT).toBeGreaterThanOrEqual(10);
  });

  it('every pattern has required fields', () => {
    INTERACTIVE_PATTERN_RECIPES.forEach(p => {
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('purpose');
      expect(p).toHaveProperty('mobileSafe');
      expect(p).toHaveProperty('classification');
      expect(p).toHaveProperty('functionalRequirements');
      expect(p).toHaveProperty('testRequirements');
    });
  });

  it('all ids are unique', () => {
    const ids = INTERACTIVE_PATTERN_RECIPES.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all patterns are mobileSafe: true', () => {
    INTERACTIVE_PATTERN_RECIPES.forEach(p => {
      expect(p.mobileSafe).toBe(true);
    });
  });

  it('all patterns are classified as CORE_REUSABLE', () => {
    INTERACTIVE_PATTERN_RECIPES.forEach(p => {
      expect(p.classification).toBe('CORE_REUSABLE');
    });
  });
});

describe('Interactive Pattern Registry — lookups', () => {
  it('getInteractivePatternById returns correct recipe', () => {
    const recipe = getInteractivePatternById('booking-flow');
    expect(recipe).toBeTruthy();
    expect(recipe.id).toBe('booking-flow');
  });

  it('getInteractivePatternById returns null for unknown id', () => {
    expect(getInteractivePatternById('unknown-pattern-xyz')).toBeNull();
  });

  it('getInteractivePatternsByClassification returns CORE_REUSABLE set', () => {
    const core = getInteractivePatternsByClassification('CORE_REUSABLE');
    expect(core.length).toBeGreaterThan(0);
    core.forEach(p => expect(p.classification).toBe('CORE_REUSABLE'));
  });

  it('listInteractivePatternIds returns all ids', () => {
    const ids = listInteractivePatternIds();
    expect(ids).toContain('booking-flow');
    expect(ids).toContain('responsive-sidebar');
    expect(ids).toContain('role-switcher');
    expect(ids).toContain('error-boundary');
    expect(ids).toContain('reduced-motion-hook');
  });
});

describe('Interactive Pattern Registry — specific patterns', () => {
  it('booking-flow has 4 steps', () => {
    const recipe = getInteractivePatternById('booking-flow');
    expect(recipe.steps).toHaveLength(4);
    expect(recipe.steps[0]).toBe('service-selection');
    expect(recipe.steps[3]).toBe('success');
  });

  it('responsive-sidebar has correct mobile breakpoint', () => {
    const recipe = getInteractivePatternById('responsive-sidebar');
    expect(recipe.mobileBreakpoint).toBe(768);
  });

  it('role-switcher has mobile and desktop variants', () => {
    const recipe = getInteractivePatternById('role-switcher');
    expect(recipe.mobileVariant).toBe('select-dropdown');
    expect(recipe.desktopVariant).toBe('pill-buttons');
  });

  it('error-boundary uses class component implementation', () => {
    const recipe = getInteractivePatternById('error-boundary');
    expect(recipe.implementation).toMatch(/getDerivedStateFromError/);
  });

  it('reduced-motion-hook documents the anti-pattern', () => {
    const recipe = getInteractivePatternById('reduced-motion-hook');
    expect(recipe.antiPattern).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM V2 DEFAULT POLICY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Premium V2 Default Policy', () => {
  it('is enabled by default', () => {
    expect(PREMIUM_V2_DEFAULT_POLICY.enabled).toBe(true);
  });

  it('default intensity is medium', () => {
    expect(PREMIUM_V2_DEFAULT_POLICY.defaultIntensity).toBe('medium');
  });

  it('all four gates are required', () => {
    expect(PREMIUM_V2_DEFAULT_POLICY.gates.deadControlGate).toBe(true);
    expect(PREMIUM_V2_DEFAULT_POLICY.gates.functionalExperienceGate).toBe(true);
    expect(PREMIUM_V2_DEFAULT_POLICY.gates.mobileProductGate).toBe(true);
    expect(PREMIUM_V2_DEFAULT_POLICY.gates.accessibilityGate).toBe(true);
  });

  it('mobileAware is true', () => {
    expect(PREMIUM_V2_DEFAULT_POLICY.mobileAware).toBe(true);
  });

  it('error boundary is required', () => {
    expect(PREMIUM_V2_DEFAULT_POLICY.errorBoundaryRequired).toBe(true);
  });

  it('basic professional standard is 8.5/10', () => {
    expect(PREMIUM_V2_DEFAULT_POLICY.basicProfessionalStandard).toBe('8.5/10');
  });
});

describe('resolvePremiumV2Intensity', () => {
  it('fisioterapia default → medium', () => {
    expect(resolvePremiumV2Intensity('fisioterapia')).toBe('medium');
  });

  it('tech default → high', () => {
    expect(resolvePremiumV2Intensity('tech')).toBe('high');
  });

  it('abogados default → low', () => {
    expect(resolvePremiumV2Intensity('abogados')).toBe('low');
  });

  it('senior audience caps to low', () => {
    expect(resolvePremiumV2Intensity('tech', 'senior')).toBe('low');
  });

  it('mobile device caps high to medium', () => {
    expect(resolvePremiumV2Intensity('tech', 'general', true)).toBe('medium');
  });

  it('unknown sector defaults to medium', () => {
    expect(resolvePremiumV2Intensity('unknown-sector-xyz')).toBe('medium');
  });

  it('professional audience caps high to low', () => {
    expect(resolvePremiumV2Intensity('tech', 'professional')).toBe('low');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// AI ROUTER V2 — TIER 0 REGISTRY LOOKUP
// ═══════════════════════════════════════════════════════════════════════════════

describe('AI Router V2 — version', () => {
  it('version is 2.1.0', () => {
    expect(AI_ROUTER_V2_VERSION).toBe('2.1.0');
  });
});

describe('AI Router V2 — Tier 0 registry lookup', () => {
  const mockRegistry = { getInteractivePatternById };

  it('finds known pattern at Tier 0', () => {
    const result = lookupPatternRegistry('booking-flow', { _registry: mockRegistry });
    expect(result.found).toBe(true);
    expect(result.tier).toBe(0);
    expect(result.aiCallNeeded).toBe(false);
    expect(result.recipe).toBeTruthy();
  });

  it('misses unknown pattern → escalate to Tier 1', () => {
    const result = lookupPatternRegistry('unknown-pattern-xyz', { _registry: mockRegistry });
    expect(result.found).toBe(false);
    expect(result.tier).toBe(1);
  });

  it('returns fallback without registry injection', () => {
    const result = lookupPatternRegistry('booking-flow', {});
    expect(result.found).toBe(false);
    expect(result.reason).toMatch(/Registry not injected/);
  });
});

describe('AI Router V2 — routeRequest', () => {
  const mockRegistry = { getInteractivePatternById };

  it('routes known pattern to Tier 0', () => {
    const result = routeRequest({ patternId: 'responsive-sidebar' }, { _registry: mockRegistry });
    expect(result.tier).toBe(0);
    expect(result.aiCallNeeded).toBe(false);
  });

  it('routes unknown pattern to AI tier', () => {
    const result = routeRequest({ patternId: 'bespoke-custom-widget', manifest: {} }, { _registry: mockRegistry });
    expect(result.tier).toBeGreaterThan(0);
    expect(result.aiCallNeeded).toBe(true);
  });

  it('routes without patternId to AI tier selection', () => {
    const result = routeRequest({ manifest: { sections: ['hero', 'features'] } }, { _registry: mockRegistry });
    expect(result.aiCallNeeded).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// RECIPE REGISTRY INTEGRITY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Recipe Registry — backward compatibility', () => {
  it('all existing sections still present', () => {
    expect(RECIPE_REGISTRY).toHaveProperty('hero');
    expect(RECIPE_REGISTRY).toHaveProperty('features');
    expect(RECIPE_REGISTRY).toHaveProperty('socialProof');
    expect(RECIPE_REGISTRY).toHaveProperty('conversion');
    expect(RECIPE_REGISTRY).toHaveProperty('appShell');
    expect(RECIPE_REGISTRY).toHaveProperty('dashboard');
  });

  it('new interactivePatterns section added', () => {
    expect(RECIPE_REGISTRY).toHaveProperty('interactivePatterns');
    expect(RECIPE_REGISTRY.interactivePatterns.length).toBeGreaterThan(0);
  });

  it('total recipe count increased after Paso A', () => {
    expect(RECIPE_COUNT).toBeGreaterThan(40);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY VERSION & PASO A STATUS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Registry version and Paso A status', () => {
  it('registry version is 2.1.0', () => {
    expect(REGISTRY_VERSION).toBe('2.1.0');
  });

  it('PASO_A_STATUS is 100_PERCENT', () => {
    expect(PASO_A_STATUS).toBe('100_PERCENT');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY (existing verticals not broken)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Backward compatibility — existing vertical isolation', () => {
  it('gates have no side effects on recipe registry', () => {
    const appShellCount = RECIPE_REGISTRY.appShell.length;
    expect(appShellCount).toBeGreaterThan(0);
    // Running a gate does not mutate the registry
    auditDeadControls({ type: 'button', action: null });
    expect(RECIPE_REGISTRY.appShell.length).toBe(appShellCount);
  });

  it('Premium V2 policy does not affect existing vertical settings', () => {
    // The policy is additive — it only applies to new projects
    expect(PREMIUM_V2_DEFAULT_POLICY.enabled).toBe(true);
    // Existing demos are opt-in to migration
    expect(typeof resolvePremiumV2Intensity).toBe('function');
    // Function is pure — calling it with dental returns medium (no side effects)
    expect(resolvePremiumV2Intensity('dental')).toBe('medium');
  });

  it('all INTERACTIVE_PATTERN_RECIPES are CORE_REUSABLE (not vertical-specific)', () => {
    const nonCore = INTERACTIVE_PATTERN_RECIPES.filter(r => r.classification !== 'CORE_REUSABLE');
    expect(nonCore.length).toBe(0);
  });
});
