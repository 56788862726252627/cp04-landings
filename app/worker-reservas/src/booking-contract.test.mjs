import test from "node:test";
import assert from "node:assert/strict";

import worker from "./index.js";
import {
  BOOKING_ERROR,
  buildCanonicalBookingOperation,
  hasReservationConflict,
  resolveReservationScope,
  validateBookingIdempotency,
} from "./booking-contract.js";

const ORIGIN = "http://localhost:5173";
const CORRELATION_HEADER = "X-CP04-Correlation-Id";
const BASE_ENV = Object.freeze({
  ALLOWED_ORIGIN: ORIGIN,
  MAKE_RESERVAS_WEBHOOK: "https://hook.make.test/reservas",
  RESERVATIONS_TENANT_ID: "tenant-a",
  RESERVATIONS_CLUB_ID: "club-a",
  CLUB_TIMEZONE: "Europe/Madrid",
  MAKE_RESERVAS_TIMEOUT_MS: "1000",
});

function nextOpenDate() {
  const date = new Date();
  for (let days = 1; days <= 7; days += 1) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() !== 0) return date.toISOString().slice(0, 10);
  }
  throw new Error("No open date found");
}

function bookingPayload(overrides = {}) {
  return {
    accion: "crear_reserva",
    idempotency_key: "idem_booking_test-00000001",
    origen: "local_test",
    jugador: { nombre: "Test", apellidos: "Booking", email: "booking@example.test", telefono: "600000000" },
    reserva: {
      fecha: nextOpenDate(), hora: "10:00", hora_fin: "11:30", duracion_minutos: 90,
      modalidad: "libre", nivel: "intermedio", pista: "Pista 1",
    },
    ...overrides,
  };
}

function bookingRequest(payload = bookingPayload(), headers = {}) {
  return new Request("https://worker.test/api/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, ...headers },
    body: JSON.stringify(payload),
  });
}

function withFetch(stub, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = stub;
  return Promise.resolve(fn()).finally(() => { globalThis.fetch = original; });
}

async function callWithMake(responseFactory, payload = bookingPayload(), headers = {}) {
  let captured;
  const response = await withFetch(async (_url, init) => {
    captured = JSON.parse(init.body);
    return responseFactory();
  }, () => worker.fetch(bookingRequest(payload, headers), BASE_ENV));
  return { response, captured };
}

test("idempotency_key ausente se rechaza con 422", async () => {
  const payload = bookingPayload();
  delete payload.idempotency_key;
  const response = await worker.fetch(bookingRequest(payload), BASE_ENV);
  assert.equal(response.status, 422);
  assert.equal((await response.json()).error, BOOKING_ERROR.IDEMPOTENCY_KEY_REQUIRED);
});

test("idempotency_key válida se propaga al contrato canónico", async () => {
  const { response, captured } = await callWithMake(
    () => new Response(JSON.stringify({ ok: true, reservation_id: "res-1" }), { status: 201 }),
  );
  assert.equal(response.status, 201);
  assert.equal(captured.idempotency_key, "idem_booking_test-00000001");
  assert.equal(captured.tenant_id, "tenant-a");
});

test("replay idempotente de Make conserva 200 y no se presenta como creación", async () => {
  const { response } = await callWithMake(
    () => new Response(JSON.stringify({ ok: true, status: "idempotent_replay", reservation_id: "res-1" }), { status: 200 }),
  );
  assert.equal(response.status, 200);
  assert.equal((await response.json()).status, "idempotent_replay");
});

test("ack genérico 200 sin resultado atómico falla cerrado", async () => {
  const { response } = await callWithMake(
    () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
  );
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error, "backend_unavailable");
});

test("slot conflict de la autoridad se traduce a 409 canónico", async () => {
  const { response } = await callWithMake(
    () => new Response(JSON.stringify({ ok: false, error: "slot_conflict" }), { status: 409 }),
  );
  assert.equal(response.status, 409);
  assert.equal((await response.json()).error, "slot_conflict");
});

