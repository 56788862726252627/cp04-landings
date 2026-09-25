// Social Automation Status — DRY_RUN only, never real Make execution

export const SOCIAL_AUTOMATION_STATUS = Object.freeze({
  READY:              'READY',
  WAITING_APPROVAL:   'WAITING_APPROVAL',
  WAITING_AUTH:       'WAITING_AUTH',
  READY_FOR_MAKE:     'READY_FOR_MAKE',
  BLOCKED:            'BLOCKED',
  FAILED:             'FAILED',
});

export function evaluateSocialAutomationStatus(config = {}) {
  if (config.noRealPublish === false) {
    return Object.freeze({
      status:  SOCIAL_AUTOMATION_STATUS.BLOCKED,
      reason:  'NO_REAL_SOCIAL_PUBLISH=SI — real publishing not allowed',
      isReal:  false,
    });
  }
  if (!config.approvedByHuman && config.requiresApproval) {
    return Object.freeze({
      status:  SOCIAL_AUTOMATION_STATUS.WAITING_APPROVAL,
      reason:  'Human approval required before Make bridge',
      isReal:  false,
    });
  }
  if (config.channelAuthStatus === 'NOT_CONNECTED' || config.channelAuthStatus === 'EXPIRED') {
    return Object.freeze({
      status:  SOCIAL_AUTOMATION_STATUS.WAITING_AUTH,
      reason:  'Channel auth required',
      isReal:  false,
    });
  }
  if (config.readyForDryRun === true) {
    return Object.freeze({
      status:  SOCIAL_AUTOMATION_STATUS.READY_FOR_MAKE,
      reason:  'DRY_RUN payload ready for Make review',
      isReal:  false,
    });
  }
  return Object.freeze({ status: SOCIAL_AUTOMATION_STATUS.READY, isReal: false });
}
