// Media Human Approval Policy — ADV-13

export const MEDIA_APPROVAL_TRIGGER = Object.freeze({
  SOCIAL_PUBLISH:     'SOCIAL_PUBLISH',
  AD_SPEND:           'AD_SPEND',
  REAL_PERSON_AVATAR: 'REAL_PERSON_AVATAR',
  CLONED_VOICE:       'CLONED_VOICE',
  SENSITIVE_CLAIM:    'SENSITIVE_CLAIM',
  LEGAL_MEDICAL:      'LEGAL_MEDICAL',
  REAL_COST:          'REAL_COST',
  OUTBOUND_CAMPAIGN:  'OUTBOUND_CAMPAIGN',
});

export function evaluateMediaApproval(project = {}, approvedByHuman = false) {
  const triggers = [];
  if (project.channel && ['TIKTOK','INSTAGRAM_REEL','INSTAGRAM_STORY','FACEBOOK','YOUTUBE_SHORT','YOUTUBE','LINKEDIN','X'].includes(project.channel)) {
    triggers.push(MEDIA_APPROVAL_TRIGGER.SOCIAL_PUBLISH);
  }
  if (project.avatarProfile?.isRealPerson) triggers.push(MEDIA_APPROVAL_TRIGGER.REAL_PERSON_AVATAR);
  if (project.voiceProfile?.consentRequired) triggers.push(MEDIA_APPROVAL_TRIGGER.CLONED_VOICE);
  if (project.costPlan?.totalEstimatedCents > 0) triggers.push(MEDIA_APPROVAL_TRIGGER.REAL_COST);
  if (project.vertical === 'LEGAL' || project.vertical === 'DENTAL_CLINIC') triggers.push(MEDIA_APPROVAL_TRIGGER.LEGAL_MEDICAL);

  const required = triggers.length > 0;
  if (required && !approvedByHuman) {
    return Object.freeze({ allowed: false, required: true, triggers: Object.freeze(triggers), isReal: false });
  }
  return Object.freeze({ allowed: true, required, triggers: Object.freeze(triggers), isReal: false });
}

export const MEDIA_HUMAN_APPROVAL_POLICY_VERSION = '1.0.0';
