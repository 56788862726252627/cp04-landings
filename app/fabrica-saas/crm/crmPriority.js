// CRM Priority Engine — ADV-09 CRM
// Scoring: FIT×40 + URGENCY×30 + VALUE×20 + EASE×10

export const CRM_PRIORITY_LABEL = Object.freeze({
  P0: 'P0',
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
});

const WEIGHTS = Object.freeze({ fit: 40, urgency: 30, value: 20, ease: 10 });

function clamp(v, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

export function computeCRMPriorityScore(signals = {}) {
  const fit     = clamp(signals.fit ?? 0);
  const urgency = clamp(signals.urgency ?? 0);
  const value   = clamp(signals.value ?? 0);
  const ease    = clamp(signals.ease ?? 0);
  return Math.round(fit * WEIGHTS.fit / 100 + urgency * WEIGHTS.urgency / 100 +
    value * WEIGHTS.value / 100 + ease * WEIGHTS.ease / 100);
}

export function assignCRMPriority(score = 0) {
  if (score >= 80) return CRM_PRIORITY_LABEL.P0;
  if (score >= 60) return CRM_PRIORITY_LABEL.P1;
  if (score >= 40) return CRM_PRIORITY_LABEL.P2;
  return CRM_PRIORITY_LABEL.P3;
}

export function createCRMPriorityProfile(fields = {}) {
  const signals = {
    fit:     fields.fit ?? 0,
    urgency: fields.urgency ?? 0,
    value:   fields.value ?? 0,
    ease:    fields.ease ?? 0,
  };
  const score    = computeCRMPriorityScore(signals);
  const priority = assignCRMPriority(score);

  return Object.freeze({
    opportunityId: fields.opportunityId ?? '',
    signals:       Object.freeze(signals),
    score,
    priority,
    isReal: false,
  });
}

export const CRM_PRIORITY_VERSION = '1.0.0';
