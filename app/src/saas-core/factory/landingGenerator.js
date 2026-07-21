// Paso 10 · Fase 5 — Generador de landing pages configurables.
//
// Produce CONFIGURACIÓN (no una copia de HTML por negocio): una sola
// función `renderLandingHtml` renderiza cualquier `landingConfig` +
// `brandTokens`. Añadir un negocio nunca duplica el renderer, solo produce
// un nuevo objeto de configuración a partir del Business Blueprint.

const DEFAULT_SECTIONS_ORDER = Object.freeze([
  "header", "hero", "valueProposition", "benefits", "services", "howItWorks",
  "testimonials", "faq", "cta", "contact", "footer",
]);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const DEMO_TESTIMONIALS_DEFAULT = Object.freeze([
  { author: "Cliente demo A (ficticio)", quote: "Reservar mi cita ahora lleva segundos.", isDemoData: true },
  { author: "Cliente demo B (ficticio)", quote: "Los recordatorios automáticos me han evitado olvidos.", isDemoData: true },
]);

/**
 * Compone la configuración de landing a partir del Business Blueprint +
 * diccionario de terminología ya resuelto. Función pura, sin I/O.
 * @param {object} blueprint
 * @param {object} terminology
 */
export function buildLandingConfig(blueprint, terminology) {
  const orgLabel = terminology?.organization?.singular || "negocio";
  const customerLabel = terminology?.customer?.plural || "clientes";
  const appointmentLabel = terminology?.appointment?.singular || "cita";
  const requestedSections = blueprint.landingPage?.sectionsEnabled;
  const sections = (requestedSections && requestedSections.length > 0 ? requestedSections : DEFAULT_SECTIONS_ORDER)
    .filter((s) => DEFAULT_SECTIONS_ORDER.includes(s));

  const services = (blueprint.services || []).map((s) => ({ name: s.name, durationMinutes: s.durationMinutes ?? null, priceHint: s.priceHint ?? null }));

  const testimonials = (blueprint.landingPage?.testimonials && blueprint.landingPage.testimonials.length > 0
    ? blueprint.landingPage.testimonials
    : DEMO_TESTIMONIALS_DEFAULT
  ).map((t) => ({ ...t, isDemoData: true, demoLabel: "Testimonio de demostración — no corresponde a un cliente real" }));

  const faq = blueprint.landingPage?.faq && blueprint.landingPage.faq.length > 0 ? blueprint.landingPage.faq : [
    { question: `¿Cómo reservo un/a ${appointmentLabel}?`, answer: `Desde la sección de reservas, eligiendo servicio, ${terminology?.staff?.singular || "profesional"} y horario disponible.` },
    { question: "¿Los datos que veo aquí son reales?", answer: "No. Esta landing y sus datos son de demostración, generados automáticamente para validar la plantilla del sector." },
  ];

  return {
    businessId: blueprint.businessId,
    tenantId: blueprint.tenantId,
    locale: blueprint.locale,
    sectionsEnabled: sections,
    meta: {
      title: `${blueprint.commercialName} | ${orgLabel}`,
      description: blueprint.publicInfo?.shortDescription || `${blueprint.commercialName}: gestión de ${appointmentLabel}s para ${customerLabel}.`,
      canonical: blueprint.publicInfo?.website || null,
      ogImage: blueprint.branding?.logoRef || null,
      robots: "noindex,nofollow",
      structuredDataPrepared: true,
    },
    header: { brandName: blueprint.commercialName, navLinks: sections.filter((s) => ["services", "howItWorks", "faq", "contact"].includes(s)) },
    hero: {
      headline: `${blueprint.commercialName}`,
      subheadline: blueprint.publicInfo?.shortDescription || `Gestión moderna de ${appointmentLabel}s para tu ${orgLabel}.`,
      ctaLabel: blueprint.landingPage?.ctaLabel || "Pedir cita",
      ctaHref: blueprint.landingPage?.ctaHref || "#contacto",
    },
    valueProposition: {
      heading: `Por qué elegir ${blueprint.commercialName}`,
      points: [
        `Reservas online de ${appointmentLabel}s`,
        `Recordatorios automáticos para ${customerLabel}`,
        "Gestión centralizada del equipo y la agenda",
      ],
    },
    benefits: [
      { title: "Ahorra tiempo", description: `Automatiza confirmaciones y recordatorios de ${appointmentLabel}s.` },
      { title: "Sin errores de agenda", description: "Disponibilidad siempre actualizada." },
      { title: "Comunicación clara", description: `Tus ${customerLabel} siempre saben qué esperar.` },
    ],
    services: { heading: "Servicios", items: services },
    howItWorks: {
      heading: "Cómo funciona",
      steps: [
        { title: "1. Elige servicio", description: "Selecciona el servicio que necesitas." },
        { title: "2. Elige horario", description: "Consulta disponibilidad en tiempo real." },
        { title: "3. Confirma", description: "Recibe confirmación y recordatorio automáticos." },
      ],
    },
    testimonials: { heading: "Lo que dicen (demostración)", items: testimonials, demoNotice: "Todos los testimonios de esta sección son de demostración, no de clientes reales." },
    faq: { heading: "Preguntas frecuentes", items: faq },
    cta: { heading: `¿Listo para empezar con ${blueprint.commercialName}?`, ctaLabel: blueprint.landingPage?.ctaLabel || "Pedir cita", ctaHref: blueprint.landingPage?.ctaHref || "#contacto" },
    contact: { email: blueprint.publicInfo?.email || null, website: blueprint.publicInfo?.website || null, address: blueprint.publicInfo?.address || null },
    footer: {
      legalName: blueprint.legalName || blueprint.commercialName,
      privacyPlaceholder: "Aviso de privacidad pendiente de revisión legal — placeholder generado automáticamente, no usar en producción sin revisión.",
      termsPlaceholder: "Términos y condiciones pendientes de revisión legal — placeholder generado automáticamente.",
    },
  };
}

