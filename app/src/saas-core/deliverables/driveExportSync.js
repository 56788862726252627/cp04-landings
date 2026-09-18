// Prompt 4B · Fase 10 — Punto de integración NO bloqueante entre la
// fábrica de entregables (`exportPackageManager.js`) y Google Drive.
//
// Deliberadamente NO se llama automáticamente desde
// `exportPackageManager.js` — es un paso EXPLÍCITO y opcional que un
// consumidor invoca DESPUÉS de tener el paquete final ya escrito en
// disco (local, siempre a salvo). Si Drive no está configurado, si
// cualquier subida falla, o si el propio adaptador lanza, esta capa
// NUNCA propaga la excepción hacia arriba ni toca/borra nada local —
// el peor caso es "no se sincronizó con Drive todavía", nunca "se
// perdió el entregable".

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cp04ValidateDriveUpload } from "./driveFileValidator.js";
import { cp04ResolveDriveDuplicateUpload } from "./driveDuplicateStrategy.js";
import {
  CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04,
  CP04_DRIVE_UNIVERSAL_AGENCIA_IA,
  CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS,
  CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS,
} from "./driveUniversalFolderTree.js";

const SUBFOLDERS_BY_ROOT = Object.freeze({
  [CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04]: CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS,
  [CP04_DRIVE_UNIVERSAL_AGENCIA_IA]: CP04_DRIVE_UNIVERSAL_AGENCIA_IA_SUBFOLDERS,
});

// Mapeo best-effort de las carpetas LOCALES de `exportPackageManager.js`
// (árbol de 11 subcarpetas, `folderStructure.js`) a las categorías del
// árbol UNIVERSAL de Drive (Fase 4) — los nombres no coinciden 1:1 a
// propósito (son dos árboles con propósitos distintos, ver
// `driveUniversalFolderTree.js`), así que se traduce explícitamente en
// vez de asumir que coinciden.
const LOCAL_FOLDER_TO_DRIVE_CATEGORY = Object.freeze({
  Contratos: "Material Comercial",
  PDFs: "PDF",
  Presentaciones: "Material Comercial",
  Mockups: "Mockups",
  Logos: "Logos",
  Iconos: "Iconos",
  Fondos: "Fondos",
  Marketing: "Material Comercial",
  Informes: "Informes",
  Vídeos: "Vídeos",
  Documentación: "Informes",
});

/**
 * Traduce una carpeta local a una categoría válida DENTRO del root de
 * Drive elegido — si la categoría mapeada no existe en ese root (p. ej.
 * "Iconos" no existe bajo "Agencia IA"), cae a "Material Comercial" si
 * existe, o a la primera categoría del árbol como último recurso.
 * Nunca inventa una carpeta fuera del árbol ya validado (Fase 4).
 */
export function cp04MapExportFolderToDriveCategory(localFolderName, rootFolder = CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04) {
  const subfolders = SUBFOLDERS_BY_ROOT[rootFolder] || CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04_SUBFOLDERS;
  const mapped = LOCAL_FOLDER_TO_DRIVE_CATEGORY[localFolderName];
  if (mapped && subfolders.includes(mapped)) return mapped;
  if (subfolders.includes("Material Comercial")) return "Material Comercial";
  return subfolders[0];
}

/**
 * Sincroniza UN archivo ya generado localmente hacia Drive — nunca
 * lanza. Cualquier fallo (adaptador ausente, Drive no configurado, red,
 * validación) se devuelve como resultado estructurado, no como excepción.
 * @param {object} adapter - cualquier adaptador que cumpla el contrato de la Fase 3 (real/mock/not_configured).
 * @param {{rootFolder:string, category:string, fileName:string, content:Buffer, mimeType?:string, strategy?:string, authorizeOverwrite?:boolean}} params
 */
export async function cp04SyncFileToDrive(adapter, { rootFolder, category, fileName, content, mimeType, strategy = "reuse", authorizeOverwrite = false } = {}) {
  try {
    if (!adapter) return { fileName, status: "drive_unavailable", reason: "no se proporcionó ningún adaptador de Drive — el archivo sigue intacto en disco" };

    const folderPath = `${rootFolder}/${category}`;
    const validation = cp04ValidateDriveUpload({ folderPath, fileName, content, declaredMime: mimeType });
    if (!validation.valid) return { fileName, status: "invalid", reason: validation.errors.join("; ") };

    const result = await cp04ResolveDriveDuplicateUpload(adapter, {
      folderPath,
      fileName: validation.safeName,
      content,
      meta: { mimeType: validation.mime },
      strategy,
      authorizeOverwrite,
    });
    return { fileName: validation.safeName, folderPath, ...result };
  } catch (error) {
    return { fileName, status: "error", reason: `fallo inesperado al sincronizar con Drive (el archivo local no se ha visto afectado): ${error.message}` };
  }
}

const CP04_DRIVE_SYNC_SUCCESS_STATUSES = Object.freeze(["completed", "updated", "skipped_duplicate", "versioned", "renamed_uploaded"]);

/**
 * Sincroniza TODO un paquete final ya escrito en disco por
 * `cp04BuildFinalExportPackage()` — lee cada archivo del manifiesto
 * desde `targetBaseDir`, nunca modifica ni borra nada local. Pensado
 * para informes, auditorías, mockups, PDFs, material comercial y
 * entregables SaaS (Fase 10) — no se invoca nunca automáticamente,
 * es responsabilidad explícita del consumidor.
 * @param {object} adapter
 * @param {{manifest:{items:{id:string, path:string}[]}}} packageResult - resultado de `cp04BuildFinalExportPackage()`.
 * @param {{targetBaseDir:string, rootFolder?:string, strategy?:string}} options
 */
export async function cp04SyncExportPackageToDrive(adapter, packageResult, { targetBaseDir, rootFolder = CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04, strategy = "reuse" } = {}) {
  const items = packageResult?.manifest?.items || [];
  const results = [];

  for (const item of items) {
    let content;
    try {
      content = await readFile(path.join(targetBaseDir, item.path));
    } catch (error) {
      results.push({ itemId: item.id, fileName: path.basename(item.path), status: "error", reason: `no se pudo leer el archivo local (sigue intacto, solo falló la lectura para sincronizar): ${error.message}` });
      continue;
    }
    const category = cp04MapExportFolderToDriveCategory(item.path.split("/")[0], rootFolder);
    const syncResult = await cp04SyncFileToDrive(adapter, { rootFolder, category, fileName: path.basename(item.path), content, strategy });
    results.push({ itemId: item.id, ...syncResult });
  }

  const succeeded = results.filter((r) => CP04_DRIVE_SYNC_SUCCESS_STATUSES.includes(r.status)).length;
  return {
    attempted: results.length,
    succeeded,
    failed: results.length - succeeded,
    driveAvailable: results.length > 0 && !results.every((r) => r.status === "not_configured" || r.status === "drive_unavailable"),
    results,
  };
}
