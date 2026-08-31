// Maintenance Service Model — FASE 2
// Integra con commercial/maintenancePlans.js (BASIC/PRO/PRIORITY)

import { getMaintenancePlan, recommendMaintenancePlan } from '../commercial/maintenancePlans.js';

export const MAINTENANCE_TIERS = Object.freeze({
  BASIC:    'BASIC',
  PRO:      'PRO',
  PRIORITY: 'PRIORITY',
});

export const REVIEW_CADENCE = Object.freeze({
  DAILY:     'DAILY',
  WEEKLY:    'WEEKLY',
  BIWEEKLY:  'BIWEEKLY',
  MONTHLY:   'MONTHLY',
  QUARTERLY: 'QUARTERLY',
});

/**
 * Build a full MaintenanceService config from a tier + optional overrides.
 */
export function createMaintenanceService(params = {}) {
  const errors = [];

  if (!params.clientId)  errors.push('clientId required');
  if (!params.tier || !Object.values(MAINTENANCE_TIERS).includes(params.tier)) {
    errors.push(`tier must be one of: ${Object.values(MAINTENANCE_TIERS).join(', ')}`);
  }

  if (errors.length > 0) return { valid: false, errors, service: null };

  const plan = getMaintenancePlan(params.tier);

  const service = {
    id:                   params.id ?? `MS-${params.clientId}-${params.tier}`,
    name:                 plan?.name ?? params.tier,
    clientId:             params.clientId,
    tier:                 params.tier,
    packageTier:          params.packageTier ?? null,

    includedTasks:        params.includedTasks ?? getIncludedTasks(params.tier),
    excludedTasks:        params.excludedTasks ?? (plan?.excludedWork ?? []),

    frequency:            params.frequency ?? getReviewCadence(params.tier),
    includedHours:        params.includedHours ?? (plan?.includedHours ?? 0),
    responseTargets:      params.responseTargets ?? getResponseTargets(params.tier),
    reviewCadence:        params.reviewCadence ?? getReviewCadence(params.tier),
    reportingCadence:     params.reportingCadence ?? REVIEW_CADENCE.MONTHLY,

    backupChecks:         params.backupChecks ?? (plan?.backupChecks ?? 'MENSUAL'),
    securityChecks:       params.securityChecks ?? (plan?.securityChecks ?? 'MENSUAL'),
    dependencyChecks:     params.dependencyChecks ?? REVIEW_CADENCE.MONTHLY,
    integrationChecks:    params.integrationChecks ?? REVIEW_CADENCE.MONTHLY,
    automationChecks:     params.automationChecks ?? REVIEW_CADENCE.MONTHLY,
    aiChecks:             params.aiChecks ?? REVIEW_CADENCE.MONTHLY,
    performanceChecks:    params.performanceChecks ?? REVIEW_CADENCE.MONTHLY,

    clientResponsibilities: params.clientResponsibilities ?? [
      'Notify agency of any third-party changes',
      'Provide access when requested',
      'Respond to pending action items within 5 business days',
      'Manage own production credentials',
    ],
    agencyResponsibilities: params.agencyResponsibilities ?? [
      'Execute maintenance cycle per cadence',
      'Report findings to client',
      'Escalate critical issues immediately',
      'Keep documentation up to date',
    ],

    escalationRules:      params.escalationRules ?? getEscalationRules(params.tier),
    activeFrom:           params.activeFrom ?? new Date().toISOString(),
    disclaimer:           'Service targets are operational objectives, not legal SLAs.',
  };

  return { valid: true, errors: [], service };
}

function getIncludedTasks(tier) {
  const base = ['bug_fix', 'security_patch', 'backup_check', 'health_review'];
  if (tier === MAINTENANCE_TIERS.PRO || tier === MAINTENANCE_TIERS.PRIORITY) {
    base.push('minor_change', 'dependency_update', 'performance_review');
  }
  if (tier === MAINTENANCE_TIERS.PRIORITY) {
    base.push('proactive_monitoring', 'weekly_security_check', 'ai_health_check');
  }
  return base;
}

function getReviewCadence(tier) {
  return tier === MAINTENANCE_TIERS.PRIORITY
    ? REVIEW_CADENCE.WEEKLY
    : tier === MAINTENANCE_TIERS.PRO
      ? REVIEW_CADENCE.BIWEEKLY
      : REVIEW_CADENCE.MONTHLY;
}

function getResponseTargets(tier) {
  return {
    P1_CRITICAL: tier === MAINTENANCE_TIERS.PRIORITY ? '4h' : tier === MAINTENANCE_TIERS.PRO ? '24h' : '48h',
    P2_HIGH:     tier === MAINTENANCE_TIERS.PRIORITY ? '8h' : '48h',
    P3_NORMAL:   '5 business days',
    P4_LOW:      '10 business days',
  };
}

function getEscalationRules(tier) {
  return [
    { condition: 'P1 unresolved after response target', escalateTo: 'AGENCY_OWNER' },
    { condition: 'security incident', escalateTo: 'AGENCY_OWNER' },
    { condition: 'backup failure', escalateTo: 'PROJECT_MANAGER' },
    ...(tier === MAINTENANCE_TIERS.PRIORITY
      ? [{ condition: 'performance degradation > 20%', escalateTo: 'PROJECT_MANAGER' }]
      : []),
  ];
}

/**
 * Get the recommended maintenance tier for a delivery package.
 */
export function getRecommendedMaintenanceTier(packageTier) {
  return recommendMaintenancePlan(packageTier);
}

export const MAINTENANCE_SERVICE_VERSION = '1.0.0';
