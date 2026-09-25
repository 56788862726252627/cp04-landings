// Prompt Agencia IA 6/7 — Adaptador de webhook en modo simulación.
//
// NUNCA realiza peticiones de red reales. El envío real está bloqueado por
// defecto y solo se desbloquea cuando `dryRun=false` Y existe una
// `fetchImpl` real — que en este módulo nunca se provee (por diseño).
//
// Diseñado para conectar más adelante con Make u otros sistemas sin cambiar
// la interfaz pública de este módulo.

const FORBIDDEN_KEY_RE = /(password|passwd|pwd|token|secret|api[_-]?key|apikey|authorization|cookie|access_token|refresh_token)/i;
const SECRET_VALUE_RES = [
  /Bearer\s+\S+/gi,
  /sk_(live|test)_[A-Za-z0-9]+/g,
  /whsec_[A-Za-z0-9]+/g,
  /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

const ALLOWED_PROTOCOLS = Object.freeze(["https:", "http:"]);
const SCHEMA_VERSION = "1.0.0";
const MAX_RETRIES = 5;
const DEFAULT_RETRIES = 3;

export class AgencyWebhookError extends Error {
  constructor(message, { code = "WEBHOOK_ERROR" } = {}) {
    super(message);
    this.name = "AgencyWebhookError";
    this.code = code;
  }
}

// ---------------------------------------------------------------------------
// Idempotency key
// ---------------------------------------------------------------------------

/**
 * Clave de idempotencia determinista: basada en scope, clasificaciones,
 * businessIds y totalBusinesses. No incluye queriedAt (campo dinámico).
 */
export function computeIdempotencyKey(report) {
  const businessIds = (report.businesses ?? [])
    .map((b) => b.businessId)
    .sort()
    .join(",");
  const parts = [
    report.scope ?? "unknown",
    report.overallClassification ?? "unknown",
    String(report.byClassification?.A ?? 0),
    String(report.byClassification?.B ?? 0),
    String(report.byClassification?.C ?? 0),
    String(report.totalBusinesses ?? 0),
    businessIds,
  ];
  return parts.join("|");
}

// ---------------------------------------------------------------------------
// Construcción del payload
// ---------------------------------------------------------------------------

/**
 * Construye el payload de webhook a partir del informe de agencia.
 * Solo incluye campos no sensibles; nunca expone credenciales.
 *
 * @param {object} agencyReport - Resultado de buildAgencyStatusReport
 * @param {{ eventType?: string, source?: string }} opts
 */
export function buildWebhookPayload(agencyReport, { eventType = "agency.status.updated", source = "agency-ia-cp04" } = {}) {
  const idempotencyKey = computeIdempotencyKey(agencyReport);
  return Object.freeze({
    schema_version: SCHEMA_VERSION,
    event: eventType,
    source,
    idempotencyKey,
    timestamp: new Date().toISOString(),
    payload: Object.freeze({
      scope: agencyReport.scope,
      totalBusinesses: agencyReport.totalBusinesses,
      overallClassification: agencyReport.overallClassification,
      byClassification: { ...agencyReport.byClassification },
      queriedAt: agencyReport.queriedAt,
      businessIds: (agencyReport.businesses ?? []).map((b) => b.businessId),
    }),
  });
}

// ---------------------------------------------------------------------------
// Validación del destino
// ---------------------------------------------------------------------------

/**
 * Valida que la URL de destino tenga formato válido y protocolo permitido.
 * NO verifica si el host es alcanzable — eso nunca ocurre en dry-run.
 */
export function validateWebhookDestination(url) {
  if (!url || typeof url !== "string" || url.trim() === "") {
    throw new AgencyWebhookError("URL de destino requerida", { code: "MISSING_URL" });
  }
  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    throw new AgencyWebhookError(`URL de destino inválida: "${url}"`, { code: "INVALID_URL" });
  }
  if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
    throw new AgencyWebhookError(
      `Protocolo no permitido: "${parsed.protocol}". Usa https: o http:.`,
      { code: "INVALID_PROTOCOL" }
    );
  }
  return { valid: true, destination: parsed.origin + parsed.pathname };
}

// ---------------------------------------------------------------------------
// Redacción de datos sensibles en el payload
// ---------------------------------------------------------------------------

