import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";
import {
  AVAILABILITY_ERROR,
  validateAvailabilityDate,
} from "./availability-contract.js";

const ORIGIN = "http://localhost:5173";
const BASE_ENV = Object.freeze({
  ALLOWED_ORIGIN: ORIGIN,
  AIRTABLE_TOKEN: "airtable-token-fake",
  AIRTABLE_BASE_ID: "appTestBase",
  AIRTABLE_TABLE_ID: "tblTestReservations",
  AVAILABILITY_TENANT_ID: "tenant-a",
  AVAILABILITY_CLUB_ID: "club-a",
  AIRTABLE_TENANT_FIELD: "tenant_id",
  AIRTABLE_CLUB_FIELD: "club_id",
  CLUB_TIMEZONE: "Europe/Madrid",
});

function isoDateInDays(days) {
  const now = new Date();
  const madrid = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(madrid.map(({ type, value }) => [type, value]));
  const date = new Date(Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day) + days));
  return date.toISOString().slice(0, 10);
}

function nextOpenDate() {
  for (let days = 1; days <= 7; days += 1) {
    const value = isoDateInDays(days);
    const [year, month, day] = value.split("-").map(Number);
    if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() !== 0) return value;
  }
  throw new Error("No se encontró fecha no dominical");
}

function availabilityRequest(date = nextOpenDate(), extraQuery = "") {
  return new Request(
    `https://worker.test/api/disponibilidad?fecha=${date}${extraQuery}`,
    { method: "GET", headers: { Origin: ORIGIN } }
  );
}

function record({ tenantId = "tenant-a", clubId = "club-a", court = "Pista 1", start = "10:00", end = "11:30", date = nextOpenDate() } = {}) {
  return {
    id: `rec-${tenantId}-${clubId}-${court}`,
    fields: {
      clave_slot: `${date}|${court}|${start}`,
      estado_reserva: "confirmada",
      fecha_reserva: date,
      hora_inicio: start,
      hora_fin: end,
      Pista: court,
      tenant_id: tenantId,
      club_id: clubId,
    },
  };
}

function withFetch(stub, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  return Promise.resolve(fn()).finally(() => {
    globalThis.fetch = original;
  });
}

test("fecha válida ISO se interpreta en la timezone canónica del club", () => {
  const result = validateAvailabilityDate("2026-07-13", {
    now: new Date("2026-07-11T23:30:00Z"),
    timeZone: "Europe/Madrid",
  });
  assert.equal(result.ok, true);
  assert.equal(result.timeZone, "Europe/Madrid");
});

test("fecha con formato no ISO se rechaza con error canónico", () => {
  const result = validateAvailabilityDate("13/07/2026", { now: new Date("2026-07-11T00:00:00Z") });
  assert.deepEqual(result, { ok: false, code: AVAILABILITY_ERROR.INVALID_DATE_FORMAT });
});

test("fecha imposible se rechaza aunque tenga forma YYYY-MM-DD", () => {
  const result = validateAvailabilityDate("2026-02-30", { now: new Date("2026-01-01T00:00:00Z") });
  assert.deepEqual(result, { ok: false, code: AVAILABILITY_ERROR.IMPOSSIBLE_DATE });
});

test("timezone del cliente distinta de la canónica se rechaza", () => {
  const result = validateAvailabilityDate("2026-07-13", {
    now: new Date("2026-07-11T00:00:00Z"),
    timeZone: "Europe/Madrid",
    requestedTimeZone: "UTC",
  });
  assert.deepEqual(result, { ok: false, code: AVAILABILITY_ERROR.TIMEZONE_MISMATCH });
});

test("fecha más allá del rango razonable configurado se rechaza", () => {
  const result = validateAvailabilityDate("2027-07-12", {
    now: new Date("2026-07-11T00:00:00Z"),
    timeZone: "Europe/Madrid",
    maxAdvanceDays: 365,
  });
  assert.deepEqual(result, { ok: false, code: AVAILABILITY_ERROR.DATE_OUT_OF_RANGE });
});

