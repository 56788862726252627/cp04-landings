// Paso 17 · Fase 3 — Análisis de accesibilidad determinista sobre HTML YA
// recopilado (por publicWebsiteFetcher, una fixture o un servidor local)
// — nunca descarga nada, nunca usa navegador automatizado, nunca
// ejecuta JavaScript remoto, nunca requiere credenciales.
//
// Cada hallazgo declara `checkType`: "automatic" (se puede afirmar con
// certeza desde el HTML estático), "partial" (indicio razonable, no
// concluyente) o "manual" (requiere revisión humana; el proveedor NUNCA
// completa esta comprobación por sí mismo). Ningún hallazgo de este
// archivo afirma conformidad WCAG total ni sustituye una auditoría de
// accesibilidad humana completa — ver limitations en cada finding
// "manual" y el aviso global en accessibilityProviderPlugin.js.

import { extractHeadingSequence, extractH1Texts, findHeadingLevelJumps, extractImages, extractLinks, extractHtmlLang, extractCharset, extractTitleText } from "../seo/seoHtmlExtractors.js";
import { hasViewportMeta, wordCount, stripTags } from "../../htmlSignals.js";
import {
  extractIds,
  findObsoleteElements,
  extractLandmarks,
  extractFormControls,
  extractLabels,
  extractButtons,
  isValidAriaRole,
  extractRoles,
  extractAriaReferences,
  extractTables,
  extractTabindexes,
  hasAutofocus,
  hasOutlineNoneInCss,
  hasSkipLink,
  extractSvgElements,
  extractMediaElements,
  extractAbbreviations,
  extractColorPairs,
} from "./a11yHtmlExtractors.js";
import { computeContrastRatio, WCAG_AA_NORMAL_TEXT_THRESHOLD } from "./a11yContrast.js";
import { getA11ySectorRule } from "./a11ySectorRules.js";

export const A11Y_CATEGORIES = Object.freeze(["document", "headings", "media", "linksButtons", "forms", "aria", "tables", "keyboard", "contrast", "content"]);
export const SEVERITIES = Object.freeze(["critical", "high", "medium", "low", "opportunity", "manual_review"]);
export const FINDING_STATUSES = Object.freeze(["observed", "calculated", "inferred", "unavailable", "unverified", "blocked", "manual_required", "fixture"]);
export const CHECK_TYPES = Object.freeze(["automatic", "partial", "manual"]);

function finding({ id, category, status, severity, checkType, polarity = "neutral", strength = 0.5, confidence, title, observedValue = null, rule, url, element = null, selector = null, wcag = null, limitations = [] }) {
  if (!A11Y_CATEGORIES.includes(category)) throw new Error(`a11yAnalyzer: categoría desconocida "${category}"`);
  if (!SEVERITIES.includes(severity)) throw new Error(`a11yAnalyzer: severidad desconocida "${severity}"`);
  if (!FINDING_STATUSES.includes(status)) throw new Error(`a11yAnalyzer: status desconocido "${status}"`);
  if (!CHECK_TYPES.includes(checkType)) throw new Error(`a11yAnalyzer: checkType desconocido "${checkType}"`);
  return Object.freeze({ id, category, dimension: "accessibility", status, severity, checkType, polarity, strength, confidence, title, observedValue, rule, url, element, selector, wcag: wcag ? Object.freeze({ ...wcag }) : null, limitations: Object.freeze([...limitations]) });
}

function wcag(criterion, level, technique = null) {
  return { criterion, level, technique };
}

