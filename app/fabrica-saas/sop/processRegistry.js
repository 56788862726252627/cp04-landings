// Process Registry — FASE 2: estándar de definición de procesos operativos

export const PROCESS_CATEGORIES = Object.freeze({
  CLIENT:       'CLIENT',
  AGENCY:       'AGENCY',
  AI:           'AI',
  PRODUCT:      'PRODUCT',
  AUTOMATION:   'AUTOMATION',
  QA_SECURITY:  'QA_SECURITY',
  OPERATIONS:   'OPERATIONS',
});

export const PROCESS_STATUS = Object.freeze({
  ACTIVE:       'ACTIVE',
  DRAFT:        'DRAFT',
  DEPRECATED:   'DEPRECATED',
  REVIEW:       'REVIEW',
});

/**
 * Create a validated process definition.
 * @param {object} def
 * @returns {{ valid: boolean, errors: string[], process: object|null }}
 */
export function createProcess(def = {}) {
  const errors = [];

  if (!def.processId || typeof def.processId !== 'string') errors.push('processId required');
  if (!def.name || typeof def.name !== 'string') errors.push('name required');
  if (!Object.values(PROCESS_CATEGORIES).includes(def.category)) {
    errors.push(`category must be one of: ${Object.values(PROCESS_CATEGORIES).join(', ')}`);
  }
  if (!def.ownerRole || typeof def.ownerRole !== 'string') errors.push('ownerRole required');
  if (!Array.isArray(def.steps) || def.steps.length === 0) errors.push('steps must be a non-empty array');
  if (typeof def.trigger !== 'string') errors.push('trigger required');

  if (errors.length > 0) return { valid: false, errors, process: null };

  const process = {
    processId:           def.processId,
    name:                def.name,
    category:            def.category,
    ownerRole:           def.ownerRole,
    participants:        Array.isArray(def.participants) ? def.participants : [],
    trigger:             def.trigger,
    inputs:              Array.isArray(def.inputs) ? def.inputs : [],
    outputs:             Array.isArray(def.outputs) ? def.outputs : [],
    preconditions:       Array.isArray(def.preconditions) ? def.preconditions : [],
    steps:               def.steps,
    decisionPoints:      Array.isArray(def.decisionPoints) ? def.decisionPoints : [],
    gates:               Array.isArray(def.gates) ? def.gates : [],
    exceptions:          Array.isArray(def.exceptions) ? def.exceptions : [],
    escalations:         Array.isArray(def.escalations) ? def.escalations : [],
    artifacts:           Array.isArray(def.artifacts) ? def.artifacts : [],
    metrics:             Array.isArray(def.metrics) ? def.metrics : [],
    status:              def.status || PROCESS_STATUS.ACTIVE,
    version:             def.version || '1.0.0',
  };

  return { valid: true, errors: [], process };
}

/**
 * Registry container — holds all registered processes in memory.
 * Use registerProcess / getProcess / listProcesses.
 */
const _registry = new Map();

export function registerProcess(def = {}) {
  const result = createProcess(def);
  if (!result.valid) return result;
  _registry.set(result.process.processId, result.process);
  return result;
}

export function getProcess(processId) {
  return _registry.get(processId) ?? null;
}

export function listProcesses(filterCategory = null) {
  const all = Array.from(_registry.values());
  if (!filterCategory) return all;
  return all.filter(p => p.category === filterCategory);
}

export function clearRegistry() {
  _registry.clear();
}

export const PROCESS_REGISTRY_VERSION = '1.0.0';
