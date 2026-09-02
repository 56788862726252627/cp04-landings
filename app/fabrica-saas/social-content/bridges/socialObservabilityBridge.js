// Social Observability Bridge — ADV-01 connection, 8 event types

export const SOCIAL_OBS_EVENT = Object.freeze({
  CONTENT_GENERATED:     'social.content.generated',
  CONTENT_APPROVED:      'social.content.approved',
  CONTENT_BLOCKED:       'social.content.blocked',
  CAMPAIGN_PLANNED:      'social.campaign.planned',
  QUALITY_GATE_PASS:     'social.quality.gate.pass',
  QUALITY_GATE_FAIL:     'social.quality.gate.fail',
  MAKE_PAYLOAD_CREATED:  'social.make.payload.created',
  PRIVACY_VALIDATED:     'social.privacy.validated',
});

export function emitSocialEvent(eventType, data = {}) {
  if (!Object.values(SOCIAL_OBS_EVENT).includes(eventType)) {
    throw new Error(`Unknown social obs event: ${eventType}`);
  }
  if (!data.businessId) throw new Error('emitSocialEvent requires businessId');
  if (!data.clientId)   throw new Error('emitSocialEvent requires clientId');

  return Object.freeze({
    eventType,
    businessId:   data.businessId,
    clientId:     data.clientId,
    timestamp:    data.timestamp ?? new Date().toISOString(),
    payload:      Object.freeze(data.payload ?? {}),
    adv01Bridge:  'OBSERVABILITY_CONNECTED',
    isReal:       false,
  });
}
