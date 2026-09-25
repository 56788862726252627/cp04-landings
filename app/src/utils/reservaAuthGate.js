// Club Pádel 04 · Lógica pura de la puerta de login para crear/cancelar/
// reprogramar reservas (ver ReservaAuthGate y los 3 formularios que la usan
// en src/App.jsx: Reservas, CancelarReserva, ReprogramarReserva).
//
// Con el gate de rol del Worker activo (CP04_ENFORCE_ROLE_GATES), las 3
// acciones mutables de /api/reservas exigen un Bearer real verificado por
// Supabase. Estas dos funciones deciden, en cada uno de los 2 puntos de
// control, si hay que bloquear en vez de seguir:
//   - ANTES de llamar al Worker: sin sesión real, no se manda la petición
//     (cp04ShouldBlockAnonymousReservaSubmit).
//   - DESPUÉS de la respuesta del Worker: un 401 significa que el token
//     enviado (si alguno) ya no es válido para el backend — sesión
//     caducada o revocada en otro sitio, por ejemplo — y hay que limpiar la
//     sesión local en vez de reintentar con el mismo token
//     (cp04IsSessionExpiredReservaResponse).
//
// Extraídas de App.jsx para poder testear con node --test sin harness de
// render de React (no existe ninguno en este proyecto todavía, ver la nota
// equivalente en src/utils/reservationErrors.js).

export function cp04ShouldBlockAnonymousReservaSubmit(auth) {
  return !auth?.isAuthenticated;
}

export function cp04IsSessionExpiredReservaResponse(response) {
  return Boolean(response) && response.status === 401;
}
