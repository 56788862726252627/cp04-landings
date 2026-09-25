// Paso 18 · Fase 3 — Extracción de señales de rendimiento (funciones
// puras, regex, sin parser DOM). No reimplementa lo que ya existe en
// ../seo/seoHtmlExtractors.js (Paso 16) — imágenes con alt/loading ya se
// extraen ahí; aquí solo lo específico de rendimiento (scripts,
// stylesheets, preload/preconnect, fuentes, terceros, srcset, tamaño
// estático del documento). Analiza ÚNICAMENTE lo declarado en el HTML —
// nunca descarga ningún recurso referenciado.

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
}

function resolveHost(href, pageUrl) {
  if (!href) return null;
  try {
    return new URL(href, pageUrl).hostname;
  } catch {
    return null;
  }
}

/** <script>: src/inline, async, defer, type=module, si está en <head>. */
export function extractScripts(html) {
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch ? headMatch[1] : "";
  const matches = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)];
  return matches.map((m) => {
    const openAttrs = m[1];
    const body = m[2];
    const src = attr(`<script ${openAttrs}>`, "src");
    return {
      src,
      inline: !src && body.trim().length > 0,
      async: /\basync\b/i.test(openAttrs),
      defer: /\bdefer\b/i.test(openAttrs),
      isModule: /\btype=["']module["']/i.test(openAttrs),
      inHead: headContent.includes(m[0]),
    };
  });
}

/** <link rel=stylesheet> y <style> inline, con media. */
export function extractStylesheets(html) {
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  const headContent = headMatch ? headMatch[1] : "";
  const linkTags = [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi)].map((m) => ({
    inline: false,
    href: attr(m[0], "href"),
    media: attr(m[0], "media") ?? "all",
    inHead: headContent.includes(m[0]),
  }));
  const styleBlocks = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => ({
    inline: true,
    href: null,
    media: attr(m[0], "media") ?? "all",
    inHead: headContent.includes(m[0]),
    length: m[1].length,
  }));
  return [...linkTags, ...styleBlocks];
}

/** <link rel=preload|prefetch|preconnect|dns-prefetch>. */
export function extractResourceHints(html) {
  const matches = [...html.matchAll(/<link\b[^>]*\brel=["'](preload|prefetch|preconnect|dns-prefetch)["'][^>]*>/gi)];
  return matches.map((m) => ({ rel: m[1].toLowerCase(), href: attr(m[0], "href"), as: attr(m[0], "as") }));
}

export function countIframes(html) {
  return (html.match(/<iframe\b/gi) || []).length;
}

/** Fuentes: <link> a archivos de fuente + preload as=font + @font-face en <style>. */
export function extractFontReferences(html) {
  const linkFonts = [...html.matchAll(/<link\b[^>]*\bhref=["']([^"']+\.(?:woff2?|ttf|otf|eot)(?:\?[^"']*)?)["'][^>]*>/gi)].map((m) => ({ href: m[1], preload: /\brel=["']preload["']/i.test(m[0]) }));
  const preloadFonts = [...html.matchAll(/<link\b[^>]*\brel=["']preload["'][^>]*\bas=["']font["'][^>]*>/gi)].map((m) => ({ href: attr(m[0], "href"), preload: true }));
  const fontFaceBlocks = [...html.matchAll(/@font-face\s*{[^}]*}/gi)];
  const fontDisplayValues = fontFaceBlocks.map((m) => {
    const fd = m[0].match(/font-display\s*:\s*([a-z-]+)/i);
    return fd ? fd[1].toLowerCase() : null;
  });
  return { linkedFontFiles: linkFonts, preloadedFonts: preloadFonts, fontFaceCount: fontFaceBlocks.length, fontDisplayValues };
}

export function countComments(html) {
  return (html.match(/<!--[\s\S]*?-->/g) || []).length;
}

export function countInlineStyleAttributes(html) {
  return (html.match(/\bstyle\s*=\s*["'][^"']*["']/gi) || []).length;
}

/** Estimación de nº de nodos: cuenta etiquetas de apertura (heurística, no un DOM real). */
export function estimateNodeCount(html) {
  return (html.match(/<[a-zA-Z][-a-zA-Z0-9]*(?:\s[^>]*)?>/g) || []).length;
}

/** Estimación de profundidad máxima de anidamiento por contenedores comunes (heurística, regex no puede anidar de verdad). */
export function estimateNestingDepth(html) {
  const containerTags = /<(div|section|article|main|aside|ul|ol|table|form)\b/gi;
  let depth = 0;
  let maxDepth = 0;
  const tokens = html.match(/<\/?(div|section|article|main|aside|ul|ol|table|form)\b[^>]*>/gi) || [];
  for (const token of tokens) {
    if (/^<\//.test(token)) depth = Math.max(0, depth - 1);
    else if (!/\/>$/.test(token)) {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  void containerTags;
  return maxDepth;
}

export function isDocumentWellFormed(html) {
  const openTags = html.match(/<(?!\/)(?!(?:img|br|hr|input|meta|link|area|base|col|embed|source|track|wbr)\b)[a-zA-Z][-a-zA-Z0-9]*\b[^>]*(?<!\/)>/gi) || [];
  const closeTags = html.match(/<\/[a-zA-Z][-a-zA-Z0-9]*>/gi) || [];
  // Heurística: recuento de apertura/cierre de las mismas etiquetas comunes debe ser razonablemente parejo.
  const openCount = {};
  for (const t of openTags) {
    const name = t.match(/<([a-zA-Z][-a-zA-Z0-9]*)/)[1].toLowerCase();
    openCount[name] = (openCount[name] ?? 0) + 1;
  }
  const closeCount = {};
  for (const t of closeTags) {
    const name = t.match(/<\/([a-zA-Z][-a-zA-Z0-9]*)/)[1].toLowerCase();
    closeCount[name] = (closeCount[name] ?? 0) + 1;
  }
  const mismatched = Object.keys(openCount).filter((name) => (openCount[name] ?? 0) !== (closeCount[name] ?? 0));
  return { wellFormed: mismatched.length === 0, mismatchedTags: mismatched };
}

/** Imágenes con srcset/sizes/dimensiones/loading, para las comprobaciones de rendimiento (distinto de seo/seoHtmlExtractors.extractImages, que se centra en alt). */
export function extractImagesForPerformance(html) {
  const matches = html.match(/<img\b[^>]*>/gi) || [];
  return matches.map((tag) => ({
    src: attr(tag, "src"),
    width: attr(tag, "width"),
    height: attr(tag, "height"),
    hasDimensions: Boolean(attr(tag, "width")) && Boolean(attr(tag, "height")),
    loadingLazy: /\bloading=["']lazy["']/i.test(tag),
    fetchPriorityHigh: /\bfetchpriority=["']high["']/i.test(tag),
    hasSrcset: Boolean(attr(tag, "srcset")),
    hasSizes: Boolean(attr(tag, "sizes")),
  }));
}

/** Dominios (hostnames) distintos al de la página, referenciados en src/href de recursos. */
export function extractThirdPartyDomains(html, pageUrl) {
  const domains = new Set();
  const pageHost = (() => {
    try {
      return new URL(pageUrl).hostname;
    } catch {
      return null;
    }
  })();
  const refs = [...html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const ref of refs) {
    const host = resolveHost(ref, pageUrl);
    if (host && host !== pageHost) domains.add(host);
  }
  return [...domains];
}

export { attr };
