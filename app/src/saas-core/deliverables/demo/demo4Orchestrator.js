// App 3 · Prompt 4/6 — Orquestador de la demo end-to-end de los motores
// binarios reales (PDF/DOCX/PPTX).
//
// Genera 2 casos:
// - "Clínica Dental Nova" (ficticio, sector clínica dental): 6
//   entregables binarios (2 PDF, 2 DOCX, 2 PPTX).
// - "Club Pádel 04" (branding real ya existente en el repo, caso
//   ligero): 3 entregables binarios (1 PDF, 1 DOCX, 1 PPTX).
//
// Mismo patrón de E/S que demoOrchestrator.js (Prompt 2/6): baseDir
// inyectable, escritura directa con node:fs/promises, manifiesto con
// checksum + versionChecksum, escritura atómica (Prompt 3.5), 0
// llamadas externas, Drive en dry-run.

import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";

import { cp04CreateDeliverablesFactory } from "../index.js";
import { cp04GenerateManifest, cp04ValidateManifest, cp04DiffManifests, cp04WriteManifestAtomic } from "../manifestGenerator.js";
import { cp04BuildContractSpec } from "../contractPipeline.js";
import { cp04ValidatePdfBuffer, cp04ValidateOoxmlBuffer, CP04_BINARY_MIME } from "../binary/binaryValidator.js";
import { cp04BuildClinicaDentalNovaBrief, cp04BuildClubPadel04Brief } from "./demo4Projects.js";

