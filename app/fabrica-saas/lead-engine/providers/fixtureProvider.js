// Fixture Provider — ADV-08

import { PROVIDER_MODE, PROVIDER_STATUS, COST_STATUS, createProviderDescriptor } from './leadDiscoveryProvider.js';
import { LEAD_SOURCE_TYPE } from '../leadModel.js';

export function createFixtureProvider() {
  return createProviderDescriptor({
    name:          'FIXTURE',
    sourceType:    LEAD_SOURCE_TYPE.FIXTURE,
    mode:          PROVIDER_MODE.FIXTURE_MODE,
    status:        PROVIDER_STATUS.READY,
    requiresToken: false,
    estimatedCost: 0,
    costStatus:    COST_STATUS.FREE_SAFE,
    maxResults:    200,
    legalNotes:    'Fixture data only — no real business data. Safe for testing.',
  });
}

export function fetchFromFixtures(fixtures = [], searchProfile = {}) {
  let results = [...fixtures];

  if (searchProfile.vertical && searchProfile.vertical !== 'default') {
    results = results.filter(f => (f.vertical ?? '').toLowerCase() === searchProfile.vertical.toLowerCase());
  }
  if (searchProfile.locations && searchProfile.locations.length > 0) {
    const locs = searchProfile.locations.map(l => l.toLowerCase());
    results = results.filter(f =>
      locs.some(loc => (f.location ?? '').toLowerCase().includes(loc))
    );
  }
  if (searchProfile.maxResults) {
    results = results.slice(0, searchProfile.maxResults);
  }

  return Object.freeze({
    provider:      'FIXTURE',
    sourceType:    LEAD_SOURCE_TYPE.FIXTURE,
    rawCount:      fixtures.length,
    acceptedCount: results.length,
    rejectedCount: fixtures.length - results.length,
    leads:         Object.freeze(results),
    isReal: false,
  });
}

export const FIXTURE_PROVIDER_VERSION = '1.0.0';
