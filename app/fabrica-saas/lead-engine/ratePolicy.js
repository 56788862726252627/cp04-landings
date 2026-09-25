// Lead Discovery Rate Policy — ADV-08

export function createLeadDiscoveryRatePolicy(options = {}) {
  return Object.freeze({
    requestsPerMinute:    options.requestsPerMinute ?? 10,
    burstLimit:           options.burstLimit        ?? 20,
    cooldownAfterBurstMs: options.cooldownAfterBurstMs ?? 60000,
    maxConcurrentRuns:    options.maxConcurrentRuns ?? 1,
    respectRobotsTxt:     options.respectRobotsTxt  ?? true,
    backoffOnError:       options.backoffOnError     ?? true,
    prohibit: Object.freeze([
      'aggressive_scraping',
      'provider_abuse',
      'rapid_repeated_runs',
      'captcha_bypass',
      'rate_limit_evasion',
    ]),
    isReal: false,
  });
}

export function checkRateAllowed(lastRunAt = null, policy = {}) {
  if (!lastRunAt) return Object.freeze({ allowed: true, waitMs: 0, isReal: false });
  const elapsedMs = Date.now() - new Date(lastRunAt).getTime();
  const minIntervalMs = (60000 / (policy.requestsPerMinute ?? 10));
  const waitMs = Math.max(0, minIntervalMs - elapsedMs);
  return Object.freeze({ allowed: waitMs === 0, waitMs, isReal: false });
}

export const RATE_POLICY_VERSION = '1.0.0';
