// Club Pádel 04 · authService
//
// Interfaz desacoplada del proveedor real de autenticación. Hoy habla con
// el Worker (worker-reservas), que a su vez delega en Supabase Auth cuando
// SUPABASE_URL/SUPABASE_ANON_KEY están configurados en el backend
// (ver worker-reservas/docs/ARQUITECTURA_AUTH_REAL_CP04.md).
//
// Si el backend responde "no configurado" (auth_ready:false / 501), esta
// capa lo traslada honestamente a quien la llama: NUNCA fabrica un login,
// una recuperación de contraseña o una sesión de éxito falsos.
//
// Cambiar de proveedor en el futuro (o añadir uno nuevo) implica tocar SOLO
// este archivo: AuthContext y App.jsx consumen exclusivamente las funciones
// exportadas aquí, nunca fetch()/localStorage directamente.

import { AUTH_MODES } from "./authTypes.js";

const AUTH_ENDPOINTS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  me: "/api/auth/me",
  forgotPassword: "/api/auth/forgot-password",
  changePassword: "/api/auth/change-password",
};

// Mismas claves que ya usaba App.jsx antes de esta fase: se mantiene el
// formato de almacenamiento para no romper nada que todavía las lea
// directamente durante la migración progresiva (ver Fase 6 del informe).
const STORAGE_KEYS = {
  accessToken: "cp04_access_token",
  refreshToken: "cp04_refresh_token",
  authMode: "cp04_auth_mode",
  user: "cp04_user",
  role: "cp04_role",
  userEmail: "cp04_user_email",
};

let state = {
  accessToken: null,
  refreshToken: null,
  user: null,
  role: null,
};

function safeLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function persist() {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    if (state.accessToken) {
      storage.setItem(STORAGE_KEYS.accessToken, state.accessToken);
      storage.setItem(STORAGE_KEYS.authMode, "supabase_real");
    } else {
      storage.removeItem(STORAGE_KEYS.accessToken);
    }

    if (state.refreshToken) {
      storage.setItem(STORAGE_KEYS.refreshToken, state.refreshToken);
    } else {
      storage.removeItem(STORAGE_KEYS.refreshToken);
    }

    if (state.user) {
      storage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
      if (state.user.email) storage.setItem(STORAGE_KEYS.userEmail, state.user.email);
    } else {
      storage.removeItem(STORAGE_KEYS.user);
      storage.removeItem(STORAGE_KEYS.userEmail);
    }

    if (state.role) {
      storage.setItem(STORAGE_KEYS.role, state.role);
    }
  } catch {
    // Almacenamiento no disponible (modo privado, cuota, etc.): la sesión
    // en memoria sigue siendo válida para esta pestaña.
  }
}

function clearPersisted() {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEYS.accessToken);
    storage.removeItem(STORAGE_KEYS.refreshToken);
    storage.removeItem(STORAGE_KEYS.authMode);
    storage.removeItem(STORAGE_KEYS.user);
    storage.removeItem(STORAGE_KEYS.userEmail);
    storage.removeItem(STORAGE_KEYS.role);
  } catch {
    // Nada que hacer si el almacenamiento no está disponible.
  }
}

function restoreFromStorage() {
  const storage = safeLocalStorage();
  if (!storage) return;

  try {
    const accessToken = storage.getItem(STORAGE_KEYS.accessToken);
    const refreshToken = storage.getItem(STORAGE_KEYS.refreshToken);
    const rawUser = storage.getItem(STORAGE_KEYS.user);
    const role = storage.getItem(STORAGE_KEYS.role);

    state = {
      accessToken: accessToken || null,
      refreshToken: refreshToken || null,
      user: rawUser ? JSON.parse(rawUser) : null,
      role: role || null,
    };
  } catch {
    // Si el JSON guardado está corrupto, arrancamos sin sesión (fail-closed)
    // en vez de propagar un usuario a medio parsear.
    state = { accessToken: null, refreshToken: null, user: null, role: null };
  }
}

