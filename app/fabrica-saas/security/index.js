// Security Engine — ADV-19 barrel

// Posture
export { createSecurityPostureProfile, SECURITY_POSTURE_STATUS, RISK_LEVEL, DATA_SENSITIVITY } from './posture/securityPostureProfile.js';
export { createSecurityRisk, assessRiskScore, RISK_CATEGORY, RISK_SEVERITY, RISK_STATUS } from './posture/securityRisk.js';
export { createSecurityBaselinePolicy, evaluateBaseline, BASELINE_CONTROL } from './posture/securityBaselinePolicy.js';

// Data Classification
export { createDataClassificationPolicy, classify, DATA_CLASS } from './data/dataClassificationPolicy.js';
export { createPIIDataInventory, PII_TYPE, LEGAL_BASIS_CODE, DELETION_METHOD } from './data/piiDataInventory.js';
export { createDataPurposePolicy, RETENTION_CLASS } from './data/dataPurposePolicy.js';
export { createDataMinimizationPolicy, MINIMIZATION_RESULT } from './data/dataMinimizationPolicy.js';

// Privacy
export { createPrivacyRetentionPolicy, evaluateRetentionState, PRIVACY_RETENTION_PRESET, RETENTION_STATE } from './privacy/privacyRetentionPolicy.js';
export { createDataDeletionPlan, simulateDeletion, DELETION_TYPE, DELETION_STATUS } from './privacy/dataDeletionPlan.js';
export { createAnonymizationPolicy, IDENTIFIER_TYPE, ANONYMIZATION_RISK } from './privacy/anonymizationPolicy.js';
export { createPseudonymizationPolicy, revokePseudonym, PSEUDONYM_STATUS } from './privacy/pseudonymizationPolicy.js';

// GDPR
export { evaluateRight, GDPR_RIGHT, RIGHT_STATUS } from './gdpr/gdprDataSubjectRight.js';
export { createDataSubjectRequest, transitionDSAR, DSAR_STATUS, DSAR_DEADLINE_CLASS } from './gdpr/dataSubjectRequest.js';
export { createDSARIdentityVerificationPolicy, IDENTITY_VERIFICATION_METHOD, VERIFICATION_STATUS } from './gdpr/dsarIdentityVerificationPolicy.js';
export { createDSARDataMap, DATA_SOURCE } from './gdpr/dsarDataMap.js';
export { createGDPRResponsePlan, GDPR_RESPONSE_STEP, RESPONSE_PLAN_STATUS } from './gdpr/gdprResponsePlan.js';
export { createLegalBasisProfile, LEGAL_BASIS } from './gdpr/legalBasisProfile.js';

// Consent
export { createConsentRecord, withdrawConsent, CONSENT_STATUS } from './consent/consentRecord.js';
export { createConsentPolicy, DARK_PATTERN } from './consent/consentPolicy.js';
export { createConsentManagementPlatformFoundation, CMP_REGION, CMP_CONSENT_STATE } from './consent/consentManagementPlatformFoundation.js';
export { createCookieCategory, COOKIE_CATEGORY, DEFAULT_STATE } from './consent/cookieCategory.js';
export { createTrackerDefinition, TRACKER_STATUS } from './consent/trackerDefinition.js';
export { evaluateDefaultConsent } from './consent/defaultConsentPolicy.js';
export { createConsentWithdrawalPolicy, recordWithdrawal } from './consent/consentWithdrawalPolicy.js';
export { createConsentPolicyVersion, VERSION_CHANGE_TYPE } from './consent/consentPolicyVersion.js';
export { createCookieBannerModel, BANNER_ACTION, BANNER_ISSUE } from './consent/cookieBannerModel.js';
export { createPrivacyPreferenceCenterModel } from './consent/privacyPreferenceCenterModel.js';

// Headers
export { createSecurityHeadersPolicy, HEADER_STATUS } from './headers/securityHeadersPolicy.js';
export { createContentSecurityPolicyBuilder } from './headers/contentSecurityPolicyBuilder.js';

// Auth
export { createAuthenticationSecurityPolicy, AUTH_CONTROL } from './auth/authenticationSecurityPolicy.js';
export { createSessionSecurityPolicy } from './auth/sessionSecurityPolicy.js';
export { createAuthorizationPolicyEvaluator, AUTH_DECISION } from './auth/authorizationPolicyEvaluator.js';
export { createObjectAccessControlPolicy, detectIDOR, ACCESS_RESULT } from './auth/objectAccessControlPolicy.js';

// IO
export { createInputSecurityPolicy } from './io/inputSecurityPolicy.js';
export { createOutputSecurityPolicy } from './io/outputSecurityPolicy.js';

// Secrets
export { createSecretManagementPolicy, validateSecretReference, SECRET_RULE } from './secrets/secretManagementPolicy.js';
export { scanForLeaks, scanItems } from './secrets/secretLeakDetection.js';
export { createPrivacyLoggingPolicy } from './secrets/privacyLoggingPolicy.js';

// Audit
export { createSecurityAuditEntry, SECURITY_AUDIT_ACTION, SECURITY_AUDIT_ACTOR } from './audit/securityAuditEntry.js';

