// Post-Deploy QA — PASO G
// QA model for deployed apps. URL-based tests use mock in Paso G.

export const QA_CHECK_STATUS = Object.freeze({
  PASS:         'PASS',
  FAIL:         'FAIL',
  WARNING:      'WARNING',
  NOT_EXECUTED: 'NOT_EXECUTED',
  BLOCKED:      'BLOCKED',
});

const QA_CHECKS = [
  { id: 'QA-01',  name: 'HTTP availability',              critical: true  },
  { id: 'QA-02',  name: 'HTML returned (not blank)',       critical: true  },
  { id: 'QA-03',  name: 'JS assets load',                  critical: true  },
  { id: 'QA-04',  name: 'CSS assets load',                 critical: true  },
  { id: 'QA-05',  name: 'Correct MIME types',             critical: false },
  { id: 'QA-06',  name: 'App renders to root element',    critical: true  },
  { id: 'QA-07',  name: 'Routing works (home → other)',   critical: true  },
  { id: 'QA-08',  name: 'Navigation links functional',    critical: true  },
  { id: 'QA-09',  name: 'Critical controls clickable',    critical: true  },
  { id: 'QA-10',  name: 'Forms submit correctly',         critical: false },
  { id: 'QA-11',  name: 'Responsive layout (mobile)',     critical: true  },
  { id: 'QA-12',  name: 'Accessibility: ARIA landmarks',  critical: false },
  { id: 'QA-13',  name: 'No console errors on load',     critical: false },
  { id: 'QA-14',  name: 'No failed network requests',    critical: false },
  { id: 'QA-15',  name: 'Security headers present',       critical: true  },
  { id: 'QA-16',  name: 'PWA manifest loads',             critical: false },
  { id: 'QA-17',  name: 'Favicon present',               critical: false },
  { id: 'QA-18',  name: 'robots.txt correct',            critical: false },
  { id: 'QA-19',  name: '404 page handled gracefully',   critical: false },
  { id: 'QA-20',  name: 'Auth boundary enforced',         critical: true  },
  { id: 'QA-21',  name: 'Role boundary enforced',         critical: true  },
  { id: 'QA-22',  name: 'White screen gate',             critical: true  },
];

/**
 * Run post-deploy QA from a checks map.
 * Real URL checks blocked in Paso G — accepts fixture results.
 */
export function runPostDeployQA(checks = {}, options = {}) {
  const deployedUrl = options.deployedUrl ?? null;
  const isLiveCheck = !!(deployedUrl);

  if (!isLiveCheck && Object.keys(checks).length === 0) {
    return {
      valid:       true,
      status:      QA_CHECK_STATUS.BLOCKED,
      reason:      'No deployed URL and no fixture checks provided',
      deployedUrl: null,
      results:     [],
    };
  }

  const results = QA_CHECKS.map(check => {
    const value = checks[check.id];
    const status = value === true  ? QA_CHECK_STATUS.PASS
      : value === false            ? QA_CHECK_STATUS.FAIL
      : value === 'WARNING'        ? QA_CHECK_STATUS.WARNING
      : QA_CHECK_STATUS.NOT_EXECUTED;

    return { ...check, status, executed: value !== undefined };
  });

  const criticalFailed = results.filter(r => r.critical && r.status === QA_CHECK_STATUS.FAIL);
  const passed  = results.filter(r => r.status === QA_CHECK_STATUS.PASS).length;
  const score   = Math.round((passed / QA_CHECKS.length) * 100);

  const overallStatus = criticalFailed.length > 0 ? QA_CHECK_STATUS.FAIL
    : score >= 80                                  ? QA_CHECK_STATUS.PASS
    : QA_CHECK_STATUS.WARNING;

  return {
    valid:          true,
    status:         overallStatus,
    deployedUrl:    deployedUrl ?? 'DRY_RUN_NO_URL',
    isLiveCheck,
    totalChecks:    QA_CHECKS.length,
    passed,
    failed:         results.filter(r => r.status === QA_CHECK_STATUS.FAIL).length,
    notExecuted:    results.filter(r => r.status === QA_CHECK_STATUS.NOT_EXECUTED).length,
    criticalFailed: criticalFailed.length,
    criticalFailedIds: criticalFailed.map(r => r.id),
    score,
    results,
    disclaimer:     'Post-deploy QA in Paso G uses fixture data. Live URL checks require real deployment.',
  };
}

export const POST_DEPLOY_QA_VERSION = '1.0.0';
