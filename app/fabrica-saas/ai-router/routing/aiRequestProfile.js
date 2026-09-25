// AI Request Profile — ADV-16

export const QUALITY_TARGET_LEVEL = Object.freeze({
  BASIC:    'BASIC',
  STANDARD: 'STANDARD',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const LATENCY_TARGET = Object.freeze({
  REALTIME: 'REALTIME',  // <500ms
  LOW:      'LOW',       // <2s
  NORMAL:   'NORMAL',    // <10s
  RELAXED:  'RELAXED',   // >10s ok
});

export const COST_SENSITIVITY = Object.freeze({
  NONE:   'NONE',
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
});

export const PRIVACY_LEVEL = Object.freeze({
  PUBLIC_SAFE:       'PUBLIC_SAFE',
  BUSINESS_INTERNAL: 'BUSINESS_INTERNAL',
  PERSONAL:          'PERSONAL',
  SENSITIVE:         'SENSITIVE',
  RESTRICTED:        'RESTRICTED',
});

export const CONTEXT_SIZE_CLASS = Object.freeze({
  SMALL:     'SMALL',
  MEDIUM:    'MEDIUM',
  LARGE:     'LARGE',
  VERY_LARGE:'VERY_LARGE',
});

export function createAIRequestProfile(config = {}) {
  const {
    taskType                 = 'SIMPLE_CHAT',
    requiredCapabilities     = [],
    qualityTarget            = QUALITY_TARGET_LEVEL.STANDARD,
    latencyTarget            = LATENCY_TARGET.NORMAL,
    costSensitivity          = COST_SENSITIVITY.MEDIUM,
    privacyLevel             = PRIVACY_LEVEL.PUBLIC_SAFE,
    contextSizeClass         = CONTEXT_SIZE_CLASS.SMALL,
    requiresTools            = false,
    requiresVision           = false,
    requiresStructuredOutput = false,
    clientId                 = null,
    vertical                 = 'GENERIC',
    fallbackAllowed          = true,
    modelAlias               = null,
  } = config;

  return Object.freeze({
    taskType,
    requiredCapabilities:    Object.freeze([...requiredCapabilities]),
    qualityTarget,
    latencyTarget,
    costSensitivity,
    privacyLevel,
    contextSizeClass,
    requiresTools,
    requiresVision,
    requiresStructuredOutput,
    clientId,
    vertical,
    fallbackAllowed,
    modelAlias,
    isReal: false,
  });
}

export const AI_REQUEST_PROFILE_VERSION = '1.0.0';
