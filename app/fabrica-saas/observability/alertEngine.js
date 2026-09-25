// Alert Engine — ADV-01 Transversal Observability
// Declarative alert rules. Evaluates conditions, returns alert objects.
// NO real alerts sent. Adapter interface defined for future channels.

import { SEVERITY, EVENT_TYPE } from './eventModel.js';

export const ALERT_LEVEL = Object.freeze({
  NO_ALERT:       'NO_ALERT',
  WARNING:        'WARNING',
  ALERT:          'ALERT',
  CRITICAL_ALERT: 'CRITICAL_ALERT',
});

export const ALERT_CHANNEL = Object.freeze({
  EMAIL:    'EMAIL',
  TELEGRAM: 'TELEGRAM',
  SLACK:    'SLACK',
  WEBHOOK:  'WEBHOOK',
});

export const ALERT_RULE_ID = Object.freeze({
  CRITICAL_EVENT:            'CRITICAL_EVENT',
  ERROR_BURST:               'ERROR_BURST',
  HIGH_ERROR_RATE:           'HIGH_ERROR_RATE',
  REPEATED_TIMEOUT:          'REPEATED_TIMEOUT',
  RATE_LIMIT_BURST:          'RATE_LIMIT_BURST',
  EXTERNAL_SERVICE_OUTAGE:   'EXTERNAL_SERVICE_OUTAGE',
  SECURITY_EVENT:            'SECURITY_EVENT',
  DEPLOYMENT_FAILURE:        'DEPLOYMENT_FAILURE',
  RUNTIME_BLANK_SCREEN:      'RUNTIME_BLANK_SCREEN',
  AUTOMATION_REPEATED_FAIL:  'AUTOMATION_REPEATED_FAIL',
});

export const DEFAULT_ALERT_RULES = Object.freeze([
  {
    id:          ALERT_RULE_ID.CRITICAL_EVENT,
    description: 'Any CRITICAL severity event → CRITICAL_ALERT',
    level:       ALERT_LEVEL.CRITICAL_ALERT,
    evaluate:    (events) =>
      events.some(e => e.severity === SEVERITY.CRITICAL),
  },
  {
    id:          ALERT_RULE_ID.ERROR_BURST,
    description: '5+ ERROR events in the window → ALERT',
    level:       ALERT_LEVEL.ALERT,
    evaluate:    (events) =>
      events.filter(e => e.severity === SEVERITY.ERROR || e.severity === SEVERITY.CRITICAL).length >= 5,
  },
  {
    id:          ALERT_RULE_ID.HIGH_ERROR_RATE,
    description: 'Error rate >20% → ALERT',
    level:       ALERT_LEVEL.ALERT,
    evaluate:    (_events, metrics) =>
      metrics?.errorRate !== null && metrics.errorRate > 0.20,
  },
  {
    id:          ALERT_RULE_ID.REPEATED_TIMEOUT,
    description: '3+ timeout errors → WARNING',
    level:       ALERT_LEVEL.WARNING,
    evaluate:    (events) =>
      events.filter(e => e.errorCategory === 'TIMEOUT').length >= 3,
  },
  {
    id:          ALERT_RULE_ID.RATE_LIMIT_BURST,
    description: '3+ rate limit errors → WARNING',
    level:       ALERT_LEVEL.WARNING,
    evaluate:    (events) =>
      events.filter(e => e.errorCategory === 'RATE_LIMIT').length >= 3,
  },
  {
    id:          ALERT_RULE_ID.EXTERNAL_SERVICE_OUTAGE,
    description: '5+ EXTERNAL_API errors → CRITICAL_ALERT',
    level:       ALERT_LEVEL.CRITICAL_ALERT,
    evaluate:    (events) =>
      events.filter(e => e.errorCategory === 'EXTERNAL_API').length >= 5,
  },
  {
    id:          ALERT_RULE_ID.SECURITY_EVENT,
    description: 'Any SECURITY event type → CRITICAL_ALERT',
    level:       ALERT_LEVEL.CRITICAL_ALERT,
    evaluate:    (events) =>
      events.some(e => e.eventType === EVENT_TYPE.SECURITY),
  },
  {
    id:          ALERT_RULE_ID.DEPLOYMENT_FAILURE,
    description: 'DEPLOY event with FAILURE status → ALERT',
    level:       ALERT_LEVEL.ALERT,
    evaluate:    (events) =>
      events.some(e => e.eventType === EVENT_TYPE.DEPLOY && e.status === 'FAILURE'),
  },
  {
    id:          ALERT_RULE_ID.RUNTIME_BLANK_SCREEN,
    description: 'RUNTIME_BLANK_SCREEN error in metadata → CRITICAL_ALERT',
    level:       ALERT_LEVEL.CRITICAL_ALERT,
    evaluate:    (events) =>
      events.some(e => e.metadata?.errorType === 'RUNTIME_BLANK_SCREEN' || e.message?.includes('blank screen')),
  },
  {
    id:          ALERT_RULE_ID.AUTOMATION_REPEATED_FAIL,
    description: '3+ automation failures → ALERT',
    level:       ALERT_LEVEL.ALERT,
    evaluate:    (events) =>
      events.filter(e => e.eventType === EVENT_TYPE.AUTOMATION && e.status === 'FAILURE').length >= 3,
  },
]);

