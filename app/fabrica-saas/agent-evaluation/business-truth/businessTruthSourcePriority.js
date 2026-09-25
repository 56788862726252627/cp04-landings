// Business Truth Source Priority — ADV-10b

export const SOURCE_PRIORITY = Object.freeze({
  LIVE_OPERATIONAL_API:       1,
  BUSINESS_DATABASE:          2,
  ADMIN_CONFIG:               3,
  VERIFIED_CLIENT_CONFIG:     4,
  BUSINESS_APP_CONFIG:        5,
  STRUCTURED_PROJECT_CONFIG:  6,
  APPROVED_PROMPT_FACTS:      7,
  VERIFIED_STATIC_KNOWLEDGE:  8,
  UNKNOWN:                    9,
  // MODEL_ASSUMPTION: FORBIDDEN — never use as factual source
});

export const SOURCE_PRIORITY_NAMES = Object.freeze(Object.fromEntries(
  Object.entries(SOURCE_PRIORITY).map(([k, v]) => [v, k])
));

export const FORBIDDEN_SOURCES = Object.freeze(['MODEL_ASSUMPTION', 'HALLUCINATION', 'INFERENCE']);

export function isForbiddenSource(source = '') {
  return FORBIDDEN_SOURCES.includes(source);
}

export function comparePriority(sourceA = 'UNKNOWN', sourceB = 'UNKNOWN') {
  const a = SOURCE_PRIORITY[sourceA] ?? 9;
  const b = SOURCE_PRIORITY[sourceB] ?? 9;
  return a < b ? sourceA : b < a ? sourceB : sourceA;
}

export function getSourcePriorityLevel(source = '') {
  return SOURCE_PRIORITY[source] ?? SOURCE_PRIORITY.UNKNOWN;
}

export const BUSINESS_TRUTH_SOURCE_PRIORITY_VERSION = '1.0.0';
