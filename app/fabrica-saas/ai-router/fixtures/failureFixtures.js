// Failure Routing Fixtures — ADV-16
// 10 failure scenarios to detect.

export const FAILURE_WRONG_CAPABILITY = Object.freeze({
  id: 'fail-wrong-capability',
  scenario: 'Task needs TOOLS but selected model has tools=false',
  trigger: 'CAPABILITY_MISMATCH',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_EXPENSIVE_NO_APPROVAL = Object.freeze({
  id: 'fail-expensive-no-approval',
  scenario: 'HIGH cost model selected without budget policy approval',
  trigger: 'PAID_WITHOUT_APPROVAL',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_RESTRICTED_DATA_WRONG_PROVIDER = Object.freeze({
  id: 'fail-restricted-data',
  scenario: 'RESTRICTED privacy data routed to public provider',
  trigger: 'RESTRICTED_DATA_UNAUTHORIZED',
  severity: 'CRITICAL',
  isReal: false,
});

export const FAILURE_PROVIDER_DOWN_NO_FALLBACK = Object.freeze({
  id: 'fail-no-fallback',
  scenario: 'Provider unavailable and fallback chain empty',
  trigger: 'PROVIDER_UNAVAILABLE_NO_FALLBACK',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_WRONG_CLIENT_POLICY = Object.freeze({
  id: 'fail-client-policy',
  scenario: 'Model not in client allowlist used anyway',
  trigger: 'CLIENT_POLICY_VIOLATION',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_DISABLED_MODEL = Object.freeze({
  id: 'fail-disabled-model',
  scenario: 'DISABLED model selected for request',
  trigger: 'DISABLED_MODEL',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_TOOL_TASK_NO_TOOL_MODEL = Object.freeze({
  id: 'fail-tool-no-support',
  scenario: 'Agent requires tools but selected model declares tools=false',
  trigger: 'CAPABILITY_MISMATCH',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_VISION_TEXT_ONLY = Object.freeze({
  id: 'fail-vision-text-only',
  scenario: 'Vision task routed to text-only model',
  trigger: 'CAPABILITY_MISMATCH',
  severity: 'HIGH',
  isReal: false,
});

export const FAILURE_INVALID_STRUCTURED_OUTPUT = Object.freeze({
  id: 'fail-structured-output',
  scenario: 'Structured output required but provider does not support it',
  trigger: 'CAPABILITY_MISMATCH',
  severity: 'MEDIUM',
  isReal: false,
});

export const FAILURE_CROSS_CLIENT_CONFIG = Object.freeze({
  id: 'fail-cross-client',
  scenario: 'Client A routing config applied to Client B request',
  trigger: 'CLIENT_POLICY_VIOLATION',
  severity: 'CRITICAL',
  isReal: false,
});

export const ALL_FAILURE_FIXTURES = Object.freeze([
  FAILURE_WRONG_CAPABILITY,
  FAILURE_EXPENSIVE_NO_APPROVAL,
  FAILURE_RESTRICTED_DATA_WRONG_PROVIDER,
  FAILURE_PROVIDER_DOWN_NO_FALLBACK,
  FAILURE_WRONG_CLIENT_POLICY,
  FAILURE_DISABLED_MODEL,
  FAILURE_TOOL_TASK_NO_TOOL_MODEL,
  FAILURE_VISION_TEXT_ONLY,
  FAILURE_INVALID_STRUCTURED_OUTPUT,
  FAILURE_CROSS_CLIENT_CONFIG,
]);

export const FAILURE_FIXTURES_VERSION = '1.0.0';
