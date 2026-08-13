// Paso 10 · Fase 2 — Ejemplos de Business Blueprint (válidos e inválidos).
//
// Usados por tests, por `business:create --example=minimal|full` y por la
// documentación. El ejemplo "full" es el que genera la clínica dental demo
// de la Fase 12 (prueba real de generación).

import { BUSINESS_BLUEPRINT_SCHEMA_VERSION } from "./businessBlueprintSchema.js";

export const MINIMAL_BUSINESS_BLUEPRINT = Object.freeze({
  schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION,
  businessId: "negocio-minimo-demo",
  tenantId: "negocio-minimo-demo",
  commercialName: "Negocio Mínimo Demo",
  sector: "generic-local-service",
  country: "ES",
  timezone: "Europe/Madrid",
  locale: "es-ES",
  currencies: ["EUR"],
  plan: "starter",
});

export const FULL_BUSINESS_BLUEPRINT = Object.freeze({
  schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION,
  businessId: "clinica-dental-sonrisas-de-malaga",
  tenantId: "clinica-dental-sonrisas-de-malaga",
  commercialName: "Sonrisas de Málaga",
  legalName: "Sonrisas de Málaga Clínica Dental S.L. (ficticia)",
  sector: "dental",
  subsector: "odontologia-general",
  country: "ES",
  timezone: "Europe/Madrid",
  locale: "es-ES",
  currencies: ["EUR"],
  publicInfo: Object.freeze({
    shortDescription: "Clínica dental ficticia de demostración en Málaga: revisiones, limpieza y ortodoncia.",
    website: "https://sonrisas-de-malaga.example",
    email: "hola@sonrisas-de-malaga.example",
    address: Object.freeze({ city: "Málaga", region: "Andalucía", country: "ES" }),
  }),
  branding: Object.freeze({
    logoRef: "assets/logo-placeholder.svg",
    colors: Object.freeze({ primary: "#1c6fd6", accent: "#2fd6b0", bg: "#ffffff", surface: "#f4f8fb", text: "#0c1420" }),
    fonts: Object.freeze({ display: "'Poppins', sans-serif", body: "'Inter', sans-serif" }),
    tone: "cercano-profesional",
  }),
  plan: "pro",
  modules: Object.freeze([
    "inicio", "citas", "clientes", "pagos", "automatizaciones", "soporte", "informes", "configuracion",
    "agenda", "profesionales", "recursos", "servicios", "documentos", "formularios",
  ]),
  services: Object.freeze([
    Object.freeze({ name: "Revisión general", durationMinutes: 30, priceHint: 35 }),
    Object.freeze({ name: "Limpieza dental", durationMinutes: 45, priceHint: 60 }),
    Object.freeze({ name: "Ortodoncia (consulta)", durationMinutes: 30, priceHint: 40 }),
  ]),
  professionals: Object.freeze([
    Object.freeze({ name: "Dra. Elena Ruiz (ficticia)", role: "dentista", functions: Object.freeze(["odontologia-general"]) }),
    Object.freeze({ name: "Dr. Marcos Vidal (ficticio)", role: "dentista", functions: Object.freeze(["ortodoncia"]) }),
    Object.freeze({ name: "Dra. Nuria Campos (ficticia)", role: "dentista", functions: Object.freeze(["odontologia-general", "endodoncia"]) }),
  ]),
  resources: Object.freeze([
    Object.freeze({ name: "Consulta 1", kind: "consulta" }),
    Object.freeze({ name: "Consulta 2", kind: "consulta" }),
  ]),
  schedules: Object.freeze({
    enabled: true,
    weekdays: Object.freeze({ open: "09:00", close: "20:00" }),
    saturday: Object.freeze({ open: "10:00", close: "14:00" }),
    sunday: null,
  }),
  locations: Object.freeze([
    Object.freeze({ name: "Sonrisas de Málaga — Centro", city: "Málaga" }),
  ]),
  automations: Object.freeze(["alta_cliente", "confirmacion", "cancelacion", "recordatorio", "encuesta", "documento", "pago"]),
  aiCapabilities: Object.freeze(["demo_data_generation", "landing_copy_draft"]),
  integrations: Object.freeze({
    automation: Object.freeze({ status: "not_configured", envVars: Object.freeze(["MAKE_WEBHOOK_URL"]) }),
    dataRepository: Object.freeze({ status: "not_configured", envVars: Object.freeze(["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"]) }),
    payments: Object.freeze({ status: "not_configured", envVars: Object.freeze(["STRIPE_SECRET_KEY"]) }),
    messaging: Object.freeze({ status: "not_configured", envVars: Object.freeze(["WHATSAPP_BUSINESS_TOKEN"]) }),
    calendar: Object.freeze({ status: "not_configured", envVars: Object.freeze(["GOOGLE_CALENDAR_CLIENT_ID"]) }),
  }),
  pwa: Object.freeze({
    shortName: "Sonrisas Málaga",
    themeColor: "#1c6fd6",
    backgroundColor: "#ffffff",
    display: "standalone",
    orientation: "portrait",
    startUrl: "/",
  }),
  landingPage: Object.freeze({
    sectionsEnabled: Object.freeze([
      "header", "hero", "valueProposition", "benefits", "services", "howItWorks",
      "testimonials", "faq", "cta", "contact", "footer",
    ]),
    ctaLabel: "Pedir cita",
    ctaHref: "#contacto",
  }),
  demoData: Object.freeze({ enabled: true, seed: "sonrisas-de-malaga-demo", sizes: Object.freeze({ customers: 18, professionals: 3, appointments: 24, incidents: 3 }) }),
  flags: Object.freeze({}),
  limits: Object.freeze({ maxUsers: 20, maxLocations: 1 }),
  privacy: Object.freeze({ regulatedSector: true, sensitiveDataCategories: Object.freeze(["salud_o_legal_placeholder"]) }),
  manualSteps: Object.freeze([
    "Revisión normativa sanitaria/odontológica antes de producción",
    "Sustituir logotipo/branding placeholder por assets reales",
  ]),
  generationMeta: Object.freeze({
    generatedBy: "business:create",
    sourceInstruction: "Crear una solución SaaS para una clínica dental de Málaga, con tres odontólogos, agenda, pacientes, recordatorios, formularios, landing page, PWA y branding premium.",
    notes: "Blueprint de ejemplo Fase 12 (Paso 10): negocio demo ficticio, sin datos reales, sin conexión a proveedores.",
  }),
});