// ---------------------------------------------------------------------
// A. DOCUMENTO
// ---------------------------------------------------------------------
function analyzeDocument(page) {
  const { url, body } = page;
  const findings = [];

  const lang = extractHtmlLang(body);
  findings.push(
    finding({
      id: "a11y.document.lang",
      category: "document",
      status: "observed",
      severity: lang ? "low" : "critical",
      checkType: "automatic",
      polarity: lang ? "positive" : "negative",
      strength: lang ? 0.2 : 1,
      confidence: 1,
      title: lang ? `<html lang="${lang}">` : "Sin atributo lang en <html>",
      observedValue: lang,
      rule: "Sin lang, lectores de pantalla no pueden elegir la voz/pronunciación correcta.",
      url,
      wcag: wcag("3.1.1", "A"),
    })
  );

  const charset = extractCharset(body);
  findings.push(
    finding({ id: "a11y.document.charset", category: "document", status: "observed", severity: charset ? "low" : "medium", checkType: "automatic", polarity: charset ? "positive" : "negative", strength: charset ? 0.1 : 0.3, confidence: 1, title: charset ? `Charset declarado: ${charset}` : "Sin charset declarado", observedValue: charset, rule: "Un charset ausente puede corromper caracteres para tecnología de asistencia.", url })
  );

  const viewport = hasViewportMeta(body);
  findings.push(
    finding({ id: "a11y.document.viewport", category: "document", status: "observed", severity: viewport ? "low" : "medium", checkType: "automatic", polarity: viewport ? "positive" : "negative", strength: viewport ? 0.1 : 0.3, confidence: 1, title: viewport ? "meta viewport presente" : "Sin meta viewport", observedValue: viewport, rule: "Sin viewport, el zoom/reflow en móvil puede fallar (SC 1.4.10).", url, wcag: wcag("1.4.10", "AA") })
  );

  const title = extractTitleText(body);
  findings.push(
    finding({ id: "a11y.document.title", category: "document", status: "observed", severity: title ? "low" : "critical", checkType: "automatic", polarity: title ? "positive" : "negative", strength: title ? 0.1 : 0.8, confidence: 1, title: title ? `<title> presente: "${title}"` : "Sin <title>", observedValue: title, rule: "Sin título, no hay forma de identificar la página al navegar por pestañas/lector de pantalla.", url, wcag: wcag("2.4.2", "A") })
  );

  const landmarks = extractLandmarks(body);
  findings.push(
    finding({
      id: "a11y.document.landmarks",
      category: "document",
      status: "observed",
      severity: landmarks.length > 0 ? "low" : "medium",
      checkType: "automatic",
      polarity: landmarks.length > 0 ? "positive" : "negative",
      strength: landmarks.length > 0 ? 0.2 : 0.4,
      confidence: 0.9,
      title: landmarks.length > 0 ? `${landmarks.length} landmark(s) detectado(s): ${landmarks.join(", ")}` : "Sin landmarks (nav/main/header/footer) detectables",
      observedValue: landmarks,
      rule: "Los landmarks permiten a tecnología de asistencia saltar entre regiones de la página.",
      url,
      wcag: wcag("1.3.1", "A"),
    })
  );

  const { counts } = extractIds(body);
  const duplicateIds = [...counts.entries()].filter(([, n]) => n > 1);
  const emptyIds = [...counts.keys()].filter((id) => id.trim().length === 0).length;
  if (duplicateIds.length > 0) {
    findings.push(
      finding({ id: "a11y.document.duplicateIds", category: "document", status: "observed", severity: "high", checkType: "automatic", polarity: "negative", strength: 0.6, confidence: 1, title: `${duplicateIds.length} id(s) duplicado(s): ${duplicateIds.map(([id]) => id).join(", ")}`, observedValue: duplicateIds.map(([id, n]) => ({ id, count: n })), rule: "Un id duplicado rompe las referencias aria-labelledby/aria-describedby/for y la navegación por fragmento.", url, wcag: wcag("4.1.1", "A") })
    );
  }
  if (emptyIds > 0) {
    findings.push(finding({ id: "a11y.document.emptyIds", category: "document", status: "observed", severity: "medium", checkType: "automatic", polarity: "negative", strength: 0.3, confidence: 1, title: `${emptyIds} id(s) vacío(s)`, observedValue: emptyIds, rule: "Un id vacío es inválido y no sirve como referencia.", url })
    );
  }

  const obsolete = findObsoleteElements(body);
  if (obsolete.length > 0) {
    findings.push(
      finding({ id: "a11y.document.obsoleteElements", category: "document", status: "observed", severity: "low", checkType: "automatic", polarity: "negative", strength: 0.2, confidence: 1, title: `Elemento(s) obsoleto(s) detectado(s): ${obsolete.map((o) => `${o.tag}(${o.count})`).join(", ")}`, observedValue: obsolete, rule: "Elementos como <font>/<center>/<marquee> no tienen semántica accesible y están obsoletos en HTML5.", url })
    );
  }

  findings.push(
    finding({ id: "a11y.document.logicalOrderManualCheck", category: "document", status: "manual_required", severity: "manual_review", checkType: "manual", polarity: "neutral", strength: 0, confidence: 0, title: "Orden lógico de lectura: requiere revisión manual", rule: "El orden de lectura correcto con tecnología de asistencia solo puede confirmarse con una prueba real de lector de pantalla — no se infiere de forma fiable desde HTML estático.", url, limitations: ["Comprobación manual obligatoria: no se automatiza."] })
  );

  return findings;
}

// ---------------------------------------------------------------------
// B. ENCABEZADOS (reutiliza extractores de Paso 16)
// ---------------------------------------------------------------------
function analyzeHeadings(page) {
  const { url, body } = page;
  const findings = [];
  const h1s = extractH1Texts(body);
  findings.push(
    finding({ id: "a11y.headings.h1Count", category: "headings", status: "observed", severity: h1s.length === 1 ? "low" : h1s.length === 0 ? "high" : "medium", checkType: "automatic", polarity: h1s.length === 1 ? "positive" : "negative", strength: h1s.length === 1 ? 0.2 : 0.5, confidence: 1, title: `${h1s.length} etiqueta(s) <h1>`, observedValue: h1s.length, rule: "Exactamente un <h1> por página es la convención de accesibilidad recomendada.", url, wcag: wcag("1.3.1", "A") })
  );

  const sequence = extractHeadingSequence(body);
  const emptyHeadings = sequence.filter((h) => h.empty).length;
  if (emptyHeadings > 0) {
    findings.push(finding({ id: "a11y.headings.empty", category: "headings", status: "observed", severity: "medium", checkType: "automatic", polarity: "negative", strength: 0.3, confidence: 1, title: `${emptyHeadings} encabezado(s) vacío(s)`, observedValue: emptyHeadings, rule: "Un encabezado vacío se anuncia sin contenido, confundiendo la navegación por encabezados.", url, wcag: wcag("2.4.6", "AA") })
    );
  }

  const jumps = findHeadingLevelJumps(sequence);
  if (jumps.length > 0) {
    findings.push(finding({ id: "a11y.headings.levelJumps", category: "headings", status: "observed", severity: "low", checkType: "automatic", polarity: "negative", strength: 0.2, confidence: 0.8, title: `${jumps.length} salto(s) de nivel de encabezado`, observedValue: jumps, rule: "Saltar niveles (h2 directo a h4) rompe la jerarquía que anuncia un lector de pantalla.", url, wcag: wcag("1.3.1", "A") })
    );
  }

  findings.push(
    finding({ id: "a11y.headings.styleOnlyManualCheck", category: "headings", status: "manual_required", severity: "manual_review", checkType: "manual", polarity: "neutral", strength: 0, confidence: 0, title: "Encabezados usados solo por estilo visual: requiere revisión manual", rule: "Detectar si un <hN> se usa únicamente por su tamaño de fuente (sin ser semánticamente un encabezado) requiere criterio editorial humano.", url, limitations: ["No se puede inferir con fiabilidad desde HTML/CSS estático."] })
  );

  return findings;
}

