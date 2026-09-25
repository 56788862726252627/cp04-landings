// Paso 13 · Fase 2 — Proveedor real `publicWebsiteFetcher`.
//
// Implementa, con red real, el contrato `publicWebsiteFetcher` definido
// como punto de extensión en Paso 12 (factory/extensionPoints.js). Nunca
// se invoca a menos que el llamador pase explícitamente
// `allowNetwork: true` (ver auditOrchestrator.js) — sin eso, el motor
// sigue devolviendo evidencia "unavailable" exactamente como en Paso 12.
//
// Seguridad SSRF en dos capas, ambas obligatorias:
//   1) classifyUrl() — comprueba el hostname/esquema TAL COMO aparece en
//      la URL (Paso 12, urlSafety.js).
//   2) resolveHostnameSafely() — resuelve DNS y comprueba la(s) IP(s)
//      resultantes con classifyIpAddress() (mismo módulo). La conexión
//      TCP/TLS real se fuerza a esa IP ya validada (lookup "pinneado"),
//      para que una respuesta DNS distinta en el momento de conectar
//      (DNS rebinding) no pueda desviar la petición hacia una IP privada.
// Cada redirección se revalida por las DOS capas antes de seguirla.

import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

import { classifyUrl, classifyIpAddress } from "../urlSafety.js";
import { createEvidence } from "../evidenceSchema.js";
import { evidenceFromHtmlText } from "../sourceAdapters.js";

export const PUBLIC_WEBSITE_FETCHER_ID = "publicWebsiteFetcher";
export const PUBLIC_WEBSITE_FETCHER_VERSION = 1;

export const DEFAULT_FETCHER_LIMITS = Object.freeze({
  timeoutMs: 8000,
  maxBytes: 2_000_000, // 2 MB
  maxRedirects: 3,
  maxPages: 3,
  rateLimitMs: 500,
  allowedMimeTypes: Object.freeze(["text/html", "text/plain", "application/xhtml+xml"]),
  userAgent: "ClubPadel04-ResearchBot/1.0 (+investigacion publica autorizada; ver docs/paso-13)",
  respectRobots: true,
});

/** Taxonomía de errores estructurados — nunca incluyen secretos ni stack traces internos. */
export const FETCH_ERROR_CODES = Object.freeze([
  "INVALID_URL",
  "SSRF_BLOCKED",
  "DNS_ERROR",
  "TIMEOUT",
  "TLS_ERROR",
  "INSECURE_REDIRECT",
  "TOO_MANY_REDIRECTS",
  "CONTENT_TOO_LARGE",
  "UNSUPPORTED_MIME",
  "HTTP_4XX",
  "HTTP_5XX",
  "ROBOTS_DISALLOWED",
  "RATE_LIMITED",
  "CONNECTION_REFUSED",
]);

export class FetchError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.code = code;
    this.extra = extra;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Normalización determinista de URL: minúsculas en esquema/host, sin
 * puerto por defecto, sin fragmento, sin barra final redundante salvo raíz.
 */
export function normalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  url.hash = "";
  const isDefaultPort = (url.protocol === "http:" && url.port === "80") || (url.protocol === "https:" && url.port === "443");
  if (isDefaultPort) url.port = "";
  url.hostname = url.hostname.toLowerCase();
  url.protocol = url.protocol.toLowerCase();
  let pathname = url.pathname;
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
  url.pathname = pathname || "/";
  return url.toString();
}

/**
 * Resuelve DNS y valida que TODAS las IPs devueltas sean públicas.
 * `lookupFn` es inyectable para tests (nunca se usa DNS real en tests
 * unitarios). Por defecto usa `dns.promises.lookup` real.
 */
export async function resolveHostnameSafely(hostname, { lookupFn } = {}) {
  const lookup = lookupFn ?? ((host, opts) => dns.promises.lookup(host, opts));
  let records;
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch (err) {
    return { safe: false, reason: `fallo de resolución DNS para "${hostname}": ${err.message}`, code: "DNS_ERROR" };
  }
  const list = Array.isArray(records) ? records : [records];
  if (list.length === 0) return { safe: false, reason: `DNS no devolvió ninguna dirección para "${hostname}"`, code: "DNS_ERROR" };
  for (const record of list) {
    const check = classifyIpAddress(record.address);
    if (!check.safe) {
      return { safe: false, reason: `"${hostname}" resuelve a una IP insegura (${record.address}): ${check.reason}`, code: "SSRF_BLOCKED" };
    }
  }
  return { safe: true, reason: "todas las IPs resueltas son públicas", address: list[0].address, family: list[0].family, allAddresses: list.map((r) => r.address) };
}

