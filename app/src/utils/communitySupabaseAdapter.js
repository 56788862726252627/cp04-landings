// Club Pádel 04 · SupabaseCommunityAdapter — REST adapter sin SDK.
//
// Implementa el contrato de BackendAdapter (validateBackendAdapter de P1.4)
// usando fetch() directo a la REST API de Supabase — mismo patrón que
// worker-reservas/auth/authorization.js — sin @supabase/supabase-js.
//
// SUPABASE REMOTO: BLOQUEADO POR CONFIGURACIÓN/ENTORNO
// — sin SUPABASE_URL ni SUPABASE_ANON_KEY configurados en este entorno.
//
// Arquitectura de snapshot:
//   community_store_snapshots(club_id PK, data JSONB, version INT)
//   → readAll  = GET snapshot
//   → writeAll = PATCH with version check (optimistic lock via RPC)
//   Idempotency → SELECT/UPSERT community_idempotency
//
// Para conectar cuando el entorno esté disponible:
//   const adapter = createSupabaseCommunityAdapter({
//     supabaseUrl: process.env.VITE_SUPABASE_URL,
//     supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY,
//     authToken: sessionToken,  // JWT de Supabase Auth
//   });
//   const repo = createBackendCommunityRepository(clubId, adapter);

import {
  COMMUNITY_ERROR_TYPES,
  createCommunityError,
} from "./communityRepository.js";

// Tipo de error específico para este adapter.
export const SUPABASE_ADAPTER_BLOCKED = "supabase_adapter_blocked";

// --------------------------------------------------------------------------
// Normalización de errores PostgREST
// --------------------------------------------------------------------------

function normalizePostgrestError(status, body) {
  if (status === 401 || status === 403) {
    return createCommunityError(COMMUNITY_ERROR_TYPES.FORBIDDEN, body?.message || "No autorizado");
  }
  if (status === 404) {
    return createCommunityError(COMMUNITY_ERROR_TYPES.NOT_FOUND, body?.message || "No encontrado");
  }
  if (status === 409) {
    return createCommunityError(COMMUNITY_ERROR_TYPES.CONFLICT, body?.message || "Conflicto");
  }
  if (status >= 500) {
    return { type: "backend_unavailable", message: body?.message || `Error del servidor: ${status}` };
  }
  return createCommunityError(COMMUNITY_ERROR_TYPES.INTERNAL, body?.message || `HTTP ${status}`);
}

// --------------------------------------------------------------------------
// createBlockedAdapter — placeholder cuando Supabase no está configurado
// --------------------------------------------------------------------------

export function createBlockedSupabaseAdapter(reason = "Supabase no configurado") {
  const blockedError = { type: SUPABASE_ADAPTER_BLOCKED, message: reason };

  return {
    async readAll(_clubId) {
      return { ok: false, error: blockedError };
    },
    async writeAll(_clubId, _data, _expectedVersion) {
      return { ok: false, error: blockedError };
    },
    async isIdempotencyKeyUsed(_clubId, _key) {
      return false;
    },
    async markIdempotencyKey(_clubId, _key, _result) {
      // no-op — bloqueado
    },
    async getIdempotencyResult(_clubId, _key) {
      return null;
    },
    isBlocked: true,
    blockedReason: reason,
  };
}

// --------------------------------------------------------------------------
// createSupabaseCommunityAdapter
// --------------------------------------------------------------------------

/**
 * Crea un adapter Supabase para BackendCommunityRepository.
 *
 * Si supabaseUrl o supabaseAnonKey no están disponibles,
 * devuelve un createBlockedSupabaseAdapter.
 *
 * @param {object} options
 * @param {string} options.supabaseUrl    — URL base de Supabase (sin trailing slash)
 * @param {string} options.supabaseAnonKey — anon key de Supabase
 * @param {string} [options.authToken]    — JWT del usuario autenticado (para RLS)
 * @param {function} [options.fetchFn]    — override de fetch (para tests)
 */
