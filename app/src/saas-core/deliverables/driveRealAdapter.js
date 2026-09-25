// Fase A (integración Google Drive) — Adaptador REAL de Google Drive.
//
// Mismo contrato de 3 métodos que driveAdapter.js
// (createFolder/uploadFile/listFolder), más los métodos adicionales que
// exige un ciclo de vida real (updateFile/findFile/verifyUpload).
// DriveSyncManager puede seguir usando SOLO los 3 originales sin ningún
// cambio — este adaptador implementa exactamente el mismo contrato y
// puede sustituir a `cp04CreateNotConfiguredDriveAdapter` el día que se
// active de verdad, sin tocar driveSyncManager.js.
//
// Mismo patrón de seguridad que stripeAdapter.js/whatsappAdapter.js
// (src/saas-core/commercial/): NUNCA se añade el SDK oficial de Google
// (`googleapis`) como dependencia nueva — se usa `fetch` nativo de Node
// contra las 2 APIs REST documentadas (token endpoint de OAuth2 + Drive
// v3 REST), con `fetchImpl` inyectable para que los tests sean 100%
// deterministas y no toquen la red real.
//
// DOBLE cierre de seguridad, en este orden — las dos condiciones deben
// cumplirse para que `fetchImpl` llegue a invocarse una sola vez:
//   1. cp04IsDriveConfigured(env) && cp04IsDriveSyncEnabled(env)
//      (driveAdapter.js) — si falta cualquiera, `not_configured`.
//   2. cp04IsDriveDryRun(env) — TRUE por defecto incluso con lo
//      anterior cumplido: modo `dry_run`, construye la petición
//      completa (para poder inspeccionarla/loguearla) pero nunca la
//      envía. Hace falta CP04_DRIVE_DRY_RUN="false" explícito para
//      llegar a esa tercera puerta.
//
// Variables de entorno (Paso 8) — ninguna con valor real en este repo.
// No se ha podido añadir esta lista a `.env.example` en este bloque
// (el entorno de la sesión deniega Read/Bash sobre ese archivo por ser
// un patrón dotenv, incluso siendo un ".example" sin secretos reales) —
// pendiente de que alguien con acceso directo al archivo la incorpore:
//   GOOGLE_DRIVE_CLIENT_ID          (ya documentada en driveAdapter.js)
//   GOOGLE_DRIVE_CLIENT_SECRET      (ya documentada en driveAdapter.js)
//   GOOGLE_DRIVE_REFRESH_TOKEN      (ya documentada en driveAdapter.js)
//   GOOGLE_DRIVE_ROOT_FOLDER_ID     (ya documentada en driveAdapter.js)
//   CP04_DRIVE_SYNC_ENABLED=false   (ya documentada en driveAdapter.js)
//   CP04_DRIVE_DRY_RUN=true         (nueva — "false" explícito para desactivarlo)
//   CP04_DRIVE_CREDENTIALS_PATH=    (nueva — ruta local a credentials.json, NUNCA su contenido)
//   CP04_DRIVE_TOKEN_PATH=          (nueva — ruta local a token.json, NUNCA su contenido)
//   CP04_DRIVE_UPLOAD_VERIFY=true   (nueva — "false" explícito para desactivar la verificación posterior)
//   CP04_DRIVE_MAX_RETRIES=3        (nueva)
//   CP04_DRIVE_TIMEOUT_MS=15000     (nueva)

import { createHash } from "node:crypto";
import process from "node:process";
import { Buffer } from "node:buffer";

import { cp04IsDriveConfigured, cp04IsDriveSyncEnabled } from "./driveAdapter.js";
import { cp04ComputeBackoffDelayMs } from "./driveSyncManager.js";
import { CP04_BINARY_MIME } from "./binary/binaryValidator.js";

export const CP04_OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token";
export const CP04_OAUTH_REVOKE_URL = "https://oauth2.googleapis.com/revoke";
export const CP04_DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
export const CP04_DRIVE_UPLOAD_API_BASE = "https://www.googleapis.com/upload/drive/v3";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_BASE_DELAY_MS = 500;

