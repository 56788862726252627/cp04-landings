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

// Bloque BOOKING_HOURS (2026-08-13): antes dejaba fuera 13:00-16:00 (hueco
// de mediodía). App.jsx ya amplió su propia constante equivalente al mismo
// horario continuo 08:00-22:00 (ver src/App.jsx:121) — esta lista debe
// permanecer idéntica a esa, valor por valor, para que ninguna hora que la
// UI ofrezca como reservable sea rechazada aquí con "Hora invalida."
// (crear_reserva, validatePayload más abajo). reprogramar_reserva no usa
// esta lista (solo valida formato HH:MM, ver el bloque `accion ===
// "reprogramar_reserva"`), así que no necesitaba cambio.
const BOOKING_HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00"];
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

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = (env.ALLOWED_ORIGIN || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const isAllowedOrigin = allowedOrigins.includes(origin);
const corsOrigin = isAllowedOrigin ? origin : allowedOrigins[0] || "";

  if (!isAllowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": corsOrigin,
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

// Consulta compartida de slots ocupados en Airtable para una fecha, con el
// mismo filtro (fecha + estado activo) que ya usaba handleDisponibilidad.
// Extraída para poder reutilizarla también en la revalidación de
// handleReservas, sin duplicar la query. `ok:false` cubre tanto "Airtable
// no configurado" como errores de red/HTTP: en ningún caso lanza, siempre
// devuelve un resultado que el llamador decide cómo tratar.
// FASE 2 (2026-08-12, "bloqueo real de disponibilidad"): un cierre
// temporal ACTIVO con bloquear_reservas=true debe ocupar los mismos slots
// que ya usa /api/disponibilidad y la revalidación de /api/reservas, sin
// tocar su formato (`clave_slot` = `fecha|pista|hora`) ni a sus
// consumidores (cp04IsSlotOccupied, handleDisponibilidad, handleReservas)
// -- se fusiona en el mismo array `ocupadas`, así que ningún llamador
// existente necesita cambiar para quedar protegido.

// Suma minutos a una hora "HH:MM" (formato ya usado en todo el sistema).
// Sin gestión de cruce de día más allá de un modulo 24h simple -- el
// último inicio posible (22:00) + la duración máxima (120 min) = 24:00
// exacto, nunca cruza a un dia siguiente real dentro de BOOKING_HOURS.
export function cp04AddMinutesToHora(hora, minutos) {
  const [h, m] = String(hora).split(":").map(Number);
  const total = h * 60 + m + Number(minutos);
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// Intersección real de intervalos (misma fórmula ya diseñada y aprobada:
// reserva_inicio < cierre_fin AND reserva_fin > cierre_inicio), adaptada a
// datetime completo para que un cierre multi-día se compare correctamente
// sin importar si `slot.fecha` es su primer, último o un día intermedio.
// Toques exactos en el límite (una reserva que termina justo cuando
// empieza el cierre, o que empieza justo cuando termina) NO se consideran
// solape -- son adyacentes, no se pisan.
export function cp04CierreBloqueaSlot(cierre, slot) {
  if (!cierre || !slot) return false;

  const mismaPista = cierre.pista === "todas" || cierre.pista === slot.pista;
  if (!mismaPista) return false;

  const cierreFechaInicio = String(cierre.fecha_inicio || "").slice(0, 10);
  const cierreFechaFin = String(cierre.fecha_fin || "").slice(0, 10);

  const cierreInicioMs = Date.parse(`${cierreFechaInicio}T${cierre.hora_inicio}:00`);
  const cierreFinMs = Date.parse(`${cierreFechaFin}T${cierre.hora_fin}:00`);
  const reservaInicioMs = Date.parse(`${slot.fecha}T${slot.horaInicio}:00`);
  const reservaFinMs = Date.parse(`${slot.fecha}T${slot.horaFin}:00`);

  if ([cierreInicioMs, cierreFinMs, reservaInicioMs, reservaFinMs].some(Number.isNaN)) {
    return false;
  }

  return reservaInicioMs < cierreFinMs && reservaFinMs > cierreInicioMs;
}

// Consulta persistente (Airtable, tabla CIERRES_TEMPORALES) de cierres
// ACTIVOS + bloquear_reservas=true cuya ventana incluye `fecha`. Filtrar
// por fecha en la propia fórmula excluye de forma natural los cierres ya
// expirados respecto a esa fecha (requisito C) sin necesitar un job
// aparte que reescriba `estado` a FINALIZADO.
export async function cp04FetchCierresActivos(env, fecha) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_CIERRES_TABLE_ID) {
    return { ok: false, reason: "not_configured" };
  }

  const formula =
    `AND({estado}='ACTIVO', {bloquear_reservas}=TRUE(), ` +
    `{fecha_inicio}<=DATETIME_PARSE('${fecha}','YYYY-MM-DD'), ` +
    `{fecha_fin}>=DATETIME_PARSE('${fecha}','YYYY-MM-DD'))`;

  const url =
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_CIERRES_TABLE_ID}` +
    `?filterByFormula=${encodeURIComponent(formula)}` +
    `&fields%5B%5D=pista&fields%5B%5D=fecha_inicio&fields%5B%5D=hora_inicio` +
    `&fields%5B%5D=fecha_fin&fields%5B%5D=hora_fin`;

  let airtableRes;
  try {
    airtableRes = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
    });
  } catch {
    return { ok: false, reason: "network_error" };
  }

  const data = await airtableRes.json().catch(() => null);

  if (!airtableRes.ok) {
    return { ok: false, reason: "airtable_error", status: airtableRes.status, details: data };
  }

  const records = data?.records || [];
  const cierres = records.map((record) => ({
    pista: record.fields?.pista || null,
    fecha_inicio: record.fields?.fecha_inicio || null,
    hora_inicio: record.fields?.hora_inicio || null,
    fecha_fin: record.fields?.fecha_fin || null,
    hora_fin: record.fields?.hora_fin || null,
  }));

  return { ok: true, cierres };
}

// Expande la lista de cierres activos a claves `fecha|pista|hora` en el
// mismo formato que ya usa `ocupadas`. Comprueba con la duración MÁXIMA
// (BOOKING_DURATIONS, 120 min) como ventana de reserva candidata: es la
// comprobación más conservadora (si una reserva de 120 min no solapa,
// ninguna duración más corta empezando a la misma hora solapa tampoco),
// para que /api/disponibilidad nunca muestre como libre un hueco que
// después sería rechazado al confirmar.
export function cp04ClaveSlotsBloqueadosPorCierres(cierres, fecha) {
  if (!Array.isArray(cierres) || !cierres.length) return [];

  const duracionMaxima = Math.max(...BOOKING_DURATIONS);
  const bloqueadas = [];

  for (const cierre of cierres) {
    const pistasAfectadas = cierre.pista === "todas" ? COURTS : [cierre.pista];
    for (const pista of pistasAfectadas) {
      for (const hora of BOOKING_HOURS) {
        const horaFin = cp04AddMinutesToHora(hora, duracionMaxima);
        if (cp04CierreBloqueaSlot(cierre, { pista, fecha, horaInicio: hora, horaFin })) {
          bloqueadas.push(`${fecha}|${pista}|${hora}`);
        }
      }
    }
  }

  return bloqueadas;
}

export async function cp04FetchOcupadas(env, fecha) {
  const cached = cp04GetCachedAvailability(fecha);
  if (cached) return cached;

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
    return { ok: false, reason: "not_configured" };
  }

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
    return { ok: false, reason: "network_error" };
  }

  const data = await airtableRes.json().catch(() => null);

  if (!airtableRes.ok) {
    return { ok: false, reason: "airtable_error", status: airtableRes.status, details: data };
  }

  const records = data?.records || [];
  const ocupadasReservas = records.map((record) => record.fields?.clave_slot).filter(Boolean);

  // Cierres temporales: mismo criterio "fail-open" ya establecido arriba
  // para las propias reservas (si Airtable no responde, no se bloquea el
  // sistema entero) -- si no se puede leer CIERRES_TEMPORALES, se degrada
  // a "sin cierres conocidos" en vez de fallar toda la disponibilidad.
  // Nota: si el storage de cierres no está configurado, Fase 1 tampoco
  // permite CREAR ningún cierre (mismas variables de entorno), así que
  // "no configurado" nunca puede ocultar un cierre real que sí exista.
  const cierresResult = await cp04FetchCierresActivos(env, fecha);
  const ocupadasCierres = cierresResult.ok
    ? cp04ClaveSlotsBloqueadosPorCierres(cierresResult.cierres, fecha)
    : [];

  if (!cierresResult.ok && cierresResult.reason !== "not_configured") {
    cp04LogTechnicalEvent({
      event: "cierres_fetch_failed",
      action: "disponibilidad",
      code: cierresResult.reason,
      retryable: true,
      detail: "No se pudieron leer cierres temporales activos; disponibilidad calculada solo con reservas.",
    });
  }

  const ocupadas = Array.from(new Set([...ocupadasReservas, ...ocupadasCierres]));

  const result = { ok: true, records, ocupadas };
  cp04SetCachedAvailability(fecha, result);
  return result;
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

// AUDITORÍA 2026-08-02 (audit/make-50-operational-readiness-20260802/):
// handleAltaJugador no tenía ninguna protección de duplicados (hallazgo
// confirmado por test: worker-reservas/src/alta-jugador-e2e.test.mjs,
// "reenvía dos veces el mismo payload"). Reutiliza el mismo mecanismo ya
// probado de cp04IsIdempotentDuplicate/cp04MarkIdempotentSuccess que usa
// handleReservas — no un adaptador nuevo. Clave = email + teléfono
// normalizados (suficiente para distinguir un alta de otra, sin incluir
// nombre/apellidos en la clave).
export function cp04BuildAltaJugadorIdempotencyKey(normalized) {
  const email = cleanText(normalized?.email).toLowerCase();
  const telefono = cleanText(normalized?.telefono).replace(/\D/g, "");
  return `alta_jugador|${email}|${telefono}`;
}

// Mismo hallazgo y misma corrección que Alta de Jugador (ver más arriba),
// aplicado a Baja de Jugador — réplica deliberada del mismo patrón.
export function cp04BuildBajaJugadorIdempotencyKey(normalized) {
  const email = cleanText(normalized?.email).toLowerCase();
  const telefono = cleanText(normalized?.telefono).replace(/\D/g, "");
  return `baja_jugador|${email}|${telefono}`;
}

// AUDITORÍA 2026-08-02 (audit/make-50-operational-readiness-20260802/06-BLOCKERS.md,
// hallazgo pendiente de Oleada 1): mismo patrón aplicado a Cierre Temporal
// de Pistas. Aquí no hay email/teléfono — la identidad de la operación es
// "qué pista, en qué ventana exacta" (mismo criterio que crear_reserva:
// fecha+pista+hora), no quién la solicita.
export function cp04BuildCierreTemporalPistaIdempotencyKey(normalized) {
  return `cierre_temporal_pista|${normalized?.pista}|${normalized?.fecha_inicio}|${normalized?.hora_inicio}|${normalized?.fecha_fin}|${normalized?.hora_fin}`;
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

// Mismo criterio que cp04BuildIdempotentDuplicateResponse, adaptado a Alta
// de Jugador: `alta_confirmada` (no `reserva_confirmada`) siempre false por
// el mismo motivo — el Worker nunca sabe si Make terminó de procesar el
// alta original.
export function cp04BuildAltaJugadorIdempotentDuplicateResponse() {
  return {
    ok: false,
    code: "IDEMPOTENT_DUPLICATE",
    duplicated: true,
    retryable: false,
    alta_confirmada: false,
    message: CP04_IDEMPOTENT_DUPLICATE_USER_MESSAGE,
  };
}

// Misma forma, adaptada a Baja de Jugador (`baja_confirmada`).
export function cp04BuildBajaJugadorIdempotentDuplicateResponse() {
  return {
    ok: false,
    code: "IDEMPOTENT_DUPLICATE",
    duplicated: true,
    retryable: false,
    baja_confirmada: false,
    message: CP04_IDEMPOTENT_DUPLICATE_USER_MESSAGE,
  };
}

// Misma forma, adaptada a Cierre Temporal de Pistas (`cierre_confirmado`).
export function cp04BuildCierreTemporalPistaIdempotentDuplicateResponse() {
  return {
    ok: false,
    code: "IDEMPOTENT_DUPLICATE",
    duplicated: true,
    retryable: false,
    cierre_confirmado: false,
    message: CP04_IDEMPOTENT_DUPLICATE_USER_MESSAGE,
  };
}

// FASE 1 (auditoria "Worker = fuente de verdad" del Cierre Temporal de
// Pistas, 2026-08-12): persistencia real en Airtable, tabla dedicada
// CIERRES_TEMPORALES (todavia no creada en produccion -- ver
// AIRTABLE_CIERRES_TABLE_ID mas abajo, ausente a proposito en esta fase).
// Mientras esa tabla no exista/estas variables no esten configuradas, el
// endpoint responde 503 de forma segura, igual que ya hace con el webhook
// de Make -- nunca finge persistencia que no ocurrio.
//
// Normaliza el registro crudo que devuelve la API de Airtable (forma
// {id, fields, createdTime}) a un objeto plano y estable, para no acoplar
// el resto del codigo a la forma exacta de la respuesta de Airtable.
export function cp04NormalizeCierreRecord(airtableRecord) {
  const fields = airtableRecord?.fields || {};
  return {
    airtable_record_id: airtableRecord?.id || null,
    id_cierre: fields.ID_cierre || null,
    clave_idempotente: fields.clave_idempotente || null,
    estado: fields.estado || null,
    pista: fields.pista || null,
    fecha_inicio: fields.fecha_inicio || null,
    hora_inicio: fields.hora_inicio || null,
    fecha_fin: fields.fecha_fin || null,
    hora_fin: fields.hora_fin || null,
    motivo: fields.motivo || null,
    observaciones: fields.observaciones || "",
    creado_por: fields.creado_por || null,
    rol_origen: fields.rol_origen || null,
    notify_players: fields.notify_players === true,
    bloquear_reservas: fields.bloquear_reservas !== false,
    created_at: fields.created_at || null,
    updated_at: fields.updated_at || null,
    cancelled_at: fields.cancelled_at || null,
  };
}

// Busqueda persistente (autoritativa, sobrevive reinicios de Worker y
// nuevas instancias de Cloudflare) de un cierre ya ACTIVO con la misma
// clave de idempotencia. `ok:false` cubre tanto "storage no configurado"
// como fallo de red/Airtable -- en ningun caso se trata como "encontrado":
// el llamador decide si continuar el intento de creacion o no.
export async function cp04FindCierreActivoPersistido(env, claveIdempotente) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_CIERRES_TABLE_ID) {
    return { ok: false, reason: "not_configured" };
  }
  if (!claveIdempotente) {
    return { ok: false, reason: "invalid_key" };
  }

  const formula = `AND({clave_idempotente}='${claveIdempotente}', {estado}='ACTIVO')`;
  const url =
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_CIERRES_TABLE_ID}` +
    `?filterByFormula=${encodeURIComponent(formula)}&maxRecords=1`;

  let airtableRes;
  try {
    airtableRes = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
    });
  } catch {
    return { ok: false, reason: "network_error" };
  }

  const data = await airtableRes.json().catch(() => null);

  if (!airtableRes.ok) {
    return { ok: false, reason: "airtable_error", status: airtableRes.status, details: data };
  }

  const record = data?.records?.[0] || null;
  return {
    ok: true,
    found: Boolean(record),
    record: record ? cp04NormalizeCierreRecord(record) : null,
  };
}

