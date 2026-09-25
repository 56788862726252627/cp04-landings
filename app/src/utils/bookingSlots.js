// Fuente canónica de franjas horarias de Club Pádel 04.
// Importada por App.jsx y testeada directamente desde bookingSlots.test.mjs.
// El Worker mantiene una copia propia (worker-reservas/src/index.js) — deben
// mantenerse sincronizadas.

export const BOOKING_HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00", "21:00", "22:00",
];

export const BOOKING_DURATIONS = [60, 90, 120];

// El club cierra a las 23:00 (1380 minutos desde medianoche).
export const CLUB_CLOSING_MINUTES = 23 * 60;

/**
 * Devuelve las duraciones válidas para una hora de inicio dada.
 * Solo incluye duraciones cuyo fin no supere las 23:00.
 * Si la hora es inválida, devuelve todas las duraciones (seguro por defecto).
 */
export function getAvailableDurationsForHour(hora) {
  if (!hora || typeof hora !== "string" || !hora.includes(":")) {
    return BOOKING_DURATIONS;
  }
  const [h, m] = hora.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return BOOKING_DURATIONS;
  const startMins = h * 60 + m;
  return BOOKING_DURATIONS.filter((d) => startMins + d <= CLUB_CLOSING_MINUTES);
}
