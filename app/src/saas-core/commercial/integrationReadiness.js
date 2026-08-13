// Paso 20 · Fase 7 — Estado central de integraciones + checklist de
// credenciales. Analiza únicamente configuración YA presente en `env`
// (variables de entorno) y flags explícitos — NUNCA realiza una
// comprobación de red real contra Airtable/Make/Stripe/WhatsApp/Gmail
// ni contra el dominio/hosting. "Última comprobación" es siempre `null`
// en este paso: no se ha ejecutado ninguna prueba real.

import { getStripeRuntimeStatus } from "./stripeAdapter.js";
import { getWhatsAppRuntimeStatus } from "./whatsappAdapter.js";

export const INTEGRATION_STATUSES = Object.freeze(["NOT_CONFIGURED", "MOCK", "SANDBOX", "READY_FOR_CREDENTIALS", "TESTING", "READY_FOR_PRODUCTION", "PRODUCTION", "DEGRADED", "ERROR"]);

export const INTEGRATION_IDS = Object.freeze(["airtable", "make", "stripe", "whatsapp", "gmail", "domain", "ssl", "hosting", "backups", "monitoring"]);

function entry({ id, label, status, requirements, credentialsNeeded, providedBy, pendingTests, blockedBy, nextSteps, sanitizedErrors = [] }) {
  return Object.freeze({
    id,
    label,
    status,
    requirements: Object.freeze([...requirements]),
    credentialsNeeded: Object.freeze([...credentialsNeeded]),
    providedBy,
    pendingTests: Object.freeze([...pendingTests]),
    lastCheckedIso: null, // Paso 20: nunca se ejecuta una comprobación real — siempre null, nunca inventado
    sanitizedErrors: Object.freeze([...sanitizedErrors]),
    nextSteps: Object.freeze([...nextSteps]),
    blockedBy,
  });
}

/**
 * @param {object} env - variables de entorno (por defecto `process.env`, inyectable para tests)
 * @param {{airtableKnownDegraded?: boolean, makeValidatedFlowCount?: number}} externalContext - hechos YA conocidos por el usuario (p. ej. cuota de Airtable agotada, según memoria/documentación previa), nunca inferidos de una llamada de red real de este módulo
 */
