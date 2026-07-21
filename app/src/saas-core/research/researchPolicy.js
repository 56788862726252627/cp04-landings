// Paso 12 · Fase 3 — Política versionada de investigación pública.
//
// Impone en código las reglas éticas/de seguridad del enunciado: solo
// fuentes públicas o locales autorizadas, sin bypass/CAPTCHA/paywall/
// scraping agresivo, límites declarativos, allowlist/denylist, y modo
// offline por defecto. Esta política se EVALÚA (nunca se documenta solo
// en prosa): `evaluatePolicy` decide, para cada input del Research
// Request, si procede o se rechaza, y por qué.

import { classifyUrl } from "./urlSafety.js";

export const RESEARCH_POLICY_VERSION = 1;

export const DEFAULT_DENYLIST_PATTERNS = Object.freeze([
  /\bfacebook\.com\/[^/]+\/profile\.php/i, // perfiles individuales, no páginas de negocio
  /\blinkedin\.com\/in\//i, // perfiles individuales
]);

export const FORBIDDEN_ACTIONS = Object.freeze([
  "authentication",
  "captcha_bypass",
  "robots_txt_bypass",
  "paywall_bypass",
  "mass_extraction",
  "individual_profiling",
  "facial_recognition",
  "sensitive_data_collection",
  "person_geolocation",
  "bulk_email_or_phone_harvesting",
  "account_access",
  "message_sending",
  "site_modification",
  "publication",
  "real_credentials",
]);

export const RESEARCH_LIMITS_POLICY = Object.freeze({
  maxSources: 20,
  maxDepth: 2,
  maxContentLengthBytes: 200_000,
  timeoutMs: 5000,
  rateLimitPerMinute: 30,
});

/**
 * Evalúa la política para un Research Request completo: por cada input
 * (url/localFile) decide accept/reject con motivo. Fail-closed: cualquier
 * duda = reject. Nunca hace red ni disco; es una decisión declarativa.
 * @param {object} request - Research Request (ver researchRequestSchema.js)
 * @returns {{mode: string, decisions: object[], violations: object[], allowed: boolean}}
 */
export function evaluatePolicy(request) {
  const decisions = [];
  const violations = [];

  const mode = request.mode ?? "offline";
  const allowDomains = request.sourcePolicy?.allowDomains ?? null;
  const denyDomains = request.sourcePolicy?.denyDomains ?? [];

  for (const rawUrl of request.inputs?.urls ?? []) {
    const classification = classifyUrl(rawUrl);
    if (!classification.safe) {
      decisions.push({ input: rawUrl, type: "url", allowed: false, reason: classification.reason });
      violations.push({ input: rawUrl, reason: classification.reason });
      continue;
    }
    const hostname = classification.url.hostname.toLowerCase();
    if (denyDomains.some((d) => hostname === d.toLowerCase() || hostname.endsWith(`.${d.toLowerCase()}`))) {
      decisions.push({ input: rawUrl, type: "url", allowed: false, reason: `dominio en denylist explícita: "${hostname}"` });
      violations.push({ input: rawUrl, reason: "denylist" });
      continue;
    }
    if (allowDomains && !allowDomains.some((d) => hostname === d.toLowerCase() || hostname.endsWith(`.${d.toLowerCase()}`))) {
      decisions.push({ input: rawUrl, type: "url", allowed: false, reason: `dominio no está en la allowlist explícita: "${hostname}"` });
      violations.push({ input: rawUrl, reason: "not_in_allowlist" });
      continue;
    }
    if (DEFAULT_DENYLIST_PATTERNS.some((pattern) => pattern.test(rawUrl))) {
      decisions.push({ input: rawUrl, type: "url", allowed: false, reason: "coincide con un patrón de perfil individual bloqueado por política" });
      violations.push({ input: rawUrl, reason: "individual_profile_pattern" });
      continue;
    }
    if (mode === "offline") {
      decisions.push({ input: rawUrl, type: "url", allowed: false, reason: "modo offline activo: no se realizan conexiones externas reales (ver sourceAdapters.js/fixture mapping)" });
      continue;
    }
    decisions.push({ input: rawUrl, type: "url", allowed: true, reason: "URL pasa allowlist/denylist y comprobaciones SSRF (ejecución real no implementada en este paso)" });
  }

  for (const localPath of request.inputs?.localFiles ?? []) {
    decisions.push({ input: localPath, type: "localFile", allowed: true, reason: "ruta local delegada a resolveSafeLocalPath() en tiempo de lectura" });
  }

  const limits = { ...RESEARCH_LIMITS_POLICY, ...(request.limits ?? {}) };
  const sourceCount = (request.inputs?.urls?.length ?? 0) + (request.inputs?.localFiles?.length ?? 0) + (request.inputs?.fixtures?.length ?? 0) + (request.inputs?.snapshots?.length ?? 0);
  if (sourceCount > limits.maxSources) {
    violations.push({ input: "$.inputs", reason: `${sourceCount} fuentes solicitadas superan el límite de política maxSources=${limits.maxSources}` });
  }

  return {
    policyVersion: RESEARCH_POLICY_VERSION,
    mode,
    decisions,
    violations,
    allowed: violations.length === 0,
    forbiddenActions: FORBIDDEN_ACTIONS,
    limits,
  };
}
