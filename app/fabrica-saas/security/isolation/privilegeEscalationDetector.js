// Privilege Escalation Detector — ADV-19

export const ESCALATION_TYPE = Object.freeze({
  ROLE_CHANGE:        'ROLE_CHANGE',
  SELF_GRANT:         'SELF_GRANT',
  SCOPE_BROADENING:   'SCOPE_BROADENING',
  TENANT_CHANGE:      'TENANT_CHANGE',
  ADMIN_IMPERSONATION:'ADMIN_IMPERSONATION',
});

const ADMIN_ROLES = new Set(['admin', 'superadmin', 'root', 'god', 'ADMIN', 'SUPERADMIN']);

export function createPrivilegeEscalationDetector(config = {}) {
  const { clientId = null } = config;

  function detect(event = {}) {
    const detections = [];
    const { currentRole, requestedRole, currentScope, requestedScope, currentClientId, requestedClientId, requesterId, grantedBy } = event;

    if (currentRole && requestedRole && currentRole !== requestedRole) {
      if (ADMIN_ROLES.has(requestedRole)) {
        detections.push({ type: ESCALATION_TYPE.ROLE_CHANGE, detail: `${currentRole}→${requestedRole}`, severity: 'CRITICAL' });
      }
    }

    if (requesterId && grantedBy && requesterId === grantedBy) {
      detections.push({ type: ESCALATION_TYPE.SELF_GRANT, detail: `actor=${requesterId}`, severity: 'CRITICAL' });
    }

    if (currentScope && requestedScope) {
      const expanded = requestedScope.filter(s => !currentScope.includes(s));
      if (expanded.length > 0) {
        detections.push({ type: ESCALATION_TYPE.SCOPE_BROADENING, detail: expanded.join(','), severity: 'HIGH' });
      }
    }

    if (currentClientId && requestedClientId && currentClientId !== requestedClientId) {
      detections.push({ type: ESCALATION_TYPE.TENANT_CHANGE, detail: `${currentClientId}→${requestedClientId}`, severity: 'CRITICAL' });
    }

    if (requestedRole && ADMIN_ROLES.has(requestedRole) && currentRole && !ADMIN_ROLES.has(currentRole)) {
      detections.push({ type: ESCALATION_TYPE.ADMIN_IMPERSONATION, detail: requestedRole, severity: 'CRITICAL' });
    }

    const unique = [...new Map(detections.map(d => [d.type, d])).values()];

    return Object.freeze({
      detected: unique.length > 0,
      blocked: unique.length > 0,
      detections: Object.freeze(unique.map(d => Object.freeze(d))),
      isReal: false,
    });
  }

  return Object.freeze({ clientId, detect, escalationTypes: Object.keys(ESCALATION_TYPE).length, isReal: false });
}

export const PRIVILEGE_ESCALATION_VERSION = '1.0.0';
