// MCP Output Redactor — ADV-12

const SENSITIVE_KEYS = new Set([
  'password', 'passwd', 'secret', 'private_key', 'api_key', 'token',
  'access_token', 'refresh_token', 'client_secret', 'authorization',
]);

function redactValue(key) {
  return SENSITIVE_KEYS.has(String(key).toLowerCase()) ? '[REDACTED]' : undefined;
}

function redactObject(obj, depth = 0) {
  if (depth > 10) return obj;
  if (Array.isArray(obj)) return obj.map(v => redactObject(v, depth + 1));
  if (typeof obj !== 'object' || obj === null) return obj;
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const redacted = redactValue(k);
    result[k] = redacted !== undefined ? redacted : redactObject(v, depth + 1);
  }
  return result;
}

export function redactMCPOutput(output) {
  if (typeof output !== 'object' || output === null) return output;
  const redacted = redactObject(output);
  return Object.freeze({ ...redacted, isReal: output.isReal ?? false });
}

export const MCP_OUTPUT_REDACTOR_VERSION = '1.0.0';
