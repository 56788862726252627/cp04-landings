import test from "node:test";
import assert from "node:assert/strict";

import worker, {
  __resetIdempotencyStoreForTests,
  cp04BuildCierreTemporalPistaIdempotencyKey,
  cp04MotivoCierreToAirtableLabel,
} from "./index.js";

// PASO 07E (2026-07-19): tests de handleCierreTemporalPista
// (worker-reservas/src/index.js), réplica del patrón de Alta/Baja de
// Jugador.
//
// FASE 1 (2026-08-12, "Worker = fuente de verdad"): el handler pasó de
// "solo reenviar a Make" a "persistir en Airtable (tabla
// CIERRES_TEMPORALES) y notificar a Make en un segundo paso, best-effort".
// Los tests de este archivo se reescriben para reflejar ese contrato
// nuevo. Ningún test hace una petición de red real: se sustituye
// temporalmente globalThis.fetch por un stub local que distingue
// Airtable de Make por URL, restaurado siempre en el `finally`. Ninguna
// URL/token es real.

async function withFakeFetch(fakeFetchImpl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fakeFetchImpl;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

// Mismos helpers que reservas-network-safety.test.mjs, duplicados
// localmente (patrón ya establecido en este repo: cada fichero de test es
// autocontenido) para capturar console.error sin tocar la implementación.
async function withFakeConsoleErrorAsync(run) {
  const original = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args);
  try {
    const result = await run();
    return { result, logged };
  } finally {
    console.error = original;
  }
}

function loggedEventsFrom(logged) {
  return logged
    .filter(([tag]) => tag === "CP04_EVENT")
    .map(([, jsonStr]) => JSON.parse(jsonStr));
}

function cierreRequest(body, { headers = {} } = {}) {
  return new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  pista: "Pista 2",
  fecha_inicio: "2026-07-20",
  hora_inicio: "09:00",
  fecha_fin: "2026-07-20",
  hora_fin: "13:00",
  motivo: "mantenimiento",
  observaciones: "Prueba automatizada, sin datos reales.",
  creado_por: "qa-staff@example.test",
  rol_origen: "STAFF",
  notify_players: true,
};

// Entorno completo: storage Airtable (tabla CIERRES_TEMPORALES, aún no
// creada en producción a propósito en esta fase) + webhook de Make.
// Ningún valor es real.
const CIERRE_STORAGE_ENV = {
  AIRTABLE_TOKEN: "fake-airtable-token",
  AIRTABLE_BASE_ID: "appFAKEBASEID",
  AIRTABLE_CIERRES_TABLE_ID: "tblFAKECIERRES",
};

const CIERRE_ENV_FULL = {
  ...CIERRE_STORAGE_ENV,
  MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK: "https://hook.example.test/fake-cierre",
};

