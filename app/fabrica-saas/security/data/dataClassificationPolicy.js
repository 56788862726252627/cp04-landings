// Data Classification Policy — ADV-19

export const DATA_CLASS = Object.freeze({
  PUBLIC:       'PUBLIC',
  INTERNAL:     'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  PERSONAL:     'PERSONAL',
  SENSITIVE:    'SENSITIVE',
  RESTRICTED:   'RESTRICTED',
});

const CLASSIFICATION_RULES = [
  { pattern: /password|secret|key|token|credential/i,      class: DATA_CLASS.RESTRICTED },
  { pattern: /health|medical|diagnosis|prescription/i,      class: DATA_CLASS.SENSITIVE },
  { pattern: /payment|card|iban|bank/i,                    class: DATA_CLASS.SENSITIVE },
  { pattern: /email|phone|address|name|dob|birth/i,        class: DATA_CLASS.PERSONAL },
  { pattern: /lead|prospect|contact|crm/i,                 class: DATA_CLASS.CONFIDENTIAL },
  { pattern: /conversation|transcript|voice|chat/i,        class: DATA_CLASS.CONFIDENTIAL },
  { pattern: /agent|prompt|ai|model/i,                     class: DATA_CLASS.INTERNAL },
  { pattern: /analytics|session|cookie|pixel/i,            class: DATA_CLASS.INTERNAL },
  { pattern: /config|setting|preference/i,                 class: DATA_CLASS.INTERNAL },
];

export function classify(label = '') {
  for (const rule of CLASSIFICATION_RULES) {
    if (rule.pattern.test(label)) {
      return Object.freeze({ label, class: rule.class, isReal: false });
    }
  }
  return Object.freeze({ label, class: DATA_CLASS.INTERNAL, isReal: false });
}

export function createDataClassificationPolicy(config = {}) {
  const { items = [], clientId = null } = config;

  const classified = items.map(item => {
    const result = classify(typeof item === 'string' ? item : item.label ?? '');
    return Object.freeze({ ...result, source: item });
  });

  const sensitiveCount = classified.filter(c =>
    [DATA_CLASS.SENSITIVE, DATA_CLASS.RESTRICTED].includes(c.class)
  ).length;

  const personalCount = classified.filter(c => c.class === DATA_CLASS.PERSONAL).length;

  return Object.freeze({
    clientId,
    classified: Object.freeze(classified),
    sensitiveCount,
    personalCount,
    hasSensitive: sensitiveCount > 0,
    hasPersonal: personalCount > 0,
    isReal: false,
  });
}

export const DATA_CLASSIFICATION_VERSION = '1.0.0';
