// Media Observability Bridge — ADV-13 (bridges ADV-01)

export const MEDIA_OBS_EVENT = Object.freeze({
  MEDIA_PROJECT_CREATED:  'MEDIA_PROJECT_CREATED',
  MEDIA_SCRIPT_GENERATED: 'MEDIA_SCRIPT_GENERATED',
  MEDIA_QA_PASSED:        'MEDIA_QA_PASSED',
  MEDIA_QA_FAILED:        'MEDIA_QA_FAILED',
  MEDIA_APPROVED:         'MEDIA_APPROVED',
  MEDIA_BLOCKED:          'MEDIA_BLOCKED',
  MEDIA_PUBLISHED:        'MEDIA_PUBLISHED',
  MEDIA_RIGHTS_CHECKED:   'MEDIA_RIGHTS_CHECKED',
});

const KNOWN_EVENTS = new Set(Object.values(MEDIA_OBS_EVENT));

export function emitMediaEvent(eventType, payload = {}) {
  if (!KNOWN_EVENTS.has(eventType)) throw new Error(`Unknown media event type: ${eventType}`);
  return Object.freeze({
    eventType,
    timestamp:   Date.now(),
    payload:     Object.freeze(payload),
    adv01Bridge: 'OBSERVABILITY_CONNECTED',
    isReal:      false,
  });
}

export const MEDIA_OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
