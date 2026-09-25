// Paso 18 · Fase 3 — Análisis de rendimiento determinista sobre datos YA
// recopilados por publicWebsiteFetcher (timing real medido durante ESA
// petición, cabeceras de ESA respuesta, HTML ya descargado) — nunca
// descarga ningún recurso referenciado (script/imagen/CSS/fuente) por su
// cuenta, nunca lanza un navegador, nunca instala Playwright, nunca
// calcula ni declara LCP/CLS/INP/FCP (esos requieren un navegador real).
//
// Cada hallazgo declara `measurementType`: "observed" (leído tal cual de
// una cabecera/atributo), "measured" (tiempo/tamaño real medido durante
// la petición), "calculated" (derivado determinísticamente de datos
// observados, p. ej. nº de recursos), "estimated" (heurística explícita,
// p. ej. profundidad de anidamiento por regex) o "not_measured"/
// "unavailable" (dato que requeriría descargar un recurso adicional o un
// navegador real — nunca se inventa).

import { Buffer } from "node:buffer";

import { extractLinks } from "../seo/seoHtmlExtractors.js";
import { hasViewportMeta } from "../../htmlSignals.js";
import {
  extractScripts,
  extractStylesheets,
  extractResourceHints,
  countIframes,
  extractFontReferences,
  countComments,
  countInlineStyleAttributes,
  estimateNodeCount,
  estimateNestingDepth,
  isDocumentWellFormed,
  extractImagesForPerformance,
  extractThirdPartyDomains,
} from "./perfHtmlExtractors.js";
import { getPerfSectorRule } from "./perfSectorRules.js";

export const PERF_CATEGORIES = Object.freeze(["response", "html", "resources", "images", "javascript", "css", "fonts", "caching", "mobile", "derived"]);
export const SEVERITIES = Object.freeze(["critical", "high", "medium", "low", "opportunity", "not_measured", "browser_test_required"]);
export const MEASUREMENT_TYPES = Object.freeze(["observed", "measured", "calculated", "estimated", "not_measured", "unavailable", "fixture"]);

const HTML_LARGE_BYTES_THRESHOLD = 200_000; // ~ umbral habitual de "documento HTML pesado"
const RESOURCE_COUNT_HIGH_THRESHOLD = 80;
const THIRD_PARTY_DOMAIN_HIGH_THRESHOLD = 6;
const CDN_HEADER_NAMES = Object.freeze(["cf-ray", "x-cache", "x-served-by", "via"]);

function finding({ id, category, metric, unit, status, severity, polarity = "neutral", strength = 0.5, confidence, title, value = null, rule, url, source = "publicWebsiteFetcher", limitations = [] }) {
  if (!PERF_CATEGORIES.includes(category)) throw new Error(`perfAnalyzer: categoría desconocida "${category}"`);
  if (!SEVERITIES.includes(severity)) throw new Error(`perfAnalyzer: severidad desconocida "${severity}"`);
  if (!MEASUREMENT_TYPES.includes(status)) throw new Error(`perfAnalyzer: measurementType desconocido "${status}"`);
  return Object.freeze({ id, category, dimension: "performance", metric, unit, status, severity, polarity, strength, confidence, title, value, rule, url, source, limitations: Object.freeze([...limitations]) });
}

