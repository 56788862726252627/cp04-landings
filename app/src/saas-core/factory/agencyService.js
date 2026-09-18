// Prompt Agencia IA 6/7 — Capa de servicio pura para la agencia.
//
// Módulo SIN I/O: solo valida, filtra, redacta y estructura errores.
// El I/O (carga de negocios) lo hace el caller (CLI o API router).
// Sigue el mismo patrón que businessStatusReport.js y agencyStatusReport.js.

import path from "node:path";

import { INTEGRATION_IDS } from "../commercial/integrationReadiness.js";
import { KNOWN_SECTORS } from "../tenant/tenantSchema.js";

// ---------------------------------------------------------------------------
// Constantes validadas
// ---------------------------------------------------------------------------

export const ALLOWED_SCOPES = Object.freeze(["dryRun", "production"]);
export const ALLOWED_FORMATS = Object.freeze(["json", "markdown"]);
export const ALLOWED_CLASSIFICATIONS = Object.freeze(["A", "B", "C"]);
// Los sectores válidos para filtrar son los del schema de blueprint (KNOWN_SECTORS),
// que son los valores reales que aparecen en b.sector de los reportes generados.
export const ALLOWED_SECTORS = KNOWN_SECTORS;
export const ALLOWED_INTEGRATIONS = INTEGRATION_IDS;

