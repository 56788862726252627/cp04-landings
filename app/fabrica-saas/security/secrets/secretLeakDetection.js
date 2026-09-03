// Secret Leak Detection — ADV-19 (extends ADV-02 CI/CD patterns)

const LEAK_PATTERNS = [
  { pattern: /api[_-]?key\s*[:=]\s*['"]?[A-Za-z0-9_-]{16,}/i, type: 'API_KEY' },
  { pattern: /ey[A-Za-z0-9._-]{30,}/,                          type: 'JWT_LIKE' },
  { pattern: /-----BEGIN .{0,20} PRIVATE KEY-----/,            type: 'PRIVATE_KEY' },
  { pattern: /oauth[_-]?token\s*[:=]\s*['"]?[A-Za-z0-9._-]{16,}/i, type: 'OAUTH_TOKEN' },
  { pattern: /postgres:\/\/[^@]+@[^/]+\/\w+/i,                type: 'DATABASE_URL' },
  { pattern: /mysql:\/\/[^@]+@[^/]+\/\w+/i,                   type: 'DATABASE_URL' },
  { pattern: /whsec_[A-Za-z0-9]{16,}/i,                       type: 'WEBHOOK_SECRET' },
  { pattern: /sk_(live|test)_[A-Za-z0-9]{20,}/i,              type: 'PAYMENT_SECRET' },
  { pattern: /secret\s*[:=]\s*['"]?[A-Za-z0-9_.-]{12,}/i,    type: 'GENERIC_SECRET' },
  { pattern: /password\s*[:=]\s*['"]?[^\s'"]{8,}/i,           type: 'PASSWORD' },
];

export function scanForLeaks(content = '') {
  const detected = [];

  for (const { pattern, type } of LEAK_PATTERNS) {
    if (pattern.test(content)) {
      detected.push(Object.freeze({ type, pattern: pattern.toString(), severity: 'CRITICAL' }));
    }
  }

  return Object.freeze({
    safe: detected.length === 0,
    detected: Object.freeze(detected),
    count: detected.length,
    isReal: false,
  });
}

export function scanItems(items = []) {
  const results = items.map((item, idx) => {
    const content = typeof item === 'string' ? item : JSON.stringify(item);
    return Object.freeze({ index: idx, ...scanForLeaks(content) });
  });

  const anyLeak = results.some(r => !r.safe);
  return Object.freeze({
    safe: !anyLeak,
    results: Object.freeze(results),
    totalLeaks: results.reduce((acc, r) => acc + r.count, 0),
    isReal: false,
  });
}

export const SECRET_LEAK_DETECTION_VERSION = '1.0.0';
