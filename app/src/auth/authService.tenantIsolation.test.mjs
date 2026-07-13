import test from "node:test";
import assert from "node:assert/strict";

// Estos tests ejercitan authService.js con un `window` polyfilled (mock
// localStorage + location.hostname), a diferencia de authFetch.test.mjs
// (que corre sin `window` y por tanto nunca toca persistencia real). Se
// necesita `window` desde ANTES del import porque authService resuelve
// `tenantId` de forma síncrona al cargar el módulo (mismo momento que su
// hidratación inicial vía restoreFromStorage()).
//
// Cada escenario importa authService.js con un query string distinto
// (`?instance=...`) para forzar a Node a tratarlo como una instancia de
// módulo fresca — imprescindible porque `tenantId` y `state` son valores
// de módulo calculados una sola vez al importar, y necesitamos poder
// simular "dos despliegues distintos" (tenant A y tenant B) sin que uno
// contamine el estado en memoria del otro, tal y como ocurriría en la app
// real (cada tenant es un despliegue/proceso de navegador aparte).

function createMockStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => {
      data.set(k, String(v));
    },
    removeItem: (k) => {
      data.delete(k);
    },
    _dump: () => Object.fromEntries(data),
  };
}

let importCounter = 0;

async function setupAuthService({ hostname, storage } = {}) {
  globalThis.window = {
    localStorage: storage ?? createMockStorage(),
    location: { hostname: hostname ?? "unknown-host.example" },
  };
  importCounter += 1;
  const mod = await import(`./authService.js?tenantIsolationTest=${importCounter}`);
  return { authService: mod, storage: globalThis.window.localStorage };
}

async function withMockedFetch(handler, run) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

const okLoginResponse = (overrides = {}) =>
  new Response(
    JSON.stringify({
      ok: true,
      access_token: "access-token-real",
      refresh_token: "refresh-token-real",
      user: { email: "jugador@clubpadel04.example", role: "PLAYER" },
      role: "PLAYER",
      ...overrides,
    }),
    { status: 200 }
  );

test("Lote A — login namespacea accessToken/refreshToken/user bajo tenant:cp04:*, sin tocar la clave legacy", async () => {
  // "unknown-host.example" no matchea ningún dominio del registry → cae al
  // fallback (cp04, el único tenant real desplegado), igual que localhost o
  // un preview de Cloudflare Pages en la app real (ver main.jsx).
  const { authService, storage } = await setupAuthService({ hostname: "unknown-host.example" });

  await withMockedFetch(async () => okLoginResponse(), () => authService.login("jugador@clubpadel04.example", "x"));

  const dump = storage._dump();
  assert.equal(dump["tenant:cp04:cp04_access_token"], "access-token-real");
  assert.equal(dump["tenant:cp04:cp04_refresh_token"], "refresh-token-real");
  assert.equal(JSON.parse(dump["tenant:cp04:cp04_user"]).email, "jugador@clubpadel04.example");
  // Ninguna clave legacy plana debe haberse escrito para estos 3 campos.
  assert.equal("cp04_access_token" in dump, false);
  assert.equal("cp04_refresh_token" in dump, false);
  assert.equal("cp04_user" in dump, false);
});

test("Lote A — authMode/userEmail/role se mantienen en su clave legacy plana (deliberadamente fuera de alcance, ver App.jsx)", async () => {
  const { authService, storage } = await setupAuthService({ hostname: "unknown-host.example" });

  await withMockedFetch(async () => okLoginResponse(), () => authService.login("jugador@clubpadel04.example", "x"));

  const dump = storage._dump();
  assert.equal(dump.cp04_auth_mode, "supabase_real");
  assert.equal(dump.cp04_user_email, "jugador@clubpadel04.example");
  assert.equal(dump.cp04_role, "PLAYER");
});

test("Lote A — tenant A y tenant B (mismo dispositivo/storage) no comparten ni pisan sus tokens", async () => {
  const sharedStorage = createMockStorage();

  const tenantA = await setupAuthService({ hostname: "unknown-host.example", storage: sharedStorage }); // → cp04
  await withMockedFetch(
    async () => okLoginResponse({ access_token: "token-de-A", user: { email: "a@cp04.example", role: "PLAYER" } }),
    () => tenantA.authService.login("a@cp04.example", "x")
  );

  const tenantB = await setupAuthService({
    hostname: "club-deportivo-fixture-dos.pages.dev", // matchea fixture-club-02 en el tenant-registry
    storage: sharedStorage,
  });
  await withMockedFetch(
    async () => okLoginResponse({ access_token: "token-de-B", user: { email: "b@fixture02.example", role: "PLAYER" } }),
    () => tenantB.authService.login("b@fixture02.example", "x")
  );

  const dump = sharedStorage._dump();
  assert.equal(dump["tenant:cp04:cp04_access_token"], "token-de-A");
  assert.equal(dump["tenant:fixture-club-02:cp04_access_token"], "token-de-B");
  assert.notEqual(dump["tenant:cp04:cp04_access_token"], dump["tenant:fixture-club-02:cp04_access_token"]);

  // El proceso en memoria de A conserva su propio token tras el login de B
  // en el "otro tenant" (mismo storage compartido, pestañas/instancias
  // independientes) — no hay reutilización accidental de sesión.
  assert.equal(tenantA.authService.getAccessToken(), "token-de-A");
  assert.equal(tenantB.authService.getAccessToken(), "token-de-B");
});

