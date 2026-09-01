// Console Error Gate — ADV-06
// Classifies and gates browser console errors and warnings.

export const CONSOLE_LEVEL = Object.freeze({
  ERROR:   'ERROR',
  WARN:    'WARN',
  INFO:    'INFO',
  LOG:     'LOG',
  DEBUG:   'DEBUG',
});

export const CONSOLE_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  FAIL:    'FAIL',
  WARN:    'WARN',
});

export const CONSOLE_ERROR_CLASS = Object.freeze({
  FATAL_JS:     'FATAL_JS',
  UNHANDLED_PROMISE: 'UNHANDLED_PROMISE',
  MISSING_RESOURCE: 'MISSING_RESOURCE',
  CORS:         'CORS',
  DEPRECATION:  'DEPRECATION',
  REACT_WARNING:'REACT_WARNING',
  NETWORK_404:  'NETWORK_404',
  UNKNOWN:      'UNKNOWN',
});

const FATAL_PATTERNS = [
  /TypeError:/i, /ReferenceError:/i, /Uncaught/, /unhandledrejection/i,
  /Cannot read prop/i, /is not a function/i, /is not defined/i,
];
const CORS_PATTERNS   = [/CORS/i, /cross-origin/i, /blocked by CORS/i];
const DEPR_PATTERNS   = [/deprecated/i, /Warning:/i, /findDOMNode/i];
const NET404_PATTERNS = [/404/i, /net::ERR_/i, /Failed to load/i];
const REACT_PATTERNS  = [/Warning: Each child/i, /Warning: React/i, /Warning: validateDOMNesting/i];

export function classifyConsoleMessage(msg = '') {
  if (FATAL_PATTERNS.some(p => p.test(msg)))  return CONSOLE_ERROR_CLASS.FATAL_JS;
  if (/unhandledrejection/i.test(msg))         return CONSOLE_ERROR_CLASS.UNHANDLED_PROMISE;
  if (CORS_PATTERNS.some(p => p.test(msg)))    return CONSOLE_ERROR_CLASS.CORS;
  if (REACT_PATTERNS.some(p => p.test(msg)))   return CONSOLE_ERROR_CLASS.REACT_WARNING;
  if (DEPR_PATTERNS.some(p => p.test(msg)))    return CONSOLE_ERROR_CLASS.DEPRECATION;
  if (NET404_PATTERNS.some(p => p.test(msg)))  return CONSOLE_ERROR_CLASS.NETWORK_404;
  return CONSOLE_ERROR_CLASS.UNKNOWN;
}

export function evaluateConsoleErrors(messages = [], policy = {}) {
  const {
    blockOnFatalJs          = true,
    blockOnUnhandledPromise = true,
    blockOnCors             = false,
    maxErrors               = 0,
    maxWarnings             = 5,
  } = policy;

  const errors   = messages.filter(m => m.level === CONSOLE_LEVEL.ERROR);
  const warnings = messages.filter(m => m.level === CONSOLE_LEVEL.WARN);
  const classified = errors.map(m => ({ ...m, errorClass: classifyConsoleMessage(m.text) }));

  const blocking = classified.filter(m => {
    if (m.errorClass === CONSOLE_ERROR_CLASS.FATAL_JS     && blockOnFatalJs)          return true;
    if (m.errorClass === CONSOLE_ERROR_CLASS.UNHANDLED_PROMISE && blockOnUnhandledPromise) return true;
    if (m.errorClass === CONSOLE_ERROR_CLASS.CORS         && blockOnCors)             return true;
    return false;
  });

  let status = CONSOLE_GATE_STATUS.PASS;
  if (blocking.length > 0 || errors.length > maxErrors) status = CONSOLE_GATE_STATUS.FAIL;
  else if (warnings.length > maxWarnings)               status = CONSOLE_GATE_STATUS.WARN;

  return Object.freeze({
    valid:          true,
    status,
    errorCount:     errors.length,
    warningCount:   warnings.length,
    blockingCount:  blocking.length,
    classified,
    blocking,
    isReal:         false,
  });
}

export function createConsoleCollector() {
  const collected = [];
  return {
    add(level, text, url = '') {
      collected.push({ level, text, url, at: new Date().toISOString() });
    },
    getAll()  { return [...collected]; },
    getErrors() { return collected.filter(m => m.level === CONSOLE_LEVEL.ERROR); },
    clear()   { collected.length = 0; },
    count:    () => collected.length,
  };
}

export const CONSOLE_ERROR_GATE_VERSION = '1.0.0';
