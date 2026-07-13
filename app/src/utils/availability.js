// Club Pádel 04 · Motor puro de disponibilidad de reservas.
//
// evaluateSlotAvailability() no depende de React, del DOM ni de fetch: solo
// de los datos que se le pasan. Esto permite testearlo con node --test sin
// levantar la app, y reutilizarlo desde cualquier pantalla (reservar,
// cancelar, reprogramar) sin duplicar la lógica de negocio en cada una.
//
// Convención de fechas/horas: todo son strings "YYYY-MM-DD" / "HH:MM" en la
// hora local del club (Europe/Madrid ya se resuelve en el llamador, p. ej.
// vía madridDateParts() en App.jsx). Esta función no hace conversión de
// zona horaria: currentDateTime debe construirse ya en esa hora local
// "ingenua" (el mismo truco que ya usa isSundayISO en App.jsx:
// Date.UTC(year, month-1, day, hour, minute), tratando la hora de Madrid
// como si fuese UTC para comparar solo por valores, no por huso real).

export const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  UNAVAILABLE: "unavailable",
});

export const AVAILABILITY_REASON = Object.freeze({
  INVALID_DATE: "invalid_date",
  CLUB_CLOSED: "club_closed",
  OUTSIDE_OPENING_HOURS: "outside_opening_hours",
  PAST_TIME: "past_time",
  INVALID_DURATION: "invalid_duration",
  INSUFFICIENT_REMAINING_TIME: "insufficient_remaining_time",
  BOOKING_OVERLAP: "booking_overlap",
});

function parseISODateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function isSundayParts(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay() === 0;
}

function minutesFromTime(value) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ""));
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

function toISODateFromUTCGetters(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function bookingMinutes(booking, key, timeKey) {
  const explicit = booking[key];
  if (Number.isFinite(explicit)) return explicit;
  return minutesFromTime(booking[timeKey]);
}

/**
 * @param {Object} params
 * @param {string} params.date - "YYYY-MM-DD"
 * @param {string} params.startTime - "HH:MM"
 * @param {number} params.durationMinutes
 * @param {string} params.courtId - identificador de pista (hoy, el nombre: "Pista 1")
 * @param {Array<{courtId:string,date:string,startTime?:string,endTime?:string,startMinutes?:number,endMinutes?:number}>} [params.existingBookings]
 * @param {{closingMinutes?:number, allowedStartTimes?:string[], allowedDurations?:number[]}} [params.openingHours]
 * @param {Date} [params.currentDateTime] - ver nota de convención arriba
 * @returns {{status:"available"|"occupied"|"unavailable", reason: string|null}}
 */
export function evaluateSlotAvailability({
  date,
  startTime,
  durationMinutes,
  courtId,
  existingBookings = [],
  openingHours = {},
  currentDateTime = new Date(),
}) {
  // 1. Fecha/hora estructuralmente inválidas.
  const dateParts = parseISODateParts(date);
  const startMinutes = minutesFromTime(startTime);

  if (!dateParts || !Number.isFinite(startMinutes)) {
    return { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: AVAILABILITY_REASON.INVALID_DATE };
  }

  // 2. Club cerrado (domingo). Nunca "available" ni "occupied" en domingo.
  if (isSundayParts(dateParts)) {
    return { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: AVAILABILITY_REASON.CLUB_CLOSED };
  }

  // 3. Fuera de horario de apertura (franja de inicio no permitida).
  if (
    Array.isArray(openingHours.allowedStartTimes) &&
    !openingHours.allowedStartTimes.includes(startTime)
  ) {
    return { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: AVAILABILITY_REASON.OUTSIDE_OPENING_HOURS };
  }

  // 4. Hora pasada (solo relevante si la fecha es hoy o ya pasó).
  const currentDateISO = toISODateFromUTCGetters(currentDateTime);
  const currentMinutes = currentDateTime.getUTCHours() * 60 + currentDateTime.getUTCMinutes();

  if (date < currentDateISO || (date === currentDateISO && startMinutes <= currentMinutes)) {
    return { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: AVAILABILITY_REASON.PAST_TIME };
  }

  // 5. Duración inválida.
  const validDuration =
    Number.isFinite(durationMinutes) &&
    durationMinutes > 0 &&
    (!Array.isArray(openingHours.allowedDurations) || openingHours.allowedDurations.includes(durationMinutes));

  if (!validDuration) {
    return { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: AVAILABILITY_REASON.INVALID_DURATION };
  }

  const requestedStart = startMinutes;
  const requestedEnd = startMinutes + durationMinutes;

  // 6. No queda tiempo suficiente hasta el cierre.
  if (Number.isFinite(openingHours.closingMinutes) && requestedEnd > openingHours.closingMinutes) {
    return { status: AVAILABILITY_STATUS.UNAVAILABLE, reason: AVAILABILITY_REASON.INSUFFICIENT_REMAINING_TIME };
  }

  // 7. Solapamiento con una reserva existente (intervalo real, no solo
  // coincidencia de hora de inicio): requestedStart < existingEnd
  // AND requestedEnd > existingStart.
  const overlaps = existingBookings.some((booking) => {
    if (booking.courtId !== courtId || booking.date !== date) return false;

    const existingStart = bookingMinutes(booking, "startMinutes", "startTime");
    const existingEnd = bookingMinutes(booking, "endMinutes", "endTime");

    if (!Number.isFinite(existingStart) || !Number.isFinite(existingEnd)) return false;

    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (overlaps) {
    return { status: AVAILABILITY_STATUS.OCCUPIED, reason: AVAILABILITY_REASON.BOOKING_OVERLAP };
  }

  // 8. Disponible.
  return { status: AVAILABILITY_STATUS.AVAILABLE, reason: null };
}

/** Convierte la respuesta compatible del Worker en intervalos evaluables. */
export function availabilityBookingsFromResponse(data, fallbackDurationMinutes = 90) {
  if (Array.isArray(data?.ocupadas_detalle) && data.ocupadas_detalle.length > 0) {
    return data.ocupadas_detalle.map((item) => ({
      courtId: item.pista,
      date: item.fecha,
      startTime: item.hora_inicio,
      endTime: item.hora_fin || null,
      endMinutes: item.hora_fin ? undefined : minutesFromTime(item.hora_inicio) + Number(fallbackDurationMinutes),
    }));
  }

  return (Array.isArray(data?.ocupadas) ? data.ocupadas : []).map((key) => {
    const [date, courtId, startTime] = String(key).split("|");
    return {
      courtId,
      date,
      startTime,
      endMinutes: minutesFromTime(startTime) + Number(fallbackDurationMinutes),
    };
  });
}

export function hasBookingOverlap({ data, date, startTime, durationMinutes, courtId }) {
  const result = evaluateSlotAvailability({
    date,
    startTime,
    durationMinutes: Number(durationMinutes),
    courtId,
    existingBookings: availabilityBookingsFromResponse(data, durationMinutes),
    openingHours: {},
    currentDateTime: new Date(Date.UTC(1970, 0, 1)),
  });
  return result.status === AVAILABILITY_STATUS.OCCUPIED;
}
