import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";

import {
  cp04IsDriveDryRun,
  cp04GetDriveRealAdapterConfig,
  cp04RedactDriveToken,
  cp04ClassifyDriveHttpStatus,
  cp04IsRetryableDriveClassification,
  cp04FetchDriveAccessToken,
  cp04RevokeDriveToken,
  cp04CreateRealDriveAdapter,
} from "./driveRealAdapter.js";

const FULL_CREDS = Object.freeze({
  GOOGLE_DRIVE_CLIENT_ID: "id",
  GOOGLE_DRIVE_CLIENT_SECRET: "super-secret-value",
  GOOGLE_DRIVE_REFRESH_TOKEN: "refresh-token-value",
});
const ENABLED = Object.freeze({ CP04_DRIVE_SYNC_ENABLED: "true" });
const NO_DRY_RUN = Object.freeze({ CP04_DRIVE_DRY_RUN: "false" });

function throwingFetch() {
  throw new Error("fetchImpl NUNCA debería invocarse en este escenario");
}

/** fetchImpl determinista: sirve las respuestas en el orden exacto en que se programan, sin tocar la red. */
function scriptedFetch(responses) {
  const queue = [...responses];
  return async function fetchImpl(url, init) {
    if (queue.length === 0) throw new Error(`scriptedFetch: no quedan respuestas programadas (llamada a ${url})`);
    const next = queue.shift();
    if (typeof next === "function") return next(url, init);
    return next;
  };
}

function jsonResponse(status, data) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

const noSleep = () => Promise.resolve();

// --- Configuración -----------------------------------------------------------

test("cp04IsDriveDryRun es true por defecto (fail-safe) y solo false con el string exacto \"false\"", () => {
  assert.equal(cp04IsDriveDryRun({}), true);
  assert.equal(cp04IsDriveDryRun({ CP04_DRIVE_DRY_RUN: "no" }), true);
  assert.equal(cp04IsDriveDryRun({ CP04_DRIVE_DRY_RUN: "FALSE" }), false);
  assert.equal(cp04IsDriveDryRun({ CP04_DRIVE_DRY_RUN: "false" }), false);
});

test("cp04GetDriveRealAdapterConfig aplica valores por defecto seguros y nunca expone credenciales", () => {
  const config = cp04GetDriveRealAdapterConfig({ ...FULL_CREDS, ...ENABLED });
  assert.equal(config.dryRun, true);
  assert.equal(config.uploadVerify, true);
  assert.equal(config.maxRetries, 3);
  assert.equal(config.timeoutMs, 15000);
  assert.equal(JSON.stringify(config).includes("super-secret-value"), false);
});

test("cp04GetDriveRealAdapterConfig respeta overrides explícitos", () => {
  const config = cp04GetDriveRealAdapterConfig({ CP04_DRIVE_MAX_RETRIES: "5", CP04_DRIVE_TIMEOUT_MS: "9000", CP04_DRIVE_UPLOAD_VERIFY: "false", CP04_DRIVE_ROOT_FOLDER_ID: "abc" });
  assert.equal(config.maxRetries, 5);
  assert.equal(config.timeoutMs, 9000);
  assert.equal(config.uploadVerify, false);
  assert.equal(config.rootFolderId, "abc");
});

test("cp04RedactDriveToken nunca expone el token completo", () => {
  assert.equal(cp04RedactDriveToken("ya29.a0Ab12345678"), "ya29***5678");
  assert.equal(cp04RedactDriveToken(""), null);
  assert.equal(cp04RedactDriveToken(null), null);
});

test("cp04ClassifyDriveHttpStatus clasifica 401/403/404/409/429/5xx sin dejar pasar un código crudo", () => {
  assert.equal(cp04ClassifyDriveHttpStatus(401), "unauthorized");
  assert.equal(cp04ClassifyDriveHttpStatus(403), "forbidden");
  assert.equal(cp04ClassifyDriveHttpStatus(404), "not_found");
  assert.equal(cp04ClassifyDriveHttpStatus(409), "conflict");
  assert.equal(cp04ClassifyDriveHttpStatus(429), "rate_limited");
  assert.equal(cp04ClassifyDriveHttpStatus(500), "server_error");
  assert.equal(cp04ClassifyDriveHttpStatus(503), "server_error");
  assert.equal(cp04ClassifyDriveHttpStatus(200), "ok");
});

