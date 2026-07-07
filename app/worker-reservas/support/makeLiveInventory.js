// Club Pádel 04 · Worker · Acceso de producción (solo lectura) al inventario
// de escenarios de Make para el Centro Técnico.
//
// IMPORTANTE — separación explícita de tres cosas que no deben mezclarse:
//   A. MCP de Make usado por Claude durante la auditoría: vive fuera de este
//      Worker, en la sesión de desarrollo. Nunca ha tocado este código ni
//      este runtime.
//   B. API REST real de Make (https://<zona>.make.com/api/v2/...): es lo
//      que este módulo llamaría en producción, con un token de solo lectura
//      (scope mínimo: scenarios:read, idealmente sin acceso de escritura).
//   C. Secret de Cloudflare Worker: el único lugar legítimo para ese token.
//      Nunca en wrangler.toml en texto plano, nunca en Git, nunca logueado.
//
// Estado real confirmado en esta fase (ver `wrangler secret list`): el
// Worker de producción NO tiene configurado ningún secret de lectura de la
// API de Make (los únicos secrets relacionados con Make son los webhooks de
// salida MAKE_RESERVAS_WEBHOOK / MAKE_ALTA_JUGADOR_WEBHOOK, que sirven para
// disparar escenarios, no para consultarlos).
//
// Por tanto, este módulo NO inventa una conexión que no existe: si falta
// configuración, falla de forma segura y explícita (fail-closed), nunca
// devuelve datos inventados ni intenta "simular" una respuesta de Make.
//
// Secrets que harían falta para activar esto de verdad en producción
// (nombres únicamente, nunca valores — deben añadirse con
// `wrangler secret put <NOMBRE>`, jamás en un archivo):
//   - MAKE_API_TOKEN   (token de solo lectura de la API de Make)
//   - MAKE_API_BASE_URL (ej. "https://eu2.make.com/api/v2" — depende de la
//     zona real de la cuenta; no confirmado en esta auditoría, no se debe
//     adivinar)
//   - MAKE_TEAM_ID     (identificador de equipo/organización en Make)

const SAFE_FIELDS_DOC = Object.freeze([
  "id", "nombre", "categoria", "activo", "scheduling", "ultima_modificacion",
  "ejecuciones_acumuladas", "operaciones_acumuladas", "errores_acumulados",
  "tasa_error", "criticidad", "salud", "dependencia_principal",
  "funcion_afectada", "recomendaciones", "fuente_de_verdad_dato",
]);

export function isMakeLiveConfigured(env) {
  return Boolean(env && env.MAKE_API_TOKEN && env.MAKE_API_BASE_URL && env.MAKE_TEAM_ID);
}

