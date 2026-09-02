// Observability Bridge — CRM ↔ ADV-01 Observability (PII-sanitized)

export const CRM_EVENT_TYPE = Object.freeze({
  LEAD_IMPORTED:      'crm.lead_imported',
  STAGE_TRANSITION:   'crm.stage_transition',
  TASK_CREATED:       'crm.task_created',
  TASK_COMPLETED:     'crm.task_completed',
  PROPOSAL_GENERATED: 'crm.proposal_generated',
  DEAL_CLOSED:        'crm.deal_closed',
  HEALTH_CHECK:       'crm.health_check',
});

function sanitizePII(payload = {}) {
  const sanitized = { ...payload };
  // Strip any personal contact data — only business identifiers allowed
  delete sanitized.contactEmail;
  delete sanitized.contactPhone;
  delete sanitized.contactName;
  delete sanitized.publicEmail;
  delete sanitized.publicPhone;
  return Object.freeze(sanitized);
}

export function createCRMObservabilityEvent(eventType = '', payload = {}, meta = {}) {
  return Object.freeze({
    eventType,
    correlationId: meta.correlationId ?? `crm_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    payload:       sanitizePII(payload),
    service:       'agency-crm',
    version:       '1.0.0',
    timestamp:     new Date().toISOString(),
    note:          'PII sanitized before emission. No personal data in observability events.',
    isReal: false,
  });
}

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
