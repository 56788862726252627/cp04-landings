// AI Model Alias — ADV-16
// Agents request aliases, not concrete model names.

export const MODEL_ALIAS = Object.freeze({
  FAST:       'FAST',
  BALANCED:   'BALANCED',
  PREMIUM:    'PREMIUM',
  REASONING:  'REASONING',
  CODING:     'CODING',
  VISION:     'VISION',
  CHEAP:      'CHEAP',
  LOCAL:      'LOCAL',
  VOICE:      'VOICE',
});

const ALIAS_REQUIREMENTS = Object.freeze({
  [MODEL_ALIAS.FAST]:      { speedClass: 'VERY_FAST', minQuality: 'BASIC'    },
  [MODEL_ALIAS.BALANCED]:  { speedClass: 'FAST',      minQuality: 'STANDARD' },
  [MODEL_ALIAS.PREMIUM]:   { speedClass: 'NORMAL',    minQuality: 'HIGH'     },
  [MODEL_ALIAS.REASONING]: { capability: 'REASONING', minQuality: 'HIGH'     },
  [MODEL_ALIAS.CODING]:    { capability: 'CODING',    minQuality: 'STANDARD' },
  [MODEL_ALIAS.VISION]:    { capability: 'VISION',    minQuality: 'STANDARD' },
  [MODEL_ALIAS.CHEAP]:     { costClass: 'VERY_LOW',   minQuality: 'BASIC'    },
  [MODEL_ALIAS.LOCAL]:     { provider: 'local',       minQuality: 'BASIC'    },
  [MODEL_ALIAS.VOICE]:     { capability: 'VOICE_PLANNING', minQuality: 'STANDARD' },
});

export function resolveAlias(alias) {
  const req = ALIAS_REQUIREMENTS[alias];
  if (!req) {
    return Object.freeze({ resolved: false, alias, reason: 'UNKNOWN_ALIAS', isReal: false });
  }
  return Object.freeze({ resolved: true, alias, requirements: Object.freeze(req), isReal: false });
}

export function createAIModelAlias(alias, overrides = {}) {
  const base = resolveAlias(alias);
  return Object.freeze({ ...base, ...overrides, isReal: false });
}

export const AI_MODEL_ALIAS_VERSION = '1.0.0';
