// Media Automation Manifest — ADV-13

export const AUTOMATION_EVENT = Object.freeze({
  MEDIA_DRAFT_CREATED:    'MEDIA_DRAFT_CREATED',
  MEDIA_APPROVED:         'MEDIA_APPROVED',
  MEDIA_PUBLISHED:        'MEDIA_PUBLISHED',
  MEDIA_REVIEW_REQUESTED: 'MEDIA_REVIEW_REQUESTED',
  MEDIA_QA_FAILED:        'MEDIA_QA_FAILED',
});

export function createAutomationManifest(config = {}) {
  if (!config.projectId) throw new Error('AutomationManifest requires projectId');
  return Object.freeze({
    projectId:    config.projectId,
    events:       Object.freeze(config.events ?? []),
    makeScenario: config.makeScenario ?? null,
    webhookRef:   config.webhookRef   ?? null,
    noRealTrigger: true,
    isReal: false,
  });
}

export const MEDIA_AUTOMATION_MANIFEST_VERSION = '1.0.0';
