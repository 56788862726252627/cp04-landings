// Club Pádel 04 · WhatsApp Consent (opt-in / opt-out / resubscribe) — FASE 4
// Aislado, no conectado. Modela el ciclo de vida de consentimiento exigido
// por Meta para plantillas MARKETING (UTILITY no requiere opt-in explícito
// para transaccionales del propio negocio, pero este proyecto aplica el
// mismo estándar a todo envío saliente por seguridad — ver
// docs/agencia-ia/WHATSAPP_TENANT_CONTEXT_CONTRACT.md).

export const CONSENT_STATE = Object.freeze({
  PENDING: "PENDING",
  OPTED_IN: "OPTED_IN",
  OPTED_OUT: "OPTED_OUT",
});

/** Origen del opt-in — de dónde vino el consentimiento, para poder auditarlo. */
export const OPT_IN_SOURCES = Object.freeze(["booking_form", "whatsapp_reply", "admin_manual", "import_legacy"]);

/**
 * Estado de consentimiento por número. Un opt-out SIEMPRE puede registrarse
 * (es una acción de seguridad, nunca se bloquea). Reactivar el
 * consentimiento tras un opt-out exige `resubscribe()`, no `recordOptIn()`
 * — la distinción es intencional: nadie puede "reinscribir en silencio" a
 * alguien que explícitamente se dio de baja, tiene que haber una acción de
 * opt-in nueva y explícita.
 */
export class ConsentStore {
  #records = new Map(); // phone -> {state, source, optInAtMs, optOutAtMs, history}

