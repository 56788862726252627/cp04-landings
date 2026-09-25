// MCP Rate Limit Policy — ADV-12

export function createRateLimitPolicy(config = {}) {
  const limitPerMinute = config.limitPerMinute ?? 60;
  const limitPerHour   = config.limitPerHour   ?? 500;
  const _counts = { minute: 0, hour: 0, minuteStart: Date.now(), hourStart: Date.now() };

  function tick() {
    const now = Date.now();
    if (now - _counts.minuteStart >= 60000) { _counts.minute = 0; _counts.minuteStart = now; }
    if (now - _counts.hourStart   >= 3600000) { _counts.hour   = 0; _counts.hourStart   = now; }
  }

  function canProceed() {
    tick();
    return _counts.minute < limitPerMinute && _counts.hour < limitPerHour;
  }

  function record() {
    tick();
    _counts.minute++;
    _counts.hour++;
  }

  return Object.freeze({
    canProceed,
    record,
    getStats: () => Object.freeze({ minute: _counts.minute, hour: _counts.hour, limitPerMinute, limitPerHour, isReal: false }),
    isReal: false,
  });
}

export const MCP_RATE_LIMIT_POLICY_VERSION = '1.0.0';