// ---------------------------------------------------------------------
// A. RESPUESTA HTTP
// ---------------------------------------------------------------------
function analyzeResponse(page) {
  const { url, httpStatus, headers, timing, httpVersion, redirectChain, byteSize } = page;
  const findings = [];

  if (timing && typeof timing.timeToHeadersMs === "number") {
    findings.push(finding({ id: "perf.response.timeToHeaders", category: "response", metric: "response.timeToHeadersMs", unit: "ms", status: "measured", severity: timing.timeToHeadersMs > 800 ? "high" : timing.timeToHeadersMs > 400 ? "medium" : "low", polarity: timing.timeToHeadersMs > 800 ? "negative" : "positive", strength: timing.timeToHeadersMs > 800 ? 0.5 : 0.15, confidence: 0.9, title: `Tiempo hasta cabeceras: ${timing.timeToHeadersMs}ms (medido en esta petición, incluye conexión TCP/TLS)`, value: timing.timeToHeadersMs, rule: "Medido con el cliente HTTP de Node durante la petición real de publicWebsiteFetcher — no es el TTFB de un navegador real (no incluye cola de red del navegador ni otras conexiones concurrentes).", url, limitations: ["No equivale al TTFB medido por un navegador real ni por Web Vitals de campo."] }));
    findings.push(finding({ id: "perf.response.totalTime", category: "response", metric: "response.totalMs", unit: "ms", status: "measured", severity: timing.totalMs > 2000 ? "high" : timing.totalMs > 1000 ? "medium" : "low", polarity: timing.totalMs > 2000 ? "negative" : "positive", strength: timing.totalMs > 2000 ? 0.4 : 0.1, confidence: 0.9, title: `Tiempo total de petición: ${timing.totalMs}ms (medido)`, value: timing.totalMs, rule: "Tiempo real desde el inicio de la petición hasta recibir el cuerpo completo, medido por performPinnedRequest.", url }));
  } else {
    findings.push(finding({ id: "perf.response.timing", category: "response", metric: "response.timing", unit: "ms", status: "not_measured", severity: "not_measured", confidence: 0, title: "Timing de la petición no disponible (fixture/HTML sin datos de tiempo real)", rule: "El timing solo existe cuando la página proviene de una petición real de publicWebsiteFetcher; fixtures/servidores locales sin instrumentar no lo declaran.", url, limitations: ["Sin timing real, no se estima ni se infiere ningún valor."] }));
  }

  findings.push(finding({ id: "perf.response.httpStatus", category: "response", metric: "response.httpStatus", unit: "code", status: "observed", severity: httpStatus >= 400 ? "critical" : "low", polarity: httpStatus >= 400 ? "negative" : "positive", strength: httpStatus >= 400 ? 1 : 0.1, confidence: 1, title: `Status HTTP: ${httpStatus}`, value: httpStatus, rule: "El status HTTP de la respuesta ya recibida.", url }));

  const redirectCount = (redirectChain ?? []).length;
  findings.push(finding({ id: "perf.response.redirects", category: "response", metric: "response.redirectCount", unit: "count", status: "observed", severity: redirectCount > 1 ? "medium" : redirectCount === 1 ? "low" : "low", polarity: redirectCount > 0 ? "negative" : "positive", strength: redirectCount > 1 ? 0.4 : redirectCount === 1 ? 0.15 : 0.05, confidence: 1, title: `${redirectCount} redirección(es) antes de esta respuesta`, value: redirectCount, rule: "Cada redirección añade al menos una ida y vuelta de red antes de recibir el contenido final.", url }));

  const isHttps = (() => {
    try {
      return new URL(url).protocol === "https:";
    } catch {
      return false;
    }
  })();
  findings.push(finding({ id: "perf.response.https", category: "response", metric: "response.https", unit: "boolean", status: "observed", severity: isHttps ? "low" : "high", polarity: isHttps ? "positive" : "negative", strength: isHttps ? 0.1 : 0.6, confidence: 1, title: isHttps ? "Servida sobre HTTPS" : "Servida sobre HTTP (sin cifrar)", value: isHttps, rule: "HTTPS es requisito para HTTP/2+ y para varias APIs de rendimiento modernas.", url }));

  if (httpVersion) {
    findings.push(finding({ id: "perf.response.httpVersion", category: "response", metric: "response.httpVersion", unit: "version", status: "observed", severity: "opportunity", polarity: "neutral", strength: 0.1, confidence: 1, title: `Versión HTTP observada: ${httpVersion}`, value: httpVersion, rule: "HTTP/1.1 sin multiplexado puede limitar peticiones paralelas frente a HTTP/2+.", url }));
  }

  findings.push(finding({ id: "perf.response.transferredSize", category: "response", metric: "response.byteSize", unit: "bytes", status: "measured", severity: "not_measured", polarity: "neutral", strength: 0, confidence: 1, title: `${byteSize ?? "desconocido"} byte(s) transferidos (medidos)`, value: byteSize ?? null, rule: "Tamaño real recibido en esta petición.", url }));

  if (headers) {
    const contentEncoding = headers["content-encoding"];
    findings.push(
      finding({
        id: "perf.response.compression",
        category: "response",
        metric: "response.contentEncoding",
        unit: "text",
        status: contentEncoding ? "observed" : "not_measured",
        severity: contentEncoding ? "low" : "not_measured",
        polarity: contentEncoding ? "positive" : "neutral",
        strength: contentEncoding ? 0.1 : 0,
        confidence: contentEncoding ? 1 : 0,
        title: contentEncoding ? `Compresión observada: ${contentEncoding}` : "Sin compresión observada en esta respuesta",
        value: contentEncoding ?? null,
        rule: "publicWebsiteFetcher solicita 'Accept-Encoding: identity' deliberadamente (evita tener que descomprimir, por diseño de seguridad de Paso 13) — no se puede determinar de forma fiable si el servidor comprimiría con gzip/br ante un cliente real sin cambiar esa política.",
        url,
        limitations: ["No representa si el servidor soporta compresión para clientes reales: la petición pide explícitamente 'identity'."],
      })
    );
    findings.push(finding({ id: "perf.caching.cacheControl", category: "caching", metric: "response.cacheControl", unit: "text", status: headers["cache-control"] ? "observed" : "observed", severity: headers["cache-control"] ? "low" : "medium", polarity: headers["cache-control"] ? "positive" : "negative", strength: headers["cache-control"] ? 0.1 : 0.3, confidence: 1, title: headers["cache-control"] ? `Cache-Control: ${headers["cache-control"]}` : "Sin cabecera Cache-Control", value: headers["cache-control"] ?? null, rule: "Cache-Control ausente deja el cacheo del navegador a heurísticas menos predecibles.", url }));
    findings.push(finding({ id: "perf.caching.etag", category: "caching", metric: "response.etag", unit: "text", status: "observed", severity: "opportunity", polarity: headers.etag ? "positive" : "neutral", strength: 0.05, confidence: 1, title: headers.etag ? "ETag presente (revalidación condicional posible)" : "Sin ETag", value: headers.etag ?? null, rule: "ETag permite validación condicional (304) sin retransferir el recurso.", url }));
    findings.push(finding({ id: "perf.caching.expires", category: "caching", metric: "response.expires", unit: "text", status: "observed", severity: "opportunity", polarity: headers.expires ? "positive" : "neutral", strength: 0.05, confidence: 1, title: headers.expires ? `Expires: ${headers.expires}` : "Sin cabecera Expires", value: headers.expires ?? null, rule: "Expires es el mecanismo de caché HTTP/1.0; Cache-Control lo sustituye en HTTP/1.1+ pero su presencia no perjudica.", url }));
    const cdnHeader = CDN_HEADER_NAMES.find((h) => headers[h]);
    findings.push(finding({ id: "perf.caching.cdnEvidence", category: "caching", metric: "response.cdnEvidence", unit: "boolean", status: cdnHeader ? "observed" : "not_measured", severity: "opportunity", polarity: cdnHeader ? "positive" : "neutral", strength: 0.05, confidence: cdnHeader ? 0.8 : 0, title: cdnHeader ? `Evidencia pública de CDN/proxy (cabecera "${cdnHeader}": ${headers[cdnHeader]})` : "Sin evidencia pública de CDN en las cabeceras observadas", value: cdnHeader ? { header: cdnHeader, value: headers[cdnHeader] } : null, rule: "Solo se declara CDN si una cabecera pública lo evidencia (cf-ray/x-cache/x-served-by/via) — nunca se infiere de otro modo.", url }));
  }

  return findings;
}

