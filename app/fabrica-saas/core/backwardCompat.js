/**
 * Factory Backward Compatibility Layer V2
 * Guarantees that V1 manifests and calls work unchanged with V2 internals.
 */

import { EXPERIENCE_PRESETS, resolvePreset as resolvePresetV1 } from './dynamicExperience/presets.js';
import { EXPERIENCE_PRESETS_V2 }   from './dynamicExperience/presetsV2.js';
import { migrateV1PresetId }       from '../factory-registry/compatibility.js';

// ─── V1 API shim ──────────────────────────────────────────────────────────────

/**
 * resolvePreset — V1-compatible API that also handles V2 preset IDs.
 */
export function resolvePreset(idOrManifest) {
  if (typeof idOrManifest === 'string') {
    const id = idOrManifest;
    if (id in EXPERIENCE_PRESETS_V2) return EXPERIENCE_PRESETS_V2[id];
    if (id in EXPERIENCE_PRESETS)    return EXPERIENCE_PRESETS[id];
    const migrated = migrateV1PresetId(id);
    if (migrated) return EXPERIENCE_PRESETS_V2[migrated];
    return EXPERIENCE_PRESETS['subtle']; // safe default
  }
  // Object manifest — use old V1 resolver
  return resolvePresetV1(idOrManifest);
}

// ─── Export V1 APIs unchanged ─────────────────────────────────────────────────

export {
  EXPERIENCE_PRESETS,
  MOTION_INTENSITY_VALUES,
  TRANSITION_SPEED_VALUES,
  HOVER_DEPTH_VALUES,
  CARD_MOTION_VALUES,
  HERO_MOTION_VALUES,
  VIDEO_BEHAVIOR_VALUES,
  REDUCED_MOTION_FALLBACK_VALUES,
  SCROLL_EFFECT_CATALOG,
  buildPresetCssVars,
  getSupportedPresets,
  isValidPreset,
} from './dynamicExperience/presets.js';

export {
  VERTICAL_EXPERIENCE_MAP,
  HERO_TYPES,
  INTERACTION_CATALOG,
  getVerticalExperience,
  getMappedVerticals,
  getDefaultPresetForVertical,
} from './dynamicExperience/verticalMapping.js';

export {
  TRANSITION_DURATION,
  EASING,
  MOTION_INTENSITY_LEVELS,
  SCROLL_EFFECTS,
} from './dynamicExperience/motionConfig.js';

export {
  PERFORMANCE_BUDGET,
  checkPerformanceBudget,
} from './dynamicExperience/performanceBudget.js';

export {
  INTERACTION_DEFINITIONS,
} from './dynamicExperience/interactionEngine.js';

// ─── Version table ────────────────────────────────────────────────────────────

export const COMPATIBILITY_TABLE = Object.freeze({
  'resolvePreset':          { v1: true, v2: true, breaking: false },
  'EXPERIENCE_PRESETS':     { v1: true, v2: false, note: 'V1 presets. Use EXPERIENCE_PRESETS_V2 for new work.' },
  'EXPERIENCE_PRESETS_V2':  { v1: false, v2: true },
  'checkPerformanceBudget': { v1: true, v2: true, note: 'V2 extends via checkPerformanceBudgetV2' },
  'resolveExperience':      { v1: false, v2: true, note: 'New in V2 — replaces manual preset resolution' },
  'INTERACTION_DEFINITIONS':{ v1: true, v2: true, breaking: false },
});

export const BACKWARD_COMPAT_VERSION = '2.0.0';
