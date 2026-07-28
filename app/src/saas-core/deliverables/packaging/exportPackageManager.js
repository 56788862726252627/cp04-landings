// App 3 · Prompt 5/6 — ExportPackageManager.
//
// Empaquetado comercial final: toma un proyecto ya generado por
// cualquier combinación de flujos anteriores (DemoOrchestrator Prompt
// 2/6 → manifest/manifest.json; CaptureOrchestrator Prompt 3/6 →
// mockups/mockups-manifest.json; Demo4Orchestrator Prompt 4/6 →
// manifest/manifest.json con binarios reales) y produce UNA entrega
// profesional: estructura estándar de carpetas (FolderStructure,
// Prompt 1/6), índice HTML navegable, README.md, manifiesto final con
// checksum + versionChecksum, y un .zip real reproducible.
//
// Nunca regenera contenido — solo copia y valida lo que YA existe en
// disco. Un checksum que no coincide con el manifiesto de origen
// (corrupción) o un archivo que falla su propia validación de formato
// se EXCLUYE del paquete final con un motivo explícito — nunca se
// empaqueta un entregable inválido como si estuviera bien.

import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

import { cp04BuildProjectFolderTree, cp04ValidateFolderTree } from "../folderStructure.js";
import { cp04GenerateManifest, cp04ValidateManifest, cp04DiffManifests, cp04WriteManifestAtomic } from "../manifestGenerator.js";
import { cp04ValidatePngBuffer } from "../capture/captureValidator.js";
import { cp04ValidatePdfBuffer, cp04ValidateOoxmlBuffer } from "../binary/binaryValidator.js";
import { cp04IsPathDenied } from "../demo/denylist.js";
import { cp04BuildPackageIndexHtml, cp04BuildPackageReadme } from "./packageArtifacts.js";
import { cp04BuildReproducibleZip } from "./packageZip.js";

function checksumOfContent(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
  return createHash("sha256").update(buf).digest("hex");
}

// Mapa entregable → carpeta ESTÁNDAR (FolderStructure.js, Prompt 1/6).
// Las carpetas de trabajo intermedias de cada flujo (p. ej. "contratos/"
// en minúsculas del Prompt 2/6, o "documentos/" del Prompt 4/6) son
// distintas del árbol de entrega final — deliberado: la fase de
// generación usa nombres de trabajo, la entrega final usa el árbol
// oficial ya definido desde el Prompt 1/6.
const DELIVERABLE_TO_STANDARD_FOLDER = Object.freeze({
  contrato: "Contratos",
  propuesta_comercial: "PDFs",
  informe: "Informes",
  documentacion_tecnica: "Documentación",
  documentacion_comercial: "Documentación",
  manual: "Documentación",
  catalogo_entregables: "Documentación",
  presentacion: "Presentaciones",
  logotipo: "Logos",
  icono: "Iconos",
  fondo: "Fondos",
  banner: "Marketing",
  mockup_preview: "Mockups",
  mockup_metadata_package: "Mockups",
  mockup_gallery: "Mockups",
  mockup_raw_capture: "Mockups",
  mockup_framed: "Mockups",
  mockup_thumbnail: "Mockups",
  mockup_capture_metadata: "Mockups",
});

function resolveStandardFolder(deliverableType) {
  if (DELIVERABLE_TO_STANDARD_FOLDER[deliverableType]) return DELIVERABLE_TO_STANDARD_FOLDER[deliverableType];
  const base = String(deliverableType || "").replace(/_preview$/, "");
  if (DELIVERABLE_TO_STANDARD_FOLDER[base]) return DELIVERABLE_TO_STANDARD_FOLDER[base];
  return "Documentación"; // default seguro: ningún entregable se queda sin carpeta
}

async function tryReadJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

