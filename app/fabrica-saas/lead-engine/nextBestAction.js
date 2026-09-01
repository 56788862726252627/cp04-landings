// Next Best Action — ADV-08

export const NEXT_ACTION = Object.freeze({
  RESEARCH_MORE:      'RESEARCH_MORE',
  QUALIFY:            'QUALIFY',
  PREPARE_OUTREACH:   'PREPARE_OUTREACH',
  NURTURE:            'NURTURE',
  DEFER:              'DEFER',
  IGNORE:             'IGNORE',
  MANUAL_REVIEW:      'MANUAL_REVIEW',
});

export function recommendNextBestAction(lead = {}) {
  const score   = lead.opportunityScore   ?? 0;
  const quality = lead.dataQualityScore   ?? 0;
  const conf    = lead.confidence         ?? 0;
  const temp    = lead.temperature        ?? 'COLD';

  let action, rationale;

  if (quality < 30) {
    action    = NEXT_ACTION.RESEARCH_MORE;
    rationale = 'Data quality too low to score accurately — find website and contact info first';
  } else if (conf < 30 && score >= 50) {
    action    = NEXT_ACTION.MANUAL_REVIEW;
    rationale = 'Score is promising but confidence is low — human review needed';
  } else if (temp === 'HOT' && quality >= 50) {
    action    = NEXT_ACTION.PREPARE_OUTREACH;
    rationale = 'Hot lead with sufficient data — prepare outreach context';
  } else if (temp === 'WARM') {
    action    = NEXT_ACTION.QUALIFY;
    rationale = 'Warm lead — qualify needs and verify service fit before outreach';
  } else if (temp === 'COLD' && score >= 40) {
    action    = NEXT_ACTION.NURTURE;
    rationale = 'Cold but above threshold — nurture with content or wait for signals';
  } else if (score < 20) {
    action    = NEXT_ACTION.IGNORE;
    rationale = 'Score too low — deprioritize unless signals improve';
  } else {
    action    = NEXT_ACTION.DEFER;
    rationale = 'No immediate action warranted — revisit in next cycle';
  }

  return Object.freeze({
    action,
    rationale,
    note: 'NO real outreach will be triggered — this is a recommendation only.',
    isReal: false,
  });
}

export const NEXT_BEST_ACTION_VERSION = '1.0.0';
