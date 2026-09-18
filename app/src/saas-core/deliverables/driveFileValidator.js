// Prompt 4B — Validador de tipos de archivo para subida a Google Drive.
//
// Aislado de `binary/binaryValidator.js` a propósito: ese módulo valida
// la ESTRUCTURA INTERNA de 3 binarios generados localmente (PDF/DOCX/
// PPTX real, firma+parseo). Este módulo valida, ANTES de intentar subir
// nada a Drive, que un archivo (de cualquiera de los 15 tipos previstos
// para la agencia/SaaS) tenga una extensión y un nombre seguros, un MIME
// coherente y un tamaño dentro del límite configurado — es la puerta de
// entrada de `driveRealAdapter.js`/`driveMockAdapter.js`, no un
// validador de contenido binario profundo.

import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { Buffer } from "node:buffer";

// Extensión → MIME canónico. `image/jpeg` cubre tanto .jpg como .jpeg
// (mismo formato, dos extensiones habituales) — se listan ambas
// entradas para que la validación por extensión sea directa.
export const CP04_DRIVE_ALLOWED_TYPES = Object.freeze({
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  zip: "application/zip",
  json: "application/json",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  md: "text/markdown",
  // Añadido más allá de la lista original de 15 (Fase 5): la fábrica de
  // entregables (`exportPackageManager.js`) ya genera HTML real
  // (propuestas comerciales, presentaciones, galerías de mockups) — sin
  // este tipo, la integración de la Fase 10 rechazaría esos archivos
  // por un motivo puramente accidental (extensión no listada), no por
  // ningún problema real de seguridad o de formato.
  html: "text/html",
});

const DEFAULT_MAX_FILE_SIZE_MB = 100;

/** Límite de tamaño configurable — nunca 0 ni negativo por un valor mal formado en `env`. */
export function cp04GetDriveMaxFileSizeBytes(env = process.env) {
  const mb = Number.parseFloat(env.GOOGLE_DRIVE_MAX_FILE_SIZE_MB);
  const safeMb = Number.isFinite(mb) && mb > 0 ? mb : DEFAULT_MAX_FILE_SIZE_MB;
  return Math.round(safeMb * 1024 * 1024);
}

function extensionOf(fileName) {
  const ext = path.extname(String(fileName || "")).slice(1).toLowerCase();
  return ext || null;
}

/** @returns {{valid:boolean, ext:string|null, mime:string|null, errors:string[]}} */
export function cp04ValidateDriveFileType(fileName, declaredMime) {
  const errors = [];
  const ext = extensionOf(fileName);
  if (!ext) {
    return { valid: false, ext: null, mime: null, errors: ["el archivo no tiene extensión — no se puede determinar el tipo"] };
  }
  const canonicalMime = CP04_DRIVE_ALLOWED_TYPES[ext];
  if (!canonicalMime) {
    return { valid: false, ext, mime: null, errors: [`extensión ".${ext}" no permitida — tipos aceptados: ${Object.keys(CP04_DRIVE_ALLOWED_TYPES).join(", ")}`] };
  }
  // El MIME declarado (p. ej. por el navegador o por quien llama) es
  // informativo, no autoritativo — pero si se declara y NO coincide con
  // el canónico de la extensión, es una señal real de archivo mal
  // etiquetado (o de un intento de colar un tipo no permitido con una
  // extensión falsa) y se reporta como error, no se ignora en silencio.
  if (declaredMime && declaredMime !== canonicalMime) {
    errors.push(`el MIME declarado ("${declaredMime}") no coincide con el esperado para ".${ext}" ("${canonicalMime}")`);
  }
  return { valid: errors.length === 0, ext, mime: canonicalMime, errors };
}

/**
 * Nombre seguro para Drive: sin separadores de ruta (evita que un
 * `fileName` como "../../etc/passwd.txt" o "carpeta/otra.txt" se
 * interprete como una ruta), sin caracteres de control, longitud
 * acotada — preserva la extensión real.
 */
export function cp04SanitizeDriveFileName(fileName) {
  const raw = String(fileName || "").trim();
  // path.basename() primero: en POSIX solo reconoce "/" como separador,
  // así que interpreta correctamente "../../etc/passwd.txt" y se queda
  // con "passwd.txt". Solo DESPUÉS se sustituye cualquier "\" restante
  // (que path.basename en POSIX no trata como separador) por "_".
  const base = path.basename(raw).replace(/\\+/g, "_");
  // eslint-disable-next-line no-control-regex -- filtrar caracteres de control 0x00-0x1F es intencional, no un error de regex.
  const noControlChars = base.replace(/[\x00-\x1f]/g, "");
  const collapsed = noControlChars.replace(/\s+/g, " ").trim();
  const safe = collapsed.length > 0 ? collapsed : "archivo-sin-nombre";
  if (safe.length <= 200) return safe;
  const ext = path.extname(safe);
  const stem = path.basename(safe, ext).slice(0, 200 - ext.length);
  return `${stem}${ext}`;
}

/** Detecta intentos de path traversal en una ruta LÓGICA de carpeta de Drive (no un path de disco) — mismo criterio que `exportPackageManager.js` para el empaquetado local, aplicado aquí a rutas de carpetas de Drive. */
export function cp04IsSafeDriveFolderPath(folderPath) {
  if (typeof folderPath !== "string" || folderPath.trim().length === 0) return false;
  const segments = folderPath.split("/").map((s) => s.trim());
  return segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..");
}

export function cp04ComputeDriveFileHash(content) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ""), "utf8");
  return createHash("sha256").update(buffer).digest("hex");
}

/**
 * Validación completa previa a subir un archivo a Drive: tipo, tamaño,
 * ruta de carpeta y nombre seguro — nunca lanza, siempre devuelve un
 * resultado con `valid` + `errors` explícitos, y (si es válido) los
 * datos ya saneados listos para pasar al adaptador.
 * @param {{folderPath:string, fileName:string, content:Buffer|string, declaredMime?:string, maxSizeBytes?:number}} params
 */
export function cp04ValidateDriveUpload({ folderPath, fileName, content, declaredMime, maxSizeBytes } = {}) {
  const errors = [];

  if (!cp04IsSafeDriveFolderPath(folderPath)) {
    errors.push(`ruta de carpeta insegura o vacía: "${folderPath}"`);
  }

  const typeResult = cp04ValidateDriveFileType(fileName, declaredMime);
  if (!typeResult.valid) errors.push(...typeResult.errors);

  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(String(content ?? ""), "utf8");
  if (buffer.length === 0) errors.push("el archivo está vacío");

  const limit = Number.isInteger(maxSizeBytes) && maxSizeBytes > 0 ? maxSizeBytes : cp04GetDriveMaxFileSizeBytes();
  if (buffer.length > limit) {
    errors.push(`el archivo (${buffer.length} bytes) supera el límite configurado (${limit} bytes / ${(limit / (1024 * 1024)).toFixed(1)} MB)`);
  }

  const safeName = cp04SanitizeDriveFileName(fileName);
  const checksum = cp04ComputeDriveFileHash(buffer);

  return {
    valid: errors.length === 0,
    errors,
    safeName,
    ext: typeResult.ext,
    mime: typeResult.mime,
    sizeBytes: buffer.length,
    checksum,
    metadata: errors.length === 0
      ? { name: safeName, mimeType: typeResult.mime, sizeBytes: buffer.length, checksum, ext: typeResult.ext }
      : null,
  };
}
