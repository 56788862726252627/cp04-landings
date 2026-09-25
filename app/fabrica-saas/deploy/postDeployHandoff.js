// Post-Deploy Handoff — PASO G
// Integrates Paso F maintenance system with Paso G deploy system.

export const HANDOFF_STATUS = Object.freeze({
  COMPLETE:    'COMPLETE',
  PARTIAL:     'PARTIAL',
  BLOCKED:     'BLOCKED',
  NOT_STARTED: 'NOT_STARTED',
});

export const HANDOFF_SECTIONS = Object.freeze({
  RELEASE_INFO:      'RELEASE_INFO',
  QA_SUMMARY:        'QA_SUMMARY',
  HEALTH_SUMMARY:    'HEALTH_SUMMARY',
  MAINTENANCE_SETUP: 'MAINTENANCE_SETUP',
  ROLLBACK_INFO:     'ROLLBACK_INFO',
  CLIENT_BRIEFING:   'CLIENT_BRIEFING',
  NEXT_STEPS:        'NEXT_STEPS',
});

/**
 * Create a post-deploy handoff package.
 * Integrates QA, health checks, rollback plan, and maintenance setup.
 *
 * @param {object} params
 *   - releaseManifest   — from releaseManifest.js
 *   - qaResult          — from postDeployQA.js
 *   - healthResult      — from healthChecks.js
 *   - rollbackPlan      — from rollbackModel.js
 *   - maintenanceTier   — 'BASIC'|'PRO'|'PRIORITY'
 *   - clientId          — string
 *   - projectName       — string
 *   - deployedUrl       — string (optional)
 */
