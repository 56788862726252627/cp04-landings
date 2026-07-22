// Paso 12 · Fase 6 — Source Adapters (offline, funcionales).
//
// Cada adaptador implementa el MISMO contrato (name/version/capabilities/
// limits/timeout/retryPolicy/rateLimit/collect/healthCheck), igual que
// adapters/providerAdapters.js (Paso 09) y aiProviderContract.js (Paso 11).
// Todos son 100% offline y deterministas: ninguno abre un socket. Los
// datos "mock" (maps/social/reviews/performance/accessibility/seo/tech)
// se leen de un objeto de fixture ya en memoria (ver fixtures/*.js), nunca
// de una API real.

import { readFile } from "node:fs/promises";

import { createEvidence } from "./evidenceSchema.js";
import { resolveSafeLocalPath } from "./urlSafety.js";
import * as html from "./htmlSignals.js";

export class SourceAdapterError extends Error {}

function defineSourceAdapter({ id, version = 1, capabilities, inputSchema, outputSchema, limits, collect }) {
  return Object.freeze({
    id,
    version,
    capabilities: Object.freeze([...capabilities]),
    inputSchema,
    outputSchema,
    limits: Object.freeze({ timeoutMs: 3000, retryPolicy: { maxRetries: 0 }, rateLimitPerMinute: 60, ...limits }),
    provenance: `offline-adapter:${id}`,
    async healthCheck() {
      return { adapterId: id, healthy: true, mode: "offline", message: "adaptador offline, sin dependencias externas" };
    },
    collect,
  });
}

function evidenceFrom(sourceId, sourceType, relatedDimension, { title, excerpt, polarity, strength = 0.8, confidence = 0.7, classification = "confirmed", limitations = [] }) {
  return createEvidence({
    sourceId,
    sourceType,
    title,
    excerpt,
    normalizedContent: excerpt,
    classification,
    relatedDimension,
    signal: { strength, polarity },
    confidence,
    provenance: `${sourceType}:${sourceId}`,
    limitations,
  });
}

