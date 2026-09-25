/**
 * Factory Registry — Interaction Registry V2
 * Maps preset × component × interaction to recommended settings.
 */
import { INTERACTION_HOVER, INTERACTION_TAP } from '../core/designSystemV2/tokens.js';

export const INTERACTION_REGISTRY = Object.freeze({
  byPreset: {
    'minimal-premium':        { hover: INTERACTION_HOVER.subtle,   tap: INTERACTION_TAP.subtle,  focus: 'ring' },
    'clinical-premium':       { hover: INTERACTION_HOVER.subtle,   tap: INTERACTION_TAP.subtle,  focus: 'ring' },
    'luxury-editorial':       { hover: INTERACTION_HOVER.lift,     tap: INTERACTION_TAP.medium,  focus: 'glow' },
    'sports-dynamic':         { hover: INTERACTION_HOVER.deep,     tap: INTERACTION_TAP.strong,  focus: 'ring' },
    'tech-futuristic':        { hover: INTERACTION_HOVER.deep,     tap: INTERACTION_TAP.medium,  focus: 'glow' },
    'education-interactive':  { hover: INTERACTION_HOVER.moderate, tap: INTERACTION_TAP.medium,  focus: 'ring' },
    'professional-authority': { hover: INTERACTION_HOVER.none,     tap: INTERACTION_TAP.subtle,  focus: 'ring' },
    'friendly-human':         { hover: INTERACTION_HOVER.moderate, tap: INTERACTION_TAP.medium,  focus: 'ring' },
    'immersive-showcase':     { hover: INTERACTION_HOVER.lift,     tap: INTERACTION_TAP.strong,  focus: 'glow' },
    'data-heavy-saas':        { hover: INTERACTION_HOVER.subtle,   tap: INTERACTION_TAP.subtle,  focus: 'ring' },
  },
  defaults: {
    hover: INTERACTION_HOVER.subtle,
    tap:   INTERACTION_TAP.subtle,
    focus: 'ring',
  },
});

export function getInteractionForPreset(presetId) {
  return INTERACTION_REGISTRY.byPreset[presetId] ?? INTERACTION_REGISTRY.defaults;
}
