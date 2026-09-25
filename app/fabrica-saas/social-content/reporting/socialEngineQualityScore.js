// Social Engine Quality Score — overall ADV-14 engine health score

export function computeSocialEngineQualityScore(metrics = {}) {
  const scores = {};

  scores.CLIENT_ISOLATION = metrics.clientIsolationTests
    ? (metrics.clientIsolationPassed / metrics.clientIsolationTests) * 100
    : 100;

  scores.ADS_SAFETY = metrics.adsBlocked === true ? 100 : 0;

  scores.CLAIM_SAFETY = metrics.claimViolations === 0 ? 100 : Math.max(0, 100 - metrics.claimViolations * 20);

  scores.PRIVACY = metrics.privacyViolations === 0 ? 100 : Math.max(0, 100 - metrics.privacyViolations * 25);

  scores.CONTENT_QUALITY = metrics.avgContentQuality ?? 75;

  scores.MAKE_SAFETY = metrics.realWebhookCalls === 0 ? 100 : 0;

  const overall = Math.round(Object.values(scores).reduce((sum, s) => sum + s, 0) / Object.keys(scores).length);

  const violations = [];
  if (scores.CLIENT_ISOLATION < 100) violations.push('CLIENT_ISOLATION_BREACH');
  if (scores.ADS_SAFETY < 100)       violations.push('ADS_SAFETY_BREACH');
  if (scores.MAKE_SAFETY < 100)      violations.push('REAL_WEBHOOK_DETECTED');

  return Object.freeze({
    overall,
    scores:          Object.freeze(scores),
    violations:      Object.freeze(violations),
    productionReady: overall >= 90 && violations.length === 0,
    isReal:          false,
  });
}
