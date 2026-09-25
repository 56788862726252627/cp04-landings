// Paso 16 · Fase 3 — Análisis SEO determinista sobre HTML YA recopilado
// (por publicWebsiteFetcher, una fixture o un servidor local) — nunca
// descarga nada por su cuenta. Puro/determinista: mismo HTML -> mismos
// hallazgos, sin reloj ni aleatoriedad (el timestamp NO forma parte del
// hallazgo, ver seoEvidence.js).
//
// Cada `page` de entrada tiene la forma que expone publicWebsiteFetcher
// (Paso 16): { url, httpStatus, contentType, body, headers, robotsTxt,
// redirectChain }. `headers`/`robotsTxt` pueden faltar (fixtures que no
// los declaren) — todo lo que dependa de ellos se marca explícitamente
// "unavailable"/"unverified", nunca se infiere en su ausencia.
//
// NUNCA se calculan/inventan Core Web Vitals ni puntuaciones tipo
// Lighthouse — eso es explícitamente responsabilidad de otro proveedor
// (lighthouseProvider/performanceProvider/speedProvider, aún stub).

import {
  extractTitleText,
  extractMetaContent,
  extractMetaRobots,
  extractCanonicalUrl,
  extractHtmlLang,
  extractCharset,
  extractOpenGraphTags,
  extractTwitterCard,
  extractH1Texts,
  extractHeadingSequence,
  findHeadingLevelJumps,
  extractLinks,
  extractImages,
  extractJsonLdBlocks,
  extractMicrodataTypes,
  hasFaviconLink,
  extractHreflangs,
  extractPaginationLinks,
} from "./seoHtmlExtractors.js";
import { hasViewportMeta, hasManifestLink, wordCount, hasContactInfo, stripTags } from "../../htmlSignals.js";
import { getSeoSectorRule } from "./seoSectorRules.js";

export const SEO_CATEGORIES = Object.freeze(["indexation", "metadata", "structure", "links", "images", "structuredData", "content", "technical"]);

export const SEVERITIES = Object.freeze(["critical", "high", "medium", "low", "opportunity", "not_evaluable"]);

/** Vocabulario de disponibilidad del hallazgo (Fase 4 del enunciado). */
export const FINDING_STATUSES = Object.freeze(["observed", "calculated", "inferred", "unavailable", "unverified", "blocked", "fixture"]);

function finding({ id, category, dimension, status, severity, polarity = "neutral", strength = 0.5, confidence, title, observedValue = null, rule, url, limitations = [] }) {
  if (!SEO_CATEGORIES.includes(category)) throw new Error(`seoAnalyzer: categoría desconocida "${category}"`);
  if (!SEVERITIES.includes(severity)) throw new Error(`seoAnalyzer: severidad desconocida "${severity}"`);
  if (!FINDING_STATUSES.includes(status)) throw new Error(`seoAnalyzer: status desconocido "${status}"`);
  return Object.freeze({ id, category, dimension, status, severity, polarity, strength, confidence, title, observedValue, rule, url, limitations: Object.freeze([...limitations]) });
}

const NAP_ADDRESS_PATTERN = /\b(calle|avenida|av\.|c\/|paseo|plaza|carretera)\b[^.,\n]{3,60}/i;
const NAP_HOURS_PATTERN = /\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b[^.\n]{0,40}\d{1,2}[:h]\d{0,2}/i;
const FAQ_HEADING_PATTERN = /\b(preguntas frecuentes|faq|preguntas y respuestas)\b/i;

