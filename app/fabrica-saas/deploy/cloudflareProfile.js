// Cloudflare Profile — PASO G
// Declarative Cloudflare Pages/Workers deploy profile. No real auth.

export const CLOUDFLARE_SERVICES = Object.freeze({
  PAGES:   'CLOUDFLARE_PAGES',
  WORKERS: 'CLOUDFLARE_WORKERS',
});

export const CF_BUILD_PRESETS = Object.freeze({
  VITE_REACT:    'VITE_REACT',
  VITE_VANILLA:  'VITE_VANILLA',
  NEXT_JS:       'NEXT_JS',
  ASTRO:         'ASTRO',
  STATIC:        'STATIC',
  CUSTOM:        'CUSTOM',
});

const BUILD_PRESET_CONFIG = {
  [CF_BUILD_PRESETS.VITE_REACT]:   { buildCommand: 'npm run build', outputDir: 'dist', nodeVersion: '20' },
  [CF_BUILD_PRESETS.VITE_VANILLA]: { buildCommand: 'npm run build', outputDir: 'dist', nodeVersion: '20' },
  [CF_BUILD_PRESETS.NEXT_JS]:      { buildCommand: 'npm run build', outputDir: '.next', nodeVersion: '20' },
  [CF_BUILD_PRESETS.ASTRO]:        { buildCommand: 'npm run build', outputDir: 'dist', nodeVersion: '20' },
  [CF_BUILD_PRESETS.STATIC]:       { buildCommand: '',              outputDir: 'public', nodeVersion: '20' },
  [CF_BUILD_PRESETS.CUSTOM]:       { buildCommand: null,            outputDir: null, nodeVersion: '20' },
};

/**
 * Build a reusable Cloudflare Pages deploy profile.
 * Does NOT perform any real API calls or authentication.
 */
export function createCloudflareProfile(params = {}) {
  const errors = [];
  if (!params.projectName)    errors.push('projectName required');
  if (!params.accountId)      errors.push('accountId required (placeholder value accepted)');
  if (errors.length > 0) return { valid: false, errors, profile: null };

  const service = params.service ?? CLOUDFLARE_SERVICES.PAGES;
  const preset  = params.buildPreset ?? CF_BUILD_PRESETS.VITE_REACT;
  const base    = BUILD_PRESET_CONFIG[preset] ?? BUILD_PRESET_CONFIG[CF_BUILD_PRESETS.CUSTOM];

  const profile = {
    profileId:    `CF-${params.projectName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`,
    projectName:  params.projectName,
    accountId:    params.accountId,
    service,
    preset,

    build: {
      command:     params.buildCommand ?? base.buildCommand ?? 'npm run build',
      outputDir:   params.outputDir ?? base.outputDir ?? 'dist',
      nodeVersion: params.nodeVersion ?? base.nodeVersion ?? '20',
      envVars:     params.buildEnvVars ?? {},
    },

    deployment: {
      productionBranch: params.productionBranch ?? 'main',
      previewBranch:    params.previewBranch ?? null,
      autoDeployEnabled: params.autoDeployEnabled ?? false,
    },

    environment: {
      production: params.productionEnvVars ?? {},
      preview:    params.previewEnvVars ?? {},
    },

    customDomain:   params.customDomain ?? null,
    wranglerVersion: params.wranglerVersion ?? '3',

    securityNotes: [
      'Never commit API tokens — use Cloudflare dashboard environment variables',
      'Use Pages secrets for sensitive runtime values',
      'API_TOKEN and ACCOUNT_ID must be set as CI/CD secrets, not in source',
    ],

    createdAt:   new Date().toISOString(),
    disclaimer:  [
      'Cloudflare profile is declarative documentation.',
      'No real Cloudflare API calls or authentication performed.',
      'NO_REAL_DEPLOY.',
    ].join(' '),
  };

  return { valid: true, errors: [], profile };
}

/**
 * Generate the standard wrangler.toml content string for a Workers deployment.
 * Returns a config string only — does not write any files.
 */
export function generateWranglerConfig(profile) {
  if (!profile?.projectName) return { valid: false, error: 'profile.projectName required' };

  const config = [
    `name = "${profile.projectName}"`,
    `main = "src/index.js"`,
    `compatibility_date = "2024-01-01"`,
    ``,
    `[build]`,
    `command = "${profile.build?.command ?? 'npm run build'}"`,
    ``,
    `# Set environment variables via Cloudflare dashboard — never hardcode secrets`,
    `[vars]`,
    `ENVIRONMENT = "production"`,
  ].join('\n');

  return {
    valid:  true,
    config,
    note:   'Replace placeholder values. Never include real secrets in wrangler.toml.',
  };
}

export const CLOUDFLARE_PROFILE_VERSION = '1.0.0';
