// Prompt 4B · Fase 6 — Estrategias de duplicado, por encima del contrato
// compartido de adaptadores (`findFile`/`uploadFile`, Fase 3).
//
// Deliberadamente NO toca `driveRealAdapter.js`/`driveMockAdapter.js`:
// su `uploadFile` ya tiene un comportamiento probado y estable (mismo
// checksum ⇒ `skipped_duplicate`; checksum distinto ⇒ actualiza sin
// preguntar) que 27+12 tests dependen de mantener. Esta capa se apoya
// en `findFile` + `uploadFile` para ofrecer las estrategias EXPLÍCITAS
// que pide la Fase 6, con un default seguro y no destructivo ("reuse":
// ante un conflicto real, NUNCA sobrescribe sin que se pida
// explícitamente otra estrategia).

import { createHash } from "node:crypto";
import path from "node:path";
import { Buffer } from "node:buffer";

export const CP04_DRIVE_DUPLICATE_STRATEGIES = Object.freeze(["reject", "reuse", "version", "overwrite", "rename"]);

function checksumOfContent(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ""), "utf8");
  return createHash("sha256").update(buf).digest("hex");
}

/** Nombre "versionado" determinista: mismo contenido nuevo ⇒ siempre el mismo nombre (content-addressed, no timestamp/random) — reintentar la misma subida es idempotente incluso con estrategia "version"/"rename". */
export function cp04BuildVersionedFileName(fileName, checksum) {
  const ext = path.extname(fileName);
  const stem = path.basename(fileName, ext);
  return `${stem} (${checksum.slice(0, 8)})${ext}`;
}

/**
 * Extrae el checksum "conocido" de un archivo encontrado vía
 * `adapter.findFile()` — tolera las 2 formas de exponerlo que ya
 * existen en el repo: `file.checksum` (driveMockAdapter.js) y
 * `file.appProperties.cp04Checksum` (driveRealAdapter.js, formato
 * nativo de la API de Drive).
 */
function extractExistingChecksum(file) {
  return file?.checksum ?? file?.appProperties?.cp04Checksum ?? null;
}

/**
 * Resuelve una subida aplicando la estrategia de duplicado elegida.
 * Requiere que `adapter` implemente el contrato de la Fase 3
 * (`findFile`+`uploadFile`) — funciona igual con el adaptador real, el
 * mock o el `not_configured` (propaga su `status` tal cual, sin
 * intentar reinterpretarlo).
 * @param {{findFile:Function, uploadFile:Function}} adapter
 * @param {{folderPath:string, fileName:string, content:Buffer|string, meta?:object, strategy?:("reject"|"reuse"|"version"|"overwrite"|"rename"), authorizeOverwrite?:boolean}} params
 */
export async function cp04ResolveDriveDuplicateUpload(adapter, { folderPath, fileName, content, meta = {}, strategy = "reuse", authorizeOverwrite = false } = {}) {
  if (!CP04_DRIVE_DUPLICATE_STRATEGIES.includes(strategy)) {
    throw new TypeError(`cp04ResolveDriveDuplicateUpload: estrategia desconocida "${strategy}" — válidas: ${CP04_DRIVE_DUPLICATE_STRATEGIES.join(", ")}`);
  }

  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ""), "utf8");
  const checksum = checksumOfContent(buffer);

  const found = await adapter.findFile(folderPath, fileName);
  // Cualquier estado que no sea "completed" (not_configured/dry_run/
  // errores de red o de permisos) se propaga tal cual — esta capa nunca
  // reinterpreta ni oculta un fallo del adaptador subyacente.
  if (found.status !== "completed") return found;

  if (!found.found) {
    return adapter.uploadFile(folderPath, fileName, buffer, meta);
  }

  const existingChecksum = extractExistingChecksum(found.file);
  if (existingChecksum === checksum) {
    // Mismo contenido de verdad — no es un conflicto, es EL MISMO
    // archivo. El adaptador ya sabe devolver `skipped_duplicate` para
    // este caso exacto, en las 2 implementaciones.
    return adapter.uploadFile(folderPath, fileName, buffer, meta);
  }

  switch (strategy) {
    case "reject":
      return { status: "rejected_duplicate", existingFileId: found.file.id, reason: `ya existe "${fileName}" en "${folderPath}" con contenido distinto — estrategia "reject"` };

    case "reuse":
      return { status: "kept_existing", existingFileId: found.file.id, reason: `ya existe "${fileName}" en "${folderPath}" con contenido distinto — estrategia por defecto "reuse" no sobrescribe sin autorización explícita` };

    case "version":
    case "rename": {
      const newName = cp04BuildVersionedFileName(fileName, checksum);
      const result = await adapter.uploadFile(folderPath, newName, buffer, meta);
      const mappedStatus = result.status === "completed" ? (strategy === "version" ? "versioned" : "renamed_uploaded") : result.status;
      return { ...result, status: mappedStatus, fileName: newName, originalFileName: fileName };
    }

    case "overwrite":
      if (authorizeOverwrite !== true) {
        return { status: "overwrite_not_authorized", existingFileId: found.file.id, reason: "estrategia 'overwrite' requiere authorizeOverwrite === true explícito — nunca sobrescribe por defecto" };
      }
      return adapter.uploadFile(folderPath, fileName, buffer, meta);

    /* c8 ignore next 2 -- inalcanzable: la validación de arriba ya descarta cualquier valor fuera de CP04_DRIVE_DUPLICATE_STRATEGIES. */
    default:
      return { status: "failed", reason: `estrategia "${strategy}" no implementada` };
  }
}