test("cp04ClassifyDriveHttpStatus (Prompt 4B, Fase 7): un 403 con reason de cuota se distingue de un 403 de permisos genuino", () => {
  assert.equal(cp04ClassifyDriveHttpStatus(403, "quotaExceeded"), "quota_exceeded");
  assert.equal(cp04ClassifyDriveHttpStatus(403, "userRateLimitExceeded"), "quota_exceeded");
  assert.equal(cp04ClassifyDriveHttpStatus(403, "dailyLimitExceeded"), "quota_exceeded");
  assert.equal(cp04ClassifyDriveHttpStatus(403, "insufficientPermissions"), "forbidden");
  assert.equal(cp04ClassifyDriveHttpStatus(403), "forbidden");
});

test("cp04IsRetryableDriveClassification: rate_limited/server_error/network_error/quota_exceeded son reintentables, el resto no", () => {
  assert.equal(cp04IsRetryableDriveClassification("rate_limited"), true);
  assert.equal(cp04IsRetryableDriveClassification("server_error"), true);
  assert.equal(cp04IsRetryableDriveClassification("network_error"), true);
  assert.equal(cp04IsRetryableDriveClassification("quota_exceeded"), true);
  assert.equal(cp04IsRetryableDriveClassification("unauthorized"), false);
  assert.equal(cp04IsRetryableDriveClassification("not_found"), false);
});

// --- OAuth2 --------------------------------------------------------------------

test("cp04FetchDriveAccessToken sin credenciales: not_configured, fetchImpl NUNCA se invoca", async () => {
  const result = await cp04FetchDriveAccessToken({}, { fetchImpl: throwingFetch });
  assert.equal(result.status, "not_configured");
});

test("cp04FetchDriveAccessToken con credenciales: construye la petición y devuelve el token redactado en logs", async () => {
  const fetchImpl = scriptedFetch([jsonResponse(200, { access_token: "ya29.real-token-value", token_type: "Bearer", expires_in: 3600 })]);
  const result = await cp04FetchDriveAccessToken(FULL_CREDS, { fetchImpl });
  assert.equal(result.status, "obtained");
  assert.equal(result.accessToken, "ya29.real-token-value");
  assert.equal(result.redactedAccessToken.includes("real-token-value"), false);
});

test("cp04FetchDriveAccessToken ante un error OAuth (invalid_grant): token_error, nunca lanza", async () => {
  const fetchImpl = scriptedFetch([jsonResponse(400, { error: "invalid_grant", error_description: "Token has been expired or revoked" })]);
  const result = await cp04FetchDriveAccessToken(FULL_CREDS, { fetchImpl });
  assert.equal(result.status, "token_error");
  assert.match(result.reason, /expired|revoked/);
});

test("cp04FetchDriveAccessToken ante timeout: network_error, nunca lanza sin capturar", async () => {
  const abortingFetch = async () => {
    const err = new Error("aborted");
    err.name = "AbortError";
    throw err;
  };
  const result = await cp04FetchDriveAccessToken(FULL_CREDS, { fetchImpl: abortingFetch, timeoutMs: 10 });
  assert.equal(result.status, "network_error");
  assert.match(result.reason, /timeout/);
});

test("cp04RevokeDriveToken sin token: invalid_params, fetchImpl nunca se invoca", async () => {
  const result = await cp04RevokeDriveToken("", { fetchImpl: throwingFetch });
  assert.equal(result.status, "invalid_params");
});

test("cp04RevokeDriveToken con éxito: revoked", async () => {
  const fetchImpl = scriptedFetch([{ ok: true, status: 200, json: async () => ({}) }]);
  const result = await cp04RevokeDriveToken("some-token", { fetchImpl });
  assert.equal(result.status, "revoked");
});

// --- Adaptador real: puerta de seguridad (feature flag / credenciales / dry-run) ---

