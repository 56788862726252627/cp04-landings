// Agent Evaluation Privacy Policy — ADV-10 (Privacy by Design)

export const PRIVACY_LEVEL = Object.freeze({
  PUBLIC:      'PUBLIC',
  INTERNAL:    'INTERNAL',
  SENSITIVE:   'SENSITIVE',
  RESTRICTED:  'RESTRICTED',
});

export const AgentEvaluationPrivacyPolicy = Object.freeze({
  dataMinimization: true,
  privacyByDesign:  true,
  noRealPII:        true,
  noRealConversations: true,
  maxRetentionDays: 30,
  allowedDataTypes: Object.freeze(['fixture', 'synthetic', 'anonymized']),
  prohibitedDataTypes: Object.freeze(['real_pii', 'real_conversations', 'production_data']),

  classify(data = {}) {
    if (data.containsPII) return PRIVACY_LEVEL.SENSITIVE;
    if (data.isReal)       return PRIVACY_LEVEL.RESTRICTED;
    if (data.isInternal)   return PRIVACY_LEVEL.INTERNAL;
    return PRIVACY_LEVEL.PUBLIC;
  },

  canProcess(data = {}) {
    if (data.isReal && data.containsPII) return false;
    if (data.dataType && !['fixture', 'synthetic', 'anonymized'].includes(data.dataType)) return false;
    return true;
  },

  version: '1.0.0',
  isReal: false,
});

export const PRIVACY_POLICY_VERSION = '1.0.0';
