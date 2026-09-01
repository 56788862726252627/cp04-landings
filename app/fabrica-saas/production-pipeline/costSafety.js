// Cost Safety — ADV-04
// evaluateExternalCostRisk(): detect actions that may generate spend.

export const COST_RISK_LEVEL = Object.freeze({
  NONE:     'NONE',
  LOW:      'LOW',
  MEDIUM:   'MEDIUM',
  HIGH:     'HIGH',
  CRITICAL: 'CRITICAL',
});

export const COST_CATEGORY = Object.freeze({
  BILLING:       'BILLING',
  PAID_API:      'PAID_API',
  ADS:           'ADS',
  VOICE_CALLS:   'VOICE_CALLS',
  EMAIL_VOLUME:  'EMAIL_VOLUME',
  STORAGE:       'STORAGE',
  AI_PROVIDER:   'AI_PROVIDER',
  SMS:           'SMS',
});

const PROVIDER_COST_MAP = Object.freeze({
  stripe:    { category: COST_CATEGORY.BILLING,      risk: COST_RISK_LEVEL.HIGH     },
  meta:      { category: COST_CATEGORY.ADS,          risk: COST_RISK_LEVEL.CRITICAL },
  twilio:    { category: COST_CATEGORY.VOICE_CALLS,  risk: COST_RISK_LEVEL.HIGH     },
  sendgrid:  { category: COST_CATEGORY.EMAIL_VOLUME, risk: COST_RISK_LEVEL.MEDIUM   },
  openai:    { category: COST_CATEGORY.AI_PROVIDER,  risk: COST_RISK_LEVEL.MEDIUM   },
  anthropic: { category: COST_CATEGORY.AI_PROVIDER,  risk: COST_RISK_LEVEL.MEDIUM   },
  s3:        { category: COST_CATEGORY.STORAGE,      risk: COST_RISK_LEVEL.LOW      },
  cloudflare:{ category: COST_CATEGORY.STORAGE,      risk: COST_RISK_LEVEL.LOW      },
  whatsapp:  { category: COST_CATEGORY.SMS,          risk: COST_RISK_LEVEL.MEDIUM   },
  airtable:  { category: COST_CATEGORY.BILLING,      risk: COST_RISK_LEVEL.LOW      },
  supabase:  { category: COST_CATEGORY.BILLING,      risk: COST_RISK_LEVEL.LOW      },
  make:      { category: COST_CATEGORY.BILLING,      risk: COST_RISK_LEVEL.LOW      },
});

const RISK_ORDER = [COST_RISK_LEVEL.NONE, COST_RISK_LEVEL.LOW, COST_RISK_LEVEL.MEDIUM, COST_RISK_LEVEL.HIGH, COST_RISK_LEVEL.CRITICAL];

function maxRisk(risks) {
  return risks.reduce((max, r) => {
    return RISK_ORDER.indexOf(r) > RISK_ORDER.indexOf(max) ? r : max;
  }, COST_RISK_LEVEL.NONE);
}

/**
 * Evaluate external cost risk for a list of providers/integrations.
 * Rule: NO automatic spend without explicit policy.
 */
export function evaluateExternalCostRisk(integrations = []) {
  const detected = [];

  integrations.forEach(integration => {
    const key  = integration.toLowerCase();
    const info = PROVIDER_COST_MAP[key];
    if (info) {
      detected.push({ provider: integration, ...info });
    }
  });

  const overallRisk   = maxRisk(detected.map(d => d.risk));
  const requiresHuman = [COST_RISK_LEVEL.HIGH, COST_RISK_LEVEL.CRITICAL].includes(overallRisk);
  const criticalItems = detected.filter(d => d.risk === COST_RISK_LEVEL.CRITICAL);

  return Object.freeze({
    valid:          true,
    overallRisk,
    detected,
    requiresHuman,
    criticalItems:  criticalItems.map(d => d.provider),
    policyRequired: 'NO automatic spend without explicit policy approval.',
    autoSpendSafe:  !requiresHuman && overallRisk !== COST_RISK_LEVEL.MEDIUM,
    isReal:         false,
  });
}

export const COST_SAFETY_VERSION = '1.0.0';
