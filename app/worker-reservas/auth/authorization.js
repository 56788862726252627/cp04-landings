// Club Pádel 04 · Capa de autorización reutilizable para el Worker.
//
// Principios de esta capa (no negociables):
// - El rol NUNCA se acepta desde el cliente (ni body, ni headers tipo X-Role).
// - El único rol de confianza es el que devuelve el proveedor de identidad
//   verificado en servidor (Supabase `app_metadata.role`).
// - Si no hay proveedor configurado, o el token no verifica, se deniega.
//   Nunca se finge una identidad "demo" para dejar pasar una petición.
// - Rol desconocido, ausente o no reconocido = sin permisos (no se asume PLAYER
//   por defecto aquí: ese "downgrade" amable es responsabilidad de la UI,
//   no de esta puerta de autorización).

export const CP04_AUTH_ROLES = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];

export const CP04_AUTH_PERMISSIONS = {
  PLAYER: ["inicio", "reservas", "torneos", "ranking", "perfil"],
  STAFF: ["inicio", "reservas", "alta_jugador", "reprogramar", "cancelar", "gestion", "torneos", "perfil"],
  ADMIN: ["inicio", "reservas", "alta_jugador", "reprogramar", "cancelar", "gestion", "torneos", "ranking", "admin", "perfil"],
  SUPPORT: ["inicio", "reservas", "alta_jugador", "reprogramar", "cancelar", "gestion", "torneos", "ranking", "admin", "flujos_make", "soporte", "perfil"],
};

