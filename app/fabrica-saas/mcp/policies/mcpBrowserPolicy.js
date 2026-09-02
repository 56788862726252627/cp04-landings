// MCP Browser Policy — ADV-12

export const BROWSER_ACTION = Object.freeze({
  NAVIGATE:     'NAVIGATE',
  CLICK:        'CLICK',
  FILL_FORM:    'FILL_FORM',
  SCREENSHOT:   'SCREENSHOT',
  EXTRACT_TEXT: 'EXTRACT_TEXT',
  SUBMIT_FORM:  'SUBMIT_FORM',
  DOWNLOAD:     'DOWNLOAD',
  EXECUTE_JS:   'EXECUTE_JS',
});

const BLOCKED_ACTIONS = new Set([BROWSER_ACTION.EXECUTE_JS, BROWSER_ACTION.DOWNLOAD]);
const SENSITIVE_ACTIONS = new Set([BROWSER_ACTION.FILL_FORM, BROWSER_ACTION.SUBMIT_FORM]);

export function checkBrowserAction(action, options = {}) {
  if (BLOCKED_ACTIONS.has(action) && !options.allowUnsafe) {
    return Object.freeze({ allowed: false, reason: 'UNSAFE_BROWSER_ACTION', action, isReal: false });
  }
  if (SENSITIVE_ACTIONS.has(action) && !options.approvedByHuman) {
    return Object.freeze({ allowed: false, reason: 'FORM_SUBMIT_REQUIRES_APPROVAL', action, isReal: false });
  }
  return Object.freeze({ allowed: true, action, isReal: false });
}

export const MCP_BROWSER_POLICY_VERSION = '1.0.0';
