import test from "node:test";
import assert from "node:assert/strict";

import worker, { QR_REASON_CODES } from "./index.js";

// Tests de handleQrGenerate y handleQrValidate (worker-reservas/src/index.js).
// Ningún test hace una petición de red real. Cuando hace falta simular Make,
// se sustituye temporalmente globalThis.fetch por un stub, restaurado en finally.

async function withFakeFetch(impl, run) {
  const original = globalThis.fetch;
  globalThis.fetch = impl;
  try {
    await run();
  } finally {
    globalThis.fetch = original;
  }
}

function makeQrGenerateRequest(body = {}, { headers = {}, env = {} } = {}) {
  return [
    new Request("https://worker.test/api/qr/generate", {
      method: "POST",
      headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    { MAKE_QR_ACCESO_WEBHOOK: "https://hook.make.test/qr-generate", ...env },
  ];
}

function makeQrValidateRequest(body = {}, { headers = {}, env = {} } = {}) {
  return [
    new Request("https://worker.test/api/qr/validate", {
      method: "POST",
      headers: { Origin: "http://localhost:5173", "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    }),
    { MAKE_CONTROL_QR_WEBHOOK: "https://hook.make.test/qr-validate", ...env },
  ];
}

const VALID_GENERATE_BODY = {
  clave_reserva: "CP04-TEST-2026-07-20-PISTA2-09",
  player_id:     "player-qa@test.example",
  club_id:       "club-padel-04",
  pista:         "Pista 2",
  fecha:         "2026-07-20",
  hora_inicio:   "09:00",
  hora_fin:      "10:30",
  record_id:     "rec_TEST_AIRTABLE_ID_QA",
  nombre:        "Jugador QA Test",
  email:         "jugador-qa@test.example",
};

const VALID_VALIDATE_BODY = {
  clave_reserva: "CP04-TEST-2026-07-20-PISTA2-09",
  pista:         "Pista 2",
  club_id:       "cp04-antequera",
  staff_id:      "staff-qa@test.example",
};

// ─── GENERACIÓN QR ────────────────────────────────────────────────────────────

test("qr/generate: sin webhook configurado → 503 sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamar a fetch"); },
    async () => {
      const [req] = makeQrGenerateRequest(VALID_GENERATE_BODY, { env: {} });
      const res = await worker.fetch(req, {});
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.ok, false);
      assert.match(data.error, /webhook not configured/i);
    }
  );
});

test("qr/generate: método no POST → 405", async () => {
  const req = new Request("https://worker.test/api/qr/generate", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_QR_ACCESO_WEBHOOK: "https://hook.test/qr" });
  assert.equal(res.status, 405);
});

test("qr/generate: OPTIONS → 204 (CORS preflight)", async () => {
  const req = new Request("https://worker.test/api/qr/generate", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_QR_ACCESO_WEBHOOK: "https://hook.test/qr" });
  assert.equal(res.status, 204);
});

test("qr/generate: clave_reserva faltante → 400 con campo de error", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, clave_reserva: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.clave_reserva);
    }
  );
});

test("qr/generate: pista inválida → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, pista: "PistaX" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.pista);
    }
  );
});

test("qr/generate: fecha inválida → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, fecha: "20-07-2026" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.fecha);
    }
  );
});

test("qr/generate: player_id faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, player_id: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.player_id);
    }
  );
});

test("qr/generate: hora_fin faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, hora_fin: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.hora_fin);
    }
  );
});

test("qr/generate: record_id faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, record_id: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.record_id);
    }
  );
});

test("qr/generate: nombre faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, nombre: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.nombre);
    }
  );
});

test("qr/generate: email faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const body = { ...VALID_GENERATE_BODY, email: "" };
      const [req, env] = makeQrGenerateRequest(body);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.email);
    }
  );
});

test("qr/generate: payload enviado a Make cumple contrato Make escenario 6244975", async () => {
  let capturedBody = null;
  await withFakeFetch(
    async (url, opts) => {
      capturedBody = JSON.parse(opts.body);
      return { ok: true, text: async () => "generacion_ok" };
    },
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      assert.equal(res.status, 200);
      assert.ok(capturedBody, "debe haber capturado el payload enviado a Make");
      // Campos del contrato Make
      assert.equal(capturedBody.event,           "reserva_confirmada");
      assert.equal(capturedBody.club_id,         "club-padel-04");
      assert.equal(capturedBody.record_id,       VALID_GENERATE_BODY.record_id);
      assert.equal(capturedBody.nombre,          VALID_GENERATE_BODY.nombre);
      assert.equal(capturedBody.email,           VALID_GENERATE_BODY.email);
      assert.equal(capturedBody.clave_reserva,   VALID_GENERATE_BODY.clave_reserva);
      assert.equal(capturedBody.fecha_reserva,   VALID_GENERATE_BODY.fecha);
      assert.equal(capturedBody.hora_inicio,     VALID_GENERATE_BODY.hora_inicio);
      assert.equal(capturedBody.hora_fin,        VALID_GENERATE_BODY.hora_fin);
      assert.equal(capturedBody.pista,           VALID_GENERATE_BODY.pista);
      assert.equal(capturedBody.source,          "app_cp04");
      assert.equal(capturedBody.test_mode,       false);
      assert.ok(capturedBody.idempotency_key,    "debe tener idempotency_key");
      // Campos que NO deben ir a Make
      assert.equal(capturedBody.player_id,       undefined, "player_id no debe ir a Make");
      assert.equal(capturedBody.accion,          undefined, "accion (legado) no debe ir a Make");
      assert.equal(capturedBody.origen,          undefined, "origen (legado) no debe ir a Make");
    }
  );
});