test("GET usa un error consistente para fecha ausente, formato inválido y fecha imposible", async () => {
  const cases = [
    ["", AVAILABILITY_ERROR.MISSING_DATE],
    ["?fecha=13%2F07%2F2026", AVAILABILITY_ERROR.INVALID_DATE_FORMAT],
    ["?fecha=2026-02-30", AVAILABILITY_ERROR.IMPOSSIBLE_DATE],
  ];

  for (const [query, expectedCode] of cases) {
    const response = await worker.fetch(
      new Request(`https://worker.test/api/disponibilidad${query}`, {
        method: "GET",
        headers: { Origin: ORIGIN },
      }),
      BASE_ENV
    );
    const body = await response.json();
    assert.equal(response.status, 400);
    assert.equal(body.ok, false);
    assert.equal(body.error, expectedCode);
    assert.equal(typeof body.message, "string");
    assert.ok(body.message.length > 0);
  }
});

test("tenant A no ve tenant B y club A no mezcla club B; query cliente no decide scope", async () => {
  const date = nextOpenDate();
  let capturedUrl;
  const response = await withFetch(async (url) => {
    capturedUrl = new URL(url);
    return new Response(JSON.stringify({
      records: [
        record({ date }),
        record({ tenantId: "tenant-b", date, court: "Pista 2" }),
        record({ clubId: "club-b", date, court: "Pista 3" }),
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  }, () => worker.fetch(
    availabilityRequest(date, "&tenant_id=tenant-b&club_id=club-b"),
    BASE_ENV
  ));

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.total, 1);
  assert.deepEqual(body.ocupadas, [`${date}|Pista 1|10:00`]);
  const formula = capturedUrl.searchParams.get("filterByFormula");
  assert.match(formula, /\{tenant_id\} = "tenant-a"/);
  assert.match(formula, /\{club_id\} = "club-a"/);
  assert.doesNotMatch(formula, /tenant-b|club-b/);
});

test("records vacío es una respuesta válida sin ocupación", async () => {
  const response = await withFetch(
    async () => new Response(JSON.stringify({ records: [] }), { status: 200 }),
    () => worker.fetch(availabilityRequest(), BASE_ENV)
  );
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.total, 0);
  assert.deepEqual(body.ocupadas_detalle, []);
});

test("respuesta HTTP vacía de Airtable se controla como 502", async () => {
  const response = await withFetch(
    async () => new Response("", { status: 200 }),
    () => worker.fetch(availabilityRequest(), BASE_ENV)
  );
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, AVAILABILITY_ERROR.AIRTABLE_INVALID_RESPONSE);
});

test("error Airtable no filtra detalles del proveedor y conserva status upstream", async () => {
  const response = await withFetch(
    async () => new Response(JSON.stringify({ error: { message: "internal-sensitive-detail" } }), { status: 429 }),
    () => worker.fetch(availabilityRequest(), BASE_ENV)
  );
  assert.equal(response.status, 502);
  const body = await response.json();
  assert.equal(body.error, AVAILABILITY_ERROR.AIRTABLE_UNAVAILABLE);
  assert.equal(body.airtable_status, 429);
  assert.equal(JSON.stringify(body).includes("internal-sensitive-detail"), false);
});

test("registro Airtable con campos obligatorios ausentes falla cerrado", async () => {
  const incomplete = record();
  delete incomplete.fields.hora_fin;
  const response = await withFetch(
    async () => new Response(JSON.stringify({ records: [incomplete] }), { status: 200 }),
    () => worker.fetch(availabilityRequest(), BASE_ENV)
  );
  assert.equal(response.status, 502);
  assert.equal((await response.json()).error, AVAILABILITY_ERROR.AIRTABLE_MISSING_FIELDS);
});

test("timeout Airtable devuelve 504 controlado", async () => {
  const response = await withFetch(
    async () => { throw new DOMException("timed out", "TimeoutError"); },
    () => worker.fetch(availabilityRequest(), BASE_ENV)
  );
  assert.equal(response.status, 504);
  assert.equal((await response.json()).error, AVAILABILITY_ERROR.AIRTABLE_TIMEOUT);
});

test("compatibilidad Auth: disponibilidad sigue pública y sin token", async () => {
  const response = await withFetch(
    async () => new Response(JSON.stringify({ records: [] }), { status: 200 }),
    () => worker.fetch(availabilityRequest(), BASE_ENV)
  );
  assert.notEqual(response.status, 401);
  assert.notEqual(response.status, 403);
});
