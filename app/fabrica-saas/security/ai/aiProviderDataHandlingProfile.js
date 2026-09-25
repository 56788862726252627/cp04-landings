// AI Provider Data Handling Profile — ADV-19

export const PROVIDER_DATA_STATUS = Object.freeze({
  APPROVED:       'APPROVED',
  REVIEW_REQUIRED:'REVIEW_REQUIRED',
  RESTRICTED:     'RESTRICTED',
  BLOCKED:        'BLOCKED',
  UNKNOWN:        'UNKNOWN',
});

export function createAIProviderDataHandlingProfile(config = {}) {
  const {
    provider = 'UNKNOWN',
    dataClassAllowed = [],
    retentionKnown = false,
    trainingKnown = false,
    regionKnown = false,
    clientId = null,
  } = config;

  const unknowns = [];
  if (!retentionKnown) unknowns.push('RETENTION_POLICY_UNKNOWN');
  if (!trainingKnown)  unknowns.push('TRAINING_POLICY_UNKNOWN');
  if (!regionKnown)    unknowns.push('DATA_REGION_UNKNOWN');

  // UNKNOWN should not be treated as safe automatically
  const status = unknowns.length >= 2
    ? PROVIDER_DATA_STATUS.REVIEW_REQUIRED
    : unknowns.length === 0
      ? PROVIDER_DATA_STATUS.APPROVED
      : PROVIDER_DATA_STATUS.REVIEW_REQUIRED;

  const allowedForSensitive = status === PROVIDER_DATA_STATUS.APPROVED
    && dataClassAllowed.includes('SENSITIVE');

  return Object.freeze({
    clientId,
    provider,
    dataClassAllowed: Object.freeze([...dataClassAllowed]),
    retentionKnown,
    trainingKnown,
    regionKnown,
    unknowns: Object.freeze([...unknowns]),
    status,
    allowedForSensitive,
    unknownIsSafe: false,
    isReal: false,
  });
}

export const AI_PROVIDER_DATA_VERSION = '1.0.0';
