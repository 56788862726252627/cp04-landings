// Club Pádel 04 · WhatsApp Business Platform Contract
// Archivo aislado de planificación técnica (mismo patrón que
// worker-reservas/auth/auth-contract.js y worker-reservas/payments/stripe-contract.js).
// No está conectado todavía al Worker ni al frontend, no importa ningún SDK
// de Meta/WhatsApp, no hace ninguna llamada de red.
//
// Regla de proyecto vigente (config/client-config.schema.json
// #integrations.messaging.enabled, const: false): WhatsApp permanece
// desactivado en producción hasta una decisión de negocio explícita.
//
// Por qué existe esto además de scripts/make-qa/whatsapp-mock.mjs:
// whatsapp-mock.mjs prueba el contrato de UN escenario Make concreto (envío
// vía conector nativo whatsapp-business-cloud de Make, mensajes prefijados
// QA_CP04_, un solo tenant implícito). Este módulo modela, en cambio, la
// integración que la app/Worker NO tiene todavía: un adapter propio,
// multi-tenant, con las 10 funciones pedidas por la misión, capaz de
// construir Y clasificar respuestas del proveedor — no solo decidir si
// Make debería enviar. Son dos capas del mismo proveedor, con contratos
// distintos; no se fusionan (mismo criterio que Stripe, ver
// docs/agencia-ia/STRIPE_PAYMENT_METADATA_CONTRACT.md §3 para el precedente).

/** Categorías reales de plantilla de Meta — determinan ventana de envío y coste. */
export const TEMPLATE_CATEGORY = Object.freeze({
  UTILITY: "UTILITY",
  MARKETING: "MARKETING",
  AUTHENTICATION: "AUTHENTICATION",
});

/**
 * Registro de plantillas propias de Club Pádel 04 (namespace de la app, no
 * el de ningún escenario Make concreto). `variables` define el contrato de
 * `buildTemplateComponents()`: nombre lógico + longitud máxima permitida
 * (Meta trunca/rechaza parámetros de texto excesivamente largos; los
 * límites aquí son conservadores, no los límites exactos publicados por
 * Meta, que pueden cambiar por plantilla aprobada).
 */
export const WHATSAPP_TEMPLATES = Object.freeze({
  booking_confirmed: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "player_name", maxLength: 60 },
      { name: "court_name", maxLength: 40 },
      { name: "date_time", maxLength: 40 },
      { name: "booking_reference", maxLength: 20 },
    ],
  },
  booking_cancelled: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "player_name", maxLength: 60 },
      { name: "court_name", maxLength: 40 },
      { name: "date_time", maxLength: 40 },
      { name: "cancellation_reason", maxLength: 120 },
    ],
  },
  booking_rescheduled: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "player_name", maxLength: 60 },
      { name: "old_date_time", maxLength: 40 },
      { name: "new_date_time", maxLength: 40 },
      { name: "court_name", maxLength: 40 },
    ],
  },
  reminder_24h: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "player_name", maxLength: 60 },
      { name: "court_name", maxLength: 40 },
      { name: "date_time", maxLength: 40 },
    ],
  },
  reminder_2h: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "player_name", maxLength: 60 },
      { name: "court_name", maxLength: 40 },
      { name: "date_time", maxLength: 40 },
    ],
  },
  tournament_update: {
    category: TEMPLATE_CATEGORY.MARKETING,
    defaultLanguage: "es",
    variables: [
      { name: "tournament_name", maxLength: 60 },
      { name: "update_message", maxLength: 200 },
    ],
  },
  waitlist_slot_available: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "player_name", maxLength: 60 },
      { name: "court_name", maxLength: 40 },
      { name: "date_time", maxLength: 40 },
      { name: "expires_in_minutes", maxLength: 10 },
    ],
  },
  incident_notice: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [{ name: "incident_summary", maxLength: 200 }],
  },
  faq_response: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [
      { name: "question_topic", maxLength: 60 },
      { name: "answer_summary", maxLength: 200 },
    ],
  },
  opt_out_ack: {
    category: TEMPLATE_CATEGORY.UTILITY,
    defaultLanguage: "es",
    variables: [],
  },
});

