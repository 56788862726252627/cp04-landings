/**
 * Factory Anti-Template Repetition Engine V2
 * Detects and prevents common "cookie-cutter" layout patterns that reduce
 * client perceived quality. Pure functions, deterministic.
 */

// ─── Template fingerprints (patterns to detect as "generic") ─────────────────

export const TEMPLATE_PATTERNS = Object.freeze([
  {
    id: 'hero-3cards-testimonials-faq',
    label: 'Classic SaaS Clone',
    sequence: ['hero', 'features-3col-icons', 'social-proof-testimonials-grid', 'conversion-faq'],
    severity: 'high',
    alternatives: ['hero-split-stats', 'features-alternating', 'social-proof-metrics', 'conversion-cta-band'],
  },
  {
    id: 'hero-pricing-faq-cta',
    label: 'Pricing Page Clone',
    sequence: ['hero-centered-text', 'conversion-pricing-cards', 'conversion-faq', 'conversion-cta-band'],
    severity: 'medium',
    alternatives: ['hero-mesh-gradient', 'social-proof-case-study', 'conversion-pricing-cards', 'conversion-cta-band'],
  },
  {
    id: 'hero-logos-testimonials-cta',
    label: 'Trust Factory Clone',
    sequence: ['hero-centered-text', 'social-proof-logos', 'social-proof-testimonials-grid', 'conversion-cta-band'],
    severity: 'medium',
    alternatives: ['hero-split-content', 'social-proof-metrics', 'social-proof-case-study', 'conversion-booking-teaser'],
  },
  {
    id: 'centered-hero-3col-footer',
    label: 'Generic Business Site',
    sequence: ['hero-centered-text', 'features-3col-icons', 'conversion-cta-band'],
    severity: 'high',
    alternatives: ['hero-split-content', 'features-numbered', 'conversion-lead-capture'],
  },
  {
    id: 'full-page-video-minimal-cta',
    label: 'Agency Template',
    sequence: ['hero-video-background', 'features-3col-icons', 'social-proof-testimonials-grid'],
    severity: 'low',
    alternatives: ['hero-video-background', 'features-map', 'social-proof-carousel'],
  },
]);

// ─── Anti-repetition checks ───────────────────────────────────────────────────

/**
 * Check if a proposed section sequence matches a known template pattern.
 */
export function detectTemplatePattern(sections = []) {
  const ids = sections.map(s => (typeof s === 'string' ? s : s.id));
  const results = [];

  for (const pattern of TEMPLATE_PATTERNS) {
    const matchCount = pattern.sequence.filter(s => ids.includes(s)).length;
    const matchRatio = matchCount / pattern.sequence.length;

    if (matchRatio >= 0.75) {
      results.push({
        patternId: pattern.id,
        label:     pattern.label,
        severity:  pattern.severity,
        matchRatio,
        alternatives: pattern.alternatives,
      });
    }
  }

  return {
    hasPattern:  results.length > 0,
    patterns:    results,
    riskLevel:   results.length === 0 ? 'none'
                 : results.some(r => r.severity === 'high') ? 'high'
                 : 'medium',
  };
}

/**
 * Generate a diversified section list that avoids template patterns.
 * @param {string[]} desired   - Requested sections
 * @param {string}   presetId  - Current preset
 * @returns {{ sections: string[], changes: string[] }}
 */
export function diversifySections(desired = []) {
  const detection = detectTemplatePattern(desired);
  if (!detection.hasPattern) return { sections: desired, changes: [] };

  const changes = [];
  let result = [...desired];

  for (const match of detection.patterns) {
    if (match.severity === 'low') continue;
    const alts = match.alternatives;
    for (let i = 0; i < alts.length; i++) {
      if (result[i] !== undefined && result[i] !== alts[i]) {
        changes.push(`${result[i]} → ${alts[i]} (avoid "${match.label}")`);
        result[i] = alts[i];
      }
    }
  }

  return { sections: result, changes };
}

// ─── Content diversity checks ─────────────────────────────────────────────────

export const REPETITION_CHECKS = Object.freeze({
  heroVariants: {
    maxSameHeroType: 1,
    message: 'Each generated app should use a different hero variant',
  },
  socialProofVariants: {
    maxSameType: 1,
    message: 'Mix testimonial formats — grid/carousel/metrics/case-study',
  },
  ctaStyle: {
    maxSameCta: 2,
    message: 'Vary CTA phrasing and visual style across sections',
  },
  colorUsage: {
    maxSameAccent: 3,
    message: 'Primary accent should not appear in more than 3 adjacent blocks',
  },
});

/**
 * Score a section list for visual repetition (0-100, higher is more varied).
 */
export function scoreVariety(sections = []) {
  const unique = new Set(sections).size;
  const total  = sections.length;
  if (total === 0) return 100;

  const detection = detectTemplatePattern(sections);
  const templatePenalty = detection.patterns.reduce((pen, p) => {
    return pen + (p.severity === 'high' ? 30 : p.severity === 'medium' ? 15 : 5);
  }, 0);

  const varietyScore = Math.round((unique / total) * 100);
  return Math.max(0, varietyScore - templatePenalty);
}

export const ANTI_TEMPLATE_VERSION = '2.0.0';