/**
 * Redacta cualquier valor sensible en el payload antes de enviarlo/loguearlo.
 * Crea una copia profunda — nunca muta el original.
 */
export function redactWebhookPayload(payload) {
  try {
    return JSON.parse(
      JSON.stringify(payload, (key, value) => {
        if (typeof key === "string" && FORBIDDEN_KEY_RE.test(key) && value != null) {
          return "[REDACTED]";
        }
        if (typeof value === "string") {
          let v = value;
          for (const re of SECRET_VALUE_RES) {
            re.lastIndex = 0;
            if (re.test(v)) {
              re.lastIndex = 0;
              v = v.replace(re, "[REDACTED]");
            }
          }
          return v;
        }
        return value;
      })
    );
  } catch {
    return { redacted: true, error: "No se pudo serializar el payload para redacción" };
  }
}

// ---------------------------------------------------------------------------
// Simulación de entrega
// ---------------------------------------------------------------------------

/**
 * Simula la entrega del payload a un destino. NUNCA hace una petición real.
 *
 * El envío real está bloqueado por dos capas independientes:
 * 1. `dryRun` debe ser explícitamente `false` (por defecto es `true`)
 * 2. `fetchImpl` debe ser una función real (por defecto es null)
 *
 * Si ambas condiciones se dan simultáneamente, se lanzaría AgencyWebhookError
 * con code REAL_SEND_BLOCKED — en este módulo nunca se provee fetchImpl real.
 *
 * @param {object} payload - Resultado de buildWebhookPayload
 * @param {{ destination?: string, retries?: number, dryRun?: boolean, signatureKey?: string, fetchImpl?: null }} opts
 * @returns {object} Registro de la simulación (nunca hace red)
 */
export function simulateWebhookDelivery(payload, {
  destination = null,
  retries = DEFAULT_RETRIES,
  dryRun = true,
  signatureKey = null,
  fetchImpl = null,
} = {}) {
  if (!dryRun && fetchImpl !== null) {
    throw new AgencyWebhookError(
      "Envío real bloqueado: se requiere configuración completa y consentimiento explícito. Este módulo solo opera en dry-run.",
      { code: "REAL_SEND_BLOCKED" }
    );
  }

  const clampedRetries = Math.max(0, Math.min(Number.isFinite(retries) ? retries : DEFAULT_RETRIES, MAX_RETRIES));
  const redactedPayload = redactWebhookPayload(payload);

  let destinationValidation = null;
  if (destination) {
    try {
      destinationValidation = validateWebhookDestination(destination);
    } catch (err) {
      destinationValidation = { valid: false, error: err.message };
    }
  }

  const attempts = [];
  for (let i = 0; i < clampedRetries; i++) {
    attempts.push({
      attempt: i + 1,
      status: "simulated",
      destination: destination ?? "[no destination configured]",
      httpStatus: null,
      timestamp: new Date().toISOString(),
      note: "dry-run — no se realizó ninguna petición de red",
    });
  }

  return Object.freeze({
    mode: "dry-run",
    sent: false,
    idempotencyKey: payload.idempotencyKey ?? null,
    destination: destination ?? null,
    destinationValidation,
    payload: redactedPayload,
    attempts,
    signature: signatureKey ? "[REDACTED]" : null,
    blockedReason: dryRun ? "dry-run mode (predeterminado)" : "fetchImpl no provisto",
    schema_version: SCHEMA_VERSION,
  });
}

// ---------------------------------------------------------------------------
// Mock adapter para tests
// ---------------------------------------------------------------------------

/**
 * Adaptador mock que registra todas las llamadas de simulación sin efectos
 * secundarios. Útil para tests de integración que necesitan verificar
 * que el adapter fue invocado con los argumentos correctos.
 */
export function createMockWebhookAdapter() {
  const calls = [];

  return {
    simulate(payload, opts) {
      const result = simulateWebhookDelivery(payload, { ...opts, dryRun: true, fetchImpl: null });
      calls.push({ payload, opts, result, calledAt: new Date().toISOString() });
      return result;
    },
    getCalls() {
      return [...calls];
    },
    reset() {
      calls.length = 0;
    },
  };
}
