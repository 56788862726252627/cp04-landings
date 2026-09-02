// Voice Call State Machine — ADV-11

export const CALL_STATE = Object.freeze({
  INITIALIZING:  'INITIALIZING',
  GREETING:      'GREETING',
  LISTENING:     'LISTENING',
  THINKING:      'THINKING',
  SPEAKING:      'SPEAKING',
  TOOL_CALL:     'TOOL_CALL',
  CONFIRMATION:  'CONFIRMATION',
  HANDOFF:       'HANDOFF',
  CLOSING:       'CLOSING',
  ENDED:         'ENDED',
  FAILED:        'FAILED',
});

const VALID_TRANSITIONS = Object.freeze({
  [CALL_STATE.INITIALIZING]:  [CALL_STATE.GREETING, CALL_STATE.FAILED],
  [CALL_STATE.GREETING]:      [CALL_STATE.LISTENING, CALL_STATE.FAILED],
  [CALL_STATE.LISTENING]:     [CALL_STATE.THINKING, CALL_STATE.CLOSING, CALL_STATE.FAILED],
  [CALL_STATE.THINKING]:      [CALL_STATE.SPEAKING, CALL_STATE.TOOL_CALL, CALL_STATE.HANDOFF, CALL_STATE.FAILED],
  [CALL_STATE.SPEAKING]:      [CALL_STATE.LISTENING, CALL_STATE.CONFIRMATION, CALL_STATE.CLOSING, CALL_STATE.FAILED],
  [CALL_STATE.TOOL_CALL]:     [CALL_STATE.THINKING, CALL_STATE.FAILED],
  [CALL_STATE.CONFIRMATION]:  [CALL_STATE.LISTENING, CALL_STATE.SPEAKING, CALL_STATE.CLOSING],
  [CALL_STATE.HANDOFF]:       [CALL_STATE.ENDED],
  [CALL_STATE.CLOSING]:       [CALL_STATE.ENDED],
  [CALL_STATE.ENDED]:         [],
  [CALL_STATE.FAILED]:        [CALL_STATE.ENDED],
});

export function createVoiceCallStateMachine(initialState = CALL_STATE.INITIALIZING) {
  let state    = initialState;
  const history = [{ state: initialState, at: Date.now() }];

  function canTransition(to) {
    return (VALID_TRANSITIONS[state] ?? []).includes(to);
  }

  function transition(to, reason = null) {
    if (!canTransition(to)) {
      return Object.freeze({ ok: false, from: state, to, reason: 'INVALID_TRANSITION', isReal: false });
    }
    const from = state;
    state      = to;
    history.push(Object.freeze({ state: to, reason, at: Date.now() }));
    return Object.freeze({ ok: true, from, to, reason, isReal: false });
  }

  return Object.freeze({
    getState:   ()   => state,
    getHistory: ()   => Object.freeze([...history]),
    canTransition,
    transition,
    isTerminal: ()   => state === CALL_STATE.ENDED || state === CALL_STATE.FAILED,
    isReal: false,
  });
}

export const VOICE_CALL_STATE_MACHINE_VERSION = '1.0.0';
