// Voice Intent Switching — ADV-11

import { VOICE_INTENT, detectVoiceIntent } from './voiceIntentModel.js';

export const SWITCH_REASON = Object.freeze({
  USER_PIVOT:         'USER_PIVOT',
  TASK_COMPLETED:     'TASK_COMPLETED',
  CLARIFICATION_NEED: 'CLARIFICATION_NEED',
  ESCALATION:         'ESCALATION',
});

export function createVoiceIntentSwitcher(initialIntent = VOICE_INTENT.UNKNOWN) {
  let currentIntent = initialIntent;
  const history     = [{ intent: initialIntent, switchReason: null, turnIndex: 0 }];

  function switchIntent(newIntent, reason = SWITCH_REASON.USER_PIVOT, turnIndex = 0) {
    const from = currentIntent;
    currentIntent = newIntent;
    history.push(Object.freeze({ from, intent: newIntent, switchReason: reason, turnIndex }));
    return Object.freeze({ from, to: newIntent, reason, isReal: false });
  }

  function detectAndSwitch(userText = '', turnIndex = 0) {
    const detected = detectVoiceIntent(userText);
    if (detected.intent !== VOICE_INTENT.UNKNOWN && detected.intent !== currentIntent) {
      return switchIntent(detected.intent, SWITCH_REASON.USER_PIVOT, turnIndex);
    }
    return null;
  }

  return Object.freeze({
    getCurrent:    ()      => currentIntent,
    getHistory:    ()      => Object.freeze([...history]),
    switchIntent,
    detectAndSwitch,
    isReal: false,
  });
}

export const VOICE_INTENT_SWITCHING_VERSION = '1.0.0';
