// Health Next Action Engine — ADV-20

export const ACTION_PRIORITY = Object.freeze({
  P0_CRITICAL:    'P0_CRITICAL',
  P1_HIGH:        'P1_HIGH',
  P2_MEDIUM:      'P2_MEDIUM',
  P3_LOW:         'P3_LOW',
  INFORMATIONAL:  'INFORMATIONAL',
});

export const OWNER_TYPE = Object.freeze({
  ENGINEER:     'ENGINEER',
  SECURITY:     'SECURITY',
  LEGAL:        'LEGAL',
  PRODUCT:      'PRODUCT',
  AGENCY:       'AGENCY',
  AUTOMATED:    'AUTOMATED',
});

export const EFFORT_CLASS = Object.freeze({
  IMMEDIATE:  'IMMEDIATE',
  HOURS:      'HOURS',
  DAYS:       'DAYS',
  SPRINT:     'SPRINT',
  ONGOING:    'ONGOING',
});

let _actionCounter = 0;

export function createHealthNextAction(config = {}) {
  const {
    action,
    priority          = ACTION_PRIORITY.P2_MEDIUM,
    reason            = '',
    ownerType         = OWNER_TYPE.ENGINEER,
    estimatedEffort   = EFFORT_CLASS.HOURS,
    blocking          = false,
    automationPossible = false,
    dimension         = null,
  } = config;

  if (!action) {
    return Object.freeze({ error: 'ACTION_REQUIRED', isReal: false });
  }

  const id = config.id || `action-${++_actionCounter}`;

  return Object.freeze({
    id,
    action,
    priority,
    reason,
    ownerType,
    estimatedEffort,
    blocking,
    automationPossible,
    dimension,
    executed: false,
    isReal: false,
  });
}

export function generateNextActions(snapshot) {
  if (!snapshot) return Object.freeze([]);

  const actions = [];

  for (const issue of (snapshot.criticalIssues || [])) {
    const priority = issue.status === 'BLOCKED' ? ACTION_PRIORITY.P0_CRITICAL : ACTION_PRIORITY.P1_HIGH;
    actions.push(createHealthNextAction({
      action: issue.recommendedAction || `Resolve ${issue.dimension} ${issue.status}`,
      priority,
      reason: `${issue.dimension} is ${issue.status}`,
      blocking: true,
      dimension: issue.dimension,
      ownerType: _ownerForDimension(issue.dimension),
    }));
  }

  for (const warning of (snapshot.warnings || [])) {
    actions.push(createHealthNextAction({
      action: `Address ${warning.dimension} warning`,
      priority: ACTION_PRIORITY.P2_MEDIUM,
      reason: `${warning.dimension} is ${warning.status}`,
      blocking: false,
      dimension: warning.dimension,
      ownerType: _ownerForDimension(warning.dimension),
    }));
  }

  return Object.freeze(actions.sort((a, b) => _priorityRank(a.priority) - _priorityRank(b.priority)));
}

function _ownerForDimension(dimension) {
  if (['SECURITY','CLIENT_ISOLATION','PRIVACY','GDPR','CMP'].includes(dimension)) return OWNER_TYPE.SECURITY;
  if (['GDPR','LEGAL_BASIS'].includes(dimension)) return OWNER_TYPE.LEGAL;
  return OWNER_TYPE.ENGINEER;
}

function _priorityRank(p) {
  const r = { P0_CRITICAL: 0, P1_HIGH: 1, P2_MEDIUM: 2, P3_LOW: 3, INFORMATIONAL: 4 };
  return r[p] ?? 5;
}

export const HEALTH_NEXT_ACTION_VERSION = '1.0.0';