test("qr/generate: idempotency_key es determinista (misma clave_reserva = mismo key)", async () => {
  const captured = [];
  await withFakeFetch(
    async (url, opts) => {
      captured.push(JSON.parse(opts.body).idempotency_key);
      return { ok: true, text: async () => "ok" };
    },
    async () => {
      const [req1, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const [req2]      = makeQrGenerateRequest(VALID_GENERATE_BODY);
      await worker.fetch(req1, env);
      await worker.fetch(req2, env);
      assert.equal(captured.length, 2);
      assert.equal(captured[0], captured[1], "idempotency_key debe ser idéntico para la misma clave_reserva");
      assert.ok(captured[0].includes(VALID_GENERATE_BODY.clave_reserva), "key debe incluir la clave_reserva");
    }
  );
});

test("qr/generate: Make responde ok → 200 con valid_from/valid_until/issued_at", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "generacion_ok" }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.clave_reserva, VALID_GENERATE_BODY.clave_reserva);
      assert.equal(data.pista, VALID_GENERATE_BODY.pista);
      assert.ok(data.valid_from, "debe tener valid_from");
      assert.ok(data.valid_until, "debe tener valid_until");
      assert.ok(data.issued_at, "debe tener issued_at");
      assert.ok(new Date(data.valid_until) > new Date(data.valid_from), "valid_until > valid_from");
    }
  );
});

test("qr/generate: valid_from es antes de hora_inicio (ventana de anticipación)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      const fechaBase = new Date("2026-07-20T09:00:00Z");
      const validFrom = new Date(data.valid_from);
      assert.ok(validFrom < fechaBase, "valid_from debe ser antes de la hora de inicio");
    }
  );
});

test("qr/generate: Make responde error → 502", async () => {
  await withFakeFetch(
    async () => ({ ok: false, status: 503, text: async () => "error" }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

test("qr/generate: doble petición con mismo body → ambas 200 (idempotente desde app)", async () => {
  let callCount = 0;
  await withFakeFetch(
    async () => { callCount++; return { ok: true, text: async () => "ok" }; },
    async () => {
      const [req1, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const [req2] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res1 = await worker.fetch(req1, env);
      const res2 = await worker.fetch(req2, env);
      assert.equal(res1.status, 200);
      assert.equal(res2.status, 200);
      assert.equal(callCount, 2); // Make se llama 2x — idempotencia en Make side
    }
  );
});

test("qr/generate: no expone player_id en respuesta (privacidad mínima)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const [req, env] = makeQrGenerateRequest(VALID_GENERATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.player_id, undefined, "player_id no debe estar en la respuesta pública");
    }
  );
});

// ─── VALIDACIÓN / CONTROL QR ─────────────────────────────────────────────────

test("qr/validate: sin webhook configurado → 503 sin llamar a fetch", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debería llamar a fetch"); },
    async () => {
      const [req] = makeQrValidateRequest(VALID_VALIDATE_BODY, { env: {} });
      const res = await worker.fetch(req, {});
      const data = await res.json();
      assert.equal(res.status, 503);
      assert.equal(data.ok, false);
      assert.match(data.error, /webhook not configured/i);
    }
  );
});

test("qr/validate: método GET → 405", async () => {
  const req = new Request("https://worker.test/api/qr/validate", {
    method: "GET",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_CONTROL_QR_WEBHOOK: "https://hook.test/qr-val" });
  assert.equal(res.status, 405);
});

test("qr/validate: OPTIONS → 204", async () => {
  const req = new Request("https://worker.test/api/qr/validate", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:5173" },
  });
  const res = await worker.fetch(req, { MAKE_CONTROL_QR_WEBHOOK: "https://hook.test/qr-val" });
  assert.equal(res.status, 204);
});

test("qr/validate: clave_reserva vacía → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, clave_reserva: "" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.clave_reserva);
    }
  );
});

test("qr/validate: pista inválida → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, pista: "PistaZ" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.pista);
    }
  );
});

test("qr/validate: staff_id faltante → 400", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, staff_id: "" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.staff_id);
    }
  );
});

test("qr/validate: Make responde ACCESO_OK → decision ALLOW, reason VALID", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.ok, true);
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

test("qr/validate: Make responde QR_CADUCADO → decision DENY, reason EXPIRED", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "QR_CADUCADO" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.EXPIRED);
    }
  );
});

test("qr/validate: Make responde DENEGADO_INVALIDO → decision DENY, reason CANCELLED", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "DENEGADO_INVALIDO" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.CANCELLED);
    }
  );
});

