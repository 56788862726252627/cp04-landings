// Humanlike Conversation Evaluator — ADV-10

export const ROBOTIC_PATTERNS = Object.freeze([
  { pattern: /^(Claro|Por supuesto|Entendido),?\s+(le|te)\s+ayudo/i, penalty: 15, label: 'robotic_opener' },
  { pattern: /Como (asistente|IA|inteligencia artificial)/i,          penalty: 20, label: 'ai_self_reference' },
  { pattern: /\n\s*[-•]\s+.+(\n\s*[-•]\s+.+){3,}/,                 penalty: 10, label: 'excessive_bullets' },
  { pattern: /Espero (haber|que esta|que esto)/i,                     penalty: 10, label: 'robotic_closing' },
  { pattern: /(?:Recuerda|Tenga en cuenta|Es importante destacar)/i,  penalty: 8,  label: 'unnecessary_disclaimer' },
  { pattern: /(##{1,3}\s+\w|\*\*\w+\*\*)/,                           penalty: 8,  label: 'unnatural_heading' },
  { pattern: /Estimado\s+cliente/i,                                   penalty: 12, label: 'formal_template' },
]);

export function evaluateHumanlikeness(response = {}) {
  const text      = response.text ?? '';
  const penalties = [];
  let score       = 100;

  for (const { pattern, penalty, label } of ROBOTIC_PATTERNS) {
    if (pattern.test(text)) {
      score -= penalty;
      penalties.push(label);
    }
  }

  // Overlong paragraphs
  const paragraphs = text.split(/\n\n+/);
  const longParas  = paragraphs.filter(p => p.split(' ').length > 80);
  if (longParas.length > 0) { score -= 10; penalties.push('overlong_paragraphs'); }

  // Repeated "¿Necesitas algo más?" type closings
  if ((text.match(/¿[Nn]ecesitas|¿[Pp]uedo ayudarte|¿[Hh]ay algo más/g) ?? []).length > 1) {
    score -= 8; penalties.push('repeated_closings');
  }

  score = Math.max(0, score);
  return Object.freeze({ score, penalties: Object.freeze(penalties), isReal: false });
}

export const HUMANLIKE_EVALUATOR_VERSION = '1.0.0';
