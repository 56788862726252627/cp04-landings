// Humanness QA — ADV-03
// Heurísticas para detectar respuestas artificiales. Sin LLM.

export const HUMANNESS_ISSUE = Object.freeze({
  ROBOTIC_PHRASING:    'ROBOTIC_PHRASING',
  OVERFORMAL_STYLE:    'OVERFORMAL_STYLE',
  OVERENTHUSIASM:      'OVERENTHUSIASM',
  FAKE_EMPATHY:        'FAKE_EMPATHY',
  GENERIC_FILLER:      'GENERIC_FILLER',
  REPEATED_CTA:        'REPEATED_CTA',
  SALES_PRESSURE:      'SALES_PRESSURE',
  KNOW_IT_ALL_TONE:    'KNOW_IT_ALL_TONE',
});

const ROBOTIC_PHRASES = Object.freeze([
  'por supuesto, aquí tienes',
  'como asistente de ia',
  '¡claro que sí!',
  'me alegra poder ayudarte',
  'es un placer atenderte',
  'no dudes en preguntar',
  'estoy aquí para servirte',
  'con mucho gusto te ayudo',
  'entiendo perfectamente tu situación',
]);

const OVERFORMAL_PATTERNS = Object.freeze([
  /\bustede?s?\b/i,
  /estimado\/a\b/i,
  /\bsaludos cordiales\b/i,
  /\batentamente\b/i,
  /\bun placer saludarle\b/i,
]);

const OVERENTHUSIASM_PATTERNS = Object.freeze([
  /!{2,}/,                   // multiple exclamation marks
  /\b(¡genial|¡fantástico|¡increíble|¡maravilloso)\b/i,
  /\b(excelente pregunta|qué buena pregunta)\b/i,
]);

const FAKE_EMPATHY = Object.freeze([
  'entiendo perfectamente cómo te sientes',
  'sé exactamente lo que quieres decir',
  'comprendo totalmente tu frustración',
  'es completamente normal sentirte así',
]);

const GENERIC_FILLERS = Object.freeze([
  'espero haberte ayudado',
  'si necesitas algo más',
  'no dudes en contactarnos',
  'estamos a tu disposición',
  'para cualquier consulta',
]);

const KNOW_IT_ALL = Object.freeze([
  'definitivamente',
  'sin lugar a dudas',
  'garantizado',
  'con total seguridad',
  'al 100% te aseguro',
]);

/**
 * Run humanness QA on an agent response.
 * Returns issues found and a humanness score (0-100).
 */
export function checkHumanness(response = '') {
  if (!response || typeof response !== 'string') {
    return { valid: false, error: 'response must be a non-empty string', issues: [] };
  }

  const normalized = response.toLowerCase();
  const issues     = [];

  // 1. Robotic phrasing
  const roboticFound = ROBOTIC_PHRASES.filter(p => normalized.includes(p));
  if (roboticFound.length > 0) {
    issues.push(issue(HUMANNESS_ISSUE.ROBOTIC_PHRASING, `Found: "${roboticFound[0]}"`));
  }

  // 2. Overformal style
  const formalFound = OVERFORMAL_PATTERNS.filter(p => p.test(response));
  if (formalFound.length > 0) {
    issues.push(issue(HUMANNESS_ISSUE.OVERFORMAL_STYLE, `Formal phrasing detected`));
  }

  // 3. Overenthusiasm
  const enthFound = OVERENTHUSIASM_PATTERNS.filter(p => p.test(response));
  if (enthFound.length > 0) {
    issues.push(issue(HUMANNESS_ISSUE.OVERENTHUSIASM, `Excessive enthusiasm detected`));
  }

  // 4. Fake empathy
  const empathyFound = FAKE_EMPATHY.filter(p => normalized.includes(p));
  if (empathyFound.length > 0) {
    issues.push(issue(HUMANNESS_ISSUE.FAKE_EMPATHY, `Generic empathy phrase: "${empathyFound[0]}"`));
  }

  // 5. Generic fillers
  const fillerFound = GENERIC_FILLERS.filter(p => normalized.includes(p));
  if (fillerFound.length >= 2) {
    issues.push(issue(HUMANNESS_ISSUE.GENERIC_FILLER, `${fillerFound.length} generic filler phrases`));
  }

  // 6. Repeated CTA
  const ctaRegex = /\bquieres\b|\bpodemos\b|\bte gustaría\b/gi;
  const ctaMatches = response.match(ctaRegex) ?? [];
  if (ctaMatches.length >= 3) {
    issues.push(issue(HUMANNESS_ISSUE.REPEATED_CTA, `CTA language repeated ${ctaMatches.length} times`));
  }

  // 7. Sales pressure
  const pressureWords = ['urgente', 'última oportunidad', 'solo quedan', 'no te lo pierdas'];
  const pressureFound = pressureWords.filter(p => normalized.includes(p));
  if (pressureFound.length > 0) {
    issues.push(issue(HUMANNESS_ISSUE.SALES_PRESSURE, `Pressure phrase: "${pressureFound[0]}"`));
  }

  // 8. Know-it-all
  const knowFound = KNOW_IT_ALL.filter(p => normalized.includes(p));
  if (knowFound.length > 0) {
    issues.push(issue(HUMANNESS_ISSUE.KNOW_IT_ALL_TONE, `Overconfident language: "${knowFound[0]}"`));
  }

  const humanScore = Math.max(0, 100 - issues.length * 15);
  const isHuman    = issues.length === 0;

  return Object.freeze({
    valid:       true,
    isHuman,
    humanScore,
    issues:      Object.freeze(issues),
    issueCount:  issues.length,
  });
}

function issue(type, message) {
  return Object.freeze({ type, message });
}

export const HUMANNESS_QA_VERSION = '1.0.0';