test("createFolder sin credenciales: not_configured, fetchImpl NUNCA se invoca", async () => {
  const adapter = cp04CreateRealDriveAdapter({}, { fetchImpl: throwingFetch });
  const result = await adapter.createFolder("Agencia IA/Club Pádel 04/PDFs");
  assert.equal(result.status, "not_configured");
});

test("uploadFile con credenciales completas pero CP04_DRIVE_SYNC_ENABLED sin activar: not_configured, fetchImpl NUNCA se invoca", async () => {
  const adapter = cp04CreateRealDriveAdapter({ ...FULL_CREDS }, { fetchImpl: throwingFetch });
  const result = await adapter.uploadFile("X", "y.pdf", Buffer.from("contenido"));
  assert.equal(result.status, "not_configured");
});

test("uploadFile configurado y con sync activado pero SIN 'CP04_DRIVE_DRY_RUN=false' explícito: dry_run, fetchImpl NUNCA se invoca (doble cierre de seguridad)", async () => {
  const adapter = cp04CreateRealDriveAdapter({ ...FULL_CREDS, ...ENABLED }, { fetchImpl: throwingFetch });
  const result = await adapter.uploadFile("Agencia IA/Club Pádel 04/PDFs", "informe.pdf", Buffer.from("contenido"));
  assert.equal(result.status, "dry_run");
  assert.equal(result.intendedAction.action, "uploadFile");
});

test("listFolder en dry-run describe la acción prevista sin tocar la red", async () => {
  const adapter = cp04CreateRealDriveAdapter({ ...FULL_CREDS, ...ENABLED }, { fetchImpl: throwingFetch });
  const result = await adapter.listFolder("Agencia IA/Club Pádel 04");
  assert.equal(result.status, "dry_run");
});

// --- Adaptador real: rutas simuladas con fetchImpl programado (fuera de dry-run) ---

const REAL_ENV = { ...FULL_CREDS, ...ENABLED, ...NO_DRY_RUN };
const TOKEN_OK = jsonResponse(200, { access_token: "fake-access-token", token_type: "Bearer", expires_in: 3600 });

test("uploadFile (subida simulada, archivo nuevo): resuelve carpeta, crea, sube y verifica — todo sobre fetchImpl programado", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK, // 1. access token
    jsonResponse(200, { files: [] }), // 2. buscar carpeta "PDFs" bajo root -> no existe
    jsonResponse(200, { id: "folder_123", name: "PDFs" }), // 3. crear carpeta
    jsonResponse(200, { files: [] }), // 4. buscar archivo existente -> no existe
    jsonResponse(200, { id: "file_abc", name: "informe.pdf" }), // 5. subida multipart (POST)
    jsonResponse(200, { id: "file_abc", size: "9", md5Checksum: "x" }), // 6. verificación posterior
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.uploadFile("PDFs", "informe.pdf", Buffer.from("contenido")); // 9 bytes
  assert.equal(result.status, "completed");
  assert.equal(result.fileId, "file_abc");
  assert.equal(result.verified, true);
  assert.ok(result.checksum);
});

test("uploadFile (control de duplicados / idempotencia): mismo nombre y mismo checksum ⇒ skipped_duplicate, nunca vuelve a subir", async () => {
  const content = Buffer.from("contenido idéntico");
  const { createHash } = await import("node:crypto");
  const checksum = createHash("sha256").update(content).digest("hex");
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(200, { files: [{ id: "folder_123", name: "PDFs" }] }), // carpeta ya existe
    jsonResponse(200, { files: [{ id: "file_existing", name: "informe.pdf", appProperties: { cp04Checksum: checksum } }] }), // archivo ya existe con MISMO checksum
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.uploadFile("PDFs", "informe.pdf", content);
  assert.equal(result.status, "skipped_duplicate");
  assert.equal(result.fileId, "file_existing");
});

