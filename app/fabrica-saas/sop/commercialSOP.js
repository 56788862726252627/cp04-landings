// Commercial SOP — FASE 8: proceso comercial (packaging, pricing, propuesta, aprobación)

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const COMMERCIAL_SOP_ID = 'COMMERCIAL_PROPOSAL_PIPELINE';

export const sopCommercialProposal = createSOP({
  id:      COMMERCIAL_SOP_ID,
  title:   'Commercial Proposal Pipeline',
  purpose: 'Generate, present and close commercial proposals',
  scope:   'All qualified leads',
  owner:   'COMMERCIAL',
  participants: ['COMMERCIAL', 'AGENCY_OWNER', 'PROJECT_MANAGER', 'CLIENT_OWNER'],
  trigger: 'Lead qualified, discovery complete',
  requiredInputs: ['diagnosisReport', 'requirementsDoc', 'sector', 'budgetRange'],
  steps: [
    { label: 'Recommend package (ESSENTIAL/PRO/PREMIUM)', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Calculate pricing', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Identify applicable addons', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Calculate third-party costs', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Generate estimate', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Build proposal document', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Agency owner review if discount > 15%', type: SOP_STEP_TYPES.DECISION, decision: 'discount_requires_approval', owner: 'AGENCY_OWNER', optional: true },
    { label: 'Human review if flagged (healthData, legal, etc)', type: SOP_STEP_TYPES.GATE, gate: 'human_review_cleared', owner: 'AGENCY_OWNER', optional: true },
    { label: 'Send proposal', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Proposal review call', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL' },
    { label: 'Client decision', type: SOP_STEP_TYPES.DECISION, decision: 'proposal_outcome', owner: 'CLIENT_OWNER' },
    { label: 'Revise if needed (max 2 rounds)', type: SOP_STEP_TYPES.ACTION, owner: 'COMMERCIAL', optional: true },
    { label: 'Route outcome', type: SOP_STEP_TYPES.HANDOFF, owner: 'COMMERCIAL' },
  ],
  decisionRules: [
    'ESSENTIAL: setup 1200 EUR, monthly 89 EUR',
    'PRO: setup 2400 EUR, monthly 149 EUR',
    'PREMIUM: setup 4500+ EUR, monthly 249 EUR',
    'Max 2 revision rounds before escalation',
  ],
  qualityChecks: [
    'Estimate matches scope',
    'Third-party costs itemized',
    'Proposal includes limitations',
  ],
  securityChecks: ['No payment processing in this step — proposal only'],
  handoff: 'Accepted proposal → Approval SOP',
  escalation: 'AGENCY_OWNER if >20% discount or strategic deal',
  completionCriteria: ['Proposal sent', 'Client decision documented'],
  artifacts: ['Commercial proposal', 'Estimate document', 'Addons selection'],
  metrics: ['proposal_acceptance_rate', 'avg_deal_size_eur', 'avg_revision_rounds'],
  bpmnRef: 'BPMN_AGENCY.commercial',
}).sop;

export function validateCommercialGate(proposal = {}) {
  const errors = [];
  const warnings = [];

  if (!proposal.packageTier) errors.push('missing packageTier');
  if (typeof proposal.setupPrice !== 'number') errors.push('missing setupPrice');
  if (typeof proposal.monthlyPrice !== 'number') errors.push('missing monthlyPrice');
  if (!proposal.sector) errors.push('missing sector');

  if (!proposal.thirdPartyCosts) warnings.push('no third-party costs documented');
  if (!proposal.addons || proposal.addons.length === 0) warnings.push('no addons evaluated');

  return {
    valid:    errors.length === 0,
    errors,
    warnings,
    gate:     'COMMERCIAL_GATE',
    outcome:  errors.length === 0 ? 'PASS' : 'BLOCKED',
  };
}

export const COMMERCIAL_SOP_VERSION = '1.0.0';
