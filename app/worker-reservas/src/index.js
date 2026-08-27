import {
  CP04_AUTH_ROLES,
  CP04_AUTH_PERMISSIONS,
  parseAuthorizationHeader,
  authorizeRole,
  requireAuth,
  requireRoles,
} from "../auth/authorization.js";
import {
  fetchLiveMakeInventory,
  checkMakeRateLimit,
} from "../support/makeLiveInventory.js";
import {
  OMNI_ACTIONS,
  normalizeOmniInput,
  extractDate,
} from "./omni-normalizer.js";

const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
const CLUB_CLOSING_MINUTES = 23 * 60;
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

// Subdominio de preview de Cloudflare Pages para ESTE proyecto
// (https://<alias-o-hash>.club-padel-04.pages.dev). Cloudflare es quien
// emite el certificado y el hosting bajo ese dominio exacto — un atacante
// no puede obtener un origen que matchee este patrón sin controlar el
// propio proyecto Pages. Ancla ^...$ y exige un único label (sin puntos)
// para que ni un sufijo parecido (https://club-padel-04.pages.dev.evil.com)
// ni un prefijo parecido (https://evilclub-padel-04.pages.dev) puedan
// colarse, y exige https (Cloudflare Pages nunca sirve un preview real
// por http).
const CP04_PAGES_PREVIEW_ORIGIN = /^https:\/\/[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.club-padel-04\.pages\.dev$/i;

function cp04IsAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  return CP04_PAGES_PREVIEW_ORIGIN.test(origin);
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = (env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

  const isAllowedOrigin = cp04IsAllowedOrigin(origin, allowedOrigins);

  if (!isAllowedOrigin) {
    return {};
  }

  // Nunca "*": el origen se refleja exacto (nunca un comodín), y solo tras
  // pasar la validación explícita de arriba.
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

// --- PASO 06E: observabilidad y logging técnico coherente ---
//
// Un único formato para todo evento técnico relacionado con rate limiter,
// caché de disponibilidad, idempotencia, modo degradado de Airtable 429 y
// errores genéricos: mismo conjunto de campos, mismo canal (console.error,
// visible en `wrangler tail`/Cloudflare Logs), fácil de filtrar por
// `event` o `code` en soporte sin tener que recordar el formato distinto
// de cada punto del código. Nunca lleva nombre, apellidos, email o
// teléfono en claro — ver cp04HashIdempotencyKey.

// Cloudflare añade la cabecera `cf-ray` a toda petición que pasa por su
// borde: se reutiliza como identificador de correlación en vez de generar
// uno propio (evitaría añadir una dependencia solo para esto). Fuera del
// borde real (tests, `wrangler dev` local) esa cabecera no existe: se usa
// un valor fijo y legible, nunca null/undefined en el log.
export function cp04GetRequestId(request) {
  return request?.headers?.get?.("cf-ray") || "sin-cf-ray";
}

// Huella corta y no reversible de una clave de idempotencia, para poder
// correlacionar en los logs "esta solicitud" con "esta otra" sin escribir
// la clave completa — que para crear_reserva puede incluir email y
// teléfono normalizados (ver cp04BuildIdempotencyKey). No es un hash
// criptográfico: no protege ningún secreto, solo evita texto claro de
// datos personales en un log técnico. FNV-1a de 32 bits, síncrono y
// determinista — suficiente para agrupar eventos del mismo caso.
export function cp04HashIdempotencyKey(key) {
  if (!key) return null;
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// Constructor único del evento técnico. Solo acepta campos ya conocidos y
// no sensibles (nunca el objeto completo que pase un llamador) — `detail`
// es el único campo abierto, y se usa exclusivamente para contexto técnico
// ya filtrado por cada punto de llamada (status HTTP, razón interna,
// mensaje de excepción), nunca para PII. Devuelve el evento (útil para
// tests) además de loguearlo.
export function cp04LogTechnicalEvent(fields) {
  const event = {
    event: fields.event,
    action: fields.action ?? null,
    code: fields.code ?? null,
    requestId: fields.requestId ?? null,
    idempotencyKeyHash: fields.idempotencyKeyHash ?? null,
    retryable: fields.retryable ?? null,
    reserva_confirmada: fields.reserva_confirmada ?? null,
    origen: fields.origen ?? null,
    timestamp: fields.timestamp ?? new Date().toISOString(),
    ...(fields.detail !== undefined ? { detail: fields.detail } : {}),
  };
  console.error("CP04_EVENT", JSON.stringify(event));
  return event;
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

export function isSundayISO(value) {
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


export function validatePayload(payload) {
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

    if (formatoHoraValido.test(nuevaHoraInicio) && !BOOKING_HOURS.includes(nuevaHoraInicio)) {
      errors.nueva_hora_inicio = "Hora de inicio fuera de las franjas permitidas.";
    }

    if (formatoHoraValido.test(nuevaHoraFin) && !errors.nueva_hora_fin) {
      const [hFin, mFin] = nuevaHoraFin.split(":").map(Number);
      if (hFin * 60 + mFin > CLUB_CLOSING_MINUTES) {
        errors.nueva_hora_fin = "La reserva no puede terminar despues de las 23:00.";
      }
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
    !/^\d{4}-\d{2}-\d{2}$/.test(reserva.fecha) ||
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

  if (!errors.hora && !errors.duracion_minutos && BOOKING_HOURS.includes(reserva.hora)) {
    const [hh, mm] = reserva.hora.split(":").map(Number);
    if (hh * 60 + mm + duration > CLUB_CLOSING_MINUTES) {
      errors.duracion_minutos = "La reserva no puede terminar despues de las 23:00.";
    }
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
    clave_reserva: cleanText(payload.clave_reserva || ""),
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

async function forwardToMake(payload, env) {
  if (!env.MAKE_RESERVAS_WEBHOOK) {
    return { configured: false, ok: false, status: null };
  }

  const response = await fetch(env.MAKE_RESERVAS_WEBHOOK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // PASO 06C: se lee el cuerpo de forma segura (nunca lanza) solo para
  // poder detectar un bloqueo de cuota de Airtable si Make llegara a
  // reportarlo de forma síncrona en la respuesta del propio webhook.
  // Evidencia real (Paso 05D): Make normalmente responde 200 de inmediato
  // (el webhook queda aceptado) y el fallo de Airtable ocurre después, de
  // forma asíncrona dentro de la ejecución del escenario — el Worker no
  // puede verlo desde aquí. Esto es una defensa adicional para el caso en
  // que Make sí lo reporte síncronamente, no el caso esperado hoy.
  const bodyText = await response.text().catch(() => "");

  return { configured: true, ok: response.ok, status: response.status, bodyText };
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

// PASO 06C (2026-07-17): modo degradado para el bloqueo de cuota de
// Airtable (HTTP 429 / "PUBLIC_API_BILLING_LIMIT_EXCEEDED" / el
// "RateLimitError" que reporta Make — ver Paso 05D). Es DELIBERADAMENTE
// más estrecho que "cualquier fallo de Airtable": Airtable no configurado,
// un error genérico o una caída de red mantienen el comportamiento
// existente documentado en cada sitio donde se usa. Solo esta categoría
// específica de fallo — la única que sabemos, con evidencia real, que
// significa "la reserva probablemente no se completará al otro lado" — debe
// impedir avanzar y devolver el mensaje degradado en vez de una falsa
// confirmación.
export function cp04IsAirtableRateLimited(status, detailsText) {
  if (status === 429) return true;
  return /PUBLIC_API_BILLING_LIMIT_EXCEEDED|RateLimitError/i.test(String(detailsText ?? ""));
}

const CP04_AIRTABLE_RATE_LIMIT_USER_MESSAGE =
  "El sistema de reservas está temporalmente saturado. Inténtalo de nuevo más tarde o contacta con recepción.";

// Respuesta controlada y uniforme de "modo degradado". `message` es lo
// único que llega al cliente; el resto de `technicalDetail` NUNCA sale del
// Worker — solo se loguea server-side, vía cp04LogTechnicalEvent (PASO
// 06E), y solo los campos ya whitelisteados abajo (nunca el objeto que
// pase el llamador tal cual), para poder diagnosticar sin filtrar nada
// interno (ni un token, ni el cuerpo crudo de Airtable/Make) al usuario
// final.
export function cp04BuildAirtableDegradedResponse(technicalDetail = {}) {
  cp04LogTechnicalEvent({
    event: "airtable_rate_limit",
    action: technicalDetail.accion ?? null,
    code: "AIRTABLE_RATE_LIMIT",
    requestId: technicalDetail.requestId ?? null,
    retryable: true,
    reserva_confirmada: false,
    origen: technicalDetail.origen ?? null,
    detail: {
      status: technicalDetail.status ?? null,
      reason: technicalDetail.reason ?? null,
      fecha: technicalDetail.fecha ?? null,
    },
  });
  return {
    ok: false,
    code: "AIRTABLE_RATE_LIMIT",
    retryable: true,
    reserva_confirmada: false,
    message: CP04_AIRTABLE_RATE_LIMIT_USER_MESSAGE,
  };
}

// REPARACIÓN DEFINITIVA RATE LIMIT (2026-08-25): dos defensas nuevas sobre
// la misma lectura compartida, sin cambiar la forma del resultado que ya
// consumen handleDisponibilidad y la revalidación de handleReservas:
//
// 1) Single-flight por fecha: si ya hay una consulta a Airtable en curso
//    para esa fecha exacta, una segunda llamada concurrente (dos pestañas,
//    dos usuarios, o la propia revalidación de una reserva justo cuando
//    otro cliente está cargando el calendario) NUNCA dispara una segunda
//    petición HTTP — espera la misma promesa. La caché de 30s de arriba ya
//    evita repetir la consulta una vez resuelta; esto cubre la ventana
//    ANTERIOR a esa primera resolución, que es exactamente donde
//    N solicitudes simultáneas multiplicaban por N el consumo de cuota
//    (hallazgo confirmado: "hasta 3 lecturas Airtable sin caché por
//    reserva", ver runbook Paso 07Q).
// 2) Reintento único (nunca en bucle, nunca para escritura) ante un 429
//    real de Airtable, esperando el tiempo indicado por su cabecera
//    `Retry-After` cuando la trae (acotada a un máximo razonable para no
//    dejar la petición del cliente colgada) o un backoff fijo corto si no
//    la trae. Un segundo 429 tras ese único reintento se trata igual que
//    cualquier otro fallo — nunca hay un tercer intento.
const cp04AvailabilityInFlight = new Map(); // fecha -> Promise<resultado>

export const CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS = 400;
export const CP04_AIRTABLE_RETRY_MAX_BACKOFF_MS = 3000;

function cp04DefaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Airtable solo documenta Retry-After en segundos (nunca fecha HTTP) para
// sus 429; cualquier valor ausente, no numérico o <= 0 cae al backoff por
// defecto. Siempre acotado a CP04_AIRTABLE_RETRY_MAX_BACKOFF_MS: un valor
// grande real no debe dejar la petición del cliente colgada — recibe la
// respuesta degradada a tiempo y puede reintentar él mismo (botón
// "Actualizar" del frontend), en vez de esperar en bloque lo que Airtable pida.
export function cp04ResolveRetryBackoffMs(retryAfterHeader) {
  const parsed = Number(retryAfterHeader);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return CP04_AIRTABLE_RETRY_DEFAULT_BACKOFF_MS;
  }
  return Math.min(parsed * 1000, CP04_AIRTABLE_RETRY_MAX_BACKOFF_MS);
}

async function cp04FetchOcupadasAttempt(env, fecha) {
  const formula = `AND(
    FIND("${cp04FormulaText(fecha)}|", {clave_slot}) = 1,
    OR(
      {estado_reserva} = "pendiente",
      {estado_reserva} = "confirmada",
      {estado_reserva} = "reprogramada"
    )
  )`;

  const airtableUrl =
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_TABLE_ID}` +
    `?filterByFormula=${encodeURIComponent(formula)}` +
    `&fields%5B%5D=clave_slot` +
    `&fields%5B%5D=estado_reserva` +
    `&fields%5B%5D=fecha_reserva` +
    `&fields%5B%5D=hora_inicio` +
    `&fields%5B%5D=hora_fin` +
    `&fields%5B%5D=Pista`;

  let airtableRes;
  try {
    airtableRes = await fetch(airtableUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      }
    });
  } catch {
    return { networkError: true };
  }

  const data = await airtableRes.json().catch(() => null);
  return {
    networkError: false,
    ok: airtableRes.ok,
    status: airtableRes.status,
    data,
    retryAfterHeader: airtableRes.headers.get("Retry-After"),
  };
}

// Consulta compartida de slots ocupados en Airtable para una fecha, con el
// mismo filtro (fecha + estado activo) que ya usaba handleDisponibilidad.
// Extraída para poder reutilizarla también en la revalidación de
// handleReservas, sin duplicar la query. `ok:false` cubre tanto "Airtable
// no configurado" como errores de red/HTTP: en ningún caso lanza, siempre
// devuelve un resultado que el llamador decide cómo tratar.
//
// `deps.sleep` solo existe para que los tests puedan sustituir la espera
// real del reintento por una resolución inmediata — en producción siempre
// usa el temporizador real (cp04DefaultSleep).
export async function cp04FetchOcupadas(env, fecha, deps = {}) {
  const cached = cp04GetCachedAvailability(fecha);
  if (cached) return cached;

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
    return { ok: false, reason: "not_configured" };
  }

  const existingInFlight = cp04AvailabilityInFlight.get(fecha);
  if (existingInFlight) return existingInFlight;

  const sleep = deps.sleep || cp04DefaultSleep;

  const promise = (async () => {
    let attempt = await cp04FetchOcupadasAttempt(env, fecha);

    if (attempt.networkError) {
      return { ok: false, reason: "network_error" };
    }

    if (!attempt.ok && attempt.status === 429) {
      await sleep(cp04ResolveRetryBackoffMs(attempt.retryAfterHeader));
      attempt = await cp04FetchOcupadasAttempt(env, fecha);
      if (attempt.networkError) {
        return { ok: false, reason: "network_error" };
      }
    }

    if (!attempt.ok) {
      return { ok: false, reason: "airtable_error", status: attempt.status, details: attempt.data };
    }

    const records = attempt.data?.records || [];
    const ocupadas = records.map((record) => record.fields?.clave_slot).filter(Boolean);

    const result = { ok: true, records, ocupadas };
    cp04SetCachedAvailability(fecha, result);
    return result;
  })();

  cp04AvailabilityInFlight.set(fecha, promise);
  try {
    return await promise;
  } finally {
    cp04AvailabilityInFlight.delete(fecha);
  }
}

// Expuesto solo para tests (limpiar estado entre casos), mismo patrón que
// __resetAvailabilityCacheForTests.
export function __resetAvailabilityInFlightForTests() {
  cp04AvailabilityInFlight.clear();
}

// Comprobación pura (sin red): ¿el slot fecha|pista|hora ya aparece en la
// lista de ocupadas? Mismo formato de clave que ya usa el frontend
// (App.jsx: `${fecha}|${pista}|${hora}`) y que Airtable devuelve en
// clave_slot, para no introducir un segundo formato paralelo.
export function cp04IsSlotOccupied(ocupadas, fecha, pista, hora) {
  if (!Array.isArray(ocupadas) || !fecha || !pista || !hora) return false;
  const claveSlot = `${fecha}|${pista}|${hora}`;
  return ocupadas.includes(claveSlot);
}

// Clave de idempotencia derivada de los campos que identifican de forma
// única la operación solicitada. Pura y determinista: la misma solicitud
// exacta produce siempre la misma clave, distintas solicitudes (aunque
// lleguen del mismo jugador) producen claves distintas.
//
// PASO 06D (2026-07-17): para crear_reserva, si el propio cliente ya manda
// una clave_reserva (pruebas controladas, o un futuro cliente que la
// genere), se respeta tal cual — es la clave más fuerte posible, e
// idéntica a la que usará Make/Airtable para esa misma reserva. Si no
// llega, se deriva de forma estable a partir de los datos que identifican
// la operación (acción + email normalizado + fecha + hora + pista +
// teléfono), sin incluir nunca nada sensible en logs derivados de esta
// clave (no lleva nombre/apellidos, solo lo estrictamente necesario para
// distinguir una operación de otra).
export function cp04BuildIdempotencyKey(normalizedPayload) {
  const accion = normalizedPayload?.accion;

  if (accion === "crear_reserva") {
    const claveExplicita = cleanText(normalizedPayload?.clave_reserva);
    if (claveExplicita) return `crear|clave|${claveExplicita}`;

    const r = normalizedPayload.reserva || {};
    const email = cleanText(normalizedPayload.jugador?.email).toLowerCase();
    const telefono = cleanText(normalizedPayload.jugador?.telefono).replace(/\D/g, "");
    return `crear|${email}|${r.fecha}|${r.pista}|${r.hora}|${telefono}`;
  }

  if (accion === "reprogramar_reserva") {
    return `reprogramar|${normalizedPayload.clave_reserva}|${normalizedPayload.nueva_fecha_reserva}|${normalizedPayload.nueva_hora_inicio}|${normalizedPayload.nueva_pista}`;
  }

  if (accion === "cancelar_reserva") {
    return `cancelar|${normalizedPayload.clave_reserva}`;
  }

  return null;
}

// PASO 06D: idempotencia de reservas en memoria — mismo patrón que la
// caché de disponibilidad del Paso 06B (Map a nivel de módulo, TTL
// configurable, testable con `now` inyectado). Sustituye, en el flujo real
// de handleReservas más abajo, al mecanismo anterior basado en la Cache
// API (cp04CheckIdempotency, justo debajo — se mantiene definido y con sus
// propios tests, solo deja de llamarse desde handleReservas): aquel
// marcaba la solicitud como "hecha" ANTES de saber si realmente se
// reenvió, así que un fallo (Make rechaza, degradado 429, etc.) dejaba
// bloqueada 10s una repetición legítima del mismo usuario — justo lo que
// esta misión pide evitar.
//
// Regla de bloqueo: una clave solo queda marcada (bloqueando repeticiones
// durante el TTL) cuando la solicitud original terminó en éxito real de
// reenvío (`ok:true`). Cualquier otro desenlace (validación, slot ya
// ocupado, degradado 429, Make rechazado) no marca nada — así una
// repetición legítima tras un fallo nunca queda bloqueada. Limitación
// aceptada (mismo criterio que el rate limiter de más abajo): esto no
// cierra la ventana de carrera de dos solicitudes verdaderamente
// simultáneas, solo la de reintentos secuenciales — suficiente para el
// caso real (doble clic, reintento tras error de red del cliente).
export const CP04_IDEMPOTENCY_TTL_MS = 3 * 60 * 1000; // 3 min, dentro del rango 2-5 min pedido
let cp04IdempotencyStore = new Map(); // clave -> expiresAt (epoch ms)

export function cp04IsIdempotentDuplicate(key, now = Date.now()) {
  if (!key) return false;
  const expiresAt = cp04IdempotencyStore.get(key);
  if (expiresAt === undefined) return false;
  if (now >= expiresAt) {
    cp04IdempotencyStore.delete(key);
    return false;
  }
  return true;
}

export function cp04MarkIdempotentSuccess(key, now = Date.now()) {
  if (!key) return;
  cp04IdempotencyStore.set(key, now + CP04_IDEMPOTENCY_TTL_MS);
}

// Expuesto solo para tests (limpiar estado entre casos), mismo patrón que
// __resetAvailabilityCacheForTests.
export function __resetIdempotencyStoreForTests() {
  cp04IdempotencyStore = new Map();
}

const CP04_IDEMPOTENT_DUPLICATE_USER_MESSAGE =
  "Ya hemos recibido esta solicitud hace unos instantes. Si no ves la confirmación, contacta con recepción antes de volver a intentarlo.";

// Respuesta uniforme para una repetición detectada. `reserva_confirmada`
// es siempre false: el Worker nunca tiene evidencia real de que Make haya
// terminado de procesar la solicitud original (ver Paso 06C/05D — Make
// acepta el webhook de forma síncrona mucho antes de completar su propia
// ejecución), así que nunca se puede afirmar una confirmación aquí.
export function cp04BuildIdempotentDuplicateResponse() {
  return {
    ok: false,
    code: "IDEMPOTENT_DUPLICATE",
    duplicated: true,
    retryable: false,
    reserva_confirmada: false,
    message: CP04_IDEMPOTENT_DUPLICATE_USER_MESSAGE,
  };
}

// Idempotencia best-effort usando la Cache API nativa de Workers
// (`caches.default`): no requiere ningún binding nuevo ni cambio en
// wrangler.toml. No es una garantía global entre datacenters, pero cubre
// el caso real más común (doble clic, reintento inmediato del mismo
// cliente) durante una ventana corta.
export async function cp04CheckIdempotency(request, normalizedPayload) {
  const idemKey = cp04BuildIdempotencyKey(normalizedPayload);
  if (!idemKey) {
    return { duplicate: false, markDone: async () => {} };
  }

  const cache = caches.default;
  const cacheUrl = new URL(request.url);
  cacheUrl.pathname = `/__cp04_idempotency__/${encodeURIComponent(idemKey)}`;
  const cacheKey = new Request(cacheUrl.toString());

  const cached = await cache.match(cacheKey);
  if (cached) {
    return { duplicate: true, markDone: async () => {} };
  }

  return {
    duplicate: false,
    markDone: async () => {
      await cache.put(cacheKey, new Response("1", { headers: { "Cache-Control": "max-age=10" } }));
    },
  };
}

// --- Rate limiting básico defensivo para crear_reserva (in-memory, por
// isolate) ---
//
// Mismo patrón y misma limitación aceptada que checkMakeRateLimit en
// support/makeLiveInventory.js: protege contra un script que intente saturar
// el calendario con altas en ráfaga desde un mismo isolate, no contra un
// ataque distribuido (para eso haría falta un límite a nivel de borde/KV,
// fuera de alcance de esta fase). El límite es generoso a propósito para no
// romper pruebas manuales ni demos con varios roles seguidos.
const CP04_CREAR_RESERVA_RATE_LIMIT_MAX = 30;
const CP04_CREAR_RESERVA_RATE_LIMIT_WINDOW_MS = 60_000;
let cp04CrearReservaRateLimitHits = [];

export function cp04CheckCrearReservaRateLimit(now = Date.now()) {
  cp04CrearReservaRateLimitHits = cp04CrearReservaRateLimitHits.filter(
    (t) => now - t < CP04_CREAR_RESERVA_RATE_LIMIT_WINDOW_MS
  );
  if (cp04CrearReservaRateLimitHits.length >= CP04_CREAR_RESERVA_RATE_LIMIT_MAX) {
    return false;
  }
  cp04CrearReservaRateLimitHits.push(now);
  return true;
}

// Expuesto solo para tests (limpiar estado entre casos).
export function __resetCrearReservaRateLimitForTests() {
  cp04CrearReservaRateLimitHits = [];
}

// Rate limiter del endpoint omnicanal (20 msg/min, separado de reservas).
const CP04_CHAT_RATE_LIMIT_MAX = 20;
const CP04_CHAT_RATE_LIMIT_WINDOW_MS = 60_000;
let cp04ChatRateLimitHits = [];

export function cp04CheckChatRateLimit(now = Date.now()) {
  cp04ChatRateLimitHits = cp04ChatRateLimitHits.filter(
    (t) => now - t < CP04_CHAT_RATE_LIMIT_WINDOW_MS
  );
  if (cp04ChatRateLimitHits.length >= CP04_CHAT_RATE_LIMIT_MAX) return false;
  cp04ChatRateLimitHits.push(now);
  return true;
}

export function __resetChatRateLimitForTests() { cp04ChatRateLimitHits = []; }

// PASO 06B (2026-07-17): caché en memoria de disponibilidad por fecha, para
// reducir lecturas repetidas a Airtable mientras dura el bloqueo de cuota
// (PUBLIC_API_BILLING_LIMIT_EXCEEDED — ver
// src/data/makeInventory.js::MAKE_VERIFICATION_STEP6A_META). Sin cambiar la
// lógica funcional de reservas: cp04FetchOcupadas sigue devolviendo
// exactamente la misma forma de resultado, solo evita repetir la llamada de
// red si ya se consultó esa fecha hace poco. Mismo patrón que el rate
// limiter de arriba: estado en memoria del propio Worker, sin binding
// nuevo, sin tocar credenciales.
// PASO 06E: decisión deliberada de NO loguear cada hit/miss de esta caché
// (a diferencia de rate limiter/idempotencia/Airtable 429 más arriba).
// Motivo: un hit/miss ocurre en CADA consulta de disponibilidad — crear,
// reprogramar y `GET /api/disponibilidad` normal, no solo en un caso raro
// o de error — así que loguearlo generaría ruido de alto volumen sin
// ninguna acción de soporte asociada (a diferencia de un 429 degradado o
// un rechazo de Make, que sí son accionables). La corrección de la caché
// ya está cubierta por tests (nunca cachea errores, TTL exacto, invalida
// tras escritura); si en el futuro hiciera falta depurar un problema de
// caché en producción, el hueco es fácil de llenar reutilizando
// cp04LogTechnicalEvent con event:"availability_cache_hit"/"_miss".
export const CP04_AVAILABILITY_CACHE_TTL_MS = 30_000; // 30s — dentro del rango 30-60s pedido
let cp04AvailabilityCache = new Map(); // fecha -> { result, expiresAt }

export function cp04GetCachedAvailability(fecha, now = Date.now()) {
  const entry = cp04AvailabilityCache.get(fecha);
  if (!entry) return null;
  if (now >= entry.expiresAt) {
    cp04AvailabilityCache.delete(fecha);
    return null;
  }
  return entry.result;
}

// Solo un resultado `ok:true` (una respuesta real y completa de Airtable) se
// guarda en caché. Un error — incluido el 429 de cuota que motivó este
// cambio — NUNCA se cachea como si fuera disponibilidad válida: cachear un
// error congelaría ese error durante todo el TTL en vez de dejar que el
// siguiente intento vuelva a comprobar el estado real cuando la cuota se
// restablezca.
export function cp04SetCachedAvailability(fecha, result, now = Date.now()) {
  if (!result?.ok) return;
  cp04AvailabilityCache.set(fecha, { result, expiresAt: now + CP04_AVAILABILITY_CACHE_TTL_MS });
}

// Invalidación total (no solo de una fecha): se llama tras crear, cancelar
// o reprogramar una reserva (ver handleReservas). Reprogramar mueve una
// reserva de una fecha a otra, y la fecha original no viaja en el payload
// (solo `clave_reserva`) — vaciar todo el mapa es más simple y más seguro
// que arriesgarse a dejar una fecha desactualizada en caché.
export function cp04InvalidateAvailabilityCache() {
  cp04AvailabilityCache.clear();
}

// Expuesto solo para tests (limpiar estado entre casos), mismo patrón que
// __resetCrearReservaRateLimitForTests.
export function __resetAvailabilityCacheForTests() {
  cp04AvailabilityCache.clear();
}

async function handleReservas(request, env) {
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

  const accionSolicitada = cleanText(payload?.accion);

  if (accionSolicitada === "crear_reserva" && !cp04CheckCrearReservaRateLimit()) {
    // PASO 06E: mismo criterio de logging que idempotencia más abajo — ambos
    // son un rechazo temprano que impide llegar a Make, sin que haya
    // ocurrido ningún error de Airtable/Make todavía.
    cp04LogTechnicalEvent({
      event: "rate_limited",
      action: "crear_reserva",
      code: "RATE_LIMITED",
      requestId: cp04GetRequestId(request),
      retryable: true,
      reserva_confirmada: false,
      origen: "rate_limiter_crear_reserva",
    });
    return jsonResponse(
      {
        ok: false,
        error: "RATE_LIMITED",
        message: "Demasiadas solicitudes de alta de reserva en poco tiempo. Inténtalo de nuevo en un minuto.",
      },
      429,
      headers
    );
  }

  // Toda acción mutable de reservas exige un Bearer real verificado por
  // Supabase — nunca creación/cancelación/reprogramación anónima. Los 4
  // roles pueden crear (STAFF/ADMIN/SUPPORT en nombre de un jugador, p.ej.
  // recepción); cancelar/reprogramar están abiertos también a PLAYER, pero
  // solo sobre su propia reserva (comprobado más abajo contra Airtable, ver
  // cp04LookupReservaParaQr) — STAFF/ADMIN/SUPPORT quedan exceptuados de esa
  // comprobación de propiedad, igual que en el resto de endpoints de
  // gestión (matriz RBAC CP04_AUTH_PERMISSIONS).
  const esAccionMutable =
    accionSolicitada === "crear_reserva" ||
    accionSolicitada === "cancelar_reserva" ||
    accionSolicitada === "reprogramar_reserva";

  let auth = null;
  if (esAccionMutable && env.CP04_ENFORCE_ROLE_GATES === "true") {
    const gate = await requireRoles(request, env, CP04_AUTH_ROLES);

    if (!gate.ok) {
      return jsonResponse(gate.body, gate.status, headers);
    }
    auth = gate.auth;
  }

  const errors = validatePayload(payload);
  if (Object.keys(errors).length > 0) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: errors }, 422, headers);
  }

  const normalizedPayload = normalizePayload(payload);

  // No confiar en el email que manda el cliente: un PLAYER autenticado solo
  // puede crear la reserva a su propio nombre (vinculado al email verificado
  // por Supabase). STAFF/ADMIN/SUPPORT sí pueden crear en nombre de otro
  // jugador (recepción/soporte), igual que en el resto de endpoints.
  if (
    auth &&
    accionSolicitada === "crear_reserva" &&
    auth.role === "PLAYER" &&
    normalizedPayload.jugador.email !== auth.email
  ) {
    return jsonResponse(
      { ok: false, error: "FORBIDDEN", message: "Solo puedes crear una reserva con tu propio email." },
      403,
      headers
    );
  }

  // Cancelar/reprogramar: PLAYER solo sobre su propia reserva, comprobado
  // contra la reserva REAL de Airtable (nunca contra el jugador.email que
  // mande el body). Si no se puede verificar la reserva (Airtable no
  // configurado/caído), se falla cerrado: es una comprobación de seguridad,
  // no de UX, mismo criterio que la defensa en profundidad de
  // handleQrGenerate.
  if (
    auth &&
    auth.role === "PLAYER" &&
    (accionSolicitada === "cancelar_reserva" || accionSolicitada === "reprogramar_reserva")
  ) {
    const reservaReal = await cp04LookupReservaParaQr(env, normalizedPayload.clave_reserva);

    if (!reservaReal.ok) {
      return jsonResponse(
        { ok: false, error: "RESERVATION_CHECK_FAILED", message: "No se pudo verificar la reserva." },
        503,
        headers
      );
    }

    if (!reservaReal.found) {
      return jsonResponse(
        { ok: false, error: "RESERVATION_NOT_FOUND", message: "Reserva no encontrada." },
        404,
        headers
      );
    }

    if (reservaReal.email && reservaReal.email.toLowerCase() !== auth.email) {
      return jsonResponse(
        {
          ok: false,
          error: "FORBIDDEN",
          message:
            accionSolicitada === "cancelar_reserva"
              ? "Solo puedes cancelar tus propias reservas."
              : "Solo puedes reprogramar tus propias reservas.",
        },
        403,
        headers
      );
    }
  }

  // Idempotencia: si la misma solicitud exacta ya se procesó hace unos
  // segundos (doble clic, reintento de red del cliente), no se reenvía a
  // Make una segunda vez. Se marca como "en curso" ANTES de las llamadas
  // de red siguientes para cerrar la ventana de carrera entre dos
  // solicitudes casi simultáneas.
  // PASO 06D: ver la nota junto a cp04IsIdempotentDuplicate más arriba —
  // el marcado real de éxito ocurre al final de esta función, nunca aquí,
  // para no bloquear un reintento legítimo si esta solicitud termina en
  // error.
  const idempotencyKey = cp04BuildIdempotencyKey(normalizedPayload);
  if (cp04IsIdempotentDuplicate(idempotencyKey)) {
    // PASO 06E: mismo criterio de logging que el rate limiter de arriba —
    // idempotencyKeyHash nunca la clave completa (puede incluir email y
    // teléfono normalizados en crear_reserva, ver cp04BuildIdempotencyKey).
    cp04LogTechnicalEvent({
      event: "idempotent_duplicate",
      action: accionSolicitada,
      code: "IDEMPOTENT_DUPLICATE",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: false,
      reserva_confirmada: false,
      origen: "idempotencia",
    });
    return jsonResponse(cp04BuildIdempotentDuplicateResponse(), 409, headers);
  }

  // Revalidación de disponibilidad: vuelve a comprobar contra Airtable
  // justo antes de reenviar a Make, para reducir (que no eliminar del
  // todo) la ventana de condición de carrera frente a lo que el frontend
  // ya comprobó al cargar el formulario. Solo aplica a crear/reprogramar,
  // que son las únicas acciones que ocupan un slot concreto.
  //
  // Si Airtable no responde, no está configurado o está degradado (p. ej.
  // límite de facturación excedido), NO se bloquea la reserva: se deja
  // pasar igual que se comportaba el flujo antes de este cambio, para no
  // convertir un fallo de lectura de Airtable en un corte total de altas.
  if (accionSolicitada === "crear_reserva" || accionSolicitada === "reprogramar_reserva") {
    const fechaRevalidar =
      accionSolicitada === "crear_reserva"
        ? normalizedPayload.reserva.fecha
        : normalizedPayload.nueva_fecha_reserva;
    const pistaRevalidar =
      accionSolicitada === "crear_reserva"
        ? normalizedPayload.reserva.pista
        : normalizedPayload.nueva_pista;
    const horaRevalidar =
      accionSolicitada === "crear_reserva"
        ? normalizedPayload.reserva.hora
        : normalizedPayload.nueva_hora_inicio;

    const disponibilidad = await cp04FetchOcupadas(env, fechaRevalidar);

    if (disponibilidad.ok && cp04IsSlotOccupied(disponibilidad.ocupadas, fechaRevalidar, pistaRevalidar, horaRevalidar)) {
      return jsonResponse(
        {
          ok: false,
          error: "SLOT_ALREADY_BOOKED",
          message: "Ese horario ya no está disponible. Elige otra franja.",
        },
        409,
        headers
      );
    }

    // PASO 06C: a diferencia del resto de fallos de Airtable (que siguen
    // dejando pasar la solicitud, ver nota arriba), un bloqueo de CUOTA
    // aquí sí debe frenar la solicitud. Evidencia real (Paso 05D): cuando
    // Airtable está así de saturado, la ejecución de Make también falla
    // más adelante en su propio paso de Airtable — dejar pasar solo
    // produciría una respuesta "forwarded" que en realidad nunca llega a
    // confirmarse, exactamente la falsa confirmación que esta misión pide
    // evitar.
    if (!disponibilidad.ok && cp04IsAirtableRateLimited(disponibilidad.status, JSON.stringify(disponibilidad.details ?? disponibilidad.reason ?? ""))) {
      return jsonResponse(
        cp04BuildAirtableDegradedResponse({ origen: "revalidacion_reserva", accion: accionSolicitada, status: disponibilidad.status, reason: disponibilidad.reason, requestId: cp04GetRequestId(request) }),
        503,
        headers
      );
    }
    // Cualquier otro disponibilidad.ok === false (Airtable no configurado,
    // error genérico, red caída): se continúa sin revalidar, ver nota arriba.
  }

  const makeResult = await forwardToMake(normalizedPayload, env);
  const airtableResult = await prepareAirtableWrite(normalizedPayload, env);

  // La disponibilidad cacheada puede haber quedado desactualizada por esta
  // misma solicitud (crear/cancelar/reprogramar cambian qué slots están
  // ocupados) — se invalida siempre que se intenta una de estas 3
  // acciones, sin importar si Make aceptó o rechazó el reenvío: es más
  // seguro refrescar de más que arriesgarse a servir disponibilidad
  // obsoleta desde la caché.
  if (
    accionSolicitada === "crear_reserva" ||
    accionSolicitada === "cancelar_reserva" ||
    accionSolicitada === "reprogramar_reserva"
  ) {
    cp04InvalidateAvailabilityCache();
  }

  // PASO 06C: defensa adicional si Make llegara a reportar el bloqueo de
  // cuota de Airtable de forma síncrona en la respuesta del propio webhook
  // (ver nota en forwardToMake — hoy Make normalmente responde 200 antes
  // de que ese fallo ocurra, pero si alguna vez lo reporta aquí, tampoco
  // debe tratarse como una reserva confirmada).
  if (makeResult.configured && cp04IsAirtableRateLimited(makeResult.status, makeResult.bodyText)) {
    return jsonResponse(
      cp04BuildAirtableDegradedResponse({ origen: "forward_to_make", accion: accionSolicitada, status: makeResult.status, requestId: cp04GetRequestId(request) }),
      503,
      headers
    );
  }

  if (makeResult.configured && !makeResult.ok) {
    // PASO 06E: no tenía logging propio hasta ahora — sin esto, un rechazo
    // sostenido de Make (webhook mal configurado, cuenta suspendida) no
    // dejaba ningún rastro server-side, solo el 502 al cliente.
    cp04LogTechnicalEvent({
      event: "make_rejected",
      action: accionSolicitada,
      code: "MAKE_REJECTED",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: true,
      reserva_confirmada: false,
      origen: "forward_to_make",
      detail: { status: makeResult.status ?? null },
    });
    return jsonResponse({ ok: false, error: "Make webhook rejected the request" }, 502, headers);
  }

  // PASO 06D: solo aquí, en el único camino de éxito real, se marca la
  // clave de idempotencia — ver la nota junto a cp04IsIdempotentDuplicate.
  cp04MarkIdempotentSuccess(idempotencyKey);

  return jsonResponse({
    ok: true,
    status: makeResult.configured ? "forwarded" : "accepted_without_make_webhook",
    make: { configured: makeResult.configured, status: makeResult.status },
    airtable: airtableResult,
  }, 200, headers);
}
async function handleDisponibilidad(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== "GET") {
    return jsonResponse(
      { ok: false, error: "Method not allowed" },
      405,
      { ...headers, Allow: "GET, OPTIONS" }
    );
  }

  const url = new URL(request.url);



      // CP04_DOMINGOS_V1: una consulta dominical devuelve cerrado sin leer Airtable.
      if (
        request.method === "GET" &&
        url.pathname === "/api/disponibilidad"
      ) {
        const fechaConsulta = cleanText(url.searchParams.get("fecha"));

        if (isSundayISO(fechaConsulta)) {
          return jsonResponse(
            {
              ok: true,
              fecha: fechaConsulta,
              cerrado: true,
              motivo: "Club cerrado los domingos",
              ocupadas: [],
              total: 0
            },
            200,
            corsHeaders(request, env)
          );
        }
      }

  const fecha = url.searchParams.get("fecha");

  if (!fecha) {
    return jsonResponse(
      { ok: false, error: "Falta el parámetro fecha" },
      400,
      headers
    );
  }

  // Endpoint público sin autenticación: valida el formato antes de usar
  // `fecha` en un filtro de Airtable (defensa en profundidad, además del
  // escape de cp04FormulaText dentro de cp04FetchOcupadas).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return jsonResponse(
      { ok: false, error: "Formato de fecha inválido, use YYYY-MM-DD" },
      400,
      headers
    );
  }

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
    return jsonResponse(
      {
        ok: false,
        error: "Airtable no está configurado en el Worker",
        configured: {
          token: Boolean(env.AIRTABLE_TOKEN),
          base: Boolean(env.AIRTABLE_BASE_ID),
          table: Boolean(env.AIRTABLE_TABLE_ID)
        }
      },
      500,
      headers
    );
  }

  // Consulta compartida con la revalidación de handleReservas (misma
  // query, mismo filtro por fecha/estado) — ver cp04FetchOcupadas.
  const disponibilidad = await cp04FetchOcupadas(env, fecha);

  if (!disponibilidad.ok) {
    // No reenviar disponibilidad.details (cuerpo crudo de error de Airtable)
    // a un cliente anónimo: solo se loguea server-side, sin datos personales,
    // y solo `reason`/`status` (nunca `details`) — ver cp04LogTechnicalEvent.
    cp04LogTechnicalEvent({
      event: "airtable_error",
      action: "consultar_disponibilidad",
      code:
        disponibilidad.reason === "not_configured"
          ? "AIRTABLE_NOT_CONFIGURED"
          : disponibilidad.reason === "network_error"
          ? "AIRTABLE_NETWORK_ERROR"
          : "AIRTABLE_ERROR",
      requestId: cp04GetRequestId(request),
      retryable: disponibilidad.reason !== "not_configured",
      reserva_confirmada: false,
      origen: "disponibilidad",
      detail: { reason: disponibilidad.reason ?? null, status: disponibilidad.status ?? null, fecha },
    });

    if (cp04IsAirtableRateLimited(disponibilidad.status, JSON.stringify(disponibilidad.details ?? disponibilidad.reason ?? ""))) {
      return jsonResponse(
        cp04BuildAirtableDegradedResponse({ origen: "disponibilidad", fecha, status: disponibilidad.status, reason: disponibilidad.reason, requestId: cp04GetRequestId(request) }),
        503,
        headers
      );
    }

    return jsonResponse(
      {
        ok: false,
        error: "Error consultando disponibilidad en Airtable",
      },
      500,
      headers
    );
  }

  const ocupadas = disponibilidad.ocupadas;

  // ocupadas_detalle: además de la clave plana (solo hora de inicio, que ya
  // usan otros consumidores), se expone hora_fin de cada reserva existente
  // cuando Airtable la tiene rellena. Esto es lo mínimo necesario para que
  // el frontend pueda detectar solapamientos por intervalo real (una
  // reserva de 90/120 min ocupa más de un slot de una hora) en vez de por
  // coincidencia exacta de hora de inicio. No añade ni modifica nada en
  // Airtable: solo se lee un campo que ya existe (hora_fin, ya usado en
  // cp04ListReservations más abajo).
  const ocupadasDetalle = disponibilidad.records
    .map((record) => {
      const fields = record.fields || {};
      const pista = fields.Pista;
      const horaInicio = fields.hora_inicio;
      const horaFin = fields.hora_fin;

      if (!pista || !horaInicio) return null;

      return {
        pista: Array.isArray(pista) ? pista[0] : pista,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin || null
      };
    })
    .filter(Boolean);

  return jsonResponse(
    {
      ok: true,
      fecha,
      ocupadas,
      ocupadas_detalle: ocupadasDetalle,
      total: ocupadas.length
    },
    200,
    headers
  );
}

// CP04_LISTADO_RESERVAS_V1_BEGIN
export function cp04FormulaText(value) {
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

    let airtableData;

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

  // request_id: si la app ya manda uno (recomendado, para idempotencia real
  // extremo a extremo) se conserva tal cual; si no, el Worker genera uno de
  // respaldo. Un request_id generado aquí sigue sin proteger contra
  // reintentos de red del propio cliente (ver CONTRATO_API_ALTA_JUGADOR.md,
  // auditoría 2026-08-07) pero es mejor que no tener ninguno.
  const requestId =
    clean(payload?.request_id) || crypto.randomUUID();

  const normalized = {
    nombre: clean(payload?.nombre),
    apellidos: clean(payload?.apellidos),
    email: clean(payload?.email)?.toLowerCase(),
    telefono: clean(payload?.telefono) || "",
    fecha_nacimiento: clean(payload?.fecha_nacimiento) || "",
    nivel: clean(payload?.nivel) || "",
    genero: clean(payload?.genero) || "",
    comentarios: clean(payload?.comentarios || ""),
    acepta_condiciones: payload?.acepta_condiciones === true,
    origen: clean(payload?.origen || "app"),
    request_id: requestId,
  };

  // Campos obligatorios según el contrato de Alta General de Jugador
  // (auditoría 2026-08-07): nombre, apellidos, email, acepta_condiciones.
  // telefono/fecha_nacimiento/nivel/genero pasan a ser opcionales — antes
  // este handler los exigía todos, lo que rechazaba altas válidas según el
  // nuevo contrato.
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
    normalized.fecha_nacimiento &&
    !/^\d{4}-\d{2}-\d{2}$/.test(normalized.fecha_nacimiento)
  ) {
    errors.fecha_nacimiento = "Fecha inválida";
  }

  if (!normalized.acepta_condiciones) {
    errors.acepta_condiciones = "Aceptación obligatoria";
  }

  if (Object.keys(errors).length > 0) {
    return jsonResponse(
      {
        ok: false,
        status: "VALIDATION_ERROR",
        error: "Validation failed",
        fields: errors,
        request_id: requestId,
      },
      400,
      headers
    );
  }

  let makeResponse;

  try {
    makeResponse = await fetch(env.MAKE_ALTA_JUGADOR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
  } catch {
    // Fallo real de red hacia Make (no una respuesta HTTP de Make): esto sí
    // es un 502 legítimo, distinto de un 400/409/500 que Make devuelva con
    // intención (ver hallazgo de la auditoría 2026-08-07).
    return jsonResponse(
      { ok: false, status: "INTERNAL_ERROR", error: "Make unreachable", request_id: requestId },
      502,
      headers
    );
  }

  const responseText = await makeResponse.text();
  let makeBody;

  try {
    makeBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    makeBody = null;
  }

  // Antes, cualquier respuesta de Make que no fuera 2xx se colapsaba en un
  // 502 genérico "Make request failed", perdiendo los 400 (validación), 409
  // (ya existe) y 500 (error interno) que el propio blueprint de Make ya
  // devuelve diferenciados. Ahora, si Make respondió con un body JSON
  // reconocible (tiene "ok" booleano), se reenvía tal cual con su código
  // HTTP real. Solo se usa 502 si Make devolvió algo no interpretable.
  if (makeBody && typeof makeBody.ok === "boolean") {
    return jsonResponse(
      { ...makeBody, request_id: makeBody.request_id || requestId },
      makeResponse.status,
      headers
    );
  }

  if (!makeResponse.ok) {
    return jsonResponse(
      {
        ok: false,
        status: "INTERNAL_ERROR",
        error: "Make request failed",
        makeStatus: makeResponse.status,
        request_id: requestId,
      },
      502,
      headers
    );
  }

  return jsonResponse(
    {
      ok: true,
      status: "CREATED",
      message: "Jugador registrado correctamente",
      request_id: requestId,
    },
    200,
    headers
  );
}

// PASO 07C (2026-07-19): Baja de Jugador + Promoción — réplica deliberada
// del patrón de handleAltaJugador (mismo gate RBAC, misma forma de
// respuesta, mismo criterio de "nunca confirmar sin respuesta real de
// Make"). MAKE_BAJA_JUGADOR_WEBHOOK todavía no está configurado como
// secret en ningún entorno (ver wrangler.toml) — mientras no lo esté,
// este handler responde 503 de forma segura y nunca inventa una URL ni
// un secreto. Cuando exista el webhook real, no haría falta tocar nada
// más de esta función: basta con configurar el secret.
async function handleBajaJugador(request, env) {
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

  if (!env.MAKE_BAJA_JUGADOR_WEBHOOK) {
    return jsonResponse(
      { ok: false, error: "Baja webhook not configured" },
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
    motivo_baja: clean(payload?.motivo_baja),
    fecha_baja: clean(payload?.fecha_baja),
    promocionar_siguiente_si_aplica: payload?.promocionar_siguiente_si_aplica === true,
    observaciones: clean(payload?.observaciones || ""),
    origen: clean(payload?.origen || "APP_CLUB_PADEL_04"),
    accion: "baja_jugador",
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

  if (!normalized.motivo_baja) {
    errors.motivo_baja = "Motivo de baja obligatorio";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.fecha_baja || "")) {
    errors.fecha_baja = "Fecha de baja inválida";
  }

  if (Object.keys(errors).length > 0) {
    return jsonResponse(
      { ok: false, error: "Validation failed", fields: errors },
      400,
      headers
    );
  }

  const makeResponse = await fetch(env.MAKE_BAJA_JUGADOR_WEBHOOK, {
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
      message: "Baja de jugador registrada correctamente",
      makeResponse: responseText || null,
    },
    200,
    headers
  );
}

// PASO 07E (2026-07-19): Cierre Temporal de Pistas — mismo patrón que
// handleAltaJugador/handleBajaJugador (mismo gate RBAC STAFF/ADMIN/SUPPORT,
// misma forma de respuesta, mismo criterio de "nunca confirmar sin
// respuesta real de Make"). MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK todavía no
// está configurado como secret en ningún entorno (ver wrangler.toml) —
// mientras no lo esté, este handler responde 503 de forma segura y nunca
// inventa una URL ni un secreto. `estado` siempre viaja como
// "pendiente_confirmacion": ni este handler ni la app pueden afirmar que
// una pista queda cerrada solo porque Make devolvió 200 — esa confirmación
// depende de que el escenario 5791133 procese el cierre en Airtable/Make,
// fuera del alcance de este Worker.
const CIERRE_PISTAS_VALIDAS = ["Pista 1", "Pista 2", "Pista 3", "Pista 4", "todas"];
const CIERRE_MOTIVOS_VALIDOS = [
  "mantenimiento",
  "lluvia",
  "evento",
  "torneo",
  "limpieza",
  "obra",
  "incidencia",
  "administrativo",
  "otro",
];
const CIERRE_ROLES_VALIDOS = ["ADMIN", "STAFF", "SUPPORT"];

async function handleCierreTemporalPista(request, env) {
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

  if (!env.MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK) {
    return jsonResponse(
      { ok: false, error: "Cierre temporal webhook not configured" },
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
    accion: "cierre_temporal_pista",
    pista: clean(payload?.pista),
    fecha_inicio: clean(payload?.fecha_inicio),
    hora_inicio: clean(payload?.hora_inicio),
    fecha_fin: clean(payload?.fecha_fin),
    hora_fin: clean(payload?.hora_fin),
    motivo: clean(payload?.motivo),
    observaciones: clean(payload?.observaciones || ""),
    creado_por: clean(payload?.creado_por),
    rol_origen: clean(payload?.rol_origen),
    origen: "APP_CLUB_PADEL_04",
    estado: "pendiente_confirmacion",
    notify_players: payload?.notify_players === true,
    bloquear_reservas: true,
  };

  const errors = {};

  if (!CIERRE_PISTAS_VALIDAS.includes(normalized.pista)) {
    errors.pista = "Pista inválida";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.fecha_inicio || "")) {
    errors.fecha_inicio = "Fecha de inicio inválida";
  }

  if (!/^\d{2}:\d{2}$/.test(normalized.hora_inicio || "")) {
    errors.hora_inicio = "Hora de inicio inválida";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.fecha_fin || "")) {
    errors.fecha_fin = "Fecha de fin inválida";
  }

  if (!/^\d{2}:\d{2}$/.test(normalized.hora_fin || "")) {
    errors.hora_fin = "Hora de fin inválida";
  }

  if (
    !errors.fecha_inicio &&
    !errors.fecha_fin &&
    normalized.fecha_fin < normalized.fecha_inicio
  ) {
    errors.fecha_fin = "La fecha de fin no puede ser anterior a la de inicio";
  }

  if (
    !errors.fecha_inicio &&
    !errors.fecha_fin &&
    !errors.hora_inicio &&
    !errors.hora_fin &&
    normalized.fecha_fin === normalized.fecha_inicio &&
    normalized.hora_fin <= normalized.hora_inicio
  ) {
    errors.hora_fin = "La hora de fin debe ser posterior a la hora de inicio";
  }

  if (!CIERRE_MOTIVOS_VALIDOS.includes(normalized.motivo)) {
    errors.motivo = "Motivo inválido";
  }

  if (!normalized.creado_por || String(normalized.creado_por).length < 3) {
    errors.creado_por = "Creado_por inválido";
  }

  if (!CIERRE_ROLES_VALIDOS.includes(normalized.rol_origen)) {
    errors.rol_origen = "Rol de origen inválido";
  }

  if (Object.keys(errors).length > 0) {
    return jsonResponse(
      { ok: false, error: "Validation failed", fields: errors },
      400,
      headers
    );
  }

  const makeResponse = await fetch(env.MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK, {
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
      message: "Solicitud de cierre temporal enviada correctamente. Pendiente de confirmación real del sistema.",
      estado: "pendiente_confirmacion",
      makeResponse: responseText || null,
    },
    200,
    headers
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LISTA DE ESPERA · PISTA/RESERVA (flujo #8, Make 5791113 "📋 Gestión Lista de
// Espera" + escenario nuevo "📋➕ Lista de Espera Pista · Apuntarse/Salir")
//
// Dominio distinto de la lista de espera de MEMBRESÍA que ya gestiona
// "❌ Baja de Jugador + Promoción" (activa, sin tocar su comportamiento). Ambas
// comparten la tabla Airtable LISTA_ESPERA; se distinguen por el campo
// `tipo_espera` ("MEMBRESIA" vacío/legado vs "PISTA" aquí). Un jugador se
// apunta a la espera de un slot de pista concreto (pista+fecha+hora_inicio+
// hora_fin); el escenario 5791113 avisa por email cuando ese slot se libera,
// con ventana de expiración y reoferta al siguiente si no reserva a tiempo.
// ─────────────────────────────────────────────────────────────────────────────

const LISTA_ESPERA_ACCIONES = ["apuntarse", "salir"];

async function handleListaEspera(request, env) {
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

  if (!env.MAKE_LISTA_ESPERA_PISTA_WEBHOOK) {
    return jsonResponse(
      { ok: false, error: "Lista de espera webhook not configured" },
      503,
      headers
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  const clean = (value) => (typeof value === "string" ? value.trim() : value);
  const accion = clean(payload?.accion);

  if (!LISTA_ESPERA_ACCIONES.includes(accion)) {
    return jsonResponse(
      { ok: false, error: "Validation failed", fields: { accion: "Acción inválida. Usa 'apuntarse' o 'salir'." } },
      400,
      headers
    );
  }

  const normalized = {
    accion,
    email: clean(payload?.email || "").toLowerCase(),
    pista: clean(payload?.pista),
    fecha: clean(payload?.fecha),
    hora_inicio: clean(payload?.hora_inicio),
    hora_fin: clean(payload?.hora_fin),
    origen: "APP_CLUB_PADEL_04",
  };

  const errors = {};

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email || "");
  if (!emailValido) errors.email = "Email inválido.";

  if (!COURTS.includes(normalized.pista)) {
    errors.pista = `Pista inválida. Valores aceptados: ${COURTS.join(", ")}`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized.fecha || "")) {
    errors.fecha = "Fecha inválida (YYYY-MM-DD).";
  }

  if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalized.hora_inicio || "")) {
    errors.hora_inicio = "Hora de inicio inválida (HH:MM).";
  }

  if (accion === "apuntarse") {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(normalized.hora_fin || "")) {
      errors.hora_fin = "Hora de fin inválida (HH:MM).";
    }

    normalized.nombre = clean(payload?.nombre);
    normalized.apellidos = clean(payload?.apellidos || "");
    normalized.telefono = clean(payload?.telefono || "");
    normalized.nivel = clean(payload?.nivel || "");

    if (!normalized.nombre || normalized.nombre.length < 2) {
      errors.nombre = "Nombre requerido.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: errors }, 400, headers);
  }

  let makeResponse;
  try {
    makeResponse = await fetch(env.MAKE_LISTA_ESPERA_PISTA_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
  } catch {
    return jsonResponse({ ok: false, error: "Make request failed", code: "NETWORK_ERROR" }, 502, headers);
  }

  const responseText = await makeResponse.text().catch(() => "");

  if (!makeResponse.ok) {
    return jsonResponse(
      { ok: false, error: "Make request failed", status: makeResponse.status },
      502,
      headers
    );
  }

  let parsed = null;
  try {
    parsed = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsed = null;
  }

  // El Worker nunca inventa el resultado (duplicate/orden_espera): si Make no
  // devuelve un cuerpo JSON interpretable, se informa tal cual sin fingir éxito.
  if (!parsed || typeof parsed !== "object") {
    return jsonResponse(
      { ok: false, error: "Respuesta de Make no interpretable", makeResponse: responseText || null },
      502,
      headers
    );
  }

  return jsonResponse(parsed, 200, headers);
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
  let data;

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

    const token = parseAuthorizationHeader(request);

    if (!token) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "MISSING_BEARER_TOKEN",
          message: "Falta Authorization Bearer token."
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
    let data;

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
    if (!supabaseReady) {
      return jsonResponse(
        {
          ok: true,
          auth_ready: false,
          mode: "backend_stub",
          message: "Logout preparado. Pendiente invalidar sesión real cuando exista backend auth."
        },
        200,
        headers
      );
    }

    const token = parseAuthorizationHeader(request);

    if (!token) {
      return jsonResponse(
        {
          ok: true,
          auth_ready: true,
          provider: "supabase",
          message: "Sesión local cerrada. No había token Bearer que invalidar."
        },
        200,
        headers
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

    return jsonResponse(
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
      headers
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

    const refreshToken = String(body.refresh_token || "");

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

    return jsonResponse(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        access_token: result.data?.access_token || null,
        refresh_token: result.data?.refresh_token || null,
        expires_in: result.data?.expires_in || null,
        token_type: result.data?.token_type || "bearer",
        session: "active"
      },
      200,
      headers
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

    return jsonResponse(
      {
        ok: true,
        auth_ready: true,
        provider: "supabase",
        user: cp04SafeAuthUser(user),
        role: user.role,
        permissions: user.permissions,
        access_token: result.data?.access_token || null,
        refresh_token: result.data?.refresh_token || null,
        expires_in: result.data?.expires_in || null,
        token_type: result.data?.token_type || "bearer",
        session: "active"
      },
      200,
      headers
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

    const token = parseAuthorizationHeader(request);
    const password = String(body.newPassword || body.password || "");

    if (!token || !password) {
      return jsonResponse(
        {
          ok: false,
          auth_ready: true,
          provider: "supabase",
          error: "VALIDATION_ERROR",
          message: "Falta token Bearer o nueva contraseña."
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
    let data;

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

// ─────────────────────────────────────────────────────────────────────────────
// QR ACCESO — Generación y Control (Make scenarios 6244975 y 5291559)
//
// Arquitectura:
//   App → Worker → Make webhook → (Airtable) → respuesta normalizada
//
// El token QR es el `clave_reserva` codificado. Make lleva la fuente de
// verdad: Airtable almacena reserva + estado + historial de acceso.
//
// Reason codes devueltos por el Worker (normalizados desde Make):
//   VALID          — acceso autorizado
//   TOO_EARLY      — antes de la ventana de acceso
//   EXPIRED        — pasada la ventana de acceso
//   CANCELLED      — reserva cancelada o revocada
//   COURT_CLOSED   — pista cerrada temporalmente
//   WRONG_CLUB     — club_id no coincide
//   WRONG_COURT    — pista no coincide con la reserva
//   UNKNOWN_QR     — token no encontrado
//   ALREADY_USED   — acceso ya registrado (doble scan)
//   INVALID_STATE  — estado de reserva inconsistente
//   UNAUTHORIZED   — sin permiso para validar
// ─────────────────────────────────────────────────────────────────────────────

// Ventana temporal de acceso (minutos):
//   - PLAYER puede usar el QR desde QR_WINDOW_BEFORE_MIN antes del inicio.
//   - El QR expira QR_WINDOW_AFTER_MIN minutos después del inicio.
const QR_WINDOW_BEFORE_MIN = 15; // DECISIÓN PENDIENTE DE NEGOCIO — confirmar antes de producción
const QR_WINDOW_AFTER_MIN = 30;  // DECISIÓN PENDIENTE DE NEGOCIO — confirmar antes de producción

const QR_GENERATE_ROLES = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];
const QR_VALIDATE_ROLES = ["STAFF", "ADMIN", "SUPPORT"];

// Reason codes canónicos — no modificar sin actualizar el doc y los tests.
export const QR_REASON_CODES = Object.freeze({
  VALID:         "VALID",
  TOO_EARLY:     "TOO_EARLY",
  EXPIRED:       "EXPIRED",
  CANCELLED:     "CANCELLED",
  COURT_CLOSED:  "COURT_CLOSED",
  WRONG_CLUB:    "WRONG_CLUB",
  WRONG_COURT:   "WRONG_COURT",
  UNKNOWN_QR:    "UNKNOWN_QR",
  ALREADY_USED:  "ALREADY_USED",
  INVALID_STATE: "INVALID_STATE",
  UNAUTHORIZED:  "UNAUTHORIZED",
});

// Mapear respuestas de Make a reason codes canónicos.
// IMPORTANTE: la mera presencia de "ok" en la respuesta NUNCA implica acceso
// permitido — un JSON como {"ok":true,"decision":"DENY","reason":"TOO_EARLY"}
// contiene "ok" pero debe denegar. Por eso, si la respuesta es JSON válido,
// se priorizan siempre los campos decision/reason explícitos sobre cualquier
// heurística textual.
function mapMakeQrResult(makeText) {
  const raw = makeText || "";

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const decision = typeof parsed.decision === "string" ? parsed.decision.toUpperCase() : "";
      const reason   = typeof parsed.reason   === "string" ? parsed.reason.toUpperCase()   : "";

      if (reason === "TOO_EARLY")    return QR_REASON_CODES.TOO_EARLY;
      if (reason === "EXPIRED")      return QR_REASON_CODES.EXPIRED;
      if (reason === "ALREADY_USED") return QR_REASON_CODES.ALREADY_USED;
      if (reason === "CANCELLED")    return QR_REASON_CODES.CANCELLED;
      if (reason === "COURT_CLOSED") return QR_REASON_CODES.COURT_CLOSED;
      if (reason === "WRONG_CLUB")   return QR_REASON_CODES.WRONG_CLUB;
      if (reason === "WRONG_COURT")  return QR_REASON_CODES.WRONG_COURT;
      if (reason === "UNKNOWN_QR")   return QR_REASON_CODES.UNKNOWN_QR;
      if (reason === "UNAUTHORIZED") return QR_REASON_CODES.UNAUTHORIZED;
      if (reason === "INVALID")      return QR_REASON_CODES.INVALID_STATE;

      if (decision === "ALLOW" && (reason === "ACCESO_OK" || reason === "VALID")) {
        return QR_REASON_CODES.VALID;
      }
      if (decision === "DENY") return QR_REASON_CODES.INVALID_STATE;
      // JSON válido pero sin decision/reason reconocibles: no asumir acceso.
      return QR_REASON_CODES.INVALID_STATE;
    }
  } catch {
    // No es JSON válido — Make histórico devuelve texto plano. Fallback abajo.
  }

  // Fallback textual legacy (compatibilidad con respuestas de texto plano).
  const t = raw.toLowerCase();
  if (t.includes("acceso_ok"))                                return QR_REASON_CODES.VALID;
  if (t.includes("qr_caducado") || t.includes("expirado"))   return QR_REASON_CODES.EXPIRED;
  if (t.includes("denegado") || t.includes("invalido"))      return QR_REASON_CODES.CANCELLED;
  if (t.includes("cerrada") || t.includes("closed"))         return QR_REASON_CODES.COURT_CLOSED;
  if (t.includes("ya_usado") || t.includes("already"))       return QR_REASON_CODES.ALREADY_USED;
  if (t.includes("desconocido") || t.includes("unknown"))    return QR_REASON_CODES.UNKNOWN_QR;
  return QR_REASON_CODES.INVALID_STATE;
}

// `auth` es { role, email, ... } cuando CP04_ENFORCE_ROLE_GATES=true (viene
// del gate ya resuelto en el dispatcher); `null` cuando el gate está
// desactivado o la petición es OPTIONS. Se usa únicamente para la
// comprobación de propiedad de PLAYER (ver más abajo) — nunca para decidir
// si la petición está autenticada, eso ya lo resolvió requireRoles antes de
// llamar a este handler.
async function handleQrGenerate(request, env, auth = null) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST")    return jsonResponse({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405, headers);

  if (!env.MAKE_QR_ACCESO_WEBHOOK) {
    return jsonResponse(
      { ok: false, error: "QR generation webhook not configured", code: "NOT_CONFIGURED" },
      503,
      headers
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  const clean = (v) => (typeof v === "string" ? v.trim() : v);
  const clave_reserva  = clean(payload?.clave_reserva);
  const player_id      = clean(payload?.player_id);
  const club_id        = clean(payload?.club_id);
  const pista          = clean(payload?.pista);
  const fecha          = clean(payload?.fecha);
  const hora_inicio    = clean(payload?.hora_inicio);
  const hora_fin       = clean(payload?.hora_fin);
  const record_id      = clean(payload?.record_id);
  const nombre         = clean(payload?.nombre);
  const email          = clean(payload?.email);

  const errors = {};
  if (!clave_reserva || clave_reserva.length < 4) errors.clave_reserva = "Requerida (mínimo 4 caracteres)";
  if (!player_id)                                  errors.player_id     = "Requerido";
  if (!club_id)                                    errors.club_id       = "Requerido";
  if (!pista || !COURTS.includes(pista))           errors.pista         = `Pista inválida. Valores aceptados: ${COURTS.join(", ")}`;
  if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) errors.fecha       = "Fecha inválida (YYYY-MM-DD)";
  if (!hora_inicio || !/^\d{2}:\d{2}$/.test(hora_inicio)) errors.hora_inicio = "Hora inválida (HH:MM)";
  if (!hora_fin || !/^\d{2}:\d{2}$/.test(hora_fin))       errors.hora_fin    = "Hora fin inválida (HH:MM)";
  if (!record_id)                                  errors.record_id     = "Requerido";
  if (!nombre)                                     errors.nombre        = "Requerido";
  if (!email)                                      errors.email         = "Requerido";

  if (Object.keys(errors).length > 0) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: errors }, 400, headers);
  }

  // Defensa en profundidad — CRÍTICA para este endpoint, no un refuerzo
  // opcional: a diferencia de /api/qr/validate, el escenario Make 6244975 NO
  // valida la reserva contra Airtable (verificado en el blueprint real): solo
  // comprueba event/club_id/record_id "exist" y envía el email. Si el Worker
  // reenviara ciegamente lo que manda el cliente, cualquier PLAYER
  // autenticado podría generarse (y recibir por email) un QR de acceso válido
  // para una `clave_reserva` ajena, con pista/horario inventados. Por eso
  // aquí SÍ se falla cerrado: sin poder confirmar la reserva real en
  // Airtable, no se genera ni se envía nada.
  const reservaReal = await cp04LookupReservaParaQr(env, clave_reserva);

  if (!reservaReal.ok) {
    return jsonResponse(
      { ok: false, error: "No se pudo verificar la reserva", code: "RESERVATION_CHECK_FAILED" },
      503,
      headers
    );
  }

  if (!reservaReal.found) {
    return jsonResponse(
      { ok: false, error: "Reserva no encontrada", code: "RESERVATION_NOT_FOUND" },
      404,
      headers
    );
  }

  if (reservaReal.estado_reserva !== "confirmada") {
    return jsonResponse(
      { ok: false, error: "La reserva no está confirmada", code: "RESERVATION_NOT_CONFIRMED" },
      409,
      headers
    );
  }

  if (reservaReal.pista && reservaReal.pista !== pista) {
    return jsonResponse(
      { ok: false, error: "La pista no coincide con la reserva real", code: "MISMATCHED_COURT" },
      409,
      headers
    );
  }

  // PLAYER solo puede generar el QR de su propia reserva (comparado contra
  // el email real de Airtable, nunca el que mande el body). STAFF/ADMIN/
  // SUPPORT pueden generarlo en nombre de un jugador (soporte/recepción),
  // igual que en el resto de endpoints de gestión.
  if (
    auth &&
    auth.role === "PLAYER" &&
    reservaReal.email &&
    String(auth.email || "").toLowerCase() !== reservaReal.email.toLowerCase()
  ) {
    return jsonResponse(
      { ok: false, error: "FORBIDDEN", message: "Solo puedes generar el QR de tu propia reserva." },
      403,
      headers
    );
  }

  // A partir de aquí, nombre/email/fecha/horario/record_id vienen SIEMPRE de
  // la reserva real de Airtable, nunca del body — el body ya cumplió su
  // única función (localizar la reserva e indicar la pista, ya validada
  // arriba contra la reserva real).
  const nombreReal     = reservaReal.nombre       || nombre;
  const emailReal      = reservaReal.email        || email;
  const fechaReal       = reservaReal.fecha_reserva || fecha;
  const horaInicioReal  = reservaReal.hora_inicio   || hora_inicio;
  const horaFinReal     = reservaReal.hora_fin      || hora_fin;
  const recordIdReal    = reservaReal.recordId      || record_id;

  const issuedAt   = new Date().toISOString();
  const fechaBase  = new Date(`${fechaReal}T${horaInicioReal}:00Z`);
  const validFrom  = new Date(fechaBase.getTime() - QR_WINDOW_BEFORE_MIN * 60 * 1000).toISOString();
  const validUntil = new Date(fechaBase.getTime() + QR_WINDOW_AFTER_MIN * 60 * 1000).toISOString();

  // Payload exacto que espera Make escenario 6244975 (Generación QR Acceso)
  const makePayload = {
    event:           "reserva_confirmada",
    club_id:         "club-padel-04",
    record_id:       recordIdReal,
    nombre:          nombreReal,
    email:           emailReal,
    clave_reserva,
    fecha_reserva:   fechaReal,
    hora_inicio:     horaInicioReal,
    hora_fin:        horaFinReal,
    pista,
    idempotency_key: `qr_gen_${clave_reserva}`,
    source:          "app_cp04",
    test_mode:       false,
  };

  let makeResponse;
  try {
    makeResponse = await fetch(env.MAKE_QR_ACCESO_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makePayload),
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: "Make request failed", code: "NETWORK_ERROR" }, 502, headers);
  }

  const makeText = await makeResponse.text().catch(() => "");

  if (!makeResponse.ok) {
    return jsonResponse(
      { ok: false, error: "Make request failed", status: makeResponse.status, code: "MAKE_ERROR" },
      502,
      headers
    );
  }

  return jsonResponse(
    {
      ok:            true,
      clave_reserva,
      pista,
      fecha:         fechaReal,
      hora_inicio:   horaInicioReal,
      valid_from:    validFrom,
      valid_until:   validUntil,
      issued_at:     issuedAt,
      estado:        "pendiente_confirmacion",
      makeResponse:  makeText || null,
    },
    200,
    headers
  );
}

// Lookup compartido por /api/qr/validate y /api/qr/generate: la fuente de
// verdad de una `clave_reserva` (pista, estado, nombre, email, fecha,
// horario) es siempre la reserva persistida en Airtable, nunca lo que envíe
// el cliente/escáner. Devuelve `{ ok:false, reason }` si Airtable no está
// configurado, la petición falla o responde con error HTTP; `{ ok:true,
// found:false }` si no hay ninguna reserva con esa clave; o `{ ok:true,
// found:true, ... }` con los campos reales. Cómo trata cada llamador un
// `ok:false`/`found:false` es responsabilidad suya (ver comentarios en cada
// handler): /validate puede caer de vuelta al flujo de Make (segunda capa de
// verdad), /generate no puede — es la única verificación antes de emitir y
// enviar el QR.
async function cp04LookupReservaParaQr(env, claveReserva) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
    return { ok: false, reason: "not_configured" };
  }

  const formula = `{clave_reserva} = "${cp04FormulaText(claveReserva)}"`;
  const airtableUrl =
    `https://api.airtable.com/v0/${encodeURIComponent(env.AIRTABLE_BASE_ID)}/${encodeURIComponent(env.AIRTABLE_TABLE_ID)}` +
    `?filterByFormula=${encodeURIComponent(formula)}` +
    `&maxRecords=1` +
    `&fields%5B%5D=clave_reserva` +
    `&fields%5B%5D=estado_reserva` +
    `&fields%5B%5D=Pista` +
    `&fields%5B%5D=Nombre` +
    `&fields%5B%5D=Email` +
    `&fields%5B%5D=fecha_reserva` +
    `&fields%5B%5D=hora_inicio` +
    `&fields%5B%5D=hora_fin`;

  let airtableRes;
  try {
    airtableRes = await fetch(airtableUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        Accept: "application/json",
      },
    });
  } catch {
    return { ok: false, reason: "network_error" };
  }

  const data = await airtableRes.json().catch(() => null);

  if (!airtableRes.ok) {
    return { ok: false, reason: "airtable_error", status: airtableRes.status };
  }

  const record = Array.isArray(data?.records) ? data.records[0] : null;
  if (!record) {
    return { ok: true, found: false };
  }

  const fields = record && typeof record.fields === "object" ? record.fields : {};
  const pistaReal = cp04Scalar(cp04PickField(fields, "fld0UMH1W6VXF55xb", ["Pista", "pista"])).trim();
  const estadoReserva = cp04Scalar(cp04PickField(fields, "fldXYQaqNXZWY9IO9", ["estado_reserva"])).trim();
  const nombreReal = cp04Scalar(cp04PickField(fields, "fldYEv1HQY1uK8h4P", ["Nombre", "nombre"])).trim();
  const emailReal = cp04Scalar(cp04PickField(fields, "fldBssXQxXnhG8yXt", ["Email", "email"])).trim();
  const fechaReal = cp04Scalar(cp04PickField(fields, "fldUMLCyV75pxgHwy", ["fecha_reserva"])).trim();
  const horaInicioReal = cp04Scalar(cp04PickField(fields, "fldfgICHdyy2kgxDr", ["hora_inicio"])).trim();
  const horaFinReal = cp04Scalar(cp04PickField(fields, "fldoJx5Er5JVwLKCY", ["hora_fin"])).trim();

  return {
    ok: true,
    found: true,
    pista: pistaReal,
    estado_reserva: estadoReserva,
    nombre: nombreReal,
    email: emailReal,
    fecha_reserva: fechaReal,
    hora_inicio: horaInicioReal,
    hora_fin: horaFinReal,
    recordId: record.id,
  };
}

async function handleQrValidate(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST")    return jsonResponse({ ok: false, error: "METHOD_NOT_ALLOWED" }, 405, headers);

  if (!env.MAKE_CONTROL_QR_WEBHOOK) {
    return jsonResponse(
      { ok: false, error: "QR control webhook not configured", code: "NOT_CONFIGURED" },
      503,
      headers
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  const clean = (v) => (typeof v === "string" ? v.trim() : v);
  const clave_reserva = clean(payload?.clave_reserva);
  const pista         = clean(payload?.pista);
  const club_id       = clean(payload?.club_id);
  const staff_id      = clean(payload?.staff_id);

  const errors = {};
  if (!clave_reserva || clave_reserva.length < 4) errors.clave_reserva = "Requerida";
  if (!pista || !COURTS.includes(pista))           errors.pista         = `Pista inválida. Valores aceptados: ${COURTS.join(", ")}`;
  if (!club_id)                                    errors.club_id       = "Requerido";
  if (!staff_id)                                   errors.staff_id      = "Requerido";

  if (Object.keys(errors).length > 0) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: errors }, 400, headers);
  }

  const scanned_at = new Date().toISOString();

  // Defensa en profundidad (ver cp04LookupReservaParaQr): si la reserva real
  // en Airtable existe y su pista no coincide con la pista solicitada, se
  // deniega AQUÍ, antes de llamar a Make. Así el QR nunca llega al escenario
  // que lo marca como usado — sigue disponible para escanearse en su pista
  // correcta. Si el lookup no es concluyente (Airtable no configurado, sin
  // resultado, error de red/HTTP), se sigue el flujo existente y la
  // decisión queda en manos de Make, igual que antes de este fix.
  const reservaReal = await cp04LookupReservaParaQr(env, clave_reserva);
  if (reservaReal.ok && reservaReal.found && reservaReal.pista && reservaReal.pista !== pista) {
    return jsonResponse(
      {
        ok:           true,
        decision:     "DENY",
        reason:       QR_REASON_CODES.WRONG_COURT,
        clave_reserva,
        pista,
        scanned_at,
        makeResponse: null,
      },
      200,
      headers
    );
  }

  const normalized = {
    accion:         "validar_qr_acceso",
    clave_reserva,
    pista,
    club_id,
    staff_id,
    scanned_at,
    origen:         "APP_CLUB_PADEL_04",
  };

  let makeResponse;
  try {
    makeResponse = await fetch(env.MAKE_CONTROL_QR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
  } catch (e) {
    return jsonResponse({ ok: false, error: "Make request failed", code: "NETWORK_ERROR" }, 502, headers);
  }

  const makeText = await makeResponse.text().catch(() => "");

  if (!makeResponse.ok) {
    return jsonResponse(
      { ok: false, error: "Make request failed", status: makeResponse.status, code: "MAKE_ERROR" },
      502,
      headers
    );
  }

  const reason    = mapMakeQrResult(makeText);
  const decision  = reason === QR_REASON_CODES.VALID ? "ALLOW" : "DENY";

  return jsonResponse(
    {
      ok:           true,
      decision,
      reason,
      clave_reserva,
      pista,
      scanned_at,
      makeResponse: makeText || null,
    },
    200,
    headers
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ⚖️ SOLICITUD GDPR ACCESO U OLVIDO DE DATOS (flujo #9, Make 6323457 — un
// único escenario gestiona ACCESO y OLVIDO, igual que handleListaEspera
// distingue "apuntarse"/"salir" con un campo `accion`: nunca se crea un
// segundo escenario para esto).
//
// Estado real de las fuentes de datos hoy (ver src/data/makeArchitectureMatrix.js,
// id 6323457 = EXTERNALLY_BLOCKED): el Worker solo tiene configurada
// AIRTABLE_TABLE_ID (Reservas Padel 04). No existe ningún AIRTABLE_*_TABLE_ID
// para JUGADORES, LISTA_ESPERA, HISTORIAL_BAJAS, log_reservas,
// Push_Subscriptions, Inscripciones, Torneos ni Partidos, ni tampoco
// MAKE_GDPR_WEBHOOK como secret (ver wrangler.toml). Estos handlers NUNCA
// fingen una tabla vacía cuando en realidad no pueden consultarla: cada
// categoría no verificable viaja como `disponible:false, motivo:"NO_CONFIGURADO"`
// en vez de inventar un resultado.
//
// BAJA DE JUGADOR (handleBajaJugador, más arriba) y GDPR_OLVIDO son
// operaciones deliberadamente distintas: una baja es una decisión de
// membresía; esto es únicamente eliminación/anonimización de datos
// personales. Ninguno de estos handlers llama a handleBajaJugador ni
// reutiliza su semántica de "promocionar_siguiente_si_aplica".
const GDPR_ROLES_ADMINISTRATIVOS = ["ADMIN", "SUPPORT"];

function cp04GdprEmailValido(email) {
  return Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cp04GdprCategoriaNoConfigurada(motivo) {
  return { disponible: false, motivo, registros: [] };
}

// Única fuente de reservas real disponible para GDPR: la misma tabla y el
// mismo criterio de escape (cp04FormulaText) que cp04ListReservations y
// cp04LookupReservaParaQr más arriba — sin reimplementar la paginación
// completa porque el volumen esperado de reservas por socio es pequeño
// (pageSize=100 basta; si algún día no bastara, sería el mismo problema que
// ya tiene cp04ListReservations, no uno nuevo de GDPR).
async function cp04GdprBuscarReservasPorEmail(env, email, { soloFuturas = false } = {}) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
    return { configured: false, ok: false, records: [] };
  }

  const condiciones = [`LOWER({Email})="${cp04FormulaText(email)}"`];
  if (soloFuturas) {
    condiciones.push(`{fecha_reserva} >= "${cp04FormulaText(todayISO())}"`);
    condiciones.push(`LOWER({estado_reserva})!="cancelada"`);
  }
  const filterFormula = condiciones.length === 1 ? condiciones[0] : `AND(${condiciones.join(",")})`;

  const airtableUrl =
    `https://api.airtable.com/v0/${encodeURIComponent(env.AIRTABLE_BASE_ID)}/${encodeURIComponent(env.AIRTABLE_TABLE_ID)}` +
    `?filterByFormula=${encodeURIComponent(filterFormula)}` +
    `&pageSize=100` +
    `&fields%5B%5D=clave_reserva` +
    `&fields%5B%5D=Pista` +
    `&fields%5B%5D=estado_reserva` +
    `&fields%5B%5D=fecha_reserva` +
    `&fields%5B%5D=hora_inicio` +
    `&fields%5B%5D=hora_fin`;

  let airtableResponse;
  try {
    airtableResponse = await fetch(airtableUrl, {
      method: "GET",
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, Accept: "application/json" },
    });
  } catch {
    return { configured: true, ok: false, records: [] };
  }

  const rawText = await airtableResponse.text().catch(() => "");
  let airtableData;
  try {
    airtableData = rawText ? JSON.parse(rawText) : {};
  } catch {
    return { configured: true, ok: false, records: [] };
  }

  if (!airtableResponse.ok) {
    return { configured: true, ok: false, status: airtableResponse.status, records: [] };
  }

  const records = Array.isArray(airtableData.records)
    ? airtableData.records.map((record) => ({
        clave_reserva: record.fields?.clave_reserva ?? null,
        pista: record.fields?.Pista ?? null,
        estado_reserva: record.fields?.estado_reserva ?? null,
        fecha_reserva: record.fields?.fecha_reserva ?? null,
        hora_inicio: record.fields?.hora_inicio ?? null,
        hora_fin: record.fields?.hora_fin ?? null,
      }))
    : [];

  return { configured: true, ok: true, records };
}

// Notificación best-effort al escenario Make 6323457 (auditoría/tramitación).
// Nunca bloquea ni invalida la respuesta al usuario si falla: el resultado
// se refleja honestamente en `auditoria`, nunca se finge un registro que no
// ocurrió.
async function cp04GdprNotificarMake(env, evento) {
  if (!env.MAKE_GDPR_WEBHOOK) {
    return { registrado_en_make: false, detalle: "MAKE_GDPR_WEBHOOK no configurado — acción manual pendiente (ver runbook 07Q)." };
  }
  try {
    const makeResponse = await fetch(env.MAKE_GDPR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento),
    });
    return {
      registrado_en_make: makeResponse.ok,
      detalle: makeResponse.ok ? "Registrado en Make (6323457)." : `Make respondió ${makeResponse.status}.`,
    };
  } catch {
    return { registrado_en_make: false, detalle: "Error de red al notificar a Make." };
  }
}

// ── DERECHO DE ACCESO — POST /api/gdpr/acceso ──
// requireAuth es SIEMPRE obligatorio (no depende de CP04_ENFORCE_ROLE_GATES):
// expone PII, así que nunca puede quedar accesible sin sesión real verificada
// por Supabase — mismo criterio que GET /api/reservas más abajo en el
// dispatcher. Un PLAYER/STAFF solo puede consultar su propio email
// autenticado (el que mande en el body se ignora); solo ADMIN/SUPPORT puede
// pedir los datos de otro socio, para tramitar una solicitud recibida por
// otro canal.
async function handleGdprAcceso(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, { ...headers, Allow: "POST, OPTIONS" });
  }

  const gate = await requireAuth(request, env);
  if (!gate.ok) return jsonResponse(gate.body, gate.status, headers);
  const auth = gate.auth;

  let payload;
  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const esAdministrativo = authorizeRole(auth.role, GDPR_ROLES_ADMINISTRATIVOS);
  const emailSolicitado = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const targetEmail = esAdministrativo && cp04GdprEmailValido(emailSolicitado)
    ? emailSolicitado
    : String(auth.email || "").toLowerCase();

  if (!cp04GdprEmailValido(targetEmail)) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: { email: "Email inválido." } }, 400, headers);
  }

  const esConsultaPropia = targetEmail === String(auth.email || "").toLowerCase();
  const reservas = await cp04GdprBuscarReservasPorEmail(env, targetEmail);

  const datos = {
    // Identidad solo se puede construir de verdad para la propia sesión
    // autenticada (userId/role verificados por Supabase). Para un email de
    // un tercero pedido por ADMIN/SUPPORT no existe ninguna fuente que
    // resuelva userId a partir de solo el email sin una tabla JUGADORES
    // configurada — se marca honestamente en vez de inventarlo.
    identidad: esConsultaPropia
      ? { disponible: true, registros: [{ user_id: auth.userId, email: auth.email, rol: auth.role, club_id: auth.clubId, organization_id: auth.organizationId }] }
      : cp04GdprCategoriaNoConfigurada("SIN_FUENTE_PARA_RESOLVER_TERCERO"),
    // El perfil deportivo/bio/privacidad de Perfil() vive únicamente en
    // localStorage del navegador (ver Perfil() en App.jsx) — el Worker
    // nunca ha tenido acceso a esos datos, así que no puede incluirlos.
    perfil: cp04GdprCategoriaNoConfigurada("ALMACENADO_SOLO_EN_CLIENTE"),
    reservas: reservas.configured
      ? (reservas.ok
          ? { disponible: true, registros: reservas.records }
          : { disponible: false, motivo: "AIRTABLE_ERROR", registros: [] })
      : cp04GdprCategoriaNoConfigurada("NO_CONFIGURADO"),
    lista_espera: cp04GdprCategoriaNoConfigurada("NO_CONFIGURADO"),
    competiciones: cp04GdprCategoriaNoConfigurada("NO_CONFIGURADO"),
    logs_trazabilidad: cp04GdprCategoriaNoConfigurada("NO_CONFIGURADO"),
  };

  const idSolicitud = crypto.randomUUID();
  const auditoria = await cp04GdprNotificarMake(env, {
    tipo: "GDPR_ACCESO",
    id_solicitud: idSolicitud,
    estado: "EJECUTADO",
    email_titular: targetEmail,
    actor: { email: auth.email, role: auth.role },
    fecha_solicitud: new Date().toISOString(),
    origen: "APP_CLUB_PADEL_04",
  });

  return jsonResponse(
    {
      ok: true,
      tipo: "GDPR_ACCESO",
      titular: { email: targetEmail },
      solicitante: { email: auth.email, role: auth.role },
      generado_en: new Date().toISOString(),
      datos,
      auditoria,
    },
    200,
    headers
  );
}