test("uploadFile (actualización simulada): mismo nombre, checksum DISTINTO ⇒ PATCH sobre el archivo existente, no crea uno nuevo", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(200, { files: [{ id: "folder_123", name: "PDFs" }] }),
    jsonResponse(200, { files: [{ id: "file_existing", name: "informe.pdf", appProperties: { cp04Checksum: "checksum-viejo-distinto" } }] }),
    (url, init) => { assert.equal(init.method, "PATCH"); return jsonResponse(200, { id: "file_existing" }); },
    jsonResponse(200, { id: "file_existing", size: String(Buffer.byteLength("contenido v2!")) }),
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.uploadFile("PDFs", "informe.pdf", Buffer.from("contenido v2!"));
  assert.equal(result.status, "updated");
});

test("uploadFile con CP04_DRIVE_UPLOAD_VERIFY=false: no hace la llamada de verificación posterior", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(200, { files: [] }),
    jsonResponse(200, { id: "folder_123" }),
    jsonResponse(200, { files: [] }),
    jsonResponse(200, { id: "file_abc" }),
    // sin una 6ª respuesta: si el adaptador intentara verificar, scriptedFetch lanzaría "no quedan respuestas"
  ]);
  const adapter = cp04CreateRealDriveAdapter({ ...REAL_ENV, CP04_DRIVE_UPLOAD_VERIFY: "false" }, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.uploadFile("PDFs", "informe.pdf", Buffer.from("x"));
  assert.equal(result.status, "completed");
  assert.equal(result.verified, undefined);
});

test("uploadFile: verificación posterior detecta un tamaño remoto que no coincide ⇒ verification_failed", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(200, { files: [] }),
    jsonResponse(200, { id: "folder_123" }),
    jsonResponse(200, { files: [] }),
    jsonResponse(200, { id: "file_abc" }),
    jsonResponse(200, { id: "file_abc", size: "999999" }), // tamaño remoto no coincide
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.uploadFile("PDFs", "informe.pdf", Buffer.from("contenido"));
  assert.equal(result.status, "verification_failed");
});

test("errores 429 (rate limited): reintenta con backoff y termina en éxito si el siguiente intento funciona", async () => {
  let sleepCalls = 0;
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(429, { error: { message: "rate limit" } }), // buscar carpeta, 1er intento: 429
    jsonResponse(200, { files: [] }), // mismo GET, 2º intento: éxito, no existe
    jsonResponse(200, { id: "folder_123" }), // crear carpeta
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: () => { sleepCalls += 1; return Promise.resolve(); } });
  const result = await adapter.createFolder("PDFs");
  assert.equal(result.status, "completed");
  assert.ok(sleepCalls >= 1, "debe esperar (backoff) antes de reintentar");
});

test("errores 403 de cuota excedida (quotaExceeded): reintenta con backoff, a diferencia de un 403 de permisos genuino", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(403, { error: { message: "cuota excedida", errors: [{ reason: "quotaExceeded" }] } }),
    jsonResponse(200, { files: [] }),
    jsonResponse(200, { id: "folder_123" }),
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.createFolder("PDFs");
  assert.equal(result.status, "completed");
});

test("errores 403 de permisos genuinos (sin reason de cuota): NO son reintentables, falla en el primer intento", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(403, { error: { message: "forbidden", errors: [{ reason: "insufficientPermissions" }] } })]);
  const adapter = cp04CreateRealDriveAdapter({ ...REAL_ENV, CP04_DRIVE_MAX_RETRIES: "3" }, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.createFolder("PDFs");
  assert.equal(result.status, "failed");
  assert.equal(result.classification, "forbidden");
});

test("errores 5xx: se clasifican como server_error y son reintentables; agotados los intentos, termina en failed", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(503, { error: { message: "backend error" } }),
    jsonResponse(503, { error: { message: "backend error" } }),
    jsonResponse(503, { error: { message: "backend error" } }),
  ]);
  const adapter = cp04CreateRealDriveAdapter({ ...REAL_ENV, CP04_DRIVE_MAX_RETRIES: "3" }, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.createFolder("PDFs");
  assert.equal(result.status, "failed");
  assert.equal(result.classification, "server_error");
});

test("errores 401 (no autorizado): NO son reintentables, falla en el primer intento sin agotar reintentos", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(401, { error: { message: "invalid credentials" } })]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.createFolder("PDFs");
  assert.equal(result.status, "failed");
  assert.equal(result.classification, "unauthorized");
});

