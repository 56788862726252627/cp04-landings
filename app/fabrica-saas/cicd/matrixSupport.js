// Matrix Support — ADV-02 CI/CD Automatizado
// Soporte para matrices de node versions, apps y verticales.

export const MATRIX_DIMENSION = Object.freeze({
  NODE_VERSION:  'NODE_VERSION',
  APP:           'APP',
  VERTICAL:      'VERTICAL',
});

const SUPPORTED_NODE_VERSIONS = Object.freeze(['18', '20', '22']);

const KNOWN_VERTICALS = Object.freeze([
  'dental', 'physio', 'estetica', 'abogados', 'educa', 'veterinary',
]);

/**
 * Build a matrix configuration for CI.
 * Prioritizes cost efficiency: minimal combinations.
 */
export function buildCIMatrix(options = {}) {
  const {
    nodeVersions = ['20'],
    apps         = [],
    verticals    = [],
    maxCombinations = 6,
  } = options;

  const validNodeVersions = nodeVersions.filter(v => SUPPORTED_NODE_VERSIONS.includes(String(v)));
  if (validNodeVersions.length === 0) validNodeVersions.push('20');

  const include = [];

  for (const node of validNodeVersions) {
    if (apps.length > 0) {
      for (const app of apps.slice(0, Math.floor(maxCombinations / validNodeVersions.length))) {
        include.push({ 'node-version': node, app });
      }
    } else if (verticals.length > 0) {
      for (const vertical of verticals.slice(0, Math.floor(maxCombinations / validNodeVersions.length))) {
        include.push({ 'node-version': node, vertical });
      }
    } else {
      include.push({ 'node-version': node });
    }
  }

  const capped = include.slice(0, maxCombinations);

  return Object.freeze({
    valid:      true,
    matrix:     Object.freeze({ include: capped }),
    dimensions: capped.length,
    disclaimer: 'Keep matrix small. Prefer maxCombinations ≤ 6 to control CI cost.',
  });
}

/**
 * Validate that a vertical is supported.
 */
export function isKnownVertical(vertical) {
  return KNOWN_VERTICALS.includes(vertical);
}

export const MATRIX_SUPPORT_VERSION = '1.0.0';
