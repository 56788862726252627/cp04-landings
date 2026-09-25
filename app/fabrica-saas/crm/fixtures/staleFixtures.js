// Stale Fixtures — ADV-09 CRM (fictional opportunities with varying staleness)

import { CRM_STAGE } from '../salesPipeline.js';

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export const STALE_FIXTURE_COUNT = 6;

export const STALE_FIXTURES = Object.freeze([
  Object.freeze({ id: 'stale_001', businessName: 'FisioActiva Madrid',     stage: CRM_STAGE.NEGOTIATION,    lastActivityAt: daysAgo(3),  isReal: false }),
  Object.freeze({ id: 'stale_002', businessName: 'Dental Sonrisa Blanca',  stage: CRM_STAGE.PROPOSAL_SENT,  lastActivityAt: daysAgo(12), isReal: false }),
  Object.freeze({ id: 'stale_003', businessName: 'Gym Force Málaga',       stage: CRM_STAGE.DISCOVERY,      lastActivityAt: daysAgo(22), isReal: false }),
  Object.freeze({ id: 'stale_004', businessName: 'Consultoría Nexo Legal', stage: CRM_STAGE.WAITING_CLIENT, lastActivityAt: daysAgo(35), isReal: false }),
  Object.freeze({ id: 'stale_005', businessName: 'Pilates Cuerpo Libre',   stage: CRM_STAGE.NURTURE,        lastActivityAt: daysAgo(55), isReal: false }),
  Object.freeze({ id: 'stale_006', businessName: 'AutoMáquina Sevilla',    stage: CRM_STAGE.QUALIFIED,      lastActivityAt: daysAgo(45), isReal: false }),
]);
