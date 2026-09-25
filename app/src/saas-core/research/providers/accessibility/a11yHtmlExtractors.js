// Paso 17 · Fase 3 — Extracción de señales de accesibilidad (funciones
// puras, regex, sin parser DOM). No reimplementa lo que ya existe en
// ../seo/seoHtmlExtractors.js (Paso 16) ni en ../../htmlSignals.js (Paso
// 12) — encabezados, imágenes, enlaces, lang, charset, título ya se
// extraen ahí y se REUTILIZAN desde a11yAnalyzer.js. Aquí solo lo
// específico de accesibilidad: IDs, formularios/labels, ARIA, tablas,
// tabindex, SVG, audio/vídeo, roles.

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? m[1] : null;
}

function allAttrs(tag) {
  const attrs = {};
  const withoutTagName = tag.replace(/^<[a-zA-Z][-a-zA-Z0-9]*/, "");
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(["'])(.*?)\2)?/g;
  let m;
  while ((m = re.exec(withoutTagName))) {
    attrs[m[1].toLowerCase()] = m[2] !== undefined ? m[3] : "";
  }
  return attrs;
}

/** Todos los ids declarados en el documento, con recuento (para detectar duplicados). */
export function extractIds(html) {
  const matches = [...html.matchAll(/\bid=["']([^"']*)["']/gi)];
  const counts = new Map();
  for (const m of matches) {
    const id = m[1];
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return { all: matches.map((m) => m[1]), counts };
}

const OBSOLETE_TAGS = Object.freeze(["font", "center", "marquee", "blink", "big", "strike", "tt"]);

export function findObsoleteElements(html) {
  const found = [];
  for (const tag of OBSOLETE_TAGS) {
    const re = new RegExp(`<${tag}\\b`, "gi");
    const count = (html.match(re) || []).length;
    if (count > 0) found.push({ tag, count });
  }
  return found;
}

const LANDMARK_PATTERN = /<(nav|main|header|footer|aside)\b|role=["'](navigation|main|banner|contentinfo|complementary|search)["']/gi;

export function extractLandmarks(html) {
  const found = new Set();
  for (const m of html.matchAll(LANDMARK_PATTERN)) found.add((m[1] || m[2]).toLowerCase());
  return [...found];
}

/** input/select/textarea con su id, type, required, atributos aria, placeholder y autocomplete. */
export function extractFormControls(html) {
  const matches = html.match(/<(input|select|textarea)\b[^>]*>/gi) || [];
  return matches.map((tag) => {
    const a = allAttrs(tag);
    return {
      tagName: tag.match(/^<(\w+)/)[1].toLowerCase(),
      id: a.id ?? null,
      type: a.type ?? (tag.toLowerCase().startsWith("<select") ? "select" : tag.toLowerCase().startsWith("<textarea") ? "textarea" : "text"),
      required: "required" in a,
      ariaRequired: a["aria-required"] === "true",
      placeholder: a.placeholder ?? null,
      ariaLabel: a["aria-label"] ?? null,
      ariaLabelledby: a["aria-labelledby"] ?? null,
      autocomplete: a.autocomplete ?? null,
      hidden: "hidden" in a || a["aria-hidden"] === "true",
    };
  });
}

/** <label for="..."> declarados, y detecta labels que envuelven un control (<label>texto<input></label>). */
export function extractLabels(html) {
  const forLabels = [...html.matchAll(/<label\b[^>]*\bfor=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const wrappingLabels = [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].filter((m) => /<(input|select|textarea)\b/i.test(m[1]));
  return { forIds: forLabels, wrappingCount: wrappingLabels.length };
}

export function extractButtons(html) {
  const buttonTags = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) || [];
  const roleButtons = html.match(/<(?:div|span)\b[^>]*\brole=["']button["'][^>]*>[\s\S]*?<\/(?:div|span)>/gi) || [];
  function analyze(tag, isRoleButton) {
    const openTag = tag.match(/^<[^>]+>/)[0];
    const a = allAttrs(openTag);
    const inner = tag.replace(/^<[^>]+>/, "").replace(/<\/[^>]+>$/, "");
    const text = inner.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const hasIconOnly = text.length === 0 && /<(svg|img|i)\b/i.test(inner);
    return {
      isRoleButton,
      hasAccessibleName: text.length > 0 || Boolean(a["aria-label"]) || Boolean(a["aria-labelledby"]),
      ariaLabel: a["aria-label"] ?? null,
      hasIconOnly,
      tabindex: a.tabindex ?? null,
    };
  }
  return [...buttonTags.map((t) => analyze(t, false)), ...roleButtons.map((t) => analyze(t, true))];
}

const VALID_ARIA_ROLES = Object.freeze([
  "alert", "alertdialog", "application", "article", "banner", "button", "cell", "checkbox", "columnheader", "combobox",
  "complementary", "contentinfo", "definition", "dialog", "directory", "document", "feed", "figure", "form", "grid",
  "gridcell", "group", "heading", "img", "link", "list", "listbox", "listitem", "log", "main", "marquee", "math",
  "menu", "menubar", "menuitem", "menuitemcheckbox", "menuitemradio", "navigation", "none", "note", "option",
  "presentation", "progressbar", "radio", "radiogroup", "region", "row", "rowgroup", "rowheader", "scrollbar",
  "search", "searchbox", "separator", "slider", "spinbutton", "status", "switch", "tab", "table", "tablist",
  "tabpanel", "term", "textbox", "timer", "toolbar", "tooltip", "tree", "treegrid", "treeitem",
]);

export function extractRoles(html) {
  return [...html.matchAll(/\brole=["']([^"']+)["']/gi)].map((m) => m[1]);
}

export function isValidAriaRole(role) {
  return VALID_ARIA_ROLES.includes(role.toLowerCase());
}

/** aria-label/aria-labelledby/aria-describedby declarados en cualquier elemento. */
export function extractAriaReferences(html) {
  const labelledby = [...html.matchAll(/\baria-labelledby=["']([^"']+)["']/gi)].flatMap((m) => m[1].split(/\s+/));
  const describedby = [...html.matchAll(/\baria-describedby=["']([^"']+)["']/gi)].flatMap((m) => m[1].split(/\s+/));
  const emptyAriaLabels = [...html.matchAll(/\baria-label=["']\s*["']/gi)].length;
  const ariaHiddenTrueWithFocusable = [...html.matchAll(/<([a-zA-Z][-a-zA-Z0-9]*)\b[^>]*\baria-hidden=["']true["'][^>]*>([\s\S]*?)<\/\1>/gi)].filter((m) => /<(a\b[^>]*\shref|button|input|select|textarea)\b/i.test(m[2]) || /\btabindex=["']?0["']?/i.test(m[2])).length;
  return { labelledbyRefs: labelledby, describedbyRefs: describedby, emptyAriaLabels, ariaHiddenTrueWithFocusable };
}

export function extractTables(html) {
  const tables = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/gi) || [];
  return tables.map((t) => ({
    hasCaption: /<caption\b/i.test(t),
    thCount: (t.match(/<th\b/gi) || []).length,
    hasScope: /\bscope=["']/i.test(t),
    hasHeadersAttr: /\bheaders=["']/i.test(t),
    emptyCellCount: (t.match(/<td\b[^>]*>\s*<\/td>/gi) || []).length,
    totalCellCount: (t.match(/<td\b[^>]*>/gi) || []).length,
  }));
}

export function extractTabindexes(html) {
  const matches = [...html.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\btabindex=["'](-?\d+)["'][^>]*>/gi)];
  return matches.map((m) => ({ tagName: m[1].toLowerCase(), value: Number(m[2]) }));
}

export function hasAutofocus(html) {
  return /\bautofocus\b/i.test(html);
}

export function hasOutlineNoneInCss(html) {
  return /outline\s*:\s*(none|0)\b/i.test(html);
}

/** Primer enlace del <body> que apunta a un ancla interna (heurística de skip link). */
export function hasSkipLink(html) {
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)/i);
  const body = bodyMatch ? bodyMatch[1] : html;
  const firstLinks = [...body.matchAll(/<a\b[^>]*href=["']#([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].slice(0, 3);
  return firstLinks.some((m) => /saltar|skip|ir al contenido|ir a[l]? contenido principal/i.test(m[2]));
}

export function extractSvgElements(html) {
  const svgs = html.match(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi) || [];
  return svgs.map((s) => ({ hasTitle: /<title\b/i.test(s), hasAriaLabel: /\baria-label=["'][^"']+["']/i.test(s), hasRoleImg: /\brole=["']img["']/i.test(s), ariaHidden: /\baria-hidden=["']true["']/i.test(s) }));
}

export function extractMediaElements(html) {
  const videos = html.match(/<video\b[^>]*>[\s\S]*?<\/video>/gi) || [];
  const audios = html.match(/<audio\b[^>]*>[\s\S]*?<\/audio>/gi) || [];
  function analyze(tag, kind) {
    const openTag = tag.match(/^<[^>]+>/)[0];
    return { kind, hasTrack: /<track\b/i.test(tag), hasControls: /\bcontrols\b/i.test(openTag), hasAutoplay: /\bautoplay\b/i.test(openTag) };
  }
  return [...videos.map((v) => analyze(v, "video")), ...audios.map((a) => analyze(a, "audio"))];
}

export function extractAbbreviations(html) {
  return (html.match(/<abbr\b[^>]*>/gi) || []).length;
}

/** Colores inline (style="color:...;background-color:...") y en bloques <style>. Solo hex/rgb reconocibles. */
export function extractColorPairs(html) {
  const pairs = [];
  const styleAttrs = [...html.matchAll(/<[^>]+\bstyle=["']([^"']*)["'][^>]*>/gi)];
  for (const m of styleAttrs) {
    const style = m[1];
    const color = style.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    const bg = style.match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/i);
    if (color && bg) pairs.push({ color: color[1].trim(), background: bg[1].trim(), source: "inline" });
  }
  return pairs;
}

export { attr, allAttrs };
