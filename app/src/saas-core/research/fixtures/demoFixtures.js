// Paso 12 · Fase 17 — Fixtures ficticias para las 10 demos del enunciado.
//
// TODO el contenido aquí es inventado para fines de demostración: ningún
// nombre corresponde a un negocio real, ninguna reseña es real, ningún
// dato personal es real. Cada fixture combina HTML (para local_html/
// fixture_website) + datos mock (para el resto de adaptadores offline).

function htmlPage({ lang = "es", title, description = "", bodyExtras = "" }) {
  return `<!doctype html><html lang="${lang}"><head>
<title>${title}</title>
${description ? `<meta name="description" content="${description}">` : ""}
</head><body>
${bodyExtras}
</body></html>`;
}

export const DEMO_FIXTURES = Object.freeze({
  "padel-web-anticuada": {
    label: "Club de pádel ficticio con web anticuada",
    sector: "padel-sports",
    business: { name: "Club Pádel Ficticio Norte", sector: "padel-sports", location: "Zaragoza, ES" },
    htmlText: `<!doctype html><html><head><title>x</title></head><body>
<table><tr><td><b>Club Pádel Ficticio Norte</b></td></tr></table>
<p>Bienvenidos a nuestras pistas.</p>
<img src="pista1.jpg">
<a href="http://otro-dominio-ficticio.invalid/imagen.jpg">ver más</a>
</body></html>`,
    directory: { listings: [], businessListed: false },
    mapsListing: { rating: 3.6, reviewCount: 4, addressComplete: false, hoursListed: false },
    technologyDetector: { technologies: [], hasBookingWidget: false, hasCrmPixel: false },
  },

  "dental-branding-inconsistente": {
    label: "Clínica dental ficticia con branding inconsistente",
    sector: "dental",
    business: { name: "Clínica Dental Ficticia Sonrisa Norte", sector: "dental", location: "Valladolid, ES" },
    htmlText: htmlPage({
      title: "Clínica Dental Ficticia Sonrisa Norte — Odontología general y estética",
      description: "Clínica dental ficticia con más de 15 años de experiencia en odontología general, estética y ortodoncia para toda la familia.",
      bodyExtras: `<header><nav><a href="/">Inicio</a><a href="/servicios">Servicios</a></nav></header>
<h1>Sonrisa Norte</h1><h2>Nuestros tratamientos</h2>
<div style="color:#ff0000;background:#00ff00"></div>
<div style="color:#0000ff;background:#ffff00"></div>
<div style="color:#123456;background:#abcdef"></div>
<div style="color:#654321"></div>
<img src="a.jpg" alt="consulta dental">
<form class="reserva"><input required name="nombre"></form>
<p>Pide cita previa. Llámanos al 987654321.</p>
<a href="https://facebook.com/dentalficticio">Facebook</a>
<meta name="viewport" content="width=device-width">
<link rel="manifest" href="/manifest.json">`,
    }),
    mapsListing: { rating: 4.2, reviewCount: 12, addressComplete: true, hoursListed: true },
    technologyDetector: { technologies: ["WordPress"], hasBookingWidget: true, hasCrmPixel: false },
  },

  "fisio-buena-reputacion-mala-conversion": {
    label: "Fisioterapia ficticia con buena reputación y mala conversión",
    sector: "physiotherapy",
    business: { name: "Fisioterapia Ficticia Avanza", sector: "physiotherapy", location: "Murcia, ES" },
    htmlText: `<!doctype html><html><head><meta name="viewport" content="w"><title>Fisioterapia Ficticia Avanza</title></head><body>
<h1>Fisioterapia Ficticia Avanza</h1>
<p>Recuperación deportiva y rehabilitación.</p>
<form><input required name="a"><input required name="b"><input required name="c"><input required name="d"><input required name="e"><input required name="f"></form>
</body></html>`,
    reviewSummary: { averageRating: 4.8, reviewCount: 65, negativeReviewRatio: 0.03 },
    mapsListing: { rating: 4.7, reviewCount: 65, addressComplete: true, hoursListed: true },
    technologyDetector: { technologies: ["Wix"], hasBookingWidget: false, hasCrmPixel: false },
  },

  "restaurante-sin-reservas": {
    label: "Restaurante ficticio sin reservas online",
    sector: "restaurant",
    business: { name: "Restaurante Ficticio La Mesa Vieja", sector: "restaurant", location: "Alicante, ES" },
    htmlText: htmlPage({
      title: "Restaurante Ficticio La Mesa Vieja — Cocina tradicional",
      description: "Restaurante ficticio de cocina tradicional en Alicante, especialidad en arroces y pescado fresco de la lonja local.",
      bodyExtras: `<header><nav><a href="/">Inicio</a><a href="/menu">Menú</a></nav></header>
<h1>La Mesa Vieja</h1><h2>Nuestra carta</h2>
<p>Llámanos al 965123456 para consultas.</p>
<a href="https://instagram.com/lamesaviejaficticia">Instagram</a>`,
    }),
    directory: { listings: [{ name: "Guía Gastronómica Ficticia", category: "restaurantes" }], businessListed: true },
    mapsListing: { rating: 4.1, reviewCount: 20, addressComplete: true, hoursListed: true },
    technologyDetector: { technologies: ["Wix"], hasBookingWidget: false, hasCrmPixel: false },
  },

  "despacho-servicios-poco-claros": {
    label: "Despacho de abogados ficticio con servicios poco claros",
    sector: "law",
    business: { name: "Despacho Ficticio Rivas & Asociados Norte", sector: "law", location: "Bilbao, ES" },
    htmlText: `<!doctype html><html><head><title>Despacho</title></head><body>
<h1>Despacho Ficticio</h1>
<p>Ofrecemos servicios legales.</p>
</body></html>`,
    mapsListing: { rating: 3.9, reviewCount: 8, addressComplete: true, hoursListed: false },
    technologyDetector: { technologies: [], hasBookingWidget: false, hasCrmPixel: false },
  },

  "negocio-datos-insuficientes": {
    label: "Negocio ficticio con datos insuficientes",
    sector: "generic-local-service",
    business: { name: "Negocio Ficticio Sin Datos", sector: "generic-local-service", location: "desconocida" },
    htmlText: null,
  },

  "fuentes-contradictorias": {
    label: "Negocio ficticio con fuentes contradictorias",
    sector: "hair-beauty",
    business: { name: "Peluquería Ficticia Contraste", sector: "hair-beauty", location: "Córdoba, ES" },
    htmlText: htmlPage({
      title: "Peluquería Ficticia Contraste — Reserva tu cita",
      description: "Reserva tu cita online ahora mismo en Peluquería Ficticia Contraste, servicio rápido y de calidad garantizada siempre.",
      bodyExtras: `<form class="reserva"><input required></form><p>Reserva ahora tu cita.</p><meta name="viewport" content="w">`,
    }),
    // Evidencia local_json deliberadamente contradictoria con el HTML anterior (misma dimensión, polaridad opuesta).
    contradictoryJsonEvidence: [{ relatedDimension: "bookingCapability", title: "Reclamaciones de clientes", excerpt: "Varios clientes reportan que el botón de reserva online no funciona en la práctica.", polarity: "negative", strength: 0.9, confidence: 0.7, classification: "contradictory" }],
    mapsListing: { rating: 4.0, reviewCount: 15, addressComplete: true, hoursListed: true },
  },

  "accesibilidad-deficiente": {
    label: "Sitio ficticio con accesibilidad deficiente",
    sector: "veterinary",
    business: { name: "Clínica Veterinaria Ficticia Patitas Norte", sector: "veterinary", location: "Oviedo, ES" },
    htmlText: `<!doctype html><html><head><meta name="viewport" content="w"><title>Veterinaria Ficticia Patitas Norte</title></head><body>
<img src="a.jpg"><img src="b.jpg"><img src="c.jpg"><img src="d.jpg">
<p>Cuidamos de tus mascotas.</p>
</body></html>`,
    accessibility: { violations: [{ severity: "critical" }, { severity: "critical" }, { severity: "moderate" }], score: 35 },
    mapsListing: { rating: 4.3, reviewCount: 18, addressComplete: true, hoursListed: true },
  },

  "seo-basico-deficiente": {
    label: "Sitio ficticio con SEO básico deficiente",
    sector: "automotive",
    business: { name: "Taller Ficticio MotorNorte", sector: "automotive", location: "Logroño, ES" },
    htmlText: `<!doctype html><html><head><title>x</title></head><body><p>taller</p></body></html>`,
    seo: { sitemapPresent: false, structuredDataPresent: false, indexablePages: 1 },
    directory: { listings: [], businessListed: false },
  },

  "negocio-en-ingles": {
    label: "Fictional business demo requested in English",
    sector: "education",
    business: { name: "Fictional Bright Minds Academy", sector: "education", location: "Manchester, UK" },
    htmlText: htmlPage({
      lang: "en",
      title: "Fictional Bright Minds Academy — Enroll today",
      description: "Fictional Bright Minds Academy offers courses for all ages with flexible schedules and modern facilities for every student.",
      bodyExtras: `<header><nav><a href="/">Home</a><a href="/courses">Courses</a></nav></header>
<h1>Bright Minds Academy</h1><h2>Our courses</h2>
<form><input required name="name"><input required name="email"></form>
<p>Contact us now. Call +44 7000 000000 or email info@fictional-academy.invalid</p>
<a href="https://facebook.com/brightmindsficticio">Facebook</a>
<meta name="viewport" content="width=device-width">`,
    }),
    mapsListing: { rating: 4.4, reviewCount: 22, addressComplete: true, hoursListed: true },
    technologyDetector: { technologies: ["Squarespace", "Google Analytics"], hasBookingWidget: false, hasCrmPixel: true },
  },
});

