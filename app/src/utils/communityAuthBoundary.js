// Club Pádel 04 · CommunityAuthBoundary — interfaz de identidad para Comunidad.
//
// Principios (heredados de worker-reservas/auth/authorization.js):
//   - actorId/clubId NUNCA se aceptan libremente del cliente.
//   - La única fuente fiable es el proveedor de identidad verificado.
//   - Si auth no disponible → isAuthenticated()=false.
//   - Age status NO viene de auth — viene de communityAgePolicy verificado aparte.
//
// Implementaciones disponibles:
//   1. DemoCommunityAuthBoundary — valores demo hardcodeados (tests/UI demo)
//   2. WorkerBackedCommunityAuthBoundary — llama a /api/auth/me del Worker
//   3. SupabaseCommunityAuthBoundary — llama directamente a Supabase /auth/v1/user
//
// AUTH REMOTO: PENDIENTE — ninguna implementación conecta a producción.
// Para producción: WorkerBackedCommunityAuthBoundary es la opción preferida
// porque el Worker ya tiene Supabase configurado con secrets reales.

import { AGE_STATUS, isCommunityAllowed } from "./communityAgePolicy.js";

export { AGE_STATUS, isCommunityAllowed };

// Tipo de error de auth no disponible.
export const AUTH_REQUIRED = "auth_required";

// --------------------------------------------------------------------------
// Contrato CommunityAuthBoundary
// --------------------------------------------------------------------------

/**
 * Valida que un objeto implementa el contrato CommunityAuthBoundary.
 * { valid, missing }
 */
export function validateAuthBoundary(boundary) {
  const required = [
    "isAuthenticated",
    "getActorId",
    "getClubId",
    "getRole",
    "getAuthToken",
  ];
  const missing = required.filter((m) => typeof boundary?.[m] !== "function");
  return { valid: missing.length === 0, missing };
}

// --------------------------------------------------------------------------
// DemoCommunityAuthBoundary — para tests y demo de UI
// --------------------------------------------------------------------------

/**
 * AuthBoundary de demo. Devuelve valores configurables sin autenticación real.
 * Solo usar en tests y en el modo demo de la UI.
 *
 * @param {object} options
 * @param {string} options.actorId  — ID de actor demo (ej: "demo-user-1")
 * @param {string} options.clubId   — ID de club demo (ej: "club-demo-04")
 * @param {string} [options.role]   — rol del actor ("PLAYER", "STAFF", "ADMIN", "SUPPORT")
 * @param {string} [options.ageStatus] — estado de edad del actor (AGE_STATUS value)
 * @param {boolean} [options.authenticated] — si el usuario está "autenticado" (default: true)
 */
export function createDemoCommunityAuthBoundary({
  actorId,
  clubId,
  role = "PLAYER",
  ageStatus = AGE_STATUS.ADULT_VERIFIED,
  authenticated = true,
} = {}) {
  if (!actorId || !clubId) {
    throw new Error("createDemoCommunityAuthBoundary: actorId y clubId son requeridos");
  }

  return {
    async isAuthenticated() { return authenticated; },
    async getActorId() { return authenticated ? actorId : null; },
    async getClubId() { return authenticated ? clubId : null; },
    async getRole() { return authenticated ? role : null; },
    async getAuthToken() { return authenticated ? `demo-token-${actorId}` : null; },
    async getAgeStatus() { return ageStatus; },
    async isCommunityAllowed() {
      const { allowed, reason } = isCommunityAllowed(ageStatus);
      return { allowed, reason };
    },
    _type: "demo",
  };
}

// --------------------------------------------------------------------------
// WorkerBackedCommunityAuthBoundary — usa el Worker cp04-reservas
// --------------------------------------------------------------------------

/**
 * AuthBoundary que obtiene la identidad desde el Worker /api/auth/me.
 * El Worker ya tiene Supabase configurado con secrets reales — este boundary
 * reutiliza esa verificación sin exponer credenciales al frontend.
 *
 * AUTH REMOTO: PENDIENTE — requiere Worker con Supabase configurado.
 * En dev/test local el Worker puede responder con backend_stub.
 *
 * @param {object} options
 * @param {string} [options.workerBaseUrl] — URL base del Worker (default: "")
 * @param {function} [options.fetchFn] — override de fetch (para tests)
 * @param {function} [options.getStoredToken] — función que devuelve el token guardado
 */
