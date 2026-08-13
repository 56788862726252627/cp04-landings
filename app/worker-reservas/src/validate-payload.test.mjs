import test from "node:test";
import assert from "node:assert/strict";

import { validatePayload } from "./index.js";

// Fixtures ficticios de test, ninguno es una persona real.

function futureNonSundayISO(daysAhead = 30) {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  while (d.getUTCDay() === 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function futureSundayISO(daysAhead = 30) {
  const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  while (d.getUTCDay() !== 0) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function baseCrearReserva(overrides = {}) {
  return {
    accion: "crear_reserva",
    jugador: {
      nombre: "Ana",
      apellidos: "Gomez",
      email: "ana@example.test",
      telefono: "600111222",
    },
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

// crear_reserva ---------------------------------------------------------

test("validatePayload: crear_reserva con todos los campos válidos -> sin errores", () => {
  assert.deepEqual(validatePayload(baseCrearReserva()), {});
});

test("validatePayload: crear_reserva en domingo -> fecha_reserva cerrado, fecha (formato) sin error propio", () => {
  const payload = baseCrearReserva();
  payload.reserva.fecha = futureSundayISO();
  const errors = validatePayload(payload);
  assert.equal(errors.fecha_reserva, "El club está cerrado los domingos.");
  assert.equal(errors.fecha, undefined);
});

test("validatePayload: crear_reserva con nombre/apellidos demasiado cortos", () => {
  const payload = baseCrearReserva({ jugador: { ...baseCrearReserva().jugador, nombre: "A", apellidos: "B" } });
  const errors = validatePayload(payload);
  assert.equal(errors.nombre, "Nombre invalido.");
  assert.equal(errors.apellidos, "Apellidos invalidos.");
});

test("validatePayload: crear_reserva con email inválido", () => {
  const payload = baseCrearReserva({ jugador: { ...baseCrearReserva().jugador, email: "no-es-un-email" } });
  assert.equal(validatePayload(payload).email, "Email invalido.");
});

test("validatePayload: crear_reserva con teléfono demasiado corto", () => {
  const payload = baseCrearReserva({ jugador: { ...baseCrearReserva().jugador, telefono: "123" } });
  assert.equal(validatePayload(payload).telefono, "Telefono invalido.");
});

test("validatePayload: crear_reserva sin fecha -> 'Fecha requerida.'", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, fecha: "" } });
  assert.equal(validatePayload(payload).fecha, "Fecha requerida.");
});

test("validatePayload: crear_reserva con fecha en el pasado -> inválida", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, fecha: "2020-01-01" } });
  assert.equal(validatePayload(payload).fecha, "Fecha invalida.");
});

test("validatePayload: crear_reserva con hora fuera de la lista permitida", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, hora: "23:59" } });
  assert.equal(validatePayload(payload).hora, "Hora invalida.");
});

// Bloque BOOKING_HOURS (2026-08-13): 08:00-22:00 continuo, alineado con
// App.jsx:121 — antes 13:00-16:00 (hueco de mediodía) no estaba en la
// lista del Worker aunque la UI ya los ofreciera, lo que habría producido
// "Hora invalida." (422) en una reserva real a esas horas.

test("validatePayload: crear_reserva acepta las 4 horas de mediodía recién añadidas (13:00-16:00)", () => {
  for (const hora of ["13:00", "14:00", "15:00", "16:00"]) {
    const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, hora } });
    assert.equal(validatePayload(payload).hora, undefined, `${hora} debería ser válida`);
  }
});

test("validatePayload: crear_reserva sigue aceptando 08:00 (extremo inferior del rango, sin regresión)", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, hora: "08:00" } });
  assert.equal(validatePayload(payload).hora, undefined);
});

test("validatePayload: crear_reserva sigue aceptando 22:00 (extremo superior del rango, sin regresión)", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, hora: "22:00" } });
  assert.equal(validatePayload(payload).hora, undefined);
});

test("validatePayload: crear_reserva sigue rechazando horas fuera de 08:00-22:00 (07:00 y 23:00, límite no ampliado)", () => {
  for (const hora of ["07:00", "23:00"]) {
    const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, hora } });
    assert.equal(validatePayload(payload).hora, "Hora invalida.", `${hora} debería seguir siendo inválida`);
  }
});

test("validatePayload: crear_reserva acepta el conjunto continuo completo 08:00-22:00 (15 horas), una a una", () => {
  const horasEsperadas = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
  ];
  assert.equal(horasEsperadas.length, 15);

  for (const hora of horasEsperadas) {
    const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, hora } });
    assert.equal(validatePayload(payload).hora, undefined, `${hora} debería ser válida`);
  }
});

test("validatePayload: crear_reserva con duración no permitida", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, duracion_minutos: 45 } });
  assert.equal(validatePayload(payload).duracion_minutos, "Duracion invalida.");
});

test("validatePayload: crear_reserva con pista desconocida", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, pista: "Pista 9" } });
  assert.equal(validatePayload(payload).pista, "Pista invalida.");
});

