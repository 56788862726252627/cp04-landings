// Stage Transition Policy — ADV-09 CRM

import { CRM_STAGE, TERMINAL_STAGES } from './salesPipeline.js';

const ALLOWED_FORWARD = Object.freeze({
  [CRM_STAGE.NEW]:           [CRM_STAGE.RESEARCH, CRM_STAGE.QUALIFIED, CRM_STAGE.NURTURE, CRM_STAGE.LOST],
  [CRM_STAGE.RESEARCH]:      [CRM_STAGE.QUALIFIED, CRM_STAGE.NURTURE, CRM_STAGE.LOST],
  [CRM_STAGE.QUALIFIED]:     [CRM_STAGE.DISCOVERY, CRM_STAGE.NURTURE, CRM_STAGE.LOST],
  [CRM_STAGE.DISCOVERY]:     [CRM_STAGE.SOLUTION_FIT, CRM_STAGE.PROPOSAL_PREP, CRM_STAGE.NURTURE, CRM_STAGE.LOST],
  [CRM_STAGE.SOLUTION_FIT]:  [CRM_STAGE.PROPOSAL_PREP, CRM_STAGE.NURTURE, CRM_STAGE.LOST],
  [CRM_STAGE.PROPOSAL_PREP]: [CRM_STAGE.PROPOSAL_SENT, CRM_STAGE.NURTURE, CRM_STAGE.LOST],
  [CRM_STAGE.PROPOSAL_SENT]: [CRM_STAGE.NEGOTIATION, CRM_STAGE.WAITING_CLIENT, CRM_STAGE.WON, CRM_STAGE.LOST, CRM_STAGE.NURTURE],
  [CRM_STAGE.NEGOTIATION]:   [CRM_STAGE.WAITING_CLIENT, CRM_STAGE.WON, CRM_STAGE.LOST, CRM_STAGE.NURTURE],
  [CRM_STAGE.WAITING_CLIENT]:[CRM_STAGE.NEGOTIATION, CRM_STAGE.WON, CRM_STAGE.LOST, CRM_STAGE.NURTURE],
  [CRM_STAGE.NURTURE]:       [CRM_STAGE.NEW, CRM_STAGE.RESEARCH, CRM_STAGE.QUALIFIED, CRM_STAGE.LOST],
  [CRM_STAGE.LOST]:          [CRM_STAGE.NURTURE, CRM_STAGE.NEW],
  [CRM_STAGE.WON]:           [],
});

const GATES = Object.freeze({
  [`${CRM_STAGE.NEW}→${CRM_STAGE.QUALIFIED}`]:             'Must have opportunityScore > 0',
  [`${CRM_STAGE.PROPOSAL_SENT}→${CRM_STAGE.WON}`]:         'Requires explicit confirmation signal',
  [`${CRM_STAGE.NEGOTIATION}→${CRM_STAGE.WON}`]:           'Requires explicit confirmation signal',
  [`${CRM_STAGE.WAITING_CLIENT}→${CRM_STAGE.WON}`]:        'Requires explicit confirmation signal',
  [`${CRM_STAGE.LOST}→${CRM_STAGE.NEW}`]:                  'Requires explicit reopening',
});

export function canTransitionSalesStage(fromStage = '', toStage = '') {
  if (fromStage === toStage) {
    return Object.freeze({ allowed: false, reason: 'Already in this stage', isReal: false });
  }
  if (TERMINAL_STAGES.includes(fromStage) && fromStage === CRM_STAGE.WON) {
    return Object.freeze({ allowed: false, reason: 'WON is a terminal stage — cannot transition out', isReal: false });
  }
  const allowed = (ALLOWED_FORWARD[fromStage] ?? []).includes(toStage);
  if (!allowed) {
    return Object.freeze({
      allowed: false,
      reason: `Transition ${fromStage}→${toStage} not allowed`,
      isReal: false,
    });
  }
  const gateKey = `${fromStage}→${toStage}`;
  const gate = GATES[gateKey];
  const gateNote = gate ? `Gate: ${gate}` : null;
  return Object.freeze({ allowed: true, reason: null, gateNote, isReal: false });
}

export function getValidNextStages(currentStage = '') {
  return Object.freeze(ALLOWED_FORWARD[currentStage] ?? []);
}

export const STAGE_TRANSITION_VERSION = '1.0.0';
