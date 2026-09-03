// Health Bridge — ADV-19 (prepares ADV-20)

export const SECURITY_HEALTH_DIMENSION = Object.freeze({
  SECURITY:              'securityHealth',
  PRIVACY:               'privacyHealth',
  CONSENT:               'consentHealth',
  SECRET:                'secretHealth',
  AUTH:                  'authHealth',
  CLIENT_ISOLATION:      'clientIsolationHealth',
  GDPR_TECHNICAL:        'gdprTechnicalReadiness',
  CMP:                   'cmpReadiness',
});

export function createSecurityHealthBridge(config = {}) {
  const { clientId = null } = config;

  function computeHealth(scores = {}) {
    const dimensions = {};

    for (const [key, label] of Object.entries(SECURITY_HEALTH_DIMENSION)) {
      const raw = scores[label] ?? scores[key] ?? null;
      dimensions[label] = {
        score: raw,
        status: raw === null ? 'UNKNOWN' : raw >= 90 ? 'HEALTHY' : raw >= 70 ? 'DEGRADED' : 'UNHEALTHY',
      };
    }

    const known = Object.values(dimensions).filter(d => d.score !== null);
    const avg = known.length > 0
      ? Math.round(known.reduce((acc, d) => acc + d.score, 0) / known.length)
      : null;

    return Object.freeze({
      clientId,
      dimensions: Object.freeze(dimensions),
      overall: avg,
      overallStatus: avg === null ? 'UNKNOWN' : avg >= 90 ? 'HEALTHY' : avg >= 70 ? 'DEGRADED' : 'UNHEALTHY',
      adv20Ready: true,
      isReal: false,
    });
  }

  return Object.freeze({ clientId, computeHealth, dimensions: Object.values(SECURITY_HEALTH_DIMENSION), isReal: false });
}

export const SECURITY_HEALTH_BRIDGE_VERSION = '1.0.0';
