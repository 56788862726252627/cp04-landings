// Anonymization Policy — ADV-19

export const IDENTIFIER_TYPE = Object.freeze({
  DIRECT:    'DIRECT',
  QUASI:     'QUASI',
  FREE_TEXT: 'FREE_TEXT',
  METADATA:  'METADATA',
});

export const ANONYMIZATION_RISK = Object.freeze({
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

const DIRECT_IDENTIFIERS = [
  /\bname\b/i, /\bemail\b/i, /\bphone\b/i, /\baddress\b/i,
  /\bssn\b/i, /\bpassport\b/i, /\bnif\b|\bdni\b/i, /\bip.?addr/i,
];
const QUASI_IDENTIFIERS = [
  /\bage\b|\bdob\b|\bbirth/i, /\bgender\b|\bsex\b/i,
  /\bzip\b|\bpostal\b/i, /\bjob.?title\b/i, /\brace\b/i,
];

export function createAnonymizationPolicy(config = {}) {
  const { fields = [], clientId = null } = config;

  const classified = fields.map(f => {
    const label = typeof f === 'string' ? f : f.label ?? '';
    let type = IDENTIFIER_TYPE.METADATA;
    if (DIRECT_IDENTIFIERS.some(p => p.test(label))) type = IDENTIFIER_TYPE.DIRECT;
    else if (QUASI_IDENTIFIERS.some(p => p.test(label))) type = IDENTIFIER_TYPE.QUASI;
    else if (/prompt|message|note|comment|transcript/i.test(label)) type = IDENTIFIER_TYPE.FREE_TEXT;
    return Object.freeze({ field: label, type });
  });

  const directCount = classified.filter(c => c.type === IDENTIFIER_TYPE.DIRECT).length;
  const quasiCount  = classified.filter(c => c.type === IDENTIFIER_TYPE.QUASI).length;

  const reIdentificationRisk = directCount >= 3
    ? ANONYMIZATION_RISK.CRITICAL
    : directCount >= 1
      ? ANONYMIZATION_RISK.HIGH
      : quasiCount >= 3
        ? ANONYMIZATION_RISK.MEDIUM
        : ANONYMIZATION_RISK.LOW;

  const caveats = directCount > 0
    ? ['DIRECT_IDENTIFIERS_PRESENT_IRREVERSIBILITY_NOT_GUARANTEED']
    : [];

  return Object.freeze({
    clientId,
    fields: Object.freeze(classified),
    directCount,
    quasiCount,
    reIdentificationRisk,
    caveats: Object.freeze(caveats),
    technicalReadinessOnly: true,
    isReal: false,
  });
}

export const ANONYMIZATION_VERSION = '1.0.0';
