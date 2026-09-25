// Social Humanness Evaluator — ADV-10 connection: checks if content feels authentic

const ROBOTIC_PATTERNS = Object.freeze([
  /como (?:modelo|ia|inteligencia artificial)/i,
  /según mis datos/i,
  /no tengo emociones/i,
  /como asistente/i,
  /\[INSERTAR\]/i,
  /\{\{[^}]+\}\}/,
]);

export function evaluateSocialHumanness(post = {}) {
  if (!post.fullText && !post.body) throw new Error('evaluateSocialHumannessEvaluator requires fullText or body');

  const text   = post.fullText ?? post.body ?? '';
  const issues = [];
  let deductions = 0;

  for (const pattern of ROBOTIC_PATTERNS) {
    if (pattern.test(text)) {
      issues.push({ issue: 'ROBOTIC_LANGUAGE', pattern: pattern.source });
      deductions += 25;
    }
  }

  if (text.length < 30) {
    issues.push({ issue: 'TOO_SHORT', detail: 'Content is too brief to feel authentic' });
    deductions += 15;
  }

  const hasPersonalVoice = /nosotros|nuestro|nuestros|os invitamos|te esperamos/i.test(text);
  if (!hasPersonalVoice) deductions += 10;

  const score = Math.max(0, 100 - deductions);

  return Object.freeze({
    score,
    humanEnough: score >= 60,
    issues:      Object.freeze(issues),
    adv10Bridge: 'HUMANNESS_EVALUATOR_CONNECTED',
    isReal:      false,
  });
}
