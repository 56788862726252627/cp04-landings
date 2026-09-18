// Prompt 4B · Fase 9 — Adaptador MOCK de Google Drive, 100% en memoria.
//
// Implementa EXACTAMENTE el mismo contrato que `driveRealAdapter.js`
// (createFolder/uploadFile/listFolder/findFile/updateFile/downloadFile/
// getMetadata/getLink/deleteFile) — mismo vocabulario de `status`, para
// que cualquier consumidor (driveSyncManager, driveDuplicateStrategy,
// driveExportSync) funcione igual con el adaptador real o con este,
// sin ninguna rama de código específica de "modo mock".
//
// Coste 0 € por diseño: no hace ninguna llamada de red, no necesita
// credenciales, y permite desarrollar y probar TODO el flujo (crear
// carpetas, subir, listar, duplicados, errores) sin tocar la cuota
// gratuita real de Drive ni depender de que las credenciales ya estén
// configuradas (Fase 12 sigue pendiente de que alguien las complete).

import { createHash, randomUUID } from "node:crypto";
import { Buffer } from "node:buffer";

function checksumOfContent(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ""), "utf8");
  return createHash("sha256").update(buf).digest("hex");
}

function normalizeFolderPath(folderPath) {
  return String(folderPath || "").split("/").map((s) => s.trim()).filter(Boolean).join("/");
}

/**
 * @param {{simulateError?: (action:string, params:object) => (object|null), clock?: () => string}} [options]
 * - `simulateError`: hook para pruebas — recibe la acción (p. ej.
 *   "uploadFile") y sus parámetros, devuelve un resultado de error a
 *   inyectar (p. ej. `{status:"failed", classification:"rate_limited", reason:"..."}`)
 *   o `null`/`undefined` para dejar pasar la operación con normalidad.
 *   Permite probar cuota excedida/token expirado/permisos/red sin
 *   ningún servidor real (Fase 11).
 * - `clock`: inyectable para tests deterministas (por defecto `Date.now`/ISO real).
 */