// ---------------------------------------------------------------------
// A. INDEXACIÓN
// ---------------------------------------------------------------------
function analyzeIndexation(page) {
  const findings = [];
  const { url, httpStatus, body, headers, robotsTxt } = page;

  findings.push(
    finding({
      id: "seo.indexation.httpStatus",
      category: "indexation",
      dimension: "seoTechnical",
      status: "observed",
      severity: httpStatus >= 400 ? "critical" : httpStatus >= 300 ? "medium" : "low",
      polarity: httpStatus >= 400 ? "negative" : httpStatus < 300 ? "positive" : "neutral",
      strength: httpStatus >= 400 ? 1 : 0.3,
      confidence: 1,
      title: `Página respondió HTTP ${httpStatus}`,
      observedValue: httpStatus,
      rule: "El status HTTP de la página determina si es indexable en absoluto.",
      url,
    })
  );

  const metaRobots = extractMetaRobots(body);
  const xRobotsTag = headers?.["x-robots-tag"] ?? null;
  const noindexSignals = [metaRobots, xRobotsTag].filter((v) => v && /noindex/i.test(v));
  const nofollowSignals = [metaRobots, xRobotsTag].filter((v) => v && /nofollow/i.test(v));
  if (metaRobots !== null) {
    const severity = noindexSignals.length > 0 ? "critical" : nofollowSignals.length > 0 ? "medium" : "low";
    const blocked = noindexSignals.length > 0 || nofollowSignals.length > 0;
    findings.push(
      finding({
        id: "seo.indexation.metaRobots",
        category: "indexation",
        dimension: "seoTechnical",
        status: "observed",
        severity,
        polarity: blocked ? "negative" : "positive",
        strength: noindexSignals.length > 0 ? 1 : nofollowSignals.length > 0 ? 0.5 : 0.3,
        confidence: 1,
        title: noindexSignals.length > 0 ? `<meta name="robots"> bloquea la indexación ("${metaRobots}")` : nofollowSignals.length > 0 ? `<meta name="robots"> impide seguir enlaces ("${metaRobots}")` : `<meta name="robots"> presente sin bloqueo ("${metaRobots}")`,
        observedValue: metaRobots,
        rule: "meta robots con noindex bloquea la indexación; con nofollow impide seguir los enlaces de la página (sin bloquear la indexación en sí).",
        url,
      })
    );
  }
  if (headers && "x-robots-tag" in headers) {
    findings.push(
      finding({
        id: "seo.indexation.xRobotsTag",
        category: "indexation",
        dimension: "seoTechnical",
        status: xRobotsTag ? "observed" : "observed",
        severity: xRobotsTag && /noindex/i.test(xRobotsTag) ? "critical" : "low",
        polarity: xRobotsTag && /noindex/i.test(xRobotsTag) ? "negative" : "neutral",
        strength: xRobotsTag && /noindex/i.test(xRobotsTag) ? 1 : 0.1,
        confidence: 1,
        title: xRobotsTag ? `Cabecera X-Robots-Tag: "${xRobotsTag}"` : "Sin cabecera X-Robots-Tag",
        observedValue: xRobotsTag,
        rule: "X-Robots-Tag tiene el mismo efecto que meta robots, a nivel HTTP.",
        url,
      })
    );
  } else {
    findings.push(
      finding({
        id: "seo.indexation.xRobotsTag",
        category: "indexation",
        dimension: "seoTechnical",
        status: "unavailable",
        severity: "not_evaluable",
        confidence: 0,
        title: "X-Robots-Tag no disponible en esta ejecución",
        rule: "X-Robots-Tag tiene el mismo efecto que meta robots, a nivel HTTP.",
        url,
        limitations: ["La fuente de esta página no expuso cabeceras HTTP (p. ej. una fixture sin `headers`)."],
      })
    );
  }

  const canonical = extractCanonicalUrl(body);
  if (canonical) {
    const selfReferencing = (() => {
      try {
        return new URL(canonical, url).toString() === url;
      } catch {
        return null;
      }
    })();
    findings.push(
      finding({
        id: "seo.indexation.canonical",
        category: "indexation",
        dimension: "seoTechnical",
        status: "observed",
        severity: selfReferencing === false ? "medium" : "low",
        polarity: "positive",
        strength: 0.4,
        confidence: 1,
        title: selfReferencing === false ? `Canonical apunta a otra URL ("${canonical}")` : "Canonical presente y autorreferenciado",
        observedValue: canonical,
        rule: "Un canonical presente evita contenido duplicado; si no es autorreferenciado, la URL declara explícitamente que no es la versión canónica.",
        url,
      })
    );
  } else {
    findings.push(
      finding({
        id: "seo.indexation.canonical",
        category: "indexation",
        dimension: "seoTechnical",
        status: "observed",
        severity: "medium",
        polarity: "negative",
        strength: 0.5,
        confidence: 0.8,
        title: "Sin <link rel=canonical>",
        observedValue: null,
        rule: "Ausencia de canonical: riesgo de contenido duplicado no declarado.",
        url,
      })
    );
  }

  if (robotsTxt && robotsTxt.available) {
    const hasSitemapDirective = /^sitemap:/im.test(robotsTxt.content);
    findings.push(
      finding({
        id: "seo.indexation.robotsTxt",
        category: "indexation",
        dimension: "seoTechnical",
        status: "observed",
        severity: "low",
        polarity: "positive",
        strength: 0.2,
        confidence: 1,
        title: "robots.txt disponible",
        observedValue: true,
        rule: "robots.txt accesible permite declarar reglas de rastreo explícitas.",
        url,
      })
    );
    findings.push(
      finding({
        id: "seo.indexation.sitemapDeclared",
        category: "indexation",
        dimension: "seoTechnical",
        status: "observed",
        severity: hasSitemapDirective ? "low" : "medium",
        polarity: hasSitemapDirective ? "positive" : "negative",
        strength: hasSitemapDirective ? 0.2 : 0.4,
        confidence: 0.9,
        title: hasSitemapDirective ? "Sitemap declarado en robots.txt" : "Sin directiva Sitemap en robots.txt",
        observedValue: hasSitemapDirective,
        rule: "Un sitemap declarado en robots.txt facilita el descubrimiento de URLs por los rastreadores. No se comprueba el contenido del sitemap (no se descarga aparte).",
        url,
        limitations: ["No se descarga ni valida el sitemap.xml en sí: solo se comprueba si robots.txt lo declara (evita una segunda petición fuera de publicWebsiteFetcher)."],
      })
    );
  } else {
    findings.push(
      finding({
        id: "seo.indexation.robotsTxt",
        category: "indexation",
        dimension: "seoTechnical",
        status: "observed",
        severity: "not_evaluable",
        polarity: "neutral",
        strength: 0,
        confidence: 0.6,
        title: "robots.txt no disponible (o no consultado)",
        observedValue: false,
        rule: "Sin robots.txt no se puede evaluar sitemap declarado ni reglas de rastreo explícitas.",
        url,
      })
    );
  }

  return findings;
}