const ALERT_LEVEL_ORDER = [ALERT_LEVEL.NO_ALERT, ALERT_LEVEL.WARNING, ALERT_LEVEL.ALERT, ALERT_LEVEL.CRITICAL_ALERT];

/**
 * Evaluate alert rules against a set of events and metrics.
 * Returns triggered alerts and the overall alert level.
 * Does NOT send any real alerts.
 */
export function evaluateAlerts(events = [], metrics = {}, rules = DEFAULT_ALERT_RULES) {
  if (!Array.isArray(events)) return { valid: false, error: 'events must be array' };

  const triggered = [];
  let maxLevel = ALERT_LEVEL.NO_ALERT;

  for (const rule of rules) {
    let matched = false;
    try {
      matched = rule.evaluate(events, metrics);
    } catch {
      // keep matched = false on rule evaluation error
    }

    if (matched) {
      triggered.push({
        ruleId:      rule.id,
        level:       rule.level,
        description: rule.description,
        triggeredAt: new Date().toISOString(),
      });
      if (ALERT_LEVEL_ORDER.indexOf(rule.level) > ALERT_LEVEL_ORDER.indexOf(maxLevel)) {
        maxLevel = rule.level;
      }
    }
  }

  return {
    valid:          true,
    overallLevel:   maxLevel,
    triggered,
    triggeredCount: triggered.length,
    hasAlerts:      maxLevel !== ALERT_LEVEL.NO_ALERT,
    hasCritical:    maxLevel === ALERT_LEVEL.CRITICAL_ALERT,
    adapterNote:    'NO_REAL_ALERTS_SENT. Implement AlertChannelAdapter to dispatch.',
  };
}

/**
 * Interface for future alert channel adapters.
 * Implementation must honor the NO_REAL_EXTERNAL_ALERTS guardrail.
 */
export function createAlertChannelAdapter(channel, options = {}) {
  const SUPPORTED = Object.values(ALERT_CHANNEL);
  if (!SUPPORTED.includes(channel)) {
    return { valid: false, error: `channel must be one of: ${SUPPORTED.join(', ')}` };
  }

  return {
    valid:   true,
    channel,
    enabled: options.enabled ?? false,

    async dispatch() {
      if (!this.enabled) return { sent: false, reason: 'adapter_disabled' };
      // Future: call email/Telegram/Slack/webhook endpoint
      return { sent: false, reason: 'not_implemented' };
    },
  };
}

export const ALERT_ENGINE_VERSION = '1.0.0';
