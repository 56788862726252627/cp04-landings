// Continuous Improvement — PASO F
// Identifies improvement opportunities from maintenance cycle data.

export const IMPROVEMENT_CATEGORIES = Object.freeze({
  PROCESS:     'PROCESS',
  TECHNICAL:   'TECHNICAL',
  AUTOMATION:  'AUTOMATION',
  SECURITY:    'SECURITY',
  PERFORMANCE: 'PERFORMANCE',
  CLIENT:      'CLIENT',
});

export const IMPROVEMENT_PRIORITY = Object.freeze({
  HIGH:   'HIGH',
  MEDIUM: 'MEDIUM',
  LOW:    'LOW',
});

/**
 * Identify improvement opportunities from a maintenance cycle or history.
 *
 * @param {object} data - { cycle, previousCycles, ticketSummary }
 * @returns { opportunities }
 */
export function identifyImprovementOpportunities(data = {}) {
  const opportunities = [];

  const cycle          = data.cycle          ?? null;
  const previousCycles = data.previousCycles ?? [];
  const ticketSummary  = data.ticketSummary  ?? null;

  // --- From current cycle ---
  if (cycle) {
    if ((cycle.checklist?.pending ?? 0) > 3) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.PROCESS,
        priority:    IMPROVEMENT_PRIORITY.MEDIUM,
        opportunity: 'Automate pending checklist items to reduce manual work',
        impact:      'Reduce maintenance cycle time by eliminating manual verification steps',
      });
    }

    if ((cycle.automationAudit?.errored ?? 0) > 0) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.AUTOMATION,
        priority:    IMPROVEMENT_PRIORITY.HIGH,
        opportunity: 'Add error recovery / retry logic to automation scenarios',
        impact:      `${cycle.automationAudit.errored} scenario(s) failed — reliability risk`,
      });
    }

    if ((cycle.securityAudit?.unknown ?? 0) > 4) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.SECURITY,
        priority:    IMPROVEMENT_PRIORITY.MEDIUM,
        opportunity: 'Instrument security checks to reduce UNKNOWN outcomes',
        impact:      'Improve security posture visibility',
      });
    }

    if ((cycle.healthScore ?? 100) < 70) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.PROCESS,
        priority:    IMPROVEMENT_PRIORITY.HIGH,
        opportunity: 'Schedule intensive review session to address root causes of low health score',
        impact:      `Current health score: ${cycle.healthScore}/100 — below threshold`,
      });
    }
  }

  // --- From ticket history ---
  if (ticketSummary) {
    const recurringBugs = (ticketSummary.byType?.BUG_REPORT ?? 0) > 3;
    if (recurringBugs) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.TECHNICAL,
        priority:    IMPROVEMENT_PRIORITY.HIGH,
        opportunity: 'Investigate recurring bugs — root cause analysis and systematic fix',
        impact:      `${ticketSummary.byType?.BUG_REPORT} bug tickets in period — possible systemic issue`,
      });
    }

    if ((ticketSummary.byType?.TRAINING_REQUEST ?? 0) > 2) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.CLIENT,
        priority:    IMPROVEMENT_PRIORITY.MEDIUM,
        opportunity: 'Build self-service documentation or video guides',
        impact:      'Reduce support load from training requests',
      });
    }
  }

  // --- From trend comparison ---
  if (previousCycles.length > 1) {
    const last = previousCycles[previousCycles.length - 1];
    if (last?.healthScore && cycle?.healthScore && cycle.healthScore < last.healthScore - 10) {
      opportunities.push({
        category:    IMPROVEMENT_CATEGORIES.PROCESS,
        priority:    IMPROVEMENT_PRIORITY.HIGH,
        opportunity: 'Health score declined significantly — conduct root cause analysis',
        impact:      `Score dropped from ${last.healthScore} to ${cycle.healthScore}`,
      });
    }
  }

  // Default: always suggest proactive improvement
  if (opportunities.length === 0) {
    opportunities.push({
      category:    IMPROVEMENT_CATEGORIES.PROCESS,
      priority:    IMPROVEMENT_PRIORITY.LOW,
      opportunity: 'Document and share maintenance cycle learnings with client',
      impact:      'Builds transparency and trust',
    });
  }

  opportunities.sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
  });

  return {
    valid:           true,
    total:           opportunities.length,
    high:            opportunities.filter(o => o.priority === IMPROVEMENT_PRIORITY.HIGH).length,
    medium:          opportunities.filter(o => o.priority === IMPROVEMENT_PRIORITY.MEDIUM).length,
    low:             opportunities.filter(o => o.priority === IMPROVEMENT_PRIORITY.LOW).length,
    opportunities,
    disclaimer:      'Improvement opportunities are operational suggestions, not binding commitments.',
  };
}

export const CONTINUOUS_IMPROVEMENT_VERSION = '1.0.0';
