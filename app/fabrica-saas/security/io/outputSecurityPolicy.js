// Output Security Policy — ADV-19

const SECRET_LEAK_PATTERNS = [
  /api[_-]?key\s*[:=]\s*['"]?[\w-]{10,}/i,
  /bearer\s+[a-z0-9._-]{10,}/i,
  /-----BEGIN .{1,20} PRIVATE KEY-----/,
  /sk_(live|test)_[a-z0-9]{10,}/i,
  /password\s*[:=]\s*['"]?[^\s'"]{6,}/i,
];

const PII_PATTERNS = [
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, type: 'EMAIL' },
  { pattern: /\b\d{9,}\b/, type: 'NUMERIC_IDENTIFIER' },
];

const UNSAFE_HTML_PATTERNS = [
  /<script[\s>]/i,
  /javascript:/i,
  /on\w+\s*=/i,
];

export function createOutputSecurityPolicy(config = {}) {
  const {
    redactSecrets = true,
    redactPII = false,
    encodeHtml = true,
    clientId = null,
  } = config;

  function inspect(output) {
    const issues = [];
    const str = typeof output === 'string' ? output : JSON.stringify(output ?? '');

    if (redactSecrets) {
      for (const pattern of SECRET_LEAK_PATTERNS) {
        if (pattern.test(str)) {
          issues.push({ issue: 'SECRET_LEAKAGE_DETECTED', severity: 'CRITICAL' });
          break;
        }
      }
    }

    if (redactPII) {
      for (const { pattern, type } of PII_PATTERNS) {
        if (pattern.test(str)) {
          issues.push({ issue: `PII_LEAKAGE:${type}`, severity: 'HIGH' });
        }
      }
    }

    if (encodeHtml) {
      for (const pattern of UNSAFE_HTML_PATTERNS) {
        if (pattern.test(str)) {
          issues.push({ issue: 'UNSAFE_HTML_IN_OUTPUT', severity: 'HIGH' });
          break;
        }
      }
    }

    return Object.freeze({
      safe: issues.length === 0,
      issues: Object.freeze(issues),
      isReal: false,
    });
  }

  return Object.freeze({ clientId, redactSecrets, redactPII, encodeHtml, inspect, isReal: false });
}

export const OUTPUT_SECURITY_VERSION = '1.0.0';
