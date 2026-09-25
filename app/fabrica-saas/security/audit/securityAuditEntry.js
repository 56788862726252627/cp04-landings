// Security Audit Entry — ADV-19

export const SECURITY_AUDIT_ACTION = Object.freeze({
  ACCESS_GRANTED:          'ACCESS_GRANTED',
  ACCESS_DENIED:           'ACCESS_DENIED',
  SECRET_BLOCKED:          'SECRET_BLOCKED',
  CROSS_CLIENT_BLOCKED:    'CROSS_CLIENT_BLOCKED',
  PRIVILEGE_ESCALATION:    'PRIVILEGE_ESCALATION',
  CONSENT_CHANGED:         'CONSENT_CHANGED',
  DSAR_CREATED:            'DSAR_CREATED',
  DSAR_COMPLETED:          'DSAR_COMPLETED',
  INCIDENT_DETECTED:       'INCIDENT_DETECTED',
  POLICY_EVALUATED:        'POLICY_EVALUATED',
  INJECTION_BLOCKED:       'INJECTION_BLOCKED',
  GATE_EVALUATED:          'GATE_EVALUATED',
});

export const SECURITY_AUDIT_ACTOR = Object.freeze({
  SYSTEM:    'SYSTEM',
  AGENT:     'AGENT',
  HUMAN:     'HUMAN',
  SCHEDULER: 'SCHEDULER',
  ANONYMOUS: 'ANONYMOUS',
});

export function createSecurityAuditEntry(config = {}) {
  const {
    action = SECURITY_AUDIT_ACTION.POLICY_EVALUATED,
    actor = SECURITY_AUDIT_ACTOR.SYSTEM,
    actorId = null,
    resource = null,
    result = 'UNKNOWN',
    risk = 'LOW',
    clientId = null,
    reason = '',
  } = config;

  // Never include secrets in audit
  if (/secret|password|token|key/i.test(JSON.stringify(config))) {
    return Object.freeze({
      id: `audit-${Date.now()}`,
      action: SECURITY_AUDIT_ACTION.SECRET_BLOCKED,
      actor: SECURITY_AUDIT_ACTOR.SYSTEM,
      result: 'BLOCKED_SECRET_IN_AUDIT',
      risk: 'CRITICAL',
      clientId,
      timestamp: new Date().toISOString(),
      secretIncluded: false,
      isReal: false,
    });
  }

  return Object.freeze({
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    actor,
    actorId,
    resource,
    result,
    risk,
    clientId,
    reason,
    timestamp: new Date().toISOString(),
    secretIncluded: false,
    isReal: false,
  });
}

export const SECURITY_AUDIT_VERSION = '1.0.0';