// ---------------------------------------------------------------------
// C. IMÁGENES Y MULTIMEDIA
// ---------------------------------------------------------------------
function analyzeMedia(page) {
  const { url, body } = page;
  const findings = [];
  const images = extractImages(body);

  if (images.length > 0) {
    const withoutAlt = images.filter((i) => !i.hasAlt);
    const decorative = images.filter((i) => i.hasAlt && i.altEmpty);
    findings.push(
      finding({ id: "a11y.media.imagesMissingAlt", category: "media", status: "observed", severity: withoutAlt.length > 0 ? "critical" : "low", checkType: "automatic", polarity: withoutAlt.length > 0 ? "negative" : "positive", strength: withoutAlt.length > 0 ? 1 : 0.1, confidence: 1, title: withoutAlt.length > 0 ? `${withoutAlt.length}/${images.length} imagen(es) sin atributo alt` : "Todas las imágenes declaran alt", observedValue: withoutAlt.length, rule: "Sin alt, un lector de pantalla no tiene ninguna alternativa textual (ni siquiera 'decorativa').", url, wcag: wcag("1.1.1", "A") })
    );
    findings.push(
      finding({ id: "a11y.media.decorativeImages", category: "media", status: "observed", severity: "opportunity", checkType: "partial", polarity: "neutral", strength: 0.1, confidence: 0.5, title: `${decorative.length} imagen(es) con alt="" (posiblemente decorativas)`, observedValue: decorative.length, rule: "alt=\"\" es correcto SOLO si la imagen es puramente decorativa — no se puede confirmar automáticamente la intención, se marca como indicio parcial.", url, limitations: ["No se puede confirmar automáticamente si la imagen es realmente decorativa."] })
    );
    const linkedImagesWithoutName = images.filter((i) => !i.hasAlt || i.altEmpty).length;
    if (linkedImagesWithoutName > 0) {
      findings.push(
        finding({ id: "a11y.media.imageLinksWithoutName", category: "media", status: "unverified", severity: "medium", checkType: "partial", polarity: "negative", strength: 0.4, confidence: 0.4, title: `Posibles imagen(es) enlazadas sin nombre accesible (sin alt significativo)`, observedValue: linkedImagesWithoutName, rule: "Una imagen dentro de <a> sin alt deja el enlace sin nombre accesible — requiere confirmar el anidado exacto imagen/enlace, marcado como indicio parcial.", url, wcag: wcag("2.4.4", "A"), limitations: ["Extracción por regex, sin árbol DOM: no confirma el anidado exacto imagen-dentro-de-enlace."] })
      );
    }
  }

  const svgs = extractSvgElements(body);
  if (svgs.length > 0) {
    const withoutLabel = svgs.filter((s) => !s.hasTitle && !s.hasAriaLabel && !s.hasRoleImg && !s.ariaHidden);
    findings.push(
      finding({ id: "a11y.media.svgWithoutLabel", category: "media", status: "observed", severity: withoutLabel.length > 0 ? "medium" : "low", checkType: "automatic", polarity: withoutLabel.length > 0 ? "negative" : "positive", strength: withoutLabel.length > 0 ? 0.4 : 0.1, confidence: 0.8, title: withoutLabel.length > 0 ? `${withoutLabel.length}/${svgs.length} <svg> sin <title>/aria-label ni aria-hidden` : "SVG con etiqueta o marcados como decorativos correctamente", observedValue: withoutLabel.length, rule: "Un SVG informativo necesita <title>/aria-label; uno decorativo debe llevar aria-hidden=\"true\".", url, wcag: wcag("1.1.1", "A") })
    );
  }

  const media = extractMediaElements(body);
  for (const m of media) {
    findings.push(
      finding({
        id: `a11y.media.${m.kind}Captions`,
        category: "media",
        status: m.hasTrack ? "observed" : "unverified",
        severity: m.hasTrack ? "low" : "manual_review",
        checkType: m.hasTrack ? "automatic" : "manual",
        polarity: m.hasTrack ? "positive" : "neutral",
        strength: m.hasTrack ? 0.1 : 0,
        confidence: m.hasTrack ? 0.8 : 0,
        title: m.hasTrack ? `<${m.kind}> con <track> (subtítulos/transcripción declarados)` : `<${m.kind}> sin <track> detectado — subtítulos/transcripción no comprobables automáticamente`,
        observedValue: m.hasTrack,
        rule: "No se declara ausencia de subtítulos como error confirmado sin poder comprobar el archivo de medios en sí; solo se reporta si el marcado <track> está presente.",
        url,
        wcag: wcag("1.2.2", "A"),
        limitations: m.hasTrack ? [] : ["Requiere revisión manual del archivo de vídeo/audio: no se puede confirmar automáticamente la ausencia de subtítulos."],
      })
    );
    if (m.hasAutoplay) {
      findings.push(finding({ id: `a11y.media.${m.kind}Autoplay`, category: "media", status: "observed", severity: "medium", checkType: "automatic", polarity: "negative", strength: 0.4, confidence: 1, title: `<${m.kind}> con autoplay detectado`, observedValue: true, rule: "El autoplay de audio/vídeo puede interferir con lectores de pantalla y resulta disruptivo.", url, wcag: wcag("1.4.2", "A") }));
    }
    findings.push(finding({ id: `a11y.media.${m.kind}Controls`, category: "media", status: "observed", severity: m.hasControls ? "low" : "medium", checkType: "automatic", polarity: m.hasControls ? "positive" : "negative", strength: m.hasControls ? 0.1 : 0.3, confidence: 1, title: m.hasControls ? `<${m.kind}> con controles disponibles` : `<${m.kind}> sin atributo controls`, observedValue: m.hasControls, rule: "Sin controles visibles, el usuario no puede pausar/controlar el medio con teclado.", url }));
  }

  return findings;
}

// ---------------------------------------------------------------------
// D. ENLACES Y BOTONES
// ---------------------------------------------------------------------
const GENERIC_LINK_TEXT_THRESHOLD = 2;