function escapeHtml(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// --- Contenido (spec/deck) por entregable — separado de la generación. ---

function proposalSpec(brief) {
  return {
    title: `Propuesta Comercial — ${brief.displayName}`,
    subtitle: brief.scope,
    meta: { Fecha: new Date().toISOString().slice(0, 10), Cliente: brief.client, Sector: brief.sectorLabel },
    brand: brief.branding,
    sections: [
      { heading: "Resumen ejecutivo", body: `Propuesta de automatización digital para ${brief.displayName}, adaptada al sector ${brief.sectorLabel.toLowerCase()}.` },
      { heading: "Alcance", bullets: brief.modules },
      { heading: "Precio", body: brief.price },
      { heading: "Roadmap", table: [["Fase", "Semanas", "Detalle"], ...brief.roadmap.map((r) => [r.phase, r.weeks, r.detail])] },
      { heading: "Siguiente paso", body: brief.cta },
    ],
  };
}

function auditSpec(brief) {
  return {
    title: `Informe de Auditoría — ${brief.displayName}`,
    subtitle: "Diagnóstico digital",
    meta: { Fecha: new Date().toISOString().slice(0, 10), Cliente: brief.client },
    brand: brief.branding,
    sections: [
      { heading: "Diagnóstico", body: `Evaluación del estado digital actual de ${brief.displayName} frente a los módulos propuestos.` },
      { heading: "Hallazgos", bullets: brief.modules.map((m) => `Oportunidad de mejora: ${m.toLowerCase()}`) },
      { heading: "Riesgos identificados", bullets: brief.risks },
      { heading: "Recomendación", body: "Priorizar la automatización de reservas y comunicación con clientes en la primera fase." },
    ],
  };
}

function onboardingSpec(brief) {
  return {
    title: `Guía de Onboarding — ${brief.displayName}`,
    subtitle: "Primeros pasos",
    meta: { Cliente: brief.client },
    brand: brief.branding,
    sections: [
      { heading: "Bienvenida", body: `Esta guía resume los primeros pasos para el equipo de ${brief.displayName} tras el alta del proyecto.` },
      { heading: "Primeros pasos", bullets: ["Recibir credenciales de acceso", "Revisar el panel principal", "Confirmar los datos de contacto", "Agendar la sesión de formación"] },
      { heading: "Contacto de soporte", body: `Para cualquier duda, escribir a ${brief.contact.email}.` },
    ],
  };
}

function technicalMemoSpec(brief, modulesEnabled) {
  return {
    title: `Memoria Técnica — ${brief.displayName}`,
    subtitle: "Arquitectura y módulos activos",
    meta: { Cliente: brief.client, Sector: brief.sectorLabel },
    brand: brief.branding,
    sections: [
      { heading: "Arquitectura", body: "Aplicación web (React + Vite) con backend proxy (Worker) hacia Airtable/Make, autenticación real y control de acceso por rol." },
      { heading: "Módulos activos", bullets: modulesEnabled },
      { heading: "Seguridad y roles", body: "Acceso segmentado por rol (jugador, staff, administración, soporte técnico), con permisos explícitos por módulo." },
    ],
  };
}

function manualSpec(brief, roles) {
  return {
    title: `Manual de Usuario — ${brief.displayName}`,
    subtitle: "Guía de uso por rol",
    meta: { Cliente: brief.client },
    brand: brief.branding,
    sections: [
      { heading: "Introducción", body: `Este manual resume el uso básico de la plataforma de ${brief.displayName} para cada rol.` },
      { heading: "Roles disponibles", bullets: roles },
      { heading: "Uso básico", body: "Iniciar sesión, seleccionar el rol activo y navegar por los módulos habilitados desde el menú lateral." },
    ],
  };
}

function commercialDeck(brief) {
  return {
    title: `Propuesta Comercial — ${brief.displayName}`,
    brand: brief.branding,
    slides: [
      { title: "Agenda", bullets: ["Diagnóstico", "Propuesta", "Precios", "Siguientes pasos"] },
      { title: "Diagnóstico", bullets: brief.risks },
      { title: "Propuesta", bullets: brief.modules },
      { title: "Precios", table: [["Plan", "Precio"], ["Recomendado", brief.price]] },
      { title: "Siguientes pasos", bullets: [brief.cta] },
    ],
  };
}

function beforeAfterDeck(brief) {
  return {
    title: `Antes / Después — ${brief.displayName}`,
    brand: brief.branding,
    slides: [
      { title: "Antes", bullets: ["Gestión manual de reservas", "Comunicación por teléfono", "Sin panel centralizado"] },
      { title: "Después", bullets: brief.modules },
      { title: "Resultado esperado", bullets: ["Menos tiempo administrativo", "Menos citas perdidas", "Mejor experiencia de cliente"], notes: "Cifras orientativas, a validar con datos reales del cliente." },
    ],
  };
}

async function generateEntry({ factory, projectId, deliverableType, format, payload, relativePath }) {
  const result = await factory.exportManager.requestExport({ projectId, deliverableType, format, payload });
  return { result, relativePath };
}

function buildPdfPreviewHtml(spec, validation) {
  const sectionsHtml = spec.sections.map((s) => `<li>${escapeHtml(s.heading)}</li>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Preview — ${escapeHtml(spec.title)}</title></head><body>
<h1>${escapeHtml(spec.title)}</h1>
<p>${escapeHtml(spec.subtitle || "")}</p>
<p>Estado de validación: <strong>${validation.state}</strong> · Páginas: ${validation.pageCount ?? "?"}</p>
<h2>Secciones</h2><ul>${sectionsHtml}</ul>
</body></html>`;
}

function buildDocxPreviewText(spec) {
  const lines = [spec.title, spec.subtitle || "", ""];
  for (const s of spec.sections) {
    lines.push(`## ${s.heading}`);
    if (s.body) lines.push(s.body);
    for (const b of s.bullets || []) lines.push(`- ${b}`);
    lines.push("");
  }
  return lines.join("\n");
}

function buildPptxPreviewHtml(deck, validation) {
  const slidesHtml = deck.slides
    .map((s, idx) => `<section><h2>${idx + 1}. ${escapeHtml(s.title)}</h2><ul>${(s.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join("")}</ul></section>`)
    .join("\n");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Preview — ${escapeHtml(deck.title)}</title></head><body>
<h1>${escapeHtml(deck.title)}</h1>
<p>Estado de validación: <strong>${validation.state}</strong></p>
${slidesHtml}
</body></html>`;
}

async function loadPreviousManifest(baseDir) {
  try {
    return JSON.parse(await readFile(path.join(baseDir, "manifest", "manifest.json"), "utf8"));
  } catch {
    return null;
  }
}

/**
 * Genera el paquete completo de un proyecto (Clínica Dental Nova o Club
 * Pádel 04): entregables binarios reales, previews, manifiesto,
 * informe de validación.
 * @param {{baseDir:string, brief:object, plan:{deliverableType:string, format:"pdf"|"docx"|"pptx", payload:object, fileName:string, previewFileName:string}[]}} options
 */
export async function cp04RunPrompt4DemoFlow({ baseDir, brief, plan }) {
  if (!baseDir) throw new Error("cp04RunPrompt4DemoFlow requiere baseDir");
  const factory = cp04CreateDeliverablesFactory();

  for (const folder of ["documentos", "presentaciones", "previews", "manifest"]) {
    await mkdir(path.join(baseDir, folder), { recursive: true });
  }

  const entries = [];
  const failed = [];
  const validationReport = [];

  for (const item of plan) {
    const { result } = await generateEntry({
      factory, projectId: brief.projectId, deliverableType: item.deliverableType, format: item.format, payload: item.payload,
    });
    if (result.status !== "completed") {
      failed.push({ deliverableType: item.deliverableType, format: item.format, reason: result.reason });
      continue;
    }

    const folder = item.format === "pptx" ? "presentaciones" : "documentos";
    const relativePath = path.join(folder, item.fileName);
    await writeFile(path.join(baseDir, relativePath), result.content);

    const binaryValidation = item.format === "pdf"
      ? cp04ValidatePdfBuffer(result.content)
      : await cp04ValidateOoxmlBuffer(result.content, item.format);
    validationReport.push({ file: relativePath, format: item.format, mime: CP04_BINARY_MIME[item.format], ...binaryValidation, errors: binaryValidation.errors });

    // versionContent: el spec/deck de entrada, determinista — DOCX/PPTX
    // embeben un timestamp de creación no controlable dentro del propio
    // binario (docProps/core.xml), así que el checksum real del archivo
    // nunca sería idéntico entre ejecuciones aunque el contenido pedido
    // sea el mismo. PDF sí es determinista de verdad (CreationDate fija
    // en pdfEngine.js) — versionContent igualmente por uniformidad, sin
    // coste real.
    entries.push({
      id: `${item.deliverableType}_${item.format}`,
      deliverableType: item.deliverableType,
      format: item.format,
      path: relativePath,
      status: binaryValidation.state === "validated" ? "validated" : "failed",
      content: result.content,
      versionContent: JSON.stringify(item.payload),
    });

    // "contrato" pasa los campos crudos del contrato como payload (ver
    // cp04BuildClinicaDentalNovaPlan) — para el preview hace falta el
    // spec {title,sections} ya construido, el mismo que ExportManager
    // genera internamente para el binario real.
    const previewSpec = item.deliverableType === "contrato" ? cp04BuildContractSpec(item.payload).spec : item.payload;
    const previewPath = path.join("previews", item.previewFileName);
    const previewHtml = item.format === "pptx"
      ? buildPptxPreviewHtml(previewSpec, binaryValidation)
      : item.format === "docx"
        ? buildDocxPreviewText(previewSpec)
        : buildPdfPreviewHtml(previewSpec, binaryValidation);
    await writeFile(path.join(baseDir, previewPath), previewHtml, "utf8");
    entries.push({
      id: `${item.deliverableType}_${item.format}_preview`,
      deliverableType: `${item.deliverableType}_preview`,
      format: item.format === "docx" ? "markdown" : "html",
      path: previewPath,
      status: "validated",
      content: previewHtml,
    });
  }

  const previousManifest = await loadPreviousManifest(baseDir);
  const candidateManifest = cp04GenerateManifest(
    entries.map((e) => ({ id: e.id, deliverableType: e.deliverableType, format: e.format, path: e.path, status: e.status, content: e.content, versionContent: e.versionContent })),
    { projectId: brief.projectId, projectName: brief.displayName, version: (previousManifest?.version || 0) + 1 }
  );
  const diff = previousManifest ? cp04DiffManifests(previousManifest, candidateManifest) : { added: candidateManifest.items, changed: [], removed: [] };
  const hasChanges = diff.added.length > 0 || diff.changed.length > 0 || diff.removed.length > 0;
  const manifest = { ...candidateManifest, version: previousManifest ? (hasChanges ? previousManifest.version + 1 : previousManifest.version) : 1 };

  const manifestValidation = cp04ValidateManifest(manifest);
  if (!manifestValidation.valid) throw new Error(`Manifiesto Prompt 4/6 inválido: ${manifestValidation.errors.join("; ")}`);

  await cp04WriteManifestAtomic(path.join(baseDir, "manifest", "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

  const reportLines = [
    `# Informe de validación — ${brief.displayName}`,
    "",
    `Entregables generados: ${entries.filter((e) => !e.deliverableType.endsWith("_preview")).length}`,
    `Entregables fallidos: ${failed.length}`,
    "",
    "## Validación binaria",
    ...validationReport.map((v) => `- ${v.file} (${v.format}, ${v.mime}): **${v.state}**${v.errors.length ? " — " + v.errors.join("; ") : ""}`),
  ];
  await writeFile(path.join(baseDir, "manifest", "validacion.md"), reportLines.join("\n") + "\n", "utf8");

  // Cola Drive en modo disabled/dry-run — nunca sube nada (Prompt 1/6).
  const driveResults = await factory.driveSyncManager.processQueue();

  return { brief, manifest, hasChanges, failed, validationReport, driveDryRun: driveResults };
}

export function cp04BuildClinicaDentalNovaPlan(brief) {
  // deliverableType "contrato" espera los CAMPOS crudos del contrato
  // (partyA/partyB/effectiveDate/scope/terms) — es ExportManager quien
  // internamente los convierte a spec vía cp04BuildContractSpec (mismo
  // contrato que usa ContractPipeline para markdown/html).
  const contractPayload = {
    partyA: "Agencia IA", partyB: brief.client, effectiveDate: new Date().toISOString().slice(0, 10), scope: brief.scope, terms: brief.modules,
  };

  return [
    { deliverableType: "propuesta_comercial", format: "pdf", payload: proposalSpec(brief), fileName: "propuesta-comercial.pdf", previewFileName: "propuesta-comercial.html" },
    { deliverableType: "informe", format: "pdf", payload: auditSpec(brief), fileName: "informe-auditoria.pdf", previewFileName: "informe-auditoria.html" },
    { deliverableType: "contrato", format: "docx", payload: contractPayload, fileName: "contrato.docx", previewFileName: "contrato.md" },
    { deliverableType: "documentacion_comercial", format: "docx", payload: onboardingSpec(brief), fileName: "onboarding.docx", previewFileName: "onboarding.md" },
    { deliverableType: "presentacion", format: "pptx", payload: commercialDeck(brief), fileName: "presentacion-comercial.pptx", previewFileName: "presentacion-comercial.html" },
    { deliverableType: "presentacion", format: "pptx", payload: beforeAfterDeck(brief), fileName: "presentacion-antes-despues.pptx", previewFileName: "presentacion-antes-despues.html" },
  ];
}

export function cp04BuildClubPadel04Plan(brief, tenant) {
  return [
    { deliverableType: "documentacion_tecnica", format: "pdf", payload: technicalMemoSpec(brief, tenant.modulesEnabled), fileName: "memoria-tecnica.pdf", previewFileName: "memoria-tecnica.html" },
    { deliverableType: "manual", format: "docx", payload: manualSpec(brief, tenant.roles), fileName: "manual-usuario.docx", previewFileName: "manual-usuario.md" },
    { deliverableType: "presentacion", format: "pptx", payload: commercialDeck(brief), fileName: "presentacion-comercial.pptx", previewFileName: "presentacion-comercial.html" },
  ];
}

export { cp04BuildClinicaDentalNovaBrief, cp04BuildClubPadel04Brief };