// ---------------------------------------------------------------------
// B. METADATOS
// ---------------------------------------------------------------------
function analyzeMetadata(page) {
  const findings = [];
  const { url, body, headers } = page;

  const title = extractTitleText(body);
  if (title) {
    const len = title.length;
    const lenOk = len >= 15 && len <= 65;
    findings.push(
      finding({
        id: "seo.metadata.title",
        category: "metadata",
        dimension: "seoContent",
        status: "observed",
        severity: lenOk ? "low" : "medium",
        polarity: lenOk ? "positive" : "negative",
        strength: lenOk ? 0.3 : 0.5,
        confidence: 1,
        title: `<title> de ${len} caracteres: "${title}"`,
        observedValue: title,
        rule: "Un title de 15-65 caracteres se muestra completo en la mayoría de resultados de búsqueda.",
        url,
      })
    );
  } else {
    findings.push(
      finding({ id: "seo.metadata.title", category: "metadata", dimension: "seoContent", status: "observed", severity: "critical", polarity: "negative", strength: 1, confidence: 1, title: "Sin <title>", rule: "Toda página indexable necesita un <title>.", url })
    );
  }

  const description = extractMetaContent(body, "description");
  if (description) {
    const len = description.length;
    const lenOk = len >= 50 && len <= 160;
    findings.push(
      finding({
        id: "seo.metadata.description",
        category: "metadata",
        dimension: "seoContent",
        status: "observed",
        severity: lenOk ? "low" : "medium",
        polarity: lenOk ? "positive" : "negative",
        strength: lenOk ? 0.3 : 0.4,
        confidence: 1,
        title: `meta description de ${len} caracteres`,
        observedValue: description,
        rule: "Una description de 50-160 caracteres se muestra completa en la mayoría de resultados.",
        url,
      })
    );
  } else {
    findings.push({
      ...finding({ id: "seo.metadata.description", category: "metadata", dimension: "seoContent", status: "observed", severity: "high", polarity: "negative", strength: 0.7, confidence: 1, title: "Sin meta description", rule: "Sin description, el buscador genera un extracto automático, menos controlable.", url }),
    });
  }

  const lang = extractHtmlLang(body);
  findings.push(
    finding({
      id: "seo.metadata.lang",
      category: "metadata",
      dimension: "seoTechnical",
      status: "observed",
      severity: lang ? "low" : "medium",
      polarity: lang ? "positive" : "negative",
      strength: lang ? 0.2 : 0.3,
      confidence: 1,
      title: lang ? `<html lang="${lang}">` : "Sin atributo lang en <html>",
      observedValue: lang,
      rule: "El atributo lang ayuda a motores/lectores de pantalla a identificar el idioma.",
      url,
    })
  );

  const charset = extractCharset(body);
  findings.push(
    finding({
      id: "seo.metadata.charset",
      category: "metadata",
      dimension: "seoTechnical",
      status: "observed",
      severity: charset ? "low" : "medium",
      polarity: charset ? "positive" : "negative",
      strength: charset ? 0.1 : 0.2,
      confidence: 1,
      title: charset ? `Charset declarado: ${charset}` : "Sin charset declarado",
      observedValue: charset,
      rule: "Un charset explícito evita ambigüedad de codificación.",
      url,
    })
  );

  const viewport = hasViewportMeta(body);
  findings.push(
    finding({
      id: "seo.metadata.viewport",
      category: "metadata",
      dimension: "seoTechnical",
      status: "observed",
      severity: viewport ? "low" : "high",
      polarity: viewport ? "positive" : "negative",
      strength: viewport ? 0.2 : 0.6,
      confidence: 1,
      title: viewport ? "meta viewport presente" : "Sin meta viewport (riesgo de experiencia móvil deficiente)",
      observedValue: viewport,
      rule: "meta viewport es prácticamente obligatorio para una correcta indexación mobile-first.",
      url,
    })
  );

  const og = extractOpenGraphTags(body);
  const ogPresent = Object.values(og).some(Boolean);
  findings.push(
    finding({
      id: "seo.metadata.openGraph",
      category: "metadata",
      dimension: "seoContent",
      status: "observed",
      severity: ogPresent ? "low" : "opportunity",
      polarity: ogPresent ? "positive" : "neutral",
      strength: ogPresent ? 0.2 : 0.2,
      confidence: 0.9,
      title: ogPresent ? "Etiquetas Open Graph presentes" : "Sin etiquetas Open Graph",
      observedValue: og,
      rule: "Open Graph controla cómo se ve el enlace al compartirse en redes sociales.",
      url,
    })
  );

  const twitterCard = extractTwitterCard(body);
  findings.push(
    finding({
      id: "seo.metadata.twitterCard",
      category: "metadata",
      dimension: "seoContent",
      status: "observed",
      severity: twitterCard ? "low" : "opportunity",
      polarity: twitterCard ? "positive" : "neutral",
      strength: 0.1,
      confidence: 0.9,
      title: twitterCard ? `Twitter Card: ${twitterCard}` : "Sin Twitter Card",
      observedValue: twitterCard,
      rule: "Twitter Card controla la vista previa al compartir en X/Twitter.",
      url,
    })
  );

  void headers;
  return findings;
}