// Stub de fetch consciente de Airtable vs. Make: identifica el destino por
// la URL (api.airtable.com vs. cualquier otra, típicamente el webhook), y
// dentro de Airtable distingue GET (búsqueda de duplicado persistido) de
// POST (creación real). Permite simular cada escenario con precisión sin
// acoplar los tests a detalles internos de implementación.
function makeAirtableAwareFetch({
  existingRecord = null,
  airtableCreateFails = false,
  airtableCreateErrorStatus = 500,
  airtableCreateErrorBody = { error: { message: "simulated Airtable failure" } },
  makeFails = false,
  onAirtableSearch,
  onAirtableCreate,
  onMakeCall,
} = {}) {
  return async (url, init) => {
    const urlStr = String(url?.url || url);
    const method = init?.method || "GET";

    if (urlStr.includes("api.airtable.com")) {
      if (method === "GET") {
        if (onAirtableSearch) onAirtableSearch(urlStr);
        return new Response(
          JSON.stringify({ records: existingRecord ? [existingRecord] : [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      // POST: creación del registro de cierre.
      const sentFields = JSON.parse(init.body).fields;
      if (onAirtableCreate) onAirtableCreate(sentFields);
      if (airtableCreateFails) {
        return new Response(JSON.stringify(airtableCreateErrorBody), { status: airtableCreateErrorStatus });
      }
      return new Response(
        JSON.stringify({ id: "recFAKE123", fields: sentFields, createdTime: new Date().toISOString() }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cualquier otra URL: webhook de Make.
    if (onMakeCall) onMakeCall(JSON.parse(init.body));
    if (makeFails) {
      return new Response("Internal Error", { status: 500 });
    }
    return new Response("OK", { status: 200 });
  };
}

// --- Sin gate de rol activo (ENV sin CP04_ENFORCE_ROLE_GATES) ---

test("handleCierreTemporalPista: sin storage Airtable configurado -> 503 seguro, sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch sin AIRTABLE_CIERRES_TABLE_ID configurado");
    },
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), {});
      const data = await response.json();
      assert.equal(response.status, 503);
      assert.equal(data.ok, false);
      assert.equal(data.error, "Cierre temporal storage not configured");
    }
  );
});

test("handleCierreTemporalPista: método no permitido -> 405", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, CIERRE_ENV_FULL);
  assert.equal(response.status, 405);
});

test("handleCierreTemporalPista: JSON inválido -> 400", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: "{ no es json",
  });
  const response = await worker.fetch(request, CIERRE_ENV_FULL);
  assert.equal(response.status, 400);
});

test("handleCierreTemporalPista: validación rechaza payload incompleto (sin pista, fechas, motivo) con 400 y campos", async () => {
  const response = await worker.fetch(
    cierreRequest({ creado_por: "qa@example.test", rol_origen: "STAFF" }),
    CIERRE_ENV_FULL
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.equal(data.ok, false);
  assert.ok(data.fields.pista);
  assert.ok(data.fields.fecha_inicio);
  assert.ok(data.fields.hora_inicio);
  assert.ok(data.fields.fecha_fin);
  assert.ok(data.fields.hora_fin);
  assert.ok(data.fields.motivo);
});

test("handleCierreTemporalPista: rechaza motivo fuera de la lista permitida", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, motivo: "capricho" }),
    CIERRE_ENV_FULL
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.motivo);
});

test("handleCierreTemporalPista: rechaza fecha_fin anterior a fecha_inicio", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, fecha_inicio: "2026-07-20", fecha_fin: "2026-07-19" }),
    CIERRE_ENV_FULL
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.fecha_fin);
});

test("handleCierreTemporalPista: rechaza hora_fin <= hora_inicio en el mismo día", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, fecha_inicio: "2026-07-20", fecha_fin: "2026-07-20", hora_inicio: "10:00", hora_fin: "09:00" }),
    CIERRE_ENV_FULL
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.hora_fin);
});

test("handleCierreTemporalPista: rechaza rol_origen fuera de ADMIN/STAFF/SUPPORT", async () => {
  const response = await worker.fetch(
    cierreRequest({ ...VALID_BODY, rol_origen: "PLAYER" }),
    CIERRE_ENV_FULL
  );
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.ok(data.fields.rol_origen);
});

// --- T1: creación correcta (persiste en Airtable + notifica a Make) ---

