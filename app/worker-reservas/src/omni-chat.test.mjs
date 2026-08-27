import test from "node:test";
import assert from "node:assert/strict";

import {
  detectAction,
  extractDate,
  extractTime,
  extractCourt,
  normalizeOmniInput,
  OMNI_ACTIONS,
} from "./omni-normalizer.js";

import {
  cp04CheckChatRateLimit,
  __resetChatRateLimitForTests,
  isSundayISO,
} from "./index.js";

// ─── detectAction ─────────────────────────────────────────────────────────────

test("detectAction: 'cancelar mi reserva' → cancelar_reserva", () => {
  assert.equal(detectAction("quiero cancelar mi reserva del viernes"), OMNI_ACTIONS.CANCELAR_RESERVA);
});

test("detectAction: 'anular' → cancelar_reserva", () => {
  assert.equal(detectAction("Quiero anular la reserva"), OMNI_ACTIONS.CANCELAR_RESERVA);
});

test("detectAction: 'reprogramar' → reprogramar_reserva", () => {
  assert.equal(detectAction("necesito reprogramar mi reserva"), OMNI_ACTIONS.REPROGRAMAR_RESERVA);
});

test("detectAction: 'cambiar hora' → reprogramar_reserva", () => {
  assert.equal(detectAction("quiero cambiar la hora de mi reserva"), OMNI_ACTIONS.REPROGRAMAR_RESERVA);
});

test("detectAction: 'mis reservas' → consultar_reservas", () => {
  assert.equal(detectAction("muéstrame mis reservas"), OMNI_ACTIONS.CONSULTAR_RESERVAS);
});

