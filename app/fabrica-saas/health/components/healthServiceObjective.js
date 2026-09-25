// Health Service Objective — ADV-20 (SLO foundation, no real measurement)

export const SLO_TYPE = Object.freeze({
  AVAILABILITY:       'AVAILABILITY',
  LATENCY:            'LATENCY',
  ERROR_RATE:         'ERROR_RATE',
  BACKUP_FRESHNESS:   'BACKUP_FRESHNESS',
  RECOVERY_READINESS: 'RECOVERY_READINESS',
});

export const SLO_STATUS = Object.freeze({
  MET:       'MET',
  AT_RISK:   'AT_RISK',
  BREACHED:  'BREACHED',
  UNKNOWN:   'UNKNOWN',
});

export function createHealthServiceObjective(config = {}) {
  const {
    sloType,
    target,
    current     = null,
    status      = SLO_STATUS.UNKNOWN,
    errorBudget = null,
    period      = '30d',
  } = config;

  if (!sloType || !SLO_TYPE[sloType]) {
    return Object.freeze({ error: 'VALID_SLO_TYPE_REQUIRED', isReal: false });
  }

  const derived = current !== null
    ? current >= target ? SLO_STATUS.MET : current >= target * 0.95 ? SLO_STATUS.AT_RISK : SLO_STATUS.BREACHED
    : status;

  return Object.freeze({
    sloType,
    target,
    current,
    status: derived,
    errorBudget,
    period,
    noRealMeasurement: true,
    isReal: false,
  });
}

export const HEALTH_SERVICE_OBJECTIVE_VERSION = '1.0.0';