function analyzeLinksButtons(page) {
  const { url, body } = page;
  const findings = [];
  const links = extractLinks(body, url);

  const emptyLinks = links.filter((l) => l.isEmpty || (!l.text && l.href)).length;
  if (emptyLinks > 0) {
    findings.push(finding({ id: "a11y.linksButtons.emptyLinks", category: "linksButtons", status: "observed", severity: "high", checkType: "automatic", polarity: "negative", strength: 0.6, confidence: 1, title: `${emptyLinks} enlace(s) sin texto accesible`, observedValue: emptyLinks, rule: "Un enlace sin texto ni aria-label es invisible para un lector de pantalla.", url, wcag: wcag("2.4.4", "A") }));
  }

  const genericTexts = links.filter((l) => l.isGenericText);
  const genericCounts = new Map();
  for (const l of genericTexts) genericCounts.set(l.text.toLowerCase(), (genericCounts.get(l.text.toLowerCase()) ?? 0) + 1);
  const repeatedGeneric = [...genericCounts.entries()].filter(([, n]) => n >= GENERIC_LINK_TEXT_THRESHOLD);
  if (genericTexts.length > 0) {
    findings.push(
      finding({ id: "a11y.linksButtons.genericLinkText", category: "linksButtons", status: "observed", severity: repeatedGeneric.length > 0 ? "high" : "medium", checkType: "automatic", polarity: "negative", strength: repeatedGeneric.length > 0 ? 0.6 : 0.3, confidence: 0.9, title: `${genericTexts.length} enlace(s) con texto genérico ("clic aquí"...)${repeatedGeneric.length > 0 ? `, ${repeatedGeneric.length} repetido(s) en la misma página` : ""}`, observedValue: { total: genericTexts.length, repeated: repeatedGeneric.map(([t, n]) => ({ text: t, count: n })) }, rule: "Un texto de enlace genérico y repetido no permite distinguir destinos al navegar por lista de enlaces.", url, wcag: wcag("2.4.4", "A") })
    );
  }

  const blankTargetLinks = links.filter((l) => l.href && /target=["']_blank["']/i.test(body) && body.includes(l.href));
  const blankTargetCount = [...body.matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)].filter((m) => !/\bnuevo|new window|nueva pestaña|new tab/i.test(m[0]) && !/\brel=["'][^"']*noopener/i.test(m[0])).length;
  if (blankTargetCount > 0) {
    findings.push(finding({ id: "a11y.linksButtons.blankTargetWithoutWarning", category: "linksButtons", status: "observed", severity: "low", checkType: "automatic", polarity: "negative", strength: 0.2, confidence: 0.7, title: `${blankTargetCount} enlace(s) target="_blank" sin aviso textual de nueva pestaña`, observedValue: blankTargetCount, rule: "Abrir una nueva pestaña sin avisar puede desorientar a usuarios de tecnología de asistencia.", url, wcag: wcag("3.2.5", "AAA") }));
  }
  void blankTargetLinks;

  const buttons = extractButtons(body);
  const buttonsWithoutName = buttons.filter((b) => !b.hasAccessibleName);
  if (buttons.length > 0) {
    findings.push(
      finding({ id: "a11y.linksButtons.buttonsWithoutName", category: "linksButtons", status: "observed", severity: buttonsWithoutName.length > 0 ? "critical" : "low", checkType: "automatic", polarity: buttonsWithoutName.length > 0 ? "negative" : "positive", strength: buttonsWithoutName.length > 0 ? 0.8 : 0.1, confidence: 1, title: buttonsWithoutName.length > 0 ? `${buttonsWithoutName.length}/${buttons.length} botón(es) sin nombre accesible` : "Todos los botones tienen nombre accesible", observedValue: buttonsWithoutName.length, rule: "Un botón (o role=button) sin texto ni aria-label es inutilizable con tecnología de asistencia.", url, wcag: wcag("4.1.2", "A") })
    );
    const roleButtonsNonSemantic = buttons.filter((b) => b.isRoleButton).length;
    if (roleButtonsNonSemantic > 0) {
      findings.push(finding({ id: "a11y.linksButtons.nonSemanticInteractive", category: "linksButtons", status: "observed", severity: "medium", checkType: "partial", polarity: "negative", strength: 0.3, confidence: 0.6, title: `${roleButtonsNonSemantic} elemento(s) interactivo(s) no semántico(s) (role="button" en div/span)`, observedValue: roleButtonsNonSemantic, rule: "Un div/span con role=button no tiene comportamiento de teclado nativo (Enter/Espacio) — requiere JS adicional no verificable estáticamente.", url, wcag: wcag("4.1.2", "A"), limitations: ["No se puede confirmar desde HTML estático si el comportamiento de teclado se implementó correctamente en JS."] }));
    }
  }

  return findings;
}

// ---------------------------------------------------------------------
// E. FORMULARIOS
// ---------------------------------------------------------------------
function analyzeForms(page) {
  const { url, body } = page;
  const findings = [];
  const controls = extractFormControls(body).filter((c) => !c.hidden && c.type !== "hidden" && c.type !== "submit" && c.type !== "button");
  if (controls.length === 0) return findings;

  const { forIds } = extractLabels(body);
  const forIdSet = new Set(forIds);
  const withoutLabel = controls.filter((c) => !(c.id && forIdSet.has(c.id)) && !c.ariaLabel && !c.ariaLabelledby);
  findings.push(
    finding({ id: "a11y.forms.inputsWithoutLabel", category: "forms", status: "observed", severity: withoutLabel.length > 0 ? "critical" : "low", checkType: "automatic", polarity: withoutLabel.length > 0 ? "negative" : "positive", strength: withoutLabel.length > 0 ? 0.8 : 0.1, confidence: 0.9, title: withoutLabel.length > 0 ? `${withoutLabel.length}/${controls.length} campo(s) sin label asociado (ni aria-label/aria-labelledby)` : "Todos los campos tienen label o etiqueta ARIA", observedValue: withoutLabel.length, rule: "Un campo sin label/aria-label no se anuncia con nombre en tecnología de asistencia.", url, wcag: wcag("3.3.2", "A"), limitations: ["No detecta labels envolventes anidados de forma compleja: cobertura parcial, ver también extractLabels.wrappingCount."] })
  );

  const placeholderOnly = controls.filter((c) => c.placeholder && !(c.id && forIdSet.has(c.id)) && !c.ariaLabel && !c.ariaLabelledby);
  if (placeholderOnly.length > 0) {
    findings.push(finding({ id: "a11y.forms.placeholderAsLabel", category: "forms", status: "observed", severity: "high", checkType: "automatic", polarity: "negative", strength: 0.5, confidence: 0.85, title: `${placeholderOnly.length} campo(s) usan placeholder como única "etiqueta"`, observedValue: placeholderOnly.length, rule: "El placeholder desaparece al escribir y muchos lectores de pantalla no lo anuncian como label.", url, wcag: wcag("3.3.2", "A") }));
  }

  const requiredWithoutAria = controls.filter((c) => c.required && !c.ariaRequired);
  if (requiredWithoutAria.length > 0) {
    findings.push(finding({ id: "a11y.forms.requiredWithoutAria", category: "forms", status: "observed", severity: "low", checkType: "automatic", polarity: "negative", strength: 0.15, confidence: 0.6, title: `${requiredWithoutAria.length} campo(s) required sin aria-required`, observedValue: requiredWithoutAria.length, rule: "aria-required refuerza la semántica de required para tecnología de asistencia más antigua.", url, wcag: wcag("3.3.2", "A") }));
  }

  const withoutAutocomplete = controls.filter((c) => ["email", "tel", "text"].includes(c.type) && !c.autocomplete);
  if (withoutAutocomplete.length > 0) {
    findings.push(finding({ id: "a11y.forms.autocomplete", category: "forms", status: "observed", severity: "opportunity", checkType: "automatic", polarity: "neutral", strength: 0.1, confidence: 0.5, title: `${withoutAutocomplete.length} campo(s) sin atributo autocomplete`, observedValue: withoutAutocomplete.length, rule: "autocomplete ayuda a usuarios con discapacidad cognitiva/motora a rellenar formularios más rápido (SC 1.3.5).", url, wcag: wcag("1.3.5", "AA") }));
  }

  const hasFieldset = /<fieldset\b/i.test(body);
  const hasMultipleRadioOrCheckbox = controls.filter((c) => c.type === "radio" || c.type === "checkbox").length >= 2;
  if (hasMultipleRadioOrCheckbox) {
    findings.push(finding({ id: "a11y.forms.fieldsetLegend", category: "forms", status: "observed", severity: hasFieldset ? "low" : "medium", checkType: "automatic", polarity: hasFieldset ? "positive" : "negative", strength: hasFieldset ? 0.1 : 0.3, confidence: 0.7, title: hasFieldset ? "Grupos de opciones con fieldset/legend detectados" : "Varios radio/checkbox sin fieldset/legend agrupador", observedValue: hasFieldset, rule: "fieldset+legend agrupa controles relacionados (p. ej. un grupo de radio buttons) con un nombre de grupo anunciable.", url, wcag: wcag("1.3.1", "A") }));
  }

  findings.push(
    finding({ id: "a11y.forms.errorMessagesManualCheck", category: "forms", status: "manual_required", severity: "manual_review", checkType: "manual", polarity: "neutral", strength: 0, confidence: 0, title: "Mensajes de error e instrucciones dinámicas: requieren revisión manual", rule: "Los mensajes de error que aparecen tras enviar un formulario (validación en runtime) no son visibles en el HTML estático recopilado.", url, wcag: wcag("3.3.1", "A"), limitations: ["Requiere interactuar con el formulario en tiempo real: fuera del alcance de un análisis estático."] })
  );

  return findings;
}

// ---------------------------------------------------------------------
// F. ARIA
// ---------------------------------------------------------------------
function analyzeAria(page) {
  const { url, body } = page;
  const findings = [];
  const roles = extractRoles(body);
  if (roles.length > 0) {
    const invalid = roles.filter((r) => !isValidAriaRole(r));
    findings.push(
      finding({
        id: "a11y.aria.invalidRoles",
        category: "aria",
        status: "observed",
        severity: invalid.length > 0 ? "high" : "low",
        checkType: "automatic",
        polarity: invalid.length > 0 ? "negative" : "positive",
        strength: invalid.length > 0 ? 0.5 : 0.1,
        confidence: 0.85,
        title: invalid.length > 0 ? `${invalid.length} rol(es) ARIA no reconocido(s): ${[...new Set(invalid)].join(", ")}` : `${roles.length} rol(es) ARIA, todos reconocidos`,
        observedValue: invalid,
        rule: "Comparación contra la lista de roles ARIA 1.2 conocidos — no es un parser normativo exhaustivo (no valida combinaciones rol/atributo permitidas).",
        url,
        wcag: wcag("4.1.2", "A"),
        limitations: ["Lista de roles curada, no el conjunto normativo completo de WAI-ARIA con todas sus restricciones de uso."],
      })
    );
  }

  const refs = extractAriaReferences(body);
  if (refs.emptyAriaLabels > 0) {
    findings.push(finding({ id: "a11y.aria.emptyAriaLabel", category: "aria", status: "observed", severity: "medium", checkType: "automatic", polarity: "negative", strength: 0.3, confidence: 1, title: `${refs.emptyAriaLabels} aria-label vacío`, observedValue: refs.emptyAriaLabels, rule: "aria-label=\"\" sobrescribe cualquier nombre accesible con una cadena vacía.", url, wcag: wcag("4.1.2", "A") }));
  }

  const { all: ids } = extractIds(body);
  const idSet = new Set(ids);
  const brokenLabelledby = refs.labelledbyRefs.filter((ref) => !idSet.has(ref));
  const brokenDescribedby = refs.describedbyRefs.filter((ref) => !idSet.has(ref));
  if (brokenLabelledby.length > 0) {
    findings.push(finding({ id: "a11y.aria.brokenLabelledby", category: "aria", status: "observed", severity: "high", checkType: "automatic", polarity: "negative", strength: 0.5, confidence: 1, title: `${brokenLabelledby.length} referencia(s) aria-labelledby a id(s) inexistente(s): ${brokenLabelledby.join(", ")}`, observedValue: brokenLabelledby, rule: "Una referencia rota deja el elemento sin el nombre accesible que se pretendía darle.", url, wcag: wcag("4.1.2", "A") }));
  }
  if (brokenDescribedby.length > 0) {
    findings.push(finding({ id: "a11y.aria.brokenDescribedby", category: "aria", status: "observed", severity: "medium", checkType: "automatic", polarity: "negative", strength: 0.4, confidence: 1, title: `${brokenDescribedby.length} referencia(s) aria-describedby a id(s) inexistente(s)`, observedValue: brokenDescribedby, rule: "Una referencia rota deja el elemento sin la descripción adicional que se pretendía darle.", url, wcag: wcag("4.1.2", "A") }));
  }

  if (refs.ariaHiddenTrueWithFocusable > 0) {
    findings.push(finding({ id: "a11y.aria.hiddenContradictory", category: "aria", status: "observed", severity: "high", checkType: "automatic", polarity: "negative", strength: 0.6, confidence: 0.85, title: `${refs.ariaHiddenTrueWithFocusable} contenedor(es) aria-hidden="true" con contenido interactivo dentro`, observedValue: refs.ariaHiddenTrueWithFocusable, rule: "Un elemento oculto para tecnología de asistencia que aún contiene enlaces/botones enfocables crea foco 'fantasma' (invisible pero alcanzable por teclado).", url, wcag: wcag("4.1.2", "A") }));
  }

  findings.push(
    finding({ id: "a11y.aria.exhaustiveValidationManualCheck", category: "aria", status: "manual_required", severity: "manual_review", checkType: "manual", polarity: "neutral", strength: 0, confidence: 0, title: "Validación ARIA normativa completa: requiere herramienta especializada", rule: "Las combinaciones válidas de rol/atributo/jerarquía ARIA (ARIA in HTML) requieren un parser normativo exhaustivo — este proveedor solo hace comprobaciones básicas declaradas explícitamente.", url, limitations: ["No sustituye a axe-core ni a un validador ARIA normativo completo."] })
  );

  return findings;
}

// ---------------------------------------------------------------------
// G. TABLAS
// ---------------------------------------------------------------------
function analyzeTables(page) {
  const { url, body } = page;
  const findings = [];
  const tables = extractTables(body);
  if (tables.length === 0) return findings;

  for (let i = 0; i < tables.length; i++) {
    const t = tables[i];
    const isDataTable = t.thCount > 0 || t.hasCaption;
    if (!isDataTable) {
      findings.push(finding({ id: "a11y.tables.layoutTableSuspected", category: "tables", status: "inferred", severity: "opportunity", checkType: "partial", polarity: "neutral", strength: 0.1, confidence: 0.4, title: `Tabla #${i + 1}: sin th/caption — podría ser de maquetación en vez de datos`, observedValue: t, rule: "Sin th ni caption no se puede confirmar si es una tabla de datos real o de maquetación (heurística, no concluyente).", url, limitations: ["Heurística: no distingue con certeza tabla de datos vs. maquetación."] }));
      continue;
    }
    findings.push(finding({ id: "a11y.tables.caption", category: "tables", status: "observed", severity: t.hasCaption ? "low" : "medium", checkType: "automatic", polarity: t.hasCaption ? "positive" : "negative", strength: t.hasCaption ? 0.1 : 0.3, confidence: 1, title: `Tabla #${i + 1}: ${t.hasCaption ? "con" : "sin"} <caption>`, observedValue: t.hasCaption, rule: "caption da contexto a la tabla, anunciado antes de su contenido.", url, wcag: wcag("1.3.1", "A") }));
    findings.push(finding({ id: "a11y.tables.headers", category: "tables", status: "observed", severity: t.thCount > 0 ? "low" : "critical", checkType: "automatic", polarity: t.thCount > 0 ? "positive" : "negative", strength: t.thCount > 0 ? 0.1 : 0.7, confidence: 1, title: `Tabla #${i + 1}: ${t.thCount} celda(s) <th>`, observedValue: t.thCount, rule: "Sin th, un lector de pantalla no puede anunciar a qué columna/fila pertenece cada celda.", url, wcag: wcag("1.3.1", "A") }));
    findings.push(finding({ id: "a11y.tables.scope", category: "tables", status: "observed", severity: t.hasScope ? "low" : "medium", checkType: "automatic", polarity: t.hasScope ? "positive" : "negative", strength: t.hasScope ? 0.1 : 0.25, confidence: 0.8, title: `Tabla #${i + 1}: ${t.hasScope ? "con" : "sin"} atributo scope en encabezados`, observedValue: t.hasScope, rule: "scope=col/row desambigua tablas complejas con encabezados en ambos ejes.", url, wcag: wcag("1.3.1", "A") }));
    if (t.emptyCellCount > 0) {
      findings.push(finding({ id: "a11y.tables.emptyCells", category: "tables", status: "observed", severity: "low", checkType: "partial", polarity: "negative", strength: 0.15, confidence: 0.5, title: `Tabla #${i + 1}: ${t.emptyCellCount}/${t.totalCellCount} celda(s) vacía(s)`, observedValue: t.emptyCellCount, rule: "Una celda vacía puede ser intencional (relleno) o un dato faltante — no se puede distinguir automáticamente.", url, limitations: ["No distingue celda vacía intencional de dato faltante."] }));
    }
  }
  return findings;
}

// ---------------------------------------------------------------------
// H. TECLADO Y FOCO (solo evidencia estática)
// ---------------------------------------------------------------------
function analyzeKeyboard(page) {
  const { url, body } = page;
  const findings = [];
  const tabindexes = extractTabindexes(body);
  const positive = tabindexes.filter((t) => t.value > 0);
  if (positive.length > 0) {
    findings.push(finding({ id: "a11y.keyboard.positiveTabindex", category: "keyboard", status: "observed", severity: "high", checkType: "automatic", polarity: "negative", strength: 0.5, confidence: 1, title: `${positive.length} elemento(s) con tabindex positivo`, observedValue: positive, rule: "tabindex > 0 rompe el orden natural del DOM y crea saltos de foco impredecibles.", url, wcag: wcag("2.4.3", "A") }));
  }
  const negativeInteractive = tabindexes.filter((t) => t.value < 0 && ["a", "button", "input", "select", "textarea"].includes(t.tagName));
  if (negativeInteractive.length > 0) {
    findings.push(finding({ id: "a11y.keyboard.negativeTabindexOnInteractive", category: "keyboard", status: "observed", severity: "medium", checkType: "partial", polarity: "negative", strength: 0.3, confidence: 0.6, title: `${negativeInteractive.length} elemento(s) interactivo(s) nativo(s) con tabindex="-1"`, observedValue: negativeInteractive, rule: "Quitar del orden de tabulación un control nativo (button/input/a) puede ser intencional (modales) o un error — no se puede distinguir sin contexto.", url, limitations: ["No distingue un uso intencional (p. ej. modal cerrado) de un error de accesibilidad."] }));
  }

  const autofocus = hasAutofocus(body);
  if (autofocus) {
    findings.push(finding({ id: "a11y.keyboard.autofocus", category: "keyboard", status: "observed", severity: "medium", checkType: "automatic", polarity: "negative", strength: 0.3, confidence: 1, title: "Elemento con autofocus detectado", observedValue: true, rule: "autofocus mueve el foco sin control del usuario, lo que puede desorientar a usuarios de lector de pantalla.", url, wcag: wcag("3.2.1", "A") }));
  }

  const outlineNone = hasOutlineNoneInCss(body);
  findings.push(
    finding({ id: "a11y.keyboard.focusIndicatorRemoved", category: "keyboard", status: outlineNone ? "observed" : "observed", severity: outlineNone ? "high" : "low", checkType: outlineNone ? "partial" : "automatic", polarity: outlineNone ? "negative" : "positive", strength: outlineNone ? 0.5 : 0.1, confidence: outlineNone ? 0.6 : 0.7, title: outlineNone ? "Se detectó 'outline:none'/'outline:0' en CSS — posible indicador de foco eliminado" : "Sin eliminación de outline detectada en CSS estático", observedValue: outlineNone, rule: "Eliminar el outline sin sustituto visible deja a usuarios de teclado sin forma de ver dónde está el foco (SC 2.4.7).", url, wcag: wcag("2.4.7", "AA"), limitations: outlineNone ? ["No confirma si existe un estilo :focus-visible alternativo — solo detecta la eliminación del outline por defecto."] : [] })
  );

  const skipLink = hasSkipLink(body);
  findings.push(
    finding({ id: "a11y.keyboard.skipLink", category: "keyboard", status: "observed", severity: skipLink ? "low" : "medium", checkType: "automatic", polarity: skipLink ? "positive" : "negative", strength: skipLink ? 0.1 : 0.3, confidence: 0.8, title: skipLink ? "Enlace de salto ('saltar al contenido') detectado" : "Sin enlace de salto ('skip link') detectado", observedValue: skipLink, rule: "Un skip link permite a usuarios de teclado evitar repetir la navegación en cada página.", url, wcag: wcag("2.4.1", "A") })
  );

  findings.push(
    finding({ id: "a11y.keyboard.fullNavigationManualCheck", category: "keyboard", status: "manual_required", severity: "manual_review", checkType: "manual", polarity: "neutral", strength: 0, confidence: 0, title: "Navegación completa por teclado: requiere interacción real", rule: "Solo una prueba real (Tab/Shift+Tab/Enter/Espacio/Escape) confirma que todo el contenido interactivo es alcanzable y operable por teclado.", url, wcag: wcag("2.1.1", "A"), limitations: ["No se declara accesibilidad completa por teclado sin interacción real — este hallazgo lo deja explícito."] })
  );

  return findings;
}

// ---------------------------------------------------------------------
// I. CONTRASTE Y COLOR
// ---------------------------------------------------------------------
function analyzeContrast(page) {
  const { url, body } = page;
  const findings = [];
  const pairs = extractColorPairs(body);
  let calculable = 0;

  if (pairs.length === 0) {
    findings.push(finding({ id: "a11y.contrast.noCalculablePairs", category: "contrast", status: "unavailable", severity: "opportunity", checkType: "partial", polarity: "neutral", strength: 0, confidence: 0, title: "Sin pares de color texto/fondo calculables en estilos inline", observedValue: null, rule: "Solo se evalúan colores declarados de forma inline (style=\"color:...;background-color:...\") — colores definidos en hojas de estilo externas no son analizables sin descargarlas.", url, limitations: ["No analiza CSS externo — solo estilos inline presentes en el HTML recopilado."] }));
  }

  for (const pair of pairs) {
    const ratio = computeContrastRatio(pair.color, pair.background);
    if (ratio === null) continue;
    calculable++;
    findings.push(
      finding({
        id: "a11y.contrast.pair",
        category: "contrast",
        status: "calculated",
        severity: ratio < WCAG_AA_NORMAL_TEXT_THRESHOLD ? "high" : "low",
        checkType: "automatic",
        polarity: ratio < WCAG_AA_NORMAL_TEXT_THRESHOLD ? "negative" : "positive",
        strength: ratio < WCAG_AA_NORMAL_TEXT_THRESHOLD ? 0.5 : 0.1,
        confidence: 0.85,
        title: `Contraste ${ratio}:1 (${pair.color} sobre ${pair.background}) — ${ratio < WCAG_AA_NORMAL_TEXT_THRESHOLD ? "insuficiente" : "suficiente"} para AA texto normal (umbral ${WCAG_AA_NORMAL_TEXT_THRESHOLD}:1)`,
        observedValue: ratio,
        rule: "Fórmula WCAG de luminancia relativa (SC 1.4.3), calculada solo cuando ambos colores son extraíbles como hex/rgb. Se usa el umbral de texto normal (4.5:1) por no poder inferir con fiabilidad el tamaño de fuente desde HTML estático.",
        url,
        wcag: wcag("1.4.3", "AA"),
        limitations: ["No distingue texto grande (umbral 3:1) de texto normal — usa siempre el umbral más estricto por precaución."],
      })
    );
  }
  if (pairs.length > 0 && calculable === 0) {
    findings.push(finding({ id: "a11y.contrast.noCalculablePairs", category: "contrast", status: "unavailable", severity: "opportunity", checkType: "partial", polarity: "neutral", strength: 0, confidence: 0, title: "Pares de color detectados pero no reconocibles (ni hex ni rgb)", observedValue: null, rule: "Los valores de color encontrados no son hex/rgb reconocibles (p. ej. nombres de color CSS, variables custom properties).", url, limitations: ["No resuelve nombres de color CSS ni variables (var(--color)) ni funciones de color modernas (lab/oklch)."] }));
  }

  findings.push(
    finding({ id: "a11y.contrast.colorOnlyManualCheck", category: "contrast", status: "manual_required", severity: "manual_review", checkType: "manual", polarity: "neutral", strength: 0, confidence: 0, title: "Dependencia exclusiva del color para transmitir información: requiere revisión manual", rule: "Detectar de forma fiable si un estado (error, obligatorio, seleccionado) se comunica SOLO con color requiere contexto visual/semántico que no se automatiza aquí.", url, wcag: wcag("1.4.1", "A"), limitations: ["No se automatiza: requiere revisión visual humana."] })
  );

  return findings;
}

// ---------------------------------------------------------------------
// J. CONTENIDO Y LEGIBILIDAD
// ---------------------------------------------------------------------
function analyzeContent(page, { profileId } = {}) {
  const { url, body } = page;
  const findings = [];
  const text = stripTags(body);
  const words = wordCount(body);

  findings.push(
    finding({ id: "a11y.content.wordCount", category: "content", status: "calculated", severity: "opportunity", checkType: "automatic", polarity: "neutral", strength: 0, confidence: 1, title: `${words} palabra(s) de texto visible`, observedValue: words, rule: "Recuento base de contenido textual, usado como indicador (no penaliza por sí solo).", url })
  );

  const abbrCount = extractAbbreviations(body);
  findings.push(
    finding({ id: "a11y.content.abbreviations", category: "content", status: "observed", severity: "opportunity", checkType: "automatic", polarity: abbrCount > 0 ? "positive" : "neutral", strength: 0.1, confidence: 0.7, title: `${abbrCount} elemento(s) <abbr> declarado(s)`, observedValue: abbrCount, rule: "<abbr title=\"...\"> ayuda a expandir siglas/abreviaturas para usuarios que no las reconocen.", url, wcag: wcag("3.1.4", "AAA") })
  );

  const langAttrs = [...body.matchAll(/\blang=["']([^"']+)["']/gi)].map((m) => m[1]);
  const htmlLang = extractHtmlLang(body);
  const differentLangSpans = langAttrs.filter((l) => l !== htmlLang).length;
  if (differentLangSpans > 0) {
    findings.push(finding({ id: "a11y.content.langChangesMarked", category: "content", status: "observed", severity: "low", checkType: "automatic", polarity: "positive", strength: 0.1, confidence: 0.7, title: `${differentLangSpans} cambio(s) de idioma marcado(s) explícitamente`, observedValue: differentLangSpans, rule: "Marcar cambios de idioma con lang permite al lector de pantalla cambiar de voz correctamente.", url, wcag: wcag("3.1.2", "AA") }));
  }

  const rule = getA11ySectorRule(profileId);
  findings.push(
    finding({ id: "a11y.content.formClarityProfile", category: "content", status: "inferred", severity: "opportunity", checkType: "partial", polarity: "neutral", strength: 0.1, confidence: 0.4, title: `Notas de accesibilidad relevantes para el perfil "${rule.profileId}"`, observedValue: rule.priorityNotes, rule: "Recordatorio priorizado por perfil sectorial (no es un hallazgo de código, es contexto para priorizar recomendaciones).", url })
  );

  void text;
  return findings;
}

/**
 * Analiza UNA página ya recopilada, produciendo hallazgos de las 9
 * categorías de código (A-J; K es el mapeo WCAG que ya viaja en cada
 * `finding.wcag`, no una categoría de análisis aparte).
 * @param {{url:string, body:string}} page
 * @param {{profileId?: string|null}} options
 */
export function analyzeAccessibilityForPage(page, { profileId = null } = {}) {
  return [
    ...analyzeDocument(page),
    ...analyzeHeadings(page),
    ...analyzeMedia(page),
    ...analyzeLinksButtons(page),
    ...analyzeForms(page),
    ...analyzeAria(page),
    ...analyzeTables(page),
    ...analyzeKeyboard(page),
    ...analyzeContrast(page),
    ...analyzeContent(page, { profileId }),
  ];
}

export function analyzeAccessibilityForPages(pages, { profileId = null } = {}) {
  return pages.flatMap((p) => analyzeAccessibilityForPage(p, { profileId }));
}
