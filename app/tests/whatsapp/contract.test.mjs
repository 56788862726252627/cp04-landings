import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizePhoneNumber, resolveTemplate, buildTemplateComponents } from "../../worker-reservas/messaging/whatsapp-adapter.mock.js";
import { WHATSAPP_TEMPLATES } from "../../worker-reservas/messaging/whatsapp-contract.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");
const FIXTURES = path.join(APP_ROOT, "fixtures/whatsapp");

function load(relPath) {
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(FIXTURES, relPath), "utf8"));
  return fixture;
}

// --- normalizePhoneNumber -------------------------------------------------

test("normalizePhoneNumber: ya en E.164, se devuelve tal cual", () => {
  const result = normalizePhoneNumber("+34600000001");
  assert.equal(result.valid, true);
  assert.equal(result.e164, "+34600000001");
});

test("normalizePhoneNumber: limpia espacios, guiones y paréntesis", () => {
  const result = normalizePhoneNumber("+34 (600) 000-001");
  assert.equal(result.valid, true);
  assert.equal(result.e164, "+34600000001");
});

test("normalizePhoneNumber: prefijo 00 se convierte a +", () => {
  const result = normalizePhoneNumber("0034600000001");
  assert.equal(result.valid, true);
  assert.equal(result.e164, "+34600000001");
});

test("normalizePhoneNumber: sin '+' ni '00' y sin defaultCountryCode -> inválido, nunca adivina el país", () => {
  const fixture = load("consent/invalid-phone.json");
  const result = normalizePhoneNumber(fixture.raw_input);
  assert.equal(result.valid, false);
  assert.equal(result.reason, fixture.expected_reason_without_default_country_code);
});

test("normalizePhoneNumber: sin '+' pero con defaultCountryCode -> se completa correctamente", () => {
  const result = normalizePhoneNumber("600000022", "34");
  assert.equal(result.valid, true);
  assert.equal(result.e164, "+34600000022");
});

test("normalizePhoneNumber: entrada vacía es inválida", () => {
  assert.equal(normalizePhoneNumber("").valid, false);
  assert.equal(normalizePhoneNumber("   ").valid, false);
});

// --- resolveTemplate -------------------------------------------------------

test("resolveTemplate: todas las 10 plantillas del registro se resuelven con su idioma por defecto", () => {
  for (const templateName of Object.keys(WHATSAPP_TEMPLATES)) {
    const result = resolveTemplate(templateName);
    assert.equal(result.found, true, templateName);
    assert.equal(result.template.name, templateName);
  }
});

test("resolveTemplate: unsupported_template para un nombre fuera del registro", () => {
  const result = resolveTemplate("membership_upgrade_offer");
  assert.equal(result.found, false);
  assert.equal(result.reason, "unsupported_template");
});

test("resolveTemplate: wrong_locale para un idioma fuera de SUPPORTED_LANGUAGES", () => {
  const result = resolveTemplate("reminder_24h", "fr");
  assert.equal(result.found, false);
  assert.equal(result.reason, "wrong_locale");
});

test("resolveTemplate: acepta un idioma explícito soportado distinto del por defecto", () => {
  const result = resolveTemplate("reminder_24h", "en");
  assert.equal(result.found, true);
  assert.equal(result.template.language, "en");
});

// --- buildTemplateComponents ------------------------------------------------

test("buildTemplateComponents: las 10 plantillas con sus fixtures válidos producen components sin errores", () => {
  const files = [
    "templates/01-booking-confirmed.json",
    "templates/02-booking-cancelled.json",
    "templates/03-booking-rescheduled.json",
    "templates/04-reminder-24h.json",
    "templates/05-reminder-2h.json",
    "templates/06-tournament-update.json",
    "templates/07-waitlist-slot-available.json",
    "templates/08-incident-notice.json",
    "templates/09-faq-response.json",
    "templates/10-opt-out-ack.json",
  ];
  for (const file of files) {
    const fixture = load(file);
    const result = buildTemplateComponents(fixture.template_name, fixture.variables);
    assert.equal(result.valid, true, `${file}: ${JSON.stringify(result.errors)}`);
  }
});

test("buildTemplateComponents: opt_out_ack (sin variables) produce components:[] sin error", () => {
  const result = buildTemplateComponents("opt_out_ack", {});
  assert.equal(result.valid, true);
  assert.deepEqual(result.components, []);
});

test("buildTemplateComponents: missing-variable.json reporta exactamente el campo que falta", () => {
  const fixture = load("negative/missing-variable.json");
  const result = buildTemplateComponents(fixture.template_name, fixture.variables);
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["missing_variable:booking_reference"]);
});

test("buildTemplateComponents: valor que excede maxLength se rechaza como variable_too_long", () => {
  const tooLong = "x".repeat(500);
  const result = buildTemplateComponents("incident_notice", { incident_summary: tooLong });
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["variable_too_long:incident_summary"]);
});

test("buildTemplateComponents: plantilla desconocida devuelve unsupported_template", () => {
  const result = buildTemplateComponents("membership_upgrade_offer", {});
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["unsupported_template"]);
});
