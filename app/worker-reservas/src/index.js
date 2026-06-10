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

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = env.ALLOWED_ORIGIN || "";

  if (!allowedOrigin || origin !== allowedOrigin) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function validatePayload(payload) {
  const errors = {};
  const jugador = payload?.jugador || {};
  const reserva = payload?.reserva || {};
  const duration = Number(reserva.duracion_minutos);
  const selectedDate = reserva.fecha ? new Date(`${reserva.fecha}T00:00:00`) : null;
  const today = new Date(`${todayISO()}T00:00:00`);

  if (payload?.accion !== "crear_reserva") errors.accion = "Accion no soportada.";
  if (cleanText(jugador.nombre).length < 2) errors.nombre = "Nombre invalido.";
  if (cleanText(jugador.apellidos).length < 2) errors.apellidos = "Apellidos invalidos.";
  if (!/^\S+@\S+\.\S+$/.test(cleanText(jugador.email))) errors.email = "Email invalido.";
  if (cleanText(jugador.telefono).replace(/\D/g, "").length < 9) errors.telefono = "Telefono invalido.";
  if (!reserva.fecha) errors.fecha = "Fecha requerida.";
  else if (Number.isNaN(selectedDate.getTime()) || selectedDate < today) errors.fecha = "Fecha invalida.";
  if (!BOOKING_HOURS.includes(reserva.hora)) errors.hora = "Hora invalida.";
  if (!BOOKING_DURATIONS.includes(duration)) errors.duracion_minutos = "Duracion invalida.";
  if (!COURTS.includes(reserva.pista)) errors.pista = "Pista invalida.";
  if (!BOOKING_MODALITIES.includes(reserva.modalidad)) errors.modalidad = "Modalidad invalida.";
  if (!BOOKING_LEVELS.includes(reserva.nivel)) errors.nivel = "Nivel invalido.";

  return errors;
}

function normalizePayload(payload) {
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
    received_at: new Date().toISOString(),
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

  return { configured: true, ok: response.ok, status: response.status };
}

async function prepareAirtableWrite(payload, env) {
  void payload;
  const configured = Boolean(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID && env.AIRTABLE_RESERVAS_TABLE);

  return {
    configured,
    skipped: true,
    reason: configured ? "Airtable credentials configured; implement table mapping before enabling writes." : "Airtable credentials not configured.",
  };
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

  const errors = validatePayload(payload);
  if (Object.keys(errors).length > 0) {
    return jsonResponse({ ok: false, error: "Validation failed", fields: errors }, 422, headers);
  }

  const normalizedPayload = normalizePayload(payload);
  const makeResult = await forwardToMake(normalizedPayload, env);
  const airtableResult = await prepareAirtableWrite(normalizedPayload, env);

  if (makeResult.configured && !makeResult.ok) {
    return jsonResponse({ ok: false, error: "Make webhook rejected the request" }, 502, headers);
  }

  return jsonResponse({
    ok: true,
    status: makeResult.configured ? "forwarded" : "accepted_without_make_webhook",
    make: { configured: makeResult.configured, status: makeResult.status },
    airtable: airtableResult,
  }, 200, headers);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== "/api/reservas" && url.pathname !== "/reservas") {
      return jsonResponse({ ok: false, error: "Not found" }, 404, corsHeaders(request, env));
    }

    try {
      return await handleReservas(request, env);
    } catch {
      return jsonResponse({ ok: false, error: "Internal server error" }, 500, corsHeaders(request, env));
    }
  },
};
