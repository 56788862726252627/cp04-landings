/**
 * CORE V1.4 · ProductionConfig
 * Genera configuración de producción por cliente.
 * Distingue VITE_ (públicas) de [WORKER_SECRET] (privadas, nunca en frontend).
 * Sin llamadas externas. Sin secretos reales.
 */

const ENV_SCOPE = Object.freeze({ PUBLIC: 'vite_public', WORKER_SECRET: 'worker_secret', OPTIONAL: 'optional' });

export function createProductionConfig(manifest) {
  if (!manifest?.business?.slug) throw new Error('productionConfig: slug requerido');

  const slug     = manifest.business.slug;
  const vertical = manifest.vertical ?? 'unknown';
  const modules  = manifest.modules  ?? [];
  const inte     = manifest.integraciones ?? {};
  const flags    = manifest.featureFlags  ?? {};

  const domain     = inte.domain     ?? 'NOT_CONFIGURED';
  const apiBaseUrl = inte.apiBaseUrl ?? 'NOT_CONFIGURED';

  const requiredEnv = _detectRequiredEnv(modules, inte);
  const optionalEnv = _detectOptionalEnv(modules, flags);

  const productionBlockers = _checkBlockers(manifest, domain, apiBaseUrl, inte);

  return Object.freeze({
    clientId:        slug,
    vertical,
    environment:     'production',
    domain,
    apiBaseUrl,
    authMode:        'real-placeholder',

    enabledModules:  modules,
    requiredEnv,
    optionalEnv,
    featureFlags:    flags,

    healthPath:      '/api/health',
    buildMetadata: Object.freeze({
      generatedAt:  new Date().toISOString(),
      version:      'v1.4',
      factory:      'fabrica-saas-v1.4',
      _ficticio:    true,
    }),

    adapterModes:    Object.freeze(_detectAdapterModes(modules, inte)),
    loggingMode:     'structured',

    productionReady:    productionBlockers.length === 0,
    productionBlockers,

    _generatedBy: 'fabrica-saas-v1.4',
    _ficticio:    true,
  });
}

export function getEnvScope() { return ENV_SCOPE; }

export function generateEnvExample(productionConfig) {
  const lines = [
    '# env.example — SIN VALORES REALES. SEGURO PARA COMMIT.',
    '# Generado por Fábrica SaaS V1.4 · productionConfig.js',
    '# Copia a .env.local (NO commitear) y rellena los valores.',
    '',
    '# ─── PÚBLICAS (prefijo VITE_: expuestas al frontend) ───────────────',
  ];

  const publicVars = productionConfig.requiredEnv
    .filter(e => e.scope === ENV_SCOPE.PUBLIC);
  for (const v of publicVars) {
    lines.push(`${v.name}=NOT_CONFIGURED`);
  }

  const workerVars = productionConfig.requiredEnv
    .filter(e => e.scope === ENV_SCOPE.WORKER_SECRET);
  if (workerVars.length) {
    lines.push('', '# ─── SECRETOS DE WORKER (via wrangler secret put, NUNCA en .env) ─');
    for (const v of workerVars) {
      lines.push(`# ${v.name}=<set via: wrangler secret put ${v.name}>`);
    }
  }

  const optVars = productionConfig.optionalEnv
    .filter(e => e.scope === ENV_SCOPE.OPTIONAL);
  if (optVars.length) {
    lines.push('', '# ─── OPCIONALES ────────────────────────────────────────────────────');
    for (const v of optVars) {
      lines.push(`# ${v.name}=NOT_CONFIGURED`);
    }
  }

  lines.push('', '# ─── Notas de seguridad ─────────────────────────────────────────────');
  lines.push('# NUNCA commits con valores reales.');
  lines.push('# Los [WORKER_SECRET] se configuran solo vía wrangler CLI, no en .env.');

  return lines.join('\n');
}

export function generateReleaseMetadata(manifest, productionConfig) {
  return {
    version:      productionConfig.buildMetadata.version,
    generatedAt:  productionConfig.buildMetadata.generatedAt,
    clientId:     manifest.business.slug,
    vertical:     manifest.vertical,
    environment:  productionConfig.environment,
    factory:      productionConfig._generatedBy,
    modules:      productionConfig.enabledModules,
    domain:       productionConfig.domain,
    productionReady: productionConfig.productionReady,
    _ficticio:    true,
  };
}