/** Valida una URL en las dos capas (estática + DNS). No conecta todavía. */
export async function validateUrlForRealFetch(rawUrl, { lookupFn } = {}) {
  const staticCheck = classifyUrl(rawUrl);
  if (!staticCheck.safe) return { safe: false, reason: staticCheck.reason, code: staticCheck.reason.includes("esquema") || staticCheck.reason.includes("malformada") || staticCheck.reason.includes("vacía") ? "INVALID_URL" : "SSRF_BLOCKED" };

  const dnsCheck = await resolveHostnameSafely(staticCheck.url.hostname, { lookupFn });
  if (!dnsCheck.safe) return dnsCheck;

  return { safe: true, url: staticCheck.url, address: dnsCheck.address, family: dnsCheck.family };
}

/** dns.lookup-compatible: fuerza SIEMPRE la IP ya validada (pin), evitando una segunda resolución (DNS rebinding). */
function pinnedLookup(address, family) {
  return (_hostname, options, callback) => {
    const cb = typeof options === "function" ? options : callback;
    const wantsAll = typeof options === "object" && options && options.all;
    if (wantsAll) cb(null, [{ address, family }]);
    else cb(null, address, family);
  };
}

/**
 * Fetch de bajo nivel: conecta DIRECTAMENTE a `pinnedAddress` (ya
 * validada), nunca sigue redirecciones por sí solo (las gestiona el
 * llamador), nunca envía cookies/autenticación, aplica timeout y límite
 * de tamaño de forma estricta.
 *
 * Exportada para tests: esta función NO valida SSRF (asume que
 * `pinnedAddress` ya fue validada por `validateUrlForRealFetch`). Nunca la
 * uses con una IP no validada fuera de un test.
 */
export function performPinnedRequest(url, pinnedAddress, family, { timeoutMs, maxBytes, userAgent }) {
  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    // Paso 18 — timing REAL medido por este cliente HTTP (Node), no una
    // simulación de navegador: incluye conexión TCP/TLS (DNS ya está
    // pinneado, ver validateUrlForRealFetch) hasta la llegada de
    // cabeceras/cuerpo completo. Se expone tal cual, nunca como "TTFB"
    // en el sentido estricto de Web Vitals (que mide desde el navegador).
    const requestStartedAt = Date.now();

    const req = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: {
          Host: url.host,
          "User-Agent": userAgent,
          Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1",
          "Accept-Encoding": "identity",
          Connection: "close",
        },
        lookup: pinnedLookup(pinnedAddress, family),
        servername: url.protocol === "https:" ? url.hostname : undefined,
        signal: controller.signal,
        timeout: timeoutMs,
      },
      (res) => {
        const headersReceivedAt = Date.now();
        const contentType = String(res.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
        const chunks = [];
        let received = 0;
        let destroyedForSize = false;

        res.on("data", (chunk) => {
          received += chunk.length;
          if (received > maxBytes) {
            destroyedForSize = true;
            res.destroy();
            return;
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          clearTimeout(timer);
          if (destroyedForSize) {
            reject(new FetchError("CONTENT_TOO_LARGE", `respuesta supera el límite de ${maxBytes} bytes`));
            return;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            httpVersion: res.httpVersion ?? null,
            contentType,
            body: Buffer.concat(chunks).toString("utf8"),
            byteSize: received,
            timing: { timeToHeadersMs: headersReceivedAt - requestStartedAt, totalMs: Date.now() - requestStartedAt },
          });
        });

        res.on("error", (err) => {
          clearTimeout(timer);
          if (destroyedForSize) reject(new FetchError("CONTENT_TOO_LARGE", `respuesta supera el límite de ${maxBytes} bytes`));
          else reject(new FetchError("CONNECTION_REFUSED", `error de conexión: ${err.message}`));
        });
      }
    );

    req.on("error", (err) => {
      clearTimeout(timer);
      if (controller.signal.aborted) reject(new FetchError("TIMEOUT", `la petición superó el timeout de ${timeoutMs}ms`));
      else if (err.code === "ECONNREFUSED") reject(new FetchError("CONNECTION_REFUSED", "conexión rechazada por el servidor remoto"));
      else if (String(err.message || "").toLowerCase().includes("tls") || err.code?.startsWith("ERR_TLS")) reject(new FetchError("TLS_ERROR", `error TLS: ${err.message}`));
      else reject(new FetchError("CONNECTION_REFUSED", `error de red: ${err.message}`));
    });

    req.end();
  });
}

