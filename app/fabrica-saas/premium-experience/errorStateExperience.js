// Premium Error State Experience — ADV-07

export const ERROR_STATE_TYPE = Object.freeze({
  RECOVERABLE:  'RECOVERABLE',
  BLOCKING:     'BLOCKING',
  NETWORK:      'NETWORK',
  PERMISSION:   'PERMISSION',
  VALIDATION:   'VALIDATION',
  NOT_FOUND:    'NOT_FOUND',
});

const ERROR_SPECS = Object.freeze({
  [ERROR_STATE_TYPE.RECOVERABLE]:  { blocking: false, hasCTA: true,  ctaLabel: 'Reintentar',      userMessage: 'Algo ha fallado. Por favor, inténtalo de nuevo.' },
  [ERROR_STATE_TYPE.BLOCKING]:     { blocking: true,  hasCTA: false, ctaLabel: null,               userMessage: 'No podemos continuar. Contacta con soporte.' },
  [ERROR_STATE_TYPE.NETWORK]:      { blocking: false, hasCTA: true,  ctaLabel: 'Reintentar',      userMessage: 'Problema de conexión. Revisa tu red e inténtalo.' },
  [ERROR_STATE_TYPE.PERMISSION]:   { blocking: true,  hasCTA: false, ctaLabel: null,               userMessage: 'No tienes permiso para acceder a esta sección.' },
  [ERROR_STATE_TYPE.VALIDATION]:   { blocking: false, hasCTA: false, ctaLabel: null,               userMessage: 'Revisa los campos marcados e inténtalo de nuevo.' },
  [ERROR_STATE_TYPE.NOT_FOUND]:    { blocking: false, hasCTA: true,  ctaLabel: 'Volver al inicio', userMessage: 'Esta página no existe o ha sido movida.' },
});

export function createPremiumErrorState(type = ERROR_STATE_TYPE.RECOVERABLE, options = {}) {
  const spec = ERROR_SPECS[type] ?? ERROR_SPECS[ERROR_STATE_TYPE.RECOVERABLE];
  return Object.freeze({
    type,
    blocking:       spec.blocking,
    hasCTA:         spec.hasCTA,
    ctaLabel:       options.ctaLabel ?? spec.ctaLabel,
    userMessage:    options.userMessage ?? spec.userMessage,
    humanFriendly:  true,
    noTechJargon:   true,
    noStackTrace:   true,
    isReal:         false,
  });
}

export function buildDefaultErrorStates() {
  return Object.values(ERROR_STATE_TYPE).map(t => createPremiumErrorState(t));
}

export function evaluateErrorStateQuality(errorState = {}) {
  const issues = [];
  if (!errorState.userMessage || errorState.userMessage.includes('undefined') || errorState.userMessage.includes('Error:')) {
    issues.push('non-human-friendly message');
  }
  if (!errorState.humanFriendly) issues.push('not marked human-friendly');
  if (errorState.blocking && errorState.hasCTA) issues.push('blocking error should not have retry CTA');
  return Object.freeze({ valid: issues.length === 0, issues, isReal: false });
}

export const ERROR_STATE_EXPERIENCE_VERSION = '1.0.0';
