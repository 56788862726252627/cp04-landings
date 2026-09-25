// Social Publish Plan — ADV-13
// NO_REAL_SOCIAL_PUBLISH=SI — all plans are simulated/dry-run only

export const PUBLISH_STATUS = Object.freeze({
  DRAFT:            'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED:         'APPROVED',
  SCHEDULED:        'SCHEDULED',
  PUBLISHED:        'PUBLISHED',
  BLOCKED:          'BLOCKED',
});

export function createSocialPublishPlan(config = {}) {
  if (!config.projectId) throw new Error('SocialPublishPlan requires projectId');
  return Object.freeze({
    projectId:         config.projectId,
    channel:           config.channel ?? null,
    scheduledAt:       config.scheduledAt ?? null,
    caption:           config.caption ?? '',
    hashtags:          Object.freeze(config.hashtags ?? []),
    status:            PUBLISH_STATUS.DRAFT,
    noRealPublish:     true,
    requiresHumanApproval: true,
    isReal: false,
  });
}

export const SOCIAL_PUBLISH_PLAN_VERSION = '1.0.0';
