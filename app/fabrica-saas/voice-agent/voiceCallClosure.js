// Voice Call Closure — ADV-11

export const CLOSURE_TYPE = Object.freeze({
  TASK_COMPLETED:   'TASK_COMPLETED',
  USER_REQUESTED:   'USER_REQUESTED',
  TRANSFERRED:      'TRANSFERRED',
  SILENCE_TIMEOUT:  'SILENCE_TIMEOUT',
  ERROR_RECOVERY:   'ERROR_RECOVERY',
});

export const CLOSURE_PHRASES = Object.freeze({
  [CLOSURE_TYPE.TASK_COMPLETED]:  '¡Perfecto! Si necesitas algo más, llámanos. ¡Hasta luego!',
  [CLOSURE_TYPE.USER_REQUESTED]:  'Claro, cuando quieras. ¡Hasta pronto!',
  [CLOSURE_TYPE.TRANSFERRED]:     'Te paso con el equipo ahora mismo. ¡Que te atiendan bien!',
  [CLOSURE_TYPE.SILENCE_TIMEOUT]: 'Parece que la llamada se cortó. ¡Hasta luego!',
  [CLOSURE_TYPE.ERROR_RECOVERY]:  'Ha habido un problema técnico. Llámanos de nuevo si lo necesitas. ¡Hasta pronto!',
});

export function buildCallClosure(type = CLOSURE_TYPE.TASK_COMPLETED, summary = null) {
  return Object.freeze({
    type,
    phrase:    CLOSURE_PHRASES[type] ?? CLOSURE_PHRASES[CLOSURE_TYPE.TASK_COMPLETED],
    summary,
    isReal: false,
  });
}

export const VOICE_CALL_CLOSURE_VERSION = '1.0.0';
