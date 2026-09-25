/**
 * V1.7 Dynamic Experience Engine — test suite
 * Covers: presets, vertical mapping, motion config, video engine,
 * interaction engine, performance budget, manifest schema,
 * dynamic components, media engine extensions, education vertical,
 * accessibility, backward compatibility.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT    = resolve(__dir, '../../../');
const FABRICA = resolve(ROOT, 'fabrica-saas');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. EXPERIENCE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Experience Presets — catalog', () => {
  let presets;
  test('imports successfully', async () => {
    presets = await import(`${FABRICA}/core/dynamicExperience/presets.js`);
    assert.ok(presets.EXPERIENCE_PRESETS);
  });

  test('has exactly 11 presets', () => {
    const names = Object.keys(presets.EXPERIENCE_PRESETS);
    assert.equal(names.length, 11);
  });

  const expectedPresets = [
    'subtle', 'professional', 'clinical', 'calm', 'editorial',
    'luxury', 'friendly', 'energetic', 'sports', 'tech-premium', 'immersive',
  ];
  for (const name of expectedPresets) {
    test(`preset "${name}" exists`, () => {
      assert.ok(presets.EXPERIENCE_PRESETS[name], `Missing preset: ${name}`);
    });
  }

  test('all presets are frozen (immutable)', () => {
    assert.ok(Object.isFrozen(presets.EXPERIENCE_PRESETS));
  });
});

describe('Experience Presets — required fields', () => {
  let presets;
  test('setup', async () => {
    presets = await import(`${FABRICA}/core/dynamicExperience/presets.js`);
  });

  const REQUIRED_FIELDS = [
    'motionIntensity', 'transitionSpeed', 'scrollEffects', 'hoverDepth',
    'cardMotion', 'heroMotion', 'chartAnimation', 'navigationTransitions',
    'backgroundMotion', 'videoBehavior', 'reducedMotionFallback',
  ];

  for (const field of REQUIRED_FIELDS) {
    test(`all presets have "${field}" field`, () => {
      for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(preset, field),
          `Preset "${name}" missing field "${field}"`
        );
      }
    });
  }

  test('motionIntensity values are valid enum', () => {
    for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
      assert.ok(
        presets.MOTION_INTENSITY_VALUES.includes(preset.motionIntensity),
        `Preset "${name}" has invalid motionIntensity: ${preset.motionIntensity}`
      );
    }
  });

  test('transitionSpeed values are valid enum', () => {
    for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
      assert.ok(
        presets.TRANSITION_SPEED_VALUES.includes(preset.transitionSpeed),
        `Preset "${name}" has invalid transitionSpeed: ${preset.transitionSpeed}`
      );
    }
  });

  test('scrollEffects are arrays', () => {
    for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
      assert.ok(Array.isArray(preset.scrollEffects), `Preset "${name}" scrollEffects is not array`);
    }
  });

  test('reducedMotionFallback values are valid', () => {
    for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
      assert.ok(
        presets.REDUCED_MOTION_FALLBACK_VALUES.includes(preset.reducedMotionFallback),
        `Preset "${name}" has invalid reducedMotionFallback: ${preset.reducedMotionFallback}`
      );
    }
  });

  test('chartAnimation is boolean', () => {
    for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
      assert.equal(typeof preset.chartAnimation, 'boolean', `"${name}" chartAnimation should be boolean`);
    }
  });

  test('backgroundMotion is boolean', () => {
    for (const [name, preset] of Object.entries(presets.EXPERIENCE_PRESETS)) {
      assert.equal(typeof preset.backgroundMotion, 'boolean', `"${name}" backgroundMotion should be boolean`);
    }
  });
});

describe('Experience Presets — API', () => {
  let presets;
  test('setup', async () => {
    presets = await import(`${FABRICA}/core/dynamicExperience/presets.js`);
  });

  test('getSupportedPresets returns array of 11', () => {
    const list = presets.getSupportedPresets();
    assert.equal(list.length, 11);
  });

  test('isValidPreset: known preset returns true', () => {
    assert.equal(presets.isValidPreset('clinical'), true);
  });

  test('isValidPreset: unknown preset returns false', () => {
    assert.equal(presets.isValidPreset('nonexistent'), false);
  });

  test('resolvePreset: returns preset with presetName', () => {
    const r = presets.resolvePreset('calm');
    assert.equal(r.presetName, 'calm');
    assert.ok(r.cssVars);
  });

  test('resolvePreset: overrides are applied', () => {
    const r = presets.resolvePreset('subtle', { motionIntensity: 'high' });
    assert.equal(r.motionIntensity, 'high');
  });

  test('resolvePreset: falls back to professional for unknown preset', () => {
    const r = presets.resolvePreset('does-not-exist');
    assert.equal(r.presetName, 'does-not-exist');
    assert.equal(r.motionIntensity, presets.EXPERIENCE_PRESETS.professional.motionIntensity);
  });

  test('buildPresetCssVars: returns CSS custom properties', () => {
    const vars = presets.buildPresetCssVars('clinical');
    assert.ok(vars['--exp-duration']);
    assert.ok(vars['--exp-easing']);
    assert.ok(vars['--exp-hover-scale']);
    assert.ok(vars['--exp-hover-shadow']);
  });

  test('buildPresetCssVars: sports has highest hover scale', () => {
    const sportsVars = presets.buildPresetCssVars('sports');
    const subtleVars = presets.buildPresetCssVars('subtle');
    assert.ok(parseFloat(sportsVars['--exp-hover-scale']) >= parseFloat(subtleVars['--exp-hover-scale']));
  });
});

describe('Experience Presets — design constraints', () => {
  let presets;
  test('setup', async () => {
    presets = await import(`${FABRICA}/core/dynamicExperience/presets.js`);
  });

  test('subtle preset has minimal scroll effects', () => {
    assert.ok(presets.EXPERIENCE_PRESETS.subtle.scrollEffects.length <= 2);
  });

  test('immersive preset has most scroll effects', () => {
    const immersiveCount = presets.EXPERIENCE_PRESETS.immersive.scrollEffects.length;
    const subtleCount    = presets.EXPERIENCE_PRESETS.subtle.scrollEffects.length;
    assert.ok(immersiveCount > subtleCount);
  });

  test('calm preset has very-slow transitions', () => {
    assert.equal(presets.EXPERIENCE_PRESETS.calm.transitionSpeed, 'very-slow');
  });

  test('sports preset has high motion intensity', () => {
    assert.equal(presets.EXPERIENCE_PRESETS.sports.motionIntensity, 'high');
  });

  test('clinical preset has no background motion', () => {
    assert.equal(presets.EXPERIENCE_PRESETS.clinical.backgroundMotion, false);
  });

  test('luxury preset has glow card motion', () => {
    assert.equal(presets.EXPERIENCE_PRESETS.luxury.cardMotion, 'glow');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. VERTICAL EXPERIENCE MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

describe('Vertical Experience Mapping — catalog', () => {
  let mapping;
  test('imports successfully', async () => {
    mapping = await import(`${FABRICA}/core/dynamicExperience/verticalMapping.js`);
    assert.ok(mapping.VERTICAL_EXPERIENCE_MAP);
  });

  const expectedVerticals = [
    'dental', 'legal', 'physio', 'fisioterapia', 'psychology',
    'speech-therapy', 'sports', 'veterinary', 'hairdresser',
    'beauty', 'estetica', 'fertility', 'abogados', 'education',
  ];

  for (const v of expectedVerticals) {
    test(`vertical "${v}" has mapping`, () => {
      assert.ok(
        Object.prototype.hasOwnProperty.call(mapping.VERTICAL_EXPERIENCE_MAP, v),
        `Missing mapping for vertical: ${v}`
      );
    });
  }

  test('map is frozen', () => {
    assert.ok(Object.isFrozen(mapping.VERTICAL_EXPERIENCE_MAP));
  });
});

describe('Vertical Experience Mapping — required fields', () => {
  let mapping;
  test('setup', async () => {
    mapping = await import(`${FABRICA}/core/dynamicExperience/verticalMapping.js`);
  });

  const REQUIRED_FIELDS = [
    'defaultPreset', 'motionLevel', 'heroType',
    'recommendedInteractions', 'avoidInteractions', 'density', 'emotionalTone',
  ];

  for (const field of REQUIRED_FIELDS) {
    test(`all primary verticals have "${field}"`, () => {
      const primaryVerticals = ['dental', 'legal', 'physio', 'psychology', 'speech-therapy',
                                'sports', 'veterinary', 'hairdresser', 'beauty', 'fertility', 'education'];
      for (const v of primaryVerticals) {
        assert.ok(
          Object.prototype.hasOwnProperty.call(mapping.VERTICAL_EXPERIENCE_MAP[v], field),
          `Vertical "${v}" missing "${field}"`
        );
      }
    });
  }

  test('each vertical defaultPreset exists in EXPERIENCE_PRESETS', async () => {
    const { isValidPreset } = await import(`${FABRICA}/core/dynamicExperience/presets.js`);
    for (const [v, conf] of Object.entries(mapping.VERTICAL_EXPERIENCE_MAP)) {
      assert.ok(
        isValidPreset(conf.defaultPreset),
        `Vertical "${v}" defaultPreset "${conf.defaultPreset}" not found in EXPERIENCE_PRESETS`
      );
    }
  });

  test('recommendedInteractions is array', () => {
    for (const [v, conf] of Object.entries(mapping.VERTICAL_EXPERIENCE_MAP)) {
      assert.ok(Array.isArray(conf.recommendedInteractions), `"${v}" recommendedInteractions not array`);
    }
  });

  test('avoidInteractions is array', () => {
    for (const [v, conf] of Object.entries(mapping.VERTICAL_EXPERIENCE_MAP)) {
      assert.ok(Array.isArray(conf.avoidInteractions), `"${v}" avoidInteractions not array`);
    }
  });
});

describe('Vertical Experience Mapping — sector-specific expectations', () => {
  let mapping;
  test('setup', async () => {
    mapping = await import(`${FABRICA}/core/dynamicExperience/verticalMapping.js`);
  });

  test('dental: clinical preset', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.dental.defaultPreset, 'clinical');
  });

  test('legal: professional preset, compact density', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.legal.defaultPreset, 'professional');
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.legal.density, 'compact');
  });

  test('sports: high motion', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.sports.motionLevel, 'high');
  });

  test('psychology: spacious density', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.psychology.density, 'spacious');
  });

  test('fertility: low motion', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.fertility.motionLevel, 'low');
  });

  test('sports: video hero', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.sports.heroType, 'video-background');
  });

  test('education: readyForFutureImplementation', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.education.readyForFutureImplementation, true);
  });

  test('education: futureSubTypes includes eso', () => {
    assert.ok(mapping.VERTICAL_EXPERIENCE_MAP.education.futureSubTypes.includes('eso'));
  });
});

describe('Vertical Experience Mapping — API', () => {
  let mapping;
  test('setup', async () => {
    mapping = await import(`${FABRICA}/core/dynamicExperience/verticalMapping.js`);
  });

  test('getVerticalExperience: known vertical', () => {
    const r = mapping.getVerticalExperience('dental');
    assert.equal(r.defaultPreset, 'clinical');
  });

  test('getVerticalExperience: unknown vertical falls back to dental', () => {
    const r = mapping.getVerticalExperience('nonexistent');
    assert.equal(r.defaultPreset, 'clinical');
  });

  test('getMappedVerticals: returns array', () => {
    const list = mapping.getMappedVerticals();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 13);
  });

  test('getDefaultPresetForVertical: physio → calm', () => {
    assert.equal(mapping.getDefaultPresetForVertical('physio'), 'calm');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. MOTION CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

describe('Motion Config — core', () => {
  let motion;
  test('imports successfully', async () => {
    motion = await import(`${FABRICA}/core/dynamicExperience/motionConfig.js`);
    assert.ok(motion.buildMotionCss);
    assert.ok(motion.SCROLL_EFFECTS);
  });

  test('MOTION_INTENSITY_LEVELS has 4 values', () => {
    assert.equal(motion.MOTION_INTENSITY_LEVELS.length, 4);
    assert.ok(motion.MOTION_INTENSITY_LEVELS.includes('none'));
    assert.ok(motion.MOTION_INTENSITY_LEVELS.includes('high'));
  });

  test('TRANSITION_DURATION: all speeds have ms values', () => {
    for (const [speed, ms] of Object.entries(motion.TRANSITION_DURATION)) {
      assert.equal(typeof ms, 'number', `Speed "${speed}" should be a number`);
    }
  });

  test('buildMotionCss: returns CSS custom properties', () => {
    const preset = { transitionSpeed: 'normal', motionIntensity: 'medium' };
    const css = motion.buildMotionCss(preset);
    assert.ok(css['--motion-duration']);
    assert.ok(css['--motion-easing']);
    assert.ok(css['--motion-scale-hover']);
  });

  test('buildMotionCss: fast speed → lower duration than slow', () => {
    const fast = motion.buildMotionCss({ transitionSpeed: 'fast',  motionIntensity: 'low' });
    const slow = motion.buildMotionCss({ transitionSpeed: 'slow',  motionIntensity: 'low' });
    const fastMs = parseInt(fast['--motion-duration']);
    const slowMs = parseInt(slow['--motion-duration']);
    assert.ok(fastMs < slowMs, `fast(${fastMs}ms) should be < slow(${slowMs}ms)`);
  });

  test('buildReducedMotionCss: includes prefers-reduced-motion query', () => {
    const css = motion.buildReducedMotionCss();
    assert.ok(css.includes('prefers-reduced-motion'));
    assert.ok(css.includes('animation-duration'));
  });

  test('buildMotionStyleSheet: returns string with :root and media query', () => {
    const preset = { transitionSpeed: 'normal', motionIntensity: 'low', reducedMotionFallback: 'static' };
    const css = motion.buildMotionStyleSheet(preset, 'clinical');
    assert.ok(typeof css === 'string');
    assert.ok(css.includes(':root'));
    assert.ok(css.includes('prefers-reduced-motion'));
  });
});

describe('Motion Config — reduced motion', () => {
  let motion;
  test('setup', async () => {
    motion = await import(`${FABRICA}/core/dynamicExperience/motionConfig.js`);
  });

  test('detectReducedMotion: returns boolean in Node', () => {
    const result = motion.detectReducedMotion();
    assert.equal(typeof result, 'boolean');
  });

  test('detectReducedMotion: returns false in Node (no window)', () => {
    assert.equal(motion.detectReducedMotion(), false);
  });

  test('getReducedMotionPreset: static fallback strips animations', () => {
    const full = { motionIntensity: 'high', scrollEffects: ['parallax-subtle', 'fade-in'], reducedMotionFallback: 'static', heroMotion: 'video', backgroundMotion: true };
    const safe = motion.getReducedMotionPreset(full);
    assert.equal(safe.motionIntensity, 'none');
    assert.equal(safe.scrollEffects.length, 0);
    assert.equal(safe.heroMotion, 'none');
    assert.equal(safe.backgroundMotion, false);
  });

  test('getReducedMotionPreset: fade-only keeps fade-in', () => {
    const full = { motionIntensity: 'high', scrollEffects: ['stagger-reveal'], reducedMotionFallback: 'fade-only', videoBehavior: 'ambient-loop' };
    const safe = motion.getReducedMotionPreset(full);
    assert.ok(safe.scrollEffects.includes('fade-in'));
    assert.equal(safe.videoBehavior, 'none');
  });

  test('getActiveScrollEffects: filters unknown effects', () => {
    const effects = motion.getActiveScrollEffects(['fade-in', 'nonexistent', 'slide-up']);
    assert.equal(effects.length, 2);
    assert.ok(effects.every(e => e.name));
  });
});

describe('Motion Config — scroll effects catalog', () => {
  let motion;
  test('setup', async () => {
    motion = await import(`${FABRICA}/core/dynamicExperience/motionConfig.js`);
  });

  const expectedEffects = ['fade-in', 'slide-up', 'stagger-reveal', 'parallax-subtle',
                           'sticky-section', 'progress-on-scroll', 'counter-on-visible'];
  for (const eff of expectedEffects) {
    test(`scroll effect "${eff}" defined`, () => {
      assert.ok(motion.SCROLL_EFFECTS[eff], `Missing scroll effect: ${eff}`);
    });
  }

  test('each scroll effect has threshold', () => {
    for (const [name, eff] of Object.entries(motion.SCROLL_EFFECTS)) {
      assert.ok(typeof eff.threshold === 'number', `"${name}" missing threshold`);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. VIDEO ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Video Engine — buildVideoConfig', () => {
  let ve;
  test('imports successfully', async () => {
    ve = await import(`${FABRICA}/core/dynamicExperience/videoEngine.js`);
    assert.ok(ve.buildVideoConfig);
  });

  test('default config is safe (muted, lazy)', () => {
    const cfg = ve.buildVideoConfig({}, 'dental', 'heroVideo');
    assert.equal(cfg.muted, true);
    assert.equal(cfg.lazy, true);
  });

  test('autoplay forces muted=true', () => {
    const cfg = ve.buildVideoConfig({ autoplay: true, muted: false }, 'dental', 'heroVideo');
    assert.equal(cfg.muted, true, 'autoplay must force muted=true');
  });

  test('ambient loop defaults: autoplay, loop, controls=false', () => {
    const cfg = ve.buildVideoConfig({}, 'sports', 'ambientLoop');
    assert.equal(cfg.autoplay, true);
    assert.equal(cfg.loop, true);
    assert.equal(cfg.controls, false);
    assert.equal(cfg.mobileEnabled, false);
  });

  test('no src → placeholder=true', () => {
    const cfg = ve.buildVideoConfig({}, 'dental', 'heroVideo');
    assert.equal(cfg.placeholder, true);
  });

  test('src provided → placeholder=false', () => {
    const cfg = ve.buildVideoConfig({ src: '/video.mp4' }, 'dental', 'heroVideo');
    assert.equal(cfg.placeholder, false);
  });

  test('poster fallback is a data URI', () => {
    const cfg = ve.buildVideoConfig({}, 'dental', 'heroVideo');
    assert.ok(cfg.poster.startsWith('data:image/svg+xml'));
  });

  test('explicit poster is preserved', () => {
    const cfg = ve.buildVideoConfig({ poster: '/my-poster.jpg' }, 'dental', 'heroVideo');
    assert.equal(cfg.poster, '/my-poster.jpg');
  });

  test('sources array built from src', () => {
    const cfg = ve.buildVideoConfig({ src: '/video.mp4' }, 'dental', 'heroVideo');
    assert.equal(cfg.sources.length, 1);
    assert.equal(cfg.sources[0].src, '/video.mp4');
    assert.equal(cfg.sources[0].type, 'video/mp4');
  });
});

describe('Video Engine — shouldDisableVideo', () => {
  let ve;
  test('setup', async () => {
    ve = await import(`${FABRICA}/core/dynamicExperience/videoEngine.js`);
  });

  test('ambient + reducedMotion → disabled', () => {
    const cfg = ve.buildVideoConfig({}, 'sports', 'ambientLoop');
    assert.equal(ve.shouldDisableVideo(cfg, { reducedMotion: true }), true);
  });

  test('ambient + mobile + mobileEnabled=false → disabled', () => {
    const cfg = ve.buildVideoConfig({}, 'sports', 'ambientLoop');
    assert.equal(ve.shouldDisableVideo(cfg, { isMobile: true }), true);
  });

  test('hero + desktop + no reduced motion → not disabled', () => {
    const cfg = ve.buildVideoConfig({ src: '/v.mp4' }, 'dental', 'heroVideo');
    assert.equal(ve.shouldDisableVideo(cfg, {}), false);
  });

  test('data saver → disables video when dataSaverAware=true', () => {
    const cfg = { ...ve.buildVideoConfig({}, 'dental', 'heroVideo'), dataSaverAware: true };
    assert.equal(ve.shouldDisableVideo(cfg, { isDataSaver: true }), true);
  });
});

describe('Video Engine — resolveVideoManifest', () => {
  let ve;
  test('setup', async () => {
    ve = await import(`${FABRICA}/core/dynamicExperience/videoEngine.js`);
  });

  test('empty video section returns 7 types', () => {
    const manifest = { video: {} };
    const result = ve.resolveVideoManifest(manifest, 'dental');
    const keys = Object.keys(result);
    assert.ok(keys.includes('hero'));
    assert.ok(keys.includes('ambient'));
    assert.ok(keys.includes('testimonials'));
  });

  test('all types have poster fallback', () => {
    const result = ve.resolveVideoManifest({}, 'dental');
    for (const [type, cfg] of Object.entries(result)) {
      assert.ok(cfg.poster, `Video type "${type}" missing poster`);
    }
  });

  test('getVideoFallback returns image config', () => {
    const cfg = ve.buildVideoConfig({}, 'dental', 'heroVideo');
    const fallback = ve.getVideoFallback(cfg);
    assert.equal(fallback.type, 'image');
    assert.ok(fallback.src);
  });
});

describe('Video Engine — performance validation', () => {
  let ve;
  test('setup', async () => {
    ve = await import(`${FABRICA}/core/dynamicExperience/videoEngine.js`);
  });

  test('preload=auto on background video generates warning', () => {
    const cfg = { preload: 'auto', type: 'backgroundVideo' };
    const warnings = ve.validateVideoPerformance(cfg);
    assert.ok(warnings.length > 0);
  });

  test('no warnings for safe hero video config', () => {
    const cfg = ve.buildVideoConfig({ src: '/v.mp4' }, 'dental', 'heroVideo');
    const warnings = ve.validateVideoPerformance(cfg);
    assert.equal(warnings.length, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. INTERACTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Interaction Engine', () => {
  let ie;
  test('imports successfully', async () => {
    ie = await import(`${FABRICA}/core/dynamicExperience/interactionEngine.js`);
    assert.ok(ie.INTERACTION_DEFINITIONS);
  });

  test('has 18+ interaction definitions', () => {
    assert.ok(Object.keys(ie.INTERACTION_DEFINITIONS).length >= 18);
  });

  test('all definitions have required fields', () => {
    for (const [id, def] of Object.entries(ie.INTERACTION_DEFINITIONS)) {
      assert.ok(def.id, `"${id}" missing id`);
      assert.ok(def.label, `"${id}" missing label`);
      assert.equal(typeof def.requiresJS, 'boolean', `"${id}" requiresJS should be boolean`);
      assert.ok(def.cssClass, `"${id}" missing cssClass`);
      assert.ok(def.reducedMotionCss, `"${id}" missing reducedMotionCss`);
      assert.ok(Array.isArray(def.compatibleWith), `"${id}" compatibleWith should be array`);
    }
  });

  test('getInteractionDefinition: known id', () => {
    const def = ie.getInteractionDefinition('card-hover-elevation');
    assert.ok(def);
    assert.equal(def.id, 'card-hover-elevation');
  });

  test('getInteractionDefinition: unknown id returns null', () => {
    assert.equal(ie.getInteractionDefinition('nonexistent'), null);
  });

  test('isInteractionCompatibleWithPreset: works correctly', () => {
    assert.equal(ie.isInteractionCompatibleWithPreset('card-hover-elevation', 'clinical'), true);
    assert.equal(ie.isInteractionCompatibleWithPreset('nonexistent', 'clinical'), false);
  });

  test('getInteractionsForPreset: returns array for clinical', () => {
    const list = ie.getInteractionsForPreset('clinical');
    assert.ok(Array.isArray(list));
    assert.ok(list.length > 0);
  });

  test('buildInteractionClasses: maps ids to CSS classes', () => {
    const classes = ie.buildInteractionClasses(['card-hover-elevation', 'tooltips']);
    assert.ok(classes.includes('exp-card-hover-elevation'));
    assert.ok(classes.includes('exp-tooltip'));
  });

  test('validateInteractionList: all valid ids', () => {
    const result = ie.validateInteractionList(['card-hover-elevation', 'tooltips']);
    assert.equal(result.valid, true);
    assert.equal(result.unknown.length, 0);
  });

  test('validateInteractionList: unknown ids detected', () => {
    const result = ie.validateInteractionList(['card-hover-elevation', 'made-up-interaction']);
    assert.equal(result.valid, false);
    assert.equal(result.unknown.length, 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. PERFORMANCE BUDGET
// ═══════════════════════════════════════════════════════════════════════════════

describe('Performance Budget', () => {
  let pb;
  test('imports successfully', async () => {
    pb = await import(`${FABRICA}/core/dynamicExperience/performanceBudget.js`);
    assert.ok(pb.PERFORMANCE_BUDGET);
    assert.ok(pb.checkPerformanceBudget);
  });

  test('budget constants are defined', () => {
    const b = pb.PERFORMANCE_BUDGET;
    assert.ok(typeof b.MAX_ANIMATIONS_CONCURRENT === 'number');
    assert.ok(typeof b.MAX_VIDEO_SIZE_MB === 'number');
    assert.ok(typeof b.MAX_JS_ADDITIONAL_KB === 'number');
    assert.ok(typeof b.MOBILE_MAX_ANIMATIONS_CONCURRENT === 'number');
    assert.ok(b.MOBILE_MAX_ANIMATIONS_CONCURRENT < b.MAX_ANIMATIONS_CONCURRENT);
  });

  test('mobile limits are stricter', () => {
    const b = pb.PERFORMANCE_BUDGET;
    assert.ok(b.MOBILE_MAX_ANIMATIONS_CONCURRENT <= b.MAX_ANIMATIONS_CONCURRENT);
    assert.ok(b.MOBILE_MAX_SCROLL_EFFECTS <= 5);
  });

  test('checkPerformanceBudget: safe preset passes', () => {
    const preset = { motionIntensity: 'low', scrollEffects: ['fade-in'], chartAnimation: false, backgroundMotion: false, heroMotion: 'fade', videoBehavior: 'none' };
    const result = pb.checkPerformanceBudget(preset);
    assert.equal(result.ok, true);
    assert.equal(result.errors.length, 0);
  });

  test('checkPerformanceBudget: mobile + high motion generates warning', () => {
    const preset = { motionIntensity: 'high', scrollEffects: ['fade-in', 'parallax-subtle', 'stagger-reveal'], chartAnimation: true, backgroundMotion: true, heroMotion: 'video', videoBehavior: 'ambient-loop' };
    const result = pb.checkPerformanceBudget(preset, { isMobile: true });
    assert.ok(result.warnings.length > 0);
  });

  test('getMobilePreset: strips parallax', () => {
    const preset = { scrollEffects: ['fade-in', 'parallax-subtle'], backgroundMotion: true, videoBehavior: 'ambient-loop', motionIntensity: 'high' };
    const mobile = pb.getMobilePreset(preset);
    assert.ok(!mobile.scrollEffects.includes('parallax-subtle'));
    assert.equal(mobile.backgroundMotion, false);
  });

  test('getMobilePreset: ambient-loop becomes none', () => {
    const preset = { scrollEffects: [], backgroundMotion: false, videoBehavior: 'ambient-loop', motionIntensity: 'medium' };
    const mobile = pb.getMobilePreset(preset);
    assert.equal(mobile.videoBehavior, 'none');
  });

  test('getPerformancePolicyText returns string', () => {
    const text = pb.getPerformancePolicyText();
    assert.ok(typeof text === 'string');
    assert.ok(text.includes('MAX_ANIMATIONS_CONCURRENT'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. MANIFEST V1.7 SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

describe('Manifest V1.7 Schema', () => {
  let schema;
  test('imports successfully', async () => {
    schema = await import(`${FABRICA}/generator/schema/v1.7Schema.js`);
    assert.ok(schema.validateV17Fields);
    assert.ok(schema.normalizeManifestV17);
  });

  test('V17_SUPPORTED_VERTICALS includes education', () => {
    assert.ok(schema.V17_SUPPORTED_VERTICALS.includes('education'));
  });

  test('V17_SUPPORTED_VERTICALS includes all V1.6 verticals', () => {
    const v16 = ['dental', 'legal', 'physio', 'psychology', 'sports', 'veterinary', 'hairdresser', 'beauty', 'fertility'];
    for (const v of v16) {
      assert.ok(schema.V17_SUPPORTED_VERTICALS.includes(v), `Missing vertical: ${v}`);
    }
  });

  test('has 11 experience presets', () => {
    assert.equal(schema.V17_EXPERIENCE_PRESETS.length, 11);
  });

  test('V17_INTERACTION_IDS is array', () => {
    assert.ok(Array.isArray(schema.V17_INTERACTION_IDS));
    assert.ok(schema.V17_INTERACTION_IDS.length >= 10);
  });
});

describe('Manifest V1.7 — validateV17Fields', () => {
  let schema;
  test('setup', async () => {
    schema = await import(`${FABRICA}/generator/schema/v1.7Schema.js`);
  });

  test('empty manifest is valid', () => {
    const r = schema.validateV17Fields({});
    assert.equal(r.valid, true);
    assert.equal(r.errors.length, 0);
  });

  test('known vertical passes', () => {
    const r = schema.validateV17Fields({ vertical: 'dental' });
    assert.equal(r.valid, true);
  });

  test('education vertical passes (V1.7)', () => {
    const r = schema.validateV17Fields({ vertical: 'education' });
    assert.equal(r.valid, true);
  });

  test('unknown vertical fails', () => {
    const r = schema.validateV17Fields({ vertical: 'made-up' });
    assert.equal(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('made-up')));
  });

  test('valid experience.preset passes', () => {
    const r = schema.validateV17Fields({ experience: { preset: 'clinical' } });
    assert.equal(r.valid, true);
    assert.ok(r.v17Fields.includes('experience'));
  });

  test('invalid experience.preset fails', () => {
    const r = schema.validateV17Fields({ experience: { preset: 'nonexistent-preset' } });
    assert.equal(r.valid, false);
  });

  test('autoplay without muted fails', () => {
    const r = schema.validateV17Fields({ video: { hero: { autoplay: true, muted: false } } });
    assert.equal(r.valid, false);
    assert.ok(r.errors.some(e => e.includes('muted')));
  });

  test('autoplay with muted passes', () => {
    const r = schema.validateV17Fields({ video: { hero: { autoplay: true, muted: true } } });
    assert.equal(r.valid, true);
  });

  test('dynamicSections array is valid', () => {
    const r = schema.validateV17Fields({ dynamicSections: [{ type: 'metric-row', trigger: 'on-view' }] });
    assert.equal(r.valid, true);
    assert.ok(r.v17Fields.includes('dynamicSections'));
  });

  test('dynamicSections non-array fails', () => {
    const r = schema.validateV17Fields({ dynamicSections: 'invalid' });
    assert.equal(r.valid, false);
  });

  test('always backward compatible', () => {
    const r = schema.validateV17Fields({ experience: { preset: 'clinical' } });
    assert.equal(r.v16Compat, true);
    assert.equal(r.v15Compat, true);
  });
});

describe('Manifest V1.7 — backward compatibility', () => {
  let schema;
  test('setup', async () => {
    schema = await import(`${FABRICA}/generator/schema/v1.7Schema.js`);
  });

  test('V1.5 manifest (no new fields) is valid', () => {
    const v15 = { vertical: 'dental', branding: { nombre: 'Test', primaryColor: '#0c7873' } };
    const r = schema.validateV17Fields(v15);
    assert.equal(r.valid, true);
    assert.equal(r.v17Fields.length, 0);
  });

  test('V1.6 manifest (ai, design, media) is valid', () => {
    const v16 = {
      vertical: 'physio',
      ai: { routing: 'TIER2_CONTEXT' },
      design: { density: 'comfortable' },
      media: { hero: null },
    };
    const r = schema.validateV17Fields(v16);
    assert.equal(r.valid, true);
  });

  test('isV17Manifest: false for V1.5', () => {
    assert.equal(schema.isV17Manifest({ vertical: 'dental' }), false);
  });

  test('isV17Manifest: true when experience present', () => {
    assert.equal(schema.isV17Manifest({ experience: { preset: 'clinical' } }), true);
  });

  test('normalizeManifestV17: fills defaults', () => {
    const n = schema.normalizeManifestV17({ vertical: 'sports' });
    assert.ok(n.experience);
    assert.ok(n.experience.preset);
    assert.ok(n.video);
    assert.ok(Array.isArray(n.dynamicSections));
  });

  test('normalizeManifestV17: version set to 1.7', () => {
    const n = schema.normalizeManifestV17({});
    assert.equal(n.version, '1.7');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. DYNAMIC COMPONENT CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Dynamic Component Configs', () => {
  let comps;
  test('imports successfully', async () => {
    comps = await import(`${FABRICA}/core/dynamicExperience/components.js`);
    assert.ok(comps.DYNAMIC_COMPONENT_CATALOG);
  });

  test('catalog has 15 components', () => {
    assert.equal(comps.DYNAMIC_COMPONENT_CATALOG.length, 15);
  });

  const expectedComponents = [
    'AnimatedMetric', 'Reveal', 'StaggerGroup', 'InteractiveCard',
    'DynamicHero', 'VideoHero', 'AnimatedTimeline', 'ProgressRing',
    'InteractiveChart', 'SmartCarousel', 'BeforeAfter', 'DynamicTabs',
    'MotionButton', 'LoadingSkeleton', 'ScrollProgress',
  ];
  for (const name of expectedComponents) {
    test(`catalog includes "${name}"`, () => {
      assert.ok(comps.DYNAMIC_COMPONENT_CATALOG.includes(name));
    });
  }
});

describe('Dynamic Component Configs — AnimatedMetric', () => {
  let comps;
  test('setup', async () => {
    comps = await import(`${FABRICA}/core/dynamicExperience/components.js`);
  });

  test('getAnimatedMetricConfig returns value', () => {
    const cfg = comps.getAnimatedMetricConfig({ value: 95, unit: '%', preset: 'clinical' });
    assert.equal(cfg.value, 95);
    assert.equal(cfg.unit, '%');
  });

  test('reduced motion sets duration=0', () => {
    const cfg = comps.getAnimatedMetricConfig({ value: 100, reducedMotion: true });
    assert.equal(cfg.duration, 0);
  });

  test('normal mode has duration>0', () => {
    const cfg = comps.getAnimatedMetricConfig({ value: 100, reducedMotion: false });
    assert.ok(cfg.duration > 0);
  });

  test('format function produces correct string', () => {
    const cfg = comps.getAnimatedMetricConfig({ value: 95, unit: '%' });
    assert.equal(cfg.format(95), '95%');
  });
});

describe('Dynamic Component Configs — Reveal', () => {
  let comps;
  test('setup', async () => {
    comps = await import(`${FABRICA}/core/dynamicExperience/components.js`);
  });

  test('valid reveal variants', () => {
    const valid = ['fade', 'slide-up', 'slide-right', 'scale', 'none'];
    assert.deepEqual(comps.REVEAL_VARIANTS, valid);
  });

  test('getRevealInitialStyle: slide-up has opacity and transform', () => {
    const s = comps.getRevealInitialStyle('slide-up');
    assert.equal(s.opacity, 0);
    assert.ok(s.transform.includes('translateY'));
  });

  test('getRevealInitialStyle: reduced motion returns empty', () => {
    const s = comps.getRevealInitialStyle('slide-up', true);
    assert.deepEqual(s, {});
  });

  test('getRevealAnimatedStyle: has transition', () => {
    const s = comps.getRevealAnimatedStyle(400, 'ease-out', 0);
    assert.ok(s.transition.includes('opacity'));
    assert.equal(s.opacity, 1);
  });

  test('getStaggerDelay: increases with index', () => {
    assert.ok(comps.getStaggerDelay(1, 80) > comps.getStaggerDelay(0, 80));
  });

  test('getStaggerDelay: caps at maxChildren', () => {
    const d12 = comps.getStaggerDelay(12, 80, 12);
    const d20 = comps.getStaggerDelay(20, 80, 12);
    assert.equal(d12, d20);
  });
});

describe('Dynamic Component Configs — ProgressRing', () => {
  let comps;
  test('setup', async () => {
    comps = await import(`${FABRICA}/core/dynamicExperience/components.js`);
  });

  test('0% → dashoffset equals circumference', () => {
    const p = comps.getProgressRingProps(0, 40, 8);
    assert.equal(p.dashoffset, p.circumference);
  });

  test('100% → dashoffset is 0', () => {
    const p = comps.getProgressRingProps(100, 40, 8);
    assert.equal(p.dashoffset, 0);
  });

  test('clamped to 0-100', () => {
    const low  = comps.getProgressRingProps(-10, 40, 8);
    const high = comps.getProgressRingProps(110, 40, 8);
    assert.equal(low.percent, 0);
    assert.equal(high.percent, 100);
  });
});

describe('Dynamic Component Configs — misc', () => {
  let comps;
  test('setup', async () => {
    comps = await import(`${FABRICA}/core/dynamicExperience/components.js`);
  });

  test('getCarouselState: canPrev/canNext correct', () => {
    const s0 = comps.getCarouselState(5, 0);
    assert.equal(s0.canPrev, false);
    assert.equal(s0.canNext, true);
    const s4 = comps.getCarouselState(5, 4);
    assert.equal(s4.canPrev, true);
    assert.equal(s4.canNext, false);
  });

  test('getBeforeAfterClipStyle: 50% position', () => {
    const s = comps.getBeforeAfterClipStyle(0.5);
    assert.ok(s.before.clipPath.includes('50%'));
    assert.ok(s.after.clipPath.includes('50%'));
    assert.equal(s.divider.left, '50%');
  });

  test('getScrollProgressPercent: 0 at top', () => {
    assert.equal(comps.getScrollProgressPercent(0, 2000, 768), 0);
  });

  test('getScrollProgressPercent: 100 at bottom', () => {
    assert.equal(comps.getScrollProgressPercent(1232, 2000, 768), 100);
  });

  test('getChartBars: returns correct count', () => {
    const bars = comps.getChartBars([10, 50, 30], { width: 300, height: 150, barWidth: 30, gap: 10 });
    assert.equal(bars.length, 3);
    assert.ok(bars[1].h > bars[0].h);
  });

  test('getMotionButtonStyle: reduced motion has no transform', () => {
    const s = comps.getMotionButtonStyle('high', true);
    assert.deepEqual(s.hover, {});
    assert.deepEqual(s.active, {});
  });

  test('getHeroConfig: reduced motion forces fade', () => {
    const cfg = comps.getHeroConfig('video', 'dental', true);
    assert.equal(cfg.containerClass, comps.HERO_MOTION_CONFIGS.fade.containerClass);
  });

  test('getTabIndicatorStyle: width proportional to container', () => {
    const s = comps.getTabIndicatorStyle(1, 4, 400);
    assert.equal(s.width, 100);
    assert.equal(s.left, 100);
  });

  test('buildTimelineSteps: delays increase', () => {
    const steps = comps.buildTimelineSteps([{label: 'A'}, {label: 'B'}, {label: 'C'}], false);
    assert.ok(steps[1].delay > steps[0].delay);
  });

  test('buildTimelineSteps: reduced motion → zero delays', () => {
    const steps = comps.buildTimelineSteps([{label: 'A'}, {label: 'B'}], true);
    assert.equal(steps[0].delay, 0);
    assert.equal(steps[1].delay, 0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. MEDIA ENGINE V1.7 EXTENSION
// ═══════════════════════════════════════════════════════════════════════════════

describe('Media Engine V1.7 extension', () => {
  let me;
  test('imports successfully', async () => {
    me = await import(`${FABRICA}/core/mediaEngine.js`);
    assert.ok(me.getVideoPlaceholderPoster);
    assert.ok(me.buildVideoConfig);
    assert.ok(me.resolveManifestMediaV17);
  });

  test('getVideoPlaceholderPoster: returns data URI', () => {
    const poster = me.getVideoPlaceholderPoster('dental', 'hero');
    assert.ok(poster.startsWith('data:image/svg+xml'));
  });

  test('getVideoPlaceholderPoster: different verticals return different colors', () => {
    const dental  = me.getVideoPlaceholderPoster('dental', 'hero');
    const sports  = me.getVideoPlaceholderPoster('sports', 'hero');
    assert.notEqual(dental, sports);
  });

  test('buildVideoConfig: autoplay forces muted', () => {
    const cfg = me.buildVideoConfig({ autoplay: true, muted: false }, 'dental', 'heroVideo');
    assert.equal(cfg.muted, true);
  });

  test('resolveManifestMediaV17: extends resolveManifestMedia', () => {
    const result = me.resolveManifestMediaV17({ vertical: 'dental' });
    assert.ok(result.hero, 'still has base media');
    assert.ok(result.videos, 'adds V1.7 videos section');
    assert.ok(result.videos.hero);
    assert.ok(result.videos.ambient);
  });

  test('resolveManifestMediaV17: all 7 video types present', () => {
    const result = me.resolveManifestMediaV17({});
    const videoKeys = Object.keys(result.videos);
    assert.ok(videoKeys.includes('hero'));
    assert.ok(videoKeys.includes('background'));
    assert.ok(videoKeys.includes('services'));
    assert.ok(videoKeys.includes('testimonials'));
    assert.ok(videoKeys.includes('explainer'));
    assert.ok(videoKeys.includes('team'));
    assert.ok(videoKeys.includes('ambient'));
  });

  test('existing resolveManifestMedia still works', () => {
    const result = me.resolveManifestMedia({ vertical: 'dental' });
    assert.ok(result.hero);
    assert.ok(result.gallery);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. EDUCATION VERTICAL READINESS
// ═══════════════════════════════════════════════════════════════════════════════

describe('Education Vertical Readiness', () => {
  let ds, schema, mapping;
  test('setup', async () => {
    [ds, schema, mapping] = await Promise.all([
      import(`${FABRICA}/core/branding/designSystem.js`),
      import(`${FABRICA}/generator/schema/v1.7Schema.js`),
      import(`${FABRICA}/core/dynamicExperience/verticalMapping.js`),
    ]);
  });

  test('education in V17_SUPPORTED_VERTICALS', () => {
    assert.ok(schema.V17_SUPPORTED_VERTICALS.includes('education'));
  });

  test('education in VERTICAL_EXPERIENCE_MAP', () => {
    assert.ok(mapping.VERTICAL_EXPERIENCE_MAP.education);
  });

  test('education in VERTICAL_TOKENS (designSystem)', () => {
    assert.ok(ds.VERTICAL_TOKENS.education);
  });

  test('education has primary color', () => {
    assert.ok(ds.VERTICAL_TOKENS.education.colors.primary);
  });

  test('education has educationMeta with status', () => {
    assert.equal(ds.VERTICAL_TOKENS.education.educationMeta?.status, 'FUTURE_VERTICAL');
  });

  test('education futureRoles includes alumno and profesor', () => {
    const roles = ds.VERTICAL_TOKENS.education.educationMeta?.futureRoles ?? [];
    assert.ok(roles.includes('alumno'));
    assert.ok(roles.includes('profesor'));
  });

  test('education readyForFutureImplementation is true', () => {
    assert.equal(mapping.VERTICAL_EXPERIENCE_MAP.education.readyForFutureImplementation, true);
  });

  test('education futureSubTypes includes eso and bachillerato', () => {
    const types = mapping.VERTICAL_EXPERIENCE_MAP.education.futureSubTypes ?? [];
    assert.ok(types.includes('eso'));
    assert.ok(types.includes('bachillerato'));
  });

  test('education has no real curriculum data (notes only)', () => {
    const meta = ds.VERTICAL_TOKENS.education.educationMeta ?? {};
    const notes = meta.notesCurriculum ?? '';
    assert.ok(notes.toLowerCase().includes('arquitectura lista'));
  });

  test('education getTokens works', () => {
    const tokens = ds.getTokens('education');
    assert.ok(tokens.colors.primary);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. EXPERIENCE ENGINE INDEX (convenience API)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Experience Engine — index exports', () => {
  let engine;
  test('imports successfully', async () => {
    engine = await import(`${FABRICA}/core/dynamicExperience/index.js`);
  });

  const expectedExports = [
    'EXPERIENCE_PRESETS', 'VERTICAL_EXPERIENCE_MAP', 'SCROLL_EFFECTS',
    'INTERACTION_DEFINITIONS', 'PERFORMANCE_BUDGET',
    'resolvePreset', 'getSupportedPresets', 'getVerticalExperience',
    'buildMotionCss', 'buildReducedMotionCss', 'detectReducedMotion',
    'getReducedMotionPreset', 'buildVideoConfig', 'resolveVideoManifest',
    'checkPerformanceBudget', 'getMobilePreset', 'getExperienceConfig',
  ];

  for (const name of expectedExports) {
    test(`exports "${name}"`, () => {
      assert.ok(engine[name] !== undefined, `Missing export: ${name}`);
    });
  }

  test('getExperienceConfig: returns complete config', () => {
    const cfg = engine.getExperienceConfig({ vertical: 'dental' });
    assert.ok(cfg.preset);
    assert.ok(cfg.presetName);
    assert.ok(cfg.motionCss);
    assert.ok(cfg.video);
    assert.ok(Array.isArray(cfg.activeInteractions));
  });

  test('getExperienceConfig: sports gets energetic preset', () => {
    const cfg = engine.getExperienceConfig({ vertical: 'sports' });
    assert.ok(['energetic', 'sports'].includes(cfg.presetName));
  });

  test('getExperienceConfig: reducedMotion strips parallax', () => {
    const cfg = engine.getExperienceConfig(
      { vertical: 'immersive', experience: { preset: 'immersive' } },
      { reducedMotion: true }
    );
    assert.ok(!cfg.preset.scrollEffects.includes('parallax-subtle'));
  });

  test('getExperienceConfig: mobile strips ambient video', () => {
    const cfg = engine.getExperienceConfig(
      { vertical: 'sports' },
      { isMobile: true }
    );
    assert.ok(cfg.preset.videoBehavior !== 'ambient-loop');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. ACCESSIBILITY
// ═══════════════════════════════════════════════════════════════════════════════

describe('Accessibility — reduced motion support', () => {
  let motion, ve, pb, comps;
  test('setup', async () => {
    [motion, ve, pb, comps] = await Promise.all([
      import(`${FABRICA}/core/dynamicExperience/motionConfig.js`),
      import(`${FABRICA}/core/dynamicExperience/videoEngine.js`),
      import(`${FABRICA}/core/dynamicExperience/performanceBudget.js`),
      import(`${FABRICA}/core/dynamicExperience/components.js`),
    ]);
  });

  test('buildReducedMotionCss: animation-duration override included', () => {
    const css = motion.buildReducedMotionCss();
    assert.ok(css.includes('animation-duration: 0.01ms'));
  });

  test('buildReducedMotionCss: transition-duration override included', () => {
    const css = motion.buildReducedMotionCss();
    assert.ok(css.includes('transition-duration: 0.01ms'));
  });

  test('buildReducedMotionCss: video autoplay disabled', () => {
    const css = motion.buildReducedMotionCss();
    assert.ok(css.includes('video[autoplay]') || css.includes('ambient-video'));
  });

  test('buildReducedMotionCss: parallax disabled', () => {
    const css = motion.buildReducedMotionCss();
    assert.ok(css.includes('parallax'));
  });

  test('ambient video disabled when reducedMotion', () => {
    const cfg = ve.buildVideoConfig({}, 'sports', 'ambientLoop');
    assert.equal(ve.shouldDisableVideo(cfg, { reducedMotion: true }), true);
  });

  test('component Reveal: reduced motion → empty initial style', () => {
    const s = comps.getRevealInitialStyle('slide-up', true);
    assert.deepEqual(s, {});
  });

  test('component AnimatedMetric: reduced motion → duration=0', () => {
    const cfg = comps.getAnimatedMetricConfig({ value: 50, reducedMotion: true });
    assert.equal(cfg.duration, 0);
  });

  test('component ProgressRing: still functional with reduced motion', () => {
    const p = comps.getProgressRingProps(75, 40, 8);
    assert.equal(p.percent, 75);
    assert.ok(p.dashoffset < p.circumference);
  });

  test('getAnimationA11yProps: live elements get role=status', () => {
    const props = comps.getAnimationA11yProps('Cargando...', true);
    assert.equal(props.role, 'status');
    assert.equal(props['aria-live'], 'polite');
  });

  test('getMobilePreset: reduces motion for mobile', () => {
    const preset = { scrollEffects: ['fade-in', 'parallax-subtle', 'stagger-reveal', 'counter-on-visible'], motionIntensity: 'high', backgroundMotion: true, videoBehavior: 'ambient-loop' };
    const mobile = pb.getMobilePreset(preset);
    assert.ok(mobile.scrollEffects.length <= 2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. REGRESSION — V1.6 features unaffected
// ═══════════════════════════════════════════════════════════════════════════════

describe('Regression — V1.6 features unaffected by V1.7', () => {
  let ai, media, schema16, ds;
  test('setup', async () => {
    [ai, media, schema16, ds] = await Promise.all([
      import(`${FABRICA}/core/aiRouter.js`),
      import(`${FABRICA}/core/mediaEngine.js`),
      import(`${FABRICA}/generator/schema/v1.6Schema.js`),
      import(`${FABRICA}/core/branding/designSystem.js`),
    ]);
  });

  test('aiRouter: bilingual classification still works', () => {
    const r = ai.classifyTask('Modifica autenticación y despliega producción', { localModelAvailable: true });
    assert.equal(r.tier, 'TIER4_REVIEW');
  });

  test('mediaEngine: original functions intact', () => {
    assert.ok(typeof media.makeSvgPlaceholder === 'function');
    assert.ok(typeof media.resolveManifestMedia === 'function');
    assert.ok(typeof media.generateFaviconDataUri === 'function');
  });

  test('designSystem: 10 original verticals still work', () => {
    const verticals = ['dental', 'legal', 'physio', 'psychology', 'speech-therapy',
                       'sports', 'veterinary', 'hairdresser', 'beauty', 'fertility'];
    for (const v of verticals) {
      assert.ok(ds.VERTICAL_TOKENS[v], `Missing: ${v}`);
    }
  });

  test('designSystem: backward compat aliases still work', () => {
    assert.ok(ds.VERTICAL_TOKENS.fisioterapia);
    assert.ok(ds.VERTICAL_TOKENS.estetica);
    assert.ok(ds.VERTICAL_TOKENS.abogados);
  });

  test('V1.6Schema: still importable and functional', () => {
    assert.ok(schema16.validateV16Fields);
    const r = schema16.validateV16Fields({ vertical: 'dental' });
    assert.ok(r.valid !== undefined);
  });
});
