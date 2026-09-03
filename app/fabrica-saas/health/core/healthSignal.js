// Health Signal — ADV-20

import { HEALTH_STATUS, HEALTH_SEVERITY } from './healthDimension.js';

let _signalCounter = 0;

export function createHealthSignal(config = {}) {
  const {
    dimension,
    status       = HEALTH_STATUS.UNKNOWN,
    score        = null,
    severity     = HEALTH_SEVERITY.INFO,
    source       = 'UNKNOWN',
    clientId     = null,
    businessId   = null,
    environment  = 'LOCAL',
    message      = '',
    evidence     = null,
    recommendedAction = null,
    freshnessMs  = null,
  } = config;

  if (!dimension) {
    return Object.freeze({
      id: `signal-error-${++_signalCounter}`,
      error: 'DIMENSION_REQUIRED',
      status: HEALTH_STATUS.UNKNOWN,
      isReal: false,
    });
  }

  const id = config.id || `signal-${dimension}-${++_signalCounter}`;
  const timestamp = config.timestamp || new Date().toISOString();

  return Object.freeze({
    id,
    dimension,
    status,
    score: score !== null ? Math.min(100, Math.max(0, score)) : null,
    severity,
    source,
    timestamp,
    freshnessMs,
    clientId,
    businessId,
    environment,
    message,
    evidence: evidence ? Object.freeze(Array.isArray(evidence) ? [...evidence] : [evidence]) : Object.freeze([]),
    recommendedAction,
    isReal: false,
  });
}

export function isSignalHealthy(signal) {
  return signal.status === HEALTH_STATUS.HEALTHY;
}

export function isSignalBlocking(signal) {
  return signal.status === HEALTH_STATUS.BLOCKED || signal.status === HEALTH_STATUS.CRITICAL;
}

export const HEALTH_SIGNAL_VERSION = '1.0.0';
