import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  validateAuthBoundary,
  createDemoCommunityAuthBoundary,
  createWorkerBackedAuthBoundary,
  createSupabaseAuthBoundary,
  AUTH_REQUIRED,
  AGE_STATUS,
} from "./communityAuthBoundary.js";

// --------------------------------------------------------------------------
// validateAuthBoundary
// --------------------------------------------------------------------------

describe("validateAuthBoundary", () => {
  it("pasa si todas las funciones requeridas están presentes", () => {
    const boundary = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    const { valid, missing } = validateAuthBoundary(boundary);
    assert.equal(valid, true);
    assert.deepEqual(missing, []);
  });

  it("falla si faltan funciones", () => {
    const { valid, missing } = validateAuthBoundary({ isAuthenticated: async () => true });
    assert.equal(valid, false);
    assert.ok(missing.includes("getActorId"));
    assert.ok(missing.includes("getClubId"));
  });

  it("falla si el objeto es null", () => {
    const { valid } = validateAuthBoundary(null);
    assert.equal(valid, false);
  });
});

// --------------------------------------------------------------------------
// createDemoCommunityAuthBoundary
// --------------------------------------------------------------------------

describe("createDemoCommunityAuthBoundary", () => {
  it("lanza si actorId o clubId no se pasan", () => {
    assert.throws(() => createDemoCommunityAuthBoundary({}));
    assert.throws(() => createDemoCommunityAuthBoundary({ actorId: "u1" }));
    assert.throws(() => createDemoCommunityAuthBoundary({ clubId: "c1" }));
  });

  it("isAuthenticated=true por defecto", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    assert.equal(await b.isAuthenticated(), true);
  });

  it("getActorId devuelve actorId si autenticado", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "actor-99", clubId: "c1" });
    assert.equal(await b.getActorId(), "actor-99");
  });

  it("getClubId devuelve clubId si autenticado", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "club-demo-04" });
    assert.equal(await b.getClubId(), "club-demo-04");
  });

  it("getRole devuelve PLAYER por defecto", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    assert.equal(await b.getRole(), "PLAYER");
  });

  it("getRole respeta el parámetro", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1", role: "ADMIN" });
    assert.equal(await b.getRole(), "ADMIN");
  });

  it("getAgeStatus devuelve ADULT_VERIFIED por defecto", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    assert.equal(await b.getAgeStatus(), AGE_STATUS.ADULT_VERIFIED);
  });

  it("getAgeStatus respeta el parámetro", async () => {
    const b = createDemoCommunityAuthBoundary({
      actorId: "u1", clubId: "c1",
      ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY,
    });
    assert.equal(await b.getAgeStatus(), AGE_STATUS.MINOR_OR_BELOW_POLICY);
  });

  it("isCommunityAllowed devuelve allowed=true para ADULT_VERIFIED", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    const { allowed } = await b.isCommunityAllowed();
    assert.equal(allowed, true);
  });

  it("isCommunityAllowed devuelve allowed=false para menores", async () => {
    const b = createDemoCommunityAuthBoundary({
      actorId: "u1", clubId: "c1",
      ageStatus: AGE_STATUS.MINOR_OR_BELOW_POLICY,
    });
    const { allowed } = await b.isCommunityAllowed();
    assert.equal(allowed, false);
  });

  it("authenticated=false → getActorId y getClubId devuelven null", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1", authenticated: false });
    assert.equal(await b.isAuthenticated(), false);
    assert.equal(await b.getActorId(), null);
    assert.equal(await b.getClubId(), null);
  });

  it("getAuthToken devuelve token demo si autenticado", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    const token = await b.getAuthToken();
    assert.ok(token.startsWith("demo-token-"));
  });

  it("getAuthToken devuelve null si no autenticado", async () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1", authenticated: false });
    assert.equal(await b.getAuthToken(), null);
  });

  it("_type es 'demo'", () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    assert.equal(b._type, "demo");
  });

  it("pasa validateAuthBoundary", () => {
    const b = createDemoCommunityAuthBoundary({ actorId: "u1", clubId: "c1" });
    assert.equal(validateAuthBoundary(b).valid, true);
  });
});

// --------------------------------------------------------------------------
// createWorkerBackedAuthBoundary — con mock fetch
// --------------------------------------------------------------------------

function makeWorkerFetch(userPayload = null, status = 200) {
  return async (_url, _opts) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => userPayload ? { user: userPayload } : { error: "not authenticated" },
  });
}