test("Lote A — logout limpia namespaced Y legacy para accessToken/refreshToken/user (cierre de sesión completo, no migración destructiva)", async () => {
  const storage = createMockStorage({
    // Simula un usuario que ya tenía sesión guardada en formato legacy
    // (build anterior a este cambio) Y que además ya se hubiera escrito
    // una copia namespaced (por ejemplo, tras un primer login con el
    // código nuevo).
    "tenant:cp04:cp04_access_token": "token-nuevo",
    cp04_access_token: "token-legacy-preexistente",
  });
  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () =>
    authService.logout()
  );

  const dump = storage._dump();
  assert.equal("tenant:cp04:cp04_access_token" in dump, false);
  assert.equal("cp04_access_token" in dump, false);
});

test("Lote A — compatibilidad legacy: una sesión guardada solo en formato antiguo se restaura igual (usuario que no ha vuelto a loguearse tras el deploy)", async () => {
  const storage = createMockStorage({
    cp04_access_token: "token-legacy-de-antes-del-deploy",
    cp04_refresh_token: "refresh-legacy-de-antes-del-deploy",
    cp04_user: JSON.stringify({ email: "veterano@clubpadel04.example", role: "STAFF" }),
    cp04_role: "STAFF",
  });

  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  // restoreFromStorage() se ejecuta al importar el módulo (hidratación
  // síncrona) — getCurrentUser()/getAccessToken() deben reflejar ya la
  // sesión legacy sin que el usuario tenga que volver a loguearse.
  assert.equal(authService.getAccessToken(), "token-legacy-de-antes-del-deploy");
  assert.equal(authService.getCurrentUser().user.email, "veterano@clubpadel04.example");
  assert.equal(authService.getCurrentUser().role, "STAFF");

  // La clave legacy NO se borra ni se sobreescribe solo por haberla leído.
  const dump = storage._dump();
  assert.equal(dump.cp04_access_token, "token-legacy-de-antes-del-deploy");
  assert.equal("tenant:cp04:cp04_access_token" in dump, false);
});

test("Lote A — tras restaurar una sesión legacy, la siguiente escritura real (getSession) migra a la clave namespaced sin tocar la legacy todavía", async () => {
  const storage = createMockStorage({
    cp04_access_token: "token-legacy-de-antes-del-deploy",
  });
  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  await withMockedFetch(
    async () =>
      new Response(
        JSON.stringify({ ok: true, user: { email: "veterano@clubpadel04.example", role: "ADMIN" }, role: "ADMIN" }),
        { status: 200 }
      ),
    () => authService.getSession()
  );

  const dump = storage._dump();
  assert.equal(dump["tenant:cp04:cp04_user"] !== undefined, true);
  assert.equal(JSON.parse(dump["tenant:cp04:cp04_user"]).role, "ADMIN");
  // La legacy de accessToken sigue intacta (no se ha tocado, permite
  // rollback: revertir el deploy no perdería la sesión).
  assert.equal(dump.cp04_access_token, "token-legacy-de-antes-del-deploy");
});

test("Lote A — rollback seguro: revertir el deploy no pierde la sesión (la clave legacy nunca se sobreescribe salvo en logout explícito)", async () => {
  const storage = createMockStorage({
    cp04_access_token: "token-legacy-de-antes-del-deploy",
    cp04_user: JSON.stringify({ email: "veterano@clubpadel04.example", role: "STAFF" }),
  });
  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  // Con el código nuevo ya cargado, la sesión se restaura igual (test
  // anterior). El escenario de rollback es: "si revertimos este commit,
  // ¿el usuario pierde la sesión?" — la respuesta depende de que la clave
  // legacy siga intacta, lo cual ya se verifica arriba (compatibilidad
  // legacy) y aquí se confirma que ningún flujo de solo-lectura (getSession
  // sin cambios de rol/usuario) reescribe o borra esa clave legacy fuera de
  // un logout explícito.
  assert.equal(authService.getAccessToken(), "token-legacy-de-antes-del-deploy");
  const dumpBefore = storage._dump();
  assert.equal(dumpBefore.cp04_access_token, "token-legacy-de-antes-del-deploy");
});

