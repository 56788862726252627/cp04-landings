/**
 * Factory Recipe Registry V2 — Central index
 * Updated: Paso A — added interactivePatterns from FisioNova V2 Pilot learnings
 */
import { HERO_RECIPES }                  from './hero.js';
import { FEATURE_RECIPES }               from './features.js';
import { SOCIAL_PROOF_RECIPES }          from './socialProof.js';
import { CONVERSION_RECIPES }            from './conversion.js';
import { APP_SHELL_RECIPES }             from './appShell.js';
import { DASHBOARD_RECIPES }             from './dashboard.js';
import { INTERACTIVE_PATTERN_RECIPES }   from './interactivePatterns.js';

export { INTERACTIVE_PATTERN_RECIPES, getInteractivePatternById, getInteractivePatternsByClassification, listInteractivePatternIds, INTERACTIVE_PATTERN_COUNT } from './interactivePatterns.js';

export const RECIPE_REGISTRY = Object.freeze({
  hero:                HERO_RECIPES,
  features:            FEATURE_RECIPES,
  socialProof:         SOCIAL_PROOF_RECIPES,
  conversion:          CONVERSION_RECIPES,
  appShell:            APP_SHELL_RECIPES,
  dashboard:           DASHBOARD_RECIPES,
  interactivePatterns: INTERACTIVE_PATTERN_RECIPES,
});

export function getRecipesBySection(section) {
  return RECIPE_REGISTRY[section] ?? [];
}

export function getRecipeById(id) {
  for (const recipes of Object.values(RECIPE_REGISTRY)) {
    const found = recipes.find(r => r.id === id);
    if (found) return found;
  }
  return null;
}

export function listAllRecipeIds() {
  return Object.values(RECIPE_REGISTRY).flatMap(r => r.map(x => x.id));
}

export const RECIPE_COUNT = Object.values(RECIPE_REGISTRY).reduce((a, r) => a + r.length, 0);
