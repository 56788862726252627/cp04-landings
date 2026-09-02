// Sales Pipeline — ADV-09 CRM

export const CRM_STAGE = Object.freeze({
  NEW:           'NEW',
  RESEARCH:      'RESEARCH',
  QUALIFIED:     'QUALIFIED',
  DISCOVERY:     'DISCOVERY',
  SOLUTION_FIT:  'SOLUTION_FIT',
  PROPOSAL_PREP: 'PROPOSAL_PREP',
  PROPOSAL_SENT: 'PROPOSAL_SENT',
  NEGOTIATION:   'NEGOTIATION',
  WAITING_CLIENT:'WAITING_CLIENT',
  WON:           'WON',
  LOST:          'LOST',
  NURTURE:       'NURTURE',
});

export const STAGE_ORDER = Object.freeze([
  CRM_STAGE.NEW, CRM_STAGE.RESEARCH, CRM_STAGE.QUALIFIED,
  CRM_STAGE.DISCOVERY, CRM_STAGE.SOLUTION_FIT,
  CRM_STAGE.PROPOSAL_PREP, CRM_STAGE.PROPOSAL_SENT,
  CRM_STAGE.NEGOTIATION, CRM_STAGE.WAITING_CLIENT,
  CRM_STAGE.WON,
]);

export const TERMINAL_STAGES = Object.freeze([CRM_STAGE.WON, CRM_STAGE.LOST]);
export const ACTIVE_STAGES   = Object.freeze([
  CRM_STAGE.NEW, CRM_STAGE.RESEARCH, CRM_STAGE.QUALIFIED,
  CRM_STAGE.DISCOVERY, CRM_STAGE.SOLUTION_FIT,
  CRM_STAGE.PROPOSAL_PREP, CRM_STAGE.PROPOSAL_SENT,
  CRM_STAGE.NEGOTIATION, CRM_STAGE.WAITING_CLIENT,
]);

export function createSalesPipeline(options = {}) {
  return Object.freeze({
    id:          options.id ?? `pipeline_${Date.now()}`,
    name:        options.name ?? 'Agency Commercial Pipeline',
    stages:      STAGE_ORDER,
    staleThresholdDays: Object.freeze({
      [CRM_STAGE.NEW]:           7,
      [CRM_STAGE.RESEARCH]:      10,
      [CRM_STAGE.QUALIFIED]:     14,
      [CRM_STAGE.DISCOVERY]:     14,
      [CRM_STAGE.SOLUTION_FIT]:  14,
      [CRM_STAGE.PROPOSAL_PREP]: 10,
      [CRM_STAGE.PROPOSAL_SENT]: 7,
      [CRM_STAGE.NEGOTIATION]:   10,
      [CRM_STAGE.WAITING_CLIENT]:21,
    }),
    createdAt: new Date().toISOString(),
    isReal: false,
  });
}

export function getStageIndex(stage = '') {
  return STAGE_ORDER.indexOf(stage);
}

export function isTerminalStage(stage = '') {
  return TERMINAL_STAGES.includes(stage);
}

export function isActiveStage(stage = '') {
  return ACTIVE_STAGES.includes(stage);
}

export const SALES_PIPELINE_VERSION = '1.0.0';
