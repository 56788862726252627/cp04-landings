// CI/CD Health Adapter — ADV-20 (connects ADV-02)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createCICDHealthAdapter(config = {}) {
  const {
    pipelineStatus  = 'UNKNOWN',
    secretScanPass  = null,
    buildPass       = null,
    testsPass       = null,
    failedGates     = [],
    clientId        = null,
    environment     = 'LOCAL',
  } = config;

  const criticalFailure = secretScanPass === false;
  const hasFailures = failedGates.length > 0 || buildPass === false || testsPass === false;

  let status, score;
  if (criticalFailure) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (pipelineStatus === 'FAILED' || hasFailures) {
    status = HEALTH_STATUS.CRITICAL;
    score = Math.max(10, 100 - failedGates.length * 20);
  } else if (pipelineStatus === 'UNKNOWN' || secretScanPass === null) {
    status = HEALTH_STATUS.UNKNOWN;
    score = 40;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.CI_CD,
    status,
    score,
    source: 'ADV-02',
    clientId,
    environment,
    message: criticalFailure ? 'Secret scan failed — pipeline blocked' : `Pipeline: ${pipelineStatus}`,
    evidence: failedGates,
    recommendedAction: criticalFailure ? 'Remove secrets from code' :
      hasFailures ? `Fix failed gates: ${failedGates.join(', ')}` : null,
  });

  return Object.freeze({
    pipelineStatus,
    failedGates: Object.freeze([...failedGates]),
    criticalFailure,
    status,
    score,
    signal,
    adv02Connected: true,
    isReal: false,
  });
}

export const CICD_HEALTH_ADAPTER_VERSION = '1.0.0';
