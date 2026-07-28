// App 3 · Prompt 3/6 — CaptureOrchestrator (Fase 8).
//
// Flujo: capture requested → browser launched → page stabilized →
// screenshot created → screenshot validated → mockup composed → hash
// calculado → artefacto registrado → manifiesto actualizado → cola
// pending/dry-run → DriveSync disabled. Nunca sube nada.
//
// El manifiesto de capturas vive en mockups/mockups-manifest.json,
// SEPARADO del manifest.json general del Prompt 2/6 (que no se toca
// aquí) — mismo criterio de versionado idempotente (solo sube de
// versión si algo cambió de verdad), documentado explícitamente para
// que quede claro que son dos manifiestos complementarios, no uno
// sustituyendo al otro.

import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";

import { cp04BuildDeviceCapturePlan, cp04BuildGalleryCapturePlan, cp04BuildClubPadel04CapturePlan } from "./capturePlan.js";
import { cp04CreateBrowserCaptureAdapter, cp04IsBrowserCaptureAvailable } from "./browserCaptureAdapter.js";
import { cp04CreateScreenshotEngine } from "./screenshotEngine.js";
import { cp04ComposeMockupFrame } from "./mockupCompositor.js";
import { CP04_VIEWPORT_REGISTRY } from "./viewportRegistry.js";
import { cp04CreateDeliverablesFactory } from "../index.js";
import { cp04ValidateManifest, cp04DiffManifests } from "../manifestGenerator.js";
import { cp04BuildDemoProject } from "../demo/demoProject.js";

function checksumOfContent(content) {
  const buf = Buffer.isBuffer(content) ? content : Buffer.from(String(content), "utf8");
  return createHash("sha256").update(buf).digest("hex");
}

const THUMBNAIL_SCALE = 0.25;
const THUMBNAIL_MIN = 120;

function buildThumbnailViewport(viewport) {
  return {
    width: Math.max(THUMBNAIL_MIN, Math.round(viewport.width * THUMBNAIL_SCALE)),
    height: Math.max(THUMBNAIL_MIN, Math.round(viewport.height * THUMBNAIL_SCALE)),
    deviceScaleFactor: 1,
  };
}

