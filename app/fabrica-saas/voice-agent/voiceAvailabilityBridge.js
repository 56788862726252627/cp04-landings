// Voice Availability Bridge — ADV-11
// Connects voice agent to ADV-10b availability resolver

export const VOICE_AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE:   'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN:     'UNKNOWN',
  ERROR:       'ERROR',
});

export function createVoiceAvailabilityBridge(availabilityResolver = null) {
  function checkAvailabilityForVoice(params = {}) {
    if (!availabilityResolver) {
      return Object.freeze({
        status:  VOICE_AVAILABILITY_STATUS.UNKNOWN,
        message: 'No hay información de disponibilidad en este momento.',
        params,
        isReal: false,
      });
    }
    const result = availabilityResolver(params);
    const status = result?.available === true
      ? VOICE_AVAILABILITY_STATUS.AVAILABLE
      : result?.available === false
        ? VOICE_AVAILABILITY_STATUS.UNAVAILABLE
        : VOICE_AVAILABILITY_STATUS.UNKNOWN;
    return Object.freeze({ status, raw: result, params, isReal: false });
  }

  function buildVoiceAvailabilityResponse(status = '', slot = {}) {
    if (status === VOICE_AVAILABILITY_STATUS.AVAILABLE)   return `Sí, hay disponibilidad para ${slot.label ?? 'ese horario'}.`;
    if (status === VOICE_AVAILABILITY_STATUS.UNAVAILABLE) return `Lo siento, ese horario no está disponible.`;
    return 'No tengo información confirmada de disponibilidad para ese momento.';
  }

  return Object.freeze({
    checkAvailabilityForVoice,
    buildVoiceAvailabilityResponse,
    hasResolver: Boolean(availabilityResolver),
    isReal: false,
  });
}

export const VOICE_AVAILABILITY_BRIDGE_VERSION = '1.0.0';
