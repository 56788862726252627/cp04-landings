// Media Safe Area Policy — ADV-13

export const SAFE_AREA_ZONE = Object.freeze({
  TOP:    'TOP',
  BOTTOM: 'BOTTOM',
  LEFT:   'LEFT',
  RIGHT:  'RIGHT',
  CENTER: 'CENTER',
});

const VERTICAL_SAFE_AREAS = Object.freeze({
  topPct:    0.20,
  bottomPct: 0.30,
  sidePct:   0.10,
  safeCenterStart: 0.20,
  safeCenterEnd:   0.70,
});

const HORIZONTAL_SAFE_AREAS = Object.freeze({
  topPct:    0.10,
  bottomPct: 0.15,
  sidePct:   0.05,
  safeCenterStart: 0.10,
  safeCenterEnd:   0.85,
});

export function getSafeAreaPolicy(aspectRatio) {
  const isVertical = aspectRatio === '9:16';
  const zones = isVertical ? VERTICAL_SAFE_AREAS : HORIZONTAL_SAFE_AREAS;
  return Object.freeze({ aspectRatio, ...zones, isReal: false });
}

export function validateOverlayPosition(aspectRatio, positionPct) {
  const policy = getSafeAreaPolicy(aspectRatio);
  const { topPct, bottomPct, sidePct } = policy;
  const { x = 0.5, y = 0.5 } = positionPct;
  if (y < topPct)      return Object.freeze({ valid: false, reason: 'OVERLAP_TOP_UI', isReal: false });
  if (y > 1 - bottomPct) return Object.freeze({ valid: false, reason: 'OVERLAP_BOTTOM_UI', isReal: false });
  if (x < sidePct || x > 1 - sidePct) return Object.freeze({ valid: false, reason: 'TOO_CLOSE_TO_EDGE', isReal: false });
  return Object.freeze({ valid: true, isReal: false });
}

export const MEDIA_SAFE_AREA_POLICY_VERSION = '1.0.0';