test("helper detecta solapamiento parcial", () => {
  const candidate = { tenant_id: "tenant-a", club_id: "club-a", court_id: "Pista 1", date: "2026-07-14", start_time: "10:30", end_time: "11:30" };
  const existing = [{ ...candidate, start_time: "10:00", end_time: "11:00" }];
  assert.equal(hasReservationConflict(candidate, existing), true);
});

test("helper permite reserva contigua", () => {
  const candidate = { tenant_id: "tenant-a", club_id: "club-a", court_id: "Pista 1", date: "2026-07-14", start_time: "11:00", end_time: "12:00" };
  const existing = [{ ...candidate, start_time: "10:00", end_time: "11:00" }];
  assert.equal(hasReservationConflict(candidate, existing), false);
});

test("helper no mezcla tenant cruzado", () => {
  const candidate = { tenant_id: "tenant-a", club_id: "club-a", court_id: "Pista 1", date: "2026-07-14", start_time: "10:00", end_time: "11:00" };
  assert.equal(hasReservationConflict(candidate, [{ ...candidate, tenant_id: "tenant-b" }]), false);
});

test("helper no mezcla club cruzado", () => {
  const candidate = { tenant_id: "tenant-a", club_id: "club-a", court_id: "Pista 1", date: "2026-07-14", start_time: "10:00", end_time: "11:00" };
  assert.equal(hasReservationConflict(candidate, [{ ...candidate, club_id: "club-b" }]), false);
});

test("correlation_id entrante se propaga y el Worker genera uno si falta", async () => {
  const incoming = "corr_booking-test-123456";
  const first = await callWithMake(
    () => new Response(JSON.stringify({ ok: true }), { status: 201 }),
    bookingPayload(), { [CORRELATION_HEADER]: incoming },
  );
  assert.equal(first.captured.correlation_id, incoming);
  assert.equal(first.response.headers.get(CORRELATION_HEADER), incoming);

  const generated = await callWithMake(
    () => new Response(JSON.stringify({ ok: true }), { status: 201 }),
  );
  assert.match(generated.captured.correlation_id, /^corr_[A-Za-z0-9-]{8,}$/);
  assert.equal(generated.response.headers.get(CORRELATION_HEADER), generated.captured.correlation_id);
});

test("error Make 503 se devuelve como backend_unavailable controlado", async () => {
  const { response } = await callWithMake(
    () => new Response(JSON.stringify({ ok: false, error: "make_unavailable", internal: "not-exposed" }), { status: 503 }),
  );
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error, "backend_unavailable");
  assert.equal(JSON.stringify(body).includes("not-exposed"), false);
});

test("timeout Make se devuelve como 504 controlado", async () => {
  const response = await withFetch(async () => { throw new DOMException("timeout", "TimeoutError"); },
    () => worker.fetch(bookingRequest(), BASE_ENV));
  assert.equal(response.status, 504);
  assert.equal((await response.json()).error, "timeout");
});

test("error Airtable reportado por Make queda controlado como 503", async () => {
  const { response } = await callWithMake(
    () => new Response(JSON.stringify({ ok: false, error: "airtable_unavailable", provider_detail: "secret" }), { status: 503 }),
  );
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.error, "backend_unavailable");
  assert.equal(JSON.stringify(body).includes("secret"), false);
});

test("contrato puro deriva fin y scope canónico sin confiar en club del cliente", () => {
  const scope = resolveReservationScope(BASE_ENV);
  const payload = bookingPayload({ club: "club-malicioso" });
  delete payload.reserva.hora_fin;
  assert.equal(validateBookingIdempotency(payload).ok, true);
  const result = buildCanonicalBookingOperation(payload, { scope, correlationId: "corr_contract-123456", now: new Date("2026-07-11T12:00:00Z") });
  assert.equal(result.ok, true);
  assert.equal(result.value.club_id, "club-a");
  assert.equal(result.value.end_time, "11:30");
});