/** Deriva evidencia estructural a partir del texto HTML de una página (fixture o snapshot local). */
export function evidenceFromHtmlText(sourceId, htmlText) {
  const list = [];
  const push = (relatedDimension, args) => list.push(evidenceFrom(sourceId, "local_html", relatedDimension, args));

  push("mobileExperience", html.hasViewportMeta(htmlText)
    ? { title: "Meta viewport presente", excerpt: "La página declara <meta name=viewport>, adaptándose a pantallas móviles.", polarity: "positive" }
    : { title: "Sin meta viewport", excerpt: "No se encontró <meta name=viewport>: la experiencia móvil probablemente no es responsive.", polarity: "negative" });

  push("pwaApp", html.hasManifestLink(htmlText)
    ? { title: "Manifest PWA enlazado", excerpt: "La página enlaza un manifest.json (candidata a PWA instalable).", polarity: "positive", strength: 0.7 }
    : { title: "Sin manifest PWA", excerpt: "No se detecta <link rel=manifest>: no es instalable como PWA hoy.", polarity: "negative", strength: 0.5, confidence: 0.5 });

  const jsonLd = html.hasJsonLd(htmlText);
  const canonical = html.hasCanonicalLink(htmlText);
  push("seoTechnical", jsonLd && canonical
    ? { title: "Datos estructurados y canonical presentes", excerpt: "La página incluye JSON-LD y <link rel=canonical>.", polarity: "positive" }
    : { title: "SEO técnico básico incompleto", excerpt: `JSON-LD: ${jsonLd ? "sí" : "no"}; canonical: ${canonical ? "sí" : "no"}.`, polarity: "negative", strength: 0.6 });

  const titleLen = html.getTitleLength(htmlText);
  const descLen = html.getMetaDescriptionLength(htmlText);
  push("seoContent", titleLen >= 15 && titleLen <= 65 && descLen >= 50
    ? { title: "Título y meta descripción con longitud adecuada", excerpt: `Título: ${titleLen} caracteres; descripción: ${descLen} caracteres.`, polarity: "positive", strength: 0.6 }
    : { title: "Título o meta descripción deficientes", excerpt: `Título: ${titleLen} caracteres; descripción: ${descLen} caracteres (recomendado título 15-65, descripción ≥50).`, polarity: "negative", strength: 0.6 });

  const headings = html.countHeadings(htmlText);
  const words = html.wordCount(htmlText);
  push("contentQuality", headings >= 2 && words >= 40
    ? { title: "Contenido estructurado con jerarquía de encabezados", excerpt: `${headings} encabezado(s) h1-h3, ${words} palabras de contenido visible.`, polarity: "positive", strength: 0.5 }
    : { title: "Contenido escaso o sin jerarquía", excerpt: `${headings} encabezado(s), ${words} palabras.`, polarity: "negative", strength: 0.5 });

  const altCoverage = html.altAttributeCoverage(htmlText);
  const ariaCount = html.ariaAttributeCount(htmlText);
  if (altCoverage !== null) {
    push("accessibility", altCoverage >= 0.8
      ? { title: "Buena cobertura de texto alternativo", excerpt: `${Math.round(altCoverage * 100)}% de imágenes con atributo alt.`, polarity: "positive" }
      : { title: "Cobertura de texto alternativo insuficiente", excerpt: `Solo ${Math.round(altCoverage * 100)}% de imágenes con atributo alt.`, polarity: "negative" });
  } else if (ariaCount === 0) {
    push("accessibility", { title: "Sin señales de accesibilidad detectadas", excerpt: "No se encontraron imágenes con alt ni atributos aria-*.", polarity: "negative", strength: 0.4, confidence: 0.4, classification: "inferred" });
  }

  push("bookingCapability", html.hasBookingSignal(htmlText)
    ? { title: "Señal de reserva/cita detectada", excerpt: "La página contiene un formulario o texto de reserva/cita.", polarity: "positive" }
    : { title: "Sin señal de reserva/cita online", excerpt: "No se detectó formulario ni texto de reserva/cita en la página.", polarity: "negative" });

  push("contactInfo", html.hasContactInfo(htmlText)
    ? { title: "Datos de contacto visibles", excerpt: "Se detectó teléfono o email en el texto visible.", polarity: "positive" }
    : { title: "Sin datos de contacto visibles", excerpt: "No se detectó teléfono ni email en el texto visible.", polarity: "negative" });

  const socialLinks = html.extractSocialLinks(htmlText);
  push("socialMediaPresence", socialLinks.length > 0
    ? { title: "Enlaces a redes sociales", excerpt: `Enlaza: ${socialLinks.join(", ")}.`, polarity: "positive", strength: Math.min(1, socialLinks.length / 3) }
    : { title: "Sin enlaces a redes sociales", excerpt: "La página no enlaza ningún perfil social.", polarity: "negative", strength: 0.5, confidence: 0.5 });

  push("observableSecurity", html.hasMixedContentLinks(htmlText)
    ? { title: "Contenido mixto detectado", excerpt: "La página enlaza recursos http:// no seguros.", polarity: "negative" }
    : { title: "Sin enlaces http:// inseguros detectados", excerpt: "No se detectó contenido mixto en los enlaces analizados.", polarity: "positive", strength: 0.5, confidence: 0.5 });

  push("visiblePrivacy", html.hasPrivacyPolicyLink(htmlText)
    ? { title: "Enlace a política de privacidad", excerpt: "La página enlaza un aviso de privacidad.", polarity: "positive" }
    : { title: "Sin enlace visible a política de privacidad", excerpt: "No se encontró un enlace a política de privacidad o aviso legal.", polarity: "negative" });

  push("visibleCompliance", html.hasCookieConsentBanner(htmlText)
    ? { title: "Aviso de cookies presente", excerpt: "Se detectó un banner o texto de consentimiento de cookies.", polarity: "positive", strength: 0.6 }
    : { title: "Sin aviso de cookies detectado", excerpt: "No se detectó banner de consentimiento de cookies.", polarity: "negative", strength: 0.6, confidence: 0.5, classification: "inferred" });

  const analyticsMarkers = html.detectAnalyticsMarkers(htmlText);
  const chatMarkers = html.detectChatWidgetMarkers(htmlText);
  push("analyticsDeclared", analyticsMarkers.length > 0
    ? { title: "Analítica detectada", excerpt: `Marcadores: ${analyticsMarkers.join(", ")}.`, polarity: "positive", strength: 0.6 }
    : { title: "Sin analítica detectada", excerpt: "No se detectaron marcadores de analítica habituales.", polarity: "negative", strength: 0.4, confidence: 0.4, classification: "inferred" });

  push("observableAutomation", chatMarkers.length > 0
    ? { title: "Widget de chat/mensajería detectado", excerpt: `Marcadores: ${chatMarkers.join(", ")}.`, polarity: "positive", strength: 0.6 }
    : { title: "Sin widget de chat/mensajería detectado", excerpt: "No se detectó chat en vivo ni enlace directo a WhatsApp.", polarity: "negative", strength: 0.4, confidence: 0.4, classification: "inferred" });

  const ctaCount = html.countCtaKeywords(htmlText);
  push("ctaQuality", ctaCount >= 1
    ? { title: "Llamadas a la acción presentes", excerpt: `${ctaCount} frase(s) de CTA reconocidas.`, polarity: "positive", strength: Math.min(1, ctaCount / 3) }
    : { title: "Sin llamadas a la acción claras", excerpt: "No se detectaron frases de CTA reconocidas.", polarity: "negative" });

  push("navigation", html.hasNavElement(htmlText)
    ? { title: "Navegación estructurada", excerpt: "La página tiene <nav> o <header> con enlaces.", polarity: "positive", strength: 0.6 }
    : { title: "Navegación no estructurada", excerpt: "No se detectó <nav> ni <header> con enlaces.", polarity: "negative", strength: 0.6 });

  push("multilanguage", html.hasHreflangOrLanguageSwitcher(htmlText)
    ? { title: "Señal de multidioma", excerpt: "Se detectó hreflang o selector de idioma.", polarity: "positive", strength: 0.5 }
    : { title: "Sin señal de multidioma", excerpt: "No se detectó hreflang ni selector de idioma.", polarity: "neutral", strength: 0.3, confidence: 0.3, classification: "unknown" });

  const requiredFields = html.countRequiredFormFields(htmlText);
  push("friction", requiredFields > 0 && requiredFields <= 4
    ? { title: "Formulario con pocos campos obligatorios", excerpt: `${requiredFields} campo(s) obligatorio(s).`, polarity: "positive", strength: 0.5 }
    : requiredFields > 4
    ? { title: "Formulario con muchos campos obligatorios", excerpt: `${requiredFields} campos obligatorios: puede generar fricción.`, polarity: "negative", strength: 0.5 }
    : { title: "Sin formulario detectado para medir fricción", excerpt: "No se detectó un formulario con campos obligatorios.", polarity: "neutral", strength: 0.3, confidence: 0.3, classification: "unknown" });

  const hexColors = html.extractHexColors(htmlText);
  push("visualConsistency", hexColors.length > 0 && hexColors.length <= 4
    ? { title: "Paleta de color acotada", excerpt: `${hexColors.length} color(es) hex detectados: ${hexColors.join(", ")}.`, polarity: "positive", strength: 0.5 }
    : hexColors.length > 4
    ? { title: "Paleta de color dispersa", excerpt: `${hexColors.length} colores hex distintos detectados: posible inconsistencia de marca.`, polarity: "negative", strength: 0.6 }
    : { title: "Sin colores de marca detectables", excerpt: "No se detectaron colores hex en el HTML.", polarity: "neutral", strength: 0.3, confidence: 0.3, classification: "unknown" });

  push("identity", titleLen > 0
    ? { title: "La página declara un título", excerpt: `<title> presente (${titleLen} caracteres).`, polarity: titleLen >= 15 ? "positive" : "negative", strength: 0.5 }
    : { title: "Sin <title>", excerpt: "La página no declara <title>.", polarity: "negative", strength: 0.7 });

  return list;
}

