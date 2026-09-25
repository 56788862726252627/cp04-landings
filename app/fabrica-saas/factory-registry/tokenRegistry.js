/**
 * Factory Registry — Token Registry V2
 * Re-exports design tokens for registry consumers.
 */

export {
  MOTION_DURATION,
  MOTION_EASING,
  MOTION_DISTANCE,
  MOTION_SPRING,
  STAGGER_DELAYS,
  INTERACTION_HOVER,
  INTERACTION_TAP,
  INTERACTION_FOCUS,
  DEPTH_LEVELS,
  ELEVATION,
  BLUR,
  GLASS,
  GRADIENT,
  DENSITY,
  TYPE_SCALE,
  FONT_WEIGHT,
  buildV2CssVars,
  DS_V2_VERSION,
} from '../core/designSystemV2/tokens.js';

export const TOKEN_REGISTRY = { source: '../core/designSystemV2/tokens.js', version: '2.0.0' };