// ---------------------------------------------------------------------
// C. ESTRUCTURA
// ---------------------------------------------------------------------
function analyzeStructure(page) {
  const findings = [];
  const { url, body } = page;

  const h1s = extractH1Texts(body);
  findings.push(
    finding({
      id: "seo.structure.h1Count",
      category: "structure",
      dimension: "seoContent",
      status: "observed",
      severity: h1s.length === 1 ? "low" : h1s.length === 0 ? "high" : "medium",
      polarity: h1s.length === 1 ? "positive" : "negative",
      strength: h1s.length === 1 ? 0.2 : 0.5,
      confidence: 1,
      title: `${h1s.length} etiqueta(s) <h1>`,
      observedValue: h1s.length,
      rule: "Un único <h1> por página es la convención recomendada.",
      url,
    })
  );

  const sequence = extractHeadingSequence(body);
  const emptyHeadings = sequence.filter((h) => h.empty).length;
  if (emptyHeadings > 0) {
    findings.push(
      finding({
        id: "seo.structure.emptyHeadings",
        category: "structure",
        dimension: "seoContent",
        status: "observed",
        severity: "medium",
        polarity: "negative",
        strength: 0.3,
        confidence: 1,
        title: `${emptyHeadings} encabezado(s) vacío(s)`,
        observedValue: emptyHeadings,
        rule: "Un encabezado vacío no aporta contexto y confunde la jerarquía.",
        url,
      })
    );
  }

  const jumps = findHeadingLevelJumps(sequence);
  if (jumps.length > 0) {
    findings.push(
      finding({
        id: "seo.structure.headingJumps",
        category: "structure",
        dimension: "seoContent",
        status: "observed",
        severity: "low",
        polarity: "negative",
        strength: 0.2,
        confidence: 0.8,
        title: `${jumps.length} salto(s) de nivel de encabezado (p.ej. h${jumps[0].from}→h${jumps[0].to})`,
        observedValue: jumps,
        rule: "Saltar niveles (h2 directo a h4) rompe la jerarquía semántica del documento.",
        url,
      })
    );
  }

  const words = wordCount(body);
  findings.push(
    finding({
      id: "seo.structure.wordCount",
      category: "structure",
      dimension: "seoContent",
      status: "calculated",
      severity: "not_evaluable",
      polarity: "neutral",
      strength: 0,
      confidence: 1,
      title: `${words} palabra(s) de texto visible`,
      observedValue: words,
      rule: "Recuento base de palabras (se reutiliza en la evaluación de contenido escaso, categoría G).",
      url,
    })
  );

  const nav = /<nav\b/i.test(body) || /<header\b[\s\S]*<\/header>/i.test(body);
  findings.push(
    finding({
      id: "seo.structure.navigation",
      category: "structure",
      dimension: "seoContent",
      status: "observed",
      severity: nav ? "low" : "medium",
      polarity: nav ? "positive" : "negative",
      strength: nav ? 0.1 : 0.3,
      confidence: 0.8,
      title: nav ? "Navegación (<nav>/<header>) presente" : "Sin elemento de navegación identificable",
      observedValue: nav,
      rule: "La ausencia de navegación estructural dificulta el rastreo interno y la usabilidad.",
      url,
    })
  );

  return findings;
}

// ---------------------------------------------------------------------
// D. ENLACES
// ---------------------------------------------------------------------
function analyzeLinks(page, { allPages = [] } = {}) {
  const findings = [];
  const { url, body } = page;
  const links = extractLinks(body, url);

  const internal = links.filter((l) => l.isInternal === true).length;
  const external = links.filter((l) => l.isInternal === false).length;
  findings.push(
    finding({
      id: "seo.links.internalExternalCount",
      category: "links",
      dimension: "seoTechnical",
      status: "calculated",
      severity: "not_evaluable",
      polarity: "neutral",
      strength: 0,
      confidence: 1,
      title: `${internal} enlace(s) interno(s), ${external} externo(s)`,
      observedValue: { internal, external },
      rule: "Conteo base de enlaces por tipo.",
      url,
    })
  );

  const emptyLinks = links.filter((l) => l.isEmpty).length;
  if (emptyLinks > 0) {
    findings.push(
      finding({ id: "seo.links.emptyHref", category: "links", dimension: "seoTechnical", status: "observed", severity: "medium", polarity: "negative", strength: 0.3, confidence: 1, title: `${emptyLinks} enlace(s) con href vacío o "#"`, observedValue: emptyLinks, rule: "Un enlace sin destino real no aporta valor de rastreo ni de usuario.", url })
    );
  }

  const insecure = links.filter((l) => l.isInsecureScheme).length;
  if (insecure > 0) {
    findings.push(
      finding({ id: "seo.links.insecureScheme", category: "links", dimension: "seoTechnical", status: "observed", severity: "high", polarity: "negative", strength: 0.6, confidence: 1, title: `${insecure} enlace(s) con esquema inseguro (javascript:/data:)`, observedValue: insecure, rule: "javascript:/data: en href es una mala práctica de accesibilidad/seguridad y no es rastreable.", url })
    );
  }

  const genericAnchors = links.filter((l) => l.isGenericText).length;
  if (genericAnchors > 0) {
    findings.push(
      finding({ id: "seo.links.genericAnchorText", category: "links", dimension: "seoContent", status: "observed", severity: "low", polarity: "negative", strength: 0.2, confidence: 0.8, title: `${genericAnchors} enlace(s) con texto ancla genérico ("clic aquí"...)`, observedValue: genericAnchors, rule: "Un anchor text descriptivo aporta contexto semántico al rastreador y al usuario.", url })
    );
  }

  const relCounts = { nofollow: 0, sponsored: 0, ugc: 0 };
  for (const l of links) for (const r of l.rel) if (r in relCounts) relCounts[r]++;
  findings.push(
    finding({ id: "seo.links.relAttributes", category: "links", dimension: "seoTechnical", status: "observed", severity: "not_evaluable", polarity: "neutral", strength: 0, confidence: 1, title: `rel: nofollow=${relCounts.nofollow}, sponsored=${relCounts.sponsored}, ugc=${relCounts.ugc}`, observedValue: relCounts, rule: "Inventario de atributos rel usados en enlaces salientes.", url })
  );

  // Enlaces rotos: SOLO comprobables si apuntan a otra página YA recopilada en este mismo lote.
  const fetchedByUrl = new Map(allPages.map((p) => [p.url, p]));
  const fetchedFailuresByUrl = new Map((page.fetchFailures ?? []).map((f) => [f.url, f]));
  let verifiableBroken = 0;
  for (const l of links) {
    if (!l.resolved) continue;
    if (fetchedByUrl.has(l.resolved)) {
      const target = fetchedByUrl.get(l.resolved);
      if (target.httpStatus >= 400) verifiableBroken++;
    } else if (fetchedFailuresByUrl.has(l.resolved)) {
      verifiableBroken++;
    }
  }
  findings.push(
    finding({
      id: "seo.links.brokenVerified",
      category: "links",
      dimension: "seoTechnical",
      status: verifiableBroken > 0 ? "observed" : "unverified",
      severity: verifiableBroken > 0 ? "high" : "not_evaluable",
      polarity: verifiableBroken > 0 ? "negative" : "neutral",
      strength: verifiableBroken > 0 ? 0.6 : 0,
      confidence: verifiableBroken > 0 ? 1 : 0.3,
      title: verifiableBroken > 0 ? `${verifiableBroken} enlace(s) roto(s) confirmado(s) entre las páginas recopiladas` : "Enlaces rotos no comprobados (solo se verifica contra páginas ya recopiladas en el mismo lote)",
      observedValue: verifiableBroken,
      rule: "Un enlace solo se declara roto si apunta a otra URL YA recopilada en esta misma auditoría y esa página devolvió 4xx/5xx — nunca se afirma sin comprobación (evita una segunda descarga fuera de publicWebsiteFetcher).",
      url,
      limitations: verifiableBroken === 0 ? ["No se comprobaron enlaces hacia URLs fuera del lote recopilado en esta auditoría."] : [],
    })
  );

  return findings;
}

