/**
 * Factory Mobile Product Gate
 * Validates that component specs meet mobile product requirements.
 * Desktop-only UX is not acceptable for a professional SaaS product.
 *
 * Breakpoints: mobile=390, tablet=768, desktop=1440
 * Touch targets: minimum 44×44px (WCAG 2.5.5 / Apple HIG / Material)
 * Overlay patterns: sidebar, dialogs, and modals must have overlay + close gesture
 */

export const MOBILE_GATE_VERSION = '1.0.0';

// ─── Constants ────────────────────────────────────────────────────────────────

export const BREAKPOINTS = Object.freeze({
  mobile:  390,
  tablet:  768,
  desktop: 1440,
});

export const MIN_TOUCH_TARGET = 44; // px, WCAG 2.5.5

// ─── Component mobile specs ───────────────────────────────────────────────────

const MOBILE_REQUIREMENTS = Object.freeze({
  sidebar: {
    requirements: [
      { id: 'hamburger', description: 'Must have a hamburger/menu trigger on mobile (<768px)', field: 'mobileHamburger' },
      { id: 'overlay', description: 'Must render as overlay (not inline) on mobile', field: 'mobileOverlay' },
      { id: 'close', description: 'Must have a close gesture (tap backdrop or X button)', field: 'onClose' },
    ],
  },
  dialog: {
    requirements: [
      { id: 'full-width-mobile', description: 'Must use full-width or near-full-width on mobile', field: 'mobileFullWidth' },
      { id: 'close-button', description: 'Must have a visible close button', field: 'onClose' },
      { id: 'scroll', description: 'Content must be scrollable when taller than viewport', field: 'scrollable' },
    ],
  },
  roleSwitcher: {
    requirements: [
      { id: 'mobile-compact', description: 'Must have a compact representation on mobile (select or icon-only)', field: 'mobileCompact' },
    ],
  },
  navigation: {
    requirements: [
      { id: 'mobile-pattern', description: 'Must specify mobile navigation pattern', field: 'mobilePattern' },
      { id: 'touch-targets', description: 'Nav items must meet 44px minimum touch target', field: 'touchTargetHeight' },
    ],
  },
  form: {
    requirements: [
      { id: 'full-width-inputs', description: 'Inputs must be full-width on mobile', field: 'mobileFullWidthInputs' },
      { id: 'touch-targets', description: 'Buttons must meet 44px minimum touch target', field: 'buttonHeight' },
    ],
  },
  bookingFlow: {
    requirements: [
      { id: 'stacked-steps', description: 'Steps must stack vertically on mobile', field: 'mobileStacked' },
      { id: 'scrollable', description: 'Each step must be independently scrollable', field: 'scrollable' },
    ],
  },
  table: {
    requirements: [
      { id: 'horizontal-scroll', description: 'Table must horizontally scroll on mobile, not overflow', field: 'horizontalScroll' },
    ],
  },
  chart: {
    requirements: [
      { id: 'responsive-height', description: 'Chart must reduce height on mobile', field: 'mobileHeight' },
    ],
  },
  card: {
    requirements: [
      { id: 'full-width', description: 'Cards must be full-width or single-column on mobile', field: 'mobileFullWidth' },
    ],
  },
});

const KNOWN_COMPONENT_TYPES = new Set(Object.keys(MOBILE_REQUIREMENTS));

// ─── Validators ───────────────────────────────────────────────────────────────

function checkTouchTarget(px, label = 'element') {
  if (typeof px !== 'number') return null;
  if (px < MIN_TOUCH_TARGET) {
    return {
      type: 'TOUCH_TARGET_TOO_SMALL',
      label,
      actual: px,
      required: MIN_TOUCH_TARGET,
      severity: 'warning',
      message: `${label} is ${px}px — below 44px minimum touch target`,
    };
  }
  return null;
}

/**
 * Validate a single component spec for mobile compliance.
 *
 * @param {string} componentType - e.g., 'sidebar', 'dialog', 'navigation'
 * @param {Object} spec - Component spec object
 * @returns {{ pass: boolean, componentType: string, issues: Array }}
 */