// ---------------------------------------------------------------------
// B. DOCUMENTO HTML
// ---------------------------------------------------------------------
function analyzeHtmlDocument(page) {
  const { url, body } = page;
  const findings = [];
  const htmlBytes = Buffer.byteLength(body, "utf8");

  findings.push(finding({ id: "perf.html.size", category: "html", metric: "html.sizeBytes", unit: "bytes", status: "measured", severity: htmlBytes > HTML_LARGE_BYTES_THRESHOLD ? "high" : htmlBytes > HTML_LARGE_BYTES_THRESHOLD / 2 ? "medium" : "low", polarity: htmlBytes > HTML_LARGE_BYTES_THRESHOLD ? "negative" : "positive", strength: htmlBytes > HTML_LARGE_BYTES_THRESHOLD ? 0.5 : 0.1, confidence: 1, title: `HTML de ${htmlBytes} bytes${htmlBytes > HTML_LARGE_BYTES_THRESHOLD ? " (excesivamente grande)" : ""}`, value: htmlBytes, rule: `Umbral de "HTML excesivamente grande": ${HTML_LARGE_BYTES_THRESHOLD} bytes (heurística editorial, no una norma).`, url }));

  const nodeCount = estimateNodeCount(body);
  findings.push(finding({ id: "perf.html.nodeCount", category: "html", metric: "html.nodeCountEstimate", unit: "count", status: "calculated", severity: nodeCount > 1500 ? "medium" : "opportunity", polarity: nodeCount > 1500 ? "negative" : "neutral", strength: nodeCount > 1500 ? 0.3 : 0, confidence: 0.7, title: `~${nodeCount} nodo(s) estimados (recuento de etiquetas de apertura, no un DOM real)`, value: nodeCount, rule: "Cálculo determinista por regex de etiquetas de apertura — una aproximación razonable al nº de nodos, no el recuento exacto de un DOM parseado.", url, limitations: ["No es el recuento real de un DOM parseado por un navegador."] }));

  const depth = estimateNestingDepth(body);
  findings.push(finding({ id: "perf.html.depth", category: "html", metric: "html.nestingDepthEstimate", unit: "levels", status: "estimated", severity: depth > 15 ? "low" : "opportunity", polarity: depth > 15 ? "negative" : "neutral", strength: depth > 15 ? 0.2 : 0, confidence: 0.4, title: `Profundidad de anidamiento estimada: ${depth} nivel(es) (heurística sobre contenedores comunes)`, value: depth, rule: "Heurística por regex sobre div/section/article/main/aside/ul/ol/table/form — no puede anidar de verdad como un parser HTML real.", url, limitations: ["Heurística de bajo nivel de confianza: no es un árbol DOM real."] }));

  const commentCount = countComments(body);
  findings.push(finding({ id: "perf.html.comments", category: "html", metric: "html.commentCount", unit: "count", status: "observed", severity: "opportunity", polarity: commentCount > 50 ? "negative" : "neutral", strength: commentCount > 50 ? 0.1 : 0, confidence: 1, title: `${commentCount} comentario(s) HTML`, value: commentCount, rule: "Comentarios abundantes añaden peso sin aportar contenido renderizado.", url }));

  const inlineStyleAttrs = countInlineStyleAttributes(body);
  findings.push(finding({ id: "perf.html.inlineStyleAttrs", category: "html", metric: "html.inlineStyleAttributeCount", unit: "count", status: "observed", severity: inlineStyleAttrs > 20 ? "low" : "opportunity", polarity: inlineStyleAttrs > 20 ? "negative" : "neutral", strength: inlineStyleAttrs > 20 ? 0.15 : 0, confidence: 1, title: `${inlineStyleAttrs} atributo(s) style= inline`, value: inlineStyleAttrs, rule: "Estilos inline abundantes impiden el cacheo del CSS y dificultan el mantenimiento.", url }));

  const wellFormed = isDocumentWellFormed(body);
  findings.push(finding({ id: "perf.html.wellFormed", category: "html", metric: "html.wellFormed", unit: "boolean", status: "calculated", severity: wellFormed.wellFormed ? "low" : "medium", polarity: wellFormed.wellFormed ? "positive" : "negative", strength: wellFormed.wellFormed ? 0.05 : 0.3, confidence: 0.6, title: wellFormed.wellFormed ? "Recuento de apertura/cierre de etiquetas parejo" : `Posible descuadre de etiquetas: ${wellFormed.mismatchedTags.join(", ")}`, value: wellFormed, rule: "Heurística de recuento apertura/cierre por nombre de etiqueta — no un parser HTML real, puede haber falsos positivos con etiquetas autocontenidas no estándar.", url, limitations: ["Heurística, no un parser HTML normativo."] }));

  return findings;
}

