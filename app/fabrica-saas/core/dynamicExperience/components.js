/**
 * Factory Dynamic Experience Engine — Component Configuration V1.7
 *
 * Pure functions for generating component styles, configs and variants.
 * Testable in Node (no JSX, no browser APIs).
 *
 * The actual React JSX components are in core/ui/DynamicComponents.jsx.
 * These pure functions provide the logic layer that components consume.
 */

// ─── AnimatedMetric ───────────────────────────────────────────────────────────

/**
 * Build style config for an AnimatedMetric component.
 * @param {Object} opts
 * @param {number|string} opts.value - numeric value to animate to
 * @param {string} [opts.label] - metric label
 * @param {string} [opts.unit] - unit suffix (%, €, +, etc.)
 * @param {string} [opts.preset] - experience preset name
 * @param {boolean} [opts.reducedMotion]
 * @returns {Object}
 */
export function getAnimatedMetricConfig({
  value, label = '', unit = '', reducedMotion = false,
} = {}) {
  const duration = reducedMotion ? 0 : 2000;
  return {
    value:      parseFloat(value) || 0,
    label,
    unit,
    duration,
    easing:     'ease-out',
    startFrom:  0,
    format:     (n) => unit ? `${Math.round(n)}${unit}` : String(Math.round(n)),
    cssClass:   'exp-animated-metric',
    style: {
      fontVariantNumeric: 'tabular-nums',
      transition:         reducedMotion ? 'none' : 'opacity 0.4s ease-out',
    },
  };
}

// ─── Reveal ───────────────────────────────────────────────────────────────────

export const REVEAL_VARIANTS = ['fade', 'slide-up', 'slide-right', 'scale', 'none'];

/**
 * Get styles for a Reveal component in its initial (hidden) state.
 */
export function getRevealInitialStyle(variant = 'slide-up', reducedMotion = false) {
  if (reducedMotion || variant === 'none') return {};
  const variants = {
    fade:        { opacity: 0 },
    'slide-up':  { opacity: 0, transform: 'translateY(28px)' },
    'slide-right': { opacity: 0, transform: 'translateX(-24px)' },
    scale:       { opacity: 0, transform: 'scale(0.95)' },
  };
  return variants[variant] ?? variants['slide-up'];
}

/**
 * Get styles for a Reveal component in its revealed (visible) state.
 */
export function getRevealAnimatedStyle(duration = 400, easing = 'ease-out', delay = 0) {
  return {
    opacity:    1,
    transform:  'none',
    transition: `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`,
  };
}

// ─── StaggerGroup ─────────────────────────────────────────────────────────────

/**
 * Calculate stagger delay for each child in a group.
 * @param {number} index - child index
 * @param {number} staggerMs - delay between each child (ms)
 * @param {number} maxChildren - cap to avoid excessive delay
 */
export function getStaggerDelay(index, staggerMs = 80, maxChildren = 12) {
  return Math.min(index, maxChildren - 1) * staggerMs;
}

// ─── InteractiveCard ──────────────────────────────────────────────────────────

export const CARD_MOTION_STYLES = Object.freeze({
  none:          { transition: 'none' },
  'subtle-lift': {
    transition:  'transform 250ms ease-out, box-shadow 250ms ease-out',
    cursor:      'pointer',
    hover: {
      transform:  'translateY(-4px)',
      boxShadow:  'var(--exp-hover-shadow, 0 12px 40px rgba(0,0,0,0.10))',
    },
  },
  tilt: {
    transition:  'transform 200ms ease-out',
    cursor:      'pointer',
    hover: { transform: 'perspective(600px) rotateX(3deg) rotateY(-3deg)' },
  },
  glow: {
    transition:  'box-shadow 300ms ease-out',
    cursor:      'pointer',
    hover: { boxShadow: '0 0 32px rgba(var(--primary-rgb, 12,120,115), 0.25)' },
  },
  'scale-up': {
    transition:  'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    cursor:      'pointer',
    hover: { transform: 'scale(1.03)' },
  },
});

/**
 * Get card motion config for a given card motion type.
 * Reduced motion gets border highlight instead of transform.
 */
