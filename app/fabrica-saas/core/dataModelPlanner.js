/**
 * Data Model Planner — Phase 9
 * Generates conceptual data model: entities, fields, relations, privacy.
 * DEMO_ONLY mode by default. No real data. No Supabase connection.
 */

export const DATA_MODEL_PLANNER_VERSION = '1.0.0';

const PRIVACY_LEVELS = Object.freeze({
  PUBLIC:      { label: 'Public',      retention: 'indefinite', encryption: false },
  INTERNAL:    { label: 'Internal',    retention: '1_year',     encryption: false },
  CONFIDENTIAL:{ label: 'Confidential',retention: '3_years',   encryption: true  },
  SENSITIVE:   { label: 'Sensitive',   retention: '5_years',   encryption: true  },
});

// ─── Base Entities (every business) ──────────────────────────────────────────

const BASE_ENTITIES = [
  {
    entity: 'User', fields: ['id', 'email', 'role', 'createdAt', 'lastLogin'],
    ownership: 'system', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'auth_system',
    notes: 'Demo: no real emails. Use fictitious@demo.test format.',
  },
  {
    entity: 'Session', fields: ['id', 'userId', 'token', 'expiresAt', 'device'],
    ownership: 'system', privacyLevel: 'SENSITIVE', sourceOfTruth: 'auth_system',
    notes: 'Demo: mocked session state only.',
  },
  {
    entity: 'Notification', fields: ['id', 'userId', 'type', 'message', 'read', 'createdAt'],
    ownership: 'system', privacyLevel: 'INTERNAL', sourceOfTruth: 'notification_service',
    notes: 'Demo: static mock notifications.',
  },
];

// ─── Vertical Entities ────────────────────────────────────────────────────────

const VERTICAL_ENTITIES = Object.freeze({
  dental: [
    { entity: 'Patient', fields: ['id', 'nombre', 'fechaNacimiento', 'dni', 'telefono', 'email', 'historialId'],
      ownership: 'professional', privacyLevel: 'SENSITIVE', sourceOfTruth: 'clinical_db',
      notes: 'Demo: use fictitious names and DNI placeholders only.' },
    { entity: 'Treatment', fields: ['id', 'patientId', 'type', 'date', 'professional', 'notes', 'cost'],
      ownership: 'professional', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'clinical_db', notes: '' },
    { entity: 'Appointment', fields: ['id', 'patientId', 'date', 'time', 'duration', 'type', 'status'],
      ownership: 'shared', privacyLevel: 'INTERNAL', sourceOfTruth: 'booking_service', notes: '' },
  ],
  salud: [
    { entity: 'Patient', fields: ['id', 'nombre', 'fechaNacimiento', 'historialId'],
      ownership: 'professional', privacyLevel: 'SENSITIVE', sourceOfTruth: 'clinical_db', notes: 'Demo only — fictitious.' },
    { entity: 'Appointment', fields: ['id', 'patientId', 'date', 'time', 'status'],
      ownership: 'shared', privacyLevel: 'INTERNAL', sourceOfTruth: 'booking_service', notes: '' },
  ],
  fisio: [
    { entity: 'Patient', fields: ['id', 'nombre', 'diagnostico', 'sesiones', 'historialId'],
      ownership: 'professional', privacyLevel: 'SENSITIVE', sourceOfTruth: 'clinical_db', notes: 'Demo only.' },
    { entity: 'Session', fields: ['id', 'patientId', 'date', 'evolution', 'exercises'],
      ownership: 'professional', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'clinical_db', notes: '' },
    { entity: 'Exercise', fields: ['id', 'name', 'category', 'duration', 'level', 'instructions'],
      ownership: 'system', privacyLevel: 'PUBLIC', sourceOfTruth: 'exercise_library', notes: '' },
    { entity: 'Appointment', fields: ['id', 'patientId', 'date', 'time', 'status'],
      ownership: 'shared', privacyLevel: 'INTERNAL', sourceOfTruth: 'booking_service', notes: '' },
  ],
  estetica: [
    { entity: 'Client', fields: ['id', 'nombre', 'telefono', 'email', 'loyaltyPoints'],
      ownership: 'staff', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'crm', notes: 'Demo only.' },
    { entity: 'Service', fields: ['id', 'name', 'duration', 'price', 'category'],
      ownership: 'admin', privacyLevel: 'PUBLIC', sourceOfTruth: 'catalog', notes: '' },
    { entity: 'Appointment', fields: ['id', 'clientId', 'serviceId', 'date', 'time', 'status'],
      ownership: 'shared', privacyLevel: 'INTERNAL', sourceOfTruth: 'booking_service', notes: '' },
  ],
  educacion: [
    { entity: 'Student', fields: ['id', 'nombre', 'email', 'group', 'enrolledCourses'],
      ownership: 'admin', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'student_db', notes: 'Demo only — fictitious.' },
    { entity: 'Course', fields: ['id', 'name', 'subject', 'teacher', 'schedule', 'enrolledCount'],
      ownership: 'admin', privacyLevel: 'INTERNAL', sourceOfTruth: 'curriculum', notes: '' },
    { entity: 'Grade', fields: ['id', 'studentId', 'courseId', 'score', 'date'],
      ownership: 'teacher', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'grading_db', notes: '' },
  ],
  legal: [
    { entity: 'Client', fields: ['id', 'nombre', 'email', 'nif', 'type'],
      ownership: 'lawyer', privacyLevel: 'SENSITIVE', sourceOfTruth: 'case_db', notes: 'Demo: fictitious NIF.' },
    { entity: 'Case', fields: ['id', 'clientId', 'type', 'status', 'deadline', 'documents'],
      ownership: 'lawyer', privacyLevel: 'SENSITIVE', sourceOfTruth: 'case_db', notes: '' },
    { entity: 'Document', fields: ['id', 'caseId', 'name', 'type', 'uploadedAt', 'version'],
      ownership: 'lawyer', privacyLevel: 'SENSITIVE', sourceOfTruth: 'document_store', notes: '' },
  ],
  veterinary: [
    { entity: 'Owner', fields: ['id', 'nombre', 'telefono', 'email', 'address'],
      ownership: 'staff', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'client_db',
      notes: 'Demo: fictitious names/phones only. No real contact data.' },
    { entity: 'Pet', fields: ['id', 'ownerId', 'nombre', 'species', 'breed', 'birthDate', 'weight', 'microchip'],
      ownership: 'professional', privacyLevel: 'INTERNAL', sourceOfTruth: 'clinical_db',
      notes: 'Demo: fictional pet names. No real microchip IDs.' },
    { entity: 'MedicalHistory', fields: ['id', 'petId', 'date', 'reason', 'diagnosis', 'treatment', 'veterinarian'],
      ownership: 'professional', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'clinical_db',
      notes: 'Demo: generic clinical scenarios, no real diagnoses.' },
    { entity: 'Vaccination', fields: ['id', 'petId', 'vaccineType', 'date', 'nextDue', 'lot', 'veterinarian'],
      ownership: 'professional', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'clinical_db', notes: '' },
    { entity: 'Appointment', fields: ['id', 'petId', 'ownerId', 'date', 'time', 'reason', 'status', 'notes'],
      ownership: 'shared', privacyLevel: 'INTERNAL', sourceOfTruth: 'booking_service', notes: '' },
    { entity: 'Treatment', fields: ['id', 'petId', 'type', 'startDate', 'endDate', 'medication', 'dose', 'frequency'],
      ownership: 'professional', privacyLevel: 'CONFIDENTIAL', sourceOfTruth: 'clinical_db', notes: '' },
  ],
});