// ---------------------------------------------------------------------
// C. RECURSOS DECLARADOS
// ---------------------------------------------------------------------
function analyzeResources(page) {
  const { url, body } = page;
  const findings = [];
  const scripts = extractScripts(body);
  const stylesheets = extractStylesheets(body);
  const hints = extractResourceHints(body);
  const iframeCount = countIframes(body);
  const links = extractLinks(body, url);

  const totalDeclared = scripts.length + stylesheets.length + iframeCount;
  findings.push(finding({ id: "perf.resources.totalCount", category: "resources", metric: "resources.declaredCount", unit: "count", status: "calculated", severity: totalDeclared > RESOURCE_COUNT_HIGH_THRESHOLD ? "medium" : "opportunity", polarity: totalDeclared > RESOURCE_COUNT_HIGH_THRESHOLD ? "negative" : "neutral", strength: totalDeclared > RESOURCE_COUNT_HIGH_THRESHOLD ? 0.3 : 0, confidence: 1, title: `${totalDeclared} recurso(s) declarado(s) (scripts+hojas de estilo+iframes)`, value: totalDeclared, rule: `Umbral editorial de "muchos recursos declarados": ${RESOURCE_COUNT_HIGH_THRESHOLD}.`, url }));

  const blockingScripts = scripts.filter((s) => s.inHead && s.src && !s.async && !s.defer && !s.isModule);
  const blockingStyles = stylesheets.filter((s) => s.inHead && !s.inline && s.media !== "print");
  const blockingCount = blockingScripts.length + blockingStyles.length;
  findings.push(finding({ id: "perf.resources.renderBlocking", category: "resources", metric: "resources.blockingCandidateCount", unit: "count", status: "calculated", severity: blockingCount > 0 ? "high" : "low", polarity: blockingCount > 0 ? "negative" : "positive", strength: blockingCount > 0 ? Math.min(1, blockingCount * 0.2) : 0.05, confidence: 0.8, title: `${blockingCount} recurso(s) candidato(s) a bloquear el renderizado (script sin async/defer en head + CSS sin media=print en head)`, value: blockingCount, rule: "Heurística determinista: script en <head> con src y sin async/defer/module, o stylesheet en <head> sin media=print, son candidatos habituales a bloquear el primer render.", url, limitations: ["Candidato heurístico, no una medición real de bloqueo con navegador."] }));

  const hintCounts = { preload: 0, prefetch: 0, preconnect: 0, "dns-prefetch": 0 };
  for (const h of hints) hintCounts[h.rel] = (hintCounts[h.rel] ?? 0) + 1;
  findings.push(finding({ id: "perf.resources.hints", category: "resources", metric: "resources.hintCounts", unit: "count", status: "observed", severity: "opportunity", polarity: hints.length > 0 ? "positive" : "neutral", strength: 0.05, confidence: 1, title: `Pistas de recursos declaradas: preload=${hintCounts.preload}, prefetch=${hintCounts.prefetch}, preconnect=${hintCounts.preconnect}, dns-prefetch=${hintCounts["dns-prefetch"]}`, value: hintCounts, rule: "Inventario de <link rel=preload|prefetch|preconnect|dns-prefetch> declarados.", url }));

  const srcs = [...scripts.map((s) => s.src).filter(Boolean), ...stylesheets.map((s) => s.href).filter(Boolean)];
  const dupCounts = new Map();
  for (const s of srcs) dupCounts.set(s, (dupCounts.get(s) ?? 0) + 1);
  const duplicated = [...dupCounts.entries()].filter(([, n]) => n > 1);
  if (duplicated.length > 0) {
    findings.push(finding({ id: "perf.resources.duplicated", category: "resources", metric: "resources.duplicateCount", unit: "count", status: "observed", severity: "medium", polarity: "negative", strength: 0.3, confidence: 1, title: `${duplicated.length} recurso(s) declarado(s) más de una vez`, value: duplicated.map(([src, n]) => ({ src, count: n })), rule: "Un mismo script/hoja de estilo incluido varias veces provoca peticiones y parseo redundantes.", url }));
  }

  const thirdPartyDomains = extractThirdPartyDomains(body, url);
  findings.push(finding({ id: "perf.resources.thirdPartyDomains", category: "resources", metric: "resources.thirdPartyDomainCount", unit: "count", status: "calculated", severity: thirdPartyDomains.length > THIRD_PARTY_DOMAIN_HIGH_THRESHOLD ? "medium" : "opportunity", polarity: thirdPartyDomains.length > THIRD_PARTY_DOMAIN_HIGH_THRESHOLD ? "negative" : "neutral", strength: thirdPartyDomains.length > THIRD_PARTY_DOMAIN_HIGH_THRESHOLD ? 0.3 : 0, confidence: 0.9, title: `${thirdPartyDomains.length} dominio(s) de terceros referenciados: ${thirdPartyDomains.slice(0, 5).join(", ")}${thirdPartyDomains.length > 5 ? "…" : ""}`, value: thirdPartyDomains, rule: `Umbral editorial de "muchos dominios de terceros": ${THIRD_PARTY_DOMAIN_HIGH_THRESHOLD}. Cada dominio adicional implica una conexión (DNS+TCP+TLS) adicional.`, url }));

  void links;
  return findings;
}

