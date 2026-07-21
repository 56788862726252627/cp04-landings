import test from "node:test";
import assert from "node:assert/strict";

import {
  cp04FormulaText,
  validatePayload,
  cp04CheckCrearReservaRateLimit,
  __resetCrearReservaRateLimitForTests,
} from "./index.js";

// cp04FormulaText — escape defensivo antes de interpolar en filterByFormula ---

test("cp04FormulaText: escapa comillas dobles", () => {
  assert.equal(cp04FormulaText('2026-08-01") , OR(1=1'), '2026-08-01\\") , OR(1=1');
});

test("cp04FormulaText: escapa barras invertidas antes que comillas", () => {
  assert.equal(cp04FormulaText('a\\"b'), 'a\\\\\\"b');
});

test("cp04FormulaText: valores no-string se convierten a texto seguro", () => {
  assert.equal(cp04FormulaText(null), "");
  assert.equal(cp04FormulaText(undefined), "");
  assert.equal(cp04FormulaText(123), "123");
});

// validatePayload — crear_reserva exige fecha en formato YYYY-MM-DD estricto ---

function basePayloadCrearReserva(fecha) {
  return {
    accion: "crear_reserva",
    jugador: {
      nombre: "Ana",
      apellidos: "Gomez",
      email: "ana@example.com",
      telefono: "600111222",
    },
    reserva: {
      fecha,
      hora: "10:00",
      duracion_minutos: 60,
      pista: "Pista 1",
      modalidad: "libre",
      nivel: "iniciacion",
    },
  };
}

test("validatePayload: crear_reserva con fecha YYYY-MM-DD futura válida -> sin error de fecha", () => {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const errors = validatePayload(basePayloadCrearReserva(futureDate));
  assert.equal(errors.fecha, undefined);
});

test("validatePayload: crear_reserva con fecha conteniendo un intento de inyección de fórmula -> rechazada", () => {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const errors = validatePayload(basePayloadCrearReserva(`${futureDate}") , OR(1=1`));
  assert.equal(errors.fecha, "Fecha invalida.");
});

test("validatePayload: crear_reserva con formato de fecha no estricto (con hora incluida) -> rechazada", () => {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const errors = validatePayload(basePayloadCrearReserva(`${futureDate}T00:00:00Z`));
  assert.equal(errors.fecha, "Fecha invalida.");
});

test("validatePayload: crear_reserva sin fecha -> 'Fecha requerida.'", () => {
  const errors = validatePayload(basePayloadCrearReserva(""));
  assert.equal(errors.fecha, "Fecha requerida.");
});

// cp04CheckCrearReservaRateLimit — límite básico por isolate -----------------

test("cp04CheckCrearReservaRateLimit: permite hasta el máximo configurado y luego bloquea", () => {
  __resetCrearReservaRateLimitForTests();
  const now = Date.now();

  for (let i = 0; i < 30; i += 1) {
    assert.equal(cp04CheckCrearReservaRateLimit(now), true, `intento ${i + 1} debería permitirse`);
  }

  assert.equal(cp04CheckCrearReservaRateLimit(now), false);
});

test("cp04CheckCrearReservaRateLimit: pasada la ventana, vuelve a permitir", () => {
  __resetCrearReservaRateLimitForTests();
  const start = Date.now();

  for (let i = 0; i < 30; i += 1) {
    cp04CheckCrearReservaRateLimit(start);
  }
  assert.equal(cp04CheckCrearReservaRateLimit(start), false);

  const afterWindow = start + 60_001;
  assert.equal(cp04CheckCrearReservaRateLimit(afterWindow), true);
});
