// Agent Task Graph — ADV-17
// Manages task dependencies, parallel branches, critical path, and cycle detection.

export const NODE_STATE = Object.freeze({
  PENDING:   'PENDING',
  READY:     'READY',
  RUNNING:   'RUNNING',
  COMPLETED: 'COMPLETED',
  BLOCKED:   'BLOCKED',
  FAILED:    'FAILED',
});

export function createAgentTaskGraph(tasks = []) {
  const nodes = new Map(tasks.map(t => [t.id, { task: t, state: NODE_STATE.PENDING }]));

  function getReadyTasks() {
    return [...nodes.values()]
      .filter(n => {
        if (n.state !== NODE_STATE.PENDING) return false;
        const deps = n.task.dependencies ?? [];
        return deps.every(depId => nodes.get(depId)?.state === NODE_STATE.COMPLETED);
      })
      .map(n => n.task);
  }

  function hasCycle() {
    const visited = new Set();
    const stack   = new Set();

    function dfs(id) {
      if (stack.has(id)) return true;
      if (visited.has(id)) return false;
      visited.add(id);
      stack.add(id);
      const node = nodes.get(id);
      if (!node) return false;
      for (const dep of (node.task.dependencies ?? [])) {
        if (dfs(dep)) return true;
      }
      stack.delete(id);
      return false;
    }

    return [...nodes.keys()].some(id => dfs(id));
  }

  function criticalPath() {
    // Tasks with no dependents (leaf nodes) form possible endpoints
    const allDeps = new Set([...nodes.values()].flatMap(n => n.task.dependencies ?? []));
    return [...nodes.keys()].filter(id => !allDeps.has(id));
  }

  return Object.freeze({
    size: nodes.size,
    hasCycle: hasCycle(),

    getReadyTasks,
    criticalPath: criticalPath(),

    markRunning(taskId) {
      const n = nodes.get(taskId);
      if (n) n.state = NODE_STATE.RUNNING;
    },

    markCompleted(taskId) {
      const n = nodes.get(taskId);
      if (n) n.state = NODE_STATE.COMPLETED;
    },

    markFailed(taskId) {
      const n = nodes.get(taskId);
      if (n) n.state = NODE_STATE.FAILED;
    },

    getBlockedTasks() {
      return [...nodes.values()]
        .filter(n => {
          const deps = n.task.dependencies ?? [];
          return n.state === NODE_STATE.PENDING &&
            deps.some(d => nodes.get(d)?.state === NODE_STATE.FAILED);
        })
        .map(n => n.task);
    },

    snapshot() {
      return Object.freeze({
        total:     nodes.size,
        ready:     getReadyTasks().length,
        hasCycle:  hasCycle(),
        isReal:    false,
      });
    },

    isReal: false,
  });
}

export const AGENT_TASK_GRAPH_VERSION = '1.0.0';