export const LOCAL_HTML_ADAPTER = defineSourceAdapter({
  id: "local_html",
  capabilities: ["mobileExperience", "pwaApp", "seoTechnical", "seoContent", "accessibility", "bookingCapability", "contactInfo", "socialMediaPresence", "observableSecurity", "visiblePrivacy", "visibleCompliance", "analyticsDeclared", "observableAutomation", "ctaQuality", "navigation", "multilanguage", "friction", "visualConsistency", "identity", "contentQuality"],
  inputSchema: "{ sourceId: string, filePath: string, baseDir: string }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, filePath, baseDir }) {
    const resolved = resolveSafeLocalPath(baseDir, filePath);
    if (!resolved.safe) throw new SourceAdapterError(`ruta insegura para local_html: ${resolved.reason}`);
    const htmlText = await readFile(resolved.resolvedPath, "utf8");
    return evidenceFromHtmlText(sourceId, htmlText);
  },
});

export const LOCAL_JSON_ADAPTER = defineSourceAdapter({
  id: "local_json",
  capabilities: ["*"],
  inputSchema: "{ sourceId: string, filePath: string, baseDir: string }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, filePath, baseDir }) {
    const resolved = resolveSafeLocalPath(baseDir, filePath);
    if (!resolved.safe) throw new SourceAdapterError(`ruta insegura para local_json: ${resolved.reason}`);
    const raw = await readFile(resolved.resolvedPath, "utf8");
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      throw new SourceAdapterError(`local_json: JSON inválido en "${filePath}": ${err.message}`);
    }
    const entries = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.evidence) ? parsed.evidence : [];
    return entries.map((entry) =>
      evidenceFrom(sourceId, "local_json", entry.relatedDimension, {
        title: entry.title,
        excerpt: entry.excerpt,
        polarity: entry.polarity ?? "neutral",
        strength: entry.strength ?? 0.5,
        confidence: entry.confidence ?? 0.5,
        classification: entry.classification ?? "confirmed",
      })
    );
  },
});

