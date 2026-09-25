// App 3 · Prompt 1/6 — ExportManager.
//
// Orquestador único: recibe una solicitud de exportación (qué tipo de
// entregable, en qué formato, con qué datos), valida contra el catálogo
// (deliverablesCatalog.js) y los formatos soportados (exportFormats.js),
// enruta al pipeline correcto, registra el asset resultante
// (assetRegistry.js) y devuelve un resultado uniforme. Nunca decide por
// su cuenta generar un formato no implementado como si lo fuera.

import { cp04GetDeliverableType, cp04IsFormatValidForDeliverable } from "./deliverablesCatalog.js";
import { cp04GetExportFormat } from "./exportFormats.js";
import { cp04GenerateDocument } from "./documentPipeline.js";
import { cp04GenerateContract, cp04BuildContractSpec } from "./contractPipeline.js";
import { cp04GeneratePresentation } from "./presentationPipeline.js";
import { cp04GenerateMockup } from "./mockupPipeline.js";
import { cp04GenerateSvgPreview } from "./previewGenerator.js";
import { cp04CreateAssetRegistry } from "./assetRegistry.js";
import { cp04GeneratePdf } from "./pdfPipeline.js";
import { cp04GenerateDocx } from "./docxPipeline.js";
import { cp04GeneratePptx } from "./pptxPipeline.js";

const BINARY_FORMATS = Object.freeze(["pdf", "docx", "pptx"]);

/**
 * Genera un entregable binario (PDF/DOCX/PPTX) real reutilizando el
 * mismo contenido (spec/deck) que ya usan los pipelines de texto —
 * nunca duplica la plantilla, solo cambia el renderer final.
 */
async function generateBinaryDeliverable(pipeline, payload, formatId) {
  if (pipeline === "contract") {
    const built = cp04BuildContractSpec(payload);
    if (!built.valid) return { status: "failed", reason: `contrato inválido: ${built.errors.join("; ")}`, format: formatId };
    if (formatId === "pdf") return cp04GeneratePdf(built.spec);
    if (formatId === "docx") return cp04GenerateDocx(built.spec);
    return { status: "failed", reason: `ContractPipeline no produce "${formatId}" en binario`, format: formatId };
  }
  if (pipeline === "document") {
    if (formatId === "pdf") return cp04GeneratePdf(payload);
    if (formatId === "docx") return cp04GenerateDocx(payload);
    return { status: "failed", reason: `DocumentPipeline no produce "${formatId}" en binario`, format: formatId };
  }
  if (pipeline === "presentation") {
    if (formatId === "pdf") return cp04GeneratePdf(payload);
    if (formatId === "pptx") return cp04GeneratePptx(payload);
    return { status: "failed", reason: `PresentationPipeline no produce "${formatId}" en binario`, format: formatId };
  }
  return { status: "failed", reason: `el pipeline "${pipeline}" no tiene un motor binario conectado`, format: formatId };
}

/**
 * @param {{registry?: ReturnType<typeof cp04CreateAssetRegistry>}} [options]
 */
export function cp04CreateExportManager(options = {}) {
  const registry = options.registry || cp04CreateAssetRegistry();

  /**
   * @param {{projectId:string, deliverableType:string, format:string, payload:object}} request
   */
  async function requestExport(request) {
    const { projectId, deliverableType, format, payload } = request || {};

    if (!projectId) return { status: "failed", reason: "requestExport requiere projectId" };

    const type = cp04GetDeliverableType(deliverableType);
    if (!type) return { status: "failed", reason: `tipo de entregable desconocido: "${deliverableType}"` };

    const formatMeta = cp04GetExportFormat(format);
    if (!formatMeta) return { status: "failed", reason: `formato desconocido: "${format}"` };

    if (!cp04IsFormatValidForDeliverable(deliverableType, format)) {
      return { status: "failed", reason: `el formato "${format}" no está permitido para el entregable "${deliverableType}" (permitidos: ${type.formats.join(", ")})` };
    }

    let result;
    if (BINARY_FORMATS.includes(formatMeta.id) && ["contract", "document", "presentation"].includes(type.pipeline)) {
      result = await generateBinaryDeliverable(type.pipeline, payload, formatMeta.id);
      if (result.status === "completed") result.content = result.buffer;
    } else switch (type.pipeline) {
      case "contract":
        result = cp04GenerateContract(payload, format);
        break;
      case "document":
        result = cp04GenerateDocument(payload, format);
        break;
      case "presentation":
        result = cp04GeneratePresentation(payload, format);
        break;
      case "mockup":
        result = cp04GenerateMockup({ ...payload, format });
        break;
      case "preview":
        result = formatMeta.implemented
          ? { status: "completed", format, content: cp04GenerateSvgPreview(payload) }
          : { status: "not_implemented", reason: `el formato "${format}" todavía no tiene motor real (${formatMeta.requiresDependency})`, format };
        break;
      default:
        return { status: "failed", reason: `pipeline desconocido para el entregable "${deliverableType}": "${type.pipeline}"` };
    }

    if (result.status !== "completed") {
      return { ...result, deliverableType, format };
    }

    const asset = registry.registerAsset({
      projectId,
      type: deliverableType,
      name: payload?.name || payload?.title || deliverableType,
      format,
      content: result.content,
      metadata: { folder: type.folder, pipeline: type.pipeline },
    });

    return { status: "completed", deliverableType, format, assetId: asset.id, content: result.content, folder: type.folder };
  }

  return { requestExport, registry };
}
