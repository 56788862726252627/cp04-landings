// Health Alert Policy — ADV-20 (avoids alert fatigue)

import { ALERT_SEVERITY, ALERT_TYPE } from './healthAlert.js';

const ALERT_THRESHOLDS = {
  [ALERT_TYPE.CRITICAL_FAILURE]:  { minSeverity: ALERT_SEVERITY.CRITICAL, cooldownMs: 0 },
  [ALERT_TYPE.SECURITY]:          { minSeverity: ALERT_SEVERITY.CRITICAL, cooldownMs: 0 },
  [ALERT_TYPE.CLIENT_ISOLATION]:  { minSeverity: ALERT_SEVERITY.CRITICAL, cooldownMs: 0 },
  [ALERT_TYPE.PRIVACY]:           { minSeverity: ALERT_SEVERITY.CRITICAL, cooldownMs: 5 * 60 * 1000 },
  [ALERT_TYPE.BACKUP]:            { minSeverity: ALERT_SEVERITY.WARNING, cooldownMs: 60 * 60 * 1000 },
  [ALERT_TYPE.DEPLOYMENT]:        { minSeverity: ALERT_SEVERITY.WARNING, cooldownMs: 30 * 60 * 1000 },
  [ALERT_TYPE.AI]:                { minSeverity: ALERT_SEVERITY.WARNING, cooldownMs: 15 * 60 * 1000 },
  [ALERT_TYPE.QUALITY]:           { minSeverity: ALERT_SEVERITY.WARNING, cooldownMs: 60 * 60 * 1000 },
  [ALERT_TYPE.UNKNOWN_CRITICAL]:  { minSeverity: ALERT_SEVERITY.WARNING, cooldownMs: 30 * 60 * 1000 },
};

export function createHealthAlertPolicy(config = {}) {
  const { suppressInfo = true, suppressDuplicatesMs = 15 * 60 * 1000 } = config;

  function shouldAlert(alert, lastAlertTimestamps = {}) {
    if (suppressInfo && alert.severity === ALERT_SEVERITY.INFO) {
      return Object.freeze({ should: false, reason: 'INFO_SUPPRESSED', isReal: false });
    }

    const threshold = ALERT_THRESHOLDS[alert.type];
    if (threshold) {
      const severityRank = { INFO: 0, WARNING: 1, CRITICAL: 2 };
      if ((severityRank[alert.severity] ?? 0) < (severityRank[threshold.minSeverity] ?? 0)) {
        return Object.freeze({ should: false, reason: 'BELOW_SEVERITY_THRESHOLD', isReal: false });
      }

      const lastTs = lastAlertTimestamps[alert.dedupKey];
      if (lastTs && (Date.now() - lastTs) < threshold.cooldownMs) {
        return Object.freeze({ should: false, reason: 'IN_COOLDOWN', isReal: false });
      }
    }

    return Object.freeze({ should: true, reason: 'ALERT_POLICY_PASS', isReal: false });
  }

  function getCooldown(alertType) {
    return ALERT_THRESHOLDS[alertType]?.cooldownMs ?? suppressDuplicatesMs;
  }

  return Object.freeze({
    suppressInfo,
    suppressDuplicatesMs,
    shouldAlert,
    getCooldown,
    noRealAlertSend: true,
    isReal: false,
  });
}

export const HEALTH_ALERT_POLICY_VERSION = '1.0.0';
