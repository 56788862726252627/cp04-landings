// Prompt Agencia IA 3/7 — Adaptador Airtable AISLADO, real pero
// NUNCA activo sin credenciales. Mismo patrón que stripeAdapter.js /
// whatsappAdapter.js (Paso 19): ninguna función llama a `fetchImpl` sin
// `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` presentes en `env` — sin
// ambas, toda función devuelve `status: "not_configured"` de forma
// determinista.
//
// Distinto del diseño P0 de resiliencia (batching/backoff/dedup/budgets)
// que ya existe en `audit/airtable-p0-architecture-20260708/` — ese
// directorio está gitignorado y fuera de `npm test`, así que este
// adaptador NO depende de él (dependerían de código que no se distribuye
// con el repo). Implementa el contrato `DataRepository` de
// `adapters/providerAdapters.js` (list/get/create/update/remove) con las
// mismas garantías de seguridad que el resto de adaptadores reales:
// nunca añade el SDK oficial de Airtable, usa `fetch` nativo contra la
// REST API documentada, `fetchImpl` inyectable para tests deterministas.

import process from "node:process";

export const AIRTABLE_API_BASE = "https://api.airtable.com/v0";

export function isAirtableConfigured(env = process.env) {
  return Boolean(env.AIRTABLE_API_KEY && env.AIRTABLE_BASE_ID);
}

/** Nunca expone la clave completa — seguro para volcar en un informe/log. */
export function getAirtableRuntimeStatus(env = process.env) {
  const key = env.AIRTABLE_API_KEY;
  return {
    configured: isAirtableConfigured(env),
    apiKeyRedacted: typeof key === "string" && key.length > 0 ? (key.length <= 8 ? "***" : `${key.slice(0, 4)}***${key.slice(-4)}`) : null,
    baseIdConfigured: Boolean(env.AIRTABLE_BASE_ID),
  };
}

function guardConfigured(env) {
  if (!isAirtableConfigured(env)) {
    return { blocked: true, result: { status: "not_configured", reason: "faltan AIRTABLE_API_KEY/AIRTABLE_BASE_ID — ninguna petición real se ha realizado." } };
  }
  return { blocked: false };
}

async function airtableRequest(env, fetchImpl, method, pathSuffix, body) {
  const url = `${AIRTABLE_API_BASE}/${encodeURIComponent(env.AIRTABLE_BASE_ID)}/${pathSuffix}`;
  const response = await fetchImpl(url, {
    method,
    headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}`, "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return { status: "airtable_error", httpStatus: response.status, error: data?.error ?? null };
  return { status: "ok", data };
}

/**
 * Implementación real del contrato `DataRepository`
 * (`adapters/providerAdapters.js`). `env`/`fetchImpl` inyectables por el
 * mismo motivo que `driveRealAdapter.js`: tests 100% deterministas, sin
 * red real.
 */
export function createRealAirtableAdapter(env = process.env, { fetchImpl = fetch } = {}) {
  return {
    async list(table) {
      const guard = guardConfigured(env);
      if (guard.blocked) return guard.result;
      const result = await airtableRequest(env, fetchImpl, "GET", encodeURIComponent(table));
      if (result.status !== "ok") return result;
      return { status: "completed", records: result.data?.records ?? [] };
    },

    async get(table, id) {
      const guard = guardConfigured(env);
      if (guard.blocked) return guard.result;
      const result = await airtableRequest(env, fetchImpl, "GET", `${encodeURIComponent(table)}/${encodeURIComponent(id)}`);
      if (result.status !== "ok") return result;
      return { status: "completed", record: result.data ?? null };
    },

    async create(table, fields) {
      const guard = guardConfigured(env);
      if (guard.blocked) return guard.result;
      const result = await airtableRequest(env, fetchImpl, "POST", encodeURIComponent(table), { fields });
      if (result.status !== "ok") return result;
      return { status: "completed", record: result.data ?? null };
    },

    async update(table, id, patch) {
      const guard = guardConfigured(env);
      if (guard.blocked) return guard.result;
      const result = await airtableRequest(env, fetchImpl, "PATCH", `${encodeURIComponent(table)}/${encodeURIComponent(id)}`, { fields: patch });
      if (result.status !== "ok") return result;
      return { status: "completed", record: result.data ?? null };
    },

    async remove(table, id) {
      const guard = guardConfigured(env);
      if (guard.blocked) return guard.result;
      const result = await airtableRequest(env, fetchImpl, "DELETE", `${encodeURIComponent(table)}/${encodeURIComponent(id)}`);
      if (result.status !== "ok") return result;
      return { status: "deleted", id };
    },
  };
}
