/**
 * Factory Generator — Manifest V1.6 Schema
 * Extends V1.5 with: ai routing, design density, media assets, component variants.
 * Backward compatible with V1.5 manifests (all new fields are optional).
 */

// ─── Supported values ─────────────────────────────────────────────────────────

export const V16_SUPPORTED_VERTICALS = [
  'dental', 'legal', 'physio', 'fisioterapia', 'psychology',
  'speech-therapy', 'sports', 'veterinary', 'hairdresser', 'beauty', 'estetica',
  'fertility', 'abogados',
];

export const V16_AI_ROUTING_TIERS = ['TIER1_LOCAL', 'TIER2_CONTEXT', 'TIER3_CLAUDE', 'TIER4_REVIEW'];

export const V16_DENSITY_VALUES = ['compact', 'comfortable', 'spacious'];

export const V16_TYPOGRAPHY_STYLES = ['sans', 'serif', 'mono', 'display'];

export const V16_DESIGN_STYLE_VALUES = [
  'elevated-border', 'flat-border', 'soft-shadow', 'sharp-border',
  'rounded-solid', 'square-solid', 'pill-solid',
  'light-border', 'dark-navy', 'dark-strong',
  'gradient-teal', 'gradient-teal-light', 'dark-energy', 'warm-amber',
  'pink-gradient', 'warm-purple', 'ocean-calm', 'sky-wave', 'nature-green',
  'light-purple', 'light-pink', 'light-sky', 'light-green', 'light-cyan', 'warm-cream',
  'rounded-soft', 'rounded-medium', 'rounded-large', 'circle-soft', 'sharp',
];

export const V16_COMPONENT_VARIANT_SETS = [
  'default',       // Current V1.5 inline styles
  'shadcn-compat', // shadcn-compatible components from core/ui/
];

// ─── V1.6 field keys ─────────────────────────────────────────────────────────

export const V16_AI_FIELDS = ['routing', 'localModel', 'contextProfile'];

export const V16_DESIGN_FIELDS = ['vertical', 'theme', 'density', 'radius', 'typography', 'style'];

export const V16_MEDIA_FIELDS = ['hero', 'gallery', 'team', 'services', 'video', 'socialPreview'];

export const V16_COMPONENT_FIELDS = ['variantSet'];

// ─── Validator ───────────────────────────────────────────────────────────────

/**
 * Validate V1.6 fields in a manifest.
 * @param {Object} manifest
 * @returns {{ valid: boolean, warnings: string[], v16Fields: string[], v15Compat: boolean }}
 */
export function validateV16Fields(manifest = {}) {
  const warnings = [];
  const v16Fields = [];

  // ai section
  if (manifest.ai) {
    v16Fields.push('ai');
    const ai = manifest.ai;
    if (ai.routing && !V16_AI_ROUTING_TIERS.includes(ai.routing)) {
      warnings.push(`ai.routing "${ai.routing}" not in ${V16_AI_ROUTING_TIERS.join(', ')}`);
    }
    if (ai.localModel && typeof ai.localModel !== 'string') {
      warnings.push('ai.localModel should be a string (e.g. "qwen2.5-coder:1.5b")');
    }
    if (ai.contextProfile && typeof ai.contextProfile !== 'string') {
      warnings.push('ai.contextProfile should be a string (e.g. "generator")');
    }
  }

  // design section
  if (manifest.design) {
    v16Fields.push('design');
    const d = manifest.design;
    if (d.vertical && !V16_SUPPORTED_VERTICALS.includes(d.vertical)) {
      warnings.push(`design.vertical "${d.vertical}" not in supported list. Supported: ${V16_SUPPORTED_VERTICALS.join(', ')}`);
    }
    if (d.density && !V16_DENSITY_VALUES.includes(d.density)) {
      warnings.push(`design.density "${d.density}" not in [${V16_DENSITY_VALUES.join(', ')}]`);
    }
    if (d.typography && !V16_TYPOGRAPHY_STYLES.includes(d.typography)) {
      warnings.push(`design.typography "${d.typography}" not in [${V16_TYPOGRAPHY_STYLES.join(', ')}]`);
    }
  }

  // media section
  if (manifest.media) {
    v16Fields.push('media');
    const m = manifest.media;
    if (m.hero && typeof m.hero !== 'string') {
      warnings.push('media.hero should be a URL string');
    }
    if (m.gallery && !Array.isArray(m.gallery)) {
      warnings.push('media.gallery should be an array of URL strings');
    }
    if (m.team && !Array.isArray(m.team)) {
      warnings.push('media.team should be an array of { nombre, rol, photo? }');
    }
  }

  // components section
  if (manifest.components) {
    v16Fields.push('components');
    const c = manifest.components;
    if (c.variantSet && !V16_COMPONENT_VARIANT_SETS.includes(c.variantSet)) {
      warnings.push(`components.variantSet "${c.variantSet}" not in [${V16_COMPONENT_VARIANT_SETS.join(', ')}]`);
    }
  }

  // v1.5 backward compat check
  const v15Compat = typeof manifest.branding === 'object' || typeof manifest.modules !== 'undefined';

  return {
    valid:     warnings.length === 0,
    warnings,
    v16Fields,
    v15Compat,
  };
}

/**
 * Merge V1.5 + V1.6 manifest fields into a normalized config.
 * @param {Object} manifest
 * @returns {Object} normalized V1.6 config
 */
export function normalizeManifestV16(manifest = {}) {
  const branding = manifest.branding ?? {};
  const design   = manifest.design   ?? {};
  const ai       = manifest.ai       ?? {};

  return {
    // Core identity (V1.5 compat)
    nombre:   branding.nombre   ?? manifest.nombre   ?? 'Mi Negocio',
    vertical: design.vertical   ?? manifest.vertical  ?? manifest.sector ?? 'dental',
    slug:     manifest.slug     ?? 'mi-negocio',

    // Branding (merged V1.5 + V1.6)
    branding: {
      nombre:         branding.nombre         ?? manifest.nombre ?? 'Mi Negocio',
      tagline:        branding.tagline        ?? '',
      primaryColor:   branding.primaryColor   ?? null,
      secondaryColor: branding.secondaryColor ?? null,
      accentColor:    branding.accentColor    ?? null,
      tono:           branding.tono           ?? 'profesional',
      favicon:        branding.favicon        ?? null,
      logo:           branding.logo           ?? null,
    },

    // Modules (V1.5 compat)
    modules: manifest.modules ?? [],

    // Design (V1.6)
    design: {
      vertical:   design.vertical   ?? manifest.sector ?? 'dental',
      density:    design.density    ?? 'comfortable',
      radius:     design.radius     ?? null,
      typography: design.typography ?? 'sans',
      theme:      design.theme      ?? null,
      style:      design.style      ?? 'default',
    },

    // AI routing (V1.6)
    ai: {
      routing:       ai.routing       ?? 'TIER3_CLAUDE',
      localModel:    ai.localModel    ?? 'qwen2.5-coder:1.5b',
      contextProfile: ai.contextProfile ?? 'generator',
    },

    // Media (V1.6)
    media: manifest.media ?? {},

    // Components (V1.6)
    components: {
      variantSet: manifest.components?.variantSet ?? 'default',
    },

    // Experiencia (V1.5)
    experiencia: manifest.experiencia ?? { publica: true, interna: true },

    // Raw manifest for generators
    _raw: manifest,
  };
}
