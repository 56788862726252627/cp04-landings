import test from "node:test";
import assert from "node:assert/strict";

import {
  isSlotFreeFromOccupancy,
  resolveHoraAfterContextChange,
  effectiveDurationForSlot,
} from "./reservasSlotValidation.js";
import { getAvailableDurationsForHour } from "./bookingSlots.js";
import { evaluateSlotAvailability, AVAILABILITY_STATUS, AVAILABILITY_REASON } from "./availability.js";

// ─── isSlotFreeFromOccupancy ────────────────────────────────────────────────

test("slot ocupado → no libre para reservar", () => {
  const ocupadas = new Set(["2026-08-24|Pista 4|22:00"]);
  assert.equal(isSlotFreeFromOccupancy("2026-08-24", "22:00", "Pista 4", ocupadas), false);
});

test("slot no ocupado → libre para reservar", () => {
  const ocupadas = new Set();
  assert.equal(isSlotFreeFromOccupancy("2026-08-24", "22:00", "Pista 4", ocupadas), true);
});

test("slot ocupado en otra pista no afecta a la pista libre", () => {
  const ocupadas = new Set(["2026-08-24|Pista 1|22:00"]);
  assert.equal(isSlotFreeFromOccupancy("2026-08-24", "22:00", "Pista 4", ocupadas), true);
});

test("slot ocupado en otra fecha no afecta a la fecha libre", () => {
  const ocupadas = new Set(["2026-08-25|Pista 4|22:00"]);
  assert.equal(isSlotFreeFromOccupancy("2026-08-24", "22:00", "Pista 4", ocupadas), true);
});

test("slot libre a las 22:00 ofrece solo 60 minutos (via getAvailableDurationsForHour)", () => {
  const ocupadas = new Set();
  assert.equal(isSlotFreeFromOccupancy("2026-08-24", "22:00", "Pista 4", ocupadas), true);
  assert.deepEqual(getAvailableDurationsForHour("22:00"), [60]);
});

test("slot ocupado en hora diferente no bloquea 22:00", () => {
  const ocupadas = new Set(["2026-08-24|Pista 4|10:00"]);
  assert.equal(isSlotFreeFromOccupancy("2026-08-24", "22:00", "Pista 4", ocupadas), true);
});

// ─── resolveHoraAfterContextChange ─────────────────────────────────────────

test("hora actual sigue siendo válida: no cambia tras cambio de fecha/pista", () => {
  const ocupadas = new Set();
  assert.equal(
    resolveHoraAfterContextChange("2026-08-25", "Pista 4", "22:00", ocupadas),
    "22:00"
  );
});

test("hora ocupada tras cambio de fecha: usa la primera franja libre", () => {
  const ocupadas = new Set(["2026-08-25|Pista 4|10:00"]);
  const result = resolveHoraAfterContextChange("2026-08-25", "Pista 4", "10:00", ocupadas);
  assert.equal(result, "08:00");
});

test("cambio de pista con hora ocupada en la nueva pista: usa primera libre", () => {
  const ocupadas = new Set(["2026-08-24|Pista 2|10:00"]);
  const result = resolveHoraAfterContextChange("2026-08-24", "Pista 2", "10:00", ocupadas);
  assert.equal(result, "08:00");
});

test("las dos primeras franjas ocupadas: fallback a la tercera disponible", () => {
  const ocupadas = new Set([
    "2026-08-25|Pista 4|08:00",
    "2026-08-25|Pista 4|09:00",
  ]);
  const result = resolveHoraAfterContextChange("2026-08-25", "Pista 4", "08:00", ocupadas);
  assert.equal(result, "10:00");
});

test("slot libre a las 22:00 sigue siendo 22:00 tras cambio de contexto", () => {
  const ocupadas = new Set(["2026-08-25|Pista 4|10:00"]);
  const result = resolveHoraAfterContextChange("2026-08-25", "Pista 4", "22:00", ocupadas);
  assert.equal(result, "22:00");
});