test("qr/validate: Make responde error HTTP → 502", async () => {
  await withFakeFetch(
    async () => ({ ok: false, status: 500, text: async () => "error interno" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 502);
      assert.equal(data.ok, false);
    }
  );
});

test("qr/validate: Make responde texto desconocido → decision DENY, reason INVALID_STATE", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "RESPUESTA_NO_ESPERADA_XYZ" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.INVALID_STATE);
    }
  );
});

// ─── RESPUESTAS JSON DE MAKE (decision/reason) ───────────────────────────────
// Regresión del bug: {"ok":true,...} NUNCA debe interpretarse como VALID solo
// porque el texto contiene "ok". Deben priorizarse los campos decision/reason.

test('qr/validate: Make responde {"ok":true,"decision":"ALLOW","reason":"ACCESO_OK"} → decision ALLOW, reason VALID', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "ALLOW", reason: "ACCESO_OK" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.VALID);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"TOO_EARLY"} → decision DENY, reason TOO_EARLY (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "TOO_EARLY" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.TOO_EARLY);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"EXPIRED"} → decision DENY, reason EXPIRED (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "EXPIRED" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.EXPIRED);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"ALREADY_USED"} → decision DENY, reason ALREADY_USED (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "ALREADY_USED" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.ALREADY_USED);
    }
  );
});

test('qr/validate: Make responde {"ok":true,"decision":"DENY","reason":"INVALID"} → decision DENY, reason INVALID_STATE (nunca ALLOW)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true, decision: "DENY", reason: "INVALID" }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.notEqual(data.decision, "ALLOW");
      assert.equal(data.reason, QR_REASON_CODES.INVALID_STATE);
    }
  );
});

test('qr/validate: Make responde {"ok":true} sin decision/reason → decision DENY (la presencia de "ok" no implica acceso)', async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => JSON.stringify({ ok: true }) }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 200);
      assert.equal(data.decision, "DENY");
      assert.equal(data.reason, QR_REASON_CODES.INVALID_STATE);
    }
  );
});

test("qr/validate: doble scan → ambas peticiones llegan a Make (Make gestiona ALREADY_USED)", async () => {
  let callCount = 0;
  await withFakeFetch(
    async () => {
      callCount++;
      const text = callCount === 1 ? "ACCESO_OK" : "ya_usado";
      return { ok: true, text: async () => text };
    },
    async () => {
      const [req1, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const [req2] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res1 = await worker.fetch(req1, env);
      const res2 = await worker.fetch(req2, env);
      const data1 = await res1.json();
      const data2 = await res2.json();
      assert.equal(data1.decision, "ALLOW");
      assert.equal(data2.decision, "DENY");
      assert.equal(data2.reason, QR_REASON_CODES.ALREADY_USED);
    }
  );
});

test("qr/validate: cross-club — club_id vacío → 400 (validación local, antes de Make)", async () => {
  await withFakeFetch(
    async () => { throw new Error("no debe llamar a Make"); },
    async () => {
      const [req, env] = makeQrValidateRequest({ ...VALID_VALIDATE_BODY, club_id: "" });
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(res.status, 400);
      assert.ok(data.fields?.club_id);
    }
  );
});

test("qr/validate: no expone staff_id en respuesta (privacidad)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ACCESO_OK" }),
    async () => {
      const [req, env] = makeQrValidateRequest(VALID_VALIDATE_BODY);
      const res = await worker.fetch(req, env);
      const data = await res.json();
      assert.equal(data.staff_id, undefined, "staff_id no debe estar en respuesta pública");
    }
  );
});

// ─── REASON CODES ────────────────────────────────────────────────────────────

test("QR_REASON_CODES exportado contiene todos los reason codes canónicos", () => {
  const expected = [
    "VALID", "TOO_EARLY", "EXPIRED", "CANCELLED", "COURT_CLOSED",
    "WRONG_CLUB", "WRONG_COURT", "UNKNOWN_QR", "ALREADY_USED",
    "INVALID_STATE", "UNAUTHORIZED",
  ];
  for (const code of expected) {
    assert.ok(QR_REASON_CODES[code], `falta reason code: ${code}`);
    assert.equal(QR_REASON_CODES[code], code);
  }
});

// ─── REGRESIÓN: RUTAS EXISTENTES INTACTAS ────────────────────────────────────

test("regresión: /api/pistas/cierre-temporal sigue respondiendo (no afectado por QR)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const req = new Request("https://worker.test/api/pistas/cierre-temporal", {
        method: "POST",
        headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await worker.fetch(req, {});
      // Sin webhook → 503, no 404 (la ruta existe)
      assert.notEqual(res.status, 404);
    }
  );
});

test("regresión: /api/jugadores/alta sigue respondiendo (no afectado por QR)", async () => {
  await withFakeFetch(
    async () => ({ ok: true, text: async () => "ok" }),
    async () => {
      const req = new Request("https://worker.test/api/jugadores/alta", {
        method: "POST",
        headers: { Origin: "http://localhost:5173", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await worker.fetch(req, {});
      assert.notEqual(res.status, 404);
    }
  );
});
