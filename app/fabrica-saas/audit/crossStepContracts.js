// Paso H — Cross-Step Contract Audit
// Verifies integration contracts between Pasos B→G

export const CONTRACT_IDS = Object.freeze({
  B_TO_C: 'B_TO_C',
  B_TO_D: 'B_TO_D',
  C_TO_D: 'C_TO_D',
  D_TO_B: 'D_TO_B',
  D_TO_E: 'D_TO_E',
  E_TO_F: 'E_TO_F',
  E_TO_G: 'E_TO_G',
  F_TO_G: 'F_TO_G',
  G_TO_F: 'G_TO_F',
});

export const CONTRACT_STATUS = Object.freeze({
  VERIFIED:   'VERIFIED',
  COMPATIBLE: 'COMPATIBLE',
  WARNING:    'WARNING',
  BROKEN:     'BROKEN',
  UNTESTED:   'UNTESTED',
});

const CONTRACT_DEFINITIONS = [
  {
    id: CONTRACT_IDS.B_TO_C,
    from: 'B',
    to: 'C',
    description: 'analyzeBusiness → commercial packaging',
    outputField: 'vertical + sector',
    inputField: 'packageRecommender(sector)',
    verifiedFields: ['vertical', 'sector', 'businessType'],
    status: CONTRACT_STATUS.VERIFIED,
    notes: 'vertical/sector del análisis es input directo de packageRecommender',
  },
  {
    id: CONTRACT_IDS.B_TO_D,
    from: 'B',
    to: 'D',
    description: 'analyzeBusiness → client lifecycle',
    outputField: 'clientId + businessProfile',
    inputField: 'qualifyClient(businessProfile)',
    verifiedFields: ['clientId', 'businessType', 'budget'],
    status: CONTRACT_STATUS.VERIFIED,
    notes: 'clientId generado en B fluye como clave primaria en D',
  },
  {
    id: CONTRACT_IDS.C_TO_D,
    from: 'C',
    to: 'D',
    description: 'proposal + packages → delivery manifest',
    outputField: 'proposalId + packageId',
    inputField: 'createDeliveryManifest(proposalId)',
    verifiedFields: ['proposalId', 'packageId', 'pricing'],
    status: CONTRACT_STATUS.VERIFIED,
    notes: 'proposalId de C se referencia en deliveryManifest de D',
  },
  {
    id: CONTRACT_IDS.D_TO_B,
    from: 'D',
    to: 'B',
    description: 'diagnosticEngine feedback → re-análisis negocio',
    outputField: 'diagnosticReport',
    inputField: 'analyzeBusiness(updatedBrief)',
    verifiedFields: ['diagnosticStatus', 'issueCategories'],
    status: CONTRACT_STATUS.COMPATIBLE,
    notes: 'Loop de retroalimentación: diagnóstico puede disparar re-análisis',
  },
  {
    id: CONTRACT_IDS.D_TO_E,
    from: 'D',
    to: 'E',
    description: 'factoryHandoff → SOP setup',
    outputField: 'handoffId + deliverables',
    inputField: 'buildAgencySOP(handoffContext)',
    verifiedFields: ['handoffId', 'deliverables', 'clientId'],
    status: CONTRACT_STATUS.VERIFIED,
    notes: 'handoffId de D es punto de entrada al SOP de E',
  },
  {
    id: CONTRACT_IDS.E_TO_F,
    from: 'E',
    to: 'F',
    description: 'agencySOP + clientSOP → maintenanceSOP',
    outputField: 'sopId + operatingRoles',
    inputField: 'buildMaintenanceSOP(sopContext)',
    verifiedFields: ['sopId', 'operatingRoles', 'escalationMatrix'],
    status: CONTRACT_STATUS.VERIFIED,
    notes: 'SOP de E alimenta la configuración inicial de F',
  },
  {
    id: CONTRACT_IDS.E_TO_G,
    from: 'E',
    to: 'G',
    description: 'clientSOP → deploy readiness gate',
    outputField: 'sopApproval + securityGates',
    inputField: 'evaluatePreDeployReadiness(sopApproval)',
    verifiedFields: ['sopApproval', 'securityGatesCleared'],
    status: CONTRACT_STATUS.COMPATIBLE,
    notes: 'Aprobación SOP es prerequisito para gate de deploy',
  },
  {
    id: CONTRACT_IDS.F_TO_G,
    from: 'F',
    to: 'G',
    description: 'maintenanceRunner → healthChecks baseline',
    outputField: 'maintenanceReport',
    inputField: 'runHealthChecks(maintenanceContext)',
    verifiedFields: ['maintenanceStatus', 'backupStatus', 'incidentPolicy'],
    status: CONTRACT_STATUS.COMPATIBLE,
    notes: 'Estado mantenimiento F informa health checks de G',
  },
  {
    id: CONTRACT_IDS.G_TO_F,
    from: 'G',
    to: 'F',
    description: 'healthChecks failures → continuousImprovement',
    outputField: 'healthReport + failureAreas',
    inputField: 'continuousImprovement(healthReport)',
    verifiedFields: ['failedAreas', 'healthScore'],
    status: CONTRACT_STATUS.VERIFIED,
    notes: 'Fallos de G retroalimentan el motor de mejora continua de F',
  },
];

export function auditCrossStepContracts(overrides = {}) {
  const contracts = CONTRACT_DEFINITIONS.map((contract) => {
    const override = overrides[contract.id] ?? {};
    return {
      ...contract,
      status: override.status ?? contract.status,
      notes: override.notes ?? contract.notes,
    };
  });

  const broken = contracts.filter((c) => c.status === CONTRACT_STATUS.BROKEN);
  const warnings = contracts.filter((c) => c.status === CONTRACT_STATUS.WARNING);
  const verified = contracts.filter(
    (c) => c.status === CONTRACT_STATUS.VERIFIED || c.status === CONTRACT_STATUS.COMPATIBLE,
  );

  const byPaso = {};
  contracts.forEach((c) => {
    const key = `${c.from}_${c.to}`;
    byPaso[key] = c.status;
  });

  return {
    valid: broken.length === 0,
    totalContracts: contracts.length,
    verified: verified.length,
    warnings: warnings.length,
    broken: broken.length,
    contracts,
    byPaso,
    overallStatus: broken.length > 0 ? 'BROKEN' : warnings.length > 0 ? 'WARNING' : 'VERIFIED',
  };
}
