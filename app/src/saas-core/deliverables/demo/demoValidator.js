// App 3 · Prompt 2/6 — Validación post-generación del paquete demo.
//
// Vuelve a leer lo que hay en disco (no confía en lo que el propio
// flujo dijo que escribió) y comprueba: el manifiesto es válido, cada
// archivo referenciado existe y su checksum coincide de verdad, y
// ningún archivo del árbol completo viola la denylist. Es la base de
// `npm run app3:demo:validate`.

import path from "node:path";
import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";

import { cp04ValidateManifest } from "../manifestGenerator.js";
import { cp04IsPathDenied } from "./denylist.js";

function checksumOf(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

async function listAllFilesRecursive(dir, relativeTo) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listAllFilesRecursive(fullPath, relativeTo)));
    } else {
      files.push(path.relative(relativeTo, fullPath));
    }
  }
  return files;
}

/**
 * @param {{baseDir:string}} options
 * @returns {{valid:boolean, errors:string[], checkedFiles:number, deniedFiles:string[]}}
 */
export async function cp04ValidateDemoOutput(options = {}) {
  const baseDir = options.baseDir;
  if (!baseDir) return { valid: false, errors: ["baseDir es obligatorio"], checkedFiles: 0, deniedFiles: [] };

  const errors = [];
  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(baseDir, "manifest", "manifest.json"), "utf8"));
  } catch (error) {
    return { valid: false, errors: [`no se pudo leer manifest.json: ${error.message}`], checkedFiles: 0, deniedFiles: [] };
  }

  const manifestValidation = cp04ValidateManifest(manifest);
  if (!manifestValidation.valid) errors.push(...manifestValidation.errors.map((e) => `manifiesto: ${e}`));

  let checkedFiles = 0;
  for (const item of manifest.items || []) {
    if (!item.path) continue; // entradas sin archivo propio (p. ej. metadatos embebidos) no se verifican en disco
    try {
      const content = await readFile(path.join(baseDir, item.path), "utf8");
      checkedFiles += 1;
      const actualChecksum = checksumOf(content);
      if (actualChecksum !== item.checksum) {
        errors.push(`${item.path}: el checksum en disco no coincide con el manifiesto (posible corrupción o edición manual)`);
      }
    } catch (error) {
      errors.push(`${item.path}: no se pudo leer (${error.message})`);
    }
  }

  let deniedFiles = [];
  try {
    const allFiles = await listAllFilesRecursive(baseDir, baseDir);
    deniedFiles = allFiles.filter((relativePath) => cp04IsPathDenied(relativePath));
    for (const denied of deniedFiles) errors.push(`${denied}: viola la denylist de archivos técnicos/sensibles`);
  } catch (error) {
    errors.push(`no se pudo recorrer el árbol de archivos: ${error.message}`);
  }

  return { valid: errors.length === 0, errors, checkedFiles, deniedFiles };
}
