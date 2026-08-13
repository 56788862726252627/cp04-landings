import test from "node:test";
import assert from "node:assert/strict";

import {
  CP04_AIRTABLE_RATE_LIMIT_CODE,
  CP04_AUTH_SESSION_EXPIRED_CODES,
  CP04_AUTH_ACCOUNT_ISSUE_CODES,
  CP04_SESSION_EXPIRED_MESSAGE,
  cp04BuildReservationError,
  cp04ReservationErrorMessage,
} from "./reservationErrors.js";

// PASO 06C (2026-07-17): modo degradado Airtable 429 — lado cliente.
// Cubre exactamente lo que la app puede probar sin un harness de render de
// React (no existe ninguno en este proyecto todavía): la construcción y
// propagación del mensaje, no el estado de React en sí. El hecho de que
// "nunca se marca la reserva como confirmada en un error" se garantiza por
// estructura de código (el success/setStep(3) vive antes del throw, en el
// bloque try; el catch de los 3 formularios de App.jsx solo llama a
// setStatus("error")) — no cambiado por este paso, solo el mensaje que se
// muestra dentro de ese mismo camino de error.

test("CP04_AIRTABLE_RATE_LIMIT_CODE coincide exactamente con el código que envía el Worker", () => {
  assert.equal(CP04_AIRTABLE_RATE_LIMIT_CODE, "AIRTABLE_RATE_LIMIT");
});

test("cp04BuildReservationError: con code AIRTABLE_RATE_LIMIT y message, usa el mensaje del servidor (no el genérico)", () => {
  const data = {
    ok: false,
    code: "AIRTABLE_RATE_LIMIT",
    retryable: true,
    reserva_confirmada: false,
    message: "El sistema de reservas está temporalmente saturado. Inténtalo de nuevo más tarde o contacta con recepción.",
  };

  const error = cp04BuildReservationError(data, "booking_request_failed");

  assert.equal(error.message, data.message);
  assert.equal(error.code, "AIRTABLE_RATE_LIMIT");
  assert.equal(error.retryable, true);
});

test("cp04BuildReservationError: sin code (fallo genérico) usa el mensaje de fallback, no inventa uno", () => {
  const error = cp04BuildReservationError({ ok: false }, "booking_request_failed");

  assert.equal(error.message, "booking_request_failed");
  assert.equal(error.code, null);
  assert.equal(error.retryable, false);
});

test("cp04BuildReservationError: data ausente (respuesta vacía/no-JSON) no revienta, usa el fallback", () => {
  const error = cp04BuildReservationError(null, "cancel_request_failed");
  assert.equal(error.message, "cancel_request_failed");
  assert.equal(error.code, null);
});

test("cp04BuildReservationError: code AIRTABLE_RATE_LIMIT pero sin message -> usa el fallback (nunca un mensaje vacío)", () => {
  const error = cp04BuildReservationError({ ok: false, code: "AIRTABLE_RATE_LIMIT" }, "reschedule_request_failed");
  assert.equal(error.message, "reschedule_request_failed");
});

test("cp04ReservationErrorMessage: para un error AIRTABLE_RATE_LIMIT, la UI debe mostrar el mensaje amigable del servidor", () => {
  const err = cp04BuildReservationError(
    { ok: false, code: "AIRTABLE_RATE_LIMIT", message: "El sistema de reservas está temporalmente saturado. Inténtalo de nuevo más tarde o contacta con recepción." },
    "booking_request_failed"
  );

  const shown = cp04ReservationErrorMessage(err, "Mensaje genérico traducido");
  assert.equal(shown, "El sistema de reservas está temporalmente saturado. Inténtalo de nuevo más tarde o contacta con recepción.");
  assert.notEqual(shown, "Mensaje genérico traducido");
});

test("cp04ReservationErrorMessage: para cualquier otro error, se mantiene el mensaje genérico ya traducido de cada formulario", () => {
  const errCancelar = cp04BuildReservationError({ ok: false }, "cancel_request_failed");
  const errReprog = cp04BuildReservationError({ ok: false, error: "SLOT_ALREADY_BOOKED" }, "reschedule_request_failed");

  assert.equal(cp04ReservationErrorMessage(errCancelar, "Mensaje traducido de cancelar"), "Mensaje traducido de cancelar");
  assert.equal(cp04ReservationErrorMessage(errReprog, "Mensaje traducido de reprogramar"), "Mensaje traducido de reprogramar");
});

test("cp04ReservationErrorMessage: un error sin .code (p. ej. lanzado directamente con new Error, camino de reintentos agotados) usa el fallback", () => {
  const err = new Error("reschedule_not_confirmed");
  assert.equal(cp04ReservationErrorMessage(err, "Mensaje traducido de reprogramar"), "Mensaje traducido de reprogramar");
});

