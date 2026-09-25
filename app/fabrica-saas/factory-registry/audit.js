// Audit Registry — PASO H
// Barrel file: all Paso H audit exports.

export {
  auditAgencyEndToEnd,
  CHAIN_STAGES,
  CHAIN_ISSUE_TYPES,
} from '../audit/endToEndMap.js';

export {
  auditCrossStepContracts,
  CONTRACT_IDS,
  CONTRACT_STATUS,
} from '../audit/crossStepContracts.js';

export {
  auditFactoryRegistry,
  EXPECTED_REGISTRY_VERSION,
  EXPECTED_PASO_STATUSES,
  REGISTRY_AUDIT_VERSION,
} from '../audit/registryAudit.js';

export {
  buildCapabilityMatrix,
  CAPABILITY_STATUS,
  CAPABILITY_CATEGORIES,
} from '../audit/capabilityMatrix.js';

export {
  auditAdvancedBoundary,
  ADVANCED_ITEMS,
  BOUNDARY_STATUS,
  ADVANCED_BOUNDARY_VERSION,
} from '../audit/advancedBoundary.js';

export {
  auditAgencySecurityBaseline,
  SEC_RESULT,
  SEC_CATEGORIES,
} from '../audit/securityBaseline.js';

export {
  auditAgencyQABaseline,
  QA_RESULT,
  QA_DIMENSIONS,
} from '../audit/qaBaseline.js';

export {
  auditAgencyDocumentation,
  DOC_STATUS,
  REQUIRED_DOCS,
} from '../audit/documentationAudit.js';

export {
  auditBasicDebt,
  DEBT_CATEGORY,
  DEBT_PATTERN_TYPES,
} from '../audit/basicDebt.js';

export {
  auditAgencyDuplication,
  DUP_SEVERITY,
  DUPLICATION_AUDIT_VERSION,
} from '../audit/duplicationAudit.js';

export {
  auditNamingConsistency,
  NAMING_RESULT,
  NAMING_CONVENTIONS,
} from '../audit/namingConsistency.js';

export {
  runNexoClientJourney,
  NEXO_CLIENT_FIXTURE,
  NEXO_JOURNEY_STEPS,
  JOURNEY_MODE,
  JOURNEY_STATUS,
} from '../audit/clientJourney.js';

export {
  runFailureJourneys,
  FAILURE_SCENARIO,
  FAILURE_RESULT,
} from '../audit/failureJourney.js';

export {
  auditContextEfficiency,
  EFFICIENCY_RATING,
  CONTEXT_EFFICIENCY_VERSION,
} from '../audit/contextEfficiency.js';

export {
  AgencyCompletionStatus,
  BASIC_STATUS,
  PASO_STATUSES,
  AGENCY_BASIC_STATUS,
  AGENCY_BASIC_HOURS,
  AGENCY_BASIC_PASOS,
  AGENCY_ADVANCED_ITEMS,
  COMPLETION_STATUS_VERSION,
} from '../audit/completionStatus.js';

export {
  runAgencyAudit,
  AUDIT_VERSION,
  AUDIT_DIMENSIONS,
} from '../audit/agencyAuditRunner.js';

export const PASO_H_STATUS = '100_PERCENT';
