import {
  CP04_AUTH_ROLES,
  CP04_AUTH_PERMISSIONS,
  parseAuthorizationHeader,
  authorizeRole,
  requireAuth,
  requireRoles,
} from "../auth/authorization.js";
import {
  isOriginAllowed,
  resolveSessionToken,
  resolveRefreshToken,
  buildAccessCookie,
  buildRefreshCookie,
  buildExpiredAccessCookie,
  buildExpiredRefreshCookie,
} from "../auth/session-cookie.js";
import {
  fetchLiveMakeInventory,
  checkMakeRateLimit,
} from "../support/makeLiveInventory.js";

import {
  resolveRequestId,
  resolveCorrelationId,
  resolveOrStartCorrelationId,
  attachCorrelationHeaders,
  buildRequestLogEvent,
  logStructuredEvent,
  buildHealthLiveResponse,
  buildHealthReadyResponse,
  buildMakePayload,
  dependencyStatusFromConfig,
} from "./observability-runtime.js";
import {
  AVAILABILITY_ERROR,
  availabilityAirtableTimeoutMs,
  buildAvailabilityFormula,
  isTimeoutError,
  normalizeAvailabilityRecords,
  resolveAvailabilityScope,
  validateAvailabilityDate,
} from "./availability-contract.js";
import {
  BOOKING_ERROR,
  buildCanonicalBookingOperation,
  classifyBookingBackendResponse,
  isBookingWriteAction,
  resolveReservationScope,
  validateBookingIdempotency,
} from "./booking-contract.js";
import { runStripeWebhookIntegrationHarness } from "../payments/stripe-integration-harness.js";
import {
  STRIPE_WEBHOOK_ROUTE,
  validateContentType,
  assertRawBodyNotConsumed,
  extractSignatureHeader,
  sanitizeForRouteLogging,
  withTimeoutBudget,
  mapClassificationToHttpResponse,
} from "../payments/stripe-route-contract.js";
import { createStripeEventLockStore } from "../payments/stripe-lock-store-factory.js";
import { PaymentIdempotencyStore } from "../payments/stripe-idempotency.js";
import { createInMemorySideEffects } from "../payments/stripe-side-effects.js"; // sustituir por implementación real antes de producción

// Stripe webhook — estado de módulo (singleton por isolate, no por request:
// el lock de idempotencia debe sobrevivir entre requests dentro del mismo
// isolate, igual que el backend KV lo hace entre isolates). Se crea de forma
// PEREZOSA (no en el top-level del módulo) porque `env` — y por tanto
// `env.STRIPE_IDEMPOTENCY_KV` — solo existe dentro de fetch(request, env),
// nunca en el scope de import de un Worker; WORKER_ROUTE_INTEGRATION_PLAN.md
// asumía un store 100% en memoria (sin env) y podía permitirse un `const` de
// top-level, pero el adapter KV real (stripe-lock-store-factory.js) sí lo
// necesita.
let stripeEventLockStore = null;
const stripeBusinessIdempotencyStore = new PaymentIdempotencyStore();

function getStripeEventLockStore(env) {
  if (!stripeEventLockStore) {
    stripeEventLockStore = createStripeEventLockStore(env).store;
  }
  return stripeEventLockStore;
}

// Exportado (además del default de fetch()) únicamente para que los tests de
// worker-reservas/src/index.stripe-webhook.test.mjs puedan verificar la
// memoización del singleton sin duplicar la lógica de selección KV/memoria
// (esa ya la prueba tests/stripe/lock-store-factory.test.mjs sobre
// createStripeEventLockStore en aislamiento).
export { getStripeEventLockStore };

const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const BOOKING_DURATIONS = [60, 90, 120];
const BOOKING_MODALITIES = ["libre", "partido", "clase", "torneo"];
const BOOKING_LEVELS = ["iniciacion", "intermedio", "avanzado", "competicion"];
const COURTS = ["Pista 1", "Pista 2", "Pista 3", "Pista 4"];

function jsonResponse(body, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...corsHeaders,
    },
  });
}

// Lote A7 — variante de jsonResponse() que además adjunta una o más cabeceras
// Set-Cookie. No sustituye a jsonResponse (que sigue igual para las ~50
// rutas que no necesitan cookies): un objeto plano no puede tener dos claves
// "Set-Cookie" (login necesita fijar cp04_at Y cp04_rt a la vez), así que
// esta variante usa `Headers.append()`, que sí soporta cabeceras repetidas.
function jsonResponseWithCookies(body, status, corsHeaders, cookies = []) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...corsHeaders,
  });
  for (const cookie of cookies) {
    if (cookie) headers.append("Set-Cookie", cookie);
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function corsHeaders(request, env) {
  // isOriginAllowed() centraliza el mismo allowlist (ALLOWED_ORIGIN) que
  // ahora también usa el gate CSRF de session-cookie.js — una sola fuente
  // de verdad para "qué origen es de confianza".
  if (!isOriginAllowed(request, env)) {
    return {};
  }

  const origin = request.headers.get("Origin") || "";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-CP04-Correlation-Id, X-CP04-Request-Id",
    // Lote A7 — necesario para que fetch(url, {credentials:'include'}) desde
    // el frontend envíe/reciba las cookies HttpOnly de sesión. Solo se emite
    // cuando el origen ya está en el allowlist (arriba) — nunca junto a "*".
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

// CP04_DOMINGOS_V1: reglas permanentes de cierre dominical.
function parseISODateParts(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(cleanText(value));
  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function isSundayISO(value) {
  const parts = parseISODateParts(value);
  if (!parts) return false;

  return new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day)
  ).getUTCDay() === 0;
}

function requestedReservationDate(payload, accion) {
  if (accion === "reprogramar_reserva") {
    return cleanText(
      payload?.nueva_fecha_reserva ??
      payload?.nueva_fecha ??
      payload?.reserva?.nueva_fecha_reserva
    );
  }

  if (accion === "crear_reserva") {
    return cleanText(
      payload?.reserva?.fecha ??
      payload?.fecha_reserva ??
      payload?.fecha
    );
  }

  return "";
}


function validatePayload(payload) {
  const errors = {};
  const accion = cleanText(payload?.accion);

  // CP04_DOMINGOS_V1: crear o reprogramar en domingo es inválido.
  const fechaSolicitada = requestedReservationDate(payload, accion);
  if (
    (accion === "crear_reserva" || accion === "reprogramar_reserva") &&
    isSundayISO(fechaSolicitada)
  ) {
    errors.fecha_reserva = "El club está cerrado los domingos.";
  }


  if (accion === "consultar_disponibilidad") {
    const fechaConsulta = cleanText(
      payload?.reserva?.fecha ??
      payload?.fecha_reserva ??
      payload?.fecha
    );
    const emailConsulta = cleanText(
      payload?.jugador?.email ??
      payload?.Email ??
      payload?.email
    );

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaConsulta)) {
      errors.fecha_reserva = "Fecha de consulta invalida.";
    }

    if (
      !emailConsulta ||
      emailConsulta.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailConsulta)
    ) {
      errors.Email = "Email invalido.";
    }

    return errors;
  }

  if (accion === "cancelar_reserva") {
    const claveReserva = cleanText(payload?.clave_reserva);

    if (!/^[A-Za-z0-9_-]{8,128}$/.test(claveReserva)) {
      errors.clave_reserva = "Clave de reserva invalida.";
    }

    return errors;
  }

  if (accion === "reprogramar_reserva") {
    const claveReserva = cleanText(
      payload?.clave_reserva
    );

    const nuevaFechaReserva = cleanText(
      payload?.nueva_fecha_reserva
    );

    const nuevaHoraInicio = cleanText(
      payload?.nueva_hora_inicio
    );

    const nuevaHoraFin = cleanText(
      payload?.nueva_hora_fin
    );

    const nuevaPista = cleanText(
      payload?.nueva_pista ?? payload?.pista_nueva
    );

    const formatoFechaValido =
      /^\d{4}-\d{2}-\d{2}$/.test(
        nuevaFechaReserva
      );

    const formatoHoraValido =
      /^(?:[01]\d|2[0-3]):[0-5]\d$/;

    if (!claveReserva || claveReserva.length < 8) {
      errors.clave_reserva =
        "Clave de reserva invalida.";
    }

    if (!formatoFechaValido) {
      errors.nueva_fecha_reserva =
        "Nueva fecha de reserva invalida.";
    }

    if (!formatoHoraValido.test(nuevaHoraInicio)) {
      errors.nueva_hora_inicio =
        "Nueva hora de inicio invalida.";
    }

    if (!formatoHoraValido.test(nuevaHoraFin)) {
      errors.nueva_hora_fin =
        "Nueva hora de fin invalida.";
    }

    if (
      formatoHoraValido.test(nuevaHoraInicio) &&
      formatoHoraValido.test(nuevaHoraFin) &&
      nuevaHoraFin <= nuevaHoraInicio
    ) {
      errors.nueva_hora_fin =
        "La hora de fin debe ser posterior.";
    }

    if (!nuevaPista || nuevaPista.length > 100) {
      errors.nueva_pista =
        "Nueva pista invalida.";
    }

    return errors;
  }

  if (accion !== "crear_reserva") {
    errors.accion = "Accion no soportada.";
    return errors;
  }

  const jugador = payload?.jugador || {};
  const reserva = payload?.reserva || {};
  const duration = Number(reserva.duracion_minutos);
  const selectedDate = reserva.fecha
    ? new Date(`${reserva.fecha}T00:00:00`)
    : null;
  const today = new Date(`${todayISO()}T00:00:00`);

  if (cleanText(jugador.nombre).length < 2) {
    errors.nombre = "Nombre invalido.";
  }

  if (cleanText(jugador.apellidos).length < 2) {
    errors.apellidos = "Apellidos invalidos.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    cleanText(jugador.email),
  )) {
    errors.email = "Email invalido.";
  }

  if (
    cleanText(jugador.telefono)
      .replace(/\D/g, "")
      .length < 9
  ) {
    errors.telefono = "Telefono invalido.";
  }

  if (!reserva.fecha) {
    errors.fecha = "Fecha requerida.";
  } else if (
    Number.isNaN(selectedDate.getTime()) ||
    selectedDate < today
  ) {
    errors.fecha = "Fecha invalida.";
  }

  if (!BOOKING_HOURS.includes(reserva.hora)) {
    errors.hora = "Hora invalida.";
  }

  if (!BOOKING_DURATIONS.includes(duration)) {
    errors.duracion_minutos = "Duracion invalida.";
  }

  if (!COURTS.includes(reserva.pista)) {
    errors.pista = "Pista invalida.";
  }

  if (!BOOKING_MODALITIES.includes(reserva.modalidad)) {
    errors.modalidad = "Modalidad invalida.";
  }

  if (!BOOKING_LEVELS.includes(reserva.nivel)) {
    errors.nivel = "Nivel invalido.";
  }

  return errors;
}