// Inconsistencia 2 (auditoría App↔API Reservas, 2026-08-12): sesión
// caducada durante Cancelar/Reprogramar (el Worker responde con
// error:MISSING_TOKEN/INVALID_TOKEN/ROLE_NOT_ASSIGNED, ver
// worker-reservas/auth/authorization.js::denyResponse) ya no debe mostrar
// el mensaje genérico de "revisa la clave", que dirigía al usuario a la
// causa equivocada.

test("CP04_AUTH_SESSION_EXPIRED_CODES coincide exactamente con los motivos de sesión inválida/ausente del Worker", () => {
  assert.deepEqual(CP04_AUTH_SESSION_EXPIRED_CODES, ["MISSING_TOKEN", "INVALID_TOKEN"]);
});

test("CP04_AUTH_ACCOUNT_ISSUE_CODES coincide exactamente con el motivo de cuenta sin rol asignado del Worker", () => {
  assert.deepEqual(CP04_AUTH_ACCOUNT_ISSUE_CODES, ["ROLE_NOT_ASSIGNED"]);
});

for (const authCode of ["MISSING_TOKEN", "INVALID_TOKEN"]) {
  test(`cp04BuildReservationError + cp04ReservationErrorMessage: error:${authCode} muestra "sesión ha caducado", nunca el mensaje de clave`, () => {
    const data = { ok: false, error: authCode, message: "Token inválido o expirado." };
    const error = cp04BuildReservationError(data, "cancel_request_failed");

    assert.equal(error.message, CP04_SESSION_EXPIRED_MESSAGE);
    assert.equal(error.authCode, authCode);

    const shown = cp04ReservationErrorMessage(error, "Revisa la clave e inténtalo de nuevo.");
    assert.equal(shown, CP04_SESSION_EXPIRED_MESSAGE);
    assert.notEqual(shown, "Revisa la clave e inténtalo de nuevo.");
  });
}

test("cp04BuildReservationError + cp04ReservationErrorMessage: error:ROLE_NOT_ASSIGNED muestra el mensaje real del backend (no es un caso de sesión caducada, no comparte ese mensaje)", () => {
  const data = { ok: false, error: "ROLE_NOT_ASSIGNED", message: "La cuenta no tiene un rol asignado en el sistema." };
  const error = cp04BuildReservationError(data, "cancel_request_failed");

  assert.equal(error.message, "La cuenta no tiene un rol asignado en el sistema.");
  assert.notEqual(error.message, CP04_SESSION_EXPIRED_MESSAGE);
  assert.equal(error.authCode, "ROLE_NOT_ASSIGNED");

  const shown = cp04ReservationErrorMessage(error, "Revisa la clave e inténtalo de nuevo.");
  assert.equal(shown, "La cuenta no tiene un rol asignado en el sistema.");
});

test("cp04BuildReservationError: error:ROLE_NOT_ASSIGNED sin message usa el fallback (nunca un mensaje vacío ni inventado)", () => {
  const error = cp04BuildReservationError({ ok: false, error: "ROLE_NOT_ASSIGNED" }, "cancel_request_failed");
  assert.equal(error.message, "cancel_request_failed");
  assert.equal(error.authCode, null);
});

test("cp04BuildReservationError: error:INSUFFICIENT_ROLE (rol autenticado insuficiente, no sesión caducada ni cuenta sin rol) sigue usando el fallback genérico sin cambios", () => {
  const error = cp04BuildReservationError(
    { ok: false, error: "INSUFFICIENT_ROLE", message: "Tu rol no tiene permiso para esta operación." },
    "cancel_request_failed"
  );
  assert.equal(error.message, "cancel_request_failed");
  assert.equal(error.authCode, null);
});

test("errores reales de clave de reserva (SLOT_ALREADY_BOOKED, IDEMPOTENT_DUPLICATE) siguen intactos: no se confunden con fallos de autenticación", () => {
  const slotOcupado = cp04BuildReservationError(
    { ok: false, error: "SLOT_ALREADY_BOOKED", message: "Ese horario ya no está disponible. Elige otra franja." },
    "reschedule_request_failed"
  );
  const duplicado = cp04BuildReservationError({ ok: false, error: "IDEMPOTENT_DUPLICATE" }, "cancel_request_failed");

  assert.equal(slotOcupado.authCode, null);
  assert.equal(cp04ReservationErrorMessage(slotOcupado, "Mensaje traducido de reprogramar"), "Mensaje traducido de reprogramar");

  assert.equal(duplicado.authCode, null);
  assert.equal(cp04ReservationErrorMessage(duplicado, "Mensaje traducido de cancelar"), "Mensaje traducido de cancelar");
});
