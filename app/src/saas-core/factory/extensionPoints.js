// Paso 10 · Fase 13 — Puntos de extensión para pasos posteriores.
//
// Cada punto es un CONTRATO (interfaz + mock + estado + documentación),
// siguiendo el mismo patrón que `adapters/providerAdapters.js` de Paso 09.
// Ninguna función de este archivo hace una llamada de red ni requiere
// credenciales para ejecutarse en modo mock.

function defineExtensionPoint({
  id,
  label,
  category,
  interfaceMethods,
  credentialsNeeded = [],
  limitations = [],
  security = [],
  docsNote,
}) {
  return Object.freeze({
    id,
    label,
    category,
    status: "not_implemented",
    interfaceMethods: Object.freeze([...interfaceMethods]),
    credentialsNeeded: Object.freeze([...credentialsNeeded]),
    limitations: Object.freeze([...limitations]),
    security: Object.freeze([...security]),
    docsNote,
  });
}

/**
 * Construye la implementación MOCK de un punto de extensión: cada método
 * resuelve de forma determinista a `{status: "not_implemented", ...}`, sin
 * I/O. Sirve para poder "ejecutar" el contrato en tests/doctor sin fingir
 * que hay integración real.
 */
function buildMockImplementation(point) {
  const impl = {};
  for (const method of point.interfaceMethods) {
    impl[method] = async (...args) => ({
      status: "not_implemented",
      extensionPointId: point.id,
      method,
      argsEcho: args.length > 0 ? args[0] : undefined,
      message: `"${point.id}.${method}" no está implementado en este paso. Contrato preparado, sin llamada real.`,
    });
  }
  return Object.freeze(impl);
}

