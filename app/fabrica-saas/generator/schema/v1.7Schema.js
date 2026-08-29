/**
 * Factory Generator — Manifest V1.7 Schema
 * Extends V1.6 with: experience presets, video engine, dynamic sections.
 * Backward compatible with V1.5 and V1.6 manifests (all new fields optional).
 */

import { V16_SUPPORTED_VERTICALS, V16_DENSITY_VALUES } from './v1.6Schema.js';

// ─── V1.7 constants ───────────────────────────────────────────────────────────

export const V17_SUPPORTED_VERTICALS = [
  ...V16_SUPPORTED_VERTICALS,
  'education',  // Future vertical — architecture ready, no curriculum yet
];

export const V17_EXPERIENCE_PRESETS = [
  'subtle', 'professional', 'clinical', 'calm', 'editorial',
  'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive',
];

export const V17_MOTION_INTENSITY_VALUES = ['none', 'low', 'medium', 'high'];

export const V17_HERO_TYPES = [
  'centered-text', 'split-content', 'video-background',
  'gradient-hero', 'image-overlay', 'minimal-bar',
];

export const V17_VIDEO_TYPES = [
  'heroVideo', 'serviceVideo', 'backgroundVideo', 'testimonialVideo',
  'explainerVideo', 'teamVideo', 'ambientLoop',
];

export const V17_INTERACTION_IDS = [
  'card-hover-elevation', 'card-reveal', 'expandable-cards',
  'cta-feedback', 'button-press-feedback', 'form-success-transition',
  'interactive-filters', 'sortable-table', 'interactive-timeline',
  'animated-progress', 'dashboard-metrics', 'contextual-empty-states',
  'tooltips', 'interactive-calendar', 'nav-transitions',
  'before-after-slider', 'animated-counters', 'service-carousel',
];

export const V17_SCROLL_EFFECTS = [
  'fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle',
  'sticky-section', 'progress-on-scroll', 'counter-on-visible',
];

export const V17_DYNAMIC_SECTION_TYPES = [
  'metric-row', 'before-after', 'timeline', 'carousel',
  'testimonials', 'filterable-grid', 'chart', 'progress-dashboard',
  'team-grid', 'booking-section', 'faq-accordion',
];

export const V17_DYNAMIC_SECTION_TRIGGERS = [
  'on-view', 'on-scroll', 'on-interaction', 'immediate',
];

// ─── V1.7 field keys ─────────────────────────────────────────────────────────

export const V17_EXPERIENCE_FIELDS = [
  'preset', 'motion', 'transitions', 'scrollEffects',
  'interactions', 'animatedMetrics', 'reducedMotion',
];

export const V17_VIDEO_FIELDS = [
  'hero', 'background', 'services', 'testimonials',
  'explainer', 'ambient', 'autoplay', 'muted', 'mobileEnabled',
  'poster', 'lazyLoad',
];

export const V17_DYNAMIC_SECTION_FIELDS = ['type', 'behavior', 'trigger', 'data'];

// ─── Validator ───────────────────────────────────────────────────────────────

/**
 * Validate V1.7-specific fields in a manifest.
 * @param {Object} manifest
 * @returns {{ valid: boolean, errors: string[], warnings: string[], v17Fields: string[], v16Compat: boolean, v15Compat: boolean }}
 */
