// Security Headers Policy — ADV-19

export const HEADER_STATUS = Object.freeze({
  PRESENT:  'PRESENT',
  MISSING:  'MISSING',
  WEAK:     'WEAK',
  BLOCKED:  'BLOCKED',
});

const RECOMMENDED_HEADERS = [
  { name: 'Content-Security-Policy',        critical: true  },
  { name: 'Strict-Transport-Security',      critical: true  },
  { name: 'X-Content-Type-Options',         critical: true  },
  { name: 'Referrer-Policy',                critical: false },
  { name: 'Permissions-Policy',             critical: false },
  { name: 'X-Frame-Options',                critical: false },
  { name: 'Cross-Origin-Opener-Policy',     critical: false },
  { name: 'Cross-Origin-Resource-Policy',   critical: false },
];

export function createSecurityHeadersPolicy(config = {}) {
  const { presentHeaders = [], clientId = null } = config;

  const evaluation = RECOMMENDED_HEADERS.map(rec => {
    const found = presentHeaders.find(h =>
      (typeof h === 'string' ? h : h.name)
        .toLowerCase() === rec.name.toLowerCase()
    );
    const status = found ? HEADER_STATUS.PRESENT : HEADER_STATUS.MISSING;
    return Object.freeze({ ...rec, status, value: found?.value ?? null });
  });

  const missing = evaluation.filter(e => e.status === HEADER_STATUS.MISSING);
  const criticalMissing = missing.filter(e => e.critical);

  return Object.freeze({
    clientId,
    headers: Object.freeze(evaluation),
    missing: Object.freeze(missing.map(h => h.name)),
    criticalMissing: Object.freeze(criticalMissing.map(h => h.name)),
    score: Math.round((evaluation.filter(e => e.status === HEADER_STATUS.PRESENT).length / RECOMMENDED_HEADERS.length) * 100),
    compliant: criticalMissing.length === 0,
    isReal: false,
  });
}

export const SECURITY_HEADERS_VERSION = '1.0.0';