async function loadPreviousMockupsManifest(baseDir) {
  try {
    const raw = await readFile(path.join(baseDir, "mockups", "mockups-manifest.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function buildMetadata({ project, result }) {
  const { job } = result;
  return {
    device: job.viewport.device,
    system: job.viewport.system,
    orientation: job.viewport.orientation,
    resolution: { width: job.viewport.width, height: job.viewport.height },
    deviceScaleFactor: job.viewport.deviceScaleFactor || 1,
    capturedUrl: job.url,
    capturedAt: new Date().toISOString(),
    project: project.displayName,
    projectId: project.projectId,
    captureKind: job.kind,
    isRealCapture: true,
    isDeviceSimulation: job.kind === "device" || job.kind === "gallery",
    physicalValidationPending: true,
  };
}

/**
 * @param {{baseDir:string, appUrl?:string, deviceIds?:string[], includeClubPadel04?:boolean, includeGallery?:boolean, adapter?:object, engine?:object, dryRun?:boolean}} options
 */
export async function cp04RunMockupCaptureFlow(options = {}) {
  const baseDir = options.baseDir;
  if (!baseDir) throw new Error("cp04RunMockupCaptureFlow requiere baseDir");

  const project = cp04BuildDemoProject();

  let plan;
  if (options.deviceIds && options.deviceIds.length > 0) {
    plan = cp04BuildDeviceCapturePlan({ baseDir }).filter((job) => options.deviceIds.includes(job.viewportId));
  } else {
    const includeGallery = options.includeGallery !== false;
    const includeClubPadel04 = options.includeClubPadel04 !== false;
    plan = [
      ...cp04BuildDeviceCapturePlan({ baseDir }),
      ...(includeGallery ? cp04BuildGalleryCapturePlan({ baseDir }) : []),
      ...(includeClubPadel04 ? cp04BuildClubPadel04CapturePlan({ appUrl: options.appUrl }) : []),
    ];
  }

  if (!cp04IsBrowserCaptureAvailable() && !options.adapter) {
    return {
      status: "unavailable",
      reason: "no se encontró ningún Chromium cacheado en este entorno (ver CP04_CHROMIUM_EXECUTABLE_PATH)",
      results: [],
      manifest: null,
    };
  }

  // `ownsAdapter` decide quién cierra el navegador: si el caller nos pasó
  // su propio adapter (p. ej. para reutilizarlo entre varias llamadas),
  // es también responsable de cerrarlo. Si lo creamos aquí, DEBEMOS
  // cerrarlo nosotros — no hacerlo dejaba un Chromium real huérfano por
  // cada llamada (causa raíz del OOM/signal 9 visto en la sesión previa
  // ejecutando los tests de este módulo: N llamadas sin adapter propio
  // = N navegadores nunca cerrados, acumulando memoria hasta el corte).
  const ownsAdapter = !options.adapter;
  const adapter = options.adapter || cp04CreateBrowserCaptureAdapter();
  const engine = options.engine || cp04CreateScreenshotEngine({ adapter, log: options.log });

  const entries = [];
  const failed = [];

  try {
    const results = await engine.captureAll(plan);

    for (const result of results) {
      if (result.status !== "completed") {
        failed.push({ name: result.job.name, errors: result.errors });
        continue;
      }
      const { job } = result;
      await mkdir(path.join(baseDir, job.folder), { recursive: true });

      const rawPath = path.join(job.folder, `${job.name}-raw.png`);
      await writeFile(path.join(baseDir, rawPath), result.buffer);
      entries.push({ id: `${job.name}_raw`, deliverableType: "mockup_raw_capture", format: "png", path: rawPath, status: "validated", content: result.buffer });

      if (job.kind === "device") {
        const framedSvg = cp04ComposeMockupFrame({
          pngBuffer: result.buffer,
          device: job.viewport.device,
          system: job.viewport.system,
          orientation: job.viewport.orientation,
          resolution: { width: result.width, height: result.height },
          projectName: project.displayName,
        });
        const framedPath = path.join(job.folder, `${job.name}-framed.svg`);
        await writeFile(path.join(baseDir, framedPath), framedSvg, "utf8");
        entries.push({ id: `${job.name}_framed`, deliverableType: "mockup_framed", format: "svg", path: framedPath, status: "validated", content: framedSvg });

        const thumbViewport = buildThumbnailViewport(job.viewport);
        const thumbResult = await adapter.capture({ url: job.url, viewport: thumbViewport });
        const thumbPath = path.join(job.folder, `${job.name}-thumbnail.png`);
        await writeFile(path.join(baseDir, thumbPath), thumbResult.buffer);
        entries.push({ id: `${job.name}_thumbnail`, deliverableType: "mockup_thumbnail", format: "png", path: thumbPath, status: "validated", content: thumbResult.buffer });
      }

      const metadata = buildMetadata({ project, result });
      const metadataPath = path.join(job.folder, `${job.name}-metadata.json`);
      const metadataContent = JSON.stringify(metadata, null, 2) + "\n";
      await writeFile(path.join(baseDir, metadataPath), metadataContent, "utf8");
      // capturedAt es un timestamp real (no falso) pero volátil: cambia en
      // cada ejecución aunque la captura sea pixel-idéntica a la anterior.
      // Se escribe igualmente en el archivo en disco (información honesta
      // de auditoría, y forma parte de `checksum` — el hash real del
      // archivo, usado por CaptureValidator/MockupsValidator para
      // detectar corrupción). Para decidir si hay que subir de versión se
      // usa en cambio `versionChecksum` (ver más abajo), calculado sobre
      // el contenido SIN capturedAt — igual que generatedAt ya se excluye
      // a nivel de manifiesto general — para que repetir sin cambios
      // reales no dispare una subida de versión falsa.
      const metadataForChecksum = { ...metadata };
      delete metadataForChecksum.capturedAt;
      entries.push({
        id: `${job.name}_metadata`,
        deliverableType: "mockup_capture_metadata",
        format: "json",
        path: metadataPath,
        status: "validated",
        content: metadataContent,
        versionContent: JSON.stringify(metadataForChecksum),
      });
    }
  } finally {
    if (ownsAdapter) await adapter.close();
  }

  const previousManifest = await loadPreviousMockupsManifest(baseDir);
  // `checksum` es siempre el hash del contenido real en disco (integridad
  // — lo que valida mockupsValidator.js). `versionChecksum` es el hash
  // usado solo para decidir si hay que subir de versión: coincide con
  // `checksum` salvo en items (como el metadata de captura) que declaran
  // un `versionContent` propio sin campos volátiles.
  const items = entries.map((entry) => ({
    ...entry,
    checksum: checksumOfContent(entry.content),
    versionChecksum: entry.versionContent ? checksumOfContent(entry.versionContent) : checksumOfContent(entry.content),
  }));
  const previousVersion = previousManifest?.version || 0;
  const candidateManifest = {
    manifestVersion: 1,
    projectId: project.projectId,
    projectName: project.displayName,
    generatedAt: new Date().toISOString(),
    version: previousVersion + 1,
    itemCount: items.length,
    items: items.map((item) => {
      const persisted = { ...item };
      delete persisted.content;
      delete persisted.versionContent;
      return persisted;
    }),
  };

  const diff = previousManifest ? cp04DiffManifests(previousManifest, candidateManifest) : { added: candidateManifest.items, changed: [], removed: [] };
  const hasChanges = diff.added.length > 0 || diff.changed.length > 0 || diff.removed.length > 0;
  const manifest = { ...candidateManifest, version: previousManifest ? (hasChanges ? previousVersion + 1 : previousVersion) : 1 };

  const manifestValidation = cp04ValidateManifest(manifest);
  if (!manifestValidation.valid) throw new Error(`Manifiesto de capturas inválido: ${manifestValidation.errors.join("; ")}`);

  await mkdir(path.join(baseDir, "mockups"), { recursive: true });
  await writeFile(path.join(baseDir, "mockups", "mockups-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");

  // Cola Drive en modo disabled/dry-run — nunca sube nada (Prompt 1/6).
  const factory = cp04CreateDeliverablesFactory({ env: options.env });
  for (const entry of entries) {
    factory.driveSyncManager.enqueue({ folderPath: path.dirname(entry.path), fileName: path.basename(entry.path), content: entry.content });
  }
  const driveResults = options.dryRun === false ? [] : await factory.driveSyncManager.processQueue();
  const driveDryRun = driveResults.map((r) => ({ ...r, demoStatus: r.status === "skipped_disabled" ? "dry_run" : r.status }));

  return { status: "completed", project, manifest, hasChanges, failed, driveDryRun, planSize: plan.length };
}

export { CP04_VIEWPORT_REGISTRY };
