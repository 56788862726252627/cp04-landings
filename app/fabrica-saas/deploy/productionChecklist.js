// Production Checklist — PASO G
// 28-item pre-production gate. NO_REAL_DEPLOY.

export const CHECKLIST_STATUS = Object.freeze({
  PASS:           'PASS',
  FAIL:           'FAIL',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
  PENDING:        'PENDING',
});

export const CHECKLIST_CATEGORIES = Object.freeze({
  CODE_QUALITY:    'CODE_QUALITY',
  SECURITY:        'SECURITY',
  TESTING:         'TESTING',
  PERFORMANCE:     'PERFORMANCE',
  COMPLIANCE:      'COMPLIANCE',
  DEPLOY_PROCESS:  'DEPLOY_PROCESS',
  MONITORING:      'MONITORING',
  CLIENT_HANDOFF:  'CLIENT_HANDOFF',
});

const PRODUCTION_CHECKS = [
  // CODE_QUALITY (4)
  { id: 'PC-01', category: CHECKLIST_CATEGORIES.CODE_QUALITY, label: 'Lint passes with 0 errors', critical: true },
  { id: 'PC-02', category: CHECKLIST_CATEGORIES.CODE_QUALITY, label: 'Build passes without warnings', critical: true },
  { id: 'PC-03', category: CHECKLIST_CATEGORIES.CODE_QUALITY, label: 'No TODO/FIXME blocking production', critical: false },
  { id: 'PC-04', category: CHECKLIST_CATEGORIES.CODE_QUALITY, label: 'Dead code removed', critical: false },

  // TESTING (5)
  { id: 'PC-05', category: CHECKLIST_CATEGORIES.TESTING, label: 'All automated tests pass', critical: true },
  { id: 'PC-06', category: CHECKLIST_CATEGORIES.TESTING, label: 'No skipped critical tests', critical: true },
  { id: 'PC-07', category: CHECKLIST_CATEGORIES.TESTING, label: 'Post-deploy QA checklist ready', critical: true },
  { id: 'PC-08', category: CHECKLIST_CATEGORIES.TESTING, label: 'Visual QA reviewed for all breakpoints', critical: false },
  { id: 'PC-09', category: CHECKLIST_CATEGORIES.TESTING, label: 'Mobile tested on at least one real device', critical: false },

  // SECURITY (6)
  { id: 'PC-10', category: CHECKLIST_CATEGORIES.SECURITY, label: 'No secrets in source code', critical: true },
  { id: 'PC-11', category: CHECKLIST_CATEGORIES.SECURITY, label: 'Security headers configured', critical: true },
  { id: 'PC-12', category: CHECKLIST_CATEGORIES.SECURITY, label: 'CORS policy reviewed', critical: true },
  { id: 'PC-13', category: CHECKLIST_CATEGORIES.SECURITY, label: 'Auth flows tested (login, recovery, logout)', critical: true },
  { id: 'PC-14', category: CHECKLIST_CATEGORIES.SECURITY, label: 'Role gates verified (no unauthorized access)', critical: true },
  { id: 'PC-15', category: CHECKLIST_CATEGORIES.SECURITY, label: 'Dependency CVE audit completed', critical: false },

  // COMPLIANCE (3)
  { id: 'PC-16', category: CHECKLIST_CATEGORIES.COMPLIANCE, label: 'GDPR consent flow in place (if applicable)', critical: false },
  { id: 'PC-17', category: CHECKLIST_CATEGORIES.COMPLIANCE, label: 'Data retention policy documented', critical: false },
  { id: 'PC-18', category: CHECKLIST_CATEGORIES.COMPLIANCE, label: 'Privacy policy accessible from app', critical: false },

  // PERFORMANCE (3)
  { id: 'PC-19', category: CHECKLIST_CATEGORIES.PERFORMANCE, label: 'Largest contentful paint < 2.5s estimated', critical: false },
  { id: 'PC-20', category: CHECKLIST_CATEGORIES.PERFORMANCE, label: 'No blocking render-chain resources', critical: false },
  { id: 'PC-21', category: CHECKLIST_CATEGORIES.PERFORMANCE, label: 'Bundle size reviewed', critical: false },

  // DEPLOY_PROCESS (4)
  { id: 'PC-22', category: CHECKLIST_CATEGORIES.DEPLOY_PROCESS, label: 'Deploy target configured', critical: true },
  { id: 'PC-23', category: CHECKLIST_CATEGORIES.DEPLOY_PROCESS, label: 'Environment variables set in provider', critical: true },
  { id: 'PC-24', category: CHECKLIST_CATEGORIES.DEPLOY_PROCESS, label: 'Rollback plan defined', critical: true },
  { id: 'PC-25', category: CHECKLIST_CATEGORIES.DEPLOY_PROCESS, label: 'Human approval obtained', critical: true },

  // MONITORING (2)
  { id: 'PC-26', category: CHECKLIST_CATEGORIES.MONITORING, label: 'Health check endpoint configured', critical: false },
  { id: 'PC-27', category: CHECKLIST_CATEGORIES.MONITORING, label: 'Error alerting documented', critical: false },

  // CLIENT_HANDOFF (1)
  { id: 'PC-28', category: CHECKLIST_CATEGORIES.CLIENT_HANDOFF, label: 'Client notified of deployment window', critical: false },
];

/**
 * Evaluate production checklist from a checks map.
 * @param {object} checks — { 'PC-01': 'PASS'|'FAIL'|'NOT_APPLICABLE'|'PENDING' }
 */
export function evaluateProductionChecklist(checks = {}) {
  const results = PRODUCTION_CHECKS.map(def => {
    const status = checks[def.id] ?? CHECKLIST_STATUS.PENDING;
    const passed = status === CHECKLIST_STATUS.PASS || status === CHECKLIST_STATUS.NOT_APPLICABLE;
    return { ...def, status, passed };
  });

  const criticalFailed = results.filter(r => r.critical && r.status === CHECKLIST_STATUS.FAIL);
  const pending        = results.filter(r => r.status === CHECKLIST_STATUS.PENDING);
  const passed         = results.filter(r => r.passed).length;

  const byCategory = {};
  for (const cat of Object.values(CHECKLIST_CATEGORIES)) {
    const catItems = results.filter(r => r.category === cat);
    byCategory[cat] = {
      total:  catItems.length,
      passed: catItems.filter(r => r.passed).length,
      failed: catItems.filter(r => r.status === CHECKLIST_STATUS.FAIL).length,
    };
  }

  const readyForProduction = criticalFailed.length === 0 && pending.filter(r => r.critical).length === 0;

  return {
    valid:               true,
    readyForProduction,
    totalChecks:         PRODUCTION_CHECKS.length,
    passed,
    criticalFailed:      criticalFailed.length,
    pending:             pending.length,
    byCategory,
    results,
    blockedBy:           criticalFailed.map(r => r.id),
    disclaimer:          [
      'Production checklist is operational validation for the agency.',
      'NO_REAL_DEPLOY. No production deployment performed in Paso G.',
    ].join(' '),
  };
}

export const PRODUCTION_CHECKLIST_VERSION = '1.0.0';
