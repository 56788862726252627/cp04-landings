// MCP Client Isolation Policy — ADV-12

export const ISOLATION_VIOLATION = 'CLIENT_ISOLATION_VIOLATION';

export function checkClientIsolation(requestClientId, resourceClientId) {
  if (!requestClientId) throw new Error('checkClientIsolation: requestClientId required');
  if (!resourceClientId || resourceClientId === 'global') {
    return Object.freeze({ allowed: true, reason: 'global_resource', isReal: false });
  }
  if (requestClientId === resourceClientId) {
    return Object.freeze({ allowed: true, reason: 'same_client', isReal: false });
  }
  return Object.freeze({ allowed: false, reason: ISOLATION_VIOLATION, requestClientId, resourceClientId, isReal: false });
}

export function assertClientIsolation(requestClientId, resourceClientId) {
  const check = checkClientIsolation(requestClientId, resourceClientId);
  if (!check.allowed) throw new Error(`${ISOLATION_VIOLATION}: client "${requestClientId}" cannot access resource of client "${resourceClientId}"`);
  return true;
}

export const MCP_CLIENT_ISOLATION_POLICY_VERSION = '1.0.0';