// ---------------------------------------------------------------------
// D. IMÁGENES
// ---------------------------------------------------------------------
function analyzeImages(page) {
  const { url, body } = page;
  const findings = [];
  const images = extractImagesForPerformance(body);
  if (images.length === 0) return findings;

  findings.push(finding({ id: "perf.images.count", category: "images", metric: "images.count", unit: "count", status: "observed", severity: "opportunity", polarity: "neutral", strength: 0, confidence: 1, title: `${images.length} imagen(es) en la página`, value: images.length, rule: "Conteo base de imágenes.", url }));

  const withoutDimensions = images.filter((i) => !i.hasDimensions);
  findings.push(finding({ id: "perf.images.missingDimensions", category: "images", metric: "images.missingDimensionsCount", unit: "count", status: "observed", severity: withoutDimensions.length > 0 ? "high" : "low", polarity: withoutDimensions.length > 0 ? "negative" : "positive", strength: withoutDimensions.length > 0 ? Math.min(1, withoutDimensions.length / images.length) : 0.05, confidence: 1, title: withoutDimensions.length > 0 ? `${withoutDimensions.length}/${images.length} imagen(es) sin width/height declarados` : "Todas las imágenes declaran dimensiones", value: withoutDimensions.length, rule: "Sin width/height (o aspect-ratio), el navegador no puede reservar espacio antes de cargar la imagen (riesgo de layout shift).", url }));

  const lazyCount = images.filter((i) => i.loadingLazy).length;
  findings.push(finding({ id: "perf.images.lazyLoading", category: "images", metric: "images.lazyCount", unit: "count", status: "observed", severity: "opportunity", polarity: lazyCount > 0 ? "positive" : "neutral", strength: 0.05, confidence: 1, title: `${lazyCount}/${images.length} imagen(es) con loading="lazy"`, value: lazyCount, rule: "La carga diferida de imágenes fuera del viewport inicial reduce peso inicial transferido.", url }));

  const srcsetCount = images.filter((i) => i.hasSrcset).length;
  findings.push(finding({ id: "perf.images.responsive", category: "images", metric: "images.srcsetCoverage", unit: "ratio", status: "calculated", severity: srcsetCount === 0 && images.length > 3 ? "medium" : "opportunity", polarity: srcsetCount > 0 ? "positive" : "neutral", strength: srcsetCount === 0 && images.length > 3 ? 0.2 : 0, confidence: 0.8, title: `${srcsetCount}/${images.length} imagen(es) con srcset (responsive)`, value: Math.round((srcsetCount / images.length) * 100) / 100, rule: "srcset permite servir tamaños de imagen distintos por dispositivo, reduciendo peso en móvil.", url }));

  const srcs = images.map((i) => i.src).filter(Boolean);
  const dupCounts = new Map();
  for (const s of srcs) dupCounts.set(s, (dupCounts.get(s) ?? 0) + 1);
  const duplicated = [...dupCounts.entries()].filter(([, n]) => n > 1);
  if (duplicated.length > 0) {
    findings.push(finding({ id: "perf.images.duplicated", category: "images", metric: "images.duplicateCount", unit: "count", status: "observed", severity: "low", polarity: "negative", strength: 0.15, confidence: 1, title: `${duplicated.length} URL(s) de imagen duplicada(s)`, value: duplicated.map(([src, n]) => ({ src, count: n })), rule: "La misma imagen referenciada varias veces puede indicar oportunidad de reutilizar el recurso cacheado, o marcado redundante.", url }));
  }

  findings.push(finding({ id: "perf.images.weight", category: "images", metric: "images.weightBytes", unit: "bytes", status: "unavailable", severity: "not_measured", confidence: 0, title: "Peso real de las imágenes no medido (requeriría descargar cada imagen)", value: null, rule: "publicWebsiteFetcher no descarga recursos de imagen (solo el documento HTML) — sin autorización explícita para descargas adicionales, este dato nunca se infiere.", url, limitations: ["No se descargan imágenes individuales: sería una descarga adicional fuera del alcance de este proveedor."] }));

  return findings;
}

