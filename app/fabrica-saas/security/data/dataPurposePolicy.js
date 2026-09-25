// Data Purpose Policy — ADV-19

export const RETENTION_CLASS = Object.freeze({
  SESSION:             'SESSION',
  SHORT:               'SHORT',
  STANDARD:            'STANDARD',
  EXTENDED:            'EXTENDED',
  LEGAL_HOLD:          'LEGAL_HOLD',
  CUSTOM:              'CUSTOM',
});

export function createDataPurposePolicy(config = {}) {
  const {
    dataLabel = '',
    purpose = '',
    allowedUses = [],
    forbiddenUses = [],
    retentionClass = RETENTION_CLASS.STANDARD,
    clientId = null,
  } = config;

  const violations = [];

  function checkUse(use) {
    if (forbiddenUses.includes(use)) {
      violations.push(`FORBIDDEN_USE:${use}`);
      return Object.freeze({ use, allowed: false, reason: 'FORBIDDEN', isReal: false });
    }
    if (allowedUses.length > 0 && !allowedUses.includes(use)) {
      violations.push(`UNDECLARED_USE:${use}`);
      return Object.freeze({ use, allowed: false, reason: 'NOT_IN_ALLOWED_USES', isReal: false });
    }
    return Object.freeze({ use, allowed: true, reason: 'OK', isReal: false });
  }

  return Object.freeze({
    dataLabel,
    purpose,
    allowedUses: Object.freeze([...allowedUses]),
    forbiddenUses: Object.freeze([...forbiddenUses]),
    retentionClass,
    clientId,
    checkUse,
    violations: Object.freeze([...violations]),
    isReal: false,
  });
}

export const DATA_PURPOSE_VERSION = '1.0.0';
