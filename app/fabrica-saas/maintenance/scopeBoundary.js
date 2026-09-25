// Scope Boundary — PASO F
// Classify requests as included or excluded from maintenance scope.

export const SCOPE_CATEGORIES = Object.freeze({
  INCLUDED_SUPPORT:    'INCLUDED_SUPPORT',
  MAINTENANCE_TASK:    'MAINTENANCE_TASK',
  BUG_FIX:            'BUG_FIX',
  CHANGE_REQUEST:      'CHANGE_REQUEST',
  NEW_FEATURE:         'NEW_FEATURE',
  OUT_OF_SCOPE:        'OUT_OF_SCOPE',
});

export const SCOPE_DECISION = Object.freeze({
  INCLUDED:   'INCLUDED',    // covered by maintenance agreement
  BILLABLE:   'BILLABLE',    // requires new scope/quotation
  ESCALATE:   'ESCALATE',    // needs PM review before decision
  EXCLUDED:   'EXCLUDED',    // explicitly out of scope
});

const CLASSIFICATION_RULES = [
  {
    category:  SCOPE_CATEGORIES.BUG_FIX,
    decision:  SCOPE_DECISION.INCLUDED,
    keywords:  ['bug', 'broken', 'error', 'crash', 'not working', 'regression', 'fix'],
    condition: () => true,
  },
  {
    category:  SCOPE_CATEGORIES.INCLUDED_SUPPORT,
    decision:  SCOPE_DECISION.INCLUDED,
    keywords:  ['question', 'how to', 'access', 'password', 'training', 'explain'],
    condition: () => true,
  },
  {
    category:  SCOPE_CATEGORIES.MAINTENANCE_TASK,
    decision:  SCOPE_DECISION.INCLUDED,
    keywords:  ['security patch', 'update dependency', 'backup', 'certificate', 'renew', 'ssl'],
    condition: () => true,
  },
  {
    category:  SCOPE_CATEGORIES.CHANGE_REQUEST,
    decision:  SCOPE_DECISION.BILLABLE,
    keywords:  ['change', 'modify', 'update design', 'redesign', 'new section', 'add field'],
    condition: () => true,
  },
  {
    category:  SCOPE_CATEGORIES.NEW_FEATURE,
    decision:  SCOPE_DECISION.BILLABLE,
    keywords:  ['new feature', 'new module', 'add functionality', 'build', 'create new', 'develop'],
    condition: () => true,
  },
  {
    category:  SCOPE_CATEGORIES.OUT_OF_SCOPE,
    decision:  SCOPE_DECISION.EXCLUDED,
    keywords:  ['third-party support', 'legal advice', 'accounting', 'marketing campaign'],
    condition: () => true,
  },
];

/**
 * Classify a support/maintenance request against scope boundaries.
 */
export function classifyScopeRequest(request = {}) {
  if (!request.description) {
    return { valid: false, error: 'description required' };
  }

  const lower = (request.description + ' ' + (request.title ?? '')).toLowerCase();

  let matched = null;
  for (const rule of CLASSIFICATION_RULES) {
    const keywordMatch = rule.keywords.some(kw => lower.includes(kw));
    if (keywordMatch && rule.condition(request)) {
      matched = rule;
      break;
    }
  }

  if (!matched) {
    // Default: escalate for PM review
    return {
      valid:          true,
      category:       SCOPE_CATEGORIES.CHANGE_REQUEST,
      decision:       SCOPE_DECISION.ESCALATE,
      reason:         'Request does not match known patterns — escalate to PM for scope review',
      includedInTier: false,
      requiresQuote:  false,
      recommendation: 'Have Project Manager assess scope before committing',
    };
  }

  const hoursConsumed = request.estimatedHours ?? null;
  const includedHours  = request.includedHoursRemaining ?? Infinity;

  let finalDecision = matched.decision;
  if (finalDecision === SCOPE_DECISION.INCLUDED && hoursConsumed && hoursConsumed > includedHours) {
    finalDecision = SCOPE_DECISION.BILLABLE;
  }

  return {
    valid:          true,
    category:       matched.category,
    decision:       finalDecision,
    reason:         `Matched rule: ${matched.category}`,
    includedInTier: finalDecision === SCOPE_DECISION.INCLUDED,
    requiresQuote:  finalDecision === SCOPE_DECISION.BILLABLE,
    recommendation: getRecommendation(finalDecision, matched.category),
    disclaimer:     'Scope classification is a guide. Final decision requires PM review.',
  };
}

function getRecommendation(decision, category) {
  switch (decision) {
    case SCOPE_DECISION.INCLUDED:
      return `${category} is covered by the maintenance agreement. Proceed.`;
    case SCOPE_DECISION.BILLABLE:
      return `${category} requires a new scope and quotation. Present proposal to client.`;
    case SCOPE_DECISION.ESCALATE:
      return 'Escalate to Project Manager for scope review before proceeding.';
    case SCOPE_DECISION.EXCLUDED:
      return 'This request is explicitly outside the maintenance scope. Refer client appropriately.';
    default:
      return 'Review with Project Manager.';
  }
}

export const SCOPE_BOUNDARY_VERSION = '1.0.0';
