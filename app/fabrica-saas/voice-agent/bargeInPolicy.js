// Barge-In Policy — ADV-11

export const BARGE_IN_ACTION = Object.freeze({
  STOP_AND_LISTEN:       'STOP_AND_LISTEN',
  COMPLETE_WORD:         'COMPLETE_WORD',
  IGNORE:                'IGNORE',
});

export const BARGE_IN_TRIGGER = Object.freeze({
  USER_KEYWORD:     'USER_KEYWORD',
  LONG_SILENCE:     'LONG_SILENCE',
  OVERLAP_DETECTED: 'OVERLAP_DETECTED',
  USER_EXPLICIT:    'USER_EXPLICIT',
});

export function createBargeInPolicy(config = {}) {
  return Object.freeze({
    enabled:             config.enabled             ?? true,
    defaultAction:       config.defaultAction       ?? BARGE_IN_ACTION.STOP_AND_LISTEN,
    minAgentWordsBefore: config.minAgentWordsBefore ?? 3,
    reinterpretIntent:   config.reinterpretIntent   ?? true,
    continueCoherently:  config.continueCoherently  ?? true,
    neverTalkOver:       true,
    isReal: false,
  });
}

export function handleBargeIn(agentText = '', userInput = '', policy = {}) {
  if (!policy.enabled) {
    return Object.freeze({ handled: false, action: BARGE_IN_ACTION.IGNORE, isReal: false });
  }

  const agentWordCount = agentText.split(/\s+/).filter(Boolean).length;

  if (agentWordCount < (policy.minAgentWordsBefore ?? 3)) {
    return Object.freeze({
      handled:  true,
      action:   BARGE_IN_ACTION.STOP_AND_LISTEN,
      userInput,
      truncatedAgentAt: agentWordCount,
      isReal:   false,
    });
  }

  return Object.freeze({
    handled:  true,
    action:   BARGE_IN_ACTION.STOP_AND_LISTEN,
    userInput,
    truncatedAgentAt: agentWordCount,
    isReal:   false,
  });
}

export const DEFAULT_BARGE_IN_POLICY = createBargeInPolicy();

export const BARGE_IN_POLICY_VERSION = '1.0.0';
