import test from "node:test";
import assert from "node:assert/strict";

import { evaluateSlotAvailability, AVAILABILITY_STATUS, AVAILABILITY_REASON } from "./availability.js";

// Cierre 23:00, apertura discreta con hueco de mediodía (13:00-16:00
// excluido) — fixture propio de este test para comprobar que el motor
// rechaza correctamente un startTime fuera de allowedStartTimes. NO refleja
// BOOKING_HOURS de App.jsx (que sí incluye 13:00-16:00, ver fix
// vite-watcher-fix 2026-08-10), duraciones válidas 60/90/120.
const OPENING_HOURS = {
  closingMinutes: 23 * 60,
  allowedStartTimes: ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"],
  allowedDurations: [60, 90, 120],
};

// "Ahora" fijo para tests deterministas: 2026-07-06 10:00 (lunes).
const NOW = new Date(Date.UTC(2026, 6, 6, 10, 0));

function evaluate(overrides = {}) {
  return evaluateSlotAvailability({
    date: "2026-07-06",
    startTime: "20:00",
    durationMinutes: 60,
    courtId: "Pista 1",
    existingBookings: [],
    openingHours: OPENING_HOURS,
    currentDateTime: NOW,
    ...overrides,
  });
}

test("1. domingo siempre unavailable/club_closed, sin importar hora ni ocupación", () => {
  const result = evaluate({ date: "2026-07-12", startTime: "10:00" }); // 12 jul 2026 es domingo
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.CLUB_CLOSED);
});

test("2. hora pasada (hoy) -> unavailable/past_time", () => {
  const result = evaluate({ date: "2026-07-06", startTime: "09:00" }); // NOW=10:00, 09:00 ya pasó
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.PAST_TIME);
});

test("3. cierre 23:00: 22:00 + 60 min es válido (available)", () => {
  const result = evaluate({ startTime: "22:00", durationMinutes: 60 });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
  assert.equal(result.reason, null);
});

