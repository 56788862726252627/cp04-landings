// Win/Loss Fixtures — ADV-09 CRM

import { createLostDealAnalysis, LOSS_REASON } from '../lostDealAnalysis.js';
import { createWonDealHandoff, HANDOFF_STATUS } from '../wonDealHandoff.js';

export const WIN_FIXTURES = Object.freeze([
  createWonDealHandoff({ id: 'win_001', dealId: 'deal_001', opportunityId: 'opp_011', businessName: 'Fisioterapia Respira', service: 'clinic_management', agreedSetup: 800, agreedMonthly: 149, implementationWeeks: 3, status: HANDOFF_STATUS.IN_PROGRESS }),
  createWonDealHandoff({ id: 'win_002', dealId: 'deal_002', opportunityId: 'opp_013', businessName: 'Centro Nutrición Equilibra', service: 'nutrition_saas', agreedSetup: 600, agreedMonthly: 99,  implementationWeeks: 2, status: HANDOFF_STATUS.PENDING }),
]);

export const LOSS_FIXTURES = Object.freeze([
  createLostDealAnalysis({ id: 'loss_001', opportunityId: 'opp_012', businessName: 'Academia Idiomas Plus',   lossReason: LOSS_REASON.PRICE_TOO_HIGH,    competitorChosen: 'N/A',   couldReopen: true,  reopenCondition: 'Price reduced below 80€/month' }),
  createLostDealAnalysis({ id: 'loss_002', opportunityId: 'opp_014', businessName: 'Autoescuela Rumbo',       lossReason: LOSS_REASON.NO_DECISION,       competitorChosen: '',      couldReopen: false }),
  createLostDealAnalysis({ id: 'loss_003', opportunityId: 'opp_015', businessName: 'Taller Mecánica Rápida',  lossReason: LOSS_REASON.POOR_FIT,          competitorChosen: '',      couldReopen: false }),
  createLostDealAnalysis({ id: 'loss_004', opportunityId: 'opp_016', businessName: 'Panadería Artesanal El Horno', lossReason: LOSS_REASON.NO_BUDGET,   competitorChosen: '',      couldReopen: true,  reopenCondition: 'Budget cycle next year' }),
]);
