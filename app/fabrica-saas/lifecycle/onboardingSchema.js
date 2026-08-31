/**
 * Client Onboarding Schema
 * Validates and enriches onboarding data with field status tracking.
 */

export const ONBOARDING_SCHEMA_VERSION = '1.0.0';

export const FIELD_STATUS = Object.freeze({
  PROVIDED:         'PROVIDED',
  INFERRED:         'DEFAULTED',
  DEFAULTED:        'DEFAULTED',
  MISSING_REQUIRED: 'MISSING_REQUIRED',
});

export const REQUIRED_FIELDS = Object.freeze([
  'businessName', 'businessType', 'contactRole', 'sector',
  'location', 'mainProblems', 'businessGoals',
]);

export const OPTIONAL_FIELDS = Object.freeze([
  'website', 'currentTools', 'currentProcesses', 'targetAudience',
  'services', 'teamSize', 'locationsCount', 'currentBookings',
  'currentCRM', 'currentAutomations', 'currentAI', 'requiredChannels',
  'dataSources', 'integrationNeeds', 'budgetRange', 'desiredTimeline',
  'decisionMaker', 'legalConstraints', 'specialRequirements',
]);

const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

/**
 * Validates and annotates an onboarding data object.
 * @param {Object} data - raw onboarding input
 * @returns {Object} OnboardingValidationResult
 */
export function validateOnboarding(data = {}) {
  const fieldStatus = {};
  const missingRequired = [];
  const warnings = [];

  for (const field of ALL_FIELDS) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      fieldStatus[field] = FIELD_STATUS.PROVIDED;
    } else if (REQUIRED_FIELDS.includes(field)) {
      fieldStatus[field] = FIELD_STATUS.MISSING_REQUIRED;
      missingRequired.push(field);
    } else {
      fieldStatus[field] = FIELD_STATUS.DEFAULTED;
    }
  }

  // Infer sector from businessType if missing
  if (fieldStatus.sector === FIELD_STATUS.MISSING_REQUIRED && data.businessType) {
    const inferred = inferSector(data.businessType);
    if (inferred) {
      data._inferredSector = inferred;
      warnings.push(`sector inferred from businessType: ${inferred}`);
      missingRequired.splice(missingRequired.indexOf('sector'), 1);
      fieldStatus.sector = FIELD_STATUS.INFERRED;
    }
  }

  // Check decisionMaker
  if (!data.decisionMaker) {
    warnings.push('decisionMaker not provided — human review required before proposal');
  }

  const valid = missingRequired.length === 0;

  return {
    valid,
    data:             { ...data },
    fieldStatus,
    missingRequired,
    warnings,
    onboardingComplete: valid,
    version:          ONBOARDING_SCHEMA_VERSION,
  };
}

function inferSector(businessType = '') {
  const t = businessType.toLowerCase();
  if (/veterinar|vet.*clinic|clinica.*vet/.test(t)) return 'veterinary';
  if (/dental|dentist/.test(t)) return 'dental';
  if (/fisio|physio/.test(t)) return 'fisio';
  if (/psicolog|psycholog/.test(t)) return 'psicologia';
  if (/legal|abogad|lawyer|law firm/.test(t)) return 'legal';
  if (/educac|school|colegio|academia/.test(t)) return 'educacion';
  if (/restaurant|gastro|cafe/.test(t)) return 'restaurante';
  if (/padel|tenis|tennis/.test(t)) return 'padel';
  if (/fitness|gym|gimnasio/.test(t)) return 'fitness';
  if (/estetica|beauty|spa/.test(t)) return 'estetica';
  if (/comercio|retail|tienda/.test(t)) return 'comercio';
  return null;
}

export function listOnboardingFields() {
  return ALL_FIELDS;
}

export function getRequiredFields() {
  return [...REQUIRED_FIELDS];
}
