/**
 * Factory Registry — Preset Registry V2
 * Combines V1 and V2 presets in a unified catalog.
 */

import { EXPERIENCE_PRESETS }         from '../core/dynamicExperience/presets.js';
import { EXPERIENCE_PRESETS_V2, listV2Presets } from '../core/dynamicExperience/presetsV2.js';

export const PRESET_REGISTRY = Object.freeze({
  v1: Object.freeze(Object.keys(EXPERIENCE_PRESETS).map(id => ({
    id,
    version: '1.7',
    preset: EXPERIENCE_PRESETS[id],
  }))),
  v2: Object.freeze(listV2Presets().map(id => ({
    id,
    version: '2.0',
    preset: EXPERIENCE_PRESETS_V2[id],
  }))),
});

export function getAllPresetIds() {
  return [
    ...Object.keys(EXPERIENCE_PRESETS),
    ...listV2Presets(),
  ];
}

export function getPreset(id) {
  if (id in EXPERIENCE_PRESETS_V2) return { version: '2.0', preset: EXPERIENCE_PRESETS_V2[id] };
  if (id in EXPERIENCE_PRESETS)    return { version: '1.7', preset: EXPERIENCE_PRESETS[id] };
  return null;
}