function normalizePayload(payload) {
  const accion = cleanText(payload?.accion);
  const receivedAt = new Date().toISOString();

  if (accion === "consultar_disponibilidad") {
    const fechaConsulta = cleanText(
      payload?.reserva?.fecha ??
      payload?.fecha_reserva ??
      payload?.fecha
    );
    const nombreConsulta = cleanText(
      payload?.jugador?.nombre ??
      payload?.Nombre ??
      payload?.nombre
    );
    const apellidosConsulta = cleanText(
      payload?.jugador?.apellidos ??
      payload?.Apellidos ??
      payload?.apellidos
    );
    const emailConsulta = cleanText(
      payload?.jugador?.email ??
      payload?.Email ??
      payload?.email
    );
    const telefonoConsulta = cleanText(
      payload?.jugador?.telefono ??
      payload?.Telefono ??
      payload?.telefono
    );
    const duracionRaw =
      payload?.reserva?.duracion_minutos ??
      payload?.duracion_minutos ??
      90;
    const duracionConsulta = Number.isFinite(Number(duracionRaw))
      ? Number(duracionRaw)
      : 90;

    return {
      accion: "consultar_disponibilidad",
      origen: cleanText(payload?.origen),
      club: cleanText(payload?.club),

      jugador: {
        nombre: nombreConsulta,
        apellidos: apellidosConsulta,
        email: emailConsulta,
        telefono: telefonoConsulta
      },

      reserva: {
        fecha: fechaConsulta,
        pista: cleanText(payload?.reserva?.pista),
        hora: cleanText(payload?.reserva?.hora),
        hora_fin: cleanText(payload?.reserva?.hora_fin),
        duracion_minutos: duracionConsulta
      },

      Nombre: nombreConsulta,
      Apellidos: apellidosConsulta,
      Email: emailConsulta,
      Telefono: telefonoConsulta,
      fecha_reserva: fechaConsulta,
      duracion_minutos: duracionConsulta,
      received_at: receivedAt
    };
  }

  if (accion === "reprogramar_reserva") {
    const nuevaPista = cleanText(
      payload?.nueva_pista ?? payload?.pista_nueva
    );

    return {
      accion: "reprogramar_reserva",
      clave_reserva: cleanText(
        payload?.clave_reserva
      ),
      nueva_fecha_reserva: cleanText(
        payload?.nueva_fecha_reserva
      ),
      nueva_hora_inicio: cleanText(
        payload?.nueva_hora_inicio
      ),
      nueva_hora_fin: cleanText(
        payload?.nueva_hora_fin
      ),
      nueva_pista: nuevaPista,
      pista_nueva: nuevaPista,
    };
  }

  if (accion === "cancelar_reserva") {
    const jugador = payload?.jugador || {};

    return {
      accion: "cancelar_reserva",
      clave_reserva: cleanText(payload?.clave_reserva),
      fecha_cancelacion: receivedAt,
      club: cleanText(payload?.club || "Club Padel 04"),
      origen: cleanText(payload?.origen || "frontend"),
      jugador: {
        nombre: cleanText(jugador.nombre || ""),
        apellidos: cleanText(jugador.apellidos || ""),
        email: cleanText(jugador.email || "").toLowerCase(),
        telefono: cleanText(jugador.telefono || ""),
      },
      reserva: {},
      received_at: receivedAt,
    };
  }

  const jugador = payload.jugador;
  const reserva = payload.reserva;

  return {
    accion: "crear_reserva",
    club: cleanText(payload.club || "Club Padel 04"),
    origen: cleanText(payload.origen || "frontend"),
    jugador: {
      nombre: cleanText(jugador.nombre),
      apellidos: cleanText(jugador.apellidos),
      email: cleanText(jugador.email).toLowerCase(),
      telefono: cleanText(jugador.telefono),
    },
    reserva: {
      fecha: reserva.fecha,
      hora: reserva.hora,
      hora_fin: reserva.hora_fin,
      duracion_minutos: Number(reserva.duracion_minutos),
      pista: reserva.pista,
      modalidad: reserva.modalidad,
      nivel: reserva.nivel,
      precio_total: Number(reserva.precio_total || 0),
      comentarios: cleanText(reserva.comentarios || ""),
    },
    received_at: receivedAt,
  };
}

