// Dead Control Detector — ADV-06
// Extends core/gates/deadControlGate.js for browser QA context.

import { DEAD_CONTROL_GATE_VERSION } from '../core/gates/deadControlGate.js';

export { DEAD_CONTROL_GATE_VERSION };

// Sentinel values considered "dead" — mirrors deadControlGate.js internal sets
export const DEAD_ACTION_VALUES = Object.freeze([
  '', 'todo', '#', 'javascript:void(0)', 'noop', 'NOOP', 'TBD', 'tbd', 'TODO', 'PLACEHOLDER',
]);

export const DEAD_HREF_VALUES = Object.freeze([
  '', '#', 'javascript:void(0)', 'javascript:;', '#todo', '#tbd', '#placeholder',
]);

export const DEAD_CONTROL_TYPE = Object.freeze({
  DEAD_BUTTON:  'DEAD_BUTTON',
  DEAD_LINK:    'DEAD_LINK',
  DEAD_INPUT:   'DEAD_INPUT',
  PLACEHOLDER_HREF: 'PLACEHOLDER_HREF',
  TODO_HANDLER: 'TODO_HANDLER',
  VOID_HANDLER: 'VOID_HANDLER',
});

export const CONTROL_SEVERITY = Object.freeze({
  BLOCKING:    'BLOCKING',
  WARNING:     'WARNING',
  INFO:        'INFO',
});

export function classifyDeadControl(element = {}) {
  const { tag, onclick, href, type, disabled, text = '' } = element;

  if (disabled) return null; // intentionally disabled, not dead

  if (tag === 'a') {
    if (href === '#') {
      return { type: DEAD_CONTROL_TYPE.PLACEHOLDER_HREF, severity: CONTROL_SEVERITY.WARNING, element };
    }
    if (!href || DEAD_HREF_VALUES.includes(href)) {
      return { type: DEAD_CONTROL_TYPE.DEAD_LINK, severity: CONTROL_SEVERITY.WARNING, element };
    }
  }

  if (tag === 'button' || type === 'submit') {
    if (!onclick && !element.hasEventListener) {
      return { type: DEAD_CONTROL_TYPE.DEAD_BUTTON, severity: CONTROL_SEVERITY.BLOCKING, element };
    }
    if (onclick && DEAD_ACTION_VALUES.includes(onclick)) {
      return { type: DEAD_CONTROL_TYPE.TODO_HANDLER, severity: CONTROL_SEVERITY.BLOCKING, element };
    }
  }

  if (text.toLowerCase().includes('todo') || text.toLowerCase().includes('placeholder')) {
    return { type: DEAD_CONTROL_TYPE.TODO_HANDLER, severity: CONTROL_SEVERITY.WARNING, element };
  }

  return null;
}

export function evaluateDeadControls(elements = [], policy = {}) {
  const { blockOnDeadButton = true, blockOnPlaceholder = false, maxWarnings = 3 } = policy;

  const dead = elements.map(e => classifyDeadControl(e)).filter(Boolean);
  const blocking = dead.filter(d => {
    if (d.severity === CONTROL_SEVERITY.BLOCKING) {
      if (d.type === DEAD_CONTROL_TYPE.DEAD_BUTTON && blockOnDeadButton) return true;
      if (d.type === DEAD_CONTROL_TYPE.PLACEHOLDER_HREF && blockOnPlaceholder) return true;
    }
    return false;
  });
  const warnings = dead.filter(d => d.severity === CONTROL_SEVERITY.WARNING);

  const status = blocking.length > 0              ? 'FAIL'
    : warnings.length > maxWarnings               ? 'WARN'
    : 'PASS';

  return Object.freeze({
    valid:        true,
    status,
    totalScanned: elements.length,
    deadCount:    dead.length,
    blockingCount:blocking.length,
    warningCount: warnings.length,
    dead,
    blocking,
    isReal:       false,
  });
}

export function buildElementSnapshot(elements = []) {
  return elements.map(el => ({
    tag:              el.tag ?? 'unknown',
    text:             (el.textContent ?? '').trim().slice(0, 80),
    href:             el.href ?? null,
    onclick:          el.onclick ?? null,
    disabled:         el.disabled ?? false,
    hasEventListener: el.hasEventListener ?? false,
    type:             el.type ?? null,
  }));
}

export const DEAD_CONTROL_DETECTOR_VERSION = '1.0.0';
