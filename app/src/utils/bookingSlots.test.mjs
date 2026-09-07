import test from "node:test";
import assert from "node:assert/strict";

import {
  BOOKING_HOURS,
  BOOKING_DURATIONS,
  CLUB_CLOSING_MINUTES,
  getAvailableDurationsForHour,
} from "./bookingSlots.js";

// --- Franjas horarias completas ---

test("BOOKING_HOURS contiene exactamente 15 franjas (08:00–22:00)", () => {
  assert.equal(BOOKING_HOURS.length, 15);
});

test("BOOKING_HOURS incluye 13:00", () => {
  assert.ok(BOOKING_HOURS.includes("13:00"));
});

test("BOOKING_HOURS incluye 14:00", () => {
  assert.ok(BOOKING_HOURS.includes("14:00"));
});

test("BOOKING_HOURS incluye 15:00", () => {
  assert.ok(BOOKING_HOURS.includes("15:00"));
});

test("BOOKING_HOURS incluye 16:00", () => {
  assert.ok(BOOKING_HOURS.includes("16:00"));
});

test("BOOKING_HOURS incluye todas las franjas de 08:00 a 22:00 sin huecos", () => {
  const expected = [
    "08:00","09:00","10:00","11:00","12:00",
    "13:00","14:00","15:00","16:00",
    "17:00","18:00","19:00","20:00","21:00","22:00",
  ];
  assert.deepEqual(BOOKING_HOURS, expected);
});

test("BOOKING_HOURS no incluye franjas fuera de rango (p.ej. 07:00 o 23:00)", () => {
  assert.ok(!BOOKING_HOURS.includes("07:00"));
  assert.ok(!BOOKING_HOURS.includes("23:00"));
});

// --- CLUB_CLOSING_MINUTES ---

test("CLUB_CLOSING_MINUTES es 1380 (23 * 60)", () => {
  assert.equal(CLUB_CLOSING_MINUTES, 1380);
});

// --- getAvailableDurationsForHour ---

test("22:00 solo permite 60 minutos", () => {
  assert.deepEqual(getAvailableDurationsForHour("22:00"), [60]);
});

test("22:00 con 60 min termina en 23:00 (válido)", () => {
  const durations = getAvailableDurationsForHour("22:00");
  assert.ok(durations.includes(60));
});

test("22:00 NO incluye 90 min (terminaría a las 23:30)", () => {
  const durations = getAvailableDurationsForHour("22:00");
  assert.ok(!durations.includes(90));
});

test("22:00 NO incluye 120 min (terminaría a las 00:00)", () => {
  const durations = getAvailableDurationsForHour("22:00");
  assert.ok(!durations.includes(120));
});

test("21:00 permite 60, 90 y 120 min (todas terminan a las 23:00 o antes)", () => {
  assert.deepEqual(getAvailableDurationsForHour("21:00"), [60, 90, 120]);
});

test("20:00 permite 60, 90 y 120 min", () => {
  assert.deepEqual(getAvailableDurationsForHour("20:00"), [60, 90, 120]);
});

test("13:00 permite 60, 90 y 120 min", () => {
  assert.deepEqual(getAvailableDurationsForHour("13:00"), [60, 90, 120]);
});

test("14:00 permite 60, 90 y 120 min", () => {
  assert.deepEqual(getAvailableDurationsForHour("14:00"), [60, 90, 120]);
});

test("15:00 permite 60, 90 y 120 min", () => {
  assert.deepEqual(getAvailableDurationsForHour("15:00"), [60, 90, 120]);
});

test("16:00 permite 60, 90 y 120 min", () => {
  assert.deepEqual(getAvailableDurationsForHour("16:00"), [60, 90, 120]);
});

test("hora inválida (undefined) devuelve todas las duraciones", () => {
  assert.deepEqual(getAvailableDurationsForHour(undefined), BOOKING_DURATIONS);
});

test("hora inválida (string vacío) devuelve todas las duraciones", () => {
  assert.deepEqual(getAvailableDurationsForHour(""), BOOKING_DURATIONS);
});

// --- Consistencia roles: misma parrilla para todos ---

test("la parrilla de franjas es idéntica sin importar el rol (lista única hardcodeada)", () => {
  // BOOKING_HOURS es una constante, no depende de ningún parámetro de rol.
  // Este test documenta la invariante: todos los roles ven la misma lista.
  const rolesSimulados = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];
  for (const rol of rolesSimulados) {
    assert.deepEqual(
      BOOKING_HOURS,
      ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"],
      `rol ${rol} debe ver la misma parrilla`
    );
  }
});

test("la parrilla de franjas es idéntica en modo demo y sesión real (misma constante)", () => {
  const modos = ["demo", "real"];
  for (const modo of modos) {
    assert.deepEqual(
      BOOKING_HOURS.length, 15,
      `modo ${modo} debe tener 15 franjas`
    );
  }
});
