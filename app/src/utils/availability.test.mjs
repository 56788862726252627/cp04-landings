import test from "node:test";
import assert from "node:assert/strict";

import { evaluateSlotAvailability, AVAILABILITY_STATUS, AVAILABILITY_REASON } from "./availability.js";

// Cierre 23:00, apertura discreta (con hueco de mediodía, como en el
// proyecto real: BOOKING_HOURS deja fuera 13:00-16:00), duraciones válidas
// 60/90/120 — igual que la configuración real de Club Pádel 04.
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

// ═══════════════════════════════════════════════════════════════════════════
// TESTS CONFIGURACIÓN REAL DEL CLUB (franjas continuas 08:00–22:00,
// incluyendo 13:00–16:00). Cubren el bug: 22:00 bloqueado con 0 ocupadas.
// ═══════════════════════════════════════════════════════════════════════════

const REAL_OPENING_HOURS = {
  closingMinutes: 23 * 60,
  allowedStartTimes: [
    "08:00","09:00","10:00","11:00","12:00",
    "13:00","14:00","15:00","16:00",
    "17:00","18:00","19:00","20:00","21:00","22:00",
  ],
  allowedDurations: [60, 90, 120],
};

// "Ahora" fijo: 2026-08-23 12:00 (un día antes de la fecha de prueba).
const NOW_REAL = new Date(Date.UTC(2026, 7, 23, 12, 0));

function evaluateReal(overrides = {}) {
  return evaluateSlotAvailability({
    date: "2026-08-24",
    startTime: "22:00",
    durationMinutes: 60,
    courtId: "Pista 1",
    existingBookings: [],
    openingHours: REAL_OPENING_HOURS,
    currentDateTime: NOW_REAL,
    ...overrides,
  });
}

// ── a) Sin ocupaciones: 22:00 habilitado, solo 60 min ─────────────────────

test("REAL-a1: 22:00 + 60min, Pista 1, 0 ocupadas → AVAILABLE", () => {
  const r = evaluateReal({ courtId: "Pista 1" });
  assert.equal(r.status, AVAILABILITY_STATUS.AVAILABLE);
  assert.equal(r.reason, null);
});

