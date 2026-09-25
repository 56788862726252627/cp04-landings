import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  createBlockedSupabaseAdapter,
  createSupabaseCommunityAdapter,
  createCommunityAdapterFromEnv,
  SUPABASE_ADAPTER_BLOCKED,
} from "./communitySupabaseAdapter.js";

import { validateBackendAdapter } from "./communityBackendRepository.js";

// --------------------------------------------------------------------------
// Helper: construye un mock fetch que responde a múltiples rutas.
// --------------------------------------------------------------------------

function makeFetch(routes = {}) {
  return async (url, opts) => {
    for (const [pattern, handler] of Object.entries(routes)) {
      if (url.includes(pattern)) {
        return handler(url, opts);
      }
    }
    return { ok: false, status: 404, text: async () => '{"message":"not found"}' };
  };
}

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
  };
}

// --------------------------------------------------------------------------
// createBlockedSupabaseAdapter
// --------------------------------------------------------------------------

describe("createBlockedSupabaseAdapter", () => {
  it("implementa el contrato de BackendAdapter", () => {
    const adapter = createBlockedSupabaseAdapter();
    const { valid } = validateBackendAdapter(adapter);
    assert.equal(valid, true);
  });

  it("readAll devuelve error blocked", async () => {
    const adapter = createBlockedSupabaseAdapter("sin config");
    const result = await adapter.readAll("club-x");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, SUPABASE_ADAPTER_BLOCKED);
  });

  it("writeAll devuelve error blocked", async () => {
    const adapter = createBlockedSupabaseAdapter();
    const result = await adapter.writeAll("club-x", {}, 0);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, SUPABASE_ADAPTER_BLOCKED);
  });

  it("isIdempotencyKeyUsed devuelve false (seguro conservador)", async () => {
    const adapter = createBlockedSupabaseAdapter();
    const used = await adapter.isIdempotencyKeyUsed("club-x", "k1");
    assert.equal(used, false);
  });

  it("markIdempotencyKey no lanza (no-op)", async () => {
    const adapter = createBlockedSupabaseAdapter();
    await assert.doesNotReject(() => adapter.markIdempotencyKey("club-x", "k1", { ok: true }));
  });

  it("getIdempotencyResult devuelve null", async () => {
    const adapter = createBlockedSupabaseAdapter();
    const result = await adapter.getIdempotencyResult("club-x", "k1");
    assert.equal(result, null);
  });

  it("isBlocked=true, blockedReason != null", () => {
    const adapter = createBlockedSupabaseAdapter("motivo");
    assert.equal(adapter.isBlocked, true);
    assert.equal(adapter.blockedReason, "motivo");
  });
});

// --------------------------------------------------------------------------
// createSupabaseCommunityAdapter — sin URL/KEY → devuelve blocked
// --------------------------------------------------------------------------

describe("createSupabaseCommunityAdapter — sin configuración", () => {
  it("devuelve adapter bloqueado si no hay URL", () => {
    const adapter = createSupabaseCommunityAdapter({ supabaseUrl: null, supabaseAnonKey: "key" });
    assert.equal(adapter.isBlocked, true);
  });

  it("devuelve adapter bloqueado si no hay KEY", () => {
    const adapter = createSupabaseCommunityAdapter({ supabaseUrl: "https://x.supabase.co", supabaseAnonKey: null });
    assert.equal(adapter.isBlocked, true);
  });

  it("devuelve adapter bloqueado si ambos ausentes", () => {
    const adapter = createSupabaseCommunityAdapter();
    assert.equal(adapter.isBlocked, true);
  });
});

// --------------------------------------------------------------------------
// createSupabaseCommunityAdapter — con mock fetch
// --------------------------------------------------------------------------

describe("createSupabaseCommunityAdapter — readAll", () => {
  it("devuelve store vacío si no hay snapshot previo", async () => {
    const fetch = makeFetch({
      "/community_store_snapshots": () => jsonResponse([]),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });

    const result = await adapter.readAll("club-a");
    assert.equal(result.ok, true);
    assert.equal(result.version, 0);
    assert.ok(Array.isArray(result.data.posts));
  });

  it("devuelve data+version si hay snapshot", async () => {
    const stored = { posts: [{ id: "p1" }] };
    const fetch = makeFetch({
      "/community_store_snapshots": () => jsonResponse([{ data: stored, version: 5 }]),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });

    const result = await adapter.readAll("club-a");
    assert.equal(result.ok, true);
    assert.equal(result.version, 5);
    assert.deepEqual(result.data.posts, [{ id: "p1" }]);
  });

  it("error network → backend_unavailable", async () => {
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => { throw new Error("Network error"); },
    });

    const result = await adapter.readAll("club-a");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "backend_unavailable");
  });

  it("HTTP 401 → error forbidden", async () => {
    const fetch = makeFetch({
      "/community_store_snapshots": () => jsonResponse({ message: "JWT expired" }, 401),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const result = await adapter.readAll("club-a");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "forbidden");
  });

  it("HTTP 500 → backend_unavailable", async () => {
    const fetch = makeFetch({
      "/community_store_snapshots": () => jsonResponse({ message: "internal error" }, 500),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const result = await adapter.readAll("club-a");
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "backend_unavailable");
  });

  it("incluye header Authorization si authToken está configurado", async () => {
    let capturedHeaders = null;
    const fetch = makeFetch({
      "/community_store_snapshots": async (_url, opts) => {
        capturedHeaders = opts.headers;
        return jsonResponse([]);
      },
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      authToken: "my-jwt-token",
      fetchFn: fetch,
    });
    await adapter.readAll("club-a");
    assert.equal(capturedHeaders?.["Authorization"], "Bearer my-jwt-token");
  });

  it("incluye header apikey siempre", async () => {
    let capturedHeaders = null;
    const fetch = makeFetch({
      "/community_store_snapshots": async (_url, opts) => {
        capturedHeaders = opts.headers;
        return jsonResponse([]);
      },
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "the-anon-key",
      fetchFn: fetch,
    });
    await adapter.readAll("club-a");
    assert.equal(capturedHeaders?.["apikey"], "the-anon-key");
  });
});

