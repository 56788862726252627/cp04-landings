// Agent Deadlock Detector — ADV-17

export const DEADLOCK_TYPE = Object.freeze({
  MUTUAL_WAIT:         'MUTUAL_WAIT',
  RESOURCE_LOCK:       'RESOURCE_LOCK',
  APPROVAL_DEPENDENCY: 'APPROVAL_DEPENDENCY',
  CIRCULAR_TASK:       'CIRCULAR_TASK',
});

export function createAgentDeadlockDetector() {
  const waitGraph = new Map(); // agentId → Set of agentIds it waits on

  return Object.freeze({
    recordWait(waiterId, waitingForId) {
      if (!waitGraph.has(waiterId)) waitGraph.set(waiterId, new Set());
      waitGraph.get(waiterId).add(waitingForId);
    },

    releaseWait(waiterId, waitingForId) {
      waitGraph.get(waiterId)?.delete(waitingForId);
    },

    detectMutualWait() {
      for (const [agentA, waitingFor] of waitGraph) {
        for (const agentB of waitingFor) {
          if (waitGraph.get(agentB)?.has(agentA)) {
            return Object.freeze({ deadlock: true, type: DEADLOCK_TYPE.MUTUAL_WAIT, agents: Object.freeze([agentA, agentB]), isReal: false });
          }
        }
      }
      return Object.freeze({ deadlock: false, isReal: false });
    },

    detectCircularTask(graph) {
      if (graph?.hasCycle) {
        return Object.freeze({ deadlock: true, type: DEADLOCK_TYPE.CIRCULAR_TASK, isReal: false });
      }
      return Object.freeze({ deadlock: false, isReal: false });
    },

    detectApprovalLoop(pendingApprovals = []) {
      const deps = pendingApprovals.filter(a => a.blockedBy && pendingApprovals.find(b => b.id === a.blockedBy));
      if (deps.length >= 2) {
        return Object.freeze({ deadlock: true, type: DEADLOCK_TYPE.APPROVAL_DEPENDENCY, count: deps.length, isReal: false });
      }
      return Object.freeze({ deadlock: false, isReal: false });
    },

    reset() { waitGraph.clear(); },

    isReal: false,
  });
}

export const DEADLOCK_DETECTOR_VERSION = '1.0.0';
