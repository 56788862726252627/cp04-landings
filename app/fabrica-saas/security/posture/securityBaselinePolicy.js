// Security Baseline Policy — ADV-19

export const BASELINE_CONTROL = Object.freeze({
  LEAST_PRIVILEGE:      'LEAST_PRIVILEGE',
  SECRET_REFERENCES:    'SECRET_REFERENCES',
  CLIENT_ISOLATION:     'CLIENT_ISOLATION',
  SECURE_DEFAULTS:      'SECURE_DEFAULTS',
  INPUT_VALIDATION:     'INPUT_VALIDATION',
  OUTPUT_ENCODING:      'OUTPUT_ENCODING',
  AUTH_SESSION_POLICY:  'AUTH_SESSION_POLICY',
  AUDIT_TRAIL:          'AUDIT_TRAIL',
  BACKUP_AWARENESS:     'BACKUP_AWARENESS',
  INCIDENT_PATH:        'INCIDENT_PATH',
  SECURITY_HEADERS:     'SECURITY_HEADERS',
  DEPENDENCY_CONTROLS:  'DEPENDENCY_CONTROLS',
});

const REQUIRED_CONTROLS = new Set([
  'LEAST_PRIVILEGE',
  'SECRET_REFERENCES',
  'CLIENT_ISOLATION',
  'SECURE_DEFAULTS',
  'AUTH_SESSION_POLICY',
  'AUDIT_TRAIL',
]);

export function createSecurityBaselinePolicy(config = {}) {
  const { controls = [], clientId = null } = config;

  const missing = [...REQUIRED_CONTROLS].filter(c => !controls.includes(c));
  const satisfied = [...REQUIRED_CONTROLS].filter(c => controls.includes(c));
  const optional = controls.filter(c => !REQUIRED_CONTROLS.has(c));
  const passed = missing.length === 0;

  return Object.freeze({
    clientId,
    controls: Object.freeze([...controls]),
    required: Object.freeze([...REQUIRED_CONTROLS]),
    satisfied: Object.freeze(satisfied),
    missing: Object.freeze(missing),
    optional: Object.freeze(optional),
    passed,
    status: passed ? 'BASELINE_MET' : 'BASELINE_INCOMPLETE',
    isReal: false,
  });
}

export function evaluateBaseline(profile = {}) {
  const controls = [
    ...(profile.securityControls ?? []),
    ...(profile.privacyControls ?? []),
  ];
  return createSecurityBaselinePolicy({ controls, clientId: profile.clientId });
}

export const SECURITY_BASELINE_VERSION = '1.0.0';
