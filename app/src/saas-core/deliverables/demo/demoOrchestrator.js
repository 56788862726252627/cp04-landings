// App 3 · Prompt 2/6 — Orquestador del flujo end-to-end de demostración.
//
// Conecta la arquitectura del Prompt 1/6 (src/saas-core/deliverables/)
// en un flujo real: proyecto → generación → clasificación → validación
// → hash → versionado → manifiesto → paquete → cola Drive en
// disabled/dry-run → resumen. Mismo estilo de E/S real que
// tenant-cli/lib/tenantProvisioning.mjs (node:fs/promises directo,
// `baseDir` inyectable para tests con mkdtemp — sin abstracción de fs
// simulado).
//
// Idempotencia: cada archivo vive en una ruta ESTABLE (no versionada en
// el nombre). Repetir el flujo sobre el mismo baseDir regenera el
// mismo contenido en las mismas rutas — nunca duplica archivos ni
// entradas de manifiesto. La "versión" del paquete (un entero) solo
// sube cuando el contenido de al menos un entregable cambia realmente
// respecto a la ejecución anterior (comparado por checksum, ver
// cp04DiffManifests del Prompt 1/6) — nunca solo por volver a ejecutar.

import path from "node:path";
import { mkdir, writeFile, readFile, appendFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { cp04BuildDemoProject, CP04_DEMO_CLIENT_SLUG } from "./demoProject.js";
import { cp04ListMockupSpecsWithStatus } from "./mockupSpecs.js";
import { cp04ValidatePackageAgainstDenylist } from "./denylist.js";
import { cp04CreateDeliverablesFactory } from "../index.js";
import { cp04GenerateManifest, cp04ValidateManifest, cp04DiffManifests } from "../manifestGenerator.js";
import { cp04GenerateSvgPreview } from "../previewGenerator.js";
import { CP04_DELIVERABLE_TYPES } from "../deliverablesCatalog.js";

const execFileAsync = promisify(execFile);

export const CP04_DEMO_DEFAULT_BASE_DIR = path.join("output", "clientes", CP04_DEMO_CLIENT_SLUG);

// Carpetas del árbol de salida local (Fase 5) — distinto, a propósito,
// del nombre de carpeta "de Drive" que usa deliverablesCatalog.js
// (p. ej. "Contratos" en mayúsculas): esta es la convención de disco
// local pedida literalmente por este prompt.
export const CP04_DEMO_OUTPUT_FOLDERS = Object.freeze([
  "auditorias", "contratos", "fondos", "iconos", "informes", "logos",
  "marketing", "mockups", "pdfs", "presentaciones", "videos", "documentacion", "manifest",
]);

// A qué subcarpeta local va cada tipo de entregable de este demo.
const DEMO_FOLDER_BY_DELIVERABLE = Object.freeze({
  contrato: "contratos",
  propuesta_comercial: "marketing",
  informe: "informes",
  documentacion_tecnica: "documentacion",
  documentacion_comercial: "documentacion",
  presentacion: "presentaciones",
  logotipo: "logos",
  icono: "iconos",
  fondo: "fondos",
  banner: "marketing",
});

function contractPayload(project) {
  return {
    partyA: "Agencia IA S.L. (ficticia)",
    partyB: project.client,
    effectiveDate: "2026-08-01",
    scope: `Desarrollo, mantenimiento y generación de entregables visuales para la plataforma SaaS de ${project.displayName}.`,
    terms: [
      "Duración inicial de 12 meses con renovación automática salvo aviso previo de 30 días.",
      "La Agencia de IA entrega los materiales generados en este paquete de demostración a modo de ejemplo, sin validez contractual real.",
    ],
    name: "Contrato demo (no legal)",
  };
}

function proposalPayload(project) {
  return {
    title: `Propuesta comercial — ${project.displayName}`,
    name: "Propuesta comercial",
    meta: { Sector: project.sectorLabel, Idioma: project.language },
    sections: [
      { heading: "Diagnóstico", body: `${project.description}` },
      { heading: "Solución propuesta", body: "Plataforma SaaS con reservas, fichas de paciente, facturación y comunicación automatizada, generada por la Agencia de IA." },
      { heading: "Próximos pasos", body: "Validar este paquete de entregables de demostración antes de conectar cualquier integración real." },
    ],
  };
}

function reportPayload(project) {
  return {
    title: `Informe de puesta en marcha — ${project.displayName}`,
    name: "Informe",
    meta: { Estado: "Demostración", Fecha: "2026-08-01" },
    sections: [
      { heading: "Resumen", body: "Este informe forma parte del paquete de demostración de la fábrica de entregables (App 3, Prompt 2/6)." },
      { heading: "Alcance verificado", body: `Dispositivos objetivo: ${project.targetDevices.join(", ")}.` },
    ],
  };
}

function technicalDocPayload(project) {
  return {
    title: `Documentación técnica — ${project.displayName}`,
    name: "Documentación técnica",
    sections: [
      { heading: "Arquitectura", body: "Generado con src/saas-core/deliverables/ (ExportManager, DocumentPipeline, PreviewGenerator, MockupPipeline)." },
      { heading: "Formatos usados", body: "Markdown, HTML y SVG — los únicos formatos con motor real en este entorno." },
    ],
  };
}

function commercialDocPayload(project) {
  return {
    title: `Documentación comercial — ${project.displayName}`,
    name: "Documentación comercial",
    sections: [
      { heading: "Resumen para el cliente", body: `Paquete de demostración para ${project.client}, sector ${project.sectorLabel}.` },
    ],
  };
}

function presentationPayload(project) {
  return {
    title: `Presentación — ${project.displayName}`,
    name: "Presentación",
    slides: [
      { title: "Bienvenida", bullets: [`Proyecto: ${project.displayName}`, `Sector: ${project.sectorLabel}`] },
      { title: "Entregables incluidos", bullets: project.requestedDeliverables },
      { title: "Próximos pasos", bullets: ["Validar el paquete", "Decidir motores de renderizado reales (PDF/PNG/PPTX)"], notes: "Sin conectar Google Drive todavía." },
    ],
  };
}

function brandingPreviewPayload(project, kind) {
  const common = { background: project.branding.backgroundColor, foreground: project.branding.primaryColor };
  if (kind === "logotipo") return { ...common, width: 240, height: 240, label: project.branding.logoLabel, shape: "circle", name: "Logotipo" };
  if (kind === "icono") return { ...common, width: 96, height: 96, label: project.branding.logoLabel, shape: "circle", name: "Icono" };
  if (kind === "fondo") return { ...common, width: 1200, height: 630, label: project.displayName, name: "Fondo" };
  return { ...common, width: 1200, height: 300, label: `${project.displayName} · ${project.sectorLabel}`, name: "Banner" };
}

/**
 * Construye el paquete completo EN MEMORIA (sin tocar disco) — puro y
 * testeable de forma rápida. Usa exclusivamente ExportManager/pipelines
 * del Prompt 1/6, así que cualquier formato no implementado queda
 * marcado `not_implemented` de la misma forma que allí, nunca simulado.
 */
export async function cp04BuildDemoPackage(project = cp04BuildDemoProject()) {
  const factory = cp04CreateDeliverablesFactory();
  const entries = [];
  const notImplemented = [];

  const requests = [
    { deliverableType: "contrato", format: "markdown", payload: contractPayload(project), fileName: "contrato-demo.md" },
    { deliverableType: "propuesta_comercial", format: "html", payload: proposalPayload(project), fileName: "propuesta-comercial.html" },
    { deliverableType: "informe", format: "markdown", payload: reportPayload(project), fileName: "informe.md" },
    { deliverableType: "documentacion_tecnica", format: "markdown", payload: technicalDocPayload(project), fileName: "documentacion-tecnica.md" },
    { deliverableType: "documentacion_comercial", format: "markdown", payload: commercialDocPayload(project), fileName: "documentacion-comercial.md" },
    { deliverableType: "presentacion", format: "html", payload: presentationPayload(project), fileName: "presentacion.html" },
    { deliverableType: "logotipo", format: "svg", payload: brandingPreviewPayload(project, "logotipo"), fileName: "logo.svg" },
    { deliverableType: "icono", format: "svg", payload: brandingPreviewPayload(project, "icono"), fileName: "icono.svg" },
    { deliverableType: "fondo", format: "svg", payload: brandingPreviewPayload(project, "fondo"), fileName: "fondo.svg" },
    { deliverableType: "banner", format: "svg", payload: brandingPreviewPayload(project, "banner"), fileName: "banner.svg" },
  ];

  for (const request of requests) {
    const result = await factory.exportManager.requestExport({ projectId: project.projectId, ...request });
    const folder = DEMO_FOLDER_BY_DELIVERABLE[request.deliverableType];
    if (result.status === "completed") {
      entries.push({
        id: `${request.deliverableType}_${request.fileName}`,
        deliverableType: request.deliverableType,
        format: request.format,
        relativePath: path.join(folder, request.fileName),
        content: result.content,
      });
    } else {
      notImplemented.push({ deliverableType: request.deliverableType, format: request.format, status: result.status, reason: result.reason });
    }
  }

  // Formatos pedidos por el catálogo que este demo NO puede generar hoy
  // (PDF/DOCX/PPTX/PNG/JPG/WebP/MP4/GIF) — se registran explícitamente,
  // nunca se crea un archivo con la extensión equivocada.
  for (const [typeId, type] of Object.entries(CP04_DELIVERABLE_TYPES)) {
    for (const formatId of type.formats) {
      const alreadyRequested = requests.some((r) => r.deliverableType === typeId && r.format === formatId);
      if (alreadyRequested) continue;
      const isImplemented = ["markdown", "html", "svg"].includes(formatId);
      if (!isImplemented) {
        notImplemented.push({ deliverableType: typeId, format: formatId, status: "not_implemented", reason: `pendiente de motor real para "${formatId}"` });
      }
    }
  }

  // Especificaciones de mockup (Fase 4): 8 previews SVG reales + paquete de metadatos.
  const mockupSpecs = cp04ListMockupSpecsWithStatus();
  for (const spec of mockupSpecs) {
    const svg = cp04GenerateSvgPreview({
      width: Math.min(spec.resolution.width, 480),
      height: Math.round(Math.min(spec.resolution.width, 480) * (spec.resolution.height / spec.resolution.width)),
      label: spec.device,
      background: project.branding.backgroundColor,
      foreground: project.branding.primaryColor,
    });
    entries.push({
      id: `mockup_preview_${spec.normalizedName}`,
      deliverableType: "mockup_preview",
      format: "svg",
      relativePath: path.join("mockups", `preview-${spec.normalizedName}.svg`),
      content: svg,
    });
  }
  entries.push({
    id: "mockup_specs_package",
    deliverableType: "mockup_metadata_package",
    format: "markdown",
    relativePath: path.join("mockups", "especificaciones.json"),
    content: JSON.stringify(mockupSpecs, null, 2) + "\n",
  });
  entries.push({
    id: "mockup_gallery",
    deliverableType: "mockup_gallery",
    format: "html",
    relativePath: path.join("mockups", "galeria.html"),
    content: buildMockupGalleryHtml(project, mockupSpecs),
  });

  // Catálogo de entregables (Fase 3).
  entries.push({
    id: "deliverables_catalog",
    deliverableType: "catalogo_entregables",
    format: "markdown",
    relativePath: path.join("manifest", "catalogo.json"),
    content: JSON.stringify(CP04_DELIVERABLE_TYPES, null, 2) + "\n",
  });

  return { project, entries, notImplemented, factory };
}

function buildMockupGalleryHtml(project, mockupSpecs) {
  const cards = mockupSpecs
    .map((spec) => `<figure><figcaption>${spec.device} · ${spec.system} · ${spec.orientation} (${spec.resolution.width}×${spec.resolution.height})</figcaption><img src="preview-${spec.normalizedName}.svg" alt="${spec.device}" width="160" /></figure>`)
    .join("\n");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Galería de mockups — ${project.displayName}</title><style>body{font-family:sans-serif;background:#0b0f14;color:#e5e7eb;padding:24px} figure{display:inline-block;margin:12px;text-align:center;font-size:.8rem}</style></head><body><h1>Galería de mockups — ${project.displayName}</h1>${cards}</body></html>`;
}

function buildIndexHtml(project, manifest) {
  const rows = manifest.items
    .map((item) => `<tr><td>${item.deliverableType}</td><td>${item.format}</td><td>${item.status}</td><td><a href="${item.path}">${item.path}</a></td></tr>`)
    .join("\n");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${project.displayName} — Paquete de entregables</title>
<style>body{font-family:sans-serif;background:#05080d;color:#f1f5f9;padding:32px} table{border-collapse:collapse;width:100%} td,th{border:1px solid #334155;padding:6px 10px;font-size:.85rem} a{color:#7dd3fc}</style>
</head><body>
<h1>${project.displayName}</h1>
<p>${project.description}</p>
<p>Versión del paquete: ${manifest.version} · Generado: ${manifest.generatedAt}</p>
<table><thead><tr><th>Entregable</th><th>Formato</th><th>Estado</th><th>Archivo</th></tr></thead><tbody>${rows}</tbody></table>
</body></html>`;
}

function buildSummaryMarkdown(project, manifest, notImplemented, driveResults, packageResult) {
  const lines = [
    `# Resumen — ${project.displayName}`,
    "",
    `- Cliente: ${project.client}`,
    `- Sector: ${project.sectorLabel}`,
    `- Versión del paquete: ${manifest.version}`,
    `- Entregables generados: ${manifest.itemCount}`,
    `- Formatos pendientes (not_implemented): ${notImplemented.length}`,
    `- Cola Drive: ${driveResults.length} elemento(s), todos en modo dry-run (sincronización desactivada)`,
    `- Paquete comprimido: ${packageResult?.created ? packageResult.archivePath : `no generado (${packageResult?.reason || "sin razón registrada"})`}`,
    "",
    "## Formatos pendientes",
    ...notImplemented.map((n) => `- ${n.deliverableType} (${n.format}): ${n.reason}`),
  ];
  return lines.join("\n") + "\n";
}

async function tryCreateTarArchive(baseDir) {
  try {
    const parentDir = path.dirname(baseDir);
    const dirName = path.basename(baseDir);
    const archivePath = path.join(parentDir, `${dirName}.tar`);
    await execFileAsync("tar", ["-cf", archivePath, "-C", parentDir, dirName]);
    return { created: true, archivePath };
  } catch (error) {
    return { created: false, reason: error?.message || "tar no disponible en este entorno" };
  }
}

async function loadPreviousManifest(baseDir) {
  try {
    const raw = await readFile(path.join(baseDir, "manifest", "manifest.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Ejecuta el flujo completo end-to-end (Fase 2) y escribe el resultado
 * en disco bajo `baseDir` (por defecto `output/clientes/<cliente-demo>/`).
 * Idempotente: puede llamarse varias veces sin duplicar archivos ni
 * entradas — solo sube `manifest.version` si algo cambió de verdad.
 */
export async function cp04RunDemoFlow(options = {}) {
  const baseDir = options.baseDir || CP04_DEMO_DEFAULT_BASE_DIR;
  const env = options.env || {};
  const skipArchive = options.skipArchive === true;

  const { project, entries, notImplemented, factory } = await cp04BuildDemoPackage();

  const denylistResult = cp04ValidatePackageAgainstDenylist(entries);
  if (!denylistResult.valid) {
    throw new Error(`Denylist violada, se detiene el flujo: ${JSON.stringify(denylistResult.violations)}`);
  }

  const previousManifest = await loadPreviousManifest(baseDir);
  const candidateManifest = cp04GenerateManifest(
    entries.map((e) => ({ id: e.id, deliverableType: e.deliverableType, format: e.format, content: e.content, path: e.relativePath, status: "generated" })),
    { projectId: project.projectId, projectName: project.displayName, version: (previousManifest?.version || 0) + 1 }
  );

  const diff = previousManifest ? cp04DiffManifests(previousManifest, candidateManifest) : { added: candidateManifest.items, changed: [], removed: [] };
  const hasChanges = diff.added.length > 0 || diff.changed.length > 0 || diff.removed.length > 0;
  const finalVersion = previousManifest ? (hasChanges ? previousManifest.version + 1 : previousManifest.version) : 1;

  const manifest = { ...candidateManifest, version: finalVersion, items: candidateManifest.items.map((item) => ({ ...item, status: "validated" })) };
  const manifestValidation = cp04ValidateManifest(manifest);
  if (!manifestValidation.valid) {
    throw new Error(`Manifiesto inválido: ${manifestValidation.errors.join("; ")}`);
  }

  // Escritura a disco.
  for (const folder of CP04_DEMO_OUTPUT_FOLDERS) {
    await mkdir(path.join(baseDir, folder), { recursive: true });
  }
  for (const entry of entries) {
    const fullPath = path.join(baseDir, entry.relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, entry.content, "utf8");
  }

  const auditContent = [
    `# Auditoría de generación — ${project.displayName}`,
    "",
    `Denylist: ${denylistResult.valid ? "sin violaciones" : "VIOLACIONES DETECTADAS"}`,
    `Manifiesto: ${manifestValidation.valid ? "válido" : "inválido"}`,
    `Cambios respecto a la versión anterior: ${hasChanges ? "sí" : "no (idempotente)"}`,
    `Añadidos: ${diff.added.length} · Cambiados: ${diff.changed.length} · Eliminados: ${diff.removed.length}`,
  ].join("\n") + "\n";
  await writeFile(path.join(baseDir, "auditorias", "validacion.md"), auditContent, "utf8");

  await writeFile(path.join(baseDir, "manifest", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await writeFile(path.join(baseDir, "manifest", "manifest.jsonl"), manifest.items.map((i) => JSON.stringify(i)).join("\n") + "\n", "utf8");
  await appendFile(
    path.join(baseDir, "manifest", "history.jsonl"),
    JSON.stringify({ ranAt: new Date().toISOString(), version: finalVersion, itemCount: manifest.itemCount, hasChanges }) + "\n",
    "utf8"
  );

  // Cola Drive en modo disabled/dry-run (Prompt 1/6: nunca invoca al adaptador real mientras CP04_DRIVE_SYNC_ENABLED no sea "true").
  for (const entry of entries) {
    factory.driveSyncManager.enqueue({ folderPath: path.dirname(entry.relativePath), fileName: path.basename(entry.relativePath), content: entry.content });
  }
  const driveResults = await factory.driveSyncManager.processQueue();
  const driveDryRun = driveResults.map((r) => ({ ...r, demoStatus: r.status === "skipped_disabled" ? "dry_run" : r.status }));

  await writeFile(path.join(baseDir, "index.html"), buildIndexHtml(project, manifest), "utf8");

  const packageResult = skipArchive ? { created: false, reason: "archivado omitido explícitamente" } : await tryCreateTarArchive(baseDir);
  await writeFile(path.join(baseDir, "RESUMEN.md"), buildSummaryMarkdown(project, manifest, notImplemented, driveDryRun, packageResult), "utf8");

  return {
    project,
    baseDir,
    manifest,
    notImplemented,
    driveDryRun,
    packageResult,
    hasChanges,
    denylistValid: denylistResult.valid,
    env,
  };
}