export function parseAuthorizationHeader(request) {
  const raw = request?.headers?.get?.("Authorization") || "";
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

// Resolución ESTRICTA: a diferencia del normalizador usado para pintar la UI
// (que degrada un rol desconocido a PLAYER por comodidad visual), aquí un rol
// que no está en la lista oficial se considera inválido, no PLAYER.
export function resolveRole(rawRole) {
  const value = String(rawRole || "").trim().toUpperCase();
  return CP04_AUTH_ROLES.includes(value) ? value : null;
}

export function authorizeRole(role, allowedRoles) {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return false;
  const safeRole = resolveRole(role);
  return safeRole !== null && allowedRoles.includes(safeRole);
}

function isSupabaseConfigured(env) {
  return Boolean(env && env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

// Decodifica (sin verificar firma) el payload de un JWT para leer claims
// informativos como `exp` o `session_id`. Esto NUNCA sustituye la
// verificación real: la autenticidad del token la establece la llamada de
// red a Supabase en verifySupabaseIdentity. Si el round-trip a Supabase
// falla, el token se rechaza sin llegar a mirar estos claims.
export function decodeJwtPayload(token) {
  try {
    const segments = String(token || "").split(".");
    if (segments.length < 2) return null;

    const base64url = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64url.padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Adaptador de verificación de identidad. Hoy solo existe el verificador
// Supabase; el punto de entrada (`authenticateRequest`) es el único lugar
// que debe cambiar si mañana se añade otro proveedor o un puente de sesión
// demo firmado en servidor.
export async function verifySupabaseIdentity(token, env, fetchImpl = fetch) {
  if (!isSupabaseConfigured(env)) {
    return { ok: false, reason: "PROVIDER_NOT_CONFIGURED" };
  }

  if (!token) {
    return { ok: false, reason: "MISSING_TOKEN" };
  }

  let response;
  try {
    response = await fetchImpl(
      `${String(env.SUPABASE_URL).replace(/\/+$/, "")}/auth/v1/user`,
      {
        method: "GET",
        headers: {
          apikey: String(env.SUPABASE_ANON_KEY || ""),
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return { ok: false, reason: "UPSTREAM_ERROR" };
  }

  if (!response.ok) {
    return { ok: false, reason: "INVALID_TOKEN" };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { ok: false, reason: "UPSTREAM_ERROR" };
  }

  const appMeta = data?.app_metadata || {};
  // Igual que en cp04MapSupabaseUserToCp04: SOLO app_metadata.role es de
  // confianza. user_metadata.role lo puede escribir el propio usuario.
  const role = resolveRole(appMeta.role);

  if (!role) {
    return { ok: false, reason: "ROLE_NOT_ASSIGNED" };
  }

  // club_id/organization_id: mismo principio que el rol. Solo app_metadata
  // es de confianza. Hoy Club Pádel 04 es mono-club, así que normalmente
  // vendrán vacíos hasta que exista el modelo multi-tenant real; el
  // contrato ya los expone para no tener que romper la interfaz después.
  const claims = decodeJwtPayload(token) || {};

  return {
    ok: true,
    userId: data?.id || "",
    email: String(data?.email || "").toLowerCase(),
    role,
    clubId: appMeta.club_id ?? null,
    organizationId: appMeta.organization_id ?? null,
    sessionId: claims.session_id ?? claims.sid ?? null,
    tokenExpiresAt: typeof claims.exp === "number" ? claims.exp : null,
  };
}

// authenticateRequest es el único punto que debe cambiar si mañana se añade
// otro proveedor. El contrato de salida es estable para el resto del Worker:
// { authenticated, userId, email, role, clubId, organizationId, sessionId, tokenExpiresAt }
export async function authenticateRequest(request, env, options = {}) {
  const token = parseAuthorizationHeader(request);

  if (!token) {
    return { authenticated: false, reason: "MISSING_TOKEN" };
  }

  const verify = options.verify || verifySupabaseIdentity;
  const result = await verify(token, env);

  if (!result.ok) {
    return { authenticated: false, reason: result.reason || "INVALID_TOKEN" };
  }

  return {
    authenticated: true,
    userId: result.userId,
    email: result.email,
    role: result.role,
    clubId: result.clubId ?? null,
    organizationId: result.organizationId ?? null,
    sessionId: result.sessionId ?? null,
    tokenExpiresAt: result.tokenExpiresAt ?? null,
  };
}

// Comprobación de alcance multi-tenant, lista para cuando exista más de un
// club/organización. Un STAFF/ADMIN sin club_id asignado no debe poder
// operar "en todos los clubes por defecto": eso sería fail-open. Hoy, con
// un único club, esta función no se invoca todavía desde ninguna ruta de
// negocio (ver documentación de arquitectura), pero queda lista y probada.
export function authorizeScope(auth, resource = {}) {
  if (!auth) return false;

  // SUPPORT conserva acceso técnico transversal, tal como ya definía la
  // matriz RBAC original (CP04_AUTH_PERMISSIONS.SUPPORT incluye "soporte").
  if (auth.role === "SUPPORT") return true;

  if (resource.clubId !== undefined && resource.clubId !== null) {
    return auth.clubId !== null && auth.clubId === resource.clubId;
  }

  if (resource.organizationId !== undefined && resource.organizationId !== null) {
    return auth.organizationId !== null && auth.organizationId === resource.organizationId;
  }

  return true;
}

const AUTH_FAILURE_STATUS = {
  MISSING_TOKEN: 401,
  INVALID_TOKEN: 401,
  ROLE_NOT_ASSIGNED: 403,
  UPSTREAM_ERROR: 502,
  PROVIDER_NOT_CONFIGURED: 501,
};

const AUTH_FAILURE_MESSAGE = {
  MISSING_TOKEN: "Falta cabecera Authorization Bearer.",
  INVALID_TOKEN: "Token inválido o expirado.",
  ROLE_NOT_ASSIGNED: "La cuenta no tiene un rol asignado en el sistema.",
  UPSTREAM_ERROR: "No se pudo validar la sesión con el proveedor de identidad.",
  PROVIDER_NOT_CONFIGURED: "Autenticación backend no configurada todavía.",
};

function denyResponse(reason) {
  const status = AUTH_FAILURE_STATUS[reason] || 401;
  return {
    ok: false,
    status,
    body: {
      ok: false,
      error: reason || "AUTH_REQUIRED",
      message: AUTH_FAILURE_MESSAGE[reason] || "No autorizado.",
    },
  };
}

// Devuelve { ok:true, auth:{userId,email,role,clubId,organizationId,sessionId,tokenExpiresAt} }
// o { ok:false, status, body } listo para envolver con
// jsonResponse(body, status, corsHeaders(...)) en index.js.
export async function requireAuth(request, env, options = {}) {
  const result = await authenticateRequest(request, env, options);

  if (!result.authenticated) {
    return denyResponse(result.reason);
  }

  const { authenticated, reason, ...auth } = result;
  return { ok: true, auth };
}

export async function requireRoles(request, env, allowedRoles, options = {}) {
  const gate = await requireAuth(request, env, options);

  if (!gate.ok) {
    return gate;
  }

  if (!authorizeRole(gate.auth.role, allowedRoles)) {
    return denyResponse("INSUFFICIENT_ROLE");
  }

  return gate;
}

AUTH_FAILURE_STATUS.INSUFFICIENT_ROLE = 403;
AUTH_FAILURE_MESSAGE.INSUFFICIENT_ROLE = "Tu rol no tiene permiso para esta operación.";
