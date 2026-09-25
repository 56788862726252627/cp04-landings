/**
 * CORE V1.3 · Runtime Config
 * Crea y valida la configuración de runtime por cliente.
 * Distingue demo / staging / production.
 * Valores sensibles NUNCA en config pública — solo placeholders.
 * Sin dependencias externas.
 */

export const MODE = Object.freeze({
  DEMO:       'demo',
  STAGING:    'staging',
  PRODUCTION: 'production',
});

export const AUTH_MODE = Object.freeze({
  MOCK: 'mock',
  REAL: 'real',
});

export const LOG_LEVEL = Object.freeze({
  DEBUG: 'debug',
  INFO:  'info',
  WARN:  'warn',
  ERROR: 'error',
});

const DEFAULTS = {
  environment:    MODE.DEMO,
  locale:         'es-ES',
  timezone:       'Europe/Madrid',
  apiBaseUrl:     'NOT_CONFIGURED',
  authMode:       AUTH_MODE.MOCK,
  logLevel:       LOG_LEVEL.INFO,
  featureFlags:   {},
  domain:         'NOT_CONFIGURED',
  enabledModules: ['chatbot_ia', 'crm', 'recuperacion_leads', 'dashboard'],
};

// Campos que NUNCA deben aparecer en config pública
const FORBIDDEN_PUBLIC_FIELDS = [
  'apiKey', 'secretKey', 'password', 'token', 'credential',
  'privateKey', 'webhookSecret', 'clientSecret', 'accessToken',
  'refreshToken', 'dbPassword', 'connectionString',
];

function sanitize(obj, path = '') {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item, i) =>
    typeof item === 'object' && item !== null ? sanitize(item, `${path}[${i}]`) : item);
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = path ? `${path}.${k}` : k;
    const lk = k.toLowerCase();
    if (FORBIDDEN_PUBLIC_FIELDS.some(f => lk.includes(f.toLowerCase()))) {
      throw new Error(`runtimeConfig: campo sensible detectado: "${fullKey}". Los secretos nunca van en runtime config público.`);
    }
    result[k] = typeof v === 'object' && v !== null ? sanitize(v, fullKey) : v;
  }
  return result;
}

export function createRuntimeConfig(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('createRuntimeConfig: manifest debe ser un objeto válido');
  }
  const biz  = manifest.business ?? {};
  const br   = manifest.branding ?? {};
  const inte = manifest.integraciones ?? {};

  // Auto-detect mode: demo → staging → production
  const modoDemo          = manifest.modo_demo ?? true;
  const integracionesReal = inte.reales ?? false;
  const detectedEnv       = modoDemo ? MODE.DEMO
    : integracionesReal ? MODE.PRODUCTION
    : MODE.STAGING;
  const environment       = manifest.environment ?? detectedEnv;

  const raw = {
    clientId:       biz.slug       ?? 'unknown-client',
    businessName:   biz.name       ?? 'Unknown Business',
    slug:           biz.slug       ?? 'unknown-client',
    vertical:       manifest.vertical ?? biz.vertical ?? 'unknown',
    domain:         inte.domain    ?? manifest.domain ?? DEFAULTS.domain,
    locale:         manifest.locale ?? DEFAULTS.locale,
    timezone:       manifest.timezone ?? DEFAULTS.timezone,
    branding: {
      nombre:        br.nombre_visible ?? biz.name ?? 'Unknown',
      inicial:       br.inicial   ?? 'U',
      primaryColor:  br.primaryColor ?? '#2563eb',
      emojiSector:   br.emoji_sector ?? '🏢',
    },
    modules:         manifest.modules ?? DEFAULTS.enabledModules,
    enabledModules:  manifest.modules ?? DEFAULTS.enabledModules,
    environment,
    mode:            environment,
    apiBaseUrl:      inte.apiBaseUrl ?? manifest.apiBaseUrl ?? DEFAULTS.apiBaseUrl,
    featureFlags:    manifest.featureFlags ?? DEFAULTS.featureFlags,
    authMode:        manifest.authMode    ?? DEFAULTS.authMode,
    logLevel:        manifest.logLevel    ?? DEFAULTS.logLevel,
    modoDemo,
    integracionesReales: integracionesReal,
    mockObligatorio: manifest.mock?.obligatorio ?? true,
    _ficticio:       true,
    _generatedBy:    'fabrica-saas-v1.3',
    _version:        '1.3.0',
  };

  // Sanitize: reject if any sensitive field is embedded
  const safe = sanitize(raw);

  // Production guards
  if (safe.environment === MODE.PRODUCTION) {
    const blockers = validateProductionPrerequisites(safe);
    if (blockers.length > 0) {
      const err = new Error(`PRODUCTION_BLOCKED: runtimeConfig: modo production bloqueado. Faltan: ${blockers.join(', ')}`);
      err.code  = 'PRODUCTION_BLOCKED';
      err.blockers = blockers;
      throw err;
    }
  }

  return Object.freeze(safe);
}

function validateProductionPrerequisites(config) {
  const blockers = [];
  if (config.authMode === AUTH_MODE.MOCK) blockers.push('authMode=mock (usar real)');
  if (config.apiBaseUrl === 'NOT_CONFIGURED') blockers.push('apiBaseUrl no configurada');
  if (config.domain === 'NOT_CONFIGURED')     blockers.push('domain no configurado');
  if (config.modoDemo === true)               blockers.push('modo_demo=true (desactivar)');
  if (config.integracionesReales === false)   blockers.push('integraciones.reales=false');
  return blockers;
}

export function validateRuntimeConfig(config) {
  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['config debe ser un objeto'] };
  }
  const errors = [];
  if (!config.clientId)     errors.push('clientId requerido');
  if (!config.businessName) errors.push('businessName requerido');
  if (!config.vertical)     errors.push('vertical requerido');
  if (!Object.values(MODE).includes(config.environment)) {
    errors.push(`environment inválido: ${config.environment}`);
  }
  if (!Object.values(AUTH_MODE).includes(config.authMode)) {
    errors.push(`authMode inválido: ${config.authMode}`);
  }
  return { valid: errors.length === 0, errors };
}

export function getEffectiveMode(config) {
  if (config.modoDemo === true) return MODE.DEMO;
  return config.environment ?? MODE.DEMO;
}
