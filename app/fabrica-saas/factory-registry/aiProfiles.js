/**
 * Factory Registry — AI Context Profiles V2
 * 9 token-saving context profiles for AI generation.
 * Each profile balances quality vs context budget.
 */

export const AI_PROFILE_REGISTRY = Object.freeze({

  // 1. Nano — minimum viable prompt context
  nano: {
    id: 'nano',
    label: 'Nano',
    contextBudget: 512,
    includes: ['sector', 'preset-id', 'brand-name'],
    excludes: ['tokens', 'recipes', 'typography', 'motion', 'full-preset'],
    outputFormat: 'minimal',
    useCases: ['quick-prototype', 'first-draft'],
  },

  // 2. Micro — sector + preset summary
  micro: {
    id: 'micro',
    label: 'Micro',
    contextBudget: 1024,
    includes: ['sector', 'preset-id', 'preset-summary', 'brand-name', 'hero-recipe-id'],
    excludes: ['tokens', 'full-recipes', 'typography-details', 'motion-details'],
    outputFormat: 'compact',
    useCases: ['landing-page', 'quick-section'],
  },

  // 3. Standard — default factory profile
  standard: {
    id: 'standard',
    label: 'Standard',
    contextBudget: 2048,
    includes: ['sector', 'preset', 'brand', 'hero-recipe', 'feature-recipe', 'typography', 'interactions'],
    excludes: ['full-tokens', 'dashboard-recipes', 'motion-details'],
    outputFormat: 'structured',
    useCases: ['full-landing', 'marketing-page'],
  },

  // 4. Premium — full preset + recipes
  premium: {
    id: 'premium',
    label: 'Premium',
    contextBudget: 4096,
    includes: ['sector', 'full-preset', 'brand', 'all-recipes', 'typography', 'tokens-summary', 'interactions', 'anti-template'],
    excludes: ['raw-token-values', 'compat-table'],
    outputFormat: 'rich',
    useCases: ['premium-landing', 'full-app-shell'],
  },

  // 5. App — for full app generation
  app: {
    id: 'app',
    label: 'App',
    contextBudget: 8192,
    includes: ['sector', 'full-preset', 'brand', 'all-recipes', 'all-tokens', 'typography', 'motion', 'interactions', 'shell-recipes', 'dashboard-recipes', 'anti-template'],
    excludes: [],
    outputFormat: 'complete',
    useCases: ['full-app', 'multi-section-app'],
  },

  // 6. Dashboard — data-heavy apps
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    contextBudget: 4096,
    includes: ['sector', 'preset', 'brand', 'dashboard-recipes', 'shell-recipes', 'interactions', 'tokens-compact'],
    excludes: ['hero-recipes', 'social-proof', 'conversion', 'editorial-presets'],
    outputFormat: 'dashboard',
    useCases: ['analytics-app', 'admin-panel', 'saas-dashboard'],
  },

  // 7. Minimal — fast/cheap iterations
  minimal: {
    id: 'minimal',
    label: 'Minimal',
    contextBudget: 1500,
    includes: ['sector', 'preset-id', 'palette', 'hero-recipe-id', 'brand'],
    excludes: ['tokens', 'recipes-detail', 'typography', 'motion', 'interactions'],
    outputFormat: 'compact',
    useCases: ['quick-iteration', 'a-b-test'],
  },

  // 8. Sector-Expert — deep vertical knowledge
  'sector-expert': {
    id: 'sector-expert',
    label: 'Sector Expert',
    contextBudget: 3000,
    includes: ['sector', 'full-preset', 'brand', 'sector-specific-recipes', 'typography', 'anti-template', 'vertical-interactions'],
    excludes: ['cross-sector-recipes', 'raw-tokens'],
    outputFormat: 'expert',
    useCases: ['vertical-specific', 'regulated-sector'],
  },

  // 9. Full — maximum context, unconstrained
  full: {
    id: 'full',
    label: 'Full',
    contextBudget: 16384,
    includes: ['*'],
    excludes: [],
    outputFormat: 'complete',
    useCases: ['complex-app', 'platform', 'multi-vertical'],
  },
});

export function getAIProfile(id) {
  return AI_PROFILE_REGISTRY[id] ?? AI_PROFILE_REGISTRY.standard;
}

export function listAIProfiles() {
  return Object.keys(AI_PROFILE_REGISTRY);
}

export const AI_PROFILES_VERSION = '2.0.0';
