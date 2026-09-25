// Multiagent Health Adapter — ADV-20 (connects ADV-17)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createMultiagentHealthAdapter(config = {}) {
  const {
    taskCompletionRate  = null,
    handoffQuality      = 'UNKNOWN',
    loopDetected        = false,
    deadlockDetected    = false,
    conflictsActive     = 0,
    permissionSafe      = true,
    efficiency          = null,
    clientId            = null,
    environment         = 'LOCAL',
  } = config;

  const criticalState = loopDetected || deadlockDetected;

  let status, score;
  if (criticalState || !permissionSafe) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (conflictsActive > 0 || handoffQuality === 'POOR') {
    status = HEALTH_STATUS.DEGRADED;
    score = 40;
  } else if (taskCompletionRate === null || efficiency === null) {
    status = HEALTH_STATUS.UNKNOWN;
    score = 50;
  } else if (taskCompletionRate < 80) {
    status = HEALTH_STATUS.WARNING;
    score = taskCompletionRate;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = taskCompletionRate;
  }

  const evidence = [];
  if (loopDetected)    evidence.push('LOOP_DETECTED');
  if (deadlockDetected) evidence.push('DEADLOCK_DETECTED');
  if (conflictsActive > 0) evidence.push(`${conflictsActive} active conflicts`);

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.MULTIAGENT,
    status,
    score,
    source: 'ADV-17',
    clientId,
    environment,
    message: loopDetected ? 'Infinite loop detected in agent chain' :
      deadlockDetected ? 'Deadlock detected in multiagent system' :
      `Multiagent health ${score}`,
    evidence,
    recommendedAction: loopDetected ? 'Terminate loop and review agent graph' :
      deadlockDetected ? 'Resolve deadlock manually' : null,
  });

  return Object.freeze({
    taskCompletionRate,
    handoffQuality,
    loopDetected,
    deadlockDetected,
    conflictsActive,
    permissionSafe,
    efficiency,
    status,
    score,
    signal,
    adv17Connected: true,
    isReal: false,
  });
}

export const MULTIAGENT_HEALTH_ADAPTER_VERSION = '1.0.0';
