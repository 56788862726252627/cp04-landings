// Parallel Execution Planner — ADV-17

export const EXEC_CLASSIFICATION = Object.freeze({
  PARALLEL_SAFE:     'PARALLEL_SAFE',
  SEQUENTIAL_REQUIRED: 'SEQUENTIAL_REQUIRED',
  HUMAN_REQUIRED:    'HUMAN_REQUIRED',
  BLOCKED:           'BLOCKED',
});

const WRITE_CONFLICTING_TYPES = new Set(['CRM_UPDATE', 'BOOKING', 'APPROVAL']);
const HUMAN_TYPES             = new Set(['APPROVAL']);

// eslint-disable-next-line no-unused-vars
export function createAgentParallelExecutionPlanner(config = {}) {
  return Object.freeze({
    classify(tasks = []) {
      if (!tasks.length) return Object.freeze({ classification: EXEC_CLASSIFICATION.PARALLEL_SAFE, tasks: Object.freeze([]), isReal: false });

      // Any APPROVAL task → human required
      if (tasks.some(t => HUMAN_TYPES.has(t.type))) {
        return Object.freeze({ classification: EXEC_CLASSIFICATION.HUMAN_REQUIRED, tasks: Object.freeze(tasks), isReal: false });
      }

      // Multiple write tasks of conflicting types → sequential
      const writeTasks = tasks.filter(t => WRITE_CONFLICTING_TYPES.has(t.type));
      if (writeTasks.length > 1) {
        return Object.freeze({ classification: EXEC_CLASSIFICATION.SEQUENTIAL_REQUIRED, tasks: Object.freeze(tasks), isReal: false });
      }

      // All read-only or single write → parallel safe
      return Object.freeze({ classification: EXEC_CLASSIFICATION.PARALLEL_SAFE, tasks: Object.freeze(tasks), isReal: false });
    },

    planBranches(taskGraph) {
      const readyTasks  = taskGraph.getReadyTasks();
      const writeTasks  = readyTasks.filter(t => WRITE_CONFLICTING_TYPES.has(t.type));
      const readTasks   = readyTasks.filter(t => !WRITE_CONFLICTING_TYPES.has(t.type));
      return Object.freeze({
        parallelBranch:   Object.freeze(readTasks),
        sequentialBranch: Object.freeze(writeTasks),
        isReal:           false,
      });
    },

    isReal: false,
  });
}

export const PARALLEL_EXECUTION_PLANNER_VERSION = '1.0.0';
