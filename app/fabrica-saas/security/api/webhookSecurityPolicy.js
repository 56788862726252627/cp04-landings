// Webhook Security Policy — ADV-19

export function createWebhookSecurityPolicy(config = {}) {
  const {
    signatureVerification = true,
    timestampFreshness = true,
    maxTimestampAgeMs = 300000,
    replayPrevention = true,
    secretReference = null,
    idempotencyKey = null,
    clientId = null,
  } = config;

  const violations = [];
  if (!signatureVerification) violations.push('SIGNATURE_VERIFICATION_DISABLED');
  if (!timestampFreshness)    violations.push('TIMESTAMP_FRESHNESS_NOT_CHECKED');
  if (!replayPrevention)      violations.push('REPLAY_PREVENTION_DISABLED');
  if (!secretReference)       violations.push('NO_WEBHOOK_SECRET_REFERENCE');

  function validatePayload(payload = {}) {
    const findings = [];
    const { timestamp, signature, idempotencyId } = payload;

    if (signatureVerification && !signature) {
      findings.push('MISSING_SIGNATURE');
    }

    if (timestampFreshness && timestamp) {
      const age = Date.now() - new Date(timestamp).getTime();
      if (age > maxTimestampAgeMs) {
        findings.push('TIMESTAMP_TOO_OLD');
      }
    }

    if (replayPrevention && !idempotencyId) {
      findings.push('MISSING_IDEMPOTENCY_ID');
    }

    return Object.freeze({ valid: findings.length === 0, findings: Object.freeze(findings), isReal: false });
  }

  return Object.freeze({
    clientId,
    signatureVerification,
    timestampFreshness,
    maxTimestampAgeMs,
    replayPrevention,
    secretReference,
    idempotencyKey,
    violations: Object.freeze([...violations]),
    compliant: violations.length === 0,
    validatePayload,
    realWebhookNotTouched: true,
    isReal: false,
  });
}

export const WEBHOOK_SECURITY_VERSION = '1.0.0';