// ---------------------------------------------------------------------
// E. IMÁGENES
// ---------------------------------------------------------------------
function analyzeImages(page) {
  const findings = [];
  const { url, body } = page;
  const images = extractImages(body);

  findings.push(
    finding({ id: "seo.images.total", category: "images", dimension: "seoContent", status: "calculated", severity: "not_evaluable", polarity: "neutral", strength: 0, confidence: 1, title: `${images.length} imagen(es) en la página`, observedValue: images.length, rule: "Conteo base de imágenes.", url })
  );

  if (images.length > 0) {
    const withoutAlt = images.filter((i) => !i.hasAlt).length;
    const emptyAlt = images.filter((i) => i.altEmpty).length;
    findings.push(
      finding({
        id: "seo.images.missingAlt",
        category: "images",
        dimension: "seoContent",
        status: "observed",
        severity: withoutAlt > 0 ? "high" : "low",
        polarity: withoutAlt > 0 ? "negative" : "positive",
        strength: withoutAlt > 0 ? Math.min(1, withoutAlt / images.length) : 0.1,
        confidence: 1,
        title: withoutAlt > 0 ? `${withoutAlt}/${images.length} imagen(es) sin atributo alt` : "Todas las imágenes declaran atributo alt",
        observedValue: withoutAlt,
        rule: "El atributo alt es esencial para accesibilidad y para el contexto semántico de la imagen.",
        url,
      })
    );
    if (emptyAlt > 0) {
      findings.push(
        finding({ id: "seo.images.emptyAlt", category: "images", dimension: "seoContent", status: "observed", severity: "low", polarity: "negative", strength: 0.2, confidence: 1, title: `${emptyAlt} imagen(es) con alt="" (vacío, distinto de ausente)`, observedValue: emptyAlt, rule: "alt=\"\" es válido solo para imágenes puramente decorativas; en el resto es una oportunidad perdida.", url })
      );
    }
    const withDimensions = images.filter((i) => i.width && i.height).length;
    findings.push(
      finding({ id: "seo.images.dimensions", category: "images", dimension: "seoTechnical", status: "observed", severity: withDimensions === images.length ? "low" : "medium", polarity: withDimensions === images.length ? "positive" : "negative", strength: 0.2, confidence: 1, title: `${withDimensions}/${images.length} imagen(es) con width/height declarados`, observedValue: withDimensions, rule: "Declarar dimensiones evita layout shift (CLS) — sin medir el CLS real, que corresponde a un proveedor de rendimiento.", url })
    );
    const lazy = images.filter((i) => i.loadingLazy).length;
    findings.push(
      finding({ id: "seo.images.lazyLoading", category: "images", dimension: "seoTechnical", status: "observed", severity: "opportunity", polarity: lazy > 0 ? "positive" : "neutral", strength: 0.1, confidence: 1, title: `${lazy}/${images.length} imagen(es) con loading="lazy"`, observedValue: lazy, rule: "La carga diferida de imágenes fuera del viewport inicial es una buena práctica de rendimiento observable sin medir tiempos.", url })
    );
    findings.push(
      finding({
        id: "seo.images.heavyImages",
        category: "images",
        dimension: "seoTechnical",
        status: "unavailable",
        severity: "not_evaluable",
        confidence: 0,
        title: "Peso de imagen no evaluado (requeriría descargar cada imagen)",
        rule: "Solo se declararía un posible peso excesivo con el tamaño real en bytes; publicWebsiteFetcher no descarga recursos de imagen (solo el documento HTML), así que este dato nunca se infiere.",
        url,
        limitations: ["No se descargan imágenes individuales: sería una segunda descarga fuera de publicWebsiteFetcher, fuera del alcance de este proveedor."],
      })
    );
  }

  return findings;
}

