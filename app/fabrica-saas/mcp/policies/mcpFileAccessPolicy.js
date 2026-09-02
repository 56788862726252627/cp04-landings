// MCP File Access Policy — ADV-12

export const FILE_ACCESS_RESULT = Object.freeze({ ALLOW: 'ALLOW', DENY: 'DENY', SANDBOX_ONLY: 'SANDBOX_ONLY' });

const BLOCKED_PATHS = ['/etc', '/root', '/proc', '/sys', '~/.ssh', '~/.aws', '~/.env'];

export function checkFileAccess(filePath, options = {}) {
  if (!filePath) return Object.freeze({ result: FILE_ACCESS_RESULT.DENY, reason: 'NULL_PATH', isReal: false });
  const normalized = filePath.replace(/\\/g, '/');
  for (const blocked of BLOCKED_PATHS) {
    if (normalized.startsWith(blocked)) {
      return Object.freeze({ result: FILE_ACCESS_RESULT.DENY, reason: 'BLOCKED_PATH', filePath, isReal: false });
    }
  }
  if (options.sandboxOnly) {
    return Object.freeze({ result: FILE_ACCESS_RESULT.SANDBOX_ONLY, filePath, isReal: false });
  }
  return Object.freeze({ result: FILE_ACCESS_RESULT.ALLOW, filePath, isReal: false });
}

export const MCP_FILE_ACCESS_POLICY_VERSION = '1.0.0';
