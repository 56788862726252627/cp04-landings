// Client-Side Security Audit — PASO G

export const CLIENT_AUDIT_STATUS = Object.freeze({
  PASS:    'PASS',
  WARNING: 'WARNING',
  FAIL:    'FAIL',
});

const CLIENT_CHECKS = [
  {
    id:       'CS-01',
    name:     'No dangerous innerHTML injection',
    pattern:  /innerHTML\s*=\s*(?!`[^`]*\.textContent)/,
    critical: true,
    risk:     'XSS via innerHTML assignment',
  },
  {
    id:       'CS-02',
    name:     'No unsafe external links',
    pattern:  /target\s*=\s*["']_blank["'](?!.*rel\s*=)/,
    critical: false,
    risk:     'Missing rel="noopener noreferrer" on _blank links',
  },
  {
    id:       'CS-03',
    name:     'No localStorage sensitive data',
    pattern:  /localStorage\.setItem\s*\(\s*["'][^"']*(?:token|secret|password|key|credential)[^"']*["']/i,
    critical: true,
    risk:     'Sensitive data in localStorage (accessible to XSS)',
  },
  {
    id:       'CS-04',
    name:     'No query-string secrets',
    pattern:  /[?&](?:token|api_key|secret|password|credential)=/i,
    critical: true,
    risk:     'Secret exposed in URL query string',
  },
  {
    id:       'CS-05',
    name:     'No console secret leakage',
    pattern:  /console\.(?:log|warn|error|debug)\s*\([^)]*(?:token|secret|password|credential|api_?key)/i,
    critical: false,
    risk:     'Potential secret logged to console',
  },
  {
    id:       'CS-06',
    name:     'No debug flags in production code',
    pattern:  /(?:debug|debugMode|DEBUG)\s*[=:]\s*true/,
    critical: false,
    risk:     'Debug flag that could expose internals',
  },
  {
    id:       'CS-07',
    name:     'No localhost production references',
    pattern:  /(?:http:\/\/localhost|127\.0\.0\.1)(?::\d+)?\/(?:api|v\d)/,
    critical: true,
    risk:     'Localhost API reference in production code',
  },
  {
    id:       'CS-08',
    name:     'No insecure HTTP production endpoints',
    pattern:  /["']http:\/\/(?!localhost|127\.0\.0\.1)[A-Za-z0-9.-]+\/(?:api|v\d)/,
    critical: false,
    risk:     'HTTP (non-HTTPS) production API endpoint',
  },
  {
    id:       'CS-09',
    name:     'Source maps policy',
    pattern:  /\/\/# sourceMappingURL=.*\.map/,
    critical: false,
    risk:     'Source maps exposed in production (leaks source code)',
  },
  {
    id:       'CS-10',
    name:     'No sessionStorage sensitive data',
    pattern:  /sessionStorage\.setItem\s*\(\s*["'][^"']*(?:token|secret|password|key|credential)[^"']*["']/i,
    critical: false,
    risk:     'Sensitive data in sessionStorage',
  },
];

/**
 * Audit a code string for client-side security issues.
 */
export function auditClientCode(code = '', filePath = 'unknown') {
  if (typeof code !== 'string') return { valid: false, error: 'code must be string' };

  const findings = [];
  const lines = code.split('\n');

  for (const check of CLIENT_CHECKS) {
    lines.forEach((line, idx) => {
      if (check.pattern.test(line)) {
        findings.push({
          checkId:  check.id,
          name:     check.name,
          file:     filePath,
          line:     idx + 1,
          critical: check.critical,
          risk:     check.risk,
          preview:  line.trim().slice(0, 80),
        });
      }
    });
  }

  const critical = findings.filter(f => f.critical);
  const status = critical.length > 0 ? CLIENT_AUDIT_STATUS.FAIL
    : findings.length > 0            ? CLIENT_AUDIT_STATUS.WARNING
    : CLIENT_AUDIT_STATUS.PASS;

  return { valid: true, filePath, status, findings: findings.length, critical: critical.length, details: findings };
}

/**
 * Audit multiple files for client-side security.
 */
export function auditClientSecurity(files = []) {
  if (!Array.isArray(files)) return { valid: false, error: 'files must be array' };

  const results = files.map(f => auditClientCode(f.content ?? '', f.path ?? 'unknown'));
  const allFindings = results.flatMap(r => r.details ?? []);
  const critical = allFindings.filter(f => f.critical).length;

  const status = critical > 0    ? CLIENT_AUDIT_STATUS.FAIL
    : allFindings.length > 0     ? CLIENT_AUDIT_STATUS.WARNING
    : CLIENT_AUDIT_STATUS.PASS;

  return {
    valid:         true,
    status,
    filesScanned:  files.length,
    totalFindings: allFindings.length,
    critical,
    fileResults:   results,
    disclaimer:    'Client security audit is pattern-based. Not a replacement for manual review.',
  };
}

export const CLIENT_SECURITY_VERSION = '1.0.0';