test("T1 — handleCierreTemporalPista: payload válido persiste en Airtable (estado ACTIVO, bloquear_reservas true) y notifica a Make con cierre_id", async () => {
  __resetIdempotencyStoreForTests();
  let createdFields = null;
  let makeBody = null;

  await withFakeFetch(
    makeAirtableAwareFetch({
      onAirtableCreate: (fields) => { createdFields = fields; },
      onMakeCall: (body) => { makeBody = body; },
    }),
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.estado, "activo");
      assert.ok(data.cierre_id, "debe devolver un cierre_id");
      assert.equal(data.notificacion_make, true);
      assert.equal(data.aviso, undefined, "sin aviso cuando Make sí notifica correctamente");

      // Lo persistido en Airtable.
      assert.equal(createdFields.estado, "ACTIVO");
      assert.equal(createdFields.bloquear_reservas, true);
      assert.equal(createdFields.pista, "Pista 2");
      assert.equal(createdFields.fecha_inicio, "2026-07-20");
      assert.equal(createdFields.hora_inicio, "09:00");
      assert.equal(createdFields.fecha_fin, "2026-07-20");
      assert.equal(createdFields.hora_fin, "13:00");
      assert.equal(createdFields.motivo, "Mantenimiento", "debe persistirse con el casing exacto del Single select real de Airtable");
      assert.equal(createdFields.creado_por, "qa-staff@example.test");
      assert.equal(createdFields.rol_origen, "STAFF");
      assert.equal(createdFields.notify_players, true);
      assert.ok(createdFields.clave_idempotente);
      assert.ok(createdFields.ID_cierre);
      assert.ok(createdFields.created_at);
      assert.ok(createdFields.updated_at);

      // Lo notificado a Make: sigue viajando `estado:"pendiente_confirmacion"`
      // como contexto para Make (no confundir con `data.estado`, que es la
      // respuesta del Worker al cliente) + el cierre_id ya persistido.
      assert.equal(makeBody.accion, "cierre_temporal_pista");
      assert.equal(makeBody.estado, "pendiente_confirmacion");
      assert.equal(makeBody.origen, "APP_CLUB_PADEL_04");
      assert.equal(makeBody.bloquear_reservas, true);
      assert.equal(makeBody.cierre_id, createdFields.ID_cierre);
    }
  );
});

test("handleCierreTemporalPista: acepta pista='todas' (cierre de todas las pistas) y persiste ese valor", async () => {
  __resetIdempotencyStoreForTests();
  let createdFields = null;

  await withFakeFetch(
    makeAirtableAwareFetch({ onAirtableCreate: (fields) => { createdFields = fields; } }),
    async () => {
      const response = await worker.fetch(
        cierreRequest({ ...VALID_BODY, pista: "todas" }),
        CIERRE_ENV_FULL
      );
      const data = await response.json();
      assert.equal(response.status, 200);
      assert.equal(createdFields.pista, "todas");
    }
  );
});

// --- T4/T5: Make falla o no está configurado -> el cierre sigue activo ---

test("T4 — handleCierreTemporalPista: cierre creado incluso si Make responde con error -> 200, notificacion_make:false, aviso honesto (el cierre NUNCA se revierte)", async () => {
  __resetIdempotencyStoreForTests();
  let createdFields = null;

  await withFakeFetch(
    makeAirtableAwareFetch({
      makeFails: true,
      onAirtableCreate: (fields) => { createdFields = fields; },
    }),
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.estado, "activo");
      assert.equal(data.notificacion_make, false);
      assert.match(data.aviso, /no pudo enviarse/i);
      assert.equal(createdFields.estado, "ACTIVO", "el registro en Airtable no se revierte aunque Make falle");
    }
  );
});

test("T5 — handleCierreTemporalPista: storage configurado pero MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK ausente -> cierre creado igualmente, notificacion_make:false, nunca llama a Make", async () => {
  __resetIdempotencyStoreForTests();
  let makeCalled = false;

  await withFakeFetch(
    makeAirtableAwareFetch({ onMakeCall: () => { makeCalled = true; } }),
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_STORAGE_ENV);
      const data = await response.json();

      assert.equal(response.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.estado, "activo");
      assert.equal(data.notificacion_make, false);
      assert.equal(makeCalled, false, "sin MAKE_CIERRE_TEMPORAL_PISTA_WEBHOOK, nunca debe intentarse notificar");
    }
  );
});

// --- T3: fallo de Airtable al crear -> 502, no se llama a Make ---