export const LOCAL_MARKDOWN_ADAPTER = defineSourceAdapter({
  id: "local_markdown",
  capabilities: ["contentQuality", "serviceClarity"],
  inputSchema: "{ sourceId: string, filePath: string, baseDir: string }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, filePath, baseDir }) {
    const resolved = resolveSafeLocalPath(baseDir, filePath);
    if (!resolved.safe) throw new SourceAdapterError(`ruta insegura para local_markdown: ${resolved.reason}`);
    const text = await readFile(resolved.resolvedPath, "utf8");
    const headings = (text.match(/^#{1,3} .+$/gm) || []).length;
    const words = text.split(/\s+/).filter(Boolean).length;
    const list = [];
    list.push(
      evidenceFrom(sourceId, "local_markdown", "contentQuality", headings >= 2 && words >= 40
        ? { title: "Documento con estructura y contenido suficiente", excerpt: `${headings} encabezado(s), ${words} palabras.`, polarity: "positive", strength: 0.5 }
        : { title: "Documento escaso", excerpt: `${headings} encabezado(s), ${words} palabras.`, polarity: "negative", strength: 0.5 })
    );
    list.push(
      evidenceFrom(sourceId, "local_markdown", "serviceClarity", /\b(servicio|servicios|tratamiento|especialidad)\b/i.test(text)
        ? { title: "El documento describe servicios", excerpt: "Se mencionan servicios/tratamientos/especialidades explícitamente.", polarity: "positive", strength: 0.5 }
        : { title: "El documento no describe servicios claramente", excerpt: "No se detectaron menciones explícitas de servicios.", polarity: "negative", strength: 0.4, confidence: 0.4, classification: "inferred" })
    );
    return list;
  },
});

export const FIXTURE_WEBSITE_ADAPTER = defineSourceAdapter({
  id: "fixture_website",
  capabilities: ["*"],
  inputSchema: "{ sourceId: string, htmlText: string }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, htmlText }) {
    return evidenceFromHtmlText(sourceId, htmlText).map((e) => ({ ...e, sourceType: "fixture_website" }));
  },
});

