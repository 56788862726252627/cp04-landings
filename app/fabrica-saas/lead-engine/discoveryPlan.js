// Discovery Plan — ADV-08

import { PROVIDER_STATUS, COST_STATUS } from './providers/leadDiscoveryProvider.js';

export const PLAN_STATUS = Object.freeze({
  READY:         'READY',
  WAITING_AUTH:  'WAITING_AUTH',
  BLOCKED:       'BLOCKED',
  DRY_RUN_READY: 'DRY_RUN_READY',
});

export function buildLeadDiscoveryPlan(searchProfile = {}, providers = []) {
  const sources = [];
  const manualActions = [];
  let estimatedCost = 0;
  let expectedResults = 0;
  let risk = 'LOW';

  for (const provider of providers) {
    if (provider.status === PROVIDER_STATUS.READY || provider.status === PROVIDER_STATUS.DRY_RUN_READY) {
      sources.push({
        name:       provider.name,
        sourceType: provider.sourceType,
        mode:       provider.mode,
        maxResults: Math.min(provider.maxResults ?? 50, searchProfile.maxResults ?? 50),
        costStatus: provider.costStatus,
      });
      expectedResults += Math.min(provider.maxResults ?? 50, searchProfile.maxResults ?? 50);
      if (provider.estimatedCost) estimatedCost += provider.estimatedCost;
      if (provider.costStatus === COST_STATUS.REQUIRES_APPROVAL) risk = 'MEDIUM';
      if (provider.costStatus === COST_STATUS.BLOCKED) risk = 'HIGH';
    } else if (provider.status === PROVIDER_STATUS.WAITING_AUTH) {
      manualActions.push(`Authorize provider: ${provider.name} — token required`);
    }
  }

  const hasAnySource = sources.length > 0;
  const allBlocked   = sources.every(s => s.costStatus === COST_STATUS.BLOCKED);

  const status = !hasAnySource ? PLAN_STATUS.WAITING_AUTH
    : allBlocked ? PLAN_STATUS.BLOCKED
    : estimatedCost > 0 ? PLAN_STATUS.WAITING_AUTH
    : sources.some(s => s.mode === 'FIXTURE_MODE' || s.mode === 'DRY_RUN') ? PLAN_STATUS.DRY_RUN_READY
    : PLAN_STATUS.READY;

  return Object.freeze({
    status,
    sources:         Object.freeze(sources),
    queries:         buildQueryList(searchProfile),
    limits: Object.freeze({ maxTotal: searchProfile.maxResults ?? 50, perSource: 50 }),
    risk,
    expectedResults: Math.min(expectedResults, searchProfile.maxResults ?? 50),
    estimatedCost,
    manualActions:   Object.freeze(manualActions),
    isReal: false,
  });
}

function buildQueryList(profile = {}) {
  const locs  = profile.locations ?? ['(location not set)'];
  const vert  = profile.vertical ?? 'negocios';
  return locs.map(loc => `${vert} en ${loc}`);
}

export const DISCOVERY_PLAN_VERSION = '1.0.0';
