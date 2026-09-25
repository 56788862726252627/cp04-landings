// AI Media Project — ADV-13

export const MEDIA_PROJECT_STATUS = Object.freeze({
  DRAFT:            'DRAFT',
  READY:            'READY',
  WAITING_APPROVAL: 'WAITING_APPROVAL',
  GENERATING:       'GENERATING',
  GENERATED:        'GENERATED',
  QA_FAILED:        'QA_FAILED',
  APPROVED:         'APPROVED',
  BLOCKED:          'BLOCKED',
});

export function createAIMediaProject(config = {}) {
  if (!config.id)         throw new Error('AIMediaProject requires id');
  if (!config.clientId)   throw new Error('AIMediaProject requires clientId');
  if (!config.businessId) throw new Error('AIMediaProject requires businessId');
  return Object.freeze({
    id:             config.id,
    clientId:       config.clientId,
    businessId:     config.businessId,
    vertical:       config.vertical        ?? null,
    brandProfile:   config.brandProfile    ?? null,
    objective:      config.objective       ?? null,
    audience:       config.audience        ?? null,
    channel:        config.channel         ?? null,
    format:         config.format          ?? null,
    duration:       config.duration        ?? null,
    language:       config.language        ?? 'es-ES',
    avatarProfile:  config.avatarProfile   ?? null,
    voiceProfile:   config.voiceProfile    ?? null,
    script:         config.script          ?? null,
    visualPlan:     config.visualPlan      ?? null,
    cta:            config.cta             ?? null,
    status:         config.status          ?? MEDIA_PROJECT_STATUS.DRAFT,
    providerPlan:   config.providerPlan    ?? null,
    costPlan:       config.costPlan        ?? null,
    approvalState:  config.approvalState   ?? 'PENDING',
    outputAssets:   Object.freeze(config.outputAssets ?? []),
    createdAt:      config.createdAt       ?? null,
    isReal: false,
  });
}

export const AI_MEDIA_PROJECT_VERSION = '1.0.0';
