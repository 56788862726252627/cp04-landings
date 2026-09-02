// Client Business Override — per-client isolated truth — ADV-10b

import { createBusinessSourceOfTruth } from './businessSourceOfTruth.js';

const CLIENT_REGISTRY = new Map();

export function registerClientBusinessTruth(clientId = '', config = {}) {
  const truth = createBusinessSourceOfTruth({ clientId, ...config });
  CLIENT_REGISTRY.set(clientId, truth);
  return truth;
}

export function getClientBusinessTruth(clientId = '') {
  return CLIENT_REGISTRY.get(clientId) ?? null;
}

export function hasClientBusinessTruth(clientId = '') {
  return CLIENT_REGISTRY.has(clientId);
}

export function clearClientRegistry() {
  CLIENT_REGISTRY.clear();
}

// Pre-registered fixture clients — isolated, no cross-contamination
export const FIXTURE_CLIENT_PADEL = registerClientBusinessTruth('cp04-padel', {
  vertical: 'padel',
  name: 'Club Pádel 04 (Fixture)',
  facts: [],
});

export const FIXTURE_CLIENT_DENTAL = registerClientBusinessTruth('dental-fixture', {
  vertical: 'dental',
  name: 'Clínica Dental Fixture',
  facts: [],
});

export const CLIENT_BUSINESS_OVERRIDE_VERSION = '1.0.0';