export const MOCK_DIRECTORY_ADAPTER = defineSourceAdapter({
  id: "mock_directory",
  capabilities: ["directoryPresence"],
  inputSchema: "{ sourceId: string, listings: {name: string, category: string}[], businessListed: boolean }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, listings = [], businessListed }) {
    return [
      evidenceFrom(sourceId, "mock_directory", "directoryPresence", businessListed
        ? { title: "Negocio listado en directorios", excerpt: `Presente en ${listings.length} directorio(s): ${listings.map((l) => l.name).join(", ")}.`, polarity: "positive", strength: Math.min(1, listings.length / 3) }
        : { title: "Negocio no listado en directorios consultados", excerpt: "No se encontró el negocio en los directorios de la fixture.", polarity: "negative" }),
    ];
  },
});

export const MOCK_MAPS_LISTING_ADAPTER = defineSourceAdapter({
  id: "mock_maps_listing",
  capabilities: ["publicReputation", "trustSignals", "seoLocal"],
  inputSchema: "{ sourceId: string, rating: number, reviewCount: number, addressComplete: boolean, hoursListed: boolean }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, rating, reviewCount, addressComplete, hoursListed }) {
    const list = [];
    list.push(evidenceFrom(sourceId, "mock_maps_listing", "publicReputation", rating >= 4
      ? { title: "Buena valoración en listado de mapas", excerpt: `${rating}/5 con ${reviewCount} reseñas.`, polarity: "positive", strength: Math.min(1, (rating - 3) / 2), confidence: reviewCount >= 5 ? 0.8 : 0.5 }
      : { title: "Valoración baja o insuficiente en listado de mapas", excerpt: `${rating}/5 con ${reviewCount} reseñas.`, polarity: "negative", confidence: reviewCount >= 5 ? 0.8 : 0.5 }));
    list.push(evidenceFrom(sourceId, "mock_maps_listing", "seoLocal", addressComplete && hoursListed
      ? { title: "Ficha de negocio local completa", excerpt: "Dirección y horario publicados en el listado.", polarity: "positive", strength: 0.6 }
      : { title: "Ficha de negocio local incompleta", excerpt: `Dirección completa: ${addressComplete ? "sí" : "no"}; horario publicado: ${hoursListed ? "sí" : "no"}.`, polarity: "negative", strength: 0.6 }));
    return list;
  },
});

export const MOCK_SOCIAL_PRESENCE_ADAPTER = defineSourceAdapter({
  id: "mock_social_presence",
  capabilities: ["socialMediaPresence", "contentFreshness", "digitalMaturitySignal"],
  inputSchema: "{ sourceId: string, platforms: {name: string, followers: number, lastPostDaysAgo: number}[] }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, platforms = [] }) {
    const list = [];
    list.push(evidenceFrom(sourceId, "mock_social_presence", "socialMediaPresence", platforms.length > 0
      ? { title: "Presencia en redes sociales verificada", excerpt: `${platforms.length} plataforma(s): ${platforms.map((p) => p.name).join(", ")}.`, polarity: "positive", strength: Math.min(1, platforms.length / 3) }
      : { title: "Sin presencia en redes verificada", excerpt: "No se encontraron perfiles sociales en la fixture.", polarity: "negative" }));
    const freshPlatforms = platforms.filter((p) => p.lastPostDaysAgo <= 30);
    if (platforms.length > 0) {
      list.push(evidenceFrom(sourceId, "mock_social_presence", "contentFreshness", freshPlatforms.length > 0
        ? { title: "Actividad social reciente", excerpt: `${freshPlatforms.length}/${platforms.length} plataforma(s) con publicación en los últimos 30 días.`, polarity: "positive", strength: freshPlatforms.length / platforms.length }
        : { title: "Sin actividad social reciente", excerpt: "Ninguna plataforma tiene publicaciones en los últimos 30 días.", polarity: "negative" }));
    }
    return list;
  },
});

