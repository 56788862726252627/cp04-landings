// Evaluate Content Calendar Balance — checks pillar distribution and cadence

import { CALENDAR_STATUS } from './socialContentCalendar.js';

export function evaluateContentCalendarBalance(entries = [], policy = {}) {
  if (!Array.isArray(entries)) throw new Error('evaluateContentCalendarBalance requires entries array');

  const active = entries.filter(e => e.status !== CALENDAR_STATUS.BLOCKED);
  const total  = active.length;
  const issues = [];

  // Pillar distribution check
  const pillarCounts = {};
  for (const entry of active) {
    const p = entry.pillar ?? 'UNASSIGNED';
    pillarCounts[p] = (pillarCounts[p] ?? 0) + 1;
  }
  const maxPillarShare = Math.max(...Object.values(pillarCounts)) / Math.max(total, 1);
  if (maxPillarShare > 0.6) {
    issues.push({ issue: 'PILLAR_IMBALANCE', detail: `One pillar exceeds 60% of posts (${Math.round(maxPillarShare * 100)}%)` });
  }

  // Promotions cap
  const promotionCount = pillarCounts['PROMOTIONS'] ?? 0;
  if (total > 0 && promotionCount / total > 0.25) {
    issues.push({ issue: 'TOO_MANY_PROMOTIONS', detail: 'Promotions exceed 25% of calendar' });
  }

  // Weekly cadence check
  const postsPerWeek = policy.postsPerWeek ?? 3;
  const weeksPlanned = Math.ceil(total / postsPerWeek);
  const minRecommended = weeksPlanned * postsPerWeek;
  if (total < minRecommended * 0.7) {
    issues.push({ issue: 'CALENDAR_TOO_SPARSE', detail: `Only ${total} posts for ${weeksPlanned} weeks` });
  }

  return Object.freeze({
    total,
    pillarCounts:   Object.freeze(pillarCounts),
    balanced:       issues.length === 0,
    issues:         Object.freeze(issues),
    coverageWeeks:  weeksPlanned,
    isReal:         false,
  });
}
