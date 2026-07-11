import { test } from "node:test";
import assert from "node:assert/strict";
import {
  COURTS_DEFAULT,
  BOOKING_HOURS_DEFAULT,
  BOOKING_MODALITIES_DEFAULT,
  BOOKING_LEVELS_DEFAULT,
  CLIENT_CONFIG_DEFAULT,
} from "./clientConfig.default.js";

// Valores literales originales de App.jsx antes de la extracción (Quick
// Win 5) — si estos tests fallan, algo cambió el contenido, no solo su
// ubicación.
const ORIGINAL_COURTS = [
  { id: 1, name: "Pista 1", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 },
  { id: 2, name: "Pista 2", type: "Cristal Pro", price60: 10, price90: 18, price120: 24 },
  { id: 3, name: "Pista 3", type: "Cristal Central", price60: 12, price90: 20, price120: 26 },
  { id: 4, name: "Pista 4", type: "Cristal Central", price60: 12, price90: 20, price120: 26 },
];
const ORIGINAL_BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const ORIGINAL_BOOKING_MODALITIES = ["libre", "partido", "clase", "torneo"];
const ORIGINAL_BOOKING_LEVELS = ["iniciacion", "intermedio", "avanzado", "competicion"];

test("1. cantidad de pistas idéntica a la original (4)", () => {
  assert.equal(COURTS_DEFAULT.length, ORIGINAL_COURTS.length);
  assert.equal(COURTS_DEFAULT.length, 4);
});

test("2. IDs de pista idénticos y en el mismo orden", () => {
  assert.deepEqual(COURTS_DEFAULT.map((c) => c.id), ORIGINAL_COURTS.map((c) => c.id));
  assert.deepEqual(COURTS_DEFAULT.map((c) => c.id), [1, 2, 3, 4]);
});

test("3. nombres de pista idénticos y en el mismo orden", () => {
  assert.deepEqual(COURTS_DEFAULT.map((c) => c.name), ["Pista 1", "Pista 2", "Pista 3", "Pista 4"]);
});

test("4. horarios (BOOKING_HOURS) idénticos, mismo orden, sin franjas inventadas", () => {
  assert.deepEqual(BOOKING_HOURS_DEFAULT, ORIGINAL_BOOKING_HOURS);
  assert.equal(BOOKING_HOURS_DEFAULT.length, 11);
});

test("5. modalidades idénticas", () => {
  assert.deepEqual(BOOKING_MODALITIES_DEFAULT, ORIGINAL_BOOKING_MODALITIES);
});

test("6. niveles idénticos", () => {
  assert.deepEqual(BOOKING_LEVELS_DEFAULT, ORIGINAL_BOOKING_LEVELS);
});

test("7. estructura de cada pista compatible con el consumidor actual (id/name/type/price60/90/120)", () => {
  for (const court of COURTS_DEFAULT) {
    assert.equal(typeof court.id, "number");
    assert.equal(typeof court.name, "string");
    assert.equal(typeof court.type, "string");
    assert.equal(typeof court.price60, "number");
    assert.equal(typeof court.price90, "number");
    assert.equal(typeof court.price120, "number");
  }
});

test("8. ausencia de mutaciones accidentales: todo viene congelado (Object.freeze)", () => {
  assert.equal(Object.isFrozen(COURTS_DEFAULT), true);
  assert.equal(Object.isFrozen(BOOKING_HOURS_DEFAULT), true);
  assert.equal(Object.isFrozen(BOOKING_MODALITIES_DEFAULT), true);
  assert.equal(Object.isFrozen(BOOKING_LEVELS_DEFAULT), true);
  assert.equal(Object.isFrozen(CLIENT_CONFIG_DEFAULT), true);
  for (const court of COURTS_DEFAULT) {
    assert.equal(Object.isFrozen(court), true);
  }
  assert.throws(() => { COURTS_DEFAULT.push({ id: 5, name: "Pista 5", type: "x", price60: 1, price90: 1, price120: 1 }); });
  assert.throws(() => { COURTS_DEFAULT[0].price60 = 999; });
  assert.throws(() => { BOOKING_HOURS_DEFAULT.push("23:00"); });
});

test("9. configuración default válida: forma agregada CLIENT_CONFIG_DEFAULT coincide con los campos del schema (courts/bookingHours)", () => {
  assert.equal(CLIENT_CONFIG_DEFAULT.courts, COURTS_DEFAULT);
  assert.equal(CLIENT_CONFIG_DEFAULT.bookingHours, BOOKING_HOURS_DEFAULT);
  assert.equal(CLIENT_CONFIG_DEFAULT.bookingModalities, BOOKING_MODALITIES_DEFAULT);
  assert.equal(CLIENT_CONFIG_DEFAULT.bookingLevels, BOOKING_LEVELS_DEFAULT);
  // Mismo patrón de validación que config/client-config.schema.json espera
  // para "courts": id (string|integer), name/type (string no vacío).
  for (const court of CLIENT_CONFIG_DEFAULT.courts) {
    assert.ok(["string", "number"].includes(typeof court.id));
    assert.ok(court.name.length > 0);
    assert.ok(court.type.length > 0);
  }
  for (const hour of CLIENT_CONFIG_DEFAULT.bookingHours) {
    assert.match(hour, /^([01][0-9]|2[0-3]):[0-5][0-9]$/);
  }
});

test("10. no regresión: valores exactamente iguales a los que existían en App.jsx antes de la extracción", () => {
  assert.deepEqual(COURTS_DEFAULT, ORIGINAL_COURTS);
  assert.deepEqual(BOOKING_HOURS_DEFAULT, ORIGINAL_BOOKING_HOURS);
  assert.deepEqual(BOOKING_MODALITIES_DEFAULT, ORIGINAL_BOOKING_MODALITIES);
  assert.deepEqual(BOOKING_LEVELS_DEFAULT, ORIGINAL_BOOKING_LEVELS);
});