/** Ejemplo legacy (pre-v1, sin schemaVersion, currency singular) para probar migrateBusinessBlueprint. */
export const LEGACY_BUSINESS_BLUEPRINT_EXAMPLE = Object.freeze({
  businessId: "negocio-legacy-demo",
  tenantId: "negocio-legacy-demo",
  commercialName: "Negocio Legacy Demo",
  sector: "generic-local-service",
  country: "ES",
  timezone: "Europe/Madrid",
  locale: "es-ES",
  currency: "EUR",
  plan: "starter",
});

/** Ejemplos deliberadamente inválidos, uno por tipo de error, para tests/documentación. */
export const INVALID_BUSINESS_BLUEPRINT_EXAMPLES = Object.freeze({
  missingRequiredFields: Object.freeze({ schemaVersion: BUSINESS_BLUEPRINT_SCHEMA_VERSION, businessId: "x" }),
  unknownSector: Object.freeze({ ...MINIMAL_BUSINESS_BLUEPRINT, sector: "sector-inventado" }),
  badTenantId: Object.freeze({ ...MINIMAL_BUSINESS_BLUEPRINT, tenantId: "ID CON ESPACIOS" }),
  secretLookalike: Object.freeze({ ...MINIMAL_BUSINESS_BLUEPRINT, publicInfo: Object.freeze({ shortDescription: "clave sk_live_12345 filtrada" }) }),
  unknownTopLevelKey: Object.freeze({ ...MINIMAL_BUSINESS_BLUEPRINT, unexpectedField: true }),
});