// ---------------------------------------------------------------------
// E. JAVASCRIPT
// ---------------------------------------------------------------------
function analyzeJavaScript(page) {
  const { url, body } = page;
  const findings = [];
  const scripts = extractScripts(body);
  if (scripts.length === 0) return findings;

  const withSrc = scripts.filter((s) => s.src);
  const blocking = withSrc.filter((s) => !s.async && !s.defer && !s.isModule);
  findings.push(finding({ id: "perf.javascript.blocking", category: "javascript", metric: "javascript.blockingCount", unit: "count", status: "calculated", severity: blocking.length > 0 ? "high" : "low", polarity: blocking.length > 0 ? "negative" : "positive", strength: blocking.length > 0 ? Math.min(1, blocking.length * 0.2) : 0.05, confidence: 0.85, title: `${blocking.length}/${withSrc.length} script(s) externo(s) sin async/defer/module`, value: blocking.length, rule: "Un <script src=...> sin async/defer/module bloquea el parseo del HTML hasta descargarse y ejecutarse.", url }));

  const inlineScripts = scripts.filter((s) => s.inline);
  findings.push(finding({ id: "perf.javascript.inline", category: "javascript", metric: "javascript.inlineCount", unit: "count", status: "observed", severity: inlineScripts.length > 5 ? "low" : "opportunity", polarity: inlineScripts.length > 5 ? "negative" : "neutral", strength: inlineScripts.length > 5 ? 0.15 : 0, confidence: 1, title: `${inlineScripts.length} bloque(s) <script> inline`, value: inlineScripts.length, rule: "Scripts inline no se cachean por separado del HTML.", url }));

  const srcs = withSrc.map((s) => s.src);
  const dupCounts = new Map();
  for (const s of srcs) dupCounts.set(s, (dupCounts.get(s) ?? 0) + 1);
  const duplicated = [...dupCounts.entries()].filter(([, n]) => n > 1);
  if (duplicated.length > 0) {
    findings.push(finding({ id: "perf.javascript.duplicated", category: "javascript", metric: "javascript.duplicateCount", unit: "count", status: "observed", severity: "medium", polarity: "negative", strength: 0.3, confidence: 1, title: `${duplicated.length} script(s) incluido(s) más de una vez`, value: duplicated.map(([src, n]) => ({ src, count: n })), rule: "El mismo script incluido varias veces se descarga/parsea/ejecuta redundantemente.", url }));
  }

  const thirdPartyScripts = withSrc.filter((s) => {
    try {
      return new URL(s.src, url).hostname !== new URL(url).hostname;
    } catch {
      return false;
    }
  });
  findings.push(finding({ id: "perf.javascript.thirdParty", category: "javascript", metric: "javascript.thirdPartyCount", unit: "count", status: "calculated", severity: thirdPartyScripts.length > 5 ? "medium" : "opportunity", polarity: thirdPartyScripts.length > 5 ? "negative" : "neutral", strength: thirdPartyScripts.length > 5 ? 0.2 : 0, confidence: 0.9, title: `${thirdPartyScripts.length}/${withSrc.length} script(s) de terceros`, value: thirdPartyScripts.length, rule: "Scripts de terceros añaden latencia, peso y riesgo de bloqueo fuera del control del propio sitio.", url }));

  findings.push(finding({ id: "perf.javascript.executionCost", category: "javascript", metric: "javascript.executionCostMs", unit: "ms", status: "unavailable", severity: "browser_test_required", confidence: 0, title: "Coste de ejecución de JavaScript no evaluado (requiere navegador real)", value: null, rule: "Medir tiempo de parseo/compilación/ejecución de JS requiere un motor JavaScript real (navegador) — explícitamente fuera de alcance de este proveedor.", url, limitations: ["Requiere un navegador real o un entorno de perfilado JS; no se automatiza aquí."] }));

  return findings;
}

