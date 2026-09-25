// Club Pádel 04 · Errores de reserva del lado cliente.
//
// Extraída de App.jsx (PASO 06C, 2026-07-17) para poder testear con
// node --test sin harness de render de React, igual que
// makeCentroTecnicoLogic.js se extrajo de CentroTecnico.jsx.
//
// Cuando el Worker está en modo degradado por el bloqueo de cuota de
// Airtable, responde con `code: "AIRTABLE_RATE_LIMIT"` y un `message` ya
// pensado para el usuario final (ver worker-reservas/src/index.js::
// cp04BuildAirtableDegradedResponse). Este helper conserva ese código y
// mensaje en el error lanzado, en vez de sustituirlo siempre por un texto
// genérico — para que quien lo capture pueda mostrar el mensaje específico
// cuando exista. Nunca decide si la reserva queda marcada como confirmada:
// eso lo sigue decidiendo cada llamador (App.jsx) al no avanzar de paso en
// ningún camino de error, con o sin este código.
export const CP04_AIRTABLE_RATE_LIMIT_CODE = "AIRTABLE_RATE_LIMIT";

export function cp04BuildReservationError(data, fallbackMessage) {
  const error = new Error(
    data?.code === CP04_AIRTABLE_RATE_LIMIT_CODE && data?.message ? data.message : fallbackMessage
  );
  error.code = data?.code || null;
  error.retryable = Boolean(data?.retryable);
  return error;
}

// Mensaje a mostrar al usuario para un error dado: el mensaje específico
// del servidor si es un bloqueo de cuota de Airtable, o el mensaje
// genérico de siempre (ya traducido) en cualquier otro caso. Centraliza la
// misma comprobación que se repite en los 3 formularios de App.jsx (crear,
// cancelar, reprogramar).
export function cp04ReservationErrorMessage(err, fallbackMessage) {
  if (err?.code === CP04_AIRTABLE_RATE_LIMIT_CODE && err?.message) return err.message;
  return fallbackMessage;
}
