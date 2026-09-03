// International Data Transfer Profile — ADV-19

export const TRANSFER_STATUS = Object.freeze({
  EU_EEA:               'EU_EEA',
  ADEQUACY_FOUNDATION:  'ADEQUACY_FOUNDATION',
  SCC_REVIEW:           'SCC_REVIEW',
  UNKNOWN:              'UNKNOWN',
  BLOCKED_PENDING_REVIEW:'BLOCKED_PENDING_REVIEW',
});

const EU_EEA_COUNTRIES = new Set([
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI','FR','GR','HR',
  'HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI',
  'SK','IS','LI','NO',
]);

const ADEQUACY_COUNTRIES = new Set([
  'GB','CH','JP','KR','NZ','CA','IL','AD','AR','UY','UK',
]);

export function createInternationalDataTransferProfile(config = {}) {
  const {
    destinationCountry = 'UNKNOWN',
    provider = 'UNKNOWN',
    dataTypes = [],
    sccInPlace = false,
    clientId = null,
  } = config;

  let status;
  if (EU_EEA_COUNTRIES.has(destinationCountry)) {
    status = TRANSFER_STATUS.EU_EEA;
  } else if (ADEQUACY_COUNTRIES.has(destinationCountry)) {
    status = TRANSFER_STATUS.ADEQUACY_FOUNDATION;
  } else if (destinationCountry === 'UNKNOWN') {
    status = TRANSFER_STATUS.BLOCKED_PENDING_REVIEW;
  } else if (sccInPlace) {
    status = TRANSFER_STATUS.SCC_REVIEW;
  } else {
    status = TRANSFER_STATUS.UNKNOWN;
  }

  const warnings = [];
  if (status === TRANSFER_STATUS.UNKNOWN)               warnings.push('TRANSFER_MECHANISM_UNCLEAR');
  if (status === TRANSFER_STATUS.BLOCKED_PENDING_REVIEW)warnings.push('TRANSFER_BLOCKED_UNKNOWN_DESTINATION');
  if (status === TRANSFER_STATUS.SCC_REVIEW)            warnings.push('SCC_REQUIRES_LEGAL_VALIDATION');

  return Object.freeze({
    clientId,
    destinationCountry,
    provider,
    dataTypes: Object.freeze([...dataTypes]),
    sccInPlace,
    status,
    warnings: Object.freeze([...warnings]),
    legalCertification: false,
    isReal: false,
  });
}

export const DATA_TRANSFER_VERSION = '1.0.0';
