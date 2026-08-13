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

// Inconsistencia 2 (auditoría App↔API Reservas, 2026-08-12): si la sesión
// caduca durante Cancelar/Reprogramar y el refresh automático de authFetch
// también falla, el Worker responde 401/403 con el motivo real en el campo
// `error` (no `code`, reservado a códigos de negocio como
// AIRTABLE_RATE_LIMIT — ver worker-reservas/auth/authorization.js
// denyResponse/AUTH_FAILURE_STATUS). Hasta ahora ese motivo se descartaba
// siempre en favor del fallback genérico de cada formulario ("Revisa la
// clave e inténtalo de nuevo"), que dirige al usuario a sospechar de la
// clave de reserva cuando el problema real es de sesión/cuenta.
//
// MISSING_TOKEN / INVALID_TOKEN: no hay sesión válida (típicamente,
// caducó). Aquí sí tiene sentido un mensaje curado y accionable en vez del
// texto crudo del servidor ("Token inválido o expirado." no le dice al
// usuario qué hacer).
export const CP04_AUTH_SESSION_EXPIRED_CODES = ["MISSING_TOKEN", "INVALID_TOKEN"];
export const CP04_SESSION_EXPIRED_MESSAGE = "Tu sesión ha caducado. Vuelve a iniciar sesión.";

// ROLE_NOT_ASSIGNED: la sesión SÍ es válida (el token verifica), pero la
// cuenta no tiene rol asignado en Supabase — no es un problema de sesión
// caducada (volver a iniciar sesión no lo arregla), así que no comparte el
// mensaje anterior. El propio backend ya da un mensaje preciso y accionable
// ("La cuenta no tiene un rol asignado en el sistema."): se muestra tal
// cual, mismo criterio que ya existía para AIRTABLE_RATE_LIMIT.
export const CP04_AUTH_ACCOUNT_ISSUE_CODES = ["ROLE_NOT_ASSIGNED"];

function cp04ResolveAuthErrorMessage(data) {
  if (CP04_AUTH_SESSION_EXPIRED_CODES.includes(data?.error)) {
    return CP04_SESSION_EXPIRED_MESSAGE;
  }
  if (CP04_AUTH_ACCOUNT_ISSUE_CODES.includes(data?.error) && data?.message) {
    return data.message;
  }
  return null;
}

export function cp04BuildReservationError(data, fallbackMessage) {
  const authMessage = cp04ResolveAuthErrorMessage(data);
  const message =
    data?.code === CP04_AIRTABLE_RATE_LIMIT_CODE && data?.message
      ? data.message
      : authMessage ?? fallbackMessage;

  const error = new Error(message);
  error.code = data?.code || null;
  // authCode conserva el motivo real (MISSING_TOKEN/INVALID_TOKEN/
  // ROLE_NOT_ASSIGNED) solo cuando ya se resolvió un mensaje curado para
  // él arriba — así cp04ReservationErrorMessage no tiene que repetir la
  // misma lista de códigos ni arriesgarse a desincronizarse de ella.
  error.authCode = authMessage ? data.error : null;
  error.retryable = Boolean(data?.retryable);
  return error;
}

// Mensaje a mostrar al usuario para un error dado: el mensaje específico
// del servidor si es un bloqueo de cuota de Airtable o un fallo real de
// autenticación/sesión (MISSING_TOKEN, INVALID_TOKEN, ROLE_NOT_ASSIGNED),
// o el mensaje genérico de siempre (ya traducido) en cualquier otro caso —
// incluidos los errores de negocio propios de cada operación (p. ej.
// SLOT_ALREADY_BOOKED), que conservan su comportamiento anterior sin
// cambios. Centraliza la misma comprobación que se repite en los 3
// formularios de App.jsx (crear, cancelar, reprogramar).
export function cp04ReservationErrorMessage(err, fallbackMessage) {
  if (err?.code === CP04_AIRTABLE_RATE_LIMIT_CODE && err?.message) return err.message;
  if (err?.authCode && err?.message) return err.message;
  return fallbackMessage;
}