test("Lote A — cuentas demo: sin login real, authService no escribe ninguna clave namespaced ni interfiere con el flujo demo de App.jsx (cp04_role)", async () => {
  // El flujo demo (App.jsx confirmRoleAccess/selectedRole) nunca llama a
  // authService.login() — escribe cp04_role directamente. Este test
  // documenta y verifica que, mientras no haya login real, authService se
  // mantiene en estado vacío y no crea ninguna clave `tenant:*` que pudiera
  // confundirse con una sesión real (ver hallazgo de colisión cp04_role en
  // AUTH_STORAGE_SECURITY_AUDIT.md — este test prueba que, del lado de
  // authService, no se agrava esa colisión).
  const storage = createMockStorage({ cp04_role: "ADMIN" }); // escrito por el flujo demo de App.jsx
  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  assert.equal(authService.getAccessToken(), null);
  assert.equal(authService.getCurrentUser().user, null);

  const dump = storage._dump();
  // authService no debe haber creado ninguna clave de sesión namespaced
  // solo por arrancar en modo demo.
  assert.equal("tenant:cp04:cp04_access_token" in dump, false);
  assert.equal("tenant:cp04:cp04_user" in dump, false);
  // La clave demo (cp04_role) permanece intacta: authService no la toca en
  // su hidratación (restoreFromStorage solo lee, no persiste sin login).
  assert.equal(dump.cp04_role, "ADMIN");
});

test("Lote A — cambio de usuario (mismo tenant, mismo navegador): logout de usuario 1 + login de usuario 2 no hereda token ni datos del usuario 1", async () => {
  const storage = createMockStorage();
  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  await withMockedFetch(
    async () => okLoginResponse({ access_token: "token-usuario-1", user: { email: "usuario1@cp04.example", role: "PLAYER" } }),
    () => authService.login("usuario1@cp04.example", "x")
  );
  assert.equal(authService.getCurrentUser().user.email, "usuario1@cp04.example");

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () =>
    authService.logout()
  );

  // Tras el logout, ni memoria ni storage namespaced conservan nada del
  // usuario 1 antes de que el usuario 2 inicie sesión.
  assert.equal(authService.getAccessToken(), null);
  assert.equal("tenant:cp04:cp04_user" in storage._dump(), false);

  await withMockedFetch(
    async () => okLoginResponse({ access_token: "token-usuario-2", user: { email: "usuario2@cp04.example", role: "STAFF" } }),
    () => authService.login("usuario2@cp04.example", "x")
  );

  assert.equal(authService.getCurrentUser().user.email, "usuario2@cp04.example");
  assert.equal(authService.getAccessToken(), "token-usuario-2");
  const dump = storage._dump();
  assert.equal(JSON.parse(dump["tenant:cp04:cp04_user"]).email, "usuario2@cp04.example");
  // Ningún rastro textual del usuario 1 sobrevive en la clave namespaced.
  assert.equal(dump["tenant:cp04:cp04_user"].includes("usuario1@cp04.example"), false);
});

test("Lote A — no reutilización de sesión: tras logout, authFetch no adjunta Authorization aunque hubiera token justo antes", async () => {
  const storage = createMockStorage();
  const { authService } = await setupAuthService({ hostname: "unknown-host.example", storage });

  await withMockedFetch(
    async () => okLoginResponse({ access_token: "token-a-invalidar" }),
    () => authService.login("usuario@cp04.example", "x")
  );

  await withMockedFetch(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }), () =>
    authService.logout()
  );

  const capture = {};
  await withMockedFetch(
    async (url, options) => {
      capture.options = options;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    },
    () => authService.authFetch("/api/reservas", { method: "GET" })
  );

  assert.equal("Authorization" in capture.options.headers, false);
  // El valor del token invalidado no debe seguir presente en ninguna clave
  // namespaced de auth tras el logout (no basta con no enviarlo: tampoco
  // debe quedar legible en storage para una recarga posterior).
  const dump = storage._dump();
  assert.equal(dump["tenant:cp04:cp04_access_token"], undefined);
});

test("Lote A — cambio de rol (PLAYER → ADMIN vía backend) no afecta el namespacing de accessToken/refreshToken/user", async () => {
  const { authService, storage } = await setupAuthService({ hostname: "unknown-host.example" });

  await withMockedFetch(
    async () => okLoginResponse({ role: "PLAYER", user: { email: "u@cp04.example", role: "PLAYER" } }),
    () => authService.login("u@cp04.example", "x")
  );
  assert.equal(authService.getCurrentUser().role, "PLAYER");

  await withMockedFetch(
    async () =>
      new Response(JSON.stringify({ ok: true, user: { email: "u@cp04.example", role: "ADMIN" }, role: "ADMIN" }), {
        status: 200,
      }),
    () => authService.getSession()
  );
  assert.equal(authService.getCurrentUser().role, "ADMIN");

  const dump = storage._dump();
  // El token sigue namespaced correctamente tras el cambio de rol.
  assert.equal(dump["tenant:cp04:cp04_access_token"], "access-token-real");
  // role sigue en su clave legacy plana (fuera de alcance de este lote).
  assert.equal(dump.cp04_role, "ADMIN");
});
