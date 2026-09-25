// Agent Health Adapter — ADV-20 (connects ADV-03 + ADV-10)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createAgentHealthAdapter(config = {}) {
  const {
    agentQualityScore  = null,
    groundingScore     = null,
    humanApprovalReady = true,
    safetyViolations   = 0,
    toolReliability    = 100,
    escalationReady    = true,
    selfPermissionAttempt = false,
    clientId           = null,
    environment        = 'LOCAL',
  } = config;

  const criticalViolation = selfPermissionAttempt || safetyViolations > 2;

  let status, score;
  if (criticalViolation) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (safetyViolations > 0 || !escalationReady) {
    status = HEALTH_STATUS.DEGRADED;
    score = 50;
  } else if (!humanApprovalReady || toolReliability < 80) {
    status = HEALTH_STATUS.WARNING;
    score = 70;
  } else if (agentQualityScore === null) {
    status = HEALTH_STATUS.UNKNOWN;
    score = 50;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = agentQualityScore;
  }

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.AGENTS,
    status,
    score,
    source: 'ADV-03+ADV-10',
    clientId,
    environment,
    message: criticalViolation ? 'Agent security violation detected' : `Agent health ${score}`,
    evidence: safetyViolations > 0 ? [`${safetyViolations} safety violations`] : [],
    recommendedAction: criticalViolation ? 'Block agent and review security policy' :
      !escalationReady ? 'Configure human escalation path' : null,
  });

  return Object.freeze({
    agentQualityScore: score,
    groundingScore,
    humanApprovalReady,
    safetyViolations,
    toolReliability,
    escalationReady,
    selfPermissionAttempt,
    status,
    score,
    signal,
    adv03Connected: true,
    adv10Connected: true,
    isReal: false,
  });
}

export const AGENT_HEALTH_ADAPTER_VERSION = '1.0.0';