// ---------------------------------------------------------------------
// F. CSS
// ---------------------------------------------------------------------
function analyzeCss(page) {
  const { url, body } = page;
  const findings = [];
  const stylesheets = extractStylesheets(body);
  if (stylesheets.length === 0) return findings;

  const linked = stylesheets.filter((s) => !s.inline);
  const inline = stylesheets.filter((s) => s.inline);
  findings.push(finding({ id: "perf.css.count", category: "css", metric: "css.stylesheetCount", unit: "count", status: "observed", severity: "opportunity", polarity: "neutral", strength: 0, confidence: 1, title: `${linked.length} hoja(s) de estilo enlazada(s), ${inline.length} bloque(s) <style> inline`, value: { linked: linked.length, inline: inline.length }, rule: "Inventario base de CSS declarado.", url }));

  const blocking = linked.filter((s) => s.inHead && s.media !== "print");
  findings.push(finding({ id: "perf.css.blocking", category: "css", metric: "css.blockingCount", unit: "count", status: "calculated", severity: blocking.length > 2 ? "medium" : "low", polarity: blocking.length > 2 ? "negative" : "positive", strength: blocking.length > 2 ? 0.25 : 0.05, confidence: 0.75, title: `${blocking.length} hoja(s) de estilo candidata(s) a bloquear el renderizado (en head, sin media=print)`, value: blocking.length, rule: "Un <link rel=stylesheet> en <head> sin media=print bloquea el primer render hasta descargarse.", url, limitations: ["Candidato heurístico, no una medición real con navegador."] }));

  const preloadCss = extractResourceHints(body).filter((h) => h.rel === "preload" && h.as === "style").length;
  findings.push(finding({ id: "perf.css.preload", category: "css", metric: "css.preloadCount", unit: "count", status: "observed", severity: "opportunity", polarity: preloadCss > 0 ? "positive" : "neutral", strength: 0.05, confidence: 1, title: `${preloadCss} hoja(s) de estilo con preload declarado`, value: preloadCss, rule: "preload as=style adelanta la descarga de CSS crítico sin bloquear el parseo inicial.", url }));

  const hrefs = linked.map((s) => s.href).filter(Boolean);
  const dupCounts = new Map();
  for (const h of hrefs) dupCounts.set(h, (dupCounts.get(h) ?? 0) + 1);
  const duplicated = [...dupCounts.entries()].filter(([, n]) => n > 1);
  if (duplicated.length > 0) {
    findings.push(finding({ id: "perf.css.duplicated", category: "css", metric: "css.duplicateCount", unit: "count", status: "observed", severity: "medium", polarity: "negative", strength: 0.25, confidence: 1, title: `${duplicated.length} hoja(s) de estilo incluida(s) más de una vez`, value: duplicated.map(([href, n]) => ({ href, count: n })), rule: "La misma hoja de estilo enlazada varias veces se descarga/parsea redundantemente.", url }));
  }

  findings.push(finding({ id: "perf.css.unusedCss", category: "css", metric: "css.unusedRatio", unit: "ratio", status: "unavailable", severity: "browser_test_required", confidence: 0, title: "CSS no utilizado no evaluado (requiere análisis de cobertura con navegador real)", value: null, rule: "Determinar qué reglas CSS no se aplican requiere un motor de renderizado real (coverage de Chrome DevTools/Lighthouse) — explícitamente fuera de alcance.", url, limitations: ["Requiere un navegador real; no se automatiza aquí."] }));

  return findings;
}

// ---------------------------------------------------------------------
// G. FUENTES
// ---------------------------------------------------------------------
function analyzeFonts(page) {
  const { url, body } = page;
  const findings = [];
  const fonts = extractFontReferences(body);
  const totalFontFiles = fonts.linkedFontFiles.length;
  if (totalFontFiles === 0 && fonts.fontFaceCount === 0) return findings;

  findings.push(finding({ id: "perf.fonts.count", category: "fonts", metric: "fonts.fileCount", unit: "count", status: "observed", severity: "opportunity", polarity: "neutral", strength: 0, confidence: 1, title: `${totalFontFiles} archivo(s) de fuente enlazado(s), ${fonts.fontFaceCount} regla(s) @font-face`, value: { files: totalFontFiles, fontFace: fonts.fontFaceCount }, rule: "Inventario base de fuentes declaradas.", url }));

  const externalFontDomains = fonts.linkedFontFiles.filter((f) => {
    try {
      return new URL(f.href, url).hostname !== new URL(url).hostname;
    } catch {
      return false;
    }
  }).length;
  if (externalFontDomains > 0) {
    findings.push(finding({ id: "perf.fonts.external", category: "fonts", metric: "fonts.externalCount", unit: "count", status: "calculated", severity: "opportunity", polarity: "neutral", strength: 0.1, confidence: 0.9, title: `${externalFontDomains} fuente(s) servida(s) desde dominio externo`, value: externalFontDomains, rule: "Fuentes en dominios externos añaden una conexión (DNS+TCP+TLS) adicional, salvo que exista preconnect.", url }));
  }

  findings.push(finding({ id: "perf.fonts.preload", category: "fonts", metric: "fonts.preloadCount", unit: "count", status: "observed", severity: "opportunity", polarity: fonts.preloadedFonts.length > 0 ? "positive" : "neutral", strength: 0.05, confidence: 1, title: `${fonts.preloadedFonts.length} fuente(s) con preload declarado`, value: fonts.preloadedFonts.length, rule: "preload as=font adelanta la descarga de fuentes críticas.", url }));

  if (fonts.fontFaceCount > 0) {
    const missingDisplay = fonts.fontDisplayValues.filter((v) => !v).length;
    findings.push(finding({ id: "perf.fonts.fontDisplay", category: "fonts", metric: "fonts.missingFontDisplayCount", unit: "count", status: "observed", severity: missingDisplay > 0 ? "low" : "low", polarity: missingDisplay > 0 ? "negative" : "positive", strength: missingDisplay > 0 ? 0.15 : 0.05, confidence: 1, title: missingDisplay > 0 ? `${missingDisplay}/${fonts.fontFaceCount} regla(s) @font-face sin font-display` : "Todas las reglas @font-face declaran font-display", value: missingDisplay, rule: "font-display: swap (u otro valor explícito) evita texto invisible mientras carga la fuente (FOIT).", url }));
  }

  return findings;
}

