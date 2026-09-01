// Manual Action Model — ADV-04
// ManualProductionAction: what a human must do before pipeline can continue.

export const MANUAL_ACTION_TYPE = Object.freeze({
  OAUTH:               'OAUTH',
  MFA:                 'MFA',
  API_KEY:             'API_KEY',
  DOMAIN:              'DOMAIN',
  DNS:                 'DNS',
  BILLING:             'BILLING',
  LEGAL_APPROVAL:      'LEGAL_APPROVAL',
  WHATSAPP_TEMPLATE:   'WHATSAPP_TEMPLATE',
  APPROVAL:            'APPROVAL',
  EXTERNAL_PERMISSION: 'EXTERNAL_PERMISSION',
});

export const MANUAL_ACTION_STATUS = Object.freeze({
  PENDING:   'PENDING',
  COMPLETED: 'COMPLETED',
  DEFERRED:  'DEFERRED',
  BLOCKED:   'BLOCKED',
});

/**
 * Create a ManualProductionAction.
 * Never contains secret values — only instructions and type.
 */
export function createManualAction(params = {}) {
  if (!params.type)        return { valid: false, error: 'type required' };
  if (!params.provider)    return { valid: false, error: 'provider required' };
  if (!params.reason)      return { valid: false, error: 'reason required' };
  if (!params.instructions) return { valid: false, error: 'instructions required' };

  if (!Object.values(MANUAL_ACTION_TYPE).includes(params.type)) {
    return { valid: false, error: `Unknown action type: ${params.type}` };
  }

  return Object.freeze({
    valid:        true,
    id:           `MA-${params.type}-${params.provider}-${Date.now()}`,
    type:         params.type,
    provider:     params.provider,
    reason:       params.reason,
    instructions: params.instructions,
    blocking:     params.blocking ?? true,
    status:       MANUAL_ACTION_STATUS.PENDING,
    completed:    false,
    completedAt:  null,
    isReal:       false,
  });
}

export function completeManualAction(action) {
  if (!action || !action.valid) return { valid: false, error: 'invalid action' };
  return Object.freeze({
    ...action,
    status:      MANUAL_ACTION_STATUS.COMPLETED,
    completed:   true,
    completedAt: new Date().toISOString(),
  });
}

export function listPendingActions(actions = []) {
  return actions.filter(a => !a.completed && a.blocking);
}

export function hasBlockingActions(actions = []) {
  return listPendingActions(actions).length > 0;
}

export const MANUAL_ACTION_MODEL_VERSION = '1.0.0';
