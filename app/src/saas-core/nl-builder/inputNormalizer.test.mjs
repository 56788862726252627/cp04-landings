import { test } from "node:test";
import assert from "node:assert/strict";

import { normalizeInput, MAX_INPUT_LENGTH } from "./inputNormalizer.js";

test("detecta español, ciudad, país, moneda y timezone en una petición típica", () => {
  const r = normalizeInput("Crea un SaaS para una clínica de fisioterapia de Málaga con reservas y recordatorios.");
  assert.equal(r.language, "es");
  assert.equal(r.detectedCity, "Málaga");
  assert.equal(r.country, "ES");
  assert.equal(r.currency, "EUR");
  assert.equal(r.timezone, "Europe/Madrid");
});

test("detecta inglés básico y ciudad en inglés", () => {
  const r = normalizeInput("Create a SaaS for a dental clinic in London with bookings and reminders.");
  assert.equal(r.language, "en");
  assert.equal(r.detectedCity, "London");
  assert.equal(r.country, "GB");
  assert.equal(r.currency, "GBP");
});

test("entrada vacía no lanza y se marca isEmpty", () => {
  const r = normalizeInput("");
  assert.equal(r.isEmpty, true);
  assert.equal(r.language, "es");
  assert.equal(r.country, "ES");
});

test("entrada no-string (undefined) se trata como vacía sin lanzar", () => {
  const r = normalizeInput(undefined);
  assert.equal(r.isEmpty, true);
});

test("entrada muy larga se trunca a MAX_INPUT_LENGTH y se marca truncated", () => {
  const longText = "clínica dental de Málaga ".repeat(2000);
  assert.ok(longText.length > MAX_INPUT_LENGTH);
  const r = normalizeInput(longText);
  assert.equal(r.truncated, true);
  assert.ok(r.cleanedText.length <= MAX_INPUT_LENGTH);
});

test("colapsa espacios y saltos de línea múltiples", () => {
  const r = normalizeInput("Crea   un\n\nSaaS    para  \t una clínica");
  assert.equal(r.cleanedText, "Crea un SaaS para una clínica");
});

test("detecta canales (whatsapp, web) y plataformas (pwa)", () => {
  const r = normalizeInput("Necesito recordatorios por WhatsApp, una landing web y una PWA");
  assert.ok(r.channels.includes("whatsapp"));
  assert.ok(r.channels.includes("web"));
  assert.ok(r.platforms.includes("pwa"));
});

test("detecta restricciones explícitas: sin Stripe, sin WhatsApp", () => {
  const r = normalizeInput("Quiero reservas pero sin conectar Stripe todavía, y sin WhatsApp por ahora.");
  assert.ok(r.restrictions.includes("no_stripe"));
  assert.ok(r.restrictions.includes("no_whatsapp"));
});

test("caracteres especiales y acentos no rompen la normalización", () => {
  const r = normalizeInput("¿Puedes crear una peluquería con estética, uñas y depilación láser? ¡Gracias!");
  assert.equal(r.language, "es");
  assert.ok(r.cleanedText.includes("¿Puedes"));
});

test("sin ciudad detectada, usa país/moneda/timezone por defecto (ES/EUR/Europe/Madrid)", () => {
  const r = normalizeInput("Crea un SaaS para un negocio local con reservas.");
  assert.equal(r.detectedCity, null);
  assert.equal(r.country, "ES");
  assert.equal(r.currency, "EUR");
  assert.equal(r.timezone, "Europe/Madrid");
});