/** Parser mínimo de robots.txt: reglas Disallow para el user-agent dado o "*". Fail-open si no hay robots.txt (convención estándar). */
export function isPathAllowedByRobots(robotsTxt, userAgentToken, requestPath) {
  const lines = String(robotsTxt ?? "").split(/\r?\n/);
  let currentGroupApplies = false;
  let matchedSpecificGroup = false;
  const disallowRulesForUs = [];
  const disallowRulesForWildcard = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [rawKey, ...rest] = line.split(":");
    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "user-agent") {
      const isUs = value.toLowerCase() === userAgentToken.toLowerCase();
      const isWildcard = value === "*";
      currentGroupApplies = isUs || isWildcard;
      if (isUs) matchedSpecificGroup = true;
      continue;
    }
    if (key === "disallow" && currentGroupApplies) {
      const target = value === "" ? null : value;
      if (target === null) continue;
      const bucket = matchedSpecificGroup ? disallowRulesForUs : disallowRulesForWildcard;
      bucket.push(target);
    }
  }

  const rules = matchedSpecificGroup ? disallowRulesForUs : disallowRulesForWildcard;
  return !rules.some((rule) => requestPath.startsWith(rule));
}

async function fetchRobotsTxt(origin, options, transportFn) {
  try {
    const robotsUrl = new URL("/robots.txt", origin);
    const validation = await validateUrlForRealFetch(robotsUrl.toString(), options);
    if (!validation.safe) return { available: false, content: "" };
    const response = await transportFn(validation.url, validation.address, validation.family, { timeoutMs: options.timeoutMs, maxBytes: 200_000, userAgent: options.userAgent });
    if (response.statusCode >= 200 && response.statusCode < 300) return { available: true, content: response.body };
    return { available: false, content: "" };
  } catch {
    return { available: false, content: "" };
  }
}

/**
 * Punto de entrada público: obtiene UNA página con todas las
 * protecciones (SSRF en 2 capas, robots, timeout, tamaño, MIME,
 * redirecciones acotadas y revalidadas). Nunca lanza: siempre devuelve
 * un resultado estructurado `{status, ...}`.
 * @param {string} rawUrl
 * @param {object} limits - ver DEFAULT_FETCHER_LIMITS
 * @param {{lookupFn?: Function, transportFn?: Function}} testHooks - SOLO
 *   para tests; nunca alcanzable desde CLI/configuración de usuario.
 *   `lookupFn` sustituye la resolución DNS real (para probar la lógica de
 *   validación sin red); `transportFn` sustituye el transporte TCP/TLS real
 *   (para probar timeouts/redirecciones/MIME/tamaño con un servidor local
 *   o con respuestas simuladas, sin tocar Internet). La validación SSRF
 *   (classifyUrl + resolveHostnameSafely) SIEMPRE se ejecuta igual,
 *   incluso en tests: solo se sustituye qué hace la resolución DNS o el
 *   transporte, nunca la decisión de si algo es seguro.
 */
// Paso 16/18 — subconjunto de cabeceras de respuesta seguro de reexponer
// a analizadores posteriores (seoProvider, performanceProvider): ninguna
// es sensible (son cabeceras de una respuesta HTTP pública ya
// descargada), y NUNCA se reenvían cookies/autenticación
// (performPinnedRequest tampoco las envía).
const ANALYZABLE_RESPONSE_HEADERS = Object.freeze([
  "x-robots-tag",
  "content-language",
  "content-length",
  "content-encoding",
  "cache-control",
  "expires",
  "etag",
  "last-modified",
  "vary",
  "connection",
  // Paso 18 — señales públicas de CDN/entrega (ninguna sensible): solo se
  // usan para "CDN solo si existe evidencia pública", nunca se infiere sin ellas.
  "cf-ray",
  "x-cache",
  "x-served-by",
  "via",
]);

