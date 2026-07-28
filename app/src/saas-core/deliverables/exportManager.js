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
import { cp04GenerateContract } from "./contractPipeline.js";
import { cp04GeneratePresentation } from "./presentationPipeline.js";
import { cp04GenerateMockup } from "./mockupPipeline.js";
import { cp04GenerateSvgPreview } from "./previewGenerator.js";
import { cp04CreateAssetRegistry } from "./assetRegistry.js";

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
    switch (type.pipeline) {
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
