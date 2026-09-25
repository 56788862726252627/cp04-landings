// BPMN Engine — FASE 18: modelo BPMN declarativo reutilizable
// Compatible BPMN 2.0 conceptually. No depende de librería externa.

export const BPMN_ELEMENT_TYPES = Object.freeze({
  PROCESS:            'bpmn:Process',
  POOL:               'bpmn:Pool',
  LANE:               'bpmn:Lane',
  TASK:               'bpmn:Task',
  SERVICE_TASK:       'bpmn:ServiceTask',
  USER_TASK:          'bpmn:UserTask',
  MANUAL_TASK:        'bpmn:ManualTask',
  EXCLUSIVE_GATEWAY:  'bpmn:ExclusiveGateway',
  PARALLEL_GATEWAY:   'bpmn:ParallelGateway',
  START_EVENT:        'bpmn:StartEvent',
  END_EVENT:          'bpmn:EndEvent',
  INTERMEDIATE_EVENT: 'bpmn:IntermediateCatchEvent',
  MESSAGE_EVENT:      'bpmn:MessageEventDefinition',
  ERROR_EVENT:        'bpmn:ErrorEventDefinition',
  SEQUENCE_FLOW:      'bpmn:SequenceFlow',
});

/**
 * Create a BPMN process definition.
 */
export function createBPMNProcess(params = {}) {
  const errors = [];

  if (!params.id)    errors.push('id required');
  if (!params.name)  errors.push('name required');
  if (!Array.isArray(params.pools) || params.pools.length === 0) errors.push('at least one pool required');

  if (errors.length > 0) return { valid: false, errors, process: null };

  const process = {
    type:            BPMN_ELEMENT_TYPES.PROCESS,
    id:              params.id,
    name:            params.name,
    description:     params.description ?? '',
    isExecutable:    false,
    pools:           params.pools.map(normalizePool),
    sequenceFlows:   Array.isArray(params.sequenceFlows) ? params.sequenceFlows.map(normalizeFlow) : [],
    version:         params.version ?? '1.0.0',
    sopRef:          params.sopRef ?? null,
  };

  return { valid: true, errors: [], process };
}

function normalizePool(pool) {
  return {
    type:     BPMN_ELEMENT_TYPES.POOL,
    id:       pool.id,
    name:     pool.name ?? pool.id,
    lanes:    Array.isArray(pool.lanes) ? pool.lanes.map(normalizeLane) : [],
    elements: Array.isArray(pool.elements) ? pool.elements.map(normalizeElement) : [],
  };
}

function normalizeLane(lane) {
  return {
    type:       BPMN_ELEMENT_TYPES.LANE,
    id:         lane.id,
    name:       lane.name ?? lane.id,
    owner:      lane.owner ?? null,
    elementRefs: Array.isArray(lane.elementRefs) ? lane.elementRefs : [],
  };
}

function normalizeElement(el) {
  return {
    type:   el.type ?? BPMN_ELEMENT_TYPES.TASK,
    id:     el.id,
    name:   el.name ?? el.id,
    owner:  el.owner ?? null,
    props:  el.props ?? {},
  };
}

function normalizeFlow(flow) {
  return {
    type:       BPMN_ELEMENT_TYPES.SEQUENCE_FLOW,
    id:         flow.id ?? `${flow.source}_to_${flow.target}`,
    source:     flow.source,
    target:     flow.target,
    condition:  flow.condition ?? null,
    name:       flow.name ?? null,
  };
}

/**
 * Build simple element helpers.
 */
export function startEvent(id, name = 'Start')    { return { type: BPMN_ELEMENT_TYPES.START_EVENT, id, name }; }
export function endEvent(id, name = 'End')        { return { type: BPMN_ELEMENT_TYPES.END_EVENT, id, name }; }
export function task(id, name, owner = null)      { return { type: BPMN_ELEMENT_TYPES.TASK, id, name, owner }; }
export function serviceTask(id, name, owner = null) { return { type: BPMN_ELEMENT_TYPES.SERVICE_TASK, id, name, owner }; }
export function userTask(id, name, owner = null)  { return { type: BPMN_ELEMENT_TYPES.USER_TASK, id, name, owner }; }
export function manualTask(id, name, owner = null){ return { type: BPMN_ELEMENT_TYPES.MANUAL_TASK, id, name, owner }; }
export function xorGateway(id, name, conditions = []) {
  return { type: BPMN_ELEMENT_TYPES.EXCLUSIVE_GATEWAY, id, name, props: { conditions } };
}
export function parallelGateway(id, name)         { return { type: BPMN_ELEMENT_TYPES.PARALLEL_GATEWAY, id, name }; }
export function flow(source, target, condition = null, name = null) {
  return { id: `${source}_to_${target}`, source, target, condition, name };
}

/**
 * Validate a BPMN process for structural integrity.
 */
export function validateBPMNProcess(process = {}) {
  const errors = [];
  const warnings = [];

  if (!process.id)    errors.push('missing id');
  if (!process.name)  errors.push('missing name');
  if (!process.pools?.length) errors.push('no pools');

  const allElementIds = new Set();
  const allFlowRefs = new Set();

  for (const pool of (process.pools ?? [])) {
    for (const el of (pool.elements ?? [])) {
      if (allElementIds.has(el.id)) errors.push(`duplicate element id: ${el.id}`);
      allElementIds.add(el.id);
    }
    for (const lane of (pool.lanes ?? [])) {
      for (const ref of (lane.elementRefs ?? [])) {
        allFlowRefs.add(ref);
      }
    }
  }

  for (const flow of (process.sequenceFlows ?? [])) {
    if (!allElementIds.has(flow.source)) errors.push(`flow source not found: ${flow.source}`);
    if (!allElementIds.has(flow.target)) errors.push(`flow target not found: ${flow.target}`);
  }

  const hasStart = [...allElementIds].some(id => id.includes('start'));
  const hasEnd   = [...allElementIds].some(id => id.includes('end'));
  if (!hasStart) warnings.push('no start event found (id should contain "start")');
  if (!hasEnd)   warnings.push('no end event found (id should contain "end")');

  return {
    valid:    errors.length === 0,
    errors,
    warnings,
    elementCount: allElementIds.size,
    flowCount:    (process.sequenceFlows ?? []).length,
  };
}

export const BPMN_ENGINE_VERSION = '1.0.0';