export function computeIntegrationReadiness(env = {}, externalContext = {}) {
  const stripeStatus = getStripeRuntimeStatus(env);
  const whatsappStatus = getWhatsAppRuntimeStatus(env);

  const airtable = entry({
    id: "airtable",
    label: "Airtable",
    status: externalContext.airtableKnownDegraded ? "DEGRADED" : typeof env.AIRTABLE_API_KEY === "string" && env.AIRTABLE_API_KEY.length > 0 ? "READY_FOR_CREDENTIALS" : "NOT_CONFIGURED",
    requirements: ["Cuota de la API de Airtable disponible (histórico: cuota gratuita agotada, según documentación previa del proyecto)", "Base y tablas ya definidas (Make 50/50)"],
    credentialsNeeded: ["AIRTABLE_API_KEY", "AIRTABLE_BASE_ID"],
    providedBy: "usuario (cuenta de Airtable del negocio/agencia)",
    pendingTests: ["Validar los 50 flujos de Make con llamadas reales tras la renovación de cuota"],
    blockedBy: externalContext.airtableKnownDegraded ? "cuota gratuita de Airtable agotada (paso 2 de la secuencia de trabajo del proyecto: esperar renovación)" : null,
    nextSteps: ["Esperar renovación de cuota", "Repetir validación end-to-end de los 50 escenarios Make"],
  });

  const make = entry({
    id: "make",
    label: "Make (automatizaciones, 50 flujos)",
    status: (externalContext.makeValidatedFlowCount ?? 0) >= 50 ? "READY_FOR_PRODUCTION" : (externalContext.makeValidatedFlowCount ?? 0) > 0 ? "TESTING" : "MOCK",
    requirements: ["Blueprint de los 50 flujos ya diseñado (histórico del proyecto)", "Airtable operativo para las llamadas reales"],
    credentialsNeeded: ["MAKE_API_TOKEN (si se automatiza el despliegue de escenarios)"],
    providedBy: "usuario (cuenta de Make de la agencia)",
    pendingTests: [`Validar los ${50 - (externalContext.makeValidatedFlowCount ?? 0)} flujos restantes con llamadas reales (de 50 totales)`],
    blockedBy: "depende de Airtable operativo (ver integración 'airtable')",
    nextSteps: ["Tras Airtable: ejecutar los 50 escenarios con datos reales de prueba", "Registrar cada flujo validado en el checklist de Make 50/50 existente"],
  });

  const stripe = entry({
    id: "stripe",
    label: "Stripe (pagos)",
    status: !stripeStatus.configured ? "NOT_CONFIGURED" : stripeStatus.mode === "test" ? "SANDBOX" : stripeStatus.mode === "live" ? "READY_FOR_PRODUCTION" : "ERROR",
    requirements: ["Cuenta de Stripe (test o live)", "Webhook configurado con signing secret"],
    credentialsNeeded: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
    providedBy: "usuario (titular del negocio/agencia)",
    pendingTests: ["Checkout Session real en modo test", "Reembolso real en modo test", "Webhook real firmado por Stripe"],
    blockedBy: !stripeStatus.configured ? "sin STRIPE_SECRET_KEY configurada (paso 5 de la secuencia de trabajo del proyecto)" : null,
    nextSteps: ["Ver runbook de Paso 19 (docs/paso-19-payments-messaging-adapters/02-runbook-configuracion.md)"],
  });

  const whatsapp = entry({
    id: "whatsapp",
    label: "WhatsApp Business Cloud API",
    status: !whatsappStatus.configured ? "NOT_CONFIGURED" : "SANDBOX",
    requirements: ["App de Meta for Developers con producto WhatsApp activado", "Número de teléfono aprobado", "Plantillas aprobadas por Meta"],
    credentialsNeeded: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_APP_SECRET"],
    providedBy: "usuario (titular del negocio/agencia) — contratación pendiente (paso 4 de la secuencia de trabajo del proyecto)",
    pendingTests: ["Envío de plantilla real a un número de prueba", "Webhook real firmado por Meta"],
    blockedBy: !whatsappStatus.configured ? "WhatsApp Business aún no contratado/configurado" : null,
    nextSteps: ["Ver runbook de Paso 19"],
  });

  const gmail = entry({
    id: "gmail",
    label: "Gmail (notificaciones/soporte)",
    status: typeof env.GMAIL_OAUTH_CLIENT_ID === "string" && env.GMAIL_OAUTH_CLIENT_ID.length > 0 ? "READY_FOR_CREDENTIALS" : "NOT_CONFIGURED",
    requirements: ["Credenciales OAuth de Google Cloud", "Cuenta de Gmail del negocio/agencia"],
    credentialsNeeded: ["GMAIL_OAUTH_CLIENT_ID", "GMAIL_OAUTH_CLIENT_SECRET"],
    providedBy: "usuario",
    pendingTests: ["Envío de un correo de prueba real"],
    blockedBy: null,
    nextSteps: ["Definir si Gmail es necesario para el piloto o puede posponerse a producción"],
  });

  const domain = entry({
    id: "domain",
    label: "Dominio propio",
    status: "NOT_CONFIGURED",
    requirements: ["Compra del dominio en Hostinger (paso 6 de la secuencia de trabajo del proyecto)"],
    credentialsNeeded: ["Acceso al panel de Hostinger tras la compra"],
    providedBy: "usuario",
    pendingTests: ["Resolución DNS", "Certificado SSL emitido"],
    blockedBy: "dominio aún no comprado",
    nextSteps: ["Comprar dominio", "Configurar DNS apuntando al hosting elegido"],
  });

  const ssl = entry({
    id: "ssl",
    label: "Certificado SSL",
    status: "NOT_CONFIGURED",
    requirements: ["Dominio propio operativo"],
    credentialsNeeded: [],
    providedBy: "automático (Let's Encrypt/hosting) una vez exista dominio",
    pendingTests: ["Verificación de certificado válido en el dominio final"],
    blockedBy: "depende de 'domain'",
    nextSteps: ["Configurar tras la compra del dominio"],
  });

  const hosting = entry({
    id: "hosting",
    label: "Hosting de producción",
    status: "NOT_CONFIGURED",
    requirements: ["Decisión de proveedor de hosting", "Dominio apuntando al hosting"],
    credentialsNeeded: ["Credenciales del panel del proveedor de hosting"],
    providedBy: "usuario",
    pendingTests: ["Despliegue de prueba", "Verificación de acceso público"],
    blockedBy: "depende de 'domain'",
    nextSteps: ["Confirmar proveedor de hosting definitivo (paso 7 de la secuencia de trabajo del proyecto)"],
  });

  const backups = entry({
    id: "backups",
    label: "Backups",
    status: "NOT_CONFIGURED",
    requirements: ["Producción operativa", "Destino de backup definido"],
    credentialsNeeded: ["Credenciales del destino de backup (según se elija)"],
    providedBy: "usuario/agencia",
    pendingTests: ["Backup de prueba", "Restauración de prueba"],
    blockedBy: "depende de 'hosting'",
    nextSteps: ["Definir política de backup tras el despliegue de producción"],
  });

  const monitoring = entry({
    id: "monitoring",
    label: "Monitorización",
    status: "NOT_CONFIGURED",
    requirements: ["Producción operativa"],
    credentialsNeeded: ["Cuenta del proveedor de monitorización elegido (si aplica)"],
    providedBy: "usuario/agencia",
    pendingTests: ["Alerta de prueba"],
    blockedBy: "depende de 'hosting'",
    nextSteps: ["Definir herramienta de monitorización tras el despliegue de producción"],
  });

  const integrations = Object.freeze({ airtable, make, stripe, whatsapp, gmail, domain, ssl, hosting, backups, monitoring });
  const summary = Object.fromEntries(INTEGRATION_STATUSES.map((s) => [s, Object.values(integrations).filter((i) => i.status === s).length]));

  return Object.freeze({
    integrations,
    summary: Object.freeze(summary),
    overallBlocked: Object.values(integrations).some((i) => i.blockedBy !== null),
    disclaimer: "Ningún estado aquí proviene de una comprobación de red real — se calcula únicamente a partir de la presencia de variables de entorno y del contexto externo declarado explícitamente.",
  });
}
