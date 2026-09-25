// SOP Engine — FASE 4: definición y validación de Standard Operating Procedures

export const SOP_STEP_TYPES = Object.freeze({
  ACTION:      'ACTION',
  DECISION:    'DECISION',
  GATE:        'GATE',
  HANDOFF:     'HANDOFF',
  WAIT:        'WAIT',
  NOTIFICATION: 'NOTIFICATION',
});

export const SOP_STATUS = Object.freeze({
  PASS:         'PASS',
  FAIL:         'FAIL',
  BLOCKED:      'BLOCKED',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
  PENDING:      'PENDING',
});

/**
 * Create a validated SOP definition.
 */
export function createSOP(def = {}) {
  const errors = [];

  if (!def.id || typeof def.id !== 'string')         errors.push('id required');
  if (!def.title || typeof def.title !== 'string')   errors.push('title required');
  if (!def.purpose || typeof def.purpose !== 'string') errors.push('purpose required');
  if (!def.owner || typeof def.owner !== 'string')   errors.push('owner required');
  if (!Array.isArray(def.steps) || def.steps.length === 0) errors.push('steps must be non-empty');
  if (!def.trigger || typeof def.trigger !== 'string') errors.push('trigger required');

  if (errors.length > 0) return { valid: false, errors, sop: null };

  const sop = {
    id:                  def.id,
    title:               def.title,
    purpose:             def.purpose,
    scope:               def.scope ?? '',
    owner:               def.owner,
    participants:        Array.isArray(def.participants) ? def.participants : [],
    trigger:             def.trigger,
    requiredInputs:      Array.isArray(def.requiredInputs) ? def.requiredInputs : [],
    steps:               def.steps.map((s, i) => normalizeStep(s, i)),
    decisionRules:       Array.isArray(def.decisionRules) ? def.decisionRules : [],
    qualityChecks:       Array.isArray(def.qualityChecks) ? def.qualityChecks : [],
    securityChecks:      Array.isArray(def.securityChecks) ? def.securityChecks : [],
    handoff:             def.handoff ?? null,
    exceptions:          Array.isArray(def.exceptions) ? def.exceptions : [],
    escalation:          def.escalation ?? null,
    completionCriteria:  Array.isArray(def.completionCriteria) ? def.completionCriteria : [],
    artifacts:           Array.isArray(def.artifacts) ? def.artifacts : [],
    metrics:             Array.isArray(def.metrics) ? def.metrics : [],
    version:             def.version ?? '1.0.0',
    bpmnRef:             def.bpmnRef ?? null,
  };

  return { valid: true, errors: [], sop };
}

function normalizeStep(step, index) {
  if (typeof step === 'string') {
    return { index, label: step, type: SOP_STEP_TYPES.ACTION, owner: null, optional: false };
  }
  return {
    index:    step.index ?? index,
    label:    step.label ?? `Step ${index + 1}`,
    type:     step.type ?? SOP_STEP_TYPES.ACTION,
    owner:    step.owner ?? null,
    optional: step.optional ?? false,
    decision: step.decision ?? null,
    gate:     step.gate ?? null,
  };
}

/**
 * Validate a SOP definition against a set of rules.
 * Returns { valid, warnings, errors }.
 */
export function validateSOP(sop = {}) {
  const errors = [];
  const warnings = [];

  if (!sop.id)      errors.push('missing id');
  if (!sop.title)   errors.push('missing title');
  if (!sop.purpose) errors.push('missing purpose');
  if (!sop.owner)   errors.push('missing owner');
  if (!Array.isArray(sop.steps) || sop.steps.length === 0) errors.push('no steps defined');
  if (!sop.trigger) errors.push('missing trigger');

  if (sop.requiredInputs?.length === 0) warnings.push('no required inputs defined');
  if (sop.completionCriteria?.length === 0) warnings.push('no completion criteria defined');
  if (sop.qualityChecks?.length === 0) warnings.push('no quality checks defined');
  if (sop.securityChecks?.length === 0) warnings.push('no security checks defined');
  if (!sop.escalation) warnings.push('no escalation path defined');
  if (!sop.handoff) warnings.push('no handoff defined');
  if (sop.artifacts?.length === 0) warnings.push('no artifacts defined');
  if (sop.metrics?.length === 0) warnings.push('no metrics defined');

  const hasDecisionStep = sop.steps?.some(s => s.type === SOP_STEP_TYPES.DECISION || s.type === SOP_STEP_TYPES.GATE);
  if (!hasDecisionStep) warnings.push('no decision or gate steps — consider adding at least one checkpoint');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - errors.length * 20 - warnings.length * 5),
  };
}

/**
 * Run a SOP step-by-step given a context object.
 * Returns execution trace with outcomes per step.
 */
export function runSOP(sop, context = {}) {
  if (!sop || !Array.isArray(sop.steps)) {
    return { status: SOP_STATUS.FAIL, reason: 'invalid_sop', trace: [] };
  }

  const trace = [];
  let blocked = false;
  let humanNeeded = false;

  for (const step of sop.steps) {
    const outcome = evaluateStep(step, context);
    trace.push({ step: step.label, type: step.type, outcome });
    if (outcome.status === SOP_STATUS.BLOCKED) blocked = true;
    if (outcome.status === SOP_STATUS.HUMAN_REVIEW) humanNeeded = true;
  }

  const status = blocked
    ? SOP_STATUS.BLOCKED
    : humanNeeded
      ? SOP_STATUS.HUMAN_REVIEW
      : SOP_STATUS.PASS;

  return {
    status,
    sopId:       sop.id,
    stepsTotal:  sop.steps.length,
    stepsPassed: trace.filter(t => t.outcome.status === SOP_STATUS.PASS).length,
    blocked,
    humanNeeded,
    trace,
  };
}

function evaluateStep(step, context) {
  if (step.type === SOP_STEP_TYPES.GATE && step.gate) {
    const check = context[step.gate];
    if (check === false) return { status: SOP_STATUS.BLOCKED, reason: `gate_failed: ${step.gate}` };
    if (check === 'HUMAN_REVIEW') return { status: SOP_STATUS.HUMAN_REVIEW, reason: `human_required: ${step.gate}` };
  }
  if (step.type === SOP_STEP_TYPES.DECISION && step.decision) {
    const val = context[step.decision];
    if (val === undefined) return { status: SOP_STATUS.PENDING, reason: `decision_pending: ${step.decision}` };
  }
  return { status: SOP_STATUS.PASS };
}

export const SOP_ENGINE_VERSION = '1.0.0';
