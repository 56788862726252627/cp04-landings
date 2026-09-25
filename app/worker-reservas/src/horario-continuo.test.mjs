import test from "node:test";
import assert from "node:assert/strict";

import { validatePayload } from "./index.js";

function futureNonSundayISO(daysAhead = 30) {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  while (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function baseCrear(overrides = {}) {
  return {
    accion: "crear_reserva",
    jugador: { nombre: "Ana", apellidos: "Gomez", email: "ana@example.test", telefono: "600111222" },
    reserva: {
      fecha: futureNonSundayISO(),
      hora: "10:00",
      duracion_minutos: 60,
      pista: "Pista 1",
      modalidad: "libre",
      nivel: "iniciacion",
    },
    ...overrides,
  };
}

function baseReprogramar(overrides = {}) {
  return {
    accion: "reprogramar_reserva",
    clave_reserva: "DEMO-QA-TEST-001",
    nueva_fecha_reserva: futureNonSundayISO(),
    nueva_hora_inicio: "10:00",
    nueva_hora_fin: "11:00",
    nueva_pista: "Pista 2",
    ...overrides,
  };
}

// --- Franjas horarias 13-16 incluidas ---

test("Worker acepta crear_reserva con hora 13:00", () => {
  const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora: "13:00" } }));
  assert.equal(errors.hora, undefined);
});

test("Worker acepta crear_reserva con hora 14:00", () => {
  const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora: "14:00" } }));
  assert.equal(errors.hora, undefined);
});

test("Worker acepta crear_reserva con hora 15:00", () => {
  const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora: "15:00" } }));
  assert.equal(errors.hora, undefined);
});

test("Worker acepta crear_reserva con hora 16:00", () => {
  const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora: "16:00" } }));
  assert.equal(errors.hora, undefined);
});

test("Worker acepta crear_reserva con hora 22:00 y 60 min (termina a las 23:00)", () => {
  const errors = validatePayload(baseCrear({
    reserva: { ...baseCrear().reserva, hora: "22:00", duracion_minutos: 60 },
  }));
  assert.equal(errors.hora, undefined);
  assert.equal(errors.duracion_minutos, undefined);
});

test("Worker rechaza crear_reserva con hora 22:00 y 90 min (terminaría a las 23:30)", () => {
  const errors = validatePayload(baseCrear({
    reserva: { ...baseCrear().reserva, hora: "22:00", duracion_minutos: 90 },
  }));
  assert.ok(errors.duracion_minutos, "debe haber error en duracion_minutos");
});

test("Worker rechaza crear_reserva con hora 22:00 y 120 min (terminaría a las 00:00)", () => {
  const errors = validatePayload(baseCrear({
    reserva: { ...baseCrear().reserva, hora: "22:00", duracion_minutos: 120 },
  }));
  assert.ok(errors.duracion_minutos, "debe haber error en duracion_minutos");
});

test("Worker acepta crear_reserva con hora 21:00 y 120 min (termina exactamente a las 23:00)", () => {
  const errors = validatePayload(baseCrear({
    reserva: { ...baseCrear().reserva, hora: "21:00", duracion_minutos: 120 },
  }));
  assert.equal(errors.duracion_minutos, undefined);
});

// --- Franjas horarias intermedias con 120 min ---

test("Worker acepta 13:00 + 120 min (termina 15:00, bien antes del cierre)", () => {
  const errors = validatePayload(baseCrear({
    reserva: { ...baseCrear().reserva, hora: "13:00", duracion_minutos: 120 },
  }));
  assert.equal(errors.hora, undefined);
  assert.equal(errors.duracion_minutos, undefined);
});

// --- Reprogramar: cierre a las 23:00 ---

test("Worker acepta reprogramar con nueva_hora_inicio 13:00 y fin 14:00", () => {
  const errors = validatePayload(baseReprogramar({ nueva_hora_inicio: "13:00", nueva_hora_fin: "14:00" }));
  assert.equal(errors.nueva_hora_inicio, undefined);
  assert.equal(errors.nueva_hora_fin, undefined);
});

test("Worker acepta reprogramar con nueva_hora_inicio 22:00 y fin 23:00", () => {
  const errors = validatePayload(baseReprogramar({ nueva_hora_inicio: "22:00", nueva_hora_fin: "23:00" }));
  assert.equal(errors.nueva_hora_inicio, undefined);
  assert.equal(errors.nueva_hora_fin, undefined);
});

test("Worker rechaza reprogramar con nueva_hora_fin posterior a 23:00", () => {
  const errors = validatePayload(baseReprogramar({ nueva_hora_inicio: "22:00", nueva_hora_fin: "23:30" }));
  assert.ok(errors.nueva_hora_fin, "debe haber error en nueva_hora_fin");
});

test("Worker rechaza reprogramar con nueva_hora_inicio fuera de las franjas permitidas (p.ej. 13:30)", () => {
  const errors = validatePayload(baseReprogramar({ nueva_hora_inicio: "13:30", nueva_hora_fin: "14:30" }));
  assert.ok(errors.nueva_hora_inicio, "debe haber error en nueva_hora_inicio");
});

// --- Hora fuera de lista sigue rechazada ---

test("Worker rechaza crear_reserva con hora 13:30 (fuera de la lista de franjas)", () => {
  const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora: "13:30" } }));
  assert.ok(errors.hora, "debe haber error en hora");
});

test("Worker rechaza crear_reserva con hora 23:00 (fuera de la lista)", () => {
  const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora: "23:00" } }));
  assert.ok(errors.hora, "debe haber error en hora");
});

// --- Todas las franjas de 08:00 a 22:00 son válidas ---

const todasLasFranjas = [
  "08:00","09:00","10:00","11:00","12:00",
  "13:00","14:00","15:00","16:00",
  "17:00","18:00","19:00","20:00","21:00","22:00",
];

for (const hora of todasLasFranjas) {
  test(`Worker acepta crear_reserva con hora ${hora} y 60 min`, () => {
    const errors = validatePayload(baseCrear({ reserva: { ...baseCrear().reserva, hora, duracion_minutos: 60 } }));
    assert.equal(errors.hora, undefined, `hora ${hora} debe ser válida`);
    assert.equal(errors.duracion_minutos, undefined, `60 min desde ${hora} debe ser válido`);
  });
}