// --- Configuración (Paso 8) ------------------------------------------------

/** TRUE por defecto — hace falta el string exacto "false" para desactivarlo. Fail-safe, no fail-open. */
export function cp04IsDriveDryRun(env = process.env) {
  return String(env.CP04_DRIVE_DRY_RUN ?? "true").toLowerCase() !== "false";
}

/** Lee y normaliza toda la configuración del adaptador real — nunca expone credenciales, solo derivados seguros. */
export function cp04GetDriveRealAdapterConfig(env = process.env) {
  const maxRetries = Number.parseInt(env.CP04_DRIVE_MAX_RETRIES, 10);
  const timeoutMs = Number.parseInt(env.CP04_DRIVE_TIMEOUT_MS, 10);
  return {
    dryRun: cp04IsDriveDryRun(env),
    credentialsPath: env.CP04_DRIVE_CREDENTIALS_PATH || null,
    tokenPath: env.CP04_DRIVE_TOKEN_PATH || null,
    rootFolderId: env.CP04_DRIVE_ROOT_FOLDER_ID || env.GOOGLE_DRIVE_ROOT_FOLDER_ID || null,
    uploadVerify: String(env.CP04_DRIVE_UPLOAD_VERIFY ?? "true").toLowerCase() !== "false",
    maxRetries: Number.isInteger(maxRetries) && maxRetries >= 0 ? maxRetries : DEFAULT_MAX_RETRIES,
    timeoutMs: Number.isInteger(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS,
  };
}

// --- Utilidades de seguridad -------------------------------------------------

/** Nunca expone un token completo — igual que redactSecret() en commercialShared.js, reimplementado aquí para no cruzar el módulo commercial/ desde deliverables/. */
export function cp04RedactDriveToken(value) {
  if (typeof value !== "string" || value.length === 0) return null;
  if (value.length <= 8) return "***";
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

function checksumOfContent(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(typeof content === "string" ? content : JSON.stringify(content ?? ""), "utf8");
  return createHash("sha256").update(buf).digest("hex");
}

function guessMime(fileName) {
  const ext = String(fileName || "").split(".").pop()?.toLowerCase();
  return CP04_BINARY_MIME[ext] || "application/octet-stream";
}

// La API de Drive/Sheets de Google señaliza "cuota excedida" con HTTP
// 403 (NO 429) y uno de estos `reason` documentados dentro del cuerpo
// del error — indistinguible de un 403 de permisos genuino si solo se
// mira el código HTTP. Confundirlos importa: un 403 de permisos es
// permanente (reintentar no ayuda nunca), pero un 403 de cuota es
// temporal (Google recomienda explícitamente reintentar con backoff).
const CP04_DRIVE_QUOTA_REASONS = Object.freeze(["quotaExceeded", "userRateLimitExceeded", "dailyLimitExceeded", "rateLimitExceeded"]);

/**
 * Clasifica una respuesta HTTP de Drive/OAuth en un estado semántico —
 * nunca deja pasar un código crudo sin interpretar. `errorReason`
 * (opcional, Prompt 4B Fase 7) es el campo `error.errors[0].reason` que
 * Google incluye en el cuerpo de un 403 — permite distinguir "cuota
 * excedida" (temporal, reintentable) de "prohibido" (permanente).
 */
export function cp04ClassifyDriveHttpStatus(httpStatus, errorReason) {
  if (httpStatus === 401) return "unauthorized";
  if (httpStatus === 403) return CP04_DRIVE_QUOTA_REASONS.includes(errorReason) ? "quota_exceeded" : "forbidden";
  if (httpStatus === 404) return "not_found";
  if (httpStatus === 409) return "conflict";
  if (httpStatus === 429) return "rate_limited";
  if (httpStatus >= 500 && httpStatus < 600) return "server_error";
  if (httpStatus >= 200 && httpStatus < 300) return "ok";
  return "http_error";
}

/** Solo cuota/rate-limit/5xx/red merecen reintento — 401/403 (permisos genuinos)/404/409 son errores estables que un reintento no arregla. */
export function cp04IsRetryableDriveClassification(classification) {
  return classification === "rate_limited" || classification === "server_error" || classification === "network_error" || classification === "quota_exceeded";
}

// --- OAuth2 (refresh_token grant) -------------------------------------------

async function withTimeout(fetchImpl, url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Intercambia el refresh token por un access token de corta duración.
 * Nunca se invoca sin las 3 credenciales presentes (mismo guard que
 * driveAdapter.js) — `fetchImpl` NUNCA se llama en ese caso.
 */
export async function cp04FetchDriveAccessToken(env = process.env, { fetchImpl = fetch, timeoutMs } = {}) {
  if (!cp04IsDriveConfigured(env)) {
    return { status: "not_configured", reason: "faltan credenciales de Google Drive (GOOGLE_DRIVE_CLIENT_ID/SECRET/REFRESH_TOKEN)" };
  }
  const config = cp04GetDriveRealAdapterConfig(env);
  const body = new URLSearchParams({
    client_id: env.GOOGLE_DRIVE_CLIENT_ID,
    client_secret: env.GOOGLE_DRIVE_CLIENT_SECRET,
    refresh_token: env.GOOGLE_DRIVE_REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  let response;
  try {
    response = await withTimeout(fetchImpl, CP04_OAUTH_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    }, timeoutMs ?? config.timeoutMs);
  } catch (error) {
    return { status: "network_error", reason: error?.name === "AbortError" ? "timeout al solicitar el access token" : `error de red: ${error.message}` };
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const classification = cp04ClassifyDriveHttpStatus(response.status);
    return { status: "token_error", classification, httpStatus: response.status, reason: data?.error_description || data?.error || "fallo desconocido al obtener el access token" };
  }
  return {
    status: "obtained",
    accessToken: data.access_token,
    tokenType: data.token_type || "Bearer",
    expiresInSeconds: data.expires_in ?? null,
    redactedAccessToken: cp04RedactDriveToken(data.access_token),
  };
}

/** Revoca un access/refresh token — procedimiento documentado de "cómo desconectar Drive" (Paso 7/10). */
export async function cp04RevokeDriveToken(token, { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (typeof token !== "string" || token.length === 0) {
    return { status: "invalid_params", reason: "cp04RevokeDriveToken requiere un token no vacío" };
  }
  let response;
  try {
    response = await withTimeout(fetchImpl, `${CP04_OAUTH_REVOKE_URL}?token=${encodeURIComponent(token)}`, { method: "POST" }, timeoutMs);
  } catch (error) {
    return { status: "network_error", reason: error?.name === "AbortError" ? "timeout al revocar el token" : `error de red: ${error.message}` };
  }
  if (!response.ok) return { status: "revoke_failed", httpStatus: response.status, classification: cp04ClassifyDriveHttpStatus(response.status) };
  return { status: "revoked" };
}

// --- Adaptador real ----------------------------------------------------------

function multipartBody(metadata, buffer, mimeType) {
  const boundary = `cp04_drive_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const metaPart = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    "utf8"
  );
  const contentHeader = Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`, "utf8");
  const closing = Buffer.from(`\r\n--${boundary}--`, "utf8");
  return { boundary, body: Buffer.concat([metaPart, contentHeader, buffer, closing]) };
}

/**
 * @param {object} [env]
 * @param {{fetchImpl?:Function, sleepFn?:Function}} [options] - `fetchImpl`/`sleepFn` inyectables, para tests deterministas sin red ni temporizadores reales.
 */
export function cp04CreateRealDriveAdapter(env = process.env, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const sleepFn = options.sleepFn || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const config = cp04GetDriveRealAdapterConfig(env);

  function notConfigured() {
    return cp04IsDriveConfigured(env) && cp04IsDriveSyncEnabled(env)
      ? null
      : { status: "not_configured", reason: !cp04IsDriveSyncEnabled(env) ? "CP04_DRIVE_SYNC_ENABLED no es \"true\"" : "faltan credenciales de Google Drive" };
  }

  /** Puerta de 2 niveles compartida por todos los métodos de escritura/lectura remota. `intendedAction` se devuelve tal cual en el resultado dry-run, para poder auditar qué se HABRÍA hecho sin hacerlo. */
  function gate(intendedAction) {
    const nc = notConfigured();
    if (nc) return nc;
    if (config.dryRun) return { status: "dry_run", intendedAction, reason: "CP04_DRIVE_DRY_RUN no es \"false\" — no se ha enviado ninguna petición real" };
    return null;
  }

  async function getAccessTokenOrGate() {
    const token = await cp04FetchDriveAccessToken(env, { fetchImpl, timeoutMs: config.timeoutMs });
    if (token.status !== "obtained") return { blocked: true, result: token };
    return { blocked: false, accessToken: token.accessToken };
  }

  async function withRetries(fn) {
    let lastResult = null;
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      lastResult = await fn(attempt);
      if (lastResult.status !== "retryable_error") return lastResult;
      if (attempt < config.maxRetries) await sleepFn(cp04ComputeBackoffDelayMs(attempt, DEFAULT_BASE_DELAY_MS));
    }
    return { ...lastResult, status: "failed", attempts: config.maxRetries };
  }

  async function authorizedRequest(accessToken, url, init) {
    let response;
    try {
      response = await withTimeout(fetchImpl, url, { ...init, headers: { ...(init.headers || {}), Authorization: `Bearer ${accessToken}` } }, config.timeoutMs);
    } catch (error) {
      return { status: "retryable_error", classification: "network_error", reason: error?.name === "AbortError" ? "timeout" : `error de red: ${error.message}` };
    }
    const data = await response.json().catch(() => null);
    if (response.ok) return { status: "ok", data };
    const classification = cp04ClassifyDriveHttpStatus(response.status, data?.error?.errors?.[0]?.reason);
    return {
      status: cp04IsRetryableDriveClassification(classification) ? "retryable_error" : "failed",
      classification,
      httpStatus: response.status,
      reason: data?.error?.message || `error HTTP ${response.status}`,
    };
  }

  /** Igual que `authorizedRequest`, pero para respuestas BINARIAS (descarga de contenido) — nunca intenta `response.json()` sobre bytes arbitrarios. */
  async function authorizedBinaryRequest(accessToken, url) {
    let response;
    try {
      response = await withTimeout(fetchImpl, url, { headers: { Authorization: `Bearer ${accessToken}` } }, config.timeoutMs);
    } catch (error) {
      return { status: "retryable_error", classification: "network_error", reason: error?.name === "AbortError" ? "timeout" : `error de red: ${error.message}` };
    }
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return { status: "ok", data: Buffer.from(arrayBuffer) };
    }
    const errorBody = await response.json().catch(() => null);
    const classification = cp04ClassifyDriveHttpStatus(response.status, errorBody?.error?.errors?.[0]?.reason);
    return {
      status: cp04IsRetryableDriveClassification(classification) ? "retryable_error" : "failed",
      classification,
      httpStatus: response.status,
      reason: errorBody?.error?.message || `error HTTP ${response.status}`,
    };
  }

  /** Busca (sin crear) una carpeta o archivo por nombre exacto dentro de un padre — pagina hasta agotar nextPageToken. */
  async function findChildByName(accessToken, parentId, name, { onlyFolders = false } = {}) {
    const mimeClause = onlyFolders ? " and mimeType='application/vnd.google-apps.folder'" : "";
    const q = `name=${JSON.stringify(name)} and '${parentId}' in parents and trashed=false${mimeClause}`;
    let pageToken;
    do {
      const url = new URL(`${CP04_DRIVE_API_BASE}/files`);
      url.searchParams.set("q", q);
      url.searchParams.set("fields", "nextPageToken, files(id,name,mimeType,size,md5Checksum,appProperties)");
      url.searchParams.set("pageSize", "100");
      if (pageToken) url.searchParams.set("pageToken", pageToken);
      const result = await withRetries(() => authorizedRequest(accessToken, url.toString(), { method: "GET" }));
      if (result.status !== "ok") return result;
      const match = (result.data?.files || [])[0];
      if (match) return { status: "ok", data: match };
      pageToken = result.data?.nextPageToken;
    } while (pageToken);
    return { status: "ok", data: null };
  }

  async function createFolderRaw(accessToken, parentId, name) {
    const metadata = { name, mimeType: "application/vnd.google-apps.folder", parents: [parentId] };
    const url = `${CP04_DRIVE_API_BASE}/files?fields=id,name`;
    return withRetries(() => authorizedRequest(accessToken, url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(metadata) }));
  }

  async function resolvePathToFolderId(accessToken, folderPath, { createIfMissing }) {
    const segments = String(folderPath).split("/").filter(Boolean);
    let parentId = config.rootFolderId || "root";
    for (const segment of segments) {
      const found = await findChildByName(accessToken, parentId, segment, { onlyFolders: true });
      if (found.status !== "ok") return found;
      if (found.data) {
        parentId = found.data.id;
        continue;
      }
      if (!createIfMissing) return { status: "not_found", reason: `carpeta "${segment}" no existe y createIfMissing=false` };
      const created = await createFolderRaw(accessToken, parentId, segment);
      if (created.status !== "ok") return created;
      parentId = created.data.id;
    }
    return { status: "ok", data: { folderId: parentId } };
  }

  return {
    /** Crea (de forma idempotente — no duplica si ya existe) toda la ruta de carpetas indicada. */
    async createFolder(folderPath) {
      const blocked = gate({ action: "createFolder", folderPath });
      if (blocked) return blocked;

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const resolved = await resolvePathToFolderId(auth.accessToken, folderPath, { createIfMissing: true });
      if (resolved.status !== "ok") return resolved;
      return { status: "completed", folderId: resolved.data.folderId, folderPath };
    },

    /**
     * Sube un archivo, con control de duplicados e idempotencia real:
     * mismo checksum ya presente en `appProperties.cp04Checksum` ⇒
     * `skipped_duplicate` (no vuelve a subir). Checksum distinto con el
     * mismo nombre ⇒ actualiza el archivo existente (PATCH) en vez de
     * crear uno duplicado. Comportamiento histórico sin cambios (Prompt
     * 1/5) — para elegir explícitamente entre las estrategias de
     * duplicado de la Fase 6 (rechazar/versionar/renombrar/sobrescribir
     * con autorización), usar `driveDuplicateStrategy.js` por encima de
     * este método + `findFile`.
     */
    async uploadFile(folderPath, fileName, content, meta = {}) {
      const blocked = gate({ action: "uploadFile", folderPath, fileName });
      if (blocked) return blocked;

      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
      const checksum = checksumOfContent(buffer);
      const mimeType = meta.mimeType || guessMime(fileName);

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const folderResolved = await resolvePathToFolderId(auth.accessToken, folderPath, { createIfMissing: true });
      if (folderResolved.status !== "ok") return folderResolved;
      const folderId = folderResolved.data.folderId;

      const existing = await findChildByName(auth.accessToken, folderId, fileName, { onlyFolders: false });
      if (existing.status !== "ok") return existing;

      if (existing.data && existing.data.appProperties?.cp04Checksum === checksum) {
        return { status: "skipped_duplicate", fileId: existing.data.id, checksum, reason: "ya existe un archivo con el mismo nombre y el mismo checksum" };
      }

      return performUpload(auth.accessToken, folderId, existing.data, fileName, buffer, mimeType, checksum);
    },

    /** Lista el contenido de una carpeta (búsqueda paginada) — nunca crea nada, solo lee. */
    async listFolder(folderPath, { pageToken: initialPageToken } = {}) {
      const blocked = gate({ action: "listFolder", folderPath });
      if (blocked) return blocked;

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const resolved = await resolvePathToFolderId(auth.accessToken, folderPath, { createIfMissing: false });
      if (resolved.status !== "ok") return resolved;

      const url = new URL(`${CP04_DRIVE_API_BASE}/files`);
      url.searchParams.set("q", `'${resolved.data.folderId}' in parents and trashed=false`);
      url.searchParams.set("fields", "nextPageToken, files(id,name,mimeType,size,md5Checksum)");
      url.searchParams.set("pageSize", "100");
      if (initialPageToken) url.searchParams.set("pageToken", initialPageToken);

      const result = await withRetries(() => authorizedRequest(auth.accessToken, url.toString(), { method: "GET" }));
      if (result.status !== "ok") return result;
      return { status: "completed", files: result.data?.files || [], nextPageToken: result.data?.nextPageToken || null };
    },

    /** Busca (sin crear ni subir nada) un archivo por nombre exacto dentro de una carpeta — base de `driveDuplicateStrategy.js`. */
    async findFile(folderPath, fileName) {
      const blocked = gate({ action: "findFile", folderPath, fileName });
      if (blocked) return blocked;

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const resolved = await resolvePathToFolderId(auth.accessToken, folderPath, { createIfMissing: false });
      if (resolved.status !== "ok") return resolved;

      const found = await findChildByName(auth.accessToken, resolved.data.folderId, fileName, { onlyFolders: false });
      if (found.status !== "ok") return found;
      return { status: "completed", found: Boolean(found.data), file: found.data || null };
    },

    /**
     * Actualiza un archivo que YA debe existir (a diferencia de
     * `uploadFile`, que crea si no existe) — pensado para consumidores
     * que quieren dejar explícito "esto es una actualización, no una
     * subida nueva". Si no existe, `not_found` — nunca crea uno nuevo.
     */
    async updateFile(folderPath, fileName, content, meta = {}) {
      const blocked = gate({ action: "updateFile", folderPath, fileName });
      if (blocked) return blocked;

      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
      const checksum = checksumOfContent(buffer);
      const mimeType = meta.mimeType || guessMime(fileName);

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const folderResolved = await resolvePathToFolderId(auth.accessToken, folderPath, { createIfMissing: false });
      if (folderResolved.status !== "ok") return folderResolved;

      const existing = await findChildByName(auth.accessToken, folderResolved.data.folderId, fileName, { onlyFolders: false });
      if (existing.status !== "ok") return existing;
      if (!existing.data) return { status: "not_found", reason: `no existe "${fileName}" en "${folderPath}" — updateFile nunca crea un archivo nuevo` };

      return performUpload(auth.accessToken, folderResolved.data.folderId, existing.data, fileName, buffer, mimeType, checksum);
    },

    /** Descarga el contenido real (bytes) de un archivo ya conocido por su `fileId`. */
    async downloadFile(fileId) {
      const blocked = gate({ action: "downloadFile", fileId });
      if (blocked) return blocked;
      if (!fileId) return { status: "invalid_params", reason: "downloadFile requiere fileId" };

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const result = await withRetries(() => authorizedBinaryRequest(auth.accessToken, `${CP04_DRIVE_API_BASE}/files/${fileId}?alt=media`));
      if (result.status !== "ok") return result;
      return { status: "completed", fileId, content: result.data, byteLength: result.data.length };
    },

    /** Metadatos mínimos de un archivo (nunca su contenido) — incluye `webViewLink` si Drive lo expone. */
    async getMetadata(fileId) {
      const blocked = gate({ action: "getMetadata", fileId });
      if (blocked) return blocked;
      if (!fileId) return { status: "invalid_params", reason: "getMetadata requiere fileId" };

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      return fetchMetadata(auth.accessToken, fileId);
    },

    /** Enlace de visualización de un archivo — atajo sobre `getMetadata`, para consumidores que solo necesitan el enlace. */
    async getLink(fileId) {
      const blocked = gate({ action: "getLink", fileId });
      if (blocked) return blocked;
      if (!fileId) return { status: "invalid_params", reason: "getLink requiere fileId" };

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const meta = await fetchMetadata(auth.accessToken, fileId);
      if (meta.status !== "completed") return meta;
      const link = meta.metadata?.webViewLink || meta.metadata?.webContentLink || null;
      if (!link) return { status: "failed", fileId, reason: "Drive no devolvió ningún enlace para este archivo" };
      return { status: "completed", fileId, link };
    },

    /**
     * Borra un archivo — SOLO si `options.authorize === true` de forma
     * explícita, además de pasar el gate de dry-run/configuración
     * habitual. Sin esa autorización explícita, nunca llega a tocar la
     * red, ni siquiera en modo real+configurado — doble candado
     * deliberado para la única operación destructiva del contrato.
     */
    async deleteFile(fileId, options = {}) {
      if (options.authorize !== true) {
        return { status: "authorization_required", reason: "deleteFile requiere options.authorize === true de forma explícita — nunca se borra por defecto" };
      }
      const blocked = gate({ action: "deleteFile", fileId });
      if (blocked) return blocked;
      if (!fileId) return { status: "invalid_params", reason: "deleteFile requiere fileId" };

      const auth = await getAccessTokenOrGate();
      if (auth.blocked) return auth.result;

      const result = await withRetries(() => authorizedRequest(auth.accessToken, `${CP04_DRIVE_API_BASE}/files/${fileId}`, { method: "DELETE" }));
      if (result.status !== "ok") return result;
      return { status: "deleted", fileId };
    },
  };

  /** Metadatos compartidos entre `getMetadata` y `getLink` — evita duplicar la lista de `fields` en dos sitios. */
  async function fetchMetadata(accessToken, fileId) {
    const url = `${CP04_DRIVE_API_BASE}/files/${fileId}?fields=id,name,mimeType,size,md5Checksum,createdTime,modifiedTime,webViewLink,webContentLink,appProperties`;
    const result = await withRetries(() => authorizedRequest(accessToken, url, { method: "GET" }));
    if (result.status !== "ok") return result;
    return { status: "completed", metadata: result.data };
  }

  /** Lógica de subida compartida entre `uploadFile` (crea-o-actualiza) y `updateFile` (solo actualiza) — misma verificación post-subida en ambos. */
  async function performUpload(accessToken, folderId, existingFile, fileName, buffer, mimeType, checksum) {
    const metadata = { name: fileName, appProperties: { cp04Checksum: checksum }, ...(existingFile ? {} : { parents: [folderId] }) };
    const { body: uploadBody, boundary } = multipartBody(metadata, buffer, mimeType);
    const isUpdate = Boolean(existingFile);
    const url = isUpdate
      ? `${CP04_DRIVE_UPLOAD_API_BASE}/files/${existingFile.id}?uploadType=multipart&fields=id,name,size,md5Checksum`
      : `${CP04_DRIVE_UPLOAD_API_BASE}/files?uploadType=multipart&fields=id,name,size,md5Checksum`;

    const uploadResult = await withRetries(() => authorizedRequest(accessToken, url, {
      method: isUpdate ? "PATCH" : "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: uploadBody,
    }));
    if (uploadResult.status !== "ok") return uploadResult;

    const fileId = uploadResult.data.id;
    if (!config.uploadVerify) {
      return { status: isUpdate ? "updated" : "completed", fileId, checksum, byteLength: buffer.length };
    }

    const verify = await withRetries(() => authorizedRequest(accessToken, `${CP04_DRIVE_API_BASE}/files/${fileId}?fields=id,size,md5Checksum`, { method: "GET" }));
    if (verify.status !== "ok") return { status: "verification_failed", fileId, reason: verify.reason };
    const remoteSize = Number(verify.data?.size);
    if (Number.isFinite(remoteSize) && remoteSize !== buffer.length) {
      return { status: "verification_failed", fileId, reason: `tamaño remoto (${remoteSize}) no coincide con el tamaño subido (${buffer.length})` };
    }
    return { status: isUpdate ? "updated" : "completed", fileId, checksum, byteLength: buffer.length, verified: true };
  }
}