// Crea el registro real del cierre en Airtable. `estado` siempre nace en
// "ACTIVO" y `bloquear_reservas` siempre en `true` -- un cierre creado ya
// bloquea, sin depender de que Make (mas adelante, solo notificacion)
// llegue a procesarlo. `ID_cierre` se genera de forma deterministica a
// partir de la fecha de inicio y la huella de la clave de idempotencia
// (cp04HashIdempotencyKey, ya usado para logs tecnicos) -- legible y
// estable, sin depender de un autonumber de Airtable.
export async function cp04CreateCierreTemporal(env, normalized, claveIdempotente) {
  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE_ID || !env.AIRTABLE_CIERRES_TABLE_ID) {
    return { ok: false, reason: "not_configured" };
  }

  const motivoAirtable = cp04MotivoCierreToAirtableLabel(normalized.motivo);
  if (!motivoAirtable) {
    // Defensa en profundidad: con la validación previa de
    // CIERRE_MOTIVOS_VALIDOS esto no debería ser alcanzable nunca, pero
    // si lo fuera, nunca se escribe un motivo sin traducir a Airtable.
    return { ok: false, reason: "invalid_motivo" };
  }

  const nowIso = new Date().toISOString();
  const idCierre = `CIERRE-${String(normalized.fecha_inicio).replace(/-/g, "")}-${cp04HashIdempotencyKey(claveIdempotente)}`;

  const fields = {
    ID_cierre: idCierre,
    clave_idempotente: claveIdempotente,
    estado: "ACTIVO",
    pista: normalized.pista,
    fecha_inicio: normalized.fecha_inicio,
    hora_inicio: normalized.hora_inicio,
    fecha_fin: normalized.fecha_fin,
    hora_fin: normalized.hora_fin,
    motivo: motivoAirtable,
    observaciones: normalized.observaciones || "",
    creado_por: normalized.creado_por,
    rol_origen: normalized.rol_origen,
    notify_players: normalized.notify_players === true,
    bloquear_reservas: true,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const url = `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${env.AIRTABLE_CIERRES_TABLE_ID}`;

  let airtableRes;
  try {
    airtableRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, typecast: true }),
    });
  } catch {
    return { ok: false, reason: "network_error" };
  }

  const data = await airtableRes.json().catch(() => null);

  if (!airtableRes.ok) {
    return { ok: false, reason: "airtable_error", status: airtableRes.status, details: data };
  }

  return { ok: true, record: cp04NormalizeCierreRecord(data) };
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

  // Cancelar/reprogramar son operaciones de staff según la matriz RBAC
  // (CP04_AUTH_PERMISSIONS): PLAYER no las tiene. El gate está implementado
  // y listo, pero permanece detrás de CP04_ENFORCE_ROLE_GATES porque el
  // login demo por contraseña de rol no emite ningún token verificable en
  // servidor todavía: activarlo hoy sin más rompería el tutorial guiado de
  // STAFF/ADMIN/SUPPORT. Ver informe de auditoría para la decisión pendiente.
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

  const normalizedPayload = normalizePayload(payload);

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

  // Idempotencia: mismo criterio que handleReservas (PASO 06D) — el marcado
  // de éxito ocurre solo tras un reenvío real con ok:true, nunca aquí, para
  // no bloquear un reintento legítimo si esta solicitud termina en error.
  const idempotencyKey = cp04BuildAltaJugadorIdempotencyKey(normalized);
  if (cp04IsIdempotentDuplicate(idempotencyKey)) {
    cp04LogTechnicalEvent({
      event: "idempotent_duplicate",
      action: "alta_jugador",
      code: "IDEMPOTENT_DUPLICATE",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: false,
      reserva_confirmada: false,
      origen: "idempotencia",
    });
    return jsonResponse(cp04BuildAltaJugadorIdempotentDuplicateResponse(), 409, headers);
  }

  let makeResponse;

  try {
    makeResponse = await fetch(env.MAKE_ALTA_JUGADOR_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalized),
    });
  } catch {
    // Fallo real de red hacia Make (no una respuesta HTTP de Make): antes
    // de este cambio, un fetch() sin resolver aquí dejaba la petición
    // colgada sin cabeceras CORS ni respuesta, y el frontend se quedaba
    // "cargando" indefinidamente en vez de recibir un error controlado.
    return jsonResponse(
      { ok: false, error: "Make unreachable" },
      502,
      headers
    );
  }

  const responseText = await makeResponse.text();

  if (!makeResponse.ok) {
    // 409 PLAYER_ALREADY_EXISTS es un resultado empresarial controlado de Make
    // (el jugador ya existe y está activo): se preserva el código de negocio
    // en vez de convertirlo en un error técnico genérico 502. Cualquier otro
    // status no-2xx de Make sí es un fallo técnico (502).
    if (makeResponse.status === 409) {
      let makeData = null;
      try { makeData = JSON.parse(responseText); } catch { /* passthrough */ }

      if (
        makeData?.status === "PLAYER_ALREADY_EXISTS" ||
        // Fallback para body malformado (p.ej. objeto Airtable embebido en
        // string JSON rompe el parser): si el JSON no pudo parsearse o no
        // tiene un status utilizable, se comprueba la cadena exacta en el
        // texto crudo antes de clasificar como PLAYER_ALREADY_EXISTS.
        (makeData?.status == null && responseText.includes('"PLAYER_ALREADY_EXISTS"'))
      ) {
        return jsonResponse(
          {
            ok: false,
            code: "PLAYER_ALREADY_EXISTS",
            message: "Este jugador ya está registrado y activo.",
            player_id: makeData?.player_id || makeData?.ID_Jugador || null,
            email_jugador: makeData?.email_jugador || null,
          },
          409,
          headers
        );
      }
    }

    // 400 con body empresarial de Make (módulo 150 "VALIDATION_ERROR"):
    // mismo patrón que el bloque 5xx — se preserva el mensaje empresarial y el
    // HTTP 400 original en vez de enmascararlo como 502 genérico.
    if (makeResponse.status === 400) {
      let make4xxData = null;
      try { make4xxData = JSON.parse(responseText); } catch { /* passthrough */ }

      if (
        make4xxData?.ok === false &&
        typeof make4xxData?.message === "string" &&
        make4xxData.message.length > 0
      ) {
        return jsonResponse(
          {
            ok: false,
            code: make4xxData.status || "VALIDATION_ERROR",
            message: make4xxData.message,
            request_id: make4xxData.request_id || null,
          },
          400,
          headers
        );
      }
    }

    // 5xx con body empresarial de Make (p.ej. módulo 140 "Estado no reconocido"):
    // se preserva el mensaje y el código HTTP original en vez de enmascararlo
    // como 502 genérico. Guardia estricta: exige ok===false y message no vacío
    // para evitar promover errores técnicos inesperados a mensajes de negocio.
    if (makeResponse.status >= 500) {
      let make5xxData = null;
      try { make5xxData = JSON.parse(responseText); } catch { /* passthrough */ }

      if (
        make5xxData?.ok === false &&
        typeof make5xxData?.message === "string" &&
        make5xxData.message.length > 0
      ) {
        return jsonResponse(
          {
            ok: false,
            code: make5xxData.status || "MAKE_ERROR",
            message: make5xxData.message,
            request_id: make5xxData.request_id || null,
          },
          makeResponse.status,
          headers
        );
      }
    }

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

  cp04MarkIdempotentSuccess(idempotencyKey);

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

  const idempotencyKey = cp04BuildBajaJugadorIdempotencyKey(normalized);
  if (cp04IsIdempotentDuplicate(idempotencyKey)) {
    cp04LogTechnicalEvent({
      event: "idempotent_duplicate",
      action: "baja_jugador",
      code: "IDEMPOTENT_DUPLICATE",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: false,
      reserva_confirmada: false,
      origen: "idempotencia",
    });
    return jsonResponse(cp04BuildBajaJugadorIdempotentDuplicateResponse(), 409, headers);
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

  cp04MarkIdempotentSuccess(idempotencyKey);

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

// PASO 07E (2026-07-19): Cierre Temporal de Pistas — mismo gate RBAC
// STAFF/ADMIN/SUPPORT que Alta/Baja de Jugador.
//
// FASE 1 (2026-08-12, auditoría "Worker = fuente de verdad"): el Worker
// dejó de ser un simple reenviador a Make. Ahora persiste el cierre en
// Airtable (tabla CIERRES_TEMPORALES, ver AIRTABLE_CIERRES_TABLE_ID) ANTES
// de notificar — un cierre creado ya está `estado:"activo"` y bloqueando
// de verdad, sin depender de que Make lo procese. Make pasa a ser
// exclusivamente notificación best-effort (scenario 5791133): si falla o
// el webhook no está configurado, el cierre NUNCA se deshace, y la
// respuesta lo refleja con honestidad (`notificacion_make:false` +
// `aviso`) en vez de fingir un fallo total. Mientras
// AIRTABLE_CIERRES_TABLE_ID no exista (tabla aún no creada en
// producción), el endpoint responde 503 "Cierre temporal storage not
// configured" de forma segura, sin inventar persistencia que no ocurrió —
// mismo criterio de "nunca confirmar sin respaldo real" que ya regía
// antes para el webhook de Make.
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

// FASE 2 · corrección hallazgo K.1 (2026-08-12): el contrato público
// (frontend, validación, CIERRE_MOTIVOS_VALIDOS de arriba) sigue en
// minúsculas a propósito -- no se toca, cero motivo para romper algo que
// ya funciona. El campo Single select real de CIERRES_TEMPORALES en
// Airtable usa las mismas 9 palabras pero con la inicial en mayúscula.
// Este mapa es una tabla CERRADA y explícita (no una capitalización
// genérica): solo estos 9 valores exactos se traducen; cualquier otra
// cosa (que ya no debería llegar aquí, dado que la validación de arriba
// la rechazaría antes) devuelve null en vez de inventar una etiqueta
// nueva -- así nunca se le puede colar a Airtable una opción arbitraria
// vía `typecast: true`.
const CIERRE_MOTIVO_AIRTABLE_LABEL = {
  mantenimiento: "Mantenimiento",
  lluvia: "Lluvia",
  evento: "Evento",
  torneo: "Torneo",
  limpieza: "Limpieza",
  obra: "Obra",
  incidencia: "Incidencia",
  administrativo: "Administrativo",
  otro: "Otro",
};

// Traduce el motivo interno (ya validado contra CIERRE_MOTIVOS_VALIDOS) a
// la etiqueta exacta del Single select real de Airtable. `null` si el
// valor no está en la tabla cerrada de arriba -- nunca capitaliza a
// ciegas ni deja pasar un valor no reconocido.
export function cp04MotivoCierreToAirtableLabel(motivoInterno) {
  return CIERRE_MOTIVO_AIRTABLE_LABEL[motivoInterno] ?? null;
}

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

  const idempotencyKey = cp04BuildCierreTemporalPistaIdempotencyKey(normalized);

  // Deduplicacion rapida en memoria (mismo isolate, TTL 3 min) -- optimizacion
  // de latencia para el caso comun de doble-clic/reintento inmediato. La
  // garantia real de "no crear dos veces el mismo cierre" es la busqueda
  // persistente de abajo, que sobrevive reinicios y nuevas instancias.
  if (cp04IsIdempotentDuplicate(idempotencyKey)) {
    cp04LogTechnicalEvent({
      event: "idempotent_duplicate",
      action: "cierre_temporal_pista",
      code: "IDEMPOTENT_DUPLICATE",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: false,
      reserva_confirmada: false,
      origen: "idempotencia",
    });
    return jsonResponse(cp04BuildCierreTemporalPistaIdempotentDuplicateResponse(), 409, headers);
  }

  // Busqueda persistente en Airtable. `existing.ok===false` (storage no
  // configurado o fallo de red) NO se trata como duplicado -- no bloquear
  // una creacion legitima solo porque la comprobacion de duplicados fallo;
  // si el problema es real, la creacion de abajo tambien fallara y se
  // reportara con su propio error.
  const existing = await cp04FindCierreActivoPersistido(env, idempotencyKey);
  if (existing.ok && existing.found) {
    cp04LogTechnicalEvent({
      event: "idempotent_duplicate",
      action: "cierre_temporal_pista",
      code: "IDEMPOTENT_DUPLICATE",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: false,
      reserva_confirmada: false,
      origen: "idempotencia_persistida",
    });
    cp04MarkIdempotentSuccess(idempotencyKey);
    return jsonResponse(cp04BuildCierreTemporalPistaIdempotentDuplicateResponse(), 409, headers);
  }

  const created = await cp04CreateCierreTemporal(env, normalized, idempotencyKey);

  if (!created.ok) {
    if (created.reason === "not_configured") {
      return jsonResponse(
        { ok: false, error: "Cierre temporal storage not configured" },
        503,
        headers
      );
    }
    // Hallazgo 2026-08-12 (E2E real -> 502 "No se pudo registrar el
    // cierre"): esta rama descartaba created.status/created.details sin
    // dejar rastro alguno, imposibilitando diagnosticar un fallo real de
    // Airtable despues del hecho. Se registra server-side (nunca al
    // cliente, mismo criterio que cp04FetchOcupadas/handleDisponibilidad
    // con disponibilidad.details) el tipo/mensaje de error de Airtable si
    // vienen en el body, sin loguear AIRTABLE_TOKEN ni el payload
    // completo con datos personales.
    cp04LogTechnicalEvent({
      event: "cierre_temporal_persist_failed",
      action: "cierre_temporal_pista",
      code: created.reason || "unknown",
      requestId: cp04GetRequestId(request),
      idempotencyKeyHash: cp04HashIdempotencyKey(idempotencyKey),
      retryable: created.reason === "network_error",
      reserva_confirmada: false,
      origen: "cierre_temporal_persistencia",
      detail: {
        reason: created.reason ?? null,
        status: created.status ?? null,
        airtableErrorType: created.details?.error?.type ?? null,
        airtableErrorMessage: created.details?.error?.message ?? null,
      },
    });
    return jsonResponse(
      { ok: false, error: "No se pudo registrar el cierre" },
      502,
      headers
    );
  }

  // A partir de aqui el cierre YA esta persistido y activo -- bloquea de
  // verdad (ver Fase 2, disponibilidad). Make pasa a ser exclusivamente
  // notificacion best-effort: si falla o no esta configurado, el cierre
  // NUNCA se deshace ni se revierte, y la respuesta lo refleja con
  // honestidad en vez de fingir un fallo total.
  cp04MarkIdempotentSuccess(idempotencyKey);

  let notificacionMake = false;
  let makeResponseText = null;

  if (env.MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK) {
    try {
      const makeResponse = await fetch(env.MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...normalized, cierre_id: created.record.id_cierre }),
      });
      makeResponseText = await makeResponse.text();
      notificacionMake = makeResponse.ok;
    } catch {
      notificacionMake = false;
    }
  }

  const responseBody = {
    ok: true,
    estado: "activo",
    cierre_id: created.record.id_cierre,
    notificacion_make: notificacionMake,
    makeResponse: makeResponseText,
  };

  if (!notificacionMake) {
    responseBody.aviso = "El cierre ya está activo; la notificación no pudo enviarse.";
  }

  return jsonResponse(responseBody, 200, headers);
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