export const MOCK_REVIEW_SUMMARY_ADAPTER = defineSourceAdapter({
  id: "mock_review_summary",
  capabilities: ["publicReputation", "socialProof", "reputationalRisk"],
  inputSchema: "{ sourceId: string, averageRating: number, reviewCount: number, negativeReviewRatio: number }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, averageRating, reviewCount, negativeReviewRatio = 0 }) {
    const list = [];
    const confidence = reviewCount >= 10 ? 0.85 : reviewCount >= 3 ? 0.6 : 0.35;
    list.push(evidenceFrom(sourceId, "mock_review_summary", "publicReputation", averageRating >= 4
      ? { title: "Buena reputación en reseñas", excerpt: `${averageRating}/5 sobre ${reviewCount} reseña(s).`, polarity: "positive", confidence }
      : { title: "Reputación mejorable en reseñas", excerpt: `${averageRating}/5 sobre ${reviewCount} reseña(s).`, polarity: "negative", confidence }));
    list.push(evidenceFrom(sourceId, "mock_review_summary", "socialProof", reviewCount >= 10
      ? { title: "Volumen de reseñas suficiente como prueba social", excerpt: `${reviewCount} reseñas acumuladas.`, polarity: "positive", confidence }
      : { title: "Volumen de reseñas insuficiente como prueba social", excerpt: `Solo ${reviewCount} reseña(s).`, polarity: "negative", confidence }));
    list.push(evidenceFrom(sourceId, "mock_review_summary", "reputationalRisk", negativeReviewRatio >= 0.25
      ? { title: "Proporción alta de reseñas negativas", excerpt: `${Math.round(negativeReviewRatio * 100)}% de reseñas negativas.`, polarity: "negative", confidence }
      : { title: "Proporción de reseñas negativas baja", excerpt: `${Math.round(negativeReviewRatio * 100)}% de reseñas negativas.`, polarity: "positive", confidence }));
    return list;
  },
});

export const MOCK_PERFORMANCE_ADAPTER = defineSourceAdapter({
  id: "mock_performance",
  capabilities: ["performance"],
  inputSchema: "{ sourceId: string, performanceScore: number (0-100), lcpMs: number }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, performanceScore, lcpMs }) {
    return [
      evidenceFrom(sourceId, "mock_performance", "performance", performanceScore >= 70
        ? { title: "Rendimiento aceptable (mock tipo Lighthouse)", excerpt: `score=${performanceScore}/100, LCP=${lcpMs}ms.`, polarity: "positive", strength: Math.min(1, performanceScore / 100) }
        : { title: "Rendimiento deficiente (mock tipo Lighthouse)", excerpt: `score=${performanceScore}/100, LCP=${lcpMs}ms.`, polarity: "negative", strength: 1 - performanceScore / 100 }),
    ];
  },
});

export const MOCK_ACCESSIBILITY_ADAPTER = defineSourceAdapter({
  id: "mock_accessibility",
  capabilities: ["accessibility"],
  inputSchema: "{ sourceId: string, violations: {severity: string}[], score: number }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, violations = [], score }) {
    const critical = violations.filter((v) => v.severity === "critical").length;
    return [
      evidenceFrom(sourceId, "mock_accessibility", "accessibility", critical === 0 && score >= 80
        ? { title: "Sin violaciones críticas de accesibilidad (mock tipo axe-core)", excerpt: `score=${score}/100, ${violations.length} violación(es) totales.`, polarity: "positive" }
        : { title: "Violaciones de accesibilidad detectadas (mock tipo axe-core)", excerpt: `score=${score}/100, ${critical} crítica(s) de ${violations.length} totales.`, polarity: "negative", strength: Math.min(1, 0.4 + critical * 0.2) }),
    ];
  },
});

export const MOCK_SEO_ADAPTER = defineSourceAdapter({
  id: "mock_seo",
  capabilities: ["seoTechnical", "seoContent"],
  inputSchema: "{ sourceId: string, sitemapPresent: boolean, structuredDataPresent: boolean, indexablePages: number }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, sitemapPresent, structuredDataPresent, indexablePages }) {
    return [
      evidenceFrom(sourceId, "mock_seo", "seoTechnical", sitemapPresent && structuredDataPresent
        ? { title: "Sitemap y datos estructurados presentes (mock SEO)", excerpt: `sitemap=${sitemapPresent}, structuredData=${structuredDataPresent}, páginas indexables=${indexablePages}.`, polarity: "positive" }
        : { title: "Sitemap o datos estructurados ausentes (mock SEO)", excerpt: `sitemap=${sitemapPresent}, structuredData=${structuredDataPresent}.`, polarity: "negative" }),
    ];
  },
});