// ── DERECHO DE OLVIDO — POST /api/gdpr/olvido ──
// Flujo de dos fases sobre el mismo endpoint (igual que handleListaEspera
// distingue acciones con un campo, aquí es el flag `ejecutar`):
//   1) SOLICITUD (ejecutar ausente/false): cualquier titular autenticado
//      registra su propia solicitud. Nunca borra ni cancela nada — solo
//      analiza dependencias reales (reservas futuras) y las no verificables
//      (lista de espera, sin tabla configurada) y notifica a Make.
//   2) EJECUCIÓN (ejecutar:true, solo ADMIN/SUPPORT): representa la
//      "revisión administrativa" ya hecha fuera del Worker (en Make/Airtable,
//      que sí puede ver LISTA_ESPERA). Reutiliza handleReservas
//      (cancelar_reserva) y handleListaEspera (salir) tal cual existen, sin
//      tocar ni una línea de ninguno de los dos.
const GDPR_OLVIDO_IDEMPOTENCY_PREFIX_SOLICITUD = "gdpr_olvido_solicitud";
const GDPR_OLVIDO_IDEMPOTENCY_PREFIX_EJECUCION = "gdpr_olvido_ejecucion";

async function handleGdprOlvido(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405, { ...headers, Allow: "POST, OPTIONS" });
  }

  const gate = await requireAuth(request, env);
  if (!gate.ok) return jsonResponse(gate.body, gate.status, headers);
  const auth = gate.auth;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400, headers);
  }

  const esAdministrativo = authorizeRole(auth.role, GDPR_ROLES_ADMINISTRATIVOS);
  const emailSolicitado = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const targetEmail = esAdministrativo && cp04GdprEmailValido(emailSolicitado)
    ? emailSolicitado
    : String(auth.email || "").toLowerCase();

  if (!cp04GdprEmailValido(targetEmail)) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: { email: "Email inválido." } }, 400, headers);
  }

  // Confirmación fuerte obligatoria en las dos fases: nunca se procesa un
  // olvido "por accidente" (doble clic sin confirmar, integración externa
  // mal configurada). La UI (Perfil()/BackupsSeguridad()) siempre debe
  // pedir una confirmación explícita antes de llegar aquí.
  if (payload?.confirmar !== true) {
    return jsonResponse(
      { ok: false, error: "CONFIRMATION_REQUIRED", message: "Falta confirmación explícita de la solicitud de olvido." },
      400,
      headers
    );
  }

  const ejecutar = payload?.ejecutar === true;

  if (ejecutar && !esAdministrativo) {
    return jsonResponse(
      { ok: false, error: "FORBIDDEN", message: "Solo ADMIN/SUPPORT puede ejecutar una solicitud de olvido ya revisada." },
      403,
      headers
    );
  }

  // Idempotencia (Fase 6): reutiliza el mismo almacén en memoria que ya usa
  // handleReservas (cp04IsIdempotentDuplicate/cp04MarkIdempotentSuccess),
  // con claves propias de GDPR — no se reimplementa el mecanismo, solo se
  // deriva una clave distinta por fase (solicitud vs ejecución) y por
  // titular. A diferencia de crear_reserva (que solo marca éxito en el
  // camino feliz para no bloquear un reintento legítimo tras un error), en
  // EJECUCIÓN se marca siempre que se intenta, incluso en PARCIAL/ERROR:
  // el riesgo de volver a cancelar/anonimizar algo ya tocado pesa más que
  // la comodidad de un reintento automático — un reintento real requiere
  // una nueva decisión humana, no una repetición ciega.
  const idemKey = `${ejecutar ? GDPR_OLVIDO_IDEMPOTENCY_PREFIX_EJECUCION : GDPR_OLVIDO_IDEMPOTENCY_PREFIX_SOLICITUD}|${targetEmail}`;
  if (cp04IsIdempotentDuplicate(idemKey)) {
    return jsonResponse(
      {
        ok: false,
        code: "IDEMPOTENT_DUPLICATE",
        duplicated: true,
        message: "Ya hay una solicitud de olvido idéntica en curso para este socio. Espera unos minutos antes de repetirla.",
      },
      409,
      headers
    );
  }

  // Fase 3 — análisis de dependencias. Reservas futuras SÍ se pueden
  // verificar de verdad. Lista de espera de pista NO: no existe ningún
  // AIRTABLE_LISTA_ESPERA_TABLE_ID configurado, así que el Worker no puede
  // leerla — se marca `verificable:false`, nunca "vacía".
  const reservasFuturas = await cp04GdprBuscarReservasPorEmail(env, targetEmail, { soloFuturas: true });

  const dependencias = {
    reservas_futuras: reservasFuturas.configured
      ? (reservasFuturas.ok
          ? { verificable: true, cantidad: reservasFuturas.records.length, registros: reservasFuturas.records }
          : { verificable: false, motivo: "AIRTABLE_ERROR" })
      : { verificable: false, motivo: "NO_CONFIGURADO" },
    lista_espera_activa: { verificable: false, motivo: "NO_CONFIGURADO" },
  };

  if (!ejecutar) {
    const hayDependenciasPendientes =
      !dependencias.reservas_futuras.verificable ||
      !dependencias.lista_espera_activa.verificable ||
      dependencias.reservas_futuras.cantidad > 0;

    // Fase 4: nunca se anonimiza/borra nada en esta rama. Al no poder
    // verificar lista de espera, ninguna solicitud puede cerrarse como
    // "SOLICITADO" sin más — siempre requiere revisión humana con el
    // estado actual de configuración.
    const estado = hayDependenciasPendientes ? "REQUIERE_REVISION_HUMANA" : "SOLICITADO";

    const idSolicitud = crypto.randomUUID();
    const auditoria = await cp04GdprNotificarMake(env, {
      tipo: "GDPR_OLVIDO",
      id_solicitud: idSolicitud,
      estado,
      email_titular: targetEmail,
      actor: { email: auth.email, role: auth.role },
      dependencias,
      motivo: typeof payload?.motivo === "string" ? payload.motivo.trim() : "",
      fecha_solicitud: new Date().toISOString(),
      origen: "APP_CLUB_PADEL_04",
    });

    cp04MarkIdempotentSuccess(idemKey);

    return jsonResponse(
      {
        ok: true,
        tipo: "GDPR_OLVIDO",
        estado,
        titular: { email: targetEmail },
        solicitante: { email: auth.email, role: auth.role },
        dependencias,
        anonimizacion_historica: "REQUIERE_REVISION_HUMANA",
        auditoria,
      },
      200,
      headers
    );
  }

  // ── Ejecución (ADMIN/SUPPORT, tras revisión externa) ──
  // Reservas futuras detectadas de verdad arriba: se cancelan reutilizando
  // handleReservas tal cual (misma función, mismo camino que usa STAFF a
  // diario), reenviando el Authorization del admin que ejecuta — lo exige
  // el propio gate STAFF/ADMIN/SUPPORT de cancelar_reserva cuando
  // CP04_ENFORCE_ROLE_GATES=true.
  const accionesReservas = [];
  for (const reserva of reservasFuturas.ok ? reservasFuturas.records : []) {
    if (!reserva.clave_reserva) continue;
    const cancelRequest = new Request(new URL("/api/reservas", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("Origin") || "",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify({ accion: "cancelar_reserva", clave_reserva: reserva.clave_reserva }),
    });
    try {
      const cancelResponse = await handleReservas(cancelRequest, env);
      const cancelBody = await cancelResponse.json().catch(() => null);
      accionesReservas.push({
        clave_reserva: reserva.clave_reserva,
        ok: cancelResponse.status === 200 && cancelBody?.ok === true,
        make_configurado: cancelBody?.make?.configured ?? null,
        status: cancelResponse.status,
      });
    } catch {
      accionesReservas.push({ clave_reserva: reserva.clave_reserva, ok: false, status: null });
    }
  }

  // Salir de lista de espera: el Worker no puede descubrir las posiciones
  // por su cuenta (sin tabla configurada), así que el admin las pasa
  // explícitamente tras revisarlas fuera del Worker. Se reutiliza
  // handleListaEspera("salir") sin modificarlo ni una línea.
  const listaEsperaSlots = Array.isArray(payload?.lista_espera_slots) ? payload.lista_espera_slots : [];
  const accionesListaEspera = [];
  for (const slot of listaEsperaSlots) {
    const salirRequest = new Request(new URL("/api/lista-espera", request.url).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: request.headers.get("Origin") || "",
      },
      body: JSON.stringify({
        accion: "salir",
        email: targetEmail,
        pista: slot?.pista,
        fecha: slot?.fecha,
        hora_inicio: slot?.hora_inicio,
        hora_fin: slot?.hora_fin,
      }),
    });
    try {
      const salirResponse = await handleListaEspera(salirRequest, env);
      const salirBody = await salirResponse.json().catch(() => null);
      accionesListaEspera.push({ slot, ok: salirResponse.status === 200 && salirBody?.ok !== false, status: salirResponse.status });
    } catch {
      accionesListaEspera.push({ slot, ok: false, status: null });
    }
  }

  const todasLasAcciones = [...accionesReservas, ...accionesListaEspera];
  const estadoFinal = todasLasAcciones.length === 0
    ? "EJECUTADO"
    : todasLasAcciones.every((a) => a.ok)
      ? "EJECUTADO"
      : todasLasAcciones.some((a) => a.ok)
        ? "PARCIAL"
        : "ERROR";

  const idSolicitud = crypto.randomUUID();
  const auditoria = await cp04GdprNotificarMake(env, {
    tipo: "GDPR_OLVIDO",
    id_solicitud: idSolicitud,
    estado: estadoFinal,
    email_titular: targetEmail,
    actor_resolutor: { email: auth.email, role: auth.role },
    acciones: { reservas: accionesReservas, lista_espera: accionesListaEspera },
    fecha_resolucion: new Date().toISOString(),
    origen: "APP_CLUB_PADEL_04",
  });

  cp04MarkIdempotentSuccess(idemKey);

  return jsonResponse(
    {
      ok: true,
      tipo: "GDPR_OLVIDO",
      estado: estadoFinal,
      titular: { email: targetEmail },
      solicitante: { email: auth.email, role: auth.role },
      acciones: { reservas: accionesReservas, lista_espera: accionesListaEspera },
      anonimizacion_historica: "REQUIERE_REVISION_HUMANA",
      auditoria,
    },
    200,
    headers
  );
}

