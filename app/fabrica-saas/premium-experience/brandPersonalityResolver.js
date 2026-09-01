// Brand Personality Resolver — ADV-07
import { BRAND_PERSONALITY } from './premiumExperienceProfile.js';

const PERSONALITY_TRAITS = Object.freeze({
  [BRAND_PERSONALITY.PROFESSIONAL]:{ adjectives: ['experto', 'fiable', 'riguroso'],    formality: 'HIGH',   warmth: 'LOW',    energy: 'LOW'    },
  [BRAND_PERSONALITY.WARM]:        { adjectives: ['cercano', 'humano', 'empático'],    formality: 'LOW',    warmth: 'HIGH',   energy: 'MEDIUM' },
  [BRAND_PERSONALITY.PREMIUM]:     { adjectives: ['exclusivo', 'refinado', 'único'],   formality: 'MEDIUM', warmth: 'LOW',    energy: 'LOW'    },
  [BRAND_PERSONALITY.MODERN]:      { adjectives: ['innovador', 'actual', 'dinámico'],  formality: 'LOW',    warmth: 'MEDIUM', energy: 'HIGH'   },
  [BRAND_PERSONALITY.CLINICAL]:    { adjectives: ['preciso', 'técnico', 'seguro'],     formality: 'HIGH',   warmth: 'LOW',    energy: 'LOW'    },
  [BRAND_PERSONALITY.SPORTY]:      { adjectives: ['activo', 'enérgico', 'competitivo'],formality: 'LOW',    warmth: 'MEDIUM', energy: 'HIGH'   },
  [BRAND_PERSONALITY.TRUSTED]:     { adjectives: ['sólido', 'transparente', 'claro'],  formality: 'MEDIUM', warmth: 'MEDIUM', energy: 'LOW'    },
  [BRAND_PERSONALITY.LUXURY]:      { adjectives: ['distinguido', 'selecto', 'exquisito'],formality:'HIGH',  warmth: 'LOW',    energy: 'LOW'    },
  [BRAND_PERSONALITY.PLAYFUL]:     { adjectives: ['divertido', 'creativo', 'fresco'],  formality: 'LOW',    warmth: 'HIGH',   energy: 'HIGH'   },
  [BRAND_PERSONALITY.MINIMAL]:     { adjectives: ['limpio', 'esencial', 'directo'],    formality: 'MEDIUM', warmth: 'LOW',    energy: 'LOW'    },
  [BRAND_PERSONALITY.TECH]:        { adjectives: ['inteligente', 'eficiente', 'preciso'],formality:'MEDIUM',warmth: 'LOW',    energy: 'MEDIUM' },
});

export function resolveBrandPersonality(personalities = [BRAND_PERSONALITY.PROFESSIONAL]) {
  const traits = personalities.map(p => PERSONALITY_TRAITS[p]).filter(Boolean);
  if (!traits.length) traits.push(PERSONALITY_TRAITS[BRAND_PERSONALITY.PROFESSIONAL]);

  const formalityScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const avgFormality = traits.reduce((s, t) => s + (formalityScore[t.formality] ?? 2), 0) / traits.length;
  const formality = avgFormality > 2.5 ? 'HIGH' : avgFormality > 1.5 ? 'MEDIUM' : 'LOW';

  const warmthScore = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const avgWarmth = traits.reduce((s, t) => s + (warmthScore[t.warmth] ?? 2), 0) / traits.length;
  const warmth = avgWarmth > 2.3 ? 'HIGH' : avgWarmth > 1.5 ? 'MEDIUM' : 'LOW';

  const allAdjectives = [...new Set(traits.flatMap(t => t.adjectives))].slice(0, 5);
  return Object.freeze({
    personalities,
    adjectives: allAdjectives,
    formality,
    warmth,
    isReal: false,
  });
}

export function combineBrandPersonalities(a = [], b = []) {
  const combined = [...new Set([...a, ...b])];
  return resolveBrandPersonality(combined);
}

export { BRAND_PERSONALITY };
export const BRAND_PERSONALITY_RESOLVER_VERSION = '1.0.0';
