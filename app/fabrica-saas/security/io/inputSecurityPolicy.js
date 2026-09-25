// Input Security Policy — ADV-19

const INJECTION_PATTERNS = [
  { pattern: /<script[\s>]/i,          type: 'XSS_SCRIPT_TAG' },
  { pattern: /javascript:/i,           type: 'XSS_JAVASCRIPT_URI' },
  { pattern: /on\w+\s*=/i,            type: 'XSS_EVENT_HANDLER' },
  { pattern: /'\s*OR\s+'1'\s*=\s*'1/i,type: 'SQL_INJECTION' },
  { pattern: /;\s*DROP\s+TABLE/i,      type: 'SQL_DROP' },
  { pattern: /\.\.\//,                 type: 'PATH_TRAVERSAL' },
  { pattern: /\$\{.*\}/,              type: 'TEMPLATE_INJECTION' },
  { pattern: /\{\{.*\}\}/,            type: 'TEMPLATE_INJECTION' },
];

// eslint-disable-next-line no-control-regex
const UNSAFE_FILENAME_PATTERN = /[<>:"|?*\x00-\x1f]|\.\.|\.(php|exe|sh|bat|cmd|ps1)$/i;
const MAX_INPUT_LENGTH = 10000;

export function createInputSecurityPolicy(config = {}) {
  const {
    maxLength = MAX_INPUT_LENGTH,
    allowHtml = false,
    allowedTypes = ['string', 'number', 'boolean'],
    clientId = null,
  } = config;

  function validate(input, label = 'input') {
    const findings = [];

    if (typeof input === 'string') {
      if (input.length > maxLength) {
        findings.push({ field: label, issue: 'INPUT_TOO_LARGE', severity: 'HIGH' });
      }
      for (const { pattern, type } of INJECTION_PATTERNS) {
        if (pattern.test(input)) {
          findings.push({ field: label, issue: type, severity: 'CRITICAL' });
        }
      }
    }

    if (!allowedTypes.includes(typeof input)) {
      findings.push({ field: label, issue: 'INVALID_TYPE', severity: 'MEDIUM' });
    }

    return Object.freeze({
      field: label,
      safe: findings.length === 0,
      findings: Object.freeze(findings),
      isReal: false,
    });
  }

  function validateFilename(filename) {
    const unsafe = UNSAFE_FILENAME_PATTERN.test(filename);
    return Object.freeze({
      filename,
      safe: !unsafe,
      issue: unsafe ? 'UNSAFE_FILENAME' : null,
      isReal: false,
    });
  }

  return Object.freeze({ clientId, maxLength, allowHtml, validate, validateFilename, isReal: false });
}

export const INPUT_SECURITY_VERSION = '1.0.0';
