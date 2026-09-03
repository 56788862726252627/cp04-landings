// Incident Bridge — ADV-20 (connects ADV-01 + ADV-19, no real incident)

import { HEALTH_STATUS } from '../core/healthDimension.js';

export const INCIDENT_FOUNDATION_STATUS = Object.freeze({
  NO_INCIDENT:   'NO_INCIDENT',
  POTENTIAL:     'POTENTIAL',
  OPEN_SIMULATED:'OPEN_SIMULATED',
});

export function createIncidentBridge(config = {}) {
  const { clientId = null } = config;
  const _log = [];

  function evaluate(snapshot) {
    if (!snapshot) return Object.freeze({ status: INCIDENT_FOUNDATION_STATUS.NO_INCIDENT, isReal: false });

    const hasCritical = snapshot.criticalIssues && snapshot.criticalIssues.length > 0;
    const hasBlocked  = snapshot.overallStatus === HEALTH_STATUS.BLOCKED;

    if (hasBlocked || (hasCritical && snapshot.criticalIssues.some(i => i.status === HEALTH_STATUS.CRITICAL))) {
      const entry = Object.freeze({
        status: INCIDENT_FOUNDATION_STATUS.POTENTIAL,
        triggered: new Date().toISOString(),
        issues: snapshot.criticalIssues,
        noRealIncident: true,
        isReal: false,
      });
      _log.push(entry);
      return entry;
    }

    return Object.freeze({ status: INCIDENT_FOUNDATION_STATUS.NO_INCIDENT, isReal: false });
  }

  return Object.freeze({
    clientId,
    evaluate,
    getLog: () => Object.freeze([..._log]),
    adv01Connected: true,
    adv19Connected: true,
    noRealIncident: true,
    isReal: false,
  });
}

export const INCIDENT_BRIDGE_VERSION = '1.0.0';
