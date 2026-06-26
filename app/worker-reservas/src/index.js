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

  const formula = `AND(
    FIND("${fecha}|", {clave_slot}) = 1,
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
    `&fields%5B%5D=Pista`;

  const airtableRes = await fetch(airtableUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  const data = await airtableRes.json();

  if (!airtableRes.ok) {
    return jsonResponse(
      {
        ok: false,
        error: "Error consultando disponibilidad en Airtable",
        status: airtableRes.status,
        details: data
      },
      500,
      headers
    );
  }

  const ocupadas = (data.records || [])
    .map((record) => record.fields?.clave_slot)
    .filter(Boolean);

  return jsonResponse(
    {
      ok: true,
      fecha,
      ocupadas,
      total: ocupadas.length
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (
        url.pathname === "/api/jugadores/alta" ||
        url.pathname === "/jugadores/alta"
      ) {
        return await handleAltaJugador(request, env);
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
      return jsonResponse(
        {
          ok: false,
          error: "Internal server error",
          message: error?.message || "Unknown error"
        },
        500,
        corsHeaders(request, env)
      );
    }
  }
};
