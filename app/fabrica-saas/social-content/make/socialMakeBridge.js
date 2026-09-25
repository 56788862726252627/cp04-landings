// Social Make Bridge — DRY_RUN_ONLY, never fires real Make webhooks

import { createSocialMakePayload } from './socialMakePayload.js';
import { SOCIAL_AUTOMATION_STATUS, evaluateSocialAutomationStatus } from './socialAutomationStatus.js';

export const MAKE_BRIDGE_MODE = Object.freeze({
  DRY_RUN:  'DRY_RUN',
  BLOCKED:  'BLOCKED',
});

export function runSocialMakePipeline(config = {}) {
  if (!config.businessId) throw new Error('runSocialMakePipeline requires businessId');
  if (!config.clientId)   throw new Error('runSocialMakePipeline requires clientId');
  if (!config.post)       throw new Error('runSocialMakePipeline requires post');

  // Safety: real webhooks are NEVER called
  if (config.executeReal === true) {
    throw new Error('SocialMakeBridge: executeReal=true is not allowed — DRY_RUN_ONLY');
  }

  const automationStatus = evaluateSocialAutomationStatus({
    noRealPublish:    true,
    approvedByHuman:  config.approvedByHuman ?? false,
    requiresApproval: config.requiresApproval ?? false,
    channelAuthStatus: config.channelAuthStatus ?? 'NOT_CONNECTED',
    readyForDryRun:   config.approvedByHuman === true,
  });

  if (automationStatus.status === SOCIAL_AUTOMATION_STATUS.BLOCKED) {
    return Object.freeze({
      mode:   MAKE_BRIDGE_MODE.BLOCKED,
      status: automationStatus.status,
      reason: automationStatus.reason,
      isReal: false,
    });
  }

  const payload = createSocialMakePayload({
    businessId:   config.businessId,
    clientId:     config.clientId,
    channel:      config.post.channel,
    postContent: {
      text:     config.post.fullText   ?? config.post.body ?? '',
      hashtags: config.post.hashtags   ?? [],
      mediaRef: config.post.mediaRef   ?? null,
      hook:     config.post.hook       ?? null,
      cta:      config.post.cta        ?? null,
    },
    scheduledDate: config.scheduledDate ?? null,
    scheduledTime: config.scheduledTime ?? null,
    objective:     config.post.objective ?? null,
    pillar:        config.post.pillar    ?? null,
    webhookRef:    config.webhookRef     ?? null,
  });

  return Object.freeze({
    mode:           MAKE_BRIDGE_MODE.DRY_RUN,
    status:         automationStatus.status,
    payload,
    dryRun:         true,
    noRealWebhook:  true,
    noRealPublish:  true,
    adv14Bridge:    'SOCIAL_MAKE_BRIDGE_CONNECTED',
    isReal:         false,
  });
}