// ---------------------------------------------------------------------
// F. DATOS ESTRUCTURADOS
// ---------------------------------------------------------------------
function analyzeStructuredData(page, { profileId } = {}) {
  const findings = [];
  const { url, body } = page;
  const rule = getSeoSectorRule(profileId);

  const jsonLdBlocks = extractJsonLdBlocks(body);
  const microdataTypes = extractMicrodataTypes(body);

  if (jsonLdBlocks.length === 0 && microdataTypes.length === 0) {
    findings.push(
      finding({ id: "seo.structuredData.presence", category: "structuredData", dimension: "seoTechnical", status: "observed", severity: "medium", polarity: "negative", strength: 0.4, confidence: 1, title: "Sin datos estructurados (JSON-LD ni microdata) detectados", observedValue: false, rule: "Los datos estructurados ayudan a los motores a entender el tipo de negocio/contenido.", url })
    );
    return findings;
  }

  const validBlocks = jsonLdBlocks.filter((b) => !b.parseError);
  const invalidBlocks = jsonLdBlocks.filter((b) => b.parseError);
  findings.push(
    finding({
      id: "seo.structuredData.jsonLdPresence",
      category: "structuredData",
      dimension: "seoTechnical",
      status: "observed",
      severity: "low",
      polarity: validBlocks.length > 0 ? "positive" : "neutral",
      strength: 0.3,
      confidence: 1,
      title: `${jsonLdBlocks.length} bloque(s) JSON-LD (${validBlocks.length} válido(s), ${invalidBlocks.length} con error de sintaxis)`,
      observedValue: { total: jsonLdBlocks.length, valid: validBlocks.length, invalid: invalidBlocks.length },
      rule: "JSON.parse sobre cada bloque <script type=application/ld+json> — un error de sintaxis básico invalida ese bloque completo para los rastreadores.",
      url,
    })
  );
  if (invalidBlocks.length > 0) {
    findings.push(
      finding({ id: "seo.structuredData.jsonLdSyntaxError", category: "structuredData", dimension: "seoTechnical", status: "observed", severity: "high", polarity: "negative", strength: 0.6, confidence: 1, title: `${invalidBlocks.length} bloque(s) JSON-LD con error de sintaxis`, observedValue: invalidBlocks.map((b) => b.parseError), rule: "Un JSON-LD con error de sintaxis no se procesa en absoluto — se descarta silenciosamente.", url })
    );
  }

  const detectedTypes = [...new Set([...jsonLdBlocks.flatMap((b) => b.types), ...microdataTypes])];
  const matchesProfile = detectedTypes.some((t) => rule.expectedSchemaTypes.includes(t));
  findings.push(
    finding({
      id: "seo.structuredData.profileFit",
      category: "structuredData",
      dimension: "seoLocal",
      status: "inferred",
      severity: matchesProfile ? "low" : "opportunity",
      polarity: matchesProfile ? "positive" : "neutral",
      strength: matchesProfile ? 0.3 : 0.2,
      confidence: 0.6,
      title: matchesProfile ? `Tipo(s) Schema.org detectado(s) coherente(s) con el perfil "${rule.profileId}"` : `Ningún tipo detectado coincide con los esperados para "${rule.profileId}" (${rule.expectedSchemaTypes.join(", ")})`,
      observedValue: detectedTypes,
      rule: "Adecuación PRELIMINAR y heurística entre los tipos detectados y los esperados por sector — nunca es una validación oficial de Google (no se ejecuta el Rich Results Test).",
      url,
      limitations: ["No sustituye ninguna validación oficial (Google Rich Results Test / schema.org validator): es una heurística de coincidencia de tipos, declarada explícitamente como tal."],
    })
  );

  return findings;
}

