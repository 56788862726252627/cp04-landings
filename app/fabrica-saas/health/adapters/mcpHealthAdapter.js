// MCP Health Adapter — ADV-20 (connects ADV-12)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createMCPHealthAdapter(config = {}) {
  const {
    serversAvailable    = 0,
    serversTotal        = 0,
    permissionsValid    = true,
    toolPolicyPassed    = true,
    secretReferences    = true,
    unsafeWriteBlocked  = true,
    unknownServers      = 0,
    clientId            = null,
    environment         = 'LOCAL',
  } = config;

  const criticalViolation = !unsafeWriteBlocked || !secretReferences;
  const allDown = serversTotal > 0 && serversAvailable === 0;

  let status, score;
  if (criticalViolation) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (allDown) {
    status = HEALTH_STATUS.CRITICAL;
    score = 0;
  } else if (!permissionsValid || !toolPolicyPassed || unknownServers > 0) {
    status = HEALTH_STATUS.WARNING;
    score = 60;
  } else if (serversTotal === 0) {
    status = HEALTH_STATUS.NOT_APPLICABLE;
    score = 100;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const evidence = [];
  if (!unsafeWriteBlocked) evidence.push('UNSAFE_WRITE_NOT_BLOCKED');
  if (!secretReferences)   evidence.push('SECRET_IN_PLAINTEXT');
  if (unknownServers > 0)  evidence.push(`${unknownServers} unknown servers`);

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.MCP,
    status,
    score,
    source: 'ADV-12',
    clientId,
    environment,
    message: criticalViolation ? 'MCP security violation' : `${serversAvailable}/${serversTotal} MCP servers available`,
    evidence,
    recommendedAction: criticalViolation ? 'Fix MCP security policy' : null,
  });

  return Object.freeze({
    serversAvailable,
    serversTotal,
    permissionsValid,
    toolPolicyPassed,
    secretReferences,
    unsafeWriteBlocked,
    unknownServers,
    status,
    score,
    signal,
    adv12Connected: true,
    isReal: false,
  });
}

export const MCP_HEALTH_ADAPTER_VERSION = '1.0.0';
