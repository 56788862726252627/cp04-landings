const DEFAULT_TIMEZONE = "Europe/Madrid";
const DEFAULT_MAX_ADVANCE_DAYS = 365;
const DEFAULT_AIRTABLE_TIMEOUT_MS = 5000;
const SCOPE_VALUE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const FIELD_NAME_PATTERN = /^[\p{L}\p{N}_ .-]{1,100}$/u;

export const AVAILABILITY_ERROR = Object.freeze({
  MISSING_DATE: "AVAILABILITY_DATE_REQUIRED",
  INVALID_DATE_FORMAT: "AVAILABILITY_DATE_FORMAT_INVALID",
  IMPOSSIBLE_DATE: "AVAILABILITY_DATE_IMPOSSIBLE",
  DATE_OUT_OF_RANGE: "AVAILABILITY_DATE_OUT_OF_RANGE",
  INVALID_TIMEZONE: "AVAILABILITY_TIMEZONE_INVALID",
  TIMEZONE_MISMATCH: "AVAILABILITY_TIMEZONE_MISMATCH",
  SCOPE_NOT_CONFIGURED: "AVAILABILITY_SCOPE_NOT_CONFIGURED",
  AIRTABLE_NOT_CONFIGURED: "AIRTABLE_NOT_CONFIGURED",
  AIRTABLE_TIMEOUT: "AIRTABLE_TIMEOUT",
  AIRTABLE_UNAVAILABLE: "AIRTABLE_UNAVAILABLE",
  AIRTABLE_INVALID_RESPONSE: "AIRTABLE_INVALID_RESPONSE",
  AIRTABLE_MISSING_FIELDS: "AIRTABLE_MISSING_FIELDS",
});

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function datePartsInTimeZone(now, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function utcDayNumber({ year, month, day }) {
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function parseStrictISODate(value) {
  const normalized = clean(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return { ok: false, code: normalized ? AVAILABILITY_ERROR.INVALID_DATE_FORMAT : AVAILABILITY_ERROR.MISSING_DATE };

  const parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (
    date.getUTCFullYear() !== parts.year ||
    date.getUTCMonth() !== parts.month - 1 ||
    date.getUTCDate() !== parts.day
  ) {
    return { ok: false, code: AVAILABILITY_ERROR.IMPOSSIBLE_DATE };
  }

  return { ok: true, value: normalized, parts };
}

export function validateAvailabilityDate(value, {
  now = new Date(),
  timeZone = DEFAULT_TIMEZONE,
  requestedTimeZone = null,
  maxAdvanceDays = DEFAULT_MAX_ADVANCE_DAYS,
} = {}) {
  const canonicalTimeZone = clean(timeZone) || DEFAULT_TIMEZONE;
  if (!validTimeZone(canonicalTimeZone)) {
    return { ok: false, code: AVAILABILITY_ERROR.INVALID_TIMEZONE };
  }

  const clientTimeZone = clean(requestedTimeZone);
  if (clientTimeZone && clientTimeZone !== canonicalTimeZone) {
    return { ok: false, code: AVAILABILITY_ERROR.TIMEZONE_MISMATCH };
  }

  const parsed = parseStrictISODate(value);
  if (!parsed.ok) return parsed;

  const todayParts = datePartsInTimeZone(now, canonicalTimeZone);
  const deltaDays = utcDayNumber(parsed.parts) - utcDayNumber(todayParts);
  const safeMaxDays = Number.isInteger(Number(maxAdvanceDays))
    ? Math.min(Math.max(Number(maxAdvanceDays), 1), 730)
    : DEFAULT_MAX_ADVANCE_DAYS;

  if (deltaDays < 0 || deltaDays > safeMaxDays) {
    return { ok: false, code: AVAILABILITY_ERROR.DATE_OUT_OF_RANGE };
  }

  return {
    ok: true,
    value: parsed.value,
    parts: parsed.parts,
    timeZone: canonicalTimeZone,
    isSunday: new Date(Date.UTC(parsed.parts.year, parsed.parts.month - 1, parsed.parts.day)).getUTCDay() === 0,
  };
}

export function resolveAvailabilityScope(env = {}) {
  const tenantId = clean(env.AVAILABILITY_TENANT_ID);
  const clubId = clean(env.AVAILABILITY_CLUB_ID);
  const tenantField = clean(env.AIRTABLE_TENANT_FIELD);
  const clubField = clean(env.AIRTABLE_CLUB_FIELD);

  if (
    !SCOPE_VALUE_PATTERN.test(tenantId) ||
    !SCOPE_VALUE_PATTERN.test(clubId) ||
    !FIELD_NAME_PATTERN.test(tenantField) ||
    !FIELD_NAME_PATTERN.test(clubField)
  ) {
    return { ok: false, code: AVAILABILITY_ERROR.SCOPE_NOT_CONFIGURED };
  }

  return { ok: true, tenantId, clubId, tenantField, clubField };
}

export function escapeAirtableFormulaValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function buildAvailabilityFormula({ date, scope }) {
  const safeDate = escapeAirtableFormulaValue(date);
  const safeTenant = escapeAirtableFormulaValue(scope.tenantId);
  const safeClub = escapeAirtableFormulaValue(scope.clubId);
  return `AND(FIND("${safeDate}|", {clave_slot}) = 1, {${scope.tenantField}} = "${safeTenant}", {${scope.clubField}} = "${safeClub}", OR({estado_reserva} = "pendiente", {estado_reserva} = "confirmada", {estado_reserva} = "reprogramada"))`;
}

export function availabilityAirtableTimeoutMs(env = {}) {
  const configured = Number(env.AIRTABLE_TIMEOUT_MS);
  return Number.isFinite(configured)
    ? Math.min(Math.max(Math.trunc(configured), 100), 10_000)
    : DEFAULT_AIRTABLE_TIMEOUT_MS;
}

export function isTimeoutError(error) {
  return error?.name === "AbortError" || error?.name === "TimeoutError";
}

export function normalizeAvailabilityRecords(records, { date, scope }) {
  if (!Array.isArray(records)) {
    return { ok: false, code: AVAILABILITY_ERROR.AIRTABLE_INVALID_RESPONSE };
  }

  const matching = [];
  for (const record of records) {
    const fields = record?.fields;
    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      return { ok: false, code: AVAILABILITY_ERROR.AIRTABLE_MISSING_FIELDS };
    }

    const required = [
      fields.clave_slot,
      fields.Pista,
      fields.hora_inicio,
      fields.hora_fin,
      fields[scope.tenantField],
      fields[scope.clubField],
    ];
    if (required.some((value) => value === null || value === undefined || value === "")) {
      return { ok: false, code: AVAILABILITY_ERROR.AIRTABLE_MISSING_FIELDS };
    }

    if (
      String(fields[scope.tenantField]) !== scope.tenantId ||
      String(fields[scope.clubField]) !== scope.clubId
    ) {
      continue;
    }

    const court = Array.isArray(fields.Pista) ? fields.Pista[0] : fields.Pista;
    matching.push({
      slotKey: String(fields.clave_slot),
      detail: {
        pista: String(court),
        fecha: date,
        hora_inicio: String(fields.hora_inicio),
        hora_fin: String(fields.hora_fin),
      },
    });
  }

  return { ok: true, records: matching };
}
