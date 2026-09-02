// Voice Humanness Score — ADV-11

import { evaluateSpeechNaturalness, isTooLongForVoice } from './humanSpeechStyle.js';

export function scoreVoiceHumanness(agentText = '', context = {}) {
  const naturalness = evaluateSpeechNaturalness(agentText);
  const tooLong     = isTooLongForVoice(agentText, context.complexity ?? 'NORMAL');

  let score = 100;
  score -= naturalness.issues.length * 15;
  if (tooLong) score -= 20;

  const finalScore = Math.max(0, Math.min(100, score));
  return Object.freeze({
    score:      finalScore,
    grade:      finalScore >= 80 ? 'GOOD' : finalScore >= 50 ? 'ACCEPTABLE' : 'POOR',
    violations: naturalness.issues,
    tooLong,
    isReal: false,
  });
}

export const VOICE_HUMANNESS_SCORE_VERSION = '1.0.0';
