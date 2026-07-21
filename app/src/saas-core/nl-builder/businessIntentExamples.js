// Paso 11 · Fase 4 — Ejemplos válidos e inválidos de Business Intent.

export const MINIMAL_BUSINESS_INTENT = Object.freeze({
  schemaVersion: 1,
  requestId: "intent-example-minimal",
  language: "es",
  locale: "es-ES",
  country: "ES",
  currency: "EUR",
  timezone: "Europe/Madrid",
  business: {
    proposedName: "Negocio de ejemplo",
    sector: "generic-local-service",
  },
  sourceText: "Crea un SaaS para un negocio de ejemplo.",
  confidence: { overall: 0.3 },
});

export const FULL_BUSINESS_INTENT = Object.freeze({
  schemaVersion: 1,
  requestId: "intent-example-full",
  language: "es",
  locale: "es-ES",
  country: "ES",
  currency: "EUR",
  timezone: "Europe/Madrid",
  business: {
    proposedName: "Fisioterapia Activa Ejemplo",
    sector: "physiotherapy",
    subsector: "fisioterapia deportiva",
    businessModel: "clínica de servicios por cita",
    targetAudience: "pacientes locales",
    locations: [{ city: "Málaga", country: "ES" }],
    channels: ["web", "whatsapp"],
  },
  objectives: ["digitalizar la gestión de citas", "reducir ausencias mediante recordatorios"],
  problemsToSolve: ["agenda en papel", "recordatorios manuales por teléfono"],
  actors: ["paciente", "fisioterapeuta", "recepción"],
  processes: ["reserva de cita", "seguimiento de tratamiento"],
  entities: ["paciente", "cita", "servicio", "profesional"],
  requestedFeatures: [{ id: "agenda", raw: "reservas" }],
  inferredFeatures: [{ id: "recordatorios", raw: "recordatorio 24h inferido de agenda" }],
  rejectedFeatures: [],
  modules: [
    { id: "citas", source: "explicit", status: "enabled", confidence: 0.9, priority: "alta", justification: "el texto menciona reservas explícitamente", dependsOn: ["profesionales"] },
    { id: "profesionales", source: "inferred", status: "enabled", confidence: 0.8, priority: "alta", justification: "citas requiere profesionales o recursos", dependsOn: [] },
  ],
  roles: ["paciente", "fisioterapeuta", "recepcion", "direccion", "soporte"],
  permissions: { direccion: ["citas", "profesionales", "informes"] },
  automations: [{ id: "recordatorio_24h", capability: "recordatorio", trigger: "cita_programada" }],
  integrations: { messaging: { status: "not_configured", envVars: ["WHATSAPP_BUSINESS_TOKEN"] } },
  branding: { tone: "cercano-profesional" },
  landing: { sectionsEnabled: ["hero", "servicios", "cta"] },
  pwa: { shortName: "Fisio Activa" },
  analytics: { enabled: false },
  security: { regulatedSector: true },
  complianceNotes: ["datos de salud: revisar RGPD/expedientes antes de producción"],
  nonFunctionalRequirements: ["disponible en móvil y escritorio"],
  assumptions: [{ field: "plan", assumedValue: "pro", reason: "menciona varias funcionalidades avanzadas" }],
  ambiguities: [{ field: "business.locations", reason: "no se especifica dirección exacta", blocking: false }],
  recommendedQuestions: ["¿Cuántos fisioterapeutas trabajarán en la clínica?"],
  confidence: { overall: 0.72, bySection: { sector: 0.95, modules: 0.8, branding: 0.4 } },
  sourceText: "Crea un SaaS para una clínica de fisioterapia de Málaga con reservas y recordatorios.",
  normalizedSummary: "Clínica de fisioterapia en Málaga (ES) con reservas y recordatorios automáticos.",
  generationMetadata: { generatedBy: "nl-builder:deterministic-v1", seed: "demo-001" },
});

export const INVALID_BUSINESS_INTENT_EXAMPLES = Object.freeze({
  missingRequiredFields: Object.freeze({ schemaVersion: 1 }),
  sectorNotAString: Object.freeze({
    ...MINIMAL_BUSINESS_INTENT,
    business: { proposedName: "X", sector: 12345 },
  }),
  confidenceOutOfRange: Object.freeze({
    ...MINIMAL_BUSINESS_INTENT,
    confidence: { overall: 1.5 },
  }),
});