// ---------------------------------------------------------------------
// G. CONTENIDO
// ---------------------------------------------------------------------
function analyzeContent(page, { profileId, allPages = [] } = {}) {
  const findings = [];
  const { url, body } = page;
  const rule = getSeoSectorRule(profileId);
  const words = wordCount(body);

  findings.push(
    finding({
      id: "seo.content.thinContent",
      category: "content",
      dimension: "seoContent",
      status: "calculated",
      severity: words < rule.thinContentWordThreshold ? "high" : "low",
      polarity: words < rule.thinContentWordThreshold ? "negative" : "positive",
      strength: words < rule.thinContentWordThreshold ? 0.6 : 0.2,
      confidence: 0.9,
      title: words < rule.thinContentWordThreshold ? `Contenido escaso: ${words} palabras (umbral del perfil: ${rule.thinContentWordThreshold})` : `Volumen de contenido adecuado: ${words} palabras`,
      observedValue: words,
      rule: `Umbral de contenido escaso configurado por perfil sectorial ("${rule.profileId}": ${rule.thinContentWordThreshold} palabras).`,
      url,
    })
  );

  const contactInfo = hasContactInfo(body);
  findings.push(
    finding({ id: "seo.content.contactInfo", category: "content", dimension: "seoLocal", status: "observed", severity: contactInfo ? "low" : "high", polarity: contactInfo ? "positive" : "negative", strength: contactInfo ? 0.2 : 0.6, confidence: 0.8, title: contactInfo ? "Información de contacto (teléfono/email) detectada" : "Sin información de contacto detectable", observedValue: contactInfo, rule: "Detección heurística de patrones de teléfono/email en el texto visible.", url })
  );

  const text = stripTags(body);
  const hasAddress = NAP_ADDRESS_PATTERN.test(text);
  const hasHours = NAP_HOURS_PATTERN.test(text);
  if (rule.requiresNAP) {
    findings.push(
      finding({ id: "seo.content.address", category: "content", dimension: "seoLocal", status: hasAddress ? "observed" : "inferred", severity: hasAddress ? "low" : "medium", polarity: hasAddress ? "positive" : "negative", strength: hasAddress ? 0.2 : 0.4, confidence: hasAddress ? 0.7 : 0.5, title: hasAddress ? "Patrón de dirección postal detectado" : "Sin patrón de dirección postal detectable", observedValue: hasAddress, rule: "Detección heurística de patrones de vía/calle en el texto visible (falso negativo posible con formatos atípicos).", url })
    );
    findings.push(
      finding({ id: "seo.content.hours", category: "content", dimension: "seoLocal", status: hasHours ? "observed" : "inferred", severity: hasHours ? "low" : "medium", polarity: hasHours ? "positive" : "negative", strength: hasHours ? 0.2 : 0.3, confidence: hasHours ? 0.7 : 0.5, title: hasHours ? "Patrón de horario detectado" : "Sin patrón de horario detectable", observedValue: hasHours, rule: "Detección heurística de día de la semana + hora en el texto visible.", url })
    );
  }

  const faq = FAQ_HEADING_PATTERN.test(text);
  findings.push(
    finding({ id: "seo.content.faq", category: "content", dimension: "seoContent", status: "observed", severity: "opportunity", polarity: faq ? "positive" : "neutral", strength: 0.1, confidence: 0.7, title: faq ? "Sección de preguntas frecuentes detectada" : "Sin sección de preguntas frecuentes detectada", observedValue: faq, rule: "Una sección FAQ (idealmente con schema FAQPage) es una oportunidad habitual de SEO de contenido.", url })
  );

  const keywordHits = rule.relevantContentKeywords.filter((kw) => text.toLowerCase().includes(kw.toLowerCase()));
  findings.push(
    finding({
      id: "seo.content.profileRelevantKeywords",
      category: "content",
      dimension: "seoContent",
      status: "observed",
      severity: keywordHits.length === 0 ? "medium" : "low",
      polarity: keywordHits.length > 0 ? "positive" : "negative",
      strength: keywordHits.length > 0 ? 0.2 : 0.3,
      confidence: 0.6,
      title: `${keywordHits.length}/${rule.relevantContentKeywords.length} palabra(s) clave relevante(s) del perfil "${rule.profileId}" presentes`,
      observedValue: keywordHits,
      rule: `Lista de palabras clave configurada por perfil sectorial (ver providers/seo/seoSectorRules.js).`,
      url,
    })
  );

  // Duplicación SOLO entre páginas del mismo lote recopilado.
  const otherPages = allPages.filter((p) => p.url !== url);
  const thisNormalized = stripTags(body).toLowerCase();
  const duplicateOf = otherPages.find((p) => stripTags(p.body).toLowerCase() === thisNormalized && thisNormalized.length > 0);
  if (otherPages.length > 0) {
    findings.push(
      finding({
        id: "seo.content.duplicateContent",
        category: "content",
        dimension: "seoContent",
        status: "observed",
        severity: duplicateOf ? "high" : "low",
        polarity: duplicateOf ? "negative" : "positive",
        strength: duplicateOf ? 0.6 : 0.1,
        confidence: duplicateOf ? 1 : 0.6,
        title: duplicateOf ? `Contenido idéntico al de "${duplicateOf.url}" (mismo lote)` : "Sin duplicación detectada entre las páginas recopiladas",
        observedValue: Boolean(duplicateOf),
        rule: "Comparación SOLO entre páginas recopiladas en esta misma auditoría (nunca contra el resto de Internet).",
        url,
      })
    );
  }

  return findings;
}

