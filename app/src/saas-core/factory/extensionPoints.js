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
    docsNote: "Pensado para enriquecer publicInfo del blueprint antes de generar la landing. El motor offline/fixtures ya implementado en Paso 12 (research/sourceAdapters.js) es el modo determinista real hasta que se conecte esta interfaz.",
  }),
  defineExtensionPoint({
    id: "googleMaps",
    label: "Google Maps (API oficial)",
    category: "integration",
    interfaceMethods: ["geocodeAddress", "getPlaceDetails"],
    credentialsNeeded: ["GOOGLE_MAPS_API_KEY"],
    limitations: ["Sujeto a cuota/facturación de Google", "Requiere API oficial, no scraping de maps.google.com"],
    security: ["La API key nunca debe residir en el blueprint ni en el repositorio"],
    docsNote: "Paso 12 cubre este dato con MOCK_MAPS_LISTING_ADAPTER (research/sourceAdapters.js) mientras esta interfaz no esté conectada.",
  }),
  defineExtensionPoint({
    id: "websiteAudit",
    label: "Auditoría de páginas web del cliente",
    category: "research",
    interfaceMethods: ["auditWebsite"],
    limitations: ["Solo URLs proporcionadas explícitamente por el cliente"],
    security: ["No debe enviar credenciales del cliente a terceros"],
    docsNote: "Ver research/auditOrchestrator.js: hoy analiza HTML local/fixture (LOCAL_HTML_ADAPTER/FIXTURE_WEBSITE_ADAPTER); las URLs declaradas producen evidencia 'unavailable' hasta conectar un fetcher real aquí.",
  }),
  defineExtensionPoint({
    id: "publicWebsiteFetcher",
    label: "Obtención real de páginas web públicas",
    category: "research",
    interfaceMethods: ["fetchPage"],
    limitations: ["Debe respetar robots.txt, rate limits y tamaño máximo de contenido", "Nunca debe seguir enlaces por sí solo (sin crawling recursivo no autorizado)"],
    security: ["Debe pasar por classifyUrl() (research/urlSafety.js) antes de cualquier conexión: sin esto, riesgo de SSRF"],
    docsNote: "Hasta que se conecte, research:audit --url produce evidencia 'unavailable' explícita (nunca simula una respuesta real).",
  }),
  defineExtensionPoint({
    id: "searchEngineProvider",
    label: "Motor de búsqueda (API oficial)",
    category: "research",
    interfaceMethods: ["search"],
    credentialsNeeded: ["SEARCH_ENGINE_API_KEY"],
    limitations: ["Sujeto a cuota/facturación del proveedor", "Sin scraping de resultados de búsqueda"],
  }),
  defineExtensionPoint({
    id: "directoryProvider",
    label: "Directorios públicos (API oficial)",
    category: "research",
    interfaceMethods: ["lookupBusiness"],
    limitations: ["Solo directorios con API/licencia de uso explícita"],
    docsNote: "Paso 12 cubre esto con MOCK_DIRECTORY_ADAPTER mientras no se conecte un proveedor real.",
  }),
  defineExtensionPoint({
    id: "socialProfileProvider",
    label: "Perfiles sociales públicos (API oficial)",
    category: "research",
    interfaceMethods: ["getPublicProfile"],
    credentialsNeeded: ["SOCIAL_PROVIDER_API_KEY"],
    limitations: ["Solo páginas/perfiles de negocio públicos, nunca perfiles individuales", "Sin recolección masiva de seguidores o contactos"],
    security: ["Prohibido cualquier perfilado individual (ver researchPolicy.js: individual_profiling)"],
  }),
  defineExtensionPoint({
    id: "reviewPlatformProvider",
    label: "Plataformas de reseñas (API oficial)",
    category: "research",
    interfaceMethods: ["getReviewSummary"],
    credentialsNeeded: ["REVIEW_PLATFORM_API_KEY"],
    limitations: ["Solo resúmenes agregados, no extracción de reseñas individuales identificables"],
  }),
  defineExtensionPoint({
    id: "lighthouseProvider",
    label: "Rendimiento web (Lighthouse/PageSpeed)",
    category: "research",
    interfaceMethods: ["runAudit"],
    credentialsNeeded: ["PAGESPEED_API_KEY"],
    limitations: ["Requiere una URL pública alcanzable", "Sujeto a cuota del proveedor"],
    docsNote: "Paso 12 cubre esto con MOCK_PERFORMANCE_ADAPTER mientras no se conecte un proveedor real.",
  }),
  defineExtensionPoint({
    id: "accessibilityProvider",
    label: "Accesibilidad (axe-core u otro)",
    category: "research",
    interfaceMethods: ["runAudit"],
    limitations: ["Requiere un entorno con navegador headless disponible"],
    docsNote: "Paso 12 cubre esto con MOCK_ACCESSIBILITY_ADAPTER mientras no se conecte un proveedor real.",
  }),
  defineExtensionPoint({
    id: "seoProvider",
    label: "SEO técnico (crawler propio o de terceros)",
    category: "research",
    interfaceMethods: ["runAudit"],
    limitations: ["Debe respetar robots.txt y límites de profundidad/tamaño"],
    docsNote: "Paso 12 cubre esto con MOCK_SEO_ADAPTER mientras no se conecte un proveedor real.",
  }),
  defineExtensionPoint({
    id: "technologyFingerprintProvider",
    label: "Detección de tecnologías (tipo Wappalyzer)",
    category: "research",
    interfaceMethods: ["detectTechnologies"],
    limitations: ["Solo detección pasiva de cabeceras/HTML público, sin intentos activos de explotación"],
    docsNote: "Paso 12 cubre esto con MOCK_TECHNOLOGY_DETECTOR_ADAPTER mientras no se conecte un proveedor real.",
  }),
  defineExtensionPoint({
    id: "openAiCompatibleResearchProvider",
    label: "Proveedor de investigación compatible con OpenAI",
    category: "provider",
    interfaceMethods: ["summarizeFindings"],
    credentialsNeeded: ["OPENAI_API_KEY"],
    limitations: ["Nunca sustituye la clasificación confirmed/inferred/unknown determinista", "Su salida debe validarse estrictamente y hacer fallback al motor determinista ante cualquier fallo (mismo patrón que aiProviderContract.js de Paso 11)"],
    security: ["Sanitizar y limitar el tamaño de cualquier contenido reenviado a un proveedor externo"],
  }),
  defineExtensionPoint({
    id: "perplexityCompatibleProvider",
    label: "Proveedor de investigación compatible con Perplexity",
    category: "provider",
    interfaceMethods: ["searchAndSummarize"],
    credentialsNeeded: ["PERPLEXITY_API_KEY"],
    limitations: ["Mismas limitaciones que openAiCompatibleResearchProvider"],
  }),
  defineExtensionPoint({
    id: "localModelResearchProvider",
    label: "Modelo local para investigación",
    category: "provider",
    interfaceMethods: ["summarizeFindings"],
    limitations: ["Requiere recursos de cómputo locales suficientes", "Sin garantía de calidad equivalente a un proveedor en la nube"],
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
