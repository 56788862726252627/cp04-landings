// Secret Safety Gate — PASO G
// Declarative detection of secret patterns. No real secrets printed.

export const SECRET_RISK_LEVELS = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
});

export const SECRET_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
});

const SECRET_PATTERNS = [
  {
    id: 'SP-01',
    name: 'Bearer token',
    pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'AUTH_TOKEN',
    actionRequired: 'Remove token and rotate immediately',
  },
  {
    id: 'SP-02',
    name: 'API key assignment',
    pattern: /(?:apiKey|api_key|apikey)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'API_KEY',
    actionRequired: 'Remove API key value and use environment variable',
  },
  {
    id: 'SP-03',
    name: 'OpenAI key',
    pattern: /sk-[A-Za-z0-9]{32,}/,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'AI_API_KEY',
    actionRequired: 'Revoke and rotate OpenAI key immediately',
  },
  {
    id: 'SP-04',
    name: 'Stripe secret key',
    pattern: /sk_(?:live|test)_[A-Za-z0-9]{24,}/,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'PAYMENT_KEY',
    actionRequired: 'Revoke Stripe secret key immediately',
  },
  {
    id: 'SP-05',
    name: 'Supabase service key',
    pattern: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'JWT_TOKEN',
    actionRequired: 'Remove JWT and use environment variable',
  },
  {
    id: 'SP-06',
    name: 'Private webhook URL',
    pattern: /hook\.make\.com\/[A-Za-z0-9]{16,}/,
    risk: SECRET_RISK_LEVELS.HIGH,
    secretType: 'WEBHOOK_URL',
    actionRequired: 'Remove webhook URL from source code',
  },
  {
    id: 'SP-07',
    name: 'Password assignment',
    pattern: /(?:password|passwd|pwd)\s*[:=]\s*["'][^"']{4,}["']/i,
    risk: SECRET_RISK_LEVELS.HIGH,
    secretType: 'PASSWORD',
    actionRequired: 'Remove hardcoded password',
  },
  {
    id: 'SP-08',
    name: 'Authorization header value',
    pattern: /Authorization.*:\s*["'](?:Bearer|Basic)\s+[A-Za-z0-9+/=]{16,}/i,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'AUTH_HEADER',
    actionRequired: 'Remove authorization header value from code',
  },
  {
    id: 'SP-09',
    name: 'Private key block',
    pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
    risk: SECRET_RISK_LEVELS.CRITICAL,
    secretType: 'PRIVATE_KEY',
    actionRequired: 'Remove private key from codebase immediately',
  },
  {
    id: 'SP-10',
    name: 'Generic secret variable',
    pattern: /(?:secret|credential|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{12,}["']/i,
    risk: SECRET_RISK_LEVELS.MEDIUM,
    secretType: 'GENERIC_SECRET',
    actionRequired: 'Review and replace with environment variable reference',
  },
];

function redact(match) {
  if (!match || match.length < 4) return '[REDACTED]';
  return match.slice(0, 4) + '...[REDACTED]';
}

/**
 * Audit a code string for secret patterns.
 * @param {string} code — source code content
 * @param {string} filePath — for reporting
 */
export function auditCodeForSecrets(code = '', filePath = 'unknown') {
  if (typeof code !== 'string') return { valid: false, error: 'code must be string' };

  const findings = [];
  const lines = code.split('\n');

  for (const pattern of SECRET_PATTERNS) {
    lines.forEach((line, idx) => {
      if (pattern.pattern.test(line)) {
        const match = line.match(pattern.pattern)?.[0] ?? '';
        findings.push({
          file:           filePath,
          line:           idx + 1,
          region:         `line ${idx + 1}`,
          secretType:     pattern.secretType,
          patternId:      pattern.id,
          risk:           pattern.risk,
          redactedPreview: redact(match),
          actionRequired: pattern.actionRequired,
        });
      }
    });
  }

  const critical = findings.filter(f => f.risk === SECRET_RISK_LEVELS.CRITICAL);
  const high     = findings.filter(f => f.risk === SECRET_RISK_LEVELS.HIGH);

  const status = critical.length > 0 ? SECRET_GATE_STATUS.FAIL
    : high.length > 0                ? SECRET_GATE_STATUS.WARNING
    : SECRET_GATE_STATUS.PASS;

  return {
    valid:     true,
    filePath,
    status,
    findings:  findings.length,
    critical:  critical.length,
    high:      high.length,
    details:   findings,
    disclaimer: 'Secret scan is declarative pattern matching. Not a complete security audit.',
  };
}

/**
 * Audit multiple files (as { path, content } array).
 */
export function auditSecretSafety(files = []) {
  if (!Array.isArray(files)) return { valid: false, error: 'files must be array' };

  const results = files.map(f => auditCodeForSecrets(f.content ?? '', f.path ?? 'unknown'));
  const allFindings = results.flatMap(r => r.details ?? []);
  const criticalTotal = allFindings.filter(f => f.risk === SECRET_RISK_LEVELS.CRITICAL).length;
  const highTotal     = allFindings.filter(f => f.risk === SECRET_RISK_LEVELS.HIGH).length;

  const status = criticalTotal > 0 ? SECRET_GATE_STATUS.FAIL
    : highTotal > 0                ? SECRET_GATE_STATUS.WARNING
    : SECRET_GATE_STATUS.PASS;

  return {
    valid:          true,
    status,
    filesScanned:   files.length,
    totalFindings:  allFindings.length,
    critical:       criticalTotal,
    high:           highTotal,
    fileResults:    results,
    disclaimer:     'No secret values are stored. Redacted previews only.',
  };
}

export const SECRET_SAFETY_VERSION = '1.0.0';
