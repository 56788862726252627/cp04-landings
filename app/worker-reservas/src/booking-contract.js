const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const BOOKING_WRITE_ACTIONS = Object.freeze([
  "crear_reserva",
  "reprogramar_reserva",
]);

export const BOOKING_ERROR = Object.freeze({
  IDEMPOTENCY_KEY_REQUIRED: "IDEMPOTENCY_KEY_REQUIRED",
  IDEMPOTENCY_KEY_INVALID: "IDEMPOTENCY_KEY_INVALID",
  SCOPE_NOT_CONFIGURED: "RESERVATION_SCOPE_NOT_CONFIGURED",
  INVALID_INTERVAL: "RESERVATION_INTERVAL_INVALID",
  SLOT_CONFLICT: "slot_conflict",
  BACKEND_UNAVAILABLE: "backend_unavailable",
  TIMEOUT: "timeout",
});

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function minutes(value) {
  if (!TIME_PATTERN.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return (hour * 60) + minute;
}

function addMinutes(startTime, durationMinutes) {
  const start = minutes(startTime);
  const duration = Number(durationMinutes);
  if (start === null || !Number.isInteger(duration) || duration <= 0) return "";
  const end = start + duration;
  if (end > (24 * 60)) return "";
  return `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
}

export function isBookingWriteAction(action) {
  return BOOKING_WRITE_ACTIONS.includes(clean(action));
}

export function validateBookingIdempotency(payload) {
  if (!isBookingWriteAction(payload?.accion)) return { ok: true };
  const value = clean(payload?.idempotency_key);
  if (!value) return { ok: false, code: BOOKING_ERROR.IDEMPOTENCY_KEY_REQUIRED };
  if (!IDEMPOTENCY_KEY_PATTERN.test(value)) {
    return { ok: false, code: BOOKING_ERROR.IDEMPOTENCY_KEY_INVALID };
  }
  return { ok: true, value };
}

export function resolveReservationScope(env = {}) {
  const tenantId = clean(env.RESERVATIONS_TENANT_ID || env.AVAILABILITY_TENANT_ID);
  const clubId = clean(env.RESERVATIONS_CLUB_ID || env.AVAILABILITY_CLUB_ID);
  if (!ID_PATTERN.test(tenantId) || !ID_PATTERN.test(clubId)) {
    return { ok: false, code: BOOKING_ERROR.SCOPE_NOT_CONFIGURED };
  }
  return {
    ok: true,
    tenantId,
    clubId,
    timeZone: clean(env.CLUB_TIMEZONE) || "Europe/Madrid",
  };
}

export function buildCanonicalBookingOperation(payload, {
  scope,
  correlationId,
  now = new Date(),
} = {}) {
  const action = clean(payload?.accion);
  const isReschedule = action === "reprogramar_reserva";
  const reservation = payload?.reserva || {};
  const date = clean(isReschedule ? payload?.nueva_fecha_reserva : reservation.fecha);
  const startTime = clean(isReschedule ? payload?.nueva_hora_inicio : reservation.hora);
  const endTime = clean(isReschedule ? payload?.nueva_hora_fin : reservation.hora_fin)
    || addMinutes(startTime, reservation.duracion_minutos);
  const court = clean(isReschedule
    ? (payload?.nueva_pista || payload?.pista_nueva)
    : reservation.pista);
  const startMinutes = minutes(startTime);
  const endMinutes = minutes(endTime);
  if (!date || !court || startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return { ok: false, code: BOOKING_ERROR.INVALID_INTERVAL };
  }

  const timestamp = now.toISOString();
  return {
    ok: true,
    value: {
      tenant_id: scope.tenantId,
      club_id: scope.clubId,
      court_id: court,
      pista: court,
      start_time: startTime,
      end_time: endTime,
      date,
      timezone: scope.timeZone,
      user_id: null,
      reservation_id: isReschedule ? clean(payload?.clave_reserva) : null,
      idempotency_key: clean(payload?.idempotency_key),
      correlation_id: correlationId,
      operation_type: isReschedule ? "reschedule" : "create",
      source: clean(payload?.origen) || "worker",
      status: "requested",
      created_at: timestamp,
      updated_at: timestamp,
    },
  };
}

export function hasReservationConflict(candidate, existingReservations = [], {
  excludeReservationId = null,
} = {}) {
  const candidateStart = minutes(candidate?.start_time);
  const candidateEnd = minutes(candidate?.end_time);
  if (candidateStart === null || candidateEnd === null || candidateEnd <= candidateStart) return true;

  return existingReservations.some((reservation) => {
    if (excludeReservationId && reservation?.reservation_id === excludeReservationId) return false;
    if (
      reservation?.tenant_id !== candidate.tenant_id ||
      reservation?.club_id !== candidate.club_id ||
      reservation?.court_id !== candidate.court_id ||
      reservation?.date !== candidate.date
    ) return false;
    const existingStart = minutes(reservation?.start_time);
    const existingEnd = minutes(reservation?.end_time);
    if (existingStart === null || existingEnd === null || existingEnd <= existingStart) return true;
    return candidateStart < existingEnd && existingStart < candidateEnd;
  });
}

export function classifyBookingBackendResponse(status, body = {}) {
  const error = clean(body?.error);
  const replay = body?.idempotent_replay === true || clean(body?.status) === "idempotent_replay";
  if (status === 201) return { status: 201, code: "created" };
  if (status === 200 && replay) return { status: 200, code: "idempotent_replay" };
  if (status === 409 || error === BOOKING_ERROR.SLOT_CONFLICT) {
    return { status: 409, code: BOOKING_ERROR.SLOT_CONFLICT };
  }
  if (status === 422) return { status: 422, code: "invalid_payload" };
  if (status === 401 || status === 403) return { status, code: status === 401 ? "unauthorized" : "forbidden" };
  if (status === 504) return { status: 504, code: BOOKING_ERROR.TIMEOUT };
  if (status === 503 || status >= 500) return { status: 503, code: BOOKING_ERROR.BACKEND_UNAVAILABLE };
  if (status >= 200 && status < 300) return { status: 200, code: "forwarded" };
  return { status: 503, code: BOOKING_ERROR.BACKEND_UNAVAILABLE };
}
