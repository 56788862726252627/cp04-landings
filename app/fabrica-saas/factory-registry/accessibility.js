/**
 * Factory Registry — Accessibility Registry V2
 * WCAG 2.1 AA requirements per component type and preset.
 */

export const A11Y_REGISTRY = Object.freeze({
  requirements: {
    'color-contrast':    { level: 'AA', minRatio: 4.5, largeTextMinRatio: 3 },
    'focus-visible':     { level: 'AA', required: true },
    'keyboard-nav':      { level: 'A',  required: true },
    'reduced-motion':    { level: 'AAA', required: true, cssMedia: 'prefers-reduced-motion' },
    'alt-text':          { level: 'A',  required: true },
    'aria-labels':       { level: 'A',  required: true },
    'heading-hierarchy': { level: 'A',  required: true },
    'lang-attribute':    { level: 'A',  required: true },
  },
  componentRequirements: {
    button:       ['focus-visible', 'keyboard-nav', 'aria-label'],
    dialog:       ['focus-trap', 'aria-modal', 'escape-key', 'aria-labelledby'],
    drawer:       ['focus-trap', 'aria-modal', 'escape-key'],
    tooltip:      ['aria-describedby', 'keyboard-focus'],
    tabs:         ['tablist', 'tab', 'tabpanel', 'aria-selected'],
    progress:     ['progressbar', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax'],
    toast:        ['alert', 'aria-live'],
    nav:          ['nav-landmark', 'aria-label'],
    form:         ['label-association', 'error-message', 'required-indication'],
    image:        ['alt-text'],
    combobox:     ['listbox', 'option', 'aria-selected', 'aria-expanded'],
    autocomplete: ['listbox', 'aria-autocomplete', 'keyboard-nav'],
  },
  presetColorContrastNotes: {
    'luxury-editorial':   'Dark mode — verify text on gradient backgrounds',
    'sports-dynamic':     'Dark mode — red accent on dark bg may need boost',
    'tech-futuristic':    'Dark mode — neon on dark — verify luminance ratios',
    'immersive-showcase': 'Dark bg — ensure text overlay contrast ≥ 4.5:1',
  },
  testingTools: [
    'axe-core',
    'playwright-axe',
    'lighthouse-a11y',
    'wave',
  ],
});

export function getA11yRequirements(componentType) {
  return A11Y_REGISTRY.componentRequirements[componentType] ?? [];
}