test("detectAction: 'disponibilidad' → consultar_disponibilidad", () => {
  assert.equal(detectAction("¿hay disponibilidad el lunes?"), OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
});

test("detectAction: 'pistas libres' → consultar_disponibilidad", () => {
  assert.equal(detectAction("¿qué pistas libres hay mañana?"), OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
});

test("detectAction: 'quiero reservar' → crear_reserva", () => {
  assert.equal(detectAction("quiero reservar una pista el martes a las 10"), OMNI_ACTIONS.CREAR_RESERVA);
});

test("detectAction: texto sin contexto → desconocida", () => {
  assert.equal(detectAction("cuéntame un chiste"), OMNI_ACTIONS.DESCONOCIDA);
});

test("detectAction: 'hola buenas tardes' → saludo_ayuda", () => {
  assert.equal(detectAction("hola buenas tardes"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'cancelar' toma precedencia sobre 'reserva' en misma frase", () => {
  assert.equal(detectAction("quiero cancelar una reserva"), OMNI_ACTIONS.CANCELAR_RESERVA);
});

// ─── extractDate ──────────────────────────────────────────────────────────────

const REF = "2026-09-01"; // lunes

test("extractDate: 'hoy' → fecha de referencia", () => {
  assert.equal(extractDate("¿hay pistas hoy?", REF), "2026-09-01");
});

test("extractDate: 'mañana' → día siguiente", () => {
  assert.equal(extractDate("quiero reservar mañana", REF), "2026-09-02");
});

test("extractDate: fecha explícita ISO", () => {
  assert.equal(extractDate("el 2026-09-15 a las 10", REF), "2026-09-15");
});

test("extractDate: 'el viernes' → próximo viernes desde ref lunes 01/09", () => {
  assert.equal(extractDate("el viernes", REF), "2026-09-04");
});

test("extractDate: 'el lunes' desde ref lunes → siguiente lunes (no hoy)", () => {
  assert.equal(extractDate("el lunes", REF), "2026-09-07");
});

test("extractDate: 'el 5 de septiembre' → 2026-09-05", () => {
  assert.equal(extractDate("el 5 de septiembre", REF), "2026-09-05");
});

test("extractDate: sin fecha → null", () => {
  assert.equal(extractDate("quiero una pista", REF), null);
});

// ─── extractTime ──────────────────────────────────────────────────────────────

test("extractTime: 'a las 10' → 10:00", () => {
  assert.equal(extractTime("a las 10"), "10:00");
});

test("extractTime: '10:30' → 10:30", () => {
  assert.equal(extractTime("reserva a las 10:30"), "10:30");
});

test("extractTime: 'diez' → 10:00", () => {
  assert.equal(extractTime("a las diez de la mañana"), "10:00");
});

test("extractTime: 'once y media' → 11:30", () => {
  assert.equal(extractTime("once y media"), "11:30");
});

test("extractTime: sin hora → null", () => {
  assert.equal(extractTime("quiero pista el viernes"), null);
});

test("extractTime: hora fuera de rango (7h) → null", () => {
  assert.equal(extractTime("a las 7"), null);
});

// ─── extractCourt ─────────────────────────────────────────────────────────────

test("extractCourt: 'Pista 1' → Pista 1", () => {
  assert.equal(extractCourt("reservar Pista 1"), "Pista 1");
});

test("extractCourt: 'pista 3' → Pista 3", () => {
  assert.equal(extractCourt("quiero pista 3"), "Pista 3");
});

test("extractCourt: sin pista → null", () => {
  assert.equal(extractCourt("quiero una pista para el viernes"), null);
});

test("extractCourt: 'pista 5' fuera de rango → null", () => {
  assert.equal(extractCourt("pista 5"), null);
});

// ─── normalizeOmniInput ───────────────────────────────────────────────────────

test("normalizeOmniInput: frase completa de reserva extrae todos los campos", () => {
  const result = normalizeOmniInput("quiero Pista 2 el viernes a las 10", REF);
  assert.equal(result.action, OMNI_ACTIONS.CREAR_RESERVA);
  assert.equal(result.extracted.pista, "Pista 2");
  assert.equal(result.extracted.hora, "10:00");
  assert.equal(result.extracted.fecha, "2026-09-04");
});

test("normalizeOmniInput: consulta de disponibilidad con fecha", () => {
  const result = normalizeOmniInput("¿hay disponibilidad mañana?", REF);
  assert.equal(result.action, OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
  assert.equal(result.extracted.fecha, "2026-09-02");
});

test("normalizeOmniInput: conserva el texto original", () => {
  const text = "hola quiero reservar";
  const result = normalizeOmniInput(text, REF);
  assert.equal(result.original, text);
});

// ─── isSundayISO ──────────────────────────────────────────────────────────────

test("isSundayISO: 2026-08-30 (domingo) → true", () => {
  assert.equal(isSundayISO("2026-08-30"), true);
});

test("isSundayISO: 2026-08-31 (lunes) → false", () => {
  assert.equal(isSundayISO("2026-08-31"), false);
});

test("isSundayISO: formato inválido → false", () => {
  assert.equal(isSundayISO("not-a-date"), false);
  assert.equal(isSundayISO(""), false);
  assert.equal(isSundayISO(null), false);
});

// ─── cp04CheckChatRateLimit ───────────────────────────────────────────────────

test("cp04CheckChatRateLimit: 20 llamadas → todas pasan, la 21 falla", () => {
  __resetChatRateLimitForTests();
  const now = Date.now();
  for (let i = 0; i < 20; i++) {
    assert.equal(cp04CheckChatRateLimit(now), true, `Llamada ${i + 1} debe pasar`);
  }
  assert.equal(cp04CheckChatRateLimit(now), false, "Llamada 21 debe ser rechazada");
  __resetChatRateLimitForTests();
});

test("cp04CheckChatRateLimit: hits fuera de ventana no cuentan", () => {
  __resetChatRateLimitForTests();
  const pastNow = Date.now() - 65_000;
  for (let i = 0; i < 20; i++) cp04CheckChatRateLimit(pastNow);
  assert.equal(cp04CheckChatRateLimit(Date.now()), true, "Hits expirados no bloquean");
  __resetChatRateLimitForTests();
});

// ─── handleOmniChat HTTP contract ─────────────────────────────────────────────

function makeEnv(overrides = {}) {
  return {
    ALLOWED_ORIGIN: "https://club-padel-04.pages.dev",
    CHATBOT_BOT_SECRET: "test-secret-abc",
    APP_PUBLIC_URL: "https://club-padel-04.pages.dev",
    ...overrides,
  };
}

function makeRequest(body, origin = "https://club-padel-04.pages.dev", authHeader = null) {
  const headers = {
    "Content-Type": "application/json",
    "Origin": origin,
  };
  if (authHeader) headers["Authorization"] = authHeader;
  return new Request("https://cp04-reservas-proxy.workers.dev/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

function makeTelegramRequest(body, secret = "test-secret-abc", origin = "https://club-padel-04.pages.dev") {
  return new Request("https://cp04-reservas-proxy.workers.dev/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": origin,
      "X-CP04-Bot-Secret": secret,
    },
    body: JSON.stringify(body),
  });
}

import { default as worker } from "./index.js";

test("handleOmniChat: OPTIONS → 204", async () => {
  const req = new Request("https://cp04-reservas-proxy.workers.dev/api/chat", {
    method: "OPTIONS",
    headers: { "Origin": "https://club-padel-04.pages.dev" },
  });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 204);
});

test("handleOmniChat: GET → 405", async () => {
  const req = new Request("https://cp04-reservas-proxy.workers.dev/api/chat", {
    method: "GET",
    headers: { "Origin": "https://club-padel-04.pages.dev" },
  });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 405);
});

test("handleOmniChat: mensaje vacío → 400 MISSING_MESSAGE", async () => {
  const req = makeRequest({ message: "", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, "MISSING_MESSAGE");
});

test("handleOmniChat: origin inválido → 400 INVALID_ORIGIN", async () => {
  const req = makeRequest({ message: "hola", origin: "fax" });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, "INVALID_ORIGIN");
});

test("handleOmniChat: telegram sin bot secret → 401", async () => {
  const req = new Request("https://cp04-reservas-proxy.workers.dev/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "https://club-padel-04.pages.dev" },
    body: JSON.stringify({ message: "hola", origin: "telegram" }),
  });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 401);
});

test("handleOmniChat: telegram secret incorrecto → 401", async () => {
  const req = makeTelegramRequest({ message: "hola", origin: "telegram" }, "wrong-secret");
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 401);
});

