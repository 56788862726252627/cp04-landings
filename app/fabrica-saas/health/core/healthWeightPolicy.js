// Health Weight Policy — ADV-20

import { HEALTH_DIMENSION } from './healthDimension.js';

export const WEIGHT_PROFILE = Object.freeze({
  SECURITY_FIRST:     'SECURITY_FIRST',
  BALANCED:           'BALANCED',
  PRODUCTION:         'PRODUCTION',
  AI_FOCUSED:         'AI_FOCUSED',
  BUSINESS_FOCUSED:   'BUSINESS_FOCUSED',
});

const DEFAULT_WEIGHTS = {
  [HEALTH_DIMENSION.SECURITY]:             20,
  [HEALTH_DIMENSION.CLIENT_ISOLATION]:     15,
  [HEALTH_DIMENSION.PRODUCTION_READINESS]: 15,
  [HEALTH_DIMENSION.BACKUPS]:              10,
  [HEALTH_DIMENSION.RESTORE]:              8,
  [HEALTH_DIMENSION.CI_CD]:               8,
  [HEALTH_DIMENSION.BUILD]:               6,
  [HEALTH_DIMENSION.TESTS]:               6,
  [HEALTH_DIMENSION.PRIVACY]:             5,
  [HEALTH_DIMENSION.BUSINESS_TRUTH]:      5,
  [HEALTH_DIMENSION.AGENTS]:              4,
  [HEALTH_DIMENSION.AI_ROUTER]:           4,
  [HEALTH_DIMENSION.OBSERVABILITY]:       4,
  [HEALTH_DIMENSION.GDPR]:               3,
  [HEALTH_DIMENSION.CMP]:               3,
  [HEALTH_DIMENSION.DEPLOYMENT]:          3,
  [HEALTH_DIMENSION.MULTIAGENT]:          3,
  [HEALTH_DIMENSION.MCP]:               2,
  [HEALTH_DIMENSION.SYSTEM]:              2,
  [HEALTH_DIMENSION.APPLICATION]:         2,
  [HEALTH_DIMENSION.RUNTIME]:            2,
  [HEALTH_DIMENSION.VOICE]:             1,
  [HEALTH_DIMENSION.CRM]:              1,
  [HEALTH_DIMENSION.LEADS]:            1,
  [HEALTH_DIMENSION.BROWSER_QA]:       1,
  [HEALTH_DIMENSION.SOCIAL]:           1,
  [HEALTH_DIMENSION.MEDIA]:            1,
};

const PROFILE_WEIGHTS = {
  [WEIGHT_PROFILE.SECURITY_FIRST]: {
    ...DEFAULT_WEIGHTS,
    [HEALTH_DIMENSION.SECURITY]: 30,
    [HEALTH_DIMENSION.PRIVACY]:  15,
    [HEALTH_DIMENSION.CLIENT_ISOLATION]: 20,
  },
  [WEIGHT_PROFILE.PRODUCTION]: {
    ...DEFAULT_WEIGHTS,
    [HEALTH_DIMENSION.PRODUCTION_READINESS]: 25,
    [HEALTH_DIMENSION.BUILD]: 12,
    [HEALTH_DIMENSION.CI_CD]: 12,
  },
  [WEIGHT_PROFILE.AI_FOCUSED]: {
    ...DEFAULT_WEIGHTS,
    [HEALTH_DIMENSION.AI_ROUTER]: 10,
    [HEALTH_DIMENSION.AGENTS]: 10,
    [HEALTH_DIMENSION.MULTIAGENT]: 8,
    [HEALTH_DIMENSION.MCP]: 6,
  },
  [WEIGHT_PROFILE.BUSINESS_FOCUSED]: {
    ...DEFAULT_WEIGHTS,
    [HEALTH_DIMENSION.BUSINESS_TRUTH]: 12,
    [HEALTH_DIMENSION.CRM]: 8,
    [HEALTH_DIMENSION.LEADS]: 6,
  },
};
PROFILE_WEIGHTS[WEIGHT_PROFILE.BALANCED] = DEFAULT_WEIGHTS;

export function createHealthWeightPolicy(config = {}) {
  const {
    profile = WEIGHT_PROFILE.BALANCED,
    overrides = {},
  } = config;

  const base = PROFILE_WEIGHTS[profile] || DEFAULT_WEIGHTS;
  const weights = { ...base, ...overrides };

  return Object.freeze({
    profile,
    weights: Object.freeze({ ...weights }),
    get(dimension) { return weights[dimension] ?? 1; },
    isReal: false,
  });
}

export const HEALTH_WEIGHT_POLICY_VERSION = '1.0.0';
