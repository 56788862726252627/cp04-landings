// Change Impact Analyzer — ADV-05
// Classifies impact of changed files to calibrate validation depth.

export const IMPACT_LEVEL = Object.freeze({
  NONE:     'NONE',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

const IMPACT_RULES = [
  { pattern: /\.(md|txt|json)$/, tier: IMPACT_LEVEL.LOW,      reason: 'docs/config-only' },
  { pattern: /fixtures?\//,      tier: IMPACT_LEVEL.LOW,      reason: 'test fixtures' },
  { pattern: /\.test\.mjs$/,     tier: IMPACT_LEVEL.MEDIUM,   reason: 'test file changed' },
  { pattern: /\/index\.js$/,     tier: IMPACT_LEVEL.HIGH,     reason: 'barrel export changed' },
  { pattern: /registry\//,       tier: IMPACT_LEVEL.HIGH,     reason: 'registry changed' },
  { pattern: /auth|security|secret/i, tier: IMPACT_LEVEL.CRITICAL, reason: 'security code' },
  { pattern: /deploy|pipeline|orchestrat/i, tier: IMPACT_LEVEL.CRITICAL, reason: 'deploy path' },
  { pattern: /worker\.(js|ts)$/,  tier: IMPACT_LEVEL.CRITICAL, reason: 'CF worker entry point' },
  { pattern: /\.jsx$/,           tier: IMPACT_LEVEL.MEDIUM,   reason: 'UI component' },
  { pattern: /src\/saas-core\//,  tier: IMPACT_LEVEL.HIGH,    reason: 'core shared module' },
];

export function analyzeFileImpact(filePath = '') {
  if (!filePath) return { valid: false, error: 'filePath required' };
  for (const rule of IMPACT_RULES) {
    if (rule.pattern.test(filePath)) {
      return { valid: true, filePath, level: rule.tier, reason: rule.reason, isReal: false };
    }
  }
  return { valid: true, filePath, level: IMPACT_LEVEL.MEDIUM, reason: 'unclassified module', isReal: false };
}

export function analyzeChangeImpact(changedFiles = []) {
  if (!Array.isArray(changedFiles)) return { valid: false, error: 'changedFiles must be array' };
  if (changedFiles.length === 0) return { valid: true, overallLevel: IMPACT_LEVEL.NONE, files: [], isReal: false };

  const levels = [IMPACT_LEVEL.NONE, IMPACT_LEVEL.LOW, IMPACT_LEVEL.MEDIUM, IMPACT_LEVEL.HIGH, IMPACT_LEVEL.CRITICAL];
  const fileResults = changedFiles.map(f => analyzeFileImpact(f));
  const maxIdx = fileResults.reduce((acc, r) => Math.max(acc, levels.indexOf(r.level)), 0);

  return {
    valid:        true,
    overallLevel: levels[maxIdx],
    files:        fileResults,
    hasCritical:  fileResults.some(r => r.level === IMPACT_LEVEL.CRITICAL),
    hasHigh:      fileResults.some(r => r.level === IMPACT_LEVEL.HIGH),
    validationDepth: levels[maxIdx] === IMPACT_LEVEL.LOW ? 'TARGETED' : levels[maxIdx] === IMPACT_LEVEL.MEDIUM ? 'MODULE' : 'FULL',
    isReal:       false,
  };
}

export const CHANGE_IMPACT_ANALYZER_VERSION = '1.0.0';
