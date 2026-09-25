// Interruption Fixtures — ADV-11

export const INTERRUPTION_FIXTURES = Object.freeze([
  {
    id:              'interrupt-mid-booking-01',
    scenario:        'User interrupts mid-booking to ask price',
    agentText:       'Para confirmar la reserva necesito tu nombre completo y…',
    userInterruption:'Espera, ¿cuánto va a costar?',
    expectedBargeIn:  true,
    expectedStrategy: 'STOP_AND_ANSWER',
    isReal: false,
  },
  {
    id:              'interrupt-polite-hold-01',
    scenario:        'User adds brief acknowledgement during agent speech',
    agentText:       'El martes a las 10 está disponible.',
    userInterruption:'Sí, sí',
    expectedBargeIn:  false,
    expectedStrategy: 'CONTINUE',
    isReal: false,
  },
  {
    id:              'interrupt-topic-change-01',
    scenario:        'User interrupts to completely change topic',
    agentText:       'Entonces reservamos para el…',
    userInterruption:'Olvídalo, mejor cuéntame sobre los precios de abono.',
    expectedBargeIn:  true,
    expectedStrategy: 'STOP_AND_PIVOT',
    isReal: false,
  },
]);
