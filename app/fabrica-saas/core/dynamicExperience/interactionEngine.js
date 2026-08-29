/**
 * Factory Dynamic Experience Engine — Interaction Engine V1.7
 *
 * Defines parametrizable interaction configurations for:
 * - Card hover/reveal interactions
 * - CTA and button feedback
 * - Form transitions
 * - Filters, sortable tables
 * - Timelines, progress, counters
 * - Tooltips, accordions, tabs
 * - Empty states, loading states
 * - Calendar, navigation
 *
 * All interactions can be toggled via manifest `experience.interactions[]`.
 * Reduced motion variants are included for every interaction.
 */

// ─── Interaction registry ─────────────────────────────────────────────────────

/**
 * @typedef {Object} InteractionDefinition
 * @property {string}   id          - machine identifier
 * @property {string}   label       - human-readable label
 * @property {boolean}  requiresJS  - whether JS is needed (vs pure CSS)
 * @property {string}   cssClass    - class to apply on element
 * @property {string}   reducedMotionCss - safe CSS for reduced motion
 * @property {string[]} compatibleWith - preset names where this works well
 */

export const INTERACTION_DEFINITIONS = Object.freeze({

  'card-hover-elevation': {
    id:           'card-hover-elevation',
    label:        'Card Hover Elevation',
    requiresJS:   false,
    cssClass:     'exp-card-hover-elevation',
    reducedMotionCss: 'border: 2px solid var(--primary); box-shadow: none;',
    compatibleWith: ['subtle', 'professional', 'clinical', 'calm', 'editorial', 'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive'],
  },

  'card-reveal': {
    id:           'card-reveal',
    label:        'Card Scroll Reveal',
    requiresJS:   true,
    cssClass:     'exp-card-reveal',
    reducedMotionCss: 'opacity: 1; transform: none;',
    compatibleWith: ['professional', 'clinical', 'editorial', 'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive'],
  },

  'expandable-cards': {
    id:           'expandable-cards',
    label:        'Expandable Cards (accordion style)',
    requiresJS:   true,
    cssClass:     'exp-expandable-card',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['subtle', 'professional', 'clinical', 'calm', 'editorial', 'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive'],
  },

  'cta-feedback': {
    id:           'cta-feedback',
    label:        'CTA Button Feedback',
    requiresJS:   false,
    cssClass:     'exp-cta-feedback',
    reducedMotionCss: 'transform: none; outline: 2px solid var(--primary);',
    compatibleWith: ['subtle', 'professional', 'clinical', 'calm', 'editorial', 'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive'],
  },

  'button-press-feedback': {
    id:           'button-press-feedback',
    label:        'Button Press / Active State',
    requiresJS:   false,
    cssClass:     'exp-btn-press',
    reducedMotionCss: 'transform: none;',
    compatibleWith: ['professional', 'friendly', 'energetic', 'sports', 'tech-premium'],
  },

  'form-success-transition': {
    id:           'form-success-transition',
    label:        'Form Success / Error Transitions',
    requiresJS:   true,
    cssClass:     'exp-form-transition',
    reducedMotionCss: 'transition: none; opacity: 1;',
    compatibleWith: ['subtle', 'professional', 'clinical', 'calm', 'friendly', 'tech-premium'],
  },

  'interactive-filters': {
    id:           'interactive-filters',
    label:        'Animated Filter Chips',
    requiresJS:   true,
    cssClass:     'exp-filters',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['professional', 'editorial', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive'],
  },

  'sortable-table': {
    id:           'sortable-table',
    label:        'Sortable Table Rows',
    requiresJS:   true,
    cssClass:     'exp-sortable-table',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['professional', 'clinical', 'editorial', 'tech-premium'],
  },

  'interactive-timeline': {
    id:           'interactive-timeline',
    label:        'Interactive Timeline / Steps',
    requiresJS:   true,
    cssClass:     'exp-timeline',
    reducedMotionCss: 'opacity: 1; transform: none;',
    compatibleWith: ['professional', 'clinical', 'calm', 'editorial', 'luxury', 'friendly', 'tech-premium'],
  },

  'animated-progress': {
    id:           'animated-progress',
    label:        'Animated Progress Bars / Rings',
    requiresJS:   true,
    cssClass:     'exp-animated-progress',
    reducedMotionCss: 'transition: none; animation: none;',
    compatibleWith: ['professional', 'clinical', 'calm', 'energetic', 'sports', 'tech-premium'],
  },

  'dashboard-metrics': {
    id:           'dashboard-metrics',
    label:        'Dashboard Metric Transitions',
    requiresJS:   true,
    cssClass:     'exp-dashboard-metrics',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['professional', 'clinical', 'tech-premium', 'energetic', 'sports'],
  },

  'contextual-empty-states': {
    id:           'contextual-empty-states',
    label:        'Contextual Animated Empty States',
    requiresJS:   true,
    cssClass:     'exp-empty-state',
    reducedMotionCss: 'animation: none;',
    compatibleWith: ['friendly', 'calm', 'professional', 'tech-premium'],
  },

  'tooltips': {
    id:           'tooltips',
    label:        'Enhanced Tooltips with Fade',
    requiresJS:   false,
    cssClass:     'exp-tooltip',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['subtle', 'professional', 'clinical', 'calm', 'editorial', 'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive'],
  },

  'interactive-calendar': {
    id:           'interactive-calendar',
    label:        'Interactive Booking Calendar',
    requiresJS:   true,
    cssClass:     'exp-calendar',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['professional', 'clinical', 'calm', 'friendly', 'tech-premium'],
  },

  'nav-transitions': {
    id:           'nav-transitions',
    label:        'Active Navigation Transitions',
    requiresJS:   true,
    cssClass:     'exp-nav-active',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['professional', 'editorial', 'luxury', 'tech-premium', 'immersive'],
  },

  'before-after-slider': {
    id:           'before-after-slider',
    label:        'Before / After Comparison Slider',
    requiresJS:   true,
    cssClass:     'exp-before-after',
    reducedMotionCss: 'transition: none;',
    compatibleWith: ['professional', 'clinical', 'friendly', 'luxury', 'immersive'],
  },

  'animated-counters': {
    id:           'animated-counters',
    label:        'Animated Number Counters on Visibility',
    requiresJS:   true,
    cssClass:     'exp-counter',
    reducedMotionCss: 'animation: none;',
    compatibleWith: ['professional', 'editorial', 'energetic', 'sports', 'tech-premium'],
  },

  'service-carousel': {
    id:           'service-carousel',
    label:        'Swipeable Service Carousel',
    requiresJS:   true,
    cssClass:     'exp-carousel',
    reducedMotionCss: 'scroll-behavior: auto;',
    compatibleWith: ['professional', 'clinical', 'calm', 'luxury', 'friendly', 'immersive'],
  },

});

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get interaction definition by id.
 */
export function getInteractionDefinition(id) {
  return INTERACTION_DEFINITIONS[id] ?? null;
}

/**
 * Check if an interaction is compatible with a given preset.
 */
export function isInteractionCompatibleWithPreset(interactionId, presetName) {
  const def = INTERACTION_DEFINITIONS[interactionId];
  if (!def) return false;
  return def.compatibleWith.includes(presetName);
}

/**
 * Get all interactions available for a preset.
 */
export function getInteractionsForPreset(presetName) {
  return Object.values(INTERACTION_DEFINITIONS)
    .filter(def => def.compatibleWith.includes(presetName))
    .map(def => def.id);
}

/**
 * Build CSS classes list for active interactions.
 */
export function buildInteractionClasses(activeInteractions = []) {
  return activeInteractions
    .map(id => INTERACTION_DEFINITIONS[id]?.cssClass)
    .filter(Boolean);
}

/**
 * Generate the interaction CSS for a set of active interactions.
 * Returns reduced motion overrides for all active interactions.
 */
export function buildInteractionReducedMotionCss(activeInteractions = []) {
  const rules = activeInteractions
    .map(id => {
      const def = INTERACTION_DEFINITIONS[id];
      if (!def) return '';
      return `@media (prefers-reduced-motion: reduce) { .${def.cssClass} { ${def.reducedMotionCss} } }`;
    })
    .filter(Boolean);
  return rules.join('\n');
}

/**
 * Validate manifest interaction list against the catalog.
 * Returns { valid, unknown, known }
 */
export function validateInteractionList(interactions = []) {
  const known   = interactions.filter(id => Object.prototype.hasOwnProperty.call(INTERACTION_DEFINITIONS, id));
  const unknown = interactions.filter(id => !Object.prototype.hasOwnProperty.call(INTERACTION_DEFINITIONS, id));
  return { valid: unknown.length === 0, known, unknown };
}