export function createWorkerBackedAuthBoundary({
  workerBaseUrl = "",
  fetchFn = null,
  getStoredToken = null,
} = {}) {
  const _fetch = fetchFn ?? (typeof fetch !== "undefined" ? fetch : null);
  const _base = String(workerBaseUrl).replace(/\/+$/, "");

  let _cachedUser = null;
  let _cachedExpiry = 0;
  const CACHE_TTL_MS = 30_000; // 30s cache de identidad

  async function _getToken() {
    if (typeof getStoredToken === "function") return getStoredToken();
    // Fallback: nada almacenado
    return null;
  }

  async function _fetchMe() {
    if (!_fetch) return null;
    const token = await _getToken();
    if (!token) return null;

    try {
      const resp = await _fetch(`${_base}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      return data?.user ?? null;
    } catch {
      return null;
    }
  }

  async function _getUser() {
    const now = Date.now();
    if (_cachedUser && now < _cachedExpiry) return _cachedUser;

    const user = await _fetchMe();
    _cachedUser = user;
    _cachedExpiry = now + (user ? CACHE_TTL_MS : 5_000); // cache corta en fallo
    return user;
  }

  return {
    async isAuthenticated() {
      const user = await _getUser();
      return user !== null;
    },

    async getActorId() {
      const user = await _getUser();
      return user?.id ?? user?.auth_user_id ?? null;
    },

    async getClubId() {
      const user = await _getUser();
      // El clubId viene de app_metadata del JWT verificado por el Worker.
      return user?.app_metadata?.club_id ?? user?.user_metadata?.club_id ?? null;
    },

    async getRole() {
      const user = await _getUser();
      return user?.app_metadata?.role ?? user?.user_metadata?.role ?? null;
    },

    async getAuthToken() {
      return _getToken();
    },

    async getAgeStatus() {
      // El estado de edad NO viene del JWT — viene de communityAgePolicy
      // verificado independientemente. Esta implementación devuelve AGE_UNKNOWN
      // por defecto: el bridge es responsable de resolver el estado real.
      return AGE_STATUS.AGE_UNKNOWN;
    },

    async isCommunityAllowed() {
      const ageStatus = await this.getAgeStatus();
      const { allowed, reason } = isCommunityAllowed(ageStatus);
      return { allowed, reason };
    },

    // Solo para tests — invalida el cache
    __invalidateCache() {
      _cachedUser = null;
      _cachedExpiry = 0;
    },

    _type: "worker_backed",
  };
}

// --------------------------------------------------------------------------
// SupabaseCommunityAuthBoundary — llamada directa a Supabase /auth/v1/user
// --------------------------------------------------------------------------

/**
 * AuthBoundary que llama directamente a Supabase /auth/v1/user.
 * Requiere SUPABASE_URL y SUPABASE_ANON_KEY.
 *
 * AUTH REMOTO: PENDIENTE — requiere Supabase configurado.
 *
 * @param {object} options
 * @param {string} options.supabaseUrl     — URL base de Supabase
 * @param {string} options.supabaseAnonKey — anon key
 * @param {function} [options.getStoredToken] — función que devuelve el JWT
 * @param {function} [options.fetchFn] — override de fetch (para tests)
 */
export function createSupabaseAuthBoundary({
  supabaseUrl,
  supabaseAnonKey,
  getStoredToken = null,
  fetchFn = null,
} = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Devolver boundary bloqueado pero con interfaz correcta
    return createDemoCommunityAuthBoundary({
      actorId: "blocked",
      clubId: "blocked",
      authenticated: false,
    });
  }

  const _fetch = fetchFn ?? (typeof fetch !== "undefined" ? fetch : null);
  const _base = String(supabaseUrl).replace(/\/+$/, "");

  let _cachedUser = null;
  let _cachedExpiry = 0;
  const CACHE_TTL_MS = 30_000;

  async function _getToken() {
    if (typeof getStoredToken === "function") return getStoredToken();
    return null;
  }

  async function _fetchSupabaseUser() {
    if (!_fetch) return null;
    const token = await _getToken();
    if (!token) return null;

    try {
      const resp = await _fetch(`${_base}/auth/v1/user`, {
        headers: {
          "apikey": supabaseAnonKey,
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }

  async function _getUser() {
    const now = Date.now();
    if (_cachedUser && now < _cachedExpiry) return _cachedUser;
    const user = await _fetchSupabaseUser();
    _cachedUser = user;
    _cachedExpiry = now + (user ? CACHE_TTL_MS : 5_000);
    return user;
  }

  return {
    async isAuthenticated() {
      const user = await _getUser();
      return user !== null;
    },

    async getActorId() {
      const user = await _getUser();
      return user?.id ?? null;
    },

    async getClubId() {
      const user = await _getUser();
      // club_id debe venir de app_metadata (set por admin, no por el usuario).
      return user?.app_metadata?.club_id ?? null;
    },

    async getRole() {
      const user = await _getUser();
      return user?.app_metadata?.role ?? null;
    },

    async getAuthToken() {
      return _getToken();
    },

    async getAgeStatus() {
      return AGE_STATUS.AGE_UNKNOWN; // resolver externamente con communityAgePolicy
    },

    async isCommunityAllowed() {
      const ageStatus = await this.getAgeStatus();
      const { allowed, reason } = isCommunityAllowed(ageStatus);
      return { allowed, reason };
    },

    __invalidateCache() {
      _cachedUser = null;
      _cachedExpiry = 0;
    },

    _type: "supabase_direct",
  };
}
