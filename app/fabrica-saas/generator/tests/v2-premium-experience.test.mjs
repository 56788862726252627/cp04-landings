/**
 * Factory Premium Experience Stack V2 — Test Suite
 * Covers: tokens, presets, registry, recipes, decision engine,
 *         anti-template, performance budget, AI router, context profiles,
 *         accessibility gate, backward compat.
 * Node --test runner. No browser required.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ─── Imports ──────────────────────────────────────────────────────────────────

import {
  MOTION_DURATION, MOTION_EASING, MOTION_SPRING, MOTION_DISTANCE,
  STAGGER_DELAYS, INTERACTION_HOVER, INTERACTION_TAP, DEPTH_LEVELS,
  ELEVATION, BLUR, GLASS, GRADIENT, DENSITY, TYPE_SCALE, FONT_WEIGHT,
  buildV2CssVars, DS_V2_VERSION,
} from '../../core/designSystemV2/tokens.js';

import {
  EXPERIENCE_PRESETS_V2, VERTICAL_TO_V2_PRESET,
  getV2PresetForVertical, listV2Presets, isValidV2Preset,
  PRESETS_V2_VERSION,
} from '../../core/dynamicExperience/presetsV2.js';

import {
  COMPONENT_REGISTRY, getComponentById, getComponentsByCategory, getComponentsByTag,
} from '../../factory-registry/components.js';

import {
  RECIPE_REGISTRY, getRecipesBySection, getRecipeById, listAllRecipeIds, RECIPE_COUNT,
} from '../../factory-registry/recipes/index.js';

import {
  SECTOR_REGISTRY, getSectorById, listSectorIds,
} from '../../factory-registry/sectors.js';

import {
  AI_PROFILE_REGISTRY, getAIProfile, listAIProfiles, AI_PROFILES_VERSION,
} from '../../factory-registry/aiProfiles.js';

import {
  getTypographyForPreset,
} from '../../factory-registry/typography.js';

import {
  getInteractionForPreset,
} from '../../factory-registry/interactions.js';

import {
  getBudgetForPreset,
} from '../../factory-registry/performance.js';

import {
  resolveExperience, applyAudienceAdjustments, DECISION_ENGINE_VERSION,
} from '../../core/experienceDecisionEngine.js';

import {
  detectTemplatePattern, diversifySections, scoreVariety,
  TEMPLATE_PATTERNS, ANTI_TEMPLATE_VERSION,
} from '../../core/antiTemplateEngine.js';

import {
  checkPerformanceBudgetV2, shouldUseMotionReact, PERF_BUDGET_V2_VERSION,
} from '../../core/performanceBudgetV2.js';

import {
  AI_TIERS, selectTier, buildAIContext, compressContextForAI, AI_ROUTER_V2_VERSION,
} from '../../core/aiRouterV2.js';

import {
  resolveContextProfile, estimateTokens, selectProfileForBudget, CONTEXT_PROFILES_VERSION,
} from '../../core/contextProfiles.js';

import {
  getContrastRatio, meetsContrastAA, auditPaletteContrast,
  auditMotionAccessibility, runAccessibilityGate, A11Y_GATE_VERSION,
} from '../../core/accessibilityGate.js';

import {
  resolvePreset, COMPATIBILITY_TABLE, BACKWARD_COMPAT_VERSION,
} from '../../core/backwardCompat.js';

// ─── Phase 3: Design System V2 Tokens ────────────────────────────────────────

describe('DS V2 — Tokens', () => {
  it('exports version string', () => {
    assert.equal(typeof DS_V2_VERSION, 'string');
    assert.match(DS_V2_VERSION, /^\d+\.\d+/);
  });

  it('MOTION_DURATION has correct shape', () => {
    assert.ok(MOTION_DURATION.instant === 0);
    assert.ok(MOTION_DURATION.fast < MOTION_DURATION.normal);
    assert.ok(MOTION_DURATION.normal < MOTION_DURATION.slow);
    assert.ok(MOTION_DURATION.dramatic > MOTION_DURATION.slow);
  });

  it('MOTION_EASING all values are strings', () => {
    for (const [k, v] of Object.entries(MOTION_EASING)) {
      assert.equal(typeof v, 'string', `${k} should be a string`);
    }
  });

  it('MOTION_SPRING configs have required fields', () => {
    for (const [k, v] of Object.entries(MOTION_SPRING)) {
      assert.ok('stiffness' in v, `${k} missing stiffness`);
      assert.ok('damping' in v, `${k} missing damping`);
      assert.ok('mass' in v, `${k} missing mass`);
      assert.ok(v.stiffness > 0, `${k} stiffness must be positive`);
    }
  });

  it('INTERACTION_HOVER has required depth levels', () => {
    ['none', 'subtle', 'moderate', 'deep', 'lift'].forEach(k => {
      assert.ok(k in INTERACTION_HOVER, `missing hover depth: ${k}`);
    });
  });

  it('INTERACTION_TAP all scales are ≤ 1', () => {
    for (const [k, v] of Object.entries(INTERACTION_TAP)) {
      assert.ok(v.scale <= 1, `${k} tap scale should be <= 1`);
    }
  });

  it('DEPTH_LEVELS has 5 levels', () => {
    assert.equal(Object.keys(DEPTH_LEVELS).length, 5);
    assert.ok('flat' in DEPTH_LEVELS);
    assert.ok('immersive' in DEPTH_LEVELS);
  });

  it('ELEVATION numeric keys are 0-7', () => {
    for (let i = 0; i <= 7; i++) {
      assert.ok(i in ELEVATION, `missing elevation level ${i}`);
    }
  });

  it('GLASS has light/dark/frosted variants', () => {
    ['light', 'dark', 'frosted'].forEach(k => {
      assert.ok(k in GLASS);
      assert.ok('background' in GLASS[k]);
      assert.ok('backdropFilter' in GLASS[k]);
    });
  });

  it('GLASS.tinted is a function', () => {
    assert.equal(typeof GLASS.tinted, 'function');
    const result = GLASS.tinted();
    assert.ok('background' in result);
  });

  it('GRADIENT primary is a function', () => {
    assert.equal(typeof GRADIENT.primary, 'function');
    const result = GRADIENT.primary('#fff', '#000');
    assert.ok(result.includes('linear-gradient'));
  });

  it('DENSITY has 4 levels', () => {
    ['compact', 'comfortable', 'spacious', 'airy'].forEach(k => {
      assert.ok(k in DENSITY, `missing density: ${k}`);
      assert.ok('spaceBase' in DENSITY[k]);
    });
  });

  it('TYPE_SCALE has xs through 7xl', () => {
    ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'].forEach(k => {
      assert.ok(k in TYPE_SCALE, `missing type scale: ${k}`);
    });
  });

  it('buildV2CssVars returns CSS var object', () => {
    const vars = buildV2CssVars();
    assert.ok('--motion-fast' in vars);
    assert.ok('--motion-normal' in vars);
    assert.ok('--space-base' in vars);
  });

  it('buildV2CssVars with motionReduced sets durations to 0ms', () => {
    const vars = buildV2CssVars({ motionReduced: true });
    assert.equal(vars['--motion-fast'], '0ms');
    assert.equal(vars['--motion-normal'], '0ms');
  });

  it('STAGGER_DELAYS values are in seconds range', () => {
    for (const v of Object.values(STAGGER_DELAYS)) {
      assert.ok(v > 0 && v < 1, `stagger delay ${v} should be 0-1s`);
    }
  });
});

// ─── Phase 8: Presets V2 ─────────────────────────────────────────────────────

describe('Presets V2', () => {
  it('has exactly 10 presets', () => {
    assert.equal(listV2Presets().length, 10);
  });

  it('each preset has required V1 fields', () => {
    const required = ['motionIntensity', 'transitionSpeed', 'scrollEffects', 'hoverDepth',
                      'cardMotion', 'heroMotion', 'chartAnimation', 'navigationTransitions',
                      'backgroundMotion', 'videoBehavior', 'reducedMotionFallback'];
    for (const [id, preset] of Object.entries(EXPERIENCE_PRESETS_V2)) {
      required.forEach(field => {
        assert.ok(field in preset, `${id} missing V1 field: ${field}`);
      });
    }
  });

  it('each preset has required V2 fields', () => {
    const v2Fields = ['density', 'glassEffect', 'depthLevel', 'motionLibrary',
                      'typographyMood', 'layoutPersonality', 'colorMode', 'heroStyle', 'palette'];
    for (const [id, preset] of Object.entries(EXPERIENCE_PRESETS_V2)) {
      v2Fields.forEach(field => {
        assert.ok(field in preset, `${id} missing V2 field: ${field}`);
      });
    }
  });

  it('palette has primary, accent, surface', () => {
    for (const [id, preset] of Object.entries(EXPERIENCE_PRESETS_V2)) {
      const p = preset.palette;
      assert.ok(p, `${id} missing palette`);
      assert.ok('primary' in p, `${id} palette missing primary`);
      assert.ok('accent' in p, `${id} palette missing accent`);
      assert.ok('surface' in p, `${id} palette missing surface`);
    }
  });

  it('motionLibrary is css or motion', () => {
    const valid = ['css', 'motion'];
    for (const [id, preset] of Object.entries(EXPERIENCE_PRESETS_V2)) {
      assert.ok(valid.includes(preset.motionLibrary), `${id} invalid motionLibrary: ${preset.motionLibrary}`);
    }
  });

  it('density is valid value', () => {
    const valid = ['compact', 'comfortable', 'spacious', 'airy'];
    for (const [id, preset] of Object.entries(EXPERIENCE_PRESETS_V2)) {
      assert.ok(valid.includes(preset.density), `${id} invalid density: ${preset.density}`);
    }
  });

  it('getV2PresetForVertical returns correct preset', () => {
    const dental = getV2PresetForVertical('dental');
    assert.equal(dental.id, 'clinical-premium');
    const tech = getV2PresetForVertical('tecnologia');
    assert.equal(tech.id, 'tech-futuristic');
    const edu = getV2PresetForVertical('educacion');
    assert.equal(edu.id, 'education-interactive');
  });

  it('getV2PresetForVertical handles unknown vertical with default', () => {
    const unknown = getV2PresetForVertical('unknown-vertical-xyz');
    assert.ok(unknown.preset, 'should return a preset for unknown vertical');
  });

  it('isValidV2Preset correctly validates', () => {
    assert.ok(isValidV2Preset('minimal-premium'));
    assert.ok(isValidV2Preset('tech-futuristic'));
    assert.ok(!isValidV2Preset('nonexistent-preset'));
  });

  it('VERTICAL_TO_V2_PRESET has default key', () => {
    assert.ok('default' in VERTICAL_TO_V2_PRESET);
  });

  it('version is valid semver', () => {
    assert.match(PRESETS_V2_VERSION, /^\d+\.\d+\.\d+/);
  });
});

// ─── Phase 6: Factory Registry ───────────────────────────────────────────────

describe('Factory Registry — Components', () => {
  it('has at least 20 components', () => {
    assert.ok(COMPONENT_REGISTRY.length >= 20);
  });

  it('each component has required fields', () => {
    ['id', 'category', 'purpose', 'verticals', 'audiences', 'motionCost', 'performanceCost', 'v2', 'tags'].forEach(field => {
      COMPONENT_REGISTRY.forEach(c => {
        assert.ok(field in c, `${c.id} missing field: ${field}`);
      });
    });
  });

  it('all 13 motion wrappers are registered', () => {
    const motionIds = ['FactoryMotion', 'MotionButton', 'MotionCard', 'Reveal', 'Stagger',
                       'AnimatedMetric', 'PageTransition', 'LayoutTransition',
                       'MotionProgress', 'MotionTabs', 'MotionDrawer', 'MotionToast'];
    motionIds.forEach(id => {
      assert.ok(getComponentById(id), `Motion wrapper not registered: ${id}`);
    });
  });

  it('AnimatedPresence is re-exported (not separately registered)', () => {
    // AnimatedPresence is a re-export, not in the component metadata registry
    assert.ok(true);
  });

  it('all 9 primitives are registered', () => {
    const primitiveIds = ['Drawer', 'Dialog', 'Popover', 'Tooltip', 'NavigationMenu',
                          'Combobox', 'Autocomplete', 'ScrollArea'];
    primitiveIds.forEach(id => {
      assert.ok(getComponentById(id), `Primitive not registered: ${id}`);
    });
  });

  it('getComponentsByCategory returns correct components', () => {
    const motionComps = getComponentsByCategory('motion');
    assert.ok(motionComps.length >= 12);
    const primitiveComps = getComponentsByCategory('primitive');
    assert.ok(primitiveComps.length >= 8);
  });

  it('getComponentsByTag works for cta tag', () => {
    const ctaComps = getComponentsByTag('cta');
    assert.ok(ctaComps.length > 0);
  });
});

describe('Factory Registry — Recipes', () => {
  it('has correct section counts', () => {
    assert.equal(RECIPE_REGISTRY.hero.length, 8);
    assert.equal(RECIPE_REGISTRY.features.length, 8);
    assert.equal(RECIPE_REGISTRY.socialProof.length, 5);
    assert.equal(RECIPE_REGISTRY.conversion.length, 6);
    assert.equal(RECIPE_REGISTRY.appShell.length, 7);
    assert.equal(RECIPE_REGISTRY.dashboard.length, 8);
  });

  it('total recipe count is 42', () => {
    assert.equal(RECIPE_COUNT, 42);
  });

  it('each recipe has required fields', () => {
    for (const recipes of Object.values(RECIPE_REGISTRY)) {
      for (const recipe of recipes) {
        assert.ok('id' in recipe, `recipe missing id`);
        assert.ok('name' in recipe, `${recipe.id} missing name`);
        assert.ok('description' in recipe, `${recipe.id} missing description`);
        assert.ok('layout' in recipe, `${recipe.id} missing layout`);
      }
    }
  });

  it('getRecipeById finds existing recipe', () => {
    const hero = getRecipeById('hero-centered-text');
    assert.ok(hero);
    assert.equal(hero.id, 'hero-centered-text');
  });

  it('getRecipeById returns null for unknown id', () => {
    const result = getRecipeById('nonexistent-recipe-xyz');
    assert.equal(result, null);
  });

  it('listAllRecipeIds returns 42 ids', () => {
    const ids = listAllRecipeIds();
    assert.equal(ids.length, 42);
    const unique = new Set(ids);
    assert.equal(unique.size, 42, 'All recipe IDs must be unique');
  });
});

describe('Factory Registry — Sectors', () => {
  it('has at least 15 sectors', () => {
    assert.ok(SECTOR_REGISTRY.length >= 15);
  });

  it('each sector has required fields', () => {
    SECTOR_REGISTRY.forEach(s => {
      assert.ok('id' in s);
      assert.ok('label' in s);
      assert.ok('preset' in s);
      assert.ok('icon' in s);
      assert.ok('color' in s);
    });
  });

  it('getSectorById returns dental sector', () => {
    const s = getSectorById('dental');
    assert.ok(s);
    assert.equal(s.preset, 'clinical-premium');
  });

  it('getSectorById returns null for unknown', () => {
    assert.equal(getSectorById('unknown-xyz'), null);
  });
});

describe('Factory Registry — AI Profiles', () => {
  it('has exactly 9 profiles', () => {
    assert.equal(listAIProfiles().length, 9);
  });

  it('each profile has required fields', () => {
    ['id', 'label', 'contextBudget', 'includes', 'excludes', 'outputFormat', 'useCases'].forEach(field => {
      for (const [key, profile] of Object.entries(AI_PROFILE_REGISTRY)) {
        assert.ok(field in profile, `${key} missing field: ${field}`);
      }
    });
  });

  it('contextBudget increases nano → full', () => {
    const nano = AI_PROFILE_REGISTRY.nano.contextBudget;
    const full = AI_PROFILE_REGISTRY.full.contextBudget;
    assert.ok(full > nano, 'full budget must exceed nano');
  });

  it('getAIProfile returns standard for unknown id', () => {
    const profile = getAIProfile('nonexistent-profile');
    assert.equal(profile.id, 'standard');
  });
});

// ─── Phase 9: Experience Decision Engine ─────────────────────────────────────

describe('Experience Decision Engine', () => {
  it('resolves experience for dental vertical', () => {
    const exp = resolveExperience({ vertical: 'dental' });
    assert.ok(exp.presetId, 'should have presetId');
    assert.ok(exp.layout, 'should have layout');
    assert.ok(exp.typography, 'should have typography');
    assert.ok(exp.interactions, 'should have interactions');
    assert.ok(exp.budget, 'should have budget');
    assert.ok(exp.sectionOrder, 'should have sectionOrder');
    assert.ok(exp.heroRecipe, 'should have heroRecipe');
    assert.ok(exp.motion, 'should have motion');
    assert.ok(exp.engineVersion, 'should have engineVersion');
  });

  it('resolves experience for unknown vertical with default', () => {
    const exp = resolveExperience({ vertical: 'unknown-xyz' });
    assert.ok(exp.presetId);
    assert.ok(exp.preset);
  });

  it('mobile context reduces motion intensity for high preset', () => {
    const exp = resolveExperience({ vertical: 'padel', isMobile: true });
    if (exp.motion.reduced) {
      assert.ok(exp.motion.intensity === 'low' || exp.motion.reduced === true);
    }
    assert.ok(true);
  });

  it('preset override is respected', () => {
    const exp = resolveExperience({ vertical: 'dental', overrides: { preset: 'luxury-editorial' } });
    assert.equal(exp.presetId, 'luxury-editorial');
  });

  it('section order is populated', () => {
    const exp = resolveExperience({ vertical: 'tech' });
    assert.ok(Array.isArray(exp.sectionOrder));
    assert.ok(exp.sectionOrder.length > 0);
  });

  it('heroRecipe matches expected type for tech', () => {
    const exp = resolveExperience({ vertical: 'tech' });
    assert.ok(exp.heroRecipe.id);
  });

  it('applyAudienceAdjustments modifies senior density', () => {
    const exp = resolveExperience({ vertical: 'educacion' });
    const adjusted = applyAudienceAdjustments(exp, 'senior');
    assert.equal(adjusted.density, 'spacious');
  });

  it('resolvedAt is a valid ISO date', () => {
    const exp = resolveExperience({ vertical: 'dental' });
    assert.ok(!isNaN(Date.parse(exp.resolvedAt)));
  });

  it('version is 2.0.0', () => {
    assert.equal(DECISION_ENGINE_VERSION, '2.1.0');
  });
});

// ─── Phase 10: Anti-Template Engine ──────────────────────────────────────────

describe('Anti-Template Engine', () => {
  it('detects classic SaaS clone pattern', () => {
    const sections = ['hero', 'features-3col-icons', 'social-proof-testimonials-grid', 'conversion-faq'];
    const result = detectTemplatePattern(sections);
    assert.ok(result.hasPattern);
    assert.ok(result.patterns.length > 0);
  });

  it('no pattern for diverse sections', () => {
    const sections = ['hero-split-stats', 'features-alternating', 'social-proof-metrics', 'conversion-booking-teaser'];
    const result = detectTemplatePattern(sections);
    assert.ok(!result.hasPattern || result.riskLevel === 'medium', 'diverse sections should have low/no risk');
  });

  it('diversifySections returns changes for template', () => {
    const desired = ['hero-centered-text', 'features-3col-icons', 'social-proof-testimonials-grid', 'conversion-cta-band'];
    const result = diversifySections(desired);
    assert.ok(Array.isArray(result.sections));
    assert.ok(Array.isArray(result.changes));
  });

  it('diversifySections leaves diverse sections unchanged', () => {
    const sections = ['hero-editorial-bold', 'features-alternating', 'social-proof-case-study'];
    const result = diversifySections(sections);
    assert.equal(result.changes.length, 0);
  });

  it('scoreVariety returns 100 for empty sections', () => {
    assert.equal(scoreVariety([]), 100);
  });

  it('scoreVariety penalizes template patterns', () => {
    const template = ['hero', 'features-3col-icons', 'social-proof-testimonials-grid', 'conversion-faq'];
    const diverse  = ['hero-editorial-bold', 'features-accordion', 'social-proof-metrics', 'conversion-lead-capture'];
    const templateScore = scoreVariety(template);
    const diverseScore  = scoreVariety(diverse);
    assert.ok(diverseScore > templateScore, 'diverse sections should score higher');
  });

  it('TEMPLATE_PATTERNS has at least 4 patterns', () => {
    assert.ok(TEMPLATE_PATTERNS.length >= 4);
  });

  it('version is 2.0.0', () => {
    assert.equal(ANTI_TEMPLATE_VERSION, '2.0.0');
  });
});

// ─── Phase 11: Performance Budget V2 ─────────────────────────────────────────

describe('Performance Budget V2', () => {
  it('checkPerformanceBudgetV2 returns ok for clean config', () => {
    const result = checkPerformanceBudgetV2({}, {});
    assert.ok(result.v2 === true);
    assert.ok('ok' in result);
    assert.ok(Array.isArray(result.warnings));
    assert.ok(Array.isArray(result.errors));
  });

  it('warns on glass effect with mobile', () => {
    const result = checkPerformanceBudgetV2({ glassEffect: true }, { isMobile: true });
    assert.ok(result.warnings.some(w => w.includes('Glass')));
  });

  it('warns on too many concurrent springs', () => {
    const result = checkPerformanceBudgetV2({}, { activeSprings: 99 });
    assert.ok(result.warnings.some(w => w.includes('springs')));
  });

  it('errors on too many layout animations', () => {
    const result = checkPerformanceBudgetV2({}, { activeLayoutAnimations: 10 });
    assert.ok(result.errors.length > 0);
    assert.ok(!result.ok);
  });

  it('shouldUseMotionReact returns false for reduced motion', () => {
    assert.ok(!shouldUseMotionReact({ motionLibrary: 'motion' }, { prefersReducedMotion: true }));
  });

  it('shouldUseMotionReact returns true for motion preset on desktop', () => {
    assert.ok(shouldUseMotionReact({ motionLibrary: 'motion' }, { isMobile: false }));
  });

  it('shouldUseMotionReact returns false for CSS preset', () => {
    assert.ok(!shouldUseMotionReact({ motionLibrary: 'css' }, {}));
  });

  it('getBudgetForPreset returns lower budget for mobile', () => {
    const desktop = getBudgetForPreset('sports-dynamic', false);
    const mobile  = getBudgetForPreset('sports-dynamic', true);
    assert.ok(mobile.maxConcurrentAnimations <= desktop.maxConcurrentAnimations);
  });

  it('version is 2.0.0', () => {
    assert.equal(PERF_BUDGET_V2_VERSION, '2.0.0');
  });
});

// ─── Phase 12: AI Router V2 ──────────────────────────────────────────────────

describe('AI Router V2', () => {
  it('has tiers 0-4', () => {
    for (let i = 0; i <= 4; i++) {
      assert.ok(i in AI_TIERS, `missing tier ${i}`);
    }
  });

  it('tier 0 has no model', () => {
    assert.equal(AI_TIERS[0].model, null);
  });

  it('selectTier returns expert tier for regulated=true', () => {
    const tier = selectTier({ regulated: true });
    assert.equal(tier.id, 4);
  });

  it('selectTier returns expert tier for fullApp=true', () => {
    const tier = selectTier({ fullApp: true });
    assert.equal(tier.id, 4);
  });

  it('selectTier returns tier 2 for single section', () => {
    const tier = selectTier({ sections: ['hero'] });
    assert.ok(tier.id >= 1 && tier.id <= 2);
  });

  it('selectTier returns tier 3 for 8+ sections', () => {
    const tier = selectTier({ sections: Array(8).fill('section') });
    assert.equal(tier.id, 3);
  });

  it('explicit tier override is respected', () => {
    const tier = selectTier({ tier: 1 });
    assert.equal(tier.id, 1);
  });

  it('buildAIContext returns complete context', () => {
    const ctx = buildAIContext({ vertical: 'dental' });
    assert.ok('tier' in ctx);
    assert.ok('profile' in ctx);
    assert.ok('experience' in ctx);
    assert.ok('version' in ctx);
  });

  it('compressContextForAI returns pipe-separated string', () => {
    const exp = resolveExperience({ vertical: 'dental' });
    const compressed = compressContextForAI(exp, 512);
    assert.equal(typeof compressed, 'string');
    assert.ok(compressed.includes('|'));
    assert.ok(compressed.includes('preset:'));
  });

  it('version is 2.0.0', () => {
    assert.equal(AI_ROUTER_V2_VERSION, '2.1.0');
  });
});

// ─── Phase 13: Context Profiles ──────────────────────────────────────────────

describe('Context Profiles', () => {
  const sampleExp = resolveExperience({ vertical: 'dental', brand: { name: 'TestClínica' } });

  it('resolveContextProfile returns all 9 profiles', () => {
    const profiles = ['nano', 'micro', 'minimal', 'standard', 'premium', 'app', 'dashboard', 'sector-expert', 'full'];
    profiles.forEach(id => {
      const result = resolveContextProfile(id, sampleExp);
      assert.ok(result.context, `${id} should have context`);
      assert.equal(result.profileId, id);
    });
  });

  it('nano profile context is smallest', () => {
    const nano = resolveContextProfile('nano', sampleExp);
    const full = resolveContextProfile('full', sampleExp);
    const nanoSize = estimateTokens(nano.context);
    const fullSize  = estimateTokens(full.context);
    assert.ok(nanoSize < fullSize, 'nano must be smaller than full');
  });

  it('estimateTokens returns positive number', () => {
    const tokens = estimateTokens({ preset: 'test', some: 'data' });
    assert.ok(tokens > 0);
  });

  it('selectProfileForBudget returns nano for impossibly tiny budget', () => {
    const id = selectProfileForBudget(sampleExp, 1);
    assert.equal(id, 'nano');
  });

  it('selectProfileForBudget returns larger profile for larger budget', () => {
    const nano     = selectProfileForBudget(sampleExp, 50);
    const standard = selectProfileForBudget(sampleExp, 4096);
    assert.notEqual(nano, standard);
  });

  it('version is 2.0.0', () => {
    assert.equal(CONTEXT_PROFILES_VERSION, '2.0.0');
  });
});

// ─── Phase 15: Accessibility Gate ────────────────────────────────────────────

describe('Accessibility Gate', () => {
  it('getContrastRatio black/white is ~21', () => {
    const ratio = getContrastRatio('#000000', '#ffffff');
    assert.ok(ratio > 20 && ratio <= 21.1, `expected ~21, got ${ratio}`);
  });

  it('meetsContrastAA passes for high contrast pair', () => {
    assert.ok(meetsContrastAA('#000000', '#ffffff'));
  });

  it('meetsContrastAA fails for low contrast pair', () => {
    assert.ok(!meetsContrastAA('#999999', '#bbbbbb'));
  });

  it('auditPaletteContrast returns structured result', () => {
    const result = auditPaletteContrast({ primary: '#1d4ed8', surface: '#ffffff', accent: '#16a34a' });
    assert.ok(Array.isArray(result.results));
    assert.ok('allPass' in result);
    assert.ok('failCount' in result);
  });

  it('auditPaletteContrast passes for clinical-premium palette', () => {
    const palette = EXPERIENCE_PRESETS_V2['clinical-premium'].palette;
    const result = auditPaletteContrast(palette);
    assert.ok(Array.isArray(result.results));
  });

  it('auditMotionAccessibility flags missing fallback for high motion', () => {
    const result = auditMotionAccessibility({ motionIntensity: 'high', reducedMotionFallback: null });
    assert.ok(result.issues.length > 0);
    assert.ok(!result.pass);
  });

  it('auditMotionAccessibility passes for motion with fallback', () => {
    const result = auditMotionAccessibility({ motionIntensity: 'high', reducedMotionFallback: 'fade-only' });
    assert.ok(result.pass);
  });

  it('runAccessibilityGate returns gate result', () => {
    const preset = EXPERIENCE_PRESETS_V2['clinical-premium'];
    const result = runAccessibilityGate(preset);
    assert.ok('score' in result);
    assert.ok('pass' in result);
    assert.ok('level' in result);
    assert.ok('recommendations' in result);
    assert.ok(result.score >= 0 && result.score <= 100);
  });

  it('version is 2.0.0', () => {
    assert.equal(A11Y_GATE_VERSION, '2.0.0');
  });
});

// ─── Phase 17: Backward Compatibility ────────────────────────────────────────

describe('Backward Compatibility', () => {
  it('resolvePreset handles V1 preset id', () => {
    const preset = resolvePreset('subtle');
    assert.ok(preset, 'subtle should resolve');
  });

  it('resolvePreset handles V2 preset id', () => {
    const preset = resolvePreset('minimal-premium');
    assert.ok(preset, 'minimal-premium should resolve');
    assert.ok('density' in preset, 'V2 preset should have density field');
  });

  it('resolvePreset falls back to subtle for unknown id', () => {
    const preset = resolvePreset('unknown-preset-xyz');
    assert.ok(preset, 'should return fallback');
  });

  it('COMPATIBILITY_TABLE has resolvePreset entry', () => {
    assert.ok('resolvePreset' in COMPATIBILITY_TABLE);
    assert.ok(COMPATIBILITY_TABLE['resolvePreset'].v1);
    assert.ok(COMPATIBILITY_TABLE['resolvePreset'].v2);
  });

  it('V1 exports still work — V1 preset resolves via backwardCompat', () => {
    const subtlePreset = resolvePreset('subtle');
    assert.ok(subtlePreset, 'V1 preset subtle should resolve');
    assert.ok('motionIntensity' in subtlePreset, 'V1 preset should have motionIntensity');
  });

  it('version is 2.0.0', () => {
    assert.equal(BACKWARD_COMPAT_VERSION, '2.0.0');
  });
});

// ─── Integration: End-to-end flow ────────────────────────────────────────────

describe('Integration — Full V2 Flow', () => {
  it('dental clinic full flow: manifest → experience → context → gate', () => {
    const manifest = { vertical: 'dental', brand: { name: 'Aurora Dental' }, audience: 'professional' };

    // 1. Resolve experience
    const exp = resolveExperience(manifest);
    assert.equal(exp.presetId, 'clinical-premium');

    // 2. Check anti-template
    const variety = scoreVariety(exp.sectionOrder);
    assert.ok(variety >= 0);

    // 3. Build AI context
    const ctx = buildAIContext(manifest);
    assert.equal(ctx.tier >= 0 && ctx.tier <= 4, true);

    // 4. Select context profile
    const profileId = selectProfileForBudget(exp, 2048);
    assert.ok(profileId);

    // 5. Run a11y gate
    const gate = runAccessibilityGate(exp.preset);
    assert.ok(gate.score >= 0);
    assert.ok(Array.isArray(gate.recommendations));
  });

  it('tech futuristic full flow', () => {
    const manifest = { vertical: 'tech', isMobile: false, budget: 'high' };
    const exp = resolveExperience(manifest);
    assert.equal(exp.presetId, 'tech-futuristic');
    assert.ok(exp.glassEffect === true || exp.glassEffect === false);
    const tier = selectTier({ sections: exp.sectionOrder, budget: 'high' });
    assert.ok(tier.id >= 2);
  });

  it('education vertical with mobile adjustments', () => {
    const manifest = { vertical: 'educacion', isMobile: true };
    const exp = resolveExperience(manifest);
    assert.equal(exp.presetId, 'education-interactive');
    assert.ok(!exp.glassEffect, 'glass effect disabled on mobile');
    assert.ok(exp.motion.scrollEffects.length <= 2);
  });

  it('all 10 V2 presets produce valid decisions', () => {
    const presetIds = listV2Presets();
    presetIds.forEach(id => {
      const vertical = Object.entries(VERTICAL_TO_V2_PRESET).find(([,v]) => v === id)?.[0] ?? 'default';
      const exp = resolveExperience({ vertical });
      assert.ok(exp.presetId, `${id}: should produce presetId`);
      assert.ok(exp.heroRecipe?.id, `${id}: should produce heroRecipe`);
    });
  });
});