test("validatePayload: crear_reserva con modalidad desconocida", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, modalidad: "amistoso" } });
  assert.equal(validatePayload(payload).modalidad, "Modalidad invalida.");
});

test("validatePayload: crear_reserva con nivel desconocido", () => {
  const payload = baseCrearReserva({ reserva: { ...baseCrearReserva().reserva, nivel: "profesional" } });
  assert.equal(validatePayload(payload).nivel, "Nivel invalido.");
});

// reprogramar_reserva -----------------------------------------------------

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

test("validatePayload: reprogramar_reserva con todos los campos válidos -> sin errores", () => {
  assert.deepEqual(validatePayload(baseReprogramar()), {});
});

test("validatePayload: reprogramar_reserva en domingo -> bloqueado", () => {
  const payload = baseReprogramar({ nueva_fecha_reserva: futureSundayISO() });
  assert.equal(validatePayload(payload).fecha_reserva, "El club está cerrado los domingos.");
});

test("validatePayload: reprogramar_reserva con clave_reserva corta o ausente", () => {
  assert.equal(validatePayload(baseReprogramar({ clave_reserva: "" })).clave_reserva, "Clave de reserva invalida.");
  assert.equal(validatePayload(baseReprogramar({ clave_reserva: "abc" })).clave_reserva, "Clave de reserva invalida.");
});

test("validatePayload: reprogramar_reserva con formato de nueva fecha inválido", () => {
  assert.equal(
    validatePayload(baseReprogramar({ nueva_fecha_reserva: "20/07/2026" })).nueva_fecha_reserva,
    "Nueva fecha de reserva invalida."
  );
});

test("validatePayload: reprogramar_reserva con horas fuera de formato HH:MM", () => {
  const errors = validatePayload(baseReprogramar({ nueva_hora_inicio: "25:00", nueva_hora_fin: "9" }));
  assert.equal(errors.nueva_hora_inicio, "Nueva hora de inicio invalida.");
  assert.equal(errors.nueva_hora_fin, "Nueva hora de fin invalida.");
});

test("validatePayload: reprogramar_reserva con hora de fin anterior o igual a la de inicio", () => {
  const errors = validatePayload(baseReprogramar({ nueva_hora_inicio: "12:00", nueva_hora_fin: "12:00" }));
  assert.equal(errors.nueva_hora_fin, "La hora de fin debe ser posterior.");
});

test("validatePayload: reprogramar_reserva sin nueva_pista", () => {
  assert.equal(validatePayload(baseReprogramar({ nueva_pista: "" })).nueva_pista, "Nueva pista invalida.");
});

// cancelar_reserva --------------------------------------------------------

test("validatePayload: cancelar_reserva con clave_reserva válida -> sin errores", () => {
  assert.deepEqual(validatePayload({ accion: "cancelar_reserva", clave_reserva: "DEMO-QA-TEST-001" }), {});
});

test("validatePayload: cancelar_reserva con clave_reserva con caracteres no permitidos", () => {
  const errors = validatePayload({ accion: "cancelar_reserva", clave_reserva: "clave con espacios!!" });
  assert.equal(errors.clave_reserva, "Clave de reserva invalida.");
});

test("validatePayload: cancelar_reserva con clave_reserva demasiado corta", () => {
  const errors = validatePayload({ accion: "cancelar_reserva", clave_reserva: "abc" });
  assert.equal(errors.clave_reserva, "Clave de reserva invalida.");
});

// consultar_disponibilidad -------------------------------------------------

test("validatePayload: consultar_disponibilidad con fecha y email válidos -> sin errores", () => {
  const errors = validatePayload({
    accion: "consultar_disponibilidad",
    fecha: futureNonSundayISO(),
    email: "ana@example.test",
  });
  assert.deepEqual(errors, {});
});

test("validatePayload: consultar_disponibilidad con fecha en formato no estricto -> inválida", () => {
  const errors = validatePayload({
    accion: "consultar_disponibilidad",
    fecha: `${futureNonSundayISO()}T00:00:00Z`,
    email: "ana@example.test",
  });
  assert.equal(errors.fecha_reserva, "Fecha de consulta invalida.");
});

test("validatePayload: consultar_disponibilidad con email inválido o ausente", () => {
  assert.equal(
    validatePayload({ accion: "consultar_disponibilidad", fecha: futureNonSundayISO(), email: "" }).Email,
    "Email invalido."
  );
  assert.equal(
    validatePayload({ accion: "consultar_disponibilidad", fecha: futureNonSundayISO(), email: "no-valido" }).Email,
    "Email invalido."
  );
});

// accion desconocida -------------------------------------------------------

test("validatePayload: accion desconocida -> 'Accion no soportada.'", () => {
  assert.equal(validatePayload({ accion: "borrar_todo" }).accion, "Accion no soportada.");
  assert.equal(validatePayload({}).accion, "Accion no soportada.");
});
