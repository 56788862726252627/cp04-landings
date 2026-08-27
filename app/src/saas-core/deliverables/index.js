// App 3 · Prompt 1/6 — punto de entrada único de la fábrica de
// entregables. Reexporta toda la arquitectura y ofrece un factory de
// conveniencia que une ExportManager + DriveSyncManager con sus valores
// por defecto (sincronización desactivada, adaptador not_configured).

export * from "./exportFormats.js";
export * from "./deliverablesCatalog.js";
export * from "./folderStructure.js";
export * from "./assetRegistry.js";
export * from "./manifestGenerator.js";
export * from "./previewGenerator.js";
export * from "./mockupPipeline.js";
export * from "./documentPipeline.js";
export * from "./contractPipeline.js";
export * from "./presentationPipeline.js";
export * from "./pdfPipeline.js";
export * from "./driveAdapter.js";
export * from "./driveSyncManager.js";
export * from "./exportManager.js";

import { cp04CreateExportManager } from "./exportManager.js";
import { cp04CreateDriveSyncManager } from "./driveSyncManager.js";
import { cp04CreateAssetRegistry } from "./assetRegistry.js";

/**
 * Crea una fábrica de entregables completa y aislada (útil para tests
 * de integración y para instanciar una por proyecto/cliente).
 * Sincronización con Drive DESACTIVADA por defecto, salvo que
 * `env.CP04_DRIVE_SYNC_ENABLED === "true"` — ver driveAdapter.js.
 */
export function cp04CreateDeliverablesFactory(options = {}) {
  const registry = cp04CreateAssetRegistry();
  const exportManager = cp04CreateExportManager({ registry });
  const driveSyncManager = cp04CreateDriveSyncManager({ env: options.env });
  return { exportManager, driveSyncManager, registry };
}
