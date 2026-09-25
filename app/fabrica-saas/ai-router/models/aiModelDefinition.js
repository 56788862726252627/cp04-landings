// AI Model Definition — ADV-16

export const MODEL_STATUS = Object.freeze({
  AVAILABLE:   'AVAILABLE',
  DEPRECATED:  'DEPRECATED',
  DISABLED:    'DISABLED',
  UNAVAILABLE: 'UNAVAILABLE',
  PREVIEW:     'PREVIEW',
});

export const CONTEXT_CLASS = Object.freeze({
  SMALL:     'SMALL',      // <16k
  MEDIUM:    'MEDIUM',     // 16-64k
  LARGE:     'LARGE',      // 64-200k
  VERY_LARGE:'VERY_LARGE', // 200k+
});

export const QUALITY_CLASS = Object.freeze({
  BASIC:    'BASIC',
  STANDARD: 'STANDARD',
  HIGH:     'HIGH',
  PREMIUM:  'PREMIUM',
});

export const SPEED_CLASS = Object.freeze({
  VERY_FAST: 'VERY_FAST',
  FAST:      'FAST',
  NORMAL:    'NORMAL',
  SLOW:      'SLOW',
});

export const COST_CLASS = Object.freeze({
  FREE:     'FREE',
  VERY_LOW: 'VERY_LOW',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  UNKNOWN:  'UNKNOWN',
});

export const PRIVACY_CLASS = Object.freeze({
  PUBLIC_SAFE:       'PUBLIC_SAFE',
  BUSINESS_INTERNAL: 'BUSINESS_INTERNAL',
  PERSONAL:          'PERSONAL',
  SENSITIVE:         'SENSITIVE',
  RESTRICTED:        'RESTRICTED',
});

export function createAIModelDefinition(config = {}) {
  const {
    provider              = 'unknown',
    modelId               = 'unknown',
    displayName           = 'Unknown Model',
    capabilities          = [],
    contextClass          = CONTEXT_CLASS.MEDIUM,
    qualityClass          = QUALITY_CLASS.STANDARD,
    speedClass            = SPEED_CLASS.NORMAL,
    costClass             = COST_CLASS.UNKNOWN,
    privacyClass          = PRIVACY_CLASS.PUBLIC_SAFE,
    availability          = MODEL_STATUS.AVAILABLE,
    structuredOutput      = false,
    tools                 = false,
    vision                = false,
    audio                 = false,
    status                = MODEL_STATUS.AVAILABLE,
  } = config;

  return Object.freeze({
    provider,
    modelId,
    displayName,
    capabilities:    Object.freeze([...capabilities]),
    contextClass,
    qualityClass,
    speedClass,
    costClass,
    privacyClass,
    availability,
    structuredOutput,
    tools,
    vision,
    audio,
    status,
    isReal: false,
  });
}

export const AI_MODEL_DEFINITION_VERSION = '1.0.0';
