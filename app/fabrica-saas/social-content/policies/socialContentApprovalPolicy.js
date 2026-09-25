// Social Content Approval Policy — defines when human approval is required

export const SOCIAL_APPROVAL_TRIGGER = Object.freeze({
  REAL_SOCIAL_PUBLISH: 'REAL_SOCIAL_PUBLISH',
  AD_SPEND:            'AD_SPEND',
  SENSITIVE_CLAIM:     'SENSITIVE_CLAIM',
  LEGAL_MEDICAL:       'LEGAL_MEDICAL',
  CAMPAIGN_LAUNCH:     'CAMPAIGN_LAUNCH',
  REAL_COST:           'REAL_COST',
  REAL_OUTREACH:       'REAL_OUTREACH',
  INFLUENCER_COLLAB:   'INFLUENCER_COLLAB',
});

export function evaluateSocialApproval(config = {}, approvedByHuman = false) {
  const triggers = [];

  if (config.targetChannel && config.noRealPublish !== true) {
    triggers.push(SOCIAL_APPROVAL_TRIGGER.REAL_SOCIAL_PUBLISH);
  }
  if (config.adsEnabled === true) {
    triggers.push(SOCIAL_APPROVAL_TRIGGER.AD_SPEND);
  }
  if (config.hasSensitiveClaim === true) {
    triggers.push(SOCIAL_APPROVAL_TRIGGER.SENSITIVE_CLAIM);
  }
  if (config.sector === 'clinica' || config.sector === 'fisioterapia') {
    triggers.push(SOCIAL_APPROVAL_TRIGGER.LEGAL_MEDICAL);
  }
  if (config.isCampaignLaunch === true) {
    triggers.push(SOCIAL_APPROVAL_TRIGGER.CAMPAIGN_LAUNCH);
  }
  if (config.hasRealCost === true) {
    triggers.push(SOCIAL_APPROVAL_TRIGGER.REAL_COST);
  }

  const requiresApproval = triggers.length > 0;
  const allowed          = !requiresApproval || approvedByHuman;

  return Object.freeze({
    requiresApproval,
    triggers:        Object.freeze(triggers),
    approvedByHuman,
    allowed,
    isReal:          false,
  });
}
