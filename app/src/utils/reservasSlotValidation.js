// Helpers puros para la coherencia de disponibilidad en el formulario de Reservas.
// Separados de App.jsx para ser testables con node --test sin levantar la app.
//
// CONTEXTO DEL BUG CORREGIDO: getSlotStatus() usaba evaluateSlotAvailability
// con courtId=null y existingBookings=[], lo que hacía que el formulario
// ignorase los slots ocupados visibles en el calendario.

import { BOOKING_HOURS, getAvailableDurationsForHour } from "./bookingSlots.js";

/**
 * Dado un set de claves ocupadas "fecha|pista|hora" (devuelto por el backend),
 * indica si el slot está libre de ocupación.
 * No comprueba reglas temporales (pasado, cierre, fuera de horario).
 */
export function isSlotFreeFromOccupancy(fecha, hora, pista, ocupadasSet) {
  return !ocupadasSet.has(`${fecha}|${pista}|${hora}`);
}

/**
 * Duración a usar en el calendario para evaluar si un slot puede iniciarse.
 * SIEMPRE devuelve la duración mínima válida para esa franja (normalmente 60).
 *
 * La lógica "¿puede mi duración seleccionada caber aquí?" es incorrecta para
 * el calendario porque:
 * 1. Cierre: 22:00 + 90min → INSUFFICIENT_REMAINING_TIME aunque esté libre
 * 2. Solapamiento: reserva [22:00,23:00) marcaría 21:00 como ocupado con
 *    dur=90 (21:00+90=22:30 solapa), pero con 60min 21:00+60=22:00 no solapa.
 *
 * El calendario pregunta "¿puede INICIARSE alguna reserva aquí?", no
 * "¿cabe mi duración seleccionada aquí?".
 */
export function effectiveDurationForSlot(hora) {
  return getAvailableDurationsForHour(hora)[0] ?? 60;
}

/**
 * Tras un cambio de fecha o pista, devuelve la hora a usar:
 * - la actual si sigue libre en el nuevo contexto
 * - la primera hora libre de BOOKING_HOURS en caso contrario
 * - null si todas las franjas están ocupadas
 */
export function resolveHoraAfterContextChange(fecha, pista, currentHora, ocupadasSet) {
  if (!ocupadasSet.has(`${fecha}|${pista}|${currentHora}`)) return currentHora;
  return BOOKING_HOURS.find(
    (h) =>
      !ocupadasSet.has(`${fecha}|${pista}|${h}`) &&
      getAvailableDurationsForHour(h).length > 0
  ) ?? null;
}