const FORBIDDEN_KEY_RE = /(password|passwd|pwd|token|secret|api[_-]?key|apikey|authorization|cookie|access_token|refresh_token|credit[_-]?card|card[_-]?number|iban|ssn)/i;
const SECRET_VALUE_RES = [
  /Bearer\s+\S+/gi,
  /sk_(live|test)_[A-Za-z0-9]+/g,
  /whsec_[A-Za-z0-9]+/g,
  /[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
];

// Máximo permitido para payloads de salida (webhook, API response)
export const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // 2 MB

// ---------------------------------------------------------------------------
// Error estructurado del servicio
// ---------------------------------------------------------------------------

export class AgencyServiceError extends Error {
  constructor(message, { code = "SERVICE_ERROR", statusCode = 400 } = {}) {
    super(message);
    this.name = "AgencyServiceError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ---------------------------------------------------------------------------
// Validación de parámetros
// ---------------------------------------------------------------------------

function parseSplitList(value, allowed, fieldName) {
  if (!value) return null;
  const items = (Array.isArray(value) ? value : String(value).split(",")).map((s) => s.trim()).filter(Boolean);
  if (items.length === 0) return null;
  for (const item of items) {
    if (!allowed.includes(item)) {
      throw new AgencyServiceError(
        `${fieldName} desconocido: "${item}". Permitidos: ${[...allowed].join(", ")}`,
        { code: `INVALID_${fieldName.toUpperCase()}` }
      );
    }
  }
  return items;
}

/**
 * Valida y normaliza los parámetros de una consulta de agencia.
 * Lanza AgencyServiceError ante cualquier parámetro inválido.
 *
 * @param {object} params - Parámetros crudos (CLI, query string, objeto JS)
 * @returns {object} Parámetros normalizados listos para usar
 */
export function buildAgencyServiceRequest(params = {}) {
  const scope = params.scope ?? "dryRun";
  if (!ALLOWED_SCOPES.includes(scope)) {
    throw new AgencyServiceError(`scope desconocido: "${scope}". Usa dryRun o production.`, { code: "INVALID_SCOPE" });
  }

  const format = params.format ?? "json";
  if (!ALLOWED_FORMATS.includes(format)) {
    throw new AgencyServiceError(`format desconocido: "${format}". Usa json o markdown.`, { code: "INVALID_FORMAT" });
  }

  const sectors = parseSplitList(params.sectors ?? params.sector, ALLOWED_SECTORS, "sector");
  const classifications = parseSplitList(params.classifications ?? params.classification, ALLOWED_CLASSIFICATIONS, "classification");
  const integrations = parseSplitList(params.integrations ?? params.integration, ALLOWED_INTEGRATIONS, "integration");

  const mockIntegrations = Boolean(params.mockIntegrations ?? params["mock-integrations"]);
  const strict = Boolean(params.strict);
  const summaryOnly = Boolean(params.summaryOnly ?? params["summary-only"]);

  return Object.freeze({ scope, format, sectors, classifications, integrations, mockIntegrations, strict, summaryOnly });
}

// ---------------------------------------------------------------------------
// Filtrado
// ---------------------------------------------------------------------------

function deriveOverallClassification(byClassification, total) {
  if (total === 0) return "no_businesses";
  if (byClassification.C > 0) return "C";
  if (byClassification.B > 0) return "B";
  return "A";
}

/**
 * Filtra el informe de agencia por sector, clasificación e integración.
 * Devuelve un nuevo objeto inmutable con los conteos recalculados.
 * Si no hay filtros activos, devuelve el informe original sin copiar.
 */
export function filterAgencyReport(report, { sectors = null, classifications = null, integrations = null } = {}) {
  if (!sectors && !classifications && !integrations) return report;

  let businesses = [...report.businesses];

  if (sectors) {
    businesses = businesses.filter((b) => sectors.includes(b.sector));
  }
  if (classifications) {
    businesses = businesses.filter((b) => classifications.includes(b.classification));
  }
  if (integrations) {
    businesses = businesses.filter(
      (b) => Array.isArray(b.integrations) && b.integrations.some((i) => integrations.includes(i.id))
    );
  }

  const byClassification = { A: 0, B: 0, C: 0 };
  for (const b of businesses) {
    if (b.classification === "A" || b.classification === "B" || b.classification === "C") {
      byClassification[b.classification]++;
    }
  }

  const total = businesses.length;
  return {
    ...report,
    businesses: Object.freeze(businesses),
    byClassification: Object.freeze(byClassification),
    overallClassification: deriveOverallClassification(byClassification, total),
    totalBusinesses: total,
    filtered: true,
  };
}

/**
 * Devuelve solo el resumen agregado sin el array `businesses` (vista reducida).
 * Útil para --summary-only y para la respuesta de `/api/agency/status?summary=true`.
 */
export function summarizeAgencyReport(report) {
  // eslint-disable-next-line no-unused-vars
  const { businesses, integrationSummary, ...summary } = report;
  return Object.freeze({ ...summary, integrationSummary });
}

// ---------------------------------------------------------------------------
// Seguridad
// ---------------------------------------------------------------------------

/**
 * Prevención de path traversal: verifica que `userPath` resuelto esté
 * estrictamente dentro de `allowedBaseDir`.
 * Lanza AgencyServiceError (403) si la ruta sale del directorio permitido.
 */
export function validateSafePath(userPath, allowedBaseDir) {
  const resolved = path.resolve(String(userPath));
  const allowed = path.resolve(String(allowedBaseDir));
  if (!resolved.startsWith(allowed + path.sep) && resolved !== allowed) {
    throw new AgencyServiceError(
      `Ruta no permitida (posible path traversal): "${userPath}"`,
      { code: "PATH_TRAVERSAL", statusCode: 403 }
    );
  }
  return resolved;
}

/**
 * Redacta valores sensibles de un objeto JS (profundo).
 * Clave sospechosa → valor reemplazado; valor con patrón de secreto → redactado.
 * Nunca lanza — si algo falla, devuelve el objeto original.
 */
export function redactSensitiveFields(obj) {
  try {
    return JSON.parse(
      JSON.stringify(obj, (key, value) => {
        if (typeof key === "string" && FORBIDDEN_KEY_RE.test(key) && value !== null && value !== undefined) {
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
    return obj;
  }
}

/**
 * Valida que el payload serializado no exceda el límite de tamaño.
 * Lanza AgencyServiceError (413) si supera el límite.
 *
 * @returns {number} Tamaño en bytes del payload
 */
export function validatePayloadSize(data, limitBytes = MAX_PAYLOAD_BYTES) {
  const json = typeof data === "string" ? data : JSON.stringify(data);
  const size = new TextEncoder().encode(json).length;
  if (size > limitBytes) {
    throw new AgencyServiceError(
      `Payload demasiado grande: ${size} bytes (máximo ${limitBytes} bytes)`,
      { code: "PAYLOAD_TOO_LARGE", statusCode: 413 }
    );
  }
  return size;
}

/**
 * Convierte cualquier error en una respuesta segura para el consumidor:
 * sin stack trace, sin información interna.
 */
export function sanitizeErrorForResponse(err) {
  if (err instanceof AgencyServiceError) {
    return { code: err.code, message: err.message };
  }
  return { code: "INTERNAL_ERROR", message: "Error interno del servidor. Consulta los logs internos." };
}

/**
 * Construye una respuesta de API estándar (estructura coherente en todos los endpoints).
 */
export function buildApiResponse({ status = "ok", data = null, metadata = null, errors = null }) {
  const res = { status };
  if (data !== null) res.data = data;
  if (metadata !== null) res.metadata = metadata;
  if (errors !== null) res.errors = errors;
  return res;
}