test("T3 — handleCierreTemporalPista: fallo de Airtable al crear -> 502, ok:false, nunca llama a Make", async () => {
  __resetIdempotencyStoreForTests();
  let makeCalled = false;

  await withFakeFetch(
    makeAirtableAwareFetch({
      airtableCreateFails: true,
      onMakeCall: () => { makeCalled = true; },
    }),
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const data = await response.json();

      assert.equal(response.status, 502);
      assert.equal(data.ok, false);
      assert.equal(makeCalled, false, "si no se pudo persistir, nunca se notifica a Make");
    }
  );
});

// Hallazgo 2026-08-12 (E2E real en T5 -> 502 "No se pudo registrar el
// cierre", tras el segundo deploy): la rama de arriba (T3) confirmaba el
// 502 pero created.status/created.details se descartaban sin dejar
// ningún rastro server-side, imposibilitando diagnosticar un fallo real
// de Airtable (p.ej. token sin permiso sobre la tabla nueva) despues del
// hecho. Este test reproduce ese escenario exacto (403 NOT_AUTHORIZED,
// forma real de un error de Airtable) y confirma que ahora SI queda
// registrado server-side, sin filtrar AIRTABLE_TOKEN ni datos personales,
// y sin cambiar la respuesta generica que ve el cliente.
test("handleCierreTemporalPista: fallo real de Airtable al crear (403 NOT_AUTHORIZED) queda registrado server-side con tipo/mensaje, sin exponer el token ni cambiar la respuesta al cliente", async () => {
  __resetIdempotencyStoreForTests();

  const { result: response, logged } = await withFakeConsoleErrorAsync(() =>
    withFakeFetch(
      makeAirtableAwareFetch({
        airtableCreateFails: true,
        airtableCreateErrorStatus: 403,
        airtableCreateErrorBody: { error: { type: "NOT_AUTHORIZED", message: "You are not authorized to perform this operation" } },
      }),
      () => worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL)
    )
  );

  const data = await response.json();
  assert.equal(response.status, 502);
  assert.deepEqual(data, { ok: false, error: "No se pudo registrar el cierre" }, "el cliente sigue viendo solo el mensaje generico, nunca el detalle de Airtable");

  const events = loggedEventsFrom(logged);
  const failEvent = events.find((e) => e.event === "cierre_temporal_persist_failed");
  assert.ok(failEvent, "debe registrar un evento cierre_temporal_persist_failed");
  assert.equal(failEvent.code, "airtable_error");
  assert.equal(failEvent.action, "cierre_temporal_pista");
  assert.equal(failEvent.detail.status, 403);
  assert.equal(failEvent.detail.airtableErrorType, "NOT_AUTHORIZED");
  assert.equal(failEvent.detail.airtableErrorMessage, "You are not authorized to perform this operation");

  const rawLog = JSON.stringify(logged);
  assert.doesNotMatch(rawLog, /fake-airtable-token/, "el log nunca debe contener el token");
});

// --- T2: duplicado persistente (independiente del Map en memoria) ---

test("T2 — handleCierreTemporalPista: ya existe un cierre ACTIVO persistido con la misma clave (aunque la memoria del isolate esté limpia) -> 409, no crea ni notifica", async () => {
  __resetIdempotencyStoreForTests(); // simula un isolate/instancia nueva: el Map en memoria está vacío

  const claveExistente = cp04BuildCierreTemporalPistaIdempotencyKey({
    pista: VALID_BODY.pista,
    fecha_inicio: VALID_BODY.fecha_inicio,
    hora_inicio: VALID_BODY.hora_inicio,
    fecha_fin: VALID_BODY.fecha_fin,
    hora_fin: VALID_BODY.hora_fin,
  });

  let createCalled = false;
  let makeCalled = false;

  await withFakeFetch(
    makeAirtableAwareFetch({
      existingRecord: {
        id: "recEXISTING",
        fields: { clave_idempotente: claveExistente, estado: "ACTIVO", ID_cierre: "CIERRE-20260720-EXIST" },
      },
      onAirtableCreate: () => { createCalled = true; },
      onMakeCall: () => { makeCalled = true; },
    }),
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const data = await response.json();

      assert.equal(response.status, 409);
      assert.equal(data.code, "IDEMPOTENT_DUPLICATE");
      assert.equal(createCalled, false, "no debe crear un segundo registro si ya existe uno ACTIVO persistido");
      assert.equal(makeCalled, false, "no debe notificar de nuevo un cierre ya persistido");
    }
  );
});