// ─── BACKEND OMNICANAL (Chatbot Web + Telegram texto/audio) ──────────────────
//
// Único endpoint que normaliza mensajes libres de texto (web/Telegram) y
// transcripciones de audio (Telegram) hacia las acciones de reservas.
// NO llama al escenario Make/API Reservas como subscenario (incompatible):
// reutiliza internamente cp04FetchOcupadas y guía el resto a la UI.
//
// Orígenes soportados: "web" (Bearer JWT) | "telegram" / "telegram_audio"
// (X-CP04-Bot-Secret). WhatsApp: mismo contrato, sin código hoy.
//
// PENDIENTE E2E REAL CUANDO AIRTABLE VUELVA A ESTAR DISPONIBLE:
// crear_reserva, cancelar_reserva, reprogramar_reserva, consultar_reservas.

const BOOKING_HOURS_OMNI = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
const COURTS_OMNI = ["Pista 1","Pista 2","Pista 3","Pista 4"];
const TELEGRAM_ORIGINS = ["telegram", "telegram_audio"];

async function omniDisponibilidad(env, headers, fecha) {
  if (!fecha) {
    return jsonResponse({
      ok: true, action: OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD,
      reply: "¿Para qué fecha quieres ver la disponibilidad?\nEj: \"mañana\", \"el viernes\", \"2026-09-05\".",
      needs_more_info: true,
    }, 200, headers);
  }

  if (isSundayISO(fecha)) {
    return jsonResponse({
      ok: true, action: OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD,
      reply: `El ${fecha} es domingo. El club está cerrado los domingos.`,
      data: { fecha, cerrado: true },
    }, 200, headers);
  }

  const result = await cp04FetchOcupadas(env, fecha);

  if (!result.ok) {
    if (cp04IsAirtableRateLimited(result.status, JSON.stringify(result.details ?? result.reason ?? ""))) {
      return jsonResponse({
        ok: false, action: OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD,
        reply: "El sistema está temporalmente saturado. Inténtalo en unos minutos.",
      }, 503, headers);
    }
    return jsonResponse({
      ok: false, action: OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD,
      reply: "No he podido consultar la disponibilidad ahora mismo. Inténtalo más tarde.",
    }, 500, headers);
  }

  const ocupadas = result.ocupadas || [];
  const libres = [];
  for (const hora of BOOKING_HOURS_OMNI) {
    const pistasLibres = COURTS_OMNI.filter((p) => !cp04IsSlotOccupied(ocupadas, fecha, p, hora));
    if (pistasLibres.length > 0) libres.push(`${hora}: ${pistasLibres.join(", ")}`);
  }

  if (libres.length === 0) {
    return jsonResponse({
      ok: true, action: OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD,
      reply: `Para el ${fecha} todas las pistas están ocupadas.`,
      data: { fecha, libres: 0 },
    }, 200, headers);
  }

  return jsonResponse({
    ok: true, action: OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD,
    reply: `Disponibilidad para el ${fecha}:\n\n${libres.join("\n")}\n\n¿Quieres reservar algún horario?`,
    data: { fecha, libres: libres.length, slots: libres },
  }, 200, headers);
}