// Evidencia real confirmada (diagnóstico con GET /scenarios de Make, campos
// devueltos): id, name, teamId, devices, deviceId, devicesScope, isActive,
// scheduling, dlqCount, allDlqCount, operations, centicredits, transfer,
// usedModules, usedPackages, lastEdit, createdByUser, updatedByUser,
// blueprint, folderId.
//
// Es decir: Make NO expone `executions` ni `errors` en este endpoint. Antes,
// `Number(raw?.executions || 0)` / `Number(raw?.errors || 0)` convertían
// silenciosamente "campo ausente" en "0 confirmado", lo que hacía que la UI
// mostrara 0 ejecuciones/0 errores/0% tasa de error/"—" en mayor volumen/
// salud "OK" para escenarios que en realidad no tienen ese dato en vivo —
// no que estén confirmados sin errores. `operations` sí viene siempre
// (confirmado): es la única métrica de volumen acumulado real disponible
// hoy sin llamadas adicionales por escenario (evitando N+1 contra
// /scenarios/{id}/logs, fuera de alcance de esta corrección).
//
// rawMetric() nunca inventa un 0: si el campo no es un número real, propaga
// `null` ("dato no disponible"), no un `0` que se confundiría con "cero
// real confirmado".
function rawMetric(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

// Deriva salud/criticidad con el MISMO criterio documentado que
// src/data/makeInventory.js en el frontend (mantenido intencionalmente en
// paralelo: son runtimes distintos — Worker vs Vite — sin build compartido).
// A diferencia del snapshot (que siempre tiene ejecuciones/errores reales),
// aquí ambos pueden ser `null` — nunca se inventa una tasa cuando falta el
// dato.
function computeErrorRate(ejecuciones, errores) {
  if (ejecuciones === null || errores === null) return null;
  if (!ejecuciones) return 0;
  return Math.round((errores / ejecuciones) * 1000) / 10;
}

// "SIN_DATOS" es un estado de salud distinto de "OK": OK afirma "confirmado
// sin errores relevantes", SIN_DATOS reconoce honestamente que Make no
// entrega ejecuciones/errores para este escenario en el endpoint actual.
function computeHealth({ ejecuciones, errores, activo, categoria }) {
  const tasa = computeErrorRate(ejecuciones, errores);

  if (tasa === null) {
    if (!activo && categoria !== "DEVELOPMENT_QA" && categoria !== "TECHNICAL_MONITORING") return "ATENCION";
    return "SIN_DATOS";
  }

  if (ejecuciones >= 10 && tasa >= 25) return "CRITICO";
  if (tasa >= 5 && tasa < 25) return "ATENCION";
  if (!activo && categoria !== "DEVELOPMENT_QA" && categoria !== "TECHNICAL_MONITORING") return "ATENCION";
  return "OK";
}

// Criticidad de negocio: depende SOLO de la categoría arquitectónica, nunca
// de la tasa de error operativa (son conceptos distintos, no se mezclan).
function computeCriticality(categoria) {
  if (categoria === "APP_TRIGGERED") return "ALTA";
  if (categoria === "INTERNAL_OPERATION" || categoria === "SCHEDULED") return "MEDIA";
  return "BAJA";
}

// Sanitiza un escenario crudo de la API de Make al contrato seguro exacto
// pedido para el Centro Técnico. Cualquier campo no listado aquí (hookId,
// __IMTCONN__, blueprint, connections, webhooks, HTML, PII) se descarta por
// diseño: solo se construye el objeto de salida campo a campo, nunca se
// reenvía el objeto crudo.
export function sanitizeMakeScenario(raw, categoria = "SIN_CLASIFICAR") {
  const ejecuciones = rawMetric(raw?.executions);
  const operaciones = rawMetric(raw?.operations);
  const errores = rawMetric(raw?.errors);
  const activo = Boolean(raw?.isActive);

  const enriched = { ejecuciones, errores, activo, categoria };

  return {
    id: Number(raw?.id),
    nombre: String(raw?.name || "").slice(0, 200),
    categoria,
    activo,
    scheduling: raw?.scheduling?.type
      ? `${raw.scheduling.type}${raw.scheduling.interval ? ` · ${raw.scheduling.interval}s` : ""}`
      : "desconocido",
    ultima_modificacion: raw?.lastEdit || null,
    ejecuciones_acumuladas: ejecuciones,
    operaciones_acumuladas: operaciones,
    errores_acumulados: errores,
    tasa_error: computeErrorRate(ejecuciones, errores),
    criticidad: computeCriticality(categoria),
    salud: computeHealth(enriched),
    dependencia_principal: raw?.usaAirtable ? "Airtable" : "N/D",
    funcion_afectada: null,
    recomendaciones: null,
    fuente_de_verdad_dato: "confirmado_make_api_live",
  };
}

// --- Caché TTL corta server-side (in-memory, por isolate) ---
//
// TTL elegido: 60 segundos. Razonamiento: las métricas de Make (ejecuciones/
// operaciones/errores) no cambian de forma que importe visualmente en menos
// de un minuto, y SUPPORT es un único usuario técnico — no tiene sentido
// pagar una llamada real a Make en cada render/recarga de pestaña. 60s
// también evita que un refresco manual repetido en ráfaga (doble clic,
// recarga accidental) dispare llamadas duplicadas a la API de Make.
//
// Limitación conocida y aceptada: al ser in-memory por isolate, no persiste
// entre cold starts ni se comparte entre PoPs de Cloudflare. Es un caché
// "best effort", no una garantía distribuida — una solución robusta
// necesitaría KV o Durable Objects, fuera de alcance de esta fase (no se
// crean nuevos recursos de Cloudflare sin autorización explícita).
const CACHE_TTL_MS = 60_000;
let cache = { data: null, expiresAt: 0 };

// --- Rate limiting básico (in-memory, por isolate) ---
//
// Máximo 10 peticiones por minuto. Es una única ruta SUPPORT-only con un
// puñado de usuarios técnicos reales: el límite protege contra un bucle de
// refresco accidental en el frontend, no contra un ataque distribuido (para
// eso haría falta un límite a nivel de borde/KV, también fuera de alcance).
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
let rateLimitHits = [];

export function checkMakeRateLimit(now = Date.now()) {
  rateLimitHits = rateLimitHits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (rateLimitHits.length >= RATE_LIMIT_MAX) {
    return false;
  }
  rateLimitHits.push(now);
  return true;
}

// Expuesto solo para tests (limpiar estado entre casos).
export function __resetMakeLiveStateForTests() {
  cache = { data: null, expiresAt: 0 };
  rateLimitHits = [];
}

// Intenta obtener el inventario en vivo. Nunca lanza: siempre devuelve
// { ok, reason? , scenarios?, servedFromCache? }.
export async function fetchLiveMakeInventory(env, fetchImpl = fetch, now = Date.now()) {
  if (!isMakeLiveConfigured(env)) {
    return { ok: false, reason: "MAKE_NOT_CONFIGURED" };
  }

  if (cache.data && cache.expiresAt > now) {
    return { ok: true, scenarios: cache.data, servedFromCache: true };
  }

  let response;
  try {
    response = await fetchImpl(
      `${String(env.MAKE_API_BASE_URL).replace(/\/+$/, "")}/scenarios?teamId=${encodeURIComponent(env.MAKE_TEAM_ID)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Token ${env.MAKE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return { ok: false, reason: "MAKE_UPSTREAM_ERROR" };
  }

  if (!response.ok) {
    return { ok: false, reason: "MAKE_UPSTREAM_ERROR" };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { ok: false, reason: "MAKE_INVALID_RESPONSE" };
  }

  const rawScenarios = Array.isArray(data?.scenarios) ? data.scenarios : null;
  if (!rawScenarios) {
    return { ok: false, reason: "MAKE_INVALID_RESPONSE" };
  }

  const sanitized = rawScenarios
    .filter((s) => s && typeof s === "object" && Number.isFinite(Number(s.id)))
    .map((s) => sanitizeMakeScenario(s));

  cache = { data: sanitized, expiresAt: now + CACHE_TTL_MS };
  return { ok: true, scenarios: sanitized, servedFromCache: false };
}

export const CP04_MAKE_SAFE_FIELDS = SAFE_FIELDS_DOC;
