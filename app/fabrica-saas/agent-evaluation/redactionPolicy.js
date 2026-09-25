// Agent Evaluation Redaction Policy — ADV-10

const PII_PATTERNS = [
  { name: 'email',  pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g }, // eslint-disable-line no-useless-escape
  { name: 'phone',  pattern: /(\+?[\d\s().]{9,15})/g },
  { name: 'dni',    pattern: /\b\d{8}[A-Z]\b/g },
  { name: 'iban',   pattern: /\b[A-Z]{2}\d{2}[\dA-Z]{4,30}\b/g },
  { name: 'name',   pattern: /\b(?:Sr\.|Sra\.|Dr\.|Dra\.)\s+[A-ZÁÉÍÓÚ][a-záéíóú]+\b/g },
];

const SENSITIVE_FIELDS = new Set([
  'contactEmail', 'contactPhone', 'contactName',
  'publicEmail', 'publicPhone', 'email', 'phone', 'fullName',
]);

export function redactText(text = '') {
  let redacted = text;
  for (const { pattern, name } of PII_PATTERNS) {
    redacted = redacted.replace(pattern, `[REDACTED_${name.toUpperCase()}]`);
  }
  return redacted;
}

export function redactObject(obj = {}) {
  if (typeof obj !== 'object' || obj === null) return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_FIELDS.has(k)) {
      out[k] = '[REDACTED]';
    } else if (typeof v === 'string') {
      out[k] = redactText(v);
    } else if (typeof v === 'object') {
      out[k] = redactObject(v);
    } else {
      out[k] = v;
    }
  }
  return Object.freeze(out);
}

export const AgentEvaluationRedaction = Object.freeze({
  redactText,
  redactObject,
  sensitiveFields: Object.freeze([...SENSITIVE_FIELDS]),
  version: '1.0.0',
  isReal: false,
});

export const REDACTION_POLICY_VERSION = '1.0.0';
