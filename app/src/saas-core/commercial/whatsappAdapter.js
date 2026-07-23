// Paso 19 · Fase 3 — Adaptador WhatsApp Business Cloud API (Meta)
// AISLADO. Distinto del mock de Make (audit/) y del adapter de una
// sesión anterior (WhatsApp preprod readiness, otra rama/worktree no
// visible aquí) — build nuevo para la cadena de ramas apiladas.
//
// Contrato:
//  - NUNCA envía un mensaje real sin `WHATSAPP_ACCESS_TOKEN` +
//    `WHATSAPP_PHONE_NUMBER_ID` presentes en `env` — sin ellos, toda
//    función de envío devuelve `status: "not_configured"` de forma
//    determinista, nunca lanza, nunca inventa una respuesta de Meta.
//  - CONSENTIMIENTO OBLIGATORIO: ningún mensaje (plantilla o texto
//    libre) se envía sin `hasRecordedConsent(store, phone) === true`
//    — verificado ANTES de tocar red, incluso si Stripe/WhatsApp
//    estuvieran configurados. El "store" de consentimiento es
//    inyectable (contrato mínimo: `{get(phone), set(phone, record)}`)
//    — este paso no asume ninguna base de datos concreta.
//  - La verificación de firma de webhook es REAL y verificable offline
//    (`X-Hub-Signature-256: sha256=<hex>` sobre el payload crudo,
//    firmado con el App Secret de Meta) — no requiere ninguna llamada
//    de red ni cuenta activa para poder probarse.
//  - Nunca añade un SDK de WhatsApp/Meta como dependencia: usa `fetch`
//    nativo contra la Graph API REST documentada.
//  - `fetchImpl` es inyectable (por defecto `fetch` global).

import process from "node:process";

import { redactSecret, constantTimeEqual, computeHmacSha256Hex } from "./commercialShared.js";
import { validateWhatsAppTemplateParams, validateWhatsAppTextParams } from "./commercialSchemas.js";

export const WHATSAPP_GRAPH_API_VERSION = "v20.0";
export const WHATSAPP_GRAPH_API_BASE = `https://graph.facebook.com/${WHATSAPP_GRAPH_API_VERSION}`;

export function isWhatsAppConfigured(env = process.env) {
  return typeof env.WHATSAPP_ACCESS_TOKEN === "string" && env.WHATSAPP_ACCESS_TOKEN.length > 0 && typeof env.WHATSAPP_PHONE_NUMBER_ID === "string" && env.WHATSAPP_PHONE_NUMBER_ID.length > 0;
}

/** Nunca expone el token completo — seguro para volcar en un informe/log. */
export function getWhatsAppRuntimeStatus(env = process.env) {
  return {
    configured: isWhatsAppConfigured(env),
    accessTokenRedacted: redactSecret(env.WHATSAPP_ACCESS_TOKEN),
    phoneNumberIdConfigured: typeof env.WHATSAPP_PHONE_NUMBER_ID === "string" && env.WHATSAPP_PHONE_NUMBER_ID.length > 0,
    appSecretConfigured: typeof env.WHATSAPP_APP_SECRET === "string" && env.WHATSAPP_APP_SECRET.length > 0,
  };
}

/**
 * Contrato mínimo de un "consent store" inyectable:
 * `{ get(phoneE164): {granted: bool, ...}|undefined, set(phoneE164, record): void }`
 * — este adaptador no asume Postgres/Airtable/localStorage/etc.
 */
export function hasRecordedConsent(consentStore, phoneE164) {
  if (!consentStore || typeof consentStore.get !== "function") throw new Error("hasRecordedConsent requiere un consentStore con .get(phone)");
  const record = consentStore.get(phoneE164);
  return Boolean(record && record.granted === true);
}

export function recordConsent(consentStore, phoneE164, { granted, source, recordedAtIso } = {}) {
  if (!consentStore || typeof consentStore.set !== "function") throw new Error("recordConsent requiere un consentStore con .set(phone, record)");
  if (typeof granted !== "boolean") throw new Error("recordConsent requiere granted: boolean explícito (nunca se infiere)");
  const record = { granted, source: source ?? "unknown", recordedAtIso: recordedAtIso ?? null };
  consentStore.set(phoneE164, record);
  return record;
}

