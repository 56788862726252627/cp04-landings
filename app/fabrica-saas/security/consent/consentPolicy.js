// Consent Policy — ADV-19

export const DARK_PATTERN = Object.freeze({
  PRESELECTED_MARKETING:  'PRESELECTED_MARKETING',
  ACCEPT_ONLY_BUTTON:     'ACCEPT_ONLY_BUTTON',
  MISLEADING_LANGUAGE:    'MISLEADING_LANGUAGE',
  HIDDEN_WITHDRAW:        'HIDDEN_WITHDRAW',
  BUNDLED_CONSENT:        'BUNDLED_CONSENT',
});

export function createConsentPolicy(config = {}) {
  const {
    purposes = [],
    granular = true,
    withdrawalAvailable = true,
    proofRequired = true,
    policyVersioned = true,
    preselectedMarketing = false,
    acceptOnlyButton = false,
    bundledConsent = false,
    clientId = null,
  } = config;

  const darkPatterns = [];
  if (preselectedMarketing) darkPatterns.push(DARK_PATTERN.PRESELECTED_MARKETING);
  if (acceptOnlyButton)     darkPatterns.push(DARK_PATTERN.ACCEPT_ONLY_BUTTON);
  if (bundledConsent)       darkPatterns.push(DARK_PATTERN.BUNDLED_CONSENT);
  if (!withdrawalAvailable) darkPatterns.push(DARK_PATTERN.HIDDEN_WITHDRAW);

  const violations = [...darkPatterns];
  if (!granular && purposes.length > 1) violations.push('NON_GRANULAR_MULTI_PURPOSE');

  return Object.freeze({
    clientId,
    purposes: Object.freeze([...purposes]),
    granular,
    withdrawalAvailable,
    proofRequired,
    policyVersioned,
    darkPatterns: Object.freeze([...darkPatterns]),
    violations: Object.freeze([...violations]),
    compliant: violations.length === 0,
    isReal: false,
  });
}

export const CONSENT_POLICY_VERSION = '1.0.0';