function omniCrearGuide(extracted, headers) {
  const missing = [];
  if (!extracted.fecha) missing.push("fecha (ej: \"el viernes\", \"2026-09-05\")");
  if (!extracted.hora) missing.push("hora (ej: \"a las 10\", \"11:00\")");
  if (!extracted.pista) missing.push("pista (Pista 1, 2, 3 o 4)");

  if (missing.length > 0) {
    return jsonResponse({
      ok: true, action: OMNI_ACTIONS.CREAR_RESERVA,
      reply: `Para crear una reserva necesito:\n${missing.map((m) => `• ${m}`).join("\n")}\n\nEj: "quiero Pista 2 el viernes a las 10"`,
      needs_more_info: true, missing_fields: missing,
    }, 200, headers);
  }

  // Todos los campos extraídos: guiar a confirmación real en la app.
  // PENDIENTE E2E REAL CUANDO AIRTABLE VUELVA A ESTAR DISPONIBLE.
  return jsonResponse({
    ok: true, action: OMNI_ACTIONS.CREAR_RESERVA,
    reply: `Entendido: ${extracted.pista} el ${extracted.fecha} a las ${extracted.hora}.\n\nConfirma la reserva en el módulo "Reservas" de la app para completarla.`,
    data: extracted, needs_confirmation: true,
  }, 200, headers);
}

