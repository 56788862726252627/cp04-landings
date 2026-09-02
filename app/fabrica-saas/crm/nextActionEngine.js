// CRM Next Action Engine — ADV-09 CRM

import { CRM_STAGE } from './salesPipeline.js';

export const CRM_NEXT_ACTION = Object.freeze({
  RESEARCH:          'RESEARCH',
  QUALIFY:           'QUALIFY',
  PREPARE_DISCOVERY: 'PREPARE_DISCOVERY',
  PREPARE_PROPOSAL:  'PREPARE_PROPOSAL',
  FOLLOW_UP:         'FOLLOW_UP',
  WAIT:              'WAIT',
  NURTURE:           'NURTURE',
  MANUAL_REVIEW:     'MANUAL_REVIEW',
  CLOSE_WON:         'CLOSE_WON',
  CLOSE_LOST:        'CLOSE_LOST',
});

export function recommendCRMNextAction(opportunity = {}) {
  const { stage, dataQualityScore = 0, staleAt, lastActivityAt } = opportunity;

  let action = CRM_NEXT_ACTION.MANUAL_REVIEW;
  let reason = 'Low confidence — manual review recommended';

  const isStale = staleAt && new Date(staleAt) < new Date();
  const daysSinceActivity = lastActivityAt
    ? Math.floor((Date.now() - new Date(lastActivityAt).getTime()) / 86400000)
    : 999;

  if (stage === CRM_STAGE.WON) {
    action = CRM_NEXT_ACTION.CLOSE_WON;
    reason = 'Deal is won — trigger onboarding handoff';
  } else if (stage === CRM_STAGE.LOST) {
    action = CRM_NEXT_ACTION.CLOSE_LOST;
    reason = 'Deal is lost — analyze and archive';
  } else if (stage === CRM_STAGE.NURTURE) {
    action = CRM_NEXT_ACTION.NURTURE;
    reason = 'In nurture — low-cadence follow-up only';
  } else if (dataQualityScore < 35) {
    action = CRM_NEXT_ACTION.RESEARCH;
    reason = 'Data quality insufficient — research before action';
  } else if ([CRM_STAGE.NEW, CRM_STAGE.RESEARCH].includes(stage)) {
    action = CRM_NEXT_ACTION.QUALIFY;
    reason = 'Early stage — qualify the opportunity';
  } else if (stage === CRM_STAGE.QUALIFIED) {
    action = CRM_NEXT_ACTION.PREPARE_DISCOVERY;
    reason = 'Qualified — prepare discovery session';
  } else if ([CRM_STAGE.DISCOVERY, CRM_STAGE.SOLUTION_FIT].includes(stage)) {
    action = CRM_NEXT_ACTION.PREPARE_PROPOSAL;
    reason = 'Discovery complete — prepare proposal';
  } else if (stage === CRM_STAGE.PROPOSAL_PREP) {
    action = CRM_NEXT_ACTION.PREPARE_PROPOSAL;
    reason = 'Finish proposal preparation';
  } else if ([CRM_STAGE.PROPOSAL_SENT, CRM_STAGE.NEGOTIATION].includes(stage)) {
    action = daysSinceActivity > 5 ? CRM_NEXT_ACTION.FOLLOW_UP : CRM_NEXT_ACTION.WAIT;
    reason = daysSinceActivity > 5 ? 'No activity — follow up' : 'Proposal sent — wait for response';
  } else if (stage === CRM_STAGE.WAITING_CLIENT) {
    action = daysSinceActivity > 14 ? CRM_NEXT_ACTION.FOLLOW_UP : CRM_NEXT_ACTION.WAIT;
    reason = daysSinceActivity > 14 ? 'Waiting too long — follow up' : 'Awaiting client decision';
  }

  return Object.freeze({
    action,
    reason,
    stage,
    isStale: !!isStale,
    daysSinceActivity,
    note: 'Recommendation only — no external action triggered automatically.',
    isReal: false,
  });
}

export const NEXT_ACTION_ENGINE_VERSION = '1.0.0';
