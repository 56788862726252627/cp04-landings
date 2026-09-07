// App 3 · Prompt 3/6 — Validación post-generación de las capturas.
//
// Vuelve a leer lo que hay en disco (nunca confía en la última
// ejecución en memoria): manifiesto de capturas válido, cada archivo
// existe y su checksum coincide, cada PNG referenciado sigue siendo un
// PNG válido según CaptureValidator (Fase 11), y ningún archivo del
// árbol de mockups/ viola la denylist ya definida en el Prompt 2/6.

import path from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

import { cp04ValidateManifest } from "../manifestGenerator.js";
import { cp04ValidatePngBuffer } from "./captureValidator.js";
import { cp04IsPathDenied } from "../demo/denylist.js";

function checksumOfContent(content) {
  return createHash("sha256").update(content).digest("hex");
}

export async function cp04ValidateMockupsOutput({ baseDir }) {
  if (!baseDir) return { valid: false, errors: ["baseDir es obligatorio"], checkedFiles: 0 };

  let manifest;
  try {
    manifest = JSON.parse(await readFile(path.join(baseDir, "mockups", "mockups-manifest.json"), "utf8"));
  } catch (error) {
    return { valid: false, errors: [`no se pudo leer mockups-manifest.json: ${error.message}`], checkedFiles: 0 };
  }

  const errors = [];
  const manifestValidation = cp04ValidateManifest(manifest);
  if (!manifestValidation.valid) errors.push(...manifestValidation.errors.map((e) => `manifiesto: ${e}`));

  let checkedFiles = 0;
  for (const item of manifest.items || []) {
    if (cp04IsPathDenied(item.path)) {
      errors.push(`${item.path}: viola la denylist de archivos técnicos/sensibles`);
      continue;
    }
    let buffer;
    try {
      buffer = await readFile(path.join(baseDir, item.path));
      checkedFiles += 1;
    } catch (error) {
      errors.push(`${item.path}: no se pudo leer (${error.message})`);
      continue;
    }
    const actualChecksum = checksumOfContent(buffer);
    if (actualChecksum !== item.checksum) errors.push(`${item.path}: el checksum en disco no coincide con el manifiesto`);

    if (item.format === "png") {
      const pngValidation = cp04ValidatePngBuffer(buffer);
      if (!pngValidation.valid) errors.push(`${item.path}: ${pngValidation.errors.join("; ")}`);
    }
  }

  return { valid: errors.length === 0, errors, checkedFiles };
}