export function getCardMotionConfig(cardMotion = 'subtle-lift', reducedMotion = false) {
  if (reducedMotion) {
    return {
      transition: 'border-color 200ms ease',
      hover: { borderColor: 'var(--primary)' },
      reducedMotion: true,
    };
  }
  return CARD_MOTION_STYLES[cardMotion] ?? CARD_MOTION_STYLES['subtle-lift'];
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────

/**
 * Calculate SVG circle props for a ProgressRing component.
 * @param {number} percent - 0–100
 * @param {number} radius - circle radius in SVG units
 * @param {number} strokeWidth
 * @returns {{ circumference, dashoffset, viewBox, cx, cy, r }}
 */
export function getProgressRingProps(percent = 0, radius = 40, strokeWidth = 8) {
  const normalised    = Math.max(0, Math.min(100, percent));
  const circumference = 2 * Math.PI * radius;
  const dashoffset    = circumference - (normalised / 100) * circumference;
  const size          = (radius + strokeWidth) * 2;
  return {
    circumference,
    dashoffset,
    viewBox:     `0 0 ${size} ${size}`,
    cx:          size / 2,
    cy:          size / 2,
    r:           radius,
    strokeWidth,
    size,
    percent:     normalised,
  };
}

// ─── AnimatedTimeline ─────────────────────────────────────────────────────────

/**
 * Build timeline step styles for an AnimatedTimeline.
 * @param {Object[]} steps - array of { label, description, date?, icon? }
 * @param {boolean} reducedMotion
 * @returns {Object[]}
 */
export function buildTimelineSteps(steps = [], reducedMotion = false) {
  return steps.map((step, i) => ({
    ...step,
    index:   i,
    delay:   reducedMotion ? 0 : i * 120,
    initial: reducedMotion ? {} : { opacity: 0, transform: 'translateX(-20px)' },
    animate: { opacity: 1, transform: 'none' },
    isLast:  i === steps.length - 1,
  }));
}

// ─── SmartCarousel ────────────────────────────────────────────────────────────

/**
 * Get carousel navigation state for a given number of slides.
 */
export function getCarouselState(totalSlides, currentIndex = 0) {
  return {
    current:    Math.max(0, Math.min(currentIndex, totalSlides - 1)),
    total:      totalSlides,
    canPrev:    currentIndex > 0,
    canNext:    currentIndex < totalSlides - 1,
    progress:   totalSlides > 1 ? currentIndex / (totalSlides - 1) : 0,
    trackStyle: { transform: `translateX(-${currentIndex * 100}%)`, transition: 'transform 400ms ease-out' },
  };
}

// ─── BeforeAfter ─────────────────────────────────────────────────────────────

/**
 * Compute clipping style for before/after comparison at a given position (0–1).
 */
export function getBeforeAfterClipStyle(position = 0.5, reducedMotion = false) {
  const pct = Math.max(0, Math.min(1, position)) * 100;
  return {
    before: {
      clipPath:   `inset(0 ${100 - pct}% 0 0)`,
      transition: reducedMotion ? 'none' : 'clip-path 0ms linear',
    },
    after: {
      clipPath:   `inset(0 0 0 ${pct}%)`,
      transition: reducedMotion ? 'none' : 'clip-path 0ms linear',
    },
    divider: {
      left: `${pct}%`,
    },
  };
}

// ─── DynamicHero ─────────────────────────────────────────────────────────────

export const HERO_MOTION_CONFIGS = Object.freeze({
  none:            { containerClass: 'exp-hero', animation: 'none' },
  fade:            { containerClass: 'exp-hero exp-hero--fade', animation: 'fade-in 0.6s ease-out forwards' },
  'slide-up':      { containerClass: 'exp-hero exp-hero--slide-up', animation: 'slide-up 0.7s ease-out forwards' },
  'gradient-shift': { containerClass: 'exp-hero exp-hero--gradient', animation: 'gradient-shift 8s ease infinite' },
  parallax:        { containerClass: 'exp-hero exp-hero--parallax', animation: 'none', requiresJS: true },
  video:           { containerClass: 'exp-hero exp-hero--video', animation: 'none', requiresJS: false },
});

/**
 * Get hero configuration for a given motion type and vertical.
 */
export function getHeroConfig(heroMotion = 'fade', vertical = 'dental', reducedMotion = false) {
  const effectiveMotion = reducedMotion ? 'fade' : heroMotion;
  const config = HERO_MOTION_CONFIGS[effectiveMotion] ?? HERO_MOTION_CONFIGS.fade;
  return {
    ...config,
    vertical,
    reducedMotion,
  };
}

// ─── ScrollProgress ───────────────────────────────────────────────────────────

/**
 * Calculate scroll progress indicator width.
 * @param {number} scrollY - current scroll position
 * @param {number} docHeight - total document height
 * @param {number} windowHeight - viewport height
 * @returns {number} 0–100 percentage
 */
export function getScrollProgressPercent(scrollY = 0, docHeight = 1000, windowHeight = 768) {
  const max = Math.max(1, docHeight - windowHeight);
  return Math.min(100, Math.max(0, (scrollY / max) * 100));
}

// ─── InteractiveChart ─────────────────────────────────────────────────────────

/**
 * Compute bar heights for a simple SVG bar chart.
 * @param {number[]} values
 * @param {{ width, height, barWidth, gap }} opts
 * @returns {Object[]} bar descriptors
 */
export function getChartBars(values = [], opts = {}) {
  const { height = 150, barWidth = 30, gap = 10 } = opts;
  const max = Math.max(...values, 1);
  return values.map((v, i) => ({
    x:        i * (barWidth + gap),
    y:        height - (v / max) * height,
    w:        barWidth,
    h:        (v / max) * height,
    value:    v,
    maxValue: max,
    percent:  (v / max) * 100,
  }));
}

// ─── MotionButton ─────────────────────────────────────────────────────────────

/**
 * Get button press/hover styles based on preset.
 */
export function getMotionButtonStyle(motionIntensity = 'low', reducedMotion = false) {
  if (reducedMotion || motionIntensity === 'none') {
    return {
      base:    { transition: 'background-color 150ms ease' },
      hover:   {},
      active:  {},
    };
  }
  const scales = { low: '0.98', medium: '0.96', high: '0.94' };
  return {
    base:   { transition: 'transform 150ms ease, box-shadow 150ms ease, background-color 150ms ease' },
    hover:  { transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
    active: { transform: `scale(${scales[motionIntensity] ?? '0.98'})` },
  };
}

// ─── DynamicTabs ─────────────────────────────────────────────────────────────

/**
 * Build tab indicator position for the animated underline/highlight.
 */
export function getTabIndicatorStyle(activeIndex, tabCount, containerWidth = 400) {
  const tabWidth = containerWidth / Math.max(1, tabCount);
  return {
    left:      activeIndex * tabWidth,
    width:     tabWidth,
    transition: 'left 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  };
}

// ─── VideoHero ────────────────────────────────────────────────────────────────

/**
 * Get video hero container style.
 */
export function getVideoHeroStyle(vertical = 'dental') {
  const overlay = {
    dental:    'rgba(12,120,115,0.45)',
    legal:     'rgba(30,58,95,0.55)',
    physio:    'rgba(13,148,136,0.40)',
    sports:    'rgba(220,38,38,0.50)',
    beauty:    'rgba(157,23,77,0.45)',
    education: 'rgba(234,179,8,0.45)',
  };
  const overlayColor = overlay[vertical] ?? 'rgba(0,0,0,0.40)';
  return {
    container: {
      position:   'relative',
      overflow:   'hidden',
      minHeight:  '480px',
      display:    'flex',
      alignItems: 'center',
    },
    video: {
      position: 'absolute',
      inset:    0,
      width:    '100%',
      height:   '100%',
      objectFit: 'cover',
    },
    overlay: {
      position:        'absolute',
      inset:           0,
      backgroundColor: overlayColor,
    },
    content: {
      position: 'relative',
      zIndex:   1,
      color:    '#fff',
    },
    fallback: {
      backgroundColor: overlayColor.replace(/rgba?\([^)]+\)/, 'var(--primary)'),
    },
  };
}

// ─── LoadingSkeleton config ───────────────────────────────────────────────────

export const SKELETON_VARIANTS = ['text', 'heading', 'image', 'card', 'circle', 'button'];

export function getSkeletonStyle(variant = 'text', reducedMotion = false) {
  const base = {
    backgroundColor:  'var(--muted, #f1f5f9)',
    borderRadius:     'var(--radius-sm, 4px)',
    animation:        reducedMotion ? 'none' : 'skeleton-shimmer 1.5s infinite',
  };
  const sizes = {
    text:    { height: '1rem',   width: '100%',  display: 'block' },
    heading: { height: '1.75rem', width: '60%',  display: 'block' },
    image:   { height: '200px',  width: '100%',  display: 'block', borderRadius: 'var(--radius, 8px)' },
    card:    { height: '240px',  width: '100%',  display: 'block', borderRadius: 'var(--radius, 8px)' },
    circle:  { height: '48px',   width: '48px',  display: 'block', borderRadius: '50%' },
    button:  { height: '40px',   width: '120px', display: 'inline-block', borderRadius: 'var(--radius, 8px)' },
  };
  return { ...base, ...(sizes[variant] ?? sizes.text) };
}

// ─── Accessibility ────────────────────────────────────────────────────────────

/**
 * Build ARIA attributes for animated elements.
 * Animated elements should not convey information via motion alone.
 */
export function getAnimationA11yProps(label = '', live = false) {
  return {
    role:       live ? 'status' : undefined,
    'aria-live': live ? 'polite' : undefined,
    'aria-label': label || undefined,
  };
}

// ─── Component catalog ────────────────────────────────────────────────────────

export const DYNAMIC_COMPONENT_CATALOG = [
  'AnimatedMetric',
  'Reveal',
  'StaggerGroup',
  'InteractiveCard',
  'DynamicHero',
  'VideoHero',
  'AnimatedTimeline',
  'ProgressRing',
  'InteractiveChart',
  'SmartCarousel',
  'BeforeAfter',
  'DynamicTabs',
  'MotionButton',
  'LoadingSkeleton',
  'ScrollProgress',
];
