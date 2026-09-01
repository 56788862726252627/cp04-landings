// Apify Lead Provider — Foundation (DRY_RUN / FIXTURE_MODE) — ADV-08

import { PROVIDER_MODE, PROVIDER_STATUS, COST_STATUS, createProviderDescriptor } from './leadDiscoveryProvider.js';
import { LEAD_SOURCE_TYPE } from '../leadModel.js';

const APIFY_RATE_LIMIT = Object.freeze({ requestsPerMinute: 5, burstLimit: 10 });

export function createApifyProviderConfig(envConfig = {}) {
  const hasToken = Boolean(envConfig.APIFY_TOKEN && envConfig.APIFY_TOKEN.length > 5);
  const maxBudget = envConfig.maxRunBudget       ?? 0;
  const maxItems  = envConfig.maxDatasetItems    ?? 100;
  const maxRuns   = envConfig.maxActorRuns       ?? 1;

  const mode    = hasToken ? PROVIDER_MODE.LIVE : PROVIDER_MODE.FIXTURE_MODE;
  const status  = hasToken ? PROVIDER_STATUS.READY : PROVIDER_STATUS.DRY_RUN_READY;
  const costSt  = hasToken && maxBudget > 0 ? COST_STATUS.REQUIRES_APPROVAL : COST_STATUS.FREE_SAFE;

  return Object.freeze({
    ...createProviderDescriptor({
      name:          'APIFY',
      sourceType:    LEAD_SOURCE_TYPE.APIFY,
      mode,
      status,
      requiresToken: true,
      estimatedCost: hasToken ? maxBudget : 0,
      costStatus:    costSt,
      maxResults:    maxItems,
      rateLimit:     APIFY_RATE_LIMIT,
      legalNotes:    'Use only public business data. Respect actor terms. Review Apify ToS before live use.',
    }),
    hasToken,
    maxRunBudget:    maxBudget,
    maxDatasetItems: maxItems,
    maxActorRuns:    maxRuns,
  });
}

export function validateApifyConfig(config = {}) {
  const errors  = [];
  const warnings= [];
  if (!config.hasToken) errors.push('APIFY_TOKEN not configured — fixture/dry-run mode only');
  if (config.maxRunBudget === 0 && config.hasToken) warnings.push('maxRunBudget=0 — no live run will execute');
  if (config.maxDatasetItems > 500) warnings.push('maxDatasetItems >500 may incur significant cost');
  return Object.freeze({ valid: errors.length === 0, errors, warnings, isReal: false });
}

export function buildApifyInput(searchProfile = {}) {
  return Object.freeze({
    query:        searchProfile.query ?? `${searchProfile.vertical ?? 'negocio'} en ${(searchProfile.locations ?? []).join(', ')}`,
    location:     (searchProfile.locations ?? [])[0] ?? '',
    vertical:     searchProfile.vertical ?? 'default',
    maxResults:   searchProfile.maxResults ?? 50,
    language:     'es',
    note:         'DRY_RUN — no real Apify actor will be called without explicit authorization',
    isReal: false,
  });
}

export function estimateApifyRunRisk(config = {}, searchProfile = {}) {
  if (!config.hasToken) return Object.freeze({ risk: 'NONE', reason: 'No token — fixture mode', costStatus: COST_STATUS.FREE_SAFE, isReal: false });
  if (config.maxRunBudget === 0) return Object.freeze({ risk: 'NONE', reason: 'maxRunBudget=0 blocks live run', costStatus: COST_STATUS.FREE_SAFE, isReal: false });
  const estimated = ((searchProfile.maxResults ?? 50) / 100) * 0.5;
  return Object.freeze({
    risk:        estimated > config.maxRunBudget ? 'HIGH' : 'LOW',
    estimatedUSD: estimated,
    costStatus:  estimated > config.maxRunBudget ? COST_STATUS.BLOCKED : COST_STATUS.REQUIRES_APPROVAL,
    isReal: false,
  });
}

export function normalizeApifyResult(raw = {}) {
  return Object.freeze({
    businessName:  raw.name ?? raw.title ?? '',
    website:       raw.website ?? raw.url ?? '',
    publicEmail:   raw.email ?? '',
    publicPhone:   raw.phone ?? raw.phoneNumber ?? '',
    location:      raw.city ?? raw.address ?? '',
    vertical:      raw.category ?? raw.type ?? 'default',
    source:        LEAD_SOURCE_TYPE.APIFY,
    sourceType:    LEAD_SOURCE_TYPE.APIFY,
    sourceUrl:     raw.pageUrl ?? raw.sourceUrl ?? '',
    externalId:    raw.id ?? raw.placeId ?? '',
    socialProfiles:{
      google_maps:  raw.placeUrl ?? '',
      facebook:     raw.facebook ?? '',
    },
    isReal: false,
  });
}

export function getApifyUsageEstimate(config = {}, itemCount = 0) {
  if (!config.hasToken) return Object.freeze({ estimatedUSD: 0, freeTierAvailable: true, note: 'No token — $0 cost', isReal: false });
  const est = (itemCount / 1000) * 2.5;
  return Object.freeze({
    estimatedUSD:      parseFloat(est.toFixed(4)),
    freeTierAvailable: est < 5,
    maxDatasetItems:   config.maxDatasetItems,
    note:              'Estimate only — actual cost depends on actor and dataset size',
    isReal: false,
  });
}

export const APIFY_PROVIDER_VERSION = '1.0.0';