// ---------------------------------------------------------------------
// I. SEÑALES MÓVILES
// ---------------------------------------------------------------------
function analyzeMobile(page) {
  const { url, body } = page;
  const findings = [];
  const viewport = hasViewportMeta(body);
  findings.push(finding({ id: "perf.mobile.viewport", category: "mobile", metric: "mobile.viewport", unit: "boolean", status: "observed", severity: viewport ? "low" : "critical", polarity: viewport ? "positive" : "negative", strength: viewport ? 0.1 : 0.8, confidence: 1, title: viewport ? "meta viewport presente" : "Sin meta viewport", value: viewport, rule: "Sin meta viewport, un navegador móvil renderiza la página como si fuera de escritorio (zoom-out), perjudicando UX y métricas de campo.", url }));

  const images = extractImagesForPerformance(body);
  const responsiveCount = images.filter((i) => i.hasSrcset || i.hasSizes).length;
  if (images.length > 0) {
    findings.push(finding({ id: "perf.mobile.responsiveImages", category: "mobile", metric: "mobile.responsiveImageRatio", unit: "ratio", status: "calculated", severity: responsiveCount === 0 && images.length > 3 ? "medium" : "opportunity", polarity: responsiveCount > 0 ? "positive" : "neutral", strength: responsiveCount === 0 && images.length > 3 ? 0.2 : 0, confidence: 0.8, title: `${responsiveCount}/${images.length} imagen(es) con srcset/sizes (adaptadas a móvil)`, value: Math.round((responsiveCount / images.length) * 100) / 100, rule: "Imágenes sin srcset/sizes fuerzan al móvil a descargar el mismo tamaño que a escritorio.", url }));
  }

  const fixedWidthMatches = body.match(/width\s*:\s*(\d{3,5})px/gi) || [];
  const largeFixedWidths = fixedWidthMatches.filter((m) => {
    const px = Number(m.match(/(\d+)/)[1]);
    return px > 600;
  });
  if (largeFixedWidths.length > 0) {
    findings.push(finding({ id: "perf.mobile.fixedWidthContent", category: "mobile", metric: "mobile.fixedWidthDeclarationCount", unit: "count", status: "estimated", severity: "low", polarity: "negative", strength: 0.15, confidence: 0.3, title: `${largeFixedWidths.length} declaración(es) de ancho fijo >600px detectada(s) en estilos`, value: largeFixedWidths.length, rule: "Heurística de baja confianza: un ancho fijo grande en CSS puede forzar scroll horizontal en móvil, pero puede estar dentro de un @media query que lo neutraliza (no verificable por regex).", url, limitations: ["Heurística de baja confianza: no evalúa @media queries que puedan anular el ancho fijo."] }));
  }

  return findings;
}

// ---------------------------------------------------------------------
// J. MÉTRICAS DERIVADAS (agregados, nunca LCP/CLS/INP/FCP)
// ---------------------------------------------------------------------
function analyzeDerivedMetrics(page, allFindings) {
  const { url } = page;
  const findings = [];

  const imageFindings = allFindings.filter((f) => f.category === "images");
  const missingDim = imageFindings.find((f) => f.id === "perf.images.missingDimensions");
  const lazy = imageFindings.find((f) => f.id === "perf.images.lazyLoading");
  const totalImages = imageFindings.find((f) => f.id === "perf.images.count");
  if (totalImages && totalImages.value > 0) {
    const withDim = totalImages.value - (missingDim?.value ?? 0);
    const coverage = Math.round(((withDim + (lazy?.value ?? 0)) / (totalImages.value * 2)) * 100) / 100;
    findings.push(finding({ id: "perf.derived.imageOptimizationCoverage", category: "derived", metric: "derived.imageOptimizationCoverage", unit: "ratio", status: "calculated", severity: "opportunity", polarity: "neutral", strength: 0, confidence: 0.7, title: `Cobertura de optimización de imágenes (dimensiones + lazy): ${Math.round(coverage * 100)}%`, value: coverage, rule: "Media de: proporción de imágenes con dimensiones declaradas + proporción con loading=lazy.", url }));
  }

  const cachingFindings = allFindings.filter((f) => f.category === "caching");
  const cacheSignals = cachingFindings.filter((f) => f.value !== null && f.value !== false).length;
  findings.push(finding({ id: "perf.derived.cachingCoverage", category: "derived", metric: "derived.cachingCoverage", unit: "ratio", status: "calculated", severity: "opportunity", polarity: "neutral", strength: 0, confidence: 0.7, title: `${cacheSignals}/${cachingFindings.length} señal(es) de caché presentes (Cache-Control/ETag/Expires/CDN)`, value: cachingFindings.length > 0 ? Math.round((cacheSignals / cachingFindings.length) * 100) / 100 : null, rule: "Proporción de señales de caché observadas presentes sobre el total comprobado.", url }));

  return findings;
}

/**
 * Analiza UNA página ya recopilada, produciendo hallazgos de las
 * categorías A-J. `page` tiene la forma expuesta por publicWebsiteFetcher
 * (Paso 13/16/18): {url, httpStatus, body, headers?, timing?,
 * httpVersion?, redirectChain?, byteSize?}.
 */
export function analyzePerformanceForPage(page, { profileId = null } = {}) {
  const rule = getPerfSectorRule(profileId);
  const base = [...analyzeResponse(page), ...analyzeHtmlDocument(page), ...analyzeResources(page), ...analyzeImages(page), ...analyzeJavaScript(page), ...analyzeCss(page), ...analyzeFonts(page), ...analyzeMobile(page)];
  const derived = analyzeDerivedMetrics(page, base);
  void rule;
  return [...base, ...derived];
}

export function analyzePerformanceForPages(pages, { profileId = null } = {}) {
  return pages.flatMap((p) => analyzePerformanceForPage(p, { profileId }));
}