test("devuelve null si todos los slots están ocupados", () => {
  const allOccupied = new Set(
    ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00",
     "17:00","18:00","19:00","20:00","21:00","22:00"].map(h => `2026-08-24|Pista 1|${h}`)
  );
  const result = resolveHoraAfterContextChange("2026-08-24", "Pista 1", "10:00", allOccupied);
  assert.equal(result, null);
});

// ─── effectiveDurationForSlot ───────────────────────────────────────────────
// La función SIEMPRE devuelve la duración mínima válida (normalmente 60 min),
// independientemente de la duración seleccionada en el formulario.
// Semántica: "¿puede INICIARSE alguna reserva en este slot?" (no "¿cabe mi
// duración seleccionada?").

test("22:00: effectiveDuration = 60 (única duración válida antes del cierre)", () => {
  assert.equal(effectiveDurationForSlot("22:00"), 60);
});

test("21:00: effectiveDuration = 60 (mínimo, aunque 90 y 120 también cabrían)", () => {
  assert.equal(effectiveDurationForSlot("21:00"), 60);
});

test("10:00: effectiveDuration = 60 (mínimo siempre)", () => {
  assert.equal(effectiveDurationForSlot("10:00"), 60);
});

test("08:00: effectiveDuration = 60 (primera franja)", () => {
  assert.equal(effectiveDurationForSlot("08:00"), 60);
});

test("13:00: effectiveDuration = 60 (franja de 'pausa' incluida sin excepciones)", () => {
  assert.equal(effectiveDurationForSlot("13:00"), 60);
});

// ─── Coherencia tarjeta / selector / canProceed (req f) ───────────────────
// Verifica que el mismo evaluateSlotAvailability produce estado consistente
// cuando se usa effectiveDurationForSlot (calendario) vs la duración real (form).

const REAL_CONFIG = {
  closingMinutes: 23 * 60,
  allowedStartTimes: [
    "08:00","09:00","10:00","11:00","12:00",
    "13:00","14:00","15:00","16:00",
    "17:00","18:00","19:00","20:00","21:00","22:00",
  ],
  allowedDurations: [60, 90, 120],
};
const NOW_F = new Date(Date.UTC(2026, 7, 23, 12, 0));

// evalCalendario usa siempre effectiveDurationForSlot (mínimo válido),
// independientemente de la duración seleccionada en el form.
function evalCalendario(hora, courtId, existingBookings = [], closures = []) {
  const dur = effectiveDurationForSlot(hora);
  return evaluateSlotAvailability({
    date: "2026-08-24",
    startTime: hora,
    durationMinutes: dur,
    courtId,
    existingBookings,
    openingHours: REAL_CONFIG,
    currentDateTime: NOW_F,
    closures,
  });
}