export function validateV17Fields(manifest = {}) {
  const errors   = [];
  const warnings = [];
  const v17Fields = [];

  // Vertical check (includes 'education')
  const vertical = manifest.vertical ?? manifest.sector;
  if (vertical && !V17_SUPPORTED_VERTICALS.includes(vertical)) {
    errors.push(`Unknown vertical "${vertical}". Supported: ${V17_SUPPORTED_VERTICALS.join(', ')}`);
  }

  // Experience section
  const exp = manifest.experience;
  if (exp) {
    v17Fields.push('experience');

    if (exp.preset && !V17_EXPERIENCE_PRESETS.includes(exp.preset)) {
      errors.push(`experience.preset "${exp.preset}" is not valid. Valid: ${V17_EXPERIENCE_PRESETS.join(', ')}`);
    }
    if (exp.motion && !V17_MOTION_INTENSITY_VALUES.includes(exp.motion)) {
      errors.push(`experience.motion "${exp.motion}" is not valid. Valid: ${V17_MOTION_INTENSITY_VALUES.join(', ')}`);
    }
    if (exp.scrollEffects) {
      if (!Array.isArray(exp.scrollEffects)) {
        errors.push('experience.scrollEffects must be an array');
      } else {
        const unknown = exp.scrollEffects.filter(e => !V17_SCROLL_EFFECTS.includes(e));
        if (unknown.length > 0) {
          warnings.push(`Unknown scroll effects: ${unknown.join(', ')}. Known: ${V17_SCROLL_EFFECTS.join(', ')}`);
        }
      }
    }
    if (exp.interactions) {
      if (!Array.isArray(exp.interactions)) {
        errors.push('experience.interactions must be an array');
      } else {
        const unknown = exp.interactions.filter(id => !V17_INTERACTION_IDS.includes(id));
        if (unknown.length > 0) {
          warnings.push(`Unknown interaction IDs: ${unknown.join(', ')}`);
        }
      }
    }
  }

  // Video section
  const video = manifest.video;
  if (video) {
    v17Fields.push('video');

    // autoplay requires muted
    const heroVideo = video.hero ?? {};
    if (heroVideo.autoplay && heroVideo.muted === false) {
      errors.push('video.hero.autoplay requires muted: true (browser security requirement)');
    }
    const ambientVideo = video.ambient ?? {};
    if (ambientVideo.autoplay && ambientVideo.muted === false) {
      errors.push('video.ambient.autoplay requires muted: true');
    }

    // Performance warnings
    if (video.background?.preload === 'auto') {
      warnings.push('video.background.preload=auto may hurt initial load time');
    }
    if (video.ambient?.mobileEnabled === true) {
      warnings.push('video.ambient.mobileEnabled=true on ambient loops may use excessive mobile data');
    }
  }

  // Dynamic sections
  const sections = manifest.dynamicSections;
  if (sections) {
    v17Fields.push('dynamicSections');

    if (!Array.isArray(sections)) {
      errors.push('dynamicSections must be an array');
    } else {
      sections.forEach((s, i) => {
        if (s.type && !V17_DYNAMIC_SECTION_TYPES.includes(s.type)) {
          warnings.push(`dynamicSections[${i}].type "${s.type}" is not in known types`);
        }
        if (s.trigger && !V17_DYNAMIC_SECTION_TRIGGERS.includes(s.trigger)) {
          warnings.push(`dynamicSections[${i}].trigger "${s.trigger}" is not in known triggers`);
        }
      });
    }
  }

  // Density (shared with V1.6)
  if (manifest.design?.density && !V16_DENSITY_VALUES.includes(manifest.design.density)) {
    warnings.push(`design.density "${manifest.design.density}" is not standard`);
  }

  return {
    valid:      errors.length === 0,
    errors,
    warnings,
    v17Fields,
    v16Compat:  true,
    v15Compat:  true,
  };
}

/**
 * Normalize a V1.7 manifest — fills defaults, resolves aliases.
 * @param {Object} manifest
 * @returns {Object} normalized manifest
 */
export function normalizeManifestV17(manifest = {}) {
  const vertical = manifest.vertical ?? manifest.sector ?? 'dental';

  return {
    ...manifest,
    vertical,
    version: manifest.version ?? '1.7',
    experience: {
      preset:          'professional',
      motion:          'low',
      scrollEffects:   ['fade-in'],
      interactions:    ['card-hover-elevation', 'cta-feedback'],
      animatedMetrics: false,
      reducedMotion:   'auto',
      ...(manifest.experience ?? {}),
    },
    video: {
      autoplay:       false,
      muted:          true,
      mobileEnabled:  false,
      lazyLoad:       true,
      poster:         null,
      ...(manifest.video ?? {}),
    },
    dynamicSections: manifest.dynamicSections ?? [],
  };
}

/**
 * Check if a manifest is V1.7-aware (has any V1.7-specific sections).
 */
export function isV17Manifest(manifest = {}) {
  return !!(manifest.experience || manifest.video || manifest.dynamicSections);
}

/**
 * Check backward compatibility: can this manifest be used with V1.6 generator?
 * V1.7 manifests are always V1.6-compat (new sections are ignored by V1.6).
 */
export function isBackwardCompatible() {
  return true;
}