const SECTION_RENDERERS = Object.freeze({
  header: (cfg) => `<header class="lp-header"><span class="lp-brand">${escapeHtml(cfg.header.brandName)}</span><nav>${cfg.header.navLinks.map((l) => `<a href="#${l}">${escapeHtml(l)}</a>`).join("")}</nav></header>`,
  hero: (cfg) => `<section class="lp-hero"><h1>${escapeHtml(cfg.hero.headline)}</h1><p>${escapeHtml(cfg.hero.subheadline)}</p><a class="lp-cta" href="${escapeHtml(cfg.hero.ctaHref)}">${escapeHtml(cfg.hero.ctaLabel)}</a></section>`,
  valueProposition: (cfg) => `<section id="valueProposition"><h2>${escapeHtml(cfg.valueProposition.heading)}</h2><ul>${cfg.valueProposition.points.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul></section>`,
  benefits: (cfg) => `<section id="benefits"><ul class="lp-benefits">${cfg.benefits.map((b) => `<li><strong>${escapeHtml(b.title)}</strong><p>${escapeHtml(b.description)}</p></li>`).join("")}</ul></section>`,
  services: (cfg) => `<section id="services"><h2>${escapeHtml(cfg.services.heading)}</h2><ul>${cfg.services.items.map((s) => `<li>${escapeHtml(s.name)}${s.durationMinutes ? ` (${s.durationMinutes} min)` : ""}</li>`).join("")}</ul></section>`,
  howItWorks: (cfg) => `<section id="howItWorks"><h2>${escapeHtml(cfg.howItWorks.heading)}</h2><ol>${cfg.howItWorks.steps.map((s) => `<li><strong>${escapeHtml(s.title)}</strong><p>${escapeHtml(s.description)}</p></li>`).join("")}</ol></section>`,
  testimonials: (cfg) => `<section id="testimonials"><h2>${escapeHtml(cfg.testimonials.heading)}</h2><p class="lp-demo-notice">${escapeHtml(cfg.testimonials.demoNotice)}</p><ul>${cfg.testimonials.items.map((t) => `<li>&ldquo;${escapeHtml(t.quote)}&rdquo; — ${escapeHtml(t.author)}</li>`).join("")}</ul></section>`,
  faq: (cfg) => `<section id="faq"><h2>${escapeHtml(cfg.faq.heading)}</h2>${cfg.faq.items.map((f) => `<details><summary>${escapeHtml(f.question)}</summary><p>${escapeHtml(f.answer)}</p></details>`).join("")}</section>`,
  cta: (cfg) => `<section id="cta"><h2>${escapeHtml(cfg.cta.heading)}</h2><a class="lp-cta" href="${escapeHtml(cfg.cta.ctaHref)}">${escapeHtml(cfg.cta.ctaLabel)}</a></section>`,
  contact: (cfg) => `<section id="contact"><h2>Contacto</h2>${cfg.contact.email ? `<p>${escapeHtml(cfg.contact.email)}</p>` : ""}${cfg.contact.website ? `<p>${escapeHtml(cfg.contact.website)}</p>` : ""}</section>`,
  footer: (cfg) => `<footer><p>${escapeHtml(cfg.footer.legalName)}</p><p class="lp-legal-placeholder">${escapeHtml(cfg.footer.privacyPlaceholder)}</p></footer>`,
});

/**
 * Renderer ÚNICO y reutilizable: cualquier negocio pasa por esta misma
 * función, nunca se genera un archivo HTML distinto por tenant a mano.
 * @param {object} landingConfig salida de buildLandingConfig
 * @param {object} brandTokens salida de brandingEngine.resolveBrandTokens
 */
export function renderLandingHtml(landingConfig, brandTokens) {
  const body = landingConfig.sectionsEnabled
    .filter((id) => SECTION_RENDERERS[id])
    .map((id) => SECTION_RENDERERS[id](landingConfig))
    .join("\n");

  const style = [
    `--color-primary: ${brandTokens.colors.primary};`,
    `--color-accent: ${brandTokens.colors.accent};`,
    `--color-bg: ${brandTokens.colors.bg};`,
    `--color-text: ${brandTokens.colors.text};`,
  ].join(" ");

  return [
    "<!doctype html>",
    `<html lang="${escapeHtml(landingConfig.locale || "es")}">`,
    "<head>",
    '<meta charset="utf-8">',
    `<title>${escapeHtml(landingConfig.meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(landingConfig.meta.description)}">`,
    `<meta name="robots" content="${escapeHtml(landingConfig.meta.robots)}">`,
    `<style>:root{${style}}</style>`,
    "</head>",
    `<body>`,
    body,
    "</body>",
    "</html>",
  ].join("\n") + "\n";
}
