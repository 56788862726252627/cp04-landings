// Security Client Isolation Evaluator — ADV-19

export const ISOLATION_DOMAIN = Object.freeze({
  DATA:           'DATA',
  MEMORY:         'MEMORY',
  CRM:            'CRM',
  LEADS:          'LEADS',
  BACKUP:         'BACKUP',
  MEDIA:          'MEDIA',
  SOCIAL:         'SOCIAL',
  AGENT_CONTEXT:  'AGENT_CONTEXT',
  MCP:            'MCP',
  CONFIGURATION:  'CONFIGURATION',
});

export function createSecurityClientIsolationEvaluator(config = {}) {
  const { clientId = null, enforcedDomains = Object.values(ISOLATION_DOMAIN) } = config;

  function evaluate(request = {}) {
    const { requestClientId, resourceClientId, domain } = request;

    if (!requestClientId || !resourceClientId) {
      return Object.freeze({
        isolated: false,
        blocked: true,
        reason: 'MISSING_CLIENT_CONTEXT',
        domain,
        isReal: false,
      });
    }

    if (requestClientId !== resourceClientId) {
      return Object.freeze({
        isolated: false,
        blocked: true,
        reason: 'CROSS_CLIENT_ACCESS_BLOCKED',
        domain,
        requestClientId,
        resourceClientId,
        isReal: false,
      });
    }

    if (domain && !enforcedDomains.includes(domain)) {
      return Object.freeze({
        isolated: true,
        blocked: false,
        reason: 'DOMAIN_NOT_ENFORCED',
        domain,
        isReal: false,
      });
    }

    return Object.freeze({ isolated: true, blocked: false, reason: 'OK', domain, isReal: false });
  }

  function batchEvaluate(requests = []) {
    const results = requests.map(r => evaluate(r));
    const blocked = results.filter(r => r.blocked);
    return Object.freeze({
      total: results.length,
      blocked: blocked.length,
      results: Object.freeze(results),
      allIsolated: blocked.length === 0,
      isReal: false,
    });
  }

  return Object.freeze({ clientId, enforcedDomains: Object.freeze([...enforcedDomains]), evaluate, batchEvaluate, isReal: false });
}

export const CLIENT_ISOLATION_VERSION = '1.0.0';
