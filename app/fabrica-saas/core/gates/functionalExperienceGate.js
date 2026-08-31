/**
 * Factory Functional Experience Gate
 * Validates that interactive patterns have proper functional contracts —
 * navigation, modals, drawers, filters, search, booking flows, success/error states.
 *
 * A component that renders but does not respond is a dead prototype, not a product.
 * This gate enforces minimum functional contracts per pattern type.
 */

export const FUNCTIONAL_GATE_VERSION = '1.0.0';

// ─── Pattern contracts ────────────────────────────────────────────────────────
// Each pattern defines what props/handlers MUST be present for it to be
// considered functionally complete.

const PATTERN_CONTRACTS = Object.freeze({
  navigation: {
    required: ['onNavigate'],
    description: 'Navigation must have an onNavigate handler',
    example: { onNavigate: '(viewId) => void' },
  },
  modal: {
    required: ['onOpen', 'onClose'],
    description: 'Modal must have open and close handlers',
    example: { onOpen: '() => void', onClose: '() => void' },
  },
  drawer: {
    required: ['onClose'],
    description: 'Drawer must have a close handler',
    example: { onClose: '() => void' },
  },
  roleSwitcher: {
    required: ['onRoleChange', 'roles'],
    description: 'Role switcher must handle role changes and list available roles',
    example: { onRoleChange: '(roleId) => void', roles: 'Array' },
  },
  filter: {
    required: ['onFilter', 'options'],
    description: 'Filter must have a handler and option definitions',
    example: { onFilter: '(value) => void', options: 'Array' },
  },
  search: {
    required: ['onSearch'],
    description: 'Search must have a search handler',
    example: { onSearch: '(query) => void' },
  },
  tabs: {
    required: ['onTabChange', 'tabs'],
    description: 'Tabs must have a change handler and tab definitions',
    example: { onTabChange: '(tabId) => void', tabs: 'Array' },
  },
  bookingFlow: {
    required: ['onComplete', 'steps'],
    description: 'Booking flow must have completion handler and step definitions',
    example: { onComplete: '(data) => void', steps: 'Array' },
  },
  successState: {
    required: ['message'],
    description: 'Success state must communicate the outcome',
    example: { message: 'string' },
  },
  errorState: {
    required: ['message', 'onRetry'],
    description: 'Error state must show message and offer retry',
    example: { message: 'string', onRetry: '() => void' },
  },
  emptyState: {
    required: ['message'],
    description: 'Empty state must communicate what is empty',
    example: { message: 'string' },
  },
  actionFeedback: {
    required: ['type'],
    description: 'Action feedback must have a type (success|error|info|warning)',
    example: { type: '"success" | "error" | "info" | "warning"' },
  },
  form: {
    required: ['onSubmit'],
    description: 'Form must have a submit handler',
    example: { onSubmit: '(data) => void' },
  },
  mobileNav: {
    required: ['onOpen', 'onClose', 'isOpen'],
    description: 'Mobile nav must control open/close state',
    example: { onOpen: '() => void', onClose: '() => void', isOpen: 'boolean' },
  },
});

// ─── Validation helpers ───────────────────────────────────────────────────────

function isFunctionDefined(val) {
  return val !== null && val !== undefined && val !== '' &&
    (typeof val === 'function' || typeof val === 'string');
}

function isArrayDefined(val) {
  return Array.isArray(val) && val.length > 0;
}

function isPropPresent(spec, field) {
  if (!(field in spec)) return false;
  const val = spec[field];
  if (field === 'isOpen') return typeof val === 'boolean';
  if (Array.isArray(val)) return val.length > 0;
  return isFunctionDefined(val);
}

// ─── Core validator ───────────────────────────────────────────────────────────

/**
 * Validate a component spec against a named pattern contract.
 *
 * @param {string} pattern - One of the PATTERN_CONTRACTS keys
 * @param {Object} spec - Component spec with handlers/props defined
 * @returns {{ pass: boolean, missing: string[], contract: Object, pattern: string }}
 */
export function validatePattern(pattern, spec = {}) {
  const contract = PATTERN_CONTRACTS[pattern];
  if (!contract) {
    return {
      pass: false,
      pattern,
      missing: [],
      contract: null,
      error: `Unknown pattern: "${pattern}". Known: ${Object.keys(PATTERN_CONTRACTS).join(', ')}`,
    };
  }

  const missing = contract.required.filter(field => !isPropPresent(spec, field));
  const pass = missing.length === 0;

  return {
    pass,
    pattern,
    missing,
    contract,
    summary: pass
      ? `PASS — ${pattern} spec is functionally complete`
      : `FAIL — ${pattern} spec missing: [${missing.join(', ')}]`,
  };
}

/**
 * Validate multiple patterns in a single page/component audit.
 *
 * @param {Array<{ pattern: string, spec: Object, id?: string }>} entries
 * @returns {{ pass: boolean, results: Array, counts: Object }}
 */
export function auditFunctionalExperience(entries = []) {
  const results = entries.map(({ pattern, spec, id }) => ({
    id: id ?? pattern,
    ...validatePattern(pattern, spec),
  }));

  const failed = results.filter(r => !r.pass);
  const pass = failed.length === 0;

  return {
    pass,
    results,
    counts: { total: results.length, passed: results.length - failed.length, failed: failed.length },
    summary: pass
      ? `PASS — All ${results.length} patterns functionally complete`
      : `FAIL — ${failed.length}/${results.length} patterns missing required handlers`,
  };
}

/**
 * List all known functional patterns.
 */
export function listPatterns() {
  return Object.entries(PATTERN_CONTRACTS).map(([id, contract]) => ({
    id,
    required: contract.required,
    description: contract.description,
    example: contract.example,
  }));
}

/**
 * Check if a demo page spec meets functional baseline requirements.
 * A demo page must have at minimum: navigation + at least one CTA pattern.
 */
export function auditDemoPage(pageSpec = {}) {
  const patterns = pageSpec.patterns ?? [];
  const missing = [];

  const hasNav = patterns.some(p => p.pattern === 'navigation');
  if (!hasNav && !pageSpec.noNavigation) {
    missing.push('navigation pattern required');
  }

  const hasAtLeastOneCta = patterns.some(p =>
    ['bookingFlow', 'modal', 'form'].includes(p.pattern)
  );
  if (!hasAtLeastOneCta && !pageSpec.noCtaRequired) {
    missing.push('at least one CTA pattern required (bookingFlow | modal | form)');
  }

  const validations = patterns.map(p => validatePattern(p.pattern, p.spec));
  const invalidPatterns = validations.filter(v => !v.pass);

  const allIssues = [...missing, ...invalidPatterns.map(v => v.summary)];
  const pass = allIssues.length === 0;

  return {
    pass,
    missing,
    invalidPatterns,
    validations,
    summary: pass
      ? 'PASS — Demo page meets functional baseline'
      : `FAIL — ${allIssues.length} functional requirement(s) unmet`,
  };
}

export const FUNCTIONAL_EXPERIENCE_GATE = Object.freeze({
  version: FUNCTIONAL_GATE_VERSION,
  validate: validatePattern,
  audit: auditFunctionalExperience,
  auditDemoPage,
  listPatterns,
  patterns: Object.keys(PATTERN_CONTRACTS),
  contracts: PATTERN_CONTRACTS,
});
