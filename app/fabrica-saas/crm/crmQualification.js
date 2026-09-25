// CRM Qualification — ADV-09 CRM

import { CRM_STAGE } from './salesPipeline.js';

export const QUALIFICATION_CRITERION = Object.freeze({
  BUDGET_CONFIRMED:   'BUDGET_CONFIRMED',
  AUTHORITY_VERIFIED: 'AUTHORITY_VERIFIED',
  NEED_IDENTIFIED:    'NEED_IDENTIFIED',
  TIMELINE_AGREED:    'TIMELINE_AGREED',
  FIT_ASSESSED:       'FIT_ASSESSED',
  COMPETITIVE_KNOWN:  'COMPETITIVE_KNOWN',
});

export const QUAL_WEIGHT = Object.freeze({
  [QUALIFICATION_CRITERION.NEED_IDENTIFIED]:    30,
  [QUALIFICATION_CRITERION.BUDGET_CONFIRMED]:   25,
  [QUALIFICATION_CRITERION.AUTHORITY_VERIFIED]: 20,
  [QUALIFICATION_CRITERION.TIMELINE_AGREED]:    15,
  [QUALIFICATION_CRITERION.FIT_ASSESSED]:       7,
  [QUALIFICATION_CRITERION.COMPETITIVE_KNOWN]:  3,
});

export function scoreQualification(criteria = {}) {
  let score = 0;
  for (const [key, weight] of Object.entries(QUAL_WEIGHT)) {
    if (criteria[key]) score += weight;
  }
  return score;
}

export function createQualificationProfile(fields = {}) {
  const criteria = {
    [QUALIFICATION_CRITERION.BUDGET_CONFIRMED]:   fields.budgetConfirmed ?? false,
    [QUALIFICATION_CRITERION.AUTHORITY_VERIFIED]: fields.authorityVerified ?? false,
    [QUALIFICATION_CRITERION.NEED_IDENTIFIED]:    fields.needIdentified ?? false,
    [QUALIFICATION_CRITERION.TIMELINE_AGREED]:    fields.timelineAgreed ?? false,
    [QUALIFICATION_CRITERION.FIT_ASSESSED]:       fields.fitAssessed ?? false,
    [QUALIFICATION_CRITERION.COMPETITIVE_KNOWN]:  fields.competitiveKnown ?? false,
  };
  const score       = scoreQualification(criteria);
  const isQualified = score >= 55;
  const readyFor    = isQualified ? CRM_STAGE.DISCOVERY : CRM_STAGE.RESEARCH;

  return Object.freeze({
    opportunityId: fields.opportunityId ?? '',
    criteria:      Object.freeze(criteria),
    score,
    isQualified,
    readyFor,
    qualifiedAt:   isQualified ? (fields.qualifiedAt ?? new Date().toISOString()) : null,
    isReal: false,
  });
}

export const QUALIFICATION_VERSION = '1.0.0';