async function forwardToMake(payload, env, correlation = {}) {
  if (!env.MAKE_RESERVAS_WEBHOOK) {
    return { configured: false, ok: false, status: 503, body: null, error: BOOKING_ERROR.BACKEND_UNAVAILABLE };
  }

  const outgoingPayload = buildMakePayload(payload, {
    requestId: correlation.requestId ?? null,
    correlationId: correlation.correlationId ?? null,
  });

  const configuredTimeout = Number(env.MAKE_RESERVAS_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(configuredTimeout)
    ? Math.min(Math.max(Math.trunc(configuredTimeout), 100), 10_000)
    : 5000;

  let response;
  try {
    response = await fetch(env.MAKE_RESERVAS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(outgoingPayload),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    const timedOut = error?.name === "AbortError" || error?.name === "TimeoutError";
    return {
      configured: true,
      ok: false,
      status: timedOut ? 504 : 503,
      body: null,
      error: timedOut ? BOOKING_ERROR.TIMEOUT : BOOKING_ERROR.BACKEND_UNAVAILABLE,
    };
  }

  let body = null;
  try {
    const raw = await response.text();
    body = raw.trim() ? JSON.parse(raw) : null;
  } catch {
    body = null;
  }

  return { configured: true, ok: response.ok, status: response.status, body };
}

async function prepareAirtableWrite(payload, env) {
  const configured = Boolean(
    (env.AIRTABLE_TOKEN || env.AIRTABLE_API_KEY) &&
    env.AIRTABLE_BASE_ID &&
    (env.AIRTABLE_RESERVAS_TABLE || env.AIRTABLE_TABLE_ID)
  );

  return {
    configured,
    skipped: true,
    ok: true,
    status: 200,
    reason: "Reserva confirmada vía Make. Escritura directa Airtable desactivada para evitar duplicados y bloqueos 403."
  };
}

async function handleReservas(request, env, correlation = {}) {
  const headers = corsHeaders(request, env);

  if (!headers["Access-Control-Allow-Origin"]) {
    return jsonResponse({ ok: false, error: "Origin not allowed" }, 403, headers);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, { ...headers, Allow: "POST, OPTIONS" });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400, headers);
  }

  // Cancelar/reprogramar son operaciones de staff según la matriz RBAC
  // (CP04_AUTH_PERMISSIONS): PLAYER no las tiene. El gate está implementado
  // y listo, pero permanece detrás de CP04_ENFORCE_ROLE_GATES porque el
  // login demo por contraseña de rol no emite ningún token verificable en
  // servidor todavía: activarlo hoy sin más rompería el tutorial guiado de
  // STAFF/ADMIN/SUPPORT. Ver informe de auditoría para la decisión pendiente.
  const accionSolicitada = cleanText(payload?.accion);
  const esAccionDeStaff =
    accionSolicitada === "cancelar_reserva" ||
    accionSolicitada === "reprogramar_reserva";

  if (esAccionDeStaff && env.CP04_ENFORCE_ROLE_GATES === "true") {
    const gate = await requireRoles(request, env, ["STAFF", "ADMIN", "SUPPORT"]);

    if (!gate.ok) {
      return jsonResponse(gate.body, gate.status, headers);
    }
  }

  const errors = validatePayload(payload);
  if (Object.keys(errors).length > 0) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: errors }, 422, headers);
  }

  const idempotency = validateBookingIdempotency(payload);
  if (!idempotency.ok) {
    return jsonResponse({ ok: false, error: idempotency.code, message: "Idempotency key inválida o ausente." }, 422, headers);
  }

  let normalizedPayload = normalizePayload(payload);
  if (isBookingWriteAction(payload?.accion)) {
    const scope = resolveReservationScope(env);
    if (!scope.ok) {
      return jsonResponse({ ok: false, error: scope.code, message: "El ámbito canónico de reservas no está configurado." }, 503, headers);
    }
    const canonical = buildCanonicalBookingOperation(
      { ...normalizedPayload, idempotency_key: idempotency.value },
      { scope, correlationId: correlation.correlationId }
    );
    if (!canonical.ok) {
      return jsonResponse({ ok: false, error: canonical.code, message: "El intervalo de reserva no es válido." }, 422, headers);
    }
    normalizedPayload = { ...normalizedPayload, ...canonical.value };
  }

  const makeResult = await forwardToMake(normalizedPayload, env, correlation);
  const airtableResult = await prepareAirtableWrite(normalizedPayload, env);

  if (!makeResult.configured || makeResult.error) {
    const status = makeResult.status || 503;
    return jsonResponse({ ok: false, error: makeResult.error || BOOKING_ERROR.BACKEND_UNAVAILABLE }, status, headers);
  }

  const backend = classifyBookingBackendResponse(makeResult.status, makeResult.body || {});
  if (!makeResult.ok || backend.status >= 400) {
    return jsonResponse({ ok: false, error: backend.code, correlation_id: correlation.correlationId }, backend.status, headers);
  }
  if (isBookingWriteAction(payload?.accion) && backend.code === "forwarded") {
    return jsonResponse(
      {
        ok: false,
        error: BOOKING_ERROR.BACKEND_UNAVAILABLE,
        message: "La autoridad de reservas no confirmó commit, replay ni conflicto.",
        correlation_id: correlation.correlationId,
      },
      503,
      headers
    );
  }

  return jsonResponse({
    ok: true,
    status: backend.code,
    correlation_id: correlation.correlationId,
    reservation_id: makeResult.body?.reservation_id || null,
    make: { configured: makeResult.configured, status: makeResult.status },
    airtable: airtableResult,
  }, backend.status, headers);
}
const AVAILABILITY_ERROR_MESSAGE = Object.freeze({
  [AVAILABILITY_ERROR.MISSING_DATE]: "El parámetro fecha es obligatorio.",
  [AVAILABILITY_ERROR.INVALID_DATE_FORMAT]: "La fecha debe usar el formato ISO YYYY-MM-DD.",
  [AVAILABILITY_ERROR.IMPOSSIBLE_DATE]: "La fecha indicada no existe.",
  [AVAILABILITY_ERROR.DATE_OUT_OF_RANGE]: "La fecha está fuera del rango permitido.",
  [AVAILABILITY_ERROR.INVALID_TIMEZONE]: "La zona horaria del club no es válida.",
  [AVAILABILITY_ERROR.TIMEZONE_MISMATCH]: "La zona horaria solicitada no coincide con la del club.",
  [AVAILABILITY_ERROR.SCOPE_NOT_CONFIGURED]: "El ámbito tenant/club de disponibilidad no está configurado.",
  [AVAILABILITY_ERROR.AIRTABLE_NOT_CONFIGURED]: "Airtable no está configurado para disponibilidad.",
  [AVAILABILITY_ERROR.AIRTABLE_TIMEOUT]: "Airtable excedió el tiempo máximo de respuesta.",
  [AVAILABILITY_ERROR.AIRTABLE_UNAVAILABLE]: "Airtable no está disponible.",
  [AVAILABILITY_ERROR.AIRTABLE_INVALID_RESPONSE]: "Airtable devolvió una respuesta no válida.",
  [AVAILABILITY_ERROR.AIRTABLE_MISSING_FIELDS]: "Airtable devolvió registros incompletos.",
});

function availabilityErrorResponse(code, status, headers, extra = {}) {
  return jsonResponse(
    {
      ok: false,
      error: code,
      message: AVAILABILITY_ERROR_MESSAGE[code] || "No se pudo consultar la disponibilidad.",
      ...extra,
    },
    status,
    headers
  );
}