function omniMutableGuide(action, redirectHint, label, headers) {
  return jsonResponse({
    ok: true, action,
    reply: `Para ${label}, accede al módulo correspondiente en la app. Desde aquí solo puedo consultar disponibilidad.`,
    redirect_hint: redirectHint,
  }, 200, headers);
}

async function handleOmniChat(request, env) {
  const headers = corsHeaders(request, env);

  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return jsonResponse({ ok: false, error: "Method not allowed" }, 405, headers);

  if (!cp04CheckChatRateLimit()) {
    return jsonResponse({
      ok: false, error: "RATE_LIMITED",
      reply: "Demasiadas solicitudes. Espera un momento antes de continuar.",
    }, 429, headers);
  }

  let body;
  try { body = await request.json(); } catch {
    return jsonResponse({ ok: false, error: "INVALID_JSON", reply: "Solicitud no válida." }, 400, headers);
  }

  const rawText = cleanText(body?.message || body?.transcription || "");
  const origin = cleanText(body?.origin || "web");
  const context = (body?.context && typeof body.context === "object") ? body.context : {};

  if (!rawText) {
    return jsonResponse({ ok: false, error: "MISSING_MESSAGE", reply: "¿En qué puedo ayudarte? Escribe tu consulta." }, 400, headers);
  }

  const VALID_ORIGINS = ["web", "telegram", "telegram_audio", "whatsapp"];
  if (!VALID_ORIGINS.includes(origin)) {
    return jsonResponse({ ok: false, error: "INVALID_ORIGIN" }, 400, headers);
  }

  // Auth: web → try Bearer JWT (no requerir para consultar_disponibilidad)
  // Telegram / audio → bot secret obligatorio
  let auth = null;
  if (TELEGRAM_ORIGINS.includes(origin) || origin === "whatsapp") {
    const botSecret = request.headers.get("X-CP04-Bot-Secret") || "";
    if (!env.CHATBOT_BOT_SECRET || botSecret !== env.CHATBOT_BOT_SECRET) {
      return jsonResponse({ ok: false, error: "UNAUTHORIZED" }, 401, headers);
    }
  } else {
    const gate = await requireAuth(request, env);
    if (gate.ok) auth = gate.auth;
  }

  const { action, extracted } = normalizeOmniInput(rawText);

  cp04LogTechnicalEvent({
    event: "omni_chat_request",
    action,
    code: "OMNI_CHAT",
    requestId: cp04GetRequestId(request),
    retryable: false,
    reserva_confirmada: false,
    origen: origin,
    detail: { hasDate: Boolean(extracted.fecha), hasTime: Boolean(extracted.hora) },
  });

  // Telegram: solo lectura — mutable actions → redirect to web
  if (TELEGRAM_ORIGINS.includes(origin) && ![OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD, OMNI_ACTIONS.DESCONOCIDA].includes(action)) {
    return jsonResponse({
      ok: true, action,
      reply: "Para gestionar reservas accede a la app web del club. Desde Telegram solo puedo consultar disponibilidad.",
      telegram_chat_id: context.telegram_chat_id || null,
    }, 200, headers);
  }

  if (action === OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD) {
    return await omniDisponibilidad(env, headers, extracted.fecha);
  }

  if (action === OMNI_ACTIONS.CONSULTAR_RESERVAS) {
    if (!auth) {
      return jsonResponse({
        ok: true, action,
        reply: "Para ver tus reservas necesitas iniciar sesión en la app.",
        authRequired: true,
      }, 200, headers);
    }
    // PENDIENTE E2E REAL CUANDO AIRTABLE VUELVA A ESTAR DISPONIBLE.
    return jsonResponse({
      ok: true, action,
      reply: "Consulta tus reservas en el módulo \"Gestión\" de la app (conectado en tiempo real a Airtable).",
      redirect_hint: "gestion",
    }, 200, headers);
  }

  if (action === OMNI_ACTIONS.CREAR_RESERVA) {
    if (!auth) {
      return jsonResponse({
        ok: true, action,
        reply: "Para crear una reserva necesitas iniciar sesión primero.",
        authRequired: true,
      }, 200, headers);
    }
    return omniCrearGuide(extracted, headers);
  }

  if (action === OMNI_ACTIONS.CANCELAR_RESERVA) {
    return omniMutableGuide(action, "cancelar", "cancelar una reserva", headers);
  }

  if (action === OMNI_ACTIONS.REPROGRAMAR_RESERVA) {
    return omniMutableGuide(action, "reprogramar", "reprogramar una reserva", headers);
  }

  return jsonResponse({
    ok: true, action: OMNI_ACTIONS.DESCONOCIDA,
    reply: "No he entendido tu consulta. Puedo ayudarte con:\n• Consultar disponibilidad (\"¿pistas libres el martes?\")\n• Ver reservas (\"mis reservas\")\n• Crear reserva (\"quiero Pista 2 el viernes a las 10\")\n• Cancelar o reprogramar (te dirijo a la sección correcta).",
  }, 200, headers);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
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

      if (
        url.pathname === "/api/jugadores/baja" ||
        url.pathname === "/jugadores/baja"
      ) {
        // Baja de jugador es operación de STAFF/ADMIN/SUPPORT, mismo gate
        // que Alta (ver comentario ahí y en handleReservas).
        if (
          request.method !== "OPTIONS" &&
          env.CP04_ENFORCE_ROLE_GATES === "true"
        ) {
          const gate = await requireRoles(request, env, ["STAFF", "ADMIN", "SUPPORT"]);

          if (!gate.ok) {
            return jsonResponse(gate.body, gate.status, corsHeaders(request, env));
          }
        }

        return await handleBajaJugador(request, env);
      }

      if (
        url.pathname === "/api/pistas/cierre-temporal" ||
        url.pathname === "/pistas/cierre-temporal"
      ) {
        // Cierre temporal de pista es operación de STAFF/ADMIN/SUPPORT,
        // mismo gate que Alta/Baja de jugador (ver comentario ahí y en
        // handleReservas).
        if (
          request.method !== "OPTIONS" &&
          env.CP04_ENFORCE_ROLE_GATES === "true"
        ) {
          const gate = await requireRoles(request, env, ["STAFF", "ADMIN", "SUPPORT"]);

          if (!gate.ok) {
            return jsonResponse(gate.body, gate.status, corsHeaders(request, env));
          }
        }

        return await handleCierreTemporalPista(request, env);
      }

      if (
        url.pathname === "/api/lista-espera" ||
        url.pathname === "/lista-espera"
      ) {
        // Apuntarse/salir de la lista de espera de pista es una acción de
        // autoservicio del jugador, igual de abierta que crear_reserva (sin
        // gate de rol): cualquiera puede apuntarse a esperar un slot.
        return await handleListaEspera(request, env);
      }

      if (url.pathname.startsWith("/api/auth/")) {
      return handleAuthRoute(request, env, url);
    }

    if (url.pathname === "/api/chat") {
      return await handleOmniChat(request, env);
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
          env
        );
      }

      // QR Acceso — Generación (Make 6244975) y Control (Make 5291559)
      if (
        url.pathname === "/api/qr/generate" ||
        url.pathname === "/qr/generate"
      ) {
        let qrGenerateAuth = null;
        if (request.method !== "OPTIONS" && env.CP04_ENFORCE_ROLE_GATES === "true") {
          const gate = await requireRoles(request, env, QR_GENERATE_ROLES);
          if (!gate.ok) return jsonResponse(gate.body, gate.status, corsHeaders(request, env));
          qrGenerateAuth = gate.auth;
        }
        return await handleQrGenerate(request, env, qrGenerateAuth);
      }

      if (
        url.pathname === "/api/qr/validate" ||
        url.pathname === "/qr/validate"
      ) {
        if (request.method !== "OPTIONS" && env.CP04_ENFORCE_ROLE_GATES === "true") {
          const gate = await requireRoles(request, env, QR_VALIDATE_ROLES);
          if (!gate.ok) return jsonResponse(gate.body, gate.status, corsHeaders(request, env));
        }
        return await handleQrValidate(request, env);
      }

      // ⚖️ Solicitud GDPR Acceso u Olvido de Datos (flujo #9, Make 6323457).
      // Sin gate condicional a CP04_ENFORCE_ROLE_GATES a propósito: ambos
      // handlers exigen requireAuth ellos mismos, siempre, por exponer PII
      // (mismo criterio que GET /api/reservas más arriba).
      if (
        url.pathname === "/api/gdpr/acceso" ||
        url.pathname === "/gdpr/acceso"
      ) {
        return await handleGdprAcceso(request, env);
      }

      if (
        url.pathname === "/api/gdpr/olvido" ||
        url.pathname === "/gdpr/olvido"
      ) {
        return await handleGdprOlvido(request, env);
      }

      return jsonResponse(
        { ok: false, error: "Not found" },
        404,
        corsHeaders(request, env)
      );
    } catch (error) {
      // No reenviar error?.message (puede incluir detalles internos) a un
      // cliente anónimo: solo se loguea server-side, sin datos personales.
      cp04LogTechnicalEvent({
        event: "worker_unhandled_error",
        action: null,
        code: "INTERNAL_ERROR",
        requestId: cp04GetRequestId(request),
        retryable: false,
        reserva_confirmada: false,
        origen: "worker_fetch",
        detail: { message: String(error?.message || error) },
      });
      return jsonResponse(
        {
          ok: false,
          error: "Internal server error",
        },
        500,
        corsHeaders(request, env)
      );
    }
  }
};
