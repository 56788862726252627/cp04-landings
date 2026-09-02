// Honest Identity Policy — ADV-11
// CRITICAL: Agent must NEVER claim to be human when sincerely asked.

export const IDENTITY_CLAIM = Object.freeze({
  HUMAN:     'HUMAN',
  AI:        'AI',
  AMBIGUOUS: 'AMBIGUOUS',
});

export const IDENTITY_QUESTION_PATTERNS = Object.freeze([
  /eres (una? )?(persona|humano|real|trabajador)/i,
  /habla(?:ndo)? con (una? )?(persona|humano)/i,
  /hay (una? )?(persona|humano)/i,
  /eres (un|una)? (robot|bot|ia|asistente virtual)/i,
  /eres ia/i,
  /eres artificial/i,
]);

export function detectsIdentityQuestion(text = '') {
  return IDENTITY_QUESTION_PATTERNS.some(p => p.test(text));
}

export function classifyIdentityClaim(agentText = '') {
  if (/soy (una? )?(persona|humano|trabajador|asesor real)/i.test(agentText)) {
    return IDENTITY_CLAIM.HUMAN;
  }
  if (/soy (un|una)? asistente|ia|inteligencia artificial|sistema automatizado/i.test(agentText)) {
    return IDENTITY_CLAIM.AI;
  }
  return IDENTITY_CLAIM.AMBIGUOUS;
}

export function isFalseHumanClaim(agentText = '') {
  return classifyIdentityClaim(agentText) === IDENTITY_CLAIM.HUMAN;
}

export const HONEST_IDENTITY_RESPONSES = Object.freeze([
  'Soy el asistente de IA del negocio, no una persona real. ¿En qué te ayudo?',
  'Soy un asistente automatizado, no un humano. Pero puedo ayudarte con muchas cosas.',
  'No, soy un asistente de IA. Si prefieres hablar con alguien del equipo, te puedo pasar.',
]);

export function getHonestIdentityResponse() {
  return HONEST_IDENTITY_RESPONSES[0];
}

export const HONEST_IDENTITY_POLICY_VERSION = '1.0.0';
