// Service Offboarding — PASO F
// Structured handoff and termination of a maintenance service.

export const OFFBOARDING_STATUS = Object.freeze({
  INITIATED:   'INITIATED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING_CLIENT: 'PENDING_CLIENT',
  COMPLETED:   'COMPLETED',
  CANCELLED:   'CANCELLED',
});

const OFFBOARDING_CHECKLIST = [
  { id: 'OFF-01', step: 'Open tickets resolved or handed over',    critical: true },
  { id: 'OFF-02', step: 'Documentation package delivered to client', critical: true },
  { id: 'OFF-03', step: 'Client credentials transferred',           critical: true },
  { id: 'OFF-04', step: 'Agency access revoked from client systems', critical: true },
  { id: 'OFF-05', step: 'Data export provided (if applicable)',      critical: false },
  { id: 'OFF-06', step: 'Final backup delivered',                   critical: false },
  { id: 'OFF-07', step: 'Final maintenance report issued',          critical: true },
  { id: 'OFF-08', step: 'Client NPS/feedback collected',            critical: false },
  { id: 'OFF-09', step: 'Invoicing closed',                         critical: true },
  { id: 'OFF-10', step: 'Internal knowledge base updated',          critical: false },
];

/**
 * Initiate a service offboarding process.
 */
export function initiateOffboarding(params = {}) {
  const errors = [];

  if (!params.clientId)      errors.push('clientId required');
  if (!params.serviceId)     errors.push('serviceId required');
  if (!params.requestedBy)   errors.push('requestedBy required');

  if (errors.length > 0) return { valid: false, errors, offboarding: null };

  const now = new Date().toISOString();

  const offboarding = {
    id:          params.id ?? `OFF-${params.clientId}-${Date.now()}`,
    clientId:    params.clientId,
    serviceId:   params.serviceId,
    requestedBy: params.requestedBy,
    reason:      params.reason ?? 'Client request',
    status:      OFFBOARDING_STATUS.INITIATED,
    initiatedAt: now,
    targetDate:  params.targetDate ?? null,
    completedAt: null,

    checklist: OFFBOARDING_CHECKLIST.map(item => ({
      ...item,
      done:       false,
      completedAt: null,
      completedBy: null,
    })),

    notes:       params.notes ?? [],
    timeline: [{
      timestamp: now,
      action:    'OFFBOARDING_INITIATED',
      by:        params.requestedBy,
      note:      `Offboarding initiated. Reason: ${params.reason ?? 'Client request'}`,
    }],
    disclaimer: 'Offboarding record is operational documentation. Not a legal contract.',
  };

  return { valid: true, errors: [], offboarding };
}

/**
 * Mark an offboarding checklist item as complete.
 */
export function completeOffboardingStep(offboarding, stepId, completedBy) {
  if (!offboarding) return { valid: false, error: 'offboarding required' };

  const idx = offboarding.checklist.findIndex(s => s.id === stepId);
  if (idx === -1) return { valid: false, error: `step ${stepId} not found` };

  const now = new Date().toISOString();
  const updatedChecklist = [...offboarding.checklist];
  updatedChecklist[idx] = {
    ...updatedChecklist[idx],
    done:        true,
    completedAt: now,
    completedBy,
  };

  const allDone = updatedChecklist.every(s => s.done);
  const criticalDone = updatedChecklist.filter(s => s.critical).every(s => s.done);

  const status = allDone ? OFFBOARDING_STATUS.COMPLETED
    : criticalDone       ? OFFBOARDING_STATUS.IN_PROGRESS
    : OFFBOARDING_STATUS.IN_PROGRESS;

  return {
    valid: true,
    offboarding: {
      ...offboarding,
      checklist:   updatedChecklist,
      status,
      completedAt: allDone ? now : null,
      timeline: [...offboarding.timeline, {
        timestamp: now,
        action:    `STEP_COMPLETED: ${stepId}`,
        by:        completedBy,
      }],
    },
  };
}

/**
 * Finalize and close the maintenance service.
 * All critical steps must be done.
 */
export function endMaintenanceService(offboarding, closedBy) {
  if (!offboarding) return { valid: false, error: 'offboarding required' };

  const criticalPending = offboarding.checklist.filter(s => s.critical && !s.done);
  if (criticalPending.length > 0) {
    return {
      valid:           false,
      error:           'Cannot close — critical offboarding steps pending',
      pendingStepIds:  criticalPending.map(s => s.id),
    };
  }

  const now = new Date().toISOString();
  return {
    valid: true,
    offboarding: {
      ...offboarding,
      status:      OFFBOARDING_STATUS.COMPLETED,
      completedAt: now,
      timeline: [...offboarding.timeline, {
        timestamp: now,
        action:    'SERVICE_CLOSED',
        by:        closedBy,
        note:      'Maintenance service formally closed.',
      }],
    },
    summary: {
      clientId:    offboarding.clientId,
      serviceId:   offboarding.serviceId,
      closedAt:    now,
      stepsTotal:  offboarding.checklist.length,
      stepsDone:   offboarding.checklist.filter(s => s.done).length,
      disclaimer:  'Service closure is an operational record, not a legal termination.',
    },
  };
}

export const SERVICE_OFFBOARDING_VERSION = '1.0.0';