async function handleDisponibilidad(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "GET") {
    return jsonResponse(
      { ok: false, error: "METHOD_NOT_ALLOWED", message: "Método no permitido." },
      405,
      { ...headers, Allow: "GET, OPTIONS" }
    );
  }

  const url = new URL(request.url);
  const dateResult = validateAvailabilityDate(url.searchParams.get("fecha"), {
    timeZone: env.CLUB_TIMEZONE || "Europe/Madrid",
    requestedTimeZone: url.searchParams.get("timezone"),
    maxAdvanceDays: env.AVAILABILITY_MAX_ADVANCE_DAYS || 365,
  });

  if (!dateResult.ok) {
    return availabilityErrorResponse(dateResult.code, 400, headers);
  }

  const scope = resolveAvailabilityScope(env);
  if (!scope.ok) {
    return availabilityErrorResponse(scope.code, 503, headers);
  }

  const fecha = dateResult.value;
  if (dateResult.isSunday) {
    return jsonResponse(
      {
        ok: true,
        fecha,
        timezone: dateResult.timeZone,
        cerrado: true,
        motivo: "Club cerrado los domingos",
        ocupadas: [],
        ocupadas_detalle: [],
        total: 0,
      },
      200,
      headers
    );
  }

  const token = env.AIRTABLE_TOKEN || env.AIRTABLE_API_KEY;
  const tableId = env.AIRTABLE_RESERVAS_TABLE || env.AIRTABLE_TABLE_ID;
  if (!token || !env.AIRTABLE_BASE_ID || !tableId) {
    return availabilityErrorResponse(AVAILABILITY_ERROR.AIRTABLE_NOT_CONFIGURED, 503, headers);
  }

  const endpoint = new URL(
    `https://api.airtable.com/v0/${encodeURIComponent(env.AIRTABLE_BASE_ID)}/${encodeURIComponent(tableId)}`
  );
  endpoint.searchParams.set("filterByFormula", buildAvailabilityFormula({ date: fecha, scope }));
  for (const field of [
    "clave_slot",
    "estado_reserva",
    "fecha_reserva",
    "hora_inicio",
    "hora_fin",
    "Pista",
    scope.tenantField,
    scope.clubField,
  ]) {
    endpoint.searchParams.append("fields[]", field);
  }

  let airtableRes;
  try {
    airtableRes = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(availabilityAirtableTimeoutMs(env)),
    });
  } catch (error) {
    const code = isTimeoutError(error)
      ? AVAILABILITY_ERROR.AIRTABLE_TIMEOUT
      : AVAILABILITY_ERROR.AIRTABLE_UNAVAILABLE;
    return availabilityErrorResponse(code, code === AVAILABILITY_ERROR.AIRTABLE_TIMEOUT ? 504 : 502, headers);
  }

  let rawText;
  try {
    rawText = await airtableRes.text();
  } catch (error) {
    const code = isTimeoutError(error)
      ? AVAILABILITY_ERROR.AIRTABLE_TIMEOUT
      : AVAILABILITY_ERROR.AIRTABLE_INVALID_RESPONSE;
    return availabilityErrorResponse(code, code === AVAILABILITY_ERROR.AIRTABLE_TIMEOUT ? 504 : 502, headers);
  }

  if (!airtableRes.ok) {
    return availabilityErrorResponse(
      AVAILABILITY_ERROR.AIRTABLE_UNAVAILABLE,
      502,
      headers,
      { airtable_status: airtableRes.status }
    );
  }

  if (!rawText.trim()) {
    return availabilityErrorResponse(AVAILABILITY_ERROR.AIRTABLE_INVALID_RESPONSE, 502, headers);
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    return availabilityErrorResponse(AVAILABILITY_ERROR.AIRTABLE_INVALID_RESPONSE, 502, headers);
  }

  const normalized = normalizeAvailabilityRecords(data?.records, { date: fecha, scope });
  if (!normalized.ok) {
    return availabilityErrorResponse(normalized.code, 502, headers);
  }

  const ocupadas = normalized.records.map((record) => record.slotKey);
  const ocupadasDetalle = normalized.records.map((record) => record.detail);
  return jsonResponse(
    {
      ok: true,
      fecha,
      timezone: dateResult.timeZone,
      ocupadas,
      ocupadas_detalle: ocupadasDetalle,
      total: ocupadas.length,
    },
    200,
    headers
  );
}

// CP04_LISTADO_RESERVAS_V1_BEGIN
function cp04FormulaText(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function cp04PickField(fields, fieldId, fallbackNames = []) {
  if (
    fields &&
    Object.prototype.hasOwnProperty.call(fields, fieldId)
  ) {
    return fields[fieldId];
  }

  for (const name of fallbackNames) {
    if (
      fields &&
      Object.prototype.hasOwnProperty.call(fields, name)
    ) {
      return fields[name];
    }
  }

  return "";
}

function cp04Scalar(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.map(cp04Scalar).join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

async function cp04ListReservations(request, env) {
  const headers = corsHeaders(request, env);
  const requestUrl = new URL(request.url);

  const email = String(
    requestUrl.searchParams.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const estado = String(
    requestUrl.searchParams.get("estado") ?? ""
  )
    .trim()
    .toLowerCase();

  const requestedLimit = Number.parseInt(
    requestUrl.searchParams.get("limit") ?? "100",
    10
  );

  const limit = Number.isFinite(requestedLimit)
    ? Math.min(Math.max(requestedLimit, 1), 100)
    : 100;

  if (
    !env.AIRTABLE_TOKEN ||
    !env.AIRTABLE_BASE_ID ||
    !env.AIRTABLE_TABLE_ID
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "Airtable not configured",
      },
      503,
      headers
    );
  }

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return jsonResponse(
      {
        ok: false,
        error: "Valid email is required",
      },
      400,
      headers
    );
  }

  const conditions = [
    `LOWER({Email})="${cp04FormulaText(email)}"`,
  ];

  if (estado) {
    conditions.push(
      `LOWER({estado_reserva})="${cp04FormulaText(estado)}"`
    );
  }

  const filterFormula =
    conditions.length === 1
      ? conditions[0]
      : `AND(${conditions.join(",")})`;

  const endpoint =
    `https://api.airtable.com/v0/` +
    `${encodeURIComponent(env.AIRTABLE_BASE_ID)}/` +
    `${encodeURIComponent(env.AIRTABLE_TABLE_ID)}`;

  const allRecords = [];
  let offset = "";

  for (let page = 0; page < 10; page += 1) {
    const airtableUrl = new URL(endpoint);

    airtableUrl.searchParams.set(
      "pageSize",
      "100"
    );

    airtableUrl.searchParams.set(
      "returnFieldsByFieldId",
      "true"
    );

    airtableUrl.searchParams.set(
      "filterByFormula",
      filterFormula
    );

    if (offset) {
      airtableUrl.searchParams.set(
        "offset",
        offset
      );
    }

    const airtableResponse = await fetch(
      airtableUrl.toString(),
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
          Accept: "application/json",
        },
      }
    );

    const rawText = await airtableResponse.text();

    let airtableData = {};

    try {
      airtableData = rawText
        ? JSON.parse(rawText)
        : {};
    } catch {
      return jsonResponse(
        {
          ok: false,
          error: "Invalid Airtable response",
          airtable_status: airtableResponse.status,
        },
        502,
        headers
      );
    }

    if (!airtableResponse.ok) {
      return jsonResponse(
        {
          ok: false,
          error: "Airtable request failed",
          airtable_status: airtableResponse.status,
        },
        502,
        headers
      );
    }

    const pageRecords = Array.isArray(
      airtableData.records
    )
      ? airtableData.records
      : [];

    allRecords.push(...pageRecords);

    offset =
      typeof airtableData.offset === "string"
        ? airtableData.offset
        : "";

    if (!offset || allRecords.length >= 100) {
      break;
    }
  }

  const reservas = allRecords.map((record) => {
    const fields =
      record &&
      typeof record.fields === "object"
        ? record.fields
        : {};

    return {
      id: String(record.id ?? ""),

      nombre: cp04Scalar(
        cp04PickField(
          fields,
          "fldYEv1HQY1uK8h4P",
          ["Nombre"]
        )
      ),

      apellidos: cp04Scalar(
        cp04PickField(
          fields,
          "fldTpYFznxlN74uxN",
          ["Apellidos"]
        )
      ),

      email: cp04Scalar(
        cp04PickField(
          fields,
          "fldBssXQxXnhG8yXt",
          ["Email"]
        )
      ),

      telefono: cp04Scalar(
        cp04PickField(
          fields,
          "fldas4PPgKvIdpikH",
          ["Telefono_texto", "Teléfono"]
        )
      ),

      fecha_reserva: cp04Scalar(
        cp04PickField(
          fields,
          "fldUMLCyV75pxgHwy",
          ["fecha_reserva", "Fecha"]
        )
      ),

      hora_inicio: cp04Scalar(
        cp04PickField(
          fields,
          "fldfgICHdyy2kgxDr",
          ["hora_inicio"]
        )
      ),

      hora_fin: cp04Scalar(
        cp04PickField(
          fields,
          "fldoJx5Er5JVwLKCY",
          ["hora_fin"]
        )
      ),

      pista: cp04Scalar(
        cp04PickField(
          fields,
          "fld0UMH1W6VXF55xb",
          ["Pista", "pista"]
        )
      ),

      clave_reserva: cp04Scalar(
        cp04PickField(
          fields,
          "fldB77jTtW9uXktsL",
          ["clave_reserva"]
        )
      ),

      estado_reserva: cp04Scalar(
        cp04PickField(
          fields,
          "fldXYQaqNXZWY9IO9",
          ["estado_reserva"]
        )
      ),

      event_id: cp04Scalar(
        cp04PickField(
          fields,
          "fld3XSooEwn5tVT5U",
          ["event_id"]
        )
      ),

      clave_slot: cp04Scalar(
        cp04PickField(
          fields,
          "fldlVxpC9vcoRxrRE",
          ["clave_slot"]
        )
      ),

      fecha_cancelacion: cp04Scalar(
        cp04PickField(
          fields,
          "fldKnR6RJvVNlhGnB",
          ["fecha_cancelacion"]
        )
      ),
    };
  });

  reservas.sort((a, b) => {
    const keyA =
      `${a.fecha_reserva || ""}T` +
      `${a.hora_inicio || ""}`;

    const keyB =
      `${b.fecha_reserva || ""}T` +
      `${b.hora_inicio || ""}`;

    return keyB.localeCompare(keyA);
  });

  const limitedReservations =
    reservas.slice(0, limit);

  return jsonResponse(
    {
      ok: true,
      source: "airtable",
      email,
      estado: estado || null,
      total: limitedReservations.length,
      reservas: limitedReservations,
    },
    200,
    headers
  );
}
// CP04_LISTADO_RESERVAS_V1_END