// Hidratación inicial síncrona: getAccessToken()/getCurrentUser() deben
// poder responder de inmediato sin esperar un round-trip de red. La
// verificación real (¿sigue siendo válido este token?) es getSession(),
// que sí es asíncrona y la dispara AuthContext al montar.
restoreFromStorage();

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function login(email, password) {
  let response;
  try {
    response = await fetch(AUTH_ENDPOINTS.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { ok: false, error: "UPSTREAM_ERROR", message: "No se pudo contactar con el servidor de autenticación." };
  }

  const data = await readJsonSafe(response);

  if (!response.ok || !data?.ok) {
    return {
      ok: false,
      authReady: data?.auth_ready !== false,
      error: data?.error || "LOGIN_FAILED",
      message: data?.message || "No se pudo iniciar sesión.",
    };
  }

  const user = data.user || null;

  state = {
    accessToken: data.access_token || null,
    refreshToken: data.refresh_token || null,
    user,
    role: data.role || user?.role || null,
  };
  persist();

  return { ok: true, user: state.user, role: state.role };
}

export async function register({ name, email, password }) {
  let response;
  try {
    response = await fetch(AUTH_ENDPOINTS.register, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // El rol nunca lo decide el cliente: se envía "PLAYER" como valor
      // informativo, pero el Worker ya lo fija en servidor sin importar lo
      // que llegue aquí (ver worker-reservas/src/index.js, handler /api/auth/register).
      body: JSON.stringify({ name, email, password, role: "PLAYER" }),
    });
  } catch {
    return { ok: false, error: "UPSTREAM_ERROR", message: "No se pudo contactar con el servidor de autenticación." };
  }

  const data = await readJsonSafe(response);

  if (!response.ok || !data?.ok) {
    return {
      ok: false,
      authReady: data?.auth_ready !== false,
      error: data?.error || "REGISTER_FAILED",
      message: data?.message || "No se pudo crear la cuenta.",
    };
  }

  // Supabase normalmente no emite sesión en el signup hasta que se confirma
  // el email: no hay access_token/refresh_token que guardar aquí. Si algún
  // día el backend lo incluyera, seguiría sin autoiniciar sesión: registrar
  // una cuenta no debe equivaler a dejarla ya autenticada sin verificación.
  return {
    ok: true,
    user: data.user || null,
    role: data.role || data.user?.role || null,
    message: data.message || "",
  };
}

