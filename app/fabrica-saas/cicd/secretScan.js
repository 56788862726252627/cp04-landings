// Secret Scan — ADV-02 CI/CD Automatizado
// REUSE: patrón de deploy/secretSafetyGate.js — adaptado para CI pipeline.
// Nunca imprime valores. Solo: file, region, type, risk, redactedPreview.

export const SECRET_RISK = Object.freeze({
  CRITICAL: 'CRITICAL',
  HIGH:     'HIGH',
  MEDIUM:   'MEDIUM',
  LOW:      'LOW',
});

export const SECRET_TYPE = Object.freeze({
  STRIPE_LIVE_KEY:     'STRIPE_LIVE_KEY',
  STRIPE_TEST_KEY:     'STRIPE_TEST_KEY',
  STRIPE_WEBHOOK:      'STRIPE_WEBHOOK',
  JWT:                 'JWT',
  API_KEY:             'API_KEY',
  BEARER_TOKEN:        'BEARER_TOKEN',
  PASSWORD_LITERAL:    'PASSWORD_LITERAL',
  GENERIC_TOKEN:       'GENERIC_TOKEN',
  DOTENV_SECRET:       'DOTENV_SECRET',
  PRIVATE_KEY:         'PRIVATE_KEY',
});

const SECRET_PATTERNS = [
  { type: SECRET_TYPE.STRIPE_LIVE_KEY,   risk: SECRET_RISK.CRITICAL, pattern: /sk_live_[A-Za-z0-9]{20,}/ },
  { type: SECRET_TYPE.STRIPE_WEBHOOK,    risk: SECRET_RISK.CRITICAL, pattern: /whsec_[A-Za-z0-9]{20,}/ },
  { type: SECRET_TYPE.PRIVATE_KEY,       risk: SECRET_RISK.CRITICAL, pattern: /-----BEGIN (RSA |EC )?PRIVATE KEY-----/ },
  { type: SECRET_TYPE.STRIPE_TEST_KEY,   risk: SECRET_RISK.HIGH,     pattern: /sk_test_[A-Za-z0-9]{20,}/ },
  { type: SECRET_TYPE.JWT,               risk: SECRET_RISK.HIGH,     pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/ },
  { type: SECRET_TYPE.BEARER_TOKEN,      risk: SECRET_RISK.HIGH,     pattern: /Bearer\s+[A-Za-z0-9_.-]{32,}/ },
  { type: SECRET_TYPE.API_KEY,           risk: SECRET_RISK.MEDIUM,   pattern: /api[_-]?key\s*[:=]\s*["']?[A-Za-z0-9_.-]{16,}["']?/i },
  { type: SECRET_TYPE.PASSWORD_LITERAL,  risk: SECRET_RISK.MEDIUM,   pattern: /password\s*[:=]\s*["'][^"']{6,}["']/i },
  { type: SECRET_TYPE.DOTENV_SECRET,     risk: SECRET_RISK.MEDIUM,   pattern: /^(SECRET|TOKEN|API_KEY|PASSWORD|AUTH)_?\w*\s*=\s*\S{8,}/m },
  { type: SECRET_TYPE.GENERIC_TOKEN,     risk: SECRET_RISK.LOW,      pattern: /[A-Za-z0-9_.-]{40,}/ },
];

const EXCLUDED_EXTENSIONS = new Set(['.md', '.yaml', '.yml', '.json', '.lock', '.png', '.jpg', '.ico', '.svg', '.woff', '.woff2']);
const TEST_FILE_PATTERN = /test\.|\.test\.|fixture|scenario/i;

function redactPreview(match, type) {
  const s = String(match).slice(0, 6);
  return `${s}...[REDACTED:${type}]`;
}

/**
 * Scan text content for secrets.
 * Returns findings without printing actual secret values.
 */
export function scanTextForSecrets(content, filePath = '<unknown>') {
  const isTestFile = TEST_FILE_PATTERN.test(filePath);
  const findings = [];

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const { type, risk, pattern } of SECRET_PATTERNS) {
      const match = line.match(pattern);
      if (!match) continue;
      if (isTestFile && (risk === SECRET_RISK.LOW || risk === SECRET_RISK.MEDIUM)) continue;
      if (type === SECRET_TYPE.GENERIC_TOKEN && isTestFile) continue;

      findings.push(Object.freeze({
        file:           filePath,
        line:           i + 1,
        type,
        risk,
        redactedPreview: redactPreview(match[0], type),
        isTestFile,
        suppressedInTest: isTestFile && risk !== SECRET_RISK.CRITICAL,
      }));
    }
  }

  return findings;
}

/**
 * Evaluate secret scan result to produce a gate-compatible output.
 */
export function evaluateSecretScan(findings = []) {
  if (!Array.isArray(findings)) return { valid: false, error: 'findings must be array' };

  const real    = findings.filter(f => !f.suppressedInTest);
  const critical = real.filter(f => f.risk === SECRET_RISK.CRITICAL);
  const high     = real.filter(f => f.risk === SECRET_RISK.HIGH);

  return {
    valid:          true,
    secretsFound:   real.length,
    critical:       critical.length > 0,
    criticalCount:  critical.length,
    highCount:      high.length,
    findings:       real,
    suppressed:     findings.filter(f => f.suppressedInTest).length,
    adapterNote:    'NO_SECRET_VALUES_PRINTED. Only redacted previews.',
  };
}

/**
 * Scan an array of { path, content } file objects.
 */
export function scanFiles(files = []) {
  const allFindings = [];
  for (const { path, content } of files) {
    const ext = path.slice(path.lastIndexOf('.'));
    if (EXCLUDED_EXTENSIONS.has(ext)) continue;
    const findings = scanTextForSecrets(content, path);
    allFindings.push(...findings);
  }
  return evaluateSecretScan(allFindings);
}

export const SECRET_SCAN_VERSION = '1.0.0';