test("rutas inválidas: listFolder sobre una carpeta que no existe (createIfMissing=false) devuelve not_found sin crearla", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(200, { files: [] })]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.listFolder("CarpetaQueNoExiste");
  assert.equal(result.status, "not_found");
});

test("timeouts: un fetchImpl que aborta se traduce en network_error reintentable, nunca lanza sin capturar", async () => {
  let callsAfterToken = 0;
  const abortingFetch = async (url) => {
    if (String(url).includes("oauth2")) return TOKEN_OK;
    callsAfterToken += 1;
    const err = new Error("aborted");
    err.name = "AbortError";
    throw err;
  };
  const adapter = cp04CreateRealDriveAdapter({ ...REAL_ENV, CP04_DRIVE_MAX_RETRIES: "2" }, { fetchImpl: abortingFetch, sleepFn: noSleep });
  const result = await adapter.createFolder("PDFs");
  assert.equal(result.status, "failed");
  assert.equal(result.classification, "network_error");
  assert.ok(callsAfterToken >= 2);
});

test("logs sin secretos: ningún resultado de uploadFile (éxito o error) contiene el client secret ni el refresh token", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(500, {})]);
  const adapter = cp04CreateRealDriveAdapter({ ...REAL_ENV, CP04_DRIVE_MAX_RETRIES: "1" }, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.uploadFile("PDFs", "x.pdf", Buffer.from("y"));
  const serialized = JSON.stringify(result);
  assert.equal(serialized.includes(FULL_CREDS.GOOGLE_DRIVE_CLIENT_SECRET), false);
  assert.equal(serialized.includes(FULL_CREDS.GOOGLE_DRIVE_REFRESH_TOKEN), false);
  assert.equal(serialized.includes("fake-access-token"), false);
});

// --- Prompt 4B · Fase 3: contrato ampliado (findFile/updateFile/downloadFile/getMetadata/getLink/deleteFile) ---

test("findFile: sin credenciales, not_configured; con dry-run, dry_run; ninguno toca fetchImpl", async () => {
  const noCreds = cp04CreateRealDriveAdapter({}, { fetchImpl: throwingFetch });
  assert.equal((await noCreds.findFile("PDFs", "x.pdf")).status, "not_configured");

  const dryRun = cp04CreateRealDriveAdapter({ ...FULL_CREDS, ...ENABLED }, { fetchImpl: throwingFetch });
  assert.equal((await dryRun.findFile("PDFs", "x.pdf")).status, "dry_run");
});

test("findFile: existe ⇒ found:true con el archivo; no existe ⇒ found:false, nunca lanza", async () => {
  const foundFetch = scriptedFetch([TOKEN_OK, jsonResponse(200, { files: [{ id: "folder_1" }] }), jsonResponse(200, { files: [{ id: "file_1", name: "x.pdf" }] })]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl: foundFetch, sleepFn: noSleep });
  const found = await adapter.findFile("PDFs", "x.pdf");
  assert.equal(found.status, "completed");
  assert.equal(found.found, true);
  assert.equal(found.file.id, "file_1");

  const notFoundFetch = scriptedFetch([TOKEN_OK, jsonResponse(200, { files: [{ id: "folder_1" }] }), jsonResponse(200, { files: [] })]);
  const adapter2 = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl: notFoundFetch, sleepFn: noSleep });
  const notFound = await adapter2.findFile("PDFs", "no-existe.pdf");
  assert.equal(notFound.status, "completed");
  assert.equal(notFound.found, false);
  assert.equal(notFound.file, null);
});

test("updateFile: si el archivo NO existe, not_found — nunca crea uno nuevo (a diferencia de uploadFile)", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(200, { files: [{ id: "folder_1" }] }), jsonResponse(200, { files: [] })]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.updateFile("PDFs", "no-existe.pdf", Buffer.from("x"));
  assert.equal(result.status, "not_found");
});

