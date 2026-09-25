// Nexo Vet Fixture — ADV-04
// Clínica Veterinaria Nexo — fictional client for E2E pipeline tests.
// isReal: false. No real client data.

export const NEXO_VET_BRIEF = Object.freeze({
  businessName:     'Clínica Veterinaria Nexo',
  vertical:         'veterinary',
  services:         ['consultas', 'vacunación', 'desparasitación', 'urgencias', 'revisión anual'],
  targetUsers:      ['propietarios de mascotas', 'veterinarios', 'recepcionistas'],
  roles:            ['ADMIN', 'VET', 'RECEPTIONIST', 'PET_OWNER'],
  location:         'Madrid, España',
  brandPreferences: { palette: 'teal-warm', tone: 'friendly-professional' },
  modules:          ['booking', 'patient_records', 'chat', 'notifications', 'admin_panel'],
  integrations:     ['airtable', 'make'],
  deploymentTarget: { provider: 'CLOUDFLARE_PAGES', dbProvider: 'SUPABASE', environment: 'DRY_RUN' },
  environment:      'DRY_RUN',
  isReal:           false,
  dataType:         'FIXTURE',
});

export const NEXO_VET_EXPECTED_AGENTS = Object.freeze([
  'CHAT', 'BOOKING', 'SUPPORT',
]);

export const NEXO_VET_EXPECTED_MODULES = Object.freeze([
  'booking', 'patient_records', 'chat', 'notifications', 'admin_panel',
]);

export const NEXO_VET_EXPECTED_RESULT = Object.freeze({
  status:        'SIMULATED',
  isReal:        false,
  environment:   'DRY_RUN',
  healthStatus:  'HEALTHY',
  autonomyGrade: 'B',
});

/**
 * Get a clean copy of the Nexo Vet fixture brief.
 * Use this in tests — never use real client data.
 */
export function getNexoVetBrief(overrides = {}) {
  return Object.freeze({ ...NEXO_VET_BRIEF, ...overrides });
}

/**
 * Blocker scenario: missing OAuth for integration.
 */
export function getNexoVetBlockedBrief(blockType = 'OAUTH') {
  const scenarios = {
    OAUTH:          { integrations: ['stripe', 'whatsapp', 'meta'] },
    API_KEY:        { integrations: ['openai'] },
    BILLING:        { hasBillingAction: true },
    TEST_FAIL:      { _simulateTestFail: true },
    BUILD_FAIL:     { _simulateBuildFail: true },
    SECURITY_FAIL:  { _simulateSecretLeak: true },
    DOMAIN_MISSING: { deploymentTarget: { provider: 'CLOUDFLARE_PAGES', dbProvider: 'SUPABASE', environment: 'PRODUCTION', domainMissing: true } },
  };

  return Object.freeze({
    ...NEXO_VET_BRIEF,
    ...(scenarios[blockType] ?? {}),
    _blockerScenario: blockType,
  });
}

export const NEXO_VET_FIXTURE_VERSION = '1.0.0';
