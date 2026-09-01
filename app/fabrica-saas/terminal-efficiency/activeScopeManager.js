// Active Scope Manager — ADV-05
// Enforces that write operations stay within the authorized improvement scope.

export const SCOPE_VERDICT = Object.freeze({
  IN_SCOPE:    'IN_SCOPE',
  OUT_OF_SCOPE:'OUT_OF_SCOPE',
  BORDERLINE:  'BORDERLINE',
});

const PROTECTED_PATHS = [
  /src\/components\/demo\//,
  /worker\.(js|ts)$/,
  /\.env/,
  /src\/data\//,
  /public\/images\//,
  /src\/saas-core\/commercial\/airtable/,
];

const FACTORY_PATHS = [
  /terminal-efficiency\//,
  /production-pipeline\//,
  /agent-engine\//,
  /factory-registry\//,
  /generator\/tests\//,
  /docs\/(terminal-efficiency|production-pipeline|agent-engine)\//,
];

export function checkFileScope(filePath = '') {
  if (!filePath) return { valid: false, error: 'filePath required' };

  const isProtected = PROTECTED_PATHS.some(p => p.test(filePath));
  if (isProtected) {
    return { valid: true, filePath, verdict: SCOPE_VERDICT.OUT_OF_SCOPE, reason: 'protected path — do not modify', isReal: false };
  }

  const isFactory = FACTORY_PATHS.some(p => p.test(filePath));
  if (isFactory) {
    return { valid: true, filePath, verdict: SCOPE_VERDICT.IN_SCOPE, reason: 'factory scope', isReal: false };
  }

  return { valid: true, filePath, verdict: SCOPE_VERDICT.BORDERLINE, reason: 'review before writing', isReal: false };
}

export function filterInScopeFiles(files = [], improvementScope = '') {
  return files.map(f => ({ file: f, scope: checkFileScope(f, improvementScope) }))
    .filter(f => f.scope.verdict === SCOPE_VERDICT.IN_SCOPE)
    .map(f => f.file);
}

export function createActiveScopeManager(improvementId = '') {
  if (!improvementId) return { valid: false, error: 'improvementId required' };
  const writeAttempts = [];

  function checkWrite(filePath) {
    const result = checkFileScope(filePath, improvementId);
    writeAttempts.push({ filePath, result, at: new Date().toISOString() });
    return result;
  }

  function getBlockedAttempts() { return writeAttempts.filter(a => a.result.verdict === SCOPE_VERDICT.OUT_OF_SCOPE); }
  function getStats() {
    return { total: writeAttempts.length, inScope: writeAttempts.filter(a => a.result.verdict === SCOPE_VERDICT.IN_SCOPE).length, blocked: getBlockedAttempts().length, isReal: false };
  }

  return Object.freeze({ valid: true, improvementId, checkWrite, getBlockedAttempts, getStats });
}

export const ACTIVE_SCOPE_MANAGER_VERSION = '1.0.0';
