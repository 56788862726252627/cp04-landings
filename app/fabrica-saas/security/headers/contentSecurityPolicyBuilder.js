// Content Security Policy Builder — ADV-19

const SAFE_DEFAULTS = Object.freeze({
  'default-src': ["'self'"],
  'script-src':  ["'self'"],
  'style-src':   ["'self'"],
  'img-src':     ["'self'", 'data:'],
  'font-src':    ["'self'"],
  'connect-src': ["'self'"],
  'frame-src':   ["'none'"],
  'object-src':  ["'none'"],
  'base-uri':    ["'self'"],
  'form-action': ["'self'"],
});

const UNSAFE_DIRECTIVES = new Set(["'unsafe-eval'", "'unsafe-inline'"]);

export function createContentSecurityPolicyBuilder(config = {}) {
  const {
    overrides = {},
    allowUnsafeEval = false,
    justification = '',
    clientId = null,
  } = config;

  const warnings = [];

  if (allowUnsafeEval && !justification) {
    warnings.push('UNSAFE_EVAL_WITHOUT_JUSTIFICATION');
  }

  const directives = {};
  for (const [key, defaults] of Object.entries(SAFE_DEFAULTS)) {
    const extra = overrides[key] ?? [];
    const combined = [...defaults, ...extra];

    const hasUnsafe = combined.some(v => UNSAFE_DIRECTIVES.has(v));
    if (hasUnsafe && !allowUnsafeEval) {
      warnings.push(`UNSAFE_DIRECTIVE_BLOCKED_IN:${key}`);
      directives[key] = combined.filter(v => !UNSAFE_DIRECTIVES.has(v));
    } else {
      directives[key] = combined;
    }
  }

  const policyString = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.join(' ')}`)
    .join('; ');

  return Object.freeze({
    clientId,
    directives: Object.freeze(directives),
    policyString,
    allowUnsafeEval,
    justification: allowUnsafeEval ? justification : null,
    warnings: Object.freeze([...warnings]),
    isReal: false,
  });
}

export const CSP_BUILDER_VERSION = '1.0.0';
