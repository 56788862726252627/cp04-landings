// MCP Good Fixtures — ADV-12 (successful execution scenarios)

export const GOOD_FIXTURE_READ_HOURS = Object.freeze({
  label:       'read_business_hours',
  toolId:      'business.get_hours',
  clientId:    'padel_club_01',
  args:        Object.freeze({ clientId: 'padel_club_01' }),
  approvedByHuman: false,
  expectedStatus: 'SUCCESS',
  description: 'Read-only, free, no approval — should always pass',
  isReal: false,
});

export const GOOD_FIXTURE_READ_CRM_LEAD = Object.freeze({
  label:       'read_crm_lead',
  toolId:      'crm.get_lead',
  clientId:    'dental_clinic_02',
  args:        Object.freeze({ leadId: 'lead_001' }),
  approvedByHuman: false,
  expectedStatus: 'SUCCESS',
  description: 'CRM read, same client scope',
  isReal: false,
});

export const GOOD_FIXTURE_CHECK_AVAILABILITY = Object.freeze({
  label:       'check_calendar_availability',
  toolId:      'calendar.get_slots',
  clientId:    'padel_club_01',
  args:        Object.freeze({ date: '2026-09-15', serviceId: 'pista_01' }),
  approvedByHuman: false,
  expectedStatus: 'SUCCESS',
  description: 'Calendar read, no approval needed',
  isReal: false,
});

export const GOOD_FIXTURE_SAFE_INTERNAL_TASK = Object.freeze({
  label:       'create_internal_crm_note',
  toolId:      'crm.update_lead',
  clientId:    'gym_03',
  args:        Object.freeze({ leadId: 'lead_abc', fields: { notes: 'Follow-up llamada' } }),
  approvedByHuman: false,
  expectedStatus: 'SUCCESS',
  description: 'Safe write, idempotent, no human approval required',
  isReal: false,
});

export const GOOD_FIXTURE_QUERY_PUBLIC_DATA = Object.freeze({
  label:       'query_public_business_data',
  toolId:      'business.get_services',
  clientId:    'physio_04',
  args:        Object.freeze({ clientId: 'physio_04' }),
  approvedByHuman: false,
  expectedStatus: 'SUCCESS',
  description: 'Public business data — read-only, free',
  isReal: false,
});

export const GOOD_FIXTURE_READ_PROJECT_FILE = Object.freeze({
  label:       'read_project_file',
  toolId:      'files.read',
  clientId:    'legal_05',
  args:        Object.freeze({ path: '/projects/case_001/brief.md' }),
  approvedByHuman: false,
  expectedStatus: 'SUCCESS',
  description: 'File read in safe path, low risk',
  isReal: false,
});

export const ALL_GOOD_FIXTURES = Object.freeze([
  GOOD_FIXTURE_READ_HOURS,
  GOOD_FIXTURE_READ_CRM_LEAD,
  GOOD_FIXTURE_CHECK_AVAILABILITY,
  GOOD_FIXTURE_SAFE_INTERNAL_TASK,
  GOOD_FIXTURE_QUERY_PUBLIC_DATA,
  GOOD_FIXTURE_READ_PROJECT_FILE,
]);

export const MCP_GOOD_FIXTURES_VERSION = '1.0.0';
