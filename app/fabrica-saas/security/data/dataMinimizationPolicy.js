// Data Minimization Policy — ADV-19

export const MINIMIZATION_RESULT = Object.freeze({
  COMPLIANT:   'COMPLIANT',
  WARNING:     'WARNING',
  VIOLATION:   'VIOLATION',
});

const UNNECESSARY_PII_PATTERNS = [
  /\bssn\b|social.?security/i,
  /\bpassport\b/i,
  /\bfull.?address\b/i,
  /\brace\b|\bethnicity\b/i,
  /\bgender\b|\bsex\b/i,
  /\bpolitical\b/i,
  /\breligion\b/i,
  /\bsexual.?orientation\b/i,
  /\bbiometric\b/i,
];

export function createDataMinimizationPolicy(config = {}) {
  const {
    requiredFields = [],
    optionalFields = [],
    contextFields = [],
    clientId = null,
  } = config;

  const findings = [];

  for (const field of optionalFields) {
    if (UNNECESSARY_PII_PATTERNS.some(p => p.test(field))) {
      findings.push({ field, issue: 'UNNECESSARY_PII_IN_OPTIONAL', severity: 'HIGH' });
    }
  }

  for (const field of contextFields) {
    if (UNNECESSARY_PII_PATTERNS.some(p => p.test(field))) {
      findings.push({ field, issue: 'UNNECESSARY_PII_IN_CONTEXT', severity: 'MEDIUM' });
    }
  }

  const allFields = [...requiredFields, ...optionalFields, ...contextFields];
  const deduped = new Set(allFields);
  if (deduped.size < allFields.length) {
    findings.push({ field: 'multiple', issue: 'DUPLICATE_FIELDS_DETECTED', severity: 'LOW' });
  }

  const violations = findings.filter(f => f.severity === 'HIGH');
  const warnings = findings.filter(f => f.severity !== 'HIGH');

  const result = violations.length > 0
    ? MINIMIZATION_RESULT.VIOLATION
    : warnings.length > 0
      ? MINIMIZATION_RESULT.WARNING
      : MINIMIZATION_RESULT.COMPLIANT;

  return Object.freeze({
    clientId,
    requiredFields: Object.freeze([...requiredFields]),
    optionalFields: Object.freeze([...optionalFields]),
    contextFields: Object.freeze([...contextFields]),
    findings: Object.freeze(findings.map(f => Object.freeze(f))),
    violations: Object.freeze(violations.map(f => Object.freeze(f))),
    warnings: Object.freeze(warnings.map(f => Object.freeze(f))),
    result,
    compliant: result === MINIMIZATION_RESULT.COMPLIANT,
    isReal: false,
  });
}

export const DATA_MINIMIZATION_VERSION = '1.0.0';