/** @returns {Promise<{ok:boolean, errors:string[]}>} */
async function validateItemBuffer(format, buffer) {
  if (format === "png") {
    const r = cp04ValidatePngBuffer(buffer);
    return { ok: r.valid, errors: r.errors };
  }
  if (format === "pdf") {
    const r = cp04ValidatePdfBuffer(buffer);
    return { ok: r.state === "validated", errors: r.errors };
  }
  if (format === "docx" || format === "pptx") {
    const r = await cp04ValidateOoxmlBuffer(buffer, format);
    return { ok: r.state === "validated", errors: r.errors };
  }
  // Formatos de texto (markdown/html/svg/json): sin validador binario
  // dedicado en este repo — se acepta cualquier contenido no vacío (su
  // propia generación ya se validó cuando se creó, en su flujo de
  // origen; aquí solo se re-confirma que no llegó vacío/corrupto).
  return { ok: Buffer.isBuffer(buffer) && buffer.length > 0, errors: buffer?.length > 0 ? [] : ["contenido vacío"] };
}

function uniquePath(usedPaths, folder, baseName) {
  let candidate = path.join(folder, baseName);
  if (!usedPaths.has(candidate)) {
    usedPaths.add(candidate);
    return candidate;
  }
  const ext = path.extname(baseName);
  const stem = path.basename(baseName, ext);
  let n = 1;
  while (usedPaths.has(path.join(folder, `${stem}-${n}${ext}`))) n += 1;
  candidate = path.join(folder, `${stem}-${n}${ext}`);
  usedPaths.add(candidate);
  return candidate;
}

/**
 * @param {{sourceBaseDir:string, targetBaseDir:string, projectId?:string, projectName:string, topLevel?:string}} options
 */
