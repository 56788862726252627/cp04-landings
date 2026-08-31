// AI Agent SOP — FASE 9: gobernanza operativa de agentes IA

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const AI_RISK_TIERS = Object.freeze({
  LOW:    'LOW',    // read-only, no PII, no external actions
  MEDIUM: 'MEDIUM', // read/write internal, limited external
  HIGH:   'HIGH',   // external actions, PII access, financial data
});

export const AI_AGENT_TYPES = Object.freeze({
  CHATBOT:      'CHATBOT',
  BOOKING_BOT:  'BOOKING_BOT',
  CRM_BOT:      'CRM_BOT',
  REPORT_BOT:   'REPORT_BOT',
  INTAKE_BOT:   'INTAKE_BOT',
  CUSTOM:       'CUSTOM',
});

/**
 * Define an AI agent operating profile.
 */
export function defineAgentProfile(params = {}) {
  const errors = [];

  if (!params.agentId)   errors.push('agentId required');
  if (!params.purpose)   errors.push('purpose required');
  if (!params.riskTier || !Object.values(AI_RISK_TIERS).includes(params.riskTier)) {
    errors.push(`riskTier must be one of: ${Object.values(AI_RISK_TIERS).join(', ')}`);
  }

  if (errors.length > 0) return { valid: false, errors, profile: null };

  const profile = {
    agentId:           params.agentId,
    agentType:         params.agentType ?? AI_AGENT_TYPES.CUSTOM,
    purpose:           params.purpose,
    riskTier:          params.riskTier,
    allowedTools:      Array.isArray(params.allowedTools) ? params.allowedTools : [],
    forbiddenActions:  Array.isArray(params.forbiddenActions) ? params.forbiddenActions : [
      'store_real_credentials',
      'access_unauthorized_data',
      'send_unsolicited_messages',
      'make_financial_transactions_without_approval',
    ],
    dataAccess:        params.dataAccess ?? 'READ_ONLY',
    memoryPolicy:      params.memoryPolicy ?? 'SESSION_ONLY',
    privacyFlags:      Array.isArray(params.privacyFlags) ? params.privacyFlags : [],
    humanEscalation:   params.humanEscalation ?? 'ALWAYS_AVAILABLE',
    modelSelection:    params.modelSelection ?? 'claude-haiku-4-5-20251001',
    testingRequired:   true,
    releaseGate:       params.riskTier === AI_RISK_TIERS.HIGH ? 'HUMAN_REVIEW' : 'QA_GATE',
  };

  return { valid: true, errors: [], profile };
}

/**
 * Validate AI agent profile against risk-tier rules.
 */
export function validateAgentProfile(profile = {}) {
  const violations = [];
  const warnings = [];

  if (profile.riskTier === AI_RISK_TIERS.HIGH) {
    if (!profile.privacyFlags.length) warnings.push('HIGH risk tier: privacy flags not documented');
    if (profile.releaseGate !== 'HUMAN_REVIEW') violations.push('HIGH risk tier requires HUMAN_REVIEW release gate');
    if (profile.memoryPolicy !== 'SESSION_ONLY' && profile.memoryPolicy !== 'ENCRYPTED_PERSISTENT') {
      violations.push('HIGH risk tier requires SESSION_ONLY or ENCRYPTED_PERSISTENT memory');
    }
  }

  if (profile.dataAccess === 'READ_WRITE' && profile.riskTier === AI_RISK_TIERS.LOW) {
    violations.push('LOW risk tier cannot have READ_WRITE data access');
  }

  if (profile.forbiddenActions.length === 0) {
    violations.push('forbiddenActions cannot be empty');
  }

  return {
    valid:       violations.length === 0,
    violations,
    warnings,
    outcome:     violations.length === 0 ? 'APPROVED' : 'BLOCKED',
  };
}

export const sopAIAgent = createSOP({
  id:      'AI_AGENT_GOVERNANCE',
  title:   'AI Agent Governance',
  purpose: 'Ensure AI agents are designed, tested and deployed with appropriate risk controls',
  scope:   'All AI agents in agency products',
  owner:   'AI_SPECIALIST',
  participants: ['AI_SPECIALIST', 'QA', 'PROJECT_MANAGER', 'AGENCY_OWNER'],
  trigger: 'AI agent required by scope',
  requiredInputs: ['agentPurpose', 'riskTier', 'dataAccessNeeds', 'toolList'],
  steps: [
    { label: 'Define agent purpose and scope', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Classify risk tier (LOW/MEDIUM/HIGH)', type: SOP_STEP_TYPES.DECISION, decision: 'risk_tier', owner: 'AI_SPECIALIST' },
    { label: 'Define allowed tools', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Define forbidden actions', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Set data access policy', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Set memory policy', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Define privacy flags', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Configure human escalation path', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Select model', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST' },
    { label: 'Write agent tests', type: SOP_STEP_TYPES.ACTION, owner: 'QA' },
    { label: 'Validate agent profile', type: SOP_STEP_TYPES.GATE, gate: 'agent_profile_valid', owner: 'QA' },
    { label: 'HUMAN_REVIEW if HIGH risk tier', type: SOP_STEP_TYPES.GATE, gate: 'high_risk_cleared', owner: 'AGENCY_OWNER', optional: true },
    { label: 'Release gate pass', type: SOP_STEP_TYPES.GATE, gate: 'ai_release_gate', owner: 'QA' },
  ],
  decisionRules: [
    'HIGH risk → HUMAN_REVIEW mandatory',
    'No agent stores real credentials',
    'Human escalation always available',
    'Session-only memory unless explicitly approved',
  ],
  qualityChecks: ['Agent tests pass', 'Risk tier justified', 'Model selection appropriate'],
  securityChecks: [
    'No real API keys in agent config',
    'Forbidden actions list non-empty',
    'PII handling documented',
  ],
  handoff: 'Approved agent profile → factory generator',
  escalation: 'AGENCY_OWNER for HIGH risk or external financial actions',
  completionCriteria: ['Agent profile validated', 'Tests pass', 'Release gate approved'],
  artifacts: ['Agent profile', 'Agent test report', 'AI manifest'],
  metrics: ['agent_test_coverage', 'human_escalation_rate'],
  bpmnRef: 'BPMN_FACTORY.ai_router',
}).sop;

export const AI_AGENT_SOP_VERSION = '1.0.0';
