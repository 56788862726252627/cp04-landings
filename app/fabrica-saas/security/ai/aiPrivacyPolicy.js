// AI Privacy Policy — ADV-19 (connects ADV-16 AI Router)

export const AI_PRIVACY_CONTROL = Object.freeze({
  PROMPT_PII_MINIMIZATION:   'PROMPT_PII_MINIMIZATION',
  SECRET_EXCLUSION:          'SECRET_EXCLUSION',
  PROVIDER_ROUTING:          'PROVIDER_ROUTING',
  TRAINING_OPT_OUT:          'TRAINING_OPT_OUT',
  CONTEXT_MINIMIZATION:      'CONTEXT_MINIMIZATION',
  RETENTION_AWARENESS:       'RETENTION_AWARENESS',
});

export function createAIPrivacyPolicy(config = {}) {
  const {
    controls = [],
    allowedDataClasses = ['PUBLIC', 'INTERNAL'],
    blockSensitiveInPrompts = true,
    contextWindowMinimized = true,
    providerRoutingAware = true,
    clientId = null,
  } = config;

  const violations = [];
  if (!blockSensitiveInPrompts) violations.push('SENSITIVE_DATA_IN_PROMPTS_NOT_BLOCKED');
  if (!contextWindowMinimized)  violations.push('CONTEXT_NOT_MINIMIZED');

  const allControls = [...controls];
  if (blockSensitiveInPrompts && !allControls.includes(AI_PRIVACY_CONTROL.PROMPT_PII_MINIMIZATION)) {
    allControls.push(AI_PRIVACY_CONTROL.PROMPT_PII_MINIMIZATION);
  }
  if (!allControls.includes(AI_PRIVACY_CONTROL.SECRET_EXCLUSION)) {
    allControls.push(AI_PRIVACY_CONTROL.SECRET_EXCLUSION);
  }

  function validatePrompt(prompt = '') {
    const issues = [];
    if (/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(prompt)) {
      issues.push('EMAIL_IN_PROMPT');
    }
    if (/\bpassword\b|\bsecret\b|\btoken\b/i.test(prompt)) {
      issues.push('SECRET_IN_PROMPT');
    }
    return Object.freeze({ safe: issues.length === 0, issues: Object.freeze(issues), isReal: false });
  }

  return Object.freeze({
    clientId,
    controls: Object.freeze([...new Set(allControls)]),
    allowedDataClasses: Object.freeze([...allowedDataClasses]),
    blockSensitiveInPrompts,
    contextWindowMinimized,
    providerRoutingAware,
    violations: Object.freeze([...violations]),
    validatePrompt,
    isReal: false,
  });
}

export const AI_PRIVACY_VERSION = '1.0.0';
