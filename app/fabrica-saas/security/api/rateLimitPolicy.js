// Rate Limit Policy — ADV-19

export const RATE_LIMIT_SCOPE = Object.freeze({
  IP:       'IP',
  USER:     'USER',
  CLIENT:   'CLIENT',
  ENDPOINT: 'ENDPOINT',
  RISK:     'RISK',
});

export function createRateLimitPolicy(config = {}) {
  const {
    scopes = [RATE_LIMIT_SCOPE.USER, RATE_LIMIT_SCOPE.IP],
    limits = {},
    burstAllowed = false,
    riskBasedEscalation = true,
    clientId = null,
  } = config;

  const defaultLimits = {
    [RATE_LIMIT_SCOPE.IP]:       { requestsPerMinute: 60,  windowMs: 60000 },
    [RATE_LIMIT_SCOPE.USER]:     { requestsPerMinute: 120, windowMs: 60000 },
    [RATE_LIMIT_SCOPE.CLIENT]:   { requestsPerMinute: 300, windowMs: 60000 },
    [RATE_LIMIT_SCOPE.ENDPOINT]: { requestsPerMinute: 30,  windowMs: 60000 },
    [RATE_LIMIT_SCOPE.RISK]:     { requestsPerMinute: 10,  windowMs: 60000 },
  };

  const effectiveLimits = {};
  for (const scope of scopes) {
    effectiveLimits[scope] = limits[scope] ?? defaultLimits[scope];
  }

  return Object.freeze({
    clientId,
    scopes: Object.freeze([...scopes]),
    limits: Object.freeze(effectiveLimits),
    burstAllowed,
    riskBasedEscalation,
    realInfraNotDeployed: true,
    isReal: false,
  });
}

export const RATE_LIMIT_VERSION = '1.0.0';