describe("createWorkerBackedAuthBoundary", () => {
  it("isAuthenticated=true si Worker devuelve user", async () => {
    const user = { id: "usr-1", app_metadata: { club_id: "club-real", role: "PLAYER" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch(user),
      getStoredToken: () => "jwt-token",
    });
    assert.equal(await b.isAuthenticated(), true);
  });

  it("isAuthenticated=false si Worker devuelve 401", async () => {
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch(null, 401),
      getStoredToken: () => "bad-token",
    });
    assert.equal(await b.isAuthenticated(), false);
  });

  it("isAuthenticated=false si no hay token", async () => {
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch({ id: "u1" }),
      getStoredToken: () => null,
    });
    assert.equal(await b.isAuthenticated(), false);
  });

  it("getActorId devuelve user.id", async () => {
    const user = { id: "usr-abc", app_metadata: { club_id: "c1" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch(user),
      getStoredToken: () => "token",
    });
    assert.equal(await b.getActorId(), "usr-abc");
  });

  it("getClubId viene de app_metadata.club_id (no del cliente)", async () => {
    const user = { id: "u1", app_metadata: { club_id: "club-server-set", role: "PLAYER" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch(user),
      getStoredToken: () => "tok",
    });
    assert.equal(await b.getClubId(), "club-server-set");
  });

  it("getRole viene de app_metadata.role", async () => {
    const user = { id: "u1", app_metadata: { club_id: "c1", role: "ADMIN" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch(user),
      getStoredToken: () => "tok",
    });
    assert.equal(await b.getRole(), "ADMIN");
  });

  it("getAgeStatus devuelve AGE_UNKNOWN (resolver externamente)", async () => {
    const user = { id: "u1", app_metadata: { club_id: "c1" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: makeWorkerFetch(user),
      getStoredToken: () => "tok",
    });
    assert.equal(await b.getAgeStatus(), AGE_STATUS.AGE_UNKNOWN);
  });

  it("network error → isAuthenticated=false (no lanza)", async () => {
    const b = createWorkerBackedAuthBoundary({
      fetchFn: async () => { throw new Error("timeout"); },
      getStoredToken: () => "tok",
    });
    assert.equal(await b.isAuthenticated(), false);
  });

  it("cachea el resultado del Worker", async () => {
    let callCount = 0;
    const user = { id: "u1", app_metadata: { club_id: "c1" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: async (_url, _opts) => {
        callCount++;
        return makeWorkerFetch(user)();
      },
      getStoredToken: () => "tok",
    });
    await b.isAuthenticated();
    await b.getActorId();
    await b.getClubId();
    assert.equal(callCount, 1); // solo 1 llamada al Worker
  });

  it("__invalidateCache fuerza nueva llamada", async () => {
    let callCount = 0;
    const user = { id: "u1", app_metadata: { club_id: "c1" } };
    const b = createWorkerBackedAuthBoundary({
      fetchFn: async () => {
        callCount++;
        return makeWorkerFetch(user)();
      },
      getStoredToken: () => "tok",
    });
    await b.isAuthenticated();
    b.__invalidateCache();
    await b.isAuthenticated();
    assert.equal(callCount, 2);
  });

  it("_type es 'worker_backed'", () => {
    const b = createWorkerBackedAuthBoundary({});
    assert.equal(b._type, "worker_backed");
  });

  it("pasa validateAuthBoundary", () => {
    const b = createWorkerBackedAuthBoundary({});
    assert.equal(validateAuthBoundary(b).valid, true);
  });
});

// --------------------------------------------------------------------------
// createSupabaseAuthBoundary
// --------------------------------------------------------------------------

function makeSupabaseFetch(userPayload, status = 200) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => userPayload,
  });
}

describe("createSupabaseAuthBoundary", () => {
  it("sin URL/KEY → devuelve boundary bloqueado (demo con authenticated=false)", async () => {
    const b = createSupabaseAuthBoundary({});
    assert.equal(await b.isAuthenticated(), false);
  });

  it("_type es 'supabase_direct' cuando está configurado", () => {
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => ({ ok: false, status: 401, json: async () => ({}) }),
      getStoredToken: () => null,
    });
    assert.equal(b._type, "supabase_direct");
  });

  it("isAuthenticated=true si /auth/v1/user devuelve user", async () => {
    const user = { id: "su-1", app_metadata: { club_id: "c1", role: "PLAYER" } };
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: makeSupabaseFetch(user),
      getStoredToken: () => "jwt",
    });
    assert.equal(await b.isAuthenticated(), true);
  });

  it("isAuthenticated=false sin token", async () => {
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: makeSupabaseFetch({ id: "u1" }),
      getStoredToken: () => null,
    });
    assert.equal(await b.isAuthenticated(), false);
  });

  it("getClubId viene de app_metadata.club_id", async () => {
    const user = { id: "u1", app_metadata: { club_id: "club-official" } };
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: makeSupabaseFetch(user),
      getStoredToken: () => "jwt",
    });
    assert.equal(await b.getClubId(), "club-official");
  });

  it("getAgeStatus devuelve AGE_UNKNOWN", async () => {
    const user = { id: "u1", app_metadata: {} };
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: makeSupabaseFetch(user),
      getStoredToken: () => "jwt",
    });
    assert.equal(await b.getAgeStatus(), AGE_STATUS.AGE_UNKNOWN);
  });

  it("cachea resultado", async () => {
    let calls = 0;
    const user = { id: "u1", app_metadata: { club_id: "c1" } };
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => { calls++; return makeSupabaseFetch(user)(); },
      getStoredToken: () => "jwt",
    });
    await b.isAuthenticated();
    await b.getActorId();
    assert.equal(calls, 1);
  });

  it("__invalidateCache fuerza nueva llamada", async () => {
    let calls = 0;
    const user = { id: "u1", app_metadata: { club_id: "c1" } };
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => { calls++; return makeSupabaseFetch(user)(); },
      getStoredToken: () => "jwt",
    });
    await b.isAuthenticated();
    b.__invalidateCache();
    await b.isAuthenticated();
    assert.equal(calls, 2);
  });

  it("network error → isAuthenticated=false (no lanza)", async () => {
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => { throw new Error("net"); },
      getStoredToken: () => "jwt",
    });
    assert.equal(await b.isAuthenticated(), false);
  });

  it("pasa validateAuthBoundary", () => {
    const b = createSupabaseAuthBoundary({
      supabaseUrl: "https://x.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => ({ ok: false, status: 401, json: async () => ({}) }),
      getStoredToken: () => null,
    });
    assert.equal(validateAuthBoundary(b).valid, true);
  });
});

// --------------------------------------------------------------------------
// AUTH_REQUIRED — exportado correctamente
// --------------------------------------------------------------------------

describe("AUTH_REQUIRED constante", () => {
  it("es un string 'auth_required'", () => {
    assert.equal(AUTH_REQUIRED, "auth_required");
  });
});
