// Club Pádel 04 · Stripe Payments Contract
// Archivo aislado de planificación técnica (mismo patrón que
// worker-reservas/auth/auth-contract.js). No está conectado todavía al
// Worker ni al frontend, y no importa el SDK de Stripe.
//
// Regla de proyecto vigente (config/client-config.schema.json
// #integrations.payments.enabled, const: false): Stripe permanece
// desactivado en producción hasta una decisión de negocio explícita. Este
// contrato existe para que, cuando esa decisión llegue y existan
// credenciales de Test Mode, activar el flujo sea una integración —no un
// diseño desde cero.
//
// Por qué existe esto además de scripts/make-qa/stripe-mock.mjs:
// stripe-mock.mjs prueba el CONTRATO DEL WEBHOOK QUE YA CONSUME MAKE hoy
// (un CustomWebHook plano, sin verificación de firma, ver
// audit/app-make-50-integration/APP_MAKE_50_STRIPE_SANDBOX_PLAN.md). Este
// módulo modela, en cambio, la integración que la app/Worker NO tiene
// todavía: un endpoint propio que sí verificaría la firma real de Stripe y
// crearía sus propias Checkout Sessions. Son dos capas distintas del mismo
// proveedor — no se fusionan porque una depende de Make y la otra no.

/** Eventos de webhook que este adapter sabe interpretar (FASE 3 de la misión). */
export const STRIPE_WEBHOOK_EVENT_TYPES = Object.freeze([
  "checkout.session.completed",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.refunded",
]);

/**
 * Endpoints conceptuales del futuro Worker. Documentales — no hay rutas
 * registradas todavía.
 *
 * Ruta canónica de webhook (Production Readiness, riesgo residual #1
 * resuelto): "/api/payments/stripe/webhook" (barra), no
 * "/api/payments/stripe-webhook" (guion, valor histórico de esta constante
 * hasta esta sesión). Se eligió la variante con barra porque: (a) es la que
 * ya fija STRIPE_WEBHOOK_ROUTE en stripe-route-contract.js y sus tests desde
 * la FASE 2 del cierre técnico anterior; (b) es la única consistente con el
 * patrón real de rutas ya registradas en worker-reservas/src/index.js
 * (segmentos anidados por barra: /api/auth/login, /api/support/health/ready,
 * /api/disponibilidad — nunca guion uniendo recurso+acción).
 * tests/stripe/route-contract.test.mjs tiene un test de anti-divergencia que
 * compara este valor contra STRIPE_WEBHOOK_ROUTE.path (stripe-route-contract.js)
 * y falla si alguna vez vuelven a desalinearse.
 */
export const STRIPE_ENDPOINTS = Object.freeze({
  createCheckoutSession: "/api/payments/checkout-session",
  webhook: "/api/payments/stripe/webhook",
});

/**
 * Estados internos de un pago, independientes del vocabulario de Stripe —
 * es lo que el resto de la app (Airtable, panel ADMIN) debería consumir.
 * mapPaymentStatus() traduce un evento Stripe a uno de estos.
 */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
});

/** Tabla de mapeo evento Stripe -> PAYMENT_STATUS. Única fuente de verdad para mapPaymentStatus(). */
export const EVENT_TYPE_TO_STATUS = Object.freeze({
  "checkout.session.completed": PAYMENT_STATUS.PAID,
  "checkout.session.expired": PAYMENT_STATUS.EXPIRED,
  "payment_intent.succeeded": PAYMENT_STATUS.PAID,
  "payment_intent.payment_failed": PAYMENT_STATUS.FAILED,
  "charge.refunded": PAYMENT_STATUS.REFUNDED,
});

/**
 * Contrato de metadata obligatoria en cualquier Checkout Session/PaymentIntent
 * creado por este adapter. Conecta con docs/agencia-ia/TENANT_ISOLATION_CONTRACT.md
 * y resolveTenantContext.js#integrations.stripe (FASE 5 de la misión).
 * Ningún evento sin estos campos debe considerarse procesable — ver
 * validateEventMetadata() en stripe-adapter.mock.js.
 */
export const REQUIRED_METADATA_FIELDS = Object.freeze([
  "tenant_id",
  "client_id",
  "user_id",
  "booking_id",
  "payment_reference",
]);

/** Firmas documentales del adapter (implementadas en modo mock en stripe-adapter.mock.js). */
export const STRIPE_ADAPTER_CONTRACT = Object.freeze({
  createCheckoutSession: "(params: {tenantId, clientId, userId, bookingId, amount, currency, successUrl, cancelUrl}) => Promise<CheckoutSession>",
  retrieveSession: "(sessionId: string) => Promise<CheckoutSession | null>",
  handleWebhookEvent: "(rawBody: string, signatureHeader: string, env: StripeEnv) => Promise<WebhookHandlingResult>",
  verifyWebhookSignature: "(rawBody: string, signatureHeader: string, secret: string, opts?) => {valid: boolean, reason?: string}",
  mapPaymentStatus: "(stripeEventType: string) => PAYMENT_STATUS | null",
  idempotencyKey: "(params: {tenantId, bookingId, paymentReference}) => string",
  duplicateEventProtection: "(eventId: string, store: StripeEventDedupStore) => boolean",
});

/** Variables de entorno esperadas. Solo nombres — nunca valores (ver scripts/stripe/env-readiness.mjs). */
export const STRIPE_ENV_VARS = Object.freeze([
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PUBLISHABLE_KEY",
]);
