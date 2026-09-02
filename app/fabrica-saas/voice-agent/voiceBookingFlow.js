// Voice Booking Flow — ADV-11 — SIMULATION_ONLY

export const BOOKING_STEP = Object.freeze({
  COLLECT_DATE:      'COLLECT_DATE',
  COLLECT_TIME:      'COLLECT_TIME',
  COLLECT_SERVICE:   'COLLECT_SERVICE',
  CHECK_AVAILABILITY:'CHECK_AVAILABILITY',
  COLLECT_NAME:      'COLLECT_NAME',
  COLLECT_PHONE:     'COLLECT_PHONE',
  CONFIRM:           'CONFIRM',
  CONFIRMED:         'CONFIRMED',
});

export const BOOKING_STEP_PROMPTS = Object.freeze({
  [BOOKING_STEP.COLLECT_DATE]:      '¿Para qué día quieres la reserva?',
  [BOOKING_STEP.COLLECT_TIME]:      '¿A qué hora te viene bien?',
  [BOOKING_STEP.COLLECT_SERVICE]:   '¿Qué servicio necesitas?',
  [BOOKING_STEP.CHECK_AVAILABILITY]:'Un momento, compruebo disponibilidad…',
  [BOOKING_STEP.COLLECT_NAME]:      '¿Me dices tu nombre completo?',
  [BOOKING_STEP.COLLECT_PHONE]:     '¿Y tu número de teléfono de contacto?',
  [BOOKING_STEP.CONFIRM]:           '¿Confirmas la reserva con esos datos?',
});

// eslint-disable-next-line no-unused-vars
export function createVoiceBookingFlow(availabilityBridge = null) {
  let step   = BOOKING_STEP.COLLECT_DATE;
  const data = {};

  function currentStep() { return step; }
  function getCurrentPrompt() { return BOOKING_STEP_PROMPTS[step] ?? ''; }

  function advance(field = null, value = null) {
    if (field) data[field] = value;
    const order = [
      BOOKING_STEP.COLLECT_DATE,
      BOOKING_STEP.COLLECT_TIME,
      BOOKING_STEP.COLLECT_SERVICE,
      BOOKING_STEP.CHECK_AVAILABILITY,
      BOOKING_STEP.COLLECT_NAME,
      BOOKING_STEP.COLLECT_PHONE,
      BOOKING_STEP.CONFIRM,
      BOOKING_STEP.CONFIRMED,
    ];
    const idx = order.indexOf(step);
    step = order[idx + 1] ?? BOOKING_STEP.CONFIRMED;
    return Object.freeze({ step, prompt: getCurrentPrompt(), isReal: false });
  }

  function confirmBooking() {
    step = BOOKING_STEP.CONFIRMED;
    return Object.freeze({ step, data: Object.freeze({ ...data }), simulated: true, isReal: false });
  }

  return Object.freeze({
    currentStep, getCurrentPrompt, advance, confirmBooking,
    getData:       () => Object.freeze({ ...data }),
    isReal: false,
  });
}

export const VOICE_BOOKING_FLOW_VERSION = '1.0.0';
