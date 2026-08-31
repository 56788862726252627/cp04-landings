/**
 * Veterinary Vertical — Config
 * New vertical scaffolded by Paso B pipeline.
 */

export const VETERINARY_VERSION = '1.0.0';

export const VETERINARY_CONFIG = Object.freeze({
  id:       'veterinary',
  label:    'Clínica Veterinaria',
  preset:   'friendly-human',
  icon:     '🐾',
  color:    '#0d9488',

  intents: [
    'primera_consulta',
    'vacunacion',
    'desparasitacion',
    'urgencia',
    'revision_anual',
    'cirugia',
    'nutricion',
    'estetica_animal',
    'hospitalizacion',
    'cambio_cancelacion',
    'precio_servicios',
  ],

  safetyRules: {
    noDiagnosis:          true,
    noPrescription:       true,
    noEmergencyAdvice:    true,
    noMedicalGuarantees:  true,
    referToProfessional:  true,
  },

  defaultModules: [
    'dashboard', 'booking', 'patients', 'history', 'treatments',
    'vaccinations', 'reminders', 'chatbot', 'calendar', 'roles',
  ],

  roles: ['admin', 'reception', 'veterinarian', 'owner'],

  entities: ['Owner', 'Pet', 'MedicalHistory', 'Vaccination', 'Appointment', 'Treatment'],

  experienceProfile: {
    motionTier:    'standard',
    colorProfile:  'warm-teal',
    audienceTech:  'mixed',
    mobileFirst:   true,
  },
});
