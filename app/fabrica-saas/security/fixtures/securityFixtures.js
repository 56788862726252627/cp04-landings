// Security Fixtures — ADV-19

export const SECURITY_FIXTURES = Object.freeze({
  healthyProfile: Object.freeze({
    clientId: 'client-fixture-a',
    environment: 'STAGING',
    riskLevel: 'LOW',
    dataSensitivity: 'INTERNAL',
    authMode: 'SUPABASE_JWT',
    externalIntegrations: ['airtable', 'stripe'],
    aiEnabled: true,
    trackingEnabled: false,
    securityControls: [
      'LEAST_PRIVILEGE', 'SECRET_REFERENCES', 'CLIENT_ISOLATION',
      'SECURE_DEFAULTS', 'AUTH_SESSION_POLICY', 'AUDIT_TRAIL',
      'BACKUP_AWARENESS', 'INCIDENT_PATH',
    ],
    privacyControls: ['AI_PRIVACY_POLICY', 'DATA_MINIMIZATION'],
  }),

  healthyBaselineResult: Object.freeze({
    passed: true,
    status: 'BASELINE_MET',
    missing: [],
  }),

  healthySecurityScore: Object.freeze({
    auth: 95, authorization: 95, secrets: 100, input: 90,
    output: 90, clientIsolation: 100, aiSafety: 90,
    logging: 90, dependency: 85, incidentReadiness: 90,
  }),

  healthyGateCheck: Object.freeze({
    secretLeak: false, crossClientAccess: false, privilegeEscalation: false,
    injectionBypass: false, unsafeToolWrite: false, missingAuthOnProtected: false,
    restrictedDataLeak: false, unapprovedExternalAction: false,
  }),
});
