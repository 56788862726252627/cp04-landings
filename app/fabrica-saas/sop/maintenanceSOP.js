// Maintenance SOP — FASE 15: proceso de mantenimiento continuo (prepara Paso F)

import { createSOP, SOP_STEP_TYPES } from './sopEngine.js';

export const MAINTENANCE_REVIEW_TYPES = Object.freeze({
  SCHEDULED:    'SCHEDULED',
  TRIGGERED:    'TRIGGERED',
  EMERGENCY:    'EMERGENCY',
});

export const MAINTENANCE_HEALTH_STATUS = Object.freeze({
  HEALTHY:      'HEALTHY',
  WARNING:      'WARNING',
  CRITICAL:     'CRITICAL',
  UNKNOWN:      'UNKNOWN',
});

/**
 * Run a maintenance health check.
 * Returns structured report — does NOT execute changes.
 */
export function runMaintenanceCheck(config = {}) {
  const areas = {
    dependencies:       config.dependenciesChecked      ?? false,
    securityPatches:    config.securityPatchesChecked   ?? false,
    backupVerified:     config.backupVerified            ?? false,
    performanceChecked: config.performanceChecked        ?? false,
    integrationHealth:  config.integrationHealth         ?? null,
    automationHealth:   config.automationHealth          ?? null,
    aiHealth:           config.aiHealth                  ?? null,
    clientChanges:      config.clientChangesReviewed     ?? false,
    documentation:      config.documentationUpToDate     ?? false,
  };

  const warnings = [];
  const criticals = [];

  if (!areas.dependencies)     warnings.push('dependencies not checked');
  if (!areas.securityPatches)  criticals.push('security patches not checked');
  if (!areas.backupVerified)   warnings.push('backup not verified');
  if (!areas.performanceChecked) warnings.push('performance not checked');
  if (areas.integrationHealth === false) criticals.push('integration health: FAIL');
  if (areas.automationHealth === false)  warnings.push('automation health: FAIL');
  if (areas.aiHealth === false)          warnings.push('AI health: FAIL');

  const status = criticals.length > 0
    ? MAINTENANCE_HEALTH_STATUS.CRITICAL
    : warnings.length > 0
      ? MAINTENANCE_HEALTH_STATUS.WARNING
      : MAINTENANCE_HEALTH_STATUS.HEALTHY;

  return {
    reviewType: config.reviewType ?? MAINTENANCE_REVIEW_TYPES.SCHEDULED,
    status,
    areas,
    warnings,
    criticals,
    reportedAt:    new Date().toISOString(),
    nextReview:    config.nextReview ?? null,
    disclaimer:    'Maintenance report only. No changes applied automatically.',
  };
}

export const sopMaintenance = createSOP({
  id:      'MAINTENANCE_CONTINUOUS',
  title:   'Continuous Maintenance',
  purpose: 'Proactively maintain delivered products for reliability and security',
  scope:   'All clients with active maintenance plan',
  owner:   'SUPPORT',
  participants: ['SUPPORT', 'DEVELOPER', 'PROJECT_MANAGER', 'AUTOMATION_SPECIALIST'],
  trigger: 'Scheduled review cycle or triggered event',
  requiredInputs: ['clientId', 'maintenancePlan', 'lastReviewDate'],
  steps: [
    { label: 'Schedule maintenance review', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Check dependency updates', type: SOP_STEP_TYPES.ACTION, owner: 'DEVELOPER' },
    { label: 'Check security patches', type: SOP_STEP_TYPES.GATE, gate: 'securityPatchesChecked', owner: 'DEVELOPER' },
    { label: 'Verify backups', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Review performance metrics', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Check integration health', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Check automation health', type: SOP_STEP_TYPES.ACTION, owner: 'AUTOMATION_SPECIALIST' },
    { label: 'Review AI agent health (if applicable)', type: SOP_STEP_TYPES.ACTION, owner: 'AI_SPECIALIST', optional: true },
    { label: 'Review client change requests', type: SOP_STEP_TYPES.ACTION, owner: 'PROJECT_MANAGER' },
    { label: 'Generate maintenance report', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
    { label: 'Escalate criticals to PROJECT_MANAGER', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT', optional: true },
    { label: 'Schedule next review', type: SOP_STEP_TYPES.ACTION, owner: 'SUPPORT' },
  ],
  decisionRules: [
    'CRITICAL finding → escalate immediately',
    'Security patches not applied → P2_HIGH ticket',
    'Backup failure → P1_CRITICAL',
  ],
  qualityChecks: ['All areas checked', 'Report generated'],
  securityChecks: ['Security patches checked every cycle'],
  handoff: 'Maintenance report → Project Manager for action items',
  escalation: 'AGENCY_OWNER for critical security findings',
  completionCriteria: ['Maintenance report generated', 'Next review scheduled'],
  artifacts: ['Maintenance report', 'Action items list'],
  metrics: ['maintenance_compliance_rate', 'security_patch_lag_days'],
  bpmnRef: 'BPMN_AGENCY.maintenance',
}).sop;

export const MAINTENANCE_SOP_VERSION = '1.0.0';
