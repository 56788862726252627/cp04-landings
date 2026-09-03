// Security Risk Model — ADV-19

export const RISK_CATEGORY = Object.freeze({
  AUTH:           'AUTH',
  AUTHORIZATION:  'AUTHORIZATION',
  SECRET:         'SECRET',
  INPUT:          'INPUT',
  OUTPUT:         'OUTPUT',
  INJECTION:      'INJECTION',
  ISOLATION:      'ISOLATION',
  PRIVACY:        'PRIVACY',
  DEPENDENCY:     'DEPENDENCY',
  AI:             'AI',
  INCIDENT:       'INCIDENT',
  COMPLIANCE:     'COMPLIANCE',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
});

export const RISK_SEVERITY = Object.freeze({
  INFO:     'INFO',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const RISK_STATUS = Object.freeze({
  OPEN:        'OPEN',
  MITIGATED:   'MITIGATED',
  ACCEPTED:    'ACCEPTED',
  BLOCKED:     'BLOCKED',
  IN_PROGRESS: 'IN_PROGRESS',
});

export function createSecurityRisk(config = {}) {
  const {
    id = `risk-${Date.now()}`,
    category = RISK_CATEGORY.AUTH,
    severity = RISK_SEVERITY.MEDIUM,
    likelihood = 'MEDIUM',
    impact = 'MEDIUM',
    asset = 'UNKNOWN',
    threat = '',
    control = '',
    status = RISK_STATUS.OPEN,
    evidence = [],
    remediation = '',
    clientId = null,
  } = config;

  return Object.freeze({
    id,
    category,
    severity,
    likelihood,
    impact,
    asset,
    threat,
    control,
    status,
    evidence: Object.freeze([...evidence]),
    remediation,
    clientId,
    isReal: false,
  });
}

export function assessRiskScore(risk = {}) {
  const severityWeight = { INFO: 1, LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5 };
  const likelihoodWeight = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  const impactWeight = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };

  const s = severityWeight[risk.severity] ?? 3;
  const l = likelihoodWeight[risk.likelihood] ?? 2;
  const i = impactWeight[risk.impact] ?? 2;

  const raw = (s * 0.4) + (l * 0.3) + (i * 0.3);
  const normalized = Math.min(100, Math.round((raw / 5) * 100));

  return Object.freeze({ riskId: risk.id, score: normalized, isReal: false });
}

export const SECURITY_RISK_VERSION = '1.0.0';