async function handleAltaJugador(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { ok: false, error: "Method not allowed" },
      405,
      { ...headers, Allow: "POST, OPTIONS" }
    );
  }

  if (!env.MAKE_ALTA_JUGADOR_WEBHOOK) {
    return jsonResponse(
      { ok: false, error: "Alta webhook not configured" },
      503,
      headers
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse(
      { ok: false, error: "Invalid JSON" },
      400,
      headers
    );
  }

  const clean = (value) =>
    typeof value === "string" ? value.trim() : value;

  const normalized = {
    nombre: clean(payload?.nombre),
    apellidos: clean(payload?.apellidos),
    email: clean(payload?.email)?.toLowerCase(),
    telefono: clean(payload?.telefono),
    fecha_nacimiento: clean(payload?.fecha_nacimiento),
    nivel: clean(payload?.nivel),
    genero: clean(payload?.genero),
    comentarios: clean(payload?.comentarios || ""),
    acepta_condiciones: payload?.acepta_condiciones === true,
    origen: clean(payload?.origen || "app"),
  };

  const errors = {};

  if (!normalized.nombre || normalized.nombre.length < 2) {
    errors.nombre = "Nombre inválido";
  }

  if (!normalized.apellidos || normalized.apellidos.length < 2) {
    errors.apellidos = "Apellidos inválidos";
  }

  if (
    !normalized.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)
  ) {
    errors.email = "Email inválido";
  }

  if (
    !normalized.telefono ||
    normalized.telefono.replace(/\D/g, "").length < 9
  ) {
    errors.telefono = "Teléfono inválido";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.fecha_nacimiento || "")) {
    errors.fecha_nacimiento = "Fecha inválida";
  }

  if (!normalized.nivel) errors.nivel = "Nivel obligatorio";
  if (!normalized.genero) errors.genero = "Género obligatorio";

  if (!normalized.acepta_condiciones) {
    errors.acepta_condiciones = "Aceptación obligatoria";
  }

  if (Object.keys(errors).length > 0) {
    return jsonResponse(
      { ok: false, error: "Validation failed", fields: errors },
      400,
      headers
    );
  }

  const makeResponse = await fetch(env.MAKE_ALTA_JUGADOR_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalized),
  });

  const responseText = await makeResponse.text();

  if (!makeResponse.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "Make request failed",
        status: makeResponse.status,
      },
      502,
      headers
    );
  }

  return jsonResponse(
    {
      ok: true,
      message: "Jugador registrado correctamente",
      makeResponse: responseText || null,
    },
    200,
    headers
  );
}





// AUDITORIA 22 · SUPABASE AUTH HELPERS
// Helpers para conectar Supabase Auth cuando existan credenciales reales.
// Si faltan SUPABASE_URL o SUPABASE_ANON_KEY, el Worker mantiene modo backend_stub.

