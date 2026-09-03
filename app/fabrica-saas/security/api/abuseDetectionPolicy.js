// Abuse Detection Policy — ADV-19

export const ABUSE_PATTERN = Object.freeze({
  BRUTE_FORCE:         'BRUTE_FORCE',
  CREDENTIAL_STUFFING: 'CREDENTIAL_STUFFING',
  SPAM:                'SPAM',
  SCRAPING:            'SCRAPING',
  AGENT_ABUSE:         'AGENT_ABUSE',
  TOOL_ABUSE:          'TOOL_ABUSE',
  AUTOMATION_ABUSE:    'AUTOMATION_ABUSE',
});

export const ABUSE_ACTION = Object.freeze({
  ALLOW:       'ALLOW',
  WARN:        'WARN',
  THROTTLE:    'THROTTLE',
  BLOCK:       'BLOCK',
  ESCALATE:    'ESCALATE',
});

export function createAbuseDetectionPolicy(config = {}) {
  const {
    patterns = Object.values(ABUSE_PATTERN),
    thresholds = {},
    clientId = null,
  } = config;

  const defaultThresholds = {
    [ABUSE_PATTERN.BRUTE_FORCE]:         { count: 5,   windowMs: 60000, action: ABUSE_ACTION.BLOCK },
    [ABUSE_PATTERN.CREDENTIAL_STUFFING]: { count: 10,  windowMs: 60000, action: ABUSE_ACTION.BLOCK },
    [ABUSE_PATTERN.SPAM]:                { count: 20,  windowMs: 60000, action: ABUSE_ACTION.THROTTLE },
    [ABUSE_PATTERN.SCRAPING]:            { count: 100, windowMs: 60000, action: ABUSE_ACTION.THROTTLE },
    [ABUSE_PATTERN.AGENT_ABUSE]:         { count: 50,  windowMs: 60000, action: ABUSE_ACTION.ESCALATE },
    [ABUSE_PATTERN.TOOL_ABUSE]:          { count: 30,  windowMs: 60000, action: ABUSE_ACTION.BLOCK },
    [ABUSE_PATTERN.AUTOMATION_ABUSE]:    { count: 200, windowMs: 60000, action: ABUSE_ACTION.WARN },
  };

  const effectiveThresholds = {};
  for (const pattern of patterns) {
    effectiveThresholds[pattern] = thresholds[pattern] ?? defaultThresholds[pattern];
  }

  function detect(signal = {}) {
    const { pattern, count = 0 } = signal;
    const threshold = effectiveThresholds[pattern];
    if (!threshold) return Object.freeze({ action: ABUSE_ACTION.ALLOW, reason: 'UNKNOWN_PATTERN', isReal: false });

    const action = count >= threshold.count ? threshold.action : ABUSE_ACTION.ALLOW;
    return Object.freeze({ action, pattern, count, threshold: threshold.count, isReal: false });
  }

  return Object.freeze({
    clientId,
    patterns: Object.freeze([...patterns]),
    thresholds: Object.freeze(effectiveThresholds),
    detect,
    isReal: false,
  });
}

export const ABUSE_DETECTION_VERSION = '1.0.0';