export function validateMobileComponent(componentType, spec = {}) {
  const requirements = MOBILE_REQUIREMENTS[componentType];
  if (!requirements) {
    return {
      pass: true,
      componentType,
      issues: [],
      warning: `No mobile requirements defined for "${componentType}" — skipping`,
    };
  }

  const issues = [];

  // Check declared requirements
  requirements.requirements.forEach(req => {
    const val = spec[req.field];
    if (val === null || val === undefined || val === false) {
      issues.push({
        type: 'MOBILE_REQUIREMENT_MISSING',
        id: req.id,
        field: req.field,
        description: req.description,
        severity: 'error',
      });
    }
  });

  // Check touch targets if provided
  const touchIssue = checkTouchTarget(spec.touchTargetHeight, 'nav item');
  if (touchIssue) issues.push(touchIssue);

  const btnIssue = checkTouchTarget(spec.buttonHeight, 'button');
  if (btnIssue) issues.push(btnIssue);

  const pass = issues.filter(i => i.severity === 'error').length === 0;

  return {
    pass,
    componentType,
    issues,
    summary: pass
      ? `PASS — ${componentType} is mobile-ready`
      : `FAIL — ${componentType} has ${issues.length} mobile issue(s)`,
  };
}

/**
 * Audit a complete page for mobile product compliance.
 * Checks that no viewport produces a broken layout.
 *
 * @param {Object} pageSpec - { components: Array<{type, spec}>, breakpointBehavior? }
 * @returns {{ pass: boolean, results: Array, viewportIssues: Object, counts: Object }}
 */
export function auditMobileProduct(pageSpec = {}) {
  const components = pageSpec.components ?? [];
  const results = components.map(({ type, spec, id }) =>
    ({ id: id ?? type, ...validateMobileComponent(type, spec) })
  );

  // Viewport-level checks
  const viewportIssues = {};
  const bp = pageSpec.breakpointBehavior ?? {};

  [390, 768, 1440].forEach(width => {
    const label = width <= 390 ? 'mobile' : width <= 768 ? 'tablet' : 'desktop';
    const issues = [];

    // Sidebar must be overlay on mobile/tablet
    const hasSidebar = components.some(c => c.type === 'sidebar');
    if (hasSidebar && width <= 768) {
      const sidebarSpec = components.find(c => c.type === 'sidebar')?.spec ?? {};
      if (!sidebarSpec.mobileOverlay) {
        issues.push({
          type: 'SIDEBAR_NOT_OVERLAY',
          viewport: width,
          message: `At ${width}px: sidebar must be overlay, not inline`,
          severity: 'error',
        });
      }
    }

    // At 390px, minimum breakpoint coverage is required
    if (width === 390 && bp.mobile === undefined && bp['390'] === undefined) {
      if (!pageSpec.mobileAware) {
        issues.push({
          type: 'NO_MOBILE_BREAKPOINT',
          viewport: 390,
          message: 'No mobile (390px) breakpoint behavior declared — desktop-only risk',
          severity: 'warning',
        });
      }
    }

    viewportIssues[label] = issues;
  });

  const allIssues = [
    ...results.flatMap(r => r.issues),
    ...Object.values(viewportIssues).flat(),
  ];
  const errors = allIssues.filter(i => i.severity === 'error');
  const pass = errors.length === 0;

  return {
    pass,
    results,
    viewportIssues,
    counts: {
      total: allIssues.length,
      errors: errors.length,
      warnings: allIssues.length - errors.length,
    },
    summary: pass
      ? 'PASS — Page is mobile-product ready'
      : `FAIL — ${errors.length} mobile error(s) detected`,
  };
}

/**
 * Validate touch targets across a set of interactive element sizes.
 * @param {Array<{label: string, height: number}>} elements
 */
export function auditTouchTargets(elements = []) {
  const issues = elements
    .map(e => checkTouchTarget(e.height, e.label))
    .filter(Boolean);
  const pass = issues.length === 0;
  return {
    pass,
    issues,
    summary: pass
      ? `PASS — All ${elements.length} touch targets meet 44px minimum`
      : `FAIL — ${issues.length} touch target(s) below 44px`,
  };
}

/**
 * Generate a minimal mobile-compliant sidebar spec.
 */
export function makeMobileSidebarSpec() {
  return {
    type: 'sidebar',
    mobileHamburger: true,
    mobileOverlay: true,
    onClose: 'closeSidebar',
    collapsible: true,
    touchTargetHeight: 44,
  };
}

/**
 * Generate a minimal mobile-compliant dialog spec.
 */
export function makeMobileDialogSpec() {
  return {
    type: 'dialog',
    mobileFullWidth: true,
    onClose: 'closeDialog',
    scrollable: true,
  };
}

export const MOBILE_PRODUCT_GATE = Object.freeze({
  version: MOBILE_GATE_VERSION,
  breakpoints: BREAKPOINTS,
  minTouchTarget: MIN_TOUCH_TARGET,
  validate: validateMobileComponent,
  audit: auditMobileProduct,
  auditTouchTargets,
  makeMobileSidebarSpec,
  makeMobileDialogSpec,
  knownTypes: [...KNOWN_COMPONENT_TYPES],
});
