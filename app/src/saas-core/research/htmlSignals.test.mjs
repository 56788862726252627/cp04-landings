import { test } from "node:test";
import assert from "node:assert/strict";

import {
  hasViewportMeta,
  hasManifestLink,
  hasJsonLd,
  getTitleLength,
  getMetaDescriptionLength,
  hasCanonicalLink,
  countHeadings,
  wordCount,
  altAttributeCoverage,
  ariaAttributeCount,
  extractHexColors,
  hasBookingSignal,
  hasContactInfo,
  extractSocialLinks,
  hasMixedContentLinks,
  hasPrivacyPolicyLink,
  hasCookieConsentBanner,
  detectAnalyticsMarkers,
  detectChatWidgetMarkers,
  countCtaKeywords,
  hasNavElement,
  hasHreflangOrLanguageSwitcher,
  countRequiredFormFields,
} from "./htmlSignals.js";

const MODERN_HTML = `<!doctype html><html lang="es"><head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="manifest" href="/manifest.json">
<link rel="canonical" href="https://ejemplo.invalid/">
<title>Clínica Ejemplo — Fisioterapia en Málaga</title>
<meta name="description" content="Clínica de fisioterapia en Málaga con más de 10 años de experiencia y atención personalizada para cada paciente.">
<script type="application/ld+json">{"@type":"LocalBusiness"}</script>
<script>gtag('config','UA-XXX');</script>
</head><body>
<header><nav><a href="/">Inicio</a><a href="/servicios">Servicios</a></nav></header>
<h1>Bienvenido</h1><h2>Nuestros servicios</h2>
<img src="a.jpg" alt="Sala de fisioterapia">
<form class="reserva"><input required name="nombre"><input required name="telefono"></form>
<p>Reserva tu cita ahora. Llámanos al 912345678 o escribe a info@ejemplo.invalid</p>
<a href="https://facebook.com/clinicaejemplo">Facebook</a>
<a href="https://instagram.com/clinicaejemplo">Instagram</a>
<p><a href="/privacidad">Política de privacidad</a></p>
<div class="cookie-banner">Este sitio usa cookies. Aceptar cookies.</div>
</body></html>`;

const OLD_HTML = `<!doctype html><html><head><title>x</title></head><body>
<table><tr><td>Bienvenidos a nuestro club</td></tr></table>
<img src="a.jpg">
<a href="http://otro-sitio.invalid/imagen.jpg">enlace inseguro</a>
</body></html>`;

test("hasViewportMeta detecta el meta viewport moderno y su ausencia en HTML antiguo", () => {
  assert.equal(hasViewportMeta(MODERN_HTML), true);
  assert.equal(hasViewportMeta(OLD_HTML), false);
});

test("hasManifestLink / hasJsonLd detectan PWA y datos estructurados", () => {
  assert.equal(hasManifestLink(MODERN_HTML), true);
  assert.equal(hasJsonLd(MODERN_HTML), true);
  assert.equal(hasManifestLink(OLD_HTML), false);
  assert.equal(hasJsonLd(OLD_HTML), false);
});

test("getTitleLength y getMetaDescriptionLength miden longitudes reales", () => {
  assert.ok(getTitleLength(MODERN_HTML) > 10);
  assert.ok(getMetaDescriptionLength(MODERN_HTML) > 20);
  assert.equal(getTitleLength(OLD_HTML), 1);
  assert.equal(getMetaDescriptionLength(OLD_HTML), 0);
});

test("hasCanonicalLink y countHeadings", () => {
  assert.equal(hasCanonicalLink(MODERN_HTML), true);
  assert.equal(hasCanonicalLink(OLD_HTML), false);
  assert.equal(countHeadings(MODERN_HTML), 2);
  assert.equal(countHeadings(OLD_HTML), 0);
});

test("wordCount cuenta palabras de texto visible, no de las etiquetas", () => {
  assert.ok(wordCount(MODERN_HTML) > 10);
  assert.equal(wordCount("<p></p>"), 0);
});

test("altAttributeCoverage devuelve fracción de imágenes con alt, o null sin imágenes", () => {
  assert.equal(altAttributeCoverage(MODERN_HTML), 1);
  assert.equal(altAttributeCoverage(OLD_HTML), 0);
  assert.equal(altAttributeCoverage("<p>sin imágenes</p>"), null);
});

test("ariaAttributeCount cuenta atributos aria-*", () => {
  assert.equal(ariaAttributeCount('<button aria-label="cerrar" aria-hidden="true">x</button>'), 2);
  assert.equal(ariaAttributeCount(OLD_HTML), 0);
});

test("extractHexColors detecta colores únicos, ignora duplicados", () => {
  const html = '<div style="color:#FF0000;background:#ff0000"></div><span style="color:#00ff00"></span>';
  assert.deepEqual(extractHexColors(html).sort(), ["#00ff00", "#ff0000"]);
});

test("hasBookingSignal detecta palabras clave de reserva o un formulario de reserva", () => {
  assert.equal(hasBookingSignal(MODERN_HTML), true);
  assert.equal(hasBookingSignal(OLD_HTML), false);
});

test("hasContactInfo detecta teléfono o email en el texto visible", () => {
  assert.equal(hasContactInfo(MODERN_HTML), true);
  assert.equal(hasContactInfo(OLD_HTML), false);
});

test("extractSocialLinks detecta redes sociales enlazadas", () => {
  assert.deepEqual(extractSocialLinks(MODERN_HTML).sort(), ["facebook.com", "instagram.com"]);
  assert.deepEqual(extractSocialLinks(OLD_HTML), []);
});

test("hasMixedContentLinks detecta enlaces http:// dentro de una página", () => {
  assert.equal(hasMixedContentLinks(OLD_HTML), true);
  assert.equal(hasMixedContentLinks(MODERN_HTML), false);
});

test("hasPrivacyPolicyLink y hasCookieConsentBanner", () => {
  assert.equal(hasPrivacyPolicyLink(MODERN_HTML), true);
  assert.equal(hasCookieConsentBanner(MODERN_HTML), true);
  assert.equal(hasPrivacyPolicyLink(OLD_HTML), false);
  assert.equal(hasCookieConsentBanner(OLD_HTML), false);
});

test("detectAnalyticsMarkers y detectChatWidgetMarkers", () => {
  assert.ok(detectAnalyticsMarkers(MODERN_HTML).includes("gtag("));
  assert.deepEqual(detectChatWidgetMarkers(MODERN_HTML), []);
});

test("countCtaKeywords cuenta llamadas a la acción reconocidas", () => {
  assert.ok(countCtaKeywords(MODERN_HTML) >= 1);
  assert.equal(countCtaKeywords(OLD_HTML), 0);
});

test("hasNavElement detecta nav/header", () => {
  assert.equal(hasNavElement(MODERN_HTML), true);
  assert.equal(hasNavElement(OLD_HTML), false);
});

test("hasHreflangOrLanguageSwitcher", () => {
  assert.equal(hasHreflangOrLanguageSwitcher('<link hreflang="en" href="/en">'), true);
  assert.equal(hasHreflangOrLanguageSwitcher(OLD_HTML), false);
});

test("countRequiredFormFields cuenta campos obligatorios de formulario", () => {
  assert.equal(countRequiredFormFields(MODERN_HTML), 2);
  assert.equal(countRequiredFormFields(OLD_HTML), 0);
});
