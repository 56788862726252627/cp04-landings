// Lead Discovery Provider — base abstraction — ADV-08

export const PROVIDER_MODE = Object.freeze({
  LIVE:         'LIVE',
  DRY_RUN:      'DRY_RUN',
  FIXTURE_MODE: 'FIXTURE_MODE',
  BLOCKED:      'BLOCKED',
});

export const PROVIDER_STATUS = Object.freeze({
  READY:         'READY',
  WAITING_AUTH:  'WAITING_AUTH',
  BLOCKED:       'BLOCKED',
  DRY_RUN_READY: 'DRY_RUN_READY',
  ERROR:         'ERROR',
});

export const COST_STATUS = Object.freeze({
  FREE_SAFE:         'FREE_SAFE',
  REQUIRES_APPROVAL: 'REQUIRES_APPROVAL',
  BLOCKED:           'BLOCKED',
});

export function createProviderDescriptor(fields = {}) {
  return Object.freeze({
    name:           fields.name ?? 'UNKNOWN',
    sourceType:     fields.sourceType ?? 'CUSTOM',
    mode:           fields.mode ?? PROVIDER_MODE.FIXTURE_MODE,
    status:         fields.status ?? PROVIDER_STATUS.DRY_RUN_READY,
    requiresToken:  fields.requiresToken ?? false,
    estimatedCost:  fields.estimatedCost ?? 0,
    costStatus:     fields.costStatus ?? COST_STATUS.FREE_SAFE,
    maxResults:     fields.maxResults ?? 50,
    rateLimit:      fields.rateLimit ?? { requestsPerMinute: 10, burstLimit: 20 },
    legalNotes:     fields.legalNotes ?? 'Public business data only',
    isReal: false,
  });
}

export const LEAD_DISCOVERY_PROVIDER_VERSION = '1.0.0';