export function generateDeployChecklist(preValidation, readiness, productionConfig) {
  return {
    generatedAt:     new Date().toISOString(),
    clientId:        productionConfig.clientId,
    schema_valid:    readiness.staging?.ok    ?? false,
    pre_deploy_ready: preValidation.ready,
    staging_ready:   readiness.summary?.stagingReady    ?? false,
    production_ready: readiness.summary?.productionReady ?? false,
    blockers:        preValidation.blockers,
    warnings:        preValidation.warnings,
    items: [
      { step: 'lint',       command: 'npm run lint',             auto: true,  done: false },
      { step: 'test',       command: 'npm run factory:test:all', auto: true,  done: false },
      { step: 'build',      command: 'npm run build',            auto: true,  done: false },
      { step: 'env_vars',   command: 'wrangler secret put <VAR>', auto: false, manual: true, note: 'MANUAL_BOUNDARY' },
      { step: 'deploy',     command: 'wrangler pages deploy dist',auto: false, manual: true, note: 'MANUAL_BOUNDARY' },
      { step: 'verify',     command: 'curl https://<domain>/api/health', auto: false, manual: true },
      { step: 'rollback',   command: 'See rollback-instructions.txt',    auto: false, manual: true },
    ],
    _ficticio: true,
  };
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function _checkBlockers(manifest, domain, apiBaseUrl, inte) {
  const b = [];
  if (manifest.modo_demo === true)    b.push('modo_demo debe ser false');
  if (inte.reales !== true)           b.push('integraciones.reales debe ser true');
  if (domain     === 'NOT_CONFIGURED') b.push('domain no configurado');
  if (apiBaseUrl === 'NOT_CONFIGURED') b.push('apiBaseUrl no configurada');
  return b;
}

function _detectRequiredEnv(modules, inte) {
  const vars = [];

  // Always required
  vars.push({ name: 'VITE_API_BASE_URL', scope: ENV_SCOPE.PUBLIC, description: 'URL del Worker CF o API backend' });

  // Auth
  if (modules.includes('auth') || modules.includes('rbac')) {
    vars.push(
      { name: 'VITE_AUTH_DOMAIN',    scope: ENV_SCOPE.PUBLIC,        description: 'Dominio del proveedor Auth (ej: company.auth0.com)' },
      { name: 'VITE_AUTH_CLIENT_ID', scope: ENV_SCOPE.PUBLIC,        description: 'Client ID público del proveedor Auth' },
      { name: 'AUTH_CLIENT_SECRET',  scope: ENV_SCOPE.WORKER_SECRET, description: 'Secreto del proveedor Auth (solo Worker)' },
    );
  }

  // CRM / Airtable
  if (modules.includes('crm') || inte.reales) {
    vars.push(
      { name: 'AIRTABLE_API_KEY',  scope: ENV_SCOPE.WORKER_SECRET, description: 'Clave API de Airtable (solo Worker)' },
      { name: 'AIRTABLE_BASE_ID',  scope: ENV_SCOPE.WORKER_SECRET, description: 'Base ID de Airtable (solo Worker)' },
    );
  }

  // Bookings/Make
  if (modules.includes('reservas') && inte.reales) {
    vars.push(
      { name: 'MAKE_WEBHOOK_SECRET', scope: ENV_SCOPE.WORKER_SECRET, description: 'Secreto del webhook Make (solo Worker)' },
    );
  }

  // Analytics
  if (modules.includes('analytics')) {
    vars.push(
      { name: 'VITE_ANALYTICS_DSN', scope: ENV_SCOPE.PUBLIC, description: 'DSN del proveedor de analytics' },
    );
  }

  return vars;
}

function _detectOptionalEnv(modules, flags) {
  const vars = [];
  if (modules.includes('chatbot_ia')) {
    vars.push({ name: 'VITE_CHATBOT_WIDGET_KEY', scope: ENV_SCOPE.OPTIONAL, description: 'API key pública del widget chatbot' });
  }
  vars.push({ name: 'VITE_SENTRY_DSN', scope: ENV_SCOPE.OPTIONAL, description: 'DSN de Sentry para error tracking' });
  if (flags.pagosOnline) {
    vars.push({ name: 'VITE_STRIPE_PUBLIC_KEY', scope: ENV_SCOPE.OPTIONAL, description: 'Clave pública de Stripe' });
    vars.push({ name: 'STRIPE_SECRET_KEY', scope: ENV_SCOPE.WORKER_SECRET, description: 'Clave secreta de Stripe (solo Worker)' });
  }
  return vars;
}

function _detectAdapterModes(modules, inte) {
  const isReal = inte.reales === true;
  return {
    auth:         isReal ? 'real-placeholder' : 'mock',
    crm:          isReal ? 'real-placeholder' : 'mock',
    booking:      isReal ? 'real-placeholder' : 'mock',
    notification: isReal ? 'real-placeholder' : 'mock',
    analytics:    (modules.includes('analytics') && isReal) ? 'real-placeholder' : 'mock',
    storage:      'mock',
    integration:  isReal ? 'real-placeholder' : 'mock',
  };
}