test("4. cierre 23:00: 22:00 + 90 min -> unavailable/insufficient_remaining_time", () => {
  const result = evaluate({ startTime: "22:00", durationMinutes: 90 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

test("5. cierre 23:00: 22:00 + 120 min -> unavailable/insufficient_remaining_time", () => {
  const result = evaluate({ startTime: "22:00", durationMinutes: 120 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

test("6. solapamiento exacto (misma hora y duración) -> occupied/booking_overlap", () => {
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    existingBookings: [{ courtId: "Pista 1", date: "2026-07-06", startTime: "20:00", endTime: "21:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.OCCUPIED);
  assert.equal(result.reason, AVAILABILITY_REASON.BOOKING_OVERLAP);
});

test("7. solapamiento parcial al inicio del intervalo solicitado -> occupied", () => {
  // Existente 19:30-20:30 (guardado como minutos exactos), solicitado 20:00-21:00.
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    existingBookings: [{ courtId: "Pista 1", date: "2026-07-06", startMinutes: 19 * 60 + 30, endMinutes: 20 * 60 + 30 }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.OCCUPIED);
  assert.equal(result.reason, AVAILABILITY_REASON.BOOKING_OVERLAP);
});

test("8. solapamiento parcial al final del intervalo solicitado -> occupied", () => {
  // Existente 20:30-21:30, solicitado 20:00-21:00.
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    existingBookings: [{ courtId: "Pista 1", date: "2026-07-06", startMinutes: 20 * 60 + 30, endMinutes: 21 * 60 + 30 }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.OCCUPIED);
  assert.equal(result.reason, AVAILABILITY_REASON.BOOKING_OVERLAP);
});

test("9. reserva adyacente sin solapamiento (termina justo cuando empieza la nueva) -> available", () => {
  // Existente 19:00-20:00, solicitado 20:00-21:00: no se solapan (adyacentes).
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    existingBookings: [{ courtId: "Pista 1", date: "2026-07-06", startTime: "19:00", endTime: "20:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("10. slot libre sin ninguna reserva existente -> available", () => {
  const result = evaluate({ startTime: "18:00", durationMinutes: 90, existingBookings: [] });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
  assert.equal(result.reason, null);
});

test("11. duración inválida (no está en allowedDurations) -> unavailable/invalid_duration", () => {
  const result = evaluate({ durationMinutes: 45 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.INVALID_DURATION);
});

test("12. fuera de horario (hueco de mediodía, 13:00 no es un inicio permitido) -> unavailable/outside_opening_hours", () => {
  const result = evaluate({ startTime: "13:00", durationMinutes: 60 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.OUTSIDE_OPENING_HOURS);
});

// --- Extra: solapamiento con otra pista no debe afectar (distinto courtId) ---
test("extra: una reserva en otra pista no genera solapamiento", () => {
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    courtId: "Pista 1",
    existingBookings: [{ courtId: "Pista 2", date: "2026-07-06", startTime: "20:00", endTime: "21:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
});

// --- Extra: fecha inválida ---
test("extra: fecha con formato inválido -> unavailable/invalid_date", () => {
  const result = evaluate({ date: "no-es-una-fecha" });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.INVALID_DATE);
});

// --- Extra: fecha completamente pasada (no solo hora) ---
test("extra: fecha de un día anterior a hoy -> unavailable/past_time", () => {
  const result = evaluate({ date: "2026-07-01", startTime: "20:00" });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.PAST_TIME);
});

// --- PASO 07E: cierre temporal de pista (closures, opcional, default []) ---

test("07E-1. sin closures (default []) el comportamiento no cambia respecto a antes de este paso", () => {
  const result = evaluate({ startTime: "20:00", durationMinutes: 60 });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
  assert.equal(result.reason, null);
});

test("07E-2. cierre que cubre exactamente el slot solicitado -> unavailable/court_closed", () => {
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    closures: [{ pista: "Pista 1", fecha_inicio: "2026-07-06", hora_inicio: "18:00", fecha_fin: "2026-07-06", hora_fin: "22:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.COURT_CLOSED);
});

test("07E-3. cierre de otra pista no afecta (courtId distinto)", () => {
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    courtId: "Pista 1",
    closures: [{ pista: "Pista 2", fecha_inicio: "2026-07-06", hora_inicio: "18:00", fecha_fin: "2026-07-06", hora_fin: "22:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("07E-4. cierre con pista='todas' bloquea cualquier courtId", () => {
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    courtId: "Pista 3",
    closures: [{ pista: "todas", fecha_inicio: "2026-07-06", hora_inicio: "18:00", fecha_fin: "2026-07-06", hora_fin: "22:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.COURT_CLOSED);
});

test("07E-5. cierre en otra fecha no afecta", () => {
  const result = evaluate({
    date: "2026-07-06",
    startTime: "20:00",
    durationMinutes: 60,
    closures: [{ pista: "Pista 1", fecha_inicio: "2026-07-07", hora_inicio: "00:00", fecha_fin: "2026-07-07", hora_fin: "23:59" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("07E-6. cierre multi-día: día intermedio queda cerrado el día completo (fuera del tramo horario indicado en los bordes)", () => {
  const result = evaluate({
    date: "2026-07-07",
    startTime: "08:00",
    durationMinutes: 60,
    closures: [{ pista: "Pista 1", fecha_inicio: "2026-07-06", hora_inicio: "20:00", fecha_fin: "2026-07-08", hora_fin: "10:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.COURT_CLOSED);
});

test("07E-7. cierre multi-día: día de borde final solo bloquea antes de hora_fin, disponible después", () => {
  const result = evaluate({
    date: "2026-07-08",
    startTime: "17:00",
    durationMinutes: 60,
    closures: [{ pista: "Pista 1", fecha_inicio: "2026-07-06", hora_inicio: "20:00", fecha_fin: "2026-07-08", hora_fin: "10:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("07E-8. cierre bloquea el slot aunque no exista ninguna reserva solapada (distinto de booking_overlap)", () => {
  const result = evaluate({
    startTime: "20:00",
    durationMinutes: 60,
    existingBookings: [],
    closures: [{ pista: "Pista 1", fecha_inicio: "2026-07-06", hora_inicio: "18:00", fecha_fin: "2026-07-06", hora_fin: "22:00" }],
  });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.COURT_CLOSED);
  assert.notEqual(result.reason, AVAILABILITY_REASON.BOOKING_OVERLAP);
});

// --- Réplica exacta de la config real de producción (App.jsx) -------------
//
// A diferencia del fixture OPENING_HOURS de arriba (que deja fuera
// 13:00-16:00 a propósito, solo para probar el motor genérico), esto es una
// copia literal de BOOKING_HOURS/BOOKING_DURATIONS/CLUB_CLOSING_MINUTES tal
// como están hoy en App.jsx:121-129, para reproducir EXACTAMENTE la llamada
// real que hacen CalendarioDisponibilidad (App.jsx ~línea 766) y
// getSlotStatus (App.jsx:338, usado por los <select> de hora en Reservar y
// Reprogramar). Si BOOKING_HOURS cambia en App.jsx, esta lista debe
// actualizarse a mano en el mismo cambio.
const REAL_BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const REAL_OPENING_HOURS = {
  closingMinutes: 23 * 60,
  allowedStartTimes: REAL_BOOKING_HOURS,
  allowedDurations: [60, 90, 120],
};

// Valor inicial real del formulario en Reservas()/ReprogramarReserva()
// (App.jsx:3457 y 3675: `duracion_minutos: "90"`) — el que ve cualquier
// usuario al abrir la pantalla, antes de tocar el selector de duración.
const REAL_UI_DEFAULT_DURATION = 90;

function evaluateReal({ startTime, durationMinutes, date = "2026-07-06", courtId = "Pista 1", existingBookings = [] }) {
  return evaluateSlotAvailability({
    date,
    startTime,
    durationMinutes,
    courtId,
    existingBookings,
    openingHours: REAL_OPENING_HOURS,
    currentDateTime: NOW,
  });
}

test("UI-real 1. estado inicial de la pantalla (duración por defecto 90 min, sin tocar el selector): 22:00 aparece 'No disponible' en las 4 pistas — esto es el comportamiento esperado, no un bug (22:00+90 supera el cierre de 23:00)", () => {
  for (const pista of ["Pista 1", "Pista 2", "Pista 3", "Pista 4"]) {
    const result = evaluateReal({ startTime: "22:00", durationMinutes: REAL_UI_DEFAULT_DURATION, courtId: pista });
    assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE, `${pista}: ${result.status}/${result.reason}`);
    assert.equal(result.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME, `${pista}: ${result.status}/${result.reason}`);
  }
});

test("UI-real 2. tras cambiar el selector de duración a 60 min, 22:00 pasa a disponible en las 4 pistas (la UI reacciona correctamente al cambio de duración)", () => {
  for (const pista of ["Pista 1", "Pista 2", "Pista 3", "Pista 4"]) {
    const result = evaluateReal({ startTime: "22:00", durationMinutes: 60, courtId: pista });
    assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE, `${pista}: ${result.status}/${result.reason}`);
  }
});

test("UI-real 3. 22:00 + 90 min sigue bloqueado explícitamente (no solo por el default)", () => {
  const result = evaluateReal({ startTime: "22:00", durationMinutes: 90 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

test("UI-real 4. 22:00 + 120 min bloqueado", () => {
  const result = evaluateReal({ startTime: "22:00", durationMinutes: 120 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

test("UI-real 5. 21:00 admite 60/90/120 sin ocupación previa", () => {
  for (const durationMinutes of [60, 90, 120]) {
    const result = evaluateReal({ startTime: "21:00", durationMinutes });
    assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE, `21:00+${durationMinutes}: ${result.status}/${result.reason}`);
  }
});

test("UI-real 6. 23:00 nunca es un inicio válido (no está en BOOKING_HOURS)", () => {
  assert.equal(REAL_BOOKING_HOURS.includes("23:00"), false);
  const result = evaluateReal({ startTime: "23:00", durationMinutes: 60 });
  assert.equal(result.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(result.reason, AVAILABILITY_REASON.OUTSIDE_OPENING_HOURS);
});

test("UI-real 7. 13:00-16:00 disponibles en las 4 pistas con la duración por defecto de la UI (90 min), sin ocupación", () => {
  for (const pista of ["Pista 1", "Pista 2", "Pista 3", "Pista 4"]) {
    for (const startTime of ["13:00", "14:00", "15:00", "16:00"]) {
      const result = evaluateReal({ startTime, durationMinutes: REAL_UI_DEFAULT_DURATION, courtId: pista });
      assert.equal(result.status, AVAILABILITY_STATUS.AVAILABLE, `${pista} ${startTime}: ${result.status}/${result.reason}`);
    }
  }
});
