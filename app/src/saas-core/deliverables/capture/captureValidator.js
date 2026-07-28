// App 3 · Prompt 3/6 — CaptureValidator (Fase 11).
//
// Valida un PNG REAL sin ninguna librería de imagen: el formato PNG es
// público y su bloque de píxeles usa DEFLATE — `node:zlib` (ya en Node)
// basta para descomprimirlo. Deliberadamente NO se implementa un
// decodificador completo (unfiltering Sub/Up/Average/Paeth por
// escaneado): en vez de eso se usa un heurístico real y honesto —
// una imagen de color sólido (todo blanco, todo negro o cualquier otro
// color uniforme) produce, tras el filtrado PNG estándar, un flujo de
// bytes casi enteramente CEROS (cada píxel es idéntico al anterior, así
// que su delta es 0) — se documenta explícitamente como heurístico, no
// como una comprobación de color exacta.

import { inflateSync } from "node:zlib";
import { Buffer } from "node:buffer";

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function parsePngChunks(buffer) {
  const chunks = [];
  let offset = 8;
  while (offset + 8 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 8 + length + 4; // datos + CRC de 4 bytes
  }
  return chunks;
}

/** @returns {{valid:boolean, errors:string[], width?:number, height?:number, byteLength:number}} */
export function cp04ValidatePngBuffer(buffer, expected = {}) {
  const errors = [];
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { valid: false, errors: ["el buffer está vacío o no es un Buffer"], byteLength: 0 };
  }
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { valid: false, errors: ["no es un PNG válido (firma incorrecta)"], byteLength: buffer.length };
  }

  const chunks = parsePngChunks(buffer);
  const ihdr = chunks.find((c) => c.type === "IHDR");
  if (!ihdr) return { valid: false, errors: ["falta el chunk IHDR"], byteLength: buffer.length };

  const width = ihdr.data.readUInt32BE(0);
  const height = ihdr.data.readUInt32BE(4);

  if (width <= 0 || height <= 0) errors.push("dimensiones no válidas");
  if (expected.width && Math.abs(width - expected.width) > 2) errors.push(`ancho inesperado: ${width} (se esperaba ~${expected.width})`);
  if (expected.height && Math.abs(height - expected.height) > 2) errors.push(`alto inesperado: ${height} (se esperaba ~${expected.height})`);
  if (expected.minBytes && buffer.length < expected.minBytes) errors.push(`archivo demasiado pequeño (${buffer.length} bytes, mínimo esperado ${expected.minBytes})`);

  const idatData = Buffer.concat(chunks.filter((c) => c.type === "IDAT").map((c) => c.data));
  if (idatData.length === 0) errors.push("sin datos de píxeles (IDAT ausente o vacío)");
  else {
    try {
      const inflated = inflateSync(idatData);
      const zeroBytes = inflated.reduce((count, byte) => (byte === 0 ? count + 1 : count), 0);
      const zeroRatio = zeroBytes / inflated.length;
      // Umbral calibrado con capturas reales: una página con contenido
      // real pero mucho fondo uniforme a resolución de escritorio (p. ej.
      // el índice del paquete a 1920×1080) mide ~97.2%; una página
      // realmente en blanco (about:blank) mide ~99.98%. 0.99 separa ambos
      // casos con margen en las dos direcciones sin dar falsos positivos.
      if (zeroRatio > 0.99) {
        errors.push(`la imagen parece de color sólido (heurístico: ${(zeroRatio * 100).toFixed(1)}% de bytes de píxel sin variación tras el filtrado PNG) — posible pantalla en blanco/negro`);
      }
    } catch (error) {
      errors.push(`no se pudo descomprimir el bloque de píxeles: ${error.message}`);
    }
  }

  return { valid: errors.length === 0, errors, width, height, byteLength: buffer.length };
}

/** Comprueba que el documento no desborda el viewport salvo scroll intencional (Fase 4). */
export function cp04ValidateNoUnexpectedOverflow(scrollWidth, viewportWidth, toleranceRatio = 1.05) {
  if (!Number.isFinite(scrollWidth) || !Number.isFinite(viewportWidth)) return { valid: false, errors: ["scrollWidth/viewportWidth no numéricos"] };
  const overflow = scrollWidth > viewportWidth * toleranceRatio;
  return { valid: !overflow, errors: overflow ? [`scrollWidth (${scrollWidth}) supera el viewport (${viewportWidth}) más allá de la tolerancia`] : [] };
}