export const EXTENSION_POINTS = Object.freeze([
  defineExtensionPoint({
    id: "publicResearch",
    label: "Investigación pública autorizada",
    category: "research",
    interfaceMethods: ["searchPublicInfo", "getSourceSummary"],
    limitations: ["Solo fuentes públicas y autorizadas", "Sin scraping agresivo ni evasión de bloqueos"],
    security: ["Debe respetar robots.txt y términos de servicio de cada fuente"],
    docsNote: "Pensado para enriquecer publicInfo del blueprint antes de generar la landing.",
  }),
  defineExtensionPoint({
    id: "googleMaps",
    label: "Google Maps (API oficial)",
    category: "integration",
    interfaceMethods: ["geocodeAddress", "getPlaceDetails"],
    credentialsNeeded: ["GOOGLE_MAPS_API_KEY"],
    limitations: ["Sujeto a cuota/facturación de Google", "Requiere API oficial, no scraping de maps.google.com"],
    security: ["La API key nunca debe residir en el blueprint ni en el repositorio"],
  }),
  defineExtensionPoint({
    id: "websiteAudit",
    label: "Auditoría de páginas web del cliente",
    category: "research",
    interfaceMethods: ["auditWebsite"],
    limitations: ["Solo URLs proporcionadas explícitamente por el cliente"],
    security: ["No debe enviar credenciales del cliente a terceros"],
  }),
  defineExtensionPoint({
    id: "customerDataImport",
    label: "Importación de datos del cliente",
    category: "data",
    interfaceMethods: ["validateImportFile", "importRecords"],
    limitations: ["Requiere mapeo explícito de columnas antes de importar", "No sustituye una revisión RGPD del origen de datos"],
    security: ["Los datos reales del cliente nunca deben usarse para poblar demoData"],
  }),
  defineExtensionPoint({
    id: "commercialDiagnosis",
    label: "Diagnóstico comercial",
    category: "advisory",
    interfaceMethods: ["diagnoseBusiness"],
    limitations: ["Recomendaciones automáticas, no sustituyen asesoría profesional"],
  }),
  defineExtensionPoint({
    id: "automationRecommendations",
    label: "Recomendaciones de automatización",
    category: "advisory",
    interfaceMethods: ["recommendAutomations"],
    limitations: ["Se apoya en capabilityMap.js (catálogo genérico), no inventa capacidades nuevas"],
  }),
  defineExtensionPoint({
    id: "advancedBrandingGeneration",
    label: "Generación avanzada de branding",
    category: "creative",
    interfaceMethods: ["generateBrandConcepts"],
    limitations: ["No reemplaza brandingEngine.js (tokens/contraste), lo complementa con propuestas visuales"],
  }),
  defineExtensionPoint({
    id: "imageGeneration",
    label: "Generación de imágenes",
    category: "creative",
    interfaceMethods: ["generateImage"],
    credentialsNeeded: ["IMAGE_GENERATION_API_KEY"],
    limitations: ["Coste por generación", "Requiere revisión humana antes de publicar cualquier imagen"],
  }),
  defineExtensionPoint({
    id: "pdfBeforeAfterGeneration",
    label: "Generación de PDF antes/después",
    category: "reporting",
    interfaceMethods: ["generateBeforeAfterPdf"],
    limitations: ["Depende de mockups reales capturados (ver mockupCapture)"],
  }),
  defineExtensionPoint({
    id: "mockupCapture",
    label: "Capturas y mockups reales (Playwright u otro)",
    category: "tooling",
    interfaceMethods: ["captureMockups"],
    limitations: ["Requiere Playwright (u otra herramienta) instalado; no es una dependencia de este paso", "Sin entorno gráfico/headless disponible, no se ejecuta"],
    docsNote: "El manifest determinista ya existe (mockupManifest.js); este punto solo cubre la CAPTURA real.",
  }),
  defineExtensionPoint({
    id: "deployment",
    label: "Despliegue",
    category: "ops",
    interfaceMethods: ["deployPreview", "deployProduction"],
    limitations: ["Ningún despliegue real ocurre en este paso"],
    security: ["Requiere gates de release existentes (release engineering) antes de cualquier despliegue real"],
  }),
  defineExtensionPoint({
    id: "make",
    label: "Make (automatización)",
    category: "provider",
    interfaceMethods: ["listCapabilities", "trigger", "getStatus"],
    credentialsNeeded: ["MAKE_WEBHOOK_URL"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js AutomationProvider.",
  }),
  defineExtensionPoint({
    id: "airtable",
    label: "Airtable",
    category: "provider",
    interfaceMethods: ["list", "get", "create", "update", "remove"],
    credentialsNeeded: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js DataRepository.",
  }),
  defineExtensionPoint({
    id: "supabase",
    label: "Supabase",
    category: "provider",
    interfaceMethods: ["list", "get", "create", "update", "remove"],
    credentialsNeeded: ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"],
    docsNote: "Alternativa a Airtable para DataRepository; mismo contrato.",
  }),
  defineExtensionPoint({
    id: "stripe",
    label: "Stripe",
    category: "provider",
    interfaceMethods: ["createPaymentIntent", "confirmPayment", "refund"],
    credentialsNeeded: ["STRIPE_SECRET_KEY"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js PaymentProvider.",
  }),
  defineExtensionPoint({
    id: "whatsappBusiness",
    label: "WhatsApp Business",
    category: "provider",
    interfaceMethods: ["sendMessage", "getDeliveryStatus"],
    credentialsNeeded: ["WHATSAPP_BUSINESS_TOKEN"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js MessagingProvider.",
  }),
  defineExtensionPoint({
    id: "gmail",
    label: "Gmail",
    category: "provider",
    interfaceMethods: ["sendEmail", "getDeliveryStatus"],
    credentialsNeeded: ["GMAIL_OAUTH_CLIENT_ID"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js EmailProvider.",
  }),
  defineExtensionPoint({
    id: "googleCalendar",
    label: "Google Calendar",
    category: "provider",
    interfaceMethods: ["createEvent", "updateEvent", "deleteEvent", "listEvents"],
    credentialsNeeded: ["GOOGLE_CALENDAR_CLIENT_ID"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js CalendarProvider.",
  }),
  defineExtensionPoint({
    id: "analytics",
    label: "Analítica",
    category: "provider",
    interfaceMethods: ["track", "getSummary"],
    credentialsNeeded: ["ANALYTICS_WRITE_KEY"],
    docsNote: "Mismo contrato que adapters/providerAdapters.js AnalyticsProvider.",
  }),
  defineExtensionPoint({
    id: "aiLanguageProvider",
    label: "Proveedor de IA para interpretación de lenguaje natural",
    category: "provider",
    interfaceMethods: ["interpretBusinessDescription"],
    credentialsNeeded: ["AI_PROVIDER_API_KEY"],
    limitations: [
      "Paso 11 (One Prompt Factory · Natural Language Business Builder) implementa un modo determinista local completo que NUNCA depende de este punto",
      "Cuando se conecte un proveedor real, su salida debe validarse estrictamente y hacer fallback automático al modo determinista ante timeout, error o JSON inválido",
    ],
    security: ["Sanitizar y limitar el tamaño del prompt de entrada antes de reenviarlo a cualquier proveedor externo"],
    docsNote: "Ver src/saas-core/nl-builder/aiProviderContract.js — interfaz + mock + política de fallback ya implementadas en Paso 11.",
  }),
]);

const BY_ID = new Map(EXTENSION_POINTS.map((p) => [p.id, p]));

export function getExtensionPoint(id) {
  return BY_ID.get(id) || null;
}

export function listExtensionPointIds() {
  return EXTENSION_POINTS.map((p) => p.id);
}

/** Devuelve el punto de extensión junto con su implementación mock ejecutable. */
export function getExtensionPointWithMock(id) {
  const point = getExtensionPoint(id);
  if (!point) return null;
  return { ...point, mockImplementation: buildMockImplementation(point) };
}