describe("createSupabaseCommunityAdapter — writeAll", () => {
  it("ok cuando RPC devuelve versión sin error", async () => {
    const fetch = makeFetch({
      "/rpc/community_write_snapshot": () => jsonResponse({ version: 2 }),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const result = await adapter.writeAll("club-a", { posts: [] }, 1);
    assert.equal(result.ok, true);
    assert.equal(result.version, 2);
  });

  it("devuelve conflict si RPC devuelve { error: 'conflict' }", async () => {
    const fetch = makeFetch({
      "/rpc/community_write_snapshot": () => jsonResponse({ error: "conflict" }),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const result = await adapter.writeAll("club-a", { posts: [] }, 0);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "conflict");
  });

  it("error network → backend_unavailable", async () => {
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => { throw new Error("timeout"); },
    });
    const result = await adapter.writeAll("club-a", {}, 0);
    assert.equal(result.ok, false);
    assert.equal(result.error.type, "backend_unavailable");
  });

  it("envía p_club_id, p_data, p_expected_version correctos", async () => {
    let body = null;
    const fetch = makeFetch({
      "/rpc/community_write_snapshot": async (_url, opts) => {
        body = JSON.parse(opts.body);
        return jsonResponse({ version: 1 });
      },
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    await adapter.writeAll("club-test", { posts: ["a"] }, 7);
    assert.equal(body.p_club_id, "club-test");
    assert.equal(body.p_expected_version, 7);
    assert.deepEqual(body.p_data.posts, ["a"]);
  });
});

describe("createSupabaseCommunityAdapter — idempotencia", () => {
  it("isIdempotencyKeyUsed: true si hay rows", async () => {
    const fetch = makeFetch({
      "/community_idempotency": () => jsonResponse([{ id: "uuid-1" }]),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const used = await adapter.isIdempotencyKeyUsed("club-a", "k1");
    assert.equal(used, true);
  });

  it("isIdempotencyKeyUsed: false si no hay rows", async () => {
    const fetch = makeFetch({
      "/community_idempotency": () => jsonResponse([]),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const used = await adapter.isIdempotencyKeyUsed("club-a", "k1");
    assert.equal(used, false);
  });

  it("isIdempotencyKeyUsed: false si hay error (conservador)", async () => {
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => { throw new Error("net"); },
    });
    const used = await adapter.isIdempotencyKeyUsed("club-a", "k1");
    assert.equal(used, false);
  });

  it("markIdempotencyKey no lanza aunque el backend devuelva error", async () => {
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => jsonResponse({ message: "conflict" }, 409),
    });
    await assert.doesNotReject(() => adapter.markIdempotencyKey("club-a", "k1", { ok: true }));
  });

  it("getIdempotencyResult devuelve result si hay rows", async () => {
    const fetch = makeFetch({
      "/community_idempotency": () => jsonResponse([{ result: { ok: true, postId: "p1" } }]),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const r = await adapter.getIdempotencyResult("club-a", "k1");
    assert.deepEqual(r, { ok: true, postId: "p1" });
  });

  it("getIdempotencyResult devuelve null si no hay rows", async () => {
    const fetch = makeFetch({
      "/community_idempotency": () => jsonResponse([]),
    });
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: fetch,
    });
    const r = await adapter.getIdempotencyResult("club-a", "k1");
    assert.equal(r, null);
  });
});

// --------------------------------------------------------------------------
// createCommunityAdapterFromEnv
// --------------------------------------------------------------------------

describe("createCommunityAdapterFromEnv", () => {
  it("devuelve blocked si env vacío", () => {
    const adapter = createCommunityAdapterFromEnv({});
    assert.equal(adapter.isBlocked, true);
  });

  it("devuelve blocked si solo URL", () => {
    const adapter = createCommunityAdapterFromEnv({ VITE_SUPABASE_URL: "https://x.co" });
    assert.equal(adapter.isBlocked, true);
  });

  it("devuelve adapter real si URL+KEY", () => {
    const adapter = createCommunityAdapterFromEnv({
      VITE_SUPABASE_URL: "https://x.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon-key",
    });
    assert.equal(adapter.isBlocked, false);
  });

  it("acepta también SUPABASE_URL (sin prefijo VITE_)", () => {
    const adapter = createCommunityAdapterFromEnv({
      SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_ANON_KEY: "anon-key",
    });
    assert.equal(adapter.isBlocked, false);
  });
});

// --------------------------------------------------------------------------
// Contrato del adapter creado con mock (isBlocked=false)
// --------------------------------------------------------------------------

describe("createSupabaseCommunityAdapter — contrato validateBackendAdapter", () => {
  it("pasa validateBackendAdapter cuando está configurado", () => {
    const adapter = createSupabaseCommunityAdapter({
      supabaseUrl: "https://test.supabase.co",
      supabaseAnonKey: "anon",
      fetchFn: async () => jsonResponse([]),
    });
    const { valid } = validateBackendAdapter(adapter);
    assert.equal(valid, true);
  });
});
