// Club Pádel 04 · WhatsApp Business Platform — Delivery Status (T-whatsapp-closure, 2026-07-10, FASE 5)
// Aislado, no conectado a worker-reservas/src/index.js (mismo patrón que
// whatsapp-contract.js/whatsapp-adapter.mock.js/whatsapp-consent.js). No
// importa ningún SDK de Meta, no hace ninguna llamada de red — este módulo
// solo NORMALIZA un payload de webhook ya recibido (simulado en tests con
// fixtures/whatsapp/delivery/*.json).
//
// Reutiliza classifyProviderError() de whatsapp-adapter.mock.js para
// normalizar fallos — no reimplementa la tabla de códigos de error de Meta.
//
// Forma real (documentada) de un evento de estado dentro del webhook de
// Meta: entry[].changes[].value.statuses[] = [{id, status, timestamp,
// recipient_id, errors?}]. status real de Meta: "sent"|"delivered"|"read"|
// "failed" (a veces también "deleted", tratado aquí como UNKNOWN — no es un
// estado de entrega, es la retirada de un mensaje).

import { classifyProviderError } from "./whatsapp-adapter.mock.js";

export const DELIVERY_STATUS = Object.freeze({
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED",
  UNKNOWN: "UNKNOWN",
});

const META_STATUS_MAP = Object.freeze({
  sent: DELIVERY_STATUS.SENT,
  delivered: DELIVERY_STATUS.DELIVERED,
  read: DELIVERY_STATUS.READ,
  failed: DELIVERY_STATUS.FAILED,
});

/**
 * @param {string|undefined|null} rawStatus valor tal cual llega de Meta ("sent"/"delivered"/"read"/"failed"/...)
 * @returns {string} uno de DELIVERY_STATUS — nunca lanza, nunca deja pasar un valor no catalogado
 */
export function classifyDeliveryStatus(rawStatus) {
  return META_STATUS_MAP[rawStatus] ?? DELIVERY_STATUS.UNKNOWN;
}

/**
 * Normaliza UNA entrada de `value.statuses[]` ya extraída del webhook —
 * nunca asume forma bien formada (Meta puede mandar timestamp ausente,
 * recipient_id ausente en un evento corrupto/de prueba).
 * @param {object} rawStatusEntry
 * @returns {{message_id: string|null, status: string, timestamp: string|null, recipient: string|null, error_code: number|null, error_message: string|null, retryable: boolean|null, category: string|null}}
 */
export function normalizeDeliveryStatusEvent(rawStatusEntry) {
  const messageId = typeof rawStatusEntry?.id === "string" && rawStatusEntry.id.length > 0 ? rawStatusEntry.id : null;
  const status = classifyDeliveryStatus(rawStatusEntry?.status);
  const timestampRaw = rawStatusEntry?.timestamp;
  // Meta manda el timestamp como string de segundos Unix ("1719000000"), no ISO.
  const timestampMs = typeof timestampRaw === "string" && /^[0-9]+$/.test(timestampRaw) ? Number(timestampRaw) * 1000 : null;
  const recipient = typeof rawStatusEntry?.recipient_id === "string" && rawStatusEntry.recipient_id.length > 0 ? `+${rawStatusEntry.recipient_id.replace(/^\+/, "")}` : null;

  let errorCode = null;
  let errorMessage = null;
  let retryable = null;
  let category = null;
  if (status === DELIVERY_STATUS.FAILED) {
    const firstError = Array.isArray(rawStatusEntry?.errors) ? rawStatusEntry.errors[0] : null;
    errorCode = typeof firstError?.code === "number" ? firstError.code : null;
    errorMessage = firstError?.message ?? firstError?.title ?? null;
    const classification = classifyProviderError(errorCode);
    retryable = classification.retryable;
    category = classification.category;
  }

  return {
    message_id: messageId,
    status,
    timestamp: timestampMs !== null ? new Date(timestampMs).toISOString() : null,
    recipient,
    error_code: errorCode,
    error_message: errorMessage,
    retryable,
    category,
  };
}

/**
 * Recorre el payload COMPLETO del webhook (entry[].changes[].value.statuses[])
 * y devuelve la lista de eventos normalizados. Nunca lanza — un payload
 * malformado/inesperado produce una lista vacía, no una excepción (el
 * webhook real de Meta puede mandar `changes[].field !== "statuses"`, p.ej.
 * mensajes entrantes, que este módulo debe ignorar, no fallar).
 * @param {object} rawWebhookPayload
 * @returns {Array<ReturnType<typeof normalizeDeliveryStatusEvent>>}
 */
export function extractDeliveryStatusEvents(rawWebhookPayload) {
  const entries = Array.isArray(rawWebhookPayload?.entry) ? rawWebhookPayload.entry : [];
  const events = [];
  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const statuses = Array.isArray(change?.value?.statuses) ? change.value.statuses : [];
      for (const rawStatusEntry of statuses) {
        events.push(normalizeDeliveryStatusEvent(rawStatusEntry));
      }
    }
  }
  return events;
}

/**
 * Correlaciona un evento normalizado con el envío original que lo produjo.
 * `sentMessageIndex` lo construye el llamador a partir de los
 * `providerMessageId` ya devueltos por sendTemplateMessage()/sendTextMessage()
 * — este módulo nunca inventa esa relación, solo la consulta.
 * @param {ReturnType<typeof normalizeDeliveryStatusEvent>} event
 * @param {Map<string, {tenantId: string, to: string, templateName?: string, idempotencyKey: string}>} sentMessageIndex
 * @returns {{correlated: boolean, tenantId?: string, to?: string, templateName?: string, idempotencyKey?: string, reason?: string}}
 */
export function correlateDeliveryEvent(event, sentMessageIndex) {
  if (!event.message_id) {
    return { correlated: false, reason: "missing_message_id" };
  }
  const record = sentMessageIndex?.get(event.message_id);
  if (!record) {
    return { correlated: false, reason: "unknown_message_id" };
  }
  return { correlated: true, tenantId: record.tenantId, to: record.to, templateName: record.templateName ?? null, idempotencyKey: record.idempotencyKey };
}

/**
 * Dedup de eventos de entrega — Meta puede reenviar el mismo webhook
 * (garantía at-least-once). La clave es `${message_id}:${status}`
 * DELIBERADAMENTE (no solo message_id): sent->delivered->read son 3 eventos
 * legítimos y distintos para el MISMO message_id, ninguno es un duplicado
 * del anterior — solo repetir exactamente el mismo (id, status) es un
 * reenvío de webhook, no una transición de estado real.
 */
export class DeliveryEventDedupStore {
  #seen = new Set();

  key(event) {
    return `${event.message_id ?? "null"}:${event.status}`;
  }

  wasSeen(event) {
    return this.#seen.has(this.key(event));
  }

  markSeen(event) {
    this.#seen.add(this.key(event));
  }

  get seenCount() {
    return this.#seen.size;
  }
}

/**
 * @param {ReturnType<typeof normalizeDeliveryStatusEvent>} event
 * @param {DeliveryEventDedupStore} store
 * @returns {boolean} true si YA se había visto este (message_id, status) — no se vuelve a marcar
 */
export function deduplicateDeliveryEvent(event, store) {
  if (store.wasSeen(event)) return true;
  store.markSeen(event);
  return false;
}