export function cp04CreateMockDriveAdapter(options = {}) {
  const simulateError = options.simulateError || (() => null);
  const now = options.clock || (() => new Date().toISOString());

  const folders = new Map(); // folderPath -> {id, name, path}
  const files = new Map(); // folderPath::fileName -> {id, name, folderPath, content, checksum, mimeType, sizeBytes, createdAt, modifiedAt, versions:[]}
  const filesById = new Map(); // fileId -> misma referencia que `files`

  let folderSeq = 0;
  let fileSeq = 0;
  const nextFolderId = () => `mock-folder-${(folderSeq += 1)}-${randomUUID().slice(0, 8)}`;
  const nextFileId = () => `mock-file-${(fileSeq += 1)}-${randomUUID().slice(0, 8)}`;

  function fileKey(folderPath, fileName) {
    return `${normalizeFolderPath(folderPath)}::${fileName}`;
  }

  function ensureFolderChain(folderPath) {
    const segments = normalizeFolderPath(folderPath).split("/").filter(Boolean);
    let acc = "";
    let last = null;
    for (const segment of segments) {
      acc = acc ? `${acc}/${segment}` : segment;
      if (!folders.has(acc)) {
        folders.set(acc, { id: nextFolderId(), name: segment, path: acc });
      }
      last = folders.get(acc);
    }
    return last;
  }

  function maybeError(action, params) {
    const forced = simulateError(action, params);
    return forced || null;
  }

  function doUpload(folderPath, fileName, content, meta = {}) {
    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ""), "utf8");
    const checksum = checksumOfContent(buffer);
    const folder = ensureFolderChain(folderPath);
    const key = fileKey(folderPath, fileName);
    const existing = files.get(key);

    if (existing && existing.checksum === checksum) {
      return { status: "skipped_duplicate", fileId: existing.id, checksum, reason: "ya existe un archivo simulado con el mismo nombre y el mismo checksum" };
    }

    const isUpdate = Boolean(existing);
    const record = {
      id: existing?.id || nextFileId(),
      name: fileName,
      folderPath: folder.path,
      folderId: folder.id,
      content: buffer,
      checksum,
      mimeType: meta.mimeType || "application/octet-stream",
      sizeBytes: buffer.length,
      createdAt: existing?.createdAt || now(),
      modifiedAt: now(),
      versions: existing ? [...existing.versions, { checksum: existing.checksum, replacedAt: now() }] : [],
    };
    files.set(key, record);
    filesById.set(record.id, record);

    return { status: isUpdate ? "updated" : "completed", fileId: record.id, checksum, byteLength: buffer.length, verified: true };
  }

  return {
    async createFolder(folderPath) {
      const forced = maybeError("createFolder", { folderPath });
      if (forced) return forced;
      if (!folderPath) return { status: "invalid_params", reason: "createFolder requiere folderPath" };

      const folder = ensureFolderChain(folderPath);
      return { status: "completed", folderId: folder.id, folderPath: normalizeFolderPath(folderPath) };
    },

    async uploadFile(folderPath, fileName, content, meta = {}) {
      const forced = maybeError("uploadFile", { folderPath, fileName });
      if (forced) return forced;
      if (!folderPath || !fileName) return { status: "invalid_params", reason: "uploadFile requiere folderPath y fileName" };
      return doUpload(folderPath, fileName, content, meta);
    },

    async listFolder(folderPath) {
      const forced = maybeError("listFolder", { folderPath });
      if (forced) return forced;
      const normalized = normalizeFolderPath(folderPath);
      if (!folders.has(normalized)) return { status: "not_found", reason: `la carpeta simulada "${normalized}" no existe` };

      const matched = [...files.values()].filter((f) => f.folderPath === normalized);
      return {
        status: "completed",
        files: matched.map((f) => ({ id: f.id, name: f.name, mimeType: f.mimeType, size: String(f.sizeBytes), md5Checksum: f.checksum })),
        nextPageToken: null,
      };
    },

    async findFile(folderPath, fileName) {
      const forced = maybeError("findFile", { folderPath, fileName });
      if (forced) return forced;
      const existing = files.get(fileKey(folderPath, fileName));
      return { status: "completed", found: Boolean(existing), file: existing ? { id: existing.id, name: existing.name, checksum: existing.checksum } : null };
    },

    async updateFile(folderPath, fileName, content, meta = {}) {
      const forced = maybeError("updateFile", { folderPath, fileName });
      if (forced) return forced;
      const key = fileKey(folderPath, fileName);
      if (!files.has(key)) return { status: "not_found", reason: `no existe "${fileName}" en "${folderPath}" — updateFile nunca crea un archivo nuevo` };
      return doUpload(folderPath, fileName, content, meta);
    },

    async downloadFile(fileId) {
      const forced = maybeError("downloadFile", { fileId });
      if (forced) return forced;
      const record = filesById.get(fileId);
      if (!record) return { status: "not_found", reason: `no existe ningún archivo simulado con fileId "${fileId}"` };
      return { status: "completed", fileId, content: record.content, byteLength: record.sizeBytes };
    },

    async getMetadata(fileId) {
      const forced = maybeError("getMetadata", { fileId });
      if (forced) return forced;
      const record = filesById.get(fileId);
      if (!record) return { status: "not_found", reason: `no existe ningún archivo simulado con fileId "${fileId}"` };
      return {
        status: "completed",
        metadata: {
          id: record.id,
          name: record.name,
          mimeType: record.mimeType,
          size: String(record.sizeBytes),
          md5Checksum: record.checksum,
          createdTime: record.createdAt,
          modifiedTime: record.modifiedAt,
          webViewLink: `https://drive.mock.cp04.local/file/${record.id}/view`,
        },
      };
    },

    async getLink(fileId) {
      const forced = maybeError("getLink", { fileId });
      if (forced) return forced;
      const record = filesById.get(fileId);
      if (!record) return { status: "not_found", reason: `no existe ningún archivo simulado con fileId "${fileId}"` };
      return { status: "completed", fileId, link: `https://drive.mock.cp04.local/file/${fileId}/view` };
    },

    async deleteFile(fileId, deleteOptions = {}) {
      if (deleteOptions.authorize !== true) {
        return { status: "authorization_required", reason: "deleteFile requiere options.authorize === true de forma explícita — nunca se borra por defecto" };
      }
      const forced = maybeError("deleteFile", { fileId });
      if (forced) return forced;
      const record = filesById.get(fileId);
      if (!record) return { status: "not_found", reason: `no existe ningún archivo simulado con fileId "${fileId}"` };
      files.delete(fileKey(record.folderPath, record.name));
      filesById.delete(fileId);
      return { status: "deleted", fileId };
    },

    // Utilidades EXCLUSIVAS del mock (fuera del contrato estándar) —
    // pensadas solo para aserciones de test, nunca las usa código de
    // producción (que solo debe depender del contrato compartido).
    _debugState() {
      return { folders: [...folders.values()], files: [...files.values()].map((f) => ({ id: f.id, name: f.name, folderPath: f.folderPath, checksum: f.checksum, versions: f.versions.length })) };
    },
  };
}
