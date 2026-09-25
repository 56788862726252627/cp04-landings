// Natural Disfluency Policy — ADV-11

export const DISFLUENCY_TYPE = Object.freeze({
  ACKNOWLEDGEMENT: 'ACKNOWLEDGEMENT', // "Vale.", "Perfecto."
  BRIEF_PAUSE:     'BRIEF_PAUSE',     // "Un segundo..."
  CLARIFICATION:   'CLARIFICATION',   // "¿Me repites...?"
  REFORMULATION:   'REFORMULATION',   // "Es decir..."
});

export const ALLOWED_DISFLUENCIES = Object.freeze([
  'vale', 'perfecto', 'de acuerdo', 'un segundo', 'entendido',
  'claro', 'bien', 'muy bien', 'por supuesto', 'desde luego',
]);

export const FORBIDDEN_DISFLUENCIES = Object.freeze([
  'ehhh', 'ahhh', 'ummm', 'a ver a ver', 'es que es que',
  'bueno bueno', 'vale vale vale',
]);

export function createNaturalDisfluencyPolicy(config = {}) {
  return Object.freeze({
    enabled:              config.enabled              ?? true,
    maxPerTurn:           config.maxPerTurn           ?? 1,
    allowedDisfluencies:  Object.freeze(config.allowedDisfluencies ?? ALLOWED_DISFLUENCIES),
    forbiddenDisfluencies:Object.freeze(config.forbiddenDisfluencies ?? FORBIDDEN_DISFLUENCIES),
    avoidExaggeration:    true,
    avoidConstantFillers: true,
    isReal: false,
  });
}

export function hasForbiddenDisfluency(text = '') {
  const lower = text.toLowerCase();
  return FORBIDDEN_DISFLUENCIES.some(d => lower.includes(d));
}

export function countDisfluencies(text = '') {
  const lower = text.toLowerCase();
  return ALLOWED_DISFLUENCIES.filter(d => lower.includes(d)).length;
}

export function validateDisfluency(text = '', policy = {}) {
  const forbidden = hasForbiddenDisfluency(text);
  const count     = countDisfluencies(text);
  const max       = policy.maxPerTurn ?? 1;
  const tooMany   = count > max;
  return Object.freeze({
    valid:    !forbidden && !tooMany,
    forbidden,
    count,
    tooMany,
    isReal: false,
  });
}

export const DEFAULT_DISFLUENCY_POLICY = createNaturalDisfluencyPolicy();

export const NATURAL_DISFLUENCY_POLICY_VERSION = '1.0.0';
