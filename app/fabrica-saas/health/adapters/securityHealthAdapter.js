// Security Health Adapter — ADV-20 (connects ADV-19)

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export function createSecurityHealthAdapter(config = {}) {
  const {
    securityQualityScore    = null,
    secretLeak              = false,
    crossClientAccess       = false,
    injectionDetected       = false,
    privilegeEscalation     = false,
    authViolations          = [],
    dependencyVulnerability = false,
    incidentReadiness       = true,
    clientId                = null,
    environment             = 'LOCAL',
  } = config;

  const criticalBlocker = secretLeak || crossClientAccess || privilegeEscalation;
  const hasInjection = injectionDetected;
  const score = securityQualityScore !== null ? securityQualityScore :
    criticalBlocker ? 0 : hasInjection ? 30 : authViolations.length > 0 ? 60 : 95;

  let status;
  if (criticalBlocker)                         status = HEALTH_STATUS.BLOCKED;
  else if (hasInjection || !incidentReadiness) status = HEALTH_STATUS.CRITICAL;
  else if (authViolations.length > 0 || dependencyVulnerability) status = HEALTH_STATUS.WARNING;
  else if (score === null)                     status = HEALTH_STATUS.UNKNOWN;
  else                                         status = HEALTH_STATUS.HEALTHY;

  const blockers = [];
  if (secretLeak)          blockers.push('SECRET_LEAK');
  if (crossClientAccess)   blockers.push('CROSS_CLIENT_ACCESS');
  if (privilegeEscalation) blockers.push('PRIVILEGE_ESCALATION');

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.SECURITY,
    status,
    score,
    source: 'ADV-19',
    clientId,
    environment,
    message: blockers.length > 0 ? `Security blocked: ${blockers[0]}` : `Security score ${score}`,
    evidence: blockers,
    recommendedAction: blockers[0] ? `Resolve ${blockers[0]} immediately` : null,
  });

  return Object.freeze({
    securityQualityScore: score,
    secretSafe: !secretLeak,
    clientIsolated: !crossClientAccess,
    injectionSafe: !hasInjection,
    escalationSafe: !privilegeEscalation,
    blockers: Object.freeze([...blockers]),
    status,
    score,
    signal,
    adv19Connected: true,
    isReal: false,
  });
}

export const SECURITY_HEALTH_ADAPTER_VERSION = '1.0.0';