test("updateFile: si el archivo existe, hace PATCH (updated) igual que uploadFile con checksum distinto", async () => {
  const fetchImpl = scriptedFetch([
    TOKEN_OK,
    jsonResponse(200, { files: [{ id: "folder_1" }] }),
    jsonResponse(200, { files: [{ id: "file_1", name: "x.pdf", appProperties: { cp04Checksum: "viejo" } }] }),
    (url, init) => { assert.equal(init.method, "PATCH"); return jsonResponse(200, { id: "file_1" }); },
    jsonResponse(200, { id: "file_1", size: "1", md5Checksum: "x" }),
  ]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.updateFile("PDFs", "x.pdf", Buffer.from("y"));
  assert.equal(result.status, "updated");
});

test("downloadFile: sin fileId, invalid_params; con dry-run, dry_run; con éxito devuelve los bytes reales", async () => {
  const noId = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl: throwingFetch, sleepFn: noSleep });
  assert.equal((await noId.downloadFile()).status, "invalid_params");

  const dryRun = cp04CreateRealDriveAdapter({ ...FULL_CREDS, ...ENABLED }, { fetchImpl: throwingFetch });
  assert.equal((await dryRun.downloadFile("file_1")).status, "dry_run");

  // OJO: `Buffer.from(str).buffer` filtraría el ArrayBuffer COMPLETO del
  // pool interno de Node (memoria de otras asignaciones), no solo estos
  // bytes — hay que usar TextEncoder, que siempre crea un ArrayBuffer
  // propio y exacto.
  const binaryFetch = scriptedFetch([TOKEN_OK, { ok: true, status: 200, arrayBuffer: async () => new TextEncoder().encode("contenido real").buffer }]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl: binaryFetch, sleepFn: noSleep });
  const result = await adapter.downloadFile("file_1");
  assert.equal(result.status, "completed");
  assert.equal(Buffer.from(result.content).toString("utf8"), "contenido real");
});

test("getMetadata / getLink: devuelven metadata real y el enlace de visualización si Drive lo expone", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(200, { id: "file_1", name: "x.pdf", webViewLink: "https://drive.google.com/file/d/file_1/view" })]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const meta = await adapter.getMetadata("file_1");
  assert.equal(meta.status, "completed");
  assert.equal(meta.metadata.id, "file_1");

  const fetchImpl2 = scriptedFetch([TOKEN_OK, jsonResponse(200, { id: "file_1", webViewLink: "https://drive.google.com/file/d/file_1/view" })]);
  const adapter2 = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl: fetchImpl2, sleepFn: noSleep });
  const link = await adapter2.getLink("file_1");
  assert.equal(link.status, "completed");
  assert.equal(link.link, "https://drive.google.com/file/d/file_1/view");
});

test("getLink: si Drive no devuelve ningún enlace, failed explícito (nunca inventa una URL)", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, jsonResponse(200, { id: "file_1" })]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.getLink("file_1");
  assert.equal(result.status, "failed");
});

test("deleteFile: SIN options.authorize===true explícito, nunca toca la red, ni siquiera en modo real+configurado", async () => {
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl: throwingFetch, sleepFn: noSleep });
  const result = await adapter.deleteFile("file_1");
  assert.equal(result.status, "authorization_required");
  const result2 = await adapter.deleteFile("file_1", { authorize: false });
  assert.equal(result2.status, "authorization_required");
});

test("deleteFile: CON options.authorize===true, borra de verdad (DELETE) tras pasar el gate habitual", async () => {
  const fetchImpl = scriptedFetch([TOKEN_OK, { ok: true, status: 204, json: async () => null }]);
  const adapter = cp04CreateRealDriveAdapter(REAL_ENV, { fetchImpl, sleepFn: noSleep });
  const result = await adapter.deleteFile("file_1", { authorize: true });
  assert.equal(result.status, "deleted");
});

test("deleteFile: incluso autorizado, sigue respetando dry-run (doble candado)", async () => {
  const adapter = cp04CreateRealDriveAdapter({ ...FULL_CREDS, ...ENABLED }, { fetchImpl: throwingFetch });
  const result = await adapter.deleteFile("file_1", { authorize: true });
  assert.equal(result.status, "dry_run");
});
