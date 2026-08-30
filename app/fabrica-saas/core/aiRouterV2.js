/**
 * Factory AI Router V2
 * Tier 0-4 routing system for visual generation requests.
 * Extends V1 router with V2 experience stack context.
 */

import { getAIProfile } from '../factory-registry/aiProfiles.js';
import { resolveExperience } from './experienceDecisionEngine.js';

// ─── Tier definitions ─────────────────────────────────────────────────────────

export const AI_TIERS = Object.freeze({
  0: {
    id: 0,
    label: 'Stub',
    description: 'Static placeholder — no AI generation',
    contextProfile: 'nano',
    maxTokens:  0,
    useCases:  ['loading-state', 'placeholder', 'demo-mode'],
    model:      null,
  },
  1: {
    id: 1,
    label: 'Micro',
    description: 'Minimal AI — single section, fast, low cost',
    contextProfile: 'micro',
    maxTokens:  512,
    useCases:  ['headline', 'cta-copy', 'meta-description'],
    model:      'haiku',
  },
  2: {
    id: 2,
    label: 'Standard',
    description: 'Standard generation — full section with mock data',
    contextProfile: 'standard',
    maxTokens:  2048,
    useCases:  ['landing-section', 'feature-list', 'about-page'],
    model:      'sonnet',
  },
  3: {
    id: 3,
    label: 'Premium',
    description: 'Premium generation — multi-section, styled, tailored',
    contextProfile: 'premium',
    maxTokens:  8192,
    useCases:  ['full-landing', 'app-shell', 'multi-section'],
    model:      'sonnet',
  },
  4: {
    id: 4,
    label: 'Expert',
    description: 'Expert generation — full app, all contexts loaded',
    contextProfile: 'full',
    maxTokens:  32768,
    useCases:  ['complete-app', 'platform', 'regulated-vertical'],
    model:      'opus',
  },
});

// ─── Tier selection logic ─────────────────────────────────────────────────────

/**
 * Select appropriate tier based on manifest complexity and budget.
 */
export function selectTier(manifest = {}) {
  const {
    tier,       // explicit override
    sections,
    budget,     // 'low'|'medium'|'high'
    regulated,  // boolean
    fullApp,    // boolean
  } = manifest;

  if (tier !== undefined) return AI_TIERS[Math.min(4, Math.max(0, Number(tier)))];

  if (regulated)   return AI_TIERS[4];
  if (fullApp)     return AI_TIERS[4];

  const sectionCount = sections?.length ?? 1;
  if (sectionCount >= 8)  return AI_TIERS[3];
  if (sectionCount >= 4)  return budget === 'low' ? AI_TIERS[2] : AI_TIERS[3];
  if (sectionCount >= 2)  return AI_TIERS[2];
  if (sectionCount === 1) return budget === 'low' ? AI_TIERS[1] : AI_TIERS[2];
  return AI_TIERS[1];
}

// ─── Context builder ──────────────────────────────────────────────────────────

/**
 * Build the context payload for an AI generation request.
 */
export function buildAIContext(manifest = {}, tierOverride) {
  const tier        = tierOverride ?? selectTier(manifest);
  const profile     = getAIProfile(tier.contextProfile);
  const experience  = resolveExperience(manifest);

  const ctx = {
    tier:       tier.id,
    tierLabel:  tier.label,
    model:      tier.model,
    profile:    profile.id,
    experience: summarizeExperience(experience, profile),
    manifest:   sanitizeManifest(manifest),
    generatedAt: new Date().toISOString(),
    version:    '2.0.0',
  };

  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function summarizeExperience(exp, profile) {
  if (profile.contextBudget <= 512) {
    return { presetId: exp.presetId, colorMode: exp.colorMode };
  }
  if (profile.contextBudget <= 1024) {
    return { presetId: exp.presetId, colorMode: exp.colorMode, heroRecipe: exp.heroRecipe?.id, density: exp.density };
  }
  return {
    presetId:    exp.presetId,
    colorMode:   exp.colorMode,
    density:     exp.density,
    heroRecipe:  exp.heroRecipe?.id,
    sectionOrder: exp.sectionOrder,
    motionIntensity: exp.motion?.intensity,
    typographyDisplay: exp.typography?.display,
    palette: exp.preset?.palette,
  };
}

function sanitizeManifest(manifest) {
  const { vertical, brand, audience } = manifest;
  return { vertical: vertical ?? 'default', brand: brand?.name ?? 'Demo', audience: audience ?? 'general' };
}

// ─── V2 context compressor ────────────────────────────────────────────────────

/**
 * Compress a full experience object to fit within a token budget.
 * Returns a string representation optimized for LLM consumption.
 */
export function compressContextForAI(experience) {
  const keyFacts = [
    `preset:${experience.presetId}`,
    `layout:${experience.layout?.id}`,
    `density:${experience.density}`,
    `colorMode:${experience.colorMode}`,
    `motion:${experience.motion?.intensity}`,
    `font:${experience.typography?.display}/${experience.typography?.body}`,
    `hero:${experience.heroRecipe?.id}`,
    `sections:${experience.sectionOrder?.join(',')}`,
  ];

  const palette = experience.preset?.palette;
  if (palette) {
    keyFacts.push(`palette:primary=${palette.primary},accent=${palette.accent}`);
  }

  return keyFacts.join(' | ');
}

export const AI_ROUTER_V2_VERSION = '2.0.0';
