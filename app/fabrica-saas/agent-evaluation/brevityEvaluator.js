// Adaptive Brevity Evaluator — ADV-10

function wordCount(text = '') {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function complexityScore(text = '') {
  // Simple proxy: presence of question marks, sub-clauses, technical terms
  let score = 0;
  if (text.includes('?')) score += 1;
  if (text.length > 100) score += 1;
  if (/\bcómo\b|\bpor qué\b|\bcuándo\b|\bpodría\b|\bexplica/i.test(text)) score += 1;
  return score; // 0-3
}

export function evaluateBrevity(response = {}) {
  const userWords  = wordCount(response.userInput ?? '');
  const agentWords = wordCount(response.text ?? '');
  const complexity = complexityScore(response.userInput ?? '');

  // Expected ratio: simple (complexity 0) → 1-2x; medium → 1-3x; complex → up to 5x
  const maxRatio   = complexity === 0 ? 2.5 : complexity === 1 ? 3.5 : 5.5;
  const ratio      = userWords > 0 ? agentWords / userWords : agentWords / 10;

  let score = 100;
  const notes = [];

  if (ratio > maxRatio) {
    const excess = Math.min(50, Math.round((ratio - maxRatio) * 10));
    score -= excess;
    notes.push(`Response ${ratio.toFixed(1)}x user length (max ${maxRatio}x for complexity ${complexity})`);
  }

  // Very short user input with very long response
  if (userWords <= 5 && agentWords > 80) {
    score -= 20;
    notes.push('Short user input with disproportionately long response');
  }

  score = Math.max(0, score);
  return Object.freeze({ score, ratio: Math.round(ratio * 10) / 10, complexity, notes: Object.freeze(notes), isReal: false });
}

export const BREVITY_EVALUATOR_VERSION = '1.0.0';