test("f1: 22:00 libre → calendario AVAILABLE (tarjeta 'Libre'), selector habilitado", () => {
  const r = evalCalendario("22:00", "Pista 1");
  assert.equal(r.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("f2: 22:00 ocupada → calendario OCCUPIED, selector deshabilitado", () => {
  const r = evalCalendario("22:00", "Pista 1", [
    { courtId: "Pista 1", date: "2026-08-24", startTime: "22:00", endTime: "23:00" },
  ]);
  assert.equal(r.status, AVAILABILITY_STATUS.OCCUPIED);
});

test("f3: 22:00 libre, dur=60 (form tras selección) → getAvailableDurationsForHour=[60], canProceed=true", () => {
  // Simula el estado del formulario cuando usuario selecciona 22:00:
  // la duración se ajusta automáticamente a 60.
  const durs = getAvailableDurationsForHour("22:00");
  assert.deepEqual(durs, [60]);
  // Con esa duración, la evaluación del formulario también devuelve AVAILABLE:
  const r = evaluateSlotAvailability({
    date: "2026-08-24",
    startTime: "22:00",
    durationMinutes: 60,
    courtId: "Pista 1",
    existingBookings: [],
    openingHours: REAL_CONFIG,
    currentDateTime: NOW_F,
  });
  assert.equal(r.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("f4: cierre temporal 22:00 → calendario UNAVAILABLE, tarjeta 'No disponible', review bloqueado", () => {
  const r = evalCalendario("22:00", "Pista 1", [], [
    { pista: "Pista 1", fecha_inicio: "2026-08-24", hora_inicio: "21:00", fecha_fin: "2026-08-24", hora_fin: "23:00" },
  ]);
  assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(r.reason, AVAILABILITY_REASON.COURT_CLOSED);
});

// ─── Regresión intervalos semiabiertos ─────────────────────────────────────
// CASO REAL QA: 2026-09-24 / Pista 4 / reserva [22:00, 23:00) 60 min.
// Antes del fix, con form.duration=90, el calendario marcaba 21:00 como
// OCCUPIED porque 21:00+90=22:30 solapaba con [22:00, 23:00). Con la
// duración mínima (60) el límite 21:00+60=22:00 es exactamente existingStart,
// y por la semántica semiabierta (requestedEnd > existingStart es estricto)
// NO hay solapamiento → 21:00 queda AVAILABLE.

const NOW_INT = new Date(Date.UTC(2026, 8, 23, 10, 0)); // 2026-09-23 10:00 UTC
const REAL_BOOKING_2209 = [
  { courtId: "Pista 4", date: "2026-09-24", startTime: "22:00", endTime: "23:00" },
];

function evalInt(hora, pista, bookings) {
  return evaluateSlotAvailability({
    date: "2026-09-24",
    startTime: hora,
    durationMinutes: effectiveDurationForSlot(hora),
    courtId: pista,
    existingBookings: bookings,
    openingHours: REAL_CONFIG,
    currentDateTime: NOW_INT,
  });
}

test("INT-1: reserva [22:00,23:00) en Pista 4 → 22:00 OCCUPIED (franja directa)", () => {
  assert.equal(evalInt("22:00", "Pista 4", REAL_BOOKING_2209).status, AVAILABILITY_STATUS.OCCUPIED);
});

test("INT-2 [REGRESIÓN]: reserva [22:00,23:00) en Pista 4 → 21:00 AVAILABLE (intervalo semiabierto)", () => {
  // 21:00 + 60min = 22:00; requestedEnd(1320) > existingStart(1320) es FALSE → sin solapamiento
  assert.equal(evalInt("21:00", "Pista 4", REAL_BOOKING_2209).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("INT-3: reserva [22:00,23:00) en Pista 4 → 20:00 AVAILABLE (no hay solapamiento con 60min)", () => {
  assert.equal(evalInt("20:00", "Pista 4", REAL_BOOKING_2209).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("INT-4: reserva [21:00,22:00) en Pista 4 → 21:00 OCCUPIED, 22:00 AVAILABLE", () => {
  const booking = [{ courtId: "Pista 4", date: "2026-09-24", startTime: "21:00", endTime: "22:00" }];
  assert.equal(evalInt("21:00", "Pista 4", booking).status, AVAILABILITY_STATUS.OCCUPIED);
  // 22:00+60=23:00 > 21:00 Y 22:00 < 22:00 es FALSE → sin solapamiento
  assert.equal(evalInt("22:00", "Pista 4", booking).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("INT-5: reserva [21:00,22:30) 90min → 21:00 y 22:00 OCCUPIED (solapamiento real)", () => {
  const booking = [{ courtId: "Pista 4", date: "2026-09-24", startTime: "21:00", endTime: "22:30" }];
  // 21:00+60=22:00 > 21:00 → solapa
  assert.equal(evalInt("21:00", "Pista 4", booking).status, AVAILABILITY_STATUS.OCCUPIED);
  // 22:00+60=23:00 > 21:00 Y 22:00 < 22:30 → solapa
  assert.equal(evalInt("22:00", "Pista 4", booking).status, AVAILABILITY_STATUS.OCCUPIED);
});

test("INT-6: reserva en Pista 1 no afecta a Pista 4 (aislamiento de pista)", () => {
  const booking = [{ courtId: "Pista 1", date: "2026-09-24", startTime: "22:00", endTime: "23:00" }];
  assert.equal(evalInt("22:00", "Pista 4", booking).status, AVAILABILITY_STATUS.AVAILABLE);
  assert.equal(evalInt("21:00", "Pista 4", booking).status, AVAILABILITY_STATUS.AVAILABLE);
});
