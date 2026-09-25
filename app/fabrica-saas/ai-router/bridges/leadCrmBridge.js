// Lead Engine + CRM Bridge — ADV-16 ↔ ADV-08/09
// Lead enrichment/classification: LOW_COST or BALANCED per policy.

export function createLeadCrmBridge(config = {}) {
  const {
    enrichmentAlias     = 'CHEAP',
    classificationAlias = 'BALANCED',
    crmAnalysisAlias    = 'BALANCED',
  } = config;

  return Object.freeze({
    enrichmentAlias,
    classificationAlias,
    crmAnalysisAlias,

    buildLeadRequestProfile(task = 'ENRICHMENT', overrides = {}) {
      const aliasMap = {
        ENRICHMENT:     enrichmentAlias,
        CLASSIFICATION: classificationAlias,
        ANALYSIS:       crmAnalysisAlias,
      };
      return Object.freeze({
        taskType:   'STRUCTURED_EXTRACTION',
        modelAlias: aliasMap[task] ?? classificationAlias,
        ...overrides,
        isReal: false,
      });
    },

    buildCrmRequestProfile(overrides = {}) {
      return Object.freeze({
        taskType:   'BUSINESS_ANALYSIS',
        modelAlias: crmAnalysisAlias,
        ...overrides,
        isReal: false,
      });
    },
    isReal: false,
  });
}

export const LEAD_CRM_BRIDGE_VERSION = '1.0.0';