export async function logout(options = {}) {
  const scope = options.scope === "global" ? "global" : "local";
  const tokenToInvalidate = state.accessToken;

  state = { accessToken: null, refreshToken: null, user: null, role: null };
  clearPersisted();

  if (!tokenToInvalidate) {
    return { ok: true, message: "No había sesión que cerrar en servidor." };
  }

  try {
    const response = await fetch(AUTH_ENDPOINTS.logout, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenToInvalidate}`,
      },
      body: JSON.stringify({ scope }),
    });

    const data = await readJsonSafe(response);
    return { ok: Boolean(data?.ok), message: data?.message || "" };
  } catch {
    // Best-effort: el estado local YA quedó limpio arriba. Un fallo de red
    // aquí no debe impedir que el usuario "salga" de la app.
    return { ok: false, message: "No se pudo contactar con el backend para cerrar sesión." };
  }
}

export async function getSession() {
  if (!state.accessToken) {
    return { ok: false, error: "MISSING_TOKEN" };
  }

  let response;
  try {
    response = await fetch(AUTH_ENDPOINTS.me, {
      method: "GET",
      headers: { Authorization: `Bearer ${state.accessToken}` },
    });
  } catch {
    // Fallo de red al validar un token guardado (p.ej. sin conexión al
    // arrancar): no se puede confirmar la sesión, pero tampoco se debe
    // dejar una promesa sin capturar ni un estado a medias. Se trata igual
    // que un token inválido: fail-closed.
    state = { accessToken: null, refreshToken: null, user: null, role: null };
    clearPersisted();
    return { ok: false, error: "UPSTREAM_ERROR" };
  }

  const data = await readJsonSafe(response);

  if (!response.ok || !data?.ok) {
    // Token inválido/expirado: se limpia la sesión, nunca se deja "a medias".
    state = { accessToken: null, refreshToken: null, user: null, role: null };
    clearPersisted();
    return { ok: false, error: data?.error || "SESSION_INVALID", authReady: data?.auth_ready !== false };
  }

  state = { ...state, user: data.user || null, role: data.role || data.user?.role || null };
  persist();

  return { ok: true, user: state.user, role: state.role };
}

export async function refreshSession() {
  if (!state.refreshToken) {
    return { ok: false, error: "MISSING_REFRESH_TOKEN" };
  }

  let response;
  try {
    response = await fetch(AUTH_ENDPOINTS.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: state.refreshToken }),
    });
  } catch {
    return { ok: false, error: "UPSTREAM_ERROR", message: "No se pudo contactar con el backend para renovar la sesión." };
  }

  const data = await readJsonSafe(response);

  if (!response.ok || !data?.ok) {
    return {
      ok: false,
      authReady: data?.auth_ready !== false,
      error: data?.error || "REFRESH_FAILED",
      message: data?.message || "No se pudo renovar la sesión.",
    };
  }

  state = {
    ...state,
    accessToken: data.access_token || state.accessToken,
    refreshToken: data.refresh_token || state.refreshToken,
  };
  persist();

  return { ok: true };
}

export async function forgotPassword(email) {
  let response;
  try {
    response = await fetch(AUTH_ENDPOINTS.forgotPassword, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Fallo de red: honesto también, nunca se traduce en "email enviado".
    return { ok: false, authReady: false, message: "No se pudo contactar con el servidor." };
  }

  const data = await readJsonSafe(response);

  // auth_ready:false = backend_stub (proveedor aún no configurado). Es
  // información honesta para la UI: nunca se traduce en "email enviado"
  // si el backend no ha hecho nada de verdad.
  return {
    ok: Boolean(data?.ok),
    authReady: data?.auth_ready !== false,
    message: data?.message || "",
  };
}

export async function updatePassword(newPassword) {
  if (!state.accessToken) {
    return { ok: false, error: "MISSING_TOKEN", message: "No hay sesión activa." };
  }

  let response;
  try {
    response = await fetch(AUTH_ENDPOINTS.changePassword, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
  } catch {
    return { ok: false, error: "UPSTREAM_ERROR", message: "No se pudo contactar con el servidor." };
  }

  const data = await readJsonSafe(response);

  return {
    ok: Boolean(data?.ok),
    authReady: data?.auth_ready !== false,
    error: data?.error,
    message: data?.message || "",
  };
}

export function getAccessToken() {
  return state.accessToken;
}

// authFetch: wrapper mínimo sobre fetch() que adjunta
// `Authorization: Bearer <access_token>` cuando existe sesión, y no hace
// nada más. No decide qué endpoints son públicos ni protegidos (eso lo
// decide quien llama, usando fetch() normal para lo público y authFetch()
// para lo protegido); no transforma la respuesta ni intercepta 401 (el
// manejo de errores sigue en cada call site, igual que hoy). Así, en modo
// demo (sin access_token real) el comportamiento es idéntico al actual:
// la petición sale sin cabecera Authorization.
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = { ...(options.headers || {}) };

  // Nunca "Bearer " vacío/null/undefined: si no hay token, se omite la
  // cabecera por completo y el backend responde su propio fail-closed
  // (401 MISSING_TOKEN), igual que si se llamara sin este helper.
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(url, { ...options, headers });
}

export function getCurrentUser() {
  return { user: state.user, role: state.role };
}

export function getAuthMode() {
  const configured = String(import.meta.env?.VITE_CP04_AUTH_MODE || "").trim().toLowerCase();

  if (configured === AUTH_MODES.PRODUCTION) {
    return AUTH_MODES.PRODUCTION;
  }

  if (configured === AUTH_MODES.DEMO) {
    // Un AUTH_MODE=demo declarado explícitamente en un build de producción
    // se rebaja a "production" (fail-closed): nunca se activa demo por una
    // variable de entorno mal puesta en un despliegue real.
    return import.meta.env.DEV ? AUTH_MODES.DEMO : AUTH_MODES.PRODUCTION;
  }

  // Sin declarar explícitamente: en desarrollo asumimos demo (comportamiento
  // actual de la app), en un build de producción NUNCA caemos a demo por
  // defecto.
  return import.meta.env.DEV ? AUTH_MODES.DEMO : AUTH_MODES.PRODUCTION;
}
