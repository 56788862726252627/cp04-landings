// Deal Value Estimate — ADV-09 CRM

export const VALUE_CONFIDENCE = Object.freeze({
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
});

export function createDealValueEstimate(fields = {}) {
  const setupLow    = fields.setupLow ?? 0;
  const setupHigh   = fields.setupHigh ?? 0;
  const monthlyLow  = fields.monthlyLow ?? 0;
  const monthlyHigh = fields.monthlyHigh ?? 0;
  const months      = fields.contractMonths ?? 12;

  const acvLow  = setupLow  + monthlyLow  * months;
  const acvHigh = setupHigh + monthlyHigh * months;
  const acvMid  = Math.round((acvLow + acvHigh) / 2);

  const probability = fields.probability ?? 0.5;
  const weightedValue = Math.round(acvMid * probability);

  return Object.freeze({
    id:             fields.id ?? `dve_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    opportunityId:  fields.opportunityId ?? '',
    setupLow,
    setupCentral:   fields.setupCentral ?? Math.round((setupLow + setupHigh) / 2),
    setupHigh,
    monthlyLow,
    monthlyCentral: fields.monthlyCentral ?? Math.round((monthlyLow + monthlyHigh) / 2),
    monthlyHigh,
    contractMonths: months,
    acvLow,
    acvCentral:     acvMid,
    acvHigh,
    probability,
    weightedValue,
    confidence:     fields.confidence ?? VALUE_CONFIDENCE.MEDIUM,
    note:           'Estimate only — not a committed contract value.',
    isReal: false,
  });
}

export const DEAL_VALUE_VERSION = '1.0.0';