// Incidents
export { createSecurityIncident, transitionIncident, INCIDENT_STATUS, INCIDENT_SEVERITY } from './incidents/securityIncident.js';
export { createSecurityIncidentResponsePlan, RESPONSE_STEP } from './incidents/securityIncidentResponsePlan.js';
export { createPersonalDataBreachAssessment, BREACH_RISK, BREACH_OUTPUT } from './incidents/personalDataBreachAssessment.js';

// Third Party
export { createDependencySecurityPolicy, DEPENDENCY_STATUS } from './third-party/dependencySecurityPolicy.js';
export { createThirdPartyProcessorProfile, PROCESSOR_RISK, DPA_STATUS } from './third-party/thirdPartyProcessorProfile.js';
export { createInternationalDataTransferProfile, TRANSFER_STATUS } from './third-party/internationalDataTransferProfile.js';

// AI
export { createAIPrivacyPolicy, AI_PRIVACY_CONTROL } from './ai/aiPrivacyPolicy.js';
export { createAIProviderDataHandlingProfile, PROVIDER_DATA_STATUS } from './ai/aiProviderDataHandlingProfile.js';

// Agents
export { createAgentSecurityPolicy, AGENT_SECURITY_CONTROL } from './agents/agentSecurityPolicy.js';
export { createPromptInjectionSecurityPolicy } from './agents/promptInjectionSecurityPolicy.js';
export { createToolSecurityPolicy, TOOL_SENSITIVITY } from './agents/toolSecurityPolicy.js';

// API
export { createWebhookSecurityPolicy } from './api/webhookSecurityPolicy.js';
export { createAPISecurityPolicy } from './api/apiSecurityPolicy.js';
export { createRateLimitPolicy, RATE_LIMIT_SCOPE } from './api/rateLimitPolicy.js';
export { createAbuseDetectionPolicy, ABUSE_PATTERN, ABUSE_ACTION } from './api/abuseDetectionPolicy.js';
export { createFileUploadSecurityPolicy } from './api/fileUploadSecurityPolicy.js';

// Isolation
export { createSecurityClientIsolationEvaluator, ISOLATION_DOMAIN } from './isolation/securityClientIsolationEvaluator.js';
export { createTenantSecurityContext, validateContext, ENVIRONMENT } from './isolation/tenantSecurityContext.js';
export { createPrivilegeEscalationDetector, ESCALATION_TYPE } from './isolation/privilegeEscalationDetector.js';

// Quality Scores
export { computeSecurityQualityScore } from './quality/securityQualityScore.js';
export { computePrivacyQualityScore } from './quality/privacyQualityScore.js';
export { computeGDPRTechnicalReadinessScore } from './quality/gdprTechnicalReadinessScore.js';
export { computeCMPReadinessScore } from './quality/cmpReadinessScore.js';

// Quality Gates
export { evaluateSecurityQualityGate, SECURITY_GATE_BLOCKED_REASON } from './quality/securityQualityGate.js';
export { evaluatePrivacyQualityGate, PRIVACY_GATE_BLOCKED_REASON } from './quality/privacyQualityGate.js';
export { evaluateGDPRTechnicalReadinessGate, GDPR_GATE_STATUS } from './quality/gdprTechnicalReadinessGate.js';
export { evaluateCMPQualityGate, CMP_GATE_BLOCKED_REASON } from './quality/cmpQualityGate.js';

// Bridges
export { createSecurityObservabilityBridge, SECURITY_EVENT } from './bridges/observabilityBridge.js';
export { createSecurityCICDBridge, SECURITY_CICD_GATE } from './bridges/cicdBridge.js';
export { createSecurityProductionPipelineBridge } from './bridges/productionPipelineBridge.js';
export { createSecurityDockerBridge } from './bridges/dockerBridge.js';
export { createSecurityBackupBridge } from './bridges/backupBridge.js';
export { createSecurityBrowserQABridge, BROWSER_QA_CHECK } from './bridges/browserQABridge.js';
export { createSecurityHealthBridge, SECURITY_HEALTH_DIMENSION } from './bridges/healthBridge.js';

// Fixtures
export { SECURITY_FIXTURES } from './fixtures/securityFixtures.js';
export { PRIVACY_FIXTURES } from './fixtures/privacyFixtures.js';
export { CMP_FIXTURES } from './fixtures/cmpFixtures.js';
export { GDPR_FIXTURES } from './fixtures/gdprFixtures.js';
export { ATTACK_FIXTURES } from './fixtures/attackFixtures.js';
export { FAILURE_FIXTURES } from './fixtures/failureFixtures.js';

export const SECURITY_GUARDRAILS = Object.freeze({
  NO_REAL_DATA_DELETE:        true,
  NO_REAL_SECRET_ROTATION:    true,
  NO_REAL_TRACKING:           true,
  NO_REAL_CONSENT_CAPTURE:    true,
  NO_REAL_EXTERNAL_COST:      true,
  SECRET_EXCLUSION_ENFORCED:  true,
  CLIENT_ISOLATION_ENFORCED:  true,
  LEGAL_CERTIFICATION:        false,
  CP04_TOUCHED:               false,
  BOT_TRADING_TOUCHED:        false,
  LOCALHOST_5175_TOUCHED:     false,
});

export const SECURITY_ENGINE_VERSION = '1.0.0';
export const ADV19_STATUS = '100_PERCENT';
