// Voice Turn Manager — ADV-11

export const TURN_STATE = Object.freeze({
  INITIALIZING:    'INITIALIZING',
  USER_SPEAKING:   'USER_SPEAKING',
  AGENT_SPEAKING:  'AGENT_SPEAKING',
  INTERRUPTED:     'INTERRUPTED',
  WAITING:         'WAITING',
  THINKING:        'THINKING',
  TOOL_CALL:       'TOOL_CALL',
  TRANSFER:        'TRANSFER',
});

export function createVoiceTurnManager(config = {}) {
  let currentState = TURN_STATE.INITIALIZING;
  let turnIndex    = 0;
  const history    = [];

  function transition(newState, meta = {}) {
    const from = currentState;
    currentState = newState;
    turnIndex++;
    const entry = Object.freeze({ from, to: newState, turnIndex, timestamp: meta.timestamp ?? null, isReal: false });
    history.push(entry);
    return entry;
  }

  return Object.freeze({
    getState:      ()    => currentState,
    getTurnIndex:  ()    => turnIndex,
    getHistory:    ()    => Object.freeze([...history]),
    transition,
    userSpeaks:    (meta) => transition(TURN_STATE.USER_SPEAKING, meta),
    agentSpeaks:   (meta) => transition(TURN_STATE.AGENT_SPEAKING, meta),
    interrupt:     (meta) => transition(TURN_STATE.INTERRUPTED, meta),
    wait:          (meta) => transition(TURN_STATE.WAITING, meta),
    think:         (meta) => transition(TURN_STATE.THINKING, meta),
    callTool:      (meta) => transition(TURN_STATE.TOOL_CALL, meta),
    transfer:      (meta) => transition(TURN_STATE.TRANSFER, meta),
    maxSpeechWords: config.maxSpeechWords ?? 30,
    allowInterruptions: config.allowInterruptions ?? true,
    isReal: false,
  });
}

export const VOICE_TURN_MANAGER_VERSION = '1.0.0';
