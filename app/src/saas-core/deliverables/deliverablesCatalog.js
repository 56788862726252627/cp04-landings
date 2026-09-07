// App 3 · Prompt 1/6 — Catálogo de entregables.
//
// Enumera los ~19 tipos de entregable pedidos por el enunciado, cada uno
// con: qué pipeline lo genera, en qué carpeta de Google Drive vive (ver
// folderStructure.js) y qué formatos de exportación acepta (siempre un
// subconjunto de CP04_EXPORT_FORMATS). Ningún entregable admite un
// formato para el que `implemented` sea `false` como salida real todavía
// — sí se puede *solicitar*, pero el pipeline devolverá `not_implemented`
// (ver exportManager.js), nunca una simulación silenciosa.

export const CP04_DELIVERABLE_TYPES = Object.freeze({
  contrato: Object.freeze({
    id: "contrato", label: "Contrato", pipeline: "contract", folder: "Contratos",
    formats: Object.freeze(["markdown", "html", "pdf", "docx"]),
  }),
  propuesta_comercial: Object.freeze({
    id: "propuesta_comercial", label: "Propuesta comercial", pipeline: "document", folder: "PDFs",
    formats: Object.freeze(["markdown", "html", "pdf"]),
  }),
  mockup_movil: Object.freeze({
    id: "mockup_movil", label: "Mockup móvil", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_tablet: Object.freeze({
    id: "mockup_tablet", label: "Mockup tablet", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_escritorio: Object.freeze({
    id: "mockup_escritorio", label: "Mockup escritorio", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_android: Object.freeze({
    id: "mockup_android", label: "Mockup Android", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_iphone: Object.freeze({
    id: "mockup_iphone", label: "Mockup iPhone", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_ipad: Object.freeze({
    id: "mockup_ipad", label: "Mockup iPad", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_windows: Object.freeze({
    id: "mockup_windows", label: "Mockup Windows", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  mockup_macos: Object.freeze({
    id: "mockup_macos", label: "Mockup macOS", pipeline: "mockup", folder: "Mockups",
    formats: Object.freeze(["svg", "html", "png"]),
  }),
  logotipo: Object.freeze({
    id: "logotipo", label: "Logotipo", pipeline: "preview", folder: "Logos",
    formats: Object.freeze(["svg", "png", "webp"]),
  }),
  icono: Object.freeze({
    id: "icono", label: "Icono", pipeline: "preview", folder: "Iconos",
    formats: Object.freeze(["svg", "png"]),
  }),
  fondo: Object.freeze({
    id: "fondo", label: "Fondo", pipeline: "preview", folder: "Fondos",
    formats: Object.freeze(["svg", "png", "jpg", "webp"]),
  }),
  banner: Object.freeze({
    id: "banner", label: "Banner", pipeline: "preview", folder: "Marketing",
    formats: Object.freeze(["svg", "png", "jpg"]),
  }),
  presentacion: Object.freeze({
    id: "presentacion", label: "Presentación", pipeline: "presentation", folder: "Presentaciones",
    formats: Object.freeze(["markdown", "html", "pptx", "pdf"]),
  }),
  manual: Object.freeze({
    id: "manual", label: "Manual", pipeline: "document", folder: "Documentación",
    formats: Object.freeze(["markdown", "html", "pdf", "docx"]),
  }),
  informe: Object.freeze({
    id: "informe", label: "Informe", pipeline: "document", folder: "Informes",
    formats: Object.freeze(["markdown", "html", "pdf"]),
  }),
  documentacion_tecnica: Object.freeze({
    id: "documentacion_tecnica", label: "Documentación técnica", pipeline: "document", folder: "Documentación",
    formats: Object.freeze(["markdown", "html", "pdf"]),
  }),
  documentacion_comercial: Object.freeze({
    id: "documentacion_comercial", label: "Documentación comercial", pipeline: "document", folder: "Documentación",
    formats: Object.freeze(["markdown", "html", "pdf", "docx"]),
  }),
});

export const CP04_DELIVERABLE_TYPE_IDS = Object.freeze(Object.keys(CP04_DELIVERABLE_TYPES));

export function cp04GetDeliverableType(typeId) {
  return CP04_DELIVERABLE_TYPES[String(typeId || "")] || null;
}

export function cp04IsFormatValidForDeliverable(typeId, formatId) {
  const type = cp04GetDeliverableType(typeId);
  if (!type) return false;
  return type.formats.includes(String(formatId || "").toLowerCase());
}

export function cp04ListDeliverablesByPipeline(pipelineId) {
  return CP04_DELIVERABLE_TYPE_IDS.filter((id) => CP04_DELIVERABLE_TYPES[id].pipeline === pipelineId);
}
