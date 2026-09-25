// Agent Loop Detector — ADV-17

export const LOOP_TYPE = Object.freeze({
  SAME_TASK_REPEATED:    'SAME_TASK_REPEATED',
  PING_PONG_HANDOFF:     'PING_PONG_HANDOFF',
  SAME_TOOL_RETRY:       'SAME_TOOL_RETRY',
  SAME_CRITIQUE_LOOP:    'SAME_CRITIQUE_LOOP',
  NO_PROGRESS_CYCLE:     'NO_PROGRESS_CYCLE',
});

export function createAgentLoopDetector(config = {}) {
  const { maxRepetitions = 3 } = config;
  const history = [];

  return Object.freeze({
    maxRepetitions,

    record(event = {}) {
      history.push({ ...event, ts: Date.now() });
    },

    detect() {
      if (history.length < 2) return Object.freeze({ loop: false, isReal: false });

      // Same task objective repeated
      const objectiveCounts = {};
      for (const e of history) {
        if (e.objective) objectiveCounts[e.objective] = (objectiveCounts[e.objective] ?? 0) + 1;
      }
      for (const [obj, count] of Object.entries(objectiveCounts)) {
        if (count >= maxRepetitions) {
          return Object.freeze({ loop: true, type: LOOP_TYPE.SAME_TASK_REPEATED, objective: obj, count, isReal: false });
        }
      }

      // Ping-pong handoff: A→B→A→B
      if (history.length >= 4) {
        const last4 = history.slice(-4).map(e => e.agentId).filter(Boolean);
        if (last4.length === 4 && last4[0] === last4[2] && last4[1] === last4[3] && last4[0] !== last4[1]) {
          return Object.freeze({ loop: true, type: LOOP_TYPE.PING_PONG_HANDOFF, agents: Object.freeze(last4), isReal: false });
        }
      }

      // Same tool call repeated
      const toolCounts = {};
      for (const e of history) {
        if (e.tool) toolCounts[e.tool] = (toolCounts[e.tool] ?? 0) + 1;
      }
      for (const [tool, count] of Object.entries(toolCounts)) {
        if (count >= maxRepetitions) {
          return Object.freeze({ loop: true, type: LOOP_TYPE.SAME_TOOL_RETRY, tool, count, isReal: false });
        }
      }

      return Object.freeze({ loop: false, isReal: false });
    },

    reset() { history.length = 0; },

    isReal: false,
  });
}

export const LOOP_DETECTOR_VERSION = '1.0.0';
