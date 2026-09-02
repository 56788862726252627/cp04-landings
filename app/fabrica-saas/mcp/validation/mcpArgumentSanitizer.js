// MCP Argument Sanitizer — ADV-12

const SECRET_PATTERNS = [
  /\bpassword\b/i,
  /\bpasswd\b/i,
  /\bsecret\b/i,
  /\bprivate[_-]?key\b/i,
  /\bapi[_-]?key\b/i,
  /\btoken\b/i,
  /\bsk[_][a-zA-Z0-9]{20,}\b/,
  /\bpk[_][a-zA-Z0-9]{20,}\b/,
  /\bBearer\s+[a-zA-Z0-9._-]{16,}\b/i,
];

function looksLikeSecret(key, value) {
  if (SECRET_PATTERNS.some(p => p.test(key))) return true;
  if (typeof value === 'string' && SECRET_PATTERNS.some(p => p.test(value))) return true;
  return false;
}

export function sanitizeMCPArguments(args = {}) {
  const sanitized = {};
  const blocked   = [];

  for (const [key, value] of Object.entries(args)) {
    if (looksLikeSecret(key, value)) {
      blocked.push(key);
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }

  return Object.freeze({
    sanitized: Object.freeze(sanitized),
    blocked:   Object.freeze(blocked),
    clean:     blocked.length === 0,
    isReal: false,
  });
}

export const MCP_ARGUMENT_SANITIZER_VERSION = '1.0.0';
