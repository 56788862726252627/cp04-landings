// Shared Agent Context — ADV-17
// Separates business facts, task state, public context, private scratch, human decisions.
// Chain-of-thought is NEVER shared.

export const CONTEXT_SECTION = Object.freeze({
  BUSINESS_FACTS:   'BUSINESS_FACTS',
  TASK_STATE:       'TASK_STATE',
  PUBLIC_WORKING:   'PUBLIC_WORKING',
  HUMAN_DECISIONS:  'HUMAN_DECISIONS',
  // AGENT_SCRATCH: private per-agent, never shared
});

export function createSharedAgentContext(config = {}) {
  const {
    systemId  = 'unknown',
    clientId  = 'unknown',
  } = config;

  const sections = {
    [CONTEXT_SECTION.BUSINESS_FACTS]:  {},
    [CONTEXT_SECTION.TASK_STATE]:      {},
    [CONTEXT_SECTION.PUBLIC_WORKING]:  {},
    [CONTEXT_SECTION.HUMAN_DECISIONS]: {},
  };

  return Object.freeze({
    systemId,
    clientId,

    set(section, key, value) {
      if (!sections[section]) return;
      sections[section][key] = value;
    },

    get(section, key) {
      return sections[section]?.[key] ?? null;
    },

    getSection(section) {
      return Object.freeze({ ...sections[section] });
    },

    // Agent-private scratch — never exposed to other agents
    createPrivateScratch(agentId) {
      const scratch = {};
      return Object.freeze({
        agentId,
        set(k, v) { scratch[k] = v; },
        get(k)    { return scratch[k] ?? null; },
        clear()   { Object.keys(scratch).forEach(k => delete scratch[k]); },
        isReal:   false,
      });
    },

    snapshot() {
      return Object.freeze({
        systemId,
        clientId,
        sections: Object.freeze(Object.fromEntries(
          Object.entries(sections).map(([k, v]) => [k, Object.freeze({ ...v })])
        )),
        isReal: false,
      });
    },

    isReal: false,
  });
}

export const SHARED_AGENT_CONTEXT_VERSION = '1.0.0';
