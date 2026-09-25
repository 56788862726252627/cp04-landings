// Error Normalizer — ADV-01 Transversal Observability
// Classifies errors into standard categories. Never exposes stack to user.

export const ERROR_CATEGORY = Object.freeze({
  VALIDATION:     'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION:  'AUTHORIZATION',
  NETWORK:        'NETWORK',
  TIMEOUT:        'TIMEOUT',
  RATE_LIMIT:     'RATE_LIMIT',
  DATABASE:       'DATABASE',
  AUTOMATION:     'AUTOMATION',
  AI_PROVIDER:    'AI_PROVIDER',
  EXTERNAL_API:   'EXTERNAL_API',
  BUILD:          'BUILD',
  DEPLOY:         'DEPLOY',
  RUNTIME:        'RUNTIME',
  SECURITY:       'SECURITY',
  UNKNOWN:        'UNKNOWN',
});

export const RECOVERABLE_CATEGORIES = new Set([
  ERROR_CATEGORY.NETWORK,
  ERROR_CATEGORY.TIMEOUT,
  ERROR_CATEGORY.RATE_LIMIT,
  ERROR_CATEGORY.EXTERNAL_API,
]);

const CATEGORY_PATTERNS = [
  { category: ERROR_CATEGORY.VALIDATION,     patterns: [/validat/i, /invalid/i, /required/i, /format/i, /schema/i, /constraint/i] },
  { category: ERROR_CATEGORY.AUTHENTICATION, patterns: [/auth/i, /401/i, /unauthenticated/i, /login/i, /credential/i, /token.*expired/i] },
  { category: ERROR_CATEGORY.AUTHORIZATION,  patterns: [/403/i, /forbidden/i, /unauthorized/i, /permission/i, /access denied/i, /role/i] },
  { category: ERROR_CATEGORY.TIMEOUT,        patterns: [/timeout/i, /timed out/i, /ETIMEDOUT/i, /deadline/i] },
  { category: ERROR_CATEGORY.RATE_LIMIT,     patterns: [/429/i, /rate.?limit/i, /too many/i, /quota/i, /throttl/i] },
  { category: ERROR_CATEGORY.NETWORK,        patterns: [/ECONNREFUSED/i, /ENOTFOUND/i, /network/i, /fetch failed/i, /connection/i, /socket/i, /ECONNRESET/i] },
  { category: ERROR_CATEGORY.DATABASE,       patterns: [/supabase/i, /postgres/i, /database/i, /sql/i, /query/i, /record/i, /table/i, /migration/i] },
  { category: ERROR_CATEGORY.AUTOMATION,     patterns: [/make\.com/i, /webhook/i, /scenario/i, /zapier/i, /automation/i, /workflow/i] },
  { category: ERROR_CATEGORY.AI_PROVIDER,    patterns: [/claude/i, /openai/i, /anthropic/i, /llm/i, /model/i, /completion/i, /context.*window/i] },
  { category: ERROR_CATEGORY.EXTERNAL_API,   patterns: [/airtable/i, /stripe/i, /whatsapp/i, /twilio/i, /external/i, /api.*error/i] },
  { category: ERROR_CATEGORY.BUILD,          patterns: [/build/i, /compile/i, /bundle/i, /vite/i, /webpack/i, /esbuild/i] },
  { category: ERROR_CATEGORY.DEPLOY,         patterns: [/deploy/i, /cloudflare/i, /wrangler/i, /pages/i, /publish/i] },
  { category: ERROR_CATEGORY.SECURITY,       patterns: [/security/i, /csrf/i, /xss/i, /injection/i, /suspicious/i, /attack/i] },
  { category: ERROR_CATEGORY.RUNTIME,        patterns: [/undefined/i, /null/i, /type.?error/i, /reference.?error/i, /syntax.?error/i, /range.?error/i] },
];

