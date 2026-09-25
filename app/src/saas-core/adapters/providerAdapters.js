// Paso 09 · Fase 8 — Adaptadores de proveedores externos.
//
// Contratos desacoplados + implementaciones MOCK locales (memoria del
// proceso, sin red, sin credenciales). La UI/dominio nunca debe importar
// "Airtable" o "Stripe" directamente: importa la interfaz genérica
// (p.ej. PaymentProvider) y recibe la implementación mock aquí o, en el
// futuro, una implementación real detrás del mismo contrato. Ninguna
// función de este archivo hace una llamada de red.

export const PROVIDER_INTERFACES = Object.freeze({
  DataRepository: Object.freeze(["list", "get", "create", "update", "remove"]),
  AutomationProvider: Object.freeze(["listCapabilities", "trigger", "getStatus"]),
  PaymentProvider: Object.freeze(["createPaymentIntent", "confirmPayment", "refund"]),
  MessagingProvider: Object.freeze(["sendMessage", "getDeliveryStatus"]),
  EmailProvider: Object.freeze(["sendEmail", "getDeliveryStatus"]),
  CalendarProvider: Object.freeze(["createEvent", "updateEvent", "deleteEvent", "listEvents"]),
  FileStorageProvider: Object.freeze(["putFile", "getFile", "deleteFile", "listFiles"]),
  AnalyticsProvider: Object.freeze(["track", "getSummary"]),
});

// Documentación de futuras implementaciones reales. `status` siempre
// "not_implemented" en este paso: no se realiza ninguna llamada externa.
export const FUTURE_PROVIDER_IMPLEMENTATIONS = Object.freeze([
  { interfaceName: "DataRepository", vendor: "Airtable", status: "not_implemented" },
  { interfaceName: "DataRepository", vendor: "Supabase", status: "not_implemented" },
  { interfaceName: "AutomationProvider", vendor: "Make", status: "not_implemented" },
  { interfaceName: "PaymentProvider", vendor: "Stripe", status: "not_implemented" },
  { interfaceName: "MessagingProvider", vendor: "WhatsApp Business", status: "not_implemented" },
  { interfaceName: "EmailProvider", vendor: "Gmail", status: "not_implemented" },
  { interfaceName: "CalendarProvider", vendor: "Google Calendar", status: "not_implemented" },
]);

/**
 * Verifica que un objeto implementa todos los métodos de una interfaz
 * conocida. No lanza: devuelve la lista de métodos ausentes (vacía = OK).
 */
export function findMissingInterfaceMethods(interfaceName, implementation) {
  const required = PROVIDER_INTERFACES[interfaceName];
  if (!required) throw new Error(`Interfaz de proveedor desconocida: "${interfaceName}"`);
  return required.filter((method) => typeof implementation?.[method] !== "function");
}

export function implementsInterface(interfaceName, implementation) {
  return findMissingInterfaceMethods(interfaceName, implementation).length === 0;
}

// --- Mocks locales (deterministas, en memoria, sin I/O real) ---

export function createMockDataRepository() {
  const store = new Map();
  let nextId = 1;
  return {
    async list(collection) {
      return [...(store.get(collection) || [])];
    },
    async get(collection, id) {
      return (store.get(collection) || []).find((r) => r.id === id) || null;
    },
    async create(collection, record) {
      const withId = { ...record, id: record.id || `mock_${nextId++}` };
      const list = store.get(collection) || [];
      list.push(withId);
      store.set(collection, list);
      return withId;
    },
    async update(collection, id, patch) {
      const list = store.get(collection) || [];
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...patch };
      return list[idx];
    },
    async remove(collection, id) {
      const list = store.get(collection) || [];
      const next = list.filter((r) => r.id !== id);
      const removed = next.length !== list.length;
      store.set(collection, next);
      return removed;
    },
  };
}

export function createMockAutomationProvider(capabilities = []) {
  const triggeredLog = [];
  return {
    async listCapabilities() {
      return [...capabilities];
    },
    async trigger(capability, payload = {}) {
      const entry = { capability, payload, triggeredAt: null, status: "mock_triggered" };
      triggeredLog.push(entry);
      return entry;
    },
    async getStatus() {
      return { connected: false, mode: "mock", triggeredCount: triggeredLog.length };
    },
    _debugLog: triggeredLog,
  };
}

export function createMockPaymentProvider() {
  let counter = 1;
  return {
    async createPaymentIntent({ amount, currency = "EUR" } = {}) {
      return { id: `mock_pi_${counter++}`, amount: amount ?? 0, currency, status: "requires_confirmation_mock" };
    },
    async confirmPayment(paymentIntentId) {
      return { id: paymentIntentId, status: "succeeded_mock" };
    },
    async refund(paymentIntentId) {
      return { id: paymentIntentId, status: "refunded_mock" };
    },
  };
}

export function createMockMessagingProvider() {
  const sent = [];
  return {
    async sendMessage(to, template) {
      const entry = { id: `mock_msg_${sent.length + 1}`, to, template, status: "queued_mock" };
      sent.push(entry);
      return entry;
    },
    async getDeliveryStatus(messageId) {
      return sent.find((m) => m.id === messageId)?.status || "unknown";
    },
  };
}

export function createMockEmailProvider() {
  const sent = [];
  return {
    async sendEmail(to, subject) {
      const entry = { id: `mock_email_${sent.length + 1}`, to, subject, status: "queued_mock" };
      sent.push(entry);
      return entry;
    },
    async getDeliveryStatus(emailId) {
      return sent.find((m) => m.id === emailId)?.status || "unknown";
    },
  };
}

export function createMockCalendarProvider() {
  const events = new Map();
  let counter = 1;
  return {
    async createEvent(event) {
      const id = `mock_evt_${counter++}`;
      events.set(id, { ...event, id });
      return events.get(id);
    },
    async updateEvent(id, patch) {
      if (!events.has(id)) return null;
      events.set(id, { ...events.get(id), ...patch });
      return events.get(id);
    },
    async deleteEvent(id) {
      return events.delete(id);
    },
    async listEvents() {
      return [...events.values()];
    },
  };
}

export function createMockFileStorageProvider() {
  const files = new Map();
  return {
    async putFile(path, contentPlaceholder) {
      files.set(path, { path, sizeHint: String(contentPlaceholder ?? "").length });
      return files.get(path);
    },
    async getFile(path) {
      return files.get(path) || null;
    },
    async deleteFile(path) {
      return files.delete(path);
    },
    async listFiles() {
      return [...files.keys()];
    },
  };
}

export function createMockAnalyticsProvider() {
  const events = [];
  return {
    async track(eventName, properties = {}) {
      events.push({ eventName, properties });
      return true;
    },
    async getSummary() {
      return { totalEvents: events.length };
    },
  };
}
