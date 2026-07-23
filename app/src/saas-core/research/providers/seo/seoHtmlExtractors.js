// Paso 16 · Fase 3 — Extracción de señales SEO específicas (funciones
// puras, regex, sin parser DOM). Mismo espíritu que ../../htmlSignals.js
// (Paso 12): no se reimplementa nada que ya exista ahí (getTitleLength,
// getMetaDescriptionLength, hasCanonicalLink, countHeadings, wordCount,
// altAttributeCoverage, hasJsonLd, hasManifestLink, hasHreflangOrLanguageSwitcher,
// hasContactInfo se REUTILIZAN desde seoAnalyzer.js). Aquí solo lo que
// falta: contenido textual exacto (no solo longitud/booleano), y
// estructuras propias de SEO (Open Graph, Twitter Card, JSON-LD tipado,
// enlaces clasificados, imágenes con estado de alt, hreflang con valores).

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
}

export function extractTitleText(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
}

export function extractMetaContent(html, name) {
  // admite name="..." o content="..." en cualquier orden
  const re = new RegExp(`<meta\\b[^>]*\\bname=["']${name}["'][^>]*\\bcontent=["']([^"']*)["']|<meta\\b[^>]*\\bcontent=["']([^"']*)["'][^>]*\\bname=["']${name}["']`, "i");
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? "").trim() : null;
}

export function extractMetaProperty(html, property) {
  const re = new RegExp(`<meta\\b[^>]*\\bproperty=["']${property}["'][^>]*\\bcontent=["']([^"']*)["']|<meta\\b[^>]*\\bcontent=["']([^"']*)["'][^>]*\\bproperty=["']${property}["']`, "i");
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? "").trim() : null;
}

export function extractCanonicalUrl(html) {
  const m = html.match(/<link\b[^>]*\brel=["']canonical["'][^>]*>/i);
  if (!m) return null;
  return attr(m[0], "href");
}

export function extractHtmlLang(html) {
  const m = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i);
  return m ? m[1].trim() : null;
}

export function extractCharset(html) {
  const metaCharset = html.match(/<meta\b[^>]*\bcharset=["']?([\w-]+)["']?/i);
  if (metaCharset) return metaCharset[1];
  const httpEquiv = html.match(/<meta\b[^>]*http-equiv=["']content-type["'][^>]*content=["'][^"']*charset=([\w-]+)/i);
  return httpEquiv ? httpEquiv[1] : null;
}

export function extractOpenGraphTags(html) {
  return {
    title: extractMetaProperty(html, "og:title"),
    description: extractMetaProperty(html, "og:description"),
    image: extractMetaProperty(html, "og:image"),
    type: extractMetaProperty(html, "og:type"),
  };
}

export function extractTwitterCard(html) {
  return extractMetaContent(html, "twitter:card");
}

export function extractH1Texts(html) {
  const matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  return matches.map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

/** Secuencia [{level, text, empty}] de h1-h6 en orden de aparición. */
export function extractHeadingSequence(html) {
  const matches = [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)];
  return matches.map((m) => {
    const text = m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return { level: Number(m[1]), text, empty: text.length === 0 };
  });
}

/** Detecta saltos de nivel hacia adelante mayores de 1 (p.ej. h2 -> h4 directo, sin h3). */
export function findHeadingLevelJumps(sequence) {
  const jumps = [];
  for (let i = 1; i < sequence.length; i++) {
    const prev = sequence[i - 1];
    const curr = sequence[i];
    if (curr.level - prev.level > 1) jumps.push({ from: prev.level, to: curr.level, atIndex: i });
  }
  return jumps;
}

const GENERIC_ANCHOR_TEXTS = /^(clic aquí|click aquí|aquí|leer más|más info(rmación)?|ver más|click here|read more|learn more|más\.\.\.)$/i;

/** Clasifica enlaces por host relativo a `pageUrl`. No verifica alcanzabilidad (eso es aparte). */
export function extractLinks(html, pageUrl) {
  const base = (() => {
    try {
      return new URL(pageUrl);
    } catch {
      return null;
    }
  })();
  const matches = [...html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/gi)];
  return matches.map((m) => {
    const tag = m[0];
    const href = attr(tag, "href");
    const text = m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const rel = (attr(tag, "rel") || "").toLowerCase().split(/\s+/).filter(Boolean);
    let resolved = null;
    let isInternal = null;
    let scheme = null;
    if (href) {
      try {
        resolved = base ? new URL(href, base).toString() : new URL(href).toString();
        scheme = new URL(resolved).protocol.replace(":", "");
        isInternal = base ? new URL(resolved).hostname === base.hostname : null;
      } catch {
        // href relativo sin base válida, o esquema no-URL (mailto/tel ya se capturan via scheme más abajo)
        const schemeMatch = href.match(/^([a-z][a-z0-9+.-]*):/i);
        scheme = schemeMatch ? schemeMatch[1].toLowerCase() : null;
      }
    }
    return {
      href,
      resolved,
      text,
      isEmpty: !href || href === "#" || href.trim() === "",
      isGenericText: GENERIC_ANCHOR_TEXTS.test(text),
      rel,
      scheme,
      isInsecureScheme: scheme === "javascript" || scheme === "data",
      isInternal,
    };
  });
}

export function extractImages(html) {
  const matches = html.match(/<img\b[^>]*>/gi) || [];
  return matches.map((tag) => {
    const altMatch = tag.match(/\balt=["']([^"']*)["']/i);
    const hasAlt = Boolean(altMatch);
    const altText = altMatch ? altMatch[1] : null;
    return {
      src: attr(tag, "src"),
      hasAlt,
      altEmpty: hasAlt && altText.trim().length === 0,
      altText,
      width: attr(tag, "width"),
      height: attr(tag, "height"),
      loadingLazy: /\bloading=["']lazy["']/i.test(tag),
      format: (attr(tag, "src") || "").split(".").pop()?.split(/[?#]/)[0]?.toLowerCase() ?? null,
    };
  });
}

/** Bloques JSON-LD parseados de forma best-effort: nunca lanza, reporta parseError si el JSON es inválido. */
export function extractJsonLdBlocks(html) {
  const matches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  return matches.map((m) => {
    const raw = m[1].trim();
    try {
      const parsed = JSON.parse(raw);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      const types = items.flatMap((it) => (it && it["@type"] ? (Array.isArray(it["@type"]) ? it["@type"] : [it["@type"]]) : []));
      return { raw, parsed, parseError: null, types };
    } catch (err) {
      return { raw, parsed: null, parseError: err.message, types: [] };
    }
  });
}

export function extractMicrodataTypes(html) {
  const matches = [...html.matchAll(/\bitemtype=["']([^"']+)["']/gi)];
  return matches.map((m) => m[1].split("/").pop());
}

export function hasFaviconLink(html) {
  return /<link\b[^>]*\brel=["'](?:shortcut icon|icon)["']/i.test(html);
}

export function extractHreflangs(html) {
  const matches = [...html.matchAll(/<link\b[^>]*\brel=["']alternate["'][^>]*>/gi)];
  return matches
    .map((m) => ({ hreflang: attr(m[0], "hreflang"), href: attr(m[0], "href") }))
    .filter((e) => e.hreflang);
}

export function extractPaginationLinks(html) {
  return {
    hasNext: /<link\b[^>]*\brel=["']next["']/i.test(html),
    hasPrev: /<link\b[^>]*\brel=["']prev["']/i.test(html),
  };
}

export function extractMetaRobots(html) {
  return extractMetaContent(html, "robots");
}