export const DEMO_FIXTURE_IDS = Object.freeze(Object.keys(DEMO_FIXTURES));

export function getDemoFixture(id) {
  return DEMO_FIXTURES[id] ?? null;
}

// Competidores ficticios mínimos, usados SOLO cuando una demo los referencia explícitamente.
export const COMPETITOR_FIXTURES = Object.freeze({
  "competidor-ficticio-fuerte": {
    label: "Competidor ficticio con buena presencia digital",
    htmlText: htmlPage({ title: "Competidor Ficticio Fuerte — Reserva online", description: "Competidor ficticio con reserva online, redes activas y contenido claro para todos los clientes potenciales.", bodyExtras: `<form class="reserva"><input required></form><p>Reserva ahora.</p><a href="https://instagram.com/competidorficticio">IG</a><meta name="viewport" content="w">` }),
  },
  "competidor-ficticio-debil": {
    label: "Competidor ficticio con presencia digital débil",
    htmlText: `<html><head><title>x</title></head><body><table><tr><td>competidor</td></tr></table></body></html>`,
  },
});

export const COMPETITOR_FIXTURE_IDS = Object.freeze(Object.keys(COMPETITOR_FIXTURES));

export function getCompetitorFixture(id) {
  return COMPETITOR_FIXTURES[id] ?? null;
}
