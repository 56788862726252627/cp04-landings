// Third Party Processor Profile — ADV-19

export const PROCESSOR_RISK = Object.freeze({
  LOW:     'LOW',
  MEDIUM:  'MEDIUM',
  HIGH:    'HIGH',
  UNKNOWN: 'UNKNOWN',
});

export const DPA_STATUS = Object.freeze({
  SIGNED:    'SIGNED',
  PENDING:   'PENDING',
  NOT_SIGNED:'NOT_SIGNED',
  UNKNOWN:   'UNKNOWN',
});

export function createThirdPartyProcessorProfile(config = {}) {
  const {
    provider = 'UNKNOWN',
    purpose = '',
    dataTypes = [],
    region = 'UNKNOWN',
    contractStatus = 'UNKNOWN',
    dpaStatus = DPA_STATUS.UNKNOWN,
    subprocessors = [],
    risk = PROCESSOR_RISK.UNKNOWN,
    clientId = null,
  } = config;

  const warnings = [];
  if (dpaStatus !== DPA_STATUS.SIGNED) warnings.push('DPA_NOT_CONFIRMED_SIGNED');
  if (risk === PROCESSOR_RISK.UNKNOWN)  warnings.push('PROCESSOR_RISK_UNASSESSED');
  if (region === 'UNKNOWN')             warnings.push('PROCESSOR_REGION_UNKNOWN');

  const status = dpaStatus === DPA_STATUS.NOT_SIGNED
    ? 'BLOCKED_PENDING_REVIEW'
    : warnings.length > 0
      ? 'REVIEW_REQUIRED'
      : 'APPROVED';

  return Object.freeze({
    clientId,
    provider,
    purpose,
    dataTypes: Object.freeze([...dataTypes]),
    region,
    contractStatus,
    dpaStatus,
    subprocessors: Object.freeze([...subprocessors]),
    risk,
    status,
    warnings: Object.freeze([...warnings]),
    legalCertification: false,
    isReal: false,
  });
}

export const PROCESSOR_PROFILE_VERSION = '1.0.0';
