// Data Safety Gate — PASO G
// Identifies demo/test data that may not belong in production.

export const DATA_CLASSIFICATIONS = Object.freeze({
  SAFE_DEMO:   'SAFE_DEMO',    // Intentional public demo content — keep
  MUST_REMOVE: 'MUST_REMOVE',  // Real-looking test data that must be replaced
  HUMAN_REVIEW:'HUMAN_REVIEW', // Ambiguous — needs human decision
});

export const DATA_GATE_STATUS = Object.freeze({
  PASS:        'PASS',
  WARNING:     'WARNING',
  FAIL:        'FAIL',
});

const DATA_PATTERNS = [
  {
    id: 'DP-01',
    name: 'Fake email addresses',
    pattern: /(?:test|fake|example|demo|placeholder)@(?:example|test|demo|fake)\.[a-z]{2,}/i,
    classification: DATA_CLASSIFICATIONS.MUST_REMOVE,
    risk: 'HIGH',
    reason: 'Fake email addresses should be replaced with real client data or removed',
  },
  {
    id: 'DP-02',
    name: 'Test password',
    pattern: /(?:password|contraseña)\s*[:=]\s*["'](?:test|1234|password|admin|123456)["']/i,
    classification: DATA_CLASSIFICATIONS.MUST_REMOVE,
    risk: 'HIGH',
    reason: 'Test passwords must be removed before production',
  },
  {
    id: 'DP-03',
    name: 'Placeholder user ID',
    pattern: /(?:user_?id|userId)\s*[:=]\s*["'](?:test-user|demo-user|placeholder|user-123|fake-user)["']/i,
    classification: DATA_CLASSIFICATIONS.MUST_REMOVE,
    risk: 'MEDIUM',
    reason: 'Placeholder user IDs must not reach production',
  },
  {
    id: 'DP-04',
    name: 'Seed/fixture data comment',
    pattern: /(?:\/\/|\/\*|#)\s*(?:seed|fixture|test data|fake data|mock data)/i,
    classification: DATA_CLASSIFICATIONS.HUMAN_REVIEW,
    risk: 'MEDIUM',
    reason: 'Possible test data fixture — review if it reaches production build',
  },
  {
    id: 'DP-05',
    name: 'Demo booking/appointment',
    pattern: /(?:demo.?booking|test.?appointment|ejemplo.?reserva|reserva.?demo)/i,
    classification: DATA_CLASSIFICATIONS.SAFE_DEMO,
    risk: 'LOW',
    reason: 'Demo booking content — safe if intentional for demo environment',
  },
  {
    id: 'DP-06',
    name: 'Example phone number',
    pattern: /(?:000[-\s]?000[-\s]?0000|555[-\s]?[0-9]{4}|123[-\s]?456[-\s]?7890)/,
    classification: DATA_CLASSIFICATIONS.MUST_REMOVE,
    risk: 'MEDIUM',
    reason: 'Example phone numbers must be replaced with real contact info',
  },
  {
    id: 'DP-07',
    name: 'Test patient/client name',
    pattern: /(?:Paciente Test|Test Patient|Usuario Demo|Demo User|Cliente Ejemplo)/i,
    classification: DATA_CLASSIFICATIONS.MUST_REMOVE,
    risk: 'MEDIUM',
    reason: 'Placeholder names must be replaced before production',
  },
  {
    id: 'DP-08',
    name: 'Mock token/identifier',
    pattern: /(?:mock_token|fake_id|test_key|dummy_token|placeholder_id)[:=\s]["']?[A-Za-z0-9_-]{4,}/i,
    classification: DATA_CLASSIFICATIONS.MUST_REMOVE,
    risk: 'HIGH',
    reason: 'Mock identifiers in production code indicate incomplete setup',
  },
];

/**
 * Audit a code string for data safety issues.
 */
export function auditCodeForData(code = '', filePath = 'unknown') {
  if (typeof code !== 'string') return { valid: false, error: 'code must be string' };

  const findings = [];
  const lines = code.split('\n');

  for (const pattern of DATA_PATTERNS) {
    lines.forEach((line, idx) => {
      if (pattern.pattern.test(line)) {
        findings.push({
          file:           filePath,
          line:           idx + 1,
          classification: pattern.classification,
          patternId:      pattern.id,
          risk:           pattern.risk,
          reason:         pattern.reason,
          preview:        line.trim().slice(0, 60) + (line.length > 60 ? '...' : ''),
        });
      }
    });
  }

  const mustRemove   = findings.filter(f => f.classification === DATA_CLASSIFICATIONS.MUST_REMOVE);
  const humanReview  = findings.filter(f => f.classification === DATA_CLASSIFICATIONS.HUMAN_REVIEW);

  const status = mustRemove.length > 0 ? DATA_GATE_STATUS.FAIL
    : humanReview.length > 0           ? DATA_GATE_STATUS.WARNING
    : DATA_GATE_STATUS.PASS;

  return { valid: true, filePath, status, findings: findings.length, mustRemove: mustRemove.length, humanReview: humanReview.length, details: findings };
}

/**
 * Audit production data safety across multiple files.
 */
export function auditProductionDataSafety(files = []) {
  if (!Array.isArray(files)) return { valid: false, error: 'files must be array' };

  const results = files.map(f => auditCodeForData(f.content ?? '', f.path ?? 'unknown'));
  const allFindings = results.flatMap(r => r.details ?? []);
  const mustRemove  = allFindings.filter(f => f.classification === DATA_CLASSIFICATIONS.MUST_REMOVE).length;
  const humanReview = allFindings.filter(f => f.classification === DATA_CLASSIFICATIONS.HUMAN_REVIEW).length;

  const status = mustRemove > 0 ? DATA_GATE_STATUS.FAIL
    : humanReview > 0           ? DATA_GATE_STATUS.WARNING
    : DATA_GATE_STATUS.PASS;

  return {
    valid:         true,
    status,
    filesScanned:  files.length,
    totalFindings: allFindings.length,
    mustRemove,
    humanReview,
    safe:          allFindings.filter(f => f.classification === DATA_CLASSIFICATIONS.SAFE_DEMO).length,
    fileResults:   results,
    disclaimer:    'Data safety audit is a pattern-based guide. Human review required for final decision.',
  };
}

export const DATA_SAFETY_VERSION = '1.0.0';
