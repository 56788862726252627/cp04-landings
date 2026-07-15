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

test("cp04BuildIdempotencyKey: crear_reserva genera clave determinista con fecha/pista/hora/email", () => {
  const payload = {
    accion: "crear_reserva",
    reserva: { fecha: "2026-08-01", pista: "Pista 1", hora: "10:00" },
    jugador: { email: "demo@no-existe.test" },
  };
  const key = cp04BuildIdempotencyKey(payload);
  assert.equal(key, "crear|2026-08-01|Pista 1|10:00|demo@no-existe.test");
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