  #getOrInit(phone) {
    if (!this.#records.has(phone)) {
      this.#records.set(phone, { state: CONSENT_STATE.PENDING, source: null, optInAtMs: null, optOutAtMs: null, history: [] });
    }
    return this.#records.get(phone);
  }

  /** @param {string} phone @param {{source: string, atMs?: number}} params */
  recordOptIn(phone, { source, atMs = Date.now() }) {
    if (!OPT_IN_SOURCES.includes(source)) {
      throw new Error(`recordOptIn: origen desconocido '${source}' — debe ser uno de ${OPT_IN_SOURCES.join(", ")}`);
    }
    const record = this.#getOrInit(phone);
    if (record.state === CONSENT_STATE.OPTED_OUT) {
      throw new Error(`recordOptIn: ${phone} ya hizo opt-out — usar resubscribe(), no recordOptIn(), para reactivar consentimiento`);
    }
    record.state = CONSENT_STATE.OPTED_IN;
    record.source = source;
    record.optInAtMs = atMs;
    record.history.push({ type: "opt_in", source, atMs });
    return this.getConsentState(phone);
  }

  /** @param {string} phone @param {{source: string, atMs?: number}} params */
  resubscribe(phone, { source, atMs = Date.now() }) {
    const record = this.#getOrInit(phone);
    if (record.state !== CONSENT_STATE.OPTED_OUT) {
      throw new Error(`resubscribe: ${phone} no está en opt-out (estado actual: ${record.state}) — nada que resuscribir`);
    }
    if (!OPT_IN_SOURCES.includes(source)) {
      throw new Error(`resubscribe: origen desconocido '${source}' — debe ser uno de ${OPT_IN_SOURCES.join(", ")}`);
    }
    record.state = CONSENT_STATE.OPTED_IN;
    record.source = source;
    record.optInAtMs = atMs;
    record.history.push({ type: "resubscribe", source, atMs });
    return this.getConsentState(phone);
  }

  /** @param {string} phone @param {{atMs?: number, reason?: string|null}} [params] */
  recordOptOut(phone, { atMs = Date.now(), reason = null } = {}) {
    const record = this.#getOrInit(phone);
    record.state = CONSENT_STATE.OPTED_OUT;
    record.optOutAtMs = atMs;
    record.history.push({ type: "opt_out", reason, atMs });
    return this.getConsentState(phone);
  }

  getConsentState(phone) {
    return this.#records.get(phone)?.state ?? CONSENT_STATE.PENDING;
  }

  isOptedIn(phone) {
    return this.getConsentState(phone) === CONSENT_STATE.OPTED_IN;
  }

  /** @returns {Array<object>} copia defensiva del historial — nunca la referencia interna */
  getHistory(phone) {
    return [...(this.#records.get(phone)?.history ?? [])];
  }
}

/**
 * Lista de supresión — DISTINTA del opt-out del propio usuario: son números
 * bloqueados por decisión administrativa (queja, abuso, número inválido
 * recurrente, obligación legal), no por decisión del destinatario. Un
 * número puede estar suprimido sin haber hecho opt-out nunca, y viceversa.
 * `validateRecipient()` en whatsapp-adapter.mock.js consulta ambas listas
 * de forma independiente.
 */
export class SuppressionList {
  #blocked = new Map(); // phone -> {reason, atMs}

  add(phone, { reason, atMs = Date.now() } = {}) {
    this.#blocked.set(phone, { reason, atMs });
  }

  remove(phone) {
    this.#blocked.delete(phone);
  }

  isBlocked(phone) {
    return this.#blocked.has(phone);
  }

  getReason(phone) {
    return this.#blocked.get(phone)?.reason ?? null;
  }
}

// --- T-whatsapp-closure (2026-07-10): modelo unificado de 5 estados ---------
//
// ConsentStore (3 estados: PENDING/OPTED_IN/OPTED_OUT) y SuppressionList
// (bloqueo administrativo) no se tocan — siguen siendo la fuente de verdad y
// validateRecipient() sigue consumiéndolos exactamente igual. Lo que faltaba
// era un contrato de LECTURA que combine ambos en el modelo de 5 estados
// pedido por esta misión (UNKNOWN/OPTED_IN/OPTED_OUT/SUPPRESSED/BLOCKED),
// distinguiendo dos motivos de "no enviar" que hoy comparten una sola clase:
//
// - BLOCKED: bloqueo ADMINISTRATIVO explícito (queja, abuso, obligación
//   legal) — `suppressionList` (la SuppressionList ya existente).
// - SUPPRESSED: bloqueo AUTOMÁTICO/de sistema (p.ej. el proveedor reportó
//   repetidamente 131026 "recipient phone number not on WhatsApp" o 133010
//   "account not registered" — señales que no dependen de una decisión
//   humana). Misma clase SuppressionList reutilizada con otro rol
//   (`autoSuppressionList`), no una clase nueva — la forma es idéntica
//   (phone -> {reason, atMs}), solo cambia quién/qué la puebla.
//
// Precedencia (más específico/severo primero): BLOCKED > SUPPRESSED >
// OPTED_OUT > OPTED_IN > UNKNOWN. Un número puede estar OPTED_IN y aun así
// BLOCKED/SUPPRESSED — el consentimiento del usuario nunca anula un bloqueo
// administrativo o de sistema (mismo principio que ya aplica
// validateRecipient(), aquí solo expuesto como estado legible en vez de
// booleano allowed/reason).

export const EFFECTIVE_CONSENT_STATUS = Object.freeze({
  UNKNOWN: "UNKNOWN",
  OPTED_IN: "OPTED_IN",
  OPTED_OUT: "OPTED_OUT",
  SUPPRESSED: "SUPPRESSED",
  BLOCKED: "BLOCKED",
});

/**
 * @param {string} phone
 * @param {ConsentStore} consentStore
 * @param {{suppressionList?: SuppressionList, autoSuppressionList?: SuppressionList}} [lists]
 * @returns {{status: string, reason: string|null}}
 */
export function resolveEffectiveConsentStatus(phone, consentStore, { suppressionList, autoSuppressionList } = {}) {
  if (suppressionList?.isBlocked(phone)) {
    return { status: EFFECTIVE_CONSENT_STATUS.BLOCKED, reason: suppressionList.getReason(phone) };
  }
  if (autoSuppressionList?.isBlocked(phone)) {
    return { status: EFFECTIVE_CONSENT_STATUS.SUPPRESSED, reason: autoSuppressionList.getReason(phone) };
  }
  const consentState = consentStore.getConsentState(phone);
  if (consentState === CONSENT_STATE.OPTED_OUT) {
    return { status: EFFECTIVE_CONSENT_STATUS.OPTED_OUT, reason: null };
  }
  if (consentState === CONSENT_STATE.OPTED_IN) {
    return { status: EFFECTIVE_CONSENT_STATUS.OPTED_IN, reason: null };
  }
  // CONSENT_STATE.PENDING (nunca hubo opt-in ni opt-out) se expone como
  // UNKNOWN en el modelo de 5 estados — mismo dato, nombre pedido por esta misión.
  return { status: EFFECTIVE_CONSENT_STATUS.UNKNOWN, reason: null };
}