/**
 * Generate data model plan.
 * @param {Object} brief      - validated brief
 * @param {Object} modulePlan - module plan
 * @param {Object} profile    - business profile
 * @returns {Object} dataModel
 */
export function planDataModel(brief = {}, modulePlan = {}, profile = {}) {
  const sector       = brief.sector ?? profile.sector ?? 'default';
  const demoOnly     = brief.dataNeeds?.production !== true;
  const modulesCount = modulePlan.total ?? 0;

  const verticalEntities = VERTICAL_ENTITIES[sector] ?? VERTICAL_ENTITIES.salud ?? [];
  const allEntities      = [...BASE_ENTITIES, ...verticalEntities];

  const entities = allEntities.map(e => ({
    ...e,
    dataType: demoOnly ? 'DEMO_ONLY' : 'PRODUCTION_REQUIRED',
    privacyConfig: PRIVACY_LEVELS[e.privacyLevel],
    relations: [],
  }));

  // Mark sensitive fields
  const sensitiveEntities = entities.filter(e => e.privacyLevel === 'SENSITIVE');

  // Relations
  const petEntity   = entities.find(e => e.entity === 'Pet');
  const ownerEntity = entities.find(e => e.entity === 'Owner');
  if (petEntity && ownerEntity) {
    petEntity.relations.push({ entity: 'Owner', type: 'belongs_to', field: 'ownerId' });
    ownerEntity.relations.push({ entity: 'Pet', type: 'has_many', field: 'id' });
  }

  const appointmentEntity = entities.find(e => e.entity === 'Appointment');
  const patientEntity     = entities.find(e => ['Patient', 'Pet', 'Client', 'Student'].includes(e.entity));
  if (appointmentEntity && patientEntity) {
    appointmentEntity.relations.push({ entity: patientEntity.entity, type: 'belongs_to', field: `${patientEntity.entity.toLowerCase()}Id` });
  }

  return {
    totalEntities:      entities.length,
    entities,
    sensitiveEntities:  sensitiveEntities.map(e => e.entity),
    demoOnly,
    productionRequired: !demoOnly,
    supabaseSchema:     demoOnly ? 'MOCK_ONLY' : 'SCHEMA_NEEDED',
    privacy: {
      gdprCompliant:     brief.legalConstraints?.gdpr ?? true,
      healthDataHandled: brief.legalConstraints?.healthData ?? false,
      retentionPolicy:   brief.legalConstraints?.healthData ? '5_YEARS' : 'STANDARD',
    },
    notes: [
      'No real personal data allowed in demo pipeline.',
      'All names, emails, phones, IDs are fictitious.',
      demoOnly ? 'Production database NOT connected.' : 'Production DB schema required before deploy.',
      `Data model covers ${entities.length} entities across ${modulesCount || 'unknown'} planned modules.`,
    ],
    plannerVersion: DATA_MODEL_PLANNER_VERSION,
  };
}