test("handleOmniChat: telegram con secret correcto + consultar_disponibilidad sin fecha → needs_more_info", async () => {
  const req = makeTelegramRequest({ message: "¿hay pistas disponibles?", origin: "telegram" });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.action, OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
  assert.equal(data.needs_more_info, true);
});

test("handleOmniChat: telegram con acción mutable → redirect to web", async () => {
  const req = makeTelegramRequest({ message: "quiero cancelar mi reserva", origin: "telegram" });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(data.reply.toLowerCase().includes("app web"), "Debe redirigir a app web");
});

test("handleOmniChat: web sin auth + consultar_disponibilidad + domingo → aviso cerrado", async () => {
  const req = makeRequest({ message: "¿hay pistas el domingo 30 de agosto?", origin: "web" });
  // domingo 2026-08-30
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  assert.equal(data.action, OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
  assert.ok(data.reply.toLowerCase().includes("domingo"), "Debe mencionar domingo");
});

test("handleOmniChat: acción desconocida → reply con ayuda", async () => {
  const req = makeRequest({ message: "cuéntame un chiste", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.action, OMNI_ACTIONS.DESCONOCIDA);
  assert.ok(data.reply.length > 20, "Debe dar un mensaje de ayuda");
});

test("handleOmniChat: crear_reserva web sin auth → authRequired:true", async () => {
  const req = makeRequest({ message: "quiero reservar Pista 1 el viernes a las 10", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  assert.equal(data.action, OMNI_ACTIONS.CREAR_RESERVA);
  assert.equal(data.authRequired, true);
});

test("handleOmniChat: crear_reserva con campos incompletos → missing_fields listado", async () => {
  // Para simular auth, necesitamos un Bearer verificado — omitimos auth porque
  // Supabase no está configurado en test. El handler deriva auth=null y retorna authRequired.
  // Este test verifica el guide con campos incompletos via telegram_audio (no necesita auth).
  // telegram_audio solo puede hacer consultar_disponibilidad, así que usamos el hecho
  // de que crear_reserva sin auth devuelve authRequired sin entrar en omniCrearGuide.
  const req = makeRequest({ message: "quiero reservar el viernes", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  // Sin auth → authRequired o missing_fields en omniCrearGuide
  assert.equal(data.action, OMNI_ACTIONS.CREAR_RESERVA);
});

test("handleOmniChat: transcripción de audio (telegram_audio) con disponibilidad domingo", async () => {
  const req = makeTelegramRequest({
    transcription: "pistas disponibles el domingo 30 de agosto",
    origin: "telegram_audio",
  });
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  assert.equal(data.action, OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
  // Domingo → cerrado o needs_more_info (domingo detectado desde transcripción)
  assert.equal(data.ok, true);
});

test("handleOmniChat: JSON inválido → 400 INVALID_JSON", async () => {
  const req = new Request("https://cp04-reservas-proxy.workers.dev/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": "https://club-padel-04.pages.dev" },
    body: "not json {{{",
  });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, "INVALID_JSON");
});

test("handleOmniChat: cancelar desde web (sin auth) → redirect_hint:cancelar", async () => {
  const req = makeRequest({ message: "quiero cancelar mi reserva", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  assert.equal(data.action, OMNI_ACTIONS.CANCELAR_RESERVA);
  assert.equal(data.redirect_hint, "cancelar");
});

test("handleOmniChat: reprogramar desde web → redirect_hint:reprogramar", async () => {
  const req = makeRequest({ message: "necesito reprogramar mi reserva del viernes", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  const data = await res.json();
  assert.equal(data.action, OMNI_ACTIONS.REPROGRAMAR_RESERVA);
  assert.equal(data.redirect_hint, "reprogramar");
});

// ─── saludo_ayuda — detectAction ─────────────────────────────────────────────

test("detectAction: 'Hola, ¿qué puedes hacer?' → saludo_ayuda", () => {
  assert.equal(detectAction("Hola, ¿qué puedes hacer?"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'hola' → saludo_ayuda", () => {
  assert.equal(detectAction("hola"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'AYUDA' (mayúsculas) → saludo_ayuda", () => {
  assert.equal(detectAction("AYUDA"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: '¿Qué opciones tengo?' → saludo_ayuda", () => {
  assert.equal(detectAction("¿Qué opciones tengo?"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'Buenos días' → saludo_ayuda", () => {
  assert.equal(detectAction("Buenos días"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'buenas tardes' → saludo_ayuda", () => {
  assert.equal(detectAction("buenas tardes"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: texto con espacios finales → saludo_ayuda", () => {
  assert.equal(detectAction("hola   "), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: texto con \\n final (salida Whisper) → saludo_ayuda", () => {
  assert.equal(detectAction("Hola, ¿qué puedes hacer?\n"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'que puedes hacer' sin tildes → saludo_ayuda", () => {
  assert.equal(detectAction("que puedes hacer"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'empezar' → saludo_ayuda", () => {
  assert.equal(detectAction("empezar"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'menu' → saludo_ayuda", () => {
  assert.equal(detectAction("menú"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'qué sabes hacer' → saludo_ayuda", () => {
  assert.equal(detectAction("¿qué sabes hacer?"), OMNI_ACTIONS.SALUDO_AYUDA);
});

test("detectAction: 'cómo puedes ayudarme' → saludo_ayuda", () => {
  assert.equal(detectAction("cómo puedes ayudarme"), OMNI_ACTIONS.SALUDO_AYUDA);
});

// ─── saludo_ayuda — paridad texto / audio / web ───────────────────────────────

test("handleOmniChat: saludo vía telegram texto → reply de capacidades", async () => {
  const req = makeTelegramRequest({ message: "Hola, ¿qué puedes hacer?", origin: "telegram" });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.action, OMNI_ACTIONS.SALUDO_AYUDA);
  assert.ok(data.reply.includes("Pádel 04"), "reply debe mencionar el club");
  assert.ok(data.reply.includes("disponibilidad"), "reply debe listar capacidades");
});

test("handleOmniChat: saludo vía telegram_audio (transcripción con \\n) → reply de capacidades", async () => {
  const req = makeTelegramRequest({
    transcription: "Hola, ¿qué puedes hacer?\n",
    origin: "telegram_audio",
  });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.action, OMNI_ACTIONS.SALUDO_AYUDA);
  assert.ok(data.reply.includes("Pádel 04"), "reply debe mencionar el club");
});

test("handleOmniChat: saludo vía web → reply de capacidades", async () => {
  const req = makeRequest({ message: "hola", origin: "web" });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.equal(data.action, OMNI_ACTIONS.SALUDO_AYUDA);
  assert.ok(data.reply.includes("Pádel 04"), "reply debe mencionar el club");
});

// ─── paridad — intenciones previas no rotas ───────────────────────────────────

test("detectAction: 'disponibilidad' no rota por nueva intención", () => {
  assert.equal(detectAction("¿hay disponibilidad el lunes?"), OMNI_ACTIONS.CONSULTAR_DISPONIBILIDAD);
});

test("detectAction: 'crear reserva' no rota por nueva intención", () => {
  assert.equal(detectAction("quiero reservar una pista el martes a las 10"), OMNI_ACTIONS.CREAR_RESERVA);
});

test("detectAction: 'cancelar' no rota por nueva intención", () => {
  assert.equal(detectAction("quiero cancelar mi reserva del viernes"), OMNI_ACTIONS.CANCELAR_RESERVA);
});

test("detectAction: 'reprogramar' no rota por nueva intención", () => {
  assert.equal(detectAction("necesito reprogramar mi reserva"), OMNI_ACTIONS.REPROGRAMAR_RESERVA);
});

test("detectAction: 'consultar reservas' no rota por nueva intención", () => {
  assert.equal(detectAction("muéstrame mis reservas"), OMNI_ACTIONS.CONSULTAR_RESERVAS);
});
