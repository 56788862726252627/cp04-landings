/**
 * Make Automation Manifest — Phase 11
 * Generates DECLARATIVE automation manifest. No real scenarios created.
 * Each automation has clear trigger/steps/outputs + error handling.
 * Naming: emoji + nombre claro. Module names: clear, no emojis.
 */

export const MAKE_MANIFEST_VERSION = '1.0.0';

// ─── Automation Templates ─────────────────────────────────────────────────────

const AUTOMATION_TEMPLATES = Object.freeze({
  'booking-confirmation': {
    name: '📅 Confirmación de Cita',
    trigger: { type: 'webhook', event: 'booking.created', source: 'internal_api' },
    inputs: ['clientName', 'appointmentDate', 'appointmentTime', 'serviceName', 'businessName'],
    steps: [
      { module: 'Email Send', action: 'send_confirmation_email', requiresCredential: 'email_provider' },
      { module: 'SMS Send', action: 'send_confirmation_sms', requiresCredential: 'sms_provider', optional: true },
    ],
    outputs: ['emailSentStatus', 'smsSentStatus'],
    dependencies: ['email_provider'],
    errorHandling: { strategy: 'retry_once', notifyOnFailure: 'admin', rollbackOnFail: false },
    humanReview: false,
    productionStatus: 'DECLARATIVE_ONLY',
  },
  'appointment-reminder': {
    name: '⏰ Recordatorio de Cita',
    trigger: { type: 'schedule', cron: '0 9 * * *', description: 'Daily at 9am — sends reminders for next 24h appointments' },
    inputs: ['appointments24h', 'clientContacts'],
    steps: [
      { module: 'Filter Appointments', action: 'filter_next_24h', requiresCredential: null },
      { module: 'Email Send', action: 'send_reminder_email', requiresCredential: 'email_provider' },
      { module: 'WhatsApp Send', action: 'send_whatsapp_reminder', requiresCredential: 'whatsapp_provider', optional: true },
    ],
    outputs: ['remindersSentCount', 'failedReminders'],
    dependencies: ['email_provider'],
    errorHandling: { strategy: 'continue_on_error', notifyOnFailure: 'admin', rollbackOnFail: false },
    humanReview: false,
    productionStatus: 'DECLARATIVE_ONLY',
  },
  'vaccination-reminder': {
    name: '💉 Recordatorio de Vacuna',
    trigger: { type: 'schedule', cron: '0 10 * * 1', description: 'Weekly on Monday — reminds owners of upcoming pet vaccinations' },
    inputs: ['upcomingVaccinations', 'ownerContacts'],
    steps: [
      { module: 'Filter Vaccinations', action: 'filter_due_within_30_days', requiresCredential: null },
      { module: 'Email Send', action: 'send_vaccination_reminder', requiresCredential: 'email_provider' },
    ],
    outputs: ['remindersSentCount'],
    dependencies: ['email_provider'],
    errorHandling: { strategy: 'retry_once', notifyOnFailure: 'admin', rollbackOnFail: false },
    humanReview: false,
    productionStatus: 'DECLARATIVE_ONLY',
  },
  'new-patient-intake': {
    name: '🆕 Alta de Nuevo Paciente',
    trigger: { type: 'webhook', event: 'patient.created', source: 'internal_api' },
    inputs: ['patientData', 'assignedProfessional'],
    steps: [
      { module: 'CRM Create Record', action: 'create_patient_record', requiresCredential: 'airtable' },
      { module: 'Email Send', action: 'send_welcome_email', requiresCredential: 'email_provider' },
      { module: 'Create Task', action: 'assign_first_appointment_task', requiresCredential: null },
    ],
    outputs: ['crmRecordId', 'welcomeEmailStatus'],
    dependencies: ['airtable', 'email_provider'],
    errorHandling: { strategy: 'stop_on_error', notifyOnFailure: 'admin', rollbackOnFail: true },
    humanReview: true,
    productionStatus: 'DECLARATIVE_ONLY',
  },
  'lead-recovery': {
    name: '🔄 Recuperación de Lead',
    trigger: { type: 'webhook', event: 'booking.abandoned', source: 'internal_api' },
    inputs: ['prospectName', 'prospectEmail', 'abandonedService'],
    steps: [
      { module: 'Wait', action: 'wait_24h', requiresCredential: null },
      { module: 'Email Send', action: 'send_recovery_email', requiresCredential: 'email_provider' },
      { module: 'CRM Update', action: 'mark_lead_contacted', requiresCredential: 'airtable' },
    ],
    outputs: ['emailSentStatus', 'crmUpdated'],
    dependencies: ['email_provider', 'airtable'],
    errorHandling: { strategy: 'continue_on_error', notifyOnFailure: 'admin', rollbackOnFail: false },
    humanReview: false,
    productionStatus: 'DECLARATIVE_ONLY',
  },
  'report-generation': {
    name: '📊 Generación de Informe Semanal',
    trigger: { type: 'schedule', cron: '0 7 * * 5', description: 'Every Friday at 7am — weekly business summary' },
    inputs: ['appointmentsWeek', 'revenueWeek', 'newClients'],
    steps: [
      { module: 'Aggregate Data', action: 'compile_weekly_metrics', requiresCredential: null },
      { module: 'Generate PDF', action: 'create_report_pdf', requiresCredential: null },
      { module: 'Email Send', action: 'send_report_to_admin', requiresCredential: 'email_provider' },
    ],
    outputs: ['reportPdfUrl', 'emailSentStatus'],
    dependencies: ['email_provider'],
    errorHandling: { strategy: 'retry_once', notifyOnFailure: 'admin', rollbackOnFail: false },
    humanReview: false,
    productionStatus: 'DECLARATIVE_ONLY',
  },
  'pet-new-owner': {
    name: '🐾 Alta de Propietario y Mascota',
    trigger: { type: 'webhook', event: 'owner.created', source: 'internal_api' },
    inputs: ['ownerData', 'petData'],
    steps: [
      { module: 'CRM Create Record', action: 'create_owner_record', requiresCredential: 'airtable' },
      { module: 'Email Send', action: 'send_welcome_email', requiresCredential: 'email_provider' },
      { module: 'Create Reminder', action: 'schedule_first_checkup', requiresCredential: null },
    ],
    outputs: ['crmRecordId', 'reminderCreated'],
    dependencies: ['airtable', 'email_provider'],
    errorHandling: { strategy: 'retry_once', notifyOnFailure: 'admin', rollbackOnFail: false },
    humanReview: false,
    productionStatus: 'DECLARATIVE_ONLY',
  },
});