export const MOCK_TECHNOLOGY_DETECTOR_ADAPTER = defineSourceAdapter({
  id: "mock_technology_detector",
  capabilities: ["observableIntegrations", "observableAutomation", "digitalMaturitySignal"],
  inputSchema: "{ sourceId: string, technologies: string[], hasBookingWidget: boolean, hasCrmPixel: boolean }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, technologies = [], hasBookingWidget, hasCrmPixel }) {
    const list = [];
    list.push(evidenceFrom(sourceId, "mock_technology_detector", "observableIntegrations", technologies.length > 0
      ? { title: "Tecnologías/integraciones detectadas (mock tipo Wappalyzer)", excerpt: `Detectadas: ${technologies.join(", ")}.`, polarity: "positive", strength: Math.min(1, technologies.length / 4) }
      : { title: "Sin tecnologías/integraciones detectadas", excerpt: "El detector mock no encontró tecnologías reconocidas.", polarity: "negative" }));
    list.push(evidenceFrom(sourceId, "mock_technology_detector", "observableAutomation", hasBookingWidget || hasCrmPixel
      ? { title: "Automatización observable (widget de reserva o píxel de CRM)", excerpt: `bookingWidget=${hasBookingWidget}, crmPixel=${hasCrmPixel}.`, polarity: "positive", strength: 0.6 }
      : { title: "Sin automatización observable", excerpt: "No se detectó widget de reserva ni píxel de CRM.", polarity: "negative", strength: 0.5 }));
    list.push(evidenceFrom(sourceId, "mock_technology_detector", "digitalMaturitySignal", technologies.length >= 3
      ? { title: "Señal de madurez digital: stack tecnológico amplio", excerpt: `${technologies.length} tecnologías detectadas.`, polarity: "positive", strength: 0.5 }
      : { title: "Señal de madurez digital limitada", excerpt: `Solo ${technologies.length} tecnología(s) detectada(s).`, polarity: "negative", strength: 0.5 }));
    return list;
  },
});

export const MOCK_COMPETITOR_ADAPTER = defineSourceAdapter({
  id: "mock_competitor",
  capabilities: ["*"],
  inputSchema: "{ sourceId: string, htmlText?: string, reviewSummary?: object, seo?: object }",
  outputSchema: "Evidence[]",
  async collect({ sourceId, htmlText }) {
    if (!htmlText) return [];
    return evidenceFromHtmlText(sourceId, htmlText).map((e) => ({ ...e, sourceType: "mock_competitor", classification: "confirmed" }));
  },
});

export const SOURCE_ADAPTERS = Object.freeze({
  local_html: LOCAL_HTML_ADAPTER,
  local_json: LOCAL_JSON_ADAPTER,
  local_markdown: LOCAL_MARKDOWN_ADAPTER,
  fixture_website: FIXTURE_WEBSITE_ADAPTER,
  mock_directory: MOCK_DIRECTORY_ADAPTER,
  mock_maps_listing: MOCK_MAPS_LISTING_ADAPTER,
  mock_social_presence: MOCK_SOCIAL_PRESENCE_ADAPTER,
  mock_review_summary: MOCK_REVIEW_SUMMARY_ADAPTER,
  mock_performance: MOCK_PERFORMANCE_ADAPTER,
  mock_accessibility: MOCK_ACCESSIBILITY_ADAPTER,
  mock_seo: MOCK_SEO_ADAPTER,
  mock_technology_detector: MOCK_TECHNOLOGY_DETECTOR_ADAPTER,
  mock_competitor: MOCK_COMPETITOR_ADAPTER,
});

export const SOURCE_ADAPTER_IDS = Object.freeze(Object.keys(SOURCE_ADAPTERS));

export function getSourceAdapter(id) {
  return SOURCE_ADAPTERS[id] ?? null;
}
