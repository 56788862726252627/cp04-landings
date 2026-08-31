// Severity Model — ADV-01 Transversal Observability
// Deterministic rules for severity elevation.

import { SEVERITY } from './eventModel.js';

export const SEVERITY_WEIGHTS = Object.freeze({
  [SEVERITY.DEBUG]:    0,
  [SEVERITY.INFO]:     1,
  [SEVERITY.WARNING]:  2,
  [SEVERITY.ERROR]:    3,
  [SEVERITY.CRITICAL]: 4,
});

export const ELEVATION_RULES = Object.freeze([
  {
    id:          'PROD_ERROR',
    description: 'Any error in production is at least ERROR',
    match:       (ctx) => ctx.environment === 'production' && ctx.severity === SEVERITY.WARNING
                          && ctx.hasError,
    elevate:     SEVERITY.ERROR,
  },
  {
    id:          'SECURITY_IMPACT',
    description: 'Security events with detected threat are at least ERROR',
    match:       (ctx) => ctx.isSecurityEvent && ctx.threatDetected,
    elevate:     SEVERITY.ERROR,
  },
  {
    id:          'DATA_IMPACT',
    description: 'Data loss or corruption → CRITICAL',
    match:       (ctx) => ctx.dataImpact === 'DATA_LOSS' || ctx.dataImpact === 'DATA_CORRUPTION',
    elevate:     SEVERITY.CRITICAL,
  },
  {
    id:          'REPEATED_FAILURES',
    description: 'ERROR that has repeated ≥3 times → CRITICAL',
    match:       (ctx) => ctx.severity === SEVERITY.ERROR && (ctx.retryCount ?? 0) >= 3,
    elevate:     SEVERITY.CRITICAL,
  },
  {
    id:          'EXTERNAL_OUTAGE',
    description: 'External dependency outage → CRITICAL',
    match:       (ctx) => ctx.externalOutage === true,
    elevate:     SEVERITY.CRITICAL,
  },
  {
    id:          'UNRECOVERABLE',
    description: 'Unrecoverable error → at least ERROR',
    match:       (ctx) => ctx.recoverable === false && ctx.severity === SEVERITY.WARNING,
    elevate:     SEVERITY.ERROR,
  },
  {
    id:          'MANY_USERS',
    description: 'Error affecting >10 users → elevate one level',
    match:       (ctx) => (ctx.usersAffected ?? 0) > 10 && ctx.severity === SEVERITY.WARNING,
    elevate:     SEVERITY.ERROR,
  },
  {
    id:          'NO_RECOVERY',
    description: 'Failed recovery attempt → CRITICAL',
    match:       (ctx) => ctx.recoveryFailed === true,
    elevate:     SEVERITY.CRITICAL,
  },
]);

/**
 * Evaluate if severity should be elevated based on context.
 * Returns the effective (potentially elevated) severity + applied rules.
 */
export function evaluateSeverity(baseSeverity, context = {}) {
  if (!Object.values(SEVERITY).includes(baseSeverity)) {
    return { valid: false, error: `Unknown severity: ${baseSeverity}` };
  }

  const ctx = { severity: baseSeverity, ...context };
  let effectiveSeverity = baseSeverity;
  const appliedRules = [];

  for (const rule of ELEVATION_RULES) {
    if (rule.match(ctx)) {
      if (SEVERITY_WEIGHTS[rule.elevate] > SEVERITY_WEIGHTS[effectiveSeverity]) {
        effectiveSeverity = rule.elevate;
        appliedRules.push({ ruleId: rule.id, elevatedTo: rule.elevate });
      }
    }
  }

  return {
    valid:             true,
    baseSeverity,
    effectiveSeverity,
    elevated:          effectiveSeverity !== baseSeverity,
    appliedRules,
  };
}

/**
 * Compare two severity levels. Returns positive if a > b, 0 if equal, negative if a < b.
 */
export function compareSeverity(a, b) {
  return (SEVERITY_WEIGHTS[a] ?? -1) - (SEVERITY_WEIGHTS[b] ?? -1);
}

export const SEVERITY_MODEL_VERSION = '1.0.0';
