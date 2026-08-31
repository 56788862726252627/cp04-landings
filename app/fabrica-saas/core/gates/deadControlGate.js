/**
 * Factory Dead Control Gate
 * Detects dead buttons, empty links, no-op CTAs, and unhandled interactions
 * in component specs before a demo reaches QA or deployment.
 *
 * Rule: DEAD_CONTROLS > 0 → gate FAIL
 * Exception: elements marked { placeholder: true } are explicitly exempted.
 *
 * Works on JSON component specs — no DOM, no browser required.
 */

export const DEAD_CONTROL_GATE_VERSION = '1.0.0';

// ─── Sentinel values considered "dead" ───────────────────────────────────────

const DEAD_ACTION_VALUES = new Set([
  null, undefined, '', 'todo', '#', 'javascript:void(0)',
  'noop', 'NOOP', 'TBD', 'tbd', 'TODO', 'PLACEHOLDER',
]);

const DEAD_HREF_VALUES = new Set([
  null, undefined, '', '#', 'javascript:void(0)', 'javascript:;',
  '#todo', '#tbd', '#placeholder',
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isDeadAction(action) {
  return DEAD_ACTION_VALUES.has(action) ||
    (typeof action === 'string' && action.trim().length === 0);
}

function isDeadHref(href) {
  return DEAD_HREF_VALUES.has(href) ||
    (typeof href === 'string' && href.trim().length === 0);
}

function isExplicitPlaceholder(element) {
  return element.placeholder === true;
}

// ─── Auditors per element type ────────────────────────────────────────────────

function auditButton(btn, path) {
  if (isExplicitPlaceholder(btn)) return null;
  if (isDeadAction(btn.action) && isDeadAction(btn.onClick) && isDeadAction(btn.handler)) {
    return {
      type: 'DEAD_BUTTON',
      path,
      id: btn.id ?? '(no-id)',
      label: btn.label ?? btn.text ?? '(no-label)',
      reason: 'Button has no action, onClick, or handler',
      severity: 'error',
    };
  }
  return null;
}

function auditLink(link, path) {
  if (isExplicitPlaceholder(link)) return null;
  if (isDeadHref(link.href) && isDeadAction(link.onClick)) {
    return {
      type: 'DEAD_LINK',
      path,
      id: link.id ?? '(no-id)',
      label: link.label ?? link.text ?? link.href ?? '(no-label)',
      reason: 'Link has empty href and no onClick handler',
      severity: 'error',
    };
  }
  return null;
}

function auditCta(cta, path) {
  if (isExplicitPlaceholder(cta)) return null;
  const hasAction = !isDeadAction(cta.action) ||
    !isDeadAction(cta.onClick) ||
    !isDeadHref(cta.href);
  if (!hasAction) {
    return {
      type: 'DEAD_CTA',
      path,
      id: cta.id ?? '(no-id)',
      label: cta.label ?? cta.text ?? '(no-label)',
      reason: 'CTA has no href, action, or onClick',
      severity: 'error',
    };
  }
  return null;
}

function auditTab(tab, path) {
  if (isExplicitPlaceholder(tab)) return null;
  if (isDeadAction(tab.action) && isDeadAction(tab.onClick) && tab.content === undefined && tab.panel === undefined) {
    return {
      type: 'DEAD_TAB',
      path,
      id: tab.id ?? '(no-id)',
      label: tab.label ?? '(no-label)',
      reason: 'Tab has no action and no panel content defined',
      severity: 'warning',
    };
  }
  return null;
}

function auditQuickAction(qa, path) {
  if (isExplicitPlaceholder(qa)) return null;
  if (isDeadAction(qa.action) && isDeadAction(qa.onClick) && isDeadAction(qa.navigate)) {
    return {
      type: 'DEAD_QUICK_ACTION',
      path,
      id: qa.id ?? '(no-id)',
      label: qa.label ?? '(no-label)',
      reason: 'Quick action has no handler, navigate, or action',
      severity: 'error',
    };
  }
  return null;
}

function auditForm(form, path) {
  if (isExplicitPlaceholder(form)) return null;
  const issues = [];
  if (isDeadAction(form.onSubmit) && isDeadAction(form.action) && isDeadAction(form.submitHandler)) {
    issues.push({
      type: 'DEAD_FORM_SUBMIT',
      path,
      id: form.id ?? '(no-id)',
      reason: 'Form has no onSubmit, action URL, or submitHandler',
      severity: 'error',
    });
  }
  return issues;
}

// ─── Spec walker ─────────────────────────────────────────────────────────────

function walkSpec(spec, path = 'root', issues = []) {
  if (!spec || typeof spec !== 'object') return issues;

  // Detect element type and audit
  const type = spec.type ?? spec.elementType;

  if (type === 'button' || spec._isButton) {
    const issue = auditButton(spec, path);
    if (issue) issues.push(issue);
  } else if (type === 'link' || spec._isLink) {
    const issue = auditLink(spec, path);
    if (issue) issues.push(issue);
  } else if (type === 'cta' || spec._isCta) {
    const issue = auditCta(spec, path);
    if (issue) issues.push(issue);
  } else if (type === 'tab' || spec._isTab) {
    const issue = auditTab(spec, path);
    if (issue) issues.push(issue);
  } else if (type === 'quick-action' || spec._isQuickAction) {
    const issue = auditQuickAction(spec, path);
    if (issue) issues.push(issue);
  } else if (type === 'form' || spec._isForm) {
    const formIssues = auditForm(spec, path);
    issues.push(...formIssues);
  }

  // Recurse into arrays
  for (const [key, val] of Object.entries(spec)) {
    if (key.startsWith('_') || key === 'type' || key === 'elementType') continue;
    if (Array.isArray(val)) {
      val.forEach((item, i) => walkSpec(item, `${path}.${key}[${i}]`, issues));
    } else if (val && typeof val === 'object') {
      walkSpec(val, `${path}.${key}`, issues);
    }
  }

  return issues;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Audit a component spec for dead controls.
 *
 * @param {Object} spec - Component spec object (JSON-serializable)
 * @param {Object} [options]
 * @param {boolean} [options.strict=true] - Treat warnings as failures
 * @returns {{ pass: boolean, issues: Array, counts: Object }}
 */
export function auditDeadControls(spec, options = {}) {
  const { strict = true } = options;
  const issues = walkSpec(spec);
  const errors   = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const pass = strict
    ? issues.length === 0
    : errors.length === 0;

  return {
    pass,
    issues,
    counts: { total: issues.length, errors: errors.length, warnings: warnings.length },
    summary: pass
      ? 'PASS — No dead controls detected'
      : `FAIL — ${errors.length} error(s), ${warnings.length} warning(s)`,
  };
}

/**
 * Audit an array of component specs (e.g., all sections in a page).
 *
 * @param {Array<Object>} specs
 * @param {Object} [options]
 * @returns {{ pass: boolean, issues: Array, perSpec: Array, counts: Object }}
 */
export function auditDeadControlsMulti(specs, options = {}) {
  const perSpec = specs.map((spec, i) => ({
    index: i,
    id: spec.id ?? `spec-${i}`,
    ...auditDeadControls(spec, options),
  }));
  const allIssues = perSpec.flatMap(r => r.issues);
  const errors    = allIssues.filter(i => i.severity === 'error');
  const warnings  = allIssues.filter(i => i.severity === 'warning');
  const pass = perSpec.every(r => r.pass);
  return {
    pass,
    issues: allIssues,
    perSpec,
    counts: { total: allIssues.length, errors: errors.length, warnings: warnings.length },
    summary: pass
      ? `PASS — All ${specs.length} specs clean`
      : `FAIL — ${errors.length} dead control(s) across ${specs.length} specs`,
  };
}

/**
 * Shortcut: check if a single button spec is live.
 */
export function isButtonLive(btn) {
  return !isDeadAction(btn?.action) ||
    !isDeadAction(btn?.onClick) ||
    !isDeadAction(btn?.handler);
}

/**
 * Shortcut: check if a CTA spec is live.
 */
export function isCtaLive(cta) {
  return !isDeadAction(cta?.action) ||
    !isDeadAction(cta?.onClick) ||
    !isDeadHref(cta?.href);
}

/**
 * Generate a minimal passing button spec.
 */
export function makeButtonSpec(id, label, action) {
  return { type: 'button', id, label, action };
}

/**
 * Generate an explicit placeholder spec (excluded from dead control checks).
 */
export function makePlaceholderSpec(id, label) {
  return { type: 'button', id, label, action: null, placeholder: true };
}

export const DEAD_CONTROL_GATE = Object.freeze({
  version: DEAD_CONTROL_GATE_VERSION,
  audit: auditDeadControls,
  auditMulti: auditDeadControlsMulti,
  isButtonLive,
  isCtaLive,
  makeButtonSpec,
  makePlaceholderSpec,
});
