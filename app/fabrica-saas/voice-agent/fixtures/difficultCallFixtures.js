// Difficult Call Fixtures — ADV-11

export const DIFFICULT_CALL_FIXTURES = Object.freeze([
  {
    id:            'difficult-angry-01',
    scenario:      'Angry user — refund dispute',
    userText:      'Estoy muy enfadado, me cobrasteis dos veces y no me devolveis el dinero.',
    expectedIntent:'COMPLAINT',
    expectedHandoff: true,
    handoffTrigger: 'PAYMENT_DISPUTE',
    isReal: false,
  },
  {
    id:            'difficult-unclear-01',
    scenario:      'Unclear request — low confidence',
    userText:      'Pues quería... no sé... algo del pádel o eso.',
    expectedIntent:'UNKNOWN',
    confidence:     0.2,
    expectedRecovery: true,
    isReal: false,
  },
  {
    id:            'difficult-misunderstanding-01',
    scenario:      'Agent misunderstands twice — recovery triggers handoff',
    userText:      'No, no, eso no es lo que digo.',
    recoveryAttempts: 3,
    expectedHandoff: true,
    isReal: false,
  },
  {
    id:            'difficult-topic-change-01',
    scenario:      'Abrupt topic change mid-booking',
    userText:      'Para, para. Olvida la reserva. ¿Hacéis torneos para niños?',
    expectedIntent:'INFORMATION',
    intentSwitch:   true,
    previousIntent: 'BOOKING',
    isReal: false,
  },
  {
    id:            'difficult-human-request-01',
    scenario:      'User explicitly requests human agent',
    userText:      'Quiero hablar con una persona real, no con un robot.',
    expectedIntent:'HUMAN',
    expectedHandoff: true,
    handoffTrigger: 'USER_REQUESTED',
    isReal: false,
  },
]);