// ─── Sector Automation Defaults ───────────────────────────────────────────────

const SECTOR_AUTOMATIONS = Object.freeze({
  dental:     ['booking-confirmation', 'appointment-reminder', 'new-patient-intake', 'lead-recovery'],
  salud:      ['booking-confirmation', 'appointment-reminder', 'new-patient-intake'],
  fisio:      ['booking-confirmation', 'appointment-reminder', 'new-patient-intake', 'lead-recovery'],
  estetica:   ['booking-confirmation', 'appointment-reminder', 'lead-recovery'],
  tech:       ['report-generation', 'lead-recovery'],
  educacion:  ['booking-confirmation', 'report-generation'],
  legal:      ['new-patient-intake', 'report-generation'],
  veterinary: ['booking-confirmation', 'appointment-reminder', 'vaccination-reminder', 'pet-new-owner', 'lead-recovery'],
  default:    ['booking-confirmation', 'appointment-reminder'],
});

/**
 * Generate Make automation manifest.
 * @param {Object} brief   - validated brief
 * @param {Object} profile - business profile
 * @returns {Object} makeManifest
 */
export function generateMakeManifest(brief = {}, profile = {}) {
  const sector         = brief.sector ?? profile.sector ?? 'default';
  const automationNeeds = brief.automationNeeds ?? [];
  const sectorDefaults = SECTOR_AUTOMATIONS[sector] ?? SECTOR_AUTOMATIONS.default;

  const automationIds = automationNeeds.length > 0
    ? [...new Set([...sectorDefaults, ...automationNeeds])]
    : sectorDefaults;

  const automations = automationIds.map(id => {
    const template = AUTOMATION_TEMPLATES[id] ?? {
      name: `🔧 ${id}`,
      trigger: { type: 'webhook', event: id, source: 'internal_api' },
      inputs: [], steps: [], outputs: [], dependencies: [],
      errorHandling: { strategy: 'retry_once', notifyOnFailure: 'admin', rollbackOnFail: false },
      humanReview: false, productionStatus: 'DECLARATIVE_ONLY',
    };

    return { id, ...template };
  });

  const allDeps = [...new Set(automations.flatMap(a => a.dependencies))];
  const requiresHumanReview = automations.some(a => a.humanReview);

  return {
    totalAutomations: automations.length,
    automations,
    allDependencies:  allDeps,
    requiresHumanReview,
    productionStatus: 'DECLARATIVE_ONLY — no real Make scenarios created',
    scenarioNaming:   'emoji + nombre claro (en español)',
    moduleNaming:     'descriptivo, sin emojis',
    notes: [
      'These are declarative designs for future Make implementation.',
      'No scenarios have been created or activated in Make.',
      'Each automation requires real credentials before production activation.',
    ],
    manifestVersion: MAKE_MANIFEST_VERSION,
  };
}