export async function cp04BuildFinalExportPackage({ sourceBaseDir, targetBaseDir, projectId, projectName, topLevel } = {}) {
  if (!sourceBaseDir) throw new Error("cp04BuildFinalExportPackage requiere sourceBaseDir");
  if (!targetBaseDir) throw new Error("cp04BuildFinalExportPackage requiere targetBaseDir");
  if (!projectName) throw new Error("cp04BuildFinalExportPackage requiere projectName");

  const textManifest = await tryReadJson(path.join(sourceBaseDir, "manifest", "manifest.json"));
  const captureManifest = await tryReadJson(path.join(sourceBaseDir, "mockups", "mockups-manifest.json"));
  if (!textManifest && !captureManifest) {
    throw new Error(`no se encontró ningún manifiesto de origen en "${sourceBaseDir}" (se buscó manifest/manifest.json y mockups/mockups-manifest.json — ejecuta primero un flujo de generación de App 3 sobre este directorio)`);
  }

  const tree = cp04BuildProjectFolderTree(projectName, topLevel);
  const treeValidation = cp04ValidateFolderTree(tree);
  /* c8 ignore next */
  if (!treeValidation.valid) throw new Error(`árbol de carpetas estándar inválido (no debería ocurrir nunca): ${treeValidation.errors.join("; ")}`);

  for (const folder of tree.folders) await mkdir(path.join(targetBaseDir, folder.name), { recursive: true });
  await mkdir(path.join(targetBaseDir, "manifest"), { recursive: true });

  const sourceItems = [...(textManifest?.items || []), ...(captureManifest?.items || [])];
  const usedPaths = new Set();
  const packagedFiles = [];
  const failed = [];

  for (const item of sourceItems) {
    const sourcePath = path.join(sourceBaseDir, item.path);
    let buffer;
    try {
      buffer = await readFile(sourcePath);
    } catch (error) {
      failed.push({ id: item.id, deliverableType: item.deliverableType, path: item.path, reason: `archivo de origen no encontrado: ${error.message}` });
      continue;
    }

    if (item.checksum) {
      const actualChecksum = checksumOfContent(buffer);
      if (actualChecksum !== item.checksum) {
        failed.push({ id: item.id, deliverableType: item.deliverableType, path: item.path, reason: "el checksum no coincide con el manifiesto de origen (posible corrupción) — excluido del paquete final" });
        continue;
      }
    }

    if (cp04IsPathDenied(item.path)) {
      failed.push({ id: item.id, deliverableType: item.deliverableType, path: item.path, reason: "la ruta de origen viola la denylist de seguridad" });
      continue;
    }

    const validation = await validateItemBuffer(item.format, buffer);
    if (!validation.ok) {
      failed.push({ id: item.id, deliverableType: item.deliverableType, path: item.path, reason: `validación de formato "${item.format}" falló: ${validation.errors.join("; ")}` });
      continue;
    }

    const folder = resolveStandardFolder(item.deliverableType);
    const finalPath = uniquePath(usedPaths, folder, path.basename(item.path));
    await writeFile(path.join(targetBaseDir, finalPath), buffer);
    packagedFiles.push({ id: item.id, deliverableType: item.deliverableType, format: item.format, path: finalPath, status: "validated", content: buffer });
  }

  if (packagedFiles.length === 0) {
    throw new Error(`ningún entregable pasó la validación — el paquete final quedaría vacío, se detiene sin escribir manifiesto ni zip. Fallos: ${JSON.stringify(failed)}`);
  }

  const previousManifest = await tryReadJson(path.join(targetBaseDir, "manifest", "paquete-final.json"));
  const candidateManifest = cp04GenerateManifest(
    packagedFiles.map((f) => ({ id: f.id, deliverableType: f.deliverableType, format: f.format, path: f.path, status: f.status, content: f.content })),
    { projectId: projectId || tree.projectName, projectName, version: (previousManifest?.version || 0) + 1 }
  );
  const diff = previousManifest ? cp04DiffManifests(previousManifest, candidateManifest) : { added: candidateManifest.items, changed: [], removed: [] };
  const hasChanges = diff.added.length > 0 || diff.changed.length > 0 || diff.removed.length > 0;
  const manifest = { ...candidateManifest, version: previousManifest ? (hasChanges ? previousManifest.version + 1 : previousManifest.version) : 1 };

  const manifestValidation = cp04ValidateManifest(manifest);
  /* c8 ignore next */
  if (!manifestValidation.valid) throw new Error(`manifiesto final inválido: ${manifestValidation.errors.join("; ")}`);

  const indexHtml = cp04BuildPackageIndexHtml({ projectName: tree.projectName, version: manifest.version, entries: packagedFiles });
  await writeFile(path.join(targetBaseDir, "index.html"), indexHtml, "utf8");

  const readme = cp04BuildPackageReadme({
    projectName: tree.projectName,
    version: manifest.version,
    entries: packagedFiles,
    failed,
    validation: { validated: packagedFiles.length, invalid: failed.length },
  });
  await writeFile(path.join(targetBaseDir, "README.md"), readme, "utf8");

  await cp04WriteManifestAtomic(path.join(targetBaseDir, "manifest", "paquete-final.json"), JSON.stringify(manifest, null, 2) + "\n");

  // El .zip empaqueta una copia del manifiesto SIN `generatedAt` (marca
  // de tiempo de pared, cambia en cada ejecución aunque nada cambie de
  // verdad) — así el .zip es reproducible byte a byte cuando el
  // contenido de origen no cambia. El manifiesto real en disco
  // (fuera del zip, arriba) sí conserva `generatedAt` como registro de
  // auditoría honesto.
  const manifestForZip = { ...manifest };
  delete manifestForZip.generatedAt;
  const zipFiles = [
    ...packagedFiles.map((f) => ({ path: f.path, content: f.content })),
    { path: "index.html", content: Buffer.from(indexHtml, "utf8") },
    { path: "README.md", content: Buffer.from(readme, "utf8") },
    { path: "manifest/paquete-final.json", content: Buffer.from(JSON.stringify(manifestForZip, null, 2) + "\n", "utf8") },
  ];
  const zipBuffer = await cp04BuildReproducibleZip(zipFiles);
  const zipFileName = `${tree.projectName}.zip`;
  await writeFile(path.join(targetBaseDir, zipFileName), zipBuffer);

  return {
    projectName: tree.projectName,
    tree,
    manifest,
    hasChanges,
    failed,
    packagedCount: packagedFiles.length,
    zipPath: zipFileName,
    zipChecksum: checksumOfContent(zipBuffer),
  };
}

export { resolveStandardFolder };
