// AI Routing Quality Gate — ADV-16

export const ROUTING_GATE_STATUS = Object.freeze({
  PASS:    'PASS',
  WARN:    'WARN',
  FAIL:    'FAIL',
  BLOCKED: 'BLOCKED',
});

export const ROUTING_BLOCK_REASON = Object.freeze({
  CAPABILITY_MISMATCH:              'CAPABILITY_MISMATCH',
  RESTRICTED_DATA_UNAUTHORIZED:     'RESTRICTED_DATA_UNAUTHORIZED',
  PAID_WITHOUT_APPROVAL:            'PAID_WITHOUT_APPROVAL',
  CLIENT_POLICY_VIOLATION:          'CLIENT_POLICY_VIOLATION',
  INVALID_FALLBACK:                 'INVALID_FALLBACK',
  DISABLED_MODEL:                   'DISABLED_MODEL',
  UNSAFE_HIGH_RISK_ROUTING:         'UNSAFE_HIGH_RISK_ROUTING',
});

export function evaluateAIRoutingQualityGate(params = {}) {
  const {
    score           = 0,
    capabilityMatch = true,
    privacySafe     = true,
    costApproved    = true,
    policyCompliant = true,
    fallbackValid   = true,
    modelEnabled    = true,
    highRiskSafe    = true,
    violations      = [],
  } = params;

  const blocks = [];

  if (!capabilityMatch)  blocks.push(ROUTING_BLOCK_REASON.CAPABILITY_MISMATCH);
  if (!privacySafe)      blocks.push(ROUTING_BLOCK_REASON.RESTRICTED_DATA_UNAUTHORIZED);
  if (!costApproved)     blocks.push(ROUTING_BLOCK_REASON.PAID_WITHOUT_APPROVAL);
  if (!policyCompliant)  blocks.push(ROUTING_BLOCK_REASON.CLIENT_POLICY_VIOLATION);
  if (!fallbackValid)    blocks.push(ROUTING_BLOCK_REASON.INVALID_FALLBACK);
  if (!modelEnabled)     blocks.push(ROUTING_BLOCK_REASON.DISABLED_MODEL);
  if (!highRiskSafe)     blocks.push(ROUTING_BLOCK_REASON.UNSAFE_HIGH_RISK_ROUTING);

  if (blocks.length > 0) {
    return Object.freeze({
      status:    ROUTING_GATE_STATUS.BLOCKED,
      score,
      blocks:    Object.freeze(blocks),
      violations:Object.freeze(violations),
      blocked:   true,
      isReal:    false,
    });
  }

  const status = score >= 80 ? ROUTING_GATE_STATUS.PASS
    : score >= 60 || violations.length > 0 ? ROUTING_GATE_STATUS.WARN
    : ROUTING_GATE_STATUS.FAIL;

  return Object.freeze({
    status,
    score,
    blocks:    Object.freeze([]),
    violations:Object.freeze(violations),
    blocked:   false,
    isReal:    false,
  });
}

export const AI_ROUTING_QUALITY_GATE_VERSION = '1.0.0';
