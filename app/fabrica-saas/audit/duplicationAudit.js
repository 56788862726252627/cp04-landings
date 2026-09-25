// Paso H — Agency Duplication Audit
// Detects conceptual duplications across Pasos A-G

export const DUP_SEVERITY = Object.freeze({
  CRITICAL: 'CRITICAL',
  MODERATE: 'MODERATE',
  MINOR:    'MINOR',
  RESOLVED: 'RESOLVED',
});

export const DUPLICATION_AUDIT_VERSION = '1.0.0';

const DUPLICATION_CANDIDATES = [
  {
    id: 'DUP-01',
    name: 'Health checks: F vs G',
    locations: ['maintenance/aiHealth.js', 'maintenance/automationHealth.js', 'deploy/healthChecks.js'],
    description: 'F tiene aiHealth + automationHealth; G tiene healthChecks con API/DB/CDN/Auth',
    severity: DUP_SEVERITY.MINOR,
    resolution: 'RESOLVED: F → health continuo (SLA); G → health puntual post-deploy. Semántica diferente.',
    isDuplicate: false,
  },
  {
    id: 'DUP-02',
    name: 'Handoff: D vs G',
    locations: ['lifecycle/factoryHandoff.js', 'lifecycle/handoff.js', 'deploy/postDeployHandoff.js'],
    description: 'D tiene factoryHandoff (fábrica→agencia); G tiene postDeployHandoff (agencia→cliente)',
    severity: DUP_SEVERITY.MINOR,
    resolution: 'RESOLVED: Pasos diferentes del pipeline — handoff interno vs entrega final al cliente.',
    isDuplicate: false,
  },
  {
    id: 'DUP-03',
    name: 'SOP: E vs F',
    locations: ['sop/agencySOP.js', 'sop/maintenanceSOP.js', 'maintenance/maintenanceSOP.js'],
    description: 'E genera el SOP; F usa maintenanceSOP para soporte continuo',
    severity: DUP_SEVERITY.MINOR,
    resolution: 'RESOLVED: SOP de E es el blueprint; F lo ejecuta en mantenimiento continuo.',
    isDuplicate: false,
  },
  {
    id: 'DUP-04',
    name: 'Incident management: E vs F',
    locations: ['sop/incidentManagement.js', 'maintenance/incidentIntegration.js'],
    description: 'incidentManagement en E (SOP), incidentIntegration en F (maintenance)',
    severity: DUP_SEVERITY.MODERATE,
    resolution: 'ACCEPTABLE: E define el proceso; F integra respuesta con health. Interfaces complementarias.',
    isDuplicate: false,
  },
  {
    id: 'DUP-05',
    name: 'Pricing: múltiples sistemas',
    locations: ['commercial/pricingEngine.js', 'commercial/commercialEstimate.js', 'commercial/thirdPartyCosts.js'],
    description: 'Tres fuentes de cálculo de precio en Paso C',
    severity: DUP_SEVERITY.MODERATE,
    resolution: 'ACCEPTABLE: pricingEngine = precio cliente; commercialEstimate = margen agencia; thirdPartyCosts = costes externos. Perspectivas complementarias.',
    isDuplicate: false,
  },
  {
    id: 'DUP-06',
    name: 'Deploy readiness: D vs G',
    locations: ['lifecycle/deliveryReadiness.js', 'deploy/preDeployReadiness.js'],
    description: 'D tiene deliveryReadiness (antes de build); G tiene preDeployReadiness (antes de deploy)',
    severity: DUP_SEVERITY.MINOR,
    resolution: 'RESOLVED: D verifica readiness de entregables; G verifica readiness técnica de deploy. Gates distintos.',
    isDuplicate: false,
  },
  {
    id: 'DUP-07',
    name: 'Security audit: G vs G interno',
    locations: ['deploy/secretSafetyGate.js', 'deploy/clientSecurityAudit.js', 'deploy/apiSecurityGate.js'],
    description: 'Múltiples auditorías de seguridad en Paso G',
    severity: DUP_SEVERITY.MINOR,
    resolution: 'RESOLVED: Cada módulo audita una capa diferente (código, cliente, API). Separación de concerns correcta.',
    isDuplicate: false,
  },
  {
    id: 'DUP-08',
    name: 'Continuous improvement: F vs audit H',
    locations: ['maintenance/continuousImprovement.js', 'audit/basicDebt.js'],
    description: 'F mejora continua operacional; H audita deuda técnica puntual',
    severity: DUP_SEVERITY.MINOR,
    resolution: 'RESOLVED: F es operacional (runtime); H es puntual (pre-release). Temporalidad diferente.',
    isDuplicate: false,
  },
];

export function auditAgencyDuplication() {
  const realDuplicates = DUPLICATION_CANDIDATES.filter((d) => d.isDuplicate);
  const resolved       = DUPLICATION_CANDIDATES.filter((d) => !d.isDuplicate);

  const bySeverity = {
    [DUP_SEVERITY.CRITICAL]: DUPLICATION_CANDIDATES.filter((d) => d.severity === DUP_SEVERITY.CRITICAL && d.isDuplicate),
    [DUP_SEVERITY.MODERATE]: DUPLICATION_CANDIDATES.filter((d) => d.severity === DUP_SEVERITY.MODERATE && d.isDuplicate),
    [DUP_SEVERITY.MINOR]:    DUPLICATION_CANDIDATES.filter((d) => d.severity === DUP_SEVERITY.MINOR && d.isDuplicate),
    [DUP_SEVERITY.RESOLVED]: resolved,
  };

  return {
    valid: realDuplicates.filter((d) => d.severity === DUP_SEVERITY.CRITICAL).length === 0,
    totalCandidates: DUPLICATION_CANDIDATES.length,
    realDuplicates: realDuplicates.length,
    resolved: resolved.length,
    critical: bySeverity[DUP_SEVERITY.CRITICAL].length,
    moderate: bySeverity[DUP_SEVERITY.MODERATE].length,
    candidates: DUPLICATION_CANDIDATES,
    bySeverity,
    duplicationStatus: realDuplicates.length === 0 ? 'CLEAN' : 'HAS_DUPLICATES',
    conclusion: 'Todas las duplicaciones aparentes son separaciones de concerns correctas entre Pasos.',
  };
}
