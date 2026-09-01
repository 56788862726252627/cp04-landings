// Time Estimator — ADV-04
// estimateProductionTime(): machine vs human vs external waiting time.
// Never mix OAuth waiting with CI execution time.

export const TIME_CATEGORY = Object.freeze({
  MACHINE:          'MACHINE',
  HUMAN:            'HUMAN',
  EXTERNAL_WAITING: 'EXTERNAL_WAITING',
});

const STAGE_TIME_MINUTES = Object.freeze({
  BRIEF_VALIDATION:     { machine: 0.1,  human: 0,    external: 0    },
  ANALYSIS:             { machine: 0.2,  human: 0,    external: 0    },
  VERTICAL_RESOLUTION:  { machine: 0.1,  human: 0,    external: 0    },
  CLIENT_CONFIG:        { machine: 0.1,  human: 0,    external: 0    },
  BRANDING:             { machine: 0.2,  human: 0,    external: 0    },
  MODULE_PLAN:          { machine: 0.2,  human: 0,    external: 0    },
  ROLE_PLAN:            { machine: 0.1,  human: 0,    external: 0    },
  DATA_MODEL:           { machine: 0.2,  human: 0,    external: 0    },
  AGENT_PLAN:           { machine: 0.3,  human: 0,    external: 0    },
  AUTOMATION_PLAN:      { machine: 0.2,  human: 0,    external: 0    },
  GENERATION:           { machine: 1.0,  human: 0,    external: 0    },
  TESTS:                { machine: 2.0,  human: 0,    external: 0    },
  LINT:                 { machine: 0.5,  human: 0,    external: 0    },
  BUILD:                { machine: 1.0,  human: 0,    external: 0    },
  SECURITY:             { machine: 0.5,  human: 0,    external: 0    },
  SECRET_SCAN:          { machine: 0.3,  human: 0,    external: 0    },
  RELEASE_READINESS:    { machine: 0.2,  human: 0,    external: 0    },
  DEPLOY_READINESS:     { machine: 0.2,  human: 0,    external: 0    },
  DEPLOY_PLAN:          { machine: 0.2,  human: 0,    external: 0    },
  DEPLOY_EXECUTION:     { machine: 2.0,  human: 0,    external: 5    },
  POST_DEPLOY_QA:       { machine: 1.0,  human: 0,    external: 0    },
  RUNTIME_RENDER_CHECK: { machine: 0.5,  human: 0,    external: 0    },
  HEALTH_CHECK:         { machine: 0.3,  human: 0,    external: 0    },
  RELEASE_MANIFEST:     { machine: 0.2,  human: 0,    external: 0    },
  ROLLBACK_READY:       { machine: 0.2,  human: 0,    external: 0    },
  FINAL_HANDOFF:        { machine: 0.5,  human: 15,   external: 0    },
  FINAL_URL:            { machine: 0.1,  human: 0,    external: 0    },
});

const MANUAL_ACTION_TIME_MINUTES = Object.freeze({
  OAUTH:               { human: 30,   external: 0    },
  API_KEY:             { human: 15,   external: 60   },
  BILLING:             { human: 20,   external: 0    },
  DOMAIN:              { human: 10,   external: 1440 }, // DNS propagation
  LEGAL_APPROVAL:      { human: 120,  external: 2880 }, // 2 days
  WHATSAPP_TEMPLATE:   { human: 30,   external: 2880 }, // Meta review
  APPROVAL:            { human: 15,   external: 0    },
  EXTERNAL_PERMISSION: { human: 30,   external: 1440 },
});

/**
 * Estimate production pipeline time broken down by category.
 * machine = automated execution time
 * human   = human decision/action time
 * external = waiting for 3rd party (DNS, OAuth approval, etc.)
 */
export function estimateProductionTime(params = {}) {
  const stages         = params.stages ?? Object.keys(STAGE_TIME_MINUTES);
  const manualActions  = params.manualActions ?? [];

  let machineMinutes   = 0;
  let humanMinutes     = 0;
  let externalMinutes  = 0;

  stages.forEach(stageId => {
    const t = STAGE_TIME_MINUTES[stageId];
    if (t) {
      machineMinutes  += t.machine;
      humanMinutes    += t.human;
      externalMinutes += t.external;
    }
  });

  manualActions.forEach(action => {
    const type = typeof action === 'string' ? action : action.type;
    const t    = MANUAL_ACTION_TIME_MINUTES[type];
    if (t) {
      humanMinutes    += t.human;
      externalMinutes += t.external;
    }
  });

  const totalMinutes = machineMinutes + humanMinutes + externalMinutes;

  return Object.freeze({
    valid:           true,
    machineMinutes:  Math.round(machineMinutes * 10) / 10,
    humanMinutes:    Math.round(humanMinutes),
    externalMinutes: Math.round(externalMinutes),
    totalMinutes:    Math.round(totalMinutes),
    breakdown: Object.freeze({
      [TIME_CATEGORY.MACHINE]:          `${Math.round(machineMinutes * 10) / 10} min`,
      [TIME_CATEGORY.HUMAN]:            `${Math.round(humanMinutes)} min`,
      [TIME_CATEGORY.EXTERNAL_WAITING]: `${Math.round(externalMinutes)} min`,
    }),
    note: 'Estimates only. External waiting (DNS, OAuth approvals) can vary widely.',
    isReal: false,
  });
}

export const TIME_ESTIMATOR_VERSION = '1.0.0';
