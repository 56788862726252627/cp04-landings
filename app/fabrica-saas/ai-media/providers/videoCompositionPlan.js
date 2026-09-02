// Video Composition Plan — ADV-13

export const COMPOSITION_LAYER = Object.freeze({
  BACKGROUND:   'BACKGROUND',
  AVATAR:       'AVATAR',
  BROLL:        'BROLL',
  BRAND:        'BRAND',
  CAPTIONS:     'CAPTIONS',
  HEADLINE:     'HEADLINE',
  CTA:          'CTA',
  MUSIC:        'MUSIC',
  TRANSITION:   'TRANSITION',
  END_CARD:     'END_CARD',
});

const LAYER_ORDER = [
  COMPOSITION_LAYER.BACKGROUND,
  COMPOSITION_LAYER.BROLL,
  COMPOSITION_LAYER.AVATAR,
  COMPOSITION_LAYER.BRAND,
  COMPOSITION_LAYER.CAPTIONS,
  COMPOSITION_LAYER.HEADLINE,
  COMPOSITION_LAYER.CTA,
  COMPOSITION_LAYER.MUSIC,
  COMPOSITION_LAYER.TRANSITION,
  COMPOSITION_LAYER.END_CARD,
];

export function createVideoCompositionPlan(config = {}) {
  if (!config.channel)  throw new Error('VideoCompositionPlan requires channel');
  if (!config.duration) throw new Error('VideoCompositionPlan requires duration');
  const layers = (config.layers ?? LAYER_ORDER).map((layer, i) =>
    Object.freeze({ layer, zIndex: i, enabled: true })
  );
  return Object.freeze({
    channel:  config.channel,
    duration: config.duration,
    layers:   Object.freeze(layers),
    isReal:   false,
  });
}

export const VIDEO_COMPOSITION_PLAN_VERSION = '1.0.0';
