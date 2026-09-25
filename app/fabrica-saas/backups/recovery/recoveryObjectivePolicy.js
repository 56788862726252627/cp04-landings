// Recovery Objective Policy (RPO/RTO Foundation) — ADV-18
// Qualitative values — no real infrastructure claims.

export const RECOVERY_OBJECTIVE = Object.freeze({
  BEST_EFFORT:             'BEST_EFFORT',
  DAILY:                   'DAILY',
  HOURLY_FOUNDATION:       'HOURLY_FOUNDATION',
  NEAR_REALTIME_FOUNDATION: 'NEAR_REALTIME_FOUNDATION',
});

export function createRecoveryObjectivePolicy(config = {}) {
  const {
    RPO       = RECOVERY_OBJECTIVE.DAILY,
    RTO       = RECOVERY_OBJECTIVE.DAILY,
    clientId  = null,
    validated = false,
  } = config;

  const hierarchy = [
    RECOVERY_OBJECTIVE.BEST_EFFORT,
    RECOVERY_OBJECTIVE.DAILY,
    RECOVERY_OBJECTIVE.HOURLY_FOUNDATION,
    RECOVERY_OBJECTIVE.NEAR_REALTIME_FOUNDATION,
  ];

  const rpoIndex = hierarchy.indexOf(RPO);
  const rtoIndex = hierarchy.indexOf(RTO);

  return Object.freeze({
    RPO,
    RTO,
    clientId,
    validated,
    isAmbitious: rpoIndex >= 2 || rtoIndex >= 2,
    disclaimer:  'Qualitative objectives only — infrastructure not verified.',
    isReal:      false,
  });
}

export const RECOVERY_OBJECTIVE_POLICY_VERSION = '1.0.0';
