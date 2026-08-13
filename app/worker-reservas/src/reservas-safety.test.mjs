import test from "node:test";
import assert from "node:assert/strict";

import { cp04IsSlotOccupied, cp04BuildIdempotencyKey } from "./index.js";

// cp04IsSlotOccupied ---------------------------------------------------

test("cp04IsSlotOccupied: slot presente en la lista de ocupadas -> true", () => {
  const ocupadas = ["2026-08-01|Pista 1|10:00", "2026-08-01|Pista 2|11:00"];
  assert.equal(cp04IsSlotOccupied(ocupadas, "2026-08-01", "Pista 1", "10:00"), true);
});

test("cp04IsSlotOccupied: slot ausente de la lista -> false", () => {
  const ocupadas = ["2026-08-01|Pista 1|10:00"];
  assert.equal(cp04IsSlotOccupied(ocupadas, "2026-08-01", "Pista 2", "10:00"), false);
});

test("cp04IsSlotOccupied: misma hora pero pista distinta -> false", () => {
  const ocupadas = ["2026-08-01|Pista 1|10:00"];
  assert.equal(cp04IsSlotOccupied(ocupadas, "2026-08-01", "Pista 3", "10:00"), false);
});

test("cp04IsSlotOccupied: lista vacía -> false", () => {
  assert.equal(cp04IsSlotOccupied([], "2026-08-01", "Pista 1", "10:00"), false);
});

test("cp04IsSlotOccupied: ocupadas no es array -> false (fail-closed hacia 'no bloquear')", () => {
  assert.equal(cp04IsSlotOccupied(undefined, "2026-08-01", "Pista 1", "10:00"), false);
  assert.equal(cp04IsSlotOccupied(null, "2026-08-01", "Pista 1", "10:00"), false);
});

test("cp04IsSlotOccupied: faltan datos de fecha/pista/hora -> false", () => {
  const ocupadas = ["2026-08-01|Pista 1|10:00"];
  assert.equal(cp04IsSlotOccupied(ocupadas, "", "Pista 1", "10:00"), false);
  assert.equal(cp04IsSlotOccupied(ocupadas, "2026-08-01", "", "10:00"), false);
  assert.equal(cp04IsSlotOccupied(ocupadas, "2026-08-01", "Pista 1", ""), false);
});

// cp04BuildIdempotencyKey ------------------------------------------------

// PASO 06D (2026-07-17): el formato de la clave derivada para crear_reserva
// pasa a ser email|fecha|pista|hora|teléfono (antes fecha|pista|hora|email,
// sin teléfono) — ver cp04BuildIdempotencyKey. Cambio intencional pedido
// por la misión de idempotencia; el resto de comportamiento (misma
// solicitud -> misma clave, solicitud distinta -> clave distinta) no
// cambia y se sigue comprobando en los tests de abajo.
test("cp04BuildIdempotencyKey: crear_reserva genera clave determinista con email/fecha/pista/hora/telefono", () => {
  const payload = {
    accion: "crear_reserva",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  const key = cp04BuildIdempotencyKey(payload);
  assert.equal(key, "crear|demo@no-existe.test|2026-08-01|Pista 1|10:00|");
});

test("cp04BuildIdempotencyKey: crear_reserva con clave_reserva explícita la respeta tal cual, ignorando el resto de campos", () => {
  const payload = {
    accion: "crear_reserva",
    clave_reserva: "QA_CP04_TEST_EXPLICITA_001",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  assert.equal(cp04BuildIdempotencyKey(payload), "crear|clave|QA_CP04_TEST_EXPLICITA_001");
});

test("cp04BuildIdempotencyKey: crear_reserva sin telefono no revienta y sin email tampoco", () => {
  const sinTelefono = {
    accion: "crear_reserva",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  assert.doesNotThrow(() => cp04BuildIdempotencyKey(sinTelefono));

  const sinJugador = { accion: "crear_reserva", reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" } };
  assert.doesNotThrow(() => cp04BuildIdempotencyKey(sinJugador));
});

test("cp04BuildIdempotencyKey: dos solicitudes crear_reserva idénticas producen la misma clave", () => {
  const payload = {
    accion: "crear_reserva",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  assert.equal(cp04BuildIdempotencyKey(payload), cp04BuildIdempotencyKey({ ...payload }));
});

test("cp04BuildIdempotencyKey: crear_reserva con hora distinta produce clave distinta", () => {
  const base = {
    accion: "crear_reserva",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  const distinta = {
    accion: "crear_reserva",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "11:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  assert.notEqual(cp04BuildIdempotencyKey(base), cp04BuildIdempotencyKey(distinta));
});

test("cp04BuildIdempotencyKey: reprogramar_reserva usa clave_reserva + nueva fecha/hora/pista", () => {
  const payload = {
    accion: "reprogramar_reserva",
    clave_reserva: "DEMO-QA-TEST-001",
    nueva_fecha_reserva: "2026-08-02",
    nueva_hora_inicio: "12:00",
    nueva_pista: "Pista 3",
  };
  assert.equal(
    cp04BuildIdempotencyKey(payload),
    "reprogramar|DEMO-QA-TEST-001|2026-08-02|12:00|Pista 3",
  );
});

test("cp04BuildIdempotencyKey: cancelar_reserva usa solo clave_reserva", () => {
  const payload = { accion: "cancelar_reserva", clave_reserva: "DEMO-QA-TEST-001" };
  assert.equal(cp04BuildIdempotencyKey(payload), "cancelar|DEMO-QA-TEST-001");
});

test("cp04BuildIdempotencyKey: accion no reconocida -> null (sin idempotencia, no rompe el flujo)", () => {
  assert.equal(cp04BuildIdempotencyKey({ accion: "consultar_disponibilidad" }), null);
  assert.equal(cp04BuildIdempotencyKey({}), null);
  assert.equal(cp04BuildIdempotencyKey(null), null);
});