// ---------------------------------------------------------------------
// H. SEO TÉCNICO BÁSICO
// ---------------------------------------------------------------------
function analyzeTechnical(page, { allPages = [] } = {}) {
  const findings = [];
  const { url, body, redirectChain } = page;
  const parsed = new URL(url);

  const isHttps = parsed.protocol === "https:";
  findings.push(
    finding({ id: "seo.technical.https", category: "technical", dimension: "seoTechnical", status: "observed", severity: isHttps ? "low" : "critical", polarity: isHttps ? "positive" : "negative", strength: isHttps ? 0.1 : 1, confidence: 1, title: isHttps ? "Servida sobre HTTPS" : "Servida sobre HTTP (sin cifrar)", observedValue: isHttps, rule: "HTTPS es un requisito básico de seguridad y un factor de posicionamiento declarado por los principales motores.", url })
  );

  const httpToHttpsRedirect = (redirectChain ?? []).some((r) => r.from.startsWith("http://") && r.to.startsWith("https://"));
  if ((redirectChain ?? []).length > 0) {
    findings.push(
      finding({ id: "seo.technical.httpsRedirect", category: "technical", dimension: "seoTechnical", status: "observed", severity: httpToHttpsRedirect ? "low" : "not_evaluable", polarity: httpToHttpsRedirect ? "positive" : "neutral", strength: httpToHttpsRedirect ? 0.1 : 0, confidence: 1, title: httpToHttpsRedirect ? "Redirección HTTP→HTTPS confirmada en esta petición" : "Sin redirección HTTP→HTTPS observada en esta petición", observedValue: httpToHttpsRedirect, rule: "Solo se afirma si la propia cadena de redirecciones de esta petición lo demuestra.", url })
    );
  }

  const hasParams = parsed.search.length > 0;
  const favicon = hasFaviconLink(body);
  const manifest = hasManifestLink(body);
  const hreflangs = extractHreflangs(body);
  const pagination = extractPaginationLinks(body);

  findings.push(
    finding({ id: "seo.technical.urlParams", category: "technical", dimension: "seoTechnical", status: "observed", severity: "opportunity", polarity: hasParams ? "neutral" : "positive", strength: 0.1, confidence: 1, title: hasParams ? `URL con parámetros: "${parsed.search}"` : "URL sin parámetros de consulta", observedValue: parsed.search || null, rule: "URLs limpias (sin parámetros) suelen ser más legibles; no es un factor crítico por sí solo.", url })
  );
  findings.push(
    finding({ id: "seo.technical.favicon", category: "technical", dimension: "seoTechnical", status: "observed", severity: favicon ? "low" : "low", polarity: favicon ? "positive" : "negative", strength: 0.1, confidence: 1, title: favicon ? "Favicon declarado" : "Sin favicon declarado", observedValue: favicon, rule: "Un favicon ausente es una señal menor de descuido técnico.", url })
  );
  findings.push(
    finding({ id: "seo.technical.manifest", category: "technical", dimension: "seoTechnical", status: "observed", severity: "opportunity", polarity: manifest ? "positive" : "neutral", strength: 0.1, confidence: 1, title: manifest ? "Web App Manifest declarado" : "Sin Web App Manifest", observedValue: manifest, rule: "Un manifest es requisito para capacidades tipo PWA (evaluado con detalle en dimensión pwaApp, fuera de este proveedor).", url })
  );
  if (hreflangs.length > 0) {
    findings.push(
      finding({ id: "seo.technical.hreflang", category: "technical", dimension: "seoTechnical", status: "observed", severity: "low", polarity: "positive", strength: 0.2, confidence: 1, title: `${hreflangs.length} etiqueta(s) hreflang declarada(s) (${hreflangs.map((h) => h.hreflang).join(", ")})`, observedValue: hreflangs, rule: "hreflang declara variantes de idioma/región de la misma página.", url })
    );
  }
  if (pagination.hasNext || pagination.hasPrev) {
    findings.push(
      finding({ id: "seo.technical.pagination", category: "technical", dimension: "seoTechnical", status: "observed", severity: "opportunity", polarity: "positive", strength: 0.1, confidence: 1, title: `Enlaces de paginación: next=${pagination.hasNext}, prev=${pagination.hasPrev}`, observedValue: pagination, rule: "rel=next/prev declara relación de paginación entre páginas.", url })
    );
  }

  // Profundidad SOLO dentro del conjunto recopilado: distancia (en segmentos de path) respecto a la URL con el path más corto del lote.
  if (allPages.length > 1) {
    const shortestPath = Math.min(...allPages.map((p) => new URL(p.url).pathname.split("/").filter(Boolean).length));
    const thisDepth = parsed.pathname.split("/").filter(Boolean).length;
    findings.push(
      finding({
        id: "seo.technical.depthWithinBatch",
        category: "technical",
        dimension: "seoTechnical",
        status: "calculated",
        severity: "not_evaluable",
        polarity: "neutral",
        strength: 0,
        confidence: 0.7,
        title: `Profundidad relativa dentro del lote recopilado: ${thisDepth - shortestPath} nivel(es) sobre la URL más superficial del lote`,
        observedValue: thisDepth - shortestPath,
        rule: "Profundidad SOLO relativa a las URLs recopiladas en esta misma auditoría — no es la profundidad real del sitio completo (no se rastrea el sitio entero).",
        url,
        limitations: ["No representa la arquitectura completa del sitio, solo el subconjunto de páginas efectivamente auditadas."],
      })
    );
  }

  return findings;
}

/**
 * Analiza UNA página ya recopilada, produciendo hallazgos de las 8
 * categorías A-H. `allPages` (opcional) permite las comprobaciones que
 * solo tienen sentido entre páginas del MISMO lote (duplicados, enlaces
 * rotos verificables, profundidad relativa).
 * @param {{url:string, httpStatus:number, body:string, headers?:object, robotsTxt?:object, redirectChain?:object[]}} page
 * @param {{profileId?: string|null, allPages?: object[]}} options
 */
export function analyzeSeoForPage(page, { profileId = null, allPages = [] } = {}) {
  return [
    ...analyzeIndexation(page),
    ...analyzeMetadata(page),
    ...analyzeStructure(page),
    ...analyzeLinks(page, { allPages }),
    ...analyzeImages(page),
    ...analyzeStructuredData(page, { profileId }),
    ...analyzeContent(page, { profileId, allPages }),
    ...analyzeTechnical(page, { allPages }),
  ];
}

/** Comprobación multi-página adicional: titles duplicados entre páginas del lote. */
export function analyzeTitleDuplication(pages) {
  if (pages.length < 2) return [];
  const findings = [];
  const byTitle = new Map();
  for (const p of pages) {
    const title = extractTitleText(p.body);
    if (!title) continue;
    const list = byTitle.get(title) ?? [];
    list.push(p.url);
    byTitle.set(title, list);
  }
  for (const [title, urls] of byTitle) {
    if (urls.length > 1) {
      findings.push(
        finding({
          id: "seo.metadata.duplicateTitle",
          category: "metadata",
          dimension: "seoContent",
          status: "observed",
          severity: "high",
          polarity: "negative",
          strength: 0.6,
          confidence: 1,
          title: `Title duplicado en ${urls.length} páginas: "${title}"`,
          observedValue: urls,
          rule: "El mismo <title> en varias páginas dificulta que el buscador las distinga.",
          url: urls[0],
        })
      );
    }
  }
  return findings;
}

/**
 * Analiza un lote completo de páginas ya recopiladas (misma auditoría),
 * incluyendo las comprobaciones cross-page.
 */
export function analyzeSeoForPages(pages, { profileId = null } = {}) {
  const perPage = pages.flatMap((p) => analyzeSeoForPage(p, { profileId, allPages: pages }));
  const crossPage = analyzeTitleDuplication(pages);
  return [...perPage, ...crossPage];
}
