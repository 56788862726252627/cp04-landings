// Sales Call Fixtures — ADV-11

export const SALES_CALL_FIXTURES = Object.freeze([
  {
    id:            'sales-interested-01',
    scenario:      'Interested prospect — requesting info on memberships',
    userText:      'Hola, me interesa saber más sobre vuestros abonos mensuales.',
    expectedIntent:'SALES',
    salesStage:    'DISCOVERY',
    expectedOutcome:'QUALIFIED',
    isReal: false,
  },
  {
    id:            'sales-price-objection-01',
    scenario:      'Price objection',
    userText:      'Me parece caro para lo que ofrecéis.',
    expectedIntent:'SALES',
    objectionType: 'PRICE',
    salesStage:    'OBJECTION',
    isReal: false,
  },
  {
    id:            'sales-not-interested-01',
    scenario:      'Not interested',
    userText:      'No gracias, ya tengo otro club.',
    expectedIntent:'SALES',
    salesStage:    'NOT_INTERESTED',
    expectedOutcome:'NOT_INTERESTED',
    isReal: false,
  },
  {
    id:            'sales-callback-01',
    scenario:      'Requests callback',
    userText:      'Ahora no puedo hablar. ¿Me podéis llamar mañana?',
    expectedIntent:'SALES',
    salesStage:    'FOLLOW_UP',
    expectedOutcome:'FOLLOW_UP',
    isReal: false,
  },
  {
    id:            'sales-competitor-01',
    scenario:      'Competitor mention',
    userText:      'En el otro club me ofrecen mejor precio.',
    expectedIntent:'SALES',
    objectionType: 'COMPETITOR',
    salesStage:    'OBJECTION',
    isReal: false,
  },
]);
