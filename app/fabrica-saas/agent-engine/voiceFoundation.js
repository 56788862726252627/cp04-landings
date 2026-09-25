// Voice Foundation — ADV-03
// Contrato de voz. Sin Twilio/VAPI/ElevenLabs/Deepgram.

export const VOICE_TURN = Object.freeze({
  AGENT:  'AGENT',
  USER:   'USER',
});

export const BARGE_IN_POLICY = Object.freeze({
  ALLOW:    'ALLOW',
  DISALLOW: 'DISALLOW',
  PAUSE:    'PAUSE',
});

export const SILENCE_ACTION = Object.freeze({
  PROMPT: 'PROMPT',   // "¿Sigues ahí?"
  WAIT:   'WAIT',
  CLOSE:  'CLOSE',
});

export const CONFIRMATION_STYLE = Object.freeze({
  EXPLICIT: 'EXPLICIT',  // "¿Confirmas la reserva para las 10?"
  IMPLICIT: 'IMPLICIT',  // "Perfecto, queda apuntado."
  NONE:     'NONE',
});

/**
 * Build a voice foundation contract for the given channel/vertical.
 * Does NOT connect to any telecom provider.
 */
export function buildVoiceContract(params = {}) {
  const {
    agentType   = 'CHAT',
    vertical    = 'DEFAULT',
    riskLevel   = 'LOW',
    language    = 'es-ES',
  } = params;

  const isHighRisk = riskLevel === 'HIGH';

  const contract = Object.freeze({
    speechInput: Object.freeze({
      language,
      expectNaturalSpeech:   true,
      allowPartialSentences: true,
      confirmAmbiguous:      true,
    }),

    speechOutput: Object.freeze({
      language,
      maxWordsPerTurn: 30,
      sentenceStyle:   true,
      noLists:         true,
      noMarkdown:      true,
      naturalPauses:   true,
      speakSlowly:     isHighRisk,
    }),

    turnTaking: Object.freeze({
      waitForUserCompletion: true,
      endOfTurnSilenceMs:    800,
      maxTurnDurationMs:     30000,
    }),

    bargeIn: Object.freeze({
      policy:       BARGE_IN_POLICY.ALLOW,
      graceMs:      300,
      onBargeIn:    'STOP_AND_LISTEN',
    }),

    silenceHandling: Object.freeze({
      firstSilenceMs:  5000,
      firstAction:     SILENCE_ACTION.PROMPT,
      promptPhrase:    '¿Sigues ahí?',
      secondSilenceMs: 10000,
      secondAction:    SILENCE_ACTION.CLOSE,
      closePhrase:     'Parece que hemos perdido la conexión. Hasta luego.',
    }),

    confirmation: Object.freeze({
      style:           isHighRisk ? CONFIRMATION_STYLE.EXPLICIT : CONFIRMATION_STYLE.IMPLICIT,
      bookingRequired: true,
      personalDataRequired: true,
    }),

    transferHuman: Object.freeze({
      trigger:         'USER_REQUESTS',
      transferPhrase:  'Te paso ahora con una persona del equipo.',
      holdPhrase:      'Un momento, por favor.',
      maxWaitSeconds:  60,
    }),

    latencyBudget: Object.freeze({
      targetResponseMs: 800,
      maxAcceptableMs:  2000,
      note:             'Latency targets are guidelines; actual values depend on provider.',
    }),

    shortResponsePolicy: Object.freeze({
      hardLimitWords:    30,
      preferShorter:     true,
      avoidLists:        true,
      avoidMarkdown:     true,
      oneLinerPreferred: true,
    }),

    meta: Object.freeze({
      agentType,
      vertical,
      riskLevel,
      isReal:    false,
      provider:  'NONE — integration pending',
      version:   '1.0.0',
    }),
  });

  return { valid: true, contract };
}

export const VOICE_FOUNDATION_VERSION = '1.0.0';