function detectCategory(message, name) {
  const text = `${message ?? ''} ${name ?? ''}`;
  for (const { category, patterns } of CATEGORY_PATTERNS) {
    if (patterns.some(p => p.test(text))) return category;
  }
  return ERROR_CATEGORY.UNKNOWN;
}

function extractHttpStatus(error) {
  if (error?.status && typeof error.status === 'number') return error.status;
  if (error?.statusCode && typeof error.statusCode === 'number') return error.statusCode;
  const match = String(error?.message ?? '').match(/\b(4\d{2}|5\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Normalize any thrown value into a structured error record.
 * Never exposes stack trace in the returned object (logs it in dev only).
 */
export function normalizeError(rawError, context = {}) {
  const message = rawError?.message ?? String(rawError);
  const name    = rawError?.name ?? 'Error';
  const code    = rawError?.code ?? rawError?.errorCode ?? null;

  const category = context.category ?? detectCategory(message, name);
  const httpStatus = extractHttpStatus(rawError);

  const isRecoverable = context.recoverable ?? RECOVERABLE_CATEGORIES.has(category);

  const normalized = {
    valid:       true,
    errorCode:   code ?? httpStatus ?? null,
    errorCategory: category,
    message,
    name,
    httpStatus,
    recoverable: isRecoverable,
    retryable:   isRecoverable,
    humanActionRequired: !isRecoverable && (category === ERROR_CATEGORY.SECURITY || category === ERROR_CATEGORY.DEPLOY),
    context:     {
      clientId:     context.clientId     ?? 'unknown',
      projectId:    context.projectId    ?? 'unknown',
      correlationId: context.correlationId ?? null,
      operationId:  context.operationId  ?? null,
      service:      context.service      ?? 'unknown',
      component:    context.component    ?? 'unknown',
    },
  };

  return normalized;
}

/**
 * Convert a normalized error to a user-safe message (no internals).
 */
export function toUserMessage(normalizedError) {
  const safe = {
    [ERROR_CATEGORY.VALIDATION]:     'Los datos enviados no son válidos. Por favor, revisa el formulario.',
    [ERROR_CATEGORY.AUTHENTICATION]: 'Sesión expirada o credenciales incorrectas. Por favor, inicia sesión de nuevo.',
    [ERROR_CATEGORY.AUTHORIZATION]:  'No tienes permisos para realizar esta acción.',
    [ERROR_CATEGORY.TIMEOUT]:        'La operación tardó demasiado. Por favor, inténtalo de nuevo.',
    [ERROR_CATEGORY.RATE_LIMIT]:     'Demasiadas solicitudes. Por favor, espera unos minutos.',
    [ERROR_CATEGORY.NETWORK]:        'Error de conexión. Verifica tu conexión a internet.',
    [ERROR_CATEGORY.DATABASE]:       'Error al acceder a los datos. Inténtalo de nuevo en unos momentos.',
    [ERROR_CATEGORY.AUTOMATION]:     'El servicio de automatización no está disponible temporalmente.',
    [ERROR_CATEGORY.AI_PROVIDER]:    'El asistente de IA no está disponible temporalmente.',
    [ERROR_CATEGORY.EXTERNAL_API]:   'Un servicio externo no está disponible temporalmente.',
    [ERROR_CATEGORY.BUILD]:          'Error en el proceso de construcción. Contacta con soporte.',
    [ERROR_CATEGORY.DEPLOY]:         'Error en el despliegue. Contacta con soporte.',
    [ERROR_CATEGORY.RUNTIME]:        'Error inesperado. Estamos trabajando para resolverlo.',
    [ERROR_CATEGORY.SECURITY]:       'Operación bloqueada por seguridad.',
    [ERROR_CATEGORY.UNKNOWN]:        'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.',
  };

  return safe[normalizedError?.errorCategory] ?? safe[ERROR_CATEGORY.UNKNOWN];
}

export const ERROR_NORMALIZER_VERSION = '1.0.0';