function extractAnalyzableHeaders(rawHeaders) {
  const headers = {};
  for (const name of ANALYZABLE_RESPONSE_HEADERS) headers[name] = rawHeaders?.[name] ?? null;
  return headers;
}

export async function fetchPublicWebsite(rawUrl, limits = {}, testHooks = {}) {
  const config = { ...DEFAULT_FETCHER_LIMITS, ...limits };
  const transportFn = testHooks.transportFn ?? performPinnedRequest;
  const redirectChain = [];
  let currentUrl = rawUrl;
  // Paso 16 — se recuerda el ÚLTIMO robots.txt consultado (el del origen
  // final tras redirecciones) para reexponerlo en el resultado "available"
  // sin volver a pedirlo: ya se descargó dentro de este mismo bucle para
  // decidir ROBOTS_DISALLOWED, solo se deja de descartar.
  let lastRobotsResult = { available: false, content: "" };

  for (let redirectCount = 0; redirectCount <= config.maxRedirects; redirectCount++) {
    let normalized;
    try {
      normalized = normalizeUrl(currentUrl);
    } catch {
      return { status: "error", errorCode: "INVALID_URL", reason: "URL malformada", url: currentUrl, redirectChain, fetchedAt: new Date().toISOString() };
    }

    const validation = await validateUrlForRealFetch(normalized, testHooks);
    if (!validation.safe) {
      return { status: "error", errorCode: validation.code || "SSRF_BLOCKED", reason: validation.reason, url: normalized, redirectChain, fetchedAt: new Date().toISOString() };
    }

    if (config.respectRobots) {
      const robots = await fetchRobotsTxt(validation.url.origin, { ...config, ...testHooks }, transportFn);
      lastRobotsResult = robots;
      if (robots.available) {
        const uaToken = config.userAgent.split("/")[0];
        const allowed = isPathAllowedByRobots(robots.content, uaToken, validation.url.pathname);
        if (!allowed) {
          return { status: "unavailable", errorCode: "ROBOTS_DISALLOWED", reason: `robots.txt de ${validation.url.origin} deniega "${validation.url.pathname}" para "${uaToken}"`, url: normalized, redirectChain, fetchedAt: new Date().toISOString() };
        }
      }
    }

    let response;
    try {
      response = await transportFn(validation.url, validation.address, validation.family, { timeoutMs: config.timeoutMs, maxBytes: config.maxBytes, userAgent: config.userAgent });
    } catch (err) {
      const code = err instanceof FetchError ? err.code : "CONNECTION_REFUSED";
      return { status: "error", errorCode: code, reason: err.message, url: normalized, redirectChain, fetchedAt: new Date().toISOString() };
    }

    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
      let redirectTarget;
      try {
        redirectTarget = new URL(response.headers.location, validation.url).toString();
      } catch {
        return { status: "error", errorCode: "INSECURE_REDIRECT", reason: "cabecera Location malformada", url: normalized, redirectChain, fetchedAt: new Date().toISOString() };
      }
      redirectChain.push({ from: normalized, to: redirectTarget, statusCode: response.statusCode });
      if (redirectCount === config.maxRedirects) {
        return { status: "error", errorCode: "TOO_MANY_REDIRECTS", reason: `más de ${config.maxRedirects} redirecciones`, url: normalized, redirectChain, fetchedAt: new Date().toISOString() };
      }
      currentUrl = redirectTarget;
      continue;
    }

    if (response.statusCode >= 400 && response.statusCode < 500) {
      return { status: "error", errorCode: "HTTP_4XX", reason: `HTTP ${response.statusCode}`, url: normalized, redirectChain, fetchedAt: new Date().toISOString(), httpStatus: response.statusCode };
    }
    if (response.statusCode >= 500) {
      return { status: "error", errorCode: "HTTP_5XX", reason: `HTTP ${response.statusCode}`, url: normalized, redirectChain, fetchedAt: new Date().toISOString(), httpStatus: response.statusCode };
    }

    const mimeOk = config.allowedMimeTypes.some((mime) => response.contentType === mime || response.contentType === "");
    if (!mimeOk) {
      return { status: "unavailable", errorCode: "UNSUPPORTED_MIME", reason: `tipo MIME no permitido: "${response.contentType}"`, url: normalized, redirectChain, fetchedAt: new Date().toISOString() };
    }

    return {
      status: "available",
      url: normalized,
      httpStatus: response.statusCode,
      contentType: response.contentType,
      byteSize: response.byteSize,
      body: response.body,
      redirectChain,
      fetchedAt: new Date().toISOString(),
      contentHash: createHash("sha256").update(response.body, "utf8").digest("hex"),
      // Paso 16/18 — reexpuestos para analizadores posteriores (seoProvider,
      // performanceProvider): NO son una segunda descarga, son datos ya
      // obtenidos en este mismo fetch (cabeceras de la respuesta ya
      // recibida, robots.txt ya consultado más arriba, timing REAL medido
      // por performPinnedRequest durante ESTA petición).
      headers: extractAnalyzableHeaders(response.headers),
      robotsTxt: lastRobotsResult,
      httpVersion: response.httpVersion ?? null,
      timing: response.timing ?? null,
    };
  }

  return { status: "error", errorCode: "TOO_MANY_REDIRECTS", reason: "límite de redirecciones alcanzado", url: currentUrl, redirectChain, fetchedAt: new Date().toISOString() };
}