export function createSupabaseCommunityAdapter({
  supabaseUrl,
  supabaseAnonKey,
  authToken = null,
  fetchFn = null,
} = {}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return createBlockedSupabaseAdapter(
      "SUPABASE_URL y SUPABASE_ANON_KEY son requeridos. " +
      "SUPABASE REMOTO: BLOQUEADO POR CONFIGURACIÓN/ENTORNO."
    );
  }

  const _fetch = fetchFn ?? fetch;
  const _baseUrl = String(supabaseUrl).replace(/\/+$/, "");

  function _headers(extra = {}) {
    const h = {
      "Content-Type": "application/json",
      "apikey": supabaseAnonKey,
      "Accept": "application/json",
      ...extra,
    };
    if (authToken) h["Authorization"] = `Bearer ${authToken}`;
    return h;
  }

  // Llama a la REST API de Supabase (PostgREST).
  async function _rest(method, path, body = null, queryParams = "") {
    const url = `${_baseUrl}/rest/v1${path}${queryParams ? "?" + queryParams : ""}`;
    const opts = {
      method,
      headers: _headers(),
    };
    if (body !== null) opts.body = JSON.stringify(body);

    let resp;
    try {
      resp = await _fetch(url, opts);
    } catch (e) {
      return { ok: false, error: { type: "backend_unavailable", message: e?.message || "Network error" } };
    }

    let data = null;
    try {
      const text = await resp.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!resp.ok) {
      return { ok: false, error: normalizePostgrestError(resp.status, data) };
    }
    return { ok: true, data };
  }

  // Llama a una función RPC de Supabase (para operaciones atómicas).
  async function _rpc(fnName, params) {
    const url = `${_baseUrl}/rest/v1/rpc/${fnName}`;
    let resp;
    try {
      resp = await _fetch(url, {
        method: "POST",
        headers: _headers(),
        body: JSON.stringify(params),
      });
    } catch (e) {
      return { ok: false, error: { type: "backend_unavailable", message: e?.message || "Network error" } };
    }

    let data = null;
    try {
      const text = await resp.text();
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }

    if (!resp.ok) {
      return { ok: false, error: normalizePostgrestError(resp.status, data) };
    }
    return { ok: true, data };
  }

  return {
    isBlocked: false,

    /**
     * Lee el snapshot del store para el club.
     * Tabla: community_store_snapshots(club_id, data, version)
     */
    async readAll(clubId) {
      const result = await _rest(
        "GET",
        "/community_store_snapshots",
        null,
        `club_id=eq.${encodeURIComponent(clubId)}&select=data,version`
      );
      if (!result.ok) return result;

      const rows = Array.isArray(result.data) ? result.data : [];
      if (rows.length === 0) {
        // Sin snapshot: store vacío, version 0
        return { ok: true, data: _emptyStore(), version: 0 };
      }
      const row = rows[0];
      return { ok: true, data: row.data ?? _emptyStore(), version: row.version ?? 0 };
    },

    /**
     * Escribe el snapshot del store para el club con locking optimista.
     * Usa RPC community_write_snapshot(p_club_id, p_data, p_expected_version)
     * que devuelve { ok, version } o { ok: false, error: 'conflict' }.
     */
    async writeAll(clubId, data, expectedVersion) {
      const result = await _rpc("community_write_snapshot", {
        p_club_id: clubId,
        p_data: data,
        p_expected_version: typeof expectedVersion === "number" ? expectedVersion : null,
      });
      if (!result.ok) return result;

      // La RPC devuelve { version: N } si ok, o { error: 'conflict' }
      if (result.data?.error === "conflict") {
        return {
          ok: false,
          error: createCommunityError(
            COMMUNITY_ERROR_TYPES.CONFLICT,
            `Conflicto de versión: snapshot modificado concurrentemente`
          ),
        };
      }
      return { ok: true, version: result.data?.version ?? 1 };
    },

    /**
     * Comprueba si una clave de idempotencia ya existe para el club.
     */
    async isIdempotencyKeyUsed(clubId, key) {
      const result = await _rest(
        "GET",
        "/community_idempotency",
        null,
        `club_id=eq.${encodeURIComponent(clubId)}&idem_key=eq.${encodeURIComponent(key)}&select=id`
      );
      if (!result.ok) return false; // en caso de error, asumir no usada (conservador)
      return Array.isArray(result.data) && result.data.length > 0;
    },

    /**
     * Registra una clave de idempotencia con su resultado.
     */
    async markIdempotencyKey(clubId, key, idemResult) {
      // UPSERT con ON CONFLICT DO NOTHING — Prefer=resolution=ignore-duplicates
      await _rest(
        "POST",
        "/community_idempotency",
        {
          club_id: clubId,
          idem_key: key,
          result: idemResult,
        },
        "on_conflict=club_id,idem_key"
      );
      // No devolvemos resultado — la clave se marca o ya existía.
    },

    /**
     * Recupera el resultado de una clave de idempotencia.
     */
    async getIdempotencyResult(clubId, key) {
      const result = await _rest(
        "GET",
        "/community_idempotency",
        null,
        `club_id=eq.${encodeURIComponent(clubId)}&idem_key=eq.${encodeURIComponent(key)}&select=result`
      );
      if (!result.ok) return null;
      const rows = Array.isArray(result.data) ? result.data : [];
      return rows.length > 0 ? rows[0].result : null;
    },
  };
}

// Store vacío para cuando no hay snapshot previo.
function _emptyStore() {
  return {
    userProfiles: [],
    playerSocialProfiles: [],
    playerStats: [],
    friendships: [],
    follows: [],
    posts: [],
    comments: [],
    reactions: [],
    openMatches: [],
    matchInvites: [],
    groups: [],
    groupMembers: [],
    eventRegistrations: [],
    socialRankings: [],
    notifications: [],
    reports: [],
    moderationActions: [],
    consents: [],
    auditLog: [],
  };
}

/**
 * Crea el adapter correcto según el entorno:
 * - Si hay URL+KEY: SupabaseAdapter real
 * - Si no: BlockedAdapter (para dev/tests)
 *
 * No lanza — siempre devuelve algo usable.
 */
export function createCommunityAdapterFromEnv(env = {}) {
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL || null;
  const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || null;
  const token = env.authToken || null;

  if (!url || !key) {
    return createBlockedSupabaseAdapter(
      "Variables VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY no encontradas. " +
      "Usando adapter bloqueado."
    );
  }

  return createSupabaseCommunityAdapter({ supabaseUrl: url, supabaseAnonKey: key, authToken: token });
}
