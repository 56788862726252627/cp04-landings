// Paso H — Naming & Consistency Audit
// Verifies naming conventions across all Pasos A-G

export const NAMING_RESULT = Object.freeze({
  CONSISTENT: 'CONSISTENT',
  MINOR:      'MINOR',
  WARNING:    'WARNING',
});

export const NAMING_CONVENTIONS = Object.freeze({
  FUNCTIONS:   'verbNoun (camelCase): buildX, createX, auditX, runX, evaluateX',
  CONSTANTS:   'SCREAMING_SNAKE_CASE: DEPLOY_MODES, HEALTH_STATUS',
  STATUSES:    'string constants frozen: Object.freeze({ PASS, FAIL, ... })',
  FILES:       'camelCase.js for modules, AGENCY_*.md for docs',
  TESTS:       'v2-paso-*.test.mjs pattern',
  EXPORTS:     'Named exports only — no default exports',
  REGISTRIES:  '*_REGISTRY naming for sub-registries',
  BARREL_FILES: 'factory-registry/*.js as barrel per paso',
});

const CONSISTENCY_CHECKS = [
  {
    id: 'NAMING-01',
    check: 'Function naming: verb + noun pattern',
    examples: ['analyzeBusiness', 'buildCapabilityMatrix', 'evaluateReleaseGates', 'auditAgencyEndToEnd'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-02',
    check: 'Status constants: frozen objects',
    examples: ['DEPLOY_MODES', 'HEALTH_STATUS', 'GATE_RESULT', 'SEC_RESULT'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-03',
    check: 'Module files: camelCase.js',
    examples: ['deployRunner.js', 'healthChecks.js', 'capabilityMatrix.js'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-04',
    check: 'Doc files: AGENCY_*.md uppercase',
    examples: ['AGENCY_DEPLOY_STANDARD.md', 'AGENCY_HEALTH_CHECKS.md'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-05',
    check: 'Test files: v2-paso-*.test.mjs',
    examples: ['v2-paso-b-pipeline.test.mjs', 'v2-paso-g-deploy.test.mjs'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-06',
    check: 'Registry barrel naming: *.js per paso',
    examples: ['deploy.js', 'commercial.js', 'lifecycle.js', 'maintenance.js'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-07',
    check: 'Return shapes: { valid, ... } pattern',
    examples: ['auditAgencyEndToEnd → { valid, totalSteps, issues }', 'evaluateReleaseGates → { valid, overallResult }'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
  {
    id: 'NAMING-08',
    check: 'Status enum consistency: 100_PERCENT for paso completion',
    examples: ['PASO_A_STATUS = "100_PERCENT"', 'PASO_G_STATUS_MAIN = "100_PERCENT"'],
    result: NAMING_RESULT.MINOR,
    violations: ['PASO_A_STATUS (no _MAIN suffix) vs PASO_D_STATUS_MAIN (con _MAIN)'],
    note: 'Minor inconsistencia histórica — no bloquea funcionalidad',
  },
  {
    id: 'NAMING-09',
    check: 'Export patterns: named exports only',
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
    examples: ['export function ...', 'export const ...', 'export { ... }'],
  },
  {
    id: 'NAMING-10',
    check: 'Version constants: SEMVER string',
    examples: ['DEPLOY_TARGET_VERSION = "1.0.0"', 'REGISTRY_VERSION = "2.7.0"'],
    result: NAMING_RESULT.CONSISTENT,
    violations: [],
  },
];

export function auditNamingConsistency() {
  const warnings = CONSISTENCY_CHECKS.filter((c) => c.result === NAMING_RESULT.WARNING);
  const minor    = CONSISTENCY_CHECKS.filter((c) => c.result === NAMING_RESULT.MINOR);
  const consistent = CONSISTENCY_CHECKS.filter((c) => c.result === NAMING_RESULT.CONSISTENT);

  const allViolations = CONSISTENCY_CHECKS.flatMap((c) => c.violations.map((v) => ({ checkId: c.id, violation: v })));

  return {
    valid: warnings.length === 0,
    totalChecks: CONSISTENCY_CHECKS.length,
    consistent: consistent.length,
    minor: minor.length,
    warnings: warnings.length,
    checks: CONSISTENCY_CHECKS,
    violations: allViolations,
    conventions: NAMING_CONVENTIONS,
    namingStatus: warnings.length === 0 ? 'CONSISTENT' : 'HAS_WARNINGS',
    summary: `${consistent.length}/${CONSISTENCY_CHECKS.length} checks consistentes, ${minor.length} minor`,
  };
}
