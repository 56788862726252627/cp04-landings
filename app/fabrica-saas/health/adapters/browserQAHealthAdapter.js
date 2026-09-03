// Browser QA Health Adapter — ADV-20 (connects ADV-06)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createBrowserQAHealthAdapter(config = {}) {
  const {
    functionalPassed    = false,
    responsivePassed    = false,
    accessibilityPassed = false,
    deadControls        = 0,
    navigationPassed    = false,
    performancePassed   = false,
    clientId            = null,
    environment         = 'LOCAL',
  } = config;

  const criticalFail = deadControls > 0 || !functionalPassed;
  const anyFail = !responsivePassed || !navigationPassed;

  let status, score;
  if (criticalFail) {
    status = HEALTH_STATUS.CRITICAL;
    score = Math.max(0, 100 - deadControls * 15 - (!functionalPassed ? 30 : 0));
  } else if (anyFail || !accessibilityPassed) {
    status = HEALTH_STATUS.WARNING;
    score = 65;
  } else if (!performancePassed) {
    status = HEALTH_STATUS.DEGRADED;
    score = 75;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const evidence = [];
  if (deadControls > 0) evidence.push(`${deadControls} dead controls`);
  if (!functionalPassed) evidence.push('FUNCTIONAL_TESTS_FAILED');
  if (!accessibilityPassed) evidence.push('ACCESSIBILITY_FAILED');

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.BROWSER_QA,
    status,
    score,
    source: 'ADV-06',
    clientId,
    environment,
    message: deadControls > 0 ? `${deadControls} dead controls detected` : `Browser QA score ${score}`,
    evidence,
    recommendedAction: deadControls > 0 ? 'Fix dead UI controls' :
      !functionalPassed ? 'Fix failing functional tests' : null,
  });

  return Object.freeze({
    functionalPassed,
    responsivePassed,
    accessibilityPassed,
    deadControls,
    navigationPassed,
    performancePassed,
    status,
    score,
    signal,
    adv06Connected: true,
    isReal: false,
  });
}

export const BROWSER_QA_HEALTH_ADAPTER_VERSION = '1.0.0';
