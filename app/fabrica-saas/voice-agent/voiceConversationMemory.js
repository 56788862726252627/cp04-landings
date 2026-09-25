// Voice Conversation Memory — ADV-11

export const MEMORY_FIELD_TYPE = Object.freeze({
  CONVERSATION_CONTEXT: 'CONVERSATION_CONTEXT',
  CONFIRMED_FACT:       'CONFIRMED_FACT',
  TASK_CONTEXT:         'TASK_CONTEXT',
  INTENT_CONTEXT:       'INTENT_CONTEXT',
});

export function createVoiceConversationMemory(config = {}) {
  const store = new Map();

  function set(key, value, type = MEMORY_FIELD_TYPE.CONVERSATION_CONTEXT) {
    store.set(key, Object.freeze({ key, value, type, storedAt: Date.now() }));
  }

  function get(key) {
    const entry = store.get(key);
    return entry ?? null;
  }

  function getContext() {
    const ctx = {};
    for (const [k, v] of store) ctx[k] = v.value;
    return Object.freeze(ctx);
  }

  function clear() { store.clear(); }

  return Object.freeze({
    set,
    get,
    getContext,
    clear,
    size:          () => store.size,
    noSensitiveData: config.noSensitiveData ?? true,
    purposeLimited:  true,
    isReal: false,
  });
}

export const VOICE_CONVERSATION_MEMORY_VERSION = '1.0.0';