export function createPostDeployHandoff(params = {}) {
  const errors = [];
  if (!params.projectName) errors.push('projectName required');
  if (!params.clientId)    errors.push('clientId required');
  if (errors.length > 0) return { valid: false, errors, handoff: null };

  const manifest    = params.releaseManifest ?? null;
  const qaResult    = params.qaResult ?? null;
  const healthResult= params.healthResult ?? null;
  const rollback    = params.rollbackPlan ?? null;
  const tier        = params.maintenanceTier ?? 'BASIC';

  const releaseInfo = {
    section:      HANDOFF_SECTIONS.RELEASE_INFO,
    projectName:  params.projectName,
    clientId:     params.clientId,
    version:      manifest?.version ?? 'UNKNOWN',
    releaseId:    manifest?.releaseId ?? 'UNKNOWN',
    commitSha:    manifest?.commitSha ?? 'UNKNOWN',
    deployedUrl:  params.deployedUrl ?? 'NOT_PROVIDED',
    environment:  manifest?.environment ?? 'PREVIEW',
    deployedAt:   new Date().toISOString(),
  };

  const qaSummary = {
    section:     HANDOFF_SECTIONS.QA_SUMMARY,
    status:      qaResult?.status ?? 'NOT_RUN',
    totalChecks: qaResult?.totalChecks ?? 0,
    passed:      qaResult?.passed ?? 0,
    critical:    qaResult?.criticalFailed ?? 0,
    available:   qaResult !== null,
  };

  const healthSummary = {
    section:      HANDOFF_SECTIONS.HEALTH_SUMMARY,
    status:       healthResult?.status ?? 'NOT_RUN',
    totalChecks:  healthResult?.totalChecks ?? 0,
    passed:       healthResult?.passed ?? 0,
    criticalFailed: healthResult?.criticalFailed ?? 0,
    available:    healthResult !== null,
  };

  const maintenanceTierConfig = {
    BASIC:    { responseP1: '48h',  reviewCadence: 'monthly',   includes: ['bug fixes', 'security patches', 'monthly review'] },
    PRO:      { responseP1: '24h',  reviewCadence: 'bi-weekly', includes: ['bug fixes', 'security patches', 'bi-weekly review', 'proactive monitoring'] },
    PRIORITY: { responseP1: '4h',   reviewCadence: 'weekly',    includes: ['bug fixes', 'security patches', 'weekly review', 'AI health check', 'proactive monitoring'] },
  };
  const tierConfig = maintenanceTierConfig[tier] ?? maintenanceTierConfig.BASIC;

  const maintenanceSetup = {
    section:          HANDOFF_SECTIONS.MAINTENANCE_SETUP,
    maintenanceTier:  tier,
    responseTargetP1: tierConfig.responseP1,
    reviewCadence:    tierConfig.reviewCadence,
    includes:         tierConfig.includes,
    supportChannel:   'support@agency.com (placeholder)',
    ticketSystem:     'Documented in AGENCY_MAINTENANCE_STANDARD.md',
  };

  const rollbackInfo = {
    section:           HANDOFF_SECTIONS.ROLLBACK_INFO,
    available:         rollback !== null,
    planId:            rollback?.planId ?? 'NOT_DEFINED',
    previousVersion:   rollback?.previousKnownGoodVersion ?? 'UNKNOWN',
    estimatedTimeMin:  rollback?.estimatedTimeMinutes ?? 15,
    triggerConditions: rollback?.triggerConditions ?? [],
    humanApproval:     rollback?.humanApproval ?? true,
  };

  const isHealthy = healthResult?.status === 'PASS' || healthResult?.status === 'WARNING';
  const qaOk      = qaResult?.status === 'PASS' || qaResult?.status === 'WARNING';

  const clientBriefing = {
    section:     HANDOFF_SECTIONS.CLIENT_BRIEFING,
    headline:    `${params.projectName} — Deployment Complete`,
    deployedUrl: params.deployedUrl ?? 'Check Cloudflare dashboard for live URL',
    healthStatus: isHealthy ? 'OPERATIONAL' : (healthResult ? 'REVIEW_NEEDED' : 'PENDING_CHECK'),
    qaStatus:    qaOk ? 'PASSED' : (qaResult ? 'REVIEW_NEEDED' : 'PENDING'),
    maintenancePlan: `${tier} tier — P1 response target: ${tierConfig.responseP1}`,
    nextMaintenanceReview: `Scheduled per ${tierConfig.reviewCadence} cadence`,
  };

  const qaBlocked   = qaResult?.status === 'FAIL';
  const healthFail  = healthResult?.status === 'FAIL';
  const overallStatus = (qaBlocked || healthFail) ? HANDOFF_STATUS.BLOCKED
    : (!qaResult && !healthResult)               ? HANDOFF_STATUS.PARTIAL
    : HANDOFF_STATUS.COMPLETE;

  const nextSteps = {
    section: HANDOFF_SECTIONS.NEXT_STEPS,
    immediate: [
      ...(overallStatus === HANDOFF_STATUS.BLOCKED ? ['URGENT: Address QA/health failures before handing off'] : []),
      'Share deployedUrl with client',
      'Confirm client has access to the app',
      'Schedule first maintenance review per tier cadence',
    ],
    maintenance: [
      'Set up recurring maintenance calendar entries',
      'Configure health check monitoring',
      'Ensure client knows support contact channel',
    ],
    optional: [
      'Run analytics baseline capture',
      'Document any known limitations',
    ],
  };

  const handoff = {
    handoffId:     `HO-${params.clientId}-${Date.now()}`,
    status:        overallStatus,
    createdAt:     new Date().toISOString(),
    sections: {
      [HANDOFF_SECTIONS.RELEASE_INFO]:      releaseInfo,
      [HANDOFF_SECTIONS.QA_SUMMARY]:        qaSummary,
      [HANDOFF_SECTIONS.HEALTH_SUMMARY]:    healthSummary,
      [HANDOFF_SECTIONS.MAINTENANCE_SETUP]: maintenanceSetup,
      [HANDOFF_SECTIONS.ROLLBACK_INFO]:     rollbackInfo,
      [HANDOFF_SECTIONS.CLIENT_BRIEFING]:   clientBriefing,
      [HANDOFF_SECTIONS.NEXT_STEPS]:        nextSteps,
    },
    disclaimer: [
      'Post-deploy handoff is operational documentation.',
      'No real deployment, health check, or maintenance action performed.',
      'NO_REAL_DEPLOY. NO_REAL_CLIENTS. NO_REAL_SECRETS.',
    ].join(' '),
  };

  return { valid: true, errors: [], handoff };
}

export const POST_DEPLOY_HANDOFF_VERSION = '1.0.0';
