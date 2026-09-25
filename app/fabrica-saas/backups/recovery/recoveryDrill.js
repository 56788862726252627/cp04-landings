// Recovery Drill — ADV-18 (fixture-based)

export const DRILL_STATUS = Object.freeze({
  PLANNED: 'PLANNED',
  PASSED:  'PASSED',
  WARNING: 'WARNING',
  FAILED:  'FAILED',
});

let _drillCounter = 1;

export function createRecoveryDrill(config = {}) {
  const {
    clientId       = null,
    businessId     = null,
    scope          = [],
    status         = DRILL_STATUS.PLANNED,
    findings       = [],
    conductedAt    = null,
    conductedBy    = 'AUTOMATED_DRY_RUN',
    restoreSimulated = false,
    drillId        = null,
  } = config;

  const id = drillId ?? `drill-${Date.now()}-${_drillCounter++}`;

  return Object.freeze({
    id,
    clientId,
    businessId,
    scope:         Object.freeze([...scope]),
    status,
    findings:      Object.freeze([...findings]),
    conductedAt:   conductedAt ?? new Date().toISOString(),
    conductedBy,
    restoreSimulated,
    passed:        status === DRILL_STATUS.PASSED,
    isReal:        false,
  });
}

export const RECOVERY_DRILL_VERSION = '1.0.0';
