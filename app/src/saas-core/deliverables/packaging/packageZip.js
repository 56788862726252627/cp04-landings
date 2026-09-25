// App 3 · Prompt 5/6 — PackageZip.
//
// Empaqueta el paquete final en un único .zip real (formato ZIP
// estándar, abrible con cualquier herramienta) usando `jszip` — ya
// presente en el repo como dependencia de `docx`/`pptxgenjs` (Prompt
// 4/6), reutilizada aquí también para ESCRIBIR, no solo leer.
//
// Reproducibilidad: JSZip pone por defecto la fecha/hora actual en
// cada entrada del ZIP — dos ejecuciones con el MISMO contenido
// producirían un .zip con bytes distintos. Se fija una fecha constante
// por entrada (mismo criterio que `CreationDate` fijo en pdfEngine.js,
// Prompt 4/6) para que el .zip sea reproducible de verdad cuando el
// contenido de origen no cambia.

import JSZip from "jszip";
import { Buffer } from "node:buffer";

const CP04_ZIP_FIXED_DATE = new Date(0);

/**
 * @param {{path:string, content:Buffer}[]} files - rutas relativas dentro del zip + contenido real.
 * @returns {Promise<Buffer>}
 */
export async function cp04BuildReproducibleZip(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new TypeError("cp04BuildReproducibleZip requiere al menos 1 archivo");
  }
  const zip = new JSZip();
  // Orden estable (por ruta) — el orden de inserción también afecta a
  // los bytes finales del ZIP; sin esto, el mismo conjunto de archivos
  // en distinto orden produciría un .zip distinto.
  const sorted = [...files].sort((a, b) => a.path.localeCompare(b.path));
  for (const file of sorted) {
    zip.file(file.path, file.content, { date: CP04_ZIP_FIXED_DATE });
  }
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  return Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
}

/** Lee de vuelta un .zip ya generado y devuelve la lista de rutas internas (para validación). */
export async function cp04ListZipEntries(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  return Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort();
}
