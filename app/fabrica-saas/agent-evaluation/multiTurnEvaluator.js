// Multi-Turn Conversation Evaluator — ADV-10

export function evaluateMultiTurn(conversation = {}) {
  const turns       = conversation.turns ?? [];
  const issues      = [];
  let score         = 100;

  if (turns.length < 2) {
    return Object.freeze({ score: 100, issues: Object.freeze([]), note: 'Single turn — no multi-turn eval', isReal: false });
  }

  // Context retention: later turns should reference earlier user info
  const firstUserText = turns.find(t => t.role === 'user')?.text ?? '';
  const lastAgentText = [...turns].reverse().find(t => t.role === 'agent')?.text ?? '';
  const keyToken = firstUserText.split(' ').find(w => w.length > 5) ?? '';
  if (keyToken && !lastAgentText.includes(keyToken) && turns.length > 3) {
    score -= 10;
    issues.push('Context may not be retained across turns');
  }

  // Repetition: agent should not repeat identical sentences
  const agentTexts = turns.filter(t => t.role === 'agent').map(t => t.text ?? '');
  const seen = new Set();
  for (const txt of agentTexts) {
    const key = txt.slice(0, 60);
    if (seen.has(key)) { score -= 15; issues.push('Agent repeated same response'); break; }
    seen.add(key);
  }

  // Progression: later turns should not circle back to initial state with no progress
  if (turns.length > 4) {
    const stages = turns.filter(t => t.stage).map(t => t.stage);
    if (stages.length > 1 && stages[stages.length - 1] === stages[0]) {
      score -= 10;
      issues.push('Conversation shows no progression in goal/stage');
    }
  }

  // Goal tracking: final turn should address the original intent
  if (conversation.originalIntent && !lastAgentText.toLowerCase().includes(conversation.originalIntent.slice(0,10).toLowerCase())) {
    score -= 8;
    issues.push('Final response may not address original intent');
  }

  return Object.freeze({
    score:     Math.max(0, score),
    turnCount: turns.length,
    issues:    Object.freeze(issues),
    isReal: false,
  });
}

export const MULTITURN_EVALUATOR_VERSION = '1.0.0';