function consentGate(consentStore, phoneE164) {
  if (!hasRecordedConsent(consentStore, phoneE164)) {
    return { blocked: true, result: { status: "consent_not_recorded", reason: `No hay consentimiento registrado para ${phoneE164} — ningún mensaje se ha enviado. Usa recordConsent() antes de enviar.` } };
  }
  return { blocked: false };
}

function configGate(env) {
  if (!isWhatsAppConfigured(env)) {
    return { blocked: true, result: { status: "not_configured", reason: "WHATSAPP_ACCESS_TOKEN/WHATSAPP_PHONE_NUMBER_ID no están definidos en el entorno — ningún mensaje se ha enviado." } };
  }
  return { blocked: false };
}

export async function sendTemplateMessage(params, { env = process.env, consentStore, fetchImpl = fetch } = {}) {
  const { valid, errors } = validateWhatsAppTemplateParams(params);
  if (!valid) return { status: "invalid_params", errors };

  const consent = consentGate(consentStore, params.toPhoneE164);
  if (consent.blocked) return consent.result;
  const config = configGate(env);
  if (config.blocked) return config.result;

  const response = await fetchImpl(`${WHATSAPP_GRAPH_API_BASE}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.toPhoneE164,
      type: "template",
      template: { name: params.templateName, language: { code: params.languageCode }, components: params.components ?? [] },
    }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { status: "whatsapp_error", httpStatus: response.status, error: data?.error ?? null };
  return { status: "sent", messageId: data?.messages?.[0]?.id ?? null };
}

/**
 * Mensaje de texto libre — solo válido dentro de la ventana de sesión
 * de 24h de WhatsApp (una plantilla es obligatoria fuera de esa
 * ventana); este adaptador NO verifica la ventana de 24h por sí mismo
 * (requeriría rastrear el último mensaje entrante del usuario, fuera de
 * alcance de este paso) — queda documentado como limitación explícita.
 */
export async function sendTextMessage(params, { env = process.env, consentStore, fetchImpl = fetch } = {}) {
  const { valid, errors } = validateWhatsAppTextParams(params);
  if (!valid) return { status: "invalid_params", errors };

  const consent = consentGate(consentStore, params.toPhoneE164);
  if (consent.blocked) return consent.result;
  const config = configGate(env);
  if (config.blocked) return config.result;

  const response = await fetchImpl(`${WHATSAPP_GRAPH_API_BASE}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: params.toPhoneE164, type: "text", text: { body: params.body } }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { status: "whatsapp_error", httpStatus: response.status, error: data?.error ?? null };
  return { status: "sent", messageId: data?.messages?.[0]?.id ?? null };
}

/**
 * Verificación REAL de la firma de webhook de Meta
 * (`X-Hub-Signature-256: sha256=<hex>` sobre el payload crudo, HMAC con
 * el App Secret) — funciona completamente offline.
 */
export function verifyWhatsAppWebhookSignature(rawPayload, signatureHeader, appSecret) {
  if (typeof signatureHeader !== "string" || !signatureHeader.startsWith("sha256=")) return { valid: false, reason: "cabecera X-Hub-Signature-256 ausente o mal formada (falta prefijo 'sha256=')" };
  const provided = signatureHeader.slice("sha256=".length);
  const expected = computeHmacSha256Hex(appSecret, rawPayload);
  if (provided.length !== expected.length || !constantTimeEqual(provided, expected)) return { valid: false, reason: "firma no coincide con el HMAC esperado" };
  return { valid: true, reason: null };
}

export function parseWhatsAppWebhookEvent(rawPayload, signatureHeader, appSecret) {
  const verification = verifyWhatsAppWebhookSignature(rawPayload, signatureHeader, appSecret);
  if (!verification.valid) return { valid: false, reason: verification.reason, event: null };
  let event;
  try {
    event = JSON.parse(rawPayload);
  } catch {
    return { valid: false, reason: "payload no es JSON válido tras verificar la firma", event: null };
  }
  return { valid: true, reason: null, event };
}