function cp04SupabaseConfigured(env) {
  return Boolean(env && env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

function cp04SupabaseBaseUrl(env) {
  return String(env.SUPABASE_URL || "").replace(/\/+$/, "");
}

function cp04SupabaseHeaders(env, extra = {}) {
  return {
    apikey: String(env.SUPABASE_ANON_KEY || ""),
    Authorization: `Bearer ${String(env.SUPABASE_ANON_KEY || "")}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function cp04SupabaseRequest(env, path, options = {}) {
  const base = cp04SupabaseBaseUrl(env);
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: cp04SupabaseHeaders(env, options.headers || {})
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

function cp04MapSupabaseUserToCp04(user, fallbackRole = "PLAYER") {
  const meta = user?.user_metadata || {};
  const appMeta = user?.app_metadata || {};
  // user_metadata es editable por el propio usuario (updateUser / signup data),
  // por lo que NUNCA debe usarse como fuente de rol: sería una escalada de
  // privilegios trivial. Solo app_metadata (escribible únicamente con
  // service_role) es una fuente de rol de confianza.
  const role = cp04NormalizeAuthRole(
    appMeta.role ||
    fallbackRole
  );

  return cp04SafeAuthUser({
    id: user?.id || "supabase-user",
    name: meta.nombre || meta.name || user?.email || "Usuario",
    email: user?.email || "",
    role
  });
}

function cp04SupabaseErrorResponse(request, env, result, fallbackMessage = "Error de autenticación.") {
  return jsonResponse(
    {
      ok: false,
      auth_ready: true,
      provider: "supabase",
      error: result?.data?.error || result?.data?.error_description || "SUPABASE_AUTH_ERROR",
      message: result?.data?.msg || result?.data?.message || fallbackMessage,
      status: result?.status || 500
    },
    result?.status || 500,
    corsHeaders(request, env)
  );
}

// AUDITORIA 21 · AUTH BACKEND STUBS
// Preparación segura de endpoints de autenticación real.
// En producción, estos endpoints deben conectarse a proveedor real de auth,
// base de usuarios y sesiones/tokens seguros.
//
// CP04_AUTH_ROLES y CP04_AUTH_PERMISSIONS viven en ../auth/authorization.js
// (fuente única de la matriz RBAC, compartida con la capa de autorización).

function cp04NormalizeAuthRole(role) {
  const value = String(role || "").trim().toUpperCase();
  return CP04_AUTH_ROLES.includes(value) ? value : "PLAYER";
}

function cp04SafeAuthUser(user = {}) {
  const role = cp04NormalizeAuthRole(user.role);
  return {
    id: String(user.id || "demo-user"),
    name: String(user.name || "Usuario demo"),
    email: String(user.email || "demo@clubpadel04.local"),
    role,
    permissions: CP04_AUTH_PERMISSIONS[role] || CP04_AUTH_PERMISSIONS.PLAYER
  };
}

async function cp04ReadJsonSafe(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function cp04AuthNotConfiguredResponse(request, env, extra = {}) {
  return jsonResponse(
    {
      ok: false,
      auth_ready: false,
      mode: "backend_stub",
      error: "AUTH_BACKEND_NOT_CONFIGURED",
      message: "Autenticación backend preparada, pendiente de proveedor real y secrets de producción.",
      required: [
        "AUTH_PROVIDER",
        "SESSION_SECRET",
        "JWT_VERIFICATION_KEY",
        "EMAIL_PROVIDER_TOKEN"
      ],
      ...extra
    },
    501,
    corsHeaders(request, env)
  );
}

async function handleAuthRoute(request, env, url) {
  const headers = corsHeaders(request, env);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const supabaseReady = cp04SupabaseConfigured(env);

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (path === "/api/auth/me" && method === "GET") {
    if (!supabaseReady) {
      return jsonResponse(
        {
          ok: true,
          auth_ready: false,
          mode: "backend_stub",
          user: cp04SafeAuthUser({ role: "PLAYER" }),
          message: "Endpoint /api/auth/me preparado. Pendiente validar token real."
        },
        200,
        headers
      );
    }

    // Lote A7: /api/auth/me (GET, "SESSION"/"VALIDATION" del ciclo) ahora
    // acepta el token también desde la cookie HttpOnly cp04_at, no solo del
    // header Authorization — mismo resolver que ya usa authenticateRequest()
    // en authorization.js. GET nunca dispara el gate CSRF (método seguro).
    const { token } = resolveSessionToken(request, env, { parseAuthorizationHeader });

    if (!token) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "MISSING_BEARER_TOKEN",
          message: "Falta token de sesión (Authorization Bearer o cookie cp04_at)."
        },
        401,
        headers
      );
    }

    const response = await fetch(`${cp04SupabaseBaseUrl(env)}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: String(env.SUPABASE_ANON_KEY || ""),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return cp04SupabaseErrorResponse(
        request,
        env,
        { ok: false, status: response.status, data },
        "No se pudo validar la sesión."
      );
    }

    const user = cp04MapSupabaseUserToCp04(data, "PLAYER");

    return jsonResponse(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        user,
        role: user.role,
        permissions: user.permissions
      },
      200,
      headers
    );
  }

  if (path === "/api/auth/logout" && method === "POST") {
    // Lote A7: logout SIEMPRE expira cp04_at/cp04_rt en la respuesta, pase lo
    // que pase después (sin Supabase configurado, sin token, CSRF rechazado,
    // o si la revocación upstream falla). Es la única ruta donde "fail-safe"
    // significa limpiar el navegador incondicionalmente — ver Fase 4 del
    // encargo ("logout real", "no mantener fallback silencioso").
    const expiredCookies = [buildExpiredAccessCookie(), buildExpiredRefreshCookie()];

    if (!supabaseReady) {
      return jsonResponseWithCookies(
        {
          ok: true,
          auth_ready: false,
          mode: "backend_stub",
          message: "Logout preparado. Pendiente invalidar sesión real cuando exista backend auth."
        },
        200,
        headers,
        expiredCookies
      );
    }

    // Dual-source: Authorization Bearer (compatibilidad) o cookie cp04_at.
    // Impacto de un logout forzado por CSRF: bajo (fuerza cierre de sesión
    // ajena, no expone ni modifica datos) — se aplica el mismo gate que en
    // refresh por consistencia, documentado como tal, no como mitigación de
    // un riesgo de exposición de datos.
    const resolved = resolveSessionToken(request, env, { parseAuthorizationHeader });

    if (resolved.csrfRejected) {
      return jsonResponseWithCookies(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "CSRF_ORIGIN_MISMATCH",
          message: "Origen no permitido para cerrar sesión mediante cookie."
        },
        403,
        headers,
        expiredCookies
      );
    }

    const token = resolved.token;

    if (!token) {
      return jsonResponseWithCookies(
        {
          ok: true,
          auth_ready: true,
          provider: "supabase",
          message: "Sesión local cerrada. No había token que invalidar."
        },
        200,
        headers,
        expiredCookies
      );
    }

    // scope="global" cierra TODAS las sesiones del usuario (todos los
    // dispositivos), no solo la actual. Lo pide explícitamente el body;
    // nunca se infiere de nada que envíe el cliente como "identidad".
    const logoutBody = await cp04ReadJsonSafe(request);
    const scope = logoutBody?.scope === "global" ? "global" : "local";

    const response = await fetch(
      `${cp04SupabaseBaseUrl(env)}/auth/v1/logout?scope=${scope}`,
      {
        method: "POST",
        headers: {
          apikey: String(env.SUPABASE_ANON_KEY || ""),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return jsonResponseWithCookies(
      {
        ok: response.ok,
        auth_ready: true,
        provider: "supabase",
        scope,
        message: response.ok
          ? (scope === "global" ? "Todas las sesiones cerradas." : "Logout realizado.")
          : "Logout solicitado, revisar proveedor."
      },
      response.ok ? 200 : response.status,
      headers,
      expiredCookies
    );
  }

  if (path === "/api/auth/refresh" && method === "POST") {
    const body = await cp04ReadJsonSafe(request);

    if (!supabaseReady) {
      return cp04AuthNotConfiguredResponse(request, env, {
        endpoint: "/api/auth/refresh",
        received: {
          refresh_token: Boolean(body.refresh_token)
        }
      });
    }

    // Lote A7: dual-source — body.refresh_token (compatibilidad legacy con
    // el frontend actual, que sigue leyendo/escribiendo localStorage) o
    // cookie HttpOnly cp04_rt (ciclo de sesión seguro). refresh es siempre
    // POST -> el gate CSRF se evalúa siempre que la fuente sea la cookie.
    const resolvedRefresh = resolveRefreshToken(request, env, String(body.refresh_token || "") || null);

    if (resolvedRefresh.csrfRejected) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "CSRF_ORIGIN_MISMATCH",
          message: "Origen no permitido para renovar sesión mediante cookie."
        },
        403,
        headers
      );
    }

    const refreshToken = resolvedRefresh.token;

    if (!refreshToken) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "VALIDATION_ERROR",
          message: "Falta refresh_token."
        },
        400,
        headers
      );
    }

    const result = await cp04SupabaseRequest(
      env,
      "/auth/v1/token?grant_type=refresh_token",
      {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken })
      }
    );

    if (!result.ok) {
      return cp04SupabaseErrorResponse(request, env, result, "No se pudo renovar la sesión.");
    }

    // Rotación: cada refresh exitoso reemite AMBAS cookies con los valores
    // nuevos que devuelve Supabase (access_token nuevo + refresh_token
    // rotado), igual que ya hace authService.js en el body/localStorage.
    const newAccessToken = result.data?.access_token || null;
    const newRefreshToken = result.data?.refresh_token || null;
    const expiresIn = result.data?.expires_in;

    return jsonResponseWithCookies(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: expiresIn || null,
        token_type: result.data?.token_type || "bearer",
        session: "active"
      },
      200,
      headers,
      [
        newAccessToken ? buildAccessCookie(newAccessToken, { maxAgeSeconds: expiresIn }) : null,
        newRefreshToken ? buildRefreshCookie(newRefreshToken) : null,
      ]
    );
  }

  if (path === "/api/auth/login" && method === "POST") {
    const body = await cp04ReadJsonSafe(request);

    if (!supabaseReady) {
      return cp04AuthNotConfiguredResponse(request, env, {
        endpoint: "/api/auth/login",
        received: {
          email: Boolean(body.email),
          password: Boolean(body.password)
        }
      });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "VALIDATION_ERROR",
          message: "Email y contraseña son obligatorios."
        },
        400,
        headers
      );
    }

    const result = await cp04SupabaseRequest(env, "/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    if (!result.ok) {
      return cp04SupabaseErrorResponse(request, env, result, "Login no válido.");
    }

    const user = cp04MapSupabaseUserToCp04(result.data?.user, "PLAYER");

    // Lote A7: login fija cp04_at/cp04_rt como cookies HttpOnly ADEMÁS de
    // devolver los tokens en el body JSON. El body se mantiene por
    // compatibilidad legacy explícita con el frontend actual (authService.js
    // sigue leyéndolo y namespacing bajo tenant:*: en localStorage) — ver
    // TENANT_STORAGE_HARNESS_REPORT/informe de esta misión para el plazo de
    // retirada. No se ha tocado authService.js ni App.jsx en esta misión.
    const loginAccessToken = result.data?.access_token || null;
    const loginRefreshToken = result.data?.refresh_token || null;
    const loginExpiresIn = result.data?.expires_in;

    return jsonResponseWithCookies(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        user: cp04SafeAuthUser(user),
        role: user.role,
        permissions: user.permissions,
        access_token: loginAccessToken,
        refresh_token: loginRefreshToken,
        expires_in: loginExpiresIn || null,
        token_type: result.data?.token_type || "bearer",
        session: "active"
      },
      200,
      headers,
      [
        loginAccessToken ? buildAccessCookie(loginAccessToken, { maxAgeSeconds: loginExpiresIn }) : null,
        loginRefreshToken ? buildRefreshCookie(loginRefreshToken) : null,
      ]
    );
  }

  if (path === "/api/auth/register" && method === "POST") {
    const body = await cp04ReadJsonSafe(request);

    if (!supabaseReady) {
      return cp04AuthNotConfiguredResponse(request, env, {
        endpoint: "/api/auth/register",
        received: {
          nombre: Boolean(body.nombre || body.name),
          email: Boolean(body.email),
          telefono: Boolean(body.telefono || body.phone),
          password: Boolean(body.password)
        }
      });
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const nombre = String(body.nombre || body.name || "").trim();
    const telefono = String(body.telefono || body.phone || "").trim();

    if (!email || !password) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "VALIDATION_ERROR",
          message: "Email y contraseña son obligatorios."
        },
        400,
        headers
      );
    }

    const result = await cp04SupabaseRequest(env, "/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        data: {
          nombre,
          telefono,
          role: "PLAYER"
        }
      })
    });

    if (!result.ok) {
      return cp04SupabaseErrorResponse(request, env, result, "No se pudo registrar el usuario.");
    }

    const user = cp04MapSupabaseUserToCp04(result.data?.user, "PLAYER");

    return jsonResponse(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        user,
        role: user.role,
        permissions: user.permissions,
        message: "Registro creado. Puede requerir confirmación por email según configuración de Supabase."
      },
      200,
      headers
    );
  }

  if (path === "/api/auth/forgot-password" && method === "POST") {
    const body = await cp04ReadJsonSafe(request);

    if (!supabaseReady) {
      return jsonResponse(
        {
          ok: true,
          auth_ready: false,
          mode: "backend_stub",
          message: "Si el correo existe, se enviarán instrucciones de recuperación cuando el proveedor de email esté configurado."
        },
        200,
        headers
      );
    }

    const email = String(body.email || "").trim().toLowerCase();

    if (email) {
      await cp04SupabaseRequest(env, "/auth/v1/recover", {
        method: "POST",
        body: JSON.stringify({
          email,
          redirect_to: String(env.APP_PUBLIC_URL || "").replace(/\/+$/, "") + "/"
        })
      });
    }

    return jsonResponse(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        message: "Si el correo existe, se enviarán instrucciones de recuperación."
      },
      200,
      headers
    );
  }

  if (path === "/api/auth/change-password" && method === "POST") {
    const body = await cp04ReadJsonSafe(request);

    if (!supabaseReady) {
      return cp04AuthNotConfiguredResponse(request, env, {
        endpoint: "/api/auth/change-password"
      });
    }

    // Lote A7: dual-source, igual que /api/auth/me — Authorization Bearer o
    // cookie cp04_at. POST mutante -> CSRF gate activo si la fuente es la cookie.
    const resolvedChangePassword = resolveSessionToken(request, env, { parseAuthorizationHeader });

    if (resolvedChangePassword.csrfRejected) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "CSRF_ORIGIN_MISMATCH",
          message: "Origen no permitido para cambiar la contraseña mediante cookie."
        },
        403,
        headers
      );
    }

    const token = resolvedChangePassword.token;
    const password = String(body.newPassword || body.password || "");

    if (!token || !password) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "VALIDATION_ERROR",
          message: "No se pudo verificar tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo."
        },
        400,
        headers
      );
    }

    const response = await fetch(`${cp04SupabaseBaseUrl(env)}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: String(env.SUPABASE_ANON_KEY || ""),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password })
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      return cp04SupabaseErrorResponse(
        request,
        env,
        { ok: false, status: response.status, data },
        "No se pudo cambiar la contraseña."
      );
    }

    return jsonResponse(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        message: "Contraseña actualizada."
      },
      200,
      headers
    );
  }

  return jsonResponse(
    {
      ok: false,
      error: "Auth route not found",
      path
    },
    404,
    headers
  );
}

// GET /api/support/make/scenarios — Centro Técnico, SUPPORT-only.
//
// Fail-closed en cada capa: sin token -> 401, token inválido -> 401, rol
// distinto de SUPPORT -> 403, límite de peticiones superado -> 429, Make no
// configurado/no disponible/respuesta inválida -> 503. Nunca se devuelve un
// dato inventado: si no hay una fuente en vivo verificada, se responde con
// un error explícito para que el frontend recurra a su propio snapshot
// local, nunca al revés.
async function handleSupportMakeScenarios(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "GET") {
    return jsonResponse({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405, headers);
  }

  const gate = await requireRoles(request, env, ["SUPPORT"]);
  if (!gate.ok) {
    return jsonResponse(gate.body, gate.status, headers);
  }

  if (!checkMakeRateLimit()) {
    return jsonResponse(
      { ok: false, error: "RATE_LIMITED", message: "Demasiadas peticiones al inventario de Make. Espera un momento." },
      429,
      headers
    );
  }

  const result = await fetchLiveMakeInventory(env);

  if (!result.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "MAKE_UNAVAILABLE",
        reason: result.reason,
        message: "El inventario en vivo de Make no está disponible ahora mismo. Usa el snapshot conocido.",
      },
      503,
      headers
    );
  }

  return jsonResponse(
    {
      ok: true,
      source: "live",
      servedFromCache: Boolean(result.servedFromCache),
      capturedAt: new Date().toISOString(),
      scenarios: result.scenarios,
    },
    200,
    headers
  );
}

// GET /api/support/health/ready — Centro Técnico, SUPPORT-only, mismo patrón
// fail-closed que handleSupportMakeScenarios (401 sin token/inválido, 403
// rol≠SUPPORT). Dependencias clasificadas solo por presencia de
// configuración (env vars) — cero llamadas de red reales en esta fase (ver
// audit/observability/19_WORKER_INTEGRATION_PLAN_NOT_INTEGRATED.md §3): el
// ping en vivo real a Supabase/Airtable/Make queda para una fase posterior.
async function handleSupportHealthReady(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "GET") {
    return jsonResponse({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405, headers);
  }

  const gate = await requireRoles(request, env, ["SUPPORT"]);
  if (!gate.ok) {
    return jsonResponse(gate.body, gate.status, headers);
  }

  const airtableConfigured = Boolean(
    (env.AIRTABLE_TOKEN || env.AIRTABLE_API_KEY) &&
    env.AIRTABLE_BASE_ID &&
    (env.AIRTABLE_RESERVAS_TABLE || env.AIRTABLE_TABLE_ID)
  );

  const dependencies = [
    dependencyStatusFromConfig({ name: "supabase-auth", configured: cp04SupabaseConfigured(env) }),
    dependencyStatusFromConfig({ name: "airtable", configured: airtableConfigured }),
    dependencyStatusFromConfig({ name: "make", configured: Boolean(env.MAKE_RESERVAS_WEBHOOK) }),
  ];

  const checks = [{ name: "process_alive", passed: true, message: null }];

  const health = buildHealthReadyResponse({ service: "worker", checks, dependencies });

  return jsonResponse(health, 200, headers);
}

// BLOQUEADOR DOCUMENTADO (WORKER_ROUTE_INTEGRATION_PLAN.md, Zona 5): no existe
// todavía un loader de tenant-registry/client-config del lado Worker (los
// equivalentes de src/config/ leen de node:fs, que no existe en el runtime de
// Cloudflare Workers). Devolver null aquí es explícito y seguro, no un
// descuido: checkTenantSafety() (stripe-tenant-safety.js, vía el harness)
// clasifica cualquier evento con expectedTenantId=null como MISSING_TENANT
// (fail-closed) — ningún evento puede alcanzar TENANT_OK ni disparar un
// side-effect de negocio hasta que este resolver tenga una implementación
// real. Sustituir cuando exista ese loader, no antes.
async function resolveTenantIdForRequest(request, env) {
  void request;
  void env;
  return null;
}

async function loadTenantRegistryEntry(tenantId, env) {
  void tenantId;
  void env;
  return null;
}

async function loadClientConfigForTenant(tenantId, env) {
  void tenantId;
  void env;
  return null;
}

// POST /api/payments/stripe/webhook — orquesta el pipeline ya construido y
// probado en worker-reservas/payments/ (WORKER_ROUTE_INTEGRATION_PLAN.md,
// Zona 4): este handler es composición, no reimplementación. `env` llega tal
// cual del Worker real — getStripeEventLockStore(env) es lo único que decide
// KV vs memoria (ver stripe-lock-store-factory.js), nunca este handler.
async function handleStripeWebhook(request, env, correlation) {
  assertRawBodyNotConsumed(request);

  const contentTypeCheck = validateContentType(request.headers);
  if (!contentTypeCheck.valid) {
    return jsonResponse({ received: false, error: contentTypeCheck.reason }, 400, corsHeaders(request, env));
  }

  const signatureHeader = extractSignatureHeader(request.headers);
  const rawBody = await request.text();

  // expectedTenantId: derivar del dominio que recibió el webhook, NUNCA del
  // payload (ver TENANT_RESOLUTION_CONTRACT_NOTE, stripe-route-contract.js).
  const expectedTenantId = await resolveTenantIdForRequest(request, env);
  const tenantRegistryEntry = await loadTenantRegistryEntry(expectedTenantId, env);
  const clientConfig = await loadClientConfigForTenant(expectedTenantId, env);

  const { timedOut, value, ...timeoutResult } = await withTimeoutBudget(() =>
    runStripeWebhookIntegrationHarness({
      rawBody,
      signatureHeader,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      expectedTenantId,
      tenantRegistryEntry,
      clientConfig,
      eventLockStore: getStripeEventLockStore(env),
      businessIdempotencyStore: stripeBusinessIdempotencyStore,
      sideEffects: createInMemorySideEffects(), // sustituir por implementación real antes de producción
    })
  );

  const result = timedOut ? timeoutResult : value;
  const response = mapClassificationToHttpResponse(result.classification, correlation);

  logStructuredEvent(
    buildRequestLogEvent({
      requestId: correlation.requestId,
      correlationId: correlation.correlationId,
      eventType: "stripe_webhook",
      message: sanitizeForRouteLogging(result),
      status: response.status < 400 ? "success" : "failure",
    })
  );

  return jsonResponse(response.body, response.status, { ...corsHeaders(request, env), ...response.headers });
}

// Enrutado real del Worker — cuerpo idéntico al que existía antes de la
// integración de Observabilidad (ver audit/observability/20_EXACT_INTEGRATION_DIFF_PLAN.md
// §6, "envolver, nunca reescribir"), extraído a función nombrada para que
// export.fetch() pueda envolverlo con resolución de request_id/correlation_id
// y logging estructurado sin tocar ninguna línea de la lógica de rutas.
async function routeRequest(request, env, url, correlation) {
  // GET /health/live — liveness puro, sin auth, sin dependencias externas
  // (probe de infraestructura, ver Fase 5 de la misión de integración).
  if (url.pathname === "/health/live") {
    return jsonResponse(buildHealthLiveResponse(), 200, corsHeaders(request, env));
  }

  if (url.pathname === "/api/support/health/ready") {
    return await handleSupportHealthReady(request, env);
  }

  if (
    url.pathname === "/api/jugadores/alta" ||
    url.pathname === "/jugadores/alta"
  ) {
        // Alta de jugador es operación de STAFF/ADMIN/SUPPORT en la matriz
        // RBAC. Gate listo, detrás del mismo flag que cancelar/reprogramar
        // y por el mismo motivo (ver comentario en handleReservas).
        if (
          request.method !== "OPTIONS" &&
          env.CP04_ENFORCE_ROLE_GATES === "true"
        ) {
          const gate = await requireRoles(request, env, ["STAFF", "ADMIN", "SUPPORT"]);

          if (!gate.ok) {
            return jsonResponse(gate.body, gate.status, corsHeaders(request, env));
          }
        }

        return await handleAltaJugador(request, env);
      }

      if (url.pathname.startsWith("/api/auth/")) {
      return handleAuthRoute(request, env, url);
    }

    if (url.pathname === "/api/support/make/scenarios") {
      return await handleSupportMakeScenarios(request, env);
    }

    if (url.pathname === "/api/disponibilidad" || url.pathname === "/disponibilidad") {
        return await handleDisponibilidad(request, env);
      }

      // CP04_LISTADO_RESERVAS_MAIN_DISPATCH_V4
      if (
        url.pathname === "/api/reservas" ||
        url.pathname === "/reservas"
      ) {
        if (request.method === "GET") {
          // El listado por email expone PII (nombre, teléfono, clave_reserva
          // que permite cancelar). No es una ruta pública: requiere sesión
          // real y, si el rol no es STAFF/ADMIN/SUPPORT, solo puede
          // consultar el propio email autenticado.
          const gate = await requireAuth(request, env);

          if (!gate.ok) {
            return jsonResponse(gate.body, gate.status, corsHeaders(request, env));
          }

          const requestedEmail = (
            new URL(request.url).searchParams.get("email") || ""
          ).trim().toLowerCase();

          const isStaffTier = authorizeRole(
            gate.auth.role,
            ["STAFF", "ADMIN", "SUPPORT"]
          );

          if (!isStaffTier && requestedEmail !== gate.auth.email) {
            return jsonResponse(
              {
                ok: false,
                error: "FORBIDDEN",
                message: "Solo puedes consultar tus propias reservas.",
              },
              403,
              corsHeaders(request, env)
            );
          }

          return await cp04ListReservations(
            request,
            env
          );
        }

        return await handleReservas(
          request,
          env,
          correlation
        );
      }

      if (url.pathname === STRIPE_WEBHOOK_ROUTE.path) {
        if (request.method === "OPTIONS") {
          return new Response(null, { status: 204, headers: corsHeaders(request, env) });
        }
        if (request.method !== STRIPE_WEBHOOK_ROUTE.method) {
          return jsonResponse(
            { received: false, error: "method_not_allowed" },
            405,
            { ...corsHeaders(request, env), Allow: STRIPE_WEBHOOK_ROUTE.method }
          );
        }
        return await handleStripeWebhook(request, env, correlation);
      }

      return jsonResponse(
        { ok: false, error: "Not found" },
        404,
        corsHeaders(request, env)
      );
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const requestId = resolveRequestId(request.headers);
    const isReservationWrite =
      request.method === "POST" &&
      (url.pathname === "/api/reservas" || url.pathname === "/reservas");
    const correlationId = isReservationWrite
      ? resolveOrStartCorrelationId(request.headers)
      : resolveCorrelationId(request.headers);
    const startMs = Date.now();
    let response;

    try {
      response = await routeRequest(request, env, url, { requestId, correlationId });
    } catch (error) {
      response = jsonResponse(
        {
          ok: false,
          error: "Internal server error",
          message: error?.message || "Unknown error"
        },
        500,
        corsHeaders(request, env)
      );
    }

    logStructuredEvent(
      buildRequestLogEvent({
        requestId,
        correlationId,
        eventType: "http_request",
        message: `${request.method} ${url.pathname}`,
        status: response.status < 400 ? "success" : "failure",
        errorCode: response.status >= 400 ? "UNKNOWN.UNCLASSIFIED" : null,
        durationMs: Date.now() - startMs,
        metadata: { http_status: response.status, path: url.pathname },
      })
    );

    return attachCorrelationHeaders(response, { requestId, correlationId });
  }
};