test("REAL-a2: 22:00 + 60min, Pista 2, 0 ocupadas → AVAILABLE", () => {
  assert.equal(evaluateReal({ courtId: "Pista 2" }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-a3: 22:00 + 60min, Pista 3, 0 ocupadas → AVAILABLE", () => {
  assert.equal(evaluateReal({ courtId: "Pista 3" }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-a4: 22:00 + 60min, Pista 4, 0 ocupadas → AVAILABLE", () => {
  assert.equal(evaluateReal({ courtId: "Pista 4" }).status, AVAILABILITY_STATUS.AVAILABLE);
});

// Demuestra la causa raíz: duration=90 con 22:00 → INSUFFICIENT_REMAINING_TIME
test("REAL-a5 [CAUSA RAÍZ]: 22:00 + 90min → UNAVAILABLE/insufficient_remaining_time (así bloqueaba el calendario)", () => {
  const r = evaluateReal({ durationMinutes: 90 });
  assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(r.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

// ── b) Ocupación real en una sola pista: solo esa bloqueada ───────────────

test("REAL-b1: 22:00 ocupada en Pista 1 → OCCUPIED", () => {
  const r = evaluateReal({
    courtId: "Pista 1",
    existingBookings: [{ courtId: "Pista 1", date: "2026-08-24", startTime: "22:00", endTime: "23:00" }],
  });
  assert.equal(r.status, AVAILABILITY_STATUS.OCCUPIED);
  assert.equal(r.reason, AVAILABILITY_REASON.BOOKING_OVERLAP);
});

test("REAL-b2: ocupación en Pista 1 no afecta a Pista 2 a las 22:00", () => {
  const r = evaluateReal({
    courtId: "Pista 2",
    existingBookings: [{ courtId: "Pista 1", date: "2026-08-24", startTime: "22:00", endTime: "23:00" }],
  });
  assert.equal(r.status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-b3: ocupación en Pista 1 no afecta a Pista 3 a las 22:00", () => {
  assert.equal(
    evaluateReal({ courtId: "Pista 3", existingBookings: [{ courtId: "Pista 1", date: "2026-08-24", startTime: "22:00", endTime: "23:00" }] }).status,
    AVAILABILITY_STATUS.AVAILABLE
  );
});

test("REAL-b4: ocupación en Pista 1 no afecta a Pista 4 a las 22:00", () => {
  assert.equal(
    evaluateReal({ courtId: "Pista 4", existingBookings: [{ courtId: "Pista 1", date: "2026-08-24", startTime: "22:00", endTime: "23:00" }] }).status,
    AVAILABILITY_STATUS.AVAILABLE
  );
});

// ── c) Cierre temporal que cubra 22:00 ────────────────────────────────────

test("REAL-c1: cierre temporal pista específica cubre 22:00 → UNAVAILABLE/court_closed", () => {
  const r = evaluateReal({
    closures: [{ pista: "Pista 1", fecha_inicio: "2026-08-24", hora_inicio: "20:00", fecha_fin: "2026-08-24", hora_fin: "23:00" }],
  });
  assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(r.reason, AVAILABILITY_REASON.COURT_CLOSED);
});

test("REAL-c2: cierre pista='todas' bloquea 22:00 en las cuatro pistas", () => {
  const closure = { pista: "todas", fecha_inicio: "2026-08-24", hora_inicio: "21:00", fecha_fin: "2026-08-24", hora_fin: "23:00" };
  for (const pista of ["Pista 1", "Pista 2", "Pista 3", "Pista 4"]) {
    const r = evaluateReal({ courtId: pista, closures: [closure] });
    assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE, `${pista} debe estar bloqueada`);
    assert.equal(r.reason, AVAILABILITY_REASON.COURT_CLOSED);
  }
});

// ── d) 21:00 permite duraciones válidas sin superar 23:00 ─────────────────

test("REAL-d1: 21:00 + 60min → AVAILABLE (fin 22:00)", () => {
  assert.equal(evaluateReal({ startTime: "21:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-d2: 21:00 + 90min → AVAILABLE (fin 22:30)", () => {
  assert.equal(evaluateReal({ startTime: "21:00", durationMinutes: 90 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-d3: 21:00 + 120min → AVAILABLE (fin exactamente 23:00)", () => {
  assert.equal(evaluateReal({ startTime: "21:00", durationMinutes: 120 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

// ── e) Ninguna duración puede terminar después de las 23:00 ───────────────

test("REAL-e1: 22:00 + 90min → UNAVAILABLE (terminaría 23:30)", () => {
  const r = evaluateReal({ startTime: "22:00", durationMinutes: 90 });
  assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(r.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

test("REAL-e2: 22:00 + 120min → UNAVAILABLE (terminaría 00:00)", () => {
  const r = evaluateReal({ startTime: "22:00", durationMinutes: 120 });
  assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(r.reason, AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME);
});

test("REAL-e3: duración no permitida (45min) → UNAVAILABLE/invalid_duration", () => {
  const r = evaluateReal({ startTime: "21:00", durationMinutes: 45 });
  assert.equal(r.status, AVAILABILITY_STATUS.UNAVAILABLE);
  assert.equal(r.reason, AVAILABILITY_REASON.INVALID_DURATION);
});

// ── g) Regresión: 13:00–16:00 disponibles sin ocupación ──────────────────

test("REAL-g1: 13:00 + 60min → AVAILABLE (incluida en config real, no en la de tests antiguos)", () => {
  assert.equal(evaluateReal({ startTime: "13:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-g2: 14:00 + 60min → AVAILABLE", () => {
  assert.equal(evaluateReal({ startTime: "14:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-g3: 15:00 + 60min → AVAILABLE", () => {
  assert.equal(evaluateReal({ startTime: "15:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-g4: 16:00 + 60min → AVAILABLE", () => {
  assert.equal(evaluateReal({ startTime: "16:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-g5: 13:00 + 120min → AVAILABLE", () => {
  assert.equal(evaluateReal({ startTime: "13:00", durationMinutes: 120 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

// ─── REAL-INT: semántica de intervalo semiabierto (regresión 2026-09-24) ────
// Garantiza que evaluateSlotAvailability usa intervalos semiabiertos [start,end)
// y que el calendario con dur=60 evalúa correctamente los límites de solapamiento.

const NOW_INT = new Date(Date.UTC(2026, 8, 23, 10, 0)); // 2026-09-23 10:00 UTC
const RESERVA_QA_2209 = [
  { courtId: "Pista 4", date: "2026-09-24", startTime: "22:00", endTime: "23:00" },
];

function evaluateRealInt({ startTime, durationMinutes, courtId = "Pista 4", existingBookings = RESERVA_QA_2209 }) {
  return evaluateSlotAvailability({
    date: "2026-09-24",
    startTime,
    durationMinutes,
    courtId,
    existingBookings,
    openingHours: REAL_OPENING_HOURS,
    currentDateTime: NOW_INT,
  });
}

test("REAL-INT-1: reserva [22:00,23:00) → 22:00+60min = OCCUPIED (solapamiento directo)", () => {
  assert.equal(evaluateRealInt({ startTime: "22:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.OCCUPIED);
});

test("REAL-INT-2 [REGRESIÓN 2026-09-24]: reserva [22:00,23:00) → 21:00+60min = AVAILABLE (límite semiabierto)", () => {
  // requestedEnd(1320) > existingStart(1320) es estrictamente falso → sin solapamiento
  assert.equal(evaluateRealInt({ startTime: "21:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-INT-3: reserva [22:00,23:00) → 21:00+90min = OCCUPIED (90min termina a 22:30, solapa con 22:00-23:00)", () => {
  // Confirma que la evaluación directa con dur=90 SÍ solapa; el fix es no usarla en el calendario
  assert.equal(evaluateRealInt({ startTime: "21:00", durationMinutes: 90 }).status, AVAILABILITY_STATUS.OCCUPIED);
});

test("REAL-INT-4: reserva [22:00,23:00) → 20:00+60min = AVAILABLE (sin solapamiento)", () => {
  assert.equal(evaluateRealInt({ startTime: "20:00", durationMinutes: 60 }).status, AVAILABILITY_STATUS.AVAILABLE);
});

test("REAL-INT-5: reserva [22:00,23:00) en Pista 4 → Pista 1 a las 22:00 = AVAILABLE (aislamiento pista)", () => {
  assert.equal(evaluateRealInt({ startTime: "22:00", durationMinutes: 60, courtId: "Pista 1" }).status, AVAILABILITY_STATUS.AVAILABLE);
});
