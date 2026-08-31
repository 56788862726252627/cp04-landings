// Maintenance Runner — PASO F
// Orchestrates a full maintenance cycle for a client.

import { buildChecklistResult } from './maintenanceChecklist.js';
import { auditBackupHealth, evaluateRestoreReadiness } from './backupPolicy.js';
import { auditAutomationHealth } from './automationHealth.js';
import { auditAIHealth } from './aiHealth.js';
import { runSecurityMaintenance } from './securityMaintenance.js';
import { calculateClientHealthScore } from './clientHealthScore.js';
import { generateMaintenanceReport } from './maintenanceReport.js';

export const CYCLE_STATUS = Object.freeze({
  HEALTHY:    'HEALTHY',
  WARNING:    'WARNING',
  CRITICAL:   'CRITICAL',
  INCOMPLETE: 'INCOMPLETE',
});

/**
 * Run a full maintenance cycle for a client.
 *
 * @param {object} config - { clientId, maintenanceTier, policy, checklistResults, automationHealth, aiHealth, securityChecks }
 * @returns Full maintenance cycle report
 */
export async function runMaintenanceCycle(config = {}) {
  if (!config.clientId) {
    return { valid: false, error: 'clientId required' };
  }

  const {
    clientId,
    maintenanceTier = 'BASIC',
    policy         = null,
    checklistResults = {},
    automationInput  = {},
    aiInput          = {},
    securityInput    = {},
  } = config;

  const cycleId  = config.cycleId ?? `CYCLE-${clientId}-${Date.now()}`;
  const startedAt = new Date().toISOString();

  // --- Run all sub-audits ---
  const checklist = buildChecklistResult(checklistResults, maintenanceTier);

  const backupAudit = policy
    ? auditBackupHealth(policy, config.backupChecks ?? {})
    : { valid: false, status: 'UNKNOWN', healthScore: 0, issues: [{ severity: 'WARNING', issue: 'No backup policy provided' }] };

  const restoreReadiness = policy
    ? evaluateRestoreReadiness(policy, config.backupChecks ?? {})
    : { valid: false, restoreReady: false, blockers: ['No backup policy provided'] };

  const automationAudit = auditAutomationHealth(automationInput.scenarios ?? []);
  const aiAudit         = auditAIHealth(aiInput.agents ?? []);
  const securityAudit   = runSecurityMaintenance(securityInput);

  // --- Compute overall status ---
  const criticalIssues = [
    checklist.criticalFailed > 0,
    backupAudit.status === 'CRITICAL',
    automationAudit.status === 'CRITICAL',
    aiAudit.status === 'CRITICAL',
    securityAudit.status === 'CRITICAL',
  ].filter(Boolean).length;

  const warnings = [
    checklist.overallStatus === 'WARNING',
    backupAudit.status === 'WARNING',
    automationAudit.status === 'WARNING',
    aiAudit.status === 'WARNING',
    securityAudit.status === 'WARNING',
  ].filter(Boolean).length;

  const cycleStatus = criticalIssues > 0 ? CYCLE_STATUS.CRITICAL
    : warnings > 2              ? CYCLE_STATUS.WARNING
    : checklist.pending > 5     ? CYCLE_STATUS.INCOMPLETE
    : CYCLE_STATUS.HEALTHY;

  // --- Client health score ---
  const healthScore = calculateClientHealthScore({
    checklistScore:    checklist.score,
    backupScore:       backupAudit.healthScore ?? 0,
    automationScore:   automationAudit.healthScore ?? 0,
    aiScore:           aiAudit.healthScore ?? 0,
    securityScore:     securityAudit.healthScore ?? 0,
  });

  const cycle = {
    cycleId,
    clientId,
    maintenanceTier,
    status:           cycleStatus,
    healthScore:      healthScore.score,
    healthLabel:      healthScore.label,
    startedAt,
    completedAt:      new Date().toISOString(),
    checklist,
    backupAudit,
    restoreReadiness,
    automationAudit,
    aiAudit,
    securityAudit,
    criticalIssues,
    warningCount:     warnings,
    disclaimer:       'Maintenance cycle is an operational record. No real system changes performed.',
  };

  const report = generateMaintenanceReport(cycle);

  return { valid: true, cycle, report };
}

export const MAINTENANCE_RUNNER_VERSION = '1.0.0';
