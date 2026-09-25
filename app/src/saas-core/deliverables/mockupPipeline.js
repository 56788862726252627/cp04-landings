// App 3 · Prompt 1/6 — MockupPipeline.
//
// Genera marcos de mockup para los 8 dispositivos pedidos. Los tamaños
// son medidas REPRESENTATIVAS de cada familia de dispositivo (para
// maquetar proporciones), no la ficha técnica exacta de un modelo
// concreto — se documenta así para no afirmar precisión que no existe.
// La salida real hoy es SVG/HTML (ver previewGenerator.js); PNG queda
// como `not_implemented` (ver exportFormats.js).

import { cp04GenerateSvgPreview, cp04WrapSvgInHtmlPage } from "./previewGenerator.js";
import { cp04GetExportFormat } from "./exportFormats.js";

export const CP04_MOCKUP_DEVICES = Object.freeze({
  movil: Object.freeze({ id: "movil", label: "Móvil (genérico)", width: 390, height: 844 }),
  tablet: Object.freeze({ id: "tablet", label: "Tablet (genérico)", width: 834, height: 1194 }),
  escritorio: Object.freeze({ id: "escritorio", label: "Escritorio (genérico)", width: 1440, height: 900 }),
  android: Object.freeze({ id: "android", label: "Android (referencia Pixel)", width: 412, height: 915 }),
  iphone: Object.freeze({ id: "iphone", label: "iPhone (referencia)", width: 390, height: 844 }),
  ipad: Object.freeze({ id: "ipad", label: "iPad (referencia)", width: 834, height: 1194 }),
  windows: Object.freeze({ id: "windows", label: "Windows (referencia 1080p)", width: 1920, height: 1080 }),
  macos: Object.freeze({ id: "macos", label: "macOS (referencia)", width: 1440, height: 900 }),
});

export const CP04_MOCKUP_DEVICE_IDS = Object.freeze(Object.keys(CP04_MOCKUP_DEVICES));

/**
 * @param {{deviceId:string, label?:string, format?:"svg"|"html"|"png"}} request
 * @returns {{status:"completed"|"failed"|"not_implemented", device:object, format:string, content?:string, reason?:string}}
 */
export function cp04GenerateMockup(request = {}) {
  const device = CP04_MOCKUP_DEVICES[String(request.deviceId || "").toLowerCase()];
  if (!device) {
    return { status: "failed", reason: `dispositivo desconocido: "${request.deviceId}"`, device: null, format: request.format || null };
  }

  const formatId = String(request.format || "svg").toLowerCase();
  const format = cp04GetExportFormat(formatId);
  if (!format) {
    return { status: "failed", reason: `formato desconocido: "${formatId}"`, device, format: formatId };
  }
  if (!format.implemented) {
    return {
      status: "not_implemented",
      reason: `el formato "${formatId}" todavía no tiene motor de renderizado real (${format.requiresDependency})`,
      device, format: formatId,
    };
  }

  const svg = cp04GenerateSvgPreview({
    width: device.width,
    height: device.height,
    label: request.label || device.label,
  });

  if (formatId === "svg") {
    return { status: "completed", device, format: formatId, content: svg };
  }
  if (formatId === "html") {
    return { status: "completed", device, format: formatId, content: cp04WrapSvgInHtmlPage(svg, device.label) };
  }
  return { status: "failed", reason: `MockupPipeline solo produce svg/html hoy, no "${formatId}"`, device, format: formatId };
}

/** Genera los 8 mockups de dispositivo de una sola vez, en el formato indicado (por defecto SVG). */
export function cp04GenerateAllDeviceMockups(request = {}) {
  return CP04_MOCKUP_DEVICE_IDS.map((deviceId) => cp04GenerateMockup({ ...request, deviceId }));
}