// --- Idempotencia rápida en memoria (mismo isolate, TTL 3 min) ---

test("handleCierreTemporalPista: segunda solicitud idéntica (misma pista/ventana) dentro del TTL -> 409 IDEMPOTENT_DUPLICATE, no crea ni notifica dos veces", async () => {
  __resetIdempotencyStoreForTests();
  let createCount = 0;
  let makeCount = 0;

  await withFakeFetch(
    makeAirtableAwareFetch({
      onAirtableCreate: () => { createCount += 1; },
      onMakeCall: () => { makeCount += 1; },
    }),
    async () => {
      const first = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const second = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const secondData = await second.json();

      assert.equal(first.status, 200);
      assert.equal(second.status, 409);
      assert.equal(secondData.code, "IDEMPOTENT_DUPLICATE");
      assert.equal(createCount, 1, "solo la primera petición debe crear el registro");
      assert.equal(makeCount, 1, "solo la primera petición debe notificar a Make");
    }
  );
});

test("handleCierreTemporalPista: una pista distinta en la misma ventana NO se confunde con un duplicado (clave distinta)", async () => {
  __resetIdempotencyStoreForTests();
  let createCount = 0;

  await withFakeFetch(
    makeAirtableAwareFetch({ onAirtableCreate: () => { createCount += 1; } }),
    async () => {
      const first = await worker.fetch(cierreRequest(VALID_BODY), CIERRE_ENV_FULL);
      const second = await worker.fetch(cierreRequest({ ...VALID_BODY, pista: "Pista 3" }), CIERRE_ENV_FULL);

      assert.equal(first.status, 200);
      assert.equal(second.status, 200);
      assert.equal(createCount, 2, "pistas distintas deben procesarse las dos");
    }
  );
});

// --- Corrección hallazgo K.1: casing de `motivo` Worker -> Airtable ------
// El contrato público (frontend/validación/CIERRE_MOTIVOS_VALIDOS) sigue
// en minúsculas; solo la escritura real a Airtable traduce al Single
// select capitalizado real, vía una tabla cerrada (cp04MotivoCierreToAirtableLabel).

const CIERRE_MOTIVOS_ESPERADOS = [
  ["mantenimiento", "Mantenimiento"],
  ["lluvia", "Lluvia"],
  ["evento", "Evento"],
  ["torneo", "Torneo"],
  ["limpieza", "Limpieza"],
  ["obra", "Obra"],
  ["incidencia", "Incidencia"],
  ["administrativo", "Administrativo"],
  ["otro", "Otro"],
];

test("cp04MotivoCierreToAirtableLabel: traduce exactamente los 9 motivos internos a su etiqueta Airtable capitalizada", () => {
  for (const [interno, esperado] of CIERRE_MOTIVOS_ESPERADOS) {
    assert.equal(cp04MotivoCierreToAirtableLabel(interno), esperado);
  }
});

test("cp04MotivoCierreToAirtableLabel: motivo no reconocido -> null (nunca inventa ni capitaliza a ciegas)", () => {
  assert.equal(cp04MotivoCierreToAirtableLabel("capricho"), null);
  assert.equal(cp04MotivoCierreToAirtableLabel("Mantenimiento"), null, "el valor ya capitalizado tampoco es una clave válida de entrada");
  assert.equal(cp04MotivoCierreToAirtableLabel(""), null);
  assert.equal(cp04MotivoCierreToAirtableLabel(undefined), null);
});