/**
 * Obtiene varias páginas (hasta `limits.maxPages`) con pausa entre
 * peticiones (rate limiting) y produce Evidence a partir del HTML real
 * (reutilizando `evidenceFromHtmlText` de sourceAdapters.js — no
 * duplica la extracción de señales). Cada evidencia queda marcada con
 * `sourceType: "public_website_real"` y su procedencia (URL, timestamp,
 * hash) preservada en `metadata`.
 */
export async function collectFromPublicWebsite(urls, limits = {}, testHooks = {}) {
  const config = { ...DEFAULT_FETCHER_LIMITS, ...limits };
  const pagesToFetch = urls.slice(0, config.maxPages);
  const evidence = [];
  const pageResults = [];
  const consultedUrls = [];

  for (let i = 0; i < pagesToFetch.length; i++) {
    if (i > 0) await sleep(config.rateLimitMs);
    const result = await fetchPublicWebsite(pagesToFetch[i], config, testHooks);
    pageResults.push(result);
    consultedUrls.push(result.url);

    if (result.status === "available") {
      // OJO idempotencia: `metadata` de la Evidence NUNCA incluye `fetchedAt`
      // (varía en cada ejecución real y rompe el hash usado para
      // detectar cambios — ver auditOrchestrator.js). `fetchedAt` solo
      // vive en `pageResults` (no persistido), para el informe en consola.
      const pageEvidence = evidenceFromHtmlText(result.url, result.body).map((e) => ({
        ...e,
        sourceType: "public_website_real",
        classification: "confirmed",
        metadata: { ...e.metadata, url: result.url, httpStatus: result.httpStatus, contentHash: result.contentHash, redirectChain: result.redirectChain },
      }));
      evidence.push(...pageEvidence);
    } else {
      evidence.push(
        createEvidence({
          sourceId: result.url,
          sourceType: "public_website_real",
          title: `No disponible: ${result.errorCode}`,
          excerpt: result.reason,
          normalizedContent: result.reason,
          classification: "unavailable",
          relatedDimension: "digitalMaturitySignal",
          signal: { strength: 0, polarity: "neutral" },
          confidence: 0,
          provenance: `public_website_real:${result.url}`,
          limitations: [`Fallo de obtención real (${result.errorCode}): ${result.reason}`],
          metadata: { url: result.url, errorCode: result.errorCode },
        })
      );
    }
  }

  return { evidence, pageResults, consultedUrls };
}

export const PUBLIC_WEBSITE_FETCHER_PROVIDER = Object.freeze({
  id: PUBLIC_WEBSITE_FETCHER_ID,
  version: PUBLIC_WEBSITE_FETCHER_VERSION,
  capabilities: Object.freeze(["*"]),
  limits: DEFAULT_FETCHER_LIMITS,
  provenance: "network-provider:publicWebsiteFetcher",
  async healthCheck() {
    return { providerId: PUBLIC_WEBSITE_FETCHER_ID, healthy: true, mode: "real-network-capable", message: "requiere allowNetwork:true explícito para conectarse; en caso contrario nunca se invoca" };
  },
  collect: collectFromPublicWebsite,
});