const CP04_SUPABASE_MSG_MAP = {
  "invalid login credentials": "Credenciales incorrectas. Verifica tu email y contraseña.",
  "email not confirmed": "Cuenta pendiente de confirmación. Revisa tu correo y confirma tu dirección antes de iniciar sesión.",
  "user already registered": "Este correo ya está registrado. Prueba a iniciar sesión.",
  "password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres.",
  "signup requires a valid password": "La contraseña introducida no es válida.",
  "user not found": "No se encontró un usuario con ese correo.",
  "email rate limit exceeded": "Se han enviado demasiados intentos. Espera unos minutos antes de volver a intentarlo.",
  "token has expired or is invalid": "El enlace ha caducado o no es válido. Solicita uno nuevo.",
  "for security purposes, you can only request this once every 60 seconds": "Por seguridad, espera al menos 60 segundos antes de solicitar otro correo.",
};

function cp04TranslateSupabaseMsg(msg) {
  if (!msg) return msg;
  const key = String(msg).toLowerCase().trim();
  for (const [pattern, translation] of Object.entries(CP04_SUPABASE_MSG_MAP)) {
    if (key.includes(pattern)) return translation;
  }
  return msg;
}

function cp04SupabaseErrorResponse(request, env, result, fallbackMessage = "Error de autenticación.") {
  const rawMsg = result?.data?.msg || result?.data?.message;
  return jsonResponse(
    {
      ok: false,
      auth_ready: true,
      provider: "supabase",
      error: result?.data?.error || result?.data?.error_description || "SUPABASE_AUTH_ERROR",
      message: cp04TranslateSupabaseMsg(rawMsg) || fallbackMessage,
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
        email_redirect_to: String(env.APP_PUBLIC_URL || "").replace(/\/+$/, "") + "/",
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
          env
        );
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
