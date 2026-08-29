/**
 * Factory UI — CSS variable tokens
 * Shadcn-compatible naming, driven by vertical design tokens
 */

export const BASE_TOKENS = {
  '--radius': '0.5rem',
  '--radius-sm': '0.25rem',
  '--radius-lg': '0.75rem',
  '--radius-full': '9999px',
  '--shadow-sm': '0 1px 2px rgba(0,0,0,0.05)',
  '--shadow-md': '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
  '--shadow-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.05)',
  '--font-sans': "'Inter', 'system-ui', '-apple-system', sans-serif",
  '--font-mono': "'JetBrains Mono', 'Fira Code', monospace",
  '--transition': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
};

export const SEMANTIC_TOKENS = {
  '--background':       '#ffffff',
  '--foreground':       '#0f172a',
  '--card':             '#ffffff',
  '--card-foreground':  '#0f172a',
  '--popover':          '#ffffff',
  '--popover-foreground': '#0f172a',
  '--primary':          '#0c7873',
  '--primary-foreground': '#ffffff',
  '--secondary':        '#f1f5f9',
  '--secondary-foreground': '#0f172a',
  '--muted':            '#f1f5f9',
  '--muted-foreground': '#64748b',
  '--accent':           '#f1f5f9',
  '--accent-foreground': '#0f172a',
  '--destructive':      '#dc2626',
  '--destructive-foreground': '#ffffff',
  '--border':           '#e2e8f0',
  '--input':            '#e2e8f0',
  '--ring':             '#0c7873',
  '--success':          '#16a34a',
  '--success-foreground': '#ffffff',
  '--warning':          '#d97706',
  '--warning-foreground': '#ffffff',
  '--info':             '#0284c7',
  '--info-foreground':  '#ffffff',
};

/**
 * Generate inline style object from vertical primary color
 * @param {string} primaryColor - hex color
 * @returns {Object} inline style vars
 */
export function buildThemeVars(primaryColor) {
  return {
    '--primary': primaryColor,
    '--ring': primaryColor,
  };
}

/**
 * Merge token sets into a CSS variables inline style object
 * @param {...Object} tokenSets
 * @returns {Object}
 */
export function mergeTokens(...tokenSets) {
  return Object.assign({}, BASE_TOKENS, SEMANTIC_TOKENS, ...tokenSets);
}
