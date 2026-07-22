// Paso 12 · Fase 3 — Protección SSRF y de rutas para el motor de investigación.
//
// Toda entrada externa (URL o ruta local) pasa por aquí ANTES de que
// cualquier adaptador la use. Fail-closed: ante duda, se rechaza. Ningún
// adaptador de este paso realiza conexiones de red reales (ver
// sourceAdapters.js); esta protección existe para cuando se conecte un
// fetcher real en un paso futuro (ver researchProviderContracts vía
// factory/extensionPoints.js) y para rechazar rutas locales inseguras hoy.

import path from "node:path";

export const ALLOWED_URL_SCHEMES = Object.freeze(["http:", "https:"]);

const PRIVATE_IPV4_PATTERNS = [
  /^127\./, // loopback
  /^10\./, // RFC1918
  /^192\.168\./, // RFC1918
  /^172\.(1[6-9]|2\d|3[01])\./, // RFC1918
  /^169\.254\./, // link-local + cloud metadata (169.254.169.254)
  /^0\./, // "this network"
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT 100.64.0.0/10
  /^22[4-9]\.|^23[0-9]\./, // multicast 224.0.0.0/4
  /^255\.255\.255\.255$/, // broadcast (dirección general)
  /^192\.0\.0\./, // IETF protocol assignments (RFC6890)
  /^192\.0\.2\./, // TEST-NET-1 (documentación)
  /^198\.51\.100\./, // TEST-NET-2 (documentación)
  /^203\.0\.113\./, // TEST-NET-3 (documentación)
  /^24[0-9]\.|^25[0-4]\./, // reservado (240.0.0.0/4, excl. broadcast ya cubierto)
];

const DANGEROUS_HOSTNAMES = Object.freeze(["localhost", "0.0.0.0", "metadata.google.internal"]);

const DANGEROUS_HOST_SUFFIXES = Object.freeze([".local", ".internal", ".localhost"]);

function isIpv4Literal(hostname) {
  return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

function isPrivateIpv4(hostname) {
  return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(hostname));
}

function isPrivateIpv6(hostname) {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (normalized === "::1" || normalized === "::") return true;
  if (normalized.startsWith("fe80:")) return true; // link-local
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // ULA
  if (normalized.startsWith("ff")) return true; // multicast (ff00::/8)
  if (normalized.startsWith("::ffff:")) {
    // IPv4-mapped IPv6: reevaluar la parte IPv4 embebida con las mismas reglas.
    const embeddedIpv4 = normalized.slice("::ffff:".length);
    return isIpv4Literal(embeddedIpv4) && isPrivateIpv4(embeddedIpv4);
  }
  return false;
}

/**
 * Clasifica una dirección IP literal (IPv4 o IPv6, ya resuelta o tal cual
 * aparece en una URL) como pública o privada/reservada/peligrosa. Reutilizada
 * tanto por `classifyUrl` (hostname literal en la URL) como por la
 * validación de IPs resueltas por DNS (ver providers/publicWebsiteFetcher.js),
 * para no duplicar la lista de rangos en dos sitios.
 * @param {string} ip
 * @returns {{safe: boolean, reason: string}}
 */
export function classifyIpAddress(ip) {
  const normalized = String(ip ?? "").trim();
  if (normalized.length === 0) return { safe: false, reason: "dirección IP vacía" };
  if (isIpv4Literal(normalized)) {
    if (isPrivateIpv4(normalized)) return { safe: false, reason: `dirección IPv4 privada/reservada: "${normalized}"` };
    return { safe: true, reason: "IPv4 pública" };
  }
  if (normalized.includes(":")) {
    if (isPrivateIpv6(normalized)) return { safe: false, reason: `dirección IPv6 privada/reservada: "${normalized}"` };
    return { safe: true, reason: "IPv6 pública" };
  }
  return { safe: false, reason: `no reconocida como dirección IPv4/IPv6 válida: "${normalized}"` };
}

/**
 * Clasifica una URL como segura o peligrosa para un futuro fetcher real.
 * Nunca resuelve DNS (no hay conexión de red aquí): solo evalúa el
 * hostname/esquema/puerto literales de la URL, que es la única defensa
 * disponible sin hacer una petición. Fail-closed ante cualquier duda.
 * @param {string} rawUrl
 * @returns {{safe: boolean, reason: string, url?: URL}}
 */
export function classifyUrl(rawUrl) {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    return { safe: false, reason: "URL vacía o no es un string" };
  }

  let url;
  try {
    url = new URL(rawUrl);
  } catch {
    return { safe: false, reason: "URL malformada" };
  }

  if (!ALLOWED_URL_SCHEMES.includes(url.protocol)) {
    return { safe: false, reason: `esquema no permitido: "${url.protocol}" (solo http/https)` };
  }

  if (url.username || url.password) {
    return { safe: false, reason: "las URLs con credenciales embebidas (user:pass@) no están permitidas" };
  }

  const hostname = url.hostname.toLowerCase();

  if (DANGEROUS_HOSTNAMES.includes(hostname)) {
    return { safe: false, reason: `hostname bloqueado: "${hostname}"` };
  }
  if (DANGEROUS_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
    return { safe: false, reason: `sufijo de hostname bloqueado: "${hostname}"` };
  }
  if (isIpv4Literal(hostname) && isPrivateIpv4(hostname)) {
    return { safe: false, reason: `dirección IPv4 privada/reservada bloqueada: "${hostname}"` };
  }
  if (hostname.includes(":") && isPrivateIpv6(hostname)) {
    return { safe: false, reason: `dirección IPv6 privada/reservada bloqueada: "${hostname}"` };
  }
  if (hostname === "169.254.169.254") {
    return { safe: false, reason: "bloqueado explícitamente: servicio de metadatos de nube" };
  }

  return { safe: true, reason: "URL pasa las comprobaciones estáticas de seguridad", url };
}

/** true/false de conveniencia sobre classifyUrl(). */
export function isSafePublicUrl(rawUrl) {
  return classifyUrl(rawUrl).safe;
}

/**
 * Resuelve `requestedPath` relativo a `baseDir` y garantiza que el
 * resultado permanece DENTRO de `baseDir` (protección path traversal).
 * Rechaza rutas absolutas fuera de baseDir y cualquier `..` que escape.
 * @param {string} baseDir
 * @param {string} requestedPath
 * @returns {{safe: boolean, reason: string, resolvedPath?: string}}
 */
export function resolveSafeLocalPath(baseDir, requestedPath) {
  if (typeof requestedPath !== "string" || requestedPath.trim().length === 0) {
    return { safe: false, reason: "ruta vacía o no es un string" };
  }
  if (requestedPath.includes("\0")) {
    return { safe: false, reason: "la ruta contiene un byte nulo" };
  }

  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(resolvedBase, requestedPath);
  const relative = path.relative(resolvedBase, resolvedTarget);

  const escapesBase = relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative);
  if (escapesBase) {
    return { safe: false, reason: `la ruta resuelta escapa del directorio permitido "${resolvedBase}"` };
  }

  return { safe: true, reason: "ruta dentro del directorio permitido", resolvedPath: resolvedTarget };
}

/** true/false de conveniencia sobre resolveSafeLocalPath(). */
export function isSafeLocalPath(baseDir, requestedPath) {
  return resolveSafeLocalPath(baseDir, requestedPath).safe;
}
