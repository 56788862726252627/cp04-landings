// Object Access Control (IDOR protection) — ADV-19

export const ACCESS_RESULT = Object.freeze({
  ALLOWED: 'ALLOWED',
  DENIED:  'DENIED',
  BLOCKED: 'BLOCKED',
});

export function createObjectAccessControlPolicy(config = {}) {
  const { clientId = null, ownerId = null } = config;

  function checkAccess(request = {}) {
    const { requesterId, requesterClientId, resourceOwnerId, resourceClientId } = request;

    // Cross-client resource access → always blocked
    if (requesterClientId && resourceClientId && requesterClientId !== resourceClientId) {
      return Object.freeze({
        result: ACCESS_RESULT.BLOCKED,
        reason: 'CROSS_CLIENT_IDOR',
        isReal: false,
      });
    }

    // Cross-owner resource access
    if (resourceOwnerId && requesterId && requesterId !== resourceOwnerId) {
      return Object.freeze({
        result: ACCESS_RESULT.DENIED,
        reason: 'NOT_RESOURCE_OWNER',
        isReal: false,
      });
    }

    return Object.freeze({ result: ACCESS_RESULT.ALLOWED, reason: 'OK', isReal: false });
  }

  return Object.freeze({ clientId, ownerId, checkAccess, isReal: false });
}

export function detectIDOR(requests = []) {
  const findings = requests.filter(r =>
    (r.requesterClientId && r.resourceClientId && r.requesterClientId !== r.resourceClientId) ||
    (r.requesterId && r.resourceOwnerId && r.requesterId !== r.resourceOwnerId)
  );
  return Object.freeze({
    totalRequests: requests.length,
    idorAttempts: findings.length,
    findings: Object.freeze(findings),
    isReal: false,
  });
}

export const OBJECT_ACCESS_CONTROL_VERSION = '1.0.0';
