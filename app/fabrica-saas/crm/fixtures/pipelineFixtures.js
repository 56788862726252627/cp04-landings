// Pipeline Fixtures — ADV-09 CRM (fictional opportunities)

import { createCRMOpportunity } from '../crmOpportunity.js';
import { CRM_STAGE } from '../salesPipeline.js';

export const PIPELINE_FIXTURE_COUNT = 12;

const RAW = [
  { id: 'opp_001', businessName: 'FisioActiva Madrid',    stage: CRM_STAGE.NEGOTIATION,   probability: 0.80, acv: 2800  },
  { id: 'opp_002', businessName: 'Clínica Óptica Norte',  stage: CRM_STAGE.PROPOSAL_SENT, probability: 0.60, acv: 1800  },
  { id: 'opp_003', businessName: 'Gym Force Málaga',      stage: CRM_STAGE.DISCOVERY,     probability: 0.40, acv: 3200  },
  { id: 'opp_004', businessName: 'Dental Sonrisa Blanca', stage: CRM_STAGE.QUALIFIED,     probability: 0.30, acv: 2200  },
  { id: 'opp_005', businessName: 'Pilates Cuerpo Libre',  stage: CRM_STAGE.SOLUTION_FIT,  probability: 0.50, acv: 1400  },
  { id: 'opp_006', businessName: 'Consultoría Nexo Legal',stage: CRM_STAGE.WAITING_CLIENT,probability: 0.75, acv: 4800  },
  { id: 'opp_007', businessName: 'Clinica Dental Arco Iris', stage: CRM_STAGE.PROPOSAL_PREP, probability: 0.55, acv: 2600 },
  { id: 'opp_008', businessName: 'Centro Nutrición Equilibra', stage: CRM_STAGE.NEGOTIATION, probability: 0.85, acv: 2100 },
  { id: 'opp_009', businessName: 'Clínica Deportiva Sprint',   stage: CRM_STAGE.PROPOSAL_SENT, probability: 0.65, acv: 3600 },
  { id: 'opp_010', businessName: 'Estudio Pilates Core',  stage: CRM_STAGE.DISCOVERY,     probability: 0.35, acv: 1600  },
  { id: 'opp_011', businessName: 'Fisioterapia Respira',  stage: CRM_STAGE.WON,           probability: 1.00, acv: 2400  },
  { id: 'opp_012', businessName: 'Academia Idiomas Plus', stage: CRM_STAGE.LOST,          probability: 0.00, acv: 1200  },
];

export const PIPELINE_FIXTURE_OPPORTUNITIES = Object.freeze(
  RAW.map(r => createCRMOpportunity({
    id:           r.id,
    crmLeadId:    `crm_lead_${r.id}`,
    businessName: r.businessName,
    stage:        r.stage,
    closeWindowDays: 60,
    dealValueEstimate: Object.freeze({
      acvCentral: r.acv,
      probability: r.probability,
      weightedValue: Math.round(r.acv * r.probability),
    }),
  }))
);
