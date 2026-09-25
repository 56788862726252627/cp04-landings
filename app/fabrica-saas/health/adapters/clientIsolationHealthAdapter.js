// Client Isolation Health Adapter — ADV-20 (connects ADV-19)
// Any isolation leak → CRITICAL/BLOCKED

import { HEALTH_STATUS, HEALTH_DIMENSION } from '../core/healthDimension.js';
import { createHealthSignal } from '../core/healthSignal.js';

export const ISOLATION_DOMAIN_HEALTH = Object.freeze({
  CRM:             'CRM',
  LEADS:           'LEADS',
  AGENTS:          'AGENTS',
  MEMORY:          'MEMORY',
  BACKUPS:         'BACKUPS',
  MCP:             'MCP',
  BUSINESS_TRUTH:  'BUSINESS_TRUTH',
  MEDIA:           'MEDIA',
  SOCIAL:          'SOCIAL',
  CONFIGURATION:   'CONFIGURATION',
});

export function createClientIsolationHealthAdapter(config = {}) {
  const {
    domainResults    = {},
    crossClientLeaks = 0,
    tenantContextValid = true,
    privilegeEscalations = 0,
    clientId         = null,
    environment      = 'LOCAL',
  } = config;

  const hasLeak = crossClientLeaks > 0;
  const hasEscalation = privilegeEscalations > 0;
  const allIsolated = Object.values(domainResults).every(r => r === true || r === 'ISOLATED');
  const anyFail = Object.values(domainResults).some(r => r === false || r === 'BREACH');

  let status, score;
  if (hasLeak || hasEscalation || !tenantContextValid) {
    status = HEALTH_STATUS.BLOCKED;
    score = 0;
  } else if (anyFail) {
    status = HEALTH_STATUS.CRITICAL;
    score = 10;
  } else if (!allIsolated && Object.keys(domainResults).length > 0) {
    status = HEALTH_STATUS.WARNING;
    score = 70;
  } else {
    status = HEALTH_STATUS.HEALTHY;
    score = 100;
  }

  const evidence = [];
  if (crossClientLeaks > 0)     evidence.push(`${crossClientLeaks} cross-client leaks`);
  if (privilegeEscalations > 0) evidence.push(`${privilegeEscalations} escalation attempts`);
  if (!tenantContextValid)       evidence.push('INVALID_TENANT_CONTEXT');

  const signal = createHealthSignal({
    dimension: HEALTH_DIMENSION.CLIENT_ISOLATION,
    status,
    score,
    source: 'ADV-19',
    clientId,
    environment,
    message: hasLeak ? `CRITICAL: ${crossClientLeaks} cross-client leaks detected` :
      hasEscalation ? 'Privilege escalation attempt blocked' : `Client isolation ${score}`,
    evidence,
    recommendedAction: hasLeak ? 'IMMEDIATE: Investigate and block cross-client data access' :
      hasEscalation ? 'Review privilege escalation event' : null,
  });

  return Object.freeze({
    crossClientLeaks,
    privilegeEscalations,
    tenantContextValid,
    allIsolated,
    domainResults: Object.freeze({ ...domainResults }),
    status,
    score,
    signal,
    adv19Connected: true,
    isReal: false,
  });
}

export const CLIENT_ISOLATION_HEALTH_ADAPTER_VERSION = '1.0.0';