/** Idiomas soportados en esta fase (ISO 639-1, formato Meta con guion bajo para variantes: "es", "en", "es_ES"). */
export const SUPPORTED_LANGUAGES = Object.freeze(["es", "en", "es_ES", "en_US"]);

/**
 * Códigos de error reales documentados de WhatsApp Cloud API, ampliando
 * scripts/make-qa/whatsapp-mock.mjs#PROVIDER_FAILURE_CODES con las
 * categorías que classifyProviderError() necesita distinguir (no solo
 * retryable/no-retryable, sino el motivo — rate limit vs sesión vs
 * plantilla vs destinatario vs cuenta).
 */
export const PROVIDER_ERROR_CODES = Object.freeze({
  130429: { message: "(#130429) Rate limit hit", retryable: true, category: "rate_limit" },
  131047: { message: "Message failed to send because more than 24 hours have passed since the customer last replied", retryable: false, category: "session_expired" },
  132000: { message: "Number of parameters does not match the expected number of params", retryable: false, category: "invalid_template" },
  131026: { message: "Message undeliverable — recipient phone number not on WhatsApp", retryable: false, category: "invalid_recipient" },
  133010: { message: "The WhatsApp Business Account has not been registered", retryable: false, category: "account_error" },
  100: { message: "Invalid parameter", retryable: false, category: "invalid_template" },
  1: { message: "Unknown error / temporary", retryable: true, category: "unknown" },
  131000: { message: "Generic provider failure", retryable: true, category: "unknown" },
});

/** Endpoints conceptuales del futuro Worker. Documentales — no hay rutas registradas todavía. */
export const WHATSAPP_ENDPOINTS = Object.freeze({
  sendMessage: "/api/messaging/whatsapp/send",
  webhook: "/api/messaging/whatsapp-webhook",
});

/** Firmas documentales del adapter (implementadas en modo mock en whatsapp-adapter.mock.js). */
export const WHATSAPP_ADAPTER_CONTRACT = Object.freeze({
  sendTemplateMessage: "(params: {to, templateName, language?, variables, tenantId, idempotencyKey}, deps) => Promise<SendResult>",
  sendTextMessage: "(params: {to, text, tenantId, idempotencyKey, sessionWindowOpen}, deps) => Promise<SendResult>",
  validateRecipient: "(phone: string, consentStore: ConsentStore, suppressionList?: Set<string>) => {allowed: boolean, reason: string}",
  normalizePhoneNumber: "(rawInput: string, defaultCountryCode?: string) => {valid: boolean, e164?: string, reason?: string}",
  resolveTemplate: "(templateName: string, language?: string) => {found: boolean, template?: object, reason?: string}",
  buildTemplateComponents: "(templateName: string, variableValues: Record<string,string>) => {valid: boolean, components?: Array, errors?: string[]}",
  handleProviderResponse: "(rawResponse: object) => {status: 'accepted'|'failed', providerMessageId?: string, errorCode?: number}",
  classifyProviderError: "(errorCode: number) => {retryable: boolean, category: string, message: string}",
  computeRetryDecision: "(params: {attempt: number, retryable: boolean, retryAfterMs?: number, maxAttempts?: number, baseMs?: number, maxMs?: number, jitterMs?: number}) => {shouldRetry: boolean, delayMs: number|null, reason: string}",
  deduplicateOutboundMessage: "(idempotencyKey: string, store: WhatsappDuplicateSendStore) => boolean",
});

/** Variables de entorno esperadas. Solo nombres — nunca valores (ver scripts/whatsapp/env-readiness.mjs). */
export const WHATSAPP_ENV_VARS = Object.freeze([
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_BUSINESS_ACCOUNT_ID",
  "WHATSAPP_VERIFY_TOKEN",
]);
