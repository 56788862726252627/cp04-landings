/**
 * Factory Context Profiles V2 — Token Saving Registries
 * 9 profiles that control how much context is loaded for AI generation.
 * Each profile is a lens: same codebase, different info surface.
 */

import { AI_PROFILE_REGISTRY, getAIProfile } from '../factory-registry/aiProfiles.js';

// ─── Profile content resolvers ────────────────────────────────────────────────

const PROFILE_RESOLVERS = Object.freeze({

  nano: (experience) => ({
    sector:   experience.sector?.id,
    preset:   experience.presetId,
    brand:    experience.brand?.name ?? 'Demo',
  }),

  micro: (experience) => ({
    sector:      experience.sector?.id,
    preset:      experience.presetId,
    brand:       experience.brand?.name ?? 'Demo',
    hero:        experience.heroRecipe?.id,
    colorMode:   experience.colorMode,
    density:     experience.density,
  }),

  minimal: (experience) => ({
    sector:    experience.sector?.id,
    preset:    experience.presetId,
    brand:     experience.brand,
    palette:   experience.preset?.palette,
    hero:      experience.heroRecipe?.id,
  }),

  standard: (experience) => ({
    sector:      experience.sector,
    presetId:    experience.presetId,
    preset:      compactPreset(experience.preset),
    brand:       experience.brand,
    hero:        experience.heroRecipe,
    sections:    experience.sectionOrder,
    typography:  experience.typography,
    interactions: summarizeInteractions(experience.interactions),
    colorMode:   experience.colorMode,
    density:     experience.density,
  }),

  premium: (experience) => ({
    sector:      experience.sector,
    presetId:    experience.presetId,
    preset:      experience.preset,
    brand:       experience.brand,
    hero:        experience.heroRecipe,
    sections:    experience.sectionOrder,
    typography:  experience.typography,
    interactions: experience.interactions,
    motion:      experience.motion,
    layout:      experience.layout,
    colorMode:   experience.colorMode,
    density:     experience.density,
    glassEffect: experience.glassEffect,
  }),

  app: (experience) => ({
    ...experience,
    budget: undefined,
    resolvedAt: undefined,
  }),

  dashboard: (experience) => ({
    sector:   experience.sector,
    presetId: experience.presetId,
    brand:    experience.brand,
    density:  experience.density,
    motion:   experience.motion,
    sections: experience.sectionOrder?.filter(s => s.startsWith('dashboard') || s === 'topbar'),
    typography: experience.typography,
  }),

  'sector-expert': (experience) => ({
    sector:     experience.sector,
    presetId:   experience.presetId,
    preset:     experience.preset,
    brand:      experience.brand,
    hero:       experience.heroRecipe,
    sections:   experience.sectionOrder,
    typography: experience.typography,
    interactions: experience.interactions,
    density:    experience.density,
  }),

  full: (experience) => experience,
});

// ─── Main resolver ────────────────────────────────────────────────────────────

/**
 * Resolve context payload for a given profile ID and experience.
 */
export function resolveContextProfile(profileId, experience) {
  const resolver = PROFILE_RESOLVERS[profileId] ?? PROFILE_RESOLVERS.standard;
  return {
    profileId,
    profile: getAIProfile(profileId),
    context: resolver(experience),
    generatedAt: new Date().toISOString(),
  };
}

// ─── Estimators ───────────────────────────────────────────────────────────────

/**
 * Estimate token count for a context object (rough approximation).
 */
export function estimateTokens(ctx) {
  const str = JSON.stringify(ctx);
  return Math.ceil(str.length / 4);
}

/**
 * Find the best profile that fits within a token budget.
 */
export function selectProfileForBudget(experience, maxTokens = 2048) {
  const profileIds = ['nano', 'micro', 'minimal', 'standard', 'premium', 'app', 'full'];
  let bestProfile = 'nano';
  for (const id of profileIds) {
    const resolved = resolveContextProfile(id, experience);
    if (estimateTokens(resolved.context) <= maxTokens) {
      bestProfile = id;
    } else {
      break;
    }
  }
  return bestProfile;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function compactPreset(preset) {
  if (!preset) return null;
  return {
    motionIntensity: preset.motionIntensity,
    colorMode:       preset.colorMode,
    density:         preset.density,
    heroStyle:       preset.heroStyle,
    palette:         preset.palette,
    typographyMood:  preset.typographyMood,
  };
}

function summarizeInteractions(interactions) {
  if (!interactions) return null;
  return {
    hoverScale: interactions.hover?.scale,
    tapScale:   interactions.tap?.scale,
    focus:      interactions.focus,
  };
}

export { AI_PROFILE_REGISTRY };
export const CONTEXT_PROFILES_VERSION = '2.0.0';
