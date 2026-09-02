// AI Data Minimization Policy — ADV-16
// Trim context, redact secrets/PII before sending to any provider.

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/g,
  /AKIA[A-Z0-9]{16}/g,
  /ghp_[a-zA-Z0-9]{36}/g,
  /Bearer [a-zA-Z0-9._-]{20,}/g,
  /password\s*[=:]\s*\S+/gi,
];

const PII_PATTERNS = [
  /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/g,   // SSN-like
  /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // card-like
];

export function redactSecrets(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  for (const p of SECRET_PATTERNS) out = out.replace(p, '[REDACTED_SECRET]');
  return out;
}

export function redactPII(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  for (const p of PII_PATTERNS) out = out.replace(p, '[REDACTED_PII]');
  return out;
}

export function minimizeContext(text, maxChars = 8000) {
  if (typeof text !== 'string') return text;
  const redacted = redactPII(redactSecrets(text));
  return redacted.length > maxChars ? redacted.slice(0, maxChars) + '…[trimmed]' : redacted;
}

export function createAIDataMinimizationPolicy(config = {}) {
  const {
    maxContextChars   = 8000,
    redactSecretsFn   = true,
    redactPIIFn       = true,
  } = config;

  return Object.freeze({
    maxContextChars,
    process(text) {
      let out = text;
      if (redactSecretsFn) out = redactSecrets(out);
      if (redactPIIFn)     out = redactPII(out);
      return minimizeContext(out, maxContextChars);
    },
    isReal: false,
  });
}

export const AI_DATA_MINIMIZATION_VERSION = '1.0.0';
