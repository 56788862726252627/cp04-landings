/**
 * Factory Registry — Typography Registry V2
 * Font pairing recommendations per mood, vertical, and preset.
 */

export const TYPOGRAPHY_REGISTRY = Object.freeze({
  moods: {
    editorial:      { display: 'Playfair Display', body: 'Inter',        mono: 'JetBrains Mono' },
    functional:     { display: 'Inter',            body: 'Inter',        mono: 'JetBrains Mono' },
    expressive:     { display: 'Barlow Condensed', body: 'Barlow',       mono: null },
    authoritative:  { display: 'IBM Plex Sans',    body: 'IBM Plex Sans', mono: 'IBM Plex Mono' },
    warm:           { display: 'Nunito',            body: 'Nunito',       mono: null },
  },
  presets: {
    'minimal-premium':        { display: 'Geist', body: 'Inter', weight: { display: 700, body: 400 } },
    'clinical-premium':       { display: 'Inter', body: 'Inter', weight: { display: 600, body: 400 } },
    'luxury-editorial':       { display: 'Playfair Display', body: 'Lato', weight: { display: 900, body: 300 } },
    'sports-dynamic':         { display: 'Oswald', body: 'Barlow', weight: { display: 700, body: 400 } },
    'tech-futuristic':        { display: 'Space Grotesk', body: 'Inter', weight: { display: 700, body: 400 } },
    'education-interactive':  { display: 'Plus Jakarta Sans', body: 'Nunito', weight: { display: 700, body: 400 } },
    'professional-authority': { display: 'Source Serif 4', body: 'Source Sans 3', weight: { display: 600, body: 400 } },
    'friendly-human':         { display: 'Nunito', body: 'Nunito', weight: { display: 700, body: 400 } },
    'immersive-showcase':     { display: 'Fraunces', body: 'DM Sans', weight: { display: 900, body: 300 } },
    'data-heavy-saas':        { display: 'Inter', body: 'Inter', weight: { display: 600, body: 400 } },
  },
  systemFallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  monoFallback:   '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
});

export function getTypographyForPreset(presetId) {
  return TYPOGRAPHY_REGISTRY.presets[presetId] ?? {
    display: 'Inter', body: 'Inter', weight: { display: 600, body: 400 },
  };
}
