// Urgency Score — ADV-08

const URGENCY_SIGNALS = Object.freeze({
  NO_BOOKING:          25,
  MANUAL_CONTACT_ONLY: 20,
  BROKEN_CTA:          25,
  MANUAL_APPOINTMENTS: 25,
  SLOW_WORKFLOW:       15,
  NO_AUTOMATION:       15,
  WEAK_FOLLOW_UP:      15,
  NO_LEAD_CAPTURE:     20,
  POOR_MOBILE_UX:      10,
});

export function calculateUrgencyScore(lead = {}, weights = {}) {
  const w = weights.urgency ?? 1;

  const painSignals = lead.painSignals ?? [];
  const signalTypes = painSignals.map(s => typeof s === 'string' ? s : s.type);

  let raw = 0;
  for (const type of signalTypes) {
    raw += URGENCY_SIGNALS[type] ?? 0;
  }
  const baseScore = Math.min(100, raw);

  const digitalMatLevel = lead.digitalMaturityLevel ?? 'BASIC';
  const matBoost = digitalMatLevel === 'ABSENT' ? 15
    : digitalMatLevel === 'MINIMAL' ? 10 : 0;

  const finalScore = Math.round(Math.min(100, (baseScore + matBoost) * w));

  return Object.freeze({
    score:          finalScore,
    signalsFound:   signalTypes.filter(t => URGENCY_SIGNALS[t]),
    maturityBoost:  matBoost,
    isReal: false,
  });
}

export const URGENCY_SCORE_VERSION = '1.0.0';
