// AI Vertical Routing Presets — ADV-16
// No hardcoded model names — only aliases/quality targets.

import { ROUTING_MODE } from '../routing/aiRoutingMode.js';

export const VERTICAL_PRESET = Object.freeze({
  PADEL:      'PADEL',
  CLINIC:     'CLINIC',
  LEGAL:      'LEGAL',
  BEAUTY:     'BEAUTY',
  VETERINARY: 'VETERINARY',
  EDUCATION:  'EDUCATION',
  GENERIC:    'GENERIC',
});

const PRESETS = Object.freeze({
  [VERTICAL_PRESET.PADEL]: Object.freeze({
    routingMode:    ROUTING_MODE.BALANCED,
    qualityTarget:  'STANDARD',
    costPolicy:     'MONITORED',
    localPreference: false,
    notes:          'Booking/support focus. Moderate quality, latency-friendly.',
  }),
  [VERTICAL_PRESET.CLINIC]: Object.freeze({
    routingMode:    ROUTING_MODE.QUALITY_FIRST,
    qualityTarget:  'HIGH',
    costPolicy:     'MONITORED',
    localPreference: false,
    notes:          'Health domain. High quality. Privacy-aware.',
  }),
  [VERTICAL_PRESET.LEGAL]: Object.freeze({
    routingMode:    ROUTING_MODE.QUALITY_FIRST,
    qualityTarget:  'CRITICAL',
    costPolicy:     'MONITORED',
    localPreference: false,
    notes:          'Legal = CRITICAL quality + grounding required.',
  }),
  [VERTICAL_PRESET.BEAUTY]: Object.freeze({
    routingMode:    ROUTING_MODE.BALANCED,
    qualityTarget:  'STANDARD',
    costPolicy:     'MONITORED',
    localPreference: false,
    notes:          'Booking/content focus.',
  }),
  [VERTICAL_PRESET.VETERINARY]: Object.freeze({
    routingMode:    ROUTING_MODE.BALANCED,
    qualityTarget:  'STANDARD',
    costPolicy:     'MONITORED',
    localPreference: false,
    notes:          'Standard quality. Booking + support.',
  }),
  [VERTICAL_PRESET.EDUCATION]: Object.freeze({
    routingMode:    ROUTING_MODE.QUALITY_FIRST,
    qualityTarget:  'HIGH',
    costPolicy:     'MONITORED',
    localPreference: true,
    notes:          'Education: prefer local where capable. High accuracy.',
  }),
  [VERTICAL_PRESET.GENERIC]: Object.freeze({
    routingMode:    ROUTING_MODE.BALANCED,
    qualityTarget:  'STANDARD',
    costPolicy:     'MONITORED',
    localPreference: false,
    notes:          'Default balanced profile.',
  }),
});

export function getVerticalPreset(vertical) {
  const preset = PRESETS[vertical] ?? PRESETS[VERTICAL_PRESET.GENERIC];
  return Object.freeze({ vertical: vertical ?? VERTICAL_PRESET.GENERIC, ...preset, isReal: false });
}

export const AI_VERTICAL_PRESETS_VERSION = '1.0.0';
