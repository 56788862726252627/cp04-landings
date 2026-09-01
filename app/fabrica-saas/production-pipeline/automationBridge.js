// Automation Bridge — ADV-04
// Connects production pipeline → Make manifest (core/makeManifest.js).
// Generates automation requirements. No real scenarios created.

export const AUTOMATION_STATUS = Object.freeze({
  AUTO_READY:           'AUTO_READY',
  MANUAL_AUTH_REQUIRED: 'MANUAL_AUTH_REQUIRED',
  DEFERRED:             'DEFERRED',
  BLOCKED:              'BLOCKED',
});

const INTEGRATION_AUTH_MAP = Object.freeze({
  stripe:     AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED,
  whatsapp:   AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED,
  meta:       AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED,
  twilio:     AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED,
  google:     AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED,
  airtable:   AUTOMATION_STATUS.AUTO_READY,
  make:       AUTOMATION_STATUS.AUTO_READY,
  email:      AUTOMATION_STATUS.AUTO_READY,
  sms:        AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED,
});

/**
 * Generate automation plan from a project artifact.
 * Classifies each integration by its auth requirements.
 */
export function generateAutomationPlan(artifact = {}) {
  if (!artifact.projectId) {
    return { valid: false, error: 'artifact.projectId required', status: AUTOMATION_STATUS.BLOCKED };
  }

  const integrations = artifact.integrations ?? [];
  const scenarios    = [];
  const manualBlocks = [];

  integrations.forEach(integration => {
    const key    = integration.toLowerCase();
    const status = INTEGRATION_AUTH_MAP[key] ?? AUTOMATION_STATUS.DEFERRED;

    const scenario = Object.freeze({
      scenarioId: `SCEN-${artifact.projectId}-${integration}`,
      integration,
      trigger:    'WEBHOOK',
      status,
      inputs:     ['payload'],
      outputs:    ['confirmation'],
      failureStrategy: 'RETRY_3_HUMAN_FALLBACK',
      humanFallback:   true,
      isReal:     false,
    });

    scenarios.push(scenario);
    if (status === AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED) manualBlocks.push(integration);
  });

  const overallStatus = manualBlocks.length > 0
    ? AUTOMATION_STATUS.MANUAL_AUTH_REQUIRED
    : AUTOMATION_STATUS.AUTO_READY;

  return Object.freeze({
    valid:         true,
    status:        overallStatus,
    projectId:     artifact.projectId,
    scenarioCount: scenarios.length,
    scenarios,
    manualBlocks,
    isReal:        false,
    disclaimer:    'No real Make scenarios created — requires account authorization.',
  });
}

export const AUTOMATION_BRIDGE_VERSION = '1.0.0';