for (const [motivoInterno, motivoAirtableEsperado] of CIERRE_MOTIVOS_ESPERADOS) {
  test(`handleCierreTemporalPista: motivo='${motivoInterno}' se persiste en Airtable como '${motivoAirtableEsperado}' (casing exacto, sin duplicar opciones)`, async () => {
    __resetIdempotencyStoreForTests();
    let createdFields = null;

    await withFakeFetch(
      makeAirtableAwareFetch({ onAirtableCreate: (fields) => { createdFields = fields; } }),
      async () => {
        const response = await worker.fetch(
          cierreRequest({ ...VALID_BODY, motivo: motivoInterno }),
          CIERRE_ENV_FULL
        );
        assert.equal(response.status, 200);
        assert.equal(createdFields.motivo, motivoAirtableEsperado);
      }
    );
  });
}

test("handleCierreTemporalPista: motivo fuera de la lista permitida sigue rechazándose en validación (400), nunca llega a intentar persistir con un motivo inválido", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch: la validación debe rechazar antes");
    },
    async () => {
      const response = await worker.fetch(
        cierreRequest({ ...VALID_BODY, motivo: "Mantenimiento" }), // capitalizado: no es una clave interna válida
        CIERRE_ENV_FULL
      );
      const data = await response.json();
      assert.equal(response.status, 400);
      assert.ok(data.fields.motivo);
    }
  );
});

// --- Con gate de rol activo (CP04_ENFORCE_ROLE_GATES="true") ---

test("handleCierreTemporalPista: con CP04_ENFORCE_ROLE_GATES=true y sin token, se bloquea con 401 antes de llegar al handler", async () => {
  await withFakeFetch(
    async () => {
      throw new Error("no debería llamarse a fetch: el gate de rol debe bloquear antes");
    },
    async () => {
      const response = await worker.fetch(cierreRequest(VALID_BODY), {
        ...CIERRE_ENV_FULL,
        CP04_ENFORCE_ROLE_GATES: "true",
      });
      const data = await response.json();
      assert.equal(response.status, 401);
      assert.equal(data.ok, false);
      assert.equal(data.error, "MISSING_TOKEN");
    }
  );
});

test("handleCierreTemporalPista: OPTIONS siempre responde 204, incluso con el gate de rol activo", async () => {
  const request = new Request("https://worker.test/api/pistas/cierre-temporal", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {
    ...CIERRE_ENV_FULL,
    CP04_ENFORCE_ROLE_GATES: "true",
  });
  assert.equal(response.status, 204);
});

// --- No rompe Alta/Baja de Jugador ni API Reservas (regresión) ---

test("regresión: /api/jugadores/alta sigue respondiendo 503 seguro sin MAKE_ALTA_JUGADOR_WEBHOOK, tras añadir persistencia de cierre temporal", async () => {
  const request = new Request("https://worker.test/api/jugadores/alta", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "QA", apellidos: "Alta Test", email: "qa-alta@example.test", telefono: "600000000",
      fecha_nacimiento: "2000-01-01", nivel: "Iniciación", genero: "Otro", acepta_condiciones: true,
    }),
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.error, "Alta webhook not configured");
});

test("regresión: /api/jugadores/baja sigue respondiendo 503 seguro sin MAKE_BAJA_JUGADOR_WEBHOOK, tras añadir persistencia de cierre temporal", async () => {
  const request = new Request("https://worker.test/api/jugadores/baja", {
    method: "POST",
    headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "QA", apellidos: "Baja Test", email: "qa-baja@example.test", telefono: "600000000",
      motivo_baja: "Voluntaria", fecha_baja: "2026-07-19",
    }),
  });
  const response = await worker.fetch(request, {});
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.equal(data.error, "Baja webhook not configured");
});

test("regresión: /api/disponibilidad sigue respondiendo (no se rompió el dispatcher principal)", async () => {
  const request = new Request("https://worker.test/api/disponibilidad", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const response = await worker.fetch(request, {});
  assert.notEqual(response.status, 500);
});
